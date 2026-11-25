import { useState, useEffect } from 'react'
import { CheckCircle2, ClipboardList, Clock, Eye, Plus, Truck } from 'lucide-react'
import AgregarPedido from './agregarPedido/agregarPedido'
import EditarPedido from './editarPedido/editarPedido'
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
  Selector,
  Tabla,
  TablaCelda,
  TablaCuerpo,
  TablaEncabezado,
  TablaFila,
  TarjetaMetrica,
  useAvisos
} from '../ui'
import { formatearFecha, formatearMoneda, formatearNumero } from '../../utils/formato'
import InsigniaEstado, { ESTADOS_PEDIDO } from './insigniaEstado'

// Los canales devuelven { error } o { success: false, message } cuando algo falla.
const respuestaConError = (r) => Boolean(r?.error) || r?.success === false
const detalleError = (r) => r?.error || r?.message

const esDelMesActual = (fecha) => {
  if (!fecha) return false
  const f = new Date(fecha)
  const hoy = new Date()
  return f.getFullYear() === hoy.getFullYear() && f.getMonth() === hoy.getMonth()
}

const Pedidos = () => {
  const { puede } = usePermisos()
  const avisos = useAvisos()
  const [pedidos, setPedidos] = useState([])
  const [cargado, setCargado] = useState(false)
  const [proveedores, setProveedores] = useState([])
  const [productos, setProductos] = useState([])
  const [mostrarNuevo, setMostrarNuevo] = useState(false)
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState('')
  const [items, setItems] = useState([])
  const [nota, setNota] = useState('')
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null)
  const [productosSeleccionado, setProductosSeleccionado] = useState([])
  const [estado, setEstado] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')

  useEffect(() => {
    cargarPedidos().finally(() => setCargado(true))
    cargarProveedores()
    cargarProductos()
  }, [])

  const cargarPedidos = async () => {
    const data = await window.API.obtenerTodosLosPedidos()
    setPedidos(Array.isArray(data) ? data : [])
  }

  const cargarProveedores = async () => {
    const data = await window.API.obtenerTodosLosProveedores()
    setProveedores(Array.isArray(data) ? data : [])
  }

  const cargarProductos = async () => {
    const data = await window.API.obtenerTodosLosProductos()
    setProductos(Array.isArray(data) ? data : [])
  }

  const proveedorObj = proveedores.find((p) => p.nombre === proveedorSeleccionado)
  const productosProveedor = proveedorObj
    ? productos.filter((p) => p.id_proveedor === proveedorObj.id_proveedores)
    : []

  const agregarItem = () => {
    if (productosProveedor.length > 0) {
      setItems([
        ...items,
        {
          producto: productosProveedor[0],
          cantidad: 1,
          costo: productosProveedor[0].costo || productosProveedor[0].precio
        }
      ])
    }
  }

  const actualizarItem = (idx, campo, valor) => {
    const nuevos = [...items]
    if (campo === 'producto') {
      const prod = productos.find((p) => p.id === parseInt(valor))
      nuevos[idx].producto = prod
      nuevos[idx].costo = prod.costo || prod.precio
    } else if (campo === 'cantidad') {
      nuevos[idx].cantidad = parseInt(valor) || 1
    } else if (campo === 'costo') {
      nuevos[idx].costo = parseFloat(valor) || 0
    }
    setItems(nuevos)
  }

  const eliminarItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx))
  }

  const totalPedido = () => items.reduce((t, i) => t + i.costo * i.cantidad, 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (pedidoSeleccionado) {
        if (pedidoSeleccionado.estado === 'Aprobado') {
          console.error('No se puede cambiar el estado de aprobado')
          avisos.error('No se puede cambiar el estado de un pedido aprobado')
        } else {
          const resultado = await window.API.actualizarPedido(pedidoSeleccionado.id, estado)
          if (respuestaConError(resultado)) {
            avisos.error('No se pudo actualizar el pedido', detalleError(resultado))
          } else {
            avisos.exito(
              'Pedido actualizado',
              `El pedido #${pedidoSeleccionado.id} quedó ${estado}.`
            )
          }
          cargarPedidos()
          setPedidoSeleccionado(null)
        }
      } else {
        if (!proveedorSeleccionado || items.length === 0) return
        const resultado = await window.API.agregarPedido({
          proveedor: proveedorSeleccionado,
          total: totalPedido(),
          estado: 'Pendiente',
          nota,
          productos: items.map((i) => ({
            id_producto: i.producto.id,
            producto: i.producto.nombre,
            cantidad: i.cantidad,
            costo: i.costo
          }))
        })
        if (respuestaConError(resultado)) {
          avisos.error('No se pudo crear el pedido', detalleError(resultado))
        } else {
          avisos.exito('Pedido creado')
        }
        setMostrarNuevo(false)
        setProveedorSeleccionado('')
        setItems([])
        setNota('')
        cargarPedidos()
      }
    } catch (error) {
      console.error(error)
      avisos.error('No se pudo guardar el pedido')
    }
  }

  const verDetalles = async (pedido) => {
    try {
      setPedidoSeleccionado(pedido)
      const resultado = await window.API.obtenerTodosLosProductosPedidos(pedido.id)
      setProductosSeleccionado(Array.isArray(resultado) ? resultado : [])
      setEstado(pedido.estado)
    } catch (error) {
      console.error(error)
    }
  }

  const pendientes = pedidos.filter((p) => p.estado === 'Pendiente').length
  const enCurso = pedidos.filter((p) => p.estado === 'Pedido').length
  const aprobadosDelMes = pedidos.filter(
    (p) => p.estado === 'Aprobado' && esDelMesActual(p.updated_at || p.created_at)
  ).length

  const texto = busqueda.trim().toLowerCase().replace(/^#/, '')
  const pedidosFiltrados = pedidos.filter(
    (pedido) =>
      (!filtroEstado || pedido.estado === filtroEstado) &&
      (!texto ||
        (pedido.proveedor || '').toLowerCase().includes(texto) ||
        String(pedido.id).includes(texto))
  )

  const renderLista = () => {
    if (!cargado) return <Cargando texto="Cargando pedidos…" />
    if (pedidos.length === 0) {
      return (
        <EstadoVacio
          icono={ClipboardList}
          titulo="Todavía no hay pedidos"
          descripcion="Los pedidos a proveedores que crees aparecen acá."
        />
      )
    }
    if (pedidosFiltrados.length === 0) {
      return (
        <EstadoVacio
          titulo="No hay resultados"
          descripcion="Probá con otra búsqueda o con otro estado."
        />
      )
    }
    return (
      <Tabla desplazable>
        <TablaEncabezado>
          <TablaCelda encabezado>Pedido</TablaCelda>
          <TablaCelda encabezado>Proveedor</TablaCelda>
          <TablaCelda encabezado>Fecha</TablaCelda>
          <TablaCelda encabezado>Estado</TablaCelda>
          <TablaCelda encabezado alinear="derecha">
            Total
          </TablaCelda>
          <TablaCelda encabezado alinear="derecha">
            Acciones
          </TablaCelda>
        </TablaEncabezado>
        <TablaCuerpo>
          {pedidosFiltrados.map((pedido) => (
            <TablaFila key={pedido.id}>
              <TablaCelda className="font-medium tabular-nums">#{pedido.id}</TablaCelda>
              <TablaCelda>{pedido.proveedor}</TablaCelda>
              <TablaCelda className="whitespace-nowrap text-texto-secundario">
                {formatearFecha(pedido.created_at)}
              </TablaCelda>
              <TablaCelda>
                <InsigniaEstado estado={pedido.estado} />
              </TablaCelda>
              <TablaCelda alinear="derecha" className="font-medium">
                {formatearMoneda(pedido.total)}
              </TablaCelda>
              <TablaCelda alinear="derecha">
                <BotonIcono
                  icono={Eye}
                  etiqueta="Ver detalle"
                  onClick={() => verDetalles(pedido)}
                />
              </TablaCelda>
            </TablaFila>
          ))}
        </TablaCuerpo>
      </Tabla>
    )
  }

  return (
    <Pagina>
      <EncabezadoPagina
        icono={ClipboardList}
        titulo="Pedidos a proveedores"
        subtitulo={`${formatearNumero(pedidos.length)} ${pedidos.length === 1 ? 'pedido' : 'pedidos'}`}
        acciones={
          puede('pedidos.crear') && (
            <Boton
              variante="primario"
              icono={Plus}
              onClick={() => {
                setProveedorSeleccionado('')
                setItems([])
                setNota('')
                setMostrarNuevo(true)
              }}
              disabled={proveedores?.length === 0}
              title={proveedores?.length === 0 ? 'Primero agregá un proveedor' : undefined}
            >
              Nuevo pedido
            </Boton>
          )
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TarjetaMetrica etiqueta="Pendientes" valor={formatearNumero(pendientes)} icono={Clock} />
        <TarjetaMetrica etiqueta="En curso" valor={formatearNumero(enCurso)} icono={Truck} />
        <TarjetaMetrica
          etiqueta="Aprobados este mes"
          valor={formatearNumero(aprobadosDelMes)}
          icono={CheckCircle2}
        />
      </div>

      <BarraHerramientas>
        <Buscador
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por proveedor o número..."
          etiqueta="Buscar pedidos"
        />
        <Selector
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          aria-label="Filtrar por estado"
          className="sm:w-48"
        >
          <option value="">Todos los estados</option>
          {ESTADOS_PEDIDO.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </Selector>
      </BarraHerramientas>

      {renderLista()}

      {mostrarNuevo && (
        <AgregarPedido
          proveedorSeleccionado={proveedorSeleccionado}
          proveedores={proveedores}
          agregarItem={agregarItem}
          items={items}
          setItems={setItems}
          setProveedorSeleccionado={setProveedorSeleccionado}
          actualizarItem={actualizarItem}
          productos={productosProveedor}
          eliminarItem={eliminarItem}
          nota={nota}
          setNota={setNota}
          totalPedido={totalPedido}
          setMostrarNuevo={setMostrarNuevo}
          handleSubmit={handleSubmit}
          setPedidoSeleccionado={setPedidoSeleccionado}
          setProductosSeleccionado={setProductosSeleccionado}
        />
      )}

      {pedidoSeleccionado && (
        <EditarPedido
          pedidoSeleccionado={pedidoSeleccionado}
          handleSubmit={handleSubmit}
          estado={estado}
          setEstado={setEstado}
          productosSeleccionado={productosSeleccionado}
          setPedidoSeleccionado={setPedidoSeleccionado}
        />
      )}
    </Pagina>
  )
}

export default Pedidos
