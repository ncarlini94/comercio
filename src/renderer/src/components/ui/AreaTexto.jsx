import PropTypes from 'prop-types'
import { unirClases } from '../../utils/clases'
import { CLASE_CONTROL, claseBordeControl } from './estilos'

// Texto de varias líneas. Acepta todas las props de <textarea> (rows, value, onChange...).
const AreaTexto = ({ invalido = false, rows = 3, className, ...resto }) => (
  <textarea
    rows={rows}
    className={unirClases(
      CLASE_CONTROL,
      claseBordeControl(invalido || resto['aria-invalid'] === true),
      'resize-y',
      className
    )}
    {...resto}
  />
)

AreaTexto.propTypes = {
  invalido: PropTypes.bool,
  rows: PropTypes.number,
  className: PropTypes.string
}

export default AreaTexto
