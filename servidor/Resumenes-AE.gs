/**
 * Resúmenes de clases de Ajuste Elástico
 *
 * Cada hora revisa la carpeta de transcripciones en Drive. Por cada
 * transcripción nueva de una clase (título con 🎸), le pide el resumen a
 * Claude por la API y lo guarda como Google Doc en la carpeta de resúmenes.
 *
 * Las transcripciones las deja ahí el flujo "Transcripción a Drive AE" de Tactiq.
 * Las instrucciones del resumen se leen del Google Doc «Instrucciones de los resúmenes de clase»
 * (si no se puede leer, no resume y lo reintenta en la próxima pasada).
 *
 * Para dejarlo andando (una sola vez):
 * 1. Configuración del proyecto (ícono de engranaje) > Propiedades del script >
 *    agregar ANTHROPIC_API_KEY con la clave de la consola de Anthropic.
 * 2. Elegir la función "instalar" arriba, tocar Ejecutar y aceptar los permisos.
 *    Resume las clases de hoy y desde ahí corre sola cada hora.
 */

const CONFIG = {
  CARPETA_TRANSCRIPCIONES: '1HC4Il8coXTn7MOeJ6frV0CdxSY7qEr_m', // Ajuste Elástico / Clases - Transcripciones
  CARPETA_RESUMENES: '1RvyO8DVeurj2Nasp4okHhR2TvfQnR7hZ',       // Ajuste Elástico / Clases - Resúmenes
  // Solo procesa archivos cuyo nombre tenga esto. Vacío = todos.
  FILTRO_NOMBRE: '🎸',
  MODELO: 'claude-sonnet-5-5',
  MAX_TOKENS_SALIDA: 6000,
  // Cuántas veces reintenta un archivo que dio error antes de saltearlo.
  MAX_INTENTOS: 3,
};

const DOC_INSTRUCCIONES = '1pxrhIY69SoCOAkDiJCN6YCQs8iKRD_rGkUsQyMDd6Rk';   // «Instrucciones de los resúmenes de clase»
const URL_PASOS_AULA = 'https://aula.ajuste-elastico.com/pasos.json';

// ---------------------------------------------------------------------------

function instalar() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'procesarNuevas')
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('procesarNuevas').timeBased().everyHours(1).create();
  const props = PropertiesService.getScriptProperties();
  // Procesa las transcripciones creadas desde hoy a las 00:00 (no las viejas).
  if (!props.getProperty('DESDE')) {
    const hoy = Utilities.formatDate(new Date(), 'America/Argentina/Buenos_Aires', 'yyyy-MM-dd');
    props.setProperty('DESDE', hoy + 'T00:00:00-03:00');
  }
  Logger.log('Instalado. Procesa transcripciones creadas desde ' + props.getProperty('DESDE'));
  procesarNuevas();
  Logger.log('Listo. Los resúmenes están en la carpeta "Clases - Resúmenes".');
}

function procesarNuevas() {
  const props = PropertiesService.getScriptProperties();
  const desde = new Date(props.getProperty('DESDE') || 0);
  const estado = JSON.parse(props.getProperty('ESTADO') || '{}');
  const carpeta = DriveApp.getFolderById(CONFIG.CARPETA_TRANSCRIPCIONES);
  const archivos = carpeta.getFiles();

  while (archivos.hasNext()) {
    const archivo = archivos.next();
    const id = archivo.getId();
    if (archivo.getDateCreated() < desde) continue;
    if (CONFIG.FILTRO_NOMBRE && archivo.getName().indexOf(CONFIG.FILTRO_NOMBRE) === -1) continue;
    const e = estado[id] || { listo: false, intentos: 0 };
    if (e.listo || e.intentos >= CONFIG.MAX_INTENTOS) continue;

    try {
      resumirArchivo_(archivo);
      estado[id] = { listo: true, intentos: e.intentos + 1 };
    } catch (err) {
      estado[id] = { listo: false, intentos: e.intentos + 1, error: String(err).slice(0, 300) };
      Logger.log('Error con "' + archivo.getName() + '": ' + err);
    }
    props.setProperty('ESTADO', JSON.stringify(estado));
  }
}

function resumirArchivo_(archivo) {
  const texto = leerTexto_(archivo);
  if (texto.trim().length < 500) throw new Error('Transcripción vacía o muy corta');
  const nombreClase = archivo.getName().replace(/\.(txt|docx?)$/i, '');
  const resumen = pedirResumen_(nombreClase, texto);
  const fecha = Utilities.formatDate(archivo.getDateCreated(), 'America/Argentina/Buenos_Aires', 'yyyy-MM-dd');
  crearDoc_('Resumen - ' + nombreClase + ' - ' + fecha, resumen);
}

function leerTexto_(archivo) {
  if (archivo.getMimeType() === MimeType.GOOGLE_DOCS) {
    return DocumentApp.openById(archivo.getId()).getBody().getText();
  }
  return archivo.getBlob().getDataAsString('UTF-8');
}

/** Las instrucciones del Doc. Si no se pueden leer, tira error y el archivo se reintenta en la próxima pasada. */
function instrucciones_() {
  const t = DocumentApp.openById(DOC_INSTRUCCIONES).getBody().getText().trim();
  if (t.length < 500) throw new Error('El Doc de instrucciones está vacío o muy corto');
  return t;
}

/** La lista de pasos del aula, para nombrarlos con su título exacto. */
function pasosAula_() {
  try {
    const pasos = JSON.parse(UrlFetchApp.fetch(URL_PASOS_AULA, { muteHttpExceptions: true }).getContentText());
    return pasos.map(p => '- «' + p.titulo + '» (módulo ' + p.modulo + ')' + (p.consigna ? ': ' + String(p.consigna).slice(0, 160) : '')).join('\n');
  } catch (e) { Logger.log('No pude leer los pasos del aula: ' + e); return ''; }
}

function pedirResumen_(nombreClase, transcripcion) {
  const clave = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');
  if (!clave) throw new Error('Falta ANTHROPIC_API_KEY en las propiedades del script');
  const pasos = pasosAula_();

  const respuesta = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-api-key': clave, 'anthropic-version': '2023-06-01' },
    payload: JSON.stringify({
      model: CONFIG.MODELO,
      max_tokens: CONFIG.MAX_TOKENS_SALIDA,
      system: instrucciones_() + (pasos ? '\n\nPASOS DEL AULA\n' + pasos : ''),
      messages: [{ role: 'user', content: 'Clase: ' + nombreClase + '\n\nTranscripción:\n\n' + transcripcion }],
    }),
    muteHttpExceptions: true,
  });
  const codigo = respuesta.getResponseCode();
  const cuerpo = JSON.parse(respuesta.getContentText());
  if (codigo !== 200) throw new Error('API ' + codigo + ': ' + JSON.stringify(cuerpo).slice(0, 300));
  const texto = (cuerpo.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
  if (!texto) throw new Error('Respuesta sin texto. stop_reason=' + cuerpo.stop_reason);
  return texto;
}

/** Crea el Google Doc pasando "## " a título y **texto** a negrita. */
function crearDoc_(titulo, markdown) {
  const doc = DocumentApp.create(titulo);
  const body = doc.getBody();
  body.clear();

  markdown.split('\n').forEach(linea => {
    if (/^#{1,3} /.test(linea)) {
      body.appendParagraph(linea.replace(/^#{1,3} /, '').trim()).setHeading(DocumentApp.ParagraphHeading.HEADING2);
      return;
    }
    const plano = linea.replace(/\*\*/g, '');
    const parrafo = body.appendParagraph(plano).setHeading(DocumentApp.ParagraphHeading.NORMAL);
    if (!plano) return;
    const t = parrafo.editAsText();
    let pos = 0;
    linea.split('**').forEach((trozo, i) => {
      if (trozo && i % 2 === 1) t.setBold(pos, pos + trozo.length - 1, true);
      pos += trozo.length;
    });
  });

  // Saca el párrafo vacío inicial que deja Docs.
  if (body.getNumChildren() > 1 && body.getChild(0).asText().getText() === '') body.removeChild(body.getChild(0));
  doc.saveAndClose();

  DriveApp.getFileById(doc.getId()).moveTo(DriveApp.getFolderById(CONFIG.CARPETA_RESUMENES));
}

// Prueba: muestra qué instrucciones va a usar (no gasta tokens ni crea documentos)
function probarInstrucciones() {
  const t = instrucciones_();
  Logger.log('Usa las del Doc · ' + t.length + ' caracteres');
  Logger.log('Pasos del aula: ' + (pasosAula_().split('\n').filter(Boolean).length));
}
