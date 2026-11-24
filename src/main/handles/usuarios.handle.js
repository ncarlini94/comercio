import { ipcMain } from 'electron'
import {
  existenUsuarios,
  login,
  obtenerUsuarios,
  registro
} from './../controllers/usuarios.controller'
import { cerrarSesion, obtenerSesion } from '../services/sesion.js'

ipcMain.handle('existenUsuarios', async () => {
  try {
    return await existenUsuarios()
  } catch (error) {
    console.error('Error al verificar usuarios:', error)
    // Ante un error se asume que existen usuarios, para no habilitar el registro inicial.
    return true
  }
})

ipcMain.handle('obtenerSesion', () => obtenerSesion())

ipcMain.handle('cerrarSesion', () => {
  cerrarSesion()
  return { success: true }
})

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
    const { usuario, mail, password, rol, estado } = data
    const result = await registro(usuario, mail, password, rol, estado)
    return result
  } catch (error) {
    console.error('Error en el registro:', error)
    return { success: false, message: 'Error en el registro' }
  }
})

ipcMain.handle('obtenerUsuarios', async () => {
  try {
    const usuarios = await obtenerUsuarios()
    return usuarios
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    return { success: false, message: 'Error al obtener usuarios' }
  }
})
