import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, Package } from 'lucide-react'
import AgregarProducto from './agregarProducto/agregarProducto'
import EditarProducto from './editarPoducto/editarProducto'

const Inventario = () => {
  const [productos, setProductos] = useState([])
  const [proveedores, setProveedores] = useState()
  const [editingProducto, setEditingProducto] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [showFormAgregar, setShowFormAgregar] = useState(false)
  const [showFormEditar, setShowFormEditar] = useState(false)

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    costo: '',
    precio: '',
    stock: '',
    stock_minimo: '',
    id_proveedor: ''
  })

  useEffect(() => {
    cargarProductos()
    cargarProveedores()
  }, [])

  const cargarProductos = async () => {
    try {
      const data = await window.API.obtenerTodosLosProductos()
      if (Array.isArray(data)) {
        setProductos(data)
      } else {
        setProductos([])
      }
    } catch (error) {
      console.error('Error al obtener productos:', error)
      setProductos([])
    }
  }

  const cargarProveedores = async () => {
    try {
      const data = await window.API.obtenerTodosLosProveedores()
      if (Array.isArray(data)) {
        setProveedores(data)
      } else {
        setProveedores([])
      }
    } catch (error) {
      console.error('Error al obtener proveedores:', error)
      setProveedores([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingProducto) {
        const normalizado = {
          ...formData,
          precio: formData.precio ? parseInt(formData.precio) : null,
          stock: formData.stock ? parseInt(formData.stock) : null,
          stock_minimo: formData.stock_minimo ? parseInt(formData.stock_minimo) : null
        }
        await window.API.actualizarProducto(editingProducto.id, normalizado)
      } else {
        await window.API.agregarProducto({
          ...formData,
          costo: formData.costo ? parseFloat(formData.costo) : null,
          precio: parseFloat(formData.precio),
          stock: parseFloat(formData.stock),
          stock_minimo: parseFloat(formData.stock_minimo),
          id_proveedor: formData.id_proveedor || null
        })
      }
      resetForm()
      cargarProductos()
    } catch (error) {
      console.error('Error al guardar producto:', error)
    }
    setLoading(false)
  }

  const handleEdit = (producto) => {
    setEditingProducto(producto)
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      costo: producto.costo?.toString() || '',
      precio: producto.precio?.toString() || '',
      stock: producto.stock?.toString() || '',
      stock_minimo: producto.stock_minimo?.toString() || '',
      id_proveedor: producto.id_proveedor?.toString() || ''
    })
    setShowFormEditar(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await window.API.eliminarProducto(id)
        cargarProductos()
      } catch (error) {
        console.error('Error al eliminar producto:', error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      costo: '',
      precio: '',
      stock: '',
      stock_minimo: '',
      id_proveedor: ''
    })
    setEditingProducto(null)
    setShowFormEditar(false)
    setShowFormAgregar(false)
  }

  const filteredProductos = productos.filter(
    (producto) =>
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (producto.sku || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 ps-4 pt-2">
          <Package />
          <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowFormAgregar(true)
          }}
          disabled={proveedores?.length === 0}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:hover:bg-green-600"
        >
          <Plus className="w-4 h-4" />
          Agregar Producto
        </button>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Tabla de productos */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-y-auto max-h-150">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-14 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Costo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-10 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Minimo
                </th>
                <th className="px-10 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proveedor
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProductos.map((producto) => (
                <tr key={producto.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-500" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{producto.nombre}</div>
                        <div className="text-sm text-gray-500">{producto.descripcion}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${producto.costo?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${producto.precio?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        parseInt(producto.stock) <= parseInt(producto.stock_minimo)
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {producto.stock} unidades
                    </span>
                  </td>
                  <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 text-black}`}
                    >
                      {!productos.stock_minimo ? `${producto.stock_minimo} unidades` : ''}
                    </span>
                  </td>
                  <td className="px-12 py-4 whitespace-nowrap text-sm text-gray-900">
                    {producto.Proveedor?.nombre || 'Sin asignar'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(producto)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(producto.id)}
                      className="text-red-600 hover:text-red-900"
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
      {/* Modal de formulario */}
      {showFormAgregar && (
        <AgregarProducto
          loading={loading}
          proveedores={proveedores}
          resetForm={resetForm}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
        />
      )}
      {showFormEditar && (
        <EditarProducto
          loading={loading}
          proveedores={proveedores}
          resetForm={resetForm}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}

export default Inventario
