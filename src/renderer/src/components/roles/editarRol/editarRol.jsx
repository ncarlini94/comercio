import PropTypes from 'prop-types'
import { useState } from 'react'

// Formulario para crear o editar un rol. Los permisos se agrupan por sección.
// Los permisos que la sesión no tiene se muestran deshabilitados: no se pueden otorgar.
const EditarRol = ({ rol, catalogo, permisosPropios, onGuardar, onCancelar }) => {
  const [nombre, setNombre] = useState(rol?.nombre ?? '')
  const [descripcion, setDescripcion] = useState(rol?.descripcion ?? '')
  const [permisos, setPermisos] = useState(new Set(rol?.permisos ?? []))
  const [mensaje, setMensaje] = useState('')
  const [guardando, setGuardando] = useState(false)

  const secciones = catalogo.reduce((grupos, permiso) => {
    ;(grupos[permiso.seccion] ??= []).push(permiso)
    return grupos
  }, {})

  const alternar = (id) =>
    setPermisos((actuales) => {
      const nuevos = new Set(actuales)
      if (nuevos.has(id)) nuevos.delete(id)
      else nuevos.add(id)
      return nuevos
    })

  const alternarSeccion = (lista, marcar) =>
    setPermisos((actuales) => {
      const nuevos = new Set(actuales)
      lista
        .filter((p) => permisosPropios.has(p.id))
        .forEach((p) => (marcar ? nuevos.add(p.id) : nuevos.delete(p.id)))
      return nuevos
    })

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setMensaje('')
    const respuesta = await onGuardar({ nombre, descripcion, permisos: [...permisos] })
    setGuardando(false)
    if (!respuesta.success) setMensaje(respuesta.message)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <form
        onSubmit={guardar}
        className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col"
      >
        <div className="p-6 border-b dark:border-gray-700 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {rol ? `Editar rol: ${rol.nombre}` : 'Nuevo rol'}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                required
                maxLength={40}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descripción
              </label>
              <input
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto grid gap-4 md:grid-cols-2">
          {Object.entries(secciones).map(([seccion, lista]) => {
            const todos = lista.every((p) => permisos.has(p.id))
            return (
              <fieldset
                key={seccion}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2"
              >
                <legend className="px-1 flex items-center gap-3">
                  <span className="font-medium text-gray-900 dark:text-gray-100">{seccion}</span>
                  <button
                    type="button"
                    onClick={() => alternarSeccion(lista, !todos)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {todos ? 'Quitar todos' : 'Marcar todos'}
                  </button>
                </legend>
                {lista.map((permiso) => {
                  const disponible = permisosPropios.has(permiso.id)
                  return (
                    <label
                      key={permiso.id}
                      title={disponible ? '' : 'No puede otorgar un permiso que usted no tiene'}
                      className={`flex items-center gap-2 text-sm ${
                        disponible
                          ? 'text-gray-700 dark:text-gray-300'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                        checked={permisos.has(permiso.id)}
                        disabled={!disponible}
                        onChange={() => alternar(permiso.id)}
                      />
                      {permiso.nombre}
                    </label>
                  )
                })}
              </fieldset>
            )
          })}
        </div>

        <div className="p-4 border-t dark:border-gray-700 flex items-center justify-between gap-3">
          <p className="text-sm text-red-600 dark:text-red-400">{mensaje}</p>
          <div className="flex gap-3 shrink-0">
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
        </div>
      </form>
    </div>
  )
}

EditarRol.propTypes = {
  rol: PropTypes.shape({
    nombre: PropTypes.string,
    descripcion: PropTypes.string,
    permisos: PropTypes.arrayOf(PropTypes.string)
  }),
  catalogo: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.string, seccion: PropTypes.string, nombre: PropTypes.string })
  ).isRequired,
  permisosPropios: PropTypes.instanceOf(Set).isRequired,
  onGuardar: PropTypes.func.isRequired,
  onCancelar: PropTypes.func.isRequired
}

export default EditarRol
