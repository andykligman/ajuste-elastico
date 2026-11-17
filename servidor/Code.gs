/**
 * Mapa de Ajuste Elástico — servidor en Google Apps Script (guarda todo en esta planilla)
 *
 * Instalación (una sola vez):
 * 1. Crear una planilla de Google nueva, por ejemplo "Mapa Ajuste Elástico".
 * 2. Extensiones > Apps Script. Borrar lo que haya, pegar este archivo entero y guardar.
 * 3. Cambiar CLAVE_PANEL (abajo) por la clave que vas a usar para entrar al panel.
 * 4. Elegir la función `configurar` arriba y tocar "Ejecutar" (la primera vez pide permisos).
 * 5. Implementar > Nueva implementación > Tipo: Aplicación web.
 *    Ejecutar como: Yo. Quién tiene acceso: Cualquier usuario.
 * 6. Copiar la URL que termina en /exec y pegarla en la página (const API_URL = '...').
 */

const CLAVE_PANEL = 'cambiar-esta-clave';
const ZONA = 'America/Argentina/Buenos_Aires';
const HOJA = 'Alumnos';
const HOJA_SESIONES = 'Sesiones';
const COLUMNAS = ['codigo', 'nombre', 'email', 'standard', 'nivel', 'inicio', 'clase', 'claseFecha', 'pausa', 'nota',
                  'extras', 'prog', 'probs', 'act', 'hash', 'sal', 'invitacion'];
const JSON_COLS = ['extras', 'prog', 'probs'];
const PRIVADAS = ['hash', 'sal', 'invitacion'];      // nunca salen de la planilla
const DIAS_SESION = 180;

function configurar() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(HOJA) || ss.insertSheet(HOJA);
  sh.getRange(1, 1, 1, COLUMNAS.length).setValues([COLUMNAS]).setFontWeight('bold');
  sh.setFrozenRows(1);
  sh.getRange(1, 1, sh.getMaxRows(), COLUMNAS.length).setNumberFormat('@');
  const ses = ss.getSheetByName(HOJA_SESIONES) || ss.insertSheet(HOJA_SESIONES);
  ses.getRange(1, 1, 1, 3).setValues([['token', 'codigo', 'creada']]).setFontWeight('bold');
  ses.getRange(1, 1, ses.getMaxRows(), 3).setNumberFormat('@');
  const props = PropertiesService.getScriptProperties();
  const sal = Utilities.getUuid();
  props.setProperty('PANEL_SAL', sal);
  props.setProperty('PANEL_HASH', hashClave(CLAVE_PANEL, sal));
}

function doPost(e) {
  let res;
  try { res = manejar(JSON.parse(e.postData.contents)); }
  catch (err) { res = { error: String(err.message || err) }; }
  return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
}
function doGet() {
  return ContentService.createTextOutput(JSON.stringify({ ok: true, servicio: 'Mapa de Ajuste Elástico' })).setMimeType(ContentService.MimeType.JSON);
}

function manejar(d) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    switch (d.accion) {
      /* ----- Alumnos: cuenta ----- */
      case 'auth.invitacion': {
        const a = buscarPor('invitacion', d.invitacion);
        if (!a) throw new Error('Este link ya se usó o no es válido. Pedile uno nuevo a Andy.');
        return { nombre: a.datos.nombre, email: a.datos.email };
      }
      case 'auth.crearClave': {
        const a = buscarPor('invitacion', d.invitacion);
        if (!a) throw new Error('Este link ya se usó o no es válido. Pedile uno nuevo a Andy.');
        validarClaveNueva(d.clave);
        a.datos.sal = Utilities.getUuid();
        a.datos.hash = hashClave(String(d.clave), a.datos.sal);
        a.datos.invitacion = '';
        escribir(a.fila, a.datos);
        return { token: nuevaSesion(a.datos.codigo), alumno: publico(a.datos) };
      }
      case 'auth.entrar': {
        const a = buscarPor('email', normEmail(d.email));
        if (!a || !a.datos.hash || hashClave(String(d.clave || ''), a.datos.sal) !== a.datos.hash) {
          Utilities.sleep(600);
          throw new Error('El email o la contraseña no coinciden.');
        }
        return { token: nuevaSesion(a.datos.codigo), alumno: publico(a.datos) };
      }
      case 'auth.salir': borrarSesion(d.token); return { ok: true };

      /* ----- Alumnos: su mapa ----- */
      case 'alumno.get': return { alumno: publico(alumnoDeSesion(d.token).datos) };
      case 'alumno.guardar': {
        const a = alumnoDeSesion(d.token);
        const c = d.cambios || {};
        ['prog', 'probs', 'clase', 'claseFecha', 'standard'].forEach(k => { if (k in c) a.datos[k] = c[k]; });
        if (Array.isArray(c.extras)) {
          a.datos.extras = (a.datos.extras || []).map(x => {
            const y = c.extras.find(z => z.id === x.id);
            return Object.assign({}, x, { hecho: !!(y && y.hecho) });
          });
        }
        a.datos.act = hoy();
        escribir(a.fila, a.datos);
        return { ok: true };
      }

      /* ----- Panel de Andy ----- */
      case 'admin.lista':
        validarPanel(d.clave);
        return { alumnos: todos().map(x => publico(x.datos, true)) };
      case 'admin.crear': {
        validarPanel(d.clave);
        const al = d.alumno || {};
        al.email = normEmail(al.email);
        if (!al.codigo || !al.nombre) throw new Error('Falta el nombre');
        if (al.email && buscarPor('email', al.email)) throw new Error('Ya hay un alumno con ese email');
        al.invitacion = nuevoToken();
        hoja().appendRow(aFila(al));
        return { alumno: publico(al, true), invitacion: al.invitacion };
      }
      case 'admin.guardar': {
        validarPanel(d.clave);
        const al = d.alumno || {};
        const a = buscarPor('codigo', al.codigo);
        if (!a) throw new Error('No existe ese alumno');
        al.email = normEmail(al.email);
        const otro = al.email && buscarPor('email', al.email);
        if (otro && otro.datos.codigo !== al.codigo) throw new Error('Ya hay otro alumno con ese email');
        PRIVADAS.forEach(k => { al[k] = a.datos[k]; });   // el panel no toca contraseñas
        escribir(a.fila, al);
        return { ok: true };
      }
      case 'admin.invitar': {
        validarPanel(d.clave);
        const a = buscarPor('codigo', d.codigo);
        if (!a) throw new Error('No existe ese alumno');
        a.datos.invitacion = nuevoToken();
        escribir(a.fila, a.datos);
        return { invitacion: a.datos.invitacion };
      }
      case 'admin.borrar': {
        validarPanel(d.clave);
        const a = buscarPor('codigo', d.codigo);
        if (a) hoja().deleteRow(a.fila);
        return { ok: true };
      }
    }
    throw new Error('Acción desconocida');
  } finally {
    lock.releaseLock();
  }
}

/* ----- Contraseñas y sesiones ----- */
function hashClave(clave, sal) {
  let h = sal + '|' + clave;
  for (let i = 0; i < 300; i++) {
    h = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, h, Utilities.Charset.UTF_8)
      .map(b => ('0' + (b & 0xff).toString(16)).slice(-2)).join('');
  }
  return h;
}
function nuevoToken() { return Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, ''); }
function validarClaveNueva(c) { if (!c || String(c).length < 6) throw new Error('La contraseña tiene que tener al menos 6 caracteres.'); }
function validarPanel(c) {
  const p = PropertiesService.getScriptProperties();
  if (!c || hashClave(String(c), p.getProperty('PANEL_SAL')) !== p.getProperty('PANEL_HASH')) { Utilities.sleep(600); throw new Error('Clave incorrecta'); }
}
function sesiones() { return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_SESIONES); }
function nuevaSesion(codigo) { const t = nuevoToken(); sesiones().appendRow([t, codigo, hoy()]); return t; }
function alumnoDeSesion(token) {
  if (token) {
    const v = sesiones().getDataRange().getValues();
    for (let i = 1; i < v.length; i++) {
      if (String(v[i][0]) === String(token)) {
        const edad = (new Date() - new Date(String(v[i][2]) + 'T12:00:00')) / 86400000;
        if (edad > DIAS_SESION) break;
        const a = buscarPor('codigo', String(v[i][1]));
        if (a) return a;
      }
    }
  }
  throw new Error('Tu sesión se cerró. Volvé a entrar con tu email y contraseña.');
}
function borrarSesion(token) {
  const sh = sesiones(); const v = sh.getDataRange().getValues();
  for (let i = v.length - 1; i >= 1; i--) if (String(v[i][0]) === String(token)) sh.deleteRow(i + 1);
}

/* ----- Planilla ----- */
function hoja() { return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA); }
function hoy() { return Utilities.formatDate(new Date(), ZONA, 'yyyy-MM-dd'); }
function normEmail(e) { return String(e || '').trim().toLowerCase(); }
function todos() {
  const v = hoja().getDataRange().getValues(); const out = [];
  for (let i = 1; i < v.length; i++) if (v[i][0]) out.push({ fila: i + 1, datos: deFila(v[i]) });
  return out;
}
function buscarPor(campo, valor) {
  const x = String(valor || '').trim(); if (!x) return null;
  return todos().find(a => String(a.datos[campo]) === x) || null;
}
function publico(o, paraPanel) {
  const c = {}; Object.keys(o).forEach(k => { if (!PRIVADAS.includes(k)) c[k] = o[k]; });
  if (paraPanel) { c.tieneClave = !!o.hash; c.invitacionPendiente = !!o.invitacion; }
  return c;
}
function deFila(r) {
  const o = {};
  COLUMNAS.forEach((k, i) => {
    let v = r[i];
    if (JSON_COLS.includes(k)) { try { v = v ? JSON.parse(v) : (k === 'extras' ? [] : {}); } catch (e) { v = k === 'extras' ? [] : {}; } }
    else if (k === 'nivel' || k === 'clase') v = Number(v) || (k === 'nivel' ? 2 : 0);
    else if (k === 'pausa') v = v === true || v === 'TRUE' || v === 'true';
    else if (v instanceof Date) v = Utilities.formatDate(v, ZONA, 'yyyy-MM-dd');
    else v = v === null || v === undefined ? '' : String(v);
    o[k] = v;
  });
  return o;
}
function aFila(o) {
  return COLUMNAS.map(k => JSON_COLS.includes(k) ? JSON.stringify(o[k] || (k === 'extras' ? [] : {})) : (o[k] === undefined || o[k] === null ? '' : String(o[k])));
}
function escribir(fila, o) { hoja().getRange(fila, 1, 1, COLUMNAS.length).setValues([aFila(o)]); }
