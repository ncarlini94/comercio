import path from 'node:path'
import fs from 'node:fs'
import { app } from 'electron'
import { Sequelize } from '@sequelize/core'
import { SqliteDialect } from '@sequelize/sqlite3'

const userDataPath = app.getPath('userData')

const dbPath = path.join(userDataPath, 'database.db')
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
