import { useId } from 'react'
import PropTypes from 'prop-types'
import { unirClases } from '../../utils/clases'

// Casilla con su etiqueta al lado, ya vinculadas. Acepta las props de <input type="checkbox">
// (checked, onChange, disabled, name...). `descripcion` agrega un texto de ayuda debajo.
const CasillaVerificacion = ({ etiqueta, descripcion, id, className, ...resto }) => {
  const generado = useId()
  const idCasilla = id ?? generado
  const idDescripcion = descripcion ? `${idCasilla}-descripcion` : undefined

  return (
    <div className={unirClases('flex items-start gap-2', className)}>
      <input
        type="checkbox"
        id={idCasilla}
        aria-describedby={idDescripcion}
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-borde-fuerte accent-primario disabled:cursor-not-allowed disabled:opacity-50"
        {...resto}
      />
      <div className="text-sm">
        <label
          htmlFor={idCasilla}
          className={unirClases(
            'text-texto',
            resto.disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
          )}
        >
          {etiqueta}
        </label>
        {descripcion && (
          <p id={idDescripcion} className="text-xs text-texto-tenue">
            {descripcion}
          </p>
        )}
      </div>
    </div>
  )
}

CasillaVerificacion.propTypes = {
  etiqueta: PropTypes.node.isRequired,
  descripcion: PropTypes.node,
  id: PropTypes.string,
  className: PropTypes.string
}

export default CasillaVerificacion
