import PropTypes from 'prop-types'
import { Boton, Campo, CampoConEtiqueta, Modal, Selector } from '../../ui'

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
    <Modal
      titulo="Nuevo usuario"
      alCerrar={onCancel}
      alEnviar={onSubmit}
      pie={
        <>
          <Boton onClick={onCancel}>Cancelar</Boton>
          <Boton variante="primario" type="submit">
            Crear usuario
          </Boton>
        </>
      }
    >
      <div className="space-y-4">
        <CampoConEtiqueta etiqueta="Usuario" obligatorio>
          <Campo name="usuario" required value={formData.usuario} onChange={handleChange} />
        </CampoConEtiqueta>
        <CampoConEtiqueta etiqueta="Mail" obligatorio>
          <Campo type="email" name="mail" required value={formData.mail} onChange={handleChange} />
        </CampoConEtiqueta>
        <CampoConEtiqueta etiqueta="Contraseña" obligatorio>
          <Campo
            type="password"
            name="password"
            required
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
          />
        </CampoConEtiqueta>
        <CampoConEtiqueta etiqueta="Rol" obligatorio>
          <Selector name="rol" required value={formData.rol} onChange={handleChange}>
            <option value="">Seleccione un rol</option>
            {rolesDisponibles.map((rol) => (
              <option key={rol} value={rol}>
                {rol}
              </option>
            ))}
          </Selector>
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
