import PropTypes from 'prop-types'
import { unirClases } from '../../utils/clases'

// Contenedor de una pantalla: apila encabezado, métricas, filtros y contenido en columna y
// ocupa todo el alto disponible. Con una <Tabla desplazable> adentro, solo la tabla se
// desplaza y el resto de la pantalla queda fijo.
const Pagina = ({ className, children }) => (
  <div className={unirClases('flex h-full min-h-0 flex-col gap-6', className)}>{children}</div>
)

Pagina.propTypes = { className: PropTypes.string, children: PropTypes.node }

export default Pagina
