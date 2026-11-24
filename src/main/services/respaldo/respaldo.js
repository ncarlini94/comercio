import fs from 'node:fs'
import path from 'node:path'
import { app } from 'electron'
import sequelize from '../../db.js'
import { correspondeCopia, proximoHorarioProgramado } from './programacion.js'

const FRECUENCIAS = ['diaria', 'semanal']
const INTERVALO_VERIFICACION_MS = 60 * 1000

const CONFIG_INICIAL = {
  carpeta: '',
  activada: false,
  frecuencia: 'diaria',
  diaSemana: 1,
  hora: '20:00',
  programadaDesde: null,
  ultimaCopia: null,
  ultimoArchivo: null,
  ultimoError: null
}

// La configuración vive junto a la base de datos, en la carpeta de datos de la app.
const rutaConfig = () => path.join(app.getPath('userData'), 'respaldo.json')

const leerConfig = () => {
  try {
    return { ...CONFIG_INICIAL, ...JSON.parse(fs.readFileSync(rutaConfig(), 'utf8')) }
  } catch {
    return { ...CONFIG_INICIAL }
  }
}

// Lee la versión actual antes de escribir, para no pisar cambios hechos mientras corría una copia.
const actualizarConfig = (cambios) => {
  const nueva = { ...leerConfig(), ...cambios }
  const temporal = `${rutaConfig()}.tmp`
  fs.writeFileSync(temporal, JSON.stringify(nueva, null, 2))
  fs.renameSync(temporal, rutaConfig())
  return nueva
}

const dosDigitos = (n) => String(n).padStart(2, '0')
export const marcaDeTiempo = (d) =>
  `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}-${dosDigitos(d.getDate())}_` +
  `${dosDigitos(d.getHours())}-${dosDigitos(d.getMinutes())}-${dosDigitos(d.getSeconds())}`

export const obtenerEstadoRespaldo = () => {
  const config = leerConfig()
  const proxima =
    config.activada && config.carpeta ? proximoHorarioProgramado(config)?.toISOString() : null
  return { ...config, proximaCopia: proxima ?? null }
}

export const guardarConfigRespaldo = (datos) => {
  const actual = leerConfig()
  const hora = String(datos.hora ?? actual.hora)
  const [h, m] = hora.split(':').map(Number)
  if (!/^\d{2}:\d{2}$/.test(hora) || h > 23 || m > 59) {
    return { success: false, message: 'Hora inválida' }
  }
  const frecuencia = datos.frecuencia ?? actual.frecuencia
  if (!FRECUENCIAS.includes(frecuencia)) {
    return { success: false, message: 'Frecuencia inválida' }
  }
  const diaSemana = Number(datos.diaSemana ?? actual.diaSemana)
  if (!Number.isInteger(diaSemana) || diaSemana < 0 || diaSemana > 6) {
    return { success: false, message: 'Día de la semana inválido' }
  }
  const activada = Boolean(datos.activada ?? actual.activada)
  if (activada && !actual.carpeta) {
    return { success: false, message: 'Primero elija la carpeta donde guardar las copias' }
  }

  const cambioProgramacion =
    activada !== actual.activada ||
    hora !== actual.hora ||
    frecuencia !== actual.frecuencia ||
    diaSemana !== actual.diaSemana

  actualizarConfig({
    activada,
    hora,
    frecuencia,
    diaSemana,
    // Al cambiar la programación, cuenta desde ahora: no se dispara una copia por un horario ya pasado.
    ...(cambioProgramacion ? { programadaDesde: new Date().toISOString() } : {})
  })
  return { success: true, estado: obtenerEstadoRespaldo() }
}

export const guardarCarpetaRespaldo = (carpeta) => {
  actualizarConfig({ carpeta, ultimoError: null })
  return { success: true, estado: obtenerEstadoRespaldo() }
}

export const carpetaRespaldoConfigurada = () => leerConfig().carpeta

// VACUUM INTO: SQLite genera un archivo consistente aunque la base esté en uso.
export const copiarBaseA = (destino) =>
  sequelize.query(`VACUUM INTO '${destino.replace(/'/g, "''")}'`)

let copiaEnCurso = null
let intervaloProgramador = null
let bloqueado = false
let programadorIniciado = false

// Durante una restauración no se permiten copias nuevas (la base se va a cerrar).
export const bloquearCopias = async () => {
  bloqueado = true
  if (intervaloProgramador) clearInterval(intervaloProgramador)
  intervaloProgramador = null
  if (copiaEnCurso) await copiaEnCurso
}

// Si la restauración se cancela sin cerrar la base, vuelve a activar el programador.
export const desbloquearCopias = () => {
  bloqueado = false
  if (programadorIniciado && !intervaloProgramador) {
    intervaloProgramador = setInterval(verificarCopiaProgramada, INTERVALO_VERIFICACION_MS)
  }
}

// Si ya hay una copia en curso, devuelve esa misma en lugar de iniciar otra.
export const crearRespaldo = (origen = 'manual') => {
  if (bloqueado) {
    return Promise.resolve({ success: false, message: 'Hay una restauración en curso' })
  }
  if (copiaEnCurso) return copiaEnCurso
  copiaEnCurso = (async () => {
    const { carpeta } = leerConfig()
    const ahora = new Date()
    try {
      if (!carpeta) throw new Error('No hay una carpeta configurada para las copias')
      if (!fs.existsSync(carpeta) || !fs.statSync(carpeta).isDirectory()) {
        throw new Error(`La carpeta "${carpeta}" no existe o no está disponible`)
      }
      const destino = path.join(carpeta, `comercio-respaldo-${marcaDeTiempo(ahora)}.db`)
      await copiarBaseA(destino)
      actualizarConfig({
        ultimaCopia: ahora.toISOString(),
        ultimoArchivo: destino,
        ultimoError: null
      })
      console.log(`Copia de seguridad (${origen}) creada en ${destino}`)
      return { success: true, archivo: destino, estado: obtenerEstadoRespaldo() }
    } catch (error) {
      console.error(`Error en la copia de seguridad (${origen}):`, error)
      actualizarConfig({
        ultimoError: { fecha: ahora.toISOString(), mensaje: error.message, origen }
      })
      return { success: false, message: error.message, estado: obtenerEstadoRespaldo() }
    }
  })().finally(() => {
    copiaEnCurso = null
  })
  return copiaEnCurso
}

const verificarCopiaProgramada = async () => {
  const config = leerConfig()
  if (correspondeCopia(config, config)) await crearRespaldo('programada')
}

// Revisa al abrir la app (recupera copias pendientes) y después cada minuto.
export const iniciarProgramadorRespaldo = () => {
  programadorIniciado = true
  verificarCopiaProgramada()
  intervaloProgramador = setInterval(verificarCopiaProgramada, INTERVALO_VERIFICACION_MS)
}
