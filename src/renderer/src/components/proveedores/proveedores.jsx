import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, User, Users } from 'lucide-react'
import AgregarProveedor from './agregarProveedor/agregarProveedor'
import EditarProveedor from './editarProveedor/editarProveedor'

const Proveedores = () => {
  const [proveedores, setProveedores] = useState([])
  const [mostrarEditar, setMostrarEditar] = useState(false)
  const [editingProveedor, setEditingProveedor] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [mostrarNuevo, setMostrarNuevo] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    contacto: '',
    mail: '',
    telefono: '',
    celular: '',
    celular2: '',
    direccion: ''
  })
  const [mensaje, setMensaje] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    cargarProveedores()
  }, [])

  const cargarProveedores = async () => {
    try {
      const data = await window.API.obtenerTodosLosProveedores()
      if (Array.isArray(data)) {
        setProveedores(data)
      } else {
        setProveedores([])
      }
    } catch (error) {
      console.error('Error al cargar proveedores:', error)
      setProveedores([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    if (!formData.nombre) {
      setMensaje('El nombre es obligatorio.')
      return
    }
    setMensaje('')
    try {
      if (editingProveedor) {
        await window.API.actualizarProveedor(editingProveedor.id_proveedores, {
          ...formData
        })
      } else {
        const normalizado = {
          ...formData,
          telefono: formData.telefono ? parseInt(formData.telefono) : null,
          celular: formData.celular ? parseInt(formData.celular) : null,
          celular2: formData.celular2 ? parseInt(formData.celular2) : null
        }
        await window.API.agregarProveedor(normalizado)
        setMostrarNuevo(false)
      }
      cargarProveedores()
    } catch (error) {
      setMensaje('Error al guardar proveedor.')
      console.error('Error al guardar proveedor:', error)
    }
    setLoading(false)
  }

  const handleEdit = (proveedor) => {
    setEditingProveedor(proveedor)
    setFormData({
      nombre: proveedor.nombre || '',
      contacto: proveedor.contacto || '',
      mail: proveedor.mail || '',
      telefono: proveedor.telefono || '',
      celular: proveedor.celular || '',
      celular2: proveedor.celular2 || '',
      direccion: proveedor.direccion || ''
    })
    setMostrarEditar(true)
    setMensaje('')
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este proveedor?')) {
      try {
        await window.API.eliminarProveedor(id)
        cargarProveedores()
      } catch (error) {
        setMensaje('Error al eliminar proveedor.')
        console.error('Error al eliminar proveedor:', error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: '',
      contacto: '',
      mail: '',
      telefono: '',
      celular: '',
      celular2: '',
      direccion: ''
    })
    setEditingProveedor(null)
    setMostrarEditar(false)
    setMostrarNuevo(false)
    setMensaje('')
  }

  const filteredProveedores = proveedores.filter(
    (proveedor) =>
      proveedor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (proveedor.contacto || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 ps-4 pt-2">
          <Users />
          <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
        </div>
        <button
          onClick={() => {
            setMostrarNuevo(true)
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Agregar Proveedor
        </button>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar proveedores..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Grid de proveedores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProveedores.map((proveedor) => (
          <div key={proveedor.id_proveedores} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">{proveedor.nombre}</h3>
                  <p className="text-sm text-gray-600">{proveedor.contacto}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(proveedor)}
                  className="text-blue-600 hover:text-blue-900"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(proveedor.id_proveedores)}
                  className="text-red-600 hover:text-red-900"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              {proveedor.mail && (
                <div className="flex items-center">
                  <span className="font-medium w-16">Mail:</span>
                  <span>{proveedor.mail}</span>
                </div>
              )}
              {proveedor.telefono && (
                <div className="flex items-center">
                  <span className="font-medium w-16">Teléfono:</span>
                  <span>{proveedor.telefono}</span>
                </div>
              )}
              {proveedor.celular && (
                <div className="flex items-center">
                  <span className="font-medium w-16">Celular:</span>
                  <span>{proveedor.celular}</span>
                </div>
              )}
              {proveedor.celular2 && (
                <div className="flex items-center">
                  <span className="font-medium w-16">Celular 2:</span>
                  <span>{proveedor.celular2}</span>
                </div>
              )}
              {proveedor.direccion && (
                <div className="flex items-start">
                  <span className="font-medium w-16">Dirección:</span>
                  <span className="flex-1">{proveedor.direccion}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Agregar */}
      {mostrarNuevo && (
        <AgregarProveedor
          onSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
          mensaje={mensaje}
          resetForm={resetForm}
          loading={loading}
        />
      )}

      {/* Editar */}
      {mostrarEditar && (
        <EditarProveedor
          onSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
          mensaje={mensaje}
          resetForm={resetForm}
          loading={loading}
        />
      )}
    </div>
  )
}

export default Proveedores
