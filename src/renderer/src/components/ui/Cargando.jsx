import PropTypes from 'prop-types'
import { LoaderCircle } from 'lucide-react'
import { unirClases } from '../../utils/clases'

// Indicador de carga para listas. Se muestra hasta que llegan los datos, así la pantalla no
// presenta por un instante el mensaje de lista vacía.
const Cargando = ({ texto = 'Cargando…', className }) => (
  <div
    role="status"
    className={unirClases(
      'flex items-center justify-center gap-2 px-6 py-12 text-sm text-texto-secundario',
      className
    )}
  >
    <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
    {texto}
  </div>
)

Cargando.propTypes = {
  texto: PropTypes.string,
  className: PropTypes.string
}

export default Cargando
