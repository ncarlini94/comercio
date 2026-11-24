// Genera datos de prueba para el comercio:
//   datos-prueba/comercio-demo.db          → copia completa para cargar desde "Restaurar"
//   datos-prueba/inventario-ejemplo.xlsx   → para probar "Importar > Inventario"
//   datos-prueba/proveedores-ejemplo.xlsx  → para probar "Importar > Proveedores"
//
// Uso: npm run datos-prueba
// Usa los mismos modelos que la app, así la copia siempre tiene el esquema correcto.
// Los datos son siempre los mismos (generador pseudoaleatorio con semilla fija), salvo las
// fechas, que se calculan respecto del día en que se genera.
import { app } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import * as XLSX from 'xlsx'
import bcrypt from 'bcryptjs'

const RAIZ = process.cwd()
const SALIDA = path.join(RAIZ, 'datos-prueba')
const TEMPORAL = path.join(SALIDA, '.generando')
const CONTRASENIA_DEMO = 'demo1234'

// La base de trabajo se crea en una carpeta temporal, nunca en la base real de la app.
fs.rmSync(TEMPORAL, { recursive: true, force: true })
fs.mkdirSync(TEMPORAL, { recursive: true })
app.setPath('userData', TEMPORAL)

// Generador pseudoaleatorio con semilla (mulberry32) para que los datos sean reproducibles.
let semilla = 20261124
const azar = () => {
  semilla = (semilla + 0x6d2b79f5) | 0
  let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const entero = (min, max) => min + Math.floor(azar() * (max - min + 1))
const elegir = (lista) => lista[Math.floor(azar() * lista.length)]

const PROVEEDORES = [
  ['Distribuidora del Sur', 'Marcela Gómez', 'ventas@delsur.com.ar', 'Av. Mitre 1520, Avellaneda'],
  [
    'Mayorista La Económica',
    'Jorge Pereyra',
    'pedidos@laeconomica.com.ar',
    'Ruta 3 km 28, La Matanza'
  ],
  ['Lácteos Don Ernesto', 'Ernesto Ruiz', 'ernesto@lacteosdon.com.ar', 'Calle 12 n° 845, Luján'],
  [
    'Bebidas Pampa',
    'Lucía Fernández',
    'comercial@bebidaspampa.com.ar',
    'Av. San Martín 3300, Morón'
  ],
  ['Limpieza Total SRL', 'Diego Acosta', 'dacosta@limpiezatotal.com.ar', 'Belgrano 778, Quilmes'],
  [
    'Panificadora El Trigal',
    'Sofía Medina',
    'sofia@eltrigal.com.ar',
    'Rivadavia 2101, Ramos Mejía'
  ],
  ['Golosinas Arcoíris', 'Pablo Romero', 'ventas@arcoiris.com.ar', 'Sarmiento 455, Lanús'],
  [
    'Almacén Mayorista Norte',
    'Valeria Ríos',
    'vrios@mayoristanorte.com.ar',
    'Av. Maipú 2890, Vicente López'
  ]
]

// [nombre, descripción, costo, índice de proveedor]
const PRODUCTOS = [
  ['Yerba mate 1 kg', 'Yerba con palo, paquete de 1 kg', 2800, 0],
  ['Azúcar 1 kg', 'Azúcar común tipo A', 950, 0],
  ['Arroz largo fino 1 kg', 'Arroz grano largo', 1100, 1],
  ['Fideos tallarines 500 g', 'Fideos secos de sémola', 780, 1],
  ['Aceite de girasol 1,5 L', 'Aceite de girasol botella', 2400, 1],
  ['Harina 000 1 kg', 'Harina de trigo 000', 650, 7],
  ['Puré de tomate 520 g', 'Puré de tomate en caja', 620, 7],
  ['Atún en aceite 170 g', 'Lata de atún al natural', 1650, 7],
  ['Leche entera 1 L', 'Leche entera sachet', 980, 2],
  ['Yogur bebible 1 L', 'Yogur sabor frutilla', 1450, 2],
  ['Queso cremoso 1 kg', 'Queso cremoso horma', 6800, 2],
  ['Manteca 200 g', 'Manteca pan', 1900, 2],
  ['Dulce de leche 400 g', 'Dulce de leche clásico', 1700, 2],
  ['Gaseosa cola 2,25 L', 'Gaseosa sabor cola', 1900, 3],
  ['Agua mineral 2 L', 'Agua sin gas', 750, 3],
  ['Cerveza rubia 1 L', 'Cerveza rubia retornable', 1600, 3],
  ['Jugo en polvo', 'Jugo sabor naranja, sobre', 280, 3],
  ['Vino tinto 750 ml', 'Vino tinto malbec', 3200, 3],
  ['Lavandina 1 L', 'Lavandina concentrada', 690, 4],
  ['Detergente 750 ml', 'Detergente lavavajillas', 1250, 4],
  ['Jabón en polvo 800 g', 'Jabón para ropa', 2600, 4],
  ['Papel higiénico x4', 'Papel higiénico doble hoja', 1800, 4],
  ['Esponja de cocina', 'Esponja doble faz', 350, 4],
  ['Pan lactal', 'Pan de molde blanco', 1850, 5],
  ['Galletitas de agua', 'Galletitas crackers 300 g', 900, 5],
  ['Bizcochos de grasa', 'Bizcochos 200 g', 1100, 5],
  ['Alfajor de chocolate', 'Alfajor triple', 650, 6],
  ['Chocolate con leche 100 g', 'Tableta de chocolate', 1500, 6],
  ['Caramelos surtidos', 'Bolsa de caramelos 150 g', 800, 6],
  ['Chicles menta', 'Paquete de chicles', 300, 6],
  ['Café molido 250 g', 'Café torrado molido', 3100, 0],
  ['Té en saquitos x25', 'Té negro', 700, 0],
  ['Mermelada de durazno', 'Mermelada 454 g', 1400, 7],
  ['Sal fina 500 g', 'Sal fina de mesa', 450, 1],
  ['Galletitas dulces', 'Galletitas surtidas 400 g', 1300, 5]
]

const USUARIOS = [
  ['Propietario Demo', 'propietario@demo.com', 'Propietario', 'Activo'],
  ['Administrador Demo', 'admin@demo.com', 'Administrador', 'Activo'],
  ['Vendedor Demo', 'vendedor@demo.com', 'Vendedor', 'Activo'],
  ['Vendedor Inactivo', 'inactivo@demo.com', 'Vendedor', 'Inactivo']
]

const METODOS = ['Efectivo', 'Efectivo', 'Mercado Pago', 'Mercado Pago', 'Debito', 'Credito']
const DIAS_DE_VENTAS = 60

const fechaHaceDias = (dias, horaMin = 9, horaMax = 20) => {
  const d = new Date()
  d.setDate(d.getDate() - dias)
  d.setHours(entero(horaMin, horaMax), entero(0, 59), entero(0, 59), 0)
  return d
}

const escribirExcel = (archivo, filas) => {
  const libro = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(libro, XLSX.utils.json_to_sheet(filas), 'Datos')
  XLSX.writeFile(libro, path.join(SALIDA, archivo))
}

app.whenReady().then(async () => {
  try {
    const { default: sequelize } = await import('../../src/main/db.js')
    const { default: Proveedores } = await import('../../src/main/models/proveedores.model.js')
    const { default: Inventario } = await import('../../src/main/models/inventario.model.js')
    const { default: Usuarios } = await import('../../src/main/models/usuarios.model.js')
    const { default: Ventas } = await import('../../src/main/models/ventas.model.js')
    const { default: ProductosVendidos } =
      await import('../../src/main/models/productosVendidos.model.js')
    const { default: Pedidos } = await import('../../src/main/models/pedidos.model.js')
    const { default: ProductosPedidos } =
      await import('../../src/main/models/productosPedidos.model.js')
    await sequelize.sync({ force: true })

    // Fechas a mano: Sequelize pone la fecha actual al crear, así que se actualizan después.
    const fijarFecha = (tabla, id, fecha) =>
      sequelize.query(`UPDATE "${tabla}" SET created_at = ?, updated_at = ? WHERE id = ?`, {
        replacements: [fecha.toISOString(), fecha.toISOString(), id]
      })

    // Usuarios
    const hash = await bcrypt.hash(CONTRASENIA_DEMO, 10)
    for (const [usuario, mail, rol, estado] of USUARIOS) {
      await Usuarios.create({ usuario, mail, password: hash, rol, estado })
    }

    // Proveedores
    const proveedores = []
    for (const [nombre, contacto, mail, direccion] of PROVEEDORES) {
      proveedores.push(
        await Proveedores.create({
          nombre,
          contacto,
          mail,
          telefono: 1140000000 + entero(100000, 999999),
          celular: 1150000000 + entero(100000, 999999),
          celular2: 1160000000 + entero(100000, 999999),
          direccion
        })
      )
    }

    // Productos con stock inicial alto; las ventas lo van bajando.
    const productos = []
    for (const [nombre, descripcion, costo, iProv] of PRODUCTOS) {
      const margen = 1.3 + entero(0, 20) / 100
      productos.push(
        await Inventario.create({
          nombre,
          descripcion,
          costo,
          precio: Math.round((costo * margen) / 10) * 10,
          stock: entero(40, 120),
          stock_minimo: entero(5, 15),
          id_proveedor: proveedores[iProv].id_proveedores
        })
      )
    }

    // Ventas de los últimos días (incluye ventas de hoy para el panel de control).
    const vendedores = USUARIOS.filter((u) => u[3] === 'Activo').map((u) => u[0])
    let totalVentas = 0
    for (let dia = DIAS_DE_VENTAS; dia >= 0; dia--) {
      const ventasDelDia = dia === 0 ? 6 : entero(1, 5)
      for (let v = 0; v < ventasDelDia; v++) {
        const items = new Map()
        for (let i = 0, n = entero(1, 4); i < n; i++) {
          const producto = elegir(productos)
          const cantidad = entero(1, 3)
          if (producto.stock - (items.get(producto) ?? 0) - cantidad < 0) continue
          items.set(producto, (items.get(producto) ?? 0) + cantidad)
        }
        if (items.size === 0) continue
        const total = [...items].reduce((s, [p, c]) => s + p.precio * c, 0)
        const venta = await Ventas.create({
          total,
          metodo: elegir(METODOS),
          vendedor: elegir(vendedores)
        })
        const fecha = dia === 0 ? fechaHaceDias(0, 8, new Date().getHours()) : fechaHaceDias(dia)
        await fijarFecha('Ventas', venta.id, fecha)
        for (const [producto, cantidad] of items) {
          const detalle = await ProductosVendidos.create({
            id_ventas: venta.id,
            producto: producto.nombre,
            cantidad,
            precio_unitario: producto.precio
          })
          await fijarFecha('Productos_vendidos', detalle.id, fecha)
          producto.stock -= cantidad
        }
        totalVentas++
      }
    }

    // Algunos productos quedan con stock bajo para ver las alertas.
    for (const producto of productos.slice(0, 35).filter((_, i) => i % 7 === 3)) {
      producto.stock = entero(0, producto.stock_minimo - 1)
    }
    for (const producto of productos) {
      await Inventario.update({ stock: producto.stock }, { where: { id: producto.id } })
    }

    // Pedidos a proveedores en distintos estados.
    const ESTADOS = [
      'Aprobado',
      'Aprobado',
      'Aprobado',
      'Pedido',
      'Pedido',
      'Pendiente',
      'Cancelado'
    ]
    let totalPedidos = 0
    for (let i = 0; i < 12; i++) {
      const iProv = entero(0, proveedores.length - 1)
      const delProveedor = productos.filter(
        (p) => p.id_proveedor === proveedores[iProv].id_proveedores
      )
      if (delProveedor.length === 0) continue
      const lineas = [...new Set(Array.from({ length: entero(1, 4) }, () => elegir(delProveedor)))]
      const cantidades = lineas.map(() => entero(6, 48))
      const total = lineas.reduce((s, p, j) => s + p.costo * cantidades[j], 0)
      const estado = i < 2 ? 'Pendiente' : elegir(ESTADOS)
      const pedido = await Pedidos.create({
        proveedor: proveedores[iProv].nombre,
        total,
        estado,
        nota: estado === 'Cancelado' ? 'Cancelado por falta de stock del proveedor' : null
      })
      const fecha = fechaHaceDias(i < 2 ? 0 : entero(1, DIAS_DE_VENTAS))
      await fijarFecha('Pedidos', pedido.id, fecha)
      for (const [j, producto] of lineas.entries()) {
        const linea = await ProductosPedidos.create({
          id_pedido: pedido.id,
          id_producto: producto.id,
          producto: producto.nombre,
          cantidad: cantidades[j],
          costo: producto.costo
        })
        await fijarFecha('Productos_pedidos', linea.id, fecha)
      }
      totalPedidos++
    }

    // Copia final con VACUUM INTO, igual que las copias de seguridad de la app.
    const destino = path.join(SALIDA, 'comercio-demo.db')
    fs.rmSync(destino, { force: true })
    await sequelize.query(`VACUUM INTO '${destino.replace(/'/g, "''")}'`)
    await sequelize.close()

    // Excel para probar la importación. Incluye filas con errores a propósito.
    escribirExcel('inventario-ejemplo.xlsx', [
      {
        nombre: 'Polenta 500 g',
        descripcion: 'Harina de maíz instantánea',
        costo: 700,
        precio: 950,
        stock: 30,
        stock_minimo: 5,
        id_proveedor: 1
      },
      {
        nombre: 'Lentejas 400 g',
        descripcion: 'Lentejas secas',
        costo: 900,
        precio: 1250,
        stock: 24,
        stock_minimo: 4,
        id_proveedor: 2
      },
      {
        nombre: 'Mayonesa 250 g',
        descripcion: 'Mayonesa doypack',
        costo: 1100,
        precio: 1500,
        stock: 20,
        stock_minimo: 5,
        id_proveedor: 8
      },
      {
        nombre: 'Gaseosa lima 2,25 L',
        descripcion: 'Gaseosa sabor lima limón',
        costo: 1850,
        precio: 2500,
        stock: 18,
        stock_minimo: 6,
        id_proveedor: 4
      },
      {
        nombre: 'Suavizante 900 ml',
        descripcion: 'Suavizante para ropa',
        costo: 1700,
        precio: 2300,
        stock: 12,
        stock_minimo: 3,
        id_proveedor: 5
      },
      {
        nombre: 'Yerba mate 1 kg',
        descripcion: 'Ya existe en la base demo: se informa como repetido',
        costo: 2800,
        precio: 3700,
        stock: 10,
        stock_minimo: 5,
        id_proveedor: 1
      },
      {
        nombre: 'Producto con error',
        descripcion: 'Precio negativo: se informa como error',
        costo: 500,
        precio: -10,
        stock: 5,
        stock_minimo: 1,
        id_proveedor: 1
      },
      {
        nombre: 'Producto sin proveedor',
        descripcion: 'Proveedor inexistente: se informa como error',
        costo: 500,
        precio: 700,
        stock: 5,
        stock_minimo: 1,
        id_proveedor: 99
      }
    ])
    escribirExcel('proveedores-ejemplo.xlsx', [
      {
        nombre: 'Frigorífico San Jorge',
        contacto: 'Raúl Benítez',
        mail: 'rbenitez@sanjorge.com.ar',
        telefono: 1143215678,
        celular: 1156781234,
        celular2: 1167894321,
        direccion: 'Av. Hipólito Yrigoyen 4500, Lanús'
      },
      {
        nombre: 'Verdulería Mayorista El Huerto',
        contacto: 'Carla Sosa',
        mail: 'csosa@elhuerto.com.ar',
        telefono: 1142223344,
        celular: 1155556666,
        celular2: 1166667777,
        direccion: 'Mercado Central, nave 4'
      },
      {
        nombre: 'Distribuidora del Sur',
        contacto: 'Marcela Gómez',
        mail: 'ventas@delsur.com.ar',
        telefono: 1140000000,
        celular: 1150000000,
        celular2: 1160000000,
        direccion: 'Ya existe en la base demo: se informa como repetido'
      },
      {
        nombre: 'Proveedor incompleto',
        contacto: 'Sin mail',
        mail: '',
        telefono: 1140000001,
        celular: 1150000001,
        celular2: 1160000001,
        direccion: 'Falta el mail: se informa como error'
      }
    ])

    console.log(`Datos de prueba generados en ${SALIDA}`)
    console.log(
      `Usuarios: ${USUARIOS.length} · Proveedores: ${proveedores.length} · Productos: ${productos.length} · Ventas: ${totalVentas} · Pedidos: ${totalPedidos}`
    )
    fs.rmSync(TEMPORAL, { recursive: true, force: true })
    app.exit(0)
  } catch (error) {
    console.error('Error al generar los datos de prueba:', error)
    app.exit(1)
  }
})
