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
        const mods = validarRegistro(d.registro);
        const nombre = String(d.nombre || '').trim().replace(/\s+/g, ' ');
        const email = normEmail(d.email);
        if (nombre.length < 2) throw new Error('Escribí tu nombre y apellido.');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Revisá el email: parece que tiene un error.');
        validarClaveNueva(d.clave);
        if (buscarPor('email', email)) throw new Error('Ya hay una cuenta con ese email. Entrá con tu contraseña, o escribime por WhatsApp si no te acordás.');
        const al = { codigo: codigoNuevo(nombre), nombre, email, standard: '', nivel: 2, inicio: hoy(), clase: 0, claseFecha: '', pausa: false,
                     nota: '', extras: [], prog: {}, probs: {}, act: hoy(), invitacion: '', modulos: mods, ajustar: '1' };
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
        return { alumnos: todos().map(x => publico(x.datos, true)), propuestas: propuestasPendientes() };
      case 'admin.propuesta': {
        // Aplicar o descartar una propuesta que salió de la transcripción de una clase
        validarPanel(d.clave);
        return resolverPropuesta(d.id, d.decision);
      }
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
        // Un link por combinación de módulos (mods: '0', '01', '01234'…). El de solo Módulo 0 es el de siempre.
        // Con nuevo: true se cambia el de esa combinación y el anterior deja de andar.
        validarPanel(d.clave);
        const p = PropertiesService.getScriptProperties();
        const mods = String(d.mods || '0').replace(/[^0-4]/g, '').split('').filter((x, i, v) => v.indexOf(x) === i).sort().join('') || '0';
        let c;
        if (mods === '0') {
          c = p.getProperty('REGISTRO');
          if (!c || d.nuevo) { c = nuevoToken().slice(0, 12); p.setProperty('REGISTRO', c); }
        } else {
          const mapa = JSON.parse(p.getProperty('REGISTROS') || '{}');
          c = Object.keys(mapa).find(k => mapa[k] === mods);
          if (c && d.nuevo) { delete mapa[c]; c = null; }
          if (!c) { c = nuevoToken().slice(0, 12); mapa[c] = mods; p.setProperty('REGISTROS', JSON.stringify(mapa)); }
        }
        return { registro: c, mods };
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
// Devuelve los módulos con los que entra el alumno según el link que usó
function validarRegistro(c) {
  const p = PropertiesService.getScriptProperties(), v = String(c || '');
  const r = p.getProperty('REGISTRO');
  if (r && v === r) return '0';
  const mapa = JSON.parse(p.getProperty('REGISTROS') || '{}');
  if (v && mapa[v]) return mapa[v];
  throw new Error('Este link ya no funciona. Pedime uno nuevo por WhatsApp.');
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


/* =====================================================================
   CLASES → PROPUESTAS PARA EL PANEL
   Cada hora mira las transcripciones nuevas de Tactiq (carpeta «Clases - Transcripciones») y le pide a Claude,
   por la API, qué pasos del aula se trabajaron, qué quedó para la próxima, dónde se trabó el alumno y qué consejos
   tuyos podrían sumarse al aula. Nada se aplica solo: queda en la hoja «Propuestas» y lo decidís desde el panel.
   Instalación (una vez): Propiedades del script → ANTHROPIC_API_KEY (la misma clave de los resúmenes) y ejecutar
   `instalarRevisionClases`. Para probar con las últimas clases sin esperar: `probarRevisionClases`.
   ===================================================================== */
const CARPETA_TRANSCRIPCIONES = '1HC4Il8coXTn7MOeJ6frV0CdxSY7qEr_m';
const HOJA_PROPUESTAS = 'Propuestas';
const PROP_COLS = ['id', 'fecha', 'codigo', 'nombre', 'tipo', 'paso', 'texto', 'detalle', 'estado', 'archivo'];
const MODELO_CLASES = 'claude-sonnet-5-5';
const URL_PASOS = 'https://aula.ajuste-elastico.com/pasos.json';
const AVISAR_POR_MAIL = true;   // te manda un mail cuando hay propuestas nuevas

function hojaPropuestas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(HOJA_PROPUESTAS);
  if (!sh) { sh = ss.insertSheet(HOJA_PROPUESTAS); sh.getRange(1, 1, 1, PROP_COLS.length).setValues([PROP_COLS]).setFontWeight('bold'); sh.setFrozenRows(1); }
  return sh;
}
function propuestasPendientes() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_PROPUESTAS);
  if (!sh) return [];
  const v = sh.getDataRange().getValues(), out = [];
  for (let i = 1; i < v.length; i++) {
    const o = {}; PROP_COLS.forEach((k, j) => { o[k] = v[i][j] instanceof Date ? Utilities.formatDate(v[i][j], ZONA, 'yyyy-MM-dd') : String(v[i][j]); });
    if (o.estado === 'pendiente') out.push(o);
  }
  return out;
}
function resolverPropuesta(id, decision) {
  const sh = hojaPropuestas(), v = sh.getDataRange().getValues();
  const i = v.findIndex((r, k) => k > 0 && String(r[0]) === String(id));
  if (i < 0) throw new Error('Esa propuesta ya no está');
  const o = {}; PROP_COLS.forEach((k, j) => { o[k] = String(v[i][j]); });
  let estado = 'descartada', alumno = null;
  if (decision === 'aplicar') {
    const a = buscarPor('codigo', o.codigo);
    if (!a) throw new Error('No encuentro a ese alumno');
    const al = a.datos;
    if (o.tipo === 'paso') { const pr = al.prog[o.paso] || {}; if (!pr.hecho) al.prog[o.paso] = Object.assign(pr, { hecho: true, como: pr.como || 'listo', t: o.fecha || hoy(), origen: 'clase' }); }
    else if (o.tipo === 'clase') { al.clase = Math.min(16, (Number(al.clase) || 0) + 1); al.claseFecha = o.fecha || hoy(); }
    else if (o.tipo === 'proxima') { al.extras = (al.extras || []).concat([{ id: 'c' + Date.now(), titulo: o.texto, detalle: o.detalle || '', hecho: false }]); }
    escribir(a.fila, al); alumno = publico(al, true);
    estado = o.tipo === 'consejo' ? 'para-sumar' : 'aplicada';   // los consejos los suma Claude al aula cuando se lo pidas
  } else if (decision === 'consejo') estado = 'para-sumar';
  sh.getRange(i + 1, PROP_COLS.indexOf('estado') + 1).setValue(estado);
  return { ok: true, estado, alumno };
}

function instalarRevisionClases() {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'revisarClases').forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('revisarClases').timeBased().everyHours(1).create();
  // las clases que ya estaban quedan como vistas, para no gastar en el pasado
  const it = DriveApp.getFolderById(CARPETA_TRANSCRIPCIONES).getFiles(), vistas = [];
  while (it.hasNext()) vistas.push(it.next().getId());
  PropertiesService.getScriptProperties().setProperty('CLASES_VISTAS', JSON.stringify(vistas.slice(-400)));
  hojaPropuestas();
  Logger.log('Listo: cada hora reviso las transcripciones nuevas. Ya había ' + vistas.length + ' y las dejé como vistas.');
}
function probarRevisionClases() { revisarClases(3, true); }   // procesa las 3 últimas aunque ya estén vistas

function revisarClases(cuantas, forzar) {
  const props = PropertiesService.getScriptProperties();
  const key = props.getProperty('ANTHROPIC_API_KEY');
  if (!key) throw new Error('Falta la propiedad ANTHROPIC_API_KEY');
  const vistas = JSON.parse(props.getProperty('CLASES_VISTAS') || '[]');
  const it = DriveApp.getFolderById(CARPETA_TRANSCRIPCIONES).getFiles(), nuevas = [];
  while (it.hasNext()) {
    const f = it.next();
    if (f.getName().indexOf('🎸') < 0) continue;
    if (!forzar && vistas.indexOf(f.getId()) >= 0) continue;
    if (Date.now() - f.getLastUpdated().getTime() < 10 * 60 * 1000) continue;   // Tactiq todavía la está escribiendo
    nuevas.push(f);
  }
  nuevas.sort((a, b) => b.getDateCreated() - a.getDateCreated());
  const lote = nuevas.slice(0, cuantas || 6);
  if (!lote.length) return;
  const pasos = JSON.parse(UrlFetchApp.fetch(URL_PASOS, { muteHttpExceptions: true }).getContentText() || '[]');
  const alumnos = todos().map(x => x.datos);
  const nuevasProps = [];
  lote.forEach(f => {
    try {
      const texto = f.getMimeType() === MimeType.GOOGLE_DOCS ? DocumentApp.openById(f.getId()).getBody().getText() : f.getBlob().getDataAsString();
      if (texto.length > 400) nuevasProps.push.apply(nuevasProps, analizarClase(key, f, texto, pasos, alumnos));
      if (vistas.indexOf(f.getId()) < 0) vistas.push(f.getId());
    } catch (e) { Logger.log('Error con ' + f.getName() + ': ' + e); }
  });
  props.setProperty('CLASES_VISTAS', JSON.stringify(vistas.slice(-400)));
  if (nuevasProps.length) {
    const sh = hojaPropuestas();
    sh.getRange(sh.getLastRow() + 1, 1, nuevasProps.length, PROP_COLS.length).setNumberFormat('@').setValues(nuevasProps.map(o => PROP_COLS.map(k => o[k] || '')));
    if (AVISAR_POR_MAIL) {
      const porAlumno = {}; nuevasProps.forEach(o => { porAlumno[o.nombre || 'Sin identificar'] = (porAlumno[o.nombre || 'Sin identificar'] || 0) + 1; });
      MailApp.sendEmail(Session.getEffectiveUser().getEmail(), 'Aula AE: ' + nuevasProps.length + ' cosas para revisar de las clases',
        'Salieron de las clases:\n\n' + Object.keys(porAlumno).map(n => '- ' + n + ': ' + porAlumno[n]).join('\n') + '\n\nRevisalas en el panel: ' + ORIGENES[0] + '/?admin');
    }
  }
}

function analizarClase(key, archivo, transcripcion, pasos, alumnos) {
  const lista = alumnos.map(a => {
    const hechos = Object.keys(a.prog || {}).filter(id => a.prog[id] && a.prog[id].hecho);
    return a.codigo + ' | ' + a.nombre + ' | clases: ' + (a.clase || 0) + ' | pasos hechos: ' + (hechos.join(', ') || 'ninguno');
  }).join('\n');
  const catalogo = pasos.map(p => p.id + ' | M' + p.modulo + ' | ' + p.titulo + (p.consigna ? ' — ' + p.consigna : '')).join('\n');
  const sistema = [
    'Sos el asistente de Andy Kligman, profesor de improvisación en guitarra jazz (programa Ajuste Elástico). Leés la transcripción de una clase 1 a 1 y proponés cambios para el panel del aula virtual. Andy revisa todo antes de aplicarlo, así que sé preciso y no inventes: solo lo que se dice en la clase.',
    'Devolvé SOLO un JSON válido, sin texto alrededor, con esta forma:',
    '{"codigo": "código del alumno o null si no podés identificarlo", "pasos_hechos": [{"id": "id del paso", "evidencia": "frase corta de la clase que lo muestra"}], "para_la_proxima": ["tarea concreta que Andy le pidió para la próxima clase, en voz de Andy, corta, con voseo rioplatense"], "trabas": [{"paso": "id o null", "problema": "qué le costó", "lo_que_dijo_andy": "la devolución o solución que dio Andy"}], "consejos": [{"paso": "id o null", "situacion": "cuándo sirve (ej: si se traba en el cambio de acorde)", "consejo": "el consejo, en palabras de Andy, corto"}]}',
    'Reglas:',
    '- codigo: identificá al alumno por el nombre del archivo, por quién habla en la transcripción y por la lista de alumnos. Si dudás entre dos, null.',
    '- pasos_hechos: solo pasos del catálogo que el alumno ya hizo o que quedaron claramente trabajados y resueltos en la clase. No repitas los que ya figuran como hechos. Si no hay evidencia clara, no lo pongas.',
    '- para_la_proxima: lo que Andy le dejó para practicar. Nada de logística ("te mando un video"). Como mucho 4.',
    '- trabas: dificultades concretas que aparecieron y cómo las resolvió Andy. Como mucho 3.',
    '- consejos: solo explicaciones de Andy que servirían a OTROS alumnos en el mismo paso (generales, no personales). Como mucho 2. Si no hay, lista vacía.',
    '- Cifrado de acordes en notación americana (Gmaj7, E-7, G7b9).',
  ].join('\n');
  const usuario = 'Archivo: ' + archivo.getName() + ' (' + Utilities.formatDate(archivo.getDateCreated(), ZONA, 'yyyy-MM-dd') + ')\n\nALUMNOS:\n' + lista + '\n\nCATÁLOGO DE PASOS DEL AULA:\n' + catalogo + '\n\nTRANSCRIPCIÓN:\n' + transcripcion.slice(0, 120000);
  const r = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    payload: JSON.stringify({ model: MODELO_CLASES, max_tokens: 2500, system: sistema, messages: [{ role: 'user', content: usuario }] }),
  });
  if (r.getResponseCode() !== 200) throw new Error('API ' + r.getResponseCode() + ': ' + r.getContentText().slice(0, 300));
  const txt = JSON.parse(r.getContentText()).content.map(c => c.text || '').join('');
  const j = JSON.parse(txt.slice(txt.indexOf('{'), txt.lastIndexOf('}') + 1));
  const al = alumnos.find(a => a.codigo === j.codigo) || null;
  const fecha = Utilities.formatDate(archivo.getDateCreated(), ZONA, 'yyyy-MM-dd');
  const base = { fecha, codigo: al ? al.codigo : '', nombre: al ? al.nombre : archivo.getName().replace('🎸', '').trim() + ' (sin identificar)', estado: 'pendiente', archivo: archivo.getUrl() };
  const out = [], idp = () => 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const existe = id => pasos.some(p => p.id === id);
  if (al) out.push(Object.assign({}, base, { id: idp(), tipo: 'clase', texto: 'Sumar la clase del ' + fecha }));
  (j.pasos_hechos || []).forEach(x => { if (existe(x.id) && !(al && al.prog[x.id] && al.prog[x.id].hecho)) out.push(Object.assign({}, base, { id: idp(), tipo: 'paso', paso: x.id, texto: (pasos.find(p => p.id === x.id) || {}).titulo, detalle: x.evidencia || '' })); });
  (j.para_la_proxima || []).forEach(t => out.push(Object.assign({}, base, { id: idp(), tipo: 'proxima', texto: t })));
  (j.trabas || []).forEach(x => out.push(Object.assign({}, base, { id: idp(), tipo: 'traba', paso: existe(x.paso) ? x.paso : '', texto: x.problema, detalle: x.lo_que_dijo_andy || '' })));
  (j.consejos || []).forEach(x => out.push(Object.assign({}, base, { id: idp(), tipo: 'consejo', paso: existe(x.paso) ? x.paso : '', texto: x.consejo, detalle: x.situacion || '' })));
  return out;
}
