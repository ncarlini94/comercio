// Tema claro/oscuro. Si el usuario nunca eligió uno, se sigue el tema del sistema operativo.
const CLAVE = 'tema'
const consultaSistema = window.matchMedia('(prefers-color-scheme: dark)')

const leerPreferencia = () => {
  try {
    const valor = localStorage.getItem(CLAVE)
    return valor === 'oscuro' || valor === 'claro' ? valor : null
  } catch {
    return null
  }
}

export const temaActual = () => leerPreferencia() ?? (consultaSistema.matches ? 'oscuro' : 'claro')

const aplicarTema = () => {
  document.documentElement.classList.toggle('dark', temaActual() === 'oscuro')
}

export const cambiarTema = (tema) => {
  try {
    localStorage.setItem(CLAVE, tema)
  } catch {
    // Sin almacenamiento disponible el cambio dura hasta cerrar la app.
  }
  document.documentElement.classList.toggle('dark', tema === 'oscuro')
}

export const iniciarTema = () => {
  aplicarTema()
  consultaSistema.addEventListener('change', () => {
    if (leerPreferencia() === null) aplicarTema()
  })
}

export const CLAVE_TEMA = CLAVE
