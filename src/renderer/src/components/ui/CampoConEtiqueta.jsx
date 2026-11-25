import { Children, cloneElement, isValidElement, useId } from 'react'
import PropTypes from 'prop-types'
import { unirClases } from '../../utils/clases'

// Etiqueta + control + texto de ayuda o error. Vincula la etiqueta con el control (useId),
// así getByLabel('Mail') y los lectores de pantalla lo encuentran. El hijo debe ser un solo
// control (Campo, Selector, AreaTexto o un elemento nativo). Si el control ya trae id, se respeta.
const CampoConEtiqueta = ({ etiqueta, ayuda, error, obligatorio = false, children, className }) => {
  const generado = useId()
  const control = Children.only(children)
  const idControl = (isValidElement(control) && control.props.id) || generado
  const idAyuda = `${idControl}-ayuda`
  const texto = error || ayuda

  return (
    <div className={unirClases('space-y-1.5', className)}>
      <label htmlFor={idControl} className="block text-sm font-medium text-texto-secundario">
        {etiqueta}
        {obligatorio && (
          <span className="ms-0.5 text-peligro-texto" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {cloneElement(control, {
        id: idControl,
        'aria-describedby': texto ? idAyuda : control.props['aria-describedby'],
        ...(error ? { 'aria-invalid': true } : {})
      })}
      {texto && (
        <p
          id={idAyuda}
          className={unirClases('text-xs', error ? 'text-peligro-texto' : 'text-texto-tenue')}
        >
          {texto}
        </p>
      )}
    </div>
  )
}

CampoConEtiqueta.propTypes = {
  etiqueta: PropTypes.node.isRequired,
  ayuda: PropTypes.node,
  error: PropTypes.node,
  obligatorio: PropTypes.bool,
  children: PropTypes.element.isRequired,
  className: PropTypes.string
}

export default CampoConEtiqueta
