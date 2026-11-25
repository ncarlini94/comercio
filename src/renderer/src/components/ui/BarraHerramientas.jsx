import PropTypes from 'prop-types'
import { unirClases } from '../../utils/clases'

// Fila con búsqueda y filtros a la izquierda (children) y acciones a la derecha.
const BarraHerramientas = ({ acciones, className, children }) => (
  <div className={unirClases('flex flex-wrap items-center justify-between gap-3', className)}>
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">{children}</div>
    {acciones && <div className="flex flex-wrap items-center gap-2">{acciones}</div>}
  </div>
)

BarraHerramientas.propTypes = {
  acciones: PropTypes.node,
  className: PropTypes.string,
  children: PropTypes.node
}

export default BarraHerramientas
