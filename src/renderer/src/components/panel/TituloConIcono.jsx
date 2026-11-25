import PropTypes from 'prop-types'

// Título de tarjeta con un ícono a la izquierda (para el `titulo` de Tarjeta).
const TituloConIcono = ({ icono: Icono, children }) => (
  <span className="flex items-center gap-2">
    <Icono className="h-5 w-5 text-texto-tenue" aria-hidden="true" />
    {children}
  </span>
)

TituloConIcono.propTypes = { icono: PropTypes.elementType.isRequired, children: PropTypes.node }

export default TituloConIcono
