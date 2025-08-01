import PropTypes from 'prop-types'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'

const AgregarVenta = ({
  vendedor,
  productos,
  carrito,
  setMostrarNuevaVenta,
  setCarrito,
  loading,
  setLoading,
  cargarVentas,
  cargarProductos
}) => {
  const [metodo, setMetodo] = useState('Efectivo')
  const METODOS_PAGO = ['Efectivo', 'Mercado Pago', 'Debito', 'Credito']
  // Agregar producto al carrito
  const agregarAlCarrito = (producto) => {
    const existe = carrito.find((item) => item.producto.id === producto.id)
    if (existe) {
      if (existe.cantidad < producto.stock_cantidad) {
        setCarrito(
          carrito.map((item) =>
            item.producto.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
          )
        )
      }
    } else {
      setCarrito([...carrito, { producto, cantidad: 1 }])
    }
  }

  const actualizarCantidadCarrito = (idProducto, cantidad) => {
    if (cantidad <= 0) {
      setCarrito(carrito.filter((item) => item.producto.id !== idProducto))
    } else {
      const producto = productos.find((p) => p.id === idProducto)
      if (producto && cantidad <= producto.stock) {
        setCarrito(
          carrito.map((item) => (item.producto.id === idProducto ? { ...item, cantidad } : item))
        )
      }
    }
  }

  // Calcular total del carrito
  const obtenerTotalCarrito = () => {
    return carrito.reduce((total, item) => total + item.producto.precio * item.cantidad, 0)
  }

  // Completar venta
  const completarVenta = async () => {
    if (carrito.length === 0) return
    setLoading(true)
    try {
      const total = obtenerTotalCarrito()
      const ventaAEnviar = {
        carrito: carrito.map((item) => ({
          id_producto: item.producto.id,
          cantidad: item.cantidad
        })),
        total,
        metodo,
        vendedor: vendedor
      }

      await window.API.agregarVenta(ventaAEnviar)

      setCarrito([])
      setMostrarNuevaVenta(false)
      cargarVentas()
      cargarProductos()
    } catch (error) {
      console.error('Error al completar la venta:', error)
    }
    setLoading(false)
  }
  return (
    <>
      <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold">Nueva Venta - {vendedor}</h3>
          </div>

          <div className="flex h-[calc(90vh-8rem)]">
            {/* Lista de productos */}
            <div className="w-1/2 p-6 border-r overflow-y-auto">
              <h4 className="font-medium text-gray-900 mb-4">Productos Disponibles</h4>
              <div className="space-y-2">
                {productos.map((producto) => (
                  <div
                    key={producto.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium">{producto.nombre}</p>
                      <p className="text-sm text-gray-600">Stock: {producto.stock}</p>
                      <p className="text-sm font-semibold text-green-600">
                        ${producto.precio.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => agregarAlCarrito(producto)}
                      disabled={producto.stock === 0}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:bg-gray-700 disabled:opacity-50"
                    >
                      Agregar
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Carrito */}
            <div className="w-1/2 p-6 flex flex-col">
              <h4 className="font-medium text-gray-900 mb-4">Carrito de Venta</h4>

              <div className="flex-1 overflow-y-auto">
                {carrito.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No hay productos en el carrito</p>
                ) : (
                  <div className="space-y-3">
                    {carrito.map((item) => (
                      <div
                        key={item.producto.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{item.producto.nombre}</p>
                          <p className="text-sm text-gray-600">
                            ${item.producto.precio.toFixed(2)} c/u
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="1"
                            max={item.producto.stock}
                            value={item.cantidad}
                            onChange={(e) =>
                              actualizarCantidadCarrito(item.producto.id, parseInt(e.target.value))
                            }
                            className="w-16 px-2 py-1 border rounded text-center"
                          />
                          <button
                            onClick={() => actualizarCantidadCarrito(item.producto.id, 0)}
                            className={`text-red-600 hover:text-red-800`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-4">
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Metodo de pago:</span>
                    <select
                      value={metodo}
                      onChange={(e) => setMetodo(e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      {METODOS_PAGO.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-green-600">
                      ${obtenerTotalCarrito().toFixed(2)}
                    </span>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setMostrarNuevaVenta(false)
                        setCarrito([])
                      }}
                      className="flex-1 px-4 py-2 text-white bg-gray-400 rounded-md hover:opacity-70"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={completarVenta}
                      disabled={carrito.length === 0 || loading}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:hover:bg-green-600 transition-colors"
                    >
                      {loading ? 'Procesando...' : 'Confirmar'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

AgregarVenta.propTypes = {
  vendedor: PropTypes.string.isRequired,
  productos: PropTypes.array.isRequired,
  carrito: PropTypes.array.isRequired,
  setMostrarNuevaVenta: PropTypes.func.isRequired,
  setCarrito: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  setLoading: PropTypes.func.isRequired,
  cargarVentas: PropTypes.func.isRequired,
  cargarProductos: PropTypes.func.isRequired
}

export default AgregarVenta
