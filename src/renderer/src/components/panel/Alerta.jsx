import PropTypes from 'prop-types'
import { AlertTriangle } from 'lucide-react'

// Recuadro de advertencia en rojo para las pantallas de Configuración (errores y avisos de riesgo).
// No hay un componente general equivalente en ui/, por eso se compone acá con colores semánticos.
const Alerta = ({ icono: Icono = AlertTriangle, children }) => (
  <div className="flex gap-2 rounded-lg border border-peligro/30 bg-peligro-suave p-3 text-sm text-peligro-texto">
    <Icono className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
    <div className="min-w-0 break-words">{children}</div>
  </div>
)

Alerta.propTypes = {
  icono: PropTypes.elementType,
  children: PropTypes.node
}

export default Alerta
