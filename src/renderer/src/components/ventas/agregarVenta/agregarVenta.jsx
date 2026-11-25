import PropTypes from 'prop-types'
import { Plus, ShoppingBasket, Trash2 } from 'lucide-react'
import { useState } from 'react'
import {
  Boton,
  BotonIcono,
  Campo,
  CampoConEtiqueta,
  EstadoVacio,
  Modal,
  Selector,
  useAvisos
} from '../../ui'
import { formatearMoneda, formatearNumero } from '../../../utils/formato'
import { METODOS_PAGO, etiquetaMetodo } from '../metodosPago'

const AgregarVenta = ({
  vendedor,
  productos,
  carrito,
  setMostrarNuevaVenta,
  setCarrito,
  loading,
  setLoading,
  cargarVentas,
  cargarProductos
}) => {
  const avisos = useAvisos()
  const [metodo, setMetodo] = useState('Efectivo')
  // Agregar producto al carrito
  const agregarAlCarrito = (producto) => {
    const existe = carrito.find((item) => item.producto.id === producto.id)
    if (existe) {
      if (existe.cantidad < producto.stock) {
        setCarrito(
          carrito.map((item) =>
            item.producto.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
          )
        )
      }
    } else {
      setCarrito([...carrito, { producto, cantidad: 1 }])
    }
  }

  const actualizarCantidadCarrito = (idProducto, cantidad) => {
    if (cantidad <= 0) {
      setCarrito(carrito.filter((item) => item.producto.id !== idProducto))
    } else {
      const producto = productos.find((p) => p.id === idProducto)
      if (producto && cantidad <= producto.stock) {
        setCarrito(
          carrito.map((item) => (item.producto.id === idProducto ? { ...item, cantidad } : item))
        )
      }
    }
  }

  // Calcular total del carrito
  const obtenerTotalCarrito = () => {
    return carrito.reduce((total, item) => total + item.producto.precio * item.cantidad, 0)
  }

  const cerrar = () => {
    setMostrarNuevaVenta(false)
    setCarrito([])
  }

  // Completar venta
  const completarVenta = async () => {
    if (carrito.length === 0) return
    setLoading(true)
    try {
      const total = obtenerTotalCarrito()
      const ventaAEnviar = {
        carrito: carrito.map((item) => ({
          id_producto: item.producto.id,
          cantidad: item.cantidad
        })),
        total,
        metodo,
        vendedor: vendedor
      }

      const resultado = await window.API.agregarVenta(ventaAEnviar)

      if (resultado?.error) {
        avisos.error('No se pudo registrar la venta', resultado.error)
      } else {
        avisos.exito('Venta registrada', `Total: ${formatearMoneda(total)}`)
        setCarrito([])
        setMostrarNuevaVenta(false)
        cargarVentas()
        cargarProductos()
      }
    } catch (error) {
      console.error('Error al completar la venta:', error)
      avisos.error('No se pudo registrar la venta')
    }
    setLoading(false)
  }

  return (
    <Modal
      titulo="Nueva venta"
      descripcion={`Vendedor: ${vendedor}`}
      tamano="xl"
      alCerrar={cerrar}
      bloquearCierre={loading}
      pie={
        <>
          <Boton onClick={cerrar} disabled={loading}>
            Cancelar
          </Boton>
          <Boton
            variante="primario"
            onClick={completarVenta}
            disabled={carrito.length === 0 || loading}
          >
            {loading ? 'Procesando...' : 'Confirmar'}
          </Boton>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Lista de productos */}
        <section aria-labelledby="titulo-productos-disponibles" className="min-w-0">
          <h3 id="titulo-productos-disponibles" className="mb-3 text-sm font-semibold text-texto">
            Productos disponibles
          </h3>
          <ul className="space-y-2">
            {productos.map((producto) => (
              <li
                key={producto.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-borde p-3 transition-colors hover:bg-superficie-alt"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-texto">{producto.nombre}</p>
                  <p className="text-sm text-texto-secundario">
                    Stock: {formatearNumero(producto.stock)}
                  </p>
                  <p className="text-sm font-semibold tabular-nums text-texto">
                    {formatearMoneda(producto.precio)}
                  </p>
                </div>
                <Boton
                  tamano="sm"
                  icono={Plus}
                  onClick={() => agregarAlCarrito(producto)}
                  disabled={producto.stock === 0}
                >
                  Agregar
                </Boton>
              </li>
            ))}
          </ul>
        </section>

        {/* Carrito */}
        <section aria-labelledby="titulo-carrito" className="flex min-w-0 flex-col">
          <h3 id="titulo-carrito" className="mb-3 text-sm font-semibold text-texto">
            Carrito de venta
          </h3>

          {carrito.length === 0 ? (
            <EstadoVacio
              icono={ShoppingBasket}
              titulo="El carrito está vacío"
              descripcion="Agregá productos de la lista."
              className="rounded-lg border border-dashed border-borde"
            />
          ) : (
            <ul className="space-y-2">
              {carrito.map((item) => (
                <li
                  key={item.producto.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-borde p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-texto">{item.producto.nombre}</p>
                    <p className="text-sm tabular-nums text-texto-secundario">
                      {formatearMoneda(item.producto.precio)} c/u
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Campo
                      type="number"
                      min="1"
                      max={item.producto.stock}
                      value={item.cantidad}
                      onChange={(e) =>
                        actualizarCantidadCarrito(item.producto.id, parseInt(e.target.value))
                      }
                      aria-label={`Cantidad de ${item.producto.nombre}`}
                      className="w-20 text-center"
                    />
                    <BotonIcono
                      icono={Trash2}
                      etiqueta="Quitar del carrito"
                      variante="peligro"
                      tamano="sm"
                      onClick={() => actualizarCantidadCarrito(item.producto.id, 0)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 space-y-4 border-t border-borde pt-4">
            <CampoConEtiqueta etiqueta="Método de pago">
              <Selector value={metodo} onChange={(e) => setMetodo(e.target.value)}>
                {METODOS_PAGO.map((m) => (
                  <option key={m} value={m}>
                    {etiquetaMetodo(m)}
                  </option>
                ))}
              </Selector>
            </CampoConEtiqueta>
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-texto">Total</span>
              <span className="text-2xl font-semibold tabular-nums text-texto">
                {formatearMoneda(obtenerTotalCarrito())}
              </span>
            </div>
          </div>
        </section>
      </div>
    </Modal>
  )
}

AgregarVenta.propTypes = {
  vendedor: PropTypes.string.isRequired,
  productos: PropTypes.array.isRequired,
  carrito: PropTypes.array.isRequired,
  setMostrarNuevaVenta: PropTypes.func.isRequired,
  setCarrito: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  setLoading: PropTypes.func.isRequired,
  cargarVentas: PropTypes.func.isRequired,
  cargarProductos: PropTypes.func.isRequired
}

export default AgregarVenta
