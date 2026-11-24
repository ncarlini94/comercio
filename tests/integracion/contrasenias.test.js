import bcrypt from 'bcryptjs'
import { beforeEach, describe, expect, it } from 'vitest'
import { safeStorage } from 'electron'
import { CLAVE, crearUsuario, iniciarComo, prepararBase, Usuarios } from '../helpers/base.js'
import {
  editarUsuario,
  login,
  migrarContraseniasAnteriores,
  registro
} from '../../src/main/controllers/usuarios.controller.js'

// Formato anterior: cifrado con safeStorage y guardado en base64. El simulador de electron
// solo descifra lo que cifró, así se distingue una contraseña legible en este equipo de una
// traída de otra PC.
const anteriorLegible = (clave) => safeStorage.encryptString(clave).toString('base64')
const anteriorDeOtraPc = () => Buffer.from('cifrado-en-otro-equipo').toString('base64')
const passwordDe = async (mail) => (await Usuarios.findOne({ where: { mail } })).password

beforeEach(async () => {
  await prepararBase()
})

describe('formato de las contraseñas', () => {
  it('registro guarda un hash bcrypt', async () => {
    await registro('ana', 'ana@comercio.test', CLAVE)
    const guardada = await passwordDe('ana@comercio.test')
    expect(guardada).toMatch(/^\$2[aby]\$\d{2}\$/)
    expect(guardada).not.toContain(CLAVE)
    expect(await bcrypt.compare(CLAVE, guardada)).toBe(true)
  })

  it('rechaza contraseñas vacías y de más de 72 bytes', async () => {
    const vacia = await registro('ana', 'ana@comercio.test', '')
    expect(vacia).toEqual({ success: false, message: 'La contraseña es obligatoria' })

    // 37 "ñ" son 37 caracteres pero 74 bytes.
    const larga = await registro('ana', 'ana@comercio.test', 'ñ'.repeat(37))
    expect(larga.success).toBe(false)
    expect(larga.message).toMatch(/demasiado larga/)
    expect(await Usuarios.count()).toBe(0)

    expect((await registro('ana', 'ana@comercio.test', 'a'.repeat(72))).success).toBe(true)
  })

  it('editarUsuario rechaza una contraseña de más de 72 bytes', async () => {
    await iniciarComo({ rol: 'Propietario' })
    const otro = await crearUsuario({ rol: 'Vendedor', mail: 'beto@comercio.test' })
    const antes = await passwordDe('beto@comercio.test')
    const respuesta = await editarUsuario(otro.id_usuario, { password: 'x'.repeat(73) })
    expect(respuesta.success).toBe(false)
    expect(respuesta.message).toMatch(/demasiado larga/)
    expect(await passwordDe('beto@comercio.test')).toBe(antes)
  })
})

describe('migrarContraseniasAnteriores', () => {
  it('convierte las legibles, informa las ilegibles y una segunda pasada no cambia nada', async () => {
    const deOtraPc = anteriorDeOtraPc()
    await crearUsuario({
      mail: 'legible@comercio.test',
      passwordGuardada: anteriorLegible('vieja-1')
    })
    await crearUsuario({ mail: 'otrapc@comercio.test', passwordGuardada: deOtraPc })
    await crearUsuario({ mail: 'nuevo@comercio.test' })
    const hashNuevo = await passwordDe('nuevo@comercio.test')

    const primera = await migrarContraseniasAnteriores()
    expect(primera).toEqual({ migradas: 1, noLegibles: ['otrapc@comercio.test'], fallidas: 0 })

    const migrada = await passwordDe('legible@comercio.test')
    expect(migrada).toMatch(/^\$2[aby]\$/)
    expect(await bcrypt.compare('vieja-1', migrada)).toBe(true)
    expect(await passwordDe('otrapc@comercio.test')).toBe(deOtraPc)
    expect(await passwordDe('nuevo@comercio.test')).toBe(hashNuevo)

    const segunda = await migrarContraseniasAnteriores()
    expect(segunda).toEqual({ migradas: 0, noLegibles: ['otrapc@comercio.test'], fallidas: 0 })
    expect(await passwordDe('legible@comercio.test')).toBe(migrada)
    expect(await passwordDe('otrapc@comercio.test')).toBe(deOtraPc)
  })
})

describe('login con el formato anterior', () => {
  it('entra con la contraseña legible y la pasa a bcrypt', async () => {
    await crearUsuario({ mail: 'ana@comercio.test', passwordGuardada: anteriorLegible('vieja-1') })
    const respuesta = await login('ana@comercio.test', 'vieja-1')
    expect(respuesta.success).toBe(true)
    const guardada = await passwordDe('ana@comercio.test')
    expect(guardada).toMatch(/^\$2[aby]\$/)
    expect(await bcrypt.compare('vieja-1', guardada)).toBe(true)
    expect((await login('ana@comercio.test', 'vieja-1')).success).toBe(true)
  })

  it('con una contraseña de otra PC no entra y no la modifica', async () => {
    const deOtraPc = anteriorDeOtraPc()
    await crearUsuario({ mail: 'ana@comercio.test', passwordGuardada: deOtraPc })
    expect(await login('ana@comercio.test', 'cualquiera')).toEqual({
      success: false,
      message: 'Usuario o contraseña incorrectos'
    })
    expect(await passwordDe('ana@comercio.test')).toBe(deOtraPc)
  })
})
