import { describe, expect, it } from 'vitest'
import {
  formatearFecha,
  formatearMoneda,
  formatearNumero
} from '../../src/renderer/src/utils/formato.js'

// Intl separa el signo del monto con un espacio duro (U+00A0).
const ED = ' '

describe('formatearMoneda', () => {
  it('muestra pesos con separador de miles y sin decimales cuando son cero', () => {
    expect(formatearMoneda(7500)).toBe(`$${ED}7.500`)
    expect(formatearMoneda(1234567)).toBe(`$${ED}1.234.567`)
    expect(formatearMoneda(0)).toBe(`$${ED}0`)
  })

  it('muestra dos decimales con coma solo cuando hay centavos', () => {
    expect(formatearMoneda(7500.5)).toBe(`$${ED}7.500,50`)
    expect(formatearMoneda(99.99)).toBe(`$${ED}99,99`)
  })

  it('acepta montos como texto, como los que devuelve la base', () => {
    expect(formatearMoneda('7500.00')).toBe(`$${ED}7.500`)
  })

  it('muestra los montos negativos con signo', () => {
    expect(formatearMoneda(-1500)).toBe(`-$${ED}1.500`)
  })

  it('devuelve una raya para valores que no son números', () => {
    expect(formatearMoneda(null)).toBe('—')
    expect(formatearMoneda('abc')).toBe('—')
  })
})

describe('formatearNumero', () => {
  it('agrupa miles con punto y usa coma decimal', () => {
    expect(formatearNumero(1234567)).toBe('1.234.567')
    expect(formatearNumero(1234.5)).toBe('1.234,5')
    expect(formatearNumero('12')).toBe('12')
  })

  it('devuelve una raya para valores que no son números', () => {
    expect(formatearNumero(undefined)).toBe('—')
  })
})

describe('formatearFecha', () => {
  // Fechas locales fijas.
  const ahora = new Date('2026-11-25T10:00')

  it('muestra "Hoy" con la hora para fechas del mismo día', () => {
    expect(formatearFecha(new Date('2026-11-25T18:42'), ahora)).toBe('Hoy 18:42')
    expect(formatearFecha(new Date('2026-11-25T00:05'), ahora)).toBe('Hoy 00:05')
  })

  it('muestra "Ayer" con la hora para fechas del día anterior', () => {
    expect(formatearFecha(new Date('2026-11-24T19:58'), ahora)).toBe('Ayer 19:58')
  })

  it('muestra fecha y hora completas para el resto', () => {
    expect(formatearFecha(new Date('2026-11-23T18:42'), ahora)).toBe('23/11/2026 18:42')
    expect(formatearFecha(new Date('2026-11-26T08:00'), ahora)).toBe('26/11/2026 08:00')
    expect(formatearFecha(new Date('2025-01-05T09:07'), ahora)).toBe('05/01/2025 09:07')
  })

  it('cruza bien el cambio de mes para "Ayer"', () => {
    const primeroDeDiciembre = new Date('2026-12-01T09:00')
    expect(formatearFecha(new Date('2026-11-30T21:15'), primeroDeDiciembre)).toBe('Ayer 21:15')
  })

  it('acepta texto y números además de Date', () => {
    expect(formatearFecha('2026-11-25T18:42', ahora)).toBe('Hoy 18:42')
    expect(formatearFecha(new Date('2026-11-24T19:58').getTime(), ahora)).toBe('Ayer 19:58')
  })

  it('devuelve texto vacío para fechas inválidas o ausentes', () => {
    expect(formatearFecha('no es fecha', ahora)).toBe('')
    expect(formatearFecha(null, ahora)).toBe('')
  })
})
