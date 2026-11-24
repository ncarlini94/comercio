// Utilidades compartidas por los tests de integración: base limpia, usuarios y sesión.
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import sequelize from '../../src/main/db.js'
import Proveedores from '../../src/main/models/proveedores.model.js'
import Inventario from '../../src/main/models/inventario.model.js'
import Pedidos from '../../src/main/models/pedidos.model.js'
import Usuarios from '../../src/main/models/usuarios.model.js'
import Ventas from '../../src/main/models/ventas.model.js'
import ProductosVendidos from '../../src/main/models/productosVendidos.model.js'
import ProductosPedidos from '../../src/main/models/productosPedidos.model.js'
import Roles from '../../src/main/models/roles.model.js'
import { inicializarRoles } from '../../src/main/services/permisos.js'
import { cerrarSesion, iniciarSesion } from '../../src/main/services/sesion.js'
import { hashearContrasenia } from '../../src/main/services/contrasenias.js'

export {
  sequelize,
  Proveedores,
  Inventario,
  Pedidos,
  Usuarios,
  Ventas,
  ProductosVendidos,
  ProductosPedidos,
  Roles
}

export const CLAVE = 'clave-segura-1'

// Deja la base vacía con los roles iniciales y sin sesión.
export const prepararBase = async () => {
  cerrarSesion()
  await sequelize.sync({ force: true })
  await inicializarRoles()
}

let contador = 0

// Crea un usuario directamente en la base (contraseña con hash bcrypt).
export const crearUsuario = async (datos = {}) => {
  contador++
  return Usuarios.create({
    usuario: datos.usuario ?? `usuario${contador}`,
    mail: datos.mail ?? `usuario${contador}@comercio.test`,
    password: datos.passwordGuardada ?? (await hashearContrasenia(datos.password ?? CLAVE)),
    rol: datos.rol ?? 'Propietario',
    estado: datos.estado ?? 'Activo'
  })
}

// Crea un usuario y abre la sesión con él, como si hubiera iniciado sesión.
export const iniciarComo = async (datos = {}) => {
  const usuario = await crearUsuario(datos)
  iniciarSesion(usuario.get({ plain: true }))
  return usuario
}

export const crearProveedor = (datos = {}) =>
  Proveedores.create({
    nombre: 'Distribuidora Norte',
    contacto: 'Ana',
    mail: 'norte@proveedor.test',
    telefono: 1234,
    celular: 5678,
    celular2: 9012,
    direccion: 'Calle 1',
    ...datos
  })

export const crearProducto = (datos = {}) =>
  Inventario.create({
    nombre: 'Yerba',
    descripcion: 'Paquete de 1 kg',
    costo: 50,
    precio: 100,
    stock: 10,
    stock_minimo: 2,
    ...datos
  })

// Carpeta temporal fuera del repositorio.
export const carpetaTemporal = (prefijo = 'comercio-prueba-') =>
  fs.mkdtempSync(path.join(os.tmpdir(), prefijo))
