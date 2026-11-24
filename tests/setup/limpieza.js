// Limpieza global de Vitest: al terminar la corrida (con todos los procesos de test ya
// cerrados y sin archivos de SQLite abiertos) borra las carpetas temporales que creó
// tests/mocks/electron.js durante esta corrida.
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

export default function () {
  const inicio = Date.now()
  return () => {
    const temporal = os.tmpdir()
    for (const nombre of fs.readdirSync(temporal)) {
      if (!nombre.startsWith('comercio-test-')) continue
      const ruta = path.join(temporal, nombre)
      try {
        if (fs.statSync(ruta).birthtimeMs >= inicio)
          fs.rmSync(ruta, { recursive: true, force: true })
      } catch {
        // Si algo sigue bloqueado, queda en %TEMP% y lo limpia el sistema.
      }
    }
  }
}
