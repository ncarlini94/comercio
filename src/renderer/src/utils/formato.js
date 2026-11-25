// Formato de montos, números y fechas para mostrar en pantalla (es-AR, hora local).

const SIN_VALOR = '—'

const aNumero = (valor) => {
  if (valor === null || valor === undefined || valor === '') return NaN
  return Number(valor)
}

const moneda = {
  entera: new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }),
  conCentavos: new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const numero = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 })

/**
 * Monto en pesos: "$ 7.500", "$ 7.500,50", "-$ 1.500".
 * Los decimales se muestran solo cuando hay centavos (siempre dos); si no, el monto va entero.
 * Acepta números o texto numérico ("7500.00"). Si no es un número devuelve "—".
 */
export const formatearMoneda = (valor) => {
  const n = aNumero(valor)
  if (!Number.isFinite(n)) return SIN_VALOR
  const tieneCentavos = Math.round(Math.abs(n) * 100) % 100 !== 0
  return (tieneCentavos ? moneda.conCentavos : moneda.entera).format(n)
}

/** Número con separador de miles y hasta dos decimales: "1.234,5". Si no es un número devuelve "—". */
export const formatearNumero = (valor) => {
  const n = aNumero(valor)
  return Number.isFinite(n) ? numero.format(n) : SIN_VALOR
}

const dosCifras = (n) => String(n).padStart(2, '0')
const hora = (f) => `${dosCifras(f.getHours())}:${dosCifras(f.getMinutes())}`
const mismoDia = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

/**
 * Fecha relativa en hora local: "Hoy 18:42", "Ayer 19:58" o "24/11/2026 18:42".
 * Acepta Date, texto o milisegundos. `ahora` se puede pasar para obtener resultados fijos en los tests.
 * Si la fecha no es válida devuelve "".
 */
export const formatearFecha = (fecha, ahora = new Date()) => {
  if (fecha === null || fecha === undefined || fecha === '') return ''
  const f = fecha instanceof Date ? fecha : new Date(fecha)
  if (Number.isNaN(f.getTime())) return ''

  if (mismoDia(f, ahora)) return `Hoy ${hora(f)}`
  const ayer = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() - 1)
  if (mismoDia(f, ayer)) return `Ayer ${hora(f)}`
  return `${dosCifras(f.getDate())}/${dosCifras(f.getMonth() + 1)}/${f.getFullYear()} ${hora(f)}`
}
