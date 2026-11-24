import path from 'node:path'
import fs from 'node:fs'
import { app } from 'electron'
import { Sequelize } from '@sequelize/core'
import { SqliteDialect } from '@sequelize/sqlite3'

// COMERCIO_USER_DATA permite abrir la app con otra carpeta de datos (la usan los tests de
// punta a punta para no tocar la base real).
if (process.env.COMERCIO_USER_DATA) app.setPath('userData', process.env.COMERCIO_USER_DATA)

const userDataPath = app.getPath('userData')

export const dbPath = path.join(userDataPath, 'database.db')
console.log('Ruta de la base de datos:', dbPath)

if (!fs.existsSync(userDataPath)) {
  fs.mkdirSync(userDataPath, { recursive: true })
  console.log('Directorio userData creado:', userDataPath)
}

const sequelize = new Sequelize({
  dialect: SqliteDialect,
  storage: dbPath,
  logging: false
})

export default sequelize
