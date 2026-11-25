import PropTypes from 'prop-types'
import { unirClases } from '../../utils/clases'
import { CLASE_FOCO } from './estilos'

const VARIANTES = {
  neutral: 'text-texto-secundario hover:bg-superficie-alt hover:text-texto',
  primario: 'text-primario-texto hover:bg-primario-suave',
  peligro: 'text-peligro-texto hover:bg-peligro-suave'
}

const TAMANOS = { sm: 'p-1.5', md: 'p-2' }

// Botón solo con ícono (acciones de fila: ver, editar, anular, borrar).
// La etiqueta es obligatoria: se usa como nombre accesible y como texto al pasar el mouse.
const BotonIcono = ({
  icono: Icono,
  etiqueta,
  variante = 'neutral',
  tamano = 'md',
  type = 'button',
  className,
  ...resto
}) => (
  <button
    type={type}
    aria-label={etiqueta}
    title={etiqueta}
    className={unirClases(
      'inline-flex items-center justify-center rounded-lg transition-colors',
      'disabled:cursor-not-allowed disabled:opacity-50',
      CLASE_FOCO,
      VARIANTES[variante],
      TAMANOS[tamano],
      className
    )}
    {...resto}
  >
    <Icono className={tamano === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} aria-hidden="true" />
  </button>
)

BotonIcono.propTypes = {
  icono: PropTypes.elementType.isRequired,
  etiqueta: PropTypes.string.isRequired,
  variante: PropTypes.oneOf(['neutral', 'primario', 'peligro']),
  tamano: PropTypes.oneOf(['sm', 'md']),
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string
}

export default BotonIcono
