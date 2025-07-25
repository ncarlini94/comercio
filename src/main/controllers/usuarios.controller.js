import Usuarios from '../models/usuarios.model.js'
import { safeStorage } from 'electron'
import jwt from 'jsonwebtoken'

const SECRET = 'COMERCIO'
export const login = async (mail, password) => {
  try {
    const usuario = await Usuarios.findOne({
      where: { mail }
    })
    if (usuario) {
      const passwordDesencriptada = safeStorage.decryptString(
        Buffer.from(usuario.password, 'base64')
      )
      if (passwordDesencriptada === password) {
        const token = jwt.sign(
          { id: usuario.id_usuario, mail: usuario.mail, usuario: usuario.usuario },
          SECRET
        )
        return {
          success: true,
          message: 'Login exitoso',
          usuario: usuario.get({ plain: true }),
          token
        }
      } else {
        return {
          success: false,
          message: 'Usuario o contraseña incorrectos'
        }
      }
    } else {
      return {
        success: false,
        message: 'Usuario o contraseña incorrectos'
      }
    }
  } catch (error) {
    console.error('Error al realizar login:', error)
  }
}

export const registro = async (usuario, mail, password) => {
  try {
    const verificar = await Usuarios.findOne({
      where: { mail }
    })
    if (verificar) {
      return {
        success: false,
        message: 'El usuario ya existe'
      }
    }
    const passwordEncriptada = safeStorage.encryptString(password).toString('base64')
    await Usuarios.create({
      usuario,
      mail,
      password: passwordEncriptada
    })
    return {
      success: true,
      message: 'Registro exitoso'
    }
  } catch (error) {
    console.error('Error al realizar registro:', error)
    return { error: 'Error al realizar registro' }
  }
}
