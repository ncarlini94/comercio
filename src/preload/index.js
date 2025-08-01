import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('API', {
      close: () => ipcRenderer.invoke('close-app'),

      login: (data) => ipcRenderer.invoke('login', data),
      registro: (data) => ipcRenderer.invoke('registro', data),

      obtenerTotalProductos: () => ipcRenderer.invoke('obtenerTotalProductos'),
      obtenerTotalProveedores: () => ipcRenderer.invoke('obtenerTotalProveedores'),
      obtenerTotalVentasHoy: (fecha) => ipcRenderer.invoke('obtenerTotalVentasHoy', fecha),
      obtenerTotalStockBajo: () => ipcRenderer.invoke('obtenerTotalStockBajo'),
      obtenerUltimasVentas: () => ipcRenderer.invoke('obtenerTodasLasVentas'),
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
      obtenerProveedorPorId: (id) => ipcRenderer.invoke('obtenerProveedorPorId', id),

      obtenerTodasLasVentas: () => ipcRenderer.invoke('obtenerTodasLasVentas'),
      obtenerProductosVenta: (id) => ipcRenderer.invoke('obtenerProductosVenta', id),
      agregarVenta: (venta) => ipcRenderer.invoke('agregarVenta', venta),
      eliminarVenta: (id) => ipcRenderer.invoke('eliminarVenta', id),

      obtenerTodosLosPedidos: () => ipcRenderer.invoke('obtenerTodosLosPedidos'),
      obtenerTodosLosProductosPedidos: (id) =>
        ipcRenderer.invoke('obtenerTodosLosProductosPedidos', id),
      obtenerPedidoPorId: (id) => ipcRenderer.invoke('obtenerPedidoPorId', id),
      actualizarPedido: (id, estado) => ipcRenderer.invoke('actualizarPedido', id, estado),
      agregarPedido: (pedido) => ipcRenderer.invoke('agregarPedido', pedido),
      eliminarPedido: (id) => ipcRenderer.invoke('eliminarPedido', id)
    })
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
