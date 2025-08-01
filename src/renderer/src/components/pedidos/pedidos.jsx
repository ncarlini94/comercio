import { useState, useEffect } from 'react'
import { Package, Plus } from 'lucide-react'
import AgregarPedido from './agregarPedido/agregarPedido'
import EditarPedido from './editarPedido/editarPedido'

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [productos, setProductos] = useState([])
  const [mostrarNuevo, setMostrarNuevo] = useState(false)
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState('')
  const [items, setItems] = useState([])
  const [nota, setNota] = useState('')
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null)
  const [productosSeleccionado, setProductosSeleccionado] = useState([])
  const [estado, setEstado] = useState(null)

  useEffect(() => {
    cargarPedidos()
    cargarProveedores()
    cargarProductos()
  }, [])

  const cargarPedidos = async () => {
    const data = await window.API.obtenerTodosLosPedidos()
    setPedidos(Array.isArray(data) ? data : [])
  }

  const cargarProveedores = async () => {
    const data = await window.API.obtenerTodosLosProveedores()
    setProveedores(Array.isArray(data) ? data : [])
  }

  const cargarProductos = async () => {
    const data = await window.API.obtenerTodosLosProductos()
    setProductos(Array.isArray(data) ? data : [])
  }

  const proveedorObj = proveedores.find((p) => p.nombre === proveedorSeleccionado)
  const productosProveedor = proveedorObj
    ? productos.filter((p) => p.id_proveedor === proveedorObj.id_proveedores)
    : []

  const agregarItem = () => {
    if (productosProveedor.length > 0) {
      setItems([
        ...items,
        {
          producto: productosProveedor[0],
          cantidad: 1,
          costo: productosProveedor[0].costo || productosProveedor[0].precio
        }
      ])
    }
  }

  const actualizarItem = (idx, campo, valor) => {
    const nuevos = [...items]
    if (campo === 'producto') {
      const prod = productos.find((p) => p.id === parseInt(valor))
      nuevos[idx].producto = prod
      nuevos[idx].costo = prod.costo || prod.precio
    } else if (campo === 'cantidad') {
      nuevos[idx].cantidad = parseInt(valor) || 1
    } else if (campo === 'costo') {
      nuevos[idx].costo = parseFloat(valor) || 0
    }
    setItems(nuevos)
  }

  const eliminarItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx))
  }

  const totalPedido = () => items.reduce((t, i) => t + i.costo * i.cantidad, 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (pedidoSeleccionado) {
        if (pedidoSeleccionado.estado === 'Aprobado') {
          console.error('No se puede cambiar el estado de aprobado')
        } else {
          await window.API.actualizarPedido(pedidoSeleccionado.id, estado)
          cargarPedidos()
          setPedidoSeleccionado(null)
        }
      } else {
        if (!proveedorSeleccionado || items.length === 0) return
        await window.API.agregarPedido({
          proveedor: proveedorSeleccionado,
          total: totalPedido(),
          estado: 'Pendiente',
          nota,
          productos: items.map((i) => ({
            id_producto: i.producto.id,
            producto: i.producto.nombre,
            cantidad: i.cantidad,
            costo: i.costo
          }))
        })
        setMostrarNuevo(false)
        setProveedorSeleccionado('')
        setItems([])
        setNota('')
        cargarPedidos()
      }
    } catch (error) {
      console.error(error)
    }
  }

  const verDetalles = async (pedido) => {
    try {
      setPedidoSeleccionado(pedido)
      const resultado = await window.API.obtenerTodosLosProductosPedidos(pedido.id)
      setProductosSeleccionado(Array.isArray(resultado) ? resultado : [])
      setEstado(pedido.estado)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 ps-4 pt-2">
          <Package />
          <h1 className="text-2xl font-bold text-gray-900">Pedidos a Proveedores</h1>
        </div>
        <button
          onClick={() => {
            setProveedorSeleccionado('')
            setItems([])
            setNota('')
            setMostrarNuevo(true)
          }}
          disabled={proveedores?.length === 0}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:hover:bg-green-600"
        >
          <Plus className="w-4 h-4" />
          Nuevo Pedido
        </button>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-y-auto max-h-165">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Proveedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pedidos.map((pedido) => (
                <tr key={pedido.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">#{pedido.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{pedido.proveedor}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(pedido.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-blue-600">
                    ${pedido.total?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">{pedido.estado}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => verDetalles(pedido)}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      Detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Nuevo */}
      {mostrarNuevo && (
        <AgregarPedido
          proveedorSeleccionado={proveedorSeleccionado}
          proveedores={proveedores}
          agregarItem={agregarItem}
          items={items}
          setProveedorSeleccionado={setProveedorSeleccionado}
          actualizarItem={actualizarItem}
          productos={productosProveedor}
          eliminarItem={eliminarItem}
          nota={nota}
          setNota={setNota}
          totalPedido={totalPedido}
          setMostrarNuevo={setMostrarNuevo}
          handleSubmit={handleSubmit}
          setPedidoSeleccionado={setPedidoSeleccionado}
          setProductosSeleccionado={setProductosSeleccionado}
        />
      )}

      {/* actualizar */}
      {pedidoSeleccionado && (
        <EditarPedido
          pedidoSeleccionado={pedidoSeleccionado}
          handleSubmit={handleSubmit}
          estado={estado}
          setEstado={setEstado}
          productosSeleccionado={productosSeleccionado}
          setPedidoSeleccionado={setPedidoSeleccionado}
        />
      )}
    </div>
  )
}

export default Pedidos
