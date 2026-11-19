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
/* Material: los videos se abren en el reproductor de al lado; los documentos, en otra pestaña */
const esDoc = r => r.url && !ytId(r.url);
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
const animClase = key => animVistas.has(key) ? '' : 'anim';
let animObs = null;
function activarAnimaciones() {
  if (!('IntersectionObserver' in window)) { document.querySelectorAll('.anim').forEach(el => { el.classList.add('go'); animVistas.add(el.dataset.anim); }); return; }
  animObs = animObs || new IntersectionObserver(ents => ents.forEach(en => {
    if (!en.isIntersecting) return;
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
  return `<details class="stop stop-${S.tipo}" ${p.stopCerrado ? '' : 'open'}><summary><span>${esc(S.titulo)}</span><small>${enLinea(S.sub)}</small></summary>
    <div class="stop-cuerpo" data-stop-caja="${id}">${stopInner(id)}</div></details>`;
}
function stopInner(id) {
  const S = STOPS[id], e = stopEst[id] || (stopEst[id] = { i: 0, modo: 'si' });
  const no = e.modo === 'no', tandas = no ? S.no.tandas : S.tandas, n = S.unidades.length;
  const i = Math.min(e.i, tandas.length - 1), tanda = tandas[i];
  const veces = Array(n).fill(0); tandas.slice(0, i + 1).forEach(t => { if (t.pausa) return; for (let k = t.sel[0]; k <= t.sel[1]; k++) veces[k]++; });
  const estadoU = Array(n).fill('');
  if (!no) tandas.slice(0, i + 1).forEach(t => { if (t.traba !== undefined) estadoU[t.traba] = 'traba'; if (t.arregla !== undefined) estadoU[t.arregla] = 'ok'; });
  const partido = !no && tandas.slice(0, i + 1).some(t => t.partir !== undefined);
  const enSel = k => k >= tanda.sel[0] && k <= tanda.sel[1];
  const max = Math.max(1, ...veces);
  const dibujo = S.tipo === 'ola' ? stopOla(S, enSel, estadoU, partido) : S.tipo === 'cuerdas' ? stopCuerdas(S, enSel, estadoU) : S.tipo === 'cifrado' ? stopCifrado(S, enSel, estadoU) : stopMelodia(S, enSel, estadoU, partido);
  const fin = i === tandas.length - 1;
  const texto = no ? (fin ? S.no.fin : S.no.t) : tanda.t;
  return `<div class="stop-top">${S.no ? `<div class="stop-modos" role="tablist">
      <button role="tab" aria-selected="${!no}" class="${!no ? 'on' : ''}" data-stop-acc="modo-si" data-stop-id="${id}">Así sí</button>
      <button role="tab" aria-selected="${no}" class="${no ? 'on no' : ''}" data-stop-acc="modo-no" data-stop-id="${id}">Así no</button></div>` : '<span></span>'}
      ${S.audio ? `<button class="stop-son ${stopSonido ? '' : 'off'}" data-stop-acc="sonido" data-stop-id="${id}" aria-pressed="${stopSonido}">${stopSonido ? '🔊 Con sonido' : '🔇 Sin sonido'}</button>` : ''}
    </div>
    <p class="stop-texto ${tanda.zoom ? 'zoom' : ''} ${no && fin ? 'malo' : ''}" aria-live="polite"><span class="stop-num">${tanda.pausa ? '' : `Tanda ${tandas.slice(0, i + 1).filter(t => !t.pausa).length} de ${tandas.filter(t => !t.pausa).length}`}</span><span class="stop-frase" key="${i}">${enLinea(texto)}</span></p>
    <div class="stop-dibujo ${no ? 'modo-no' : ''}">${dibujo}</div>
    ${S.contar ? `<p class="stop-cap">${esc(S.contar)}</p>
    <div class="stop-veces ${no ? 'modo-no' : ''}" style="grid-template-columns:repeat(${n},1fr)">${veces.map((x, k) => `<span class="${estadoU[k]}" style="--v:${(x / max).toFixed(2)}"><b>${x}</b><small>${esc(S.unidades[k])}</small></span>`).join('')}</div>` : ''}
    <div class="stop-ctrl">${!e.visto ? `
      <button class="primario stop-play1" data-stop-acc="play" data-stop-id="${id}">▶ Reproducir</button>` : `
      <button class="secundario" data-stop-acc="ant" data-stop-id="${id}" ${i === 0 ? 'disabled' : ''} aria-label="Tanda anterior">‹</button>
      <button class="${fin && !(stopTimer && stopTimer.id === id) ? 'primario' : 'secundario'}" data-stop-acc="play" data-stop-id="${id}">${stopTimer && stopTimer.id === id ? 'Pausa' : fin ? 'Ver de nuevo' : 'Reproducir'}</button>
      <button class="${fin ? 'secundario' : 'primario'}" data-stop-acc="sig" data-stop-id="${id}" ${fin ? 'disabled' : ''}>Siguiente ›</button>`}
    </div>`;
}
/* Audio de Andy por tanda (solo en "Así sí"): audio/<stop>/01.mp3, 02.mp3… */
let stopSonido = true;
const stopAudio = new Audio(); stopAudio.preload = 'auto';
const audioDe = (S, e) => S.audio && e.modo === 'si' && stopSonido ? `${S.audio}${String(e.i + 1).padStart(2, '0')}.m4a?v=2` : '';
function stopAccion(id, acc) {
  const S = STOPS[id], e = stopEst[id] || (stopEst[id] = { i: 0, modo: 'si' });
  const total = () => (e.modo === 'no' ? S.no.tandas : S.tandas).length;
  const parar = () => { if (stopTimer) { clearTimeout(stopTimer.h); stopTimer = null; } stopAudio.onended = stopAudio.onerror = null; stopAudio.pause(); };
  const pintar = () => { const c = document.querySelector(`[data-stop-caja="${id}"]`); if (c) c.innerHTML = stopInner(id); else parar(); };
  const espera = () => { const tt = (e.modo === 'no' ? S.no.tandas : S.tandas)[e.i], txt = e.modo === 'no' ? (e.i === total() - 1 ? S.no.fin : S.no.t) : tt.t; return Math.min(8000, Math.max(3500, 2200 + String(txt).length * 55)); };
  /* Suena la tanda actual; si "luego" viene, se llama al terminar (o con el tiempo de lectura si no hay audio) */
  const sonar = luego => {
    const src = audioDe(S, e);
    if (!src) { if (luego) stopTimer.h = setTimeout(luego, espera()); return; }
    stopAudio.src = src;
    if (luego) { stopAudio.onended = () => { stopTimer.h = setTimeout(luego, 700); }; stopAudio.onerror = () => { stopTimer.h = setTimeout(luego, espera()); }; }
    stopAudio.play().catch(() => { if (luego && stopTimer) stopTimer.h = setTimeout(luego, espera()); });
  };
  if (acc === 'sig') { parar(); e.i = Math.min(e.i + 1, total() - 1); pintar(); sonar(); return; }
  if (acc === 'ant') { parar(); e.i = Math.max(e.i - 1, 0); pintar(); sonar(); return; }
  if (acc === 'modo-si' || acc === 'modo-no') { parar(); e.modo = acc === 'modo-no' ? 'no' : 'si'; e.i = 0; e.visto = false; }
  else if (acc === 'sonido') { stopSonido = !stopSonido; if (!stopSonido) stopAudio.pause(); }
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
function stopCifrado(S, enSel, est) {
  return `<div class="cifrado">${S.acordes.map((ac, k) => {
    const cl = est[k] === 'traba' ? 'traba' : est[k] === 'ok' ? 'ok' : '';
    return `<div class="cf-compas ${enSel(k) ? 'on' : ''} ${cl}"><small>${k + 1}</small><span>${esc(ac).replace(/b(?=\d|maj|$)/g, '♭').replace(/^([A-G])b/, '$1♭')}</span>${cl === 'traba' ? '<i>!</i>' : ''}</div>`;
  }).join('')}</div>`;
}
const ruido = (k, j) => { const x = Math.sin(k * 12.9898 + j * 78.233) * 43758.5453; return x - Math.floor(x); };
function stopOla(S, enSel, est, partido) {
  const n = S.unidades.length, W = 640, H = 112, u = W / n, cy = 62;
  const grupos = S.grupos || S.unidades.map((x, k) => [x, k, k]);
  let barras = '', marcas = '', fondos = '';
  for (let k = 0; k < n; k++) {
    const on = enSel(k), cl = est[k] === 'traba' ? 'traba' : est[k] === 'ok' ? 'ok' : '';
    if (on) fondos += `<rect class="ola-sel ${cl}" x="${k * u + 1}" y="26" width="${u - 2}" height="${cy * 2 - 46}" rx="4"/>`;
    for (let j = 0; j < 9; j++) {
      const a = 4 + ruido(k, j) * 22 * (0.5 + 0.5 * Math.sin((k * 5 + j) / 2.3) ** 2);
      barras += `<rect class="ola-b ${on ? 'on' : ''} ${cl}" x="${(k * u + 4 + j * (u - 8) / 9).toFixed(1)}" y="${(cy - a).toFixed(1)}" width="${((u - 8) / 16).toFixed(1)}" height="${(a * 2).toFixed(1)}" rx="1"/>`;
    }
  }
  grupos.forEach(([letra, a, b]) => {
    const x0 = a * u + 5, x1 = (b + 1) * u - 5, on = [...Array(b - a + 1)].some((_, s) => enSel(a + s));
    const tr = [...Array(b - a + 1)].some((_, s) => est[a + s] === 'traba'), ok = [...Array(b - a + 1)].some((_, s) => est[a + s] === 'ok');
    marcas += `<path class="m-llave ${on ? 'on' : ''} ${tr ? 'traba' : ok ? 'ok' : ''}" d="M${x0} 24 v-6 H${x1} v6"/><text class="m-letra ${on ? 'on' : ''}" x="${(x0 + x1) / 2}" y="13">${esc(letra)}</text>`;
    if (tr) marcas += `<text class="ola-alerta" x="${x1 - 2}" y="15">!</text>`;
    if (b > a && partido) for (let k = a; k <= b; k++) {
      marcas += `<text class="ola-num ${enSel(k) ? 'on' : ''}" x="${k * u + u / 2}" y="${H - 2}">${esc(S.unidades[k])}</text>`;
      if (k > a) marcas += `<line class="m-corte" x1="${k * u}" y1="30" x2="${k * u}" y2="${H - 14}"/>`;
    }
  });
  return `<svg viewBox="0 0 ${W} ${H}" class="svg-ola" role="img" aria-label="El solo como una onda, dividido en frases">${fondos}${barras}${marcas}</svg>`;
}
function stopCuerdas(S, enSel, est) {
  const W = 640, H = 132, ys = [28, 66, 104], grosor = [1.6, 2.4, 3.4];
  let t = '';
  for (let f = 1; f < 6; f++) t += `<line class="trastes" x1="${70 + f * 95}" y1="14" x2="${70 + f * 95}" y2="118"/>`;
  t += `<rect class="cejilla" x="64" y="12" width="6" height="108" rx="2"/>`;
  ys.forEach((y, k) => {
    const on = enSel(k), cl = est[k] === 'traba' ? 'traba' : est[k] === 'ok' ? 'ok' : '';
    t += `<text class="c-num ${on ? 'on' : ''}" x="28" y="${y + 5}">${esc(S.unidades[k])}</text>
      ${on ? `<line class="c-brillo ${cl}" x1="70" y1="${y}" x2="${W - 14}" y2="${y}" stroke-width="${grosor[k] + 9}"/>` : ''}
      <line class="cuerda ${on ? 'on' : ''} ${cl}" x1="70" y1="${y}" x2="${W - 14}" y2="${y}" stroke-width="${grosor[k]}"/>
      ${cl === 'traba' ? `<text class="ola-alerta" x="${W - 30}" y="${y - 8}">!</text>` : ''}`;
  });
  return `<svg viewBox="0 0 ${W} ${H}" class="svg-cuerdas" role="img" aria-label="Cuerdas 1, 2 y 3">${t}</svg>`;
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
  const igual = r => v && ytId(r.url) === v.id && ytT(r.url) === (v.t || 0);
  const dup = (p.recursos || []).find(r => r.url && igual(r) && /ejemplo/i.test(r.t));   // «Ver ejemplo…» conserva su nombre
  const rs = (p.recursos || []).filter(r => r.url && !igual(r));
  const verVideo = v ? { t: dup ? dup.t : 'Video: Ver video', url: `https://www.youtube.com/watch?v=${v.id}${v.t ? '&t=' + v.t + 's' : ''}` } : null;
  if (verVideo) rs.unshift(verVideo);
  if (!rs.length) return '';
  const nuevos = rs.filter(r => esDoc(r) && docNuevo(p, r));
  /* Un doc nuevo con sección: la tarjeta abre el doc entero y además va el botón a esa parte */
  const resto = rs.filter(r => !nuevos.includes(r)).concat(nuevos.filter(r => r.sec));
  return `${nuevos.map(r => `<a class="doc-nuevo" href="${esc(r.url)}" target="_blank" rel="noopener"><span class="dn-ico">${ICONO.doc}</span><span><small>Documento nuevo: leelo antes de practicar</small><strong>${esc(r.t.replace(/^Doc:\s*/, ''))}</strong></span>${ICONO.abajo}</a>`).join('')}
  ${resto.length ? `<div class="material">${resto.map(r => {
    if (r.sec) return `<a class="mat mat-sec" href="${esc(linkSeccion(r.url, r.sec[0]))}" target="_blank" rel="noopener">${ICONO.doc}<span>Ir a <b>${esc(r.sec[1])}</b></span></a>`;
    const id = ytId(r.url);
    if (id) { const t = ytT(r.url); return `<button class="mat" data-seek="${id}:${t}">${ICONO.video}<span>${esc(r.t.replace(/^Video:\s*/, '').replace(/^./, c => c.toUpperCase()))}${t ? `<small>desde ${mmss(t)}</small>` : ''}</span></button>`; }
    return `<a class="mat" href="${esc(r.url)}" target="_blank" rel="noopener">${ICONO.doc}<span>${esc(r.t)}</span></a>`;
  }).join('')}</div>` : ''}`;
}
function apoyoHTML(p, sel) {
  const ok = sel && sel.nivel === 'listo' && p.apoyo.textoListo;
  return `<div class="apoyo ${ok ? 'apoyo-ok' : ''}"><h4>${esc(p.apoyo.titulo)}</h4>${ok ? `<p>${enLinea(p.apoyo.textoListo)}</p>` : p.apoyo.texto ? `<p>${enLinea(p.apoyo.texto)}</p>` : ''}
    ${p.apoyo.items.map(i => `<div class="apoyo-item"><p class="apoyo-t">${esc(i.t)}</p><p class="apoyo-c">${esc(i.cuando)}</p>
      ${(i.partes || [{ video: i.video, url: i.url }]).map(pt => `${pt.titulo ? `<p class="apoyo-parte">${esc(pt.titulo)}</p>` : ''}<div class="apoyo-links">${pt.video ? `<button class="mat" data-seek="${ytId(pt.video)}:0">${ICONO.video}<span>${esc(pt.tv || 'Ver el video')}</span></button>` : ''}${pt.url ? `<a class="mat" href="${esc(pt.url)}" target="_blank" rel="noopener">${ICONO.doc}<span>${esc(pt.td || 'Leer el documento')}</span></a>` : ''}</div>`).join('')}</div>`).join('')}</div>`;
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

const cambiando = new Set();   // pasos donde el alumno tocó «Cambiar respuesta»
function preguntaHTML(st, p) {
  if (p.tipo === 'standard') return standardHTML(st);
  const sel = opcionElegida(st, p);
  const ayuda = ayudaPara(p, sel);
  if (sel && sel.nivel === 'listo' && !cambiando.has(p.id)) return `<div class="pregunta respondida">
    ${sel.resp || sel.nivel === 'listo' ? respuestaHTML(sel, p) : ''}
    ${ayuda.apoyo ? apoyoHTML(p, sel) : ''}
    ${dificultadesHTML(ayuda.difs)}
    <button class="link cambiar-op" data-cambiar="${p.id}">Cambiar respuesta</button>
  </div>`;
  return `<div class="pregunta"><h4>${esc(p.pregunta || '¿Cómo te fue?')}</h4>
    <div class="ops" role="radiogroup" aria-label="${esc(p.pregunta || 'Cómo te fue')}">
      ${opcionesProgreso(p).map(o => `<button role="radio" aria-checked="${sel === o}" class="op nivel-${o.nivel} ${sel === o ? 'sel' : ''}" data-op="${p.id}:${o.id}"><span class="op-punto"></span>${esc(o.label)}</button>`).join('')}
    </div>
    ${sel && (sel.resp || sel.nivel === 'listo') ? respuestaHTML(sel, p) : ''}
    ${ayuda.apoyo ? apoyoHTML(p, sel) : ''}
    ${dificultadesHTML(ayuda.difs)}
  </div>`;
}

/* Respuesta según cómo le fue: verde con tilde si va bien, recuadro de recomendación si no */
/* Cuando marca que le salió y el paso no trae respuesta propia, igual le llega un mensaje en verde */
const FESTEJOS = ['Bien ahí! A seguir así', 'Espectacular! Vamo arriba', 'Buenísimo! Venís bárbaro, seguí así', 'Esooo! A lo que sigue'];
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
  return `<div class="tarjeta">
    <div class="consigna">${textoHTML(p.detalle)}</div>
    ${hojaDeRutaHTML(p)}
    ${p.ciclo ? `<div class="ciclo-paso" style="--rc:${MODULOS[MODULO_DE[p.etapa]].color}">${cicloHTML(p.ciclo, 0, p.id + '-ciclo')}</div>` : ''}
    ${p.stop ? stopHTML(p) : ''}
    ${panelHTML(p)}
    ${materialHTML(p)}
    ${p.nota ? `<p class="nota-paso">${esc(p.nota)}</p>` : ''}
    ${p.tip ? `<div class="tip-paso">${ICONO.idea}<p>${esc(p.tip)}</p></div>` : ''}
    ${seguimientoHTML(st, p)}
    ${preguntaHTML(st, p)}
    ${respondido && p.entrega && !sel?.saltea ? envioHTML(st, p) : ''}
    ${respondido && sig && (!p.entrega || p.entregaOpcional || st.prog[p.id]?.envio || sel?.saltea) ? `<div class="seguir">
        ${sel && sel.nivel === 'cuesta'
          ? `<button class="secundario" data-abrir="${sig.id}">Seguir igual con lo que viene</button>`
          : `<button class="primario" data-abrir="${sig.id}"><span>Seguir</span>${ICONO.abajo}</button>`}
      </div>` : ''}
  </div>`;
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
  const botonesVideo = conVideo && modo !== 'admin-vista' && !(ok && !vids.length) ? `<button class="primario boton-grabar" data-grabar="${p.id}"><i></i>${vids.length ? 'Grabar otro video' : 'Grabar el video acá'}</button>
      <label class="secundario boton subir-galeria">Subir uno que ya tengo<input type="file" accept="video/*" data-subir="${p.id}" hidden></label>` : '';
  return `<div class="envio ${ok ? 'envio-ok' : ''}">
    <p class="envio-t">${ok ? ICONO.check : ICONO.enviar}<strong>${ok && pend.length && !vids.length ? 'Mandándome tu video…' : ok ? `Listo, ya me lo mandaste` : `${p.entregaOpcional ? 'Podés mandarme' : 'Mandame'} ${esc(envia || 'el ' + p.entrega)}`}</strong></p>
    ${ok || !primerasEntregas(p.id) ? '' : `<p class="envio-c">${conVideo ? 'Grabalo acá mismo o mandámelo por WhatsApp.' : 'Mandámelo por WhatsApp.'} Así lo veo antes de la clase y te doy una devolución.</p>`}
    ${lista}${listaPend}
    <div class="fila-botones">${botonesVideo}</div>
    ${vids.length || pend.length ? '' : ok ? (modo === 'admin-vista' ? '' : `<button class="link cambiar-op" data-desenvio="${p.id}">No, todavía no lo mandé</button>`) : `<div class="fila-botones"><label class="envio-check"><input type="checkbox" data-envio="${p.id}" ${ok ? 'checked' : ''}><span>${conVideo ? 'Ya te lo mandé por WhatsApp' : 'Ya te lo mandé'}</span></label></div>`}
  </div>`;
}
// La explicación de cómo funciona el envío va solo en las primeras entregas del recorrido
function primerasEntregas(id) { return PROGRAMA.pasos.filter(x => x.entrega).slice(0, 3).some(x => x.id === id); }
function fechaCorta(f) { const [y, m, d] = String(f || '').split('-'); return d ? `${+d}/${+m}` : ''; }
function duracion(seg) { seg = Math.round(seg); return `${Math.floor(seg / 60)}:${String(seg % 60).padStart(2, '0')}`; }

const OLAS = [0, 34, 68, 34];
let verTodo = false;
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
      <button class="nodo-tit" data-abrir="${p.id}" aria-expanded="${abiertoEste}"><span>${esc(p.titulo)}</span>${sub ? `<small class="${!pr.hecho && e.tipo === 'meterle' || pr.como === 'cuesta' ? 'oxido' : ''}">${esc(sub)}</small>` : ''}</button>
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
    pasos.forEach((p, i) => items.push({ et, p, n: i + 1, total: items.length + 1 }));
  });
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
  // Ya leyó los objetivos del módulo: queda solo «Módulo N»
  const obj = !sub && PROGRAMA.pasos.find(p => p.hojaDeRuta && MODULO_DE[p.etapa] === m);
  if (obj && ST && hecho(ST, obj.id)) return `<div class="mod-banner mod-banner-chico"><h2>${esc(M.titulo)}</h2></div>`;
  return `<div class="mod-banner"><small>${esc(M.titulo)}</small><h2>${esc(M.nombre)}</h2>${sub || etapasUnica(m) ? `<p>${esc(sub || et.sub)}</p>` : ''}</div>`;
}
function etapasUnica(m) { return PROGRAMA.etapas.filter(et => MODULO_DE[et.id] === m).length === 1; }


/* ================= Cómo funciona el aula: animación de bienvenida =================
   Sale sola la primera vez que el alumno entra; después, con «Cómo funciona» arriba. */
const INTRO_AUDIO = 'audio/intro/';   // 01.m4a, 02.m4a… una por frase; si falta, avanza con el tiempo de lectura
const INTRO = [
  { t: '¡Bienvenido al aula de **Ajuste Elástico**!', ms: 2600 },
  { t: 'El aula es un camino: vas **paso a paso**.', ms: 3000 },
  { t: 'En cada paso tenés un **resumen cortito** de lo que hay que hacer.', ms: 3200 },
  { t: 'Siempre podés ver **el video de la consigna**.', ms: 3000 },
  { t: 'Y están **los documentos**: ahí está todo explicado en detalle. Leelos sí o sí, son tan importantes como los videos.', ms: 5500 },
  { t: 'A veces hay **videos extra** que te ayudan a destrabar.', ms: 3000 },
  { t: 'Cuando tenés clara la tarea, **me mandás el video** desde acá mismo.', ms: 4000 },
  { t: 'Te doy una devolución y seguís con **el paso que viene** 😉', ms: 3500 },
];
const audioIntro = new Audio(); audioIntro.preload = 'auto';
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
    <p class="in-sobre">Cómo funciona el aula</p>
    <p class="in-texto" aria-live="polite"></p>
    <div class="in-escena" data-s="1">
      <div class="in-camino"><svg class="in-linea" aria-hidden="true"><line x1="50%" y1="0" x2="50%" y2="100%"/></svg>${[1, 2, 3, 4].map(nodo).join('')}</div>
      <div class="in-tarjeta">
        <div class="in-el" data-desde="2"><p class="in-tit">Nombrar los intervalos</p><span class="in-renglon" style="width:92%"></span><span class="in-renglon" style="width:74%"></span></div>
        <div class="in-el in-vid" data-desde="3"><span class="in-play">${ICONO.video}</span><small>Video de la consigna</small></div>
        <div class="in-el in-doc" data-desde="4"><span class="in-doc-ico">${ICONO.doc}</span><span><small>Documento</small><strong>Leelo antes de practicar</strong></span></div>
        <div class="in-el in-aux" data-desde="5"><span>${ICONO.video}Ejemplo</span><span>${ICONO.video}Video extra</span></div>
        <div class="in-el in-env" data-desde="6"><span class="in-grabar"><i></i>Grabar video</span><span class="in-mandado">${ICONO.check}Listo, ya me lo mandaste</span></div>
        <div class="in-el in-seg" data-desde="7"><span>Seguir</span>${ICONO.abajo}</div>
      </div>
    </div>
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
    const sc = s - 1;   // la frase 1 es la bienvenida; la escena arranca en la 2
    esc_.dataset.s = sc;
    el.querySelectorAll('.in-el').forEach(x => { const d = +x.dataset.desde; x.classList.toggle('on', d <= sc); x.classList.toggle('foco', d === sc); });
    el.querySelectorAll('.in-nodo').forEach(x => { const k = +x.dataset.n, ahora = sc < 7 ? 2 : 3; x.classList.toggle('hecho', k < ahora); x.classList.toggle('ahora', k === ahora); });
    el.querySelectorAll('.in-puntos i').forEach(x => x.classList.toggle('on', +x.dataset.p <= s));
    txt.classList.remove('ver'); void txt.offsetWidth; txt.innerHTML = enLinea(INTRO[s - 1].t); txt.classList.add('ver');
    sig.textContent = s === INTRO.length ? 'Arrancar' : 'Siguiente';
    const yo = s, sigue = () => { if (s === yo && s < INTRO.length) ir(s + 1); };
    audioIntro.onended = audioIntro.onerror = null; audioIntro.pause();
    if (reduceMotion) return;
    audioIntro.src = INTRO_AUDIO + String(s).padStart(2, '0') + '.m4a?v=2';   // ?v=: que el navegador no use la versión vieja
    const t0 = Date.now();   // con audio, pasa al terminar, pero nunca antes del tiempo de lectura de la frase
    audioIntro.onended = () => { h = setTimeout(sigue, Math.max(300, INTRO[yo - 1].ms - (Date.now() - t0))); };
    audioIntro.onerror = () => { clearTimeout(h); h = setTimeout(sigue, INTRO[yo - 1].ms); };
    audioIntro.play().catch(() => { clearTimeout(h); h = setTimeout(sigue, INTRO[yo - 1].ms); });
  };
  const cerrar = () => { clearTimeout(h); audioIntro.onended = audioIntro.onerror = null; audioIntro.pause(); el.classList.remove('visible'); setTimeout(() => el.remove(), 400); };
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
  el.innerHTML = `<div class="pm-in"><p class="pm-pre">${m === 0 ? 'Empezás' : 'Pasaste al'}</p><p class="pm-num">${esc(M.titulo)}</p><h2>${esc(M.nombre)}</h2>
    <button class="primario" data-pm>${m === 0 ? 'Empezar' : 'Arrancar'}</button></div>`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('visible'));
  const cerrar = () => { el.classList.remove('visible'); setTimeout(() => el.remove(), 400); alCerrar && alCerrar(); };
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
      <p class="hero-prog">${esc(PROGRAMA.programa)}${st.standard ? `<span>Tu standard: ${esc(st.standard)}</span>` : ''}<span class="hero-botones"><button class="boton-mapa" data-accion="intro">${ICONO.idea}Cómo funciona</button><button class="boton-mapa" data-accion="mapa">${ICONO_MAPA}<span>Ver el mapa</span></button></span></p>
      <h1>Hola, ${esc(st.nombre.split(' ')[0])}</h1>
      <div class="estado estado-${e.tipo}"><strong>${titularEstado(e)}</strong><span>${esc(bajadaEstado(st, e))}</span></div>
      ${tiraClases(st, e, animar)}
      ${e.k <= 4 && !e.faltan.length ? `<div class="pregunta-clase" id="claseHecha"><p><strong>¿Ya tuvimos la clase ${e.k}?</strong>Ya tenés todo lo que se esperaba para esa clase. Si ya la tuviste, marcala así se te abre lo que sigue.</p>
          <div class="fila-botones"><button class="primario" data-accion="clase-ok">Sí, ya la tuve</button><button class="secundario" data-accion="clase-no">Todavía no</button></div></div>`
        : e.k <= 4 ? `<div class="clase-hecha" id="claseHecha"><button class="link suave" data-accion="clase">Ya tuve la clase ${e.k}</button>${st.clase > 0 ? `<button class="link suave" data-accion="deshacer-clase">Todavía no tuve la clase ${st.clase}</button>` : ''}</div>` : ''}
    </header>
    ${st.nota ? `<blockquote class="nota"><p>${esc(st.nota).replace(/\n/g, '<br>')}</p><cite>Andy</cite></blockquote>` : ''}
    ${extrasPend.length ? `<section class="de-andy"><h2>Te dejé</h2>${extrasPend.map(x => `
      <label class="extra"><input type="checkbox" data-extra="${esc(x.id)}"><span><strong>${esc(x.titulo)}</strong>${x.detalle ? `<br><span class="suave">${esc(x.detalle)}</span>` : ''}</span></label>`).join('')}</section>` : ''}
    ${instalarAppHTML()}
    ${caminoHTML(st, e)}
    ${selectorModulosHTML(st, e)}
    ${modo === 'alumno' ? `<p class="salir-pie"><span>${esc(st.nombre)}</span> · <button class="link suave" data-accion="salir">Salir de mi cuenta</button></p>` : ''}
    ${barraClaseHTML(st, e)}`;
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
          ${pasos.length ? `<details class="mz-det" ${aca ? 'open' : ''}><summary>Los pasos</summary><ul class="mz-lista">${pasos.map(p => {
            const ok = hecho(st, p.id), cur = p.id === ahora;
            return `<li class="${ok ? 'ok' : ''} ${cur ? 'cur' : ''}">${abiertoMod
              ? `<button class="mz-tilde" data-mapa-tilde="${p.id}" aria-pressed="${ok}" aria-label="${ok ? 'Desmarcar' : 'Marcar como hecho'}: ${esc(p.titulo)}"><i>${ok ? ICONO.check : ''}</i></button><button data-mapa-paso="${p.id}">${esc(p.titulo)}${cur ? '<em>sigue</em>' : ''}</button>`
              : `<span><i></i>${esc(p.titulo)}</span>`}</li>`;
          }).join('')}</ul></details>` : ''}
        </div></li>`;
    }).join('')}</ol>
  </div>`;
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
  const base = cam.getBoundingClientRect();
  const centro = el => { const r = el.getBoundingClientRect(); return [r.left - base.left + r.width / 2, r.top - base.top + r.height / 2]; };
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
  return `<aside class="panel-video" id="panel-video" aria-label="Video"><div class="pv-marco"><div id="yt"></div></div><p class="pv-titulo"><span id="pv-titulo"></span><span class="pv-aviso" id="pv-aviso" aria-live="polite"></span><button class="pv-cerrar" data-pv-cerrar aria-label="Cerrar video">✕</button></p></aside>`;
}
/* En el celu el video ocupa media pantalla: se muestra si el video del paso no se vio,
   o cuando el alumno toca un botón de video; se cierra con la ✕, al terminar o al cambiar de paso */
const esCel = () => innerWidth < 1000;
const vistos = new Set(String(leerLS('ae-vistos', '')).split(',').filter(Boolean));
function marcarVisto(id) { if (id && !vistos.has(id)) { vistos.add(id); guardarLS('ae-vistos', [...vistos].join(',')); } }
function abrirPanel() { const l = $('.layout'); if (l) l.classList.remove('pv-cerrado'); }
function cerrarPanel() {
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
        <stop offset="0" stop-color="#E8834F" stop-opacity=".45"/><stop offset=".55" stop-color="#E8834F" stop-opacity=".3"/><stop offset="1" stop-color="#E8834F" stop-opacity=".06"/>
      </linearGradient>
      <linearGradient id="lg-filo" gradientUnits="userSpaceOnUse" x1="${W}" y1="0" x2="0" y2="${H}">
        <stop offset="0" stop-color="#F6B48D" stop-opacity=".9"/><stop offset="1" stop-color="#F6B48D" stop-opacity=".1"/>
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
                onStateChange: ev => { if (ev.data === 1) { sinSubtitulos(ev.target); marcarVisto(playerVid); } if (ev.data === 0) cerrarPanel(); } } });
  } else if (playerVid !== id) {
    play ? player.loadVideoById({ videoId: id, startSeconds: t }) : player.cueVideoById({ videoId: id, startSeconds: t });
  } else { player.seekTo(t, true); if (play) player.playVideo(); }
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
  }
  if (!$('#vista') || animar) {
    player = null; playerVid = null;
    app().innerHTML = `${barra(st.nombre)}<div class="layout"><main class="alumno" id="vista"></main>${panelVideoHTML()}</div>`;
  }
  $('#vista').innerHTML = vistaHTML(st, e, animar);
  const sinVid = !!(PASO[abierto] && (PASO[abierto].sinVideo || PASO[abierto].hojaDeRuta));   // en los objetivos del módulo no va video, así se ve la animación   // pasos sin video: el contenido ocupa toda la pantalla
  $('.layout').classList.toggle('sin-video', sinVid);
  if (sinVid && player && player.pauseVideo) try { player.pauseVideo(); } catch (_) {}
  requestAnimationFrame(dibujarCamino);
  requestAnimationFrame(activarAnimaciones);
  consultaHTML();
  if (!playerVid) {
    const v = (PASO[abierto] && PASO[abierto].video) || [...ORDEN].reverse().map(id => PASO[id].video).find(Boolean) || { id: 'TylWJrfPxu0' };
    asegurarYT(() => ponerVideo(v.id, v.t || 0, false));
  }
  enlazarAlumno();
  enlazarFormStandard();
  if (animar && (modo === 'alumno' || modo === 'admin-prueba') && !introVista()) setTimeout(mostrarIntro, 300);
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
function abrirPaso(id) {
  const cambio = id !== abierto;
  verTodo = false;
  abierto = id; renderAlumno();
  if (cambio) decidirPanel();
  videoParaAbierto(cambio);
  requestAnimationFrame(() => irA(id));
  quizasCelebrar();
}

function enlazarAlumno() {
  const root = app();
  root.onchange = ev => { const f = ev.target.closest('input[data-subir]'); if (f && f.files[0]) abrirGrabador(f.dataset.subir, f.files[0]); };
  root.onclick = ev => {
    const b = ev.target.closest('button, input'); if (!b) return;
    const d = b.dataset;
    if (d.stopAcc) { stopAccion(d.stopId, d.stopAcc); return; }
    if (d.plegar) { barraPlegada = d.plegar === 'cerrar'; guardarLS('ae-barra', barraPlegada ? 'plegada' : 'abierta'); renderAlumno(); return; }
    if (d.abrir) abrirPaso(d.abrir);
    else if (d.seek) { const [id, t] = d.seek.split(':'); abrirPanel(); asegurarYT(() => ponerVideo(id, +t || 0, true)); }
    else if (d.seg) {
      const [id, opId] = d.seg.split(':'); const k = id + '_seg';
      if (ST.prog[k]?.op === opId) delete ST.prog[k]; else ST.prog[k] = { op: opId, t: hoyISO() };
      guardarAlumno(); renderAlumno();
    } else if (d.desenvio) { const pr = ST.prog[d.desenvio]; if (pr) { delete pr.envio; guardarAlumno(); renderAlumno(); } }
    else if (d.pvCerrar !== undefined) cerrarPanel();
    else if (d.cambiar) { cambiando.add(d.cambiar); renderAlumno(); }
    else if (d.op) {
      const [id, opId] = d.op.split(':'); cambiando.delete(id); const o = opcionesProgreso(PASO[id]).find(x => x.id === opId);
      const vids = ST.prog[id]?.videos;
      if (opcionElegida(ST, PASO[id]) === o) { if (vids) ST.prog[id] = { videos: vids }; else delete ST.prog[id]; }
      else ST.prog[id] = { hecho: true, como: o.nivel, op: o.id, t: hoyISO(), ...(ST.prog[id]?.envio ? { envio: true } : {}), ...(vids ? { videos: vids } : {}) };
      guardarAlumno(); renderAlumno();
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
    else if (d.accion === 'ver-todo') { verTodo = true; renderAlumno(); }
    else if (d.accion === 'mapa') abrirMapaZoom();
    else if (d.accion === 'intro') mostrarIntro();
    else if (d.accion === 'reiniciar-prueba') reiniciarPrueba();
    else if (d.desplegar !== undefined) { desplegados.add(+d.desplegar); renderAlumno(); }
    else if (d.plegar !== undefined) { desplegados.delete(+d.plegar); renderAlumno(); requestAnimationFrame(() => document.querySelector(`[data-desplegar="${d.plegar}"]`)?.scrollIntoView({ block: 'center' })); }
    else if (d.irModulo !== undefined) { const ps = pasosDelModulo(+d.irModulo); const p = ps.find(x => !hecho(ST, x.id)) || ps[0]; if (p) abrirPaso(p.id); }
    else if (d.accion === 'instalar-app' && avisoInstalar) { avisoInstalar.prompt(); avisoInstalar.userChoice.finally(() => { avisoInstalar = null; renderAlumno(); }); }
    else if (d.accion === 'no-instalar') { try { localStorage.setItem('mapaAE_sinInstalar', '1'); } catch (e) {} renderAlumno(); }
    else if (d.accion === 'ver-menos') { verTodo = false; renderAlumno(); requestAnimationFrame(() => irA(abierto)); }
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
  const colores = ['#E8834F', '#FFFFFF', '#5D7BB6', '#F2B591', '#C24A22'];
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
      const { url } = await llamar('video.iniciar', { token: TOKEN, paso: item.pasoId, mime: item.mime, tam: item.blob.size });
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
