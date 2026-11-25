import PropTypes from 'prop-types'
import { Boton, Modal } from '../../ui'
import CamposProducto from '../camposProducto'

const EditarProducto = ({ loading, formData, setFormData, onSubmit, proveedores, resetForm }) => (
  <Modal
    titulo="Editar producto"
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
    <CamposProducto formData={formData} setFormData={setFormData} proveedores={proveedores} />
  </Modal>
)

EditarProducto.propTypes = {
  loading: PropTypes.bool.isRequired,
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  proveedores: PropTypes.array.isRequired,
  resetForm: PropTypes.func.isRequired
}

export default EditarProducto
