import PropTypes from 'prop-types'

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
  console.log('Productos disponibles:', productos)
  console.log('Items del pedido:', items)
  return (
    <>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold">Nuevo Pedido</h3>
          </div>
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Proveedor *</label>
                <select
                  value={proveedorSeleccionado}
                  onChange={(e) => setProveedorSeleccionado(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Seleccionar proveedor</option>
                  {proveedores.map((p) => (
                    <option key={p.id_proveedores} value={p.nombre}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-900">Productos del Pedido</h4>
                  <button
                    onClick={agregarItem}
                    disabled={!proveedorSeleccionado || productos.length === 0}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:hover:bg-green-600"
                  >
                    Agregar Producto
                  </button>
                </div>
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <select
                        value={item.producto.id}
                        onChange={(e) => actualizarItem(idx, 'producto', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      >
                        {productos.map((prod) => (
                          <option key={prod.id} value={prod.id}>
                            {prod.nombre}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={item.cantidad}
                        onChange={(e) => actualizarItem(idx, 'cantidad', e.target.value)}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-md text-center"
                        placeholder="Cant."
                      />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.costo}
                        onChange={(e) => actualizarItem(idx, 'costo', e.target.value)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Costo"
                      />
                      <span className="w-24 text-right font-medium">
                        ${(item.costo * item.cantidad).toFixed(2)}
                      </span>
                      <button
                        onClick={() => eliminarItem(idx)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nota</label>
                <textarea
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total del Pedido:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${totalPedido().toFixed(2)}
                  </span>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPedidoSeleccionado(null)
                      setProductosSeleccionado([])
                      setMostrarNuevo(false)
                      setItems([])
                      setProveedorSeleccionado('')
                      setNota('')
                    }}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-300 rounded-md hover:opacity-70"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!proveedorSeleccionado || items.length === 0}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600"
                  >
                    Crear Pedido
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
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
