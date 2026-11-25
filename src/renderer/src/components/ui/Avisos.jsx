import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { unirClases } from '../../utils/clases'
import BotonIcono from './BotonIcono'

// Duración en pantalla de cada tipo de aviso, en milisegundos.
const DURACION = { exito: 4000, info: 4000, error: 7000 }

const TIPOS = {
  exito: { icono: CheckCircle2, clase: 'text-exito', rol: 'status' },
  info: { icono: Info, clase: 'text-info', rol: 'status' },
  error: { icono: XCircle, clase: 'text-peligro', rol: 'alert' }
}

const AvisosContext = createContext(null)

const Aviso = ({ aviso, alCerrar }) => {
  const { icono: Icono, clase, rol } = TIPOS[aviso.tipo]

  useEffect(() => {
    const temporizador = setTimeout(() => alCerrar(aviso.id), DURACION[aviso.tipo])
    return () => clearTimeout(temporizador)
  }, [aviso, alCerrar])

  return (
    <div
      role={rol}
      className="pointer-events-auto flex w-80 items-start gap-3 rounded-xl border border-borde bg-superficie p-4 shadow-lg"
    >
      <Icono className={unirClases('mt-0.5 h-5 w-5 shrink-0', clase)} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-texto">{aviso.titulo}</p>
        {aviso.detalle && <p className="mt-0.5 text-sm text-texto-secundario">{aviso.detalle}</p>}
      </div>
      <BotonIcono
        icono={X}
        etiqueta="Cerrar aviso"
        tamano="sm"
        onClick={() => alCerrar(aviso.id)}
      />
    </div>
  )
}

Aviso.propTypes = {
  aviso: PropTypes.shape({
    id: PropTypes.number.isRequired,
    tipo: PropTypes.oneOf(['exito', 'info', 'error']).isRequired,
    titulo: PropTypes.node.isRequired,
    detalle: PropTypes.node
  }).isRequired,
  alCerrar: PropTypes.func.isRequired
}

// Montar una sola vez (App.jsx). Muestra los avisos apilados abajo a la derecha.
export const ProveedorAvisos = ({ children }) => {
  const [avisos, setAvisos] = useState([])
  const siguienteId = useRef(1)

  const cerrar = useCallback((id) => setAvisos((lista) => lista.filter((a) => a.id !== id)), [])

  const valor = useMemo(() => {
    const agregar = (tipo) => (titulo, detalle) => {
      const id = siguienteId.current++
      setAvisos((lista) => [...lista, { id, tipo, titulo, detalle }])
    }
    return { exito: agregar('exito'), error: agregar('error'), info: agregar('info') }
  }, [])

  return (
    <AvisosContext.Provider value={valor}>
      {children}
      <div className="pointer-events-none fixed right-4 bottom-4 z-50 flex flex-col items-end gap-2">
        {avisos.map((aviso) => (
          <Aviso key={aviso.id} aviso={aviso} alCerrar={cerrar} />
        ))}
      </div>
    </AvisosContext.Provider>
  )
}

ProveedorAvisos.propTypes = { children: PropTypes.node }

// const avisos = useAvisos(); avisos.exito('Venta guardada'); avisos.error('No se pudo guardar', detalle)
export const useAvisos = () => {
  const contexto = useContext(AvisosContext)
  if (!contexto) throw new Error('useAvisos se usa dentro de <ProveedorAvisos>.')
  return contexto
}
