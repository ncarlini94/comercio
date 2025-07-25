import PropTypes from 'prop-types'
const DetallesVentas = ({ ventaSeleccionada, setVentaSeleccionada }) => {
  return (
    <>
      <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold">
              Detalles de Venta #{ventaSeleccionada.id} - {ventaSeleccionada.vendedor}
            </h3>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Fecha:</span>
                  <p>{new Date(ventaSeleccionada.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Total:</span>
                  <p className="text-xl font-bold text-green-600">
                    ${ventaSeleccionada.total.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Productos Vendidos</h4>
              <div className="space-y-2">
                {ventaSeleccionada.Productos_vendidos?.map((item) => (
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
                        ${(item.precio_unitario * item.cantidad).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        ${item.precio_unitario.toFixed(2)} c/u
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setVentaSeleccionada(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

DetallesVentas.propTypes = {
  ventaSeleccionada: PropTypes.object.isRequired,
  setVentaSeleccionada: PropTypes.func.isRequired
}

export default DetallesVentas
