import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'
import { X } from 'lucide-react'
import { unirClases } from '../../utils/clases'
import BotonIcono from './BotonIcono'

const TAMANOS = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

const SELECTOR_CAMPOS =
  'input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled])'
const SELECTOR_ENFOCABLES = `${SELECTOR_CAMPOS}, button:not([disabled]):not([data-cerrar-modal]), [href], [tabindex]:not([tabindex="-1"])`

// Ventana sobre la pantalla. Se cierra con Escape, con la X o con un clic fuera, salvo con
// `bloquearCierre` (por ejemplo, mientras se guarda). Al abrir enfoca el primer campo y al
// cerrar devuelve el foco a donde estaba.
// Con `alEnviar`, todo el contenido va dentro de un <form>: un <Boton type="submit"> en `pie`
// lo envía. Modal ya llama a preventDefault antes de alEnviar(evento).
const Modal = ({
  abierto = true,
  titulo,
  descripcion,
  alCerrar,
  alEnviar,
  pie,
  tamano = 'md',
  bloquearCierre = false,
  children
}) => {
  const idTitulo = useId()
  const panel = useRef(null)

  useEffect(() => {
    if (!abierto) return undefined
    const anterior = document.activeElement
    const contenedor = panel.current
    const destino =
      contenedor?.querySelector(SELECTOR_CAMPOS) ??
      contenedor?.querySelector(SELECTOR_ENFOCABLES) ??
      contenedor
    destino?.focus()
    return () => {
      if (anterior instanceof HTMLElement && document.contains(anterior)) anterior.focus()
    }
  }, [abierto])

  if (!abierto) return null

  const cerrar = () => {
    if (!bloquearCierre) alCerrar?.()
  }

  const alPresionarTecla = (e) => {
    if (e.key !== 'Escape') return
    // Solo se cierra la ventana de más arriba si hay varias abiertas.
    e.stopPropagation()
    cerrar()
  }

  const contenido = (
    <>
      <header className="flex items-start justify-between gap-4 border-b border-borde px-5 py-4">
        <div className="min-w-0">
          <h2 id={idTitulo} className="text-lg font-semibold text-texto">
            {titulo}
          </h2>
          {descripcion && <p className="mt-0.5 text-sm text-texto-secundario">{descripcion}</p>}
        </div>
        {alCerrar && (
          <BotonIcono
            icono={X}
            etiqueta="Cerrar"
            tamano="sm"
            onClick={cerrar}
            disabled={bloquearCierre}
            data-cerrar-modal=""
          />
        )}
      </header>
      <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
      {pie && (
        <footer className="flex flex-wrap justify-end gap-2 border-t border-borde px-5 py-4">
          {pie}
        </footer>
      )}
    </>
  )

  const enviar = (e) => {
    e.preventDefault()
    alEnviar(e)
  }

  return createPortal(
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-capa p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) cerrar()
      }}
      onKeyDown={alPresionarTecla}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        tabIndex={-1}
        className={unirClases(
          'w-full rounded-xl border border-borde bg-superficie text-texto shadow-xl focus:outline-none',
          TAMANOS[tamano]
        )}
      >
        {alEnviar ? <form onSubmit={enviar}>{contenido}</form> : contenido}
      </div>
    </div>,
    document.body
  )
}

Modal.propTypes = {
  abierto: PropTypes.bool,
  titulo: PropTypes.node.isRequired,
  descripcion: PropTypes.node,
  alCerrar: PropTypes.func,
  alEnviar: PropTypes.func,
  pie: PropTypes.node,
  tamano: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  bloquearCierre: PropTypes.bool,
  children: PropTypes.node
}

export default Modal
