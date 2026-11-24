import { ipcMain } from 'electron'
import { sesionTieneAlgunPermiso } from './sesion.js'

// Permisos requeridos por cada canal IPC. Con una lista, alcanza con tener uno de ellos.
// PUBLICO: no requiere sesión (login, registro inicial, etc.).
// Todo canal registrado con manejar() tiene que estar acá: si falta, la app no arranca.
export const PUBLICO = 'publico'

export const PERMISOS_POR_CANAL = {
  // Sesión y registro (registro valida sus permisos en el controlador)
  existenUsuarios: PUBLICO,
  obtenerSesion: PUBLICO,
  cerrarSesion: PUBLICO,
  login: PUBLICO,
  registro: PUBLICO,
  'close-app': PUBLICO,

  // Usuarios y roles
  obtenerUsuarios: ['usuarios.ver'],
  editarUsuario: ['usuarios.editar'],
  obtenerRoles: ['usuarios.ver', 'roles.gestionar'],
  obtenerCatalogoPermisos: ['roles.gestionar'],
  crearRol: ['roles.gestionar'],
  actualizarRol: ['roles.gestionar'],
  eliminarRol: ['roles.gestionar'],

  // Dashboard
  obtenerTotalProductos: ['dashboard.ver'],
  obtenerTotalProveedores: ['dashboard.ver'],
  obtenerTotalVentasHoy: ['dashboard.ver'],
  obtenerTotalStockBajo: ['dashboard.ver'],
  obtenerUltimasVentas: ['dashboard.ver'],
  obtenerProductosStockBajo: ['dashboard.ver'],
  obtenerProductosMasVendidos: ['dashboard.ver'],

  // Ventas
  obtenerTodasLasVentas: ['ventas.ver'],
  obtenerProductosVenta: ['ventas.ver'],
  agregarVenta: ['ventas.crear'],
  eliminarVenta: ['ventas.anular'],

  // Inventario (la lista de productos también se usa al vender y al pedir)
  obtenerTodosLosProductos: ['inventario.ver', 'ventas.crear', 'pedidos.crear'],
  agregarProducto: ['inventario.crear'],
  actualizarProducto: ['inventario.editar'],
  eliminarProducto: ['inventario.eliminar'],

  // Proveedores (la lista también se usa en los formularios de productos y pedidos)
  obtenerTodosLosProveedores: [
    'proveedores.ver',
    'inventario.crear',
    'inventario.editar',
    'pedidos.crear'
  ],
  agregarProveedor: ['proveedores.crear'],
  actualizarProveedor: ['proveedores.editar'],
  eliminarProveedor: ['proveedores.eliminar'],

  // Pedidos
  obtenerTodosLosPedidos: ['pedidos.ver'],
  obtenerTodosLosProductosPedidos: ['pedidos.ver'],
  agregarPedido: ['pedidos.crear'],
  actualizarPedido: ['pedidos.cambiarEstado'],
  eliminarPedido: ['pedidos.eliminar'],

  // Configuración
  importar: ['configuracion.importar'],
  exportar: ['configuracion.exportar'],
  obtenerRespaldo: ['configuracion.respaldos'],
  guardarRespaldo: ['configuracion.respaldos'],
  elegirCarpetaRespaldo: ['configuracion.respaldos'],
  crearRespaldo: ['configuracion.respaldos'],
  elegirRespaldoParaRestaurar: ['configuracion.restaurar'],
  restaurarRespaldo: ['configuracion.restaurar'],
  cancelarRestauracion: PUBLICO
}

export const SIN_PERMISOS = {
  success: false,
  sinPermisos: true,
  message: 'No tiene permisos para esta acción',
  error: 'No tiene permisos para esta acción'
}

// Registra un canal IPC verificando antes los permisos de la sesión.
export const manejar = (canal, manejador) => {
  const requeridos = PERMISOS_POR_CANAL[canal]
  if (requeridos === undefined) {
    throw new Error(`El canal "${canal}" no tiene permisos definidos en PERMISOS_POR_CANAL`)
  }
  ipcMain.handle(canal, (event, ...args) => {
    if (requeridos !== PUBLICO && !sesionTieneAlgunPermiso(requeridos)) return SIN_PERMISOS
    return manejador(event, ...args)
  })
}
