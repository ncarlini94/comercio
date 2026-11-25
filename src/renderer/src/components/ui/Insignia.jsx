import PropTypes from 'prop-types'
import { unirClases } from '../../utils/clases'

const VARIANTES = {
  neutral: 'bg-superficie-alt text-texto-secundario',
  primario: 'bg-primario-suave text-primario-texto',
  info: 'bg-info-suave text-info-texto',
  exito: 'bg-exito-suave text-exito-texto',
  advertencia: 'bg-advertencia-suave text-advertencia-texto',
  peligro: 'bg-peligro-suave text-peligro-texto'
}

// Etiqueta corta de color (estado, método de pago, rol...).
const Insignia = ({ variante = 'neutral', icono: Icono, className, children }) => (
  <span
    className={unirClases(
      'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
      VARIANTES[variante],
      className
    )}
  >
    {Icono && <Icono className="h-3.5 w-3.5" aria-hidden="true" />}
    {children}
  </span>
)

Insignia.propTypes = {
  variante: PropTypes.oneOf(['neutral', 'primario', 'info', 'exito', 'advertencia', 'peligro']),
  icono: PropTypes.elementType,
  className: PropTypes.string,
  children: PropTypes.node
}

export default Insignia
