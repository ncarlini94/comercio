// Une clases de CSS ignorando valores vacíos: unirClases('a', cond && 'b', undefined) → "a b".
export const unirClases = (...clases) => clases.filter(Boolean).join(' ')
