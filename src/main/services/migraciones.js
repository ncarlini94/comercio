import sequelize from '../db.js'

// Cambios de estructura sobre bases que ya existen. `sequelize.sync()` crea las tablas
// nuevas pero no agrega columnas a las existentes: eso se hace acá.
//
// Reglas de cada migración:
//   - solo AGREGA (columnas o datos en columnas nuevas): nunca borra ni modifica datos existentes;
//   - es idempotente: revisa el estado actual y no hace nada si ya está aplicada;
//   - corre dentro de una transacción: si falla, la base queda como estaba.

const columnasDe = async (tabla, transaction) => {
  const [columnas] = await sequelize.query(`PRAGMA table_info("${tabla}")`, { transaction })
  return columnas.map((c) => c.name)
}

const MIGRACIONES = [
  {
    nombre: 'id_producto en el detalle de ventas',
    // Antes el detalle guardaba solo el nombre del producto. Con el id, anular una venta
    // devuelve el stock aunque el producto se haya renombrado.
    aplicar: async (transaction) => {
      const columnas = await columnasDe('Productos_vendidos', transaction)
      if (columnas.length === 0 || columnas.includes('id_producto')) return false
      // Columna nueva, opcional y sin restricción hacia Inventario: borrar un producto
      // nunca borra ni bloquea el detalle de las ventas.
      await sequelize.query('ALTER TABLE `Productos_vendidos` ADD COLUMN `id_producto` INTEGER', {
        transaction
      })
      // Ventas anteriores: se completa el id solo si el nombre coincide con un único producto.
      // Si no hay coincidencia o hay varias, queda vacío y se sigue usando el nombre.
      await sequelize.query(
        `UPDATE \`Productos_vendidos\`
           SET \`id_producto\` = (
             SELECT i.\`id\` FROM \`Inventario\` i WHERE i.\`nombre\` = \`Productos_vendidos\`.\`producto\`
           )
         WHERE \`id_producto\` IS NULL
           AND (
             SELECT COUNT(*) FROM \`Inventario\` i WHERE i.\`nombre\` = \`Productos_vendidos\`.\`producto\`
           ) = 1`,
        { transaction }
      )
      return true
    }
  }
]

// Columnas que agregan las migraciones: una copia de seguridad anterior que no las tiene se
// puede restaurar igual, porque al reiniciar la app se vuelven a aplicar.
export const COLUMNAS_QUE_AGREGAN_LAS_MIGRACIONES = {
  Productos_vendidos: ['id_producto']
}

export const aplicarMigraciones = async () => {
  for (const migracion of MIGRACIONES) {
    const aplicada = await sequelize.transaction((transaction) => migracion.aplicar(transaction))
    if (aplicada) console.log(`Migración aplicada: ${migracion.nombre}`)
  }
}
