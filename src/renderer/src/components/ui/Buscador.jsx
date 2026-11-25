import PropTypes from 'prop-types'
import { Search } from 'lucide-react'
import { unirClases } from '../../utils/clases'
import { CLASE_CONTROL } from './estilos'

// Campo de búsqueda con ícono. Acepta las props de <input> (value, onChange, placeholder...).
// `etiqueta` es el nombre accesible (por defecto "Buscar").
const Buscador = ({ etiqueta = 'Buscar', className, ...resto }) => (
  <div className={unirClases('relative w-full sm:max-w-xs', className)}>
    <Search
      className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-texto-tenue"
      aria-hidden="true"
    />
    <input
      type="search"
      aria-label={etiqueta}
      className={unirClases(CLASE_CONTROL, 'border-borde-fuerte pl-9')}
      {...resto}
    />
  </div>
)

Buscador.propTypes = {
  etiqueta: PropTypes.string,
  className: PropTypes.string
}

export default Buscador
