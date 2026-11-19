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
let DESTINO = params.has('admin') ? { alumno: params.get('alumno'), ver: params.get('ver'), prueba: params.has('prueba'), paso: params.get('paso') } : null;
function urlAdmin() {
  if (modo === 'admin') nav(elegido && elegido !== '__nuevo' ? `?admin&alumno=${encodeURIComponent(elegido)}` : '?admin');
  else if (modo === 'admin-vista') nav(`?admin&ver=${encodeURIComponent(ST.codigo)}${abierto ? '&paso=' + abierto : ''}`);
  else if (modo === 'admin-prueba') { nav(`${esLlamada ? '?llamada&aula' : esDemo ? '?demo' : '?admin&prueba'}${abierto ? '&paso=' + abierto : ''}`); try { localStorage.setItem(clavePrueba(), JSON.stringify(ST)); } catch (e) {} }
}
function aplicarDestino() {
  const d = DESTINO; if (!d) return false; DESTINO = null;
  if (d.ver) { const a = LISTA.find(x => x.codigo === d.ver); if (a) { ST = clonar(a); modo = 'admin-vista'; abierto = d.paso; renderAlumno(true); return true; } }
  if (d.prueba) {
    let guardado = null; try { guardado = JSON.parse(localStorage.getItem(clavePrueba()) || 'null'); } catch (e) {}
    ST = guardado || Object.assign(alumnoVacio(esLlamada ? 'Invitado' : 'Alumno de prueba', 2, hoyISO()), { codigo: codPrueba(), ...(esLlamada ? { modulos: '0' } : {}) });
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
function reiniciarPrueba() {
  const cod = codPrueba();
  ['mapaAE_intro_' + cod, 'mapaAE_modVistos_' + cod].forEach(k => guardarLocal(k, null));
  try { localStorage.removeItem(clavePrueba()); } catch (e) {}
  ST = alumnoVacio('Alumno de prueba', 2, hoyISO()); ST.codigo = cod;
  modo = 'admin-prueba'; abierto = null; renderAlumno(true); window.scrollTo(0, 0);
}
/*VISTA_ALUMNO*/
function barra(nombre) {
  return `<header class="barra">
    <a class="marca" href="https://aula.ajuste-elastico.com/" aria-label="Ajuste Elástico, ir al aula">${LOGO}</a>
    <div class="barra-der">
      ${esLlamada && modo === 'admin-prueba' ? `<button class="link" data-accion="presentacion">Presentación</button>` : modo === 'admin-prueba' ? `<span class="chip-prueba"><span class="solo-pc">Vista de </span>prueba</span><button class="link" data-accion="reiniciar-prueba" title="Volver a empezar como alumno nuevo, con la animación de bienvenida">Reiniciar</button>` : ''}
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

/* Presentación para quienes van a tener la llamada conmigo: no explica el aula, invita a explorar */
function renderLlamada() {
  modo = 'llamada'; nav('?llamada');
  const yt = id => `<div class="ll-video"><iframe src="https://www.youtube-nocookie.com/embed/${esc(id)}?rel=0&playsinline=1" title="Video" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe></div>`;
  const tes = (LLAMADA.testimonios || []).filter(t => t.id);
  app().innerHTML = `${barra('')}
  <main class="llamada">
    <h1>Si te llegó este link es porque vamos a tener una llamada 🙌</h1>
    <p class="ll-texto">Te dejo un <strong>entrenamiento gratuito</strong> y una primera experiencia con el mapa de Ajuste Elástico.</p>
    <p class="ll-texto">No tenés que traer nada preparado para la llamada: es para que explores si tenés ganas 😉</p>
    ${LLAMADA.bienvenida ? yt(LLAMADA.bienvenida) : ''}
    <button class="primario ll-boton" data-ll-entrar>Arrancar el entrenamiento</button>
    ${tes.length ? `<h2>Algunos alumnos</h2><div class="ll-testimonios">${tes.map(t => `<figure>${yt(t.id)}<figcaption>${esc(t.nombre)}</figcaption></figure>`).join('')}</div>
    <button class="secundario ll-boton" data-ll-entrar>Arrancar el entrenamiento</button>` : ''}
  </main>`;
  app().onclick = ev => { if (ev.target.closest('[data-ll-entrar]')) { DESTINO = { prueba: true }; nav('?llamada&aula'); aplicarDestino(); window.scrollTo(0, 0); } };
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
  if (copia && !LISTA.length) { LISTA = copia; if (!aplicarDestino()) renderAdmin(); }        // al instante, con lo último que se vio
  else if (LISTA.length) renderAdmin();
  let nueva;
  try { nueva = (await llamar('admin.lista', { clave: claveAdmin })).alumnos; }
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

/* Inicio del panel: primero los videos para ver, después todos los alumnos */
function inicioAdmHTML() {
  const filas = LISTA.map(a => ({ a, e: estado(a) })).sort((x, y) => ORDEN_TIPO[x.e.tipo] - ORDEN_TIPO[y.e.tipo] || x.a.nombre.localeCompare(y.a.nombre));
  const nuevos = LISTA.flatMap(a => todosLosVideos(a).filter(x => !x.v.visto).map(x => ({ ...x, a })))
    .sort((x, y) => String(y.v.t).localeCompare(String(x.v.t)));
  return `<div class="lista-cab"><h1>Panel</h1><span class="lista-botones">
      <button class="secundario" data-adm="prueba" title="Recorré el aula como un alumno nuevo. No se guarda nada.">Ver como alumno</button>
      <button class="secundario" data-adm="nuevo">Agregar alumno</button></span></div>
    ${registroAdmHTML()}
    <section class="por-ver">
      <h2>Videos para ver ${nuevos.length ? `<span class="cuenta">${nuevos.length}</span>` : ''}</h2>
      ${nuevos.length ? `<div class="tarjetas-video">${nuevos.map(x => `<button class="tarjeta-video" data-abrir-video="${esc(x.a.codigo)}|${x.pid}:${x.i}">
          <span class="tv-mini">${miniDrive(x.v.id)}${ICONO_PLAY}</span>
          <span class="tv-txt"><strong>${esc(x.a.nombre)}</strong><span>${esc(PASO[x.pid].titulo)}</span><small>${haceTanto(x.v.t)}${x.v.seg ? ' · ' + duracion(x.v.seg) : ''}</small></span>
        </button>`).join('')}</div>` : `<p class="suave">No hay videos nuevos. Cuando un alumno mande uno desde el aula, aparece acá.</p>`}
    </section>
    <section class="lista">
      <h2>Alumnos</h2>
      <table>
        <thead><tr><th>Alumno</th><th>Próxima</th><th>Estado</th><th>Nivel</th><th>Último movimiento</th></tr></thead>
        <tbody>${filas.map(({ a, e }) => {
          const nprob = Object.values(a.prog || {}).filter(x => x.hecho && x.como === 'cuesta').length;
          const nvid = videosNuevos(a);
          return `<tr data-elegir="${esc(a.codigo)}" tabindex="0">
            <td><strong>${esc(a.nombre)}</strong>${a.ajustar ? `<span class="marca-ajustar">Nuevo: ajustá nivel y fecha</span>` : ''}${nvid ? `<span class="marca-video">${nvid === 1 ? '1 video nuevo' : nvid + ' videos nuevos'}</span>` : ''}${nprob ? `<span class="marca-prob" title="Pasos donde marcó que le cuesta">Le cuesta${nprob > 1 ? 'n ' + nprob + ' pasos' : ' 1 paso'}</span>` : ''}</td>
            <td class="nw">${e.k <= 4 ? 'Clase ' + e.k : 'Módulo 2'}</td>
            <td><span class="estado-chip t-${e.tipo}">${etiquetaAdmin(e)}</span></td>
            <td>${a.nivel}</td>
            <td class="suave">${a.act ? haceTanto(a.act) : 'sin movimiento'}</td>
          </tr>`; }).join('') || '<tr><td colspan="5" class="suave">Todavía no hay alumnos.</td></tr>'}</tbody>
      </table>
    </section>`;
}
function marcarModulo(prog, m) {
  const ps = pasosDelModulo(m), todo = ps.every(x => prog[x.id]?.hecho);
  ps.forEach(x => { if (todo) delete prog[x.id]; else if (!prog[x.id]?.hecho) prog[x.id] = { hecho: true, como: 'listo', t: hoyISO() }; });
}
let linkReg = '';   // link único para alumnos nuevos (se pide al servidor al tocar el botón)
function registroAdmHTML() {
  const msg = linkReg ? `Te paso el link al aula virtual de Ajuste Elástico! Ahí ponés tu nombre, tu mail y elegís una contraseña, y con eso entrás siempre\n\n${linkReg}` : '';
  return `<section class="registro-adm">
    <div class="reg-cab"><div><h2>Link para alumnos nuevos</h2><p class="suave chico">El mismo para todos: cada uno pone su nombre, email y contraseña, y entra con el Módulo 0. Después le ajustás el nivel y la fecha de la llamada.</p></div>
      ${linkReg ? '' : `<button class="secundario" data-adm="ver-registro">Ver el link</button>`}</div>
    ${linkReg ? `<textarea id="msgReg" rows="5">${esc(msg)}</textarea>
      <span class="fila-botones"><button class="secundario" data-adm="copiar-reg">Copiar mensaje</button><button class="secundario" data-adm="copiar-link">Copiar solo el link</button>
      <a class="secundario boton" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(msg)}">Abrir en WhatsApp</a>
      <button class="link suave" data-adm="nuevo-registro">Cambiar el link</button></span>` : ''}
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
  <section class="revision" id="revision">${revisionHTML(a)}</section>
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
function restoHTML(a) {
  const e = estado(a);
  const probs = Object.entries(a.probs || {}).flatMap(([pid, l]) => l.map(q => ({ pid, q: (PASO[pid].problemas || []).find(x => x.id === q) })).filter(x => x.q));
  return `${accesoHTML(a)}
  <div class="ajustes form-admin">
    <label>Nivel
      <span class="segmentado">${[1, 2, 3].map(n => `<button data-nivel="${n}" class="${a.nivel === n ? 'sel' : ''}" aria-pressed="${a.nivel === n}">${n}</button>`).join('')}</span></label>
    <label>Clases que ya tuvo
      <span class="segmentado">${[0, 1, 2, 3, 4].map(n => `<button data-clase="${n}" class="${a.clase === n ? 'sel' : ''}" aria-pressed="${a.clase === n}">${n}</button>`).join('')}</span></label>
    <label>Fecha de la última clase<input type="date" data-campo="claseFecha" value="${esc(a.claseFecha || '')}"></label>
    <label>Fecha de la llamada<input type="date" data-campo="inicio" value="${esc(a.inicio || '')}"></label>
    <label class="check"><input type="checkbox" data-campo="pausa" ${a.pausa ? 'checked' : ''}> En pausa (sin apuro, por ejemplo si se demora el pago)</label>
  </div>

  <div class="bloque">
    <h3>Acceso a los módulos</h3>
    <div class="modulos-adm">${MODULOS.map(m => { const on = moduloHabilitado(a, m.n); return `<button class="mod-tg ${on ? 'on' : ''}" data-modulo="${m.n}" aria-pressed="${on}">
      <span class="mod-sw" aria-hidden="true"><i></i></span><span><strong>${m.titulo}</strong><small>${m.sub}</small></span></button>`; }).join('')}</div>
    <p class="suave chico">Lo que está apagado no aparece en su aula: ve un candado con «Te lo habilito cuando llegue el momento».</p>
  </div>

  <label class="bloque">Nota para ${esc(a.nombre.split(' ')[0])} <span class="suave">(la ve en su aula y va al final del mensaje)</span>
    <textarea data-campo="nota" rows="3">${esc(a.nota || '')}</textarea></label>

  <div class="bloque">
    <h3>Tareas personalizadas</h3>
    <ul class="extras-adm">${(a.extras || []).map(x => `<li class="${x.hecho ? 'hecha' : ''}"><button class="mini-nodo" data-extra-tilde="${esc(x.id)}" aria-pressed="${!!x.hecho}" aria-label="Marcar como hecha"></button><span><strong>${esc(x.titulo)}</strong>${x.detalle ? ` <span class="suave">${esc(x.detalle)}</span>` : ''}</span><button class="link suave" data-quitar="${esc(x.id)}">Quitar</button></li>`).join('') || '<li class="suave">Ninguna por ahora.</li>'}</ul>
    <form id="formExtra" class="fila-extra"><input name="titulo" placeholder="Tarea (ej: repasar el compás 7 en 2 cuerdas)" required><input name="detalle" placeholder="Detalle (opcional)"><button class="secundario">Agregar</button></form>
  </div>

  ${probs.length ? `<div class="bloque"><h3>Problemas que marcó</h3><ul class="probs-adm">${probs.map(x => `<li><span class="suave">${esc(PASO[x.pid].titulo)}:</span> ${esc(x.q.q)}</li>`).join('')}</ul></div>` : ''}

  <div class="bloque">
    <h3>Avance</h3>
    <p class="suave chico">Tocá un paso para marcarlo como hecho (o para desmarcarlo).</p>
    <ul class="avance-adm">${PROGRAMA.pasos.map((p, i) => { const pr = a.prog[p.id]; const est = pr && pr.hecho ? (pr.como || 'listo') : 'pendiente';
      const m = MODULO_DE[p.etapa], todo = pasosDelModulo(m).every(x => a.prog[x.id]?.hecho);
      const cab = !i || MODULO_DE[PROGRAMA.pasos[i - 1].etapa] !== m ? `<li class="av-mod" style="--mc:${MODULOS[m].color}"><span>${esc(MODULOS[m].titulo)} · ${esc(MODULOS[m].nombre)}</span><button class="link suave" data-mod-tilde="${m}">${todo ? 'Desmarcar el módulo entero' : 'Marcar el módulo entero'}</button></li>` : '';
      return `${cab}<li class="est-${est}"><button class="mini-nodo" data-adm-tilde="${p.id}" aria-pressed="${!!(pr && pr.hecho)}" aria-label="Marcar ${esc(p.titulo)}"></button><button class="av-tit" data-adm-tilde="${p.id}">${esc(p.titulo)}</button>${pr && pr.hecho ? (p.tipo === 'standard' && a.standard ? `<span class="como como-listo">${esc(a.standard)}</span>` : (opcionElegida(a, p) && !p.sinProgreso ? `<span class="como como-${est}">${esc(opcionElegida(a, p).label)}</span>` : '')) : e.faltan.includes(p.id) ? '<span class="chip">Le falta</span>' : ''}</li>`; }).join('')}</ul>
  </div>

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
    <div class="acceso-cab"><h3>Acceso</h3><span class="suave">${estadoAcceso}</span></div>
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
  root.onclick = async ev => {
    const tr = ev.target.closest('tr[data-elegir]');
    if (tr) { elegido = tr.dataset.elegir; videoSel = null; renderAdmin(); window.scrollTo(0, 0); return; }
    const wa = ev.target.closest('a[data-wa]');
    if (wa && $('#msg')) { wa.href = 'https://wa.me/?text=' + encodeURIComponent($('#msg').value); return; }
    const b = ev.target.closest('button'); if (!b) return;
    const d = b.dataset;
    if (d.adm === 'prueba') { reiniciarPrueba(); return; }
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
    else if (d.adm === 'ver-registro' || d.adm === 'nuevo-registro') {
      if (d.adm === 'nuevo-registro' && !b.dataset.seguro) { b.dataset.seguro = '1'; b.textContent = 'Tocá de nuevo: el link de ahora deja de andar'; return; }
      b.disabled = true; b.textContent = 'Un momento…';
      try { const r = await llamar('admin.registro', { clave: claveAdmin, nuevo: d.adm === 'nuevo-registro' }); linkReg = linkRegistro(r.registro); renderAdmin(); if (d.adm === 'nuevo-registro') aviso('Listo: link nuevo. El anterior ya no funciona.'); }
      catch (e) { aviso(/Acción desconocida/.test(e.message) ? 'Falta actualizar el servidor en Apps Script.' : e.message, true); b.disabled = false; b.textContent = 'Ver el link'; }
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
    else if (d.modTilde !== undefined && a) { marcarModulo(a.prog, +d.modTilde); guardarAdm(a); }
    else if (d.extraTilde) { const x = (a.extras || []).find(y => y.id === d.extraTilde); if (x) { x.hecho = !x.hecho; guardarAdm(a); refrescarMensaje(a); } }
    else if (d.quitar) { a.extras = a.extras.filter(x => x.id !== d.quitar); guardarAdm(a); refrescarMensaje(a); }
    else if (d.admTilde) {
      const id = d.admTilde; if (a.prog[id] && a.prog[id].hecho) delete a.prog[id]; else a.prog[id] = { hecho: true, como: 'listo', t: hoyISO() };
      guardarAdm(a);
    }
    else if (d.accion === 'salir') salir();
  };
  root.onchange = ev => {
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

(function inicio() {
  // La app instalada abre la dirección pelada: si en este aparato está la clave del panel y no hay alumno, vuelve al panel
  if (esLlamada && !params.has('aula')) { renderLlamada(); return; }
  if (esDemo) { DESTINO = { prueba: true, paso: params.get('paso') }; aplicarDestino(); return; }
  if (!location.search && !TOKEN && claveAdmin) { let u = '?admin'; try { u = localStorage.getItem('mapaAE_ultimoAdmin') || u; } catch (e) {} location.replace(location.pathname + u); return; }
  if (params.has('admin')) { claveAdmin ? abrirAdmin() : pedirClave(); return; }
  if (params.get('invitacion')) { renderInvitacion(params.get('invitacion')); return; }
  if (params.get('registro')) { renderRegistro(params.get('registro')); return; }
  TOKEN ? entrarConSesion() : renderEntrada();
})();

