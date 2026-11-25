import { useState, useEffect, useMemo } from 'react'
import {
  CalendarRange,
  DollarSign,
  Eye,
  Plus,
  Receipt,
  SearchX,
  ShoppingCart,
  Trash2,
  TrendingUp
} from 'lucide-react'
import AgregarVenta from './agregarVenta/agregarVenta'
import DetallesVentas from './detallesVenta/detallesVentas'
import { usePermisos } from '../../sesion'
import {
  Pagina,
  Cargando,
  BarraHerramientas,
  Boton,
  BotonIcono,
  Buscador,
  EncabezadoPagina,
  EstadoVacio,
  Insignia,
  Selector,
  Tabla,
  TablaCelda,
  TablaCuerpo,
  TablaEncabezado,
  TablaFila,
  TarjetaMetrica,
  useAvisos,
  useConfirmar
} from '../ui'
import { formatearFecha, formatearMoneda, formatearNumero } from '../../utils/formato'
import { METODOS_PAGO, etiquetaMetodo, varianteMetodo } from './metodosPago'

const RANGOS_FECHA = [
  { valor: 'todas', etiqueta: 'Todas las fechas' },
  { valor: 'hoy', etiqueta: 'Hoy' },
  { valor: 'semana', etiqueta: 'Últimos 7 días' },
  { valor: 'mes', etiqueta: 'Este mes' }
]

const DIA_MS = 24 * 60 * 60 * 1000

const inicioDelDia = (fecha) => new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate())

// La semana empieza el lunes.
const inicioDeSemana = (fecha) => {
  const dia = inicioDelDia(fecha)
  const desdeLunes = (dia.getDay() + 6) % 7
  return new Date(dia.getFullYear(), dia.getMonth(), dia.getDate() - desdeLunes)
}

const sumarTotales = (lista) => lista.reduce((suma, v) => suma + (Number(v.total) || 0), 0)

const entre = (ventas, desde, hasta) =>
  ventas.filter((v) => {
    const f = new Date(v.created_at)
    return f >= desde && f < hasta
  })

const porcentaje = new Intl.NumberFormat('es-AR', {
  style: 'percent',
  maximumFractionDigits: 0,
  signDisplay: 'exceptZero'
})

// Compara un monto con el del período anterior: texto y dirección para TarjetaMetrica.
const comparar = (actual, anterior, periodo) => {
  if (anterior === 0) {
    return actual > 0
      ? { tendencia: `Sin ventas ${periodo}`, direccion: 'sube' }
      : { tendencia: `Sin ventas ${periodo}`, direccion: 'neutra' }
  }
  const cambio = (actual - anterior) / anterior
  const direccion = cambio > 0 ? 'sube' : cambio < 0 ? 'baja' : 'neutra'
  return { tendencia: `${porcentaje.format(cambio)} vs. ${periodo}`, direccion }
}

const calcularMetricas = (ventas, ahora = new Date()) => {
  const hoy = inicioDelDia(ahora)
  const manana = new Date(hoy.getTime() + DIA_MS)
  const ayer = new Date(hoy.getTime() - DIA_MS)
  const semana = inicioDeSemana(ahora)
  const semanaPasada = new Date(semana.getFullYear(), semana.getMonth(), semana.getDate() - 7)
  const mismoMomentoSemanaPasada = new Date(ahora.getTime() - 7 * DIA_MS)

  const ventasHoy = entre(ventas, hoy, manana)
  const totalHoy = sumarTotales(ventasHoy)
  const totalAyer = sumarTotales(entre(ventas, ayer, hoy))
  const totalSemana = sumarTotales(entre(ventas, semana, manana))
  // Se compara contra el mismo tramo de la semana pasada (del lunes hasta este momento).
  const totalSemanaPasada = sumarTotales(entre(ventas, semanaPasada, mismoMomentoSemanaPasada))

  return {
    totalHoy,
    vsAyer: comparar(totalHoy, totalAyer, 'ayer'),
    cantidadHoy: ventasHoy.length,
    ticketPromedio: ventasHoy.length ? totalHoy / ventasHoy.length : 0,
    totalSemana,
    vsSemanaPasada: comparar(totalSemana, totalSemanaPasada, 'semana pasada')
  }
}

const desdeRango = (rango, ahora = new Date()) => {
  const hoy = inicioDelDia(ahora)
  if (rango === 'hoy') return hoy
  if (rango === 'semana') return new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 6)
  if (rango === 'mes') return new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  return null
}

const nombresProductos = (venta) =>
  (venta.Productos_vendidos ?? []).map((item) => item.producto).join(', ')

const Ventas = () => {
  const { puede } = usePermisos()
  const avisos = useAvisos()
  const confirmar = useConfirmar()
  const [ventas, setVentas] = useState([])
  const [cargado, setCargado] = useState(false)
  const [productos, setProductos] = useState([])
  const [mostrarNuevaVenta, setMostrarNuevaVenta] = useState(false)
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null)
  const [carrito, setCarrito] = useState([])
  const [loading, setLoading] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [metodoFiltro, setMetodoFiltro] = useState('')
  const [rango, setRango] = useState('todas')
  const vendedor = localStorage.usuario
  useEffect(() => {
    cargarVentas().finally(() => setCargado(true))
    cargarProductos()
  }, [])

  const cargarVentas = async () => {
    try {
      const resultado = await window.API.obtenerTodasLasVentas()
      if (Array.isArray(resultado)) {
        setVentas(resultado)
      } else {
        setVentas([])
      }
    } catch (error) {
      console.error('Error al cargar ventas:', error)
      setVentas([])
    }
  }

  const cargarProductos = async () => {
    try {
      const resultado = await window.API.obtenerTodosLosProductos()
      // Sin permiso para crear ventas no llega una lista.
      setProductos(Array.isArray(resultado) ? resultado : [])
    } catch (error) {
      console.error('Error al cargar productos:', error)
    }
  }

  const cargarDetallesVenta = async (id) => {
    try {
      const items = await window.API.obtenerProductosVenta(id)
      const venta = ventas.find((v) => v.id === id)
      if (venta) {
        setVentaSeleccionada({ ...venta, items })
      }
    } catch (error) {
      console.error('Error al cargar detalles de venta:', error)
    }
  }

  const handleDelete = async (venta) => {
    const ok = await confirmar({
      titulo: 'Anular venta',
      mensaje: `Se anulará la venta #${venta.id} por ${formatearMoneda(venta.total)} y se devolverá el stock de sus productos.`,
      textoConfirmar: 'Anular venta',
      peligro: true
    })
    if (!ok) return
    try {
      const resultado = await window.API.eliminarVenta(venta.id)
      if (resultado?.error) {
        avisos.error('No se pudo anular la venta', resultado.error)
      } else {
        avisos.exito('Venta anulada', `La venta #${venta.id} se anuló y el stock se restauró.`)
      }
      cargarVentas()
    } catch (error) {
      console.error('Error al eliminar producto:', error)
      avisos.error('No se pudo anular la venta')
    }
  }

  const metricas = useMemo(() => calcularMetricas(ventas), [ventas])

  const ventasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    const desde = desdeRango(rango)
    return ventas.filter((venta) => {
      if (metodoFiltro && venta.metodo !== metodoFiltro) return false
      if (desde && new Date(venta.created_at) < desde) return false
      if (!texto) return true
      return (
        nombresProductos(venta).toLowerCase().includes(texto) ||
        (venta.vendedor ?? '').toLowerCase().includes(texto) ||
        `#${venta.id}`.includes(texto)
      )
    })
  }, [ventas, busqueda, metodoFiltro, rango])

  const hayFiltros = busqueda.trim() !== '' || metodoFiltro !== '' || rango !== 'todas'

  const limpiarFiltros = () => {
    setBusqueda('')
    setMetodoFiltro('')
    setRango('todas')
  }

  const puedeCrear = puede('ventas.crear')
  const abrirNuevaVenta = () => setMostrarNuevaVenta(true)
  const botonNuevaVenta = puedeCrear && (
    <Boton
      variante="primario"
      icono={Plus}
      onClick={abrirNuevaVenta}
      disabled={!productos.length}
      title={productos.length ? undefined : 'No hay productos cargados'}
    >
      Nueva venta
    </Boton>
  )

  const subtitulo =
    ventas.length === 1
      ? '1 venta registrada'
      : `${formatearNumero(ventas.length)} ventas registradas`

  return (
    <Pagina>
      <EncabezadoPagina
        icono={ShoppingCart}
        titulo="Ventas"
        subtitulo={subtitulo}
        acciones={botonNuevaVenta || undefined}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <TarjetaMetrica
          etiqueta="Vendido hoy"
          valor={formatearMoneda(metricas.totalHoy)}
          icono={DollarSign}
          tendencia={metricas.vsAyer.tendencia}
          direccion={metricas.vsAyer.direccion}
        />
        <TarjetaMetrica
          etiqueta="Ventas hoy"
          valor={formatearNumero(metricas.cantidadHoy)}
          icono={Receipt}
          tendencia={`Ticket promedio ${formatearMoneda(metricas.ticketPromedio)}`}
        />
        <TarjetaMetrica
          etiqueta="Esta semana"
          valor={formatearMoneda(metricas.totalSemana)}
          icono={TrendingUp}
          tendencia={metricas.vsSemanaPasada.tendencia}
          direccion={metricas.vsSemanaPasada.direccion}
        />
        <TarjetaMetrica
          etiqueta="Total histórico"
          valor={formatearMoneda(sumarTotales(ventas))}
          icono={CalendarRange}
          tendencia={subtitulo}
        />
      </div>

      <BarraHerramientas>
        <Buscador
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por producto o vendedor"
          etiqueta="Buscar ventas"
        />
        <Selector
          aria-label="Método de pago"
          value={metodoFiltro}
          onChange={(e) => setMetodoFiltro(e.target.value)}
          className="sm:w-48"
        >
          <option value="">Todos los métodos</option>
          {METODOS_PAGO.map((m) => (
            <option key={m} value={m}>
              {etiquetaMetodo(m)}
            </option>
          ))}
        </Selector>
        <Selector
          aria-label="Rango de fechas"
          value={rango}
          onChange={(e) => setRango(e.target.value)}
          className="sm:w-44"
        >
          {RANGOS_FECHA.map((r) => (
            <option key={r.valor} value={r.valor}>
              {r.etiqueta}
            </option>
          ))}
        </Selector>
      </BarraHerramientas>

      {!cargado ? (
        <Cargando texto="Cargando ventas…" />
      ) : ventas.length === 0 ? (
        <EstadoVacio
          icono={ShoppingCart}
          titulo="Todavía no hay ventas"
          descripcion="Las ventas que registres aparecen en esta lista."
        />
      ) : ventasFiltradas.length === 0 ? (
        <EstadoVacio
          icono={SearchX}
          titulo="Ninguna venta coincide con los filtros"
          descripcion="Probá con otra búsqueda, otro método de pago u otro rango de fechas."
          accion={hayFiltros && <Boton onClick={limpiarFiltros}>Limpiar filtros</Boton>}
        />
      ) : (
        <Tabla desplazable>
          <TablaEncabezado>
            <TablaCelda encabezado>N.°</TablaCelda>
            <TablaCelda encabezado>Fecha</TablaCelda>
            <TablaCelda encabezado>Productos</TablaCelda>
            <TablaCelda encabezado>Vendedor</TablaCelda>
            <TablaCelda encabezado>Método</TablaCelda>
            <TablaCelda encabezado alinear="derecha">
              Total
            </TablaCelda>
            <TablaCelda encabezado alinear="derecha">
              Acciones
            </TablaCelda>
          </TablaEncabezado>
          <TablaCuerpo>
            {ventasFiltradas.map((venta) => {
              const productosTexto = nombresProductos(venta)
              return (
                <TablaFila key={venta.id}>
                  <TablaCelda className="font-medium tabular-nums">#{venta.id}</TablaCelda>
                  <TablaCelda className="whitespace-nowrap">
                    {formatearFecha(venta.created_at)}
                  </TablaCelda>
                  <TablaCelda>
                    <span className="block max-w-xs truncate" title={productosTexto}>
                      {productosTexto || '—'}
                    </span>
                  </TablaCelda>
                  <TablaCelda className="text-texto-secundario">{venta.vendedor}</TablaCelda>
                  <TablaCelda>
                    <Insignia variante={varianteMetodo(venta.metodo)}>
                      {etiquetaMetodo(venta.metodo)}
                    </Insignia>
                  </TablaCelda>
                  <TablaCelda alinear="derecha" className="font-semibold">
                    {formatearMoneda(venta.total)}
                  </TablaCelda>
                  <TablaCelda alinear="derecha" className="whitespace-nowrap">
                    <BotonIcono
                      icono={Eye}
                      etiqueta="Ver detalle"
                      tamano="sm"
                      onClick={() => cargarDetallesVenta(venta.id)}
                    />
                    {puede('ventas.anular') && (
                      <BotonIcono
                        icono={Trash2}
                        etiqueta="Anular venta"
                        variante="peligro"
                        tamano="sm"
                        onClick={() => handleDelete(venta)}
                      />
                    )}
                  </TablaCelda>
                </TablaFila>
              )
            })}
          </TablaCuerpo>
        </Tabla>
      )}

      {mostrarNuevaVenta && (
        <AgregarVenta
          vendedor={vendedor}
          productos={productos}
          carrito={carrito}
          setMostrarNuevaVenta={setMostrarNuevaVenta}
          setCarrito={setCarrito}
          loading={loading}
          setLoading={setLoading}
          cargarVentas={cargarVentas}
          cargarProductos={cargarProductos}
        />
      )}

      {ventaSeleccionada && (
        <DetallesVentas
          ventaSeleccionada={ventaSeleccionada}
          setVentaSeleccionada={setVentaSeleccionada}
        />
      )}
    </Pagina>
  )
}

export default Ventas
