import {
  editarUsuario,
  existenUsuarios,
  login,
  obtenerUsuarios,
  registro
} from './../controllers/usuarios.controller'
import {
  actualizarRol,
  crearRol,
  eliminarRol,
  obtenerCatalogoPermisos,
  obtenerRoles
} from '../controllers/roles.controller.js'
import { cerrarSesion, sesionConPermisos } from '../services/sesion.js'
import { manejar } from '../services/canales.js'

manejar('existenUsuarios', async () => {
  try {
    return await existenUsuarios()
  } catch (error) {
    console.error('Error al verificar usuarios:', error)
    // Ante un error se asume que existen usuarios, para no habilitar el registro inicial.
    return true
  }
})

manejar('obtenerSesion', () => sesionConPermisos())

manejar('cerrarSesion', () => {
  cerrarSesion()
  return { success: true }
})

manejar('login', async (event, data) => {
  try {
    const { mail, password } = data ?? {}
    return await login(mail, password)
  } catch (error) {
    console.error('Error en el login:', error)
    return { success: false, message: 'Error en el login' }
  }
})

manejar('registro', async (event, data) => {
  try {
    const { usuario, mail, password, rol, estado } = data ?? {}
    return await registro(usuario, mail, password, rol, estado)
  } catch (error) {
    console.error('Error en el registro:', error)
    return { success: false, message: 'Error en el registro' }
  }
})

manejar('obtenerUsuarios', async () => {
  try {
    return await obtenerUsuarios()
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    return { success: false, message: 'Error al obtener usuarios' }
  }
})

manejar('editarUsuario', (event, id, cambios) => editarUsuario(id, cambios))

manejar('obtenerRoles', async () => {
  try {
    return { success: true, roles: await obtenerRoles() }
  } catch (error) {
    console.error('Error al obtener roles:', error)
    return { success: false, message: 'Error al obtener los roles' }
  }
})

manejar('obtenerCatalogoPermisos', () => ({ success: true, permisos: obtenerCatalogoPermisos() }))
manejar('crearRol', (event, datos) => crearRol(datos))
manejar('actualizarRol', (event, id, datos) => actualizarRol(id, datos))
manejar('eliminarRol', (event, id) => eliminarRol(id))
