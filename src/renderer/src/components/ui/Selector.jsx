import PropTypes from 'prop-types'
import { unirClases } from '../../utils/clases'
import { CLASE_CONTROL, claseBordeControl } from './estilos'

// Lista desplegable. Las opciones van como hijos (<option>). Acepta todas las props de <select>.
const Selector = ({ invalido = false, className, children, ...resto }) => (
  <select
    className={unirClases(
      CLASE_CONTROL,
      claseBordeControl(invalido || resto['aria-invalid'] === true),
      className
    )}
    {...resto}
  >
    {children}
  </select>
)

Selector.propTypes = {
  invalido: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node
}

export default Selector
