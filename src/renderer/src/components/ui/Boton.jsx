import PropTypes from 'prop-types'
import { unirClases } from '../../utils/clases'
import { CLASE_FOCO } from './estilos'

// Convención: un solo botón "primario" por vista (la acción principal).
const VARIANTES = {
  primario: 'border-transparent bg-primario text-sobre-primario hover:bg-primario-hover',
  secundario: 'border-borde-fuerte bg-superficie text-texto hover:bg-superficie-alt',
  peligro: 'border-peligro/50 bg-transparent text-peligro-texto hover:bg-peligro-suave',
  fantasma:
    'border-transparent bg-transparent text-texto-secundario hover:bg-superficie-alt hover:text-texto'
}

const TAMANOS = {
  sm: 'gap-1.5 px-2.5 py-1.5 text-sm',
  md: 'gap-2 px-4 py-2 text-sm',
  lg: 'gap-2 px-5 py-2.5 text-base'
}

const TAMANOS_ICONO = { sm: 'h-4 w-4', md: 'h-4 w-4', lg: 'h-5 w-5' }

const Boton = ({
  variante = 'secundario',
  tamano = 'md',
  icono: Icono,
  anchoCompleto = false,
  type = 'button',
  className,
  children,
  ...resto
}) => (
  <button
    type={type}
    className={unirClases(
      'inline-flex items-center justify-center rounded-lg border font-medium transition-colors',
      'disabled:cursor-not-allowed disabled:opacity-50',
      CLASE_FOCO,
      VARIANTES[variante],
      TAMANOS[tamano],
      anchoCompleto && 'w-full',
      className
    )}
    {...resto}
  >
    {Icono && (
      <Icono className={unirClases('shrink-0', TAMANOS_ICONO[tamano])} aria-hidden="true" />
    )}
    {children}
  </button>
)

Boton.propTypes = {
  variante: PropTypes.oneOf(['primario', 'secundario', 'peligro', 'fantasma']),
  tamano: PropTypes.oneOf(['sm', 'md', 'lg']),
  icono: PropTypes.elementType,
  anchoCompleto: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
  children: PropTypes.node
}

export default Boton
