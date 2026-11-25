import PropTypes from 'prop-types'
import { unirClases } from '../../utils/clases'
import { CLASE_CONTROL, claseBordeControl } from './estilos'

// Campo de texto. Acepta todas las props de <input> (type, value, onChange, required, name...).
// Marca el borde en rojo con `invalido` o con aria-invalid (lo pone CampoConEtiqueta si hay error).
const Campo = ({ invalido = false, className, type = 'text', ...resto }) => (
  <input
    type={type}
    className={unirClases(
      CLASE_CONTROL,
      claseBordeControl(invalido || resto['aria-invalid'] === true),
      className
    )}
    {...resto}
  />
)

Campo.propTypes = {
  invalido: PropTypes.bool,
  type: PropTypes.string,
  className: PropTypes.string
}

export default Campo
