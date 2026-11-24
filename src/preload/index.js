import { contextBridge, ipcRenderer } from 'electron'

// El preload corre en sandbox: solo puede usar "electron" (contextBridge, ipcRenderer).
// La ventana solo accede a los canales listados acá, nunca al ipcRenderer completo.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('API', {
      close: () => ipcRenderer.invoke('close-app'),

      login: (data) => ipcRenderer.invoke('login', data),
      registro: (data) => ipcRenderer.invoke('registro', data),
      obtenerUsuarios: () => ipcRenderer.invoke('obtenerUsuarios'),
      editarUsuario: (id, cambios) => ipcRenderer.invoke('editarUsuario', id, cambios),
      existenUsuarios: () => ipcRenderer.invoke('existenUsuarios'),

      obtenerRoles: () => ipcRenderer.invoke('obtenerRoles'),
      obtenerCatalogoPermisos: () => ipcRenderer.invoke('obtenerCatalogoPermisos'),
      crearRol: (datos) => ipcRenderer.invoke('crearRol', datos),
      actualizarRol: (id, datos) => ipcRenderer.invoke('actualizarRol', id, datos),
      eliminarRol: (id) => ipcRenderer.invoke('eliminarRol', id),
      obtenerSesion: () => ipcRenderer.invoke('obtenerSesion'),
      cerrarSesion: () => ipcRenderer.invoke('cerrarSesion'),

      obtenerTotalProductos: () => ipcRenderer.invoke('obtenerTotalProductos'),
      obtenerTotalProveedores: () => ipcRenderer.invoke('obtenerTotalProveedores'),
      obtenerTotalVentasHoy: (fecha) => ipcRenderer.invoke('obtenerTotalVentasHoy', fecha),
      obtenerTotalStockBajo: () => ipcRenderer.invoke('obtenerTotalStockBajo'),
      obtenerUltimasVentas: () => ipcRenderer.invoke('obtenerUltimasVentas'),
      obtenerProductosStockBajo: () => ipcRenderer.invoke('obtenerProductosStockBajo'),
      obtenerProductosMasVendidos: () => ipcRenderer.invoke('obtenerProductosMasVendidos'),

      obtenerTodosLosProductos: () => ipcRenderer.invoke('obtenerTodosLosProductos'),
      agregarProducto: (producto) => ipcRenderer.invoke('agregarProducto', producto),
      actualizarProducto: (id, producto) => ipcRenderer.invoke('actualizarProducto', id, producto),
      eliminarProducto: (id) => ipcRenderer.invoke('eliminarProducto', id),

      obtenerTodosLosProveedores: () => ipcRenderer.invoke('obtenerTodosLosProveedores'),
      agregarProveedor: (proveedor) => ipcRenderer.invoke('agregarProveedor', proveedor),
      actualizarProveedor: (id, proveedor) =>
        ipcRenderer.invoke('actualizarProveedor', id, proveedor),
      eliminarProveedor: (id) => ipcRenderer.invoke('eliminarProveedor', id),

      obtenerTodasLasVentas: () => ipcRenderer.invoke('obtenerTodasLasVentas'),
      obtenerProductosVenta: (id) => ipcRenderer.invoke('obtenerProductosVenta', id),
      agregarVenta: (venta) => ipcRenderer.invoke('agregarVenta', venta),
      eliminarVenta: (id) => ipcRenderer.invoke('eliminarVenta', id),

      obtenerTodosLosPedidos: () => ipcRenderer.invoke('obtenerTodosLosPedidos'),
      obtenerTodosLosProductosPedidos: (id) =>
        ipcRenderer.invoke('obtenerTodosLosProductosPedidos', id),
      actualizarPedido: (id, estado) => ipcRenderer.invoke('actualizarPedido', id, estado),
      agregarPedido: (pedido) => ipcRenderer.invoke('agregarPedido', pedido),
      eliminarPedido: (id) => ipcRenderer.invoke('eliminarPedido', id),

      importar: (seccion) => ipcRenderer.invoke('importar', seccion),
      exportar: (seccion) => ipcRenderer.invoke('exportar', seccion),

      obtenerRespaldo: () => ipcRenderer.invoke('obtenerRespaldo'),
      guardarRespaldo: (datos) => ipcRenderer.invoke('guardarRespaldo', datos),
      elegirCarpetaRespaldo: () => ipcRenderer.invoke('elegirCarpetaRespaldo'),
      crearRespaldo: () => ipcRenderer.invoke('crearRespaldo'),
      elegirRespaldoParaRestaurar: () => ipcRenderer.invoke('elegirRespaldoParaRestaurar'),
      restaurarRespaldo: () => ipcRenderer.invoke('restaurarRespaldo'),
      cancelarRestauracion: () => ipcRenderer.invoke('cancelarRestauracion')
    })
  } catch (error) {
    console.error(error)
  }
} else {
  // Sin aislamiento de contexto no se expone nada: la app requiere contextIsolation.
  console.error('contextIsolation desactivado: no se expone window.API')
}
