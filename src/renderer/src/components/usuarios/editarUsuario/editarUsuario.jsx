import PropTypes from 'prop-types'
import { useState } from 'react'
import { Boton, Campo, CampoConEtiqueta, Modal, Selector } from '../../ui'

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

  const guardar = async () => {
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
    <Modal
      titulo={`Editar usuario${esUnoMismo ? ' (usted)' : ''}`}
      alCerrar={onCancelar}
      alEnviar={guardar}
      bloquearCierre={guardando}
      pie={
        <>
          <Boton onClick={onCancelar} disabled={guardando}>
            Cancelar
          </Boton>
          <Boton variante="primario" type="submit" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar'}
          </Boton>
        </>
      }
    >
      <div className="space-y-4">
        <CampoConEtiqueta etiqueta="Usuario" obligatorio>
          <Campo name="usuario" required value={datos.usuario} onChange={cambiar} />
        </CampoConEtiqueta>
        <CampoConEtiqueta etiqueta="Mail" obligatorio>
          <Campo type="email" name="mail" required value={datos.mail} onChange={cambiar} />
        </CampoConEtiqueta>
        <div className="grid grid-cols-2 gap-4">
          <CampoConEtiqueta etiqueta="Rol">
            <Selector name="rol" value={datos.rol} onChange={cambiar} disabled={esUnoMismo}>
              {opcionesRol.map((rol) => (
                <option key={rol} value={rol}>
                  {rol}
                </option>
              ))}
            </Selector>
          </CampoConEtiqueta>
          <CampoConEtiqueta etiqueta="Estado">
            <Selector name="estado" value={datos.estado} onChange={cambiar} disabled={esUnoMismo}>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </Selector>
          </CampoConEtiqueta>
        </div>
        {esUnoMismo && (
          <p className="text-xs text-texto-tenue">No puede cambiar su propio rol ni su estado.</p>
        )}
        <CampoConEtiqueta etiqueta="Nueva contraseña">
          <Campo
            type="password"
            name="password"
            value={datos.password}
            onChange={cambiar}
            placeholder="Dejar vacío para no cambiarla"
            maxLength={72}
            autoComplete="new-password"
          />
        </CampoConEtiqueta>
        {mensaje && (
          <p role="alert" className="text-sm text-peligro-texto">
            {mensaje}
          </p>
        )}
      </div>
    </Modal>
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
