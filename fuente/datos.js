/* =====================================================================
   DATOS — dónde se guarda el progreso
   Con API_URL vacío funciona en modo demo (se guarda solo en este navegador).
   Con la URL del Apps Script, todo se guarda en la planilla de Google.
   ===================================================================== */
const API_URL = 'https://script.google.com/macros/s/AKfycbwMCs4DiHNEAiFSRtfn0pEPpzQzd0sszYkZO6yczOxv8VUAK0O0ENrSyG4-kHPnvfInRQ/exec';

const hoyISO = (delta = 0) => { const d = new Date(); d.setDate(d.getDate() + delta); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

function alumnoVacio(nombre, nivel, inicio) {
  return { codigo: '', nombre, email: '', standard: '', nivel: nivel || 2, inicio: inicio || hoyISO(), clase: 0, claseFecha: '', pausa: false,
           nota: '', extras: [], prog: {}, probs: {}, act: '' };
}

function codigoNuevo(nombre) {
  const base = (nombre || 'alumno').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '').slice(0, 8) || 'alumno';
  const abc = 'abcdefghjkmnpqrstuvwxyz23456789';
  let r = ''; for (let i = 0; i < 4; i++) r += abc[Math.floor(Math.random() * abc.length)];
  return `${base}-${r}`;
}

/* ---------- Modo demo (localStorage, con respaldo en memoria) ---------- */
const DEMO_KEY = 'mapaAE_demo_v4';
let memoria = null;
function leerDemo() {
  if (memoria) return memoria;
  try { const raw = localStorage.getItem(DEMO_KEY); if (raw) return (memoria = JSON.parse(raw)); } catch (e) {}
  memoria = semillaDemo(); escribirDemo(); return memoria;
}
function escribirDemo() { try { localStorage.setItem(DEMO_KEY, JSON.stringify(memoria)); } catch (e) {} }

function semillaDemo() {
  const marca = (ids, como = 'listo') => Object.fromEntries(ids.map(id => [id, { hecho: true, como, t: hoyISO(-1) }]));
  const lucas = Object.assign(alumnoVacio('Lucas (prueba)', 2, hoyISO(-19)), {
    codigo: 'lucas-demo', email: 'lucas@prueba.com', clave: 'prueba123', clase: 1, claseFecha: hoyISO(-2), act: hoyISO(-1),
    prog: { ...marca(['p2', 'p3', 'p4', 'p5', 'p5b', 'p6', 'p7']), e1: { hecho: true, como: 'casi', op: 'errores', t: hoyISO(-2) }, e2: { hecho: true, como: 'cuesta', op: 'fijo', t: hoyISO(-1) } }, standard: 'Joy Spring',
    nota: 'Lucas, ojo con el compás 3 de Joy Spring: decí el acorde en voz alta antes de que llegue.',
  });
  const sofi = Object.assign(alumnoVacio('Sofía (prueba)', 3, hoyISO(-6)), {
    codigo: 'sofia-demo', email: 'sofia@prueba.com', clave: 'prueba123', act: hoyISO(0), prog: marca(['p2', 'p3', 'p4']),
  });
  const tomas = Object.assign(alumnoVacio('Tomás (prueba)', 1, hoyISO(-30)), {
    codigo: 'tomas-demo', email: 'tomas@prueba.com', clave: 'prueba123', standard: 'Autumn Leaves', clase: 2, claseFecha: hoyISO(-6), act: hoyISO(-5),
    prog: marca(['p2', 'p3', 'p4', 'p5', 'p5b', 'p6', 'p7', 'e1']),
    extras: [{ id: 'x1', titulo: 'Repasar las posiciones del Re7 en las cuerdas 2-3-4', detalle: 'Antes de la clase, aunque sea 10 minutos por día.', hecho: false }],
  });
  const caro = Object.assign(alumnoVacio('Carolina (prueba)', 2, hoyISO(-40)), {
    codigo: 'caro-demo', email: 'caro@prueba.com', invitacion: 'demo-invitacion-caro', standard: 'That Old Feeling', clase: 3, claseFecha: hoyISO(-2), act: hoyISO(0),
    prog: { ...marca(['p2', 'p3', 'p4', 'p5', 'p5b', 'p6', 'p7', 'e1', 'e2', 'e3', 'e4', 'a1', 'a2', 'a3', 's1']), s2: { hecho: true, como: 'casi', t: hoyISO(0) }, s3: { hecho: true, como: 'casi', t: hoyISO(0) }, m1: { hecho: true, como: 'listo', t: hoyISO(0) } },
  });
  return { alumnos: [lucas, sofi, tomas, caro] };
}

/* ---------- API ---------- */
async function llamar(accion, datos) {
  if (!API_URL) return demo(accion, datos);
  let r;
  try {
    r = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ accion, ...datos }) });
  } catch (e) { throw new Error('No hay conexión. Revisá internet y volvé a intentar.'); }
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j;
}

/* Modo demo: imita al servidor, con contraseñas en este navegador (solo para probar) */
const tokenDemo = () => Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
function demo(accion, d) {
  const db = leerDemo();
  db.sesiones = db.sesiones || {};
  const por = (campo, v) => db.alumnos.find(a => v && String(a[campo] || '') === String(v).trim().toLowerCase());
  const publico = (a, panel) => { const c = JSON.parse(JSON.stringify(a)); delete c.clave; delete c.invitacion; if (panel) { c.tieneClave = !!a.clave; c.invitacionPendiente = !!a.invitacion; } return c; };
  const deSesion = t => { const a = por('codigo', db.sesiones[t]); if (!a) throw new Error('Tu sesión se cerró. Volvé a entrar con tu email y contraseña.'); return a; };
  const sesion = a => { const t = tokenDemo(); db.sesiones[t] = a.codigo; escribirDemo(); return t; };
  switch (accion) {
    case 'auth.invitacion': { const a = db.alumnos.find(x => x.invitacion && x.invitacion === d.invitacion); if (!a) throw new Error('Este link ya se usó o no es válido. Pedime uno nuevo por WhatsApp.'); return { nombre: a.nombre, email: a.email }; }
    case 'auth.crearClave': {
      const a = db.alumnos.find(x => x.invitacion && x.invitacion === d.invitacion); if (!a) throw new Error('Este link ya se usó o no es válido. Pedime uno nuevo por WhatsApp.');
      if (!d.clave || d.clave.length < 6) throw new Error('La contraseña tiene que tener al menos 6 caracteres.');
      a.clave = d.clave; a.invitacion = ''; return { token: sesion(a), alumno: publico(a) };
    }
    case 'auth.registrar': {
      if (!db.registro || d.registro !== db.registro) throw new Error('Este link ya no funciona. Pedime uno nuevo por WhatsApp.');
      const email = String(d.email || '').trim().toLowerCase();
      if (por('email', email)) throw new Error('Ya hay una cuenta con ese email. Entrá con tu contraseña, o escribime por WhatsApp si no te acordás.');
      if (!d.clave || d.clave.length < 6) throw new Error('La contraseña tiene que tener al menos 6 caracteres.');
      const al = alumnoVacio(String(d.nombre).trim(), 2, hoyISO()); al.codigo = codigoNuevo(al.nombre); al.email = email; al.clave = d.clave; al.modulos = '0'; al.ajustar = '1';
      db.alumnos.push(al); escribirDemo(); return { token: sesion(al), alumno: publico(al) };
    }
    case 'admin.registro': { if (!db.registro || d.nuevo) db.registro = tokenDemo().slice(0, 12); escribirDemo(); return { registro: db.registro }; }
    case 'auth.entrar': { const a = por('email', String(d.email || '').toLowerCase()); if (!a || !a.clave || a.clave !== d.clave) throw new Error('El email o la contraseña no coinciden.'); return { token: sesion(a), alumno: publico(a) }; }
    case 'auth.salir': delete db.sesiones[d.token]; escribirDemo(); return { ok: true };
    case 'alumno.get': return { alumno: publico(deSesion(d.token)) };
    case 'alumno.guardar': {
      const a = deSesion(d.token);
      ['prog', 'probs', 'clase', 'claseFecha', 'standard'].forEach(k => { if (k in d.cambios) a[k] = d.cambios[k]; });
      if (d.cambios.extras) a.extras = a.extras.map(x => ({ ...x, hecho: !!(d.cambios.extras.find(y => y.id === x.id) || {}).hecho }));
      a.act = hoyISO(); escribirDemo(); return { ok: true };
    }
    case 'admin.lista': return { alumnos: db.alumnos.map(a => publico(a, true)) };
    case 'admin.crear': {
      const al = d.alumno; al.email = String(al.email || '').trim().toLowerCase();
      if (al.email && por('email', al.email)) throw new Error('Ya hay un alumno con ese email');
      al.invitacion = tokenDemo(); db.alumnos.push(al); escribirDemo(); return { alumno: publico(al, true), invitacion: al.invitacion };
    }
    case 'admin.guardar': {
      const i = db.alumnos.findIndex(a => a.codigo === d.alumno.codigo); if (i < 0) throw new Error('No existe ese alumno');
      const priv = { clave: db.alumnos[i].clave, invitacion: db.alumnos[i].invitacion };
      db.alumnos[i] = Object.assign({}, d.alumno, priv); delete db.alumnos[i].tieneClave; delete db.alumnos[i].invitacionPendiente;
      escribirDemo(); return { ok: true };
    }
    case 'admin.invitar': { const a = por('codigo', d.codigo); a.invitacion = tokenDemo(); escribirDemo(); return { invitacion: a.invitacion }; }
    case 'admin.borrar': { db.alumnos = db.alumnos.filter(a => a.codigo !== d.codigo); escribirDemo(); return { ok: true }; }
    case 'demo.reset': { memoria = semillaDemo(); escribirDemo(); return { ok: true }; }
  }
  throw new Error('Acción desconocida');
}
