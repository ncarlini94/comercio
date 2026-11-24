import { CalendarClock, FolderOpen, Save } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import Restaurar from './restaurar'
import { usePermisos } from '../../../sesion'

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const ACTUALIZAR_CADA_MS = 60 * 1000

const formatearFecha = (iso) =>
  iso ? new Date(iso).toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' }) : null

const tarjeta =
  'bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 space-y-3'
const campo =
  'px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent'

function CopiasDeSeguridad() {
  const [estado, setEstado] = useState(null)
  const [programacion, setProgramacion] = useState(null)
  const [cargando, setCargando] = useState(null)
  const [mensaje, setMensaje] = useState(null)

  const cargarEstado = useCallback(async (reiniciarFormulario = false) => {
    const respuesta = await window.API.obtenerRespaldo()
    if (!respuesta.success) {
      setMensaje({ ok: false, texto: respuesta.message })
      return
    }
    setEstado(respuesta.estado)
    if (reiniciarFormulario) {
      const { activada, frecuencia, diaSemana, hora } = respuesta.estado
      setProgramacion({ activada, frecuencia, diaSemana, hora })
    }
  }, [])

  // Se refresca cada minuto para mostrar las copias programadas que se hagan con la pantalla abierta.
  useEffect(() => {
    cargarEstado(true)
    const intervalo = setInterval(() => cargarEstado(), ACTUALIZAR_CADA_MS)
    return () => clearInterval(intervalo)
  }, [cargarEstado])

  const ejecutar = async (accion, fn, textoExito) => {
    setCargando(accion)
    setMensaje(null)
    try {
      const respuesta = await fn()
      if (respuesta.canceled) return
      if (respuesta.estado) setEstado(respuesta.estado)
      setMensaje(
        respuesta.success
          ? { ok: true, texto: textoExito(respuesta) }
          : { ok: false, texto: respuesta.message }
      )
    } catch (error) {
      console.error('Error en copia de seguridad:', error)
      setMensaje({ ok: false, texto: 'Ocurrió un error inesperado' })
    } finally {
      setCargando(null)
    }
  }

  const elegirCarpeta = () =>
    ejecutar(
      'carpeta',
      () => window.API.elegirCarpetaRespaldo(),
      () => 'Carpeta actualizada'
    )

  const crearCopia = () =>
    ejecutar(
      'copia',
      () => window.API.crearRespaldo(),
      (r) => `Copia creada: ${r.archivo}`
    )

  const guardarProgramacion = (e) => {
    e.preventDefault()
    ejecutar(
      'programacion',
      () => window.API.guardarRespaldo(programacion),
      () => 'Programación guardada'
    )
  }

  const cambiar = (campoNombre, valor) =>
    setProgramacion((prev) => ({ ...prev, [campoNombre]: valor }))

  if (!estado || !programacion) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Cargando...</p>
  }

  const ocupado = cargando !== null

  return (
    <div className="space-y-4">
      {/* Carpeta y copia manual */}
      <div className={tarjeta}>
        <h2 className="font-semibold text-gray-900 dark:text-gray-100">Carpeta de destino</h2>
        <p className="text-sm break-all text-gray-700 dark:text-gray-300">
          {estado.carpeta || (
            <span className="text-gray-500 dark:text-gray-400">
              Todavía no se eligió una carpeta
            </span>
          )}
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={elegirCarpeta}
            disabled={ocupado}
            className="border border-blue-600 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-2 disabled:opacity-50"
          >
            <FolderOpen className="w-4 h-4" />
            {estado.carpeta ? 'Cambiar carpeta' : 'Elegir carpeta'}
          </button>
          <button
            onClick={crearCopia}
            disabled={ocupado || !estado.carpeta}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {cargando === 'copia' ? 'Creando copia...' : 'Crear copia ahora'}
          </button>
        </div>
      </div>

      {/* Programación */}
      <form onSubmit={guardarProgramacion} className={tarjeta}>
        <div className="flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Copia programada</h2>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={programacion.activada}
            onChange={(e) => cambiar('activada', e.target.checked)}
            className="w-4 h-4"
          />
          Hacer copias automáticas
        </label>

        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Frecuencia
            </label>
            <select
              value={programacion.frecuencia}
              onChange={(e) => cambiar('frecuencia', e.target.value)}
              disabled={!programacion.activada}
              className={campo}
            >
              <option value="diaria">Todos los días</option>
              <option value="semanal">Una vez por semana</option>
            </select>
          </div>
          {programacion.frecuencia === 'semanal' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Día
              </label>
              <select
                value={programacion.diaSemana}
                onChange={(e) => cambiar('diaSemana', Number(e.target.value))}
                disabled={!programacion.activada}
                className={campo}
              >
                {DIAS.map((dia, i) => (
                  <option key={dia} value={i}>
                    {dia}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hora
            </label>
            <input
              type="time"
              required
              value={programacion.hora}
              onChange={(e) => cambiar('hora', e.target.value)}
              disabled={!programacion.activada}
              className={campo}
            />
          </div>
          <button
            type="submit"
            disabled={ocupado}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {cargando === 'programacion' ? 'Guardando...' : 'Guardar programación'}
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Si el programa está cerrado a la hora indicada, la copia se hace automáticamente la
          próxima vez que se abra.
        </p>
      </form>

      {/* Estado */}
      <div className={tarjeta}>
        <h2 className="font-semibold text-gray-900 dark:text-gray-100">Estado</h2>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-gray-500 dark:text-gray-400">Última copia</dt>
          <dd className="text-gray-900 dark:text-gray-100">
            {formatearFecha(estado.ultimaCopia) ?? 'Nunca'}
            {estado.ultimoArchivo && (
              <span className="block text-xs break-all text-gray-500 dark:text-gray-400">
                {estado.ultimoArchivo}
              </span>
            )}
          </dd>
          <dt className="text-gray-500 dark:text-gray-400">Próxima copia</dt>
          <dd className="text-gray-900 dark:text-gray-100">
            {formatearFecha(estado.proximaCopia) ?? 'Sin programar'}
          </dd>
        </dl>
        {estado.ultimoError && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg p-3 text-sm">
            Falló la copia {estado.ultimoError.origen === 'programada' ? 'programada' : 'manual'}{' '}
            del {formatearFecha(estado.ultimoError.fecha)}: {estado.ultimoError.mensaje}
          </div>
        )}
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

// Cada parte se muestra según los permisos; el proceso principal también los valida.
export default function Respaldo() {
  const { puede } = usePermisos()
  return (
    <div className="space-y-4">
      {puede('configuracion.respaldos') && <CopiasDeSeguridad />}
      {puede('configuracion.restaurar') && <Restaurar />}
    </div>
  )
}
