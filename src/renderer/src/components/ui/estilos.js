// Clases compartidas por los componentes de ui. Usan solo colores semánticos (ver index.css).

export const CLASE_FOCO =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primario/50 focus-visible:ring-offset-1 focus-visible:ring-offset-fondo'

// Base de campos de texto, selectores y áreas de texto.
export const CLASE_CONTROL =
  'w-full rounded-lg border bg-campo px-3 py-2 text-sm text-texto placeholder:text-texto-tenue transition-colors focus:outline-none focus:ring-2 focus:ring-primario/40 focus:border-primario disabled:cursor-not-allowed disabled:opacity-60'

export const claseBordeControl = (invalido) => (invalido ? 'border-peligro' : 'border-borde-fuerte')
