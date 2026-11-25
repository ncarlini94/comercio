import PropTypes from 'prop-types'
import { Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { unirClases } from '../../utils/clases'

const DIRECCIONES = {
  sube: { icono: TrendingUp, clase: 'text-exito-texto' },
  baja: { icono: TrendingDown, clase: 'text-peligro-texto' },
  neutra: { icono: Minus, clase: 'text-texto-tenue' }
}

// Métrica para mostrar arriba de las listas: etiqueta, valor y una tendencia opcional.
// direccion "sube" se pinta de verde, "baja" de rojo y "neutra" en gris.
const TarjetaMetrica = ({
  etiqueta,
  valor,
  icono: Icono,
  tendencia,
  direccion = 'neutra',
  className
}) => {
  const { icono: IconoTendencia, clase } = DIRECCIONES[direccion]
  return (
    <div
      className={unirClases(
        'rounded-xl border border-borde bg-superficie p-5 shadow-sm',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-texto-secundario">{etiqueta}</p>
        {Icono && <Icono className="h-5 w-5 text-texto-tenue" aria-hidden="true" />}
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-texto">{valor}</p>
      {tendencia && (
        <p className={unirClases('mt-1 flex items-center gap-1 text-xs font-medium', clase)}>
          <IconoTendencia className="h-3.5 w-3.5" aria-hidden="true" />
          {tendencia}
        </p>
      )}
    </div>
  )
}

TarjetaMetrica.propTypes = {
  etiqueta: PropTypes.node.isRequired,
  valor: PropTypes.node.isRequired,
  icono: PropTypes.elementType,
  tendencia: PropTypes.node,
  direccion: PropTypes.oneOf(['sube', 'baja', 'neutra']),
  className: PropTypes.string
}

export default TarjetaMetrica
