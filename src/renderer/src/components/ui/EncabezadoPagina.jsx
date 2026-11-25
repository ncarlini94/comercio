import PropTypes from 'prop-types'

// Encabezado de cada pantalla: ícono, título (h1), subtítulo y acciones a la derecha.
const EncabezadoPagina = ({ icono: Icono, titulo, subtitulo, acciones }) => (
  <header className="flex flex-wrap items-center justify-between gap-4">
    <div className="flex min-w-0 items-center gap-3">
      {Icono && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primario-suave text-primario-texto">
          <Icono className="h-5 w-5" aria-hidden="true" />
        </span>
      )}
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold text-texto">{titulo}</h1>
        {subtitulo && <p className="text-sm text-texto-secundario">{subtitulo}</p>}
      </div>
    </div>
    {acciones && <div className="flex flex-wrap items-center gap-2">{acciones}</div>}
  </header>
)

EncabezadoPagina.propTypes = {
  icono: PropTypes.elementType,
  titulo: PropTypes.node.isRequired,
  subtitulo: PropTypes.node,
  acciones: PropTypes.node
}

export default EncabezadoPagina
