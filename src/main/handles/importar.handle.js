import { app, BrowserWindow, dialog } from 'electron'
import { manejar, SIN_PERMISOS } from '../services/canales.js'
import { sesionTienePermiso } from '../services/sesion.js'
import { join } from 'node:path'
import importar from '../services/import/importar.js'
import exportar from '../services/export/exportar.js'

const FILTRO_EXCEL = [{ name: 'Excel', extensions: ['xlsx'] }]

// El diálogo de archivos se abre en el proceso principal: el renderer nunca elige una ruta arbitraria.
manejar('importar', async (event, seccion) => {
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

manejar('exportar', async (event, seccion) => {
  // La lista de usuarios solo la exporta quien puede verla.
  if (['usuarios', 'todo'].includes(seccion) && !sesionTienePermiso('usuarios.ver')) {
    return SIN_PERMISOS
  }
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
