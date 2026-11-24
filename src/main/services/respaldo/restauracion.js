import fs from 'node:fs'
import path from 'node:path'
import { app } from 'electron'
import { Sequelize } from '@sequelize/core'
import { SqliteDialect } from '@sequelize/sqlite3'
import sequelize, { dbPath } from '../../db.js'
import {
  bloquearCopias,
  carpetaRespaldoConfigurada,
  copiarBaseA,
  desbloquearCopias,
  marcaDeTiempo
} from './respaldo.js'

// La restauración tiene dos pasos: analizar (valida la copia y muestra qué contiene) y restaurar
// (solo la copia ya analizada). Se restaura la copia temporal validada, no el archivo original,
// así lo que se restaura es exactamente lo que se revisó.
const VIGENCIA_ANALISIS_MS = 10 * 60 * 1000
const CONTEOS = {
  usuarios: 'Usuarios',
  productos: 'Inventario',
  proveedores: 'Proveedores',
  ventas: 'Ventas',
  pedidos: 'Pedidos'
}

let pendiente = null
let restaurando = false

const borrarSiExiste = (archivo) => {
  try {
    if (archivo && fs.existsSync(archivo)) fs.unlinkSync(archivo)
  } catch (error) {
    console.warn('No se pudo borrar', archivo, error.message)
  }
}

// En Windows, el antivirus o el indexador pueden bloquear el archivo un instante.
const renombrarConReintentos = async (origen, destino, intentos = 10) => {
  for (let i = 1; ; i++) {
    try {
      fs.renameSync(origen, destino)
      return
    } catch (error) {
      if (i >= intentos || !['EPERM', 'EBUSY', 'EACCES'].includes(error.code)) throw error
      await new Promise((resolver) => setTimeout(resolver, 300))
    }
  }
}

const descartarPendiente = () => {
  if (pendiente) borrarSiExiste(pendiente.temporal)
  pendiente = null
}

const abrir = (archivo) =>
  new Sequelize({ dialect: SqliteDialect, storage: archivo, logging: false })

// Tablas y columnas de una base, sin las tablas internas de SQLite.
const leerEsquema = async (conexion) => {
  const [tablas] = await conexion.query(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'"
  )
  const esquema = {}
  for (const { name } of tablas) {
    const [columnas] = await conexion.query(`PRAGMA table_info("${name.replace(/"/g, '""')}")`)
    esquema[name] = columnas.map((c) => c.name)
  }
  return esquema
}

const validarCompatibilidad = (esquemaActual, esquemaCopia) => {
  const problemas = []
  for (const [tabla, columnas] of Object.entries(esquemaActual)) {
    if (!esquemaCopia[tabla]) {
      problemas.push(`falta la tabla ${tabla}`)
      continue
    }
    const faltantes = columnas.filter((c) => !esquemaCopia[tabla].includes(c))
    if (faltantes.length > 0) problemas.push(`${tabla} no tiene ${faltantes.join(', ')}`)
  }
  return problemas
}

export const analizarRespaldo = async (archivo) => {
  if (restaurando) return { success: false, message: 'Ya hay una restauración en curso' }
  descartarPendiente()

  if (!fs.existsSync(archivo) || !fs.statSync(archivo).isFile()) {
    return { success: false, message: 'El archivo no existe' }
  }
  if (path.resolve(archivo).toLowerCase() === path.resolve(dbPath).toLowerCase()) {
    return { success: false, message: 'Ese archivo es la base de datos que está en uso' }
  }

  const temporal = path.join(
    app.getPath('temp'),
    `comercio-restaurar-${marcaDeTiempo(new Date())}-${process.pid}.db`
  )
  let conexion = null
  try {
    fs.copyFileSync(archivo, temporal)
    conexion = abrir(temporal)

    const [[{ quick_check: integridad } = {}]] = await conexion.query('PRAGMA quick_check')
    if (integridad !== 'ok') throw new Error('El archivo está dañado')

    const problemas = validarCompatibilidad(
      await leerEsquema(sequelize),
      await leerEsquema(conexion)
    )
    if (problemas.length > 0) {
      throw new Error(`La copia no es compatible con esta versión: ${problemas.join('; ')}`)
    }

    const conteos = {}
    for (const [clave, tabla] of Object.entries(CONTEOS)) {
      const [[{ total }]] = await conexion.query(`SELECT COUNT(*) AS total FROM "${tabla}"`)
      conteos[clave] = Number(total)
    }
    await conexion.close()
    conexion = null

    const stat = fs.statSync(archivo)
    const info = {
      archivo,
      tamanio: stat.size,
      fechaArchivo: stat.mtime.toISOString(),
      conteos
    }
    pendiente = { temporal, info, vence: Date.now() + VIGENCIA_ANALISIS_MS }
    return { success: true, info }
  } catch (error) {
    if (conexion) await conexion.close().catch(() => {})
    borrarSiExiste(temporal)
    const mensaje = /not a database|file is (encrypted|not)/i.test(error.message)
      ? 'El archivo no es una copia de seguridad válida'
      : error.message
    console.error('Error al analizar la copia:', error)
    return { success: false, message: mensaje }
  }
}

export const cancelarRestauracion = () => {
  if (!restaurando) descartarPendiente()
  return { success: true }
}

// Carpeta para la copia de seguridad previa: la configurada si está disponible; si no, una
// carpeta dentro de los datos de la app.
const carpetaCopiaPrevia = () => {
  const configurada = carpetaRespaldoConfigurada()
  if (configurada && fs.existsSync(configurada) && fs.statSync(configurada).isDirectory()) {
    return configurada
  }
  const interna = path.join(app.getPath('userData'), 'respaldos-previos')
  fs.mkdirSync(interna, { recursive: true })
  return interna
}

export const restaurarRespaldo = async ({ reiniciar = true } = {}) => {
  if (restaurando) return { success: false, message: 'Ya hay una restauración en curso' }
  if (!pendiente) {
    return { success: false, requiereElegir: true, message: 'Primero elija la copia a restaurar' }
  }
  if (Date.now() > pendiente.vence) {
    descartarPendiente()
    return {
      success: false,
      requiereElegir: true,
      message: 'Vuelva a elegir la copia: pasaron más de 10 minutos desde que se revisó'
    }
  }
  if (!fs.existsSync(pendiente.temporal)) {
    pendiente = null
    return { success: false, requiereElegir: true, message: 'Vuelva a elegir la copia' }
  }

  restaurando = true
  await bloquearCopias()

  // 1. Copia de los datos actuales. Si falla, no se toca nada.
  let copiaPrevia
  try {
    copiaPrevia = path.join(
      carpetaCopiaPrevia(),
      `comercio-antes-de-restaurar-${marcaDeTiempo(new Date())}.db`
    )
    await copiarBaseA(copiaPrevia)
  } catch (error) {
    console.error('Error al crear la copia previa a la restauración:', error)
    restaurando = false
    desbloquearCopias()
    return {
      success: false,
      message: `No se pudo guardar una copia de los datos actuales, no se restauró nada: ${error.message}`
    }
  }

  // 2. Reemplazo del archivo. Desde acá la conexión queda cerrada y la app se reinicia siempre.
  let resultado
  try {
    await sequelize.close()
    const reemplazo = `${dbPath}.restaurando`
    fs.copyFileSync(pendiente.temporal, reemplazo)
    for (const sufijo of ['-journal', '-wal', '-shm']) borrarSiExiste(`${dbPath}${sufijo}`)
    await renombrarConReintentos(reemplazo, dbPath)
    console.log(`Base restaurada desde ${pendiente.info.archivo}. Copia previa: ${copiaPrevia}`)
    resultado = { success: true, copiaPrevia }
  } catch (error) {
    console.error('Error al reemplazar la base de datos:', error)
    borrarSiExiste(`${dbPath}.restaurando`)
    resultado = {
      success: false,
      message: `No se pudo restaurar (${error.message}). Los datos actuales siguen guardados en ${copiaPrevia}`,
      copiaPrevia
    }
  } finally {
    descartarPendiente()
  }

  if (reiniciar) {
    // Se espera un momento para que la pantalla reciba la respuesta antes de reiniciar.
    setTimeout(() => {
      app.relaunch()
      app.exit(0)
    }, 2000)
  }
  return { ...resultado, reinicia: reiniciar }
}
