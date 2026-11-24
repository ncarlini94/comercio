import { describe, expect, it } from 'vitest'
import {
  correspondeCopia,
  ESPERA_TRAS_ERROR_MS,
  proximoHorarioProgramado,
  ultimoHorarioProgramado
} from '../../src/main/services/respaldo/programacion.js'

// Fechas locales fijas. El 24/11/2026 es martes (getDay() === 2).
const fecha = (texto) => new Date(texto)
const iso = (texto) => new Date(texto).toISOString()

const DIARIA = { activada: true, carpeta: 'C:/copias', frecuencia: 'diaria', hora: '20:00' }
const SEMANAL_MARTES = { ...DIARIA, frecuencia: 'semanal', diaSemana: 2 }

describe('horarios de la copia diaria', () => {
  it('antes de la hora, el último horario es el de ayer y el próximo el de hoy', () => {
    const ahora = fecha('2026-11-24T19:00')
    expect(ultimoHorarioProgramado(DIARIA, ahora)).toEqual(fecha('2026-11-23T20:00'))
    expect(proximoHorarioProgramado(DIARIA, ahora)).toEqual(fecha('2026-11-24T20:00'))
  })

  it('después de la hora, el último horario es el de hoy y el próximo el de mañana', () => {
    const ahora = fecha('2026-11-24T21:00')
    expect(ultimoHorarioProgramado(DIARIA, ahora)).toEqual(fecha('2026-11-24T20:00'))
    expect(proximoHorarioProgramado(DIARIA, ahora)).toEqual(fecha('2026-11-25T20:00'))
  })

  it('justo a la hora, el horario de hoy ya cuenta como pasado', () => {
    const ahora = fecha('2026-11-24T20:00')
    expect(ultimoHorarioProgramado(DIARIA, ahora)).toEqual(fecha('2026-11-24T20:00'))
    expect(proximoHorarioProgramado(DIARIA, ahora)).toEqual(fecha('2026-11-25T20:00'))
  })
})

describe('horarios de la copia semanal', () => {
  it('el mismo día de la semana antes de la hora usa la semana anterior y hoy', () => {
    const ahora = fecha('2026-11-24T19:00')
    expect(ultimoHorarioProgramado(SEMANAL_MARTES, ahora)).toEqual(fecha('2026-11-17T20:00'))
    expect(proximoHorarioProgramado(SEMANAL_MARTES, ahora)).toEqual(fecha('2026-11-24T20:00'))
  })

  it('el mismo día de la semana después de la hora usa hoy y la semana siguiente', () => {
    const ahora = fecha('2026-11-24T21:00')
    expect(ultimoHorarioProgramado(SEMANAL_MARTES, ahora)).toEqual(fecha('2026-11-24T20:00'))
    expect(proximoHorarioProgramado(SEMANAL_MARTES, ahora)).toEqual(fecha('2026-12-01T20:00'))
  })

  it('otro día de la semana busca el viernes anterior y el siguiente', () => {
    const viernes = { ...SEMANAL_MARTES, diaSemana: 5 }
    const ahora = fecha('2026-11-24T12:00')
    expect(ultimoHorarioProgramado(viernes, ahora)).toEqual(fecha('2026-11-20T20:00'))
    expect(proximoHorarioProgramado(viernes, ahora)).toEqual(fecha('2026-11-27T20:00'))
  })
})

describe('correspondeCopia', () => {
  const programadaHaceDias = { programadaDesde: iso('2026-11-20T10:00') }

  it('corresponde a la hora programada', () => {
    const estado = { ...programadaHaceDias, ultimaCopia: iso('2026-11-23T20:00') }
    expect(correspondeCopia(DIARIA, estado, fecha('2026-11-24T20:00'))).toBe(true)
  })

  it('no corresponde antes de la hora', () => {
    const estado = { ...programadaHaceDias, ultimaCopia: iso('2026-11-23T20:00') }
    expect(correspondeCopia(DIARIA, estado, fecha('2026-11-24T19:59'))).toBe(false)
  })

  it('no se repite el mismo día después de hacer la copia', () => {
    const estado = { ...programadaHaceDias, ultimaCopia: iso('2026-11-24T20:00:05') }
    expect(correspondeCopia(DIARIA, estado, fecha('2026-11-24T20:01'))).toBe(false)
    expect(correspondeCopia(DIARIA, estado, fecha('2026-11-24T23:59'))).toBe(false)
  })

  it('recupera una sola copia al abrir la app después de varios días cerrada', () => {
    const estado = { ...programadaHaceDias, ultimaCopia: iso('2026-11-20T20:00') }
    expect(correspondeCopia(DIARIA, estado, fecha('2026-11-24T09:00'))).toBe(true)

    // Hecha la copia de recuperación, no se hace otra por los demás días perdidos.
    const despues = { ...estado, ultimaCopia: iso('2026-11-24T09:00') }
    expect(correspondeCopia(DIARIA, despues, fecha('2026-11-24T09:01'))).toBe(false)
    expect(correspondeCopia(DIARIA, despues, fecha('2026-11-24T19:59'))).toBe(false)
    // La del día vuelve a corresponder a su hora.
    expect(correspondeCopia(DIARIA, despues, fecha('2026-11-24T20:00'))).toBe(true)
  })

  it('activada después de la hora espera al próximo horario', () => {
    const estado = { programadaDesde: iso('2026-11-24T21:00'), ultimaCopia: null }
    expect(correspondeCopia(DIARIA, estado, fecha('2026-11-24T22:00'))).toBe(false)
    expect(correspondeCopia(DIARIA, estado, fecha('2026-11-25T19:59'))).toBe(false)
    expect(correspondeCopia(DIARIA, estado, fecha('2026-11-25T20:00'))).toBe(true)
  })

  it('desactivada nunca corresponde', () => {
    const config = { ...DIARIA, activada: false }
    expect(correspondeCopia(config, programadaHaceDias, fecha('2026-11-24T20:00'))).toBe(false)
  })

  it('sin carpeta nunca corresponde', () => {
    const config = { ...DIARIA, carpeta: '' }
    expect(correspondeCopia(config, programadaHaceDias, fecha('2026-11-24T20:00'))).toBe(false)
  })

  it('después de un error espera 15 minutos y luego reintenta', () => {
    expect(ESPERA_TRAS_ERROR_MS).toBe(15 * 60 * 1000)
    const estado = {
      ...programadaHaceDias,
      ultimaCopia: iso('2026-11-23T20:00'),
      ultimoError: { fecha: iso('2026-11-24T20:00') }
    }
    expect(correspondeCopia(DIARIA, estado, fecha('2026-11-24T20:00'))).toBe(false)
    expect(correspondeCopia(DIARIA, estado, fecha('2026-11-24T20:14'))).toBe(false)
    expect(correspondeCopia(DIARIA, estado, fecha('2026-11-24T20:15'))).toBe(true)
  })
})
