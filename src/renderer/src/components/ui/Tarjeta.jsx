import PropTypes from 'prop-types'
import { unirClases } from '../../utils/clases'

// Superficie con borde. Con `titulo` muestra un encabezado (h2) y `acciones` a la derecha.
// `sinRelleno` quita el padding del contenido (por ejemplo, para una tabla que llega al borde).
// `desplazable`: la tarjeta ocupa el alto que le da su contenedor y su contenido se desplaza
// por dentro (el título queda fijo). Pensado para usar dentro de una <Pagina>.
const Tarjeta = ({
  titulo,
  descripcion,
  acciones,
  sinRelleno = false,
  desplazable = false,
  className,
  children
}) => (
  <section
    className={unirClases(
      'rounded-xl border border-borde bg-superficie shadow-sm',
      desplazable && 'flex min-h-64 flex-col',
      className
    )}
  >
    {(titulo || acciones) && (
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-borde px-5 py-4">
        <div className="min-w-0">
          {titulo && <h2 className="text-base font-semibold text-texto">{titulo}</h2>}
          {descripcion && <p className="mt-0.5 text-sm text-texto-secundario">{descripcion}</p>}
        </div>
        {acciones && <div className="flex shrink-0 items-center gap-2">{acciones}</div>}
      </header>
    )}
    <div
      className={unirClases(!sinRelleno && 'p-5', desplazable && 'min-h-0 flex-1 overflow-y-auto')}
    >
      {children}
    </div>
  </section>
)

Tarjeta.propTypes = {
  titulo: PropTypes.node,
  descripcion: PropTypes.node,
  acciones: PropTypes.node,
  sinRelleno: PropTypes.bool,
  desplazable: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node
}

export default Tarjeta
