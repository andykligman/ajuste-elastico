/* =====================================================================
   INTERFAZ
   ===================================================================== */
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const app = () => $('#app');
const params = new URLSearchParams(location.search);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let ST = null;            // alumno abierto
let modo = 'alumno';      // 'alumno' | 'admin-vista' | 'admin-prueba'
let abierto = null;       // paso expandido
let paso2 = {};
const desplegadas = new Set(); // etapas completas que el alumno abrió           // paso -> 'como' | 'probs' (flujo después de tildar)
let claveAdmin = '';
try { claveAdmin = sessionStorage.getItem('mapaAE_clave') || ''; } catch (e) {}

const ETIQUETA_COMO = { cuesta: 'Me cuesta', casi: 'Casi', listo: 'Ya está' };
const NOMBRE_ESTACION = ['Inicio', 'Clase 1', 'Clase 2', 'Clase 3', 'Clase 4', 'Módulo 2'];

function nav(url) { try { history.replaceState(null, '', url); } catch (e) {} }
function linkInvitacion(token) {
  const u = new URL(location.href); u.search = ''; u.hash = ''; u.searchParams.set('invitacion', token); return u.toString();
}
function linkMapa() { const u = new URL(location.href); u.search = ''; u.hash = ''; return u.toString(); }
let TOKEN = '';
try { TOKEN = localStorage.getItem('mapaAE_token') || ''; } catch (e) {}
function guardarToken(t) { TOKEN = t || ''; try { t ? localStorage.setItem('mapaAE_token', t) : localStorage.removeItem('mapaAE_token'); } catch (e) {} }

/* ---------------- Guardado ---------------- */
let timerGuardar = null;
function guardarAlumno() {
  if (modo === 'admin-prueba') { aviso('Vista de prueba: no se guarda nada'); return; }
  aviso('Guardando…');
  clearTimeout(timerGuardar);
  timerGuardar = setTimeout(async () => {
    try {
      if (modo === 'admin-vista') await llamar('admin.guardar', { clave: claveAdmin, alumno: ST });
      else await llamar('alumno.guardar', { token: TOKEN, cambios: { prog: ST.prog, probs: ST.probs, clase: ST.clase, claseFecha: ST.claseFecha, extras: ST.extras, standard: ST.standard } });
      aviso('Guardado');
    } catch (e) { aviso(/sesión/.test(e.message) ? e.message : 'No se pudo guardar. Revisá la conexión y volvé a intentar.', true); }
  }, 500);
}
function aviso(t, error) {
  const el = $('#aviso'); if (!el) return;
  el.textContent = t; el.classList.toggle('error', !!error); el.classList.add('visible');
  clearTimeout(el._t); if (!error && t === 'Guardado') el._t = setTimeout(() => el.classList.remove('visible'), 1600);
}

/*VISTA_ALUMNO*/
function barra(nombre) {
  return `<header class="barra">
    <div class="marca">${LOGO}</div>
    <div class="barra-der">
      ${modo === 'admin-prueba' ? `<span class="chip-prueba"><span class="solo-pc">Vista de </span>prueba</span>` : ''}
      ${modo.startsWith('admin-') ? `<button class="link" data-accion="volver-admin"><span class="solo-pc">Volver al </span>panel</button>` : ''}
      ${nombre && modo !== 'admin-prueba' ? `<span class="quien">${esc(nombre)}</span>` : ''}
      ${!modo.startsWith('admin-') && nombre ? `<button class="link suave" data-accion="salir">Salir</button>` : ''}
    </div>
  </header>`;
}

/* ---------------- Entrada ---------------- */
function renderEntrada(error) {
  app().innerHTML = `${barra('')}
  <main class="entrada">
    <h1>Tu mapa de Ajuste Elástico</h1>
    <p class="suave">Entrá con el email y la contraseña que creaste con el link que te mandó Andy.</p>
    <form id="formEntrada" novalidate>
      <label for="email">Email</label>
      <input id="email" name="email" type="email" autocomplete="username" autocapitalize="off" spellcheck="false" required>
      <label for="clave">Contraseña</label>
      <input id="clave" name="clave" type="password" autocomplete="current-password" required>
      ${error ? `<p class="error" role="alert">${esc(error)}</p>` : ''}
      <button class="primario" type="submit">Entrar</button>
    </form>
    <p class="suave chico">¿Te olvidaste la contraseña? Escribile a Andy por WhatsApp y te manda un link nuevo.</p>
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
  ST = alumno; modo = 'alumno'; abierto = null;
  nav(location.pathname);
  renderAlumno(true);
}
async function entrarConSesion() {
  try { const { alumno } = await llamar('alumno.get', { token: TOKEN }); abrirMapa(alumno); }
  catch (e) {
    // Solo se borra la sesión si el servidor dice que se cerró; si falló la conexión, se queda guardada
    if (/sesión se cerró/.test(e.message)) { guardarToken(''); renderEntrada(); }
    else renderEntrada('No pude conectarme con el aula. Recargá la página en un ratito: tu sesión sigue guardada.');
  }
}
function salir() {
  const t = TOKEN; guardarToken(''); ST = null; nav(location.pathname); renderEntrada();
  if (t) llamar('auth.salir', { token: t }).catch(() => {});
}

/* ---------------- Panel de Andy ---------------- */
let LISTA = [];
let elegido = null;

function pedirClave() {
  if (!API_URL) { claveAdmin = 'demo'; abrirAdmin(); return; }
  app().innerHTML = `${barra('')}<main class="entrada"><h1>Panel de Andy</h1>
    <form id="formClave"><label for="clave">Clave</label><input id="clave" type="password" required><button class="primario">Entrar</button></form></main>`;
  $('#formClave').onsubmit = ev => { ev.preventDefault(); claveAdmin = $('#clave').value; try { sessionStorage.setItem('mapaAE_clave', claveAdmin); } catch (e) {} abrirAdmin(); };
}

async function abrirAdmin() {
  modo = 'admin';
  try { LISTA = (await llamar('admin.lista', { clave: claveAdmin })).alumnos; }
  catch (e) { claveAdmin = ''; try { sessionStorage.removeItem('mapaAE_clave'); } catch (_) {} renderEntrada(e.message); return; }
  nav('?admin');
  renderAdmin();
}

const ORDEN_TIPO = { meterle: 0, bien: 1, adelantado: 2, pausa: 3, m2: 4 };
function renderAdmin() {
  const filas = LISTA.map(a => ({ a, e: estado(a) })).sort((x, y) => ORDEN_TIPO[x.e.tipo] - ORDEN_TIPO[y.e.tipo] || x.a.nombre.localeCompare(y.a.nombre));
  const sel = elegido && LISTA.find(a => a.codigo === elegido);
  app().innerHTML = `${barra('Andy')}
  <main class="admin">
    <section class="lista">
      <div class="lista-cab"><h1>Alumnos</h1><span class="lista-botones"><button class="secundario" data-adm="prueba" title="Recorré el mapa como un alumno nuevo. No se guarda nada.">Ver como alumno</button><button class="secundario" data-adm="nuevo">Agregar alumno</button></span></div>
      <table>
        <thead><tr><th>Alumno</th><th>Próxima</th><th>Estado</th><th>Nivel</th><th>Último movimiento</th></tr></thead>
        <tbody>${filas.map(({ a, e }) => {
          const nprob = Object.values(a.prog || {}).filter(x => x.hecho && x.como === 'cuesta').length;
          const nvid = videosNuevos(a);
          return `<tr class="${sel && sel.codigo === a.codigo ? 'sel' : ''}" data-elegir="${esc(a.codigo)}" tabindex="0">
            <td><strong>${esc(a.nombre)}</strong>${nprob ? `<span class="marca-prob" title="Pasos donde marcó que le cuesta">Le cuesta${nprob > 1 ? 'n ' + nprob + ' pasos' : ' 1 paso'}</span>` : ''}${nvid ? `<span class="marca-video">${nvid === 1 ? '1 video nuevo' : nvid + ' videos nuevos'}</span>` : ''}</td>
            <td class="nw">${e.k <= 4 ? 'Clase ' + e.k : 'Módulo 2'}</td>
            <td><span class="estado-chip t-${e.tipo}">${etiquetaAdmin(e)}</span></td>
            <td>${a.nivel}</td>
            <td class="suave">${a.act ? haceTanto(a.act) : 'sin movimiento'}</td>
          </tr>`; }).join('')}</tbody>
      </table>
    </section>
    <section class="detalle">${sel ? detalleHTML(sel) : elegido === '__nuevo' ? nuevoHTML() : '<p class="suave vacio">Elegí un alumno para ver su avance, ajustar el nivel o copiar el mensaje de lo que sigue.</p>'}</section>
  </main>`;
  enlazarAdmin();
}

function haceTanto(f) { const d = diasDesde(f); return d === 0 ? 'hoy' : d === 1 ? 'ayer' : `hace ${d} días`; }

function nuevoHTML() {
  return `<h2>Agregar alumno</h2>
  <form id="formNuevo" class="form-admin">
    <label>Nombre<input name="nombre" required placeholder="Nombre y apellido"></label>
    <label>Email <span class="suave">(con esto entra a su mapa)</span><input name="email" type="email" required placeholder="alumno@email.com"></label>
    <label>Nivel <span class="suave">(el alumno no lo ve)</span>
      <select name="nivel"><option value="1">1: se lo compara con el mínimo</option><option value="2" selected>2: con lo esperado</option><option value="3">3: con lo ideal</option></select></label>
    <label>Fecha de la llamada de bienvenida<input type="date" name="inicio" value="${hoyISO()}"></label>
    <button class="primario">Crear y generar el link de acceso</button>
  </form>`;
}

function detalleHTML(a) {
  const e = estado(a);
  const msg = mensajeWhatsApp(a, linkMapa());
  const probs = Object.entries(a.probs || {}).flatMap(([pid, l]) => l.map(q => ({ pid, q: (PASO[pid].problemas || []).find(x => x.id === q) })).filter(x => x.q));
  return `<div class="det-cab"><h2>${esc(a.nombre)}</h2><span class="estado-chip t-${e.tipo}">${etiquetaAdmin(e)}</span></div>
  <p class="suave">${esc(bajadaEstado(a, e))} ${e.pre ? `Lleva ${e.d} días desde la llamada.` : a.claseFecha ? `Tuvo la clase ${a.clase} ${haceTanto(a.claseFecha)}.` : ''}</p>

  ${accesoHTML(a)}

  <div class="mensaje">
    <div class="mensaje-cab"><h3>Mensaje de lo que sigue</h3>
      <span><button class="secundario" data-adm="copiar">Copiar</button>
      <a class="secundario boton" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(msg)}">Abrir en WhatsApp</a></span></div>
    <textarea id="msg" rows="10">${esc(msg)}</textarea>
    <p class="suave chico">Podés editarlo antes de copiar. Sale de lo que le falta según su nivel, de tu nota y de las tareas personalizadas.</p>
  </div>

  <div class="ajustes form-admin">
    <label>Nivel
      <span class="segmentado">${[1, 2, 3].map(n => `<button data-nivel="${n}" class="${a.nivel === n ? 'sel' : ''}" aria-pressed="${a.nivel === n}">${n}</button>`).join('')}</span></label>
    <label>Clases que ya tuvo
      <span class="segmentado">${[0, 1, 2, 3, 4].map(n => `<button data-clase="${n}" class="${a.clase === n ? 'sel' : ''}" aria-pressed="${a.clase === n}">${n}</button>`).join('')}</span></label>
    <label>Fecha de la última clase<input type="date" data-campo="claseFecha" value="${esc(a.claseFecha || '')}"></label>
    <label>Fecha de la llamada<input type="date" data-campo="inicio" value="${esc(a.inicio || '')}"></label>
    <label class="check"><input type="checkbox" data-campo="pausa" ${a.pausa ? 'checked' : ''}> En pausa (sin apuro, por ejemplo si se demora el pago)</label>
  </div>

  <label class="bloque">Nota para ${esc(a.nombre.split(' ')[0])} <span class="suave">(la ve en su mapa y va al final del mensaje)</span>
    <textarea data-campo="nota" rows="3">${esc(a.nota || '')}</textarea></label>

  <div class="bloque">
    <h3>Tareas personalizadas</h3>
    <ul class="extras-adm">${(a.extras || []).map(x => `<li class="${x.hecho ? 'hecha' : ''}"><span><strong>${esc(x.titulo)}</strong>${x.detalle ? ` <span class="suave">${esc(x.detalle)}</span>` : ''}</span><button class="link suave" data-quitar="${esc(x.id)}">Quitar</button></li>`).join('') || '<li class="suave">Ninguna por ahora.</li>'}</ul>
    <form id="formExtra" class="fila-extra"><input name="titulo" placeholder="Tarea (ej: repasar el compás 7 en 2 cuerdas)" required><input name="detalle" placeholder="Detalle (opcional)"><button class="secundario">Agregar</button></form>
  </div>

  ${videosAdmHTML(a)}
  ${probs.length ? `<div class="bloque"><h3>Problemas que marcó</h3><ul class="probs-adm">${probs.map(x => `<li><span class="suave">${esc(PASO[x.pid].titulo)}:</span> ${esc(x.q.q)}</li>`).join('')}</ul></div>` : ''}

  <div class="bloque">
    <h3>Avance</h3>
    <ul class="avance-adm">${PROGRAMA.pasos.map(p => { const pr = a.prog[p.id]; const est = pr && pr.hecho ? (pr.como || 'listo') : 'pendiente';
      return `<li class="est-${est}"><button class="mini-nodo" data-adm-tilde="${p.id}" aria-pressed="${!!(pr && pr.hecho)}" aria-label="Marcar ${esc(p.titulo)}"></button><span>${esc(p.titulo)}</span>${pr && pr.hecho ? (p.tipo === 'standard' && a.standard ? `<span class="como como-listo">${esc(a.standard)}</span>` : (opcionElegida(a, p) && !p.sinProgreso ? `<span class="como como-${est}">${esc(opcionElegida(a, p).label)}</span>` : '')) : e.faltan.includes(p.id) ? '<span class="chip">Le falta</span>' : ''}</li>`; }).join('')}</ul>
  </div>

  <div class="bloque links-adm">
    <button class="secundario" data-adm="ver">Ver su mapa</button>
    <button class="link suave" data-adm="borrar">Borrar alumno</button>
  </div>`;
}

const linksRecientes = {};
function accesoHTML(a) {
  const link = linksRecientes[a.codigo];
  const estadoAcceso = a.tieneClave ? `Entra con <strong>${esc(a.email || 'sin email')}</strong> y su contraseña.` : `Todavía no creó su contraseña${a.email ? ` (${esc(a.email)})` : ''}.`;
  const msgInv = link ? `${a.nombre.split(' ')[0]}! Te paso el link para entrar a tu mapa de Ajuste Elástico 🙌\n\nAbrilo, elegí una contraseña y listo. Después entrás siempre con tu email y esa contraseña.\n\n${link}` : '';
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
function guardarAdm(a, rerender = true) {
  aviso('Guardando…');
  if (rerender) renderAdmin();
  clearTimeout(timerAdm);
  timerAdm = setTimeout(async () => {
    try { await llamar('admin.guardar', { clave: claveAdmin, alumno: a }); aviso('Guardado'); }
    catch (e) { aviso('No se pudo guardar: ' + e.message, true); }
  }, 400);
}

function enlazarAdmin() {
  const root = app();
  const a = LISTA.find(x => x.codigo === elegido);
  root.onclick = async ev => {
    const tr = ev.target.closest('tr[data-elegir]');
    if (tr) { elegido = tr.dataset.elegir; renderAdmin(); if (window.innerWidth < 900) $('.detalle').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); return; }
    const b = ev.target.closest('button'); if (!b) return;
    const d = b.dataset;
    if (d.adm === 'prueba') { ST = alumnoVacio('Alumno de prueba', 2, hoyISO()); ST.codigo = '__prueba'; modo = 'admin-prueba'; abierto = null; renderAlumno(true); window.scrollTo(0, 0); return; }
    if (d.verVideo && a) { const [pid, i] = d.verVideo.split(':'); verVideoAdmin(a, pid, +i, () => guardarAdm(a)); return; }
    if (d.adm === 'nuevo') { elegido = '__nuevo'; renderAdmin(); }
    else if (d.adm === 'copiar') copiar($('#msg').value, b, 'Copiado');
    else if (d.adm === 'copiar-inv') copiar($('#msgInv').value, b, 'Copiado');
    else if (d.adm === 'invitar') {
      try { const r = await llamar('admin.invitar', { clave: claveAdmin, codigo: a.codigo }); linksRecientes[a.codigo] = linkInvitacion(r.invitacion); a.invitacionPendiente = true; renderAdmin(); }
      catch (e) { aviso(e.message, true); }
    }
    else if (d.adm === 'ver') { ST = JSON.parse(JSON.stringify(a)); modo = 'admin-vista'; abierto = null; renderAlumno(true); window.scrollTo(0, 0); }
    else if (d.adm === 'borrar') {
      if (b.dataset.seguro) { await llamar('admin.borrar', { clave: claveAdmin, codigo: a.codigo }); LISTA = LISTA.filter(x => x !== a); elegido = null; renderAdmin(); }
      else { b.dataset.seguro = '1'; b.textContent = 'Tocá de nuevo para borrar'; }
    }
    else if (d.nivel) { a.nivel = +d.nivel; guardarAdm(a); }
    else if (d.clase) { a.clase = +d.clase; if (a.clase > 0 && !a.claseFecha) a.claseFecha = hoyISO(); guardarAdm(a); }
    else if (d.quitar) { a.extras = a.extras.filter(x => x.id !== d.quitar); guardarAdm(a); }
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
    nuevo.email = String(f.get('email') || '').trim().toLowerCase();
    nuevo.codigo = codigoNuevo(nuevo.nombre);
    try {
      const r = await llamar('admin.crear', { clave: claveAdmin, alumno: nuevo });
      LISTA.push(r.alumno); elegido = nuevo.codigo; linksRecientes[nuevo.codigo] = linkInvitacion(r.invitacion); renderAdmin();
    } catch (e) { aviso(e.message, true); }
  };
  const fe = $('#formExtra');
  if (fe) fe.onsubmit = ev => {
    ev.preventDefault(); const f = new FormData(fe);
    a.extras = a.extras || []; a.extras.push({ id: 'x' + Date.now().toString(36), titulo: f.get('titulo').trim(), detalle: f.get('detalle').trim(), hecho: false });
    guardarAdm(a);
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
  if (params.has('admin')) { claveAdmin ? abrirAdmin() : pedirClave(); return; }
  if (params.get('invitacion')) { renderInvitacion(params.get('invitacion')); return; }
  TOKEN ? entrarConSesion() : renderEntrada();
})();

function videosAdmHTML(a) {
  const l = Object.entries(a.prog || {}).flatMap(([pid, x]) => (x.videos || []).map((v, i) => ({ pid, v, i }))).filter(x => PASO[x.pid])
    .sort((x, y) => String(y.v.t).localeCompare(String(x.v.t)));
  if (!l.length) return '';
  return `<div class="bloque"><h3>Videos que mandó</h3><ul class="vids-adm">${l.map(({ pid, v, i }) => `<li class="${v.visto ? '' : 'nuevo'}">
    <button class="link" data-ver-video="${pid}:${i}">${esc(PASO[pid].titulo)}</button><span class="suave">${fechaCorta(v.t)}${v.seg ? ' · ' + duracion(v.seg) : ''}${v.visto ? '' : ' · nuevo'}</span></li>`).join('')}</ul></div>`;
}
