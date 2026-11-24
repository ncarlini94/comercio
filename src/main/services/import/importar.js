import * as XLSX from 'xlsx'
import sequelize from '../../db.js'
import Inventario from '../../models/inventario.model.js'
import Proveedores from '../../models/proveedores.model.js'

// Lee la primera hoja del Excel y normaliza los encabezados (sin espacios y en minúscula),
// así "Nombre" o " nombre " se interpretan igual que "nombre".
const leerFilas = (filePath) => {
  const workbook = XLSX.readFile(filePath)
  const hoja = workbook.Sheets[workbook.SheetNames[0]]
  const filas = XLSX.utils.sheet_to_json(hoja, { defval: '' })
  return filas.map((fila) =>
    Object.fromEntries(
      Object.entries(fila).map(([clave, valor]) => [
        String(clave).trim().toLowerCase(),
        typeof valor === 'string' ? valor.trim() : valor
      ])
    )
  )
}

const texto = (fila, campo, errores) => {
  const valor = fila[campo]
  if (valor === '' || valor === null || valor === undefined) {
    errores.push(`falta "${campo}"`)
    return null
  }
  return String(valor)
}

const numero = (fila, campo, errores, { entero = false } = {}) => {
  const valor = fila[campo]
  if (valor === '' || valor === null || valor === undefined) {
    errores.push(`falta "${campo}"`)
    return null
  }
  const n = Number(valor)
  if (!Number.isFinite(n) || n < 0 || (entero && !Number.isInteger(n))) {
    errores.push(`"${campo}" debe ser un número ${entero ? 'entero ' : ''}mayor o igual a 0`)
    return null
  }
  return n
}

const importarInventario = async (filas) => {
  const proveedores = await Proveedores.findAll({ attributes: ['id_proveedores'], raw: true })
  const idsProveedores = new Set(proveedores.map((p) => p.id_proveedores))
  const existentes = await Inventario.findAll({ attributes: ['nombre'], raw: true })
  const nombres = new Set(existentes.map((p) => p.nombre.toLowerCase()))

  const validos = []
  const errores = []
  let duplicados = 0

  filas.forEach((fila, i) => {
    const problemas = []
    const producto = {
      nombre: texto(fila, 'nombre', problemas),
      descripcion: texto(fila, 'descripcion', problemas),
      costo: numero(fila, 'costo', problemas),
      precio: numero(fila, 'precio', problemas),
      stock: numero(fila, 'stock', problemas, { entero: true }),
      stock_minimo: numero(fila, 'stock_minimo', problemas, { entero: true }),
      id_proveedor: numero(fila, 'id_proveedor', problemas, { entero: true })
    }
    if (producto.id_proveedor !== null && !idsProveedores.has(producto.id_proveedor)) {
      problemas.push(`no existe el proveedor con id ${producto.id_proveedor}`)
    }
    if (problemas.length > 0) {
      errores.push({ fila: i + 2, mensaje: problemas.join(', ') })
      return
    }
    const clave = producto.nombre.toLowerCase()
    if (nombres.has(clave)) {
      duplicados++
      return
    }
    nombres.add(clave)
    validos.push(producto)
  })

  await sequelize.transaction(async (transaction) => {
    for (const producto of validos) {
      await Inventario.create(producto, { transaction })
    }
  })

  return { insertados: validos.length, duplicados, errores }
}

const importarProveedores = async (filas) => {
  const existentes = await Proveedores.findAll({ attributes: ['nombre', 'mail'], raw: true })
  const claves = new Set(existentes.map((p) => `${p.nombre}|${p.mail}`.toLowerCase()))

  const validos = []
  const errores = []
  let duplicados = 0

  filas.forEach((fila, i) => {
    const problemas = []
    const proveedor = {
      nombre: texto(fila, 'nombre', problemas),
      contacto: texto(fila, 'contacto', problemas),
      mail: texto(fila, 'mail', problemas),
      telefono: numero(fila, 'telefono', problemas, { entero: true }),
      celular: numero(fila, 'celular', problemas, { entero: true }),
      celular2: numero(fila, 'celular2', problemas, { entero: true }),
      direccion: texto(fila, 'direccion', problemas)
    }
    if (problemas.length > 0) {
      errores.push({ fila: i + 2, mensaje: problemas.join(', ') })
      return
    }
    const clave = `${proveedor.nombre}|${proveedor.mail}`.toLowerCase()
    if (claves.has(clave)) {
      duplicados++
      return
    }
    claves.add(clave)
    validos.push(proveedor)
  })

  await sequelize.transaction(async (transaction) => {
    for (const proveedor of validos) {
      await Proveedores.create(proveedor, { transaction })
    }
  })

  return { insertados: validos.length, duplicados, errores }
}

const IMPORTADORES = {
  inventario: importarInventario,
  proveedores: importarProveedores
}

export const SECCIONES_IMPORTABLES = Object.keys(IMPORTADORES)

// Importa el Excel en una sola transacción: las filas con errores se informan y se saltean;
// si falla la escritura en la base, no se guarda ninguna fila.
export default async function importar(seccion, filePath) {
  const importador = IMPORTADORES[seccion]
  if (!importador) {
    return { success: false, message: `La sección "${seccion}" no se puede importar` }
  }
  const filas = leerFilas(filePath)
  if (filas.length === 0) {
    return { success: false, message: 'El archivo no tiene filas para importar' }
  }
  const resultado = await importador(filas)
  return { success: true, total: filas.length, ...resultado }
}
