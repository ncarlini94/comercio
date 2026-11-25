// Métodos de pago: el valor es el que se guarda en la base; la etiqueta y el color, los que se muestran.
export const METODOS_PAGO = ['Efectivo', 'Mercado Pago', 'Debito', 'Credito']

const ETIQUETAS = { Debito: 'Débito', Credito: 'Crédito' }

// Variante de Insignia para cada método. Se usa igual en todas las pantallas.
const VARIANTES = {
  Efectivo: 'exito',
  'Mercado Pago': 'info',
  Debito: 'advertencia',
  Credito: 'neutral'
}

export const etiquetaMetodo = (metodo) => ETIQUETAS[metodo] ?? metodo ?? '—'

export const varianteMetodo = (metodo) => VARIANTES[metodo] ?? 'neutral'
