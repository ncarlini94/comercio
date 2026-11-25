/**
 * Componentes generales de la interfaz. Usan solo colores semánticos definidos en index.css
 * (bg-fondo, bg-superficie, bg-superficie-alt, bg-campo, border-borde, border-borde-fuerte,
 * text-texto, text-texto-secundario, text-texto-tenue, bg-primario, hover:bg-primario-hover,
 * text-sobre-primario, bg-primario-suave, text-primario-texto y, para peligro, exito,
 * advertencia e info: bg-X, bg-X-suave, text-X-texto). No hace falta ninguna variante dark:.
 * Las pantallas no deberían escribir colores sueltos: si falta algo, se agrega acá.
 * El área de contenido del menú lateral ya tiene padding (p-6): las pantallas no agregan otro.
 *
 * Componentes (props principales; los que envuelven un elemento nativo aceptan también sus props):
 * - Boton: variante 'primario'|'secundario'|'peligro'|'fantasma' (def. secundario), tamano 'sm'|'md'|'lg',
 *   icono (componente de lucide-react), anchoCompleto, type (def. 'button'). Un solo primario por vista.
 * - BotonIcono: icono*, etiqueta* (aria-label y title), variante 'neutral'|'primario'|'peligro', tamano 'sm'|'md'.
 * - Campo: <input> con estilo; invalido. Selector: <select> (hijos <option>); invalido.
 *   AreaTexto: <textarea>; rows, invalido.
 * - CampoConEtiqueta: etiqueta*, children* (un solo control), ayuda, error, obligatorio. Vincula la
 *   etiqueta con el control (useId) y marca aria-invalid/aria-describedby.
 * - CasillaVerificacion: etiqueta*, descripcion, checked, onChange, disabled (etiqueta ya vinculada).
 * - Tarjeta: titulo (h2), descripcion, acciones, sinRelleno, children. desplazable: ocupa el alto disponible y desplaza su contenido.
 * - TarjetaMetrica: etiqueta*, valor*, icono, tendencia (texto), direccion 'sube'|'baja'|'neutra'.
 * - Insignia: variante 'neutral'|'primario'|'info'|'exito'|'advertencia'|'peligro', icono, children.
 * - EncabezadoPagina: titulo* (h1), icono, subtitulo, acciones.
 * - Buscador: value, onChange, placeholder, etiqueta (nombre accesible, def. 'Buscar').
 * - BarraHerramientas: children (búsqueda y filtros, izquierda), acciones (derecha).
 * - Tabla, TablaEncabezado, TablaCuerpo, TablaFila (seleccionada, onClick),
 *   TablaCelda (encabezado → th, alinear 'izquierda'|'centro'|'derecha'; montos a la derecha).
 * - EstadoVacio: titulo*, icono, descripcion, accion.
 * - Pagina: contenedor de pantalla en columna a todo el alto; con <Tabla desplazable> solo se desplaza la tabla.
 * - Cargando: texto (por defecto "Cargando…"). Se muestra mientras una lista carga, antes del EstadoVacio.
 * - Modal: titulo*, alCerrar, pie (botones), alEnviar (envuelve todo en <form>), descripcion,
 *   tamano 'sm'|'md'|'lg'|'xl', bloquearCierre, abierto (def. true). Escape y clic fuera cierran.
 * - useAvisos(): { exito(titulo, detalle?), error(titulo, detalle?), info(titulo, detalle?) }. Reemplaza alert().
 * - useConfirmar(): confirmar({ titulo, mensaje, textoConfirmar, textoCancelar, peligro }) → Promise<boolean>.
 *   Reemplaza confirm(). ProveedorAvisos y ProveedorConfirmacion ya están montados en App.jsx.
 * Formato de datos: formatearMoneda, formatearNumero, formatearFecha en utils/formato.js.
 *
 * Ejemplo de una pantalla típica:
 *
 *   import { Pencil, Plus, ShoppingCart, Trash2 } from 'lucide-react'
 *   import { Boton, BotonIcono, BarraHerramientas, Buscador, CampoConEtiqueta, Campo, EncabezadoPagina,
 *     EstadoVacio, Modal, Tabla, TablaCelda, TablaCuerpo, TablaEncabezado, TablaFila,
 *     useAvisos, useConfirmar } from '../ui'
 *   import { formatearFecha, formatearMoneda } from '../../utils/formato'
 *
 *   const avisos = useAvisos()
 *   const confirmar = useConfirmar()
 *
 *   const borrar = async (item) => {
 *     const ok = await confirmar({ titulo: 'Borrar producto', mensaje: `Se borrará "${item.nombre}".`,
 *       textoConfirmar: 'Borrar', peligro: true })
 *     if (!ok) return
 *     const r = await window.API.eliminarProducto(item.id)
 *     r.success ? avisos.exito('Producto borrado') : avisos.error('No se pudo borrar', r.message)
 *   }
 *
 *   <div className="space-y-6">
 *     <EncabezadoPagina icono={ShoppingCart} titulo="Ventas" subtitulo="Ventas del comercio"
 *       acciones={<Boton variante="primario" icono={Plus} onClick={abrir}>Nueva venta</Boton>} />
 *     <BarraHerramientas>
 *       <Buscador value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar..." />
 *     </BarraHerramientas>
 *     {items.length === 0 ? (
 *       <EstadoVacio titulo="No hay ventas" descripcion="Las ventas nuevas aparecen acá." />
 *     ) : (
 *       <Tabla>
 *         <TablaEncabezado>
 *           <TablaCelda encabezado>Fecha</TablaCelda>
 *           <TablaCelda encabezado alinear="derecha">Total</TablaCelda>
 *           <TablaCelda encabezado alinear="derecha">Acciones</TablaCelda>
 *         </TablaEncabezado>
 *         <TablaCuerpo>
 *           {items.map((item) => (
 *             <TablaFila key={item.id}>
 *               <TablaCelda>{formatearFecha(item.fecha)}</TablaCelda>
 *               <TablaCelda alinear="derecha">{formatearMoneda(item.total)}</TablaCelda>
 *               <TablaCelda alinear="derecha">
 *                 <BotonIcono icono={Pencil} etiqueta="Editar" onClick={() => editar(item)} />
 *                 <BotonIcono icono={Trash2} etiqueta="Borrar" variante="peligro" onClick={() => borrar(item)} />
 *               </TablaCelda>
 *             </TablaFila>
 *           ))}
 *         </TablaCuerpo>
 *       </Tabla>
 *     )}
 *     {abierto && (
 *       <Modal titulo="Nueva venta" alCerrar={cerrar} alEnviar={guardar}
 *         pie={<><Boton onClick={cerrar}>Cancelar</Boton><Boton variante="primario" type="submit">Guardar</Boton></>}>
 *         <CampoConEtiqueta etiqueta="Nombre"><Campo value={nombre} onChange={...} required /></CampoConEtiqueta>
 *       </Modal>
 *     )}
 *   </div>
 */
export { default as Boton } from './Boton'
export { default as BotonIcono } from './BotonIcono'
export { default as Campo } from './Campo'
export { default as Selector } from './Selector'
export { default as AreaTexto } from './AreaTexto'
export { default as CasillaVerificacion } from './CasillaVerificacion'
export { default as CampoConEtiqueta } from './CampoConEtiqueta'
export { default as Tarjeta } from './Tarjeta'
export { default as TarjetaMetrica } from './TarjetaMetrica'
export { default as Insignia } from './Insignia'
export { default as EncabezadoPagina } from './EncabezadoPagina'
export { default as Buscador } from './Buscador'
export { default as BarraHerramientas } from './BarraHerramientas'
export { Tabla, TablaEncabezado, TablaCuerpo, TablaFila, TablaCelda } from './Tabla'
export { default as EstadoVacio } from './EstadoVacio'
export { default as Cargando } from './Cargando'
export { default as Pagina } from './Pagina'
export { default as Modal } from './Modal'
export { ProveedorAvisos, useAvisos } from './Avisos'
export { ProveedorConfirmacion, useConfirmar } from './Confirmacion'
