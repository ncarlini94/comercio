import PropTypes from 'prop-types'

const AgregarUsuario = ({
  onSubmit,
  formData,
  setFormData,
  rolesDisponibles,
  mensaje,
  onCancel
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Nuevo usuario</h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Usuario *
            </label>
            <input
              type="text"
              name="usuario"
              required
              value={formData.usuario}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mail *
            </label>
            <input
              type="email"
              name="mail"
              required
              value={formData.mail}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contraseña *
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rol *
            </label>
            <select
              name="rol"
              required
              value={formData.rol}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccione un rol</option>
              {rolesDisponibles.map((rol) => (
                <option key={rol} value={rol}>
                  {rol}
                </option>
              ))}
            </select>
          </div>
          {mensaje && <p className="text-sm text-red-500">{mensaje}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Crear usuario
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

AgregarUsuario.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  formData: PropTypes.shape({
    usuario: PropTypes.string,
    mail: PropTypes.string,
    password: PropTypes.string,
    rol: PropTypes.string
  }).isRequired,
  setFormData: PropTypes.func.isRequired,
  rolesDisponibles: PropTypes.arrayOf(PropTypes.string).isRequired,
  mensaje: PropTypes.string,
  onCancel: PropTypes.func.isRequired
}

export default AgregarUsuario
