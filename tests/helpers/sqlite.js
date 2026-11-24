import { Sequelize } from '@sequelize/core'
import { SqliteDialect } from '@sequelize/sqlite3'

// Abre un archivo SQLite con una conexión propia, ejecuta la consulta y la cierra.
export const consultarArchivo = async (archivo, sql) => {
  const conexion = new Sequelize({ dialect: SqliteDialect, storage: archivo, logging: false })
  try {
    const [filas] = await conexion.query(sql)
    return filas
  } finally {
    await conexion.close()
  }
}

export const contarFilas = async (archivo, tabla) => {
  const [{ total }] = await consultarArchivo(archivo, `SELECT COUNT(*) AS total FROM "${tabla}"`)
  return Number(total)
}

// Espera hasta que la condición se cumpla o se agote el tiempo.
export const esperarHasta = async (condicion, tiempoMaximoMs = 5000) => {
  const limite = Date.now() + tiempoMaximoMs
  while (Date.now() < limite) {
    if (await condicion()) return true
    await new Promise((resolver) => setTimeout(resolver, 50))
  }
  return false
}
