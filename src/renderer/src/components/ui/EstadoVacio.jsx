import PropTypes from 'prop-types'
import { Inbox } from 'lucide-react'
import { unirClases } from '../../utils/clases'

// Mensaje para listas sin datos o búsquedas sin resultados, con una acción opcional.
const EstadoVacio = ({ icono: Icono = Inbox, titulo, descripcion, accion, className }) => (
  <div
    className={unirClases(
      'flex flex-col items-center justify-center gap-2 px-6 py-12 text-center',
      className
    )}
  >
    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-superficie-alt text-texto-tenue">
      <Icono className="h-6 w-6" aria-hidden="true" />
    </span>
    <p className="text-base font-medium text-texto">{titulo}</p>
    {descripcion && <p className="max-w-sm text-sm text-texto-secundario">{descripcion}</p>}
    {accion && <div className="mt-2">{accion}</div>}
  </div>
)

EstadoVacio.propTypes = {
  icono: PropTypes.elementType,
  titulo: PropTypes.node.isRequired,
  descripcion: PropTypes.node,
  accion: PropTypes.node,
  className: PropTypes.string
}

export default EstadoVacio
