/**
 * Mapa de Ajuste Elástico — servidor en Google Apps Script (guarda todo en esta planilla)
 *
 * Instalación (una sola vez):
 * 1. Crear una planilla de Google nueva, por ejemplo "Mapa Ajuste Elástico".
 * 2. Extensiones > Apps Script. Borrar lo que haya, pegar este archivo entero y guardar.
 * 3. Elegir la función `configurar` arriba y tocar "Ejecutar" (la primera vez pide permisos).
 * 4. Implementar > Nueva implementación > Tipo: Aplicación web.
 *    Ejecutar como: Yo. Quién tiene acceso: Cualquier usuario.
 * 5. Copiar la URL que termina en /exec y pegarla en la página (const API_URL = '...').
 * La primera clave que se use para entrar al panel (?admin) queda como clave del panel.
 */

const ZONA = 'America/Argentina/Buenos_Aires';
const HOJA = 'Alumnos';
const HOJA_SESIONES = 'Sesiones';
const COLUMNAS = ['codigo', 'nombre', 'email', 'standard', 'nivel', 'inicio', 'clase', 'claseFecha', 'pausa', 'nota',
                  'extras', 'prog', 'probs', 'act', 'hash', 'sal', 'invitacion', 'modulos', 'ajustar'];
const JSON_COLS = ['extras', 'prog', 'probs'];
const PRIVADAS = ['hash', 'sal', 'invitacion'];      // nunca salen de la planilla
const DIAS_SESION = 180;
const CARPETA_VIDEOS = 'Aula AE - Videos';            // en tu Drive, una subcarpeta por alumno
const ORIGENES = ['https://aula.ajuste-elastico.com', 'https://andykligman.github.io'];   // páginas que suben videos (la primera es la principal)
const DIAS_VIDEOS = 90;                                // después van a la papelera de Drive
const MB_MAX = 400;

function configurar() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(HOJA) || ss.insertSheet(HOJA);
  sh.getRange(1, 1, 1, COLUMNAS.length).setValues([COLUMNAS]).setFontWeight('bold');
  sh.setFrozenRows(1);
  sh.getRange(1, 1, sh.getMaxRows(), COLUMNAS.length).setNumberFormat('@');
  const ses = ss.getSheetByName(HOJA_SESIONES) || ss.insertSheet(HOJA_SESIONES);
  ses.getRange(1, 1, 1, 3).setValues([['token', 'codigo', 'creada']]).setFontWeight('bold');
  ses.getRange(1, 1, ses.getMaxRows(), 3).setNumberFormat('@');
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
        if (!a) throw new Error('Este link ya se usó o no es válido. Pedime uno nuevo por WhatsApp.');
        return { nombre: a.datos.nombre, email: a.datos.email };
      }
      case 'auth.crearClave': {
        const a = buscarPor('invitacion', d.invitacion);
        if (!a) throw new Error('Este link ya se usó o no es válido. Pedime uno nuevo por WhatsApp.');
        validarClaveNueva(d.clave);
        a.datos.sal = Utilities.getUuid();
        a.datos.hash = hashClave(String(d.clave), a.datos.sal);
        a.datos.invitacion = '';
        escribir(a.fila, a.datos);
        return { token: nuevaSesion(a.datos.codigo), alumno: publico(a.datos) };
      }
      /* ----- Link único para alumnos nuevos: se registran solos y Andy ajusta nivel y fecha ----- */
      case 'auth.registrar': {
        validarRegistro(d.registro);
        const nombre = String(d.nombre || '').trim().replace(/\s+/g, ' ');
        const email = normEmail(d.email);
        if (nombre.length < 2) throw new Error('Escribí tu nombre y apellido.');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Revisá el email: parece que tiene un error.');
        validarClaveNueva(d.clave);
        if (buscarPor('email', email)) throw new Error('Ya hay una cuenta con ese email. Entrá con tu contraseña, o escribime por WhatsApp si no te acordás.');
        const al = { codigo: codigoNuevo(nombre), nombre, email, standard: '', nivel: 2, inicio: hoy(), clase: 0, claseFecha: '', pausa: false,
                     nota: '', extras: [], prog: {}, probs: {}, act: hoy(), invitacion: '', modulos: '0', ajustar: '1' };
        al.sal = Utilities.getUuid();
        al.hash = hashClave(String(d.clave), al.sal);
        agregarFila(al);
        return { token: nuevaSesion(al.codigo), alumno: publico(al) };
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
        ['clase', 'claseFecha', 'standard'].forEach(k => { if (k in c) a.datos[k] = c[k]; });
        // Paso por paso: solo se tocan los pasos que cambiaron en ese dispositivo (no se pisa lo hecho en otro)
        if (c.progCambios) a.datos.prog = unirPasos(a.datos.prog, c.progCambios); else if ('prog' in c) a.datos.prog = c.prog;
        if (c.probsCambios) a.datos.probs = unirPasos(a.datos.probs, c.probsCambios); else if ('probs' in c) a.datos.probs = c.probs;
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

      /* ----- Videos: el navegador sube directo a tu Drive; acá solo se abre la subida ----- */
      case 'video.iniciar': {
        const a = alumnoDeSesion(d.token);
        const paso = String(d.paso || '');
        if (!/^[a-z0-9]{1,8}$/.test(paso)) throw new Error('Paso inválido');
        const tam = Number(d.tam) || 0;
        if (tam <= 0 || tam > MB_MAX * 1024 * 1024) throw new Error('El video es demasiado largo. Grabá uno más corto (hasta unos minutos).');
        const mime = /^video\/[\w.+-]+$/.test(String(d.mime || '').split(';')[0]) ? String(d.mime).split(';')[0] : 'video/mp4';
        const ext = /webm/.test(mime) ? 'webm' : /quicktime/.test(mime) ? 'mov' : 'mp4';
        const nombre = `${a.datos.nombre} - ${paso} - ${Utilities.formatDate(new Date(), ZONA, 'yyyy-MM-dd HH.mm')}.${ext}`;
        asegurarLimpieza();
        const r = UrlFetchApp.fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable', {
          method: 'post', contentType: 'application/json', muteHttpExceptions: true,
          payload: JSON.stringify({ name: nombre, mimeType: mime, parents: [carpetaAlumno(a.datos).getId()] }),
          headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken(), 'X-Upload-Content-Type': mime, 'X-Upload-Content-Length': String(tam), Origin: ORIGENES.includes(d.origen) ? d.origen : ORIGENES[0] }
        });
        const url = r.getHeaders().Location || r.getHeaders().location;
        if (!url) throw new Error('No se pudo empezar a subir el video. Probá de nuevo en un rato.');
        return { url };
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
        agregarFila(al);
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
      case 'admin.cambiar': {
        // Guarda solo lo que se cambió en el panel; el avance del alumno se une paso por paso
        validarPanel(d.clave);
        const a = buscarPor('codigo', d.codigo);
        if (!a) throw new Error('No existe ese alumno');
        const c = d.cambios || {};
        if ('email' in c) {
          c.email = normEmail(c.email);
          const otro = c.email && buscarPor('email', c.email);
          if (otro && otro.datos.codigo !== a.datos.codigo) throw new Error('Ya hay otro alumno con ese email');
        }
        Object.keys(c).forEach(k => {
          if (PRIVADAS.includes(k) || k === 'codigo') return;
          if (k === 'progCambios') a.datos.prog = unirPasos(a.datos.prog, c.progCambios);
          else if (k === 'probsCambios') a.datos.probs = unirPasos(a.datos.probs, c.probsCambios);
          else if (COLUMNAS.includes(k)) a.datos[k] = c[k];
        });
        escribir(a.fila, a.datos);
        return { alumno: publico(a.datos, true) };
      }
      case 'admin.registro': {
        // El código del link único; con nuevo: true se cambia y el link anterior deja de andar
        validarPanel(d.clave);
        const p = PropertiesService.getScriptProperties();
        let c = p.getProperty('REGISTRO');
        if (!c || d.nuevo) { c = nuevoToken().slice(0, 12); p.setProperty('REGISTRO', c); }
        return { registro: c };
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
function validarRegistro(c) {
  const r = PropertiesService.getScriptProperties().getProperty('REGISTRO');
  if (!r || String(c || '') !== r) throw new Error('Este link ya no funciona. Pedime uno nuevo por WhatsApp.');
}
function codigoNuevo(nombre) {
  const base = String(nombre || 'alumno').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '').slice(0, 8) || 'alumno';
  const abc = 'abcdefghjkmnpqrstuvwxyz23456789';
  let c;
  do { c = base + '-'; for (let i = 0; i < 4; i++) c += abc[Math.floor(Math.random() * abc.length)]; } while (buscarPor('codigo', c));
  return c;
}
function validarPanel(c) {
  const p = PropertiesService.getScriptProperties();
  if (!p.getProperty('PANEL_HASH')) {                 // primera vez: esta clave queda como clave del panel
    validarClaveNueva(c);
    const lock = LockService.getScriptLock(); lock.waitLock(10000);
    try {
      if (!p.getProperty('PANEL_HASH')) { const sal = Utilities.getUuid(); p.setProperty('PANEL_SAL', sal); p.setProperty('PANEL_HASH', hashClave(String(c), sal)); }
    } finally { lock.releaseLock(); }
  }
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
// Todo como texto: si no, la planilla convierte «01» (módulos 0 y 1) en el número 1 y se pierde el módulo 0
function escribir(fila, o) { hoja().getRange(fila, 1, 1, COLUMNAS.length).setNumberFormat('@').setValues([aFila(o)]); }
function agregarFila(o) { const sh = hoja(); const f = sh.getLastRow() + 1; sh.getRange(f, 1, 1, COLUMNAS.length).setNumberFormat('@').setValues([aFila(o)]); }

/* ----- Videos en Drive ----- */
function carpetaVideos() {
  const it = DriveApp.getFoldersByName(CARPETA_VIDEOS);
  return it.hasNext() ? it.next() : DriveApp.createFolder(CARPETA_VIDEOS);
}
function carpetaAlumno(al) {
  const raiz = carpetaVideos(), nombre = `${al.nombre} (${al.codigo})`;
  const it = raiz.getFoldersByName(nombre);
  return it.hasNext() ? it.next() : raiz.createFolder(nombre);
}
// Todos los días: los videos de más de DIAS_VIDEOS días van a la papelera (se recuperan durante 30 días)
function limpiarVideos() {
  const limite = Date.now() - DIAS_VIDEOS * 86400000;
  const subs = carpetaVideos().getFolders();
  while (subs.hasNext()) {
    const fs = subs.next().getFiles();
    while (fs.hasNext()) { const f = fs.next(); if (f.getDateCreated().getTime() < limite) f.setTrashed(true); }
  }
}
function asegurarLimpieza() {
  if (!ScriptApp.getProjectTriggers().some(t => t.getHandlerFunction() === 'limpiarVideos'))
    ScriptApp.newTrigger('limpiarVideos').timeBased().everyDays(1).atHour(4).create();
}
// Para correr una vez a mano después de pegar este archivo: crea la carpeta y pide los permisos de Drive
function configurarVideos() { carpetaVideos(); asegurarLimpieza(); Logger.log('Listo: carpeta "' + CARPETA_VIDEOS + '" en tu Drive.'); }
// Si al mandar un video aparece un error de permisos (UrlFetchApp): ejecutá esta función una vez y aceptá todos los permisos
function autorizarVideos() {
  UrlFetchApp.fetch('https://www.googleapis.com/drive/v3/about?fields=user', { headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() } });
  Logger.log('Listo: permisos para subir videos.');
}

/* Une cambios paso por paso: null borra el paso; los videos ya vistos por Andy siguen marcados como vistos */
function unirPasos(actual, cambios) {
  const o = Object.assign({}, actual || {});
  Object.keys(cambios || {}).forEach(id => {
    const v = cambios[id];
    if (v === null) { delete o[id]; return; }
    const viejo = o[id];
    if (v && viejo && Array.isArray(v.videos) && Array.isArray(viejo.videos)) {
      const visto = {}; viejo.videos.forEach(x => { if (x.visto) visto[x.id] = true; });
      v.videos.forEach(x => { if (visto[x.id]) x.visto = true; });
      viejo.videos.forEach(x => { if (!v.videos.some(y => y.id === x.id)) v.videos.push(x); });
    }
    o[id] = v;
  });
  return o;
}
