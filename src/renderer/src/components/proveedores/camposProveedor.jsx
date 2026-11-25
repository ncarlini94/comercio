import PropTypes from 'prop-types'
import { Campo, CampoConEtiqueta } from '../ui'

// Campos compartidos por los formularios de agregar y editar proveedor.
// `validar` pinta el borde según la validez nativa (clase .validar de index.css) y vuelve
// obligatorio el contacto, como en el alta.
const CamposProveedor = ({ formData, setFormData, mensaje, validar = false }) => {
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }
  const claseValidar = validar ? 'validar' : undefined

  return (
    <div className="space-y-4">
      <CampoConEtiqueta etiqueta="Nombre de la empresa" obligatorio>
        <Campo
          type="text"
          name="nombre"
          required
          value={formData.nombre}
          onChange={handleChange}
          className={claseValidar}
        />
      </CampoConEtiqueta>
      <CampoConEtiqueta etiqueta="Persona de contacto" obligatorio={validar}>
        <Campo
          type="text"
          name="contacto"
          required={validar}
          value={formData.contacto}
          onChange={handleChange}
          className={claseValidar}
        />
      </CampoConEtiqueta>
      <CampoConEtiqueta etiqueta="Mail">
        <Campo type="email" name="mail" value={formData.mail} onChange={handleChange} />
      </CampoConEtiqueta>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CampoConEtiqueta etiqueta="Teléfono">
          <Campo type="tel" name="telefono" value={formData.telefono} onChange={handleChange} />
        </CampoConEtiqueta>
        <CampoConEtiqueta etiqueta="Celular">
          <Campo type="tel" name="celular" value={formData.celular} onChange={handleChange} />
        </CampoConEtiqueta>
        <CampoConEtiqueta etiqueta="Celular 2">
          <Campo type="tel" name="celular2" value={formData.celular2} onChange={handleChange} />
        </CampoConEtiqueta>
      </div>
      <CampoConEtiqueta etiqueta="Dirección">
        <Campo type="text" name="direccion" value={formData.direccion} onChange={handleChange} />
      </CampoConEtiqueta>
      {mensaje && (
        <p className="text-sm text-peligro-texto" role="alert">
          {mensaje}
        </p>
      )}
    </div>
  )
}

CamposProveedor.propTypes = {
  formData: PropTypes.shape({
    nombre: PropTypes.string,
    contacto: PropTypes.string,
    mail: PropTypes.string,
    telefono: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    celular: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    celular2: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    direccion: PropTypes.string
  }).isRequired,
  setFormData: PropTypes.func.isRequired,
  mensaje: PropTypes.string,
  validar: PropTypes.bool
}

export default CamposProveedor
