import { useState, useEffect } from 'react'
import { Plus, Trash2, PackageSearch, ShoppingCart } from 'lucide-react'
import AgregarVenta from './agregarVenta/agregarVenta'
import DetallesVentas from './detallesVenta/detallesVentas'

const Ventas = () => {
  const [ventas, setVentas] = useState([])
  const [productos, setProductos] = useState([])
  const [mostrarNuevaVenta, setMostrarNuevaVenta] = useState(false)
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null)
  const [carrito, setCarrito] = useState([])
  const [loading, setLoading] = useState(false)
  const vendedor = localStorage.usuario

  useEffect(() => {
    cargarVentas()
    cargarProductos()
  }, [])

  const cargarVentas = async () => {
    try {
      const resultado = await window.API.obtenerTodasLasVentas()
      if (Array.isArray(resultado)) {
        setVentas(resultado)
      } else {
        setVentas([])
      }
    } catch (error) {
      console.error('Error al cargar ventas:', error)
      setVentas([])
    }
  }

  const cargarProductos = async () => {
    try {
      const resultado = await window.API.obtenerTodosLosProductos()
      setProductos(resultado)
    } catch (error) {
      console.error('Error al cargar productos:', error)
    }
  }

  const cargarDetallesVenta = async (id) => {
    try {
      console.log(id)
      const items = await window.API.obtenerProductosVenta(id)
      const venta = ventas.find((v) => v.id === id)
      console.log(items)
      if (venta) {
        setVentaSeleccionada({ ...venta, items })
      }
    } catch (error) {
      console.error('Error al cargar detalles de venta:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar la venta?')) {
      try {
        await window.API.eliminarVenta(id)
        cargarVentas()
      } catch (error) {
        console.error('Error al eliminar producto:', error)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center ps-4 pt-2 gap-2">
          <ShoppingCart />
          <h1 className="text-2xl font-bold text-gray-900">Ventas</h1>
        </div>
        <button
          onClick={() => setMostrarNuevaVenta(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva Venta
        </button>
      </div>

      {/* Lista de ventas */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-y-auto max-h-165">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Productos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  vendedor
                </th>
                <th className="px-10 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {ventas.map((venta) => (
                <tr key={venta.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">#{venta.id}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {new Date(venta.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-green-600">
                    ${venta.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {venta.Productos_vendidos
                      ? venta.Productos_vendidos.reduce((acc, item) => acc + item.cantidad, 0)
                      : 0}{' '}
                    {(venta.Productos_vendidos
                      ? venta.Productos_vendidos.reduce((acc, item) => acc + item.cantidad, 0)
                      : 0) === 1
                      ? 'Producto'
                      : 'Productos'}
                  </td>
                  <td className="px-10 py-4 text-sm text-gray-900">{venta.vendedor}</td>
                  <td className="px-11 py-4 text-right">
                    <button
                      onClick={() => cargarDetallesVenta(venta.id)}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      <PackageSearch className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(venta.id)}
                      className="text-blue-600 hover:text-blue-900 ps-4"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Agregar Venta */}
      {mostrarNuevaVenta && (
        <AgregarVenta
          vendedor={vendedor}
          productos={productos}
          carrito={carrito}
          setMostrarNuevaVenta={setMostrarNuevaVenta}
          setCarrito={setCarrito}
          loading={loading}
          setLoading={setLoading}
          cargarVentas={cargarVentas}
          cargarProductos={cargarProductos}
        />
      )}

      {/* Modal detalles venta */}
      {ventaSeleccionada && (
        <DetallesVentas
          ventaSeleccionada={ventaSeleccionada}
          setVentaSeleccionada={setVentaSeleccionada}
        />
      )}
    </div>
  )
}

export default Ventas
