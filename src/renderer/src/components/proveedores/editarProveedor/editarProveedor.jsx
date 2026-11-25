import PropTypes from 'prop-types'
import { Boton, Modal } from '../../ui'
import CamposProveedor from '../camposProveedor'

const EditarProveedor = ({ onSubmit, formData, setFormData, mensaje, resetForm, loading }) => (
  <Modal
    titulo="Editar proveedor"
    alCerrar={resetForm}
    alEnviar={onSubmit}
    bloquearCierre={loading}
    pie={
      <>
        <Boton onClick={resetForm} disabled={loading}>
          Cancelar
        </Boton>
        <Boton variante="primario" type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </Boton>
      </>
    }
  >
    <CamposProveedor formData={formData} setFormData={setFormData} mensaje={mensaje} />
  </Modal>
)

EditarProveedor.propTypes = {
  loading: PropTypes.bool,
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  mensaje: PropTypes.string,
  resetForm: PropTypes.func.isRequired
}

export default EditarProveedor
