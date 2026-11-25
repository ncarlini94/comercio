import PropTypes from 'prop-types'
import { Insignia } from '../ui'

export const ESTADOS_PEDIDO = ['Pendiente', 'Pedido', 'Aprobado', 'Cancelado']

const VARIANTE_POR_ESTADO = {
  Pendiente: 'advertencia',
  Pedido: 'info',
  Aprobado: 'exito',
  Cancelado: 'neutral'
}

// Estado de un pedido a proveedor con su color.
const InsigniaEstado = ({ estado }) => (
  <Insignia variante={VARIANTE_POR_ESTADO[estado] || 'neutral'}>{estado || 'Sin estado'}</Insignia>
)

InsigniaEstado.propTypes = { estado: PropTypes.string }

export default InsigniaEstado
