import PropTypes from 'prop-types'
const EditarPedido = ({
  pedidoSeleccionado,
  handleSubmit,
  estado,
  setEstado,
  productosSeleccionado,
  setPedidoSeleccionado
}) => {
  console.log('Pedido Seleccionado:', pedidoSeleccionado)
  return (
    <>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-2xl mx-4 min-h-120 min-w-180">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold">Detalles del Pedido #{pedidoSeleccionado.id}</h3>
          </div>
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-6">
              <div className="grid grid-cols-10 gap-6 text-sm">
                <div className="col-span-4 min-h-80 flex flex-col justify-between h-full">
                  <div>
                    <div className="py-2">
                      <span className="font-medium text-gray-700">Proveedor:</span>
                      <p>{pedidoSeleccionado.proveedor}</p>
                    </div>
                    <div className="py-2">
                      <span className="font-medium text-gray-700">Fecha:</span>
                      <p>{new Date(pedidoSeleccionado.created_at).toLocaleString()}</p>
                    </div>
                    <div className="py-2">
                      <span className="font-medium text-gray-700">Total:</span>
                      <p className="text-xl font-bold text-blue-600">
                        ${pedidoSeleccionado.total?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Estado:</span>
                    {estado && (
                      <select
                        value={estado}
                        onChange={(e) => setEstado(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="Pedido">Pedido</option>
                        <option value="Aprobado">Aprobado</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
                    )}
                  </div>
                </div>

                <div className="col-span-6 w-full">
                  <h4 className="font-medium text-gray-900 mb-3">Productos Pedidos</h4>
                  <div className=" overflow-y-auto  h-90 space-y-2">
                    {productosSeleccionado.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded"
                      >
                        <div>
                          <p className="font-medium">{item.producto}</p>
                          <p className="text-sm text-gray-600">Cantidad: {item.cantidad}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            ${(item.costo * item.cantidad).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">${item.costo.toFixed(2)} c/u</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {pedidoSeleccionado.nota && (
                  <div className="mt-4">
                    <span className="font-medium text-gray-700">Nota:</span>
                    <p className="text-gray-600">{pedidoSeleccionado.nota}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setPedidoSeleccionado(null)}
                className="px-4 py-2 me-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cerrar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {pedidoSeleccionado ? 'Actualizar' : 'Agregar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

EditarPedido.propTypes = {
  pedidoSeleccionado: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  estado: PropTypes.string.isRequired,
  setEstado: PropTypes.func.isRequired,
  productosSeleccionado: PropTypes.array.isRequired,
  setPedidoSeleccionado: PropTypes.func.isRequired
}

export default EditarPedido
