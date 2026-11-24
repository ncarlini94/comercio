import { AlertTriangle, History } from 'lucide-react'
import { useEffect, useState } from 'react'

const ETIQUETAS = {
  usuarios: 'Usuarios',
  productos: 'Productos',
  proveedores: 'Proveedores',
  ventas: 'Ventas',
  pedidos: 'Pedidos'
}

const formatearTamanio = (bytes) =>
  bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`

const formatearFecha = (iso) =>
  new Date(iso).toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' })

export default function Restaurar() {
  const [analisis, setAnalisis] = useState(null)
  const [confirmado, setConfirmado] = useState(false)
  const [cargando, setCargando] = useState(null)
  const [mensaje, setMensaje] = useState(null)
  // Cuando la base ya se cerró, se tapa la pantalla hasta que el programa se reinicie.
  const [reinicio, setReinicio] = useState(null)

  // Si se sale de la pantalla con una copia analizada, se descarta.
  useEffect(() => () => window.API.cancelarRestauracion(), [])

  const elegirCopia = async () => {
    setCargando('analisis')
    setMensaje(null)
    setAnalisis(null)
    setConfirmado(false)
    try {
      const respuesta = await window.API.elegirRespaldoParaRestaurar()
      if (respuesta.canceled) return
      if (respuesta.success) setAnalisis(respuesta.info)
      else setMensaje({ ok: false, texto: respuesta.message })
    } catch (error) {
      console.error('Error al analizar la copia:', error)
      setMensaje({ ok: false, texto: 'Error al leer la copia' })
    } finally {
      setCargando(null)
    }
  }

  const cancelar = async () => {
    await window.API.cancelarRestauracion()
    setAnalisis(null)
    setConfirmado(false)
  }

  const restaurar = async () => {
    setCargando('restaurar')
    setMensaje(null)
    try {
      const respuesta = await window.API.restaurarRespaldo()
      if (respuesta.success) {
        setAnalisis(null)
        setReinicio({
          ok: true,
          texto: `Copia restaurada. Los datos anteriores se guardaron en ${respuesta.copiaPrevia}.`
        })
        return
      }
      if (respuesta.reinicia) {
        setReinicio({ ok: false, texto: respuesta.message })
        return
      }
      if (respuesta.requiereElegir) {
        setAnalisis(null)
        setConfirmado(false)
      }
      setMensaje({ ok: false, texto: respuesta.message })
      setCargando(null)
    } catch (error) {
      console.error('Error al restaurar:', error)
      setMensaje({ ok: false, texto: 'Error al restaurar la copia' })
      setCargando(null)
    }
  }

  if (reinicio) {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md space-y-2 text-center">
          <p
            className={`font-semibold ${reinicio.ok ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}
          >
            {reinicio.ok ? 'Restauración completada' : 'No se pudo restaurar'}
          </p>
          <p className="text-sm break-all text-gray-700 dark:text-gray-300">{reinicio.texto}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Reiniciando el programa...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <History className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        <h2 className="font-semibold text-gray-900 dark:text-gray-100">Restaurar una copia</h2>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Reemplaza todos los datos actuales por los de una copia de seguridad. Antes de hacerlo se
        guarda automáticamente una copia de los datos actuales.
      </p>

      {!analisis && (
        <button
          onClick={elegirCopia}
          disabled={cargando !== null}
          className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          {cargando === 'analisis' ? 'Revisando copia...' : 'Elegir copia para restaurar'}
        </button>
      )}

      {analisis && (
        <div className="space-y-3">
          <div className="text-sm space-y-1">
            <p className="break-all text-gray-900 dark:text-gray-100">{analisis.archivo}</p>
            <p className="text-gray-500 dark:text-gray-400">
              {formatearFecha(analisis.fechaArchivo)} · {formatearTamanio(analisis.tamanio)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(analisis.conteos).map(([clave, total]) => (
              <span
                key={clave}
                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
              >
                {ETIQUETAS[clave] ?? clave}: {total}
              </span>
            ))}
          </div>

          <div className="flex gap-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg p-3 text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p>
              Todos los datos actuales (ventas, inventario, proveedores, pedidos y usuarios) se van
              a reemplazar por los de esta copia. Lo que se haya cargado después de la fecha de la
              copia se pierde, salvo en la copia de los datos actuales que se crea antes de
              restaurar. El programa se reinicia y hay que volver a iniciar sesión.
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={confirmado}
              onChange={(e) => setConfirmado(e.target.checked)}
              disabled={cargando !== null}
              className="w-4 h-4"
            />
            Entiendo que se van a reemplazar los datos actuales
          </label>

          <div className="flex gap-3">
            <button
              onClick={cancelar}
              disabled={cargando !== null}
              className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={restaurar}
              disabled={!confirmado || cargando !== null}
              className="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              {cargando === 'restaurar' ? 'Restaurando...' : 'Restaurar y reiniciar'}
            </button>
          </div>
        </div>
      )}

      {mensaje && (
        <p
          className={`text-sm ${mensaje.ok ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}
        >
          {mensaje.texto}
        </p>
      )}
    </div>
  )
}
