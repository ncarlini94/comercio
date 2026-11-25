import PropTypes from 'prop-types'
import { useState } from 'react'
import { Boton, Campo, CampoConEtiqueta, CasillaVerificacion, Modal } from '../../ui'

const SIN_PERMISO = 'No puede otorgar un permiso que usted no tiene'

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

  const guardar = async () => {
    setGuardando(true)
    setMensaje('')
    const respuesta = await onGuardar({ nombre, descripcion, permisos: [...permisos] })
    setGuardando(false)
    if (!respuesta.success) setMensaje(respuesta.message)
  }

  return (
    <Modal
      titulo={rol ? `Editar rol: ${rol.nombre}` : 'Nuevo rol'}
      tamano="xl"
      alCerrar={onCancelar}
      alEnviar={guardar}
      bloquearCierre={guardando}
      pie={
        <>
          {mensaje && (
            <p role="alert" className="me-auto self-center text-sm text-peligro-texto">
              {mensaje}
            </p>
          )}
          <Boton onClick={onCancelar} disabled={guardando}>
            Cancelar
          </Boton>
          <Boton variante="primario" type="submit" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar'}
          </Boton>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <CampoConEtiqueta etiqueta="Nombre" obligatorio>
            <Campo
              required
              maxLength={40}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </CampoConEtiqueta>
          <CampoConEtiqueta etiqueta="Descripción">
            <Campo value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </CampoConEtiqueta>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(secciones).map(([seccion, lista]) => {
            const todos = lista.every((p) => permisos.has(p.id))
            return (
              <fieldset key={seccion} className="space-y-2 rounded-lg border border-borde p-3">
                <legend className="flex items-center gap-3 px-1">
                  <span className="text-sm font-medium text-texto">{seccion}</span>
                  <Boton
                    variante="fantasma"
                    tamano="sm"
                    className="py-0.5"
                    onClick={() => alternarSeccion(lista, !todos)}
                  >
                    {todos ? 'Quitar todos' : 'Marcar todos'}
                  </Boton>
                </legend>
                {lista.map((permiso) => {
                  const disponible = permisosPropios.has(permiso.id)
                  return (
                    <div key={permiso.id} title={disponible ? undefined : SIN_PERMISO}>
                      <CasillaVerificacion
                        etiqueta={permiso.nombre}
                        checked={permisos.has(permiso.id)}
                        disabled={!disponible}
                        onChange={() => alternar(permiso.id)}
                      />
                    </div>
                  )
                })}
              </fieldset>
            )
          })}
        </div>
      </div>
    </Modal>
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
