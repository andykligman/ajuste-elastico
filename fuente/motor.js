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
  const R = requeridos(k, col);
  const faltan = R.filter(id => !hecho(st, id));
  // Avance medido sobre lo nuevo de esta clase más lo que haya quedado pendiente de antes.
  // Algo tildado como "me cuesta" cuenta como medio paso.
  const previos = new Set(requeridos(k - 1, col));
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
  const push = (id, motivo) => { if (!ya.has(id) && PASO[id]) { ya.add(id); out.push({ id, motivo }); } };
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
function mensajeWhatsApp(st, link) {
  const { e, lista } = recomendaciones(st, 4);
  const nombre = (st.nombre || '').split(' ')[0];
  const cab = e.k >= MAX_K ? `${nombre}! Te dejo pasos a seguir 🙌` : `${nombre}! Te dejo pasos a seguir para la clase ${e.k} 🙌`;
  const items = [];
  (st.extras || []).filter(x => !x.hecho).forEach(x => items.push(`${x.titulo}${x.detalle ? '\n' + x.detalle : ''}`));
  lista.forEach(r => {
    const p = PASO[r.id];
    const icono = p.entrega === 'audio' ? '🎧' : '📹';
    items.push(`${p.titulo}${r.motivo === 'seguir' ? ' (seguimos con esto)' : ''}\n${p.detalle}${p.entrega ? `\nMandar ${p.entrega} ${icono}` : ''}`);
  });
  let txt = cab + '\n\n' + items.slice(0, 4).map((t, i) => `${i + 1}) ${t}`).join('\n\n');
  if (st.nota) txt += '\n\n' + st.nota;
  if (link) txt += `\n\nEn tu mapa vas tildando lo que hacés: ${link}`;
  return txt;
}

if (typeof module !== 'undefined') module.exports = { requeridos, estado, recomendaciones, posicion, mensajeWhatsApp, PROGRAMA };
