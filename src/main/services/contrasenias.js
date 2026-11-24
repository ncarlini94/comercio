import bcrypt from 'bcryptjs'
import { safeStorage } from 'electron'

// Las contraseñas se guardan como hash bcrypt: no dependen del equipo, así una copia de
// seguridad restaurada en otra PC sigue permitiendo iniciar sesión.
const COSTO = 10

export const esHashBcrypt = (valor) => typeof valor === 'string' && /^\$2[aby]\$\d{2}\$/.test(valor)

export const hashearContrasenia = (contrasenia) => bcrypt.hash(contrasenia, COSTO)

// Hash fijo para comparar cuando el mail no existe: la respuesta tarda lo mismo que con una
// contraseña incorrecta.
const HASH_FICTICIO = bcrypt.hashSync('contrasenia-ficticia', COSTO)
export const igualarTiempoDeRespuesta = async (contrasenia) => {
  await bcrypt.compare(contrasenia, HASH_FICTICIO)
}

// Formato anterior: cifrado con safeStorage. Solo se puede leer en el equipo donde se creó.
export const descifrarContraseniaAnterior = (valor) => {
  try {
    return safeStorage.decryptString(Buffer.from(valor, 'base64'))
  } catch {
    return null
  }
}

// Devuelve si la contraseña es correcta y si está guardada en el formato anterior.
export const verificarContrasenia = async (contrasenia, guardada) => {
  if (esHashBcrypt(guardada)) {
    return { valida: await bcrypt.compare(contrasenia, guardada), formatoAnterior: false }
  }
  const anterior = descifrarContraseniaAnterior(guardada)
  return { valida: anterior !== null && anterior === contrasenia, formatoAnterior: true }
}
