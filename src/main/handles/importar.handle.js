import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import { join } from 'node:path'
import importar from '../services/import/importar.js'
import exportar from '../services/export/exportar.js'
import { sesionTieneRol } from '../services/sesion.js'

const ROLES_CONFIGURACION = ['Propietario', 'Administrador']
const SIN_PERMISOS = { success: false, message: 'No tiene permisos para esta acción' }
const FILTRO_EXCEL = [{ name: 'Excel', extensions: ['xlsx'] }]

// El diálogo de archivos se abre en el proceso principal: el renderer nunca elige una ruta arbitraria.
ipcMain.handle('importar', async (event, seccion) => {
  if (!sesionTieneRol(ROLES_CONFIGURACION)) return SIN_PERMISOS
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog(
      BrowserWindow.fromWebContents(event.sender),
      { properties: ['openFile'], filters: FILTRO_EXCEL }
    )
    if (canceled || filePaths.length === 0) return { success: false, canceled: true }
    return await importar(seccion, filePaths[0])
  } catch (error) {
    console.error('Error al importar:', error)
    return {
      success: false,
      message: 'Error al importar el archivo. No se guardó ningún registro.'
    }
  }
})

ipcMain.handle('exportar', async (event, seccion) => {
  if (!sesionTieneRol(ROLES_CONFIGURACION)) return SIN_PERMISOS
  try {
    // Fecha local (toISOString usa UTC y de noche daría el día siguiente).
    const fecha = new Date().toLocaleDateString('sv-SE')
    const { canceled, filePath } = await dialog.showSaveDialog(
      BrowserWindow.fromWebContents(event.sender),
      {
        defaultPath: join(app.getPath('documents'), `${seccion}-${fecha}.xlsx`),
        filters: FILTRO_EXCEL
      }
    )
    if (canceled || !filePath) return { success: false, canceled: true }
    return await exportar(seccion, filePath)
  } catch (error) {
    console.error('Error al exportar:', error)
    return { success: false, message: 'Error al exportar el archivo' }
  }
})
