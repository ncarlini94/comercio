# Datos de prueba

Archivos para probar la aplicación con datos realistas. Se generan con:

```
npm run datos-prueba
```

El generador está en `scripts/datos-prueba/generar.js`. Usa los mismos modelos que la app, así la
copia siempre tiene el esquema actual. Los datos son siempre los mismos; solo las fechas se
calculan a partir del día en que se genera (siempre hay ventas "de hoy").

## Archivos

| Archivo | Para qué sirve |
| --- | --- |
| `comercio-demo.db` | Copia completa. Se carga desde **Configuración → Copia de seguridad → Restaurar una copia**. |
| `inventario-ejemplo.xlsx` | Se importa desde **Configuración → Importar → Inventario**. |
| `proveedores-ejemplo.xlsx` | Se importa desde **Configuración → Importar → Proveedores**. |

## Contenido de `comercio-demo.db`

- 4 usuarios (ver abajo).
- 8 proveedores.
- 35 productos, 7 con stock por debajo del mínimo.
- Unas 180 ventas de los últimos 60 días, con todos los métodos de pago, e incluye ventas de hoy.
- 12 pedidos a proveedores en distintos estados (Pendiente, Pedido, Aprobado, Cancelado).

## Usuarios de prueba

Todos usan la contraseña `demo1234`.

| Mail | Rol | Estado |
| --- | --- | --- |
| `propietario@demo.com` | Propietario | Activo |
| `admin@demo.com` | Administrador | Activo |
| `vendedor@demo.com` | Vendedor | Activo |
| `inactivo@demo.com` | Vendedor | Inactivo |

## Resultado esperado al importar sobre la base demo

- **Inventario:** 5 importados, 1 que ya existía (Yerba mate) y 2 con errores (precio negativo y
  proveedor inexistente).
- **Proveedores:** 2 importados, 1 que ya existía (Distribuidora del Sur) y 1 con error (falta el
  mail).

## Importante

Restaurar `comercio-demo.db` reemplaza **todos** los datos actuales de la app. Antes de reemplazar,
la app guarda automáticamente una copia de los datos actuales, así que se pueden recuperar
restaurando esa copia.
