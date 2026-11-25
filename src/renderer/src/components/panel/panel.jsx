import { DatabaseBackup, Download, Settings, Upload } from 'lucide-react'
import { useState } from 'react'
import PropTypes from 'prop-types'
import Importar from './importar/importar'
import Exportar from './exportar/exportar'
import Respaldo from './respaldo/respaldo'
import { usePermisos } from '../../sesion'
import { EncabezadoPagina, EstadoVacio } from '../ui'
import { CLASE_FOCO } from '../ui/estilos'
import { unirClases } from '../../utils/clases'

// Opciones de Configuración. Para sumar una nueva, agregar un elemento a esta lista
// con los permisos que la habilitan (alcanza con uno).
const OPCIONES = [
  {
    id: 'importar',
    label: 'Importar',
    descripcion: 'Cargar datos desde Excel',
    icon: Upload,
    componente: Importar,
    permisos: ['configuracion.importar']
  },
  {
    id: 'exportar',
    label: 'Exportar',
    descripcion: 'Descargar datos a Excel',
    icon: Download,
    componente: Exportar,
    permisos: ['configuracion.exportar']
  },
  {
    id: 'respaldo',
    label: 'Copia de seguridad',
    descripcion: 'Respaldar la base de datos',
    icon: DatabaseBackup,
    componente: Respaldo,
    permisos: ['configuracion.respaldos', 'configuracion.restaurar']
  }
]

// Ítem del menú interno, con el mismo estilo que el menú lateral principal.
const ItemOpcion = ({ opcion, activa, alElegir }) => {
  const { label, descripcion, icon: Icono } = opcion
  return (
    <button
      type="button"
      onClick={alElegir}
      aria-current={activa ? 'page' : undefined}
      className={unirClases(
        'flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition-colors',
        CLASE_FOCO,
        activa
          ? 'bg-primario-suave text-primario-texto'
          : 'text-texto-secundario hover:bg-superficie-alt hover:text-texto'
      )}
    >
      <Icono className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-texto-tenue">{descripcion}</span>
      </span>
    </button>
  )
}

ItemOpcion.propTypes = {
  opcion: PropTypes.shape({
    label: PropTypes.string.isRequired,
    descripcion: PropTypes.string,
    icon: PropTypes.elementType.isRequired
  }).isRequired,
  activa: PropTypes.bool,
  alElegir: PropTypes.func.isRequired
}

export default function PanelAdmin() {
  const { puedeAlguno } = usePermisos()
  const opciones = OPCIONES.filter((o) => puedeAlguno(o.permisos))
  const [opcionElegida, setOpcionActiva] = useState(null)
  const opcionActiva = opciones.some((o) => o.id === opcionElegida)
    ? opcionElegida
    : opciones[0]?.id
  const Contenido = opciones.find((o) => o.id === opcionActiva)?.componente

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        icono={Settings}
        titulo="Configuración"
        subtitulo="Importar, exportar y respaldar los datos del comercio"
      />

      {!Contenido ? (
        <EstadoVacio
          icono={Settings}
          titulo="No tiene opciones disponibles"
          descripcion="Su rol no tiene permisos para ninguna opción de configuración."
        />
      ) : (
        <div className="flex items-start gap-6">
          <nav
            aria-label="Opciones de configuración"
            className="w-60 shrink-0 space-y-1 rounded-xl border border-borde bg-superficie p-2 shadow-sm"
          >
            {opciones.map((opcion) => (
              <ItemOpcion
                key={opcion.id}
                opcion={opcion}
                activa={opcion.id === opcionActiva}
                alElegir={() => setOpcionActiva(opcion.id)}
              />
            ))}
          </nav>

          <section className="min-w-0 flex-1">
            <Contenido />
          </section>
        </div>
      )}
    </div>
  )
}
