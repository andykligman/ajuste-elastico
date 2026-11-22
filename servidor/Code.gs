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
      case 'alumno.get': { const a = publico(alumnoDeSesion(d.token).datos); a.clases = clasesDe(a.codigo); return { alumno: a }; }
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
        { const cl = leerClases();
          return { alumnos: todos().map(x => { const a = publico(x.datos, true); a.clases = cl.filter(c => c.codigo === a.codigo && c.estado === 'publicada').map(paraAlumno); return a; }),
                   propuestas: propuestasPendientes(), borradores: cl.filter(c => c.estado === 'borrador') }; }
      case 'admin.clase': {
        // Publicar (o no) el resumen de una clase en el aula del alumno
        validarPanel(d.clave);
        return resolverClase(d.id, d.decision, d.codigo);
      }
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
   CLASES EN EL AULA
   Parte de los resúmenes que ya arma el proyecto «Resúmenes de clases AE» (carpeta «Clases - Resúmenes»).
   Por cada resumen nuevo, Claude (por la API) lo relaciona con los pasos del aula:
   - cada tarea de «Para la semana que viene» con el paso que le corresponde (en el aula sale un botón que lleva ahí),
     o sin paso, como algo para trabajar;
   - los pasos que en la clase quedaron hechos, para que el alumno los marque si quiere;
   - consejos que podrían sumarse al aula, que quedan como propuesta para Andy (nunca van solos al aula).
   El resumen queda como borrador en el panel: lo publicás con un toque (si editaste el Doc, se publica lo editado).
   Corre lunes, martes, jueves y viernes a las 21. Instalación (una vez): Propiedades del script → ANTHROPIC_API_KEY y ejecutar `instalarRevisionClases`.
   Para probar con los últimos resúmenes sin esperar: `probarRevisionClases`.
   ===================================================================== */
const CARPETA_RESUMENES = '1RvyO8DVeurj2Nasp4okHhR2TvfQnR7hZ';
const PUBLICAR_SOLO = false;   // true: el resumen aparece en el aula del alumno sin pasar por el panel
const AVISAR_POR_MAIL = true;  // te avisa por mail cuando hay clases para revisar
const MODELO_CLASES = 'claude-sonnet-5-5';
const URL_PASOS = 'https://aula.ajuste-elastico.com/pasos.json';
const HOJA_CLASES = 'Clases';
const CLASE_COLS = ['id', 'codigo', 'nombre', 'fecha', 'doc', 'resumen', 'datos', 'estado', 'creada'];
const HOJA_PROPUESTAS = 'Propuestas';
const PROP_COLS = ['id', 'fecha', 'codigo', 'nombre', 'tipo', 'paso', 'texto', 'detalle', 'estado', 'archivo'];

/* ----- Hojas ----- */
function hojaCon(nombre, cols) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(nombre);
  if (!sh) { sh = ss.insertSheet(nombre); sh.getRange(1, 1, 1, cols.length).setValues([cols]).setFontWeight('bold'); sh.setFrozenRows(1); }
  return sh;
}
function leerHoja(nombre, cols) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nombre);
  if (!sh) return [];
  return sh.getDataRange().getValues().slice(1).map((r, i) => {
    const o = { _fila: i + 2 }; cols.forEach((k, j) => { o[k] = r[j] instanceof Date ? Utilities.formatDate(r[j], ZONA, 'yyyy-MM-dd') : String(r[j]); });
    return o;
  }).filter(o => o.id);
}
function leerClases() {
  return leerHoja(HOJA_CLASES, CLASE_COLS).map(c => { try { c.datos = JSON.parse(c.datos || '{}'); } catch (e) { c.datos = {}; } return c; })
    .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
}
function guardarClase(c) {
  const sh = hojaCon(HOJA_CLASES, CLASE_COLS);
  const fila = c._fila || sh.getLastRow() + 1;
  const o = Object.assign({}, c, { datos: JSON.stringify(c.datos || {}) });
  sh.getRange(fila, 1, 1, CLASE_COLS.length).setNumberFormat('@').setValues([CLASE_COLS.map(k => o[k] == null ? '' : String(o[k]))]);
  c._fila = fila;
}
function paraAlumno(c) { return { id: c.id, fecha: c.fecha, resumen: c.resumen, tareas: c.datos.tareas || [], pasos: c.datos.pasos || [] }; }
function clasesDe(codigo) { return leerClases().filter(c => c.codigo === codigo && c.estado === 'publicada').map(paraAlumno); }
function propuestasPendientes() { return leerHoja(HOJA_PROPUESTAS, PROP_COLS).filter(o => o.estado === 'pendiente').map(o => { delete o._fila; return o; }); }

/* ----- Panel: publicar resúmenes y resolver propuestas ----- */
function resolverClase(id, decision, codigo) {
  const c = leerClases().find(x => x.id === String(id));
  if (!c) throw new Error('Esa clase ya no está');
  if (codigo) { const a = buscarPor('codigo', codigo); if (!a) throw new Error('No encuentro a ese alumno'); c.codigo = codigo; c.nombre = a.datos.nombre; }
  if (decision === 'publicar') {
    if (!c.codigo) throw new Error('Elegí de quién es esta clase');
    // si editaste el Doc, se publica lo editado (y se vuelve a relacionar con los pasos)
    const txt = textoDoc(c.doc);
    if (txt && txt !== c.resumen) {
      c.resumen = txt;
      const key = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');
      if (key) { try { const r = relacionar(key, txt, c.nombre, JSON.parse(UrlFetchApp.fetch(URL_PASOS).getContentText()), todos().map(x => x.datos), c.codigo); c.datos = { tareas: r.tareas, pasos: r.pasos }; } catch (e) { Logger.log(e); } }
    }
    c.estado = 'publicada';
  } else c.estado = 'descartada';
  guardarClase(c);
  return { ok: true, clase: c.estado === 'publicada' ? Object.assign(paraAlumno(c), { codigo: c.codigo }) : null };
}
function resolverPropuesta(id, decision) {
  const o = leerHoja(HOJA_PROPUESTAS, PROP_COLS).find(x => x.id === String(id));
  if (!o) throw new Error('Esa propuesta ya no está');
  let estado = 'descartada', alumno = null;
  if (decision === 'aplicar' && o.tipo === 'clase') {
    const a = buscarPor('codigo', o.codigo); if (!a) throw new Error('No encuentro a ese alumno');
    a.datos.clase = Math.min(16, (Number(a.datos.clase) || 0) + 1); a.datos.claseFecha = o.fecha || hoy();
    escribir(a.fila, a.datos); alumno = publico(a.datos, true); estado = 'aplicada';
  } else if (decision === 'consejo' || (decision === 'aplicar' && o.tipo === 'consejo')) estado = 'para-sumar';   // los suma Claude al aula cuando se lo pidas
  else if (decision === 'aplicar') estado = 'aplicada';
  hojaCon(HOJA_PROPUESTAS, PROP_COLS).getRange(o._fila, PROP_COLS.indexOf('estado') + 1).setValue(estado);
  return { ok: true, estado, alumno };
}

/* ----- Revisión automática ----- */
function instalarRevisionClases() {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'revisarClases').forEach(t => ScriptApp.deleteTrigger(t));
  // lunes, martes, jueves y viernes a las 21 (hora del proyecto: Configuración → Zona horaria, Buenos Aires)
  [ScriptApp.WeekDay.MONDAY, ScriptApp.WeekDay.TUESDAY, ScriptApp.WeekDay.THURSDAY, ScriptApp.WeekDay.FRIDAY]
    .forEach(dia => ScriptApp.newTrigger('revisarClases').timeBased().onWeekDay(dia).atHour(21).nearMinute(0).create());
  // los resúmenes que ya estaban quedan como vistos (para traer algunos viejos: probarRevisionClases)
  const it = DriveApp.getFolderById(CARPETA_RESUMENES).getFiles(), vistas = [];
  while (it.hasNext()) vistas.push(it.next().getId());
  PropertiesService.getScriptProperties().setProperty('CLASES_VISTAS', JSON.stringify(vistas.slice(-400)));
  hojaCon(HOJA_CLASES, CLASE_COLS); hojaCon(HOJA_PROPUESTAS, PROP_COLS);
  Logger.log('Listo: lunes, martes, jueves y viernes a las 21 reviso los resúmenes nuevos. Había ' + vistas.length + ' y los dejé como vistos.');
}
function probarRevisionClases() { revisarClases(3, true); }

function revisarClases(cuantas, forzar) {
  const props = PropertiesService.getScriptProperties();
  const key = props.getProperty('ANTHROPIC_API_KEY');
  if (!key) throw new Error('Falta la propiedad ANTHROPIC_API_KEY');
  const vistas = JSON.parse(props.getProperty('CLASES_VISTAS') || '[]');
  const it = DriveApp.getFolderById(CARPETA_RESUMENES).getFiles(), nuevas = [];
  while (it.hasNext()) {
    const f = it.next();
    if (f.getMimeType() !== MimeType.GOOGLE_DOCS) continue;
    if (!forzar && vistas.indexOf(f.getId()) >= 0) continue;
    if (Date.now() - f.getLastUpdated().getTime() < 5 * 60 * 1000) continue;   // todavía se está escribiendo
    nuevas.push(f);
  }
  nuevas.sort((a, b) => b.getDateCreated() - a.getDateCreated());
  const lote = nuevas.slice(0, cuantas || 6);
  if (!lote.length) return;
  const pasos = JSON.parse(UrlFetchApp.fetch(URL_PASOS).getContentText());
  const alumnos = todos().map(x => x.datos);
  const existentes = leerClases(), aviso = [];
  lote.forEach(f => {
    try {
      const resumen = textoDoc(f.getId());
      if (resumen.length < 200) return;
      const nombreArch = f.getName().replace(/^Resumen\s*-\s*/i, '');
      const fecha = (f.getName().match(/\d{4}-\d{2}-\d{2}/) || [Utilities.formatDate(f.getDateCreated(), ZONA, 'yyyy-MM-dd')])[0];
      const r = relacionar(key, resumen, nombreArch, pasos, alumnos, null);
      const al = alumnos.find(a => a.codigo === r.codigo) || null;
      const c = existentes.find(x => x.doc === f.getId()) || { id: 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), creada: hoy() };
      Object.assign(c, { codigo: al ? al.codigo : '', nombre: al ? al.nombre : nombreArch.replace(/\s*-\s*\d{4}-\d{2}-\d{2}.*/, ''), fecha, doc: f.getId(), resumen,
        datos: { tareas: r.tareas, pasos: r.pasos }, estado: c.estado === 'publicada' ? 'publicada' : (PUBLICAR_SOLO && al ? 'publicada' : 'borrador') });
      guardarClase(c);
      const props_ = [];
      if (al && c.creada === hoy()) props_.push({ tipo: 'clase', texto: 'Sumar la clase del ' + fecha });
      (r.consejos || []).forEach(x => props_.push({ tipo: 'consejo', paso: x.paso || '', texto: x.consejo, detalle: x.situacion || '' }));
      if (props_.length) {
        const sh = hojaCon(HOJA_PROPUESTAS, PROP_COLS);
        sh.getRange(sh.getLastRow() + 1, 1, props_.length, PROP_COLS.length).setNumberFormat('@').setValues(props_.map(o => {
          const fila = Object.assign({ id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), fecha, codigo: c.codigo, nombre: c.nombre, estado: 'pendiente', archivo: f.getUrl() }, o);
          return PROP_COLS.map(k => fila[k] || '');
        }));
      }
      aviso.push(c.nombre + (c.estado === 'publicada' ? ' (ya publicada)' : ''));
      if (vistas.indexOf(f.getId()) < 0) vistas.push(f.getId());
    } catch (e) { Logger.log('Error con ' + f.getName() + ': ' + e); }
  });
  props.setProperty('CLASES_VISTAS', JSON.stringify(vistas.slice(-400)));
  if (AVISAR_POR_MAIL && aviso.length) MailApp.sendEmail(Session.getEffectiveUser().getEmail(), 'Aula AE: clases para revisar',
    'Ya están en el panel:\n\n' + aviso.map(n => '- ' + n).join('\n') + '\n\n' + ORIGENES[0] + '/?admin');
}

/* El resumen del Doc, como texto con **negritas**, # títulos y listas, para mostrarlo en el aula */
function textoDoc(id) {
  if (!id) return '';
  const body = DocumentApp.openById(id).getBody(), out = [];
  for (let i = 0; i < body.getNumChildren(); i++) {
    const el = body.getChild(i), t = el.getType();
    if (t !== DocumentApp.ElementType.PARAGRAPH && t !== DocumentApp.ElementType.LIST_ITEM) continue;
    const txt = el.asText(), plano = txt.getText();
    if (!plano.trim()) { out.push(''); continue; }
    let s = '', idx = txt.getTextAttributeIndices();
    idx.forEach((ini, k) => {
      const fin = k + 1 < idx.length ? idx[k + 1] : plano.length, trozo = plano.slice(ini, fin);
      s += txt.isBold(ini) && trozo.trim() ? trozo.replace(/^(\s*)(.*?)(\s*)$/, '$1**$2**$3') : trozo;
    });
    s = s.replace(/\*\*\*\*/g, '');
    const h = t === DocumentApp.ElementType.PARAGRAPH ? el.asParagraph().getHeading() : null;
    if (h && h !== DocumentApp.ParagraphHeading.NORMAL) { out.push('# ' + plano.trim()); continue; }
    if (t === DocumentApp.ElementType.LIST_ITEM) {
      const li = el.asListItem(), num = [DocumentApp.GlyphType.NUMBER, DocumentApp.GlyphType.LATIN_LOWER, DocumentApp.GlyphType.ROMAN_LOWER].indexOf(li.getGlyphType()) >= 0;
      if (num) { let n = 1; for (let j = i - 1; j >= 0 && body.getChild(j).getType() === DocumentApp.ElementType.LIST_ITEM && body.getChild(j).asListItem().getListId() === li.getListId(); j--) n++; s = n + ') ' + s; }
      else s = '- ' + s;
    }
    out.push(s);
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/* Claude relaciona el resumen con los pasos del aula */
function relacionar(key, resumen, nombreArch, pasos, alumnos, codigoFijo) {
  const lista = alumnos.map(a => {
    const hechos = Object.keys(a.prog || {}).filter(id => a.prog[id] && a.prog[id].hecho);
    return a.codigo + ' | ' + a.nombre + ' | pasos hechos: ' + (hechos.join(', ') || 'ninguno');
  }).join('\n');
  const catalogo = pasos.map(p => p.id + ' | Módulo ' + p.modulo + ' | ' + p.titulo + (p.consigna ? ' — ' + p.consigna : '')).join('\n');
  const sistema = [
    'Ayudás a Andy Kligman, profesor de improvisación en guitarra jazz (programa Ajuste Elástico). Te paso el resumen de una clase 1 a 1 y el catálogo de pasos de su aula virtual. Tenés que relacionar lo que dice el resumen con los pasos del aula. No inventes nada que no esté en el resumen.',
    'Devolvé SOLO un JSON válido, sin texto alrededor:',
    '{"codigo": "código del alumno o null", "tareas": [{"texto": "...", "paso": "id o null"}], "pasos": ["id", ...], "consejos": [{"paso": "id o null", "situacion": "...", "consejo": "..."}]}',
    'Reglas:',
    '- codigo: identificá al alumno por el nombre del archivo y la lista. Si dudás entre dos, null.',
    '- tareas: una por cada ejercicio de «Para la semana que viene» (o la sección de tareas que tenga), en el mismo orden. "texto" es la tarea tal cual está en el resumen, sin el número del principio y sin cambiar palabras (podés sacar asteriscos sueltos que no cierren). "paso": el id del paso del aula donde se trabaja eso, solo si coincide claramente con su consigna; si es una variante o algo que el aula no tiene, null. Si la sección empieza con una frase general (cambio de módulo, algo en stand by) va como primera tarea con paso null.',
    '- pasos: ids de pasos del catálogo que por lo que dice el resumen el alumno ya tiene resueltos (lo dejó atrás, ya lo domina, pasa a lo siguiente). No pongas los que ya figuran como hechos ni los que son tarea para la semana. Si no hay evidencia clara, lista vacía.',
    '- consejos: como mucho 2 explicaciones de Andy (de «Problemas y devoluciones» o «Ideas para llevarse») que servirían a OTROS alumnos en un paso del aula. Cortas, en sus palabras, voseo. Si no hay, lista vacía.',
  ].join('\n');
  const usuario = 'Archivo: ' + nombreArch + '\n' + (codigoFijo ? 'El alumno es: ' + codigoFijo + '\n' : '') + '\nALUMNOS:\n' + lista + '\n\nCATÁLOGO DE PASOS DEL AULA:\n' + catalogo + '\n\nRESUMEN DE LA CLASE:\n' + resumen;
  const r = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    payload: JSON.stringify({ model: MODELO_CLASES, max_tokens: 3000, system: sistema, messages: [{ role: 'user', content: usuario }] }),
  });
  if (r.getResponseCode() !== 200) throw new Error('API ' + r.getResponseCode() + ': ' + r.getContentText().slice(0, 300));
  const txt = JSON.parse(r.getContentText()).content.map(c => c.text || '').join('');
  const j = JSON.parse(txt.slice(txt.indexOf('{'), txt.lastIndexOf('}') + 1));
  const existe = id => pasos.some(p => p.id === id);
  const al = alumnos.find(a => a.codigo === (codigoFijo || j.codigo));
  return {
    codigo: al ? al.codigo : null,
    tareas: (j.tareas || []).filter(t => t && t.texto).map(t => ({ texto: String(t.texto).trim(), paso: existe(t.paso) ? t.paso : null })),
    pasos: (j.pasos || []).filter(id => existe(id) && !(al && al.prog[id] && al.prog[id].hecho)),
    consejos: (j.consejos || []).map(x => ({ paso: existe(x.paso) ? x.paso : '', situacion: x.situacion || '', consejo: x.consejo || '' })).filter(x => x.consejo),
  };
}
