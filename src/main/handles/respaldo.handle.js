import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import {
  carpetaRespaldoConfigurada,
  crearRespaldo,
  guardarCarpetaRespaldo,
  guardarConfigRespaldo,
  obtenerEstadoRespaldo
} from '../services/respaldo/respaldo.js'
import {
  analizarRespaldo,
  cancelarRestauracion,
  restaurarRespaldo
} from '../services/respaldo/restauracion.js'
import { sesionTieneRol } from '../services/sesion.js'

const ROLES_CONFIGURACION = ['Propietario', 'Administrador']
// Restaurar reemplaza todos los datos: solo el Propietario puede hacerlo.
const ROLES_RESTAURACION = ['Propietario']
const SIN_PERMISOS = { success: false, message: 'No tiene permisos para esta acción' }

ipcMain.handle('elegirRespaldoParaRestaurar', async (event) => {
  if (!sesionTieneRol(ROLES_RESTAURACION)) return SIN_PERMISOS
  const { canceled, filePaths } = await dialog.showOpenDialog(
    BrowserWindow.fromWebContents(event.sender),
    {
      title: 'Elegir copia de seguridad para restaurar',
      defaultPath: carpetaRespaldoConfigurada() || undefined,
      properties: ['openFile'],
      filters: [{ name: 'Copia de seguridad', extensions: ['db'] }]
    }
  )
  if (canceled || filePaths.length === 0) return { success: false, canceled: true }
  return analizarRespaldo(filePaths[0])
})

ipcMain.handle('restaurarRespaldo', async () => {
  if (!sesionTieneRol(ROLES_RESTAURACION)) return SIN_PERMISOS
  return restaurarRespaldo()
})

ipcMain.handle('cancelarRestauracion', () => cancelarRestauracion())

// Borra la copia temporal analizada si se cierra la app sin restaurar.
app.on('will-quit', () => cancelarRestauracion())

ipcMain.handle('obtenerRespaldo', () => {
  if (!sesionTieneRol(ROLES_CONFIGURACION)) return SIN_PERMISOS
  return { success: true, estado: obtenerEstadoRespaldo() }
})

ipcMain.handle('guardarRespaldo', (_event, datos) => {
  if (!sesionTieneRol(ROLES_CONFIGURACION)) return SIN_PERMISOS
  try {
    return guardarConfigRespaldo(datos ?? {})
  } catch (error) {
    console.error('Error al guardar la configuración de copias:', error)
    return { success: false, message: 'Error al guardar la configuración' }
  }
})

ipcMain.handle('elegirCarpetaRespaldo', async (event) => {
  if (!sesionTieneRol(ROLES_CONFIGURACION)) return SIN_PERMISOS
  const { canceled, filePaths } = await dialog.showOpenDialog(
    BrowserWindow.fromWebContents(event.sender),
    {
      title: 'Carpeta para las copias de seguridad',
      properties: ['openDirectory', 'createDirectory']
    }
  )
  if (canceled || filePaths.length === 0) return { success: false, canceled: true }
  return guardarCarpetaRespaldo(filePaths[0])
})

ipcMain.handle('crearRespaldo', async () => {
  if (!sesionTieneRol(ROLES_CONFIGURACION)) return SIN_PERMISOS
  return crearRespaldo('manual')
})
