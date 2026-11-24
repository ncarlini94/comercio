import { app, BrowserWindow, dialog } from 'electron'
import { manejar } from '../services/canales.js'
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

manejar('elegirRespaldoParaRestaurar', async (event) => {
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

manejar('restaurarRespaldo', async () => {
  return restaurarRespaldo()
})

manejar('cancelarRestauracion', () => cancelarRestauracion())

// Borra la copia temporal analizada si se cierra la app sin restaurar.
app.on('will-quit', () => cancelarRestauracion())

manejar('obtenerRespaldo', () => {
  return { success: true, estado: obtenerEstadoRespaldo() }
})

manejar('guardarRespaldo', (_event, datos) => {
  try {
    return guardarConfigRespaldo(datos ?? {})
  } catch (error) {
    console.error('Error al guardar la configuración de copias:', error)
    return { success: false, message: 'Error al guardar la configuración' }
  }
})

manejar('elegirCarpetaRespaldo', async (event) => {
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

manejar('crearRespaldo', async () => {
  return crearRespaldo('manual')
})
