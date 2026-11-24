import { Lock, Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import EditarRol from './editarRol/editarRol'
import { usePermisos } from '../../sesion'

export default function Roles() {
  const { sesion, recargarSesion } = usePermisos()
  const [roles, setRoles] = useState([])
  const [catalogo, setCatalogo] = useState([])
  const [editando, setEditando] = useState(null) // null = cerrado, {} = nuevo, rol = editar
  const [mensaje, setMensaje] = useState(null)

  const cargar = useCallback(async () => {
    const [respuestaRoles, respuestaCatalogo] = await Promise.all([
      window.API.obtenerRoles(),
      window.API.obtenerCatalogoPermisos()
    ])
    if (respuestaRoles.success) setRoles(respuestaRoles.roles)
    else setMensaje({ ok: false, texto: respuestaRoles.message })
    if (respuestaCatalogo.success) setCatalogo(respuestaCatalogo.permisos)
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  const guardar = async (datos) => {
    const respuesta = editando?.id
      ? await window.API.actualizarRol(editando.id, datos)
      : await window.API.crearRol(datos)
    if (respuesta.success) {
      setEditando(null)
      setMensaje({ ok: true, texto: respuesta.message })
      await cargar()
      await recargarSesion()
    }
    return respuesta
  }

  const borrar = async (rol) => {
    if (!window.confirm(`¿Borrar el rol "${rol.nombre}"?`)) return
    const respuesta = await window.API.eliminarRol(rol.id)
    setMensaje({ ok: respuesta.success, texto: respuesta.message })
    if (respuesta.success) cargar()
  }

  const permisosPropios = new Set(sesion?.permisos ?? [])
  const nombrePermiso = (id) => catalogo.find((p) => p.id === id)?.nombre ?? id

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 ps-4 pt-2">
          <ShieldCheck />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Roles</h1>
        </div>
        <button
          onClick={() => setEditando({})}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 me-4"
        >
          <Plus className="w-4 h-4" />
          Nuevo rol
        </button>
      </div>

      {mensaje && (
        <div
          className={`rounded-lg p-3 text-sm border ${
            mensaje.ok
              ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
          }`}
        >
          {mensaje.texto}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {roles.map((rol) => (
          <div
            key={rol.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  {rol.nombre}
                  {rol.sistema && <Lock className="w-4 h-4 text-gray-400" />}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{rol.descripcion}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {rol.editable && (
                  <button
                    onClick={() => setEditando(rol)}
                    title="Editar"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
                {rol.editable && rol.usuarios === 0 && (
                  <button
                    onClick={() => borrar(rol)}
                    title="Borrar"
                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              {rol.usuarios} usuario{rol.usuarios === 1 ? '' : 's'}
              {rol.sistema && ' · Todos los permisos, no se puede modificar'}
              {!rol.sistema && rol.nombre === sesion?.rol && ' · Es su rol, no puede modificarlo'}
            </p>

            {!rol.sistema && (
              <div className="flex flex-wrap gap-1">
                {rol.permisos.length === 0 && (
                  <span className="text-xs text-gray-400">Sin permisos</span>
                )}
                {rol.permisos.map((p) => (
                  <span
                    key={p}
                    className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded"
                  >
                    {nombrePermiso(p)}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {editando && (
        <EditarRol
          rol={editando.id ? editando : null}
          catalogo={catalogo}
          permisosPropios={permisosPropios}
          onGuardar={guardar}
          onCancelar={() => setEditando(null)}
        />
      )}
    </div>
  )
}
