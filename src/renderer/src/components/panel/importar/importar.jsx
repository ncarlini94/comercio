import { Package, Truck, Upload } from 'lucide-react'
import { useState } from 'react'
import PropTypes from 'prop-types'

const SECCIONES = [
  {
    id: 'inventario',
    label: 'Inventario',
    icon: Package,
    columnas: ['nombre', 'descripcion', 'costo', 'precio', 'stock', 'stock_minimo', 'id_proveedor'],
    nota: 'El id_proveedor debe existir. Los productos con un nombre ya cargado se omiten.'
  },
  {
    id: 'proveedores',
    label: 'Proveedores',
    icon: Truck,
    columnas: ['nombre', 'contacto', 'mail', 'telefono', 'celular', 'celular2', 'direccion'],
    nota: 'Los proveedores con el mismo nombre y mail que uno ya cargado se omiten.'
  }
]

const MAX_ERRORES_VISIBLES = 50

export default function Importar() {
  const [cargando, setCargando] = useState(null)
  const [resultado, setResultado] = useState(null)

  const handleImportar = async (seccion) => {
    setCargando(seccion.id)
    setResultado(null)
    try {
      const respuesta = await window.API.importar(seccion.id)
      if (respuesta.canceled) return
      setResultado({ seccion: seccion.label, ...respuesta })
    } catch (error) {
      console.error('Error al importar:', error)
      setResultado({ seccion: seccion.label, success: false, message: 'Error al importar' })
    } finally {
      setCargando(null)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Seleccione un archivo Excel (.xlsx). La primera fila debe tener los nombres de las columnas.
        Para obtener un archivo de ejemplo, exporte la sección desde &quot;Exportar&quot;.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {SECCIONES.map((seccion) => {
          const Icon = seccion.icon
          return (
            <div
              key={seccion.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4 space-y-3 dark:border-gray-700"
            >
              <div className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">{seccion.label}</h2>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Columnas requeridas
                </p>
                <div className="flex flex-wrap gap-1">
                  {seccion.columnas.map((columna) => (
                    <code
                      key={columna}
                      className="text-xs bg-gray-100 dark:bg-gray-900 px-1.5 py-0.5 rounded"
                    >
                      {columna}
                    </code>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{seccion.nota}</p>
              <button
                onClick={() => handleImportar(seccion)}
                disabled={cargando !== null}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {cargando === seccion.id ? 'Importando...' : 'Seleccionar archivo'}
              </button>
            </div>
          )
        })}
      </div>

      {resultado && <ResultadoImportacion resultado={resultado} />}
    </div>
  )
}

function ResultadoImportacion({ resultado }) {
  if (!resultado.success) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg p-4 text-sm">
        {resultado.seccion}: {resultado.message}
      </div>
    )
  }

  const { errores = [] } = resultado
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4 space-y-3 dark:border-gray-700">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
        Resultado: {resultado.seccion}
      </h3>
      <div className="flex flex-wrap gap-4 text-sm">
        <span className="text-green-700 dark:text-green-300">
          {resultado.insertados} importados
        </span>
        <span className="text-gray-600 dark:text-gray-400">{resultado.duplicados} ya existían</span>
        <span
          className={
            errores.length > 0
              ? 'text-red-600 dark:text-red-400'
              : 'text-gray-600 dark:text-gray-400'
          }
        >
          {errores.length} con errores
        </span>
      </div>
      {errores.length > 0 && (
        <div className="max-h-64 overflow-y-auto border rounded dark:border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Fila
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Problema
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {errores.slice(0, MAX_ERRORES_VISIBLES).map(({ fila, mensaje }) => (
                <tr key={fila}>
                  <td className="px-3 py-1.5 text-gray-700 dark:text-gray-300">{fila}</td>
                  <td className="px-3 py-1.5 text-gray-600 dark:text-gray-400">{mensaje}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {errores.length > MAX_ERRORES_VISIBLES && (
            <p className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
              Se muestran los primeros {MAX_ERRORES_VISIBLES} errores de {errores.length}.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

ResultadoImportacion.propTypes = {
  resultado: PropTypes.shape({
    seccion: PropTypes.string.isRequired,
    success: PropTypes.bool,
    message: PropTypes.string,
    insertados: PropTypes.number,
    duplicados: PropTypes.number,
    errores: PropTypes.arrayOf(
      PropTypes.shape({ fila: PropTypes.number, mensaje: PropTypes.string })
    )
  }).isRequired
}
