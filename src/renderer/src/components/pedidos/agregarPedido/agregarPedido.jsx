import PropTypes from 'prop-types'
import { PackagePlus, Plus, X } from 'lucide-react'
import {
  AreaTexto,
  Boton,
  BotonIcono,
  Campo,
  CampoConEtiqueta,
  EstadoVacio,
  Modal,
  Selector
} from '../../ui'
import { formatearMoneda } from '../../../utils/formato'

const AgregarPedido = ({
  proveedorSeleccionado,
  proveedores,
  agregarItem,
  items,
  setProveedorSeleccionado,
  actualizarItem,
  productos,
  eliminarItem,
  nota,
  setNota,
  totalPedido,
  setMostrarNuevo,
  handleSubmit,
  setItems,
  setPedidoSeleccionado,
  setProductosSeleccionado
}) => {
  const cancelar = () => {
    setPedidoSeleccionado(null)
    setProductosSeleccionado([])
    setMostrarNuevo(false)
    setItems([])
    setProveedorSeleccionado('')
    setNota('')
  }

  const sinProductosDelProveedor = Boolean(proveedorSeleccionado) && productos.length === 0

  return (
    <Modal
      titulo="Nuevo pedido"
      tamano="lg"
      alCerrar={cancelar}
      alEnviar={handleSubmit}
      pie={
        <>
          <Boton onClick={cancelar}>Cancelar</Boton>
          <Boton
            variante="primario"
            type="submit"
            disabled={!proveedorSeleccionado || items.length === 0}
          >
            Crear pedido
          </Boton>
        </>
      }
    >
      <div className="space-y-5">
        <CampoConEtiqueta
          etiqueta="Proveedor"
          obligatorio
          ayuda={
            sinProductosDelProveedor ? 'Este proveedor no tiene productos cargados.' : undefined
          }
        >
          <Selector
            value={proveedorSeleccionado}
            onChange={(e) => setProveedorSeleccionado(e.target.value)}
          >
            <option value="">Seleccionar proveedor</option>
            {proveedores.map((p) => (
              <option key={p.id_proveedores} value={p.nombre}>
                {p.nombre}
              </option>
            ))}
          </Selector>
        </CampoConEtiqueta>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-texto">Productos del pedido</h3>
            <Boton
              tamano="sm"
              icono={Plus}
              onClick={agregarItem}
              disabled={!proveedorSeleccionado || productos.length === 0}
            >
              Agregar producto
            </Boton>
          </div>

          {items.length === 0 ? (
            <EstadoVacio
              icono={PackagePlus}
              titulo="Sin productos"
              descripcion="Elegí un proveedor y agregá los productos que querés pedir."
              className="rounded-lg border border-dashed border-borde py-8"
            />
          ) : (
            <ul className="space-y-2">
              {items.map((item, idx) => (
                <li
                  key={idx}
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-borde p-3"
                >
                  <Selector
                    value={item.producto.id}
                    onChange={(e) => actualizarItem(idx, 'producto', e.target.value)}
                    aria-label={`Producto ${idx + 1}`}
                    className="min-w-0 flex-1"
                  >
                    {productos.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.nombre}
                      </option>
                    ))}
                  </Selector>
                  <Campo
                    type="number"
                    min="1"
                    value={item.cantidad}
                    onChange={(e) => actualizarItem(idx, 'cantidad', e.target.value)}
                    aria-label={`Cantidad del producto ${idx + 1}`}
                    placeholder="Cant."
                    className="w-20 text-right"
                  />
                  <Campo
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.costo}
                    onChange={(e) => actualizarItem(idx, 'costo', e.target.value)}
                    aria-label={`Costo del producto ${idx + 1}`}
                    placeholder="Costo"
                    className="w-28 text-right"
                  />
                  <span className="w-28 text-right font-medium tabular-nums text-texto">
                    {formatearMoneda(item.costo * item.cantidad)}
                  </span>
                  <BotonIcono
                    icono={X}
                    etiqueta="Quitar producto"
                    variante="peligro"
                    tamano="sm"
                    onClick={() => eliminarItem(idx)}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <CampoConEtiqueta etiqueta="Nota">
          <AreaTexto value={nota} onChange={(e) => setNota(e.target.value)} rows={3} />
        </CampoConEtiqueta>

        <div className="flex items-center justify-between border-t border-borde pt-4">
          <span className="text-sm font-medium text-texto-secundario">Total del pedido</span>
          <span className="text-2xl font-semibold tabular-nums text-texto">
            {formatearMoneda(totalPedido())}
          </span>
        </div>
      </div>
    </Modal>
  )
}

AgregarPedido.propTypes = {
  proveedorSeleccionado: PropTypes.string.isRequired,
  proveedores: PropTypes.arrayOf(
    PropTypes.shape({
      id_proveedores: PropTypes.number.isRequired,
      nombre: PropTypes.string.isRequired
    })
  ).isRequired,
  agregarItem: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      producto: PropTypes.shape({
        id: PropTypes.number.isRequired,
        nombre: PropTypes.string.isRequired
      }).isRequired,
      cantidad: PropTypes.number.isRequired,
      costo: PropTypes.number.isRequired
    })
  ).isRequired,
  setProveedorSeleccionado: PropTypes.func.isRequired,
  actualizarItem: PropTypes.func.isRequired,
  setPedidoSeleccionado: PropTypes.func.isRequired,
  setProductosSeleccionado: PropTypes.func.isRequired,
  productos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nombre: PropTypes.string.isRequired
    })
  ).isRequired,
  eliminarItem: PropTypes.func.isRequired,
  nota: PropTypes.string.isRequired,
  setNota: PropTypes.func.isRequired,
  totalPedido: PropTypes.func.isRequired,
  setMostrarNuevo: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  setItems: PropTypes.func.isRequired
}

export default AgregarPedido
