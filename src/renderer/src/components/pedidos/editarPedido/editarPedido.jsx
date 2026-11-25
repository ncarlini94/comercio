import PropTypes from 'prop-types'
import { usePermisos } from '../../../sesion'
import {
  Boton,
  CampoConEtiqueta,
  EstadoVacio,
  Modal,
  Selector,
  Tabla,
  TablaCelda,
  TablaCuerpo,
  TablaEncabezado,
  TablaFila
} from '../../ui'
import { formatearFecha, formatearMoneda, formatearNumero } from '../../../utils/formato'
import InsigniaEstado, { ESTADOS_PEDIDO } from '../insigniaEstado'

const Dato = ({ etiqueta, children }) => (
  <div>
    <dt className="text-xs font-medium text-texto-secundario">{etiqueta}</dt>
    <dd className="mt-0.5 text-sm text-texto">{children}</dd>
  </div>
)

Dato.propTypes = { etiqueta: PropTypes.node.isRequired, children: PropTypes.node }

const ayudaEstado = (aprobado, puedeCambiarEstado) => {
  if (aprobado) return 'Un pedido aprobado ya no puede cambiar de estado.'
  if (!puedeCambiarEstado) return 'No tenés permiso para cambiar el estado.'
  return undefined
}

const EditarPedido = ({
  pedidoSeleccionado,
  handleSubmit,
  estado,
  setEstado,
  productosSeleccionado,
  setPedidoSeleccionado
}) => {
  const { puede } = usePermisos()
  const puedeCambiarEstado = puede('pedidos.cambiarEstado')
  const cerrar = () => setPedidoSeleccionado(null)
  const aprobado = pedidoSeleccionado.estado === 'Aprobado'

  return (
    <Modal
      titulo={`Detalle del pedido #${pedidoSeleccionado.id}`}
      descripcion={pedidoSeleccionado.proveedor}
      tamano="xl"
      alCerrar={cerrar}
      alEnviar={handleSubmit}
      pie={
        <>
          <Boton onClick={cerrar}>Cerrar</Boton>
          {puedeCambiarEstado && (
            <Boton variante="primario" type="submit">
              Actualizar
            </Boton>
          )}
        </>
      }
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
        <div className="space-y-5 md:col-span-2">
          <dl className="space-y-3">
            <Dato etiqueta="Proveedor">{pedidoSeleccionado.proveedor}</Dato>
            <Dato etiqueta="Fecha">{formatearFecha(pedidoSeleccionado.created_at)}</Dato>
            <Dato etiqueta="Estado actual">
              <InsigniaEstado estado={pedidoSeleccionado.estado} />
            </Dato>
            <Dato etiqueta="Total">
              <span className="text-xl font-semibold tabular-nums">
                {formatearMoneda(pedidoSeleccionado.total)}
              </span>
            </Dato>
          </dl>
          {estado && (
            <CampoConEtiqueta etiqueta="Estado" ayuda={ayudaEstado(aprobado, puedeCambiarEstado)}>
              <Selector
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                disabled={!puedeCambiarEstado}
              >
                {ESTADOS_PEDIDO.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </Selector>
            </CampoConEtiqueta>
          )}
          {pedidoSeleccionado.nota && (
            <dl>
              <Dato etiqueta="Nota">
                <span className="whitespace-pre-line text-texto-secundario">
                  {pedidoSeleccionado.nota}
                </span>
              </Dato>
            </dl>
          )}
        </div>

        <section className="space-y-3 md:col-span-3">
          <h3 className="text-sm font-semibold text-texto">Productos pedidos</h3>
          {productosSeleccionado.length === 0 ? (
            <EstadoVacio titulo="Sin productos" className="py-8" />
          ) : (
            <Tabla className="max-h-96 overflow-y-auto shadow-none">
              <TablaEncabezado>
                <TablaCelda encabezado>Producto</TablaCelda>
                <TablaCelda encabezado alinear="derecha">
                  Cantidad
                </TablaCelda>
                <TablaCelda encabezado alinear="derecha">
                  Costo c/u
                </TablaCelda>
                <TablaCelda encabezado alinear="derecha">
                  Subtotal
                </TablaCelda>
              </TablaEncabezado>
              <TablaCuerpo>
                {productosSeleccionado.map((item) => (
                  <TablaFila key={item.id}>
                    <TablaCelda className="font-medium">{item.producto}</TablaCelda>
                    <TablaCelda alinear="derecha">{formatearNumero(item.cantidad)}</TablaCelda>
                    <TablaCelda alinear="derecha" className="text-texto-secundario">
                      {formatearMoneda(item.costo)}
                    </TablaCelda>
                    <TablaCelda alinear="derecha" className="font-medium">
                      {formatearMoneda(item.costo * item.cantidad)}
                    </TablaCelda>
                  </TablaFila>
                ))}
              </TablaCuerpo>
            </Tabla>
          )}
        </section>
      </div>
    </Modal>
  )
}

EditarPedido.propTypes = {
  pedidoSeleccionado: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  estado: PropTypes.string,
  setEstado: PropTypes.func.isRequired,
  productosSeleccionado: PropTypes.array.isRequired,
  setPedidoSeleccionado: PropTypes.func.isRequired
}

export default EditarPedido
