/* =====================================================================
   MOTOR — decide en qué está cada alumno y qué le conviene hacer
   ===================================================================== */
const COLS = ['min', 'esp', 'ideal'];
const ORDEN = PROGRAMA.pasos.map(p => p.id);
const PASO = Object.fromEntries(PROGRAMA.pasos.map(p => [p.id, p]));
const MAX_K = PROGRAMA.clases + 1; // 5 = módulo 2

function requeridos(k, col) {
  const s = new Set();
  for (let j = 1; j <= Math.min(k, MAX_K); j++) {
    for (let c = 0; c <= col; c++) (PROGRAMA.esperado[j]?.[COLS[c]] || []).forEach(id => s.add(id));
  }
  return ORDEN.filter(id => s.has(id));
}

/* Módulos: 0 = antes de la clase 1, 1 = enlaces/anticipaciones/superposiciones, 2 = ADN del Jazz,
   3 = entrenamiento rítmico, 4 = Curva del Solo.
   st.modulos guarda los habilitados ('0', '01', '012'). Vacío = alumno de antes: todo habilitado. */
const MODULO_DE = { pre: 0, enlaces: 1, antic: 1, super: 1, m2: 2, ritmo: 3, curva: 4 };
const MODULOS = [
  { n: 0, titulo: 'Módulo 0', sub: 'Antes de la clase 1', nombre: 'Antes de la clase 1', color: '#8FA6D6' },
  { n: 1, titulo: 'Módulo 1', sub: 'Enlaces, anticipaciones y superposiciones', nombre: 'Cambios de acorde', color: '#E8834F' },
  { n: 2, titulo: 'Módulo 2', sub: 'ADN del Jazz', nombre: 'ADN del Jazz', color: '#7DB4FF' },
  { n: 3, titulo: 'Módulo 3', sub: 'Entrenamiento rítmico', nombre: 'Entrenamiento rítmico', color: '#5BD49A' },
  { n: 4, titulo: 'Módulo 4', sub: 'Curva del Solo', nombre: 'Curva del Solo', color: '#C7A6F2' },
];
const sinModulos = st => st.modulos === undefined || st.modulos === null || st.modulos === '';
// En la vista de prueba del panel se ve todo abierto
const moduloHabilitado = (st, n) => (typeof modo !== 'undefined' && modo === 'admin-prueba') || sinModulos(st) || String(st.modulos).includes(String(n));
const pasoHabilitado = (st, id) => moduloHabilitado(st, MODULO_DE[PASO[id].etapa]);

const hecho = (st, id) => !!(st.prog[id] && st.prog[id].hecho && st.prog[id].como !== 'cuesta');
const tocado = (st, id) => !!(st.prog[id] && st.prog[id].hecho);

function diasDesde(fecha) {
  if (!fecha) return 0;
  const d0 = new Date(fecha + 'T12:00:00');
  const hoy = new Date(); hoy.setHours(12, 0, 0, 0);
  return Math.max(0, Math.round((hoy - d0) / 86400000));
}
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

function estado(st) {
  const col = clamp((st.nivel || 2) - 1, 0, 2);
  const k = Math.min((st.clase || 0) + 1, MAX_K);
  const R = requeridos(k, col).filter(id => pasoHabilitado(st, id));
  const faltan = R.filter(id => !hecho(st, id));
  // Avance medido sobre lo nuevo de esta clase más lo que haya quedado pendiente de antes.
  // Algo tildado como "me cuesta" cuenta como medio paso.
  const previos = new Set(requeridos(k - 1, col).filter(id => pasoHabilitado(st, id)));
  const foco = R.filter(id => !previos.has(id) || !hecho(st, id));
  const peso = id => hecho(st, id) ? 1 : tocado(st, id) ? 0.5 : 0;
  const frac = foco.length ? foco.reduce((s, id) => s + peso(id), 0) / foco.length : 1;
  const pre = k === 1;
  const d = diasDesde(pre ? st.inicio : (st.claseFecha || st.inicio));
  // Cuánto se espera tener hecho a esta altura (0 a 1).
  // Pre-sincrónico: libre los 2 primeros días, completo al día 10.
  // Entre clases: libre el primer día, completo al día 6.
  const esperadoAhora = pre ? clamp((d - 2) / 8, 0, 1) : clamp((d - 1) / 5, 0, 1);
  let tipo;
  if (k === MAX_K && faltan.length === 0) tipo = 'm2';
  else if (st.pausa) tipo = 'pausa';
  else if (faltan.length === 0) {
    const idealOk = requeridos(k, 2).every(id => hecho(st, id));
    tipo = (col < 2 && idealOk) || (k < MAX_K && requeridos(k + 1, col).some(id => hecho(st, id) && !R.includes(id))) ? 'adelantado' : 'bien';
  } else if (frac + 0.15 < esperadoAhora || esperadoAhora >= 1) tipo = 'meterle';
  else tipo = 'bien';
  return { k, col, R, faltan, frac, d, esperadoAhora, tipo, pre };
}

/* Recomendaciones: el primero es el recomendado, el resto son alternativas */
function recomendaciones(st, n = 3) {
  const e = estado(st);
  const out = []; const ya = new Set();
  const push = (id, motivo) => { if (!ya.has(id) && PASO[id] && pasoHabilitado(st, id)) { ya.add(id); out.push({ id, motivo }); } };
  e.R.filter(id => st.prog[id]?.como === 'cuesta').forEach(id => push(id, 'seguir'));
  e.faltan.forEach(id => push(id, 'falta'));
  if (out.length < n) requeridos(e.k, 2).filter(id => !hecho(st, id)).forEach(id => push(id, 'extra'));
  if (out.length < n && e.k < MAX_K) requeridos(e.k + 1, e.col).filter(id => !hecho(st, id)).forEach(id => push(id, 'extra'));
  if (out.length < n) ORDEN.filter(id => !hecho(st, id) && !PASO[id].opcional).forEach(id => push(id, 'extra'));
  return { e, lista: out.slice(0, n) };
}

/* Posición en el mapa: 0 = inicio, 1..4 = listo para la clase N, 5 = módulo 2 */
function posicion(st) {
  const col = clamp((st.nivel || 2) - 1, 0, 2);
  let base = 0;
  for (let i = 1; i <= MAX_K; i++) {
    if (requeridos(i, col).every(id => hecho(st, id))) base = i; else break;
  }
  if (base >= MAX_K) return MAX_K;
  const prev = new Set(requeridos(base, col));
  const sig = requeridos(base + 1, col).filter(id => !prev.has(id));
  const f = sig.length ? sig.filter(id => hecho(st, id)).length / sig.length : 0;
  return base + f * 0.85;
}

/* Mensaje de WhatsApp en el estilo de Andy */
/* Mensaje corto para WhatsApp: (si viene de un video) lugar para la devolución + solo el paso que sigue */
function mensajeWhatsApp(st, link, pasoVideo) {
  const { e, lista } = recomendaciones(st, 3);
  const nombre = (st.nombre || '').split(' ')[0];
  const limpio = t => String(t || '').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1: $2');
  let txt = pasoVideo && PASO[pasoVideo] ? `${nombre}! Ya vi tu video de «${PASO[pasoVideo].titulo}».\n\n\n\n` : `${nombre}! `;
  const extra = (st.extras || []).find(x => !x.hecho);
  const r = lista.find(x => x.id !== pasoVideo || x.motivo === 'seguir');
  if (extra) txt += `Lo que sigue: ${extra.titulo}${extra.detalle ? '\n' + extra.detalle : ''}`;
  else if (r) {
    const p = PASO[r.id];
    txt += `${r.motivo === 'seguir' ? 'Seguimos con' : 'Lo que sigue'}: ${p.titulo}\n${limpio(p.detalle)}`;
    if (p.entrega) txt += `\n\nCuando lo tengas, mandame ${p.envia || 'el ' + p.entrega} ${p.entrega === 'audio' ? '🎧' : '📹'}`;
  } else txt += e.k >= MAX_K ? 'Ya tenés todo lo del módulo 1 🙌' : `Ya tenés todo lo que hace falta para la clase ${e.k} 🙌`;
  if (st.nota) txt += '\n\n' + st.nota;
  if (link) txt += `\n\nEn el aula tenés el paso con el video: ${link}`;
  return txt;
}

if (typeof module !== 'undefined') module.exports = { requeridos, estado, recomendaciones, posicion, mensajeWhatsApp, PROGRAMA };
