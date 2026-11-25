import PropTypes from 'prop-types'
import { Boton, Modal } from '../../ui'
import CamposProducto from '../camposProducto'

const AgregarProducto = ({ loading, formData, setFormData, onSubmit, proveedores, resetForm }) => (
  <Modal
    titulo="Agregar producto"
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
    <CamposProducto
      formData={formData}
      setFormData={setFormData}
      proveedores={proveedores}
      validar
    />
  </Modal>
)

AgregarProducto.propTypes = {
  loading: PropTypes.bool.isRequired,
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  proveedores: PropTypes.arrayOf(
    PropTypes.shape({
      id_proveedores: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      nombre: PropTypes.string.isRequired
    })
  ).isRequired,
  resetForm: PropTypes.func.isRequired
}

export default AgregarProducto
