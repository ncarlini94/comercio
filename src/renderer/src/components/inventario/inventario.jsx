import { useState, useEffect } from 'react'
import { AlertTriangle, Boxes, Package, Pencil, Plus, Trash2, Wallet } from 'lucide-react'
import AgregarProducto from './agregarProducto/agregarProducto'
import EditarProducto from './editarPoducto/editarProducto'
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
import { formatearMoneda, formatearNumero } from '../../utils/formato'

// Los canales devuelven { error } o { success: false, message } cuando algo falla.
const respuestaConError = (r) => Boolean(r?.error) || r?.success === false
const detalleError = (r) => r?.error || r?.message

const tieneStockBajo = (producto) => parseInt(producto.stock) <= parseInt(producto.stock_minimo)

const Inventario = () => {
  const { puede } = usePermisos()
  const avisos = useAvisos()
  const confirmar = useConfirmar()
  const [productos, setProductos] = useState([])
  const [cargado, setCargado] = useState(false)
  const [proveedores, setProveedores] = useState()
  const [editingProducto, setEditingProducto] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroStock, setFiltroStock] = useState('todos')
  const [loading, setLoading] = useState(false)
  const [showFormAgregar, setShowFormAgregar] = useState(false)
  const [showFormEditar, setShowFormEditar] = useState(false)

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    costo: '',
    precio: '',
    stock: '',
    stock_minimo: '',
    id_proveedor: ''
  })

  useEffect(() => {
    cargarProductos().finally(() => setCargado(true))
    cargarProveedores()
  }, [])

  const cargarProductos = async () => {
    try {
      const data = await window.API.obtenerTodosLosProductos()
      if (Array.isArray(data)) {
        setProductos(data)
      } else {
        setProductos([])
      }
    } catch (error) {
      console.error('Error al obtener productos:', error)
      setProductos([])
    }
  }

  const cargarProveedores = async () => {
    try {
      const data = await window.API.obtenerTodosLosProveedores()
      if (Array.isArray(data)) {
        setProveedores(data)
      } else {
        setProveedores([])
      }
    } catch (error) {
      console.error('Error al obtener proveedores:', error)
      setProveedores([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      let resultado
      if (editingProducto) {
        const normalizado = {
          ...formData,
          precio: formData.precio ? parseInt(formData.precio) : null,
          stock: formData.stock ? parseInt(formData.stock) : null,
          stock_minimo: formData.stock_minimo ? parseInt(formData.stock_minimo) : null
        }
        resultado = await window.API.actualizarProducto(editingProducto.id, normalizado)
      } else {
        resultado = await window.API.agregarProducto({
          ...formData,
          costo: formData.costo ? parseFloat(formData.costo) : null,
          precio: parseFloat(formData.precio),
          stock: parseFloat(formData.stock),
          stock_minimo: parseFloat(formData.stock_minimo),
          id_proveedor: formData.id_proveedor || null
        })
      }
      if (respuestaConError(resultado)) {
        avisos.error('No se pudo guardar el producto', detalleError(resultado))
      } else {
        avisos.exito(editingProducto ? 'Producto actualizado' : 'Producto agregado')
      }
      resetForm()
      cargarProductos()
    } catch (error) {
      console.error('Error al guardar producto:', error)
      avisos.error('No se pudo guardar el producto')
    }
    setLoading(false)
  }

  const handleEdit = (producto) => {
    setEditingProducto(producto)
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      costo: producto.costo?.toString() || '',
      precio: producto.precio?.toString() || '',
      stock: producto.stock?.toString() || '',
      stock_minimo: producto.stock_minimo?.toString() || '',
      id_proveedor: producto.id_proveedor?.toString() || ''
    })
    setShowFormEditar(true)
  }

  const handleDelete = async (producto) => {
    const confirmado = await confirmar({
      titulo: 'Borrar producto',
      mensaje: `Se borrará "${producto.nombre}". Esta acción no se puede deshacer.`,
      textoConfirmar: 'Borrar',
      peligro: true
    })
    if (!confirmado) return
    try {
      const resultado = await window.API.eliminarProducto(producto.id)
      if (respuestaConError(resultado)) {
        avisos.error('No se pudo borrar el producto', detalleError(resultado))
      } else {
        avisos.exito('Producto borrado')
      }
      cargarProductos()
    } catch (error) {
      console.error('Error al eliminar producto:', error)
      avisos.error('No se pudo borrar el producto')
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      costo: '',
      precio: '',
      stock: '',
      stock_minimo: '',
      id_proveedor: ''
    })
    setEditingProducto(null)
    setShowFormEditar(false)
    setShowFormAgregar(false)
  }

  const productosConStockBajo = productos.filter(tieneStockBajo)
  const valorInventario = productos.reduce(
    (total, p) => total + (Number(p.costo) || 0) * (Number(p.stock) || 0),
    0
  )

  const filteredProductos = productos.filter(
    (producto) =>
      (filtroStock === 'todos' || tieneStockBajo(producto)) &&
      (producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (producto.sku || '').toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const sinProveedores = proveedores?.length === 0

  const renderLista = () => {
    if (!cargado) return <Cargando texto="Cargando productos…" />
    if (productos.length === 0) {
      return (
        <EstadoVacio
          icono={Package}
          titulo="Todavía no hay productos"
          descripcion={
            sinProveedores
              ? 'Primero agregá un proveedor para poder cargar productos.'
              : 'Los productos que agregues aparecen acá.'
          }
        />
      )
    }
    if (filteredProductos.length === 0) {
      return (
        <EstadoVacio
          titulo="No hay resultados"
          descripcion="Probá con otra búsqueda o con otro filtro."
        />
      )
    }
    return (
      <Tabla desplazable>
        <TablaEncabezado>
          <TablaCelda encabezado>Producto</TablaCelda>
          <TablaCelda encabezado>Proveedor</TablaCelda>
          <TablaCelda encabezado alinear="derecha">
            Costo
          </TablaCelda>
          <TablaCelda encabezado alinear="derecha">
            Precio
          </TablaCelda>
          <TablaCelda encabezado alinear="derecha">
            Stock
          </TablaCelda>
          <TablaCelda encabezado alinear="derecha">
            Stock mínimo
          </TablaCelda>
          <TablaCelda encabezado alinear="derecha">
            Acciones
          </TablaCelda>
        </TablaEncabezado>
        <TablaCuerpo>
          {filteredProductos.map((producto) => (
            <TablaFila key={producto.id}>
              <TablaCelda>
                <p className="font-medium">{producto.nombre}</p>
                {producto.descripcion && (
                  <p className="text-texto-secundario">{producto.descripcion}</p>
                )}
              </TablaCelda>
              <TablaCelda className="text-texto-secundario">
                {producto.Proveedor?.nombre || 'Sin asignar'}
              </TablaCelda>
              <TablaCelda alinear="derecha">{formatearMoneda(producto.costo)}</TablaCelda>
              <TablaCelda alinear="derecha">{formatearMoneda(producto.precio)}</TablaCelda>
              <TablaCelda alinear="derecha">
                {tieneStockBajo(producto) ? (
                  <Insignia variante="peligro" icono={AlertTriangle}>
                    {formatearNumero(producto.stock)}
                  </Insignia>
                ) : (
                  formatearNumero(producto.stock)
                )}
              </TablaCelda>
              <TablaCelda alinear="derecha" className="text-texto-secundario">
                {formatearNumero(producto.stock_minimo)}
              </TablaCelda>
              <TablaCelda alinear="derecha" className="whitespace-nowrap">
                {puede('inventario.editar') && (
                  <BotonIcono
                    icono={Pencil}
                    etiqueta="Editar"
                    onClick={() => handleEdit(producto)}
                  />
                )}
                {puede('inventario.eliminar') && (
                  <BotonIcono
                    icono={Trash2}
                    etiqueta="Borrar"
                    variante="peligro"
                    onClick={() => handleDelete(producto)}
                  />
                )}
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
        icono={Package}
        titulo="Inventario"
        subtitulo={`${formatearNumero(productos.length)} ${productos.length === 1 ? 'producto' : 'productos'}`}
        acciones={
          puede('inventario.crear') && (
            <Boton
              variante="primario"
              icono={Plus}
              onClick={() => {
                resetForm()
                setShowFormAgregar(true)
              }}
              disabled={sinProveedores}
              title={sinProveedores ? 'Primero agregá un proveedor' : undefined}
            >
              Agregar producto
            </Boton>
          )
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TarjetaMetrica
          etiqueta="Productos"
          valor={formatearNumero(productos.length)}
          icono={Boxes}
        />
        <TarjetaMetrica
          etiqueta="Con stock bajo"
          valor={formatearNumero(productosConStockBajo.length)}
          icono={AlertTriangle}
        />
        <TarjetaMetrica
          etiqueta="Valor del inventario a costo"
          valor={formatearMoneda(valorInventario)}
          icono={Wallet}
        />
      </div>

      <BarraHerramientas>
        <Buscador
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar productos..."
          etiqueta="Buscar productos"
        />
        <Selector
          value={filtroStock}
          onChange={(e) => setFiltroStock(e.target.value)}
          aria-label="Filtrar por stock"
          className="sm:w-48"
        >
          <option value="todos">Todos los productos</option>
          <option value="bajo">Solo stock bajo</option>
        </Selector>
      </BarraHerramientas>

      {renderLista()}

      {showFormAgregar && (
        <AgregarProducto
          loading={loading}
          proveedores={proveedores}
          resetForm={resetForm}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
        />
      )}
      {showFormEditar && (
        <EditarProducto
          loading={loading}
          proveedores={proveedores}
          resetForm={resetForm}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
        />
      )}
    </Pagina>
  )
}

export default Inventario
