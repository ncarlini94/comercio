import {
  test,
  expect,
  PROPIETARIO,
  VENDEDOR,
  sembrarUsuarios,
  entrarComo,
  iniciarSesion,
  irA,
  filaDe
} from './ayudantes'

const tarjetaDeRol = (ventana, nombre) =>
  ventana
    .locator('div.flex-col')
    .filter({ has: ventana.getByRole('heading', { level: 2, name: nombre, exact: true }) })
    .last()

const modal = (ventana, titulo) =>
  ventana.locator('form').filter({ has: ventana.getByRole('heading', { name: titulo }) })

test('Propietario: crea, renombra y protege el borrado de un rol desde Roles', async ({
  ventana
}) => {
  await sembrarUsuarios(ventana)
  await entrarComo(ventana, PROPIETARIO)
  await irA(ventana, 'Roles')

  // Crear "Cajero" con dos permisos.
  await ventana.getByRole('button', { name: 'Nuevo rol' }).click()
  const nuevo = modal(ventana, 'Nuevo rol')
  await nuevo.getByRole('textbox').first().fill('Cajero')
  await nuevo.getByLabel('Ver ventas', { exact: true }).check()
  await nuevo.getByLabel('Crear venta', { exact: true }).check()
  await nuevo.getByRole('button', { name: 'Guardar' }).click()
  await expect(nuevo).toHaveCount(0)

  const cajero = tarjetaDeRol(ventana, 'Cajero')
  await expect(cajero.getByText('Ver ventas', { exact: true })).toBeVisible()
  await expect(cajero.getByText('Crear venta', { exact: true })).toBeVisible()
  await expect(cajero.getByText('0 usuarios')).toBeVisible()
  // Sin usuarios asignados se puede borrar.
  await expect(cajero.getByTitle('Borrar')).toBeVisible()

  // Con un usuario asignado ya no aparece el botón de borrar.
  await ventana.evaluate(async () => {
    const respuesta = await window.API.registro({
      usuario: 'Caja Uno',
      mail: 'caja@comercio.test',
      password: 'clave-caja',
      rol: 'Cajero',
      estado: 'Activo'
    })
    if (!respuesta.success) throw new Error(JSON.stringify(respuesta))
  })
  await irA(ventana, 'Usuarios')
  await irA(ventana, 'Roles')
  await expect(cajero.getByText('1 usuario', { exact: true })).toBeVisible()
  await expect(cajero.getByTitle('Borrar')).toHaveCount(0)

  // Renombrar el rol.
  await cajero.getByTitle('Editar').click()
  const edicion = modal(ventana, 'Editar rol: Cajero')
  await edicion.getByRole('textbox').first().fill('Caja principal')
  await edicion.getByRole('button', { name: 'Guardar' }).click()
  await expect(edicion).toHaveCount(0)
  await expect(tarjetaDeRol(ventana, 'Caja principal')).toBeVisible()
  await expect(ventana.getByRole('heading', { level: 2, name: 'Cajero', exact: true })).toHaveCount(
    0
  )

  // El usuario con ese rol muestra el nombre nuevo.
  await irA(ventana, 'Usuarios')
  await expect(filaDe(ventana, 'caja@comercio.test')).toContainText('Caja principal')
})

test('Usuarios: desactivar a un usuario impide su login y uno no puede cambiar su propio rol ni estado', async ({
  ventana
}) => {
  await sembrarUsuarios(ventana, [VENDEDOR])
  await entrarComo(ventana, PROPIETARIO)
  await irA(ventana, 'Usuarios')

  // Editándose a sí mismo, rol y estado están bloqueados.
  await filaDe(ventana, PROPIETARIO.mail).getByTitle('Editar usuario').click()
  const propia = modal(ventana, 'Editar usuario')
  await expect(propia.getByText('(usted)')).toBeVisible()
  await expect(propia.locator('select[name="rol"]')).toBeDisabled()
  await expect(propia.locator('select[name="estado"]')).toBeDisabled()
  await propia.getByRole('button', { name: 'Cancelar' }).click()
  await expect(propia).toHaveCount(0)

  // Pasar al Vendedor a Inactivo.
  await filaDe(ventana, VENDEDOR.mail).getByTitle('Editar usuario').click()
  const ajena = modal(ventana, 'Editar usuario')
  await expect(ajena.getByText('(usted)')).toHaveCount(0)
  await expect(ajena.locator('select[name="rol"]')).toBeEnabled()
  await ajena.locator('select[name="estado"]').selectOption('Inactivo')
  await ajena.getByRole('button', { name: 'Guardar' }).click()
  await expect(ajena).toHaveCount(0)

  await ventana.getByRole('button', { name: 'Cerrar sesión' }).click()
  await expect(ventana.getByRole('heading', { name: 'Iniciar Sesión' })).toBeVisible()
  await iniciarSesion(ventana, VENDEDOR)
  await expect(ventana.getByText(/inactivo/i)).toBeVisible()
  await expect(ventana.getByRole('button', { name: 'Cerrar sesión' })).toHaveCount(0)
})
