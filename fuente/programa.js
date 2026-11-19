/* =====================================================================
   PROGRAMA — contenido del mapa (editable)
   Cada paso: id, etapa, titulo, detalle, entrega ('video'|'audio'|null),
   recursos [{t, url}], problemas [{id, q, fix, url?}]
   ===================================================================== */
const VIDEO_ENLACES = 'https://www.youtube.com/watch?v=TylWJrfPxu0';
const DOC_ENLACES = 'https://docs.google.com/document/d/14Df9jDecsFC6HnizipZ0nu1pBbVw2kOBzvydTMo3VOk/edit';
const WHATSAPP_ANDY = '5491130994020';   // número con código de país, sin + ni espacios (ej. 5491112345678)
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
  'CHKJyTSdmIg': 'Ritmos C, D y E + improvisación con tiempos y contratiempos',
  'A4rxE6i5VwY': 'Unidades rítmicas y variabilidad en la improvisación',
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
  { id: 'duda', label: 'No entiendo una parte', nivel: 'cuesta', resp: 'Escribime tus preguntas por WhatsApp!' },
];
const PROGRESO_BASE = [
  { id: 'listo', label: 'Ya me sale', nivel: 'listo' },
  { id: 'casi', label: 'Me sale, con algunos errores', nivel: 'casi' },
  { id: 'cuesta', label: 'Todavía me cuesta', nivel: 'cuesta' },
];

/* Stops de segmentación: cómo se juntan las piezas (y qué pasa cuando algo se traba).
   unidades: lo que se ve; tandas: cada tanda de práctica (sel = índices desde 0).
   traba: unidad que se marca en rojo; arregla: unidad que pasa a verde. no: la forma que no sirve. */
const STOPS = {
  compases: {
    tipo: 'cifrado', titulo: 'Cómo sumar compases sin perder profundidad ni control', audio: 'audio/compases/', audioNo: 'audio/compases-no/', empiezaNo: true,
    sub: 'Los primeros 16 compases de un standard. Cada tanda es un rato de práctica.',
    unidades: Array.from({ length: 16 }, (_, i) => String(i + 1)),
    acordes: ['F-7', 'Bb-7', 'Eb7', 'Abmaj7', 'Dbmaj7', 'D-7', 'G7', 'Cmaj7', 'C-7', 'F-7', 'Bb7', 'Ebmaj7', 'Abmaj7', 'A-7b5', 'D7', 'Gmaj7'],
    contar: 'Veces que practicaste cada compás',
    tandas: [
      { sel: [-1, -1], pausa: true, grande: true, t: 'Cómo sumar compases sin perder la profundidad y el control que venís construyendo hasta ahora' },
      { sel: [0, 3], t: 'Arrancás por los primeros 4 compases.' },
      { sel: [4, 7], t: 'Pasamos a lo siguiente, del 5 al 8.' },
      { sel: [6, 6], traba: 6, t: 'Uy, se complicó el **7**. Frenamos el metrónomo y lo repasamos en pelota parada.' },
      { sel: [6, 6], traba: 6, zoom: true, t: 'Revisás la posición o tratás de identificar si el problema está en que no recordás la armonía en ese momento.' },
      { sel: [5, 6], zoom: true, t: '6 y 7…' },
      { sel: [6, 7], zoom: true, t: '…o 7 y 8, depende de qué te convenga más.' },
      { sel: [4, 7], arregla: 6, t: 'Y de nuevo, del 5 al 8.' },
      { sel: [4, 7], pausa: true, t: 'No siempre es necesario hacer todos estos pasos, pero muchas veces es lo más inteligente si podemos pasar estas etapas rápido y tenemos claro el objetivo final, que es tocar sobre toda la forma del tema con el mismo control.' },
      { sel: [0, 7], t: 'Ahora sí: ya practicaste del 1 al 4 y del 5 al 8. Ahora podés hacer **del 1 al 8**.' },
      { sel: [8, 11], t: 'Del 9 al 12.' },
      { sel: [12, 15], t: 'Del 13 al 16.' },
      { sel: [8, 15], t: 'Del 9 al 16.' },
      { sel: [0, 7], t: 'Un repaso del 1 al 8.' },
      { sel: [0, 15], t: 'Y juntás todo. Si el tema tiene 32, hacés lo mismo con los 16 que siguen.' },
    ],
    no: {
      tandas: [
        { sel: [-1, -1], pausa: true, grande: true, t: 'Ahora la idea es que sumes compases del standard repitiendo el mismo proceso que ya venís haciendo.' },
        { sel: [-1, -1], pausa: true, grande: true, t: 'Cómo **no** sumar compases' },
        { sel: [0, 3], t: 'Lo que hace casi todo el mundo: siempre desde el principio. Del 1 al 4.' },
        { sel: [0, 7], t: 'Del 1 al 8.' },
        { sel: [0, 11], t: 'Del 1 al 12.' },
        { sel: [0, 15], t: 'Del 1 al 16.' },
        { sel: [0, 15], pausa: true, malo: true, t: '**El compás 1 lo practicaste 4 veces y el 16 una sola.** Y justo lo nuevo, que es lo que más cuesta, es lo que menos atención recibe.' },
      ],
    },
  },
  cuerdas: {
    tipo: 'cuerdas', titulo: 'Cómo bajar de cuerdas y volver a juntarlas',
    sub: 'Cuando 3 cuerdas se complican, bajá a 2. Y si 2 también, a 1.',
    unidades: ['1ª', '2ª', '3ª'],
    tandas: [
      { sel: [0, 1], t: 'Bajás a 2 cuerdas: **la 1 y la 2**.' },
      { sel: [1, 2], t: 'Después **la 2 y la 3**.' },
      { sel: [0, 2], t: 'Y recién ahí **las 3 juntas**.' },
      { sel: [1, 2], traba: 2, t: 'Si con la 2 y la 3 te seguís trabando, bajá a una…' },
      { sel: [1, 1], zoom: true, t: '…la 2 sola…' },
      { sel: [2, 2], zoom: true, t: '…la 3 sola…' },
      { sel: [1, 2], arregla: 2, t: '…otra vez la 2 y la 3…' },
      { sel: [0, 2], t: '…y las 3 juntas.' },
    ],
  },
  transcripcion: {
    tipo: 'ola', titulo: 'Cómo armar el solo por partes',
    sub: 'Objetivo: **30 segundos del solo**. Lo partís en frases: A, B, C…',
    unidades: ['A', 'B1', 'B2', 'B3', 'C', 'D', 'E', 'F', 'G', 'H'],
    grupos: [['A', 0, 0], ['B', 1, 3], ['C', 4, 4], ['D', 5, 5], ['E', 6, 6], ['F', 7, 7], ['G', 8, 8], ['H', 9, 9]],
    contar: 'Veces que cantaste cada parte',
    tandas: [
      { sel: [0, 0], t: 'Frase A.' },
      { sel: [1, 3], traba: 1, t: 'Frase B… y se complica.' },
      { sel: [1, 1], zoom: true, partir: 1, t: 'Partís la B en las partes que necesites: **B1**…' },
      { sel: [2, 2], zoom: true, t: '…B2…' },
      { sel: [3, 3], zoom: true, t: '…B3.' },
      { sel: [1, 2], zoom: true, t: 'B1 con B2…' },
      { sel: [2, 3], zoom: true, t: '…B2 con B3…' },
      { sel: [1, 3], arregla: 1, t: '…y la B entera. Ya sale.' },
      { sel: [0, 3], t: 'A con B.' },
      { sel: [4, 4], t: 'C.' },
      { sel: [5, 5], t: 'D.' },
      { sel: [4, 5], t: 'C con D.' },
      { sel: [1, 5], t: 'B, C y D.' },
      { sel: [0, 5], t: 'A, B, C y D.' },
      { sel: [6, 6], t: 'E.' },
      { sel: [7, 7], t: 'F.' },
      { sel: [4, 7], t: 'De la C a la F.' },
      { sel: [8, 8], t: 'G.' },
      { sel: [9, 9], t: 'H.' },
      { sel: [6, 9], t: 'De la E a la H.' },
      { sel: [0, 5], t: 'Un repaso de la A a la D.' },
      { sel: [0, 9], t: 'Y el solo entero: **tus 30 segundos**. Si en algún momento vuelve a aparecer una traba, en la B1 o donde sea, vas directo ahí.' },
    ],
    no: {
      tandas: [{ sel: [0, 0] }, { sel: [0, 3] }, { sel: [0, 4] }, { sel: [0, 5] }, { sel: [0, 6] }, { sel: [0, 7] }, { sel: [0, 8] }, { sel: [0, 9] }],
      t: 'Siempre desde el principio: A, A-B, A-B-C…',
      fin: '**La A la cantaste 8 veces y la H una sola.** Y las partes difíciles nunca las trabajaste solas.',
    },
  },
};

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
      id: 'obj0', etapa: 'pre', opcional: true,
      titulo: 'Los objetivos de este módulo',
      hojaDeRuta: {
        objetivos: [
          '**Identificar los intervalos más rápido** en las posiciones de la viola.',
          '**Ordenar las posiciones en 3 cuerdas**, para tener menos información.',
          '**Nombrar los intervalos**: en pelota parada, a tempo y con skipping.',
          '**Primeros enlaces** sobre un standard, a tiempo real.',
        ],
        puente: { pasos: ['Pelota parada', 'A tempo', 'Skipping', 'Skipping a tempo', 'Primeros enlaces'], hasta: 'Clase 1' },
        meta: 'Llegar listo a **la clase 1**.',
      },
      pregunta: '¿Arrancamos?',
      progreso: [{ id: 'listo', label: 'Lo leí y entiendo las prioridades del módulo, ¡avancemos nomás!', nivel: 'listo' }],
    },
    {
      id: 'p2', etapa: 'pre', entrega: 'video', envia: 'un video nombrando en voz alta los intervalos, sin tempo, en las 4 posiciones de las primeras 3 cuerdas para los 4 tipos de acorde.',
      video: { id: '2DfcA6_JdW4' }, hotmart: 'k458JjqROl',
      titulo: 'Nombrar los intervalos en voz alta',
      detalle: 'Nombrá los **intervalos enteros** en voz alta (7ma mayor, 5ta disminuida, etc.), en las **4 posiciones** para los **4 tipos de acorde**.\n# Por ahora, solo en las primeras 3 cuerdas',
      recursos: [{ t: 'Doc: Previa técnica - Arpegios base', url: DOC_PREVIA }],
      progreso: [
        { id: 'todas', label: 'Los nombro sin dudar en todas las posiciones de las primeras 3 cuerdas', nivel: 'listo', resp: 'Espectacular! A lo que sigue' },
        { id: 'algunas', label: 'Algunas posiciones me salen y otras todavía no', nivel: 'casi',
          resp: 'Si lo que te sale es en las primeras tres cuerdas, **está perfecto**: vamos a trabajar a fondo con esas cuerdas en la primera parte del programa, así que no hace falta más por ahora. Mandame video y seguimos!\n\nSi alguna posición de esas 3 cuerdas todavía no sale, **separá la información**: laburá solo sobre las que te cuestan y tomate el tiempo que necesites, despacito, para arriba y para abajo. Aislar lo que nos cuesta y trabajar sobre eso es de las cosas más importantes de la práctica.' },
        { id: 'dudo', label: 'Todavía dudo en casi todas', nivel: 'cuesta',
          resp: 'Escribime por WhatsApp y lo vemos!', muestra: ['dedos'] },
      ],
      problemas: [
        { id: 'dedos', q: 'Los dedos van solos, pero no sé bien qué intervalo estoy tocando',
          fix: 'Laburá sobre las posiciones que menos conocés y tomate todo el tiempo que necesites. **Separá la información**: si algunas ya salen y otras no, trabajá sobre las que no.' },
      ],
    },
    {
      id: 'p3', etapa: 'pre', entrega: 'video', envia: 'un video del mismo ejercicio a tempo, con el metrónomo y los nombres cortos ("siete, uno, tres").',
      video: { id: 'GLSfAS-RnhQ' }, hotmart: 'RONqgwvP7P',
      titulo: 'Lo mismo, a tempo',
      detalle: 'Poné un tempo cómodo y hacé el mismo ejercicio en tiempo real. Acá acortamos los nombres: **"siete, uno, tres"** en vez de "séptima mayor, tónica, tercera mayor", así fluye mejor.',
      progreso: [
        { id: 'limpio', label: 'Me sale casi sin errores', nivel: 'listo', resp: 'Bien ahí! A seguir' },
        { id: 'poco', label: 'Me equivoco un poco', nivel: 'casi',
          resp: 'Si tenés un **15-20% de error, está perfecto**. Podés darle un poquito más, pero ya estás para seguir.' },
        { id: 'mucho', label: 'Me equivoco todo el tiempo', nivel: 'cuesta',
          resp: 'Si el error ronda el 50%, hay que dar **un paso atrás**: apagá el metrónomo y repasá la posición que haga falta, tomate tu tiempo. También podés pasar a tempo primero las posiciones que más te cuestan, y después juntarlas con las demás.' },
      ],
      recursos: [{ t: 'Doc: Previa técnica - Arpegios base', url: DOC_PREVIA, sec: ['h.7icmi6cvsqs0', 'Segundo paso: pasar a tempo'] }],
    },
    {
      id: 'p4', etapa: 'pre', entrega: 'video', envia: 'un video aplicando el skipping: primero sin tempo y después a tempo.',
      video: { id: 'GLSfAS-RnhQ' }, hotmart: 'RONqgwvP7P',
      titulo: 'Aplicar el skipping',
      detalle: 'Repetí los dos pasos anteriores con **skipping**: primero sin tempo y después a tempo.\nSirve para **desordenar la información** y asegurarte de que la asimilaste de verdad.',
      progreso: [
        { id: 'tempo', label: 'Me sale sin tempo y a tempo', nivel: 'listo', resp: 'Excelente!! Seguí adelante' },
        { id: 'sintempo', label: 'Me sale sin tempo, a tempo todavía no', nivel: 'casi',
          resp: 'Ya casi estás, un último esfuerzo! Aunque sea bien lento… **pero a tempo**. Igual ya hiciste un gran laburo y estás para seguir si querés.' },
        { id: 'cuesta', label: 'Me cuesta mucho', nivel: 'cuesta',
          resp: 'Mirá los intervalos de la posición en el orden normal una vez, y después con skipping, sobre cada tipo de acorde. **De a poquito, por sectores** y a tu ritmo. Cuando un sector esté cómodo, probalo a tempo.' },
      ],
      recursos: [{ t: 'Doc: Previa técnica - Arpegios base', url: DOC_PREVIA, sec: ['h.mbggwpqnwk8v', 'Skipping'] }],
    },
    {
      id: 'p5', etapa: 'pre',
      titulo: 'Elegir el standard',
      detalle: 'Escribime por WhatsApp y elegimos juntos **el standard** con el que vas a trabajar',
      pregunta: '¿Ya lo eligieron?',
      progreso: [{ id: 'listo', label: 'Ya lo elegimos juntos', nivel: 'listo' }],
    },
    {
      id: 'p5b', etapa: 'pre',
      progreso: [
        { id: 'super', label: '¡Súper! Se entiende todo', nivel: 'listo' },
        { id: 'duda', label: 'Hay cosas que no entiendo', nivel: 'cuesta', resp: 'Escribime por WhatsApp y lo vemos juntos!' },
      ],
      video: { id: 'TylWJrfPxu0' }, hotmart: 'PeAgJn18OW',
      titulo: 'Ver el video de Enlaces de Arpegios y leer el PDF',
      detalle: 'Mirá **el video completo** antes de empezar y leé el documento.',
      recursos: [
        { t: 'Video completo: Enlaces de Arpegios', url: VIDEO_ENLACES },
        { t: 'Doc: Enlaces de Arpegios', url: DOC_ENLACES },
      ],
    },
    {
      id: 'p6', etapa: 'pre', entrega: 'video o texto', envia: 'un video corto o un texto con las posiciones que vas a usar para los primeros 4 acordes del standard.', sinProgreso: true,
      video: { id: 'PqJhew7HiLs' },
      titulo: 'Mostrar compases, acordes y posiciones',
      detalle: 'Este video cortito muestra cómo acomodar las posiciones para que el ejercicio funcione: **una por acorde** y **todas en la misma zona del diapasón**.',
      pregunta: '¿Se entendió el video?',
      progreso: [
        { id: 'listo', label: 'Sí, se entendió', nivel: 'listo' },
        { id: 'duda', label: 'No del todo', nivel: 'cuesta', resp: 'Volvé a verlo con la viola en la mano. Si sigue sin cerrar, mandame igual tus posiciones y contame qué parte no entendiste.' },
      ],
      recursos: [{ t: 'Video: Ver video', url: 'https://www.youtube.com/watch?v=PqJhew7HiLs' }],
      problemas: [
        { id: 'zonas', q: 'Las posiciones me quedan en distintas zonas del diapasón',
          fix: 'Elegí **una sola posición por acorde** y que queden todas en la misma zona, lo más cerca posible entre sí. Si dudás, usá las del PDF del entrenamiento.' },
      ],
    },
    {
      id: 'p7', etapa: 'pre', sinProgreso: true,
      video: { id: 'TylWJrfPxu0', t: 460 }, hotmart: 'PeAgJn18OW',
      titulo: 'Enlaces con dirección y ritmo fijos, sin tempo',
      detalle: 'En pelota parada, sin tempo, buscá enlaces posibles con **dirección melódica fija** entre las posiciones que elegiste para los 4 compases del standard.\n- **No vale cambiar de dirección en el medio.** Solo se sube hasta la nota más aguda posible de las posiciones, y recién ahí se puede bajar.\n- **No vale saltear notas:** conectás siempre por nota más cercana hacia el acorde siguiente.\n- Solo **blancas**, y respetando las posiciones elegidas.',
      recursos: [
        { t: 'Volver a ver la explicación', url: 'https://youtu.be/TylWJrfPxu0?t=460' },
        { t: 'Volver a ver el ejemplo', url: 'https://youtu.be/TylWJrfPxu0?t=671' },
        { t: 'Doc: Enlaces de Arpegios', url: DOC_ENLACES, sec: ['h.i4h42i2cmk7d', 'Paso 1 · Elegir la zona y observar los enlaces'] },
      ],
    },

    /* ---------- Enlaces ---------- */
    {
      id: 'obj1', etapa: 'enlaces', opcional: true,
      titulo: 'Los objetivos de este módulo',
      hojaDeRuta: {
        objetivos: [
          'Enlaces con dirección y ritmo **fijos**, a tiempo real.',
          'Soltar primero la **dirección** y después el **ritmo**.',
          '**Anticipaciones**: tocar notas del acorde que viene antes de que llegue.',
          '**Superposiciones**: una por acorde, y el mismo proceso otra vez.',
        ],
        puente: { ciclo: true, pasos: ['Acomodar posiciones de los arpegios', 'Ritmo fijo, dirección fija', 'Ritmo fijo, dirección libre', 'Ritmo libre, dirección libre', 'Anticipaciones', 'Superposiciones'] },
        meta: 'Llegar al **Módulo 2** con todo esto andando.',
      },
      pregunta: '¿Arrancamos?',
      progreso: [{ id: 'listo', label: 'Lo leí y entiendo las prioridades del módulo, ¡avancemos nomás!', nivel: 'listo' }],
    },
    {
      id: 'e1', etapa: 'enlaces', entrega: 'video', envia: 'un video de los enlaces con dirección y ritmo fijos (en blancas) sobre los mismos compases, con metrónomo o iReal.',
      video: { id: 'TylWJrfPxu0', t: 898 }, hotmart: 'PeAgJn18OW',
      titulo: 'Enlaces con dirección y ritmo fijos, a tempo',
      detalle: 'Las mismas reglas, ahora con metrónomo o iReal. Con los días, **subí un poquito el tempo**.\n# La idea es encontrar enlaces nuevos, no repetir siempre los mismos\nArrancá desde notas distintas, o desde notas que ya usaste pero en la otra dirección.',
      recursos: [
        { t: 'Ver ejemplo de enlaces a tempo', url: 'https://youtu.be/TylWJrfPxu0?t=898' },
        { t: 'Herramienta iReal: contrabajo acompañante', url: 'https://www.youtube.com/watch?v=-M5xF9Crru8' },
        { t: 'Doc: Enlaces de Arpegios', url: DOC_ENLACES, sec: ['h.u80juzhmtbbk', 'Paso 2 · Tocar a tempo, manteniendo dirección y ritmo fijos'] },
      ],
      nota: 'Si tenés Android, pedime el .apk de iReal gratis por WhatsApp.',
      progreso: [
        { id: 'fluye', label: 'Me sale a tempo con pocos errores', nivel: 'listo', resp: 'Joya! Podés seguir adelante, o ver si estos videos te ayudan a encontrar más enlaces o a llegar más rápido al objetivo.', muestra: ['apoyo'] },
        { id: 'errores', label: 'Me sale, pero con errores o muy lento', nivel: 'casi', muestra: ['apoyo'] },
        { id: 'trabo', label: 'Me trabo seguido', nivel: 'cuesta', muestra: ['apoyo', 'loop', 'complica'] },
      ],
      apoyo: {
        titulo: 'Cuellos de botella',
        texto: 'Antes de hacer el ejercicio a medias, conviene **dar un paso atrás** con alguno de estos dos (o con los dos) y después volver al ejercicio completo.',
        textoListo: 'Si querés ir más allá, estos dos te pueden ayudar a encontrar más enlaces o a llegar más rápido al objetivo.',
        items: [
          { t: 'Cuello de botella #1: anticipar los cambios de acorde', cuando: 'Para cuando llega el cambio de acorde y te quedás en blanco.', partes: [
            { titulo: 'Práctica', video: 'https://www.youtube.com/watch?v=c_aQIVXsF9M', tv: 'Ver el video de la demostración', url: DOC_CUELLO_1_GUIA, td: 'Leer el documento práctico' },
            { titulo: 'Explicación (si con la práctica no alcanza)', video: 'https://www.youtube.com/watch?v=iHEcRTrt12I', tv: 'Ver el video de la explicación', url: DOC_CUELLO_1_EXPL, td: 'Leer el documento de la explicación' } ] },
          { t: 'Cuello de botella #2: notas por cuerda', cuando: 'Para cuando sabés la progresión y entendés las posiciones, pero no lo manejás como quisieras.', url: DOC_CUELLO_2, video: 'https://www.youtube.com/watch?v=JHJhLmtCsno' },
        ],
      },
      problemas: [
        { id: 'loop', q: 'Repetir siempre el mismo recorrido',
          fix: 'Si arrancás dos veces desde la misma nota, hacés el mismo recorrido. **Empezá desde una nota nueva**, o desde la misma pero en la dirección contraria.' },
        { id: 'complica', q: 'Que se complique demasiado',
          fix: 'Antes de bajar el tempo, **achicá**: menos compases (2 en vez de 4) o menos cuerdas (primero 1 y 2, después 2 y 3, y finalmente las 3). Vas a ver qué rápido se destraba!' },
      ],
    },
    {
      id: 'e2', etapa: 'enlaces', entrega: 'video', envia: 'un video de los enlaces con dirección melódica libre, en blancas, sobre los mismos compases.',
      video: { id: 'TylWJrfPxu0', t: 1516 }, hotmart: 'PeAgJn18OW',
      progreso: [ { id: 'nuevos', label: 'Encuentro caminos nuevos', nivel: 'listo' }, { id: 'conocido', label: 'Me sale, pero vuelvo a lo que ya sabía', nivel: 'casi', muestra: ['esconder'] }, { id: 'fijo', label: 'Me cuesta salir del recorrido fijo', nivel: 'cuesta', muestra: ['esconder'] } ],
      stop: 'cuerdas', stopCerrado: true,
      titulo: 'Dirección melódica libre',
      detalle: 'Mismo ritmo de blancas, mismas posiciones y compases, pero ahora **elegís cómo enlazar**: quedarte en una nota común, repetir una nota y cambiar las de alrededor, cambiar de dirección cuando quieras, saltear…\n# Buscá caminos sorpresivos, no lo automático',
      recursos: [{ t: 'Video: ver ejemplo con dirección melódica libre', url: VIDEO_ENLACES + '&t=1516s' }, { t: 'Video: Recomendado: Cuello de botella #3', url: 'https://www.youtube.com/watch?v=we8Wgy3SmF8' }, { t: 'Doc: Enlaces de Arpegios', url: DOC_ENLACES, sec: ['h.q2948mi1lvc6', 'Paso 3 · Soltar la dirección melódica'] }],
      problemas: [
        { id: 'esconder', q: 'Termino tocando los enlaces que ya sabía',
          fix: 'Es fácil esconderse en lo conocido! Mirate este video para destrabar nuevos caminos: [Cuello de botella #3](https://www.youtube.com/watch?v=we8Wgy3SmF8)' },
      ],
    },
    {
      id: 'e3', etapa: 'enlaces', entrega: 'video', envia: 'un video tocando con las posiciones de siempre, pero con ritmo libre.',
      video: { id: 'TylWJrfPxu0', t: 1691 }, hotmart: 'PeAgJn18OW',
      progreso: [ { id: 'musica', label: 'Logro tocar con las notas correspondientes y hacer música', nivel: 'listo' }, { id: 'oido', label: 'Me guío por el oído y pierdo las notas que entrené en las ejercitaciones pasadas', nivel: 'casi', muestra: ['muchas', 'porque'] } ],
      titulo: 'Ritmo libre',
      detalle: 'Mismas notas, mismos lugares, pero **sin ritmo ni dirección fijos**.\nUsá el oído: dejá espacios, repetí notas, buscá formas de tejer los cambios.\n# Cantá lo que tocás, aunque no afines\nEl impulso de cantar te conecta con el oído y no con el automatismo de los dedos.',
      recursos: [{ t: 'Video: ver ejemplo con ritmo libre', url: VIDEO_ENLACES + '&t=1691s' }, { t: 'Doc: Enlaces de Arpegios', url: DOC_ENLACES, sec: ['h.1u2xjx9x7ij7', 'Paso 4 · Soltar el ritmo'] }],
      problemas: [
        { id: 'muchas', q: 'Toco muchas más notas que antes, casi toda la posición',
          fix: 'Probá limitarte a tocar de **0 a 3 notas por acorde**. Recordá que ahora vale tocar una sola nota o dejar silencio durante los compases que quieras. **Mejor ir de menos a más.**' },
        { id: 'porque', q: 'Siento que toco por tocar, suena a ejercicio',
          fix: 'Cantá mientras tocás y **esperá a que venga una idea**. Si no viene nada, no toques nada; cuando venga, plasmala como puedas y volvé a esperar. En criollo… no toques por tocar 😉' },
      ],
    },
    {
      id: 'e4', etapa: 'enlaces', sinVideo: true, hotmart: 'PeAgJn18OW',
      entrega: 'video', envia: 'un video dominando nuevos compases de la armonía',
      pregunta: '¿Cómo seguimos?',
      progreso: [
        { id: 'video', label: 'Te mando un video dominando nuevos compases', nivel: 'listo' },
        { id: 'saltear', label: 'Saltear por ahora', nivel: 'listo', saltea: true, resp: 'Dale, seguimos!' },
      ],
      titulo: 'Sumar compases del standard',
      stop: 'compases',
      detalle: 'Con los compases que siguen, repetí el proceso desde cero.\n# Cuando estés al 80-85%, es el mejor momento para avanzar!',
      problemas: [
        { id: 'compas', q: 'Hay compases en los que siempre me equivoco o que manejo peor',
          fix: 'Mirá el ejemplo de arriba: **Así sí** y **Así no**.' },
        { id: 'posiciones', q: 'No sé si sumar más posiciones o seguir con el tema',
          fix: 'Primero **el tema entero con control**, después cambiar de posiciones.' },
      ],
    },

    /* ---------- Anticipaciones ---------- */
    {
      id: 'a1', etapa: 'antic',
      video: { id: '86aNkZzca64' }, hotmart: 'R4jj2lj24a',
      progreso: [
        { id: 'listo', label: 'Ya lo vi, ¡se entiende bien!', nivel: 'listo' },
        { id: 'duda', label: 'Tengo dudas', nivel: 'cuesta', resp: 'Escribime tus preguntas por WhatsApp!' },
      ],
      titulo: 'Mirar la Ejercitación N2',
      detalle: 'Mirá el video y leé el doc de **anticipaciones armónicas**. Sirve para destrabar el "tejido" entre un compás y otro, así no suena **compartimentado** cuando improvisás con ritmo libre.',
      recursos: [{ t: 'Doc: Anticipaciones armónicas', url: DOC_ANTIC }],
    },
    {
      id: 'a2', etapa: 'antic', entrega: 'video', envia: 'un video de las anticipaciones con ritmo fijo sobre tus compases.',
      video: { id: '86aNkZzca64' }, hotmart: 'R4jj2lj24a',
      progreso: [
        { id: 'bien', label: 'Me sale bien', nivel: 'listo', resp: 'Bárbaro! A lo que sigue' },
        { id: 'cuesta', label: 'Me cuesta', nivel: 'casi', resp: 'Cuando las anticipaciones se traban, casi siempre el problema está **un paso antes**. Fijate cuál de los destapa cuellos de botella se parece a lo que te pasa, practicalo un rato y volvé al ejercicio.', muestra: ['apoyo'] },
        { id: 'no', label: 'No me sale', nivel: 'cuesta', resp: 'Demos **un paso atrás**: fijate cuál de los destapa cuellos de botella se parece a lo que te pasa y laburalo antes de volver. Y si querés, escribime y lo vemos!', muestra: ['apoyo', 'tempo'] },
      ],
      apoyo: {
        titulo: 'Destapa cuellos de botella',
        texto: 'Cada uno ataca un problema distinto. Elegí el que se parece a lo que te pasa.',
        items: [
          { t: 'Cuello de botella #1: anticipar los cambios de acorde', cuando: 'Si cuando llega el cambio de acorde te quedás en blanco: entrena tener el acorde que viene en la cabeza antes de que llegue, que es justo lo que pide anticipar.', partes: [
            { titulo: 'Práctica', video: 'https://www.youtube.com/watch?v=c_aQIVXsF9M', tv: 'Ver el video de la demostración', url: DOC_CUELLO_1_GUIA, td: 'Leer el documento práctico' },
            { titulo: 'Explicación (si con la práctica no alcanza)', video: 'https://www.youtube.com/watch?v=iHEcRTrt12I', tv: 'Ver el video de la explicación', url: DOC_CUELLO_1_EXPL, td: 'Leer el documento de la explicación' } ] },
          { t: 'Cuello de botella #2: notas por cuerda', cuando: 'Si sabés la progresión y entendés las posiciones, pero no encontrás rápido las notas en cada cuerda: para anticipar necesitás tenerlas a mano.', url: DOC_CUELLO_2, video: 'https://www.youtube.com/watch?v=JHJhLmtCsno' },
          { t: 'Cuello de botella #3: dirección melódica libre', cuando: 'Si las notas las tenés, pero los enlaces te salen siempre iguales o rígidos: suelta la dirección para que la anticipación pueda caer donde la frase lo pide.', video: 'https://www.youtube.com/watch?v=we8Wgy3SmF8' },
        ],
      },
      titulo: 'Anticipaciones con ritmo fijo',
      detalle: 'Hacelo tal cual el video, **con el ritmo fijo**, sobre tus compases. Probá en grupos de **1, 2 y 3 cuerdas**, y con **1, 2 y 3 notas por acorde**. Que esté desafiante!',
      recursos: [{ t: 'Doc: Anticipaciones armónicas', url: DOC_ANTIC, sec: ['h.d64b8tcry81', 'El ejercicio'] }],
      problemas: [
        { id: 'tempo', q: 'A tempo no me sale',
          fix: 'Empezá en **una sola cuerda** y con **1 nota por acorde**. Cuando salga, sumá cuerdas o notas de a una.' },
      ],
    },
    {
      id: 'a3', etapa: 'antic', entrega: 'video', envia: 'un video improvisando con ritmo libre y anticipando a veces el acorde que viene.',
      video: { id: '86aNkZzca64' }, hotmart: 'R4jj2lj24a',
      progreso: [ { id: 'natural', label: 'Anticipo a veces y suena natural', nivel: 'listo' }, { id: 'forzado', label: 'Anticipo, pero suena forzado', nivel: 'casi', muestra: ['forzado'] }, { id: 'olvido', label: 'Me olvido de anticipar o me pierdo', nivel: 'cuesta' } ],
      titulo: 'Ritmo libre, anticipando a veces',
      detalle: 'Volvé a improvisar con ritmo libre, pero ahora **anticipando a veces**: alguna nota del acorde que viene en el "y" del 4, o hasta en el 4. Acá no hace falta el ritmo fijo.\nCantando, y buscando dar **discurso**.',
      recursos: [{ t: 'Doc: Anticipaciones armónicas', url: DOC_ANTIC, sec: ['h.d64b8tcry81', 'El ejercicio'] }],
      problemas: [
        { id: 'forzado', q: 'Anticipo todo el tiempo y suena forzado',
          fix: 'La idea es anticipar **a veces**, no siempre. Usalo como un recurso más para darle continuidad a la frase.' },
      ],
    },

    /* ---------- Superposiciones ---------- */
    {
      id: 's1', etapa: 'super',
      video: { id: '_GkCOK9r3Wg' }, hotmart: 'k45bBv9Qel',
      sinProgreso: true,
      titulo: 'Mirar la Ejercitación N3 y anotar preguntas',
      tip: 'Aprovechá para mirar el video y anotar preguntas para la próxima clase. Seguro aparecen varias dudas teóricas, así que ¡a sacarle punta al lápiz!',
      detalle: 'Mirá el video de **superposiciones**. Todavía no hace falta tocarlo: traé las dudas a la clase.',
      recursos: [
        { t: 'Video: Ejercitación N3', url: 'https://www.youtube.com/watch?v=_GkCOK9r3Wg' },
        { t: 'Doc: Superposiciones de arpegios', url: DOC_SUPER },
      ],
    },
    {
      id: 's2', etapa: 'super', entrega: 'video', envia: 'un video mostrando las posiciones y nombrando qué intervalos son para el acorde original y para el nuevo.',
      video: { id: '_GkCOK9r3Wg' }, hotmart: 'k45bBv9Qel',
      sinProgreso: true,
      titulo: 'Elegir superposiciones y ordenar las posiciones a utilizar',
      detalle: 'Elegí **1 sola superposición para cada acorde** de la armonía que vas a practicar (idealmente, 4 compases de tu standard).\nAcomodá las posiciones como hiciste con los arpegios originales.\nDespués mandame un video mostrando las posiciones y **nombrando los intervalos** que significa esa superposición para el acorde original y para el nuevo.',
      recursos: [{ t: 'Doc: Superposiciones de arpegios', url: DOC_SUPER, sec: ['h.vfkluicha2wa', '¿Cómo usar estas tablas?'] }],
      problemas: [
        { id: 'menormaj', q: 'No entiendo cómo se escriben algunos acordes (por ejemplo -maj7)',
          fix: '-maj7 es menor con 7ma mayor: 3ra menor y 7ma mayor. Por ejemplo, A-maj7 es La menor con 7ma mayor.' },
      ],
    },
    {
      id: 's3', etapa: 'super', entrega: 'video', envia: 'un video de los enlaces con las superposiciones, en esos pocos compases.',
      video: { id: '_GkCOK9r3Wg' }, hotmart: 'k45bBv9Qel',
      titulo: 'Enlaces con superposiciones',
      progreso: [
        { id: 'listo', label: 'Ya estoy', nivel: 'listo' },
        { id: 'cuesta', label: 'Todavía me cuesta', nivel: 'cuesta', resp: 'Escribime tus preguntas por WhatsApp!' },
      ],
      detalle: 'Repetí todo el proceso de enlaces, ahora con las superposiciones en vez de los acordes originales. Por partes, como antes, y terminá **cantando**.',
      ciclo: { pasos: ['Acomodar las posiciones', 'Dirección y ritmo fijos, sin tempo', 'Dirección y ritmo fijos, a tempo', 'Dirección melódica libre', 'Ritmo libre'] },
      recursos: [{ t: 'Doc: Superposiciones de arpegios', url: DOC_SUPER, sec: ['h.vug3bvs4kaom', 'Tablas de superposición de arpegios'] }],
    },

    /* ---------- Módulo 2: ADN del Jazz ---------- */
    {
      id: 'obj2', etapa: 'm2', opcional: true,
      titulo: 'Los objetivos de este módulo',
      hojaDeRuta: {
        objetivos: [
          '**Transcribir 30 segundos de un solo**: primero cantando, después en la viola.',
          '**Conocer los elementos** del lenguaje del jazz.',
          '**Incorporarlos en 3 etapas**: reconocimiento, mecanización e integración. Primero con los cromáticos ascendentes.',
          '**Decodificar un fragmento de tu solo** y pasarlo por el mismo proceso.',
        ],
        puente: { desde: 'Lo que conocemos', pasos: ['Reconocimiento', 'Mecanización', 'Integración'], hasta: 'Lo que usamos al improvisar' },
        meta: 'Llegar a trabajar un fragmento de tu solo **entre la clase 3 y la 4**. Mientras antes, mejor.',
        importante: ['No importa en cuántos elementos lo hagas, sino **qué tan profundo** y bien lo hacés.'],
        cierre: 'Que te vayas con **un método para sumar recursos del lenguaje a tu tocada**.',
      },
      pregunta: '¿Arrancamos?',
      progreso: [
        { id: 'listo', label: 'Lo leí y entiendo las prioridades del módulo, ¡avancemos nomás!', nivel: 'listo' },
      ],
    },
    {
      id: 'm2', etapa: 'm2', entrega: 'audio o video', envia: 'un audio o video cantando 30 segundos del solo encima de la pista.',
      video: { id: 'BK6LGMZTU9M' }, hotmart: 'r48bWKZw7R',
      stop: 'transcripcion',
      titulo: 'Cómo transcribir eficientemente',
      detalle: 'Elegí un solo para transcribir y mirá el video: ahí te muestro cómo transcribir **cantando**, con Audiostretch.\nDespués mandame un audio o video cantando **30 segundos del solo encima de la pista** (del solo, no de la intro ni de la melo!).',
      progreso: [
        { id: 'listo', label: 'Ya estoy para mandarlo', nivel: 'listo' },
        { id: 'quince', label: 'Tengo solo 15 segundos', nivel: 'listo', envia: 'esos 15 segundos cantando el solo encima de la pista.', resp: 'Mandame esos 15 segundos y seguí sumando hasta los 30! Para lo que falta, **hacelo por partes**:\n- **Loops cortos**: de 2 a 5 segundos, de 3 a 5 notas como mucho.\n- Si una nota no sale, pasá el dedo por encima de las notas en la app y escuchalas una por una.\n- Armá los pedacitos que necesites y andá juntándolos, como muestro en el video.' },
        { id: 'cuesta', label: 'Me cuesta mucho', nivel: 'cuesta', envia: 'aunque sea 15 segundos cantando el solo encima de la pista. Si no sale, escribime y lo resolvemos.', resp: '**Hacelo por partes**:\n- **Loops cortos**: de 2 a 5 segundos, de 3 a 5 notas como mucho.\n- Si una nota no sale, pasá el dedo por encima de las notas en la app y escuchalas una por una.\n- Armá los pedacitos que necesites y andá juntándolos, como muestro en el video.\nVa a salir' },
        { id: 'saltear', label: 'Saltearlo por ahora', nivel: 'casi', saltea: true, resp: 'Dale, seguí con lo que viene. Cuando lo tengas, volvé a este paso y mandámelo.' },
      ],
      recursos: [{ t: 'Doc: Cómo transcribir eficientemente', url: 'https://docs.google.com/document/d/1rSCUIcyhFixSVUZQuGXH0xXd6Y1QV6Qdn1eIEBfNaqM/edit' }],
    },
    {
      id: 'm1', etapa: 'm2',
      video: { id: 'o-sV1KM5J-o' }, hotmart: 'RO9qy9mjOP',
      titulo: 'Cromáticos ascendentes: mirar el video',
      detalle: 'Mirá **el video completo** una vez y después leé el doc. Todavía no hace falta tocar: en los pasos que siguen vamos ejercitación por ejercitación.',
      progreso: [{ id: 'visto', label: 'Vi el video y leí el doc', nivel: 'listo' }],
      recursos: [{ t: 'Doc: ADN del Jazz, notas de aproximación', url: 'https://docs.google.com/document/d/1FVQ5RILkfJnro_aNtwZop-l6jbJqvHRJfgN_NgSCv0g/edit' }],
    },
    {
      id: 'c1', etapa: 'm2', entrega: 'video', envia: 'un video de la Ejercitación Nº1 a tempo, para arriba y para abajo.',
      video: { id: 'o-sV1KM5J-o', t: 178 }, hotmart: 'RO9qy9mjOP',
      titulo: 'Cromáticos ascendentes: Ejercitación Nº1',
      detalle: 'Antes de empezar, tené **bien clara la escala y la posición** en la que estás trabajando: todo el ejercicio se apoya en eso.\n- A) Elegí una posición de la escala mayor y ubicá las notas objetivo, de la tónica a la 7ma. En cada una buscá la nota **un semitono abajo**: esa es su aproximación. Ojo con los dos casos especiales: hacia la 4ta el cromático es la 3ra, y hacia la tónica es la 7ma. Probalo lento, sin tempo.\n- B) Pasalo a tempo, empezando en el contratiempo. [Ejemplo a 55 BPM](https://youtu.be/o-sV1KM5J-o?t=178) · [a 85 BPM](https://youtu.be/o-sV1KM5J-o?t=208)\n# El cromático en el aire, la nota de la escala en la tierra\n- C) Lo mismo con la escala descendente. [Ejemplo](https://youtu.be/o-sV1KM5J-o?t=266)\nBuscá una velocidad que te **desafíe un poco**, aunque sea lenta, pero constante.',
      progreso: [
        { id: 'listo', label: 'Ya estoy para mandarlo', nivel: 'listo' },
        { id: 'lento', label: 'Me sale sin errores, pero lento', nivel: 'listo', resp: 'Está bien así: **lento pero constante**. Mandámelo a esa velocidad y de ahí vamos subiendo de a poco.' },
        { id: 'errores', label: 'Tengo trabas o errores', nivel: 'casi', resp: 'Podés hacerlo **por partes**, de a dos cuerdas, e ir juntando de a poquito.\nMandámelo como te salga, no tiene que ser perfecto!' },
        { id: 'traba', label: 'Me trabo o me pierdo', nivel: 'cuesta', resp: 'Escribime por WhatsApp y lo vemos!' },
      ],
      recursos: [{ t: 'Doc: ADN del Jazz, notas de aproximación', url: 'https://docs.google.com/document/d/1FVQ5RILkfJnro_aNtwZop-l6jbJqvHRJfgN_NgSCv0g/edit', sec: ['h.jdcef9tf1otq', 'Ejercitación 1'] }],
    },
    {
      id: 'c2', etapa: 'm2', entrega: 'video', envia: 'un video de la Ejercitación Nº2.',
      video: { id: 'o-sV1KM5J-o', t: 388 }, hotmart: 'RO9qy9mjOP',
      titulo: 'Cromáticos ascendentes: Ejercitación Nº2',
      detalle: 'Líneas cromáticas de **6 y de 10 notas** que empiezan en cada grado de la escala.\n- Grupos de 3 parejas (6 notas): desde la tónica, cromáticos a 1, 2 y 3; desde la 2da, a 2, 3 y 4; desde la 3ra, a 3, 4 y 5; y así por toda la escala. Después, lo mismo con 5 parejas (10 notas).\n- Antes de cada grupo, **decí en voz alta en qué grado arrancás**.\n- Cuando la nota objetivo es la 4ta o la tónica, el cromático es la 3ra o la 7ma: **esa nota se repite**.\n- **Copiá exactamente el patrón del ejemplo**, en ritmo y en cantidad de notas.\n- Revisalo bien parte por parte antes de hacerlo a tempo. Podés trabajarlo por grupos de cuerdas, no hace falta hacer todo de un tirón: cuando tenés las partes, las juntás.\n- Finalmente, si podés, subí el tempo.\n[Ejemplo a 95 BPM, 3 parejas](https://youtu.be/o-sV1KM5J-o?t=388) · [Ejemplo con 5 parejas](https://youtu.be/o-sV1KM5J-o?t=462)',
      progreso: [
        { id: 'listo', label: 'Ya estoy para mandarlo', nivel: 'listo' },
        { id: 'algunas', label: 'Desde algunas notas me trabo', nivel: 'casi', resp: 'Tené solo dos cosas en la cabeza: **en qué nota arrancás** (decila en voz alta) y **qué nota se repite** (la 3ra o la 7ma).\nPodés practicar las líneas por grupos de cuerdas, de a 3 o 4 líneas como máximo, y después juntar las piezas. Lo que te confunda, revisalo sin tempo.' },
        { id: 'cuesta', label: 'Me cuesta mucho', nivel: 'cuesta', resp: 'Bajá la velocidad o volvé a la Ejercitación Nº1 desde la nota donde te trabás, o escribime y lo resolvemos.' },
      ],
      recursos: [{ t: 'Doc: ADN del Jazz, notas de aproximación', url: 'https://docs.google.com/document/d/1FVQ5RILkfJnro_aNtwZop-l6jbJqvHRJfgN_NgSCv0g/edit', sec: ['h.fxoyvbdit16z', 'Ejercitación 2: Etapa de Mecanización'] }],
    },
    {
      id: 'c3', etapa: 'm2', entrega: 'video', envia: 'un video improvisando sobre la progresión, primero solo con cromáticos ascendentes y después mezclándolos con la escala.',
      video: { id: 'o-sV1KM5J-o', t: 604 }, hotmart: 'RO9qy9mjOP',
      titulo: 'Cromáticos ascendentes: Ejercitación Nº3',
      detalle: 'Poné una progresión simple (II–V–I o II–V–I–VI) y usá **solo este recurso**, de todas las formas que puedas:\n- Líneas para arriba, para abajo y con cambios de dirección.\n- Distintas longitudes: cromáticos sueltos (2 notas), líneas cortas (4 a 6), medianas (8 a 12) y largas (14 a 20).\n- Distintos puntos de comienzo en el compás.\nRecién después **mezclalo con la escala mayor**, tocando libre y cantando si querés: lo nuevo con lo viejo.\nHay **dos videos**, mirate ambos.',
      progreso: [
        { id: 'listo', label: 'Ya estoy para mandarlo', nivel: 'listo' },
        { id: 'mismas', label: 'Me quedo siempre en las mismas líneas', nivel: 'casi', resp: 'Trabajá las variantes **de a una**: un rato solo líneas para abajo, otro solo largas, otro empezando en distintos lugares del compás. Después mezclalas.' },
        { id: 'cuesta', label: 'Me cuesta mucho', nivel: 'cuesta', resp: 'Volvé un rato a la Ejercitación Nº2 y después probá con **líneas cortas sobre un solo acorde**. Y si querés, escribime por WhatsApp!' },
      ],
      recursos: [
        { t: 'Doc: ADN del Jazz, notas de aproximación', url: 'https://docs.google.com/document/d/1FVQ5RILkfJnro_aNtwZop-l6jbJqvHRJfgN_NgSCv0g/edit', sec: ['h.aib8rdfi7b9', 'Ejercitación 3: Etapa de Integración'] },
        { t: 'Video: Ejemplos de la Ejercitación Nº3', url: 'https://youtu.be/o-sV1KM5J-o?t=604' },
        { t: 'Video: Momento de integración libre', url: 'https://youtu.be/saRjud2tZw4?t=0' },
      ],
    },
    {
      id: 'solo', etapa: 'm2', entrega: 'video', envia: 'un video tocando en la viola los 30 segundos del solo.',
      video: { id: 'BK6LGMZTU9M' }, hotmart: 'r48bWKZw7R',
      titulo: 'Tu solo en la guitarra',
      detalle: '**Ahora la prioridad es el solo!** Pasá esos 30 segundos a la viola y mandame un video tocándolos.\n- Hacelo por partes, de a una frase, y después las vas juntando.\n- Si una frase no sale, volvé a cantarla con el audio hasta tenerla clarísima, y recién ahí buscala en la viola.\nCuando me lo mandes seguimos con los otros elementos del lenguaje y con el último proceso del módulo, que lo hacemos sobre este solo',
      seguimiento: {
        segun: 'm2', pregunta: '¿Cómo venís con la transcripción del solo cantado?',
        casos: {
          listo: { tip: 'Ya tenés los 30 segundos cantados, buenísimo! Ahora a pasarlos a la viola y mandame video' },
          _: { opciones: [
            { id: 'treinta', label: 'Ya tengo 30 segundos o más', nivel: 'listo', resp: 'Espectacular! A pasarlos a la viola y mandame video' },
            { id: 'flojo', label: 'Ando flojo', nivel: 'cuesta', resp: 'Ponete las pilas que el solo es prioridad! 😛 Volvé a "Cómo transcribir eficientemente" y arrancá con loops cortitos, de 3 a 5 notas. Si algo no sale, escribime y lo resolvemos.' },
          ] },
        },
      },
      pregunta: '¿Ya lo estás pasando a la guitarra?',
      progreso: [
        { id: 'listo', label: 'Ya tengo 30 segundos o más en la guitarra', nivel: 'listo' },
        { id: 'armando', label: 'Lo voy armando', nivel: 'casi', resp: 'Seguí por partes, de a una frase. Mandámelo cuando tengas los 30 segundos, aunque no esté perfecto!' },
        { id: 'flojo', label: 'Ando flojo', nivel: 'cuesta', resp: 'Ponete las pilas que es prioridad! Agarrá una frase sola, cantala con el audio y buscala nota por nota en la viola. Si alguna no aparece, escribime y lo resolvemos.' },
        { id: 'saltear', label: 'Saltearlo por ahora', nivel: 'casi', saltea: true, resp: 'Dale, seguí con lo que viene. Pero no lo dejes colgado eh! Cuando lo tengas, volvé acá y mandámelo.' },
      ],
      recursos: [{ t: 'Doc: Cómo transcribir eficientemente', url: 'https://docs.google.com/document/d/1rSCUIcyhFixSVUZQuGXH0xXd6Y1QV6Qdn1eIEBfNaqM/edit', sec: ['h.g588m8ye6z2g', 'Recién ahora, la guitarra'] }],
    },
    {
      id: 'n7', etapa: 'm2', entrega: 'video', entregaOpcional: true, envia: 'videos de tu proceso de mecanización o de integración! Mencioná el elemento en el video.', video: { id: 'M6jHqGGAF8w' }, hotmart: 'PeAgnBd1OW',
      titulo: 'Más elementos del lenguaje',
      detalle: 'Elegí alguno de estos elementos y hacé el mismo proceso que con los cromáticos: **reconocimiento, mecanización e integración**.\nLa prioridad sigue siendo el solo.',
      panel: [
        { t: 'Cromático descendente', video: 'M6jHqGGAF8w' },
        { t: 'Auxiliar', video: 'pd8IgNbFJIo' },
        { t: 'Resoluciones indirectas 1', video: 'C7LsWB2xgz4' },
        { t: 'Resoluciones indirectas 2', video: 'JvzNRJduA_I' },
      ],
      pregunta: '¿Cómo venís con estos elementos?',
      progreso: [
        { id: 'trabajo', label: 'Estoy trabajando alguno', nivel: 'listo' },
        { id: 'vistos', label: 'Miré los videos', nivel: 'listo', resp: 'Bien! Si alguno aparece en tu solo, ese es **buen candidato para mecanizar**' },
        { id: 'duda', label: 'Tengo dudas', nivel: 'cuesta', resp: 'Escribime tus preguntas por WhatsApp!' },
      ],
      recursos: [{ t: 'Doc: ADN del Jazz, notas de aproximación', url: 'https://docs.google.com/document/d/1FVQ5RILkfJnro_aNtwZop-l6jbJqvHRJfgN_NgSCv0g/edit', sec: ['h.wuqwlhdguj6r', 'Entonces, recapitulando…'] }],
    },
    {
      id: 'n6', etapa: 'm2', entrega: 'video', envia: 'un video tocando el fragmento de tu solo que decodificaste, mecanizado por la escala.',
      video: { id: 'GrXVCxwRs6g' }, hotmart: '0Ovo3xZN4j',
      titulo: 'Combinación de elementos del lenguaje',
      detalle: 'Mirá el video con el doc al lado. La idea es hacerlo con **el solo que transcribiste**:\n- Elegí un **fragmento chico** (no tiene que ser largo!).\n- **Decodificalo**: en qué escala madre está y de qué está hecho, nota por nota o por intervalos. Anotalo.\n- **Reconocelo** en el diapasón, en todos los grados de la escala, dentro de una posición.\n- **Mecanizalo** y después **integralo**, igual que con los cromáticos ascendentes.\n[Ejemplos de decodificación](https://youtu.be/GrXVCxwRs6g?t=605)',
      progreso: [
        { id: 'listo', label: 'Ya decodifiqué un fragmento y lo estoy mecanizando', nivel: 'listo' },
        { id: 'sinsolo', label: 'Todavía no tengo el solo en la guitarra', nivel: 'casi', saltea: true, resp: 'Primero terminá de pasar el solo a la viola. Mientras tanto, seguí con los cromáticos y mirá lo que viene. Cuando lo tengas, volvé acá!' },
        { id: 'decodificar', label: 'No me doy cuenta de qué elementos tiene', nivel: 'cuesta', saltea: true, resp: 'Probá con un pedazo más corto, de 3 o 4 notas. Si igual no sale, no hay drama: traé el fragmento a la clase y lo decodificamos juntos.' },
      ],
      recursos: [{ t: 'Doc: Combinación de elementos del lenguaje', url: 'https://docs.google.com/document/d/1qfI-iy2YXxOiD083q6OSH9_0qr3yo9XbUQ6FOv4c0rI/edit', sec: ['h.jx2axfx9nqcx', 'Las 4 etapas del proceso'] }],
    },
    /* ---------- Módulo 3: Entrenamiento rítmico ---------- */
    {
      id: 'obj3', etapa: 'ritmo', opcional: true,
      titulo: 'Los objetivos de este módulo',
      hojaDeRuta: {
        objetivos: [
          '**Un método para practicar ritmos con el cuerpo** y pasarlos a la viola por escalones.',
          '**Improvisar con unidades rítmicas** y con el entrenador rítmico.',
          'Prepararte para el **desarrollo motívico** de la Curva del Solo.',
        ],
        puente: { titulo: 'Los escalones para pasar un ritmo a la viola', desde: 'Con el cuerpo', pasos: ['Una sola nota', 'Escala fija', 'Escala con más libertades', 'Cambios de acorde con arpegios', 'Cambios de acorde con escalas'] },
        meta: 'Llegar preparado a la **Curva del Solo**, el último módulo.',
      },
      pregunta: '¿Arrancamos?',
      progreso: [{ id: 'listo', label: 'Lo leí y entiendo las prioridades del módulo, ¡avancemos nomás!', nivel: 'listo' }],
    },
    {
      id: 'r1', etapa: 'ritmo', video: { id: '2iYdNyLkTIc' }, hotmart: 'y4bpGGbL7R',
      titulo: 'Introducción: entrenamiento rítmico',
      detalle: 'Mirá el video de introducción al módulo',
    },
    {
      id: 'r2', etapa: 'ritmo', video: { id: 'CY11GrypJpo' }, hotmart: '37dp00Kk7L',
      titulo: 'Ritmo A + ritmo al cuerpo',
      detalle: 'Mirá el video y practicá el **ritmo A con el cuerpo**, como muestro ahí.',
    },
    {
      id: 'r3', etapa: 'ritmo', video: { id: 'Y5o2rSOFpnQ' }, hotmart: '97B2PPYx7p',
      titulo: 'Ritmo B + cómo destrabar cualquier ritmo',
      detalle: 'Mirá el video y practicá el **ritmo B** como muestro ahí.',
    },
    {
      id: 'r4', etapa: 'ritmo', video: { id: 'Zi8GzfFqmOI' }, hotmart: 'ROxwydYK7D',
      titulo: 'Ritmo A + aplicaciones varias al instrumento',
      detalle: 'Mirá el video con el PDF al lado y llevá el **ritmo A a la viola**.',
      recursos: [{ t: 'Doc: Integración de un ritmo al instrumento', url: 'https://docs.google.com/document/d/1The81Adyg6GEMgMbDe7ayNz9pw0iBe6BBUteAwG-jIo/edit' }],
    },
    {
      id: 'r5', etapa: 'ritmo', video: { id: 'ersUb9-L1zA' }, hotmart: 'y4bp2dGy7R',
      titulo: 'Ritmo B: ejemplos en el instrumento',
      detalle: 'Mirá el video y llevá el **ritmo B a la viola**.',
    },
    {
      id: 'r6', etapa: 'ritmo', video: { id: 'CHKJyTSdmIg' }, hotmart: 'LO0b9KRaeG',
      titulo: 'Ritmos C, D y E + improvisación con tiempos y contratiempos',
      detalle: 'Mirá el video con el PDF al lado.',
      recursos: [{ t: 'Doc: Ritmos C, D y E + improvisación con tiempos y contratiempos', url: 'https://docs.google.com/document/d/1A5RHqBYIycktRvhm_rEuvkYICkGyGFQ7b_lX-tTVQtU/edit' }],
    },
    {
      id: 'r7', etapa: 'ritmo', entrega: 'video', envia: 'un video improvisando con el cuerpo o con la guitarra: elegí 1 o 2 elementos, contá en el video cuáles son y hacé una improvisación buscando hacer mucho con poco.',
      video: { id: 'A4rxE6i5VwY' },
      titulo: 'Unidades rítmicas y variabilidad en la improvisación',
      detalle: 'Mirá el video con el doc al lado y practicá con el **entrenador rítmico**: elegís las unidades y te arma improvisaciones para leer y cantar.',
      recursos: [
        { t: 'Doc: Improvisación con unidades rítmicas', url: 'https://docs.google.com/document/d/1pKRZwbhdszAGjsV4x-b9d-kb7dDPlss7xGHkU_yEdxo/edit' },
        { t: 'Entrenador rítmico', url: 'https://andykligman.github.io/entrenador-ritmico/' },
      ],
    },
  ],

  /* Lo que se espera tener ANTES de cada clase, por nivel.
     Es acumulativo: el nivel 2 incluye lo del 1, y cada clase incluye las anteriores. */
  esperado: {
    1: { min: ['p2', 'p3', 'p4', 'p5', 'p5b', 'p6', 'p7'], esp: ['e1'], ideal: ['e2'] },
    2: { min: ['e1'], esp: ['e2', 'e3'], ideal: ['e4', 'a1', 'a2'] },
    3: { min: ['e2', 'e3'], esp: ['a1', 'a2', 'a3'], ideal: ['e4', 's1'] },
    4: { min: ['a1', 'a2', 'a3', 's1'], esp: ['s2', 's3'], ideal: ['m1', 'm2'] },
    5: { min: [], esp: ['m1', 'm2', 'c1'], ideal: ['c2', 'c3'] },
  },
  clases: 4,
  consejoGeneral: 'Todo lo que signifique incorporar algo nuevo pide dar un paso atrás: menos compases, menos cuerdas, o repasar las posiciones y los acordes fuera del ritmo. Bajar el tempo también sirve, pero suele haber mejores opciones.',
};
