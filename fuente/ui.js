/* =====================================================================
   INTERFAZ
   ===================================================================== */
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const app = () => $('#app');
const params = new URLSearchParams(location.search);
/* En el panel la dirección dice dónde estás (alumno, vista de alumno, paso), así recargar te deja en el mismo lugar */
// ?demo: la vista de alumno de prueba sin clave (se guarda en este aparato, con «Reiniciar»)
const esLlamada = params.has('llamada');            // quienes tienen la llamada conmigo: presentación + módulo 0
const esDemo = params.has('demo') || esLlamada;
const clavePrueba = () => esLlamada ? 'mapaAE_llamada' : esDemo ? 'mapaAE_demo' : 'mapaAE_prueba';
const codPrueba = () => esLlamada ? '__llamada' : esDemo ? '__demo' : '__prueba';
let vistaAdm = params.has('llamadas') ? 'llamadas' : 'alumnos';   // solapa del panel
let DESTINO = params.has('admin') ? { alumno: params.get('alumno'), ver: params.get('ver'), prueba: params.has('prueba'), paso: params.get('paso') } : null;
function urlAdmin() {
  if (modo === 'admin' && !(vistaAdm === 'llamadas' && !elegido)) nav(elegido && elegido !== '__nuevo' ? `?admin&alumno=${encodeURIComponent(elegido)}` : '?admin');
  else if (modo === 'admin-vista') nav(`?admin&ver=${encodeURIComponent(ST.codigo)}${abierto ? '&paso=' + abierto : ''}`);
  else if (modo === 'admin-prueba') { nav(`${esLlamada ? '?llamada&aula' : esDemo ? '?demo' : '?admin&prueba'}${abierto ? '&paso=' + abierto : ''}`); try { localStorage.setItem(clavePrueba(), JSON.stringify(ST)); if (esLlamada) { localStorage.setItem('mapaAE_llamada_aula', '1'); localStorage.setItem('mapaAE_llamada_paso', abierto || ''); } } catch (e) {} if (esLlamada) reportarLlamada(); }
  else if (modo === 'admin' && vistaAdm === 'llamadas' && !elegido) nav('?admin&llamadas');
}
function aplicarDestino() {
  const d = DESTINO; if (!d) return false; DESTINO = null;
  if (d.ver) { const a = LISTA.find(x => x.codigo === d.ver); if (a) { ST = clonar(a); modo = 'admin-vista'; abierto = d.paso; renderAlumno(true); return true; } }
  if (d.prueba) {
    let guardado = null; try { guardado = JSON.parse(localStorage.getItem(clavePrueba()) || 'null'); } catch (e) {}
    ST = guardado || Object.assign(alumnoVacio(esLlamada ? 'Invitado' : 'Alumno de prueba', 2, hoyISO()), { codigo: codPrueba(), ...(esLlamada ? { modulos: '0' } : {}) });
    if (esLlamada && QUIEN) ST.nombre = QUIEN.nombre;
    modo = 'admin-prueba'; abierto = d.paso; renderAlumno(true); return true;
  }
  if (d.alumno && LISTA.some(x => x.codigo === d.alumno)) elegido = d.alumno;
  return false;
}
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let ST = null;            // alumno abierto
let modo = 'alumno';      // 'alumno' | 'admin-vista' | 'admin-prueba'
let abierto = null;       // paso expandido
let paso2 = {};
const desplegadas = new Set(); // etapas completas que el alumno abrió           // paso -> 'como' | 'probs' (flujo después de tildar)
let claveAdmin = '';
try { claveAdmin = localStorage.getItem('mapaAE_clave') || sessionStorage.getItem('mapaAE_clave') || ''; } catch (e) {}
// Copias locales para mostrar todo al instante mientras el servidor (que tarda unos segundos) responde
function leerLocal(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
function guardarLocal(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
function guardarClaveAdmin(c) { claveAdmin = c || ''; try { c ? localStorage.setItem('mapaAE_clave', c) : (localStorage.removeItem('mapaAE_clave'), sessionStorage.removeItem('mapaAE_clave')); } catch (e) {} if (!c) guardarLocal('mapaAE_lista', null); }
let ediciones = 0;   // cambios del alumno hechos antes de que llegue la respuesta del servidor

const ETIQUETA_COMO = { cuesta: 'Me cuesta', casi: 'Casi', listo: 'Ya está' };
const NOMBRE_ESTACION = ['Inicio', 'Clase 1', 'Clase 2', 'Clase 3', 'Clase 4', 'Módulo 2'];

function nav(url) { try { history.replaceState(null, '', url); if (/^\?admin/.test(url)) localStorage.setItem('mapaAE_ultimoAdmin', url); } catch (e) {} }
// Los links que se mandan a los alumnos siempre van a la dirección nueva, aunque el panel se abra desde otra
const AULA_URL = 'https://aula.ajuste-elastico.com/';
const baseLinks = () => /ajuste-elastico\.com$/.test(location.hostname) || location.protocol === 'file:' || location.hostname === 'localhost' ? location.href : AULA_URL;
function linkInvitacion(token) {
  const u = new URL(baseLinks()); u.search = ''; u.hash = ''; u.searchParams.set('invitacion', token); return u.toString();
}
function linkRegistro(c) { const u = new URL(baseLinks()); u.search = ''; u.hash = ''; u.searchParams.set('registro', c); return u.toString(); }
function linkMapa() { const u = new URL(location.href); u.search = ''; u.hash = ''; return u.toString(); }
let TOKEN = '';
try { TOKEN = localStorage.getItem('mapaAE_token') || ''; } catch (e) {}
function guardarToken(t) { TOKEN = t || ''; try { t ? localStorage.setItem('mapaAE_token', t) : localStorage.removeItem('mapaAE_token'); } catch (e) {} }

/* ---------------- Guardado ---------------- */
let timerGuardar = null;
/* ---- Guardar solo lo que cambió (para no pisar lo hecho en otro dispositivo o desde el panel) ---- */
const clonar = o => JSON.parse(JSON.stringify(o ?? null));
function difPasos(base, cur) {
  const d = {}; base = base || {}; cur = cur || {};
  new Set([...Object.keys(base), ...Object.keys(cur)]).forEach(id => {
    if (JSON.stringify(base[id]) !== JSON.stringify(cur[id])) d[id] = id in cur ? cur[id] : null;
  });
  return d;
}
function aplicarPasos(o, d) { const r = Object.assign({}, o || {}); Object.keys(d).forEach(id => { if (d[id] === null) delete r[id]; else r[id] = clonar(d[id]); }); return r; }
let BASE = null;   // lo último que se sabe que está en el servidor, para el alumno
const ORIG = {};   // ídem por alumno, para el panel
function difAlumno(base, cur) {
  const c = {};
  Object.keys(cur).forEach(k => {
    if (k === 'prog' || k === 'probs') { const d = difPasos(base?.[k], cur[k]); if (Object.keys(d).length) c[k + 'Cambios'] = d; }
    else if (JSON.stringify(base?.[k]) !== JSON.stringify(cur[k])) c[k] = clonar(cur[k]);
  });
  return c;
}

let stIntacto = true;   // en la vista de alumno del panel: todavía no se tocó nada (se puede refrescar con lo del servidor)
function guardarAlumno() {
  if (modo === 'admin-prueba') { urlAdmin(); return; }   // la vista de prueba se guarda solo en este aparato
  stIntacto = false;
  if (modo === 'alumno') { ediciones++; guardarLocal('mapaAE_alumno', { token: TOKEN, alumno: ST, base: BASE }); }
  aviso('Guardando…');
  clearTimeout(timerGuardar);
  timerGuardar = setTimeout(async () => {
    try {
      if (modo === 'admin-vista') { const i = LISTA.findIndex(x => x.codigo === ST.codigo); if (i >= 0) LISTA[i] = ST; await guardarCambiosAdm(ST.codigo); aviso('Guardado'); return; }
      const enviado = clonar(ST);
      const progCambios = difPasos(BASE?.prog, enviado.prog), probsCambios = difPasos(BASE?.probs, enviado.probs);
      await llamar('alumno.guardar', { token: TOKEN, cambios: { progCambios, probsCambios, prog: enviado.prog, probs: enviado.probs,
        clase: enviado.clase, claseFecha: enviado.claseFecha, extras: enviado.extras, standard: enviado.standard } });
      BASE = Object.assign(clonar(BASE || {}), { clase: enviado.clase, claseFecha: enviado.claseFecha, standard: enviado.standard,
        prog: aplicarPasos(BASE?.prog, progCambios), probs: aplicarPasos(BASE?.probs, probsCambios) });
      guardarLocal('mapaAE_alumno', { token: TOKEN, alumno: ST, base: BASE });
      aviso('Guardado');
    } catch (e) { aviso(/sesión/.test(e.message) ? e.message : 'No se pudo guardar. Revisá la conexión y volvé a intentar.', true); }
  }, 500);
}
function aviso(t, error) {
  const el = $('#aviso'); if (!el) return;
  el.textContent = t; el.classList.toggle('error', !!error); el.classList.add('visible');
  // Los avisos de algo en curso («Guardando…») se quedan hasta que termina; el resto se va solo (los errores tardan más)
  clearTimeout(el._t);
  if (!/…$/.test(t)) el._t = setTimeout(() => el.classList.remove('visible'), error ? 6000 : 1800);
  el.onclick = () => el.classList.remove('visible');
}

/* Vista de prueba del panel: un alumno nuevo de cero (aula virgen, con bienvenida y pantallas de módulo) */
// Link de la llamada: borra el avance guardado en este celu/compu y vuelve a la presentación (pide un segundo toque)
function reiniciarLlamada(b) {
  if (!b.classList.contains('seguro')) {
    b.classList.add('seguro'); b.textContent = '¿Seguro?';
    setTimeout(() => { if (b.isConnected) { b.classList.remove('seguro'); b.textContent = 'Reiniciar'; } }, 4000);
    return;
  }
  const cod = codPrueba();
  ['mapaAE_intro_' + cod, 'mapaAE_modVistos_' + cod].forEach(k => guardarLocal(k, null));
  // vuelve al arranque del aula: la presentación no se repite
  try { presAudio.pause(); clearTimeout(presEst.timer); presEst.timer = null; } catch (e) {}
  try { localStorage.setItem('mapaAE_llamada_paso', ''); localStorage.removeItem(clavePrueba()); } catch (e) {}
  ST = Object.assign(alumnoVacio('Invitado', 2, hoyISO()), { codigo: cod, modulos: '0' });
  abierto = null; document.querySelectorAll('.ll-puente,.ll-final').forEach(x => x.remove()); document.body.classList.remove('sin-scroll');
  modo = 'admin-prueba'; renderAlumno(true); window.scrollTo(0, 0);
}
function reiniciarPrueba() {
  const cod = codPrueba();
  ['mapaAE_intro_' + cod, 'mapaAE_modVistos_' + cod].forEach(k => guardarLocal(k, null));
  try { localStorage.removeItem(clavePrueba()); } catch (e) {}
  ST = alumnoVacio('Alumno de prueba', 2, hoyISO()); ST.codigo = cod;
  modo = 'admin-prueba'; abierto = null; renderAlumno(true); window.scrollTo(0, 0);
}
/*VISTA_ALUMNO*/
// El logo vuelve al inicio de donde estás: la presentación en el link de la llamada, la demo en la demo,
// el panel solo si sos admin, y si sos alumno tu propia aula (nunca la vista de prueba del admin)
function inicioMarca() {
  if (esLlamada) return '?llamada';
  if (esDemo) return '?demo';
  if (modo === 'admin' || modo.startsWith('admin-')) return '?admin';
  return location.pathname + location.search.replace(/[?&]paso=[^&]*/, '').replace(/^&/, '?');
}
function barra(nombre) {
  return `<header class="barra">
    <a class="marca" href="${esc(inicioMarca())}" aria-label="Ajuste Elástico, ir al inicio">${LOGO}</a>
    <div class="barra-der">
      ${esLlamada && modo === 'admin-prueba' ? `<button class="link" data-accion="presentacion">Presentación</button><button class="link" data-accion="reiniciar-llamada" title="Borrar el avance y volver al primer paso (sin repetir la presentación)">Reiniciar</button>` : modo === 'admin-prueba' ? `<span class="chip-prueba"><span class="solo-pc">Vista de </span>prueba</span><button class="link" data-accion="reiniciar-prueba" title="Volver a empezar como alumno nuevo, con la animación de bienvenida">Reiniciar</button>` : ''}
      ${modo.startsWith('admin-') && !esDemo ? `<button class="link" data-accion="volver-admin"><span class="solo-pc">Volver al </span>panel</button>` : ''}
      ${modo.startsWith('admin-') ? '' : `<span class="firma">Andy Kligman</span>`}
      ${modo === 'admin' && nombre ? `<button class="link suave" data-accion="salir">Salir</button>` : ''}
    </div>
  </header>`;
}

/* ---------------- Entrada ---------------- */
function renderEntrada(error) {
  app().innerHTML = `${barra('')}
  <main class="entrada">
    <h1>Tu mapa de Ajuste Elástico</h1>
    <p class="suave">Entrá con el email y la contraseña que creaste con el link que te mandé.</p>
    <form id="formEntrada" novalidate>
      <label for="email">Email</label>
      <input id="email" name="email" type="email" autocomplete="username" autocapitalize="off" spellcheck="false" required>
      <label for="clave">Contraseña</label>
      <input id="clave" name="clave" type="password" autocomplete="current-password" required>
      ${error ? `<p class="error" role="alert">${esc(error)}</p>` : ''}
      <button class="primario" type="submit">Entrar</button>
    </form>
    <p class="suave chico">¿Te olvidaste la contraseña? Escribime por WhatsApp y te mando un link nuevo.</p>
    ${!API_URL ? `<div class="demo">
      <p><strong>Modo de prueba.</strong> Todavía no está conectado a la planilla: lo que marques queda solo en este navegador.</p>
      <p>Alumnos de ejemplo (contraseña <code>prueba123</code>):</p>
      <ul>${leerDemo().alumnos.filter(a => a.clave).map(a => `<li><button class="link" data-demo-email="${esc(a.email)}">${esc(a.nombre)}</button> <span class="suave chico">${esc(a.email)}</span></li>`).join('')}</ul>
      <p><button class="link" data-demo-inv="demo-invitacion-caro">Probar el link de invitación (Carolina)</button></p>
      <p><button class="link" data-demo-admin="1">Entrar al panel de Andy</button> · <button class="link suave" data-demo-reset="1">Reiniciar ejemplos</button></p>
    </div>` : `<p class="suave chico"><button class="link suave" data-demo-admin="1">Soy Andy</button></p>`}
  </main>`;
  const f = $('#formEntrada');
  f.onsubmit = async ev => {
    ev.preventDefault();
    const email = f.email.value.trim(), clave = f.clave.value;
    if (!email || !clave) { renderEntrada('Completá el email y la contraseña.'); return; }
    const btn = f.querySelector('button'); btn.disabled = true; btn.textContent = 'Entrando…';
    try { const r = await llamar('auth.entrar', { email, clave }); guardarToken(r.token); abrirMapa(r.alumno); }
    catch (e) { renderEntrada(e.message); $('#email').value = email; }
  };
  app().onclick = ev => {
    const b = ev.target.closest('button'); if (!b) return;
    if (b.dataset.demoEmail) { f.email.value = b.dataset.demoEmail; f.clave.value = 'prueba123'; f.requestSubmit(); }
    if (b.dataset.demoInv) renderInvitacion(b.dataset.demoInv);
    if (b.dataset.demoAdmin) pedirClave();
    if (b.dataset.demoReset) { guardarToken(''); llamar('demo.reset', {}).then(() => renderEntrada()); }
  };
}

/* Presentación para quienes van a tener la llamada conmigo: animada, con mi voz, y después testimonios,
   entrenamiento gratuito y video de bienvenida. Audios en audio/llamada/NN.m4a (si falta uno, pasa en silencio). */
const PRES_LLAMADA = [
  { v: 'llamada', t: '¡Hola! Si te llegó este link,\nes porque **vamos a tener una llamada**.' },
  { v: 'chispa', t: 'Y quiero darte material\npara que podamos **aprovecharla al 100**.' },
  { v: 'mensajes', t: 'Te cuento algo: a casi todos los guitarristas con los que hablo\nles pasa **lo mismo**.' },
  { v: 'saberes', t: 'Manejan el instrumento, conocen recursos,\ny algunos hasta **estudiaron un montón**.' },
  { v: 'dispersas', t: 'Pero cuando llega el momento de improvisar,\nmuchas cosas **no aparecen** con el control o la fluidez que quisieran.' },
  { v: 'puente', t: 'Esa distancia entre **entender cómo funcionan las cosas**\ny **realmente poder usarlas** al improvisar…' },
  { v: 'logo', t: '…es justo lo que trabajamos en **Ajuste Elástico**.' },
  { v: 'elastico', t: 'No con más información, sino con un método\nque **adapta la práctica a vos**, momento a momento.' },
  { v: 'mapa', t: 'Un **mapa** que ordena tu camino\npara que puedas avanzar sin trabas.' },
  { v: 'cana', t: 'No son más pescados:\nes **una caña de pescar**.' },
  { v: 'reloj', t: 'Para que el tiempo y la energía que empleás en estudiar\nte den **los resultados que merecés**.' },
  { v: 'pasos', paso: 1, t: 'En la llamada vamos a charlar sobre **tu situación actual** con la guitarra\ny ver si te puedo ayudar con lo que buscás:' },
  { v: 'pasos', paso: 2, t: 'Entender **qué es lo que te está trabando**…' },
  { v: 'pasos', paso: 3, t: '…y **el camino concreto** para destrabarlo.' },
  { v: 'regalo', t: 'Mientras tanto, te dejo un **entrenamiento gratuito**\npara que explores, si querés.' },
  { v: 'relax', t: 'Pero no hace falta que traigas nada para la sesión.\nAsí que **no te preocupes por hacer la tarea** 😛' },
  { v: 'testimonios', t: 'También te dejo **testimonios de alumnos**\nque estaban en tu misma situación cuando empezaron…' },
  { v: 'video', t: '…y un **video** que explica un poquito\nde qué se trata el método.' },
  { v: 'final', t: '¡Nos vemos en la llamada! 🙌' },
];
function presVis(v, paso) {
  const W = 360, H = 200;
  let s = '';
  if (v === 'llamada') s = `<circle class="pl-onda" cx="180" cy="100" r="40" style="--k:0"/><circle class="pl-onda" cx="180" cy="100" r="40" style="--k:1"/><circle class="pl-onda" cx="180" cy="100" r="40" style="--k:2"/>
      <circle class="pl-disco" cx="180" cy="100" r="42"/><path class="pl-tel" d="M164 86c2-4 6-6 9-4l6 6c2 2 2 5 0 7l-3 3c3 6 8 11 14 14l3-3c2-2 5-2 7 0l6 6c2 3 0 7-4 9-12 4-40-24-38-38z"/>`;
  else if (v === 'chispa') { for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; s += `<line class="pl-rayo" x1="${180 + Math.cos(a) * 34}" y1="${100 + Math.sin(a) * 34}" x2="${180 + Math.cos(a) * 78}" y2="${100 + Math.sin(a) * 78}" style="--k:${k % 3}"/>`; } s += '<circle class="pl-sol" cx="180" cy="100" r="24"/>'; }
  else if (v === 'mensajes') [[40, 30, 170], [150, 76, 170], [60, 122, 150]].forEach(([x, y, w], k) => { s += `<g class="pl-msj" style="--k:${k}"><rect x="${x}" y="${y}" width="${w}" height="34" rx="17"/><circle cx="${x + 22}" cy="${y + 17}" r="4"/><circle cx="${x + 36}" cy="${y + 17}" r="4"/><circle cx="${x + 50}" cy="${y + 17}" r="4"/></g>`; });
  else if (v === 'dispersas') { const p = [[60, 60], [110, 140], [150, 50], [200, 120], [250, 70], [300, 150], [90, 100], [230, 40]]; p.forEach(([x, y], k) => { s += `<g class="pl-nota" style="--k:${k};--dx:${(k % 2 ? 1 : -1) * (8 + k * 3)}px;--dy:${(k % 3 - 1) * 14}px"><ellipse cx="${x}" cy="${y}" rx="9" ry="7"/><line x1="${x + 8}" y1="${y}" x2="${x + 8}" y2="${y - 30}"/></g>`; }); s += '<text class="pl-cuenta" x="180" y="188">1 · 2 · 3…</text>'; }
  else if (v === 'puente') s = `<rect class="pl-orilla" x="20" y="110" width="100" height="60" rx="8"/><rect class="pl-orilla b" x="240" y="110" width="100" height="60" rx="8"/>
      <text class="pl-cap" x="70" y="190">entender</text><text class="pl-cap b" x="290" y="190">usarlo al improvisar</text>
      <path class="pl-puente" d="M120 112 Q180 40 240 112"/><circle class="pl-viajero" r="7"><animateMotion dur="3s" repeatCount="indefinite" path="M120 112 Q180 40 240 112"/></circle>`;
  else if (v === 'elastico') s = [60, 100, 140].map((y, k) => `<path class="pl-cuerda" style="--k:${k}" d="M30 ${y} Q180 ${y} 330 ${y}"><animate attributeName="d" dur="${2 + k * .4}s" repeatCount="indefinite" values="M30 ${y} Q180 ${y} 330 ${y};M30 ${y} Q180 ${y + (k - 1 || 1) * 26} 330 ${y};M30 ${y} Q180 ${y} 330 ${y}"/></path>`).join('') + '<circle class="pl-punto-o" cx="30" cy="100" r="6"/><circle class="pl-punto-o" cx="330" cy="100" r="6"/>';
  else if (v === 'pasos') { const nom = ['Tu situación', 'Qué te traba', 'El camino']; nom.forEach((n, k) => { const x = 60 + k * 120, on = paso > k, ahora = paso === k + 1; s += `${k ? `<line class="pl-une ${on ? 'on' : ''}" x1="${x - 90}" y1="90" x2="${x - 30}" y2="90"/>` : ''}<g class="pl-paso ${on ? 'on' : ''} ${ahora ? 'ahora' : ''}"><circle cx="${x}" cy="90" r="30"/><text class="pl-num" x="${x}" y="100">${k + 1}</text><text class="pl-cap" x="${x}" y="150">${n}</text></g>`; }); }
  else if (v === 'mapa') { s = '<path class="pl-ruta" d="M30 160 C 90 160, 90 90, 150 100 S 230 40, 330 40"/>'; [[30, 160], [150, 100], [240, 62], [330, 40]].forEach(([x, y], k) => { s += `<circle class="pl-hito" cx="${x}" cy="${y}" r="10" style="--k:${k}"/>`; }); s += '<circle class="pl-viajero" r="7"><animateMotion dur="4s" repeatCount="indefinite" path="M30 160 C 90 160, 90 90, 150 100 S 230 40, 330 40"/></circle>'; }
  else if (v === 'saberes') { [['Escalas', 40, 120], ['Arpegios', 130, 90], ['Armonía', 220, 120], ['Teoría', 85, 40], ['Técnica', 190, 40]].forEach(([n, x, y], k) => { s += `<g class="pl-saber" style="--k:${k}"><rect x="${x}" y="${y}" width="100" height="40" rx="12"/><text x="${x + 50}" y="${y + 26}">${n}</text></g>`; }); }
  else if (v === 'logo') s = `<g class="pl-logo">${LOGO.replace('<svg ', '<svg x="40" y="62" width="280" height="64" ')}</g>` + [150, 160, 170].map((y, k) => `<path class="pl-cuerda fina" style="--k:${k}" d="M40 ${y} Q180 ${y} 320 ${y}"><animate attributeName="d" dur="${1.8 + k * .3}s" repeatCount="indefinite" values="M40 ${y} Q180 ${y} 320 ${y};M40 ${y} Q180 ${y + 8} 320 ${y};M40 ${y} Q180 ${y} 320 ${y}"/></path>`).join('');
  else if (v === 'cana') s = '<path class="pl-cana" d="M60 170 L230 40"/><path class="pl-sedal" d="M230 40 Q 262 60 262 120"/><g class="pl-pez"><path d="M262 132 q20 -14 40 0 q-20 14 -40 0z"/><path d="M302 132 l12 -9 v18z"/><circle cx="270" cy="129" r="2.5"/></g><circle class="pl-reel" cx="88" cy="150" r="10"/>';
  else if (v === 'regalo') s = '<g class="pl-regalo"><rect x="130" y="90" width="100" height="80" rx="10"/><rect class="tapa" x="122" y="72" width="116" height="26" rx="8"/><rect class="cinta" x="174" y="72" width="12" height="98"/><path class="moño" d="M180 72 c-20 -26 -40 -6 -14 0 M180 72 c20 -26 40 -6 14 0"/></g>' + [0, 1, 2, 3, 4].map(k => `<circle class="pl-brillo" cx="${120 + k * 30}" cy="40" r="3" style="--k:${k}"/>`).join('');
  else if (v === 'testimonios') { [[90, 'I'], [180, 'M'], [270, '+']].forEach(([x, l], k) => { s += `<g class="pl-avatar" style="--k:${k}"><circle cx="${x}" cy="90" r="36"/><text x="${x}" y="102">${l}</text></g>`; }); s += '<text class="pl-cap" x="180" y="170">en tu misma situación</text>'; }
  else if (v === 'video') s = '<rect class="pl-pantallita" x="80" y="36" width="200" height="120" rx="16"/><circle class="pl-disco" cx="180" cy="96" r="30"/><path fill="#fff" d="M172 82 v28 l24 -14z"/>';
  else if (v === 'reloj') s = '<circle class="pl-esfera" cx="120" cy="100" r="52"/><line class="pl-aguja-r" x1="120" y1="100" x2="120" y2="62"/><path class="pl-flecha-r" d="M190 100 H250 m-12 -10 l12 10 l-12 10"/><path class="pl-sube" d="M270 150 l20 -30 l16 14 l24 -50"/>';
  else if (v === 'relax') s = '<rect class="pl-mochila" x="140" y="60" width="80" height="90" rx="16"/><path class="pl-tacha" d="M120 160 L240 50"/><text class="pl-cap" x="180" y="190">nada que preparar</text>';
  else if (v === 'final') { for (let k = 0; k < 18; k++) s += `<rect class="pl-confeti" x="${20 + (k * 37) % 320}" y="-10" width="7" height="12" rx="2" style="--k:${k};--r:${(k * 47) % 360}deg"/>`; }
  return `<svg class="pl-vis" viewBox="0 0 ${W} ${H}" aria-hidden="true">${s}</svg>`;
}
const presEst = { i: (() => { try { return Math.max(0, +localStorage.getItem('mapaAE_llamada_pres') || 0); } catch (e) { return 0; } })(), visto: false, timer: null };
const guardarPres = () => { try { localStorage.setItem('mapaAE_llamada_pres', String(presEst.i)); } catch (e) {} reportarLlamada(); };
/* Quién es el que entró al link de la llamada (nombre y apellido), y su avance para el panel */
let QUIEN = esLlamada ? leerLocal('mapaAE_llamada_quien') : null;
let timerLlamada = null;
function reportarLlamada() {
  if (!esLlamada || !QUIEN) return;
  clearTimeout(timerLlamada);
  timerLlamada = setTimeout(() => {
    const enAula = modo === 'admin-prueba';
    llamar('llamada.guardar', { id: QUIEN.id, nombre: QUIEN.nombre, pres: enAula ? PRES_LLAMADA.length : presEst.i + (presEst.visto ? 1 : 0),
      presTotal: PRES_LLAMADA.length, paso: enAula ? (abierto || 'aula') : '', prog: enAula && ST ? ST.prog : (leerLocal(clavePrueba()) || {}).prog || {} }).catch(() => {});
  }, 1200);
}
function pedirNombreLlamada(luego) {
  modo = 'llamada';
  app().innerHTML = `<main class="llamada-full"><div class="pl-pantalla ll-nombre">
    <div class="ll-logo">${LOGO}</div>
    <form class="ll-form" novalidate>
      <h1>¿Cómo te llamás?</h1>
      <p>Tu nombre y apellido, así sé que sos vos 😉</p>
      <label><span>Nombre</span><input name="nombre" autocomplete="given-name" autocapitalize="words" required></label>
      <label><span>Apellido</span><input name="apellido" autocomplete="family-name" autocapitalize="words" required></label>
      <p class="ll-error" role="alert"></p>
      <button class="pl-entrenar" type="submit">Seguir →</button>
    </form><span></span></div></main>`;
  const f = app().querySelector('form');
  f.onsubmit = ev => {
    ev.preventDefault();
    const n = f.nombre.value.trim().replace(/\s+/g, ' '), a = f.apellido.value.trim().replace(/\s+/g, ' ');
    if (n.length < 2 || a.length < 2) { f.querySelector('.ll-error').textContent = 'Poné tu nombre y tu apellido.'; (n.length < 2 ? f.nombre : f.apellido).focus(); return; }
    const cap = t => t.replace(/(^|\s)(\p{L})/gu, (m, e, l) => e + l.toUpperCase());
    QUIEN = { id: Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 8), nombre: cap(n) + ' ' + cap(a) };
    guardarLocal('mapaAE_llamada_quien', QUIEN);
    try { const st = JSON.parse(localStorage.getItem(clavePrueba()) || 'null'); if (st) { st.nombre = QUIEN.nombre; localStorage.setItem(clavePrueba(), JSON.stringify(st)); } } catch (e) {}
    reportarLlamada(); luego();
  };
  setTimeout(() => f.nombre.focus(), 300);
}
const presUrl = i => `audio/llamada/${String(i + 1).padStart(2, '0')}.m4a?v=5`;
const presAudio = new Audio(); presAudio.preload = 'auto'; presAudio.defaultPlaybackRate = 1; presAudio.preservesPitch = true;
function presHTML() {
  const i = presEst.i, sl = PRES_LLAMADA[i], sonando = !!presEst.timer, fin = i === PRES_LLAMADA.length - 1;
  return `<div class="pl-escena" key="${i}">
      ${presVis(sl.v, sl.paso)}
      <p class="pl-frase">${sl.t.split('\n').map(l => esc(l).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')).join('<br>')}</p>
    </div>
    <div class="pl-progreso">${PRES_LLAMADA.map((_, k) => `<i class="${k < i ? 'hecho' : k === i ? 'ahora' : ''}"></i>`).join('')}</div>
    ${presEst.visto && fin && !sonando ? `<div class="pl-ctrl"><button class="pl-entrenar" data-ll-entrar>Empezar con el entrenamiento →</button></div>`
    : presEst.visto ? `<div class="pl-ctrl">
      <button class="pl-b" data-pl="ant" ${i === 0 ? 'disabled' : ''} aria-label="Anterior">‹</button>
      <button class="pl-b grande" data-pl="play">${sonando ? 'Pausa' : 'Seguir'}</button>
      <button class="pl-b" data-pl="sig" aria-label="Siguiente">›</button>
    </div>` : `<button class="pl-play" data-pl="play" aria-label="Reproducir"><span><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg></span><b>Reproducir</b></button>`}`;
}
function presAccion(acc) {
  const caja = document.querySelector('.pl-pantalla'); if (!caja) return;
  const pintar = () => { caja.innerHTML = presHTML(); };
  const parar = () => { clearTimeout(presEst.timer); presEst.timer = null; presAudio.onended = presAudio.onerror = null; presAudio.pause(); };
  const espera = () => Math.min(5000, Math.max(1800, 900 + PRES_LLAMADA[presEst.i].t.length * 40));
  const sonar = luego => {
    const despues = ms => { if (luego && presEst.timer) presEst.timer = setTimeout(luego, ms); };
    const u = new URL(presUrl(presEst.i), location.href).href; if (presAudio.src !== u) presAudio.src = u; else presAudio.currentTime = 0; presAudio.playbackRate = 1;
    if (luego) { presAudio.onended = () => despues(60); presAudio.onerror = () => despues(espera()); }
    presAudio.play().catch(() => despues(espera()));
  };
  if (acc === 'sig' || acc === 'ant') { parar(); presEst.i = Math.max(0, Math.min(PRES_LLAMADA.length - 1, presEst.i + (acc === 'sig' ? 1 : -1))); guardarPres(); pintar(); sonar(); return; }
  if (presEst.timer) { parar(); pintar(); return; }
  presEst.visto = true; if (presEst.i >= PRES_LLAMADA.length - 1) presEst.i = 0;
  const paso = () => { if (presEst.i >= PRES_LLAMADA.length - 1) { parar(); pintar(); return; } presEst.i++; guardarPres(); pintar(); sonar(paso); };
  presEst.timer = -1; pintar(); sonar(paso);
}
function renderLlamada() {
  modo = 'llamada'; nav('?llamada');
  const yt = (id, cls = '') => id ? `<div class="ll-video ${cls}"><iframe src="https://www.youtube-nocookie.com/embed/${esc(id)}?rel=0&playsinline=1" title="Video" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe></div>` : '';
  const [t1, t2] = LLAMADA.testimonios || [];
  const testimonio = t => t && t.id ? `<section class="ll-bloque"><p class="ll-eti">Testimonio</p><h2>${esc(t.titulo || `La experiencia de ${t.nombre}`)}</h2>${yt(t.id)}</section>` : '';
  app().innerHTML = `<main class="llamada-full"><div class="pl-pantalla">${presHTML()}</div></main>`;
  // que arranque al toque en el celu: el primer audio ya cargado y el resto bajando de fondo
  presAudio.src = presUrl(presEst.i); presAudio.load();
  setTimeout(() => PRES_LLAMADA.forEach((_, k) => { if (k) fetch(presUrl(k)).catch(() => {}); }), 800);
  app().onclick = ev => {
    const b = ev.target.closest('[data-pl]'); if (b) { presAccion(b.dataset.pl); return; }
    if (ev.target.closest('[data-ll-entrar]')) { presAudio.pause(); clearTimeout(presEst.timer); presEst.timer = null; DESTINO = { prueba: true }; nav('?llamada&aula'); aplicarDestino(); window.scrollTo(0, 0); }
  };
  window.scrollTo(0, 0);
}

/* Link único para alumnos nuevos: se registran solos (nombre, email y contraseña) y arrancan con el módulo 0 */
function renderRegistro(codigo, error, val = {}) {
  app().innerHTML = `${barra('')}
  <main class="entrada">
    <h1>Bienvenido al aula de Ajuste Elástico!</h1>
    <p class="suave">Poné tu nombre, tu mail y elegí una contraseña. Con eso entrás siempre de acá en adelante</p>
    <form id="formRegistro" novalidate>
      <label for="r-nombre">Nombre y apellido</label>
      <input id="r-nombre" name="nombre" autocomplete="name" required value="${esc(val.nombre || '')}">
      <label for="r-email">Email</label>
      <input id="r-email" name="email" type="email" autocomplete="username" autocapitalize="off" spellcheck="false" required value="${esc(val.email || '')}">
      <label for="r-c1">Contraseña <span class="suave">(al menos 6 caracteres)</span></label>
      <input id="r-c1" name="c1" type="password" autocomplete="new-password" required minlength="6">
      <label for="r-c2">Repetila</label>
      <input id="r-c2" name="c2" type="password" autocomplete="new-password" required>
      ${error ? `<p class="error" role="alert">${esc(error)}</p>` : ''}
      <button class="primario" type="submit">Crear mi cuenta y entrar</button>
    </form>
    <p class="suave chico">¿Ya tenés cuenta? <button class="link suave" data-ya-tengo="1">Entrá acá</button></p>
  </main>`;
  app().onclick = ev => { if (ev.target.closest('[data-ya-tengo]')) { nav(location.pathname); renderEntrada(); } };
  const f = $('#formRegistro');
  f.onsubmit = async ev => {
    ev.preventDefault();
    const v = { nombre: f.nombre.value.trim(), email: f.email.value.trim().toLowerCase() };
    if (v.nombre.length < 2) return renderRegistro(codigo, 'Escribí tu nombre y apellido.', v);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) return renderRegistro(codigo, 'Revisá el email: parece que tiene un error.', v);
    if (f.c1.value.length < 6) return renderRegistro(codigo, 'La contraseña tiene que tener al menos 6 caracteres.', v);
    if (f.c1.value !== f.c2.value) return renderRegistro(codigo, 'Las dos contraseñas no son iguales.', v);
    const btn = f.querySelector('button[type=submit]'); btn.disabled = true; btn.textContent = 'Creando tu cuenta…';
    try { const r = await llamar('auth.registrar', { registro: codigo, nombre: v.nombre, email: v.email, clave: f.c1.value }); guardarToken(r.token); nav(location.pathname); abrirMapa(r.alumno); }
    catch (e) { renderRegistro(codigo, e.message, v); }
  };
}

/* Link de invitación: el alumno elige su contraseña (también sirve para recuperarla) */
async function renderInvitacion(token, error) {
  let info;
  try { info = await llamar('auth.invitacion', { invitacion: token }); }
  catch (e) { nav(location.pathname); renderEntrada(e.message); return; }
  app().innerHTML = `${barra('')}
  <main class="entrada">
    <h1>Hola, ${esc((info.nombre || '').split(' ')[0])}</h1>
    <p class="suave">Elegí una contraseña para entrar a tu mapa. Tu usuario es tu email: <strong>${esc(info.email || '')}</strong>.</p>
    <form id="formClaveNueva" novalidate>
      <input type="email" name="email" value="${esc(info.email || '')}" autocomplete="username" hidden>
      <label for="c1">Contraseña <span class="suave">(al menos 6 caracteres)</span></label>
      <input id="c1" name="c1" type="password" autocomplete="new-password" required minlength="6">
      <label for="c2">Repetila</label>
      <input id="c2" name="c2" type="password" autocomplete="new-password" required>
      ${error ? `<p class="error" role="alert">${esc(error)}</p>` : ''}
      <button class="primario" type="submit">Guardar y entrar</button>
    </form>
  </main>`;
  app().onclick = null;
  const f = $('#formClaveNueva');
  f.onsubmit = async ev => {
    ev.preventDefault();
    if (f.c1.value.length < 6) return renderInvitacion(token, 'La contraseña tiene que tener al menos 6 caracteres.');
    if (f.c1.value !== f.c2.value) return renderInvitacion(token, 'Las dos contraseñas no son iguales.');
    const btn = f.querySelector('button'); btn.disabled = true; btn.textContent = 'Guardando…';
    try { const r = await llamar('auth.crearClave', { invitacion: token, clave: f.c1.value }); guardarToken(r.token); abrirMapa(r.alumno); }
    catch (e) { renderInvitacion(token, e.message); }
  };
}

function abrirMapa(alumno) {
  document.title = 'Aula de Ajuste Elástico';
  ST = alumno; modo = 'alumno'; abierto = null;
  if (TOKEN && !BASE) BASE = clonar(alumno);
  if (TOKEN) guardarLocal('mapaAE_alumno', { token: TOKEN, alumno, base: BASE });
  nav(location.pathname);
  renderAlumno(true);
  volverDondeEstaba();
  setTimeout(quizasCelebrar, 400);
  reanudarSubidas();   // si quedó un video a medio mandar, sigue solo
}
async function entrarConSesion() {
  const copia = leerLocal('mapaAE_alumno');
  const conCopia = copia && copia.token === TOKEN && copia.alumno;
  if (conCopia) { BASE = copia.base || null; abrirMapa(copia.alumno); }   // al instante, con lo último guardado
  try {
    const { alumno } = await llamar('alumno.get', { token: TOKEN });
    if (!conCopia) { BASE = clonar(alumno); abrirMapa(alumno); return; }
    if (modo !== 'alumno') return;
    // Llegó lo del servidor (puede traer avances hechos en otro dispositivo): se le suman los cambios de acá que todavía no se guardaron
    const pend = BASE ? difAlumno(BASE, ST) : {};
    BASE = clonar(alumno);
    const nuevo = clonar(alumno);
    ['prog', 'probs'].forEach(k => { if (pend[k + 'Cambios']) nuevo[k] = aplicarPasos(nuevo[k], pend[k + 'Cambios']); });
    ['clase', 'claseFecha', 'standard'].forEach(k => { if (k in pend) nuevo[k] = pend[k]; });
    ST = nuevo; guardarLocal('mapaAE_alumno', { token: TOKEN, alumno: ST, base: BASE });
    renderAlumno();
    if (Object.keys(pend).length) guardarAlumno();
  }
  catch (e) {
    if (conCopia && !/sesión se cerró/.test(e.message)) return;          // sin conexión: se sigue con la copia
    guardarLocal('mapaAE_alumno', null);
    // Solo se borra la sesión si el servidor dice que se cerró; si falló la conexión, se queda guardada
    if (/sesión se cerró/.test(e.message)) { guardarToken(''); renderEntrada(); }
    else renderEntrada('No pude conectarme con el aula. Recargá la página en un ratito: tu sesión sigue guardada.');
  }
}
function salir() {
  if (modo === 'admin') { guardarClaveAdmin(''); LISTA = []; elegido = null; nav(location.pathname); renderEntrada(); return; }
  guardarLocal('mapaAE_alumno', null); BASE = null;
  const t = TOKEN; guardarToken(''); ST = null; nav(location.pathname); renderEntrada();
  if (t) llamar('auth.salir', { token: t }).catch(() => {});
}

/* ---------------- Panel de Andy ---------------- */
let LISTA = [];
let PROPUESTAS = [], BORRADORES = [], LLAMADAS = [];   // lo que salió de las transcripciones de las clases, para aplicar o descartar
let elegido = null;

function pedirClave(error) {
  if (!API_URL) { claveAdmin = 'demo'; abrirAdmin(); return; }
  app().innerHTML = `${barra('')}<main class="entrada"><h1>Panel de Andy</h1>
    <form id="formClave"><label for="clave">Clave</label><input id="clave" type="password" required autocomplete="current-password">
    ${error ? `<p class="error" role="alert">${esc(error)}</p>` : ''}<button class="primario">Entrar</button></form></main>`;
  $('#formClave').onsubmit = ev => {
    ev.preventDefault(); const b = $('#formClave button'); b.disabled = true; b.textContent = 'Entrando…';
    guardarClaveAdmin($('#clave').value); abrirAdmin();
  };
  $('#clave').focus();
}

async function abrirAdmin() {
  modo = 'admin'; document.getElementById('consulta')?.remove();
  const copia = leerLocal('mapaAE_lista');
  if (!PROPUESTAS.length && !BORRADORES.length) { const g = leerLocal('mapaAE_prop') || {}; PROPUESTAS = g.p || []; BORRADORES = g.b || []; LLAMADAS = g.l || []; }
  if (copia && !LISTA.length) { LISTA = copia; if (!aplicarDestino()) renderAdmin(); }        // al instante, con lo último que se vio
  else if (LISTA.length) renderAdmin();
  let nueva;
  try { const r = await llamar('admin.lista', { clave: claveAdmin }); nueva = r.alumnos; PROPUESTAS = r.propuestas || []; BORRADORES = r.borradores || []; LLAMADAS = r.llamadas || []; guardarLocal('mapaAE_prop', { p: PROPUESTAS, b: BORRADORES, l: LLAMADAS }); }
  catch (e) {
    if (/Clave incorrecta/.test(e.message)) { guardarClaveAdmin(''); LISTA = []; pedirClave('Clave incorrecta. Probá de nuevo.'); }
    else if (!LISTA.length) renderEntrada(e.message);
    else aviso('No pude actualizar el panel. Revisá la conexión.', true);
    return;
  }
  nueva.forEach(n => {
    const viejo = LISTA.find(x => x.codigo === n.codigo), base = ORIG[n.codigo];
    const local = viejo && base ? difAlumno(base, viejo) : {};
    ORIG[n.codigo] = clonar(n);
    if (Object.keys(local).length) aplicarLocal(n, clonar(n), local);
  });
  LISTA = nueva; guardarLocal('mapaAE_lista', LISTA);
  if (DESTINO && aplicarDestino()) return;
  if (modo === 'admin-vista' && stIntacto) { const n = LISTA.find(x => x.codigo === ST.codigo); if (n) { ST = clonar(n); renderAlumno(); } return; }
  if (modo !== 'admin') return;
  if (!elegido || elegido === '__nuevo') renderAdmin();
  else if ([...PROPUESTAS, ...BORRADORES].some(p => p.codigo === elegido) && !$('#propAlumno')) renderAdmin();
  else if (!LISTA.some(a => a.codigo === elegido)) { elegido = null; renderAdmin(); }
  else { const r = $('#detResto'); if (r) { r.innerHTML = restoHTML(LISTA.find(a => a.codigo === elegido)); enlazarAdmin(); } }
}

const ORDEN_TIPO = { meterle: 0, bien: 1, adelantado: 2, pausa: 3, m2: 4 };
let videoSel = null;   // 'paso:índice' del video que se está mirando en el panel

function todosLosVideos(a) {
  return Object.entries(a.prog || {}).flatMap(([pid, x]) => (x.videos || []).map((v, i) => ({ pid, v, i }))).filter(x => PASO[x.pid]);
}
function renderAdmin() {
  document.title = 'Admin · Panel de Ajuste Elástico';   // para encontrarlo en Chrome escribiendo «admin» o «panel»
  const sel = elegido && elegido !== '__nuevo' && LISTA.find(a => a.codigo === elegido);
  app().innerHTML = `${barra('Andy')}
  <main class="admin ${sel || elegido === '__nuevo' ? 'admin-una' : ''}">
    ${sel ? alumnoAdmHTML(sel) : elegido === '__nuevo' ? `<button class="link volver-adm" data-adm="volver">← Todos los alumnos</button>${nuevoHTML()}` : inicioAdmHTML()}
  </main>`;
  enlazarAdmin();
  urlAdmin();
}

/* Alumnos por día de clase, en el orden del día. Se reconocen por cómo empieza el nombre (sin tildes),
   así los que todavía no se registraron entran solos cuando lo hagan. Para cambiarlo, editar acá. */
const HORARIO = [
  { id: 'lunes', titulo: 'Lunes', dia: 1, alumnos: ['antonio sanchez', 'francisco arregui', 'fran', 'leonardo belli', 'ger gonzalez', 'juan manuel carrasco'] },
  { id: 'martes', titulo: 'Martes', dia: 2, alumnos: ['ignacio lessa', 'matias otero', 'fito ulrich', "beto d'alessandro", 'luis'] },
  { id: 'jueves', titulo: 'Jueves', dia: 4, alumnos: ['kelbin', 'nestor', 'juan francisco barbaro'] },
];
const INACTIVOS = ['manuel toma', 'rodrigo machuca', 'santiago lopez', 'fernando islas', 'ariel di lorenzo', 'rodrigo escobar'];
function gruposDia(filas) {
  const n = a => sinTildes(a.nombre).replace(/\s+/g, ' ').trim(), es = (a, pat) => n(a) === pat || n(a).startsWith(pat + ' ') || n(a) === pat;
  const usados = new Set(), hoy = new Date().getDay();
  const grupos = HORARIO.map(d => {
    const fs = d.alumnos.flatMap(pat => filas.filter(f => !usados.has(f.a.codigo) && es(f.a, pat))).filter(f => { if (usados.has(f.a.codigo)) return false; usados.add(f.a.codigo); return true; });
    return { id: d.id, titulo: d.titulo, hoy: d.dia === hoy, filas: fs };
  }).filter(g => g.filas.length);
  const inact = filas.filter(f => !usados.has(f.a.codigo) && INACTIVOS.some(pat => es(f.a, pat))); inact.forEach(f => usados.add(f.a.codigo));
  const resto = filas.filter(f => !usados.has(f.a.codigo));
  if (resto.length) grupos.push({ id: 'otros', titulo: 'Sin día todavía', filas: resto });
  if (inact.length) grupos.push({ id: 'inactivos', titulo: 'Inactivos', filas: inact });
  return grupos;
}
/* Inicio del panel: primero los videos para ver, después todos los alumnos */
let buscaAdm = '';
const sinTildes = t => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const PASOS_LL_ADM = [['p2', 'Intervalos'], ['p3', 'A tempo'], ['p3c', 'Cuerdas'], ['p4', 'Skipping'], ['llt1', 'Testimonio Igna'], ['llfin', 'Bienvenida'], ['llt2', 'Testimonio Manu']];
function tabsAdmHTML() {
  const hoy = hoyISO(), nHoy = LLAMADAS.filter(l => String(l.act).startsWith(hoy)).length;
  return `<div class="tabs-adm" role="tablist">
    <button role="tab" data-vista-adm="alumnos" aria-selected="${vistaAdm === 'alumnos'}">${ICONO_ADM.alumnos}Alumnos</button>
    <button role="tab" data-vista-adm="llamadas" aria-selected="${vistaAdm === 'llamadas'}">${ICONO_ADM.llamada}Llamadas ${nHoy ? `<span class="cuenta">${nHoy} hoy</span>` : `<span class="suave chico">${LLAMADAS.length}</span>`}</button></div>`;
}
function cuandoLl(f) {
  const [d, h] = String(f || '').split('T'); if (!d) return '';
  const n = diasDesde(d);
  return (n === 0 ? 'hoy' : n === 1 ? 'ayer' : n < 7 ? `hace ${n} días` : fechaCorta(d)) + (h && n < 2 ? ' ' + h : '');
}
function filasLlamadasHTML(lista, conBorrar) {
  return lista.map(l => {
    const pr = l.prog || {}, hechos = PASOS_LL_ADM.filter(([id]) => pr[id] && pr[id].hecho).length;
    const pres = +l.pres || 0, presT = +l.presTotal || 0;
    const presTxt = !pres ? 'No arrancó la presentación' : presT && pres >= presT ? 'Vio la presentación' : `Presentación: ${pres} de ${presT || '?'} frases`;
    return `<article class="ll-adm ${hechos === PASOS_LL_ADM.length ? 'completo' : ''}">
      <div class="ll-adm-cab"><strong>${esc(l.nombre)}</strong><span class="suave chico">entró ${esc(cuandoLl(l.inicio))} · último movimiento ${esc(cuandoLl(l.act))}</span>
        ${conBorrar ? `<button class="link suave chico ll-borrar" data-ll-borrar="${esc(l.id)}">Borrar</button>` : ''}</div>
      <p class="ll-adm-pres ${pres && presT && pres >= presT ? 'ok' : ''}">${presTxt}</p>
      <ol class="ll-adm-pasos">${PASOS_LL_ADM.map(([id, t]) => `<li class="${pr[id] && pr[id].hecho ? 'ok' : ''} ${l.paso === id && !(pr[id] && pr[id].hecho) ? 'aca' : ''}"><i>${pr[id] && pr[id].hecho ? ICONO.check : ''}</i><span>${t}</span></li>`).join('')}</ol>
      <p class="suave chico">${hechos} de ${PASOS_LL_ADM.length} pasos${l.paso && l.paso !== 'aula' && !(pr[l.paso] && pr[l.paso].hecho) ? ` · está en «${esc((PASOS_LL_ADM.find(x => x[0] === l.paso) || [, l.paso])[1])}»` : ''}</p>
    </article>`;
  }).join('');
}
function llamadasAdmHTML() {
  const filas = filasLlamadasHTML(LLAMADAS, true);
  return `<div class="lista-cab"><h1>Panel</h1></div>${tabsAdmHTML()}
    <p class="suave">Los que entraron al link de la llamada (${esc(location.origin)}/?llamada) y hasta dónde llegaron. Lo más reciente arriba.</p>
    ${filas ? `<div class="ll-adm-lista">${filas}</div>` : '<p class="suave">Todavía no entró nadie desde que se pide el nombre.</p>'}`;
}
/* Página para Noe (?seguimiento=…): solo el movimiento del link de la llamada, se actualiza sola */
let segTimer = null;
async function renderSeguimiento(codigo) {
  document.title = 'Llamadas · Ajuste Elástico';
  const pintar = (cuerpo) => { app().innerHTML = `${barra('')}<main class="admin seguimiento"><div class="lista-cab"><h1>Llamadas</h1></div>${cuerpo}</main>`; };
  if (!app().querySelector('.seguimiento')) pintar('<p class="suave">Cargando…</p>');
  try {
    const r = await llamar('llamadas.ver', { codigo });
    const lista = r.llamadas || [], hoy = hoyISO(), nHoy = lista.filter(l => String(l.act).startsWith(hoy)).length;
    const filas = filasLlamadasHTML(lista, false);
    pintar(`<p class="suave">Quiénes entraron al link de la llamada y hasta dónde llegaron. Lo más reciente arriba. ${lista.length} en total${nHoy ? `, ${nHoy} con movimiento hoy` : ''}.</p>
      ${filas ? `<div class="ll-adm-lista">${filas}</div>` : '<p class="suave">Todavía no entró nadie.</p>'}`);
  } catch (e) {
    pintar(`<p class="suave">${esc(/Acción desconocida/.test(e.message) ? 'Todavía no está listo. Probá en un rato.' : e.message)}</p>`);
  }
  clearTimeout(segTimer); segTimer = setTimeout(() => { if (document.visibilityState === 'visible') renderSeguimiento(codigo); }, 60000);
}
let propGrande = false;   // «Resúmenes de clase» abierto en grande
function inicioAdmHTML() {
  if (vistaAdm === 'llamadas') return llamadasAdmHTML();
  const filas = LISTA.map(a => ({ a, e: estado(a) })).sort((x, y) => ORDEN_TIPO[x.e.tipo] - ORDEN_TIPO[y.e.tipo] || x.a.nombre.localeCompare(y.a.nombre));
  const nuevos = LISTA.flatMap(a => todosLosVideos(a).filter(x => !x.v.visto).map(x => ({ ...x, a })))
    .sort((x, y) => String(y.v.t).localeCompare(String(x.v.t)));
  const grupos = gruposDia(filas), dSel = diaElegido(grupos);
  const nProp = PROPUESTAS.length + BORRADORES.length;
  return `<div class="lista-cab"><h1>Panel</h1><span class="lista-botones">
      <button class="secundario" data-adm="prueba" title="Recorré el aula como un alumno nuevo. No se guarda nada.">Ver como alumno</button>
      <button class="secundario" data-adm="nuevo">Agregar alumno</button></span></div>
    ${tabsAdmHTML()}
    <div class="tablero-adm ${nProp ? '' : 'sin-prop'} ${nuevos.length ? '' : 'sin-videos'}">
      <section class="caja-adm caja-videos">
        <h2>${ICONO_ADM.video}Videos para ver ${nuevos.length ? `<span class="cuenta">${nuevos.length}</span>` : ''}</h2>
        ${nuevos.length ? `<div class="caja-scroll"><div class="tarjetas-video">${nuevos.map(x => `<button class="tarjeta-video" data-abrir-video="${esc(x.a.codigo)}|${x.pid}:${x.i}">
          <span class="tv-mini">${miniDrive(x.v.id)}${ICONO_PLAY}</span>
          <span class="tv-txt"><strong>${esc(x.a.nombre)}</strong><span>${esc(PASO[x.pid].titulo)}</span><small>${haceTanto(x.v.t)}${x.v.seg ? ' · ' + duracion(x.v.seg) : ''}</small></span>
        </button>`).join('')}</div></div>` : `<p class="suave caja-vacia">No hay videos nuevos. Cuando un alumno mande uno desde el aula, aparece acá.</p>`}
      </section>
      <div class="tablero-der">
        <section class="caja-adm caja-link">${registroAdmHTML()}</section>
        ${nProp ? `<section class="caja-adm caja-prop ${propGrande ? 'grande' : ''}"><h2>${ICONO_ADM.clase}Resúmenes de clase <span class="cuenta">${nProp}</span><button class="link suave chico prop-agrandar" data-adm="agrandar-prop">${propGrande ? '✕ Achicar' : 'Agrandar'}</button></h2><div class="caja-scroll">${propuestasHTML(PROPUESTAS, BORRADORES, true)}</div></section>` : ''}
      </div>
    </div>
    <section class="lista">
      <div class="lista-busca"><h2>${ICONO_ADM.alumnos}Alumnos <span class="suave chico">${LISTA.length}</span></h2><input type="search" id="buscaAlumno" placeholder="Buscar por nombre" autocomplete="off" value="${esc(buscaAdm)}" aria-label="Buscar alumno por nombre"></div>
      ${grupos.length ? `<div class="dias-adm" role="tablist">${grupos.map(g => `<button role="tab" class="dia-adm ${g.id === 'inactivos' ? 'inactivo' : ''}" data-dia-adm="${g.id}" aria-selected="${g.id === dSel}">${esc(g.titulo)}<span class="suave chico">${g.filas.length}</span>${g.hoy ? '<span class="cuenta">hoy</span>' : ''}</button>`).join('')}</div>` : ''}
      ${grupos.map(g => `<div class="dia-panel ${g.id === 'inactivos' ? 'inactivos' : ''}" data-dia-panel="${g.id}" ${g.id === dSel || buscaAdm ? '' : 'hidden'}>${buscaAdm ? `<h3 class="dia-tit">${esc(g.titulo)}</h3>` : ''}<div class="alumnos-grid">${g.filas.map(({ a, e }) => {
          const nprob = Object.values(a.prog || {}).filter(x => x.hecho && x.como === 'cuesta').length;
          const nvid = videosNuevos(a);
          const ps = PROGRAMA.pasos.filter(p => !p.soloLlamada && !p.opcional), h = ps.filter(p => a.prog[p.id]?.hecho).length;
          return `<button class="alumno-card t-${e.tipo}" data-elegir="${esc(a.codigo)}" data-nombre="${esc(sinTildes(a.nombre))}" ${buscaAdm && !sinTildes(a.nombre).includes(sinTildes(buscaAdm)) ? 'hidden' : ''}>
            <span class="ac-cab"><strong>${esc(a.nombre)}</strong><span class="estado-chip t-${e.tipo}">${etiquetaAdmin(e)}</span></span>
            <span class="ac-datos"><span>${a.clase || 0}/${TOTAL_ENCUENTROS} clases</span><span>Nivel ${a.nivel}</span><span class="suave">${a.act ? haceTanto(a.act) : 'sin movimiento'}</span></span>
            <span class="ac-barra"><i style="width:${ps.length ? Math.round(h / ps.length * 100) : 0}%"></i></span>
            ${a.ajustar || nvid || nprob ? `<span class="ac-marcas">${a.ajustar ? `<span class="marca-ajustar">Nuevo: ajustá nivel y fecha</span>` : ''}${nvid ? `<span class="marca-video">${nvid === 1 ? '1 video nuevo' : nvid + ' videos nuevos'}</span>` : ''}${nprob ? `<span class="marca-prob">Le cuesta${nprob > 1 ? 'n ' + nprob + ' pasos' : ' 1 paso'}</span>` : ''}</span>` : ''}
          </button>`; }).join('')}</div></div>`).join('') || '<p class="suave">Todavía no hay alumnos.</p>'}
    </section>`;
}
/* Qué día de alumnos se ve: el que elegiste, si no hoy, si hoy no hay clases el próximo día que haya */
let diaAdm = null;
function diaElegido(grupos) {
  if (diaAdm && grupos.some(g => g.id === diaAdm)) return diaAdm;
  const dias = HORARIO.filter(d => grupos.some(g => g.id === d.id)), hoy = new Date().getDay();
  for (let i = 0; i < 7; i++) { const d = dias.find(x => x.dia === (hoy + i) % 7); if (d) return d.id; }
  return grupos[0] ? grupos[0].id : null;
}
function marcarModulo(prog, m) {
  const ps = pasosDelModulo(m), todo = ps.every(x => prog[x.id]?.hecho);
  ps.forEach(x => { if (todo) delete prog[x.id]; else if (!prog[x.id]?.hecho) prog[x.id] = { hecho: true, como: 'listo', t: hoyISO() }; });
}
let linkReg = '', modsReg = '0';   // link para alumnos nuevos: primero elegís con qué módulos entra y después se arma
function registroAdmHTML() {
  const msg = linkReg ? `Te paso el link al aula virtual de Ajuste Elástico! Ahí ponés tu nombre, tu mail y elegís una contraseña, y con eso entrás siempre\n\n${linkReg}` : '';
  const mods = m => m.length === 1 ? 'Módulo ' + m : 'Módulos ' + m.split('').join(', ').replace(/, (\d)$/, ' y $1');
  return `<section class="registro-adm">
    <h2>${ICONO_ADM.link}Link para alumnos nuevos</h2>
    ${linkReg ? `<p class="chico reg-para">Entran con: <b>${mods(modsReg)}</b></p>
      <textarea id="msgReg" hidden>${esc(msg)}</textarea>
      <span class="fila-botones"><button class="secundario chico" data-adm="copiar-reg">Copiar mensaje</button><button class="secundario chico" data-adm="copiar-link">Copiar link</button>
      <a class="secundario boton chico" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(msg)}">WhatsApp</a></span>
      <button class="link suave chico" data-adm="nuevo-registro">Cambiar el link</button>`
      : `<p class="suave chico">¿Con qué módulos entra?</p>
      <div class="reg-mods">${MODULOS.map(m => `<label class="reg-mod" style="--c:${m.color}" title="${esc(m.nombre)}"><input type="checkbox" data-reg-mod="${m.n}" ${modsReg.includes(String(m.n)) ? 'checked' : ''}><span>M${m.n}</span></label>`).join('')}</div>
      <button class="secundario chico" data-adm="ver-registro">Armar el link</button>`}
  </section>`;
}
const ICONO_PLAY = '<svg class="tv-play" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="rgba(0,0,0,.55)"/><path d="M10 8v8l6-4z" fill="#fff"/></svg>';
function miniDrive(id) { return String(id).startsWith('demo-') ? '' : `<img src="https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w400" alt="" loading="lazy" onerror="this.remove()">`; }

function haceTanto(f) { const d = diasDesde(f); return d === 0 ? 'hoy' : d === 1 ? 'ayer' : `hace ${d} días`; }

function nuevoHTML() {
  return `<h2>Agregar alumno</h2>
  <form id="formNuevo" class="form-admin">
    <label>Nombre<input name="nombre" required placeholder="Nombre y apellido"></label>
    <label>Email <span class="suave">(con esto entra a su mapa)</span><input name="email" type="email" required placeholder="alumno@email.com"></label>
    <label>Nivel <span class="suave">(el alumno no lo ve)</span>
      <select name="nivel"><option value="1">1: se lo compara con el mínimo</option><option value="2" selected>2: con lo esperado</option><option value="3">3: con lo ideal</option></select></label>
    <label>Fecha de la llamada de bienvenida<input type="date" name="inicio" value="${hoyISO()}"></label>
    <details class="ya-hecho"><summary>¿Ya hizo algo? Marcá lo que tiene hecho <span class="suave">(opcional)</span></summary>
      <p class="suave chico">Lo que marques le aparece hecho en el aula. Los módulos donde marques algo le quedan habilitados.</p>
      ${MODULOS.map(M => { const ps = pasosDelModulo(M.n); if (!ps.length) return '';
        return `<fieldset class="nh-mod" style="--mc:${M.color}"><legend><label class="check"><input type="checkbox" data-nmod="${M.n}"> <strong>${esc(M.titulo)} · ${esc(M.nombre)}</strong> <span class="suave">(todo el módulo)</span></label></legend>
          ${ps.map(p => `<label class="check"><input type="checkbox" name="paso" value="${p.id}" data-nmod-de="${M.n}"> ${esc(p.titulo)}</label>`).join('')}</fieldset>`; }).join('')}
    </details>
    <button class="primario">Crear y generar el link de acceso</button>
  </form>`;
}

/* Página de un alumno: arriba el video para ver (izquierda) y el mensaje de lo que sigue (derecha) */
function alumnoAdmHTML(a) {
  const e = estado(a);
  return `<div class="adm-top"><button class="link volver-adm" data-adm="volver">← Todos los alumnos</button><button class="secundario" data-adm="ver">Ver su aula</button></div>
  <div class="det-cab"><h2>${esc(a.nombre)}</h2><span class="estado-chip t-${e.tipo}">${etiquetaAdmin(e)}</span></div>
  ${a.ajustar ? `<div class="aviso-ajustar"><p><strong>Se registró solo con el link.</strong> Ajustale el nivel y la fecha de la llamada de bienvenida (abajo).</p><button class="secundario" data-adm="ajustado">Ya está</button></div>` : ''}
  <p class="suave">${esc(bajadaEstado(a, e))} ${e.pre ? `Lleva ${e.d} días desde la llamada.` : a.claseFecha ? `Tuvo la clase ${a.clase} ${haceTanto(a.claseFecha)}.` : ''}</p>
  ${(() => { const P = PROPUESTAS.filter(p => p.codigo === a.codigo), B = BORRADORES.filter(c => c.codigo === a.codigo);
    return P.length + B.length ? `<div id="propAlumno">${secAdm('prop-alumno', `${ICONO_ADM.clase}Resúmenes de clase <span class="cuenta">${P.length + B.length}</span>`, propuestasHTML(P, B, false), 'panel-prop')}</div>` : ''; })()}
  ${secAdm('videos', `${ICONO_ADM.video}Videos y mensaje${videosNuevos(a) ? ` <span class="cuenta">${videosNuevos(a)}</span>` : ''}`, `<section class="revision" id="revision">${revisionHTML(a)}</section>`)}
  <div class="det-resto" id="detResto">${restoHTML(a)}</div>`;
}
function videoActual(a) {
  const l = todosLosVideos(a).sort((x, y) => (x.v.visto ? 1 : 0) - (y.v.visto ? 1 : 0) || String(y.v.t).localeCompare(String(x.v.t)));
  return { l, cur: l.find(x => `${x.pid}:${x.i}` === videoSel) || l[0] };
}
function revisionHTML(a) {
  const { l, cur } = videoActual(a);
  if (!cur) return `<div class="rev-vacio"><p class="suave">Todavía no mandó videos desde el aula.</p></div><div class="rev-msg" id="revMsg">${mensajeAdmHTML(a, null)}</div>`;
  const p = PASO[cur.pid], pr = a.prog[cur.pid] || {}, op = opcionElegida(a, p);
  return `<div class="rev-video">
      <div class="rev-cab"><p class="rev-paso"><strong>${esc(p.titulo)}</strong><span class="suave">${fechaCorta(cur.v.t)}${cur.v.seg ? ' · ' + duracion(cur.v.seg) : ''}</span></p>
        ${cur.v.visto ? `<span class="visto">${ICONO.check}Ya lo viste</span>` : `<button class="primario" data-adm="visto">Listo, ya lo vi</button>`}</div>
      <div class="rev-player">${String(cur.v.id).startsWith('demo-') ? '<p class="suave">Video de prueba (modo demo)</p>' : `<iframe src="https://drive.google.com/file/d/${encodeURIComponent(cur.v.id)}/preview" allow="autoplay; fullscreen" allowfullscreen title="Video de ${esc(a.nombre)}"></iframe>`}</div>
      <p class="suave chico">Si dice que se está procesando, esperá un par de minutos: Drive tarda un poco con los videos recién subidos.</p>
      <div class="rev-info">
        ${p.envia ? `<p><span class="suave">Le pediste:</span> ${esc(p.envia)}</p>` : ''}
        ${op && !p.sinProgreso ? `<p><span class="suave">Cómo le fue:</span> ${esc(op.label)}</p>` : ''}
        <p><a class="link" href="https://drive.google.com/file/d/${encodeURIComponent(cur.v.id)}/view" target="_blank" rel="noopener">Abrir en Drive</a></p>
      </div>
      ${l.length > 1 ? `<div class="rev-otros"><h4>Sus videos</h4><div>${l.map(x => `<button class="chip-video ${x === cur ? 'sel' : ''} ${x.v.visto ? '' : 'nuevo'}" data-video-sel="${x.pid}:${x.i}">${esc(PASO[x.pid].titulo)} <small>${fechaCorta(x.v.t)}${x.v.visto ? '' : ' · nuevo'}</small></button>`).join('')}</div></div>` : ''}
    </div>
    <div class="rev-msg" id="revMsg">${mensajeAdmHTML(a, cur.pid)}</div>`;
}
function mensajeAdmHTML(a, pasoVideo) {
  const msg = mensajeWhatsApp(a, linkMapa(), pasoVideo);
  return `<div class="mensaje">
    <div class="mensaje-cab"><h3>Mensaje para ${esc(a.nombre.split(' ')[0])}</h3>
      <span><button class="secundario" data-adm="copiar">Copiar</button>
      <a class="secundario boton" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(msg)}" data-wa>WhatsApp</a></span></div>
    <textarea id="msg" rows="12">${esc(msg)}</textarea>
    <p class="suave chico">${pasoVideo ? 'Escribí tu devolución en el espacio de arriba. Abajo va' : 'Va'} solo el paso que sigue según su nivel (o la próxima tarea personalizada).</p>
  </div>`;
}
/* Secciones del panel de cada alumno: cerradas hasta que las abrís; se acuerda cuáles abriste */
const admAbiertas = new Set(['propuestas', 'prop-alumno', 'videos-ver', 'clases', 'otros', 'dia-otros', ...HORARIO.filter(d => d.dia === new Date().getDay()).map(d => 'dia-' + d.id)]);
function secAdm(id, titulo, contenido, cls = '') {
  return `<details class="sec-adm ${cls}" data-sec="${id}" ${admAbiertas.has(id) ? 'open' : ''}><summary><span>${titulo}</span></summary><div class="sec-cuerpo">${contenido}</div></details>`;
}
/* Propuestas que salen de las transcripciones de Tactiq: nada se aplica solo */
const TIPO_PROP = { clase: ['Clase', 'Sumar'], consejo: ['Consejo para el aula', 'Lo vemos'] };
// un resumen de clase listo para publicar en el aula del alumno
function borradorHTML(c, conNombre) {
  const t = c.datos || {};
  const quien = c.codigo ? (conNombre ? `<button class="enlace" data-elegir="${esc(c.codigo)}" data-nombre="${esc(sinTildes(c.nombre))}">${esc(c.nombre)}</button>` : '')
    : `<select data-clase-de="${esc(c.id)}" aria-label="¿De quién es esta clase?"><option value="">¿De quién es? (${esc(c.nombre)})</option>${LISTA.map(a => `<option value="${esc(a.codigo)}">${esc(a.nombre)}</option>`).join('')}</select>`;
  return `<div class="prop-grupo">
    <div class="prop-cab">${quien}<span class="suave chico">clase del ${esc(fechaCorta(c.fecha))}${c.original && c.original !== c.resumen ? ' · editado' : ''}</span></div>
    <ul class="prop-lista">${(t.tareas || []).map(x => `<li class="prop"><div class="prop-txt"><span class="prop-tipo">${x.paso && PASO[x.paso] ? 'Botón al paso · ' + esc(PASO[x.paso].titulo) : ''}</span><span>${esc(x.texto.replace(/\*\*/g, ''))}</span></div></li>`).join('')}
      ${(t.pasos || []).length ? `<li class="prop"><div class="prop-txt"><span class="prop-tipo">Le ofrece marcar como hechos</span><span>${t.pasos.filter(id => PASO[id]).map(id => esc(PASO[id].titulo)).join(' · ')}</span></div></li>` : ''}</ul>
    <details class="prop-resumen"><summary>Ver el resumen</summary><div class="cl-texto">${textoHTML(c.resumen)}</div></details>
    <div class="fila-botones"><button class="secundario" data-editar-borrador="${esc(c.id)}">Editar</button><button class="secundario prop-si" data-publicar="${esc(c.id)}">Publicar en su aula</button><button class="secundario" data-no-publicar="${esc(c.id)}">No publicar</button></div>
  </div>`;
}
function propuestasHTML(lista, borradores, conNombre) {
  const grupos = {};
  lista.forEach(p => { const k = p.codigo || p.nombre; (grupos[k] = grupos[k] || []).push(p); });
  return `<div class="prop-grupos">${borradores.map(c => borradorHTML(c, conNombre)).join('')}${Object.values(grupos).map(g => `<div class="prop-grupo">
    ${conNombre ? `<div class="prop-cab">${g[0].codigo ? `<button class="enlace" data-elegir="${esc(g[0].codigo)}" data-nombre="${esc(sinTildes(g[0].nombre))}">${esc(g[0].nombre)}</button>` : `<strong>${esc(g[0].nombre)}</strong>`}
      <span class="suave chico">clase del ${esc(fechaCorta(g[0].fecha))}</span></div>` : ''}
    <ul class="prop-lista">${g.map(p => { const t = TIPO_PROP[p.tipo] || [p.tipo, 'Aplicar'];
      return `<li class="prop prop-${esc(p.tipo)}"><div class="prop-txt"><span class="prop-tipo">${t[0]}${p.paso && PASO[p.paso] ? ' · ' + esc(PASO[p.paso].titulo) : ''}</span>
        <span>${esc(p.tipo === 'clase' ? 'Sumar esta clase al contador' : p.texto)}</span>${p.detalle ? `<small class="suave">${p.tipo === 'consejo' ? 'Cuándo: ' : ''}${esc(p.detalle)}</small>` : ''}</div>
        <span class="prop-bot">${p.codigo || p.tipo === 'consejo' ? `<button class="secundario prop-si" data-prop="${esc(p.id)}" data-decision="${p.tipo === 'consejo' ? 'consejo' : 'aplicar'}">${t[1]}</button>` : ''}<button class="secundario" data-prop="${esc(p.id)}" data-decision="descartar" title="Descartar" aria-label="Descartar">✕</button></span></li>`; }).join('')}</ul>
  </div>`).join('')}</div>
  <p class="suave chico">Sale de los resúmenes de las clases. Si querés cambiar algo, tocá «Editar» y después publicalo: se publica lo editado (también queda en el Doc). Los consejos no van solos al aula: los que marcás con «Lo vemos» me los pasás y vemos dónde sumarlos.</p>`;
}
/* Editor del resumen de una clase (borrador o ya publicado). Se puede dictar con el micrófono del teclado. */
function editarResumen(id, texto, alGuardar) {
  document.querySelector('.ed-res')?.remove();
  document.body.insertAdjacentHTML('beforeend', `<div class="ed-res" role="dialog" aria-modal="true" aria-label="Editar resumen">
    <div class="ed-caja">
      <div class="ed-cab"><h3>Editar resumen</h3><button class="secundario" data-ed="cerrar" aria-label="Cerrar">✕</button></div>
      <textarea id="edResumen" spellcheck="true">${esc(texto || '')}</textarea>
      <p class="suave chico"><b># </b>al principio del renglón = título · <b>**así**</b> = negrita · tareas con 1) 2) 3). Al guardar se actualiza el Doc y se vuelven a armar las tareas del aula.</p>
      <div class="fila-botones"><button class="primario" data-ed="guardar">Guardar</button><button class="secundario" data-ed="cerrar">Cancelar</button></div>
    </div></div>`);
  const el = document.querySelector('.ed-res'), ta = el.querySelector('textarea');
  document.body.classList.add('con-mapa');
  const cerrar = () => { el.remove(); if (!document.querySelector('.mapa-zoom')) document.body.classList.remove('con-mapa'); };
  el.onclick = async ev => {
    const b = ev.target.closest('[data-ed]'); if (!b) return;
    if (b.dataset.ed === 'cerrar') { if (ta.value !== (texto || '') && !b.dataset.seguro) { b.dataset.seguro = '1'; b.textContent = '¿Salir sin guardar?'; return; } cerrar(); return; }
    if (ta.value === (texto || '')) { cerrar(); return; }
    // se cierra enseguida y se guarda de fondo; si falla, se vuelve a abrir con lo que escribiste
    const txt = ta.value; cerrar(); aviso('Guardando…');
    try { const r = await llamar('admin.claseEditar', { clave: claveAdmin, id, resumen: txt }); alGuardar(r.clase); aviso('Resumen guardado'); }
    catch (e) {
      aviso('No se guardó: ' + e.message, true);
      editarResumen(id, texto, alGuardar);
      const ta2 = document.querySelector('#edResumen'); if (ta2) ta2.value = txt;
    }
  };
  ta.focus();
}
async function resolverBorrador(id, decision, b) {
  const c = BORRADORES.find(x => x.id === id); if (!c) return;
  const g = b.closest('.prop-grupo'), sel = g && g.querySelector('[data-clase-de]');
  const codigo = c.codigo || (sel && sel.value) || '';
  if (decision === 'publicar' && !codigo) { aviso('Elegí de quién es esta clase', true); return; }
  g.classList.add('prop-yendo'); b.textContent = decision === 'publicar' ? 'Publicando…' : '…';
  try {
    const r = await llamar('admin.clase', { clave: claveAdmin, id, decision, codigo: c.codigo ? '' : codigo });
    BORRADORES = BORRADORES.filter(x => x.id !== id); guardarLocal('mapaAE_prop', { p: PROPUESTAS, b: BORRADORES });
    if (r.clase) { const a = LISTA.find(x => x.codigo === r.clase.codigo); if (a) { delete r.clase.codigo; a.clases = [r.clase, ...(a.clases || []).filter(x => x.id !== r.clase.id)].sort((x, y) => String(y.fecha).localeCompare(String(x.fecha))); } }
    renderAdmin();
    if (decision === 'publicar') aviso({ enviado: 'Publicado y le llegó por mail', 'no quiere': 'Publicado (no quiere el mail)', 'sin email': 'Publicado (no tiene email cargado)', error: 'Publicado, pero el mail no salió' }[r.mail] || 'Publicado en su aula');
  } catch (e) { g.classList.remove('prop-yendo'); aviso(e.message, true); }
}
async function resolverProp(id, decision, b) {
  const p = PROPUESTAS.find(x => x.id === id); if (!p) return;
  const li = b && b.closest('li'); if (li) li.classList.add('prop-yendo');
  try {
    const r = await llamar('admin.propuesta', { clave: claveAdmin, id, decision });
    PROPUESTAS = PROPUESTAS.filter(x => x.id !== id); guardarLocal('mapaAE_prop', { p: PROPUESTAS, b: BORRADORES });
    if (r.alumno) { const i = LISTA.findIndex(x => x.codigo === r.alumno.codigo); if (i >= 0) { LISTA[i] = r.alumno; ORIG[r.alumno.codigo] = clonar(r.alumno); } }
    return true;
  } catch (e) { if (li) li.classList.remove('prop-yendo'); aviso(e.message, true); return false; }
}
const ICONO_ADM = {
  llamada: '<svg class="ico-adm" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 3.5h3l1.5 4-2 1.3a10 10 0 0 0 5.2 5.2l1.3-2 4 1.5v3a2 2 0 0 1-2 2A15.5 15.5 0 0 1 4.5 5.5a2 2 0 0 1 2-2z"/></svg>',
  clase: '<svg class="ico-adm" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5h16v10H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/></svg>',
  video: '<svg class="ico-adm" viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="5.5" width="13" height="13" rx="3"/><path d="M15.5 10.5l6-3.5v10l-6-3.5z"/></svg>',
  link: '<svg class="ico-adm" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.3 1.3"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.3-1.3"/></svg>',
  alumnos: '<svg class="ico-adm" viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><circle cx="17" cy="9" r="2.6"/><path d="M16 14.6c2.8-.3 5 1.4 5.5 4.4"/></svg>',
};
const TOTAL_ENCUENTROS = 16;
const avModAdm = {};   // qué módulo está mirando en «Clases y avance», por alumno
function restoHTML(a) {
  const e = estado(a);
  const probs = Object.entries(a.probs || {}).flatMap(([pid, l]) => l.map(q => ({ pid, q: (PASO[pid].problemas || []).find(x => x.id === q) })).filter(x => x.q));
  const sepsMod = {};
  // módulo que se muestra en «Clases y avance»: el elegido, o el del próximo paso que le falta
  const mSel = avModAdm[a.codigo] ?? (() => { const f = PROGRAMA.pasos.find(p => !a.prog[p.id]?.hecho && !p.opcional); return f ? MODULO_DE[f.etapa] : 0; })();
  const pasosM = pasosDelModulo(mSel).filter(p => !p.soloLlamada), seps = separadoresPasos(pasosM, mSel);
  const hechos = m => { const ps = pasosDelModulo(m).filter(p => !p.soloLlamada); return [ps.filter(p => a.prog[p.id]?.hecho).length, ps.length]; };
  return `${secAdm('clases', `Clases y avance <span class="suave chico">${a.clase || 0} de ${TOTAL_ENCUENTROS} clases</span>`, `<div class="av-cab">
      <span class="contador" title="Clases que ya tuvo"><button data-clase="${Math.max(0, (a.clase || 0) - 1)}" aria-label="Una clase menos" ${a.clase > 0 ? '' : 'disabled'}>−</button><b>${a.clase || 0}<small> de ${TOTAL_ENCUENTROS} clases</small></b><button data-clase="${Math.min(TOTAL_ENCUENTROS, (a.clase || 0) + 1)}" aria-label="Una clase más" ${(a.clase || 0) < TOTAL_ENCUENTROS ? '' : 'disabled'}>+</button></span>
      <span class="nivel-chip" title="Nivel (el alumno no lo ve)"><button data-nivel="${Math.max(1, a.nivel - 1)}" aria-label="Bajar nivel" ${a.nivel > 1 ? '' : 'disabled'}>‹</button>Nivel ${a.nivel}<button data-nivel="${Math.min(3, a.nivel + 1)}" aria-label="Subir nivel" ${a.nivel < 3 ? '' : 'disabled'}>›</button></span>
    </div>
    <div class="av-tabs" role="tablist">${MODULOS.map(m => { const [h, t] = hechos(m.n); return `<button role="tab" class="av-tab ${m.n === mSel ? 'sel' : ''} ${h === t && t ? 'completo' : ''}" style="--mc:${m.color}" data-av-mod="${m.n}" aria-selected="${m.n === mSel}"><b>M${m.n}</b><small>${h}/${t}</small><i style="--p:${t ? h / t : 0}"></i></button>`; }).join('')}</div>
    <div class="av-lista" style="--mc:${MODULOS[mSel].color}">
      <div class="av-lista-cab"><span>${esc(MODULOS[mSel].nombre)}</span><button class="link suave" data-mod-tilde="${mSel}">${pasosM.every(x => a.prog[x.id]?.hecho) ? 'Desmarcar todo' : 'Marcar todo'}</button></div>
      ${pasosM.map((p, j) => { const pr = a.prog[p.id], ok = !!(pr && pr.hecho), sp = seps[j];
        return `${sp && sp.tit ? `<div class="av-grupo">${esc(sp.tit)}</div>` : sp ? '<div class="av-grupo-linea"></div>' : ''}<button class="av-paso ${ok ? 'ok como-' + (pr.como || 'listo') : ''}" data-adm-tilde="${p.id}" aria-pressed="${ok}"><i aria-hidden="true">${ok ? '✓' : ''}</i><span>${esc(p.titulo)}</span>${ok && pr.envio ? '<em title="Mandó video">🎥</em>' : ''}</button>`; }).join('')}
    </div>
    <details class="av-mas"><summary>Fechas, pausa y mail</summary>
      <div class="aj-fila"><label>Fecha de la última clase<input type="date" data-campo="claseFecha" value="${esc(a.claseFecha || '')}"></label>
      <label>Fecha de la llamada<input type="date" data-campo="inicio" value="${esc(a.inicio || '')}"></label></div>
      <label class="check"><input type="checkbox" data-campo="pausa" ${a.pausa ? 'checked' : ''}> En pausa (sin apuro, por ejemplo si se demora el pago)</label>
      <label class="check"><input type="checkbox" data-campo="sinMail" ${a.sinMail ? 'checked' : ''}> No mandarle el resumen de clase por mail (le llega solo al aula)</label>
    </details>`)}

  ${secAdm('acceso', 'Acceso', accesoHTML(a))}

  ${secAdm('modulos', `Acceso a módulos <span class="suave chico">${MODULOS.filter(m => moduloHabilitado(a, m.n)).map(m => m.n).join(', ')}</span>`, `<div class="modulos-adm">${MODULOS.map(m => { const on = moduloHabilitado(a, m.n); return `<button class="mod-tg ${on ? 'on' : ''}" data-modulo="${m.n}" aria-pressed="${on}">
      <span class="mod-sw" aria-hidden="true"><i></i></span><span><strong>${m.titulo}</strong><small>${m.sub}</small></span></button>`; }).join('')}</div>
    <p class="suave chico">Lo que está apagado no aparece en su aula: ve un candado con «Te lo habilito cuando llegue el momento».</p>`)}

  ${probs.length ? secAdm('probs', `Problemas que marcó <span class="suave chico">${probs.length}</span>`, `<ul class="probs-adm">${probs.map(x => `<li><span class="suave">${esc(PASO[x.pid].titulo)}:</span> ${esc(x.q.q)}</li>`).join('')}</ul>`) : ''}

  <div class="bloque links-adm">
    <button class="secundario" data-adm="ver">Ver su aula</button>
    <button class="link suave" data-adm="borrar">Borrar alumno</button>
  </div>`;
}

const linksRecientes = {};
function accesoHTML(a) {
  const link = linksRecientes[a.codigo];
  const estadoAcceso = a.tieneClave ? `Entra con <strong>${esc(a.email || 'sin email')}</strong> y su contraseña.` : `Todavía no creó su contraseña${a.email ? ` (${esc(a.email)})` : ''}.`;
  const msgInv = link ? `${a.nombre.split(' ')[0]}! Te paso el link para entrar a tu mapa de Ajuste Elástico\n\nAbrilo, elegí una contraseña y listo. Después entrás siempre con tu email y esa contraseña.\n\n${link}` : '';
  return `<div class="acceso">
    <div class="acceso-cab"><span class="suave">${estadoAcceso}</span></div>
    <label class="bloque-email">Email<input type="email" data-campo="email" value="${esc(a.email || '')}"></label>
    ${link ? `<div class="link-inv"><p class="chico">Link para ${a.tieneClave ? 'cambiar la contraseña' : 'crear la contraseña'} (sirve una sola vez):</p>
        <textarea id="msgInv" rows="5">${esc(msgInv)}</textarea>
        <span class="fila-botones"><button class="secundario" data-adm="copiar-inv">Copiar mensaje</button><a class="secundario boton" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(msgInv)}">Abrir en WhatsApp</a></span></div>`
      : `<button class="secundario" data-adm="invitar">${a.tieneClave ? 'Generar link para nueva contraseña' : 'Generar link de acceso'}</button>`}
  </div>`;
}

let timerAdm = null;
function refrescarMensaje(a) { const m = $('#revMsg'); if (m) m.innerHTML = mensajeAdmHTML(a, videoActual(a).cur?.pid || null); }
/* Guardar desde el panel: de a una tanda por vez, y lo que se toque mientras viaja la anterior no se pierde */
async function guardarCambiosAdm(codigo) {
  const a = LISTA.find(x => x.codigo === codigo); if (!a) return;
  const base = ORIG[codigo];
  if (!base) { await llamar('admin.guardar', { clave: claveAdmin, alumno: a }); ORIG[codigo] = clonar(a); return; }
  const enviado = clonar(a);
  const cambios = difAlumno(base, enviado);
  if (!Object.keys(cambios).length) return;
  try {
    const r = await llamar('admin.cambiar', { clave: claveAdmin, codigo, cambios });
    const fresco = r.alumno;
    ORIG[codigo] = clonar(fresco);
    const actual = LISTA.find(x => x.codigo === codigo); if (!actual) return;
    aplicarLocal(actual, fresco, difAlumno(enviado, actual));   // fresco del servidor + lo tocado mientras tanto
  } catch (e) {
    if (!/Acción desconocida/.test(e.message)) throw e;
    await llamar('admin.guardar', { clave: claveAdmin, alumno: a }); ORIG[codigo] = clonar(a);   // servidor viejo
  }
}
function aplicarLocal(destino, fresco, local) {
  const r = clonar(fresco);
  if (!('clases' in r) && destino.clases) r.clases = destino.clases;   // el servidor no las manda al guardar: que no se pierdan
  ['prog', 'probs'].forEach(k => { if (local[k + 'Cambios']) r[k] = aplicarPasos(r[k], local[k + 'Cambios']); delete local[k + 'Cambios']; });
  Object.keys(destino).forEach(k => delete destino[k]);
  Object.assign(destino, r, local);
}
let colaAdm = Promise.resolve();
const pendientesAdm = new Set();
function guardarAdm(a, rerender = true) {
  aviso('Guardando…');
  // Solo se redibuja la parte de abajo: el video y el mensaje que estás escribiendo no se tocan
  if (rerender) { const r = $('#detResto'); if (r) { r.innerHTML = restoHTML(a); enlazarAdmin(); } else renderAdmin(); }
  pendientesAdm.add(a.codigo);
  clearTimeout(timerAdm);
  timerAdm = setTimeout(() => {
    const cods = [...pendientesAdm]; pendientesAdm.clear();
    colaAdm = colaAdm.then(async () => {
      try { for (const c of cods) await guardarCambiosAdm(c); if (!pendientesAdm.size) aviso('Guardado'); guardarLocal('mapaAE_lista', LISTA); }
      catch (e) { aviso('No se pudo guardar: ' + e.message, true); }
    });
  }, 500);
}

function enlazarAdmin() {
  const root = app();
  const a = LISTA.find(x => x.codigo === elegido);
  if (!root._secs) { root._secs = 1; root.addEventListener('toggle', ev => { const d = ev.target; if (d.dataset && d.dataset.sec) d.open ? admAbiertas.add(d.dataset.sec) : admAbiertas.delete(d.dataset.sec); }, true); }
  const bus = $('#buscaAlumno');
  if (bus) bus.oninput = () => { buscaAdm = bus.value; const q = sinTildes(bus.value.trim()); root.querySelectorAll('[data-elegir]').forEach(tr => { tr.hidden = !!q && !tr.dataset.nombre.includes(q); });
    const sel = root.querySelector('[data-dia-adm][aria-selected="true"]')?.dataset.diaAdm;
    root.querySelectorAll('.dia-panel').forEach(g => { const hay = [...g.querySelectorAll('[data-elegir]')].some(x => !x.hidden); g.hidden = q ? !hay : g.dataset.diaPanel !== sel;
      let t = g.querySelector('.dia-tit'); if (q && !t) { t = document.createElement('h3'); t.className = 'dia-tit'; t.textContent = root.querySelector(`[data-dia-adm="${g.dataset.diaPanel}"]`)?.firstChild.textContent || ''; g.prepend(t); } if (!q && t) t.remove(); });
    root.querySelector('.dias-adm')?.classList.toggle('buscando', !!q); };
  root.onclick = async ev => {
    const tr = ev.target.closest('[data-elegir]');
    if (tr) { elegido = tr.dataset.elegir; videoSel = null; renderAdmin(); window.scrollTo(0, 0); return; }
    const wa = ev.target.closest('a[data-wa]');
    if (wa && $('#msg')) { wa.href = 'https://wa.me/?text=' + encodeURIComponent($('#msg').value); return; }
    const b = ev.target.closest('button'); if (!b) return;
    const d = b.dataset;
    if (d.adm === 'prueba') { reiniciarPrueba(); return; }
    if (d.vistaAdm) { vistaAdm = d.vistaAdm; renderAdmin(); return; }
    if (d.diaAdm) { diaAdm = d.diaAdm; buscaAdm = ''; if ($('#buscaAlumno')) $('#buscaAlumno').value = '';
      root.querySelectorAll('[data-dia-adm]').forEach(x => x.setAttribute('aria-selected', x === b));
      root.querySelector('.dias-adm')?.classList.remove('buscando');
      root.querySelectorAll('.dia-panel').forEach(g => { g.hidden = g.dataset.diaPanel !== diaAdm; g.querySelector('.dia-tit')?.remove(); g.querySelectorAll('[data-elegir]').forEach(x => x.hidden = false); }); return; }
    if (d.llBorrar) {
      if (!b.dataset.seguro) { b.dataset.seguro = '1'; b.textContent = '¿Seguro? Tocá de nuevo'; return; }
      b.closest('.ll-adm').classList.add('prop-yendo');
      try { await llamar('admin.llamadaBorrar', { clave: claveAdmin, id: d.llBorrar }); LLAMADAS = LLAMADAS.filter(x => x.id !== d.llBorrar); renderAdmin(); }
      catch (e) { aviso(e.message, true); renderAdmin(); }
      return;
    }
    if (d.prop) { b.disabled = true; if (await resolverProp(d.prop, d.decision, b)) renderAdmin(); else b.disabled = false; return; }
    if (d.publicar) { resolverBorrador(d.publicar, 'publicar', b); return; }
    if (d.noPublicar) { resolverBorrador(d.noPublicar, 'descartar', b); return; }
    if (d.editarBorrador) { const c = BORRADORES.find(x => x.id === d.editarBorrador); if (c) editarResumen(c.id, c.resumen, r => { Object.assign(c, { resumen: r.resumen, datos: r.datos, original: c.original || 'x' }); guardarLocal('mapaAE_prop', { p: PROPUESTAS, b: BORRADORES, l: LLAMADAS }); renderAdmin(); }); return; }
    if (d.abrirVideo) { const [cod, v] = d.abrirVideo.split('|'); elegido = cod; videoSel = v; renderAdmin(); window.scrollTo(0, 0); return; }
    if (d.videoSel && a) { videoSel = d.videoSel; $('#revision').innerHTML = revisionHTML(a); return; }
    if (d.adm === 'volver') { elegido = null; videoSel = null; renderAdmin(); window.scrollTo(0, 0); return; }
    if (d.adm === 'actualizar') { b.textContent = 'Actualizando…'; abrirAdmin(); return; }
    if (d.adm === 'visto' && a) {
      const { cur } = videoActual(a); if (!cur) return;
      cur.v.visto = true;
      const sig = todosLosVideos(a).find(x => !x.v.visto);
      if (sig) videoSel = `${sig.pid}:${sig.i}`; else videoSel = `${cur.pid}:${cur.i}`;
      $('#revision').innerHTML = revisionHTML(a);
      guardarAdm(a, false); return;
    }
    if (d.adm === 'nuevo') { elegido = '__nuevo'; renderAdmin(); }
    else if (d.adm === 'copiar') copiar($('#msg').value, b, 'Copiado');
    else if (d.adm === 'copiar-inv') copiar($('#msgInv').value, b, 'Copiado');
    else if (d.adm === 'copiar-reg') copiar($('#msgReg').value, b, 'Copiado');
    else if (d.adm === 'copiar-link') copiar(linkReg, b, 'Copiado');
    else if (d.adm === 'agrandar-prop') { propGrande = !propGrande; renderAdmin(); }
    else if (d.adm === 'ver-registro' || d.adm === 'nuevo-registro') {
      if (d.adm === 'nuevo-registro' && !b.dataset.seguro) { b.dataset.seguro = '1'; b.textContent = 'Tocá de nuevo: el link de ahora deja de andar'; return; }
      b.disabled = true; b.textContent = 'Un momento…';
      const mods = [...document.querySelectorAll('[data-reg-mod]')].filter(x => x.checked).map(x => x.dataset.regMod).join('');
      if (!mods) { aviso('Elegí al menos un módulo.', true); b.disabled = false; b.textContent = 'Armar el link'; return; }
      try { const r = await llamar('admin.registro', { clave: claveAdmin, nuevo: d.adm === 'nuevo-registro', mods });
        if (mods !== '0' && r.mods !== mods) throw new Error('Para elegir los módulos del link falta actualizar el servidor en Apps Script.');
        modsReg = mods; linkReg = linkRegistro(r.registro); renderAdmin(); if (d.adm === 'nuevo-registro') aviso('Listo: link nuevo. El anterior ya no funciona.'); }
      catch (e) { aviso(/Acción desconocida/.test(e.message) ? 'Falta actualizar el servidor en Apps Script.' : e.message, true); b.disabled = false; b.textContent = 'Armar el link'; }
    }
    else if (d.adm === 'ajustado' && a) { a.ajustar = ''; guardarAdm(a); $('.aviso-ajustar')?.remove(); }
    else if (d.adm === 'invitar') {
      try { const r = await llamar('admin.invitar', { clave: claveAdmin, codigo: a.codigo }); linksRecientes[a.codigo] = linkInvitacion(r.invitacion); a.invitacionPendiente = true; renderAdmin(); }
      catch (e) { aviso(e.message, true); }
    }
    else if (d.adm === 'ver') { ST = JSON.parse(JSON.stringify(a)); stIntacto = true; modo = 'admin-vista'; abierto = null; renderAlumno(true); window.scrollTo(0, 0); }
    else if (d.adm === 'borrar') {
      if (b.dataset.seguro) { await llamar('admin.borrar', { clave: claveAdmin, codigo: a.codigo }); LISTA = LISTA.filter(x => x !== a); elegido = null; videoSel = null; renderAdmin(); }
      else { b.dataset.seguro = '1'; b.textContent = 'Tocá de nuevo para borrar'; }
    }
    else if (d.nivel) { a.nivel = +d.nivel; guardarAdm(a); }
    else if (d.modulo !== undefined) {
      const hab = new Set(MODULOS.filter(m => moduloHabilitado(a, m.n)).map(m => m.n));
      hab.has(+d.modulo) ? hab.delete(+d.modulo) : hab.add(+d.modulo);
      a.modulos = [...hab].sort().join('') || '-';   // '-' = ninguno habilitado
      guardarAdm(a); refrescarMensaje(a);
    }
    else if (d.clase) { a.clase = +d.clase; if (a.clase > 0 && !a.claseFecha) a.claseFecha = hoyISO(); guardarAdm(a); }
    else if (d.avMod !== undefined && a) { avModAdm[a.codigo] = +d.avMod; $('#detResto').innerHTML = restoHTML(a); }
    else if (d.modTilde !== undefined && a) { marcarModulo(a.prog, +d.modTilde); guardarAdm(a); }
    else if (d.extraTilde) { const x = (a.extras || []).find(y => y.id === d.extraTilde); if (x) { x.hecho = !x.hecho; guardarAdm(a); refrescarMensaje(a); } }
    else if (d.quitar) { a.extras = a.extras.filter(x => x.id !== d.quitar); guardarAdm(a); refrescarMensaje(a); }
    else if (d.admTilde) {
      const id = d.admTilde, pr = a.prog[id];
      if (pr && pr.hecho) { if (pr.videos && pr.videos.length) pr.hecho = false; else delete a.prog[id]; }   // los videos que mandó no se pierden
      else a.prog[id] = Object.assign(pr || {}, { hecho: true, como: (pr && pr.como) || 'listo', t: hoyISO() });
      guardarAdm(a);
    }
    else if (d.accion === 'salir') salir();
  };
  root.onchange = ev => {
    // cambiar los módulos del link de alumnos nuevos: hay que volver a armarlo
    if (ev.target.dataset.regMod !== undefined) { modsReg = [...document.querySelectorAll('[data-reg-mod]')].filter(x => x.checked).map(x => x.dataset.regMod).join(''); if (linkReg) { linkReg = ''; renderAdmin(); } return; }
    const c = ev.target.dataset.campo; if (!c || !a) return;
    a[c] = ev.target.type === 'checkbox' ? ev.target.checked : ev.target.value;
    if (c === 'email') a.email = a.email.trim().toLowerCase();
    guardarAdm(a, c !== 'nota' && c !== 'email');
  };
  const fn = $('#formNuevo');
  if (fn) fn.onsubmit = async ev => {
    ev.preventDefault(); const f = new FormData(fn);
    const nuevo = alumnoVacio(f.get('nombre').trim(), +f.get('nivel'), f.get('inicio'));
    const hechos = f.getAll('paso');
    hechos.forEach(id => { nuevo.prog[id] = { hecho: true, como: 'listo', t: hoyISO() }; });
    // Arrancan con el módulo 0, más los módulos donde ya tienen algo hecho
    nuevo.modulos = [...new Set([0, ...hechos.map(id => MODULO_DE[PASO[id].etapa])])].sort().join('');
    nuevo.email = String(f.get('email') || '').trim().toLowerCase();
    nuevo.codigo = codigoNuevo(nuevo.nombre);
    try {
      const r = await llamar('admin.crear', { clave: claveAdmin, alumno: nuevo });
      LISTA.push(r.alumno); elegido = nuevo.codigo; videoSel = null; linksRecientes[nuevo.codigo] = linkInvitacion(r.invitacion); renderAdmin();
    } catch (e) { aviso(e.message, true); }
  };
  if (fn) fn.onchange = ev => {
    const t = ev.target;
    if (t.dataset.nmod !== undefined) fn.querySelectorAll(`[data-nmod-de="${t.dataset.nmod}"]`).forEach(x => { x.checked = t.checked; });
    else if (t.dataset.nmodDe !== undefined) { const g = [...fn.querySelectorAll(`[data-nmod-de="${t.dataset.nmodDe}"]`)]; fn.querySelector(`[data-nmod="${t.dataset.nmodDe}"]`).checked = g.every(x => x.checked); }
  };
  const fe = $('#formExtra');
  if (fe) fe.onsubmit = ev => {
    ev.preventDefault(); const f = new FormData(fe);
    a.extras = a.extras || []; a.extras.push({ id: 'x' + Date.now().toString(36), titulo: f.get('titulo').trim(), detalle: f.get('detalle').trim(), hecho: false });
    guardarAdm(a); refrescarMensaje(a);
  };
}

async function copiar(txt, boton, ok) {
  try { await navigator.clipboard.writeText(txt); }
  catch (e) { const t = document.createElement('textarea'); t.value = txt; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (_) {} t.remove(); }
  const prev = boton.textContent; boton.textContent = ok; setTimeout(() => (boton.textContent = prev), 1500);
}

/* ---------------- Arranque ---------------- */
let anchoPrevio = window.innerWidth;
window.addEventListener('resize', () => {
  if ((anchoPrevio < 600) !== (window.innerWidth < 600) && ST && modo !== 'admin') renderAlumno();
  anchoPrevio = window.innerWidth;
});

/* ---------- Actualización sola (app del celu) ----------
   Al volver a la app (o a la pestaña), mira si publicamos algo nuevo. Si hay versión nueva y no está pasando nada
   (grabando, subiendo un video o guardando), recarga sola y vuelve al mismo paso. La sesión y los avances quedan en el aparato. */
const VERSION_AULA = '__VERSION_AULA__';
let ultimoChequeo = 0;
function sePuedeRecargar() {
  if (gr) return false;                                  // grabador abierto
  if (typeof subiendo !== 'undefined' && subiendo && !subiendo.error) return false;   // video subiendo
  if (typeof timerGuardar !== 'undefined' && $('#aviso') && /Guardando/.test($('#aviso').textContent || '')) return false;
  if (typeof pendientesAdm !== 'undefined' && pendientesAdm.size) return false;
  if (document.activeElement && /^(TEXTAREA|INPUT)$/.test(document.activeElement.tagName) && document.activeElement.value) return false;   // escribiendo algo
  return true;
}
async function chequearVersion() {
  if (VERSION_AULA.startsWith('__') || Date.now() - ultimoChequeo < 15000) return;
  ultimoChequeo = Date.now();
  try {
    const r = await fetch('version.json?t=' + Date.now(), { cache: 'no-store' });
    if (!r.ok) return;
    const { v } = await r.json();
    if (!v || v === VERSION_AULA || !sePuedeRecargar()) return;
    try { sessionStorage.setItem('mapaAE_volver', JSON.stringify({ paso: modo === 'alumno' ? abierto : null, y: window.scrollY, v })); } catch (e) {}
    location.reload();
  } catch (e) {}
}
function volverDondeEstaba() {   // después de una recarga por actualización
  let d = null; try { d = JSON.parse(sessionStorage.getItem('mapaAE_volver') || 'null'); sessionStorage.removeItem('mapaAE_volver'); } catch (e) {}
  if (!d) return;
  if (d.paso && modo === 'alumno' && PASO[d.paso] && d.paso !== abierto) abrirPaso(d.paso);
  if (d.y) setTimeout(() => window.scrollTo(0, d.y), 60);
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') chequearVersion(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && propGrande) { propGrande = false; renderAdmin(); } });
window.addEventListener('pageshow', e => { if (e.persisted) chequearVersion(); });
window.addEventListener('focus', () => chequearVersion());

(function inicio() {
  // La app instalada abre la dirección pelada: si en este aparato está la clave del panel y no hay alumno, vuelve al panel
  // link de la llamada: si ya había entrado al aula en este aparato, vuelve al paso donde quedó (no a la presentación)
  if (esLlamada && !QUIEN) { pedirNombreLlamada(() => { if (params.has('aula')) { DESTINO = { prueba: true, paso: params.get('paso') }; aplicarDestino(); } else inicio(); }); return; }
  if (esLlamada && !params.has('aula')) {
    let ya = null, paso = null; try { ya = localStorage.getItem('mapaAE_llamada_aula'); paso = localStorage.getItem('mapaAE_llamada_paso'); } catch (e) {}
    if (ya) { DESTINO = { prueba: true, paso: paso || null }; nav('?llamada&aula'); aplicarDestino(); return; }
    renderLlamada(); return;
  }
  if (esDemo) { DESTINO = { prueba: true, paso: params.get('paso') }; aplicarDestino(); return; }
  if (params.get('seguimiento')) { const c = params.get('seguimiento'); renderSeguimiento(c); document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') renderSeguimiento(c); }); return; }
  if (!location.search && !TOKEN && claveAdmin) { let u = '?admin'; try { u = localStorage.getItem('mapaAE_ultimoAdmin') || u; } catch (e) {} location.replace(location.pathname + u); return; }
  if (params.has('admin')) { claveAdmin ? abrirAdmin() : pedirClave(); return; }
  if (params.get('invitacion')) { renderInvitacion(params.get('invitacion')); return; }
  if (params.get('registro')) { renderRegistro(params.get('registro')); return; }
  TOKEN ? entrarConSesion() : renderEntrada();
})();

