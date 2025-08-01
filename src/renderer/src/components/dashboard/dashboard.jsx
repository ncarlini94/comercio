import PropTypes from 'prop-types'
import { useState, useEffect } from 'react'
import { Package, Users, ShoppingCart, AlertTriangle, BarChart3 } from 'lucide-react'

const Dashboard = () => {
  const [fecha, setFecha] = useState('')
  const [estadisticas, setEstadisticas] = useState({
    productos: 0,
    proveedores: 0,
    ventasHoy: 0,
    stockBajo: 0
  })

  useEffect(() => {
    const fecha = new Date()
    const fechaCorta = fecha.toISOString().split('T')[0]
    setFecha(fechaCorta)
  }, [])

  useEffect(() => {
    if (!fecha) return
    cargarDashboard()
  }, [fecha])

  // Listados
  const [ventasRecientes, setVentasRecientes] = useState([])
  const [productosStockBajo, setProductosStockBajo] = useState([])
  const [productosMasVendidos, setProductosMasVendidos] = useState([])

  // Carga de datos
  const cargarDashboard = async () => {
    try {
      const [{ totalProductos }, { totalProveedores }, { totalVentasHoy }, { totalStockBajo }] =
        await Promise.all([
          window.API.obtenerTotalProductos(),
          window.API.obtenerTotalProveedores(),
          window.API.obtenerTotalVentasHoy(fecha),
          window.API.obtenerTotalStockBajo()
        ])

      setEstadisticas({
        productos: totalProductos,
        proveedores: totalProveedores,
        ventasHoy: totalVentasHoy,
        stockBajo: totalStockBajo
      })

      const ultimasVentas = await window.API.obtenerUltimasVentas()
      setVentasRecientes(ultimasVentas || [])

      const bajo = await window.API.obtenerProductosStockBajo()
      setProductosStockBajo(bajo || [])

      const masVendidos = await window.API.obtenerProductosMasVendidos()
      setProductosMasVendidos(masVendidos || [])
    } catch (error) {
      console.error('Error cargando datos del panel:', error)
    }
  }

  console.log('Productos mas vendidos:', productosMasVendidos)

  const TarjetaEstadistica = ({ titulo, valor, icono: Icono, color, sufijo = '' }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{titulo}</p>
          <p className="text-2xl font-bold text-gray-900">
            {valor}
            {sufijo}
          </p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icono className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-4 mb-6">
        <BarChart3 />
        <h1 className="text-2xl font-bold text-gray-900">Panel de Control</h1>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TarjetaEstadistica
          titulo="Total Productos"
          valor={estadisticas.productos}
          icono={Package}
          color="bg-blue-500"
        />
        <TarjetaEstadistica
          titulo="Proveedores"
          valor={estadisticas.proveedores}
          icono={Users}
          color="bg-green-500"
        />
        <TarjetaEstadistica
          titulo="Ventas Hoy"
          valor={`$${(estadisticas.ventasHoy ?? 0).toFixed(2)}`}
          icono={ShoppingCart}
          color="bg-purple-500"
        />
        <TarjetaEstadistica
          titulo="Stock Bajo"
          valor={estadisticas.stockBajo}
          icono={AlertTriangle}
          color="bg-red-500"
        />
      </div>

      {productosMasVendidos.length > 0 && (
        <section className="bg-white p-2 rounded-lg shadow-sm border mb-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Productos más vendidos</h2>
          <div className="flex items-center justify-between">
            {productosMasVendidos.map((prod, idx) => (
              <div
                key={prod.id || idx}
                className="flex flex-col items-center w-30 min-h-30 p-2 bg-blue-50 rounded-lg justify-between"
              >
                <div className={`p-2 mb-2 rounded-full bg-gray-500`}>
                  <Package className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-blue-700 text-center">{prod.producto}</span>
                <span className="text-sm text-gray-600">Vendidos: {prod.totalVendido}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Ventas recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-10">
        <section className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ventas Recientes</h2>
          <div className="overflow-y-auto space-y-1 max-h-100">
            {ventasRecientes.length > 0 ? (
              ventasRecientes.map((venta) => (
                <div
                  key={venta.id}
                  className="flex justify-between items-center p-3 bg-gray-100 rounded"
                >
                  <div>
                    <p className="font-medium">Venta #{venta.id}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(venta.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className="font-semibold text-green-600">
                      {`$${(venta.total ?? 0).toFixed(2)}`}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No hay ventas registradas</p>
            )}
          </div>
        </section>

        {/* Productos con stock bajo */}
        <section className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Productos con Stock Bajo</h2>
          <div className="overflow-y-auto space-y-1 max-h-100">
            {productosStockBajo.length > 0 ? (
              productosStockBajo.map((producto, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-red-50 rounded">
                  <div>
                    <p className="font-medium text-red-900">{producto.nombre}</p>
                    <p className="text-sm text-red-600">
                      Proveedor: {producto.Proveedor.nombre || 'Sin asignar'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">Stock: {producto.stock}</p>
                    <p className="text-xs text-red-500">Minimo: {producto.stock_minimo}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No hay productos con stock bajo</p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

Dashboard.propTypes = {
  titulo: PropTypes.string,
  descripcion: PropTypes.string,
  valor: PropTypes.number,
  icono: PropTypes.elementType,
  color: PropTypes.string,
  sufijo: PropTypes.string
}

export default Dashboard
