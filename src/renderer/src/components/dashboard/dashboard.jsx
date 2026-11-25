import { useState, useEffect } from 'react'
import {
  AlertTriangle,
  BarChart3,
  DollarSign,
  Package,
  PackageCheck,
  ShoppingCart,
  Trophy,
  Users
} from 'lucide-react'
import {
  Pagina,
  EncabezadoPagina,
  EstadoVacio,
  Insignia,
  Tabla,
  TablaCelda,
  TablaCuerpo,
  TablaEncabezado,
  TablaFila,
  Tarjeta,
  TarjetaMetrica
} from '../ui'
import { formatearFecha, formatearMoneda, formatearNumero } from '../../utils/formato'
import { etiquetaMetodo, varianteMetodo } from '../ventas/metodosPago'

const comoLista = (valor) => (Array.isArray(valor) ? valor : [])

const Dashboard = () => {
  const [fecha, setFecha] = useState('')
  const [estadisticas, setEstadisticas] = useState({
    productos: 0,
    proveedores: 0,
    ventasHoy: 0,
    stockBajo: 0
  })

  useEffect(() => {
    const fecha = new Date()
    const fechaCorta = fecha.toISOString().split('T')[0]
    setFecha(fechaCorta)
  }, [])

  useEffect(() => {
    if (!fecha) return
    cargarDashboard()
  }, [fecha])

  // Listados
  const [ventasRecientes, setVentasRecientes] = useState([])
  const [productosStockBajo, setProductosStockBajo] = useState([])
  const [productosMasVendidos, setProductosMasVendidos] = useState([])

  // Carga de datos
  const cargarDashboard = async () => {
    try {
      const [{ totalProductos }, { totalProveedores }, { totalVentasHoy }, { totalStockBajo }] =
        await Promise.all([
          window.API.obtenerTotalProductos(),
          window.API.obtenerTotalProveedores(),
          window.API.obtenerTotalVentasHoy(fecha),
          window.API.obtenerTotalStockBajo()
        ])

      setEstadisticas({
        productos: totalProductos,
        proveedores: totalProveedores,
        ventasHoy: totalVentasHoy,
        stockBajo: totalStockBajo
      })

      const ultimasVentas = await window.API.obtenerUltimasVentas()
      setVentasRecientes(comoLista(ultimasVentas))

      const bajo = await window.API.obtenerProductosStockBajo()
      setProductosStockBajo(comoLista(bajo))

      const masVendidos = await window.API.obtenerProductosMasVendidos()
      setProductosMasVendidos(comoLista(masVendidos))
    } catch (error) {
      console.error('Error cargando datos del panel:', error)
    }
  }

  return (
    <Pagina>
      <EncabezadoPagina
        icono={BarChart3}
        titulo="Panel de control"
        subtitulo="Resumen del comercio"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <TarjetaMetrica
          etiqueta="Vendido hoy"
          valor={formatearMoneda(estadisticas.ventasHoy ?? 0)}
          icono={DollarSign}
        />
        <TarjetaMetrica
          etiqueta="Productos"
          valor={formatearNumero(estadisticas.productos ?? 0)}
          icono={Package}
        />
        <TarjetaMetrica
          etiqueta="Proveedores"
          valor={formatearNumero(estadisticas.proveedores ?? 0)}
          icono={Users}
        />
        <TarjetaMetrica
          etiqueta="Stock bajo"
          valor={formatearNumero(estadisticas.stockBajo ?? 0)}
          icono={AlertTriangle}
          tendencia={estadisticas.stockBajo > 0 ? 'Productos por reponer' : 'Todo en orden'}
          direccion={estadisticas.stockBajo > 0 ? 'baja' : 'neutra'}
        />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-2 lg:grid-rows-[auto_minmax(0,1fr)]">
        <Tarjeta titulo="Ventas recientes" className="lg:col-span-2">
          {ventasRecientes.length > 0 ? (
            <Tabla>
              <TablaEncabezado>
                <TablaCelda encabezado>N.°</TablaCelda>
                <TablaCelda encabezado>Fecha</TablaCelda>
                <TablaCelda encabezado>Vendedor</TablaCelda>
                <TablaCelda encabezado>Método</TablaCelda>
                <TablaCelda encabezado alinear="derecha">
                  Total
                </TablaCelda>
              </TablaEncabezado>
              <TablaCuerpo>
                {ventasRecientes.map((venta) => (
                  <TablaFila key={venta.id}>
                    <TablaCelda className="font-medium tabular-nums">#{venta.id}</TablaCelda>
                    <TablaCelda className="whitespace-nowrap">
                      {formatearFecha(venta.created_at)}
                    </TablaCelda>
                    <TablaCelda className="text-texto-secundario">{venta.vendedor}</TablaCelda>
                    <TablaCelda>
                      <Insignia variante={varianteMetodo(venta.metodo)}>
                        {etiquetaMetodo(venta.metodo)}
                      </Insignia>
                    </TablaCelda>
                    <TablaCelda alinear="derecha" className="font-semibold">
                      {formatearMoneda(venta.total ?? 0)}
                    </TablaCelda>
                  </TablaFila>
                ))}
              </TablaCuerpo>
            </Tabla>
          ) : (
            <EstadoVacio
              icono={ShoppingCart}
              titulo="No hay ventas registradas"
              descripcion="Las últimas ventas aparecen acá."
            />
          )}
        </Tarjeta>

        <Tarjeta titulo="Productos con stock bajo" sinRelleno desplazable>
          {productosStockBajo.length > 0 ? (
            <ul className="divide-y divide-borde">
              {productosStockBajo.map((producto, idx) => (
                <li
                  key={producto.id ?? idx}
                  className="flex items-center justify-between gap-3 px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-texto">{producto.nombre}</p>
                    <p className="truncate text-sm text-texto-secundario">
                      Proveedor: {producto.Proveedor?.nombre || 'Sin asignar'}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <Insignia variante="peligro">Stock: {formatearNumero(producto.stock)}</Insignia>
                    <p className="mt-1 text-xs text-texto-tenue">
                      Mínimo: {formatearNumero(producto.stock_minimo)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EstadoVacio
              icono={PackageCheck}
              titulo="No hay productos con stock bajo"
              descripcion="Todos los productos están por encima del mínimo."
            />
          )}
        </Tarjeta>

        <Tarjeta titulo="Productos más vendidos" sinRelleno desplazable>
          {productosMasVendidos.length > 0 ? (
            <ol className="divide-y divide-borde">
              {productosMasVendidos.map((prod, idx) => (
                <li
                  key={prod.id ?? prod.producto ?? idx}
                  className="flex items-center justify-between gap-3 px-5 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primario-suave text-xs font-semibold text-primario-texto">
                      {idx + 1}
                    </span>
                    <p className="truncate font-medium text-texto">{prod.producto}</p>
                  </div>
                  <p className="shrink-0 text-sm tabular-nums text-texto-secundario">
                    {formatearNumero(prod.totalVendido)} vendidos
                  </p>
                </li>
              ))}
            </ol>
          ) : (
            <EstadoVacio
              icono={Trophy}
              titulo="Todavía no hay productos vendidos"
              descripcion="El ranking se arma con las ventas registradas."
            />
          )}
        </Tarjeta>
      </div>
    </Pagina>
  )
}

export default Dashboard
