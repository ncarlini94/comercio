import {
  test,
  expect,
  PROPIETARIO,
  ADMINISTRADOR,
  VENDEDOR,
  sembrarUsuarios,
  sembrarVenta,
  entrarComo,
  irA,
  filaDe
} from './ayudantes'

// Deja una venta cargada por el Propietario y la ventana en el login. Devuelve el id de la venta.
const prepararVenta = async (ventana) => {
  await sembrarUsuarios(ventana, [VENDEDOR])
  await entrarComo(ventana, PROPIETARIO)
  const idVenta = await sembrarVenta(ventana)
  await ventana.getByRole('button', { name: 'Cerrar sesión' }).click()
  await expect(ventana.getByRole('heading', { name: 'Iniciar Sesión' })).toBeVisible()
  return idVenta
}

test('Vendedor: sin sección Administrar, redirige sin permiso y no puede anular ventas', async ({
  ventana
}) => {
  const idVenta = await prepararVenta(ventana)
  await entrarComo(ventana, VENDEDOR)

  await expect(ventana.getByText(`${VENDEDOR.usuario} · Vendedor`)).toBeVisible()
  await expect(ventana.getByText('Administrar', { exact: true })).toHaveCount(0)
  for (const seccion of ['Usuarios', 'Roles', 'Configuración']) {
    await expect(ventana.getByRole('button', { name: seccion, exact: true })).toHaveCount(0)
  }

  // Entrar por URL a una sección sin permiso lleva a la primera habilitada (Dashboard).
  await ventana.evaluate(() => (window.location.hash = '#/usuarios'))
  await expect(ventana.getByRole('heading', { name: 'Panel de Control' })).toBeVisible()
  expect(await ventana.evaluate(() => window.location.hash)).toBe('#/')

  await irA(ventana, 'Ventas')
  await expect(ventana.getByRole('button', { name: 'Nueva Venta' })).toBeVisible()
  const fila = filaDe(ventana, `#${idVenta}`)
  await expect(fila).toHaveCount(1)
  // Solo queda el botón de ver detalle; el de anular no se muestra.
  await expect(fila.getByRole('button')).toHaveCount(1)
})

test('Vendedor: el proceso principal rechaza acciones sin permiso pedidas desde la ventana', async ({
  ventana
}) => {
  const idVenta = await prepararVenta(ventana)
  await entrarComo(ventana, VENDEDOR)

  const resultado = await ventana.evaluate(async (id) => {
    const eliminar = await window.API.eliminarVenta(id)
    const usuarios = await window.API.obtenerUsuarios()
    const rol = await window.API.crearRol({ nombre: 'Intruso', descripcion: '', permisos: [] })
    const ventas = await window.API.obtenerTodasLasVentas()
    return {
      eliminar,
      usuarios,
      rol,
      ventaSigue: Array.isArray(ventas) && ventas.some((v) => v.id === id),
      electron: typeof window.electron,
      require: typeof window.require,
      process: typeof window.process
    }
  }, idVenta)

  expect(resultado.eliminar).toMatchObject({ success: false, sinPermisos: true })
  expect(resultado.usuarios).toMatchObject({ success: false, sinPermisos: true })
  expect(resultado.rol).toMatchObject({ success: false, sinPermisos: true })
  expect(resultado.ventaSigue).toBe(true)
  expect(resultado.electron).toBe('undefined')
  expect(resultado.require).toBe('undefined')
  expect(resultado.process).toBe('undefined')
})

test('Administrador: no puede otorgar "Restaurar una copia" ni editar al Propietario', async ({
  ventana
}) => {
  await sembrarUsuarios(ventana, [ADMINISTRADOR, VENDEDOR])
  await entrarComo(ventana, ADMINISTRADOR)
  await expect(ventana.getByText(`${ADMINISTRADOR.usuario} · Administrador`)).toBeVisible()

  await irA(ventana, 'Roles')
  await ventana.getByRole('button', { name: 'Nuevo rol' }).click()
  await expect(ventana.getByLabel('Restaurar una copia (reemplaza todos los datos)')).toBeDisabled()
  await expect(ventana.getByLabel('Crear venta', { exact: true })).toBeEnabled()
  await ventana.getByRole('button', { name: 'Cancelar' }).click()

  await irA(ventana, 'Usuarios')
  await expect(filaDe(ventana, PROPIETARIO.mail)).toHaveCount(1)
  await expect(filaDe(ventana, PROPIETARIO.mail).getByTitle('Editar usuario')).toHaveCount(0)
  await expect(filaDe(ventana, VENDEDOR.mail).getByTitle('Editar usuario')).toBeVisible()
})
