// Cálculo de horarios de la copia programada. Funciones puras (sin Electron ni base de datos).
//
// config: { activada, frecuencia: 'diaria' | 'semanal', diaSemana: 0-6 (0 = domingo), hora: 'HH:MM' }

const conHora = (fecha, hora) => {
  const [h, m] = hora.split(':').map(Number)
  const resultado = new Date(fecha)
  resultado.setHours(h, m, 0, 0)
  return resultado
}

const coincideDia = (fecha, config) =>
  config.frecuencia !== 'semanal' || fecha.getDay() === Number(config.diaSemana)

// Último horario programado que ya pasó (<= ahora).
export const ultimoHorarioProgramado = (config, ahora = new Date()) => {
  for (let dias = 0; dias <= 7; dias++) {
    const dia = new Date(ahora)
    dia.setDate(dia.getDate() - dias)
    const candidato = conHora(dia, config.hora)
    if (candidato <= ahora && coincideDia(candidato, config)) return candidato
  }
  return null
}

// Próximo horario programado (> ahora).
export const proximoHorarioProgramado = (config, ahora = new Date()) => {
  for (let dias = 0; dias <= 7; dias++) {
    const dia = new Date(ahora)
    dia.setDate(dia.getDate() + dias)
    const candidato = conHora(dia, config.hora)
    if (candidato > ahora && coincideDia(candidato, config)) return candidato
  }
  return null
}

export const ESPERA_TRAS_ERROR_MS = 15 * 60 * 1000

// Indica si corresponde hacer la copia ahora. Si el programa estaba cerrado a la hora
// programada, la copia pendiente se hace en cuanto se vuelve a abrir.
// estado: { ultimaCopia, programadaDesde, ultimoError: { fecha } } (fechas en ISO)
export const correspondeCopia = (config, estado, ahora = new Date()) => {
  if (!config.activada || !config.carpeta) return false

  const ultimoError = estado.ultimoError?.fecha ? new Date(estado.ultimoError.fecha) : null
  if (ultimoError && ahora - ultimoError < ESPERA_TRAS_ERROR_MS) return false

  const ultimoHorario = ultimoHorarioProgramado(config, ahora)
  if (!ultimoHorario) return false

  const referencias = [estado.ultimaCopia, estado.programadaDesde]
    .filter(Boolean)
    .map((f) => new Date(f).getTime())
  const desde = referencias.length > 0 ? Math.max(...referencias) : 0
  return ultimoHorario.getTime() > desde
}
