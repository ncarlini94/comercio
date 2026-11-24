import { test as base, expect, _electron as electron } from '@playwright/test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

// Datos de prueba: solo existen en la carpeta temporal de cada test.
export const PROPIETARIO = {
  usuario: 'Dueña',
  mail: 'duena@comercio.test',
  password: 'clave-duena'
}
export const ADMINISTRADOR = {
  usuario: 'Admin',
  mail: 'admin@comercio.test',
  password: 'clave-admin',
  rol: 'Administrador'
}
export const VENDEDOR = {
  usuario: 'Vende',
  mail: 'vende@comercio.test',
  password: 'clave-vende',
  rol: 'Vendedor'
}

// Cada test abre la app compilada con una carpeta de datos nueva (base vacía) y la borra al final.
export const test = base.extend({
  // eslint-disable-next-line no-empty-pattern
  app: async ({}, usar) => {
    const datos = fs.mkdtempSync(path.join(os.tmpdir(), 'comercio-e2e-'))
    const app = await electron.launch({
      args: ['out/main/index.js'],
      env: { ...process.env, COMERCIO_USER_DATA: datos }
    })
    try {
      await usar(app)
    } finally {
      await app.close().catch(() => {})
      fs.rmSync(datos, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
    }
  },
  ventana: async ({ app }, usar) => {
    const ventana = await app.firstWindow()
    await ventana.waitForLoadState('domcontentloaded')
    await usar(ventana)
  }
})

export { expect }

// Crea al Propietario (y opcionalmente otros usuarios) desde window.API, sin pasar por la interfaz.
// Al terminar no queda ninguna sesión abierta y la ventana está en el login.
export const sembrarUsuarios = async (ventana, otros = []) => {
  await expect(ventana.getByText('Configuración inicial')).toBeVisible()
  await ventana.evaluate(
    async ({ propietario, otros }) => {
      const verificar = (respuesta, paso) => {
        if (!respuesta?.success) throw new Error(`${paso}: ${JSON.stringify(respuesta)}`)
      }
      verificar(
        await window.API.registro({ ...propietario, rol: 'Propietario', estado: 'Activo' }),
        'registro'
      )
      verificar(await window.API.login(propietario), 'login')
      for (const usuario of otros) {
        verificar(await window.API.registro({ ...usuario, estado: 'Activo' }), usuario.usuario)
      }
      await window.API.cerrarSesion()
    },
    { propietario: PROPIETARIO, otros }
  )
  await ventana.evaluate(() => (window.location.hash = '#/login'))
  await expect(ventana.getByRole('heading', { name: 'Iniciar Sesión' })).toBeVisible()
}

// Crea un proveedor, un producto y una venta. Requiere una sesión con esos permisos.
export const sembrarVenta = async (ventana) =>
  ventana.evaluate(async () => {
    const proveedor = await window.API.agregarProveedor({
      nombre: 'Proveedor de prueba',
      contacto: 'Contacto',
      mail: 'proveedor@comercio.test',
      telefono: 1,
      celular: 1,
      celular2: 1,
      direccion: 'Calle 1'
    })
    const producto = await window.API.agregarProducto({
      nombre: 'Yerba',
      descripcion: 'Yerba 1 kg',
      costo: 100,
      precio: 200,
      stock: 10,
      stock_minimo: 1,
      id_proveedor: proveedor.id_proveedores
    })
    const venta = await window.API.agregarVenta({
      carrito: [{ id_producto: producto.id, cantidad: 2 }],
      metodo: 'Efectivo',
      vendedor: 'Dueña'
    })
    if (!venta?.venta_id) throw new Error(`No se creó la venta: ${JSON.stringify(venta)}`)
    return venta.venta_id
  })

// Inicia sesión a través del formulario de login.
export const iniciarSesion = async (ventana, { mail, password }) => {
  await ventana.locator('#Mail').fill(mail)
  await ventana.getByLabel('Contraseña:').fill(password)
  await ventana.getByRole('button', { name: 'Iniciar Sesión' }).click()
}

// Inicia sesión por el formulario y espera a que aparezca la barra lateral.
export const entrarComo = async (ventana, usuario) => {
  await iniciarSesion(ventana, usuario)
  await expect(ventana.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible()
}

export const irA = async (ventana, seccion) => {
  await ventana.getByRole('button', { name: seccion, exact: true }).click()
  await expect(ventana.getByRole('heading', { level: 1, name: seccion, exact: true })).toBeVisible()
}

export const filaDe = (ventana, texto) => ventana.getByRole('row').filter({ hasText: texto })
