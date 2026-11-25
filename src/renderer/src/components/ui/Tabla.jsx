import PropTypes from 'prop-types'
import { unirClases } from '../../utils/clases'

const ALINEACIONES = { izquierda: 'text-left', centro: 'text-center', derecha: 'text-right' }

// Tabla con borde y desplazamiento horizontal. Estructura:
// <Tabla>
//   <TablaEncabezado><TablaCelda encabezado>Fecha</TablaCelda>...</TablaEncabezado>
//   <TablaCuerpo><TablaFila><TablaCelda>...</TablaCelda></TablaFila></TablaCuerpo>
// </Tabla>
// Encabezados y celdas comparten el mismo padding, así quedan alineados.
// `desplazable`: dentro de una <Pagina>, la tabla ocupa el alto que queda en la ventana y se
// desplaza por dentro, con los títulos de columna siempre visibles. Tiene un alto mínimo para
// que en ventanas chicas siga siendo usable (ahí se desplaza la página).
export const Tabla = ({ desplazable = false, className, children, ...resto }) => (
  <div
    className={unirClases(
      'rounded-xl border border-borde bg-superficie shadow-sm',
      desplazable ? 'min-h-64 flex-1 overflow-auto' : 'overflow-x-auto',
      className
    )}
  >
    <table className="w-full border-collapse text-sm" {...resto}>
      {children}
    </table>
  </div>
)

Tabla.propTypes = {
  desplazable: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node
}

// Fila de títulos: sus hijos son <TablaCelda encabezado>. Queda fija arriba al desplazar
// (la línea inferior es una sombra porque el borde de un encabezado fijo no se dibuja).
export const TablaEncabezado = ({ children }) => (
  <thead className="sticky top-0 z-10 bg-superficie-alt shadow-[0_1px_0_var(--borde)]">
    <tr>{children}</tr>
  </thead>
)

TablaEncabezado.propTypes = { children: PropTypes.node }

export const TablaCuerpo = ({ children }) => (
  <tbody className="divide-y divide-borde">{children}</tbody>
)

TablaCuerpo.propTypes = { children: PropTypes.node }

// Acepta las props de <tr> (onClick...). `seleccionada` resalta la fila.
export const TablaFila = ({ seleccionada = false, className, children, ...resto }) => (
  <tr
    className={unirClases(
      'transition-colors hover:bg-superficie-alt',
      seleccionada && 'bg-primario-suave',
      resto.onClick && 'cursor-pointer',
      className
    )}
    {...resto}
  >
    {children}
  </tr>
)

TablaFila.propTypes = {
  seleccionada: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node
}

// Celda (td) o título de columna (th con `encabezado`). Usar alinear="derecha" para montos y cantidades.
export const TablaCelda = ({
  encabezado = false,
  alinear = 'izquierda',
  className,
  children,
  ...resto
}) => {
  const Etiqueta = encabezado ? 'th' : 'td'
  return (
    <Etiqueta
      scope={encabezado ? 'col' : undefined}
      className={unirClases(
        'px-4 py-3 align-middle',
        ALINEACIONES[alinear],
        alinear === 'derecha' && 'tabular-nums',
        encabezado ? 'text-xs font-semibold whitespace-nowrap text-texto-secundario' : 'text-texto',
        className
      )}
      {...resto}
    >
      {children}
    </Etiqueta>
  )
}

TablaCelda.propTypes = {
  encabezado: PropTypes.bool,
  alinear: PropTypes.oneOf(['izquierda', 'centro', 'derecha']),
  className: PropTypes.string,
  children: PropTypes.node
}
