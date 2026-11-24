import PropTypes from 'prop-types'
import { useState } from 'react'

const campo =
  'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60'
const etiqueta = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'

// Edición de un usuario. Rol y estado no se pueden cambiar sobre uno mismo.
const EditarUsuario = ({ usuario, rolesAsignables, esUnoMismo, onGuardar, onCancelar }) => {
  const [datos, setDatos] = useState({
    usuario: usuario.usuario,
    mail: usuario.mail,
    rol: usuario.rol,
    estado: usuario.estado,
    password: ''
  })
  const [mensaje, setMensaje] = useState('')
  const [guardando, setGuardando] = useState(false)

  const cambiar = (e) => setDatos((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  // El rol actual se muestra aunque no sea asignable (por ejemplo, el propio).
  const opcionesRol = rolesAsignables.includes(usuario.rol)
    ? rolesAsignables
    : [usuario.rol, ...rolesAsignables]

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setMensaje('')
    const cambios = { usuario: datos.usuario, mail: datos.mail }
    if (!esUnoMismo) {
      cambios.rol = datos.rol
      cambios.estado = datos.estado
    }
    if (datos.password) cambios.password = datos.password
    const respuesta = await onGuardar(usuario.id_usuario, cambios)
    setGuardando(false)
    if (!respuesta.success) setMensaje(respuesta.message)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form
        onSubmit={guardar}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 space-y-4"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Editar usuario {esUnoMismo && '(usted)'}
        </h3>
        <div>
          <label className={etiqueta}>Usuario *</label>
          <input
            name="usuario"
            required
            value={datos.usuario}
            onChange={cambiar}
            className={campo}
          />
        </div>
        <div>
          <label className={etiqueta}>Mail *</label>
          <input
            type="email"
            name="mail"
            required
            value={datos.mail}
            onChange={cambiar}
            className={campo}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={etiqueta}>Rol</label>
            <select
              name="rol"
              value={datos.rol}
              onChange={cambiar}
              disabled={esUnoMismo}
              className={campo}
            >
              {opcionesRol.map((rol) => (
                <option key={rol} value={rol}>
                  {rol}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={etiqueta}>Estado</label>
            <select
              name="estado"
              value={datos.estado}
              onChange={cambiar}
              disabled={esUnoMismo}
              className={campo}
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
        </div>
        {esUnoMismo && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            No puede cambiar su propio rol ni su estado.
          </p>
        )}
        <div>
          <label className={etiqueta}>Nueva contraseña</label>
          <input
            type="password"
            name="password"
            value={datos.password}
            onChange={cambiar}
            placeholder="Dejar vacío para no cambiarla"
            maxLength={72}
            autoComplete="new-password"
            className={campo}
          />
        </div>
        {mensaje && <p className="text-sm text-red-600 dark:text-red-400">{mensaje}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancelar}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  )
}

EditarUsuario.propTypes = {
  usuario: PropTypes.shape({
    id_usuario: PropTypes.number.isRequired,
    usuario: PropTypes.string,
    mail: PropTypes.string,
    rol: PropTypes.string,
    estado: PropTypes.string
  }).isRequired,
  rolesAsignables: PropTypes.arrayOf(PropTypes.string).isRequired,
  esUnoMismo: PropTypes.bool.isRequired,
  onGuardar: PropTypes.func.isRequired,
  onCancelar: PropTypes.func.isRequired
}

export default EditarUsuario
