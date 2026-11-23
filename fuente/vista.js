/* ---------------- Vista del alumno: el camino ----------------
   Un camino dibujado de punta a punta. El paso actual está abierto en el camino:
   consigna, material y "¿Cómo te fue?". Al responder, aparece "Seguir" y el camino avanza.
   El video va al costado (arriba en el celular), uno por vez: cambia solo al avanzar,
   y los links a minutos del video lo adelantan ahí mismo. */

const ICONO = {
  video: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>',
  doc: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l5 5v13H7z M14 3v5h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M10 13h6M10 16.5h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  candado: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
  cruz: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  mandar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12l15-7-4.5 15-3-6.2z" fill="currentColor"/></svg>',
  girar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9a8 8 0 0 1 14.5-3.5L20 7M20 15a8 8 0 0 1-14.5 3.5L4 17M20 3v4h-4M4 21v-4h4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  enviar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12l16-7-6 15-2.5-6.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 12.5l4 4 9-9.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  ok: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="currentColor"/><path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#0E1F16" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  idea: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  web: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 9h18" stroke="currentColor" stroke-width="1.8"/><circle cx="6.5" cy="6.5" r=".9" fill="currentColor"/><circle cx="9.5" cy="6.5" r=".9" fill="currentColor"/></svg>',
  abajo: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v13M6 13l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};
const ytId = url => { const m = String(url || '').match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/); return m ? m[1] : null; };
const ytT = url => { const m = String(url || '').match(/[?&](?:t|start)=(\d+)/); return m ? +m[1] : 0; };
const mmss = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

function titularEstado(e) {
  return { bien: 'Vas bien', meterle: 'Hay que meterle un poco', adelantado: 'Vas adelantado', pausa: 'Sin apuro', m2: 'Ya estás en el módulo 2' }[e.tipo];
}
function etiquetaAdmin(e) {
  return { bien: 'Va bien', meterle: 'Hay que meterle', adelantado: 'Adelantado', pausa: 'En pausa', m2: 'En módulo 2' }[e.tipo];
}
function bajadaEstado(st, e) {
  const proxima = e.k <= 4 ? `la clase ${e.k}` : 'lo que sigue';
  const nombres = ids => ids.slice(0, 3).map(id => PASO[id].titulo.toLowerCase()).join(', ').replace(/, ([^,]*)$/, ' y $1');
  if (e.tipo === 'm2') return 'Terminaste el módulo 1. El resto del módulo 2 lo seguimos por WhatsApp mientras se suma al mapa.';
  if (e.tipo === 'pausa') return 'Dejé tu aula en pausa. Avanzá cuando puedas, sin presión.';
  if (e.tipo === 'meterle') return `Para ${proxima} conviene tener: ${nombres(e.faltan)}${e.faltan.length > 3 ? ', entre otras' : ''}.`;
  if (e.tipo === 'adelantado') return `Ya tenés lo necesario para ${proxima}. Si tenés ganas, podés seguir con lo que viene.`;
  if (e.faltan.length === 0) return `Ya tenés lo necesario para ${proxima}.`;
  return `Para ${proxima} te ${e.faltan.length === 1 ? 'queda' : 'quedan'} ${e.faltan.length} ${e.faltan.length === 1 ? 'paso' : 'pasos'}.`;
}

function tiraClases(st, e, animar) {
  const p = posicion(st);
  const tramos = ['Clase 1', 'Clase 2', 'Clase 3', 'Clase 4', 'Módulo 2'];
  return `<ol class="tira ${animar && !reduceMotion ? 'animar' : ''}" aria-label="Tu camino en el módulo">
    ${tramos.map((t, i) => {
      const n = i + 1, lleno = clamp(p - i, 0, 1), tuvo = n <= (st.clase || 0) && n <= 4, prox = n === e.k;
      return `<li class="tramo ${tuvo ? 'tuvo' : prox ? 'prox' : ''} ${prox && e.tipo === 'meterle' ? 'meterle' : ''}">
        <span class="barra-tramo"><span style="--lleno:${lleno}"></span></span>
        <span class="tramo-txt">${tuvo ? ICONO.check : ''}${t}</span>
        ${prox && e.tipo !== 'm2' ? '<span class="tramo-sub">próxima</span>' : ''}
      </li>`;
    }).join('')}
  </ol>`;
}

/* Texto con formato mínimo. Los links a YouTube se vuelven botones que mueven el video de al lado. */
function linkHTML(texto, url) {
  const id = ytId(url);
  if (id) return `<button class="link-seek" data-seek="${id}:${ytT(url)}">${ICONO.video}${texto}</button>`;
  return `<a href="${url}" target="_blank" rel="noopener">${texto}</a>`;
}
function enLinea(l) {
  return esc(l).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) => linkHTML(t, u));
}
function textoHTML(t) {
  const out = []; let lista = [];
  const cerrar = () => { if (lista.length) { out.push(`<ul class="reglas">${lista.map(l => `<li>${enLinea(l)}</li>`).join('')}</ul>`); lista = []; } };
  String(t || '').split('\n').forEach(l => { if (l.startsWith('- ')) lista.push(l.slice(2)); else { cerrar(); if (l.startsWith('# ')) out.push(`<p class="destacado">${enLinea(l.slice(2))}</p>`); else if (l.trim()) out.push(`<p>${enLinea(l)}</p>`); } });
  cerrar(); return out.join('');
}

function opcionesProgreso(p) { return p.progreso || (p.sinProgreso ? PROGRESO_SIMPLE : PROGRESO_BASE); }
function opcionElegida(st, p) {
  const pr = st.prog[p.id]; if (!pr) return null;
  return opcionesProgreso(p).find(o => o.id === pr.op) || opcionesProgreso(p).find(o => o.nivel === pr.como) || null;
}
function ayudaPara(p, sel) {
  if (!sel) return { apoyo: false, difs: [] };
  const probs = p.problemas || [];
  if (sel.muestra) return { apoyo: !!p.apoyo && sel.muestra.includes('apoyo'), difs: probs.filter(q => sel.muestra.includes(q.id)) };
  return { apoyo: false, difs: sel.nivel === 'cuesta' ? probs : [] };
}

/* En el celu el doc se abre en la versión simple (mobilebasic), que sí respeta el salto al título;
   la app y el editor móvil de Docs ignoran #heading */
function linkSeccion(url, h) {
  const base = url.replace(/#.*$/, '').replace(/\/(edit|view|preview|mobilebasic)[^/]*$/, '');
  const cel = window.matchMedia('(pointer: coarse)').matches || innerWidth < 1000;
  return cel ? `${base}/mobilebasic#${h}` : `${base}/edit#heading=${h}`;
}
/* Celu: la parte del doc se muestra adentro del aula. Bajamos el doc (export html, es público)
   y lo dibujamos nosotros, así saltamos al título sin depender de la app ni de Safari */
const docsCache = {};
async function docHTML(id) {
  if (docsCache[id]) return docsCache[id];
  const r = await fetch(`https://docs.google.com/document/d/${id}/export?format=html`, { credentials: 'omit' });
  if (!r.ok) throw new Error('doc ' + r.status);
  return (docsCache[id] = await r.text());
}
async function verDocEnAula(id, h) {
  cerrarDocEnAula(true);
  const full = `https://docs.google.com/document/d/${id}/edit`;
  const d = document.createElement('div'); d.className = 'doc-visor';
  d.innerHTML = `<div class="dv-barra"><button class="dv-cerrar" data-dv-cerrar>✕ Cerrar</button><a href="${full}" target="_blank" rel="noopener">Abrir en Docs</a></div>
    <div class="dv-marco"><p class="dv-cargando">Cargando el documento…</p></div>`;
  document.body.appendChild(d); document.body.classList.add('dv-abierto');
  history.pushState({ dv: 1 }, '');
  const marco = d.querySelector('.dv-marco');
  try {
    const html = await docHTML(id);
    if (!d.isConnected) return;
    const doc = new DOMParser().parseFromString(html, 'text/html');
    doc.querySelectorAll('script').forEach(x => x.remove());
    doc.querySelectorAll('a[href]').forEach(a => {   // Google envuelve los links en google.com/url?q=…
      try { const u = new URL(a.href); if (u.hostname.endsWith('google.com') && u.pathname === '/url' && u.searchParams.get('q')) a.href = u.searchParams.get('q'); } catch (_) {}
      a.target = '_blank'; a.rel = 'noopener';
    });
    const css = [...doc.querySelectorAll('style')].map(x => x.textContent).join('\n');
    const raiz = marco.attachShadow ? marco.attachShadow({ mode: 'open' }) : marco;
    raiz.innerHTML = `<style>${css}
      .dv-doc{max-width:100%!important;padding:18px 16px 60px!important;box-sizing:border-box;background:#fff;color:#222}
      .dv-doc img{max-width:100%!important;height:auto!important}
      .dv-doc span[style*="width"]{max-width:100%!important;height:auto!important}
      .dv-doc table{max-width:100%!important;width:100%!important}
      .dv-doc td{word-break:break-word}
      .dv-doc *{max-width:100%}
    </style><div class="dv-doc ${esc(doc.body.className)}">${doc.body.innerHTML}</div>`;
    const cargando = marco.querySelector('.dv-cargando'); if (cargando) cargando.remove();
    const destino = raiz.getElementById ? raiz.getElementById(h) : raiz.querySelector('#' + CSS.escape(h));
    const ir = () => { if (destino) marco.scrollTop = destino.getBoundingClientRect().top - marco.getBoundingClientRect().top + marco.scrollTop - 8; };
    ir(); requestAnimationFrame(ir);
    // las imágenes de arriba cargan después y empujan el texto: volvemos a acomodar mientras no haya tocado nada
    let tocado = false; ['touchstart', 'wheel', 'mousedown'].forEach(ev => marco.addEventListener(ev, () => { tocado = true; }, { once: true, passive: true }));
    raiz.querySelectorAll('img').forEach(im => { im.loading = 'eager'; if (!im.complete) im.addEventListener('load', () => { if (!tocado) ir(); }, { once: true }); });
    [400, 1200, 2500, 4000, 6000, 9000].forEach(ms => setTimeout(() => { if (!tocado) ir(); }, ms));
    // cualquier cambio de alto del doc (imágenes, fuentes, tablas) corre el título: lo seguimos hasta que toque
    const docEl = raiz.querySelector('.dv-doc');
    if (docEl && window.ResizeObserver) { const ro = new ResizeObserver(() => { if (tocado || !d.isConnected) ro.disconnect(); else ir(); }); ro.observe(docEl); setTimeout(() => ro.disconnect(), 15000); }
  } catch (e) {
    marco.innerHTML = `<p class="dv-cargando">No pude cargar el documento acá. <a href="${full}" target="_blank" rel="noopener">Abrilo en Docs</a>.</p>`;
  }
}
function cerrarDocEnAula(silencioso) {
  const d = document.querySelector('.doc-visor'); if (!d) return;
  d.remove(); document.body.classList.remove('dv-abierto');
  if (!silencioso && history.state && history.state.dv) history.back();
}
window.addEventListener('popstate', () => cerrarDocEnAula(true));
document.addEventListener('click', ev => {
  if (ev.target.closest('[data-dv-cerrar]')) { ev.preventDefault(); cerrarDocEnAula(); return; }
  const a = ev.target.closest('a[data-doc-sec]'); if (!a) return;
  ev.preventDefault(); const [id, h] = a.dataset.docSec.split('|'); verDocEnAula(id, h);
}, true);
/* Material: los videos se abren en el reproductor de al lado; los documentos, en otra pestaña */
const esCelular = () => window.matchMedia('(pointer: coarse)').matches || innerWidth < 1000;
const attrSec = (url, h) => { const m = String(url).match(/\/document\/d\/([\w-]+)/); return m && esCelular() ? ` data-doc-sec="${m[1]}|${esc(h)}"` : ''; };
const esDoc = r => r.url && !ytId(r.url) && !r.web;
function docNuevo(p, r) {
  const i = ORDEN.indexOf(p.id);
  for (let j = 0; j < i; j++) if ((PASO[ORDEN[j]].recursos || []).some(x => x.url === r.url)) return false;
  return true;
}
/* Panel con varios videos a la vez (miniaturas que cargan el video de al lado) */
/* Objetivos de un módulo: lista numerada, el puente de 3 etapas y lo más importante */
function hojaDeRutaHTML(p) {
  const h = p.hojaDeRuta; if (!h) return '';
  const color = MODULOS[MODULO_DE[p.etapa]].color;
  const no = h.objetivos.length;
  return `<div class="ruta ${animClase(p.id)}" data-anim="${p.id}" style="--rc:${color}">
    <h5>Objetivos</h5>
    <ol class="ruta-obj">${h.objetivos.map((o, i) => `<li style="--k:${i}"><span class="ruta-n">${i + 1}</span><p>${enLinea(o)}</p></li>`).join('')}</ol>
    ${h.puente && h.puente.ciclo ? `${h.puente.titulo ? `<h5>${esc(h.puente.titulo)}</h5>` : ''}${cicloHTML(h.puente, no)}` : h.puente ? `${h.puente.titulo ? `<h5>${esc(h.puente.titulo)}</h5>` : ''}<div class="ruta-puente" aria-label="${esc(h.puente.pasos.join(', '))}">
      ${h.puente.desde ? `<span class="rp-extremo" style="--k:${no}">${esc(h.puente.desde)}</span><span class="rp-flecha" aria-hidden="true" style="--k:${no}">→</span>` : ''}
      ${h.puente.pasos.map((x, i) => `${i ? `<span class="rp-flecha" aria-hidden="true" style="--k:${no + i}">→</span>` : ''}<span class="rp-etapa" style="--k:${no + i + .3}"><small>${i + 1}</small>${esc(x)}</span>`).join('')}
      ${h.puente.hasta ? `<span class="rp-flecha" aria-hidden="true" style="--k:${no + h.puente.pasos.length}">→</span><span class="rp-extremo rp-meta" style="--k:${no + h.puente.pasos.length + .3}">${esc(h.puente.hasta)}</span>` : ''}
    </div>` : ''}
    ${h.meta ? `<p class="ruta-meta"><strong>Meta:</strong> ${enLinea(h.meta)}</p>` : ''}
    ${h.importante ? `<div class="ruta-clave"><h5>Lo más importante</h5>${h.importante.map(t => `<p>${enLinea(t)}</p>`).join('')}</div>` : ''}
    ${h.cierre ? `<p class="ruta-cierre">${enLinea(h.cierre)}</p>` : ''}
  </div>`;
}
/* Animaciones que arrancan solas cuando entran en pantalla, una sola vez por sesión */
const animVistas = new Set();
let introPendiente = false;   // la bienvenida está por abrirse o abierta: las animaciones esperan a que se cierre
// Bienvenida o «Pasaste al módulo» encima: las animaciones esperan a que se cierren
// (también si la pantalla de «Pasaste al módulo» todavía no salió pero va a salir: al cargar la página aparece un poco después)
const celebracionPendiente = () => {
  if ((modo !== 'alumno' && modo !== 'admin-prueba') || !ST || !abierto || !PASO[abierto]) return false;
  const m = MODULO_DE[PASO[abierto].etapa]; return m > 0 && !moduloVisto(m);
};
const hayPantallaEncima = () => introPendiente || celebracionPendiente() || !!document.querySelector('.intro-aula, .pase-modulo');
function reanudarAnimaciones() {
  setTimeout(() => { if (animObs) { animObs.disconnect(); document.querySelectorAll('.anim:not(.go)').forEach(x => animObs.observe(x)); } else activarAnimaciones(); }, 450);
}
const animClase = key => animVistas.has(key) ? '' : 'anim';
let animObs = null;
function activarAnimaciones() {
  if (!('IntersectionObserver' in window)) { document.querySelectorAll('.anim').forEach(el => { el.classList.add('go'); animVistas.add(el.dataset.anim); }); return; }
  animObs = animObs || new IntersectionObserver(ents => ents.forEach(en => {
    if (!en.isIntersecting || hayPantallaEncima()) return;
    en.target.classList.add('go'); animVistas.add(en.target.dataset.anim); animObs.unobserve(en.target);
  }), { threshold: 0.35 });
  document.querySelectorAll('.anim:not(.go)').forEach(el => animObs.observe(el));
}
/* El proceso como un círculo: se repite con información nueva */
function cicloHTML(c, k0 = 0, key) {
  const n = c.pasos.length, R = 35;
  const pos = a => `left:${(50 + R * Math.cos(a)).toFixed(2)}%;top:${(50 + R * Math.sin(a)).toFixed(2)}%`;
  const ang = i => (i / n) * 2 * Math.PI - Math.PI / 2;
  return `<div class="ruta-ciclo ${key ? animClase(key) : ''}" ${key ? `data-anim="${key}"` : ''} role="img" aria-label="${esc(c.pasos.join(', '))}, y vuelta a empezar" style="--k0:${k0};--n:${n}">
    <svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="${R}" transform="rotate(-90 50 50)" pathLength="100" /></svg>
    ${c.pasos.map((x, i) => `<span class="rc-flecha" style="${pos(ang(i + .5))};--rot:${(ang(i + .5) * 180 / Math.PI + 90).toFixed(1)}deg;--k:${k0 + i + .6}">➜</span>`).join('')}
    ${c.pasos.map((x, i) => `<span class="rc-paso" style="${pos(ang(i))};--k:${k0 + i}"><small>${i + 1}</small>${esc(x)}</span>`).join('')}
    ${c.centro ? `<span class="rc-centro">${esc(c.centro)}</span>` : ''}
  </div>`;
}
/* ===== Stops de segmentación: se recorren tanda por tanda ===== */
const stopEst = {};   // id -> { i, modo: 'si' | 'no' }
let stopTimer = null;
function stopHTML(p) {
  const id = p.stop, S = STOPS[id]; if (!S) return '';
  if (S.audio || S.audioNo) setTimeout(() => precargarStop(S), 400);   // que los audios ya estén en memoria cuando toque Reproducir
  return `<details class="stop stop-${S.tipo}" ${p.stopCerrado ? '' : 'open'}><summary><span>${esc(S.titulo)}</span><small>${enLinea(S.sub)}</small></summary>
    <div class="stop-cuerpo" data-stop-caja="${id}">${stopInner(id)}</div></details>`;
}
/* «Así no» y «Así sí» van en una sola secuencia: primero cómo no, después cómo sí */
function stopSeq(S) {
  if (S._seq) return S._seq;
  const no = S.no ? S.no.tandas.map((t, k, arr) => ({ t, modo: 'no', k, finNo: k === arr.length - 1 })) : [];
  const si = S.tandas.map((t, k) => ({ t, modo: 'si', k }));
  return (S._seq = S.empiezaNo ? no.concat(si) : si.concat(no));
}
function stopInner(id) {
  const S = STOPS[id], e = stopEst[id] || (stopEst[id] = { i: 0 }), seq = stopSeq(S), n = S.unidades.length;
  const i = Math.min(e.i, seq.length - 1), it = seq[i], tanda = it.t, no = it.modo === 'no';
  const tramo = seq.slice(0, i + 1).filter(x => x.modo === it.modo).map(x => x.t);   // lo de este modo hasta acá
  const veces = Array(n).fill(0); tramo.forEach(t => { if (t.pausa) return; for (let k = t.sel[0]; k <= t.sel[1]; k++) veces[k]++; });
  const estadoU = Array(n).fill('');
  if (!no) tramo.forEach(t => { if (t.traba !== undefined) estadoU[t.traba] = 'traba'; if (t.arregla !== undefined) estadoU[t.arregla] = 'ok'; });
  if (!no && tanda.trabaAca) for (let k = tanda.sel[0]; k <= tanda.sel[1]; k++) estadoU[k] = 'traba';
  const partido = !no && tramo.some(t => t.partir !== undefined);
  const enSel = k => k >= tanda.sel[0] && k <= tanda.sel[1];
  const max = Math.max(1, ...veces);
  const dibujo = S.tipo === 'texto' ? '' : S.tipo === 'ola' ? stopOla(S, enSel, estadoU, partido) : S.tipo === 'cuerdas' ? stopCuerdas(S, enSel, estadoU) : S.tipo === 'cifrado' ? stopCifrado(S, enSel, estadoU) : stopMelodia(S, enSel, estadoU, partido);
  const fin = i === seq.length - 1;
  const texto = tanda.t || (no ? (it.finNo ? S.no.fin : S.no.t) : '');
  const delModo = seq.filter(x => x.modo === it.modo && !x.t.pausa), nro = tramo.filter(t => !t.pausa).length;
  const sonando = stopTimer && stopTimer.id === id;
  return `<div class="stop-top"><span></span>
      ${S.audio ? `<button class="stop-son ${stopSonido ? '' : 'off'}" data-stop-acc="sonido" data-stop-id="${id}" aria-pressed="${stopSonido}">${stopSonido ? '🔊 Con sonido' : '🔇 Sin sonido'}</button>` : ''}
    </div>
    <div class="stop-pantalla">
    <p class="stop-texto ${tanda.zoom ? 'zoom' : ''} ${tanda.malo || (no && it.finNo && !tanda.t) ? 'malo' : ''} ${tanda.grande ? 'grande' : ''}" aria-live="polite"><span class="stop-num">${tanda.pausa ? '' : `Tanda ${nro} de ${delModo.length}`}</span><span class="stop-frase" key="${i}">${String(texto).split('\n').map(enLinea).join('<br>')}</span>${tanda.grande && tanda.vis ? visGrande(tanda.vis) : ''}${tanda.imgs ? imgsVis(tanda) : ''}${tanda.boton ? `<a class="stop-boton${tanda.boton.suave ? ' suave' : ''}" href="${esc(tanda.boton.url)}" target="_blank" rel="noopener"><span class="sb-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg></span><span>${esc(tanda.boton.t)}</span></a>` : ''}</p>
    ${tanda.grande ? '' : `<div class="stop-dibujo ${no ? 'modo-no' : ''}">${dibujo}</div>`}
    ${(S.contar || tanda.veces) && !tanda.grande ? `<p class="stop-cap">${esc(S.contar || 'Veces que practicaste cada cuerda')}</p>
    <div class="stop-veces ${no ? 'modo-no' : ''}" style="grid-template-columns:${S.tipo === 'ola' ? anchosOla(S).map(x => x.toFixed(3) + 'fr').join(' ') : `repeat(${n},1fr)`}">${veces.map((x, k) => `<span class="${estadoU[k]}" style="--v:${(x / max).toFixed(2)}"><b>${x}</b><small>${esc(S.unidades[k])}</small></span>`).join('')}</div>` : ''}
    ${(S.contar || tanda.veces) && !tanda.grande ? '' : `<span class="stop-logo" aria-hidden="true">${LOGO}</span>`}
    ${!e.visto ? `<button class="stop-play-grande" data-stop-acc="play" data-stop-id="${id}" aria-label="Reproducir"><span class="spg-boton"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg></span><span class="spg-txt">Reproducir</span></button>` : ''}
    </div>
    ${e.visto ? `<div class="stop-ctrl">
      <button class="secundario" data-stop-acc="ant" data-stop-id="${id}" ${i === 0 ? 'disabled' : ''} aria-label="Anterior">‹</button>
      <button class="${fin && !sonando ? 'primario' : 'secundario'}" data-stop-acc="play" data-stop-id="${id}">${sonando ? 'Pausa' : fin ? 'Ver de nuevo' : 'Reproducir'}</button>
      ${fin ? `<button class="primario" data-stop-acc="seguir" data-stop-id="${id}">Seguir ↓</button>` : `<button class="primario" data-stop-acc="sig" data-stop-id="${id}">Siguiente ›</button>`}
    </div>` : ''}`;
}
/* Audio de Andy por tanda: audio/<stop>/NN.m4a («Así sí») y audioNo para «Así no» */
let stopSonido = true;
const stopAudio = new Audio(); stopAudio.preload = 'auto'; stopAudio.defaultPlaybackRate = 1.15; stopAudio.preservesPitch = true;
const audioDe = (S, e) => { const it = stopSeq(S)[e.i]; const dir = it.modo === 'no' ? S.audioNo : S.audio; return dir && stopSonido ? `${dir}${String(it.k + 1).padStart(2, '0')}.m4a?v=26` : ''; };
// En el celu, cambiar el src a un audio que todavía está bajando hace que Safari se trabe ("trrr") entre frases cortas:
// apenas se toca Reproducir, bajo todos los audios del stop a memoria y los reproduzco desde ahí
const audioMem = new Map();
function precargarStop(S) {
  (S.tandas || []).forEach(t => (t.imgs || []).forEach(f => { const im = new Image(); im.src = f.src; }));   // las capturas, para que no aparezcan a medio cargar
  const seq = stopSeq(S);
  seq.forEach((it, i) => {
    const url = audioDe(S, { i }); if (!url || audioMem.has(url)) return;
    audioMem.set(url, null);
    fetch(url).then(r => r.ok ? r.blob() : Promise.reject()).then(b => audioMem.set(url, URL.createObjectURL(b))).catch(() => audioMem.delete(url));
  });
}
function stopAccion(id, acc) {
  const S = STOPS[id], e = stopEst[id] || (stopEst[id] = { i: 0 }), seq = stopSeq(S);
  if (stopSonido && (acc === 'play' || acc === 'sig' || acc === 'ant')) precargarStop(S);
  const total = () => seq.length;
  const parar = () => { if (stopTimer) { clearTimeout(stopTimer.h); stopTimer = null; } stopAudio.onended = stopAudio.onerror = null; stopAudio.pause(); };
  const pintar = () => { const c = document.querySelector(`[data-stop-caja="${id}"]`); if (c) c.innerHTML = stopInner(id); else parar(); };
  const espera = () => { const it = seq[e.i], txt = it.t.t || (it.finNo ? S.no.fin : S.no ? S.no.t : ''); return Math.min(5500, Math.max(1800, 900 + String(txt).length * 40)); };
  const sonar = luego => {
    const src = audioDe(S, e);
    const extra = (seq[e.i] && seq[e.i].t && seq[e.i].t.extra) || 0;   // tandas que se quedan un rato más en pantalla
    const despues = ms => { if (luego && stopTimer) stopTimer.h = setTimeout(luego, ms + extra); };
    if (!src) { despues(espera()); return; }
    stopAudio.src = audioMem.get(src) || src; stopAudio.defaultPlaybackRate = stopAudio.playbackRate = S.velocidad || 1.15;   // por defecto un poco más rápido, sin cambiar el tono; velocidad: 1 = normal
    if (luego) { stopAudio.onended = () => despues(60); stopAudio.onerror = () => despues(espera()); }
    stopAudio.play().catch(() => { if (luego && stopTimer) stopTimer.h = setTimeout(luego, espera()); });
  };
  if (acc === 'seguir' && PASO[abierto]?.soloVer) {   // animaciones solas: «Seguir» la da por vista y abre el paso siguiente
    parar(); ST.prog[abierto] = { hecho: true, como: 'listo', op: 'listo', t: hoyISO() }; guardarAlumno();
    const sig = siguienteDe(abierto); if (sig) abrirPaso(sig.id); else renderAlumno(); return;
  }
  if (acc === 'seguir') { parar(); const c = document.querySelector(`[data-stop-caja="${id}"]`); const q = c && c.closest('.tarjeta')?.querySelector('.pregunta, .envio, .seguir'); if (q) q.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' }); return; }
  if (acc === 'sig') { parar(); e.i = Math.min(e.i + 1, total() - 1); pintar(); sonar(); return; }
  if (acc === 'ant') { parar(); e.i = Math.max(e.i - 1, 0); pintar(); sonar(); return; }
  if (acc === 'sonido') { stopSonido = !stopSonido; if (!stopSonido) stopAudio.pause(); }
  else if (acc === 'play') {
    if (stopTimer && stopTimer.id === id) parar();
    else {
      parar(); e.visto = true; if (e.i >= total() - 1) e.i = 0;
      const paso = () => {
        if (e.i >= total() - 1) { parar(); pintar(); return; }
        e.i++; pintar(); sonar(paso);
      };
      stopTimer = { id, h: null }; pintar(); sonar(paso); return;
    }
  }
  pintar();
}
/* Dibujitos animados para los cuadros de solo texto, mientras hablo */
/* ---- Dibujos del cierre de los ritmos fijos: escritura rítmica (cabezas en barra, como en el generador) ---- */
// Un compás de 8 corcheas: N nota, C sigue sonando, R silencio (igual que el generador). x0..x0+w, línea en y.
function compasSVG(cel, x0, y, w, cls = '', k0 = 0) {
  const c = cel.split(''); for (let i = 0; i < 8; i++) { if (c[i] !== 'N') continue; let j = i + 1; if (i % 2 === 0 && c[j] === 'C') j++; while (c[j] === 'C') { c[j] = 'R'; j++; } }
  const sx = w / 8, X = i => x0 + 6 + i * sx; let o = `<line class="vr-linea" x1="${x0}" y1="${y}" x2="${x0 + w}" y2="${y}"/>`, k = k0;
  const cabeza = (x, n) => `<g class="vr-nota ${cls}" style="--k:${n}"><path class="vr-cab" d="M${x - 4} ${y + 5} L${x + 4} ${y - 5}"/><line class="vr-plica" x1="${x + 4}" y1="${y - 5}" x2="${x + 4}" y2="${y - 30}"/>`;
  for (let p = 0; p < 4; p++) {
    const a = c[2 * p], b = c[2 * p + 1], xa = X(2 * p), xb = X(2 * p + 1);
    if (a === 'N' && b === 'N') { o += cabeza(xa, k++) + cabeza(xb, k++).replace('<g', '<g data-x') + `</g><line class="vr-barra" x1="${xa + 4}" y1="${y - 30}" x2="${xb + 4}" y2="${y - 30}"/></g>`; continue; }
    if (a === 'N' && b === 'C') { o += cabeza(xa, k++) + '</g>'; continue; }
    if (a === 'N') { o += cabeza(xa, k++) + `<path class="vr-gancho" d="M${xa + 4} ${y - 30} q9 6 6 16"/></g>`; o += `<path class="vr-sil" d="M${xb - 3} ${y - 8} q3 3 7 -1 l-5 13"/>`; continue; }
    if (b === 'N') { o += `<path class="vr-sil" d="M${xa - 3} ${y - 8} q3 3 7 -1 l-5 13"/>` + cabeza(xb, k++) + `<path class="vr-gancho" d="M${xb + 4} ${y - 30} q9 6 6 16"/></g>`; continue; }
    o += `<path class="vr-sil" d="M${xa + 2} ${y - 14} l5 6 l-5 5 l5 7 q-6 -2 -3 4"/>`;
  }
  return o;
}
const guitarraSVG = (x, y, cls = '') => `<g class="vr-guit ${cls}" transform="translate(${x} ${y}) rotate(-28)"><rect class="vr-mango" x="20" y="-4" width="58" height="8" rx="2"/><rect class="vr-clavijero" x="76" y="-6" width="14" height="12" rx="3"/><ellipse class="vr-cuerpo" cx="-16" cy="0" rx="22" ry="20"/><ellipse class="vr-cuerpo" cx="10" cy="0" rx="16" ry="14"/><circle class="vr-boca" cx="0" cy="0" r="6"/><path class="vr-cuerdas" d="M-30 -2 H82 M-30 2 H82"/></g>`;
const escalonesSVG = (labels, cls = '') => labels.map((t, i) => { const x = 14 + i * 76, yy = 96 - i * 22; return `<g class="vr-esc ${cls}" style="--k:${i}"><path class="vr-pelda" d="M${x} ${yy} h70"/><text class="vr-etq" x="${x + 35}" y="${yy - 7}">${t}</text></g>`; }).join('');
const VIS_RITMO = {
  'rf-ritmos': () => compasSVG('RNCNNCRR', 18, 70, 138) + compasSVG('NNRNRRNC', 164, 70, 138, '', 5) + `<line class="vr-div" x1="160" y1="56" x2="160" y2="84"/>`,
  'rf-cuerpo': () => `<g class="vr-persona"><circle cx="58" cy="30" r="10"/><path d="M58 40 v30"/><path d="M58 48 l-14 16 M58 48 l14 16"/><path class="vr-pierna i" d="M58 70 v26"/><path class="vr-pierna d" d="M58 70 v26"/></g>`
    + `<path class="vr-flecha" d="M108 60 H196 m-12 -10 l12 10 l-12 10"/><circle class="vr-viaje" cx="110" cy="60" r="5"/>` + guitarraSVG(250, 66, 'vibra'),
  'rf-escalera': () => escalonesSVG(['1 nota', 'escala abierta', 'acordes · arpegios', 'acordes · escalas']),
  'rf-donde': () => escalonesSVG(['1 nota', 'escala abierta', 'acordes · arpegios', 'acordes · escalas'], 'tenue') + `<g class="vr-pin"><circle cx="0" cy="0" r="7"/><path d="M-5 4 L0 14 L5 4"/></g>`,
  'rf-mapa': () => `<path class="vr-mapa" d="M60 22 L120 12 L180 22 L240 12 V92 L180 102 L120 92 L60 102 Z"/><path class="vr-pliegue" d="M120 12 V92 M180 22 V102"/><path class="vr-ruta" d="M78 86 C 100 60, 130 84, 150 58 S 196 40, 218 30"/><g class="vr-cruz"><path d="M84 32 l10 10 M94 32 l-10 10"/></g><g class="vr-pin fijo" transform="translate(218 30)"><circle cx="0" cy="-10" r="7"/><path d="M-5 -6 L0 4 L5 -6"/></g>`,
  'rf-compases': () => `<path class="vr-rep" d="M14 40 v40 M19 40 v40"/><circle class="vr-rep-p" cx="25" cy="54" r="2.4"/><circle class="vr-rep-p" cx="25" cy="66" r="2.4"/>` + compasSVG('NCRNNNRN', 36, 74, 122, 'loop') + `<line class="vr-div" x1="162" y1="58" x2="162" y2="88"/>` + compasSVG('RNNCRNNC', 170, 74, 118, 'loop', 5) + `<circle class="vr-rep-p" cx="296" cy="54" r="2.4"/><circle class="vr-rep-p" cx="296" cy="66" r="2.4"/><path class="vr-rep" d="M302 40 v40 M307 40 v40"/><path class="vr-vuelta" d="M296 30 C 260 6, 70 6, 30 30 m6 -10 l-6 10 l11 1"/>`,
  'rf-redoblante': () => `<g class="vr-notita"><ellipse cx="62" cy="76" rx="9" ry="7" transform="rotate(-20 62 76)"/><path d="M70 73 V30 q14 6 12 20"/></g><path class="vr-flecha" d="M100 62 H178 m-12 -10 l12 10 l-12 10"/>`
    + `<g class="vr-redo"><ellipse class="vr-parche" cx="250" cy="44" rx="44" ry="12"/><path class="vr-tambor" d="M206 44 V82 a44 12 0 0 0 88 0 V44"/><path class="vr-tensor" d="M218 54 l10 24 l10 -24 l10 24 l10 -24 l10 24 l10 -24 l10 24"/></g><g class="vr-golpe"><path d="M250 26 v-12 M232 30 l-8 -9 M268 30 l8 -9"/></g>`,
  'rf-nuestro': () => `<circle class="vr-centro" cx="160" cy="56" r="26"/><text class="vr-vos" x="160" y="62">vos</text>` + [[20, 18], [20, 96], [300, 18], [300, 96], [160, 4]].map(([x, y], i) => `<path class="vr-llega" style="--k:${i}" d="M${x} ${y} L${160 + (x - 160) * .32} ${56 + (y - 56) * .32}"/>`).join(''),
  'rf-generador': () => `<rect class="vr-pantalla" x="40" y="8" width="240" height="96" rx="12"/><rect class="vr-gen-btn" x="58" y="20" width="76" height="20" rx="10"/><text class="vr-gen-txt" x="96" y="34">Generar</text>`
    + ['RNCNNCRR', 'NCRNRNNC', 'RNNNRRNC'].map((r, i) => `<g class="vr-gen-r" style="--k:${i}">${compasSVG(r, 58, 88, 204)}</g>`).join(''),
  'rf-seguimos': () => compasSVG('RNCNNCRR', 16, 74, 104, 'tenue') + `<path class="vr-check" d="M54 18 l8 8 l14 -16"/><path class="vr-flecha larga" d="M132 58 H196 m-12 -10 l12 10 l-12 10"/>`
    + [[214, 'N'], [244, 'NN'], [282, 'NNN']].map(([x, u], i) => `<g class="vr-unidad" style="--k:${i}">${u.split('').map((_, j) => `<path class="vr-cab" d="M${x + j * 10 - 4} 78 L${x + j * 10 + 4} 68"/><line class="vr-plica" x1="${x + j * 10 + 4}" y1="68" x2="${x + j * 10 + 4}" y2="44"/>`).join('')}${u.length > 1 ? `<line class="vr-barra" x1="${x + 4}" y1="44" x2="${x + (u.length - 1) * 10 + 4}" y2="44"/>` : ''}</g>`).join(''),
  'rf-chau': () => `<path class="vr-flecha xl" d="M40 56 H270 m-18 -16 l18 16 l-18 16"/>`,
};
/* Capturas de pantalla animadas dentro de una tanda: imgs [{ src, marca: [x, y, w, h] en %, clic: true, ms }]
   imgModo 'loop': las capturas se alternan (como si bajara la página); si no, van apareciendo una vez y queda la última */
function imgsVis(t) {
  const fs = t.imgs, loop = t.imgModo === 'loop', paso = 0.9;
  let acc = 0;
  const frames = fs.map((f, i) => {
    const d = loop ? i * paso : acc; acc += (f.ms || 2200) / 1000;
    const m = f.marca ? `<span class="vi-marca" style="left:${f.marca[0]}%;top:${f.marca[1]}%;width:${f.marca[2]}%;height:${f.marca[3]}%;--d:${d + .35}s"></span>` : '';
    const c = f.clic && f.marca ? `<span class="vi-cur" style="left:${f.marca[0] + f.marca[2] / 2}%;top:${f.marca[1] + f.marca[3] / 2}%;--d:${d + .2}s"></span>` : '';
    return `<span class="vi-f" style="--d:${d}s;z-index:${loop ? fs.length - i : i + 1}"><img src="${esc(f.src)}" alt="" loading="eager">${m}${c}</span>`;
  });
  return `<span class="vis-img ${loop ? 'vi-loop' : 'vi-una'} ${t.imgTenue ? 'vi-tenue' : ''}" style="--n:${fs.length}">${frames.join('')}</span>`;
}
function visGrande(v) {
  const cuerdas = (cls = k => '', extra = '') => [22, 48, 74].map((y, k) => `<line class="vg-cuerda ${cls(k)}" x1="20" y1="${y}" x2="300" y2="${y}" style="--k:${k};stroke-width:${[1.6, 2.4, 3.4][k]}"/>`).join('') + extra;
  const caja = (x, cl, k) => `<rect class="vg-caja ${cl}" x="${x}" y="30" width="30" height="34" rx="5" style="--k:${k}"/>`;
  let s = '';
  if (v === 'cuerdas') s = cuerdas(() => 'vibra');
  else if (v === 'separar') s = cuerdas(k => `sep sep${k}`);
  else if (v === 'chat') s = `<rect class="vg-burbuja" x="40" y="10" width="150" height="26" rx="13" style="--k:0"/><rect class="vg-burbuja yo" x="130" y="44" width="150" height="26" rx="13" style="--k:1"/><rect class="vg-burbuja" x="40" y="78" width="110" height="26" rx="13" style="--k:2"/><circle class="vg-tipeo" cx="62" cy="91" r="3" style="--k:0"/><circle class="vg-tipeo" cx="74" cy="91" r="3" style="--k:1"/><circle class="vg-tipeo" cx="86" cy="91" r="3" style="--k:2"/>`;
  else if (v === 'registro') { s = '<line class="vg-pulso" x1="20" y1="56" x2="300" y2="56"/>'; ['ok', 'mal', 'ok', 'ok', 'mal', 'ok', 'ok'].forEach((m, k) => { const x = 40 + k * 40; s += m === 'ok' ? `<path class="vg-marca ok" d="M${x - 8} ${56} l6 6 l11 -13" style="--k:${k}"/>` : `<path class="vg-marca mal" d="M${x - 7} ${49} l14 14 M${x + 7} ${49} l-14 14" style="--k:${k}"/>`; }); }
  else if (v === 'destrabar') s = cuerdas(k => k === 1 ? 'traba-ok' : 'tenue', '<path class="vg-check tarde" d="M296 36 l10 10 l18 -22"/>');
  else if (v === 'avanzar') s = '<circle class="vg-ciclo chico" cx="80" cy="56" r="26"/><circle class="vg-viaja corto" cx="80" cy="30" r="6"/><path class="vg-flecha-larga" d="M120 56 H290 m-12 -10 l12 10 l-12 10"/>';
  else if (v === 'duda') s = '<text class="vg-signo" x="160" y="78">?</text><circle class="vg-onda" cx="160" cy="56" r="30"/>';
  else if (v === 'zona') s = '<rect class="vg-barra" x="30" y="44" width="260" height="22" rx="11"/><rect class="vg-justa" x="130" y="44" width="80" height="22" rx="11"/><text class="vg-cap" x="60" y="94">fácil</text><text class="vg-cap on" x="170" y="94">justo</text><text class="vg-cap" x="268" y="94">demasiado</text><circle class="vg-aguja" cx="30" cy="55" r="9"/>';
  else if (v === 'video-no') s = '<rect class="vg-video" x="110" y="14" width="100" height="72" rx="10"/><path class="vg-play" d="M150 36 v28 l24 -14 z"/><path class="vg-tacha" d="M100 96 L220 6"/>';
  else if (v === 'video-ok') s = '<rect class="vg-video on" x="60" y="20" width="90" height="64" rx="10"/><path class="vg-play on" d="M96 40 v24 l20 -12 z"/><path class="vg-flecha-larga" d="M162 52 H220 m-10 -9 l10 9 l-10 9"/><path class="vg-check" d="M236 52 l12 12 l24 -30"/>';
  else if (v === 'camino') s = '<path class="vg-ruta" d="M20 90 C 80 90, 90 30, 160 40 S 250 20, 300 20"/><circle class="vg-viajero" r="7"><animateMotion dur="3.6s" repeatCount="indefinite" path="M20 90 C 80 90, 90 30, 160 40 S 250 20, 300 20"/></circle>';
  else if (v === 'no-cuerdas') s = [10, 26, 42, 58, 74, 90].map((y, k) => `<line class="vg-cuerda suma-mal" x1="20" y1="${y}" x2="300" y2="${y}" style="--k:${k}"/>`).join('');
  else if (v === 'traba') s = cuerdas(k => k === 2 ? 'traba' : 'tenue', '<text class="vg-alerta" x="306" y="80">!</text>');
  else if (v === 'control') s = cuerdas(() => 'ok', '<path class="vg-check" d="M296 42 l10 10 l18 -22"/>');
  else if (v === 'tempo-cuerdas') {
    s = [22, 46, 70].map((y, k) => `<line class="vg-cuerda ${k === 1 ? 'on' : 'se-apaga'}" x1="20" y1="${y}" x2="300" y2="${y}" style="--k:${k}"/>`).join('')
      + '<line class="vg-pulso" x1="20" y1="94" x2="300" y2="94"/><circle class="vg-beat" cx="20" cy="94" r="5"/>';
  } else if (v === 'info') {
    let pts = ''; for (let k = 0; k < 12; k++) pts += `<circle class="vg-punto ${k % 3 ? 'se-va' : ''}" cx="${40 + k * 22}" cy="46" r="7" style="--k:${k}"/>`;
    s = pts + '<line class="vg-pulso" x1="20" y1="80" x2="300" y2="80"/><circle class="vg-beat" cx="20" cy="80" r="5"/>';
  } else if (v === 'sumar') { for (let k = 0; k < 8; k++) s += caja(16 + k * 37, k < 4 ? 'base' : 'suma', k); }
  else if (v === 'no-sumar') { for (let k = 0; k < 8; k++) s += caja(16 + k * 37, 'todo', k); }
  else if (v === 'cantar') {   // la voz (ondas) encima de la grabación (barras)
    for (let k = 0; k < 14; k++) { const a = 5 + Math.abs(Math.sin(k * 1.7)) * 14; s += `<rect class="vg-grab" x="${24 + k * 20}" y="${(82 - a).toFixed(1)}" width="8" height="${(a * 2).toFixed(1)}" rx="2"/>`; }
    s += '<path class="vg-voz" d="M24 34 C 54 14, 84 54, 114 34 S 174 14, 204 34 S 264 54, 296 30"/>';
  } else if (v === 'no-transcribir') { [1, 2, 3, 4, 5].forEach((m, f) => { s += `<rect class="vg-fila-no" x="20" y="${8 + f * 20}" width="${m * 56}" height="12" rx="6" style="--k:${f}"/>`; }); }
  else if (v === 'partir') {
    s = '<rect class="vg-bloque" x="20" y="38" width="280" height="30" rx="8"/>';
    [0, 1, 2, 3].forEach(k => { s += `<rect class="vg-trozo" x="${22 + k * 70}" y="40" width="66" height="26" rx="6" style="--k:${k}"/>`; });
  } else if (v === 'directo') {
    s = '<line class="vg-pulso" x1="20" y1="70" x2="300" y2="70"/>';
    [0, 1, 2, 3, 4, 5, 6].forEach(k => { s += `<circle class="vg-paso ${k === 4 ? 'mal' : ''}" cx="${40 + k * 40}" cy="70" r="${k === 4 ? 9 : 6}"/>`; });
    s += '<path class="vg-salto" d="M40 58 C 80 0, 160 0, 200 56"/><text class="vg-alerta" x="194" y="100">!</text>';
  } else if (v === 'escuchar') {
    s = '<path class="vg-parlante" d="M96 44 h22 l26 -20 v64 l-26 -20 h-22 z"/>';
    [0, 1, 2].forEach(k => { s += `<path class="vg-arco" d="M${162 + k * 22} ${30 - k * 8} q ${18 + k * 6} 26 0 ${52 + k * 16}" style="--k:${k}"/>`; });
  } else if (v === 'forma') {
    for (let k = 0; k < 8; k++) s += `<rect class="vg-compas ${k === 0 ? 'inicio' : ''}" x="${16 + k * 37}" y="36" width="33" height="36" rx="4"/>`;
    s += '<path class="vg-bandera" d="M20 34 V8 l26 8 l-26 8"/>';
  } else if (v === 'contar') {
    [0, 1, 2, 3].forEach(k => { s += `<circle class="vg-dedo" cx="${70 + k * 60}" cy="52" r="16" style="--k:${k}"/><text class="vg-num" x="${70 + k * 60}" y="58">${k + 1}</text>`; });
  } else if (v === 'escala') { for (let k = 0; k < 7; k++) s += `<rect class="vg-grado" x="${30 + k * 38}" y="${88 - k * 11}" width="30" height="${10 + k * 11}" rx="3" style="--k:${k}"/>`; }
  else if (v === 'grados') {
    [0, 1, 2, 3].forEach(g => { const x = 24 + g * 74, y = 82 - g * 16; s += `<path class="vg-motivo" d="M${x} ${y} l14 -10 l14 6 l14 -14" style="--k:${g}"/>`; });
  }
  else if (v === 'ciclo') s = '<circle class="vg-ciclo" cx="160" cy="48" r="32"/><circle class="vg-viaja" cx="160" cy="16" r="6"/><path class="vg-flecha" d="M186 30 l8 -2 l-1 8"/>';
  else if (VIS_RITMO[v]) s = VIS_RITMO[v]();
  return s ? `<svg class="vis-grande vg-${v}" viewBox="0 0 320 112" aria-hidden="true">${s}</svg>` : '';
}
function stopCifrado(S, enSel, est) {
  return `<div class="cifrado">${S.acordes.map((ac, k) => {
    const cl = est[k] === 'traba' ? 'traba' : est[k] === 'ok' ? 'ok' : '';
    return `<div class="cf-compas ${enSel(k) ? 'on' : ''} ${cl}"><small>${k + 1}</small><span>${esc(ac).replace(/b(?=\d|maj|$)/g, '♭').replace(/^([A-G])b/, '$1♭')}</span>${cl === 'traba' ? '<i>!</i>' : ''}</div>`;
  }).join('')}</div>`;
}
const ruido = (k, j) => { const x = Math.sin(k * 12.9898 + j * 78.233) * 43758.5453; return x - Math.floor(x); };
/* Ancho de cada unidad: todas las frases miden lo mismo, y las subpartes (B1, B2…) parten el ancho de su frase */
function anchosOla(S) {
  const n = S.unidades.length, grupos = S.grupos || S.unidades.map((x, k) => [x, k, k]);
  const w = Array(n).fill(1);
  grupos.forEach(([, a, b]) => { for (let k = a; k <= b; k++) w[k] = 1 / (b - a + 1); });
  return w;
}
function stopOla(S, enSel, est, partido) {
  const n = S.unidades.length, W = 640, H = 112, cy = 62;
  const grupos = S.grupos || S.unidades.map((x, k) => [x, k, k]);
  const w = anchosOla(S), tot = w.reduce((a, b) => a + b, 0);
  const ux = [], uw = []; let acc = 0;
  for (let k = 0; k < n; k++) { ux.push(acc * W / tot); uw.push(w[k] * W / tot); acc += w[k]; }
  let barras = '', marcas = '', fondos = '';
  for (let k = 0; k < n; k++) {
    const on = enSel(k), cl = est[k] === 'traba' ? 'traba' : est[k] === 'ok' ? 'ok' : '', x = ux[k], u = uw[k];
    if (on) fondos += `<rect class="ola-sel ${cl}" x="${(x + 1).toFixed(1)}" y="26" width="${(u - 2).toFixed(1)}" height="${cy * 2 - 46}" rx="4"/>`;
    const nb = Math.max(3, Math.round(9 * w[k]));
    for (let j = 0; j < nb; j++) {
      const a = 4 + ruido(k, j) * 22 * (0.5 + 0.5 * Math.sin((k * 5 + j) / 2.3) ** 2);
      barras += `<rect class="ola-b ${on ? 'on' : ''} ${cl}" x="${(x + 4 + j * (u - 8) / nb).toFixed(1)}" y="${(cy - a).toFixed(1)}" width="${(((u - 8) / nb) * 0.55).toFixed(1)}" height="${(a * 2).toFixed(1)}" rx="1"/>`;
    }
  }
  grupos.forEach(([letra, a, b]) => {
    const x0 = ux[a] + 5, x1 = ux[b] + uw[b] - 5, on = [...Array(b - a + 1)].some((_, s) => enSel(a + s));
    const tr = [...Array(b - a + 1)].some((_, s) => est[a + s] === 'traba'), ok = [...Array(b - a + 1)].some((_, s) => est[a + s] === 'ok');
    marcas += `<path class="m-llave ${on ? 'on' : ''} ${tr ? 'traba' : ok ? 'ok' : ''}" d="M${x0.toFixed(1)} 24 v-6 H${x1.toFixed(1)} v6"/><text class="m-letra ${on ? 'on' : ''}" x="${((x0 + x1) / 2).toFixed(1)}" y="13">${esc(letra)}</text>`;
    if (tr) marcas += `<text class="ola-alerta" x="${(x1 - 2).toFixed(1)}" y="15">!</text>`;
    if (b > a && partido) for (let k = a; k <= b; k++) {
      marcas += `<text class="ola-num ${enSel(k) ? 'on' : ''}" x="${(ux[k] + uw[k] / 2).toFixed(1)}" y="${H - 2}">${esc(S.unidades[k])}</text>`;
      if (k > a) marcas += `<line class="m-corte" x1="${ux[k].toFixed(1)}" y1="30" x2="${ux[k].toFixed(1)}" y2="${H - 14}"/>`;
    }
  });
  return `<svg viewBox="0 0 ${W} ${H}" class="svg-ola" role="img" aria-label="El solo como una onda, dividido en frases">${fondos}${barras}${marcas}</svg>`;
}
function stopCuerdas(S, enSel, est) {
  // En el celu el dibujo es más angosto (y por eso se ve más grande en pantalla)
  const cel = innerWidth < 700, W = cel ? 360 : 640, n = S.unidades.length, gap = 30, y0 = 22, H = y0 * 2 + gap * (n - 1);
  const grosor = [1.4, 1.9, 2.5, 3.1, 3.7, 4.3], paso = (W - 84) / 5.5;
  let t = '';
  for (let f = 1; f < 6; f++) t += `<line class="trastes" x1="${70 + f * paso}" y1="${y0 - 10}" x2="${70 + f * paso}" y2="${H - y0 + 10}"/>`;
  t += `<rect class="cejilla" x="64" y="${y0 - 12}" width="6" height="${H - 2 * y0 + 24}" rx="2"/>`;
  for (let k = 0; k < n; k++) {
    const y = y0 + k * gap, on = enSel(k), cl = est[k] === 'traba' ? 'traba' : est[k] === 'ok' ? 'ok' : '';
    t += `<text class="c-num ${on ? 'on' : ''}" x="28" y="${y + 5}">${esc(S.unidades[k])}</text>
      ${on ? `<line class="c-brillo ${cl}" x1="70" y1="${y}" x2="${W - 14}" y2="${y}" stroke-width="${grosor[k] + 9}"/>` : ''}
      <line class="cuerda ${on ? 'on' : ''} ${cl}" x1="70" y1="${y}" x2="${W - 14}" y2="${y}" stroke-width="${grosor[k]}"/>
      ${cl === 'traba' ? `<text class="ola-alerta" x="${W - 30}" y="${y - 8}">!</text>` : ''}`;
  }
  return `<svg viewBox="0 0 ${W} ${H}" class="svg-cuerdas" role="img" aria-label="Cuerdas de la guitarra">${t}</svg>`;
}
function stopMelodia(S, enSel, est, partido) {
  const W = 640, H = 124, n = S.unidades.length, uw = W / n;
  let t = '';
  S.grupos.forEach(([letra, a, b]) => {
    const x0 = a * uw + 6, x1 = (b + 1) * uw - 6, subs = b - a + 1, sw = (x1 - x0) / subs;
    const anyOn = [...Array(subs)].some((_, s) => enSel(a + s));
    const tr = [...Array(subs)].some((_, s) => est[a + s] === 'traba'), ok = [...Array(subs)].some((_, s) => est[a + s] === 'ok');
    t += `<path class="m-llave ${anyOn ? 'on' : ''} ${tr ? 'traba' : ok ? 'ok' : ''}" d="M${x0} 22 v-6 H${x1} v6"/><text class="m-letra ${anyOn ? 'on' : ''}" x="${(x0 + x1) / 2}" y="11">${letra}</text>`;
    for (let s = 0; s < subs; s++) {
      const k = a + s, on = enSel(k), cl = est[k] === 'traba' ? 'traba' : est[k] === 'ok' ? 'ok' : '';
      const xa = x0 + s * sw, pts = [];
      for (let j = 0; j <= 6; j++) pts.push(`${(xa + 3 + j * (sw - 6) / 6).toFixed(1)},${(70 - (ruido(k, j) - .5) * 52 - Math.sin(j / 2 + k) * 8).toFixed(1)}`);
      t += `<polyline class="m-linea ${on ? 'on' : ''} ${cl}" points="${pts.join(' ')}"/>`;
      pts.forEach((p, j) => { if (j % 2 === 0) { const [x, y] = p.split(','); t += `<circle class="m-nota ${on ? 'on' : ''} ${cl}" cx="${x}" cy="${y}" r="3.2"/>`; } });
      if (subs > 1 && partido) {
        t += `<text class="m-sub ${on ? 'on' : ''}" x="${xa + sw / 2}" y="${H - 6}">${esc(S.unidades[k])}</text>`;
        if (s) t += `<line class="m-corte" x1="${xa}" y1="30" x2="${xa}" y2="108"/>`;
      }
    }
    if (tr) t += `<text class="ola-alerta" x="${x1 - 4}" y="34">!</text>`;
  });
  return `<svg viewBox="0 0 ${W} ${H}" class="svg-melodia" role="img" aria-label="El solo dividido en frases">${t}</svg>`;
}
function panelHTML(p) {
  if (!p.panel) return '';
  return `<div class="panel-vids">${p.panel.map(v => `<button class="panel-vid" data-seek="${v.video}:0"><img src="https://i.ytimg.com/vi/${esc(v.video)}/mqdefault.jpg" alt="" loading="lazy"><span>${ICONO.video}${esc(v.t)}</span></button>`).join('')}</div>`;
}
function materialHTML(p) {
  // El video de la consigna va primero como «Ver video»; los recursos que abren ese mismo video en el mismo minuto no se repiten
  const v = p.video;
  const igual = r => v && !p.sinVerVideo && ytId(r.url) === v.id && ytT(r.url) === (v.t || 0);
  const dup = (p.recursos || []).find(r => r.url && igual(r) && /ejemplo/i.test(r.t));   // «Ver ejemplo…» conserva su nombre
  const rs = (p.recursos || []).filter(r => r.url && !igual(r));
  const verVideo = v && !p.sinVerVideo ? { principal: true, t: dup ? dup.t : p.videoTit || 'Video: Ver video', url: `https://www.youtube.com/watch?v=${v.id}${v.t ? '&t=' + v.t + 's' : ''}` } : null;
  if (verVideo) rs.unshift(verVideo);
  if (!rs.length) return '';
  const nuevos = rs.filter(r => esDoc(r) && docNuevo(p, r));
  /* Un doc nuevo con sección: la tarjeta abre el doc entero y además va el botón a esa parte */
  // Los botones a una parte de ese mismo doc van al lado de la tarjeta, en el mismo renglón
  const alLado = n => rs.filter(r => r.sec && !r.col && r.url === n.url);
  const enFila = new Set(nuevos.flatMap(alLado));
  const resto = rs.filter(r => !nuevos.includes(r) && !enFila.has(r));
  // Recursos en columnas (col: 1, 2…): video arriba y su parte del doc abajo, una columna al lado de la otra
  const cols = [...new Set(resto.filter(r => r.col).map(r => r.col))];
  const sueltos = resto.filter(r => !r.col);
  const tarjeta = r => `<a class="doc-nuevo" href="${esc(r.url)}" target="_blank" rel="noopener"><span class="dn-ico">${ICONO.doc}</span><span><small>Documento nuevo: leelo antes de practicar</small><strong>${esc(r.t.replace(/^Doc:\s*/, ''))}</strong></span>${ICONO.abajo}</a>`;
  return `${nuevos.map(r => alLado(r).length ? `<div class="doc-fila">${tarjeta(r)}${alLado(r).map(recursoHTML).join('')}</div>` : tarjeta(r)).join('')}
  ${sueltos.length ? `<div class="material">${sueltos.map(recursoHTML).join('')}</div>` : ''}
  ${cols.length ? `<div class="mat-cols">${cols.map(c => `<div class="mat-col">${resto.filter(r => r.col === c).map(recursoHTML).join('')}</div>`).join('')}</div>` : ''}`;
}
function recursoHTML(r) {
  if (r.sec) return `<a class="mat mat-sec" href="${esc(linkSeccion(r.url, r.sec[0]))}"${attrSec(r.url, r.sec[0])} target="_blank" rel="noopener">${ICONO.doc}<span>Ir a <b>${esc(r.sec[1])}</b></span></a>`;
  const id = ytId(r.url);
  if (id) { const t = ytT(r.url); return `<button class="mat${r.principal ? ' mat-vid' : ''}${r.destacado ? ' mat-dest' : ''}" data-seek="${id}:${t}"><img class="mat-mini" src="https://i.ytimg.com/vi/${esc(id)}/mqdefault.jpg" alt="" loading="lazy">${ICONO.video}<span>${esc(r.t.replace(/^Video:\s*/, '').replace(/^./, c => c.toUpperCase()))}${t ? `<small>desde ${mmss(t)}</small>` : ''}</span></button>`; }
  return `<a class="mat${r.web ? ' mat-web' : ''}" href="${esc(r.url)}" target="_blank" rel="noopener">${r.web ? ICONO.web : ICONO.doc}<span>${esc(r.t)}</span></a>`;
}
function apoyoHTML(p, sel) {
  const ok = sel && sel.nivel === 'listo' && p.apoyo.textoListo;
  return `<div class="apoyo ${ok ? 'apoyo-ok' : ''}"><h4>${esc(p.apoyo.titulo)}</h4>${ok ? `<p>${enLinea(p.apoyo.textoListo)}</p>` : p.apoyo.texto ? `<p>${enLinea(p.apoyo.texto)}</p>` : ''}
    ${p.apoyo.items.map(i => `<div class="apoyo-item"><p class="apoyo-t">${esc(i.t)}</p><p class="apoyo-c">${esc(i.cuando)}</p>
      ${(i.partes || [{ video: i.video, url: i.url, sec: i.sec }]).map(pt => `${pt.titulo ? `<p class="apoyo-parte">${esc(pt.titulo)}</p>` : ''}<div class="apoyo-links">${pt.video ? `<button class="mat" data-seek="${ytId(pt.video)}:0">${ICONO.video}<span>${esc(pt.tv || 'Ver el video')}</span></button>` : ''}${pt.url ? `<a class="mat" href="${esc(pt.sec ? linkSeccion(pt.url, pt.sec) : pt.url)}"${pt.sec ? attrSec(pt.url, pt.sec) : ''} target="_blank" rel="noopener">${ICONO.doc}<span>${esc(pt.td || 'Leer el documento')}</span></a>` : ''}</div>`).join('')}</div>`).join('')}</div>`;
}
function dificultadesHTML(difs) {
  if (!difs.length) return '';
  return `<div class="dificultades"><h4>Dificultades comunes</h4>${difs.map(q => `<div class="dif"><p class="dif-q">“${esc(q.q)}”</p>${textoHTML(q.fix)}
    ${q.url ? linkHTML('Ver esa parte del video', esc(q.url)) : ''}
    ${q.doc ? `<a href="${esc(q.doc.url)}" target="_blank" rel="noopener">${esc(q.doc.t)}</a>` : ''}</div>`).join('')}</div>`;
}

function standardHTML(st) {
  const elegido = st.standard || '';
  const item = STANDARDS.find(x => x.t === elegido);
  return `<div class="pregunta"><h4>¿Con qué tema vas a trabajar?</h4>
    <div class="standards" role="radiogroup" aria-label="Standards">${STANDARDS.map(x => `<button role="radio" aria-checked="${x.t === elegido}" class="chip-op ${x.t === elegido ? 'sel' : ''}" data-standard="${esc(x.t)}">${esc(x.t)}</button>`).join('')}</div>
    <form class="otro-standard" data-form-standard="1"><input name="otro" aria-label="Otro tema" placeholder="Otro tema" value="${item || !elegido ? '' : esc(elegido)}"><button class="secundario">Elegir este</button></form>
    ${elegido ? `<div class="respuesta resp-ok festejo" role="status"><span class="resp-ico">${ICONO.ok}</span><div><p class="resp-tit">Elegiste ${esc(elegido)}</p><p>¡Ya estás muy cerca de agendar el inicio de tus encuentros sincrónicos en Ajuste Elástico!</p>${item && item.pdf ? `<a href="${esc(item.pdf)}" target="_blank" rel="noopener">Descargar la parte para trabajar (PDF)</a>` : '<p class="suave chico">Te paso la parte del tema para trabajar.</p>'}</div></div>` : ''}
  </div>`;
}

const cambiando = new Set();
const recCerradas = new Set();   // recomendaciones que el alumno cerró con «Ok»   // pasos donde el alumno tocó «Cambiar respuesta»
function preguntaHTML(st, p) {
  if (p.tipo === 'standard') return standardHTML(st);
  // Link de la llamada: en el último video, en vez de la pregunta, un solo botón que cierra todo
  if (esLlamada && p.id === (st.prog.llt2?.auto ? 'llfin' : 'llt2'))   // solo en el último video: Manu, o la bienvenida si a Manu ya lo vio en el paso de Igna
    return `<div class="pregunta ll-terminar"><button class="boton-terminar" data-terminar-llamada="${p.id}">Terminé de ver todo ✓</button></div>`;
  const sel = opcionElegida(st, p);
  const ayuda = ayudaPara(p, sel);
  // Elegida cualquier opción: se cierran las opciones y queda el mensaje (o la recomendación) con «Cambiar respuesta»
  if (sel && !cambiando.has(p.id)) return `<div class="pregunta respondida">
    ${respOMinimizada(sel, p)}
    ${ayuda.apoyo ? apoyoHTML(p, sel) : ''}
    ${dificultadesHTML(ayuda.difs)}
    <button class="link cambiar-op" data-cambiar="${p.id}">Cambiar respuesta</button>
  </div>`;
  return `<div class="pregunta"><h4>${esc(p.pregunta || '¿Cómo te fue?')}</h4>
    <div class="ops" role="radiogroup" aria-label="${esc(p.pregunta || 'Cómo te fue')}">
      ${opcionesProgreso(p).map(o => `<button role="radio" aria-checked="${sel === o}" class="op nivel-${o.nivel} ${sel === o ? 'sel' : ''}" data-op="${p.id}:${o.id}"><span class="op-punto"></span>${esc(o.label)}</button>`).join('')}
    </div>
    ${sel ? respOMinimizada(sel, p) : ''}
    ${ayuda.apoyo ? apoyoHTML(p, sel) : ''}
    ${dificultadesHTML(ayuda.difs)}
  </div>`;
}

/* Respuesta según cómo le fue: verde con tilde si va bien, recuadro de recomendación si no */
/* Cuando marca que le salió y el paso no trae respuesta propia, igual le llega un mensaje en verde */
const FESTEJOS = ['Bien ahí! A seguir así', 'Espectacular! Vamo arriba', 'Buenísimo! Venís bárbaro, seguí así', 'Esooo! A lo que sigue'];
/* «Escribime…» solo: en vez de recomendación, directo el cartel verde a WhatsApp */
const soloEscribime = sel => !!(sel && sel.nivel === 'cuesta' && sel.resp && /escrib[ií]me/i.test(sel.resp) && sel.resp.length < 80);
/* «No me sale», «me cuesta», «me trabo»…: siempre aparece el cartel verde para escribirme por WhatsApp */
const pideAyuda = sel => !!(sel && (sel.wa || sel.nivel === 'cuesta' || /no me sale|me cuesta|me trab|me pierdo|no entiendo|dudas/i.test(sel.label || '')));
function respOMinimizada(sel, p) {
  if (soloEscribime(sel)) return waCartelHTML(p);
  const wa = pideAyuda(sel) ? waCartelHTML(p) : '';
  if (!(sel.resp || sel.nivel === 'listo')) return wa;
  if (sel.nivel !== 'listo' && recCerradas.has(p.id)) return `<button class="rec-min" data-rec-abrir="${p.id}">${ICONO.idea}<span>Ver recomendación</span></button>` + wa;
  return respuestaHTML(sel, p) + wa;
}
function waCartelHTML(p) {
  if (typeof WHATSAPP_ANDY === 'undefined' || !WHATSAPP_ANDY) return '';
  const txt = `Andy, me trabé en "${p.titulo}": `;
  return `<a class="resp-wa" href="https://wa.me/${WHATSAPP_ANDY}?text=${encodeURIComponent(txt)}" target="_blank" rel="noopener">${ICONO_WA}<span>Escribime para destrabar este paso</span></a>`;
}
function respuestaHTML(sel, p) {
  const ok = sel.nivel === 'listo';
  if (ok && !sel.resp && p) {
    const n = [...p.id].reduce((t, c) => t + c.charCodeAt(0), 0);
    sel = Object.assign({}, sel, { resp: p.entrega && !p.entregaOpcional ? 'Buenísimo! Mandámelo acá abajo 👇' : FESTEJOS[n % FESTEJOS.length] });
  }
  return `<div class="respuesta ${ok ? 'resp-ok' : 'resp-rec nivel-' + sel.nivel}" role="status">
    <span class="resp-ico">${ok ? ICONO.ok : ICONO.idea}</span>
    <div>${ok ? '' : '<p class="resp-tit">Recomendación</p>'}${textoHTML(sel.resp)}${sel.url ? linkHTML('Volver a ver el ejemplo', esc(sel.url)) : ''}</div>
  </div>`;
}
/* Segunda pregunta de un paso, que depende de lo que contestó en otro (p. ej. cómo viene la transcripción) */
function seguimientoHTML(st, p) {
  const sg = p.seguimiento; if (!sg) return '';
  const prev = st.prog[sg.segun]?.op || '';
  const caso = sg.casos[prev] || sg.casos._;
  if (caso.tip) return `<div class="tip-paso">${ICONO.idea}<p>${enLinea(caso.tip)}</p></div>`;
  const elegida = caso.opciones.find(o => o.id === st.prog[p.id + '_seg']?.op);
  return `<div class="pregunta"><h4>${esc(sg.pregunta)}</h4>
    <div class="ops" role="radiogroup" aria-label="${esc(sg.pregunta)}">
      ${caso.opciones.map(o => `<button role="radio" aria-checked="${elegida === o}" class="op nivel-${o.nivel} ${elegida === o ? 'sel' : ''}" data-seg="${p.id}:${o.id}"><span class="op-punto"></span>${esc(o.label)}</button>`).join('')}
    </div>
    ${elegida && elegida.resp ? respuestaHTML(elegida) : ''}
  </div>`;
}
function videoAnterior(id) { const i = ORDEN.indexOf(id); for (let j = i - 1; j >= 0; j--) if (PASO[ORDEN[j]].video) return PASO[ORDEN[j]].video.id; return null; }
function siguienteDe(id) { const i = ORDEN.indexOf(id), sig = ORDEN[i + 1]; return sig && ST && pasoHabilitado(ST, sig) ? PASO[sig] : null; }

function tarjetaHTML(st, e, p) {
  const sel = opcionElegida(st, p);
  const sig = siguienteDe(p.id);
  const respondido = p.tipo === 'standard' ? !!st.standard : !!sel;
  // Si ya dijo que le salió y no hay video para mandar, «Seguir» va al lado del mensaje
  // Si ya le salió y no hay video para mandar: el mensaje verde, del tamaño de su texto, y «Seguir» al lado
  const seguirAlLado = !!(sig && sel && sel.nivel === 'listo' && p.tipo !== 'standard' && !cambiando.has(p.id) && (!p.entrega || sel.saltea));
  // Con recomendación: primero «Ok» (blanco, donde va «Seguir»); recién después el video y «Seguir»
  const recPendiente = !!(sel && sel.nivel !== 'listo' && sel.resp && !soloEscribime(sel) && !recCerradas.has(p.id) && !cambiando.has(p.id));
  const botonSeguir = sig ? `<div class="seguir"><button class="primario" data-abrir="${sig.id}"><span>Seguir</span>${ICONO.abajo}</button></div>` : '';
  return `<div class="tarjeta">
    ${p.detalle ? `<div class="consigna">${textoHTML(p.detalle)}</div>` : ''}
    ${p.etapasVis ? `<div class="etapas-vis">${p.etapasVis.map((x, i) => `<span class="ev-et" style="--i:${i}"><b>${i + 1}</b>${esc(x)}</span>`).join('<i class="ev-fl" aria-hidden="true"></i>')}</div>` : ''}
    ${p.nota2 ? `<div class="consigna">${textoHTML(p.nota2)}</div>` : ''}
    ${p.wa && typeof WHATSAPP_ANDY !== 'undefined' && WHATSAPP_ANDY ? `<a class="resp-wa paso-wa" href="https://wa.me/${WHATSAPP_ANDY}?text=${encodeURIComponent(p.wa.txt)}" target="_blank" rel="noopener">${ICONO_WA}<span>${esc(p.wa.label)}</span></a>` : ''}
    ${hojaDeRutaHTML(p)}
    ${p.ciclo ? `<div class="ciclo-paso" style="--rc:${MODULOS[MODULO_DE[p.etapa]].color}">${cicloHTML(p.ciclo, 0, p.id + '-ciclo')}</div>` : ''}
    ${p.stop ? stopHTML(p) : ''}
    ${p.embed ? embedHTML(p.embed) : ''}
    ${panelHTML(p)}
    ${materialHTML(p)}
    ${p.nota ? `<p class="nota-paso">${esc(p.nota)}</p>` : ''}
    ${p.tip ? `<div class="tip-paso">${ICONO.idea}<p>${esc(p.tip)}</p></div>` : ''}
    ${seguimientoHTML(st, p)}
    ${p.verYSeguir && !p.soloVer ? (sig ? `<div class="seguir"><button class="primario" data-visto-seguir="${p.id}"><span>${hecho(st, p.id) ? 'Seguir' : 'Ya lo vi, siguiente'}</span>${ICONO.abajo}</button></div>` : '') : p.soloVer ? '' : seguirAlLado ? `<div class="fila-resp"><div class="fila-fila">${respuestaHTML(sel, p)}${sel.embed ? '' : botonSeguir}</div><button class="link cambiar-op" data-cambiar="${p.id}">Cambiar respuesta</button></div>` : preguntaHTML(st, p)}
    ${recPendiente ? `<div class="seguir"><button class="primario" data-rec-ok="${p.id}">Ok</button></div>` : ''}
    ${respondido && !recPendiente && p.entrega && !sel?.saltea && sel?.nivel !== 'cuesta' && !esLlamada ? envioHTML(st, p) : ''}
    ${p.soloVer ? '' : sel?.embed && !cambiando.has(p.id) ? embedHTML(sel.embed) + (seguirAlLado ? botonSeguir : '') : ''}
    ${p.soloVer || p.verYSeguir || recPendiente ? '' : sel?.nivel === 'cuesta' && !cambiando.has(p.id) ? `<div class="seguir seguir-cuesta">${pideAyuda(sel) ? '' : escribimeHTML(p)}${sig ? `<button class="secundario" data-abrir="${sig.id}">Seguir igual</button>` : ''}</div>`
      : !seguirAlLado && respondido && sig ? `<div class="seguir">
        <button class="primario" data-abrir="${sig.id}"><span>Seguir</span>${ICONO.abajo}</button>
      </div>` : ''}
  </div>`;
}

/* Videos sueltos dentro de un paso (testimonios del link de la llamada): Instagram vertical o YouTube */
function embedHTML(e) {
  if (e.tipo === 'yt' && e.recorte) {
    // Los testimonios son verticales subidos a YouTube con bandas a los costados: muestro solo la franja del medio, sin los controles de YouTube
    const n = x => { const [a, b] = String(x).split('/').map(Number); return b ? a / b : a; };
    const rec = n(e.recorte), fte = n(e.fuente || '16/9');
    // tapa con la miniatura del video (la de YouTube es 4:3: si el video es 16:9, viene con franjas negras arriba y abajo)
    const poster = `url(https://i.ytimg.com/vi/${esc(e.id)}/hqdefault.jpg)`, alto = (100 * Math.max(1, fte / (4 / 3))).toFixed(1) + '%';
    return `<div class="emb emb-vert" style="--rec:${rec.toFixed(4)};--k:${(fte / rec).toFixed(4)};--poster:${poster};--poster-alto:${alto}">${e.eti ? `<span class="emb-eti">${esc(e.eti)}</span>` : ''}<div class="emb-marco ev-nuevo" data-ev="${esc(e.id)}"><div class="ev-yt"><div></div></div>
      <button class="ev-capa ev-zona-izq" data-ev-salto="-15" aria-label="Volver 15 segundos"></button><button class="ev-capa ev-zona-med" data-ev-capa aria-label="Pausar"></button><button class="ev-capa ev-zona-der" data-ev-salto="15" aria-label="Adelantar 15 segundos"></button>
      <span class="ev-aviso-salto"></span>
      <div class="ev-tit" aria-hidden="true"></div>
      <button class="ev-play" data-ev-play aria-label="Reproducir"><span class="spg-boton"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg></span><span class="ev-txt">Reproducir</span></button>
      <div class="ev-saltos"><button data-ev-salto="-15" aria-label="Volver 15 segundos"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.3-5.6"/><path d="M4 4v4h4"/></svg><b>15</b></button><button data-ev-salto="15" aria-label="Adelantar 15 segundos"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v4h-4"/></svg><b>15</b></button></div>
      <div class="ev-acciones"><a class="ev-en-yt" href="https://www.youtube.com/watch?v=${esc(e.id)}" target="_blank" rel="noopener" data-ev-yt aria-label="Ver en YouTube"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.5 2.5 0 0 0-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3z"/></svg><span>Ver en YouTube</span></a><button class="ev-agrandar" data-ev-grande aria-label="Ver en grande"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg><span>Ver en grande</span></button></div>
      <button class="ev-achicar" data-ev-grande aria-label="Achicar">✕</button>
      <div class="ev-barra" data-ev-barra><i></i><b></b></div><span class="ev-tiempo"></span></div></div>`;
  }
  const src = e.tipo === 'ig' ? `https://www.instagram.com/reel/${esc(e.id)}/embed/` : `https://www.youtube-nocookie.com/embed/${esc(e.id)}?rel=0&playsinline=1`;
  return `<div class="emb emb-${e.tipo}">${e.eti ? `<span class="emb-eti">${esc(e.eti)}</span>` : ''}<div class="emb-marco"><iframe src="${src}" title="${esc(e.eti || 'Video')}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write" allowfullscreen loading="lazy" scrolling="no"></iframe></div></div>`;
}
const evPlayers = new Map();
function montarVerticales() {
  document.querySelectorAll('.emb-marco.ev-nuevo').forEach(m => {
    m.classList.remove('ev-nuevo');
    const id = m.dataset.ev, hueco = m.querySelector('.ev-yt > div');
    asegurarYT(() => {
      if (!m.isConnected) return;
      if (simple || !(window.YT && window.YT.Player)) {   // sin la API: el video común, entero
        m.closest('.emb').classList.add('ev-simple');
        hueco.outerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>`;
        return;
      }
      let timer = 0;
      const barra = m.querySelector('.ev-barra i');
      const caja = m.querySelector('.ev-yt'), k = parseFloat(m.closest('.emb').style.getPropertyValue('--k')) || 1;
      const ubicar = () => { const W = m.clientWidth; if (!W) return; caja.style.width = (W * k) + 'px'; caja.style.left = (-(k - 1) / 2 * W) + 'px'; caja.style.marginLeft = '0'; };
      ubicar(); if (window.ResizeObserver) new ResizeObserver(ubicar).observe(m);
      const pl = new YT.Player(hueco, {
        videoId: id, host: 'https://www.youtube-nocookie.com',
        playerVars: { controls: 0, rel: 0, playsinline: 1, modestbranding: 1, iv_load_policy: 3, disablekb: 1, fs: 0, cc_load_policy: 0 },
        events: {
          onReady: () => { m.classList.add('ev-listo'); sinSubtitulos(pl); },
          onStateChange: ev => {
            const S = YT.PlayerState;
            m.classList.toggle('ev-sonando', ev.data === S.PLAYING || ev.data === S.BUFFERING);
            m.classList.toggle('ev-pausa', ev.data === S.PAUSED);
            m.classList.toggle('ev-fin', ev.data === S.ENDED);
            if (ev.data === S.PLAYING || ev.data === S.BUFFERING) sinSubtitulos(pl);
            clearTimeout(m._ver);
            if (ev.data === S.PLAYING) m._ver = setTimeout(() => m.classList.add('ev-ver'), 300);   // la tapa se va cuando ya arrancó: así no se ve el título de YouTube
            else if (ev.data !== S.BUFFERING) m.classList.remove('ev-ver');
            // el título de YouTube aparece arriba unos segundos cada vez que arranca: lo tapa una franja (sin tocar el iframe)
            if (ev.data === S.PLAYING && !m._titOn) { m._titOn = 1; m.classList.add('ev-tit-on'); clearTimeout(m._tit); m._tit = setTimeout(() => { m._titOn = 0; m.classList.remove('ev-tit-on'); }, 4500); }
            if (ev.data === S.PAUSED || ev.data === S.ENDED) { clearTimeout(m._tit); m._titOn = 0; m.classList.remove('ev-tit-on'); }
            if (ev.data === S.PLAYING) {
              m.classList.add('ev-arranco');
              if (player && player.pauseVideo && !panelCerrado()) try { player.pauseVideo(); } catch (_) {}
              evPlayers.forEach((o, el) => { if (el !== m && el.isConnected) try { o.pauseVideo(); } catch (_) {} });
              clearInterval(timer);
              timer = setInterval(() => { if (!m.isConnected) { clearInterval(timer); return; } try { if (pl.getCurrentTime() > 0.4) m.classList.add('ev-ver'); if (!m._arrastre) barra.style.width = (100 * pl.getCurrentTime() / (pl.getDuration() || 1)).toFixed(2) + '%'; } catch (_) {} }, 250);
            } else clearInterval(timer);
            if (ev.data === S.ENDED) barra.style.width = '100%';
          },
        },
      });
      evPlayers.set(m, pl);
    });
  });
  evPlayers.forEach((_, el) => { if (!el.isConnected) evPlayers.delete(el); });
}
// YouTube a veces prende los subtítulos automáticos aunque se le pida que no: los apago a mano
function sinSubtitulos(pl) {
  try { pl.unloadModule('captions'); pl.unloadModule('cc'); pl.setOption('captions', 'track', {}); } catch (_) {}
}
// "Ver en grande": el video ocupa toda la pantalla, recortado igual (sin mover el iframe, que si no se recarga)
function evGrande(emb, prender) {
  emb.classList.toggle('ev-grande', prender);
  document.body.classList.toggle('sin-scroll', prender);
  document.body.classList.toggle('hay-grande', prender);
  for (let e = emb.parentElement; e && e !== document.body; e = e.parentElement) e.classList.toggle('ev-sube', prender);
  if (prender) {
    const q = emb.querySelector('.emb-marco'), z = emb.currentCSSZoom || 1;
    const W = innerWidth / z, H = innerHeight / z, rec = parseFloat(emb.style.getPropertyValue('--rec')) || 0.5625;
    const w = Math.min(W - 16 / z, (H - 16 / z) * rec);
    q.style.width = w.toFixed(1) + 'px';
    if (emb.requestFullscreen && !document.fullscreenElement) emb.requestFullscreen().catch(() => {});
  } else {
    emb.querySelector('.emb-marco').style.width = '';
    if (document.fullscreenElement === emb) document.exitFullscreen().catch(() => {});
  }
}
window.addEventListener('resize', () => { const g = document.querySelector('.emb.ev-grande'); if (g) evGrande(g, true); });
document.addEventListener('fullscreenchange', () => { const g = document.querySelector('.emb.ev-grande'); if (g && !document.fullscreenElement) evGrande(g, false); });
document.addEventListener('keydown', ev => { const g = document.querySelector('.emb.ev-grande'); if (g && ev.key === 'Escape') evGrande(g, false); });
// La barra naranja se puede tocar o arrastrar para ir a otro momento del video
const evMmss = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
document.addEventListener('click', ev => {
  const a = ev.target.closest && ev.target.closest('[data-ev-yt]'); if (!a) return;
  const m = a.closest('.emb')?.querySelector('.emb-marco'), pl = m && evPlayers.get(m);
  try { pl && pl.pauseVideo(); } catch (_) {}
  const g = a.closest('.emb.ev-grande'); if (g) evGrande(g, false);
});
document.addEventListener('pointerdown', ev => {
  const bar = ev.target.closest && ev.target.closest('.ev-barra'); if (!bar) return;
  const m = bar.closest('.emb-marco'), pl = m && evPlayers.get(m); if (!pl || !pl.getDuration) return;
  const dur = pl.getDuration() || 0; if (!dur) return;
  ev.preventDefault();
  const i = bar.querySelector('i'), tiempo = m.querySelector('.ev-tiempo');
  const frac = x => { const r = bar.getBoundingClientRect(); return Math.min(1, Math.max(0, (x - r.left) / r.width)); };
  const mover = x => { const f = frac(x); i.style.transition = 'none'; i.style.width = (100 * f) + '%'; tiempo.textContent = `${evMmss(f * dur)} / ${evMmss(dur)}`; return f; };
  m._arrastre = true; m.classList.add('ev-arrastrando'); let f = mover(ev.clientX);
  const mv = e => { f = mover(e.clientX); };
  const fin = () => {
    document.removeEventListener('pointermove', mv); document.removeEventListener('pointerup', fin); document.removeEventListener('pointercancel', fin);
    try { pl.seekTo(f * dur, true); } catch (_) {}
    setTimeout(() => { m._arrastre = false; i.style.transition = ''; m.classList.remove('ev-arrastrando'); }, 400);
  };
  document.addEventListener('pointermove', mv); document.addEventListener('pointerup', fin); document.addEventListener('pointercancel', fin);
}, { passive: false });
function evAccion(b, d) {
  if (d.evGrande !== undefined) { const emb = b.closest('.emb'); evGrande(emb, !emb.classList.contains('ev-grande')); return; }
  const m = b.closest('.emb-marco'), pl = m && evPlayers.get(m); if (!pl) return;
  try {
    if (d.evCapa !== undefined) pl.pauseVideo();
    else if (d.evSalto !== undefined) {
      const dur = pl.getDuration() || 0, t = Math.max(0, Math.min(dur ? dur - 0.5 : 1e9, pl.getCurrentTime() + Number(d.evSalto)));
      pl.seekTo(t, true);
      const av = m.querySelector('.ev-aviso-salto'); av.textContent = (Number(d.evSalto) > 0 ? '+' : '−') + '15 s';
      av.classList.toggle('der', Number(d.evSalto) > 0); av.classList.remove('ver'); void av.offsetWidth; av.classList.add('ver');
    }
    else if (d.evPlay !== undefined) { if (m.classList.contains('ev-fin')) pl.seekTo(0, true); pl.playVideo(); m.classList.add('ev-pidio'); }
  } catch (_) {}
}
function envioHTML(st, p) {
  const pr = st.prog[p.id] || {};
  const envia = opcionElegida(st, p)?.envia || p.envia;
  const ok = !!pr.envio;
  const vids = pr.videos || [];
  const conVideo = /video/.test(p.entrega || '');
  const wa = typeof WHATSAPP_ANDY !== 'undefined' && WHATSAPP_ANDY ? `<a class="secundario boton" href="https://wa.me/${WHATSAPP_ANDY}" target="_blank" rel="noopener">${ICONO.enviar}Abrir WhatsApp</a>` : '';
  const pend = modo === 'alumno' ? pendientes(p.id) : [];
  const listaPend = pend.length ? `<p class="vid-pend"><span class="sp-anillo"></span>${pend.length === 1 ? 'Se está mandando tu video.' : 'Se están mandando tus videos.'} Podés seguir usando el aula; si la cerrás, se termina de mandar cuando la vuelvas a abrir.</p>` : '';
  const lista = vids.length ? `<ul class="vids">${vids.map((v, i) => `<li>${ICONO.check}<span>Video del ${fechaCorta(v.t)}${v.seg ? ' · ' + duracion(v.seg) : ''}</span>
      ${modo === 'admin-vista' ? `<button class="link" data-ver-video="${p.id}:${i}">${v.visto ? 'Ver' : 'Ver (nuevo)'}</button>` : ''}</li>`).join('')}</ul>` : '';
  const yaMando = ok || vids.length || pend.length;
  // si ya mandó (por acá o por WhatsApp), en vez de los botones grandes queda una fila chiquita para mandar otro
  const botonesVideo = !conVideo || modo === 'admin-vista' ? '' : yaMando ? '' : `<button class="primario boton-grabar" data-grabar="${p.id}"><i></i>Grabar el video acá</button>
      <label class="secundario boton subir-galeria">Subir uno que ya tengo<input type="file" accept="video/*" data-subir="${p.id}" hidden></label>`;
  const otroVideo = conVideo && modo !== 'admin-vista' && yaMando ? `<div class="otro-video"><button class="otro-btn" data-grabar="${p.id}"><i></i>Grabar otro</button><label class="otro-btn">${ICONO.enviar}Subir de la galería<input type="file" accept="video/*" data-subir="${p.id}" hidden></label></div>` : '';
  return `<div class="envio ${ok ? 'envio-ok' : ''}">
    <p class="envio-t">${ok ? ICONO.check : ICONO.enviar}<strong>${ok && pend.length && !vids.length ? 'Mandándome tu video…' : ok ? `Listo, ya me lo mandaste` : `${p.entregaOpcional ? 'Podés mandarme' : 'Mandame'} ${esc(envia || 'el ' + p.entrega)}`}</strong></p>
    ${ok || !primerasEntregas(p.id) ? '' : `<p class="envio-c">${conVideo ? 'Grabalo acá mismo o mandámelo por WhatsApp.' : 'Mandámelo por WhatsApp.'} Así lo veo antes de la clase y te doy una devolución.</p>`}
    ${lista}${listaPend}
    ${botonesVideo ? `<div class="fila-botones">${botonesVideo}</div>` : ''}${otroVideo}
    ${vids.length || pend.length ? '' : ok ? (modo === 'admin-vista' ? '' : `<button class="link cambiar-op" data-desenvio="${p.id}">No, todavía no lo mandé</button>`) : `<div class="fila-botones"><label class="envio-check"><input type="checkbox" data-envio="${p.id}" ${ok ? 'checked' : ''}><span>${conVideo ? 'Ya te lo mandé por WhatsApp' : 'Ya te lo mandé'}</span></label></div>`}
  </div>`;
}
// La explicación de cómo funciona el envío va solo en las primeras entregas del recorrido
function primerasEntregas(id) { return PROGRAMA.pasos.filter(x => x.entrega).slice(0, 3).some(x => x.id === id); }
function fechaCorta(f) { const [y, m, d] = String(f || '').split('-'); return d ? `${+d}/${+m}` : ''; }
function duracion(seg) { seg = Math.round(seg); return `${Math.floor(seg / 60)}:${String(seg % 60).padStart(2, '0')}`; }

const OLAS = [0, 34, 68, 34];
let verTodo = false, pasoNuevo = null;
const desplegados = new Set();   // módulos anteriores que el alumno abrió al ver todos los pasos   // por defecto solo se ve el paso anterior, el actual y el siguiente
function nodoHTML(st, e, p, n, total) {
  const pr = st.prog[p.id] || {};
  const est = pr.hecho ? (pr.como || 'listo') : 'pendiente';
  const abiertoEste = p.id === abierto;
  const sel = opcionElegida(st, p);
  const sub = p.tipo === 'standard' && st.standard ? st.standard : '';
  return `<section class="nodo est-${est} ${abiertoEste ? 'abierto' : ''}" id="n-${p.id}" style="--ola:${abiertoEste ? 0 : OLAS[total % OLAS.length]}px">
    <div class="nodo-fila">
      <button class="punto" data-abrir="${p.id}" aria-label="${esc(p.titulo)}">${pr.hecho && pr.como !== 'cuesta' ? ICONO.check : n}</button>
      <button class="nodo-tit" data-abrir="${p.id}" aria-expanded="${abiertoEste}"><span>${esc(p.titulo)}</span>${p.id === pasoNuevo && !pr.hecho ? '<em class="nuevo">Nuevo</em>' : ''}${sub ? `<small class="${!pr.hecho && e.tipo === 'meterle' || pr.como === 'cuesta' ? 'oxido' : ''}">${esc(sub)}</small>` : ''}</button>
      ${!abiertoEste && p.video && p.video.id !== videoAnterior(p.id) ? `<button class="mini" data-abrir="${p.id}" tabindex="-1" aria-hidden="true"><img src="https://i.ytimg.com/vi/${esc(p.video.id)}/mqdefault.jpg" alt="" loading="lazy"></button>` : ''}
    </div>
    ${abiertoEste ? tarjetaHTML(st, e, p) : ''}
  </section>`;
}
function caminoHTML(st, e) {
  // Todos los pasos visibles en orden, numerados de nuevo en cada etapa
  const items = []; const cerradas = [];
  const bloq = [], proximas = [];
  PROGRAMA.etapas.forEach(et => {
    const pasos = PROGRAMA.pasos.filter(p => p.etapa === et.id);
    const m = MODULO_DE[et.id];
    if (!moduloHabilitado(st, m)) { if (!bloq.includes(m)) bloq.push(m); return; }
    if (moduloCerradoPorClase(st, e, m)) { cerradas.push(et); return; }
    if (!pasos.length) { if (verTodo || !items.length) proximas.push(et); return; }
    pasos.filter(p => !(esLlamada && p.id === 'llt2' && st.prog.llt2?.auto)).forEach((p, i) => items.push({ et, p, n: i + 1, total: items.length + 1 }));   // si ya vio el de Manu en el paso de Igna, no se lo muestro de nuevo
  });
  // el primer paso sin hacer lleva un cartelito de "Nuevo": a veces los pasos se parecen y así se nota que cambió
  pasoNuevo = (items.find(x => !hecho(st, x.p.id) && !(st.prog[x.p.id] || {}).op) || {}).p?.id || null;
  const idx = Math.max(0, items.findIndex(x => x.p.id === abierto));
  const desde = verTodo ? 0 : Math.max(0, idx - 1), hasta = verTodo ? items.length - 1 : Math.min(items.length - 1, idx + 1);
  // Los botones cuentan solo los pasos del módulo actual; los otros módulos se ven plegados
  const mAct = items[idx] ? MODULO_DE[items[idx].et.id] : -1;
  const delActual = items.map((x, i) => MODULO_DE[x.et.id] === mAct ? i : -1).filter(i => i >= 0);
  const antes = delActual.filter(i => i < desde).length, despues = delActual.filter(i => i > hasta).length;
  const otrosAntes = items.slice(0, desde).some(x => MODULO_DE[x.et.id] !== mAct), otrosDespues = items.slice(hasta + 1).some(x => MODULO_DE[x.et.id] !== mAct);
  // Cada módulo va en su propio bloque, con su color y un título grande arriba: el cambio de módulo se nota
  let etapaPrev = null, modPrev = null, cuerpo = '';
  const etapasDelMod = m => PROGRAMA.etapas.filter(et => MODULO_DE[et.id] === m).length;
  // Al ver todos los pasos, los módulos anteriores al actual quedan plegados; se despliegan con un botón
  const modActual = items[idx] ? MODULO_DE[items[idx].et.id] : -1;
  const plegado = m => verTodo && m !== modActual && !desplegados.has(m);
  items.slice(desde, hasta + 1).forEach(x => {
    const m = MODULO_DE[x.et.id];
    if (m !== modPrev) {
      if (modPrev !== null) cuerpo += '</section>';
      const delMod = items.filter(y => MODULO_DE[y.et.id] === m);
      const listos = delMod.filter(y => hecho(st, y.p.id)).length;
      const resumen = `${delMod.length === 1 ? '1 paso' : delMod.length + ' pasos'} · ${listos === delMod.length ? 'completo' : listos ? listos + ' listos' : 'por hacer'}`;
      cuerpo += `<section class="mod-bloque ${plegado(m) ? 'mod-plegado' : ''}" style="--mc:${MODULOS[m].color}">${bannerModulo(m, x.et)}`
        + (plegado(m) ? `<button class="mod-pliegue" data-desplegar="${m}" aria-expanded="false">${ICONO.abajo}<span>Ver los pasos</span><small>${resumen}</small></button>`
          : verTodo && m !== modActual ? `<button class="mod-pliegue abierto" data-plegar="${m}" aria-expanded="true">${ICONO.abajo}<span>Plegar</span><small>${resumen}</small></button>` : '');
      modPrev = m; etapaPrev = etapasDelMod(m) === 1 ? x.et : null;
    }
    if (plegado(m)) return;
    if (x.et !== etapaPrev) cuerpo += `<div class="etapa-label"><h3>${esc(x.et.titulo)}</h3><p>${esc(x.et.sub)}</p></div>`;
    etapaPrev = x.et;
    // dentro del módulo, separado por grupo o por video, igual que en el mapa
    if (!esLlamada) { const sp = sepDe(m, x.p.id); if (sp && sp.tit) cuerpo += `<div class="etapa-label grupo-label"><h3>${esc(sp.tit)}</h3>${sp.sub ? `<p>${esc(sp.sub)}</p>` : ''}</div>`; }
    cuerpo += nodoHTML(st, e, x.p, x.n, x.total);
  });
  if (modPrev !== null) cuerpo += '</section>';
  const plural = (k, s1, s2) => `${k} ${k === 1 ? s1 : s2}`;
  return `<div class="camino" id="camino"><svg class="trazo" aria-hidden="true"><path class="trazo-base"/><path class="trazo-hecho"/></svg>
    ${verTodo ? `<button class="mas-pasos" data-accion="ver-menos">Mostrar solo el paso actual</button>`
      : antes ? `<button class="mas-pasos" data-accion="ver-todo">Ver ${plural(antes, 'paso anterior', 'pasos anteriores')}</button>`
      : otrosAntes ? `<button class="mas-pasos" data-accion="ver-todo">Ver módulos anteriores</button>` : ''}
    ${cuerpo}
    ${verTodo ? '' : despues ? `<button class="mas-pasos" data-accion="ver-todo">Ver ${plural(despues, 'paso más', 'pasos más')} de este módulo</button>`
      : otrosDespues ? `<button class="mas-pasos" data-accion="ver-todo">Ver los módulos que siguen</button>` : ''}
    ${bloq.length && (verTodo || !despues) ? `<div class="etapa-bloq" style="--mc:${MODULOS[bloq[0]].color}">${ICONO.candado}<p><small>${esc(MODULOS[bloq[0]].titulo)}</small><strong>${esc(MODULOS[bloq[0]].nombre)}</strong>Te lo habilito cuando llegue el momento.</p></div>` : ''}
    ${proximas.map(et => `<section class="mod-bloque mod-pronto" style="--mc:${MODULOS[MODULO_DE[et.id]].color}">${bannerModulo(MODULO_DE[et.id], et, 'Muy pronto')}</section>`).join('')}
    ${verTodo ? cerradas.map(et => `<div class="etapa-label"><h3>${esc(et.titulo)}</h3><p>Se abre cuando llegues a la clase 4</p></div>`).join('') + `<div class="meta"><span>${ICONO.check}</span><p>Fin del módulo 1</p></div>` : ''}
  </div>`;
}

function bannerModulo(m, et, sub) {
  const M = MODULOS[m];
  if (esLlamada) return `<div class="mod-banner"><small>Entrenamiento gratuito</small><h2>Arpegios base</h2></div>`;
  // Ya leyó los objetivos del módulo: queda solo «Módulo N»
  const obj = !sub && PROGRAMA.pasos.find(p => p.hojaDeRuta && MODULO_DE[p.etapa] === m);
  if (obj && ST && hecho(ST, obj.id)) return `<div class="mod-banner mod-banner-chico"><h2>${esc(M.titulo)}</h2></div>`;
  return `<div class="mod-banner"><small>${esc(M.titulo)}</small><h2>${esc(M.nombre)}</h2>${sub || etapasUnica(m) ? `<p>${esc(sub || et.sub)}</p>` : ''}</div>`;
}
/* Separadores para listar los pasos de un módulo (mapa y panel): por ejercitación si el módulo tiene varias
   (Módulo 1: N1, N2, N3); si no, por video. Devuelve, para cada paso, null o { tit, sub, solo } */
function separadoresPasos(pasos, m) {
  // Grupos con nombre puestos a mano en el programa (grupo: '…' en el primer paso de cada uno)
  if (pasos.some(p => p.grupo)) return pasos.map(p => p.grupo ? { tit: p.grupo, sub: '' } : null);
  if (!etapasUnica(m)) return pasos.map((p, j) => { if (j && pasos[j - 1].etapa === p.etapa) return null; const et = PROGRAMA.etapas.find(x => x.id === p.etapa); return { tit: et.titulo, sub: et.sub || '' }; });
  const vid = p => p.video && p.video.id;
  let actual = null; const grupos = [];
  pasos.forEach((p, j) => { const v = vid(p); if (v && v !== actual) { actual = v; grupos.push({ j, v, n: 1 }); } else if (grupos.length) grupos[grupos.length - 1].n++; });
  const r = pasos.map(() => null);
  grupos.forEach(g => { r[g.j] = g.n > 1 ? { tit: VIDEOS[g.v] || 'Video', sub: '' } : { tit: '', sub: '', solo: true }; });
  return r;
}
const _seps = {};
function sepDe(m, id) {
  if (!etapasUnica(m) && !pasosDelModulo(m).some(p => p.grupo)) return null;   // el Módulo 1 ya se separa por ejercitación
  if (!_seps[m]) { const ps = pasosDelModulo(m).filter(p => !p.hojaDeRuta && !p.soloLlamada), r = separadoresPasos(ps, m); _seps[m] = {}; ps.forEach((p, j) => { _seps[m][p.id] = r[j]; }); }
  return _seps[m][id] || null;
}
function etapasUnica(m) { return PROGRAMA.etapas.filter(et => MODULO_DE[et.id] === m).length === 1; }


/* ================= Cómo funciona el aula: animación de bienvenida =================
   Sale sola la primera vez que el alumno entra; después, con «Cómo funciona» arriba. */
const INTRO_AUDIO = 'audio/intro/';   // 01.m4a, 02.m4a… una por frase; si falta, avanza con el tiempo de lectura
const INTRO = [
  { t: '¡Bienvenido al aula de **Ajuste Elástico**!', ms: 2600 },
  { t: 'El aula es un camino: vas **paso a paso**, y te acompaña en cada uno.', ms: 4200 },
  { t: 'Muchas veces te propone ver primero **el video completo** y leer **el documento**…', ms: 3800 },
  { t: '…y después te separa las tareas **en pasos**, para que las hagas de a una.', ms: 3800 },
  { t: 'Está pensado para que **no te pierdas**, no te frustres y avances de la mejor manera.', ms: 4000 },
  { t: 'En cada paso tenés un botón que te lleva **al ejemplo o a la explicación** de esa tarea, en el minuto justo del video.', ms: 5800 },
  { t: 'Y otro que te lleva a **la parte del documento** que habla de eso.', ms: 3200 },
  { t: 'Conviene hacer cada tarea dentro de cada paso del aula: **así sale bien de una**.', ms: 4000 },
  { t: 'Cuando la hacés, **me mandás un video** desde acá mismo o desde WhatsApp.', ms: 3600 },
  { t: 'Con tu video vemos si **seguimos**, si **nos quedamos** o si sumamos **un paso intermedio** para que puedas destrabar.', ms: 5200 },
  { t: 'En cada paso también te pregunto **cómo te fue**. Lo ideal es contestar, aunque no haya salido bien: según lo que marques, el aula te da un consejo o te dice cómo seguir.', ms: 8800 },
  { t: 'Si después cambia, **podés modificar la respuesta**.', ms: 2600 },
  { t: 'Incluso si te fue bien, sirve para tener **un registro** de cómo venís y entender cómo avanzar.', ms: 5200 },
  { t: '¡Vamos **paso a paso**! 😉', ms: 2200 },
];
/* Un cuadro por frase (la 1 es solo el texto grande). Se arma de nuevo en cada frase, así las animaciones arrancan de cero */
function introCuadro(n) {
  const nodo = (k, cls = '') => `<span class="ic-nodo ${cls}" style="--k:${k}"><b>${k}</b><i>${ICONO.check}</i></span>`;
  const camino = (cls = '') => `<div class="ic-camino ${cls}"><span class="ic-linea"></span>${[1, 2, 3, 4].map(k => nodo(k)).join('')}<span class="ic-vos" aria-hidden="true"></span></div>`;
  const barra = (cls = '') => `<div class="ic-barra ${cls}"><i></i><i></i><i></i><i></i><span class="ic-cabezal"></span></div>`;
  const video = (cls = '') => `<div class="ic-video ${cls}"><span class="ic-play">${ICONO.video}</span>${barra()}</div>`;
  const doc = (cls = '') => `<div class="ic-doc ${cls}"><span class="ic-hoja"><b>Paso 1</b><i></i><i></i><b>Paso 2</b><i></i><i></i><b class="ic-p3">Paso 3</b><i></i><i></i></span><span class="ic-hoja h2"></span><span class="ic-hoja h3"></span></div>`;
  const C = {
    2: () => camino('ic-acompana'),
    3: () => `<div class="ic-fila">${video('ic-completo')}<span class="ic-y">+</span>${doc('ic-pasan')}</div><p class="ic-cap">1ª pasada: mirar y leer</p>`,
    4: () => `<div class="ic-separa">${video('ic-partido')}<div class="ic-tareas">${[1, 2, 3, 4].map(k => `<span class="ic-tarea" style="--k:${k}"><b>${k}</b>Tarea ${k}</span>`).join('')}</div></div>`,
    5: () => `<div class="ic-fila">${camino('ic-avanza')}<div class="ic-sin">${['Sin perderte', 'Sin frustrarte', 'Avanzando bien'].map((x, i) => `<span style="--k:${i}">${ICONO.check}${x}</span>`).join('')}</div></div>`,
    6: () => `<div class="ic-col">${video('ic-salta')}<span class="ic-boton ic-b-vid">${ICONO.video}Ver ejemplo <small>desde 25:16</small><span class="ic-cursor"></span></span></div>`,
    7: () => `<div class="ic-fila ic-centro"><span class="ic-boton ic-b-doc">${ICONO.doc}Ir a <b>Paso 3</b><span class="ic-cursor"></span></span><span class="ic-flecha"></span>${doc('ic-resalta')}</div>`,
    8: () => `<div class="ic-paso"><p class="ic-paso-t">Paso 3 · Soltar la dirección melódica</p><div class="ic-mini">${ICONO.video}<span>Ejemplo · 25:16</span></div><div class="ic-mini">${ICONO.doc}<span>Ir a Paso 3</span></div><div class="ic-hago"><svg class="ic-guitarra" viewBox="-46 -62 150 92" aria-hidden="true">${guitarraSVG(0, 0, 'vibra')}</svg><span class="ic-ok">${ICONO.check}Hecho, de una</span></div></div>`,
    9: () => `<div class="ic-col ic-envio"><span class="ic-grabar"><i></i>Grabar video</span><span class="ic-o">o</span><span class="ic-wa">${ICONO_WA}Por WhatsApp</span><span class="ic-mandado">${ICONO.check}Listo, ya me lo mandaste</span></div>`,
    10: () => `<svg class="ic-rama" viewBox="0 0 320 170" aria-hidden="true">
        <path class="r-base" d="M60 85 H110"/><circle class="r-nodo yo" cx="60" cy="85" r="15"/><text x="60" y="90">3</text>
        <path class="r-op o1" d="M110 85 C150 85 170 30 230 30"/><circle class="r-nodo o1" cx="248" cy="30" r="15"/><text class="o1" x="248" y="35">4</text><text class="r-et o1" x="248" y="62">Seguimos</text>
        <path class="r-op o2" d="M110 85 C140 85 150 120 120 132 C95 140 80 115 92 100"/><text class="r-et o2" x="140" y="160">Nos quedamos</text>
        <path class="r-op o3" d="M110 85 H210"/><circle class="r-nodo r-mini o3" cx="222" cy="85" r="9"/><text class="r-et o3 r-izq" x="238" y="90">Paso intermedio</text></svg>`,
    11: () => `<div class="ic-como"><p class="ic-preg">¿Cómo te fue?</p><span class="ic-op">Me salió bien</span><span class="ic-op ic-sel-casi">Me cuesta un poco</span><span class="ic-op">No me sale</span><div class="ic-consejo"><b>Consejo</b>Bajá a 2 cuerdas un ratito y después volvé a juntar.</div></div>`,
    12: () => `<div class="ic-como ic-cambia"><p class="ic-preg">¿Cómo te fue?</p><span class="ic-op ic-op-bien">Me salió bien</span><span class="ic-op ic-op-casi">Me cuesta un poco</span><span class="ic-op">No me sale</span></div>`,
    13: () => `<div class="ic-registro"><p class="ic-preg">Tu registro</p><div class="ic-linea-t">${['bien', 'casi', 'bien', 'bien', 'casi', 'bien', 'bien'].map((x, i) => `<span class="ic-r ${x}" style="--k:${i}"></span>`).join('')}</div><div class="ic-leyenda"><span class="bien">Me salió</span><span class="casi">Me costó un poco</span></div></div>`,
    14: () => camino('ic-final'),
  };
  return C[n] ? `<div class="ic ic-${n}">${C[n]()}</div>` : '';
}
const audioIntro = new Audio(); audioIntro.preload = 'auto'; audioIntro.defaultPlaybackRate = 1.15; audioIntro.preservesPitch = true;
/* Se marca en el progreso del alumno (prog.intro), así la ve una sola vez aunque entre desde otro dispositivo,
   y también la ven los alumnos que ya venían usando el aula */
const introVista = () => !!(ST?.prog?.intro || leerLocal('mapaAE_intro_' + (ST?.codigo || '')));
function mostrarIntro() {
  guardarLocal('mapaAE_intro_' + (ST?.codigo || ''), 1);
  if (modo === 'alumno' && ST && !ST.prog.intro) { ST.prog.intro = { t: hoyISO() }; guardarAlumno(); }
  const el = document.createElement('div');
  el.className = 'intro-aula'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Cómo funciona el aula');
  const nodo = i => `<span class="in-nodo" data-n="${i}"><b>${i}</b><i>${ICONO.check}</i></span>`;
  el.innerHTML = `<div class="in-caja">
    <div class="logo-ae">${LOGO}</div>
    <p class="in-sobre">Cómo funciona el aula</p>
    <p class="in-texto" aria-live="polite"></p>
    <div class="in-escena" data-s="0"></div>
    <div class="in-ctrl">
      <button class="link suave" data-in="saltear">Saltear</button>
      <span class="in-puntos">${INTRO.map((_, i) => `<i data-p="${i + 1}"></i>`).join('')}</span>
      <button class="primario" data-in="sig">Siguiente</button>
    </div></div>`;
  document.body.appendChild(el);
  const esc_ = el.querySelector('.in-escena'), txt = el.querySelector('.in-texto'), sig = el.querySelector('[data-in="sig"]');
  let s = 0, h = null;
  const ir = n => {
    s = n; clearTimeout(h);
    esc_.dataset.s = s === 1 ? 0 : s; esc_.innerHTML = introCuadro(s);
    el.querySelectorAll('.in-puntos i').forEach(x => x.classList.toggle('on', +x.dataset.p <= s));
    txt.classList.remove('ver'); void txt.offsetWidth; txt.innerHTML = enLinea(INTRO[s - 1].t); txt.classList.add('ver');
    sig.textContent = s === INTRO.length ? 'Arrancar' : 'Siguiente';
    sig.classList.toggle('in-final', s === INTRO.length);
    const yo = s, sigue = () => { if (s === yo && s < INTRO.length) ir(s + 1); };
    audioIntro.onended = audioIntro.onerror = null; audioIntro.pause();
    if (reduceMotion) return;
    audioIntro.src = INTRO_AUDIO + String(s).padStart(2, '0') + '.m4a?v=10'; audioIntro.playbackRate = 1.15;   // ?v=: que el navegador no use la versión vieja
    const t0 = Date.now();   // con audio, pasa al terminar, pero nunca antes del tiempo de lectura de la frase
    audioIntro.onended = () => { h = setTimeout(sigue, Math.max(300, INTRO[yo - 1].ms / 1.15 - (Date.now() - t0))); };
    audioIntro.onerror = () => { clearTimeout(h); h = setTimeout(sigue, INTRO[yo - 1].ms); };
    audioIntro.play().catch(() => { clearTimeout(h); h = setTimeout(sigue, INTRO[yo - 1].ms); });
  };
  const cerrar = () => { clearTimeout(h); audioIntro.onended = audioIntro.onerror = null; audioIntro.pause();
    introPendiente = false;
    // las animaciones que quedaron tapadas arrancan ahora
    el.classList.remove('visible'); setTimeout(reanudarAnimaciones, 0); setTimeout(() => { el.remove(); if (celebracionPendiente()) quizasCelebrar(); }, 400); };
  el.onclick = ev => { const b = ev.target.closest('[data-in]'); if (!b) return; if (b.dataset.in === 'saltear' || s === INTRO.length) cerrar(); else ir(s + 1); };
  requestAnimationFrame(() => { el.classList.add('visible'); ir(1); sig.focus(); });
}

/* Al entrar por primera vez a un módulo nuevo: pantalla de «Pasaste al módulo N» */
function moduloVisto(m) { const l = leerLocal('mapaAE_modVistos_' + (ST?.codigo || '')) || []; return l.includes(m); }
function marcarModuloVisto(m) { const k = 'mapaAE_modVistos_' + (ST?.codigo || ''); const l = leerLocal(k) || []; if (!l.includes(m)) { l.push(m); guardarLocal(k, l); } }
function celebrarModulo(m, alCerrar) {
  marcarModuloVisto(m);
  const M = MODULOS[m];
  const el = document.createElement('div');
  el.className = 'pase-modulo'; el.style.setProperty('--mc', M.color); el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Nuevo módulo');
  el.innerHTML = `<div class="pm-in"><div class="logo-ae">${LOGO}</div><p class="pm-pre">${m === 0 ? 'Empezás' : 'Pasaste al'}</p><p class="pm-num">${esc(M.titulo)}</p><h2>${esc(M.nombre)}</h2>
    <button class="primario" data-pm>${m === 0 ? 'Empezar' : 'Arrancar'}</button></div>`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('visible'));
  const cerrar = () => { el.classList.remove('visible'); setTimeout(() => { el.remove(); reanudarAnimaciones(); }, 400); alCerrar && alCerrar(); };
  el.querySelector('[data-pm]').onclick = cerrar;
  el.querySelector('[data-pm]').focus();
}
function quizasCelebrar() {
  if ((modo !== 'alumno' && modo !== 'admin-prueba') || !ST || !abierto || !PASO[abierto]) return;
  const m = MODULO_DE[PASO[abierto].etapa];
  if (m > 0 && !moduloVisto(m)) celebrarModulo(m);
  else if (m === 0) marcarModuloVisto(0);
}

function vistaHTML(st, e, animar) {
  const extrasPend = (st.extras || []).filter(x => !x.hecho);
  return `<header class="hero">
      <p class="hero-prog">${esc(PROGRAMA.programa)}${st.standard ? `<span>Tu standard: ${esc(st.standard)}</span>` : ''}<span class="hero-botones">${esLlamada ? '' : `<button class="boton-mapa" data-accion="intro">${ICONO.idea}Cómo funciona</button>`}<button class="boton-mapa" data-accion="mapa">${ICONO_MAPA}<span>Ver el mapa</span></button>${(st.clases || []).length && !esLlamada ? `<button class="boton-mapa" data-accion="clases">${ICONO_CLASES}<span>Tus clases</span></button>` : ''}</span></p>
      <h1>${esLlamada ? (typeof QUIEN !== 'undefined' && QUIEN ? `Hola, ${esc(QUIEN.nombre.split(' ')[0])}!` : 'Hola!') : `Hola, ${esc(st.nombre.split(' ')[0])}`}</h1>
      ${esLlamada ? '' : `<div class="estado estado-${e.tipo}"><strong>${titularEstado(e)}</strong><span>${esc(bajadaEstado(st, e))}</span></div>
      ${tiraClases(st, e, animar)}`}
      ${esLlamada ? '' : e.k <= 4 && !e.faltan.length ? `<div class="pregunta-clase" id="claseHecha"><p><strong>¿Ya tuvimos la clase ${e.k}?</strong>Ya tenés todo lo que se esperaba para esa clase. Si ya la tuviste, marcala así se te abre lo que sigue.</p>
          <div class="fila-botones"><button class="primario" data-accion="clase-ok">Sí, ya la tuve</button><button class="secundario" data-accion="clase-no">Todavía no</button></div></div>`
        : e.k <= 4 && !esLlamada ? `<div class="clase-hecha" id="claseHecha"><button class="link suave" data-accion="clase">Ya tuve la clase ${e.k}</button>${st.clase > 0 ? `<button class="link suave" data-accion="deshacer-clase">Todavía no tuve la clase ${st.clase}</button>` : ''}</div>` : ''}
    </header>
    ${(st.clases || []).length && !esLlamada ? claseHTML(st, st.clases[0], true) : ''}
    ${st.nota ? `<blockquote class="nota"><p>${esc(st.nota).replace(/\n/g, '<br>')}</p><cite>Andy</cite></blockquote>` : ''}
    ${extrasPend.length ? `<section class="de-andy"><h2>Te dejé</h2>${extrasPend.map(x => `
      <label class="extra"><input type="checkbox" data-extra="${esc(x.id)}"><span><strong>${esc(x.titulo)}</strong>${x.detalle ? `<br><span class="suave">${esc(x.detalle)}</span>` : ''}</span></label>`).join('')}</section>` : ''}
    ${instalarAppHTML()}
    ${caminoHTML(st, e)}
    ${esLlamada ? (PASOS_LLAMADA.every(id => hecho(st, id)) ? `<div class="ll-fin"><b>¡Buenísimo!</b><span>Ya estás listo para tu llamada conmigo.</span><span>Escribime un mensaje por WhatsApp y contame qué te pareció todo esto 😉</span>${waLlamada('resp-wa ll-fin-wa')}</div>` : '') : selectorModulosHTML(st, e)}
    ${modo === 'alumno' ? `<p class="salir-pie"><span>${esc(st.nombre)}</span> · <button class="link suave" data-accion="salir">Salir de mi cuenta</button></p>` : ''}
    ${esLlamada ? '' : barraClaseHTML(st, e)}`;
}

// Alumnos de antes (sin módulos asignados): del módulo 2 en adelante se abre después de la clase 4
function moduloCerradoPorClase(st, e, m) {
  if (modo === 'admin-prueba' || m < 2 || !sinModulos(st) || e.k >= 4) return false;
  return !PROGRAMA.pasos.some(p => MODULO_DE[p.etapa] === m && tocado(st, p.id));
}
function pasosDelModulo(m) { return PROGRAMA.pasos.filter(p => MODULO_DE[p.etapa] === m); }
/* Abajo de todo: elegir módulo. Los que todavía no están habilitados, con candado */
/* El mapa completo: un "zoom out" del aula, módulo por módulo, sin videos */
const ICONO_MAPA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4 3 6.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5zM9 4v13.5M15 6.5V20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
function mapaHTML(st, e) {
  const { lista } = recomendaciones(st, 1);
  const ahora = lista[0] ? lista[0].id : (abierto || ORDEN[0]);
  const modAhora = MODULO_DE[PASO[ahora].etapa];
  return `<div class="mapa-zoom" role="dialog" aria-modal="true" aria-label="Tu mapa">
    <div class="mz-cab"><div><small>${esc(PROGRAMA.programa)}</small><h2>Tu mapa</h2></div><button class="mz-cerrar" data-accion="cerrar-mapa" aria-label="Cerrar el mapa">✕</button></div>
    ${(st.extras || []).length ? `<section class="mz-extras"><h3>Te dejé</h3><ul class="mz-lista">${st.extras.map(x => `<li class="${x.hecho ? 'ok' : ''}">
        <button class="mz-tilde" data-mapa-extra="${esc(x.id)}" aria-pressed="${!!x.hecho}" aria-label="${x.hecho ? 'Desmarcar' : 'Marcar como hecha'}: ${esc(x.titulo)}"><i>${x.hecho ? ICONO.check : ''}</i></button>
        <span>${esc(x.titulo)}${x.detalle ? `<small>${esc(x.detalle)}</small>` : ''}</span></li>`).join('')}</ul></section>` : ''}
    <p class="mz-ayuda">Tocá el circulito de cada paso para marcarlo como hecho, así sabés qué te falta</p>
    <ol class="mz-camino">${MODULOS.map((M, i) => {
      const pasos = pasosDelModulo(M.n).filter(p => !p.hojaDeRuta);
      const obj = PROGRAMA.pasos.find(p => p.hojaDeRuta && MODULO_DE[p.etapa] === M.n);
      const abiertoMod = moduloHabilitado(st, M.n) && !moduloCerradoPorClase(st, e, M.n);
      const listos = pasos.filter(p => hecho(st, p.id)).length;
      const completo = pasos.length && listos === pasos.length;
      const aca = M.n === modAhora && !completo;
      const est = !pasos.length ? 'Muy pronto' : completo ? 'Completo' : !abiertoMod ? 'Todavía no' : `${listos} de ${pasos.length} pasos`;
      const h = obj && obj.hojaDeRuta;
      return `<li class="mz-mod ${completo ? 'completo' : ''} ${aca ? 'aca' : ''} ${abiertoMod && pasos.length ? '' : 'bloq'} ${i % 2 ? 'der' : 'izq'}" style="--mc:${M.color}">
        <span class="mz-parada">${completo ? ICONO.check : !abiertoMod || !pasos.length ? ICONO.candado : M.n}</span>
        <div class="mz-tarjeta">
          ${aca ? '<span class="mz-aca">Estás acá</span>' : ''}
          <small>${esc(M.titulo)}</small><h3>${esc(M.nombre)}</h3>
          <p class="mz-estado">${esc(est)}</p>
          ${abiertoMod && pasos.length && !aca ? `<button class="mz-ir" data-mapa-modulo="${M.n}">${completo ? 'Repasar este módulo' : 'Ir a este módulo'} ›</button>` : ''}
          ${h && h.meta ? `<p class="mz-meta">${enLinea(h.meta)}</p>` : ''}
          ${h && h.puente ? `<div class="mz-pasitos">${h.puente.pasos.map(x => `<span>${esc(x)}</span>`).join('<i>→</i>')}${h.puente.ciclo ? '<i>↺</i>' : ''}</div>` : ''}
          ${pasos.length ? `<div class="mz-det"><ul class="mz-lista">${(seps => pasos.map((p, j) => {
            const ok = hecho(st, p.id), cur = p.id === ahora;
            // separados como en el aula: por ejercitación (1, 2, 3…) o por video
            const sp = seps[j];
            return `${sp ? `<li class="mz-etapa ${sp.solo ? 'mz-sep' : ''}">${sp.tit ? `<strong>${esc(sp.tit)}</strong>` : ''}${sp.sub ? `<small>${esc(sp.sub)}</small>` : ''}</li>` : ''}<li class="${ok ? 'ok' : ''} ${cur ? 'cur' : ''}">${abiertoMod
              ? `<button class="mz-tilde" data-mapa-tilde="${p.id}" aria-pressed="${ok}" aria-label="${ok ? 'Desmarcar' : 'Marcar como hecho'}: ${esc(p.titulo)}"><i>${ok ? ICONO.check : ''}</i></button><button data-mapa-paso="${p.id}">${esc(p.titulo)}${cur ? '<em>sigue</em>' : ''}</button>`
              : `<span><i></i>${esc(p.titulo)}</span>`}</li>`;
          }).join(''))(separadoresPasos(pasos, M.n))}</ul></div>` : ''}
        </div></li>`;
    }).join('')}</ol>
  </div>`;
}
/* ----- Las clases: el resumen que te dejé, con las tareas conectadas a los pasos del aula ----- */
const ICONO_CLASES = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h11l3 3v13H5z M8 10h8M8 13.5h8M8 17h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
const claseMarcas = (st, c) => (st.prog['cl-' + c.id] || {}).hechas || [];
function claseHTML(st, c, enInicio) {
  const hechas = claseMarcas(st, c);
  const sugeridos = (c.pasos || []).filter(id => PASO[id] && !hecho(st, id));
  const tareas = (c.tareas || []).map((t, i) => {
    const ok = hechas.includes(i), p = t.paso && PASO[t.paso];
    const ir = p ? (pasoHabilitado(st, p.id) ? `<button class="cl-ir" data-ir-paso="${esc(p.id)}">Ir al paso: ${esc(p.titulo)} ›</button>` : `<span class="cl-nota">Es del ${esc(MODULOS[MODULO_DE[p.etapa]]?.titulo || 'módulo que viene')}: te lo abro cuando arranquemos</span>`)
      : '';
    return `<li class="${ok ? 'ok' : ''}"><button class="cl-tilde" data-clase-tarea="${esc(c.id)}:${i}" aria-pressed="${ok}" aria-label="${ok ? 'Desmarcar' : 'Marcar como hecha'}"><i>${ok ? ICONO.check : ''}</i></button>
      <div class="cl-tarea"><span class="cl-txt">${enLinea(t.texto)}</span>${ir}</div></li>`;
  }).join('');
  return `<section class="clase-card${enInicio ? ' en-inicio' : ''}">
    <div class="cl-cab"><h2>${enInicio ? 'Lo de nuestra última clase' : 'Clase del ' + esc(fechaCorta(c.fecha))}</h2>${enInicio ? `<span class="suave">${esc(fechaCorta(c.fecha))}</span>` : ''}</div>
    ${tareas ? `<p class="cl-sub">${c === st.clases[0] ? 'Para esta semana' : 'Lo que quedó para trabajar'}</p><ul class="cl-lista">${tareas}</ul>` : ''}
    ${sugeridos.length ? `<div class="cl-sug"><p>En la clase vimos que esto ya lo tenés. ¿Lo marcamos como hecho?</p>${sugeridos.map(id => `<button class="secundario" data-clase-hecho="${esc(id)}">${ICONO.check}${esc(PASO[id].titulo)}</button>`).join('')}</div>` : ''}
    ${modo === 'admin-vista' ? `<button class="link suave cl-sacar" data-clase-sacar="${esc(c.id)}">Sacar este resumen de su aula</button>` : ''}
    ${c.resumen ? `<details class="cl-resumen"><summary>Ver el resumen completo</summary><div class="cl-texto">${textoHTML(c.resumen)}</div></details>` : ''}
    ${enInicio && st.clases.length > 1 ? `<button class="link suave cl-todas" data-accion="clases">Ver todas tus clases (${st.clases.length})</button>` : ''}
  </section>`;
}
function clasesHTML(st) {
  return `<div class="mapa-zoom clases-zoom" role="dialog" aria-modal="true" aria-label="Tus clases">
    <div class="mz-cab"><div><small>${esc(PROGRAMA.programa)}</small><h2>Tus clases</h2></div><button class="mz-cerrar" data-accion="cerrar-mapa" aria-label="Cerrar">✕</button></div>
    <div class="cl-todas-lista">${(st.clases || []).map(c => claseHTML(st, c, false)).join('')}</div></div>`;
}
function abrirClases() {
  cerrarMapaZoom();
  document.body.insertAdjacentHTML('beforeend', clasesHTML(ST));
  document.body.classList.add('con-mapa');
  const el = document.querySelector('.clases-zoom');
  el.onclick = ev => { const b = ev.target.closest('button'); if (!b) return; if (b.dataset.accion === 'cerrar-mapa') cerrarMapaZoom(); else accionClase(b.dataset); };
  el.querySelector('.mz-cerrar').focus();
}
function refrescarClases() {
  const el = document.querySelector('.clases-zoom'); if (!el) return;
  const top = el.scrollTop, abiertos = [...el.querySelectorAll('details')].map(d => d.open);
  const tmp = document.createElement('div'); tmp.innerHTML = clasesHTML(ST);
  el.innerHTML = tmp.firstElementChild.innerHTML;
  el.querySelectorAll('details').forEach((d, i) => { d.open = !!abiertos[i]; });
  el.scrollTop = top;
}
// devuelve true si era un botón de las clases
function accionClase(d) {
  if (d.irPaso) { cerrarMapaZoom(); abrirPaso(d.irPaso); return true; }
  if (d.claseTarea) {
    const [id, i] = d.claseTarea.split(':'), k = 'cl-' + id, pr = ST.prog[k] || { hechas: [] };
    const l = new Set(pr.hechas || []); l.has(+i) ? l.delete(+i) : l.add(+i);
    ST.prog[k] = { hechas: [...l].sort((a, b) => a - b), t: hoyISO() };
    guardarAlumno(); sinSaltar(() => renderAlumno()); refrescarClases(); return true;
  }
  if (d.claseSacar) { sacarClase(d.claseSacar); return true; }
  if (d.claseHecho) {
    const id = d.claseHecho; ST.prog[id] = Object.assign({}, ST.prog[id], { hecho: true, como: 'listo', t: hoyISO(), origen: 'clase' });
    guardarAlumno(); sinSaltar(() => renderAlumno()); refrescarClases(); return true;
  }
  return false;
}
async function sacarClase(id) {
  if (modo !== 'admin-vista') return;
  const b = document.querySelector(`[data-clase-sacar="${CSS.escape(id)}"]`);
  // dos toques: el primero pide confirmar
  if (b && !b.dataset.seguro) { b.dataset.seguro = '1'; b.textContent = 'Tocá de nuevo para sacarlo'; setTimeout(() => { if (b.isConnected) { delete b.dataset.seguro; b.textContent = 'Sacar este resumen de su aula'; } }, 4000); return; }
  if (b) b.textContent = 'Sacando…';
  try {
    await llamar('admin.clase', { clave: claveAdmin, id, decision: 'descartar' });
    ST.clases = (ST.clases || []).filter(c => c.id !== id);
    const a = LISTA.find(x => x.codigo === ST.codigo); if (a) a.clases = (a.clases || []).filter(c => c.id !== id);
    cerrarMapaZoom(); sinSaltar(() => renderAlumno()); aviso('Listo, ya no lo ve');
  } catch (e) { aviso(e.message, true); }
}
function abrirMapaZoom() {
  const { e } = recomendaciones(ST, 1);
  document.querySelector('.mapa-zoom')?.remove();
  document.body.insertAdjacentHTML('beforeend', mapaHTML(ST, e));
  document.body.classList.add('con-mapa');
  const el = document.querySelector('.mapa-zoom');
  el.onclick = ev => {
    const b = ev.target.closest('button'); if (!b) return;
    if (b.dataset.accion === 'cerrar-mapa') cerrarMapaZoom();
    else if (b.dataset.mapaPaso) { const id = b.dataset.mapaPaso; cerrarMapaZoom(); abrirPaso(id); }
    else if (b.dataset.mapaModulo !== undefined) {
      const ps = pasosDelModulo(+b.dataset.mapaModulo); const p = ps.find(x => !hecho(ST, x.id)) || ps.find(x => !x.hojaDeRuta) || ps[0];
      cerrarMapaZoom(); if (p) abrirPaso(p.id);
    }
    else if (b.dataset.mapaTilde) {
      const id = b.dataset.mapaTilde, pr = ST.prog[id];
      if (hecho(ST, id)) { if (pr && pr.videos) ST.prog[id] = { videos: pr.videos }; else delete ST.prog[id]; }
      else ST.prog[id] = Object.assign({}, pr, { hecho: true, como: 'listo', t: hoyISO() });
      guardarAlumno(); renderAlumno(); refrescarMapaZoom();
    } else if (b.dataset.mapaExtra) {
      const x = (ST.extras || []).find(y => y.id === b.dataset.mapaExtra); if (!x) return;
      x.hecho = !x.hecho; guardarAlumno(); renderAlumno(); refrescarMapaZoom();
    }
  };
  const aca = el.querySelector('.mz-mod.aca'); if (aca) setTimeout(() => aca.scrollIntoView({ block: 'center' }), 30);
  el.querySelector('.mz-cerrar').focus();
}
/* Redibuja el mapa sin perder el scroll ni lo que estaba desplegado */
function refrescarMapaZoom() {
  const el = document.querySelector('.mapa-zoom'); if (!el) return;
  const top = el.scrollTop, abiertos = [...el.querySelectorAll('.mz-det')].map(d => d.open);
  const { e } = recomendaciones(ST, 1);
  const tmp = document.createElement('div'); tmp.innerHTML = mapaHTML(ST, e);
  el.innerHTML = tmp.firstElementChild.innerHTML;
  el.querySelectorAll('.mz-det').forEach((d, i) => { if (i < abiertos.length) d.open = abiertos[i]; });
  el.scrollTop = top;
}
function cerrarMapaZoom() { document.querySelector('.mapa-zoom')?.remove(); document.body.classList.remove('con-mapa'); }
document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && document.querySelector('.mapa-zoom')) cerrarMapaZoom(); });

function selectorModulosHTML(st, e) {
  const actual = abierto && PASO[abierto] ? MODULO_DE[PASO[abierto].etapa] : -1;
  return `<section class="selector-mod" aria-label="Módulos"><h3>Módulos</h3><div class="sm-lista">${MODULOS.map(M => {
    const pasos = pasosDelModulo(M.n);
    const abiertoMod = moduloHabilitado(st, M.n) && !moduloCerradoPorClase(st, e, M.n);
    const listos = pasos.filter(p => hecho(st, p.id)).length;
    const estado = !abiertoMod ? `${ICONO.candado}<span>Todavía no</span>` : !pasos.length ? '<span>Muy pronto</span>'
      : listos === pasos.length ? `${ICONO.check}<span>Completo</span>` : `<span>${listos} de ${pasos.length}</span>`;
    return `<button class="sm-item ${M.n === actual ? 'actual' : ''} ${abiertoMod && pasos.length ? '' : 'bloq'}" style="--mc:${M.color}" data-ir-modulo="${M.n}" ${abiertoMod && pasos.length ? '' : 'disabled'}>
      <small>${esc(M.titulo)}</small><strong>${esc(M.nombre)}</strong><span class="sm-estado">${estado}</span></button>`;
  }).join('')}</div></section>`;
}

/* Barra fija abajo: cuánto falta para la próxima clase y qué sigue (no el módulo entero) */
/* La barra de abajo arranca plegada (solapita); se acuerda de lo que eligió el alumno */
const leerLS = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (_) { return d; } };
const guardarLS = (k, v) => { try { localStorage.setItem(k, v); } catch (_) {} };
let barraPlegada = leerLS('ae-barra', 'plegada') === 'plegada';
/* Con la barra abierta, tocar en cualquier lado (menos el botón de lo que sigue) la pliega */
document.addEventListener('click', ev => {
  if (barraPlegada || !document.querySelector('.barra-clase:not(.plegada)')) return;
  if (ev.target.closest('.bc-sig, [data-plegar]')) return;
  barraPlegada = true; guardarLS('ae-barra', 'plegada');
  const b = document.querySelector('.barra-clase'); if (b && ST) { const { e } = recomendaciones(ST, 3); b.outerHTML = barraClaseHTML(ST, e) || ''; }
});
function barraClaseHTML(st, e) {
  if (e.tipo === 'm2' || e.k > PROGRAMA.clases) return '';
  const prev = new Set(requeridos(e.k - 1, e.col));
  const foco = e.R.filter(id => !prev.has(id) || !hecho(st, id));
  if (!foco.length) return '';
  const listos = foco.filter(id => hecho(st, id)).length;
  const sig = e.faltan.find(id => id !== abierto);
  const enActual = e.faltan.includes(abierto);
  const der = !e.faltan.length
    ? `<span class="bc-listo">${ICONO.check}Ya tenés todo para la clase ${e.k}</span>`
    : sig ? `<button class="bc-sig" data-abrir="${sig}"><small>${enActual ? 'Después' : 'Sigue'}</small><span>${esc(PASO[sig].titulo)}</span></button>`
    : `<span class="bc-listo bc-ultimo">Te queda este paso</span>`;
  if (barraPlegada) return `<nav class="barra-clase plegada" aria-label="Avance para la próxima clase">
    <button class="bc-solapa" data-plegar="abrir" aria-expanded="false"><strong>Para la clase ${e.k}</strong><span>${listos} de ${foco.length}</span><b aria-hidden="true">▴</b></button>
  </nav>`;
  return `<nav class="barra-clase" aria-label="Avance para la próxima clase">
    <button class="bc-cerrar" data-plegar="cerrar" aria-label="Plegar" aria-expanded="true">▾</button>
    <div class="bc-izq"><strong>Para la clase ${e.k}</strong><span>${listos} de ${foco.length} listos</span>
      <span class="bc-puntos" aria-hidden="true">${foco.map(id => `<i class="${hecho(st, id) ? 'ok' : id === abierto ? 'ahora' : ''}"></i>`).join('')}</span></div>
    ${der}
  </nav>`;
}

/* Botón sutil de consulta por WhatsApp: la primera vez muestra el cartelito, después queda solo el ícono */
const ICONO_WA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.8-1.2.2-.6.2-1.1.1-1.2l-.5-.3z"/></svg>';
/* Cuando algo le cuesta: botón «Escribime» al WhatsApp con el paso ya puesto, y el botón flotante se ilumina */
function escribimeHTML(p) {
  if (typeof WHATSAPP_ANDY === 'undefined' || !WHATSAPP_ANDY) return '';
  const txt = `Andy, me está costando${p ? ` "${p.titulo}"` : ''}: `;
  return `<a class="escribime" href="https://wa.me/${WHATSAPP_ANDY}?text=${encodeURIComponent(txt)}" target="_blank" rel="noopener">${ICONO_WA}<span>Escribime</span></a>`;
}
function llamarConsulta() {
  const el = document.getElementById('consulta'); if (!el) return;
  el.classList.add('apagado');   // se desvanece un momento: el botón para escribir está en el paso
  clearTimeout(el._llamar); el._llamar = setTimeout(() => el.classList.remove('apagado'), 5000);
}
function consultaHTML() {
  let el = document.getElementById('consulta');
  if (typeof WHATSAPP_ANDY === 'undefined' || !WHATSAPP_ANDY || modo === 'admin') { if (el) el.remove(); return; }
  const paso = PASO[abierto];
  const txt = `Andy, tengo una consulta${paso ? ` sobre "${paso.titulo}"` : ''}: `;
  const href = `https://wa.me/${WHATSAPP_ANDY}?text=${encodeURIComponent(txt)}`;
  if (!el) {
    const primera = !(Date.now() - (+leerLS('ae-consulta', 0) || 0) < 4 * 864e5);   // el cartelito vuelve a salir cada 4 días
    el = document.createElement('a'); el.id = 'consulta'; el.className = 'consulta' + (primera ? ' con-texto' : '');
    el.target = '_blank'; el.rel = 'noopener'; el.setAttribute('aria-label', 'Consultas por WhatsApp');
    el.innerHTML = `${ICONO_WA}<span>¿Una consulta? Escribime</span>`;
    document.body.appendChild(el);
    if (primera) { guardarLS('ae-consulta', String(Date.now())); setTimeout(() => el.classList.remove('con-texto'), 6000); }
    // solo con mouse: en el celu el toque dejaba el cartel abierto para siempre
    el.addEventListener('pointerenter', ev => { if (ev.pointerType === 'mouse') el.classList.add('con-texto'); });
    el.addEventListener('pointerleave', ev => { if (ev.pointerType === 'mouse') el.classList.remove('con-texto'); });
  }
  el.href = href;
}

/* ---------- El camino dibujado ---------- */
function dibujarCamino() {
  const cam = $('#camino'); if (!cam) return;
  const svg = cam.querySelector('.trazo');
  const base = cam.getBoundingClientRect(), z = cam.currentCSSZoom || 1;   // en la llamada la vista va con zoom en la compu
  // los títulos de grupo van alineados con el título del paso que sigue, así no quedan encima de la línea
  cam.querySelectorAll('.grupo-label').forEach(g => { let n = g.nextElementSibling; while (n && !n.querySelector('.nodo-tit')) n = n.nextElementSibling; const t = n && n.querySelector('.nodo-tit'); if (!t) return; g.style.marginLeft = '0px'; const dx = (t.getBoundingClientRect().left - g.getBoundingClientRect().left) / z; g.style.marginLeft = Math.max(0, dx) + 'px'; });
  const centro = el => { const r = el.getBoundingClientRect(); return [(r.left - base.left + r.width / 2) / z, (r.top - base.top + r.height / 2) / z]; };
  const puntos = [...cam.querySelectorAll('.punto')].map(centro);
  const meta = cam.querySelector('.meta span'); if (meta) puntos.push(centro(meta));
  svg.setAttribute('width', cam.clientWidth); svg.setAttribute('height', cam.scrollHeight);
  const camino = pts => pts.map((p, i) => { if (!i) return `M ${p[0]} ${p[1]}`; const a = pts[i - 1], dy = (p[1] - a[1]) / 2; return `C ${a[0]} ${a[1] + dy}, ${p[0]} ${p[1] - dy}, ${p[0]} ${p[1]}`; }).join(' ');
  svg.querySelector('.trazo-base').setAttribute('d', camino(puntos));
  const idx = [...cam.querySelectorAll('.nodo')].findIndex(n => n.classList.contains('abierto'));
  svg.querySelector('.trazo-hecho').setAttribute('d', idx > 0 ? camino(puntos.slice(0, idx + 1)) : '');
}
window.addEventListener('resize', () => requestAnimationFrame(dibujarCamino));

/* ---------- El reproductor (uno solo, al costado) ---------- */
let player = null, playerVid = null, ytCargando = false, simple = false;
function panelVideoHTML() {
  return `<aside class="panel-video" id="panel-video" aria-label="Video"><div class="pv-marco"><div id="yt"></div></div><p class="pv-titulo"><span id="pv-titulo"></span><span class="pv-aviso" id="pv-aviso" aria-live="polite"></span></p></aside>`;
}
/* En el celu el video ocupa media pantalla: se muestra si el video del paso no se vio,
   o cuando el alumno toca un botón de video; se cierra con la ✕, al terminar o al cambiar de paso */
const esCel = () => innerWidth < 1000;
const vistos = new Set(String(leerLS('ae-vistos', '')).split(',').filter(Boolean));
function marcarVisto(id) { if (id && !vistos.has(id)) { vistos.add(id); guardarLS('ae-vistos', [...vistos].join(',')); } }
const panelCerrado = () => { const l = $('.layout'); return !l || l.classList.contains('pv-cerrado'); };
function abrirPanel() { const l = $('.layout'); if (l) l.classList.remove('pv-cerrado'); }
function seekReset() {
  document.querySelectorAll('[data-seek].seek-activo').forEach(b => { b.classList.remove('seek-activo'); if (b.dataset.orig != null) { b.innerHTML = b.dataset.orig; delete b.dataset.orig; } });
}
function seekActivar(b) {
  seekReset(); b.classList.add('seek-activo');
  if (b.classList.contains('panel-vid')) return;
  b.dataset.orig = b.innerHTML;
  b.innerHTML = `<span class="seek-x" aria-hidden="true">✕</span><span>Cerrar video</span>`;
}
function cerrarPanel() {
  seekReset();
  const l = $('.layout'); if (l) l.classList.add('pv-cerrado');
  if (player && player.pauseVideo) try { player.pauseVideo(); } catch (_) {}
  else if (simple && playerVid) { const f = $('#yt'); if (f && f.tagName === 'IFRAME') { marcarVisto(playerVid); f.src = f.src.replace('&autoplay=1', ''); } }
}
function decidirPanel() {
  cerrarPanel();   // el video se abre solo con «Ver video», así se puede leer tranquilo
}
/* Líneas naranjas de fondo: 3 trazos gruesos de un solo color que cruzan toda la pantalla
   en diagonal, desde la esquina de arriba a la derecha. Van detrás del camino y del video;
   las tarjetas abiertas quedan por encima. Se curvan un poco con el scroll. */
const LINEAS = [
  { w: 86, y0: -0.30, o: 0 },
  { w: 34, y0: -0.10, o: 1.7 },
  { w: 12, y0: 0.06, o: 3.1 },
];
function trazoLinea(l, y, W, H) {
  const s1 = Math.sin(y / 520 + l.o) * 0.09 * W, s2 = Math.cos(y / 680 + l.o) * 0.11 * H;
  const y0 = l.y0 * H;
  return `M ${W * 1.12} ${y0} C ${W * .76 + s1} ${y0 + H * .18}, ${W * .64} ${y0 + H * .56 - s2}, ${W * .38} ${y0 + H * .72} S ${-W * .04 + s1} ${y0 + H * 1.06}, ${-W * .16} ${y0 + H * 1.32}`;
}
function lineasHTML() {
  const W = innerWidth, H = innerHeight;
  return `<svg class="lineas" viewBox="0 0 ${W} ${H}" aria-hidden="true">
    <defs>
      <linearGradient id="lg-cuerpo" gradientUnits="userSpaceOnUse" x1="${W}" y1="0" x2="0" y2="${H}">
        <stop offset="0" stop-color="#5D7BB6" stop-opacity=".45"/><stop offset=".55" stop-color="#5D7BB6" stop-opacity=".3"/><stop offset="1" stop-color="#5D7BB6" stop-opacity=".06"/>
      </linearGradient>
      <linearGradient id="lg-filo" gradientUnits="userSpaceOnUse" x1="${W}" y1="0" x2="0" y2="${H}">
        <stop offset="0" stop-color="#A9BEE8" stop-opacity=".9"/><stop offset="1" stop-color="#A9BEE8" stop-opacity=".1"/>
      </linearGradient>
    </defs>
    ${LINEAS.map((l, i) => `<path class="l-cuerpo" data-l="${i}" d="${trazoLinea(l, 0, W, H)}" stroke-width="${l.w}"/>`).join('')}
    ${LINEAS.map((l, i) => `<path class="l-filo" data-l="${i}" d="${trazoLinea(l, 0, W, H)}" stroke-width="1.2" transform="translate(${-l.w * .32} ${-l.w * .32})"/>`).join('')}
  </svg>`;
}
let rafLineas = 0;
function moverLineas() {
  const W = innerWidth, H = innerHeight, y = window.scrollY;
  document.querySelectorAll('.lineas path').forEach(p => p.setAttribute('d', trazoLinea(LINEAS[+p.dataset.l], y, W, H)));
}
window.addEventListener('scroll', () => {
  if (reduceMotion || rafLineas) return;
  rafLineas = requestAnimationFrame(() => { rafLineas = 0; moverLineas(); });
}, { passive: true });
window.addEventListener('resize', () => { const v = document.querySelector('.lineas'); if (v) v.outerHTML = lineasHTML(); moverLineas(); });

/* Que se note cuando cambia el video o salta a otro minuto */
let timerAviso = null;
function marcarCambio(texto) {
  const panel = $('#panel-video'), av = $('#pv-aviso'); if (!panel || !av) return;
  panel.classList.remove('cambio'); void panel.offsetWidth; panel.classList.add('cambio');
  av.textContent = texto; av.classList.add('ver');
  clearTimeout(timerAviso); timerAviso = setTimeout(() => av.classList.remove('ver'), 3500);
}
function asegurarYT(cb) {
  if (simple || (window.YT && window.YT.Player)) return cb();
  const prev = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = () => { prev && prev(); cb(); };
  if (!ytCargando) {
    ytCargando = true;
    const s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api';
    s.onerror = () => { simple = true; cb(); };
    document.head.appendChild(s);
    setTimeout(() => { if (!(window.YT && window.YT.Player) && !simple) { simple = true; cb(); } }, 4000);
  }
}
function sinSubtitulos(pl) { try { pl.unloadModule('captions'); } catch (e) {} try { pl.unloadModule('cc'); } catch (e) {} }
function ponerVideo(id, t = 0, play = false) {
  if (playerVid && playerVid !== id) marcarCambio(t ? `Desde ${mmss(t)}` : '');
  else if (playerVid && t) marcarCambio(`Desde ${mmss(t)}`);
  if (simple || !(window.YT && window.YT.Player)) {
    const marco = $('#yt'); if (!marco) return;
    marco.outerHTML = `<iframe id="yt" src="https://www.youtube-nocookie.com/embed/${id}?rel=0&cc_load_policy=0&playsinline=1${t ? '&start=' + t : ''}${play ? '&autoplay=1' : ''}" title="${esc(VIDEOS[id] || 'Video')}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
    playerVid = id; return;
  }
  if (!player) {
    player = new YT.Player('yt', { videoId: id, playerVars: { start: t, rel: 0, cc_load_policy: 0, playsinline: 1, modestbranding: 1 },
      events: { onReady: ev => { sinSubtitulos(ev.target); if (play) ev.target.playVideo(); },
                onApiChange: ev => sinSubtitulos(ev.target),
                onStateChange: ev => { if (ev.data === 1 && panelCerrado()) { ev.target.pauseVideo(); return; } if (ev.data === 1) { sinSubtitulos(ev.target); marcarVisto(playerVid); } if (ev.data === 0) cerrarPanel(); } } });
  } else if (playerVid !== id) {
    play ? player.loadVideoById({ videoId: id, startSeconds: t }) : player.cueVideoById({ videoId: id, startSeconds: t });
  } else if (play) { player.seekTo(t, true); player.playVideo(); }
  else player.cueVideoById({ videoId: id, startSeconds: t });   // seekTo sobre un video sin arrancar lo pone a sonar: solo dejarlo listo
  playerVid = id;
}
function videoParaAbierto(cambioDePaso) {
  const v = PASO[abierto] && PASO[abierto].video;
  if (!v) return;
  if (v.id !== playerVid || (cambioDePaso && v.t)) asegurarYT(() => ponerVideo(v.id, v.t || 0, false));
}

/* ---------- Render ---------- */
function renderAlumno(animar) {
  const st = ST; const { e, lista } = recomendaciones(st, 3);
  if (!abierto || !PASO[abierto]) {
    abierto = (lista[0] && lista[0].id) || ORDEN[0];
    const obj = PROGRAMA.pasos.find(p => p.hojaDeRuta && MODULO_DE[p.etapa] === MODULO_DE[PASO[abierto].etapa]);
    if (obj && !hecho(st, obj.id) && pasoHabilitado(st, obj.id)) abierto = obj.id;   // si no leyó los objetivos del módulo, arranca por ahí
    if (esLlamada) abierto = PASOS_LLAMADA.find(id => PASO[id] && !hecho(st, id)) || PASOS_LLAMADA[PASOS_LLAMADA.length - 1];   // link de la llamada: en orden, empezando por el testimonio
  }
  if (!$('#vista') || animar) {
    player = null; playerVid = null;
    app().innerHTML = `${barra(st.nombre)}<div class="layout"><main class="alumno" id="vista"></main>${panelVideoHTML()}</div>`;
  }
  $('#vista').innerHTML = vistaHTML(st, e, animar);
  document.body.classList.toggle('en-llamada', esLlamada);
  montarVerticales();
  const sinVid = !!(PASO[abierto] && (PASO[abierto].sinVideo || PASO[abierto].hojaDeRuta));   // en los objetivos del módulo no va video, así se ve la animación   // pasos sin video: el contenido ocupa toda la pantalla
  $('.layout').classList.toggle('sin-video', sinVid);
  if (sinVid && player && player.pauseVideo) try { player.pauseVideo(); } catch (_) {}
  requestAnimationFrame(dibujarCamino);
  // si toca «Pasaste al módulo», que salga ya, antes de que arranquen las animaciones de abajo
  if (!introPendiente && !document.querySelector('.pase-modulo') && celebracionPendiente()) quizasCelebrar();
  requestAnimationFrame(activarAnimaciones);
  consultaHTML();
  if (!playerVid) {
    const v = (PASO[abierto] && PASO[abierto].video) || [...ORDEN].reverse().map(id => PASO[id].video).find(Boolean) || { id: 'TylWJrfPxu0' };
    asegurarYT(() => ponerVideo(v.id, v.t || 0, false));
  }
  enlazarAlumno();
  enlazarFormStandard();
  if (animar && (modo === 'alumno' || (esDemo && !esLlamada)) && !introVista()) { introPendiente = true; setTimeout(mostrarIntro, 300); }
  if (animar) { decidirPanel(); setTimeout(() => irA(abierto, false), 80); }
  if (modo.startsWith('admin-')) urlAdmin();
}

function irA(id, suave = true) {
  const el = document.getElementById('n-' + id); if (!el) return;
  const pv = $('#panel-video');
  const tapa = window.innerWidth < 1000 && pv ? pv.offsetHeight : 0;
  const y = el.getBoundingClientRect().top + window.scrollY - 76 - tapa;
  window.scrollTo({ top: Math.max(0, y), behavior: suave && !reduceMotion ? 'smooth' : 'auto' });
}
/* Link de la llamada: pantallas grandes, como la presentación */
function pantallaLlamada(html, boton, alSalir, botonSuave) {
  if ($('.ll-puente')) return;
  const d = document.createElement('div');
  d.className = 'll-puente'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
  d.innerHTML = `<div class="llp-caja">${html}<button class="${botonSuave ? 'llp-cerrar' : 'pl-entrenar llp-ir'}" data-llp-ir>${boton}</button></div>`;
  document.body.appendChild(d);
  document.body.classList.add('sin-scroll');
  d.querySelector('[data-llp-ir]').onclick = () => { d.classList.add('sale'); document.body.classList.remove('sin-scroll'); setTimeout(() => d.remove(), 350); alSalir && alSalir(); };
}
const papelitos = () => [...Array(14)].map((_, k) => `<rect class="llp-papel" x="${(k * 53) % 300 + 30}" y="-20" style="--k:${k};--c:${k % 2 ? '#E8834F' : '#5D7BB6'}" width="8" height="12" rx="2"/>`).join('');
function puenteTestimonio() {
  pantallaLlamada(`<svg class="llp-vis" viewBox="0 0 360 150" aria-hidden="true">
      ${[0, 1, 2].map(k => `<path class="llp-cuerda" style="--k:${k}" d="M20 ${40 + k * 30} H340"/>`).join('')}
      <circle class="llp-check-fondo" cx="180" cy="75" r="40"/>
      <path class="llp-check" d="M162 76 l13 13 l25 -27"/>${papelitos()}
    </svg>
    <p class="llp-kicker">Entrenamiento completo</p>
    <h2 class="llp-tit">¡Muy bien!</h2>
    <p class="llp-txt">Esto que acabás de hacer es lo primero que hace cualquier alumno del programa.</p>
    <p class="llp-txt">Ahora te quiero mostrar a <b>Igna</b>. Tiene 64 años y llevaba décadas buscando cómo improvisar en jazz: probó métodos, libros, YouTube, profesores… y siempre terminaba saturado o frustrado.</p>
    <p class="llp-txt">Hoy toca con otros y tiene que <b>controlar el impulso</b>, porque se le ocurren un montón de recursos que antes no tenía.</p>`, 'Ver el testimonio de Igna →');
}
const WA_LLAMADA = 'Hola Andy! Ya vi todo lo de antes de la llamada. Te cuento qué me pareció: ';
const waLlamada = cls => typeof WHATSAPP_ANDY !== 'undefined' && WHATSAPP_ANDY ? `<a class="${cls}" href="https://wa.me/${WHATSAPP_ANDY}?text=${encodeURIComponent(WA_LLAMADA)}" target="_blank" rel="noopener">${ICONO_WA}<span>Escribime por WhatsApp</span></a>` : '';
// Link de la llamada: si termina de ver el último video, se marca solo y sale la pantalla final
function videoLlamadaTermino(m) {
  if (!esLlamada) return;
  const nodo = m.closest('[id^="n-"]'); if (!nodo) return;
  const id = nodo.id.slice(2);
  if (id !== 'llt1' && !hecho(ST, id)) { ST.prog[id] = { hecho: true, como: 'listo', op: 'listo', t: hoyISO() }; guardarAlumno(); }
  if (PASOS_LLAMADA.every(x => hecho(ST, x))) setTimeout(() => { const g = document.querySelector('.emb.ev-grande'); if (g) evGrande(g, false); renderAlumno(); finLlamada(); }, 700);
}
function finLlamada() {
  pantallaLlamada(`<div class="ll-logo llp-logo">${LOGO}</div>
    <svg class="llp-vis chico" viewBox="0 0 360 110" aria-hidden="true">${[0, 1, 2].map(k => `<path class="llp-cuerda" style="--k:${k}" d="M20 ${30 + k * 26} H340"/>`).join('')}${papelitos()}</svg>
    <h2 class="llp-tit">¡Buenísimo!</h2>
    <p class="llp-txt grande">Ya estás listo para <b>tu llamada conmigo</b>.</p>
    <p class="llp-txt">Escribime un mensaje por WhatsApp y contame qué te pareció todo esto 😉</p>
    ${waLlamada('pl-entrenar llp-ir llp-wa')}`, 'Listo 👋', null, true);
}
function avisoModulo(m) {
  // Al cambiar de módulo (cuando la pantalla grande ya se vio antes): un cartel que se va solo
  document.querySelector('.aviso-modulo')?.remove();
  const M = MODULOS[m], el = document.createElement('div');
  el.className = 'aviso-modulo'; el.style.setProperty('--mc', M.color); el.setAttribute('role', 'status');
  el.innerHTML = `<small>Estás en el</small><strong>${esc(M.titulo)}</strong><span>${esc(M.nombre)}</span>`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('visible'));
  setTimeout(() => { el.classList.remove('visible'); setTimeout(() => el.remove(), 500); }, 3200);
}
/* Mostrar u ocultar pasos sin que se mueva la pantalla: el paso abierto queda donde estaba */
function sinSaltar(fn) {
  const ancla = () => document.getElementById('n-' + abierto) || document.querySelector('.nodo.abierto');
  const a0 = ancla(), y0 = a0 ? a0.getBoundingClientRect().top : null;
  fn();
  const a1 = ancla(); if (y0 === null || !a1) return;
  const fijar = () => { const dy = a1.getBoundingClientRect().top - y0; if (Math.abs(dy) > 1) window.scrollBy(0, dy); };
  fijar(); requestAnimationFrame(fijar);
}
function abrirPaso(id) {
  const cambio = id !== abierto;
  const mAntes = abierto && PASO[abierto] ? MODULO_DE[PASO[abierto].etapa] : null, mDespues = PASO[id] ? MODULO_DE[PASO[id].etapa] : null;
  if (cambio && mAntes !== null && mDespues !== mAntes && mDespues > 0 && moduloVisto(mDespues) && !esLlamada) setTimeout(() => avisoModulo(mDespues), 350);
  if (esLlamada && cambio && id === 'llt1' && !hecho(ST, 'llt1')) puenteTestimonio();
  verTodo = false;
  if (cambio) { animVistas.delete(id); animVistas.delete(id + '-ciclo'); }   // la animación del paso se repite cada vez que se entra
  abierto = id; renderAlumno();
  if (cambio) decidirPanel();
  videoParaAbierto(cambio);
  requestAnimationFrame(() => irA(id));
  quizasCelebrar();
  // en el celu, dejamos bajando el doc del paso así «Ir a…» abre al toque
  setTimeout(() => document.querySelectorAll('a[data-doc-sec]').forEach(x => docHTML(x.dataset.docSec.split('|')[0]).catch(() => {})), 1500);
}

function enlazarAlumno() {
  const root = app();
  root.onchange = ev => { const f = ev.target.closest('input[data-subir]'); if (f && f.files[0]) abrirGrabador(f.dataset.subir, f.files[0]); };
  root.onclick = ev => {
    const b = ev.target.closest('button, input'); if (!b) return;
    const d = b.dataset;
    if (d.stopAcc) { stopAccion(d.stopId, d.stopAcc); return; }
    if (d.evCapa !== undefined || d.evPlay !== undefined || d.evGrande !== undefined || d.evSalto !== undefined) { evAccion(b, d); return; }
    if (d.plegar) { barraPlegada = d.plegar === 'cerrar'; guardarLS('ae-barra', barraPlegada ? 'plegada' : 'abierta'); renderAlumno(); return; }
    if (accionClase(d)) return;
    if (d.abrir) abrirPaso(d.abrir);
    else if (d.seek) { if (b.classList.contains('seek-activo') && !panelCerrado()) { cerrarPanel(); return; } const [id, t] = d.seek.split(':'); seekActivar(b); abrirPanel(); asegurarYT(() => ponerVideo(id, +t || 0, true)); }
    else if (d.seg) {
      const [id, opId] = d.seg.split(':'); const k = id + '_seg';
      if (ST.prog[k]?.op === opId) delete ST.prog[k]; else ST.prog[k] = { op: opId, t: hoyISO() };
      guardarAlumno(); renderAlumno();
    } else if (d.desenvio) { const pr = ST.prog[d.desenvio]; if (pr) { delete pr.envio; guardarAlumno(); renderAlumno(); } }
    else if (d.pvCerrar !== undefined) cerrarPanel();
    else if (d.recOk) { recCerradas.add(d.recOk); renderAlumno(); }
    else if (d.recAbrir) { recCerradas.delete(d.recAbrir); renderAlumno(); }
    else if (d.cambiar) { const id = d.cambiar, vids = ST.prog[id]?.videos; if (vids) ST.prog[id] = { videos: vids }; else delete ST.prog[id]; cambiando.delete(id); guardarAlumno(); renderAlumno(); }
    else if (d.terminarLlamada) {
      const id = d.terminarLlamada; ST.prog[id] = { hecho: true, como: 'listo', op: 'listo', t: hoyISO() }; guardarAlumno();
      const g = document.querySelector('.emb.ev-grande'); if (g) evGrande(g, false);
      renderAlumno(); setTimeout(finLlamada, 300);
    }
    else if (d.vistoSeguir) {
      const id = d.vistoSeguir; if (!hecho(ST, id)) { ST.prog[id] = { hecho: true, como: 'listo', op: 'listo', t: hoyISO() }; guardarAlumno(); }
      const sig = siguienteDe(id); if (sig) abrirPaso(sig.id); else renderAlumno();
    } else if (d.op) {
      const [id, opId] = d.op.split(':'); cambiando.delete(id); recCerradas.delete(id); const o = opcionesProgreso(PASO[id]).find(x => x.id === opId);
      const vids = ST.prog[id]?.videos;
      if (opcionElegida(ST, PASO[id]) === o) { if (vids) ST.prog[id] = { videos: vids }; else delete ST.prog[id]; }
      else ST.prog[id] = { hecho: true, como: o.nivel, op: o.id, t: hoyISO(), ...(ST.prog[id]?.envio ? { envio: true } : {}), ...(vids ? { videos: vids } : {}) };
      if (esLlamada && id === 'llt1') {   // si ya había visto el de Igna, el de Manu lo ve ahí mismo y no se lo repito al final
        if (ST.prog.llt1?.op === 'visto') ST.prog.llt2 = { hecho: true, como: 'listo', op: 'listo', t: hoyISO(), auto: true };
        else if (ST.prog.llt2?.auto) delete ST.prog.llt2;
      }
      guardarAlumno(); renderAlumno();
      if (esLlamada && ST.prog[id]?.hecho && PASOS_LLAMADA.every(x => hecho(ST, x))) setTimeout(finLlamada, 500);
      if (o.nivel === 'cuesta' && ST.prog[id]?.op === o.id) llamarConsulta();
    } else if (d.standard) {
      const primera = !ST.standard;
      ST.standard = d.standard; ST.prog.p5 = { hecho: true, como: 'listo', t: hoyISO() };
      guardarAlumno(); renderAlumno(); if (primera || ST.standard) confeti(b);
    } else if (d.grabar) abrirGrabador(d.grabar);
    else if (d.verVideo) { const [pid, i] = d.verVideo.split(':'); verVideoAdmin(ST, pid, +i, () => { guardarAlumno(); renderAlumno(); }); }
    else if (d.envio && b.tagName === 'INPUT') {
      const pr = ST.prog[d.envio]; if (!pr) return;
      if (b.checked) pr.envio = true; else delete pr.envio;
      guardarAlumno(); setTimeout(() => { renderAlumno(); if (b.checked) requestAnimationFrame(() => { const s = document.querySelector('.seguir'); if (s) s.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }); }, 200);
    } else if (d.extra !== undefined && b.tagName === 'INPUT') {
      const x = ST.extras.find(x => x.id === d.extra); x.hecho = b.checked; guardarAlumno(); setTimeout(() => renderAlumno(), 250);
    } else if (d.accion === 'clase') {
      const k = (ST.clase || 0) + 1;
      $('#claseHecha').innerHTML = `<p>¿Marcás que ya tuviste la clase ${k}?</p><button class="primario" data-accion="clase-ok">Sí, ya la tuve</button> <button class="link" data-accion="clase-no">Todavía no</button>`;
    } else if (d.accion === 'clase-ok') {
      ST.clase = (ST.clase || 0) + 1; ST.claseFecha = hoyISO(); guardarAlumno(); abierto = null; renderAlumno(true);
    } else if (d.accion === 'clase-no') { const c = $('#claseHecha'); if (c && c.classList.contains('pregunta-clase')) c.outerHTML = `<div class="clase-hecha" id="claseHecha"><button class="link suave" data-accion="clase">Ya tuve la clase ${(ST.clase || 0) + 1}</button></div>`; else renderAlumno(); }
    else if (d.accion === 'deshacer-clase') { ST.clase = Math.max(0, ST.clase - 1); guardarAlumno(); renderAlumno(); }
    else if (d.accion === 'ver-todo') sinSaltar(() => { verTodo = true; renderAlumno(); });
    else if (d.accion === 'mapa') abrirMapaZoom();
    else if (d.accion === 'clases') abrirClases();
    else if (d.accion === 'intro') mostrarIntro();
    else if (d.accion === 'presentacion') { presEst.i = 0; renderLlamada(); }
    else if (d.accion === 'reiniciar-prueba') reiniciarPrueba();
    else if (d.accion === 'reiniciar-llamada') reiniciarLlamada(b);
    else if (d.desplegar !== undefined) sinSaltar(() => { desplegados.add(+d.desplegar); renderAlumno(); });
    else if (d.plegar !== undefined) sinSaltar(() => { desplegados.delete(+d.plegar); renderAlumno(); });
    else if (d.irModulo !== undefined) { const ps = pasosDelModulo(+d.irModulo); const p = ps.find(x => !hecho(ST, x.id)) || ps[0]; if (p) abrirPaso(p.id); }
    else if (d.accion === 'instalar-app' && avisoInstalar) { avisoInstalar.prompt(); avisoInstalar.userChoice.finally(() => { avisoInstalar = null; renderAlumno(); }); }
    else if (d.accion === 'no-instalar') { try { localStorage.setItem('mapaAE_sinInstalar', '1'); } catch (e) {} renderAlumno(); }
    else if (d.accion === 'ver-menos') sinSaltar(() => { verTodo = false; renderAlumno(); });
    else if (d.accion === 'salir') salir();
    else if (d.accion === 'volver-admin') { abierto = null; abrirAdmin(); }
  };
}

function enlazarFormStandard() {
  const f = document.querySelector('[data-form-standard]'); if (!f) return;
  f.onsubmit = ev => { ev.preventDefault(); const v = new FormData(f).get('otro').trim(); if (!v) return;
    ST.standard = v; ST.prog.p5 = { hecho: true, como: 'listo', t: hoyISO() }; guardarAlumno(); renderAlumno(); };
}
/* Confeti al elegir el standard */
function confeti(origen) {
  if (reduceMotion) return;
  const r = origen.getBoundingClientRect();
  const c = document.createElement('canvas'); c.className = 'confeti'; c.width = innerWidth; c.height = innerHeight;
  document.body.appendChild(c); const g = c.getContext('2d');
  const colores = ['#5D7BB6', '#FFFFFF', '#5D7BB6', '#A9BEE8', '#C24A22'];
  const ps = Array.from({ length: 110 }, () => ({ x: r.left + r.width / 2, y: r.top + r.height / 2, vx: (Math.random() - .5) * 11, vy: -Math.random() * 11 - 3,
    s: 4 + Math.random() * 5, a: Math.random() * 6, va: (Math.random() - .5) * .3, col: colores[Math.floor(Math.random() * colores.length)] }));
  let f = 0;
  (function paso() {
    g.clearRect(0, 0, c.width, c.height);
    ps.forEach(p => { p.vy += .32; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va;
      g.save(); g.translate(p.x, p.y); g.rotate(p.a); g.fillStyle = p.col; g.globalAlpha = Math.max(0, 1 - f / 110); g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); g.restore(); });
    if (++f < 110) requestAnimationFrame(paso); else c.remove();
  })();
}
function enfocar(sel) { requestAnimationFrame(() => { const el = $(sel); el && el.focus({ preventScroll: true }); }); }

/* Invitar a instalar el aula como app en el celu (solo en celular, si no está instalada) */
let avisoInstalar = null;
window.addEventListener('beforeinstallprompt', ev => { ev.preventDefault(); avisoInstalar = ev; if (ST && modo === 'alumno') renderAlumno(); });
function instalarAppHTML() {
  const enApp = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone;
  const celu = /iPhone|iPad|iPod|Android/.test(navigator.userAgent);
  let cerrado = false; try { cerrado = localStorage.getItem('mapaAE_sinInstalar') === '1'; } catch (e) {}
  if (enApp || !celu || cerrado || modo !== 'alumno') return '';
  return `<div class="instalar-app"><img src="iconos/icono-192.png" alt="">
    <p><b>Tené el aula como app en tu celu</b>Queda un ícono y no tenés que volver a entrar.</p>
    ${avisoInstalar ? `<button class="ia-si" data-accion="instalar-app">Instalar</button>` : `<a href="instalar.html">Ver cómo</a>`}
    <button class="ia-no" data-accion="no-instalar" aria-label="Cerrar">×</button></div>`;
}

/* ================= Grabar y mandar videos (como en WhatsApp) ================= */
// Se graba liviano (≈2 Mbps, unos 15 MB por minuto) y sin reducción de ruido, para que la guitarra suene natural.
// Al tocar «Mandar», el grabador se cierra y el video se sube solo mientras el alumno sigue usando el aula.
// El video queda guardado en el celu hasta que termina de subir: si se cierra el aula o se corta la señal, sigue la próxima vez.
const GRAB = { maxSeg: 300, vbps: 2000000, abps: 128000 };
let gr = null;   // estado del grabador abierto

function tipoGrabacion() {
  if (typeof MediaRecorder === 'undefined') return '';
  return ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
    .find(t => { try { return MediaRecorder.isTypeSupported(t); } catch (e) { return false; } }) || '';
}

function abrirGrabador(pasoId, archivo) {
  cerrarGrabador();
  const p = PASO[pasoId];
  const el = document.createElement('div');
  el.className = 'grabador'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Grabar video');
  el.innerHTML = `<video class="gr-vivo" playsinline autoplay muted></video><video class="gr-ver" playsinline hidden></video>
    <div class="gr-cab"><button class="gr-x" data-gr="cerrar" aria-label="Cerrar">${ICONO.cruz}</button>
      <div class="gr-tit"><small>Tu video</small><strong>${esc(p.titulo)}</strong></div><span class="gr-reloj" hidden>0:00</span></div>
    <p class="gr-msg" hidden></p>
    <div class="gr-pie"></div>`;
  document.body.appendChild(el); document.body.classList.add('con-grabador');
  gr = { el, pasoId, cam: 'user', stream: null, rec: null, partes: [], blob: null, seg: 0, t0: 0, timer: null };
  el.onclick = ev => { const b = ev.target.closest('[data-gr]'); if (b) accionGrabador(b.dataset.gr); };
  if (archivo) { gr.blob = archivo; mostrarRevision(true); }
  else prenderCamara();
}

function piesGrabador(html) { gr.el.querySelector('.gr-pie').innerHTML = html; }
function msgGrabador(t) { const m = gr.el.querySelector('.gr-msg'); m.hidden = !t; m.textContent = t || ''; }

async function prenderCamara() {
  apagarCamara(); msgGrabador('');
  gr.el.classList.remove('revisando');
  if (!navigator.mediaDevices?.getUserMedia || !tipoGrabacion()) {
    msgGrabador('Este navegador no deja grabar desde la página. Usá «Subir uno que ya tengo» o mandalo por WhatsApp.');
    piesGrabador(''); return;
  }
  try {
    gr.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: gr.cam, width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: { ideal: 2 } },
    });
  } catch (e) {
    msgGrabador('No pude usar la cámara. Fijate de darle permiso a la página para usar la cámara y el micrófono, y volvé a intentar.');
    piesGrabador(`<button class="gr-texto" data-gr="reintentar">Volver a intentar</button>`); return;
  }
  if (!gr) { apagarCamara(); return; }
  const v = gr.el.querySelector('.gr-vivo');
  v.srcObject = gr.stream; v.hidden = false; v.classList.toggle('espejo', gr.cam === 'user');
  const ver = gr.el.querySelector('.gr-ver'); ver.pause(); ver.hidden = true;
  piesGrabador(`<span class="gr-lado"></span><button class="gr-rec" data-gr="grabar" aria-label="Empezar a grabar"><i></i></button>
    <button class="gr-lado gr-redondo" data-gr="girar" aria-label="Cambiar de cámara">${ICONO.girar}</button>`);
}
function apagarCamara() { if (gr?.stream) gr.stream.getTracks().forEach(t => t.stop()); if (gr) gr.stream = null; }

function empezarGrabacion() {
  const tipo = tipoGrabacion();
  try { gr.rec = new MediaRecorder(gr.stream, { mimeType: tipo, videoBitsPerSecond: GRAB.vbps, audioBitsPerSecond: GRAB.abps }); }
  catch (e) { gr.rec = new MediaRecorder(gr.stream); }
  gr.partes = [];
  gr.rec.ondataavailable = ev => { if (ev.data && ev.data.size) gr.partes.push(ev.data); };
  gr.rec.onstop = () => {
    if (!gr) return;
    gr.blob = new Blob(gr.partes, { type: (gr.rec.mimeType || tipo || 'video/mp4').split(';')[0] });
    gr.seg = (Date.now() - gr.t0) / 1000;
    apagarCamara(); mostrarRevision();
  };
  gr.rec.start(1000); gr.t0 = Date.now();
  gr.el.classList.add('grabando');
  const reloj = gr.el.querySelector('.gr-reloj'); reloj.hidden = false; reloj.textContent = '0:00';
  gr.timer = setInterval(() => {
    const s = (Date.now() - gr.t0) / 1000; reloj.textContent = duracion(s);
    if (s >= GRAB.maxSeg) pararGrabacion();
  }, 250);
  piesGrabador(`<span class="gr-lado"></span><button class="gr-rec grabando" data-gr="parar" aria-label="Terminar"><i></i></button><span class="gr-lado"></span>`);
}
function pararGrabacion() {
  clearInterval(gr.timer); gr.el.classList.remove('grabando'); gr.el.querySelector('.gr-reloj').hidden = true;
  if (gr.rec?.state === 'recording') gr.rec.stop();
}

function mostrarRevision(deGaleria) {
  gr.el.classList.add('revisando');
  const v = gr.el.querySelector('.gr-ver');
  gr.el.querySelector('.gr-vivo').hidden = true;
  if (gr.url) URL.revokeObjectURL(gr.url);
  gr.url = URL.createObjectURL(gr.blob); v.src = gr.url; v.hidden = false; v.controls = true;
  v.onloadedmetadata = () => { if (isFinite(v.duration)) gr.seg = v.duration; };
  const mb = gr.blob.size / 1048576;
  msgGrabador(mb > 380 ? 'Este video es muy pesado para mandarlo desde acá. Mandámelo por WhatsApp.' : '');
  piesGrabador(`<button class="gr-texto" data-gr="${deGaleria ? 'cerrar' : 'otra'}">${deGaleria ? 'Cancelar' : 'Grabar de nuevo'}</button>
    ${mb > 380 ? '' : `<button class="gr-mandar" data-gr="enviar" aria-label="Mandar el video">${ICONO.mandar}</button>`}`);
}

function accionGrabador(a) {
  if (!gr) return;
  if (a === 'cerrar') cerrarGrabador();
  else if (a === 'reintentar') prenderCamara();
  else if (a === 'girar') { gr.cam = gr.cam === 'user' ? 'environment' : 'user'; prenderCamara(); }
  else if (a === 'grabar') empezarGrabacion();
  else if (a === 'parar') pararGrabacion();
  else if (a === 'otra') { gr.blob = null; prenderCamara(); }
  else if (a === 'enviar') mandarVideo();
}
function cerrarGrabador() {
  if (!gr) return;
  clearInterval(gr.timer); if (gr.rec?.state === 'recording') { gr.rec.onstop = null; gr.rec.stop(); }
  apagarCamara(); const v = gr.el.querySelector('.gr-ver'); if (v) v.pause();
  if (gr.url) URL.revokeObjectURL(gr.url);
  gr.el.remove(); document.body.classList.remove('con-grabador'); gr = null;
}

/* ---------- Mandar: el grabador se cierra y el video se sube solo ---------- */
function mandarVideo() {
  const item = { id: 'v' + Date.now().toString(36), codigo: ST.codigo, pasoId: gr.pasoId, blob: gr.blob, mime: gr.blob.type || 'video/mp4', seg: Math.round(gr.seg || 0), t: hoyISO() };
  cerrarGrabador();
  if (modo !== 'alumno') { aviso('Vista de prueba: el video no se manda'); return; }
  const pr = ST.prog[item.pasoId] || (ST.prog[item.pasoId] = {});
  pr.envio = true;
  guardarAlumno();
  COLA.push(item); colaGuardar(item);
  renderAlumno();
  procesarCola();
}

// Videos esperando para subir (en memoria y guardados en el celu)
const COLA = [];
let subiendo = null;          // { item, p } mientras sube
function pendientes(pasoId) { return COLA.filter(x => x.pasoId === pasoId && x.codigo === ST?.codigo); }

async function procesarCola() {
  if (subiendo || !COLA.length || modo !== 'alumno' || !ST) return;
  const item = COLA.find(x => x.codigo === ST.codigo); if (!item) return;
  subiendo = { item, p: 0, error: '' }; pintarSubida();
  try {
    let id;
    if (!API_URL) { for (let k = 1; k <= 10; k++) { await new Promise(r => setTimeout(r, 250)); subiendo.p = k / 10; pintarSubida(); } id = 'demo-' + Date.now(); }
    else {
      const { url } = await llamar('video.iniciar', { token: TOKEN, paso: item.pasoId, mime: item.mime, tam: item.blob.size, origen: location.origin });
      id = await subirPorPartes(url, item.blob, p => { subiendo.p = p; pintarSubida(); });
    }
    const pr = ST.prog[item.pasoId] || (ST.prog[item.pasoId] = {});
    pr.videos = [...(pr.videos || []), { id, t: item.t, seg: item.seg }];
    pr.envio = true;
    guardarAlumno();
    COLA.splice(COLA.indexOf(item), 1); colaBorrar(item.id);
    subiendo = null; pintarSubida(true);
    if (abierto === item.pasoId) renderAlumno();
    setTimeout(procesarCola, 400);
  } catch (e) {
    const m = e.message || '';
    subiendo.error = /permiso|autoriz|UrlFetch/i.test(m) ? 'No se pudo mandar el video por un problema del aula. Avisame por WhatsApp.'
      : /Acción desconocida/.test(m) ? 'Todavía no se pueden mandar videos desde acá.'
      : 'Se cortó la conexión. Lo vuelvo a intentar solo.';
    pintarSubida();
    const reintentar = /cortó|conexión|conectar/i.test(subiendo.error);
    subiendo = reintentar ? null : subiendo;
    if (reintentar) setTimeout(procesarCola, 8000);
  }
}
// Cartelito abajo con el avance, como el «enviando» de WhatsApp (se puede seguir usando el aula)
function pintarSubida(listo) {
  let el = document.getElementById('subida');
  if (!el) { el = document.createElement('div'); el.id = 'subida'; el.className = 'subida-pill'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
  clearTimeout(el._t);
  if (listo) { el.className = 'subida-pill ok'; el.innerHTML = `${ICONO.check}<span>Video enviado</span>`; el._t = setTimeout(() => el.remove(), 2600); return; }
  if (!subiendo) { el.remove(); return; }
  const pct = Math.round(subiendo.p * 100), mas = COLA.length > 1 ? ` (${COLA.length})` : '';
  el.className = 'subida-pill' + (subiendo.error ? ' error' : '');
  el.innerHTML = subiendo.error ? `<span>${esc(subiendo.error)}</span><button class="link" data-reintentar-subida>Reintentar</button>`
    : `<span class="sp-anillo" style="--p:${pct}"></span><span>Mandando video${mas}… ${pct}%</span>`;
  const b = el.querySelector('[data-reintentar-subida]'); if (b) b.onclick = () => { subiendo = null; procesarCola(); };
}
window.addEventListener('online', () => procesarCola());
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') procesarCola(); });

// Guardado en el celu (IndexedDB) para retomar si se cierra el aula a mitad de la subida
function colaDB() {
  return new Promise((ok, mal) => {
    if (!window.indexedDB) return mal(new Error('sin IndexedDB'));
    const r = indexedDB.open('aulaAE', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('subidas', { keyPath: 'id' });
    r.onsuccess = () => ok(r.result); r.onerror = () => mal(r.error);
  });
}
async function colaGuardar(item) { try { const db = await colaDB(); db.transaction('subidas', 'readwrite').objectStore('subidas').put(item); } catch (e) {} }
async function colaBorrar(id) { try { const db = await colaDB(); db.transaction('subidas', 'readwrite').objectStore('subidas').delete(id); } catch (e) {} }
async function reanudarSubidas() {
  try {
    const db = await colaDB();
    const todos = await new Promise((ok, mal) => { const q = db.transaction('subidas').objectStore('subidas').getAll(); q.onsuccess = () => ok(q.result || []); q.onerror = () => mal(q.error); });
    todos.forEach(x => { if (!COLA.some(y => y.id === x.id)) COLA.push(x); });
  } catch (e) {}
  procesarCola();
}

// Subida en partes de 8 MB directo a Drive (si se corta la señal, se reintenta la parte que faltaba)
function subirPorPartes(url, blob, progreso) {
  const PARTE = 8 * 1024 * 1024;
  const mandar = (desde, intento) => new Promise((ok, mal) => {
    const hasta = Math.min(desde + PARTE, blob.size);
    const x = new XMLHttpRequest();
    x.open('PUT', url);
    x.setRequestHeader('Content-Range', `bytes ${desde}-${hasta - 1}/${blob.size}`);
    x.upload.onprogress = ev => progreso((desde + ev.loaded) / blob.size);
    x.onload = () => {
      if (x.status === 200 || x.status === 201) { try { ok(JSON.parse(x.responseText).id); } catch (e) { ok(''); } }
      else if (x.status === 308) mandar(hasta, 0).then(ok, mal);
      else if (intento < 3) setTimeout(() => mandar(desde, intento + 1).then(ok, mal), 1500 * (intento + 1));
      else mal(new Error('Se cortó la conexión mientras subía el video.'));
    };
    x.onerror = () => intento < 3 ? setTimeout(() => mandar(desde, intento + 1).then(ok, mal), 2000 * (intento + 1)) : mal(new Error('Se cortó la conexión mientras subía el video.'));
    x.send(blob.slice(desde, hasta));
  });
  return mandar(0, 0);
}

/* Andy mira el video desde el panel (se reproduce desde su Drive) */
function verVideoAdmin(al, pasoId, i, alMarcar) {
  const v = al.prog?.[pasoId]?.videos?.[i]; if (!v) return;
  const el = document.createElement('div');
  el.className = 'grabador ver-video';
  el.innerHTML = `<div class="gr-cab"><button class="gr-x" aria-label="Cerrar">×</button>
    <div><small>${esc(al.nombre)} · ${fechaCorta(v.t)}</small><strong>${esc(PASO[pasoId].titulo)}</strong></div>
    <a class="link gr-drive" href="https://drive.google.com/file/d/${encodeURIComponent(v.id)}/view" target="_blank" rel="noopener">Abrir en Drive</a></div>
    <div class="gr-pantalla">${String(v.id).startsWith('demo-') ? '<p class="gr-msg">Video de prueba (modo demo)</p>' : `<iframe src="https://drive.google.com/file/d/${encodeURIComponent(v.id)}/preview" allow="autoplay; fullscreen" allowfullscreen></iframe>`}</div>
    <p class="gr-nota">Si dice que se está procesando, esperá un par de minutos: Drive tarda un poco con los videos recién subidos.</p>`;
  document.body.appendChild(el); document.body.classList.add('con-grabador');
  el.querySelector('.gr-x').onclick = () => { el.remove(); document.body.classList.remove('con-grabador'); };
  if (!v.visto) { v.visto = true; alMarcar && alMarcar(); }
}
function videosNuevos(al) { return Object.values(al.prog || {}).reduce((n, x) => n + (x.videos || []).filter(v => !v.visto).length, 0); }
// Si abre el video de una tanda, la animación se pausa para que no siga sola mientras mira
document.addEventListener('click', ev => { if (ev.target.closest('.stop-boton') && stopTimer) stopAccion(stopTimer.id, 'play'); }, true);
