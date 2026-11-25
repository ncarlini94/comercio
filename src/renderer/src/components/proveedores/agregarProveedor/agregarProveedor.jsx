import PropTypes from 'prop-types'
import { Boton, Modal } from '../../ui'
import CamposProveedor from '../camposProveedor'

const AgregarProveedor = ({ onSubmit, formData, setFormData, mensaje, resetForm, loading }) => (
  <Modal
    titulo="Agregar proveedor"
    alCerrar={resetForm}
    alEnviar={onSubmit}
    bloquearCierre={loading}
    pie={
      <>
        <Boton onClick={resetForm} disabled={loading}>
          Cancelar
        </Boton>
        <Boton variante="primario" type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Agregar'}
        </Boton>
      </>
    }
  >
    <CamposProveedor formData={formData} setFormData={setFormData} mensaje={mensaje} validar />
  </Modal>
)

AgregarProveedor.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  mensaje: PropTypes.string,
  resetForm: PropTypes.func.isRequired,
  loading: PropTypes.bool
}

export default AgregarProveedor
