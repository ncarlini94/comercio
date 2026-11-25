import {
  test,
  expect,
  PROPIETARIO,
  sembrarUsuarios,
  entrarComo,
  iniciarSesion,
  esperarUsuarioActual
} from './ayudantes'

test('primer inicio: crea al Propietario, inicia sesión y ve todas las secciones', async ({
  ventana
}) => {
  await expect(ventana.getByRole('heading', { name: 'Configuración inicial' })).toBeVisible()

  await ventana.getByLabel('Usuario', { exact: true }).fill(PROPIETARIO.usuario)
  await ventana.getByLabel('Correo electrónico', { exact: true }).fill(PROPIETARIO.mail)
  await ventana.getByLabel('Contraseña', { exact: true }).fill(PROPIETARIO.password)
  await ventana.getByRole('button', { name: 'Crear cuenta' }).click()

  await expect(ventana.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible()
  await iniciarSesion(ventana, PROPIETARIO)

  await expect(ventana.getByRole('heading', { name: 'Panel de Control' })).toBeVisible()
  await expect(ventana.getByText('Administrar', { exact: true })).toBeVisible()
  for (const seccion of ['Dashboard', 'Ventas', 'Usuarios', 'Roles', 'Configuración']) {
    await expect(ventana.getByRole('button', { name: seccion, exact: true })).toBeVisible()
  }
  await esperarUsuarioActual(ventana, PROPIETARIO.usuario, 'Propietario')
})

test('el tema claro/oscuro se alterna y se conserva al recargar', async ({ ventana }) => {
  await sembrarUsuarios(ventana)
  await entrarComo(ventana, PROPIETARIO)

  const esOscuro = () => ventana.evaluate(() => document.documentElement.classList.contains('dark'))
  const botonTema = ventana.getByRole('button', { name: /^Modo (claro|oscuro) activo$/ })
  const estabaOscuro = await esOscuro()

  await botonTema.click()
  const oscuroEsperado = !estabaOscuro
  const etiquetaEsperada = oscuroEsperado ? 'Modo oscuro activo' : 'Modo claro activo'
  await expect.poll(esOscuro).toBe(oscuroEsperado)
  await expect(botonTema).toHaveAccessibleName(etiquetaEsperada)

  await ventana.reload()
  await expect(botonTema).toHaveAccessibleName(etiquetaEsperada)
  expect(await esOscuro()).toBe(oscuroEsperado)
})
