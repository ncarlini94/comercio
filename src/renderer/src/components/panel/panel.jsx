import { DatabaseBackup, Download, Settings, Upload } from 'lucide-react'
import { useState } from 'react'
import Importar from './importar/importar'
import Exportar from './exportar/exportar'
import Respaldo from './respaldo/respaldo'

// Opciones de Configuración. Para sumar una nueva, agregar un elemento a esta lista.
const OPCIONES = [
  {
    id: 'importar',
    label: 'Importar',
    descripcion: 'Cargar datos desde Excel',
    icon: Upload,
    componente: Importar
  },
  {
    id: 'exportar',
    label: 'Exportar',
    descripcion: 'Descargar datos a Excel',
    icon: Download,
    componente: Exportar
  },
  {
    id: 'respaldo',
    label: 'Copia de seguridad',
    descripcion: 'Respaldar la base de datos',
    icon: DatabaseBackup,
    componente: Respaldo
  }
]

export default function PanelAdmin() {
  const [opcionActiva, setOpcionActiva] = useState(OPCIONES[0].id)
  const { componente: Contenido } = OPCIONES.find((o) => o.id === opcionActiva)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 ps-4 pt-2">
        <Settings />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Configuración</h1>
      </div>

      <div className="flex gap-6 items-start">
        <nav className="w-56 shrink-0 bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-2 space-y-1 dark:border-gray-700">
          {OPCIONES.map(({ id, label, descripcion, icon: Icon }) => {
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
