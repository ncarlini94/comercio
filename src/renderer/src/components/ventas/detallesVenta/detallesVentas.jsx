import PropTypes from 'prop-types'
import { Boton, Insignia, Modal } from '../../ui'
import { formatearFecha, formatearMoneda, formatearNumero } from '../../../utils/formato'
import { etiquetaMetodo, varianteMetodo } from '../metodosPago'

const Dato = ({ etiqueta, children }) => (
  <div>
    <dt className="text-xs font-medium text-texto-secundario">{etiqueta}</dt>
    <dd className="mt-1 text-sm text-texto">{children}</dd>
  </div>
)

Dato.propTypes = { etiqueta: PropTypes.node.isRequired, children: PropTypes.node }

const DetallesVentas = ({ ventaSeleccionada, setVentaSeleccionada }) => {
  const cerrar = () => setVentaSeleccionada(null)
  return (
    <Modal
      titulo={`Detalle de la venta #${ventaSeleccionada.id}`}
      descripcion={`Vendedor: ${ventaSeleccionada.vendedor}`}
      tamano="lg"
      alCerrar={cerrar}
      pie={<Boton onClick={cerrar}>Cerrar</Boton>}
    >
      <dl className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Dato etiqueta="Fecha">{formatearFecha(ventaSeleccionada.created_at)}</Dato>
        <Dato etiqueta="Método de pago">
          <Insignia variante={varianteMetodo(ventaSeleccionada.metodo)}>
            {etiquetaMetodo(ventaSeleccionada.metodo)}
          </Insignia>
        </Dato>
        <Dato etiqueta="Total">
          <span className="text-xl font-semibold tabular-nums">
            {formatearMoneda(ventaSeleccionada.total)}
          </span>
        </Dato>
      </dl>

      <h3 className="mb-3 text-sm font-semibold text-texto">Productos vendidos</h3>
      <ul className="divide-y divide-borde rounded-lg border border-borde">
        {ventaSeleccionada.Productos_vendidos?.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 p-3">
            <div className="min-w-0">
              <p className="truncate font-medium text-texto">{item.producto}</p>
              <p className="text-sm text-texto-secundario">
                Cantidad: {formatearNumero(item.cantidad)}
              </p>
            </div>
            <div className="text-right tabular-nums">
              <p className="font-semibold text-texto">
                {formatearMoneda(item.precio_unitario * item.cantidad)}
              </p>
              <p className="text-sm text-texto-secundario">
                {formatearMoneda(item.precio_unitario)} c/u
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Modal>
  )
}

DetallesVentas.propTypes = {
  ventaSeleccionada: PropTypes.object.isRequired,
  setVentaSeleccionada: PropTypes.func.isRequired
}

export default DetallesVentas
