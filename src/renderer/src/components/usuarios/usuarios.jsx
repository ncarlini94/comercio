import { Pencil, Plus, Search, User, UserCheck, UserLock } from 'lucide-react'
import { useEffect, useState } from 'react'
import AgregarUsuario from './agregarUsuario/agregarUsuario'
import EditarUsuario from './editarUsuario/editarUsuario'
import { usePermisos } from '../../sesion'

const FORM_INICIAL = { usuario: '', mail: '', password: '', rol: '' }

const Usuarios = () => {
  const { sesion, puede, recargarSesion } = usePermisos()
  const [usuarios, setUsuarios] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [formData, setFormData] = useState(FORM_INICIAL)
  const [mensaje, setMensaje] = useState('')
  const [editando, setEditando] = useState(null)
  // Solo los roles que la sesión puede asignar; el proceso principal también lo valida.
  const [rolesDisponibles, setRolesDisponibles] = useState([])

  useEffect(() => {
    window.API.obtenerRoles().then((respuesta) => {
      if (respuesta.success) {
        setRolesDisponibles(respuesta.roles.filter((r) => r.asignable).map((r) => r.nombre))
      }
    })
  }, [])

  const guardarEdicion = async (id, cambios) => {
    const respuesta = await window.API.editarUsuario(id, cambios)
    if (respuesta.success) {
      setEditando(null)
      obtenerUsuarios()
      if (id === sesion?.id_usuario) recargarSesion()
    }
    return respuesta
  }

  const cerrarFormulario = () => {
    setMostrarFormulario(false)
    setFormData(FORM_INICIAL)
    setMensaje('')
  }

  const handleCrearUsuario = async (e) => {
    e.preventDefault()
    try {
      const response = await window.API.registro({ ...formData, estado: 'Activo' })
      if (response.success === true) {
        cerrarFormulario()
        obtenerUsuarios()
      } else {
        setMensaje(response.message || 'Error al crear el usuario')
      }
    } catch (error) {
      console.error('Error al crear usuario:', error)
      setMensaje('Error al crear el usuario')
    }
  }

  useEffect(() => {
    obtenerUsuarios()
  }, [])

  const obtenerUsuarios = async () => {
    try {
      const resultado = await window.API.obtenerUsuarios()
      console.log('Usuarios obtenidos:', resultado)
      if (Array.isArray(resultado)) {
        setUsuarios(resultado)
      } else {
        setUsuarios([])
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
      setUsuarios([])
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 mb-4 ps-4 pt-2">
            <User />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Usuarios</h1>
          </div>
          {puede('usuarios.crear') && (
            <button
              onClick={() => setMostrarFormulario(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 me-4"
            >
              <Plus className="w-4 h-4" />
              Nuevo usuario
            </button>
          )}
        </div>
      </div>

      {editando && (
        <EditarUsuario
          usuario={editando}
          rolesAsignables={rolesDisponibles}
          esUnoMismo={editando.id_usuario === sesion?.id_usuario}
          onGuardar={guardarEdicion}
          onCancelar={() => setEditando(null)}
        />
      )}

      {mostrarFormulario && (
        <AgregarUsuario
          onSubmit={handleCrearUsuario}
          formData={formData}
          setFormData={setFormData}
          rolesDisponibles={rolesDisponibles}
          mensaje={mensaje}
          onCancel={cerrarFormulario}
        />
      )}

      {/* Buscador */}
      <div className="relative mb-6">
        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder="Buscar usuario"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border overflow-hidden dark:border-gray-700">
        <div className="overflow-y-auto max-h-150">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-11 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-8 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Mail
                </th>
                <th className="px-8 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {usuarios
                .filter(
                  (usuario) =>
                    usuario.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    usuario.mail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    usuario.rol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    usuario.estado.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((usuario) => (
                  <tr key={usuario.id_usuario}>
                    <td className="px-14 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {usuario.usuario}
                    </td>
                    <td className="px-0 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {usuario.mail}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {usuario.rol}
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {usuario.estado === 'Activo' ? (
                        <UserCheck className="font-bold inline-block w-5 h-5 text-green-500 ml-2" />
                      ) : (
                        <UserLock className="font-bold inline-block w-5 h-5 text-red-500 ml-2" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {usuario.editable && (
                        <button
                          onClick={() => setEditando(usuario)}
                          title="Editar usuario"
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default Usuarios
