import { CalendarClock, FolderOpen, HardDrive, Save } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import Restaurar from './restaurar'
import Alerta from '../Alerta'
import TituloConIcono from '../TituloConIcono'
import { usePermisos } from '../../../sesion'
import {
  Boton,
  Campo,
  CampoConEtiqueta,
  CasillaVerificacion,
  Selector,
  Tarjeta,
  useAvisos
} from '../../ui'
import { formatearFecha } from '../../../utils/formato'

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const ACTUALIZAR_CADA_MS = 60 * 1000

function CopiasDeSeguridad() {
  const avisos = useAvisos()
  const [estado, setEstado] = useState(null)
  const [programacion, setProgramacion] = useState(null)
  const [cargando, setCargando] = useState(null)

  const cargarEstado = useCallback(
    async (reiniciarFormulario = false) => {
      const respuesta = await window.API.obtenerRespaldo()
      if (!respuesta.success) {
        // Solo se avisa en la carga inicial, para no repetir el aviso en cada actualización.
        if (reiniciarFormulario) {
          avisos.error('No se pudo leer la copia de seguridad', respuesta.message)
        } else {
          console.error('Error al actualizar la copia de seguridad:', respuesta.message)
        }
        return
      }
      setEstado(respuesta.estado)
      if (reiniciarFormulario) {
        const { activada, frecuencia, diaSemana, hora } = respuesta.estado
        setProgramacion({ activada, frecuencia, diaSemana, hora })
      }
    },
    [avisos]
  )

  // Se refresca cada minuto para mostrar las copias programadas que se hagan con la pantalla abierta.
  useEffect(() => {
    cargarEstado(true)
    const intervalo = setInterval(() => cargarEstado(), ACTUALIZAR_CADA_MS)
    return () => clearInterval(intervalo)
  }, [cargarEstado])

  const ejecutar = async (accion, fn, textoExito) => {
    setCargando(accion)
    try {
      const respuesta = await fn()
      if (respuesta.canceled) return
      if (respuesta.estado) setEstado(respuesta.estado)
      if (respuesta.success) avisos.exito(...textoExito(respuesta))
      else avisos.error('No se pudo completar la acción', respuesta.message)
    } catch (error) {
      console.error('Error en copia de seguridad:', error)
      avisos.error('Ocurrió un error inesperado')
    } finally {
      setCargando(null)
    }
  }

  const elegirCarpeta = () =>
    ejecutar(
      'carpeta',
      () => window.API.elegirCarpetaRespaldo(),
      () => ['Carpeta actualizada']
    )

  const crearCopia = () =>
    ejecutar(
      'copia',
      () => window.API.crearRespaldo(),
      (r) => ['Copia creada', r.archivo]
    )

  const guardarProgramacion = (e) => {
    e.preventDefault()
    ejecutar(
      'programacion',
      () => window.API.guardarRespaldo(programacion),
      () => ['Programación guardada']
    )
  }

  const cambiar = (campoNombre, valor) =>
    setProgramacion((prev) => ({ ...prev, [campoNombre]: valor }))

  if (!estado || !programacion) {
    return <p className="text-sm text-texto-tenue">Cargando...</p>
  }

  const ocupado = cargando !== null
  const desactivada = !programacion.activada

  return (
    <div className="space-y-4">
      {/* Carpeta y copia manual */}
      <Tarjeta
        titulo={<TituloConIcono icono={FolderOpen}>Carpeta de destino</TituloConIcono>}
        acciones={
          <>
            <Boton icono={FolderOpen} onClick={elegirCarpeta} disabled={ocupado}>
              {estado.carpeta ? 'Cambiar carpeta' : 'Elegir carpeta'}
            </Boton>
            <Boton
              variante="primario"
              icono={Save}
              onClick={crearCopia}
              disabled={ocupado || !estado.carpeta}
            >
              {cargando === 'copia' ? 'Creando copia...' : 'Crear copia ahora'}
            </Boton>
          </>
        }
      >
        <p className="text-sm break-all text-texto">
          {estado.carpeta || (
            <span className="text-texto-tenue">Todavía no se eligió una carpeta</span>
          )}
        </p>
      </Tarjeta>

      {/* Programación */}
      <Tarjeta
        titulo={<TituloConIcono icono={CalendarClock}>Copia programada</TituloConIcono>}
        descripcion="Si el programa está cerrado a la hora indicada, la copia se hace automáticamente la próxima vez que se abra."
      >
        <form onSubmit={guardarProgramacion} className="space-y-4">
          <CasillaVerificacion
            etiqueta="Hacer copias automáticas"
            checked={programacion.activada}
            onChange={(e) => cambiar('activada', e.target.checked)}
          />

          <div className="flex flex-wrap items-end gap-4">
            <CampoConEtiqueta etiqueta="Frecuencia" className="w-52">
              <Selector
                value={programacion.frecuencia}
                onChange={(e) => cambiar('frecuencia', e.target.value)}
                disabled={desactivada}
              >
                <option value="diaria">Todos los días</option>
                <option value="semanal">Una vez por semana</option>
              </Selector>
            </CampoConEtiqueta>
            {programacion.frecuencia === 'semanal' && (
              <CampoConEtiqueta etiqueta="Día" className="w-44">
                <Selector
                  value={programacion.diaSemana}
                  onChange={(e) => cambiar('diaSemana', Number(e.target.value))}
                  disabled={desactivada}
                >
                  {DIAS.map((dia, i) => (
                    <option key={dia} value={i}>
                      {dia}
                    </option>
                  ))}
                </Selector>
              </CampoConEtiqueta>
            )}
            <CampoConEtiqueta etiqueta="Hora" className="w-36">
              <Campo
                type="time"
                required
                value={programacion.hora}
                onChange={(e) => cambiar('hora', e.target.value)}
                disabled={desactivada}
              />
            </CampoConEtiqueta>
            <Boton type="submit" disabled={ocupado}>
              {cargando === 'programacion' ? 'Guardando...' : 'Guardar programación'}
            </Boton>
          </div>
        </form>
      </Tarjeta>

      {/* Estado */}
      <Tarjeta titulo={<TituloConIcono icono={HardDrive}>Estado</TituloConIcono>}>
        <div className="space-y-4">
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
            <dt className="text-texto-secundario">Última copia</dt>
            <dd className="text-texto">
              {formatearFecha(estado.ultimaCopia) || 'Nunca'}
              {estado.ultimoArchivo && (
                <span className="block text-xs break-all text-texto-tenue">
                  {estado.ultimoArchivo}
                </span>
              )}
            </dd>
            <dt className="text-texto-secundario">Próxima copia</dt>
            <dd className="text-texto">{formatearFecha(estado.proximaCopia) || 'Sin programar'}</dd>
          </dl>
          {estado.ultimoError && (
            <Alerta>
              Falló la copia {estado.ultimoError.origen === 'programada' ? 'programada' : 'manual'}{' '}
              ({formatearFecha(estado.ultimoError.fecha)}): {estado.ultimoError.mensaje}
            </Alerta>
          )}
        </div>
      </Tarjeta>
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
