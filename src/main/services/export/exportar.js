import * as XLSX from 'xlsx'
import Inventario from '../../models/inventario.model.js'
import Proveedores from '../../models/proveedores.model.js'
import Ventas from '../../models/ventas.model.js'
import ProductosVendidos from '../../models/productosVendidos.model.js'
import Pedidos from '../../models/pedidos.model.js'
import ProductosPedidos from '../../models/productosPedidos.model.js'
import Usuarios from '../../models/usuarios.model.js'

// Las columnas de Inventario y Proveedores usan los mismos nombres que espera el importador,
// así un archivo exportado se puede volver a importar sin cambios.
const hojasInventario = async () => {
  const productos = await Inventario.findAll({
    include: [{ model: Proveedores, as: 'Proveedor', attributes: ['nombre'] }],
    order: [['id', 'ASC']]
  })
  return [
    {
      nombre: 'Inventario',
      filas: productos.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        descripcion: p.descripcion,
        costo: p.costo,
        precio: p.precio,
        stock: p.stock,
        stock_minimo: p.stock_minimo,
        id_proveedor: p.id_proveedor,
        proveedor: p.Proveedor?.nombre ?? ''
      }))
    }
  ]
}

const hojasProveedores = async () => {
  const proveedores = await Proveedores.findAll({ order: [['id_proveedores', 'ASC']], raw: true })
  return [
    {
      nombre: 'Proveedores',
      filas: proveedores.map((p) => ({
        id_proveedores: p.id_proveedores,
        nombre: p.nombre,
        contacto: p.contacto,
        mail: p.mail,
        telefono: p.telefono,
        celular: p.celular,
        celular2: p.celular2,
        direccion: p.direccion
      }))
    }
  ]
}

const hojasVentas = async () => {
  const ventas = await Ventas.findAll({ order: [['id', 'ASC']], raw: true })
  const detalle = await ProductosVendidos.findAll({ order: [['id_ventas', 'ASC']], raw: true })
  return [
    {
      nombre: 'Ventas',
      filas: ventas.map((v) => ({
        id: v.id,
        fecha: new Date(v.created_at),
        total: v.total,
        metodo: v.metodo,
        vendedor: v.vendedor ?? ''
      }))
    },
    {
      nombre: 'Ventas - Detalle',
      filas: detalle.map((d) => ({
        id_venta: d.id_ventas,
        producto: d.producto,
        cantidad: d.cantidad,
        precio_unitario: d.precio_unitario,
        subtotal: d.cantidad * d.precio_unitario
      }))
    }
  ]
}

const hojasPedidos = async () => {
  const pedidos = await Pedidos.findAll({ order: [['id', 'ASC']], raw: true })
  const detalle = await ProductosPedidos.findAll({ order: [['id_pedido', 'ASC']], raw: true })
  return [
    {
      nombre: 'Pedidos',
      filas: pedidos.map((p) => ({
        id: p.id,
        fecha: new Date(p.created_at),
        proveedor: p.proveedor ?? '',
        estado: p.estado ?? '',
        total: p.total ?? 0,
        nota: p.nota ?? ''
      }))
    },
    {
      nombre: 'Pedidos - Detalle',
      filas: detalle.map((d) => ({
        id_pedido: d.id_pedido,
        id_producto: d.id_producto,
        producto: d.producto,
        cantidad: d.cantidad,
        costo: d.costo,
        subtotal: d.cantidad * d.costo
      }))
    }
  ]
}

// Nunca se exporta la contraseña.
const hojasUsuarios = async () => {
  const usuarios = await Usuarios.findAll({
    attributes: ['id_usuario', 'usuario', 'mail', 'rol', 'estado', 'created_at'],
    order: [['id_usuario', 'ASC']],
    raw: true
  })
  return [
    {
      nombre: 'Usuarios',
      filas: usuarios.map((u) => ({
        id_usuario: u.id_usuario,
        usuario: u.usuario,
        mail: u.mail,
        rol: u.rol,
        estado: u.estado,
        fecha_alta: new Date(u.created_at)
      }))
    }
  ]
}

const EXPORTADORES = {
  inventario: hojasInventario,
  proveedores: hojasProveedores,
  ventas: hojasVentas,
  pedidos: hojasPedidos,
  usuarios: hojasUsuarios
}

export const SECCIONES_EXPORTABLES = [...Object.keys(EXPORTADORES), 'todo']

const obtenerHojas = async (seccion) => {
  if (seccion === 'todo') {
    const grupos = await Promise.all(Object.values(EXPORTADORES).map((fn) => fn()))
    return grupos.flat()
  }
  return EXPORTADORES[seccion]()
}

export default async function exportar(seccion, filePath) {
  if (!SECCIONES_EXPORTABLES.includes(seccion)) {
    return { success: false, message: `La sección "${seccion}" no se puede exportar` }
  }
  const hojas = await obtenerHojas(seccion)
  const workbook = XLSX.utils.book_new()
  let registros = 0
  for (const { nombre, filas } of hojas) {
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(filas), nombre)
    registros += filas.length
  }
  XLSX.writeFile(workbook, filePath)
  return { success: true, filePath, registros }
}
