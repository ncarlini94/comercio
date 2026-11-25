import { Lock, Pencil, Plus, ShieldCheck, Trash2, Users } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import EditarRol from './editarRol/editarRol'
import { usePermisos } from '../../sesion'
import {
  Boton,
  BotonIcono,
  EncabezadoPagina,
  EstadoVacio,
  Insignia,
  Tarjeta,
  useAvisos,
  useConfirmar
} from '../ui'

export default function Roles() {
  const { sesion, recargarSesion } = usePermisos()
  const avisos = useAvisos()
  const confirmar = useConfirmar()
  const [roles, setRoles] = useState([])
  const [catalogo, setCatalogo] = useState([])
  const [cargado, setCargado] = useState(false)
  const [editando, setEditando] = useState(null) // null = cerrado, {} = nuevo, rol = editar

  const cargar = useCallback(async () => {
    const [respuestaRoles, respuestaCatalogo] = await Promise.all([
      window.API.obtenerRoles(),
      window.API.obtenerCatalogoPermisos()
    ])
    if (respuestaRoles.success) setRoles(respuestaRoles.roles)
    else avisos.error('No se pudieron cargar los roles', respuestaRoles.message)
    if (respuestaCatalogo.success) setCatalogo(respuestaCatalogo.permisos)
    setCargado(true)
  }, [avisos])

  useEffect(() => {
    cargar()
  }, [cargar])

  const guardar = async (datos) => {
    const respuesta = editando?.id
      ? await window.API.actualizarRol(editando.id, datos)
      : await window.API.crearRol(datos)
    if (respuesta.success) {
      setEditando(null)
      avisos.exito(respuesta.message)
      await cargar()
      await recargarSesion()
    }
    return respuesta
  }

  const borrar = async (rol) => {
    const ok = await confirmar({
      titulo: 'Borrar rol',
      mensaje: `Se borrará el rol "${rol.nombre}".`,
      textoConfirmar: 'Borrar',
      peligro: true
    })
    if (!ok) return
    const respuesta = await window.API.eliminarRol(rol.id)
    if (respuesta.success) {
      avisos.exito(respuesta.message)
      cargar()
    } else {
      avisos.error('No se pudo borrar el rol', respuesta.message)
    }
  }

  const permisosPropios = new Set(sesion?.permisos ?? [])
  const nombrePermiso = (id) => catalogo.find((p) => p.id === id)?.nombre ?? id

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        icono={ShieldCheck}
        titulo="Roles"
        subtitulo="Qué puede hacer cada usuario según su rol"
        acciones={
          <Boton variante="primario" icono={Plus} onClick={() => setEditando({})}>
            Nuevo rol
          </Boton>
        }
      />

      {cargado && roles.length === 0 ? (
        <EstadoVacio icono={ShieldCheck} titulo="No hay roles" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {roles.map((rol) => (
            <Tarjeta key={rol.id}>
              <div className="flex h-full flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="flex items-center gap-2 text-base font-semibold text-texto">
                      {rol.nombre}
                      {rol.sistema && (
                        <Lock className="h-4 w-4 text-texto-tenue" aria-hidden="true" />
                      )}
                    </h2>
                    {rol.descripcion && (
                      <p className="text-sm text-texto-secundario">{rol.descripcion}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {rol.editable && (
                      <BotonIcono
                        icono={Pencil}
                        etiqueta="Editar"
                        tamano="sm"
                        onClick={() => setEditando(rol)}
                      />
                    )}
                    {rol.editable && rol.usuarios === 0 && (
                      <BotonIcono
                        icono={Trash2}
                        etiqueta="Borrar"
                        variante="peligro"
                        tamano="sm"
                        onClick={() => borrar(rol)}
                      />
                    )}
                  </div>
                </div>

                <p className="flex items-center gap-1.5 text-xs text-texto-tenue">
                  <Users className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>
                    {rol.usuarios} usuario{rol.usuarios === 1 ? '' : 's'}
                    {rol.sistema && ' · Todos los permisos, no se puede modificar'}
                    {!rol.sistema &&
                      rol.nombre === sesion?.rol &&
                      ' · Es su rol, no puede modificarlo'}
                  </span>
                </p>

                {!rol.sistema && (
                  <div className="flex flex-wrap gap-1.5">
                    {rol.permisos.length === 0 && (
                      <span className="text-xs text-texto-tenue">Sin permisos</span>
                    )}
                    {rol.permisos.map((p) => (
                      <Insignia key={p}>{nombrePermiso(p)}</Insignia>
                    ))}
                  </div>
                )}
              </div>
            </Tarjeta>
          ))}
        </div>
      )}

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
