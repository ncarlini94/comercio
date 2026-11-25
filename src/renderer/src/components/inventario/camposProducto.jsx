import PropTypes from 'prop-types'
import { AreaTexto, Campo, CampoConEtiqueta, Selector } from '../ui'

// Campos compartidos por los formularios de agregar y editar producto.
// `validar` pinta el borde según la validez nativa (clase .validar de index.css) y vuelve
// obligatorios el costo y el proveedor, como en el alta.
const CamposProducto = ({ formData, setFormData, proveedores, validar = false }) => {
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }
  const claseValidar = validar ? 'validar' : undefined

  return (
    <div className="space-y-4">
      <CampoConEtiqueta etiqueta="Nombre" obligatorio>
        <Campo
          type="text"
          name="nombre"
          required
          value={formData.nombre}
          onChange={handleChange}
          className={claseValidar}
        />
      </CampoConEtiqueta>
      <CampoConEtiqueta etiqueta="Descripción">
        <AreaTexto
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          rows={2}
        />
      </CampoConEtiqueta>
      <div className="grid grid-cols-2 gap-4">
        <CampoConEtiqueta etiqueta="Costo" obligatorio={validar}>
          <Campo
            type="text"
            name="costo"
            inputMode="decimal"
            required={validar}
            value={formData.costo}
            onChange={handleChange}
            className={claseValidar}
          />
        </CampoConEtiqueta>
        <CampoConEtiqueta etiqueta="Precio" obligatorio>
          <Campo
            type="number"
            name="precio"
            step="0.01"
            required
            value={formData.precio}
            onChange={handleChange}
            className={claseValidar}
          />
        </CampoConEtiqueta>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <CampoConEtiqueta etiqueta="Stock actual" obligatorio>
          <Campo
            type="number"
            name="stock"
            required
            value={formData.stock}
            onChange={handleChange}
            className={claseValidar}
          />
        </CampoConEtiqueta>
        <CampoConEtiqueta etiqueta="Stock mínimo" obligatorio>
          <Campo
            type="number"
            name="stock_minimo"
            required
            value={formData.stock_minimo}
            onChange={handleChange}
            className={claseValidar}
          />
        </CampoConEtiqueta>
      </div>
      <CampoConEtiqueta etiqueta="Proveedor" obligatorio={validar}>
        <Selector
          name="id_proveedor"
          required={validar}
          value={formData.id_proveedor}
          onChange={handleChange}
          className={claseValidar}
        >
          <option value="">Sin asignar</option>
          {proveedores.map((proveedor) => (
            <option key={proveedor.id_proveedores} value={proveedor.id_proveedores}>
              {proveedor.nombre}
            </option>
          ))}
        </Selector>
      </CampoConEtiqueta>
    </div>
  )
}

CamposProducto.propTypes = {
  formData: PropTypes.shape({
    nombre: PropTypes.string.isRequired,
    descripcion: PropTypes.string,
    costo: PropTypes.string,
    precio: PropTypes.string.isRequired,
    stock: PropTypes.string.isRequired,
    stock_minimo: PropTypes.string.isRequired,
    id_proveedor: PropTypes.string
  }).isRequired,
  setFormData: PropTypes.func.isRequired,
  proveedores: PropTypes.array.isRequired,
  validar: PropTypes.bool
}

export default CamposProducto
