import { CheckCircle2, History, Loader2, RotateCcw, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import Alerta from '../Alerta'
import TituloConIcono from '../TituloConIcono'
import { Boton, CasillaVerificacion, Insignia, Tarjeta, useAvisos } from '../../ui'
import { formatearFecha, formatearNumero } from '../../../utils/formato'

const ETIQUETAS = {
  usuarios: 'Usuarios',
  productos: 'Productos',
  proveedores: 'Proveedores',
  ventas: 'Ventas',
  pedidos: 'Pedidos'
}

const formatearTamanio = (bytes) =>
  bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`

export default function Restaurar() {
  const avisos = useAvisos()
  const [analisis, setAnalisis] = useState(null)
  const [confirmado, setConfirmado] = useState(false)
  const [cargando, setCargando] = useState(null)
  // Cuando la base ya se cerró, se tapa la pantalla hasta que el programa se reinicie.
  const [reinicio, setReinicio] = useState(null)

  // Si se sale de la pantalla con una copia analizada, se descarta.
  useEffect(() => () => window.API.cancelarRestauracion(), [])

  const elegirCopia = async () => {
    setCargando('analisis')
    setAnalisis(null)
    setConfirmado(false)
    try {
      const respuesta = await window.API.elegirRespaldoParaRestaurar()
      if (respuesta.canceled) return
      if (respuesta.success) setAnalisis(respuesta.info)
      else avisos.error('No se pudo leer la copia', respuesta.message)
    } catch (error) {
      console.error('Error al analizar la copia:', error)
      avisos.error('Error al leer la copia')
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
      avisos.error('No se pudo restaurar la copia', respuesta.message)
      setCargando(null)
    } catch (error) {
      console.error('Error al restaurar:', error)
      avisos.error('Error al restaurar la copia')
      setCargando(null)
    }
  }

  if (reinicio) {
    const IconoResultado = reinicio.ok ? CheckCircle2 : XCircle
    return (
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="titulo-reinicio"
        className="fixed inset-0 z-50 flex items-center justify-center bg-capa p-4"
      >
        <div className="w-full max-w-md space-y-3 rounded-xl border border-borde bg-superficie p-6 text-center shadow-xl">
          <IconoResultado
            className={`mx-auto h-10 w-10 ${reinicio.ok ? 'text-exito' : 'text-peligro'}`}
            aria-hidden="true"
          />
          <p
            id="titulo-reinicio"
            className={`font-semibold ${reinicio.ok ? 'text-exito-texto' : 'text-peligro-texto'}`}
          >
            {reinicio.ok ? 'Restauración completada' : 'No se pudo restaurar'}
          </p>
          <p className="text-sm break-all text-texto-secundario">{reinicio.texto}</p>
          <p className="flex items-center justify-center gap-2 text-sm text-texto-tenue">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Reiniciando el programa...
          </p>
        </div>
      </div>
    )
  }

  const ocupado = cargando !== null

  return (
    <Tarjeta
      titulo={<TituloConIcono icono={History}>Restaurar una copia</TituloConIcono>}
      descripcion="Reemplaza todos los datos actuales por los de una copia de seguridad. Antes de hacerlo se guarda automáticamente una copia de los datos actuales."
    >
      {!analisis ? (
        <Boton icono={RotateCcw} onClick={elegirCopia} disabled={ocupado}>
          {cargando === 'analisis' ? 'Revisando copia...' : 'Elegir copia para restaurar'}
        </Boton>
      ) : (
        <div className="space-y-4">
          <div className="space-y-1 text-sm">
            <p className="font-medium break-all text-texto">{analisis.archivo}</p>
            <p className="text-texto-tenue">
              {formatearFecha(analisis.fechaArchivo)} · {formatearTamanio(analisis.tamanio)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(analisis.conteos).map(([clave, total]) => (
              <Insignia key={clave}>
                {ETIQUETAS[clave] ?? clave}: {formatearNumero(total)}
              </Insignia>
            ))}
          </div>

          <Alerta>
            Todos los datos actuales (ventas, inventario, proveedores, pedidos y usuarios) se van a
            reemplazar por los de esta copia. Lo que se haya cargado después de la fecha de la copia
            se pierde, salvo en la copia de los datos actuales que se crea antes de restaurar. El
            programa se reinicia y hay que volver a iniciar sesión.
          </Alerta>

          <CasillaVerificacion
            etiqueta="Entiendo que se van a reemplazar los datos actuales"
            checked={confirmado}
            onChange={(e) => setConfirmado(e.target.checked)}
            disabled={ocupado}
          />

          <div className="flex flex-wrap gap-3">
            <Boton onClick={cancelar} disabled={ocupado}>
              Cancelar
            </Boton>
            <Boton
              variante="peligro"
              icono={RotateCcw}
              onClick={restaurar}
              disabled={!confirmado || ocupado}
            >
              {cargando === 'restaurar' ? 'Restaurando...' : 'Restaurar y reiniciar'}
            </Boton>
          </div>
        </div>
      )}
    </Tarjeta>
  )
}
