import { Download, FileText, Package, ShoppingCart, Truck, Users } from 'lucide-react'
import { useState } from 'react'

const SECCIONES = [
  { id: 'inventario', label: 'Inventario', icon: Package },
  { id: 'proveedores', label: 'Proveedores', icon: Truck },
  { id: 'ventas', label: 'Ventas', icon: ShoppingCart, nota: 'Incluye el detalle de productos' },
  { id: 'pedidos', label: 'Pedidos', icon: FileText, nota: 'Incluye el detalle de productos' },
  { id: 'usuarios', label: 'Usuarios', icon: Users, nota: 'Sin contraseñas' }
]

export default function Exportar() {
  const [cargando, setCargando] = useState(null)
  const [mensaje, setMensaje] = useState(null)

  const handleExportar = async (id, label) => {
    setCargando(id)
    setMensaje(null)
    try {
      const respuesta = await window.API.exportar(id)
      if (respuesta.canceled) return
      setMensaje(
        respuesta.success
          ? {
              ok: true,
              texto: `${label}: ${respuesta.registros} registros exportados en ${respuesta.filePath}`
            }
          : { ok: false, texto: `${label}: ${respuesta.message}` }
      )
    } catch (error) {
      console.error('Error al exportar:', error)
      setMensaje({ ok: false, texto: `${label}: Error al exportar` })
    } finally {
      setCargando(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4 flex items-center justify-between gap-4 dark:border-gray-700">
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Exportar todo</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Un solo archivo Excel con una hoja por sección.
          </p>
        </div>
        <button
          onClick={() => handleExportar('todo', 'Todo')}
          disabled={cargando !== null}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 shrink-0"
        >
          <Download className="w-4 h-4" />
          {cargando === 'todo' ? 'Exportando...' : 'Exportar todo'}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {SECCIONES.map(({ id, label, icon: Icon, nota }) => (
          <div
            key={id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4 flex flex-col gap-3 dark:border-gray-700"
          >
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">{label}</h2>
            </div>
            {nota && <p className="text-xs text-gray-500 dark:text-gray-400">{nota}</p>}
            <button
              onClick={() => handleExportar(id, label)}
              disabled={cargando !== null}
              className="mt-auto border border-blue-600 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {cargando === id ? 'Exportando...' : 'Exportar'}
            </button>
          </div>
        ))}
      </div>

      {mensaje && (
        <div
          className={`rounded-lg p-4 text-sm border ${
            mensaje.ok
              ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
          }`}
        >
          {mensaje.texto}
        </div>
      )}
    </div>
  )
}
