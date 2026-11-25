import { createContext, useCallback, useContext, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import Boton from './Boton'
import Modal from './Modal'

const ConfirmacionContext = createContext(null)

// Montar una sola vez (App.jsx). Reemplaza a window.confirm con una ventana propia.
export const ProveedorConfirmacion = ({ children }) => {
  const [pedido, setPedido] = useState(null)
  const resolver = useRef(null)

  const confirmar = useCallback((opciones) => {
    // Si había otra confirmación abierta, se da por cancelada.
    resolver.current?.(false)
    const datos = typeof opciones === 'string' ? { mensaje: opciones } : opciones
    setPedido({
      titulo: '¿Confirmar?',
      textoConfirmar: 'Confirmar',
      textoCancelar: 'Cancelar',
      peligro: false,
      ...datos
    })
    return new Promise((resolve) => {
      resolver.current = resolve
    })
  }, [])

  const responder = (respuesta) => {
    resolver.current?.(respuesta)
    resolver.current = null
    setPedido(null)
  }

  return (
    <ConfirmacionContext.Provider value={confirmar}>
      {children}
      {pedido && (
        <Modal
          titulo={pedido.titulo}
          tamano="sm"
          alCerrar={() => responder(false)}
          pie={
            <>
              <Boton onClick={() => responder(false)}>{pedido.textoCancelar}</Boton>
              <Boton
                variante={pedido.peligro ? 'peligro' : 'primario'}
                onClick={() => responder(true)}
              >
                {pedido.textoConfirmar}
              </Boton>
            </>
          }
        >
          {pedido.mensaje && <p className="text-sm text-texto-secundario">{pedido.mensaje}</p>}
        </Modal>
      )}
    </ConfirmacionContext.Provider>
  )
}

ProveedorConfirmacion.propTypes = { children: PropTypes.node }

// const confirmar = useConfirmar()
// if (await confirmar({ titulo: 'Anular venta', mensaje: '...', textoConfirmar: 'Anular', peligro: true })) ...
// También acepta solo el mensaje: await confirmar('¿Desea continuar?')
export const useConfirmar = () => {
  const contexto = useContext(ConfirmacionContext)
  if (!contexto) throw new Error('useConfirmar se usa dentro de <ProveedorConfirmacion>.')
  return contexto
}
