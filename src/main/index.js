import { app, shell, BrowserWindow, dialog } from 'electron'
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
import './models/productosPedidos.model.js'
import './models/roles.model.js'

import './handles/usuarios.handle.js'
import './handles/inventario.handle.js'
import './handles/proveedores.handle.js'
import './handles/ventas.handle.js'
import './handles/pedidos.handle.js'
import './handles/dashboard.handle.js'
import './handles/importar.handle.js'
import './handles/respaldo.handle.js'
import { iniciarProgramadorRespaldo } from './services/respaldo/respaldo.js'
import { migrarContraseniasAnteriores } from './controllers/usuarios.controller.js'
import { inicializarRoles } from './services/permisos.js'
import { aplicarMigraciones } from './services/migraciones.js'
import { manejar } from './services/canales.js'

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: true,
    fullscreen: true,
    autoHideMenuBar: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      // El preload no tiene acceso a Node.js; solo se comunica por los canales de window.API.
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
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
  // Columnas nuevas sobre bases existentes (sync no las agrega). Solo agregan, nunca borran.
  // Si una falla, su transacción deja la base como estaba, pero la app no puede funcionar con
  // la estructura vieja: se avisa y se cierra en lugar de abrir con pantallas rotas.
  try {
    await aplicarMigraciones()
  } catch (error) {
    console.error('Error al aplicar migraciones:', error)
    dialog.showErrorBox(
      'No se pudo actualizar la base de datos',
      'Los datos no se modificaron. Cierre otros programas que puedan estar usando la base y ' +
        `vuelva a abrir la aplicación. Detalle: ${error.message}`
    )
    app.exit(1)
    return
  }
  // Crea los roles por defecto si faltan y carga sus permisos en memoria.
  await inicializarRoles().catch((error) => console.error('Error al inicializar roles:', error))
  // Contraseñas del formato anterior (cifradas por equipo) → bcrypt. Si falla, el login
  // igual las acepta y las convierte al iniciar sesión.
  await migrarContraseniasAnteriores().catch((error) =>
    console.error('Error al migrar contraseñas:', error)
  )
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  // Después de sincronizar la base: hace las copias programadas y recupera las pendientes.
  iniciarProgramadorRespaldo()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

manejar('close-app', () => {
  app.quit()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
