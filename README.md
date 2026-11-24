# Comercio

Aplicación de escritorio desarrollada con Electron y React para la gestión de comercios.

## Características principales

- Inventario: Control de productos y stock.
- Ventas: Registro y seguimiento de ventas.
- Proveedores: Gestión de proveedores y compras.
- Usuarios: Administración de usuarios y permisos.
- Pedidos: Control y seguimiento de pedidos.
- Dashboard: Panel de control con estadísticas.

## Tecnologías utilizadas

- Electron
- React
- Node.js
- SQLite (con Sequelize)
- Vitest y Playwright (tests)

## Estructura del proyecto

- `src/main/`: Lógica principal y controladores.
- `src/preload/`: Scripts de preload para Electron.
- `src/renderer/`: Interfaz de usuario.
- `resources/`: Recursos estáticos (iconos, imágenes).
- `.vscode/`: Configuración recomendada para Visual Studio Code.

## Configuración recomendada del IDE

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

## Tests

```bash
# Tests unitarios y de integración (Vitest), contra una base SQLite temporal
npm test

# Modo observador mientras se programa
npm test -- --watch

# Tests de punta a punta (Playwright): compila y abre la app real con datos temporales
npm run test:e2e
```

- `tests/unit/`: lógica pura (horarios de copias, validaciones, permisos).
- `tests/integracion/`: controladores y servicios del proceso principal contra SQLite.
- `tests/e2e/`: flujos completos en la app compilada (login, roles, permisos por rol).

`npm test` ejecuta Vitest con el Node que trae Electron, porque el módulo nativo `sqlite3`
está compilado para Electron. El módulo `electron` se reemplaza por `tests/mocks/electron.js`.
Los tests de punta a punta usan la variable `COMERCIO_USER_DATA` para abrir la app con una
carpeta de datos temporal; nunca tocan la base real.

## Datos de prueba

```bash
npm run datos-prueba
```

Genera en `datos-prueba/` una copia completa para restaurar desde la app y dos Excel para
importar. Ver `datos-prueba/LEEME.md`.

## Build

```bash
# Para Windows
npm run build:win

# Para macOS
npm run build:mac

# Para Linux
npm run build:linux
```

## Contribución

¡Las contribuciones son bienvenidas! Puedes abrir issues o enviar pull requests para mejorar el proyecto.

## Autor

Creado por [Tu Nombre](tu-email@example.com)
