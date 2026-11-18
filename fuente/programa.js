/* =====================================================================
   PROGRAMA — contenido del mapa (editable)
   Cada paso: id, etapa, titulo, detalle, entrega ('video'|'audio'|null),
   recursos [{t, url}], problemas [{id, q, fix, url?}]
   ===================================================================== */
const VIDEO_ENLACES = 'https://www.youtube.com/watch?v=TylWJrfPxu0';
const DOC_ENLACES = 'https://docs.google.com/document/d/14Df9jDecsFC6HnizipZ0nu1pBbVw2kOBzvydTMo3VOk/edit';
const WHATSAPP_ANDY = '';   // número con código de país, sin + ni espacios (ej. 5491112345678)
const AULA = 'https://hotmart.com/es/club/andras-martan-kligman';
const DOC_CUELLO_1_GUIA = 'https://docs.google.com/document/d/1P4SVjJFGVKgoYTP-DZD1ZNpM0q-ObKuh/edit';
const DOC_CUELLO_1_EXPL = 'https://docs.google.com/document/d/1F4A99qcJbhQ3kTDGbBUI1NDt7gq_H0RG/edit';
const DOC_PREVIA = 'https://docs.google.com/document/d/1U-WLpCr_hnW5ruUY3mWW3GThD1lYPX6y2AksiWiADnk/edit';
const DOC_ANTIC = 'https://docs.google.com/document/d/1TaI7oAl4eMyHolWW7E-7TPfvxc4yk5SLBnzNlYOjrOM/edit';
const DOC_SUPER = 'https://docs.google.com/document/d/1v3JwZIC3liAwwICnzZSHpBrMBP_4_4Kw9WqACELv35o/edit';
const DOC_CUELLO_2 = 'https://docs.google.com/document/d/1MR6C2vRlCcHo77cJIdyyvjnuxBjdiqJ21zWZfCvulxU/edit';

/* Títulos de los videos (para el reproductor) */
const VIDEOS = {
  'we8Wgy3SmF8': 'Cuellos de botella #3 - Direccion Melódica Libre',
  '2DfcA6_JdW4': 'Posiciones de arpegios por set de cuerdas',
  'GLSfAS-RnhQ': 'Integración: práctica a tempo y skipping',
  'TylWJrfPxu0': 'Ejercitación Nº1: Enlaces de arpegios',
  'PqJhew7HiLs': 'Cómo ordenar las posiciones',
  '86aNkZzca64': 'Ejercitación Nº2: Anticipaciones armónicas',
  '_GkCOK9r3Wg': 'Ejercitación Nº3: Superposiciones de arpegios',
  '-M5xF9Crru8': 'Herramienta iReal: contrabajo acompañante',
  'c_aQIVXsF9M': 'Cuello de botella #1: anticipar los cambios',
  'JHJhLmtCsno': 'Cuello de botella #2: notas por cuerda',
  /* Módulo 2: ADN del Jazz */
  'BK6LGMZTU9M': 'Cómo transcribir eficientemente',
  'o-sV1KM5J-o': 'Notas de aproximación: cromáticos ascendentes',
  'saRjud2tZw4': 'Momento de integración libre',
  'M6jHqGGAF8w': 'Notas de aproximación: cromático descendente',
  'pd8IgNbFJIo': 'Notas de aproximación: auxiliar',
  'C7LsWB2xgz4': 'Notas de aproximación: resoluciones indirectas (1)',
  'JvzNRJduA_I': 'Notas de aproximación: resoluciones indirectas (2)',
  'GrXVCxwRs6g': 'Combinación de elementos del lenguaje',
  /* Módulo 3: Entrenamiento rítmico */
  '2iYdNyLkTIc': 'Introducción: entrenamiento rítmico',
  'CY11GrypJpo': 'Ritmo A + ritmo al cuerpo',
  'Y5o2rSOFpnQ': 'Ritmo B + cómo destrabar cualquier ritmo',
  'Zi8GzfFqmOI': 'Ritmo A + aplicaciones varias al instrumento',
  'ersUb9-L1zA': 'Ritmo B: ejemplos en el instrumento',
  'CHKJyTSdmIg': 'Ritmos C, D y E + improvisación en subdivisión de negra',
};

/* Standards para elegir. pdf: link a la parte para trabajar (vacío = Andy la manda por WhatsApp) */
const STANDARDS = [
  { t: 'Autumn Leaves', pdf: '' },
  { t: 'Joy Spring', pdf: '' },
  { t: 'That Old Feeling', pdf: '' },
  { t: 'How Deep Is the Ocean', pdf: '' },
  { t: 'There Will Never Be Another You', pdf: '' },
  { t: 'Stella by Starlight', pdf: '' },
  { t: 'But Not for Me', pdf: '' },
  { t: 'Out of Nowhere', pdf: '' },
  { t: 'Have You Met Miss Jones', pdf: '' },
  { t: 'Days of Wine and Roses', pdf: '' },
  { t: 'I Remember You', pdf: '' },
  { t: 'Blue Bossa', pdf: '' },
  { t: 'Blues en Bb', pdf: '' },
];

/* Progreso por defecto, para los pasos que no tienen opciones propias.
   nivel: 'listo' cuenta como hecho, 'casi' también (80-85%), 'cuesta' cuenta como medio paso. */
/* Para pasos que son "mirar" o "mandar": hecho, o pedir ayuda */
const PROGRESO_SIMPLE = [
  { id: 'listo', label: 'Listo, lo hice', nivel: 'listo' },
  { id: 'duda', label: 'No entiendo una parte', nivel: 'cuesta', resp: 'Escribile a Andy por WhatsApp y lo ven juntos.' },
];
const PROGRESO_BASE = [
  { id: 'listo', label: 'Ya me sale', nivel: 'listo' },
  { id: 'casi', label: 'Me sale, con algunos errores', nivel: 'casi' },
  { id: 'cuesta', label: 'Todavía me cuesta', nivel: 'cuesta' },
];

const PROGRAMA = {
  programa: 'Ajuste Elástico',
  modulo: 'Cambios de acorde: construyendo control y fluidez',
  hotmartBase: 'https://hotmart.com/es/club/andras-martan-kligman/products/6223725/content/',
  etapas: [
    { id: 'pre', titulo: 'Antes del primer encuentro', sub: 'Entrenamiento gratuito de arpegios y primera experiencia con los enlaces a tiempo real',
      intro: 'Aprendé a memorizar los intervalos de manera más eficiente, en posiciones que quizás no conozcas tanto.' },
    { id: 'enlaces', titulo: 'Enlaces de arpegios', sub: 'Ejercitación N1: de lo fijo a lo libre' },
    { id: 'antic', titulo: 'Anticipaciones armónicas', sub: 'Ejercitación N2' },
    { id: 'super', titulo: 'Superposiciones', sub: 'Ejercitación N3' },
    { id: 'm2', titulo: 'ADN del Jazz', sub: 'Notas de aproximación y transcripción' },
    { id: 'ritmo', titulo: 'Entrenamiento rítmico', sub: 'Ritmos A a E, al cuerpo y en el instrumento' },
    { id: 'curva', titulo: 'Curva del Solo', sub: 'Muy pronto' },
  ],
  pasos: [
    /* ---------- Pre-sincrónico ---------- */
    {
      id: 'p2', etapa: 'pre', entrega: 'video', envia: 'un video nombrando en voz alta los intervalos, sin tempo, en las 4 posiciones de las primeras 3 cuerdas para los 4 tipos de acorde.',
      video: { id: '2DfcA6_JdW4' }, hotmart: 'k458JjqROl',
      titulo: 'Nombrar los intervalos en voz alta',
      detalle: 'Nombrá los intervalos enteros (7ma mayor, 5ta disminuida, etc.) en voz alta, en las 4 posiciones para los 4 tipos de acorde. Por ahora, solo las posiciones en las primeras 3 cuerdas.',
      recursos: [{ t: 'Doc: Previa técnica - Arpegios base', url: DOC_PREVIA }],
      progreso: [
        { id: 'todas', label: 'Los nombro sin dudar en todas las posiciones de las primeras 3 cuerdas', nivel: 'listo', resp: '¡Seguí adelante!' },
        { id: 'algunas', label: 'Algunas posiciones me salen y otras todavía no', nivel: 'casi',
          resp: 'Si lo que te sale es solo en las primeras tres cuerdas, está perfecto. Vamos a trabajar en profundidad con esas cuerdas en la primera parte del programa y no hace falta más por ahora. Mandame un video y vas a estar listo para seguir avanzando.\n\nSi estás teniendo inconvenientes con algunas posiciones en estas primeras tres cuerdas, separá la información. Trabajá solo sobre las que todavía no salen y tomate el tiempo que necesites para aprenderlas bien, revisando despacito, para arriba y para abajo. Aislar lo que nos cuesta y trabajar en eso es una de las cosas más importantes de la práctica.' },
        { id: 'dudo', label: 'Todavía dudo en casi todas', nivel: 'cuesta',
          resp: 'Escribile a Andy por WhatsApp y lo ven juntos.', muestra: ['dedos'] },
      ],
      problemas: [
        { id: 'dedos', q: 'Los dedos van solos, pero no sé bien qué intervalo estoy tocando',
          fix: 'Trabajá sobre las posiciones que menos conozcas y tomate todo el tiempo que necesites para aprenderlas bien. Separá la información: si algunas ya salen y otras no, trabajá sobre las que no.' },
      ],
    },
    {
      id: 'p3', etapa: 'pre', entrega: 'video', envia: 'un video del mismo ejercicio a tempo, con el metrónomo y los nombres cortos ("siete, uno, tres").',
      video: { id: 'GLSfAS-RnhQ' }, hotmart: 'RONqgwvP7P',
      titulo: 'Lo mismo, a tempo',
      detalle: 'Poné un tempo cómodo y hacé el mismo ejercicio en tiempo real. Acá acortamos el nombre del intervalo: "siete, uno, tres" en vez de "séptima mayor, tónica, tercera mayor". Así no es tan engorroso y fluye mejor. Si aparecen errores, se corrigen al vuelo, o frenás el metrónomo, corregís en la pausa y retomás.',
      progreso: [
        { id: 'limpio', label: 'Me sale casi sin errores', nivel: 'listo', resp: '¡Seguí adelante!' },
        { id: 'poco', label: 'Me equivoco un poco', nivel: 'casi',
          resp: 'Si tenés un 15-20% de error está perfecto. Podés darle un poco más, pero ya está para seguir.' },
        { id: 'mucho', label: 'Me equivoco todo el tiempo', nivel: 'cuesta',
          resp: 'Si el error ronda el 50% de los intentos, hay que ir un escalón para atrás: apagá el metrónomo y repasá la posición que haga falta. Tomate tu tiempo para hacer lo que necesites antes de volver a probarlo a tempo. También podés pasar a tempo las posiciones que más te cuesten antes de juntarlas con las demás.' },
      ],
    },
    {
      id: 'p4', etapa: 'pre', entrega: 'video', envia: 'un video aplicando el skipping: primero sin tempo y después a tempo.',
      video: { id: 'GLSfAS-RnhQ' }, hotmart: 'RONqgwvP7P',
      titulo: 'Aplicar el skipping',
      detalle: 'Repetí los dos pasos anteriores aplicando el skipping: primero sin tempo y después a tempo. Sirve para desordenar la información y asegurarte de que la asimilaste de verdad, no solo para arriba y para abajo.',
      progreso: [
        { id: 'tempo', label: 'Me sale sin tempo y a tempo', nivel: 'listo', resp: '¡Excelente, seguí adelante!' },
        { id: 'sintempo', label: 'Me sale sin tempo, a tempo todavía no', nivel: 'casi',
          resp: '¡Ya casi estás, un último esfuerzo! Aunque sea bien lento… pero a tempo. Igualmente ya hiciste un gran trabajo y estás para seguir adelante si querés.' },
        { id: 'cuesta', label: 'Me cuesta mucho', nivel: 'cuesta',
          resp: 'Mirá los intervalos de la posición en el orden normal una vez y después con el skipping, sobre cada uno de los distintos tipos de acorde. Hacé de a poquito, por sectores y a tu ritmo. Cuando ganes comodidad con un sector, podés empezar a probarlo a tempo.' },
      ],
    },
    {
      id: 'p5', etapa: 'pre', tipo: 'standard',
      titulo: 'Elegir el standard',
      detalle: 'Elegí de la lista el tema con el que vas a trabajar. Si tenés otro en mente, escribilo y lo definimos con Andy.',
    },
    {
      id: 'p5b', etapa: 'pre',
      progreso: [
        { id: 'super', label: '¡Súper! Se entiende todo', nivel: 'listo' },
        { id: 'duda', label: 'Hay cosas que no entiendo', nivel: 'cuesta', resp: 'Escribime por WhatsApp y lo vemos juntos.' },
      ],
      video: { id: 'TylWJrfPxu0' }, hotmart: 'PeAgJn18OW',
      titulo: 'Ver el video de Enlaces de Arpegios y leer el PDF',
      detalle: 'Mirá el video completo antes de empezar y leé el documento: ahí está el paso a paso del ejercicio que vas a hacer sobre tu standard.',
      recursos: [
        { t: 'Video completo: Enlaces de Arpegios', url: VIDEO_ENLACES },
        { t: 'Doc: Enlaces de Arpegios', url: DOC_ENLACES },
      ],
    },
    {
      id: 'p6', etapa: 'pre', entrega: 'video o texto', envia: 'un video corto o un texto con las posiciones que vas a usar para los primeros 4 acordes del standard.', sinProgreso: true,
      video: { id: 'PqJhew7HiLs' },
      titulo: 'Mostrar compases, acordes y posiciones',
      detalle: 'Este video corto muestra cómo acomodar las posiciones para que el ejercicio funcione: una por acorde y todas en la misma zona del diapasón.',
      pregunta: '¿Se entendió el video?',
      progreso: [
        { id: 'listo', label: 'Sí, se entendió', nivel: 'listo' },
        { id: 'duda', label: 'No del todo', nivel: 'cuesta', resp: 'Volvé a verlo con la guitarra en la mano. Si sigue sin cerrar, mandale igual tus posiciones a Andy y contale qué parte no entendiste.' },
      ],
      recursos: [{ t: 'Video: cómo ordenar las posiciones para que funcione el ejercicio', url: 'https://www.youtube.com/watch?v=PqJhew7HiLs' }],
      problemas: [
        { id: 'zonas', q: 'Las posiciones me quedan en distintas zonas del diapasón',
          fix: 'Elegí una sola posición por acorde y que queden todas en la misma zona, lo más cerca posible entre sí. Si dudás, usá las del PDF del entrenamiento.' },
      ],
    },
    {
      id: 'p7', etapa: 'pre', sinProgreso: true,
      video: { id: 'TylWJrfPxu0', t: 460 }, hotmart: 'PeAgJn18OW',
      titulo: 'Enlaces con dirección y ritmo fijos, sin tempo',
      detalle: 'Sin tempo, mirá enlaces posibles con dirección melódica fija entre las posiciones que elegiste para los 4 compases del standard.\nDirección melódica fija:\n- No vale cambiar de dirección en el medio. Solo se puede ascender hasta llegar a la nota más aguda posible de las posiciones; recién ahí se puede descender.\n- No vale saltear notas: solo se puede conectar por nota más cercana hacia el siguiente acorde.\n- Solo tocar blancas y respetar las posiciones elegidas.\nSe recomienda tener el [PDF](' + DOC_ENLACES + ') a mano, con el proceso paso a paso.',
      recursos: [
        { t: 'Volver a ver la explicación', url: 'https://youtu.be/TylWJrfPxu0?t=460' },
        { t: 'Volver a ver el ejemplo', url: 'https://youtu.be/TylWJrfPxu0?t=671' },
      ],
    },

    /* ---------- Enlaces ---------- */
    {
      id: 'e1', etapa: 'enlaces', entrega: 'video', envia: 'un video de los enlaces con dirección y ritmo fijos (en blancas) sobre los mismos compases, con metrónomo o iReal.',
      video: { id: 'TylWJrfPxu0', t: 898 }, hotmart: 'PeAgJn18OW',
      titulo: 'Enlaces con dirección y ritmo fijos, a tempo',
      detalle: 'Las mismas reglas que sin tempo, ahora con metrónomo o iReal. Subí un poco el tempo con los días.\nUna vez que el ejercicio camina, es cuestión de encontrar los diferentes enlaces posibles dentro de esta limitación. La idea es no repetir mucho los enlaces e ir a buscar nuevos, empezando desde diferentes notas, o desde notas ya usadas pero en otra dirección.\nSe recomienda tener el [PDF](' + DOC_ENLACES + ') a mano, con el proceso paso a paso.',
      recursos: [
        { t: 'Ver ejemplo de enlaces a tempo', url: 'https://youtu.be/TylWJrfPxu0?t=898' },
        { t: 'Herramienta iReal: contrabajo acompañante', url: 'https://www.youtube.com/watch?v=-M5xF9Crru8' },
        { t: 'Doc: Enlaces de Arpegios', url: DOC_ENLACES },
      ],
      nota: 'Si tenés Android, pedime el .apk de iReal gratis por WhatsApp.',
      progreso: [
        { id: 'fluye', label: 'Me sale a tempo con pocos errores', nivel: 'listo', resp: '¡Seguí adelante!', muestra: ['apoyo'] },
        { id: 'errores', label: 'Me sale, pero con errores o muy lento', nivel: 'casi', muestra: ['apoyo'] },
        { id: 'trabo', label: 'Me trabo seguido', nivel: 'cuesta', muestra: ['apoyo', 'loop', 'complica'] },
      ],
      apoyo: {
        titulo: 'Cuellos de botella',
        texto: 'Antes de hacer el ejercicio a medias, conviene bajar un escalón con alguno de estos dos (o con los dos) y después volver al ejercicio completo.',
        items: [
          { t: 'Cuello de botella #1: anticipar los cambios de acorde', cuando: 'Para cuando llega el cambio de acorde y te quedás en blanco.', partes: [
            { titulo: 'Práctica', video: 'https://www.youtube.com/watch?v=c_aQIVXsF9M', tv: 'Ver el video de la demostración', url: DOC_CUELLO_1_GUIA, td: 'Leer el documento práctico' },
            { titulo: 'Explicación (si con la práctica no alcanza)', video: 'https://www.youtube.com/watch?v=iHEcRTrt12I', tv: 'Ver el video de la explicación', url: DOC_CUELLO_1_EXPL, td: 'Leer el documento de la explicación' } ] },
          { t: 'Cuello de botella #2: notas por cuerda', cuando: 'Para cuando sabés la progresión y entendés las posiciones, pero no lo manejás como quisieras.', url: DOC_CUELLO_2, video: 'https://www.youtube.com/watch?v=JHJhLmtCsno' },
        ],
      },
      problemas: [
        { id: 'loop', q: 'Repetir siempre el mismo recorrido',
          fix: 'Si arrancás por segunda vez desde la misma nota, hacés el mismo recorrido. Empezá desde una nota en la que no hayas arrancado, o desde la misma pero en la dirección contraria.' },
        { id: 'complica', q: 'Que se complique demasiado',
          fix: 'Antes de bajar el tempo, achicá: menos compases (2 en vez de 4) o menos cuerdas (primero en las cuerdas 1 y 2, luego en las 2 y 3, y finalmente en las 3 de nuevo). Vas a ver lo rápido que se destraba.' },
      ],
    },
    {
      id: 'e2', etapa: 'enlaces', entrega: 'video', envia: 'un video de los enlaces con dirección melódica libre, en blancas, sobre los mismos compases.',
      video: { id: 'TylWJrfPxu0', t: 1516 }, hotmart: 'PeAgJn18OW',
      progreso: [ { id: 'nuevos', label: 'Encuentro caminos nuevos', nivel: 'listo' }, { id: 'conocido', label: 'Me sale, pero vuelvo a lo que ya sabía', nivel: 'casi', muestra: ['esconder'] }, { id: 'fijo', label: 'Me cuesta salir del recorrido fijo', nivel: 'cuesta', muestra: ['esconder'] } ],
      titulo: 'Dirección melódica libre',
      detalle: 'Mismo ritmo de blancas, mismas posiciones y compases, pero ahora elegís cómo enlazar: quedarte en una nota común, repetir una nota y cambiar las de alrededor, cambiar de dirección cuando quieras, saltear. Buscá caminos sorpresivos, no lo automático. Conviene empezar en 2 cuerdas (o hasta en 1) y después juntar las 3.',
      recursos: [{ t: 'Video: ver ejemplo con dirección melódica libre', url: VIDEO_ENLACES + '&t=1516s' }, { t: 'Video: Cuellos de botella #3 - Direccion Melódica Libre', url: 'https://www.youtube.com/watch?v=we8Wgy3SmF8' }, { t: 'Doc: Enlaces de Arpegios', url: DOC_ENLACES }],
      problemas: [
        { id: 'esconder', q: 'Termino tocando los enlaces que ya sabía',
          fix: 'Es fácil esconderse en lo conocido. Bajá a dos cuerdas y agotá todas las combinaciones ahí, después las otras dos, y recién ahí volvé a las tres. Buscá a propósito lo que no te sale. Si te ayuda, [mirá el video auxiliar](https://www.youtube.com/watch?v=we8Wgy3SmF8).' },
      ],
    },
    {
      id: 'e3', etapa: 'enlaces', entrega: 'video', envia: 'un video improvisando con ritmo libre sobre las mismas notas y compases.',
      video: { id: 'TylWJrfPxu0', t: 1691 }, hotmart: 'PeAgJn18OW',
      progreso: [ { id: 'musica', label: 'Suena a música, dejo espacios', nivel: 'listo' }, { id: 'notas', label: 'Me sale, pero toco muchas notas', nivel: 'casi', muestra: ['muchas'] }, { id: 'pierdo', label: 'Me pierdo cuando suelto el ritmo', nivel: 'cuesta', muestra: ['muchas', 'porque'] } ],
      titulo: 'Ritmo libre',
      detalle: 'Mismas notas, mismos lugares del diapasón, mismos compases, pero sin ritmo fijo. Usá más el oído, dejá espacios, repetí notas, buscá formas ingeniosas de tocar esas notas sobre la armonía. Cantá lo que tocás, aunque no afines: el impulso de cantar te conecta con el oído y no con el automatismo de los dedos.',
      recursos: [{ t: 'Video: ver ejemplo con ritmo libre', url: VIDEO_ENLACES + '&t=1691s' }, { t: 'Doc: Enlaces de Arpegios', url: DOC_ENLACES }],
      problemas: [
        { id: 'muchas', q: 'Toco muchas más notas que antes, casi toda la posición',
          fix: 'Probá ponerte la pauta de 0 a 3 notas por acorde. Se puede tocar una sola nota o dejar silencio. Mejor de menos a más.' },
        { id: 'porque', q: 'Siento que toco por tocar, suena a ejercicio',
          fix: 'Cantá mientras tocás y esperá a que aparezca una idea. Si no viene nada, no toques nada; cuando venga, tratá de plasmarla como puedas y volvé a esperar.' },
      ],
    },
    {
      id: 'e4', etapa: 'enlaces',
      video: { id: 'TylWJrfPxu0' }, hotmart: 'PeAgJn18OW',
      progreso: [ { id: 'control', label: 'Sumé compases con el mismo control', nivel: 'listo' }, { id: 'alguno', label: 'Sumé compases, alguno falla', nivel: 'casi', muestra: ['compas', 'posiciones'] }, { id: 'desarma', label: 'Al sumar compases se me desarma', nivel: 'cuesta', muestra: ['compas'] } ],
      titulo: 'Sumar compases del standard',
      detalle: 'Repetí el proceso desde cero (fijo, después dirección libre, después ritmo libre) con los compases que siguen, y juntá los grupos en bloques cada vez más grandes. Cuando sientas que estás al 80-85%, es buen momento para avanzar.',
      recursos: [{ t: 'Doc: Enlaces de Arpegios', url: DOC_ENLACES }],
      problemas: [
        { id: 'compas', q: 'Hay un compás donde siempre me equivoco',
          fix: 'No practiques todo el bloque: aislá ese compás con el anterior en loop, y después volvé a juntar el grupo.' },
        { id: 'posiciones', q: 'No sé si sumar más posiciones o seguir con el tema',
          fix: 'Primero el tema entero con control, después cambiar de posiciones.' },
      ],
    },

    /* ---------- Anticipaciones ---------- */
    {
      id: 'a1', etapa: 'antic',
      video: { id: '86aNkZzca64' }, hotmart: 'R4jj2lj24a',
      sinProgreso: true,
      titulo: 'Mirar la Ejercitación N2',
      detalle: 'Mirá el video y leé el documento de anticipaciones armónicas. Sirve para destrabar el "tejido" entre un compás y otro, para que no suene compartimentado cuando improvisás con ritmo libre.',
      recursos: [{ t: 'Doc: Anticipaciones armónicas', url: DOC_ANTIC }],
    },
    {
      id: 'a2', etapa: 'antic', entrega: 'video', envia: 'un video de las anticipaciones con ritmo fijo sobre tus compases.',
      video: { id: '86aNkZzca64' }, hotmart: 'R4jj2lj24a',
      progreso: [ { id: 'varias', label: 'Me sale a tempo en 2 o 3 cuerdas', nivel: 'listo' }, { id: 'una', label: 'Me sale con 1 cuerda o 1 nota por acorde', nivel: 'casi' }, { id: 'no', label: 'A tempo no me sale', nivel: 'cuesta', muestra: ['tempo'] } ],
      titulo: 'Anticipaciones con ritmo fijo',
      detalle: 'Hacelo tal cual el video, con el ritmo fijo, sobre tus compases. Probá en grupos de 1, 2 y 3 cuerdas, y con 1, 2 y 3 notas por acorde. Que esté desafiante.',
      recursos: [{ t: 'Doc: Anticipaciones armónicas', url: DOC_ANTIC }],
      problemas: [
        { id: 'tempo', q: 'A tempo no me sale',
          fix: 'Empezá en una sola cuerda y con 1 nota por acorde. Cuando salga, sumá cuerdas o notas de a una.' },
      ],
    },
    {
      id: 'a3', etapa: 'antic', entrega: 'video', envia: 'un video improvisando con ritmo libre y anticipando a veces el acorde que viene.',
      video: { id: '86aNkZzca64' }, hotmart: 'R4jj2lj24a',
      progreso: [ { id: 'natural', label: 'Anticipo a veces y suena natural', nivel: 'listo' }, { id: 'forzado', label: 'Anticipo, pero suena forzado', nivel: 'casi', muestra: ['forzado'] }, { id: 'olvido', label: 'Me olvido de anticipar o me pierdo', nivel: 'cuesta' } ],
      titulo: 'Ritmo libre, anticipando a veces',
      detalle: 'Volvé a improvisar con ritmo libre, pero ahora anticipando a veces: alguna nota del acorde que viene en el "y" del 4, o hasta en el 4. No hace falta el ritmo fijo. Cantando, buscando dar discurso.',
      recursos: [{ t: 'Doc: Anticipaciones armónicas', url: DOC_ANTIC }],
      problemas: [
        { id: 'forzado', q: 'Anticipo todo el tiempo y suena forzado',
          fix: 'La idea es anticipar a veces, no siempre. Usalo como un recurso más para darle continuidad a la frase.' },
      ],
    },

    /* ---------- Superposiciones ---------- */
    {
      id: 's1', etapa: 'super',
      video: { id: '_GkCOK9r3Wg' }, hotmart: 'k45bBv9Qel',
      sinProgreso: true,
      titulo: 'Mirar la Ejercitación N3 y anotar preguntas',
      tip: 'Si tenés preguntas teóricas, aprovechá la clase para hacerlas y resolver tus dudas. Podés anotarlas antes, así no se te escapa ninguna.',
      detalle: 'Mirá el video de superposiciones. No hace falta hacerlo todavía: traé las dudas a la clase.',
      recursos: [
        { t: 'Video: Ejercitación N3', url: 'https://www.youtube.com/watch?v=_GkCOK9r3Wg' },
        { t: 'Doc: Superposiciones de arpegios', url: DOC_SUPER },
      ],
    },
    {
      id: 's2', etapa: 'super', entrega: 'video o texto', envia: 'un video corto o un texto con las superposiciones que elegiste para cada acorde y las posiciones que vas a usar.',
      video: { id: '_GkCOK9r3Wg' }, hotmart: 'k45bBv9Qel',
      sinProgreso: true,
      titulo: 'Elegir superposiciones y ordenar las posiciones a utilizar',
      tip: 'Si tenés preguntas teóricas, aprovechá la clase para hacerlas y resolver tus dudas. Podés anotarlas antes, así no se te escapa ninguna.',
      detalle: 'Para cada acorde, al menos una opción de superposición (ideal, dos), y ordená las posiciones que vas a usar. Mandáselas a Andy para el ok antes de practicarlas: así se corrigen los errores y te queda un documento para usar después.',
      recursos: [{ t: 'Doc: Superposiciones de arpegios', url: DOC_SUPER }],
      problemas: [
        { id: 'menormaj', q: 'No entiendo cómo se escriben algunos acordes (por ejemplo -maj7)',
          fix: '-maj7 es menor con 7ma mayor: 3ra menor y 7ma mayor. Por ejemplo, A-maj7 es La menor con 7ma mayor.' },
      ],
    },
    {
      id: 's3', etapa: 'super', entrega: 'video', envia: 'un video de los enlaces con las superposiciones, en esos pocos compases.',
      video: { id: '_GkCOK9r3Wg' }, hotmart: 'k45bBv9Qel',
      titulo: 'Enlaces con superposiciones',
      detalle: 'Repetí el proceso de enlaces (fijo, después libre) reemplazando los acordes originales por las superposiciones, en pocos compases. Ubicá las notas en pocas cuerdas, no más de 4 por acorde. Cantá y anticipate al acorde que viene.',
      recursos: [{ t: 'Doc: Superposiciones de arpegios', url: DOC_SUPER }],
    },

    /* ---------- Módulo 2: ADN del Jazz ---------- */
    {
      id: 'm2', etapa: 'm2', entrega: 'audio', envia: 'el audio de 30 segundos cantando el solo encima de la pista.',
      video: { id: 'BK6LGMZTU9M' }, hotmart: 'r48bWKZw7R',
      titulo: 'Cómo transcribir eficientemente',
      detalle: 'Mirá el video, elegí un solo, descargá Audiostretch y cantá 30 segundos del solo encima de la pista. Mandá el audio.',
      recursos: [{ t: 'Doc: Cómo transcribir eficientemente', url: 'https://docs.google.com/document/d/1rSCUIcyhFixSVUZQuGXH0xXd6Y1QV6Qdn1eIEBfNaqM/edit' }],
    },
    {
      id: 'm1', etapa: 'm2', entrega: 'video', envia: 'los videos de las ejercitaciones 1 y 2 de Cromáticos ascendentes.',
      video: { id: 'o-sV1KM5J-o' }, hotmart: 'RO9qy9mjOP',
      titulo: 'Cromáticos ascendentes',
      detalle: 'Mirá el video con el PDF al lado y mandá videos de las ejercitaciones 1 y 2 para pedir feedback. Después, la 3. Al final está el momento de integración libre.',
      recursos: [
        { t: 'Doc: ADN del Jazz, notas de aproximación', url: 'https://docs.google.com/document/d/1FVQ5RILkfJnro_aNtwZop-l6jbJqvHRJfgN_NgSCv0g/edit' },
        { t: 'Video: Momento de integración libre', url: 'https://www.youtube.com/watch?v=saRjud2tZw4' },
      ],
    },
    {
      id: 'n3', etapa: 'm2', video: { id: 'M6jHqGGAF8w' }, hotmart: 'PeAgnBd1OW',
      titulo: 'Cromático descendente',
      detalle: 'Mirá el video y hacé las ejercitaciones con el PDF de ADN del Jazz.',
      recursos: [{ t: 'Doc: ADN del Jazz, notas de aproximación', url: 'https://docs.google.com/document/d/1FVQ5RILkfJnro_aNtwZop-l6jbJqvHRJfgN_NgSCv0g/edit' }],
    },
    {
      id: 'n4', etapa: 'm2', video: { id: 'pd8IgNbFJIo' }, hotmart: 'y4bVqNGy4R',
      titulo: 'Auxiliar',
      detalle: 'Mirá el video y hacé las ejercitaciones con el PDF de ADN del Jazz.',
      recursos: [{ t: 'Doc: ADN del Jazz, notas de aproximación', url: 'https://docs.google.com/document/d/1FVQ5RILkfJnro_aNtwZop-l6jbJqvHRJfgN_NgSCv0g/edit' }],
    },
    {
      id: 'n5', etapa: 'm2', video: { id: 'C7LsWB2xgz4' }, hotmart: 'E4zz5g9P4l',
      titulo: 'Resoluciones indirectas',
      detalle: 'Son dos videos: empezá por el primero y seguí con el segundo. Hacé las ejercitaciones con el PDF de ADN del Jazz.',
      recursos: [
        { t: 'Video: Resoluciones indirectas (2)', url: 'https://www.youtube.com/watch?v=JvzNRJduA_I' },
        { t: 'Doc: ADN del Jazz, notas de aproximación', url: 'https://docs.google.com/document/d/1FVQ5RILkfJnro_aNtwZop-l6jbJqvHRJfgN_NgSCv0g/edit' },
      ],
    },
    {
      id: 'n6', etapa: 'm2', video: { id: 'GrXVCxwRs6g' }, hotmart: '0Ovo3xZN4j',
      titulo: 'Combinación de elementos del lenguaje',
      detalle: 'Mirá el video y seguí la guía práctica del documento.',
      recursos: [{ t: 'Doc: Combinación de elementos del lenguaje', url: 'https://docs.google.com/document/d/1qfI-iy2YXxOiD083q6OSH9_0qr3yo9XbUQ6FOv4c0rI/edit' }],
    },
    /* ---------- Módulo 3: Entrenamiento rítmico ---------- */
    {
      id: 'r1', etapa: 'ritmo', video: { id: '2iYdNyLkTIc' }, hotmart: 'y4bpGGbL7R',
      titulo: 'Introducción: entrenamiento rítmico',
      detalle: 'Mirá el video de introducción al módulo.',
    },
    {
      id: 'r2', etapa: 'ritmo', video: { id: 'CY11GrypJpo' }, hotmart: '37dp00Kk7L',
      titulo: 'Ritmo A + ritmo al cuerpo',
      detalle: 'Mirá el video y practicá el ritmo A con el cuerpo, como se muestra.',
    },
    {
      id: 'r3', etapa: 'ritmo', video: { id: 'Y5o2rSOFpnQ' }, hotmart: '97B2PPYx7p',
      titulo: 'Ritmo B + cómo destrabar cualquier ritmo',
      detalle: 'Mirá el video y practicá el ritmo B como se muestra.',
    },
    {
      id: 'r4', etapa: 'ritmo', video: { id: 'Zi8GzfFqmOI' }, hotmart: 'ROxwydYK7D',
      titulo: 'Ritmo A + aplicaciones varias al instrumento',
      detalle: 'Mirá el video con el PDF al lado y llevá el ritmo A a la guitarra.',
      recursos: [{ t: 'Doc: Integración de un ritmo al instrumento', url: 'https://docs.google.com/document/d/1The81Adyg6GEMgMbDe7ayNz9pw0iBe6BBUteAwG-jIo/edit' }],
    },
    {
      id: 'r5', etapa: 'ritmo', video: { id: 'ersUb9-L1zA' }, hotmart: 'y4bp2dGy7R',
      titulo: 'Ritmo B: ejemplos en el instrumento',
      detalle: 'Mirá el video y llevá el ritmo B a la guitarra.',
    },
    {
      id: 'r6', etapa: 'ritmo', video: { id: 'CHKJyTSdmIg' }, hotmart: 'LO0b9KRaeG',
      titulo: 'Ritmos C, D y E + improvisación en subdivisión de negra',
      detalle: 'Mirá el video con el PDF al lado.',
      recursos: [{ t: 'Doc: Ritmos C, D y E', url: 'https://docs.google.com/document/d/1A5RHqBYIycktRvhm_rEuvkYICkGyGFQ7b_lX-tTVQtU/edit' }],
    },
  ],

  /* Lo que se espera tener ANTES de cada clase, por nivel.
     Es acumulativo: el nivel 2 incluye lo del 1, y cada clase incluye las anteriores. */
  esperado: {
    1: { min: ['p2', 'p3', 'p4', 'p5', 'p5b', 'p6', 'p7'], esp: ['e1'], ideal: ['e2'] },
    2: { min: ['e1'], esp: ['e2', 'e3'], ideal: ['e4', 'a1', 'a2'] },
    3: { min: ['e2', 'e3'], esp: ['a1', 'a2', 'a3'], ideal: ['e4', 's1'] },
    4: { min: ['a1', 'a2', 'a3', 's1'], esp: ['s2', 's3'], ideal: ['m1', 'm2'] },
    5: { min: [], esp: ['m1', 'm2'], ideal: [] },
  },
  clases: 4,
  consejoGeneral: 'Todo lo que signifique incorporar algo nuevo pide dar un paso atrás: menos compases, menos cuerdas, o repasar las posiciones y los acordes fuera del ritmo. Bajar el tempo también sirve, pero suele haber mejores opciones.',
};
