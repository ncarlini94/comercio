import { DatabaseBackup, Download, Settings, Upload } from 'lucide-react'
import { useState } from 'react'
import Importar from './importar/importar'
import Exportar from './exportar/exportar'
import Respaldo from './respaldo/respaldo'
import { usePermisos } from '../../sesion'

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

export default function PanelAdmin() {
  const { puedeAlguno } = usePermisos()
  const opciones = OPCIONES.filter((o) => puedeAlguno(o.permisos))
  const [opcionElegida, setOpcionActiva] = useState(null)
  const opcionActiva = opciones.some((o) => o.id === opcionElegida)
    ? opcionElegida
    : opciones[0]?.id
  const Contenido = opciones.find((o) => o.id === opcionActiva)?.componente

  if (!Contenido) {
    return <p className="p-6 text-gray-600 dark:text-gray-400">No tiene opciones disponibles.</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 ps-4 pt-2">
        <Settings />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Configuración</h1>
      </div>

      <div className="flex gap-6 items-start">
        <nav className="w-56 shrink-0 bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-2 space-y-1 dark:border-gray-700">
          {opciones.map(({ id, label, descripcion, icon: Icon }) => {
            const activa = id === opcionActiva
            return (
              <button
                key={id}
                onClick={() => setOpcionActiva(id)}
                className={`w-full flex items-start gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                  activa
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5 mt-0.5 shrink-0" />
                <span>
                  <span className="block font-medium">{label}</span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">
                    {descripcion}
                  </span>
                </span>
              </button>
            )
          })}
        </nav>

        <section className="flex-1 min-w-0">
          <Contenido />
        </section>
      </div>
    </div>
  )
}
