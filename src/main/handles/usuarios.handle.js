import { ipcMain } from 'electron'
import { login, registro } from './../controllers/usuarios.controller'

ipcMain.handle('login', async (event, data) => {
  try {
    const { mail, password } = data
    const result = await login(mail, password)
    return result
  } catch (error) {
    console.error('Error en el login:', error)
    return { success: false, message: 'Error en el login' }
  }
})

ipcMain.handle('registro', async (event, data) => {
  try {
    const { usuario, mail, password } = data
    const result = await registro(usuario, mail, password)
    return result
  } catch (error) {
    console.error('Error en el registro:', error)
    return { success: false, message: 'Error en el registro' }
  }
})
