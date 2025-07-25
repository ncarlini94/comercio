import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import sequelize from './db.js'

import './models/proveedores.model.js'
import './models/inventario.model.js'
import './models/pedidos.model.js'
import './models/usuarios.model.js'
import './models/ventas.model.js'
import './models/productosVendidos.model.js'
import './models/pedidos.model.js'
import './models/productosPedidos.model.js'

import './handles/usuarios.handle.js'
import './handles/inventario.handle.js'
import './handles/proveedores.handle.js'
import './handles/ventas.handle.js'
import './handles/pedidos.handle.js'
import './handles/dashboard.handle.js'

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    fullscreen: true,
    autoHideMenuBar: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.electron')
  await sequelize
    .sync()
    .then(() => {
      console.log('Base de datos sincronizada correctamente')
    })
    .catch((error) => {
      console.error('Error al sincronizar la base de datos:', error)
    })
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
