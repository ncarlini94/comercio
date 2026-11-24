import fs from 'node:fs'
import path from 'node:path'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { app } from 'electron'
import { carpetaTemporal, crearProveedor, prepararBase } from '../helpers/base.js'
import { contarFilas, esperarHasta } from '../helpers/sqlite.js'
import {
  bloquearCopias,
  crearRespaldo,
  guardarCarpetaRespaldo,
  guardarConfigRespaldo,
  iniciarProgramadorRespaldo,
  obtenerEstadoRespaldo
} from '../../src/main/services/respaldo/respaldo.js'

const rutaConfig = path.join(app.getPath('userData'), 'respaldo.json')
const carpetas = []
const nuevaCarpeta = () => {
  const carpeta = carpetaTemporal('comercio-copias-')
  carpetas.push(carpeta)
  return carpeta
}
const archivosDe = (carpeta) => fs.readdirSync(carpeta).filter((a) => a.endsWith('.db'))

beforeAll(async () => {
  await prepararBase()
  await crearProveedor({ nombre: 'Proveedor respaldado' })
})

beforeEach(() => {
  fs.rmSync(rutaConfig, { force: true })
})

afterAll(async () => {
  // Detiene el programador que inició el último test.
  await bloquearCopias()
  for (const carpeta of carpetas) fs.rmSync(carpeta, { recursive: true, force: true })
})

describe('crearRespaldo', () => {
  it('sin carpeta configurada falla con un mensaje y registra el error', async () => {
    const resultado = await crearRespaldo('manual')
    expect(resultado.success).toBe(false)
    expect(resultado.message).toBe('No hay una carpeta configurada para las copias')
    expect(obtenerEstadoRespaldo().ultimoError).toMatchObject({
      mensaje: 'No hay una carpeta configurada para las copias',
      origen: 'manual'
    })
  })

  it('con carpeta crea un archivo SQLite válido con los datos', async () => {
    const carpeta = nuevaCarpeta()
    guardarCarpetaRespaldo(carpeta)
    const resultado = await crearRespaldo('manual')

    expect(resultado.success).toBe(true)
    expect(path.dirname(resultado.archivo)).toBe(carpeta)
    expect(path.basename(resultado.archivo)).toMatch(
      /^comercio-respaldo-\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.db$/
    )
    expect(archivosDe(carpeta)).toEqual([path.basename(resultado.archivo)])
    expect(await contarFilas(resultado.archivo, 'Proveedores')).toBe(1)

    const estado = obtenerEstadoRespaldo()
    expect(estado.ultimoArchivo).toBe(resultado.archivo)
    expect(estado.ultimaCopia).not.toBeNull()
    expect(estado.ultimoError).toBeNull()
  })

  it('dos pedidos simultáneos generan un solo archivo', async () => {
    const carpeta = nuevaCarpeta()
    guardarCarpetaRespaldo(carpeta)
    const primera = crearRespaldo('manual')
    const segunda = crearRespaldo('programada')
    expect(segunda).toBe(primera)
    const [a, b] = await Promise.all([primera, segunda])
    expect(a.success).toBe(true)
    expect(b.archivo).toBe(a.archivo)
    expect(archivosDe(carpeta)).toHaveLength(1)
  })

  it('si la carpeta no existe registra el error con su origen', async () => {
    const inexistente = path.join(nuevaCarpeta(), 'no-existe')
    guardarCarpetaRespaldo(inexistente)
    const resultado = await crearRespaldo('programada')
    expect(resultado.success).toBe(false)
    expect(resultado.message).toMatch(/no existe o no está disponible/)
    const { ultimoError } = obtenerEstadoRespaldo()
    expect(ultimoError.origen).toBe('programada')
    expect(ultimoError.mensaje).toMatch(/no existe/)
    expect(Number.isNaN(Date.parse(ultimoError.fecha))).toBe(false)
  })
})

describe('guardarConfigRespaldo', () => {
  it.each([
    [{ hora: '25:00' }, 'Hora inválida'],
    [{ hora: '7:00' }, 'Hora inválida'],
    [{ hora: '10:60' }, 'Hora inválida'],
    [{ frecuencia: 'mensual' }, 'Frecuencia inválida'],
    [{ diaSemana: 7 }, 'Día de la semana inválido'],
    [{ diaSemana: 1.5 }, 'Día de la semana inválido']
  ])('rechaza %o', (datos, mensaje) => {
    expect(guardarConfigRespaldo(datos)).toEqual({ success: false, message: mensaje })
    expect(fs.existsSync(rutaConfig)).toBe(false)
  })

  it('no permite activar sin carpeta', () => {
    expect(guardarConfigRespaldo({ activada: true })).toEqual({
      success: false,
      message: 'Primero elija la carpeta donde guardar las copias'
    })
    expect(obtenerEstadoRespaldo().activada).toBe(false)
  })

  it('con carpeta guarda la programación y calcula la próxima copia', () => {
    guardarCarpetaRespaldo(nuevaCarpeta())
    const resultado = guardarConfigRespaldo({
      activada: true,
      frecuencia: 'semanal',
      diaSemana: 3,
      hora: '21:30'
    })
    expect(resultado.success).toBe(true)
    expect(resultado.estado).toMatchObject({
      activada: true,
      frecuencia: 'semanal',
      diaSemana: 3,
      hora: '21:30'
    })
    const proxima = new Date(resultado.estado.proximaCopia)
    expect(proxima.getDay()).toBe(3)
    expect([proxima.getHours(), proxima.getMinutes()]).toEqual([21, 30])
    expect(resultado.estado.programadaDesde).not.toBeNull()
  })
})

describe('iniciarProgramadorRespaldo', () => {
  it('al iniciar hace la copia pendiente de cuando la app estaba cerrada', async () => {
    const carpeta = nuevaCarpeta()
    guardarCarpetaRespaldo(carpeta)

    // La programación se guardó hace dos días; desde entonces la app estuvo cerrada.
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000))
    expect(
      guardarConfigRespaldo({ activada: true, frecuencia: 'diaria', hora: '00:00' }).success
    ).toBe(true)
    vi.useRealTimers()
    expect(archivosDe(carpeta)).toHaveLength(0)

    iniciarProgramadorRespaldo()
    expect(await esperarHasta(() => obtenerEstadoRespaldo().ultimaCopia !== null)).toBe(true)

    const estado = obtenerEstadoRespaldo()
    expect(archivosDe(carpeta)).toEqual([path.basename(estado.ultimoArchivo)])
    expect(estado.ultimoError).toBeNull()
    expect(await contarFilas(estado.ultimoArchivo, 'Proveedores')).toBe(1)
  })
})
