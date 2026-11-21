/* =====================================================================
   PROGRAMA — contenido del mapa (editable)
   Cada paso: id, etapa, titulo, detalle, entrega ('video'|'audio'|null),
   recursos [{t, url}], problemas [{id, q, fix, url?}]
   ===================================================================== */
const VIDEO_ENLACES = 'https://www.youtube.com/watch?v=TylWJrfPxu0';
const DOC_ENLACES = 'https://docs.google.com/document/d/14Df9jDecsFC6HnizipZ0nu1pBbVw2kOBzvydTMo3VOk/edit';
/* Presentación para quienes tienen la llamada conmigo (link ?llamada). IDs de YouTube; vacío = no se muestra */
const LLAMADA = {
  bienvenida: '',
  testimonios: [{ nombre: 'Iña', id: '' }, { nombre: 'Manu', id: '' }],
};
const WHATSAPP_ANDY = '5491130994020';   // número con código de país, sin + ni espacios (ej. 5491112345678)
const AULA = 'https://hotmart.com/es/club/andras-martan-kligman';
const DOC_CUELLO_1_GUIA = 'https://docs.google.com/document/d/1P4SVjJFGVKgoYTP-DZD1ZNpM0q-ObKuh/edit';
const DOC_CUELLO_1_EXPL = 'https://docs.google.com/document/d/1F4A99qcJbhQ3kTDGbBUI1NDt7gq_H0RG/edit';
const DOC_PREVIA = 'https://docs.google.com/document/d/1U-WLpCr_hnW5ruUY3mWW3GThD1lYPX6y2AksiWiADnk/edit';
const DOC_ANTIC = 'https://docs.google.com/document/d/1TaI7oAl4eMyHolWW7E-7TPfvxc4yk5SLBnzNlYOjrOM/edit';
const DOC_SUPER = 'https://docs.google.com/document/d/1v3JwZIC3liAwwICnzZSHpBrMBP_4_4Kw9WqACELv35o/edit';
/* Un doc por módulo (del 1 en adelante): cada doc original es una sección (Título 1) con sus partes adentro.
   El Módulo 0 sigue con sus docs sueltos (Previa técnica y Enlaces). */
const DOC_M1 = 'https://docs.google.com/document/d/1E9ghwMyWI7l5D_1fCeYxzRDBY4Ul8OXqDW_b3FYTCzs/edit';
const SEC_M1 = { enlaces: 'h.wtgkkm7rnpt', guia: 'h.8julnsralh0s', expl: 'h.syylx1swi571', cuello2: 'h.cdngpaeaknef', antic: 'h.gowt4p6ef7fq', super: 'h.8j4i73xczj1l' };
const DOC_M2 = 'https://docs.google.com/document/d/1rSCUIcyhFixSVUZQuGXH0xXd6Y1QV6Qdn1eIEBfNaqM/edit';
const SEC_M2 = { transcribir: 'h.tozabldxa12', adn: 'h.azfzavn43se4', combinacion: 'h.1g37w21t4zug' };
const DOC_M3 = 'https://docs.google.com/document/d/1The81Adyg6GEMgMbDe7ayNz9pw0iBe6BBUteAwG-jIo/edit';
const SEC_M3 = { integracion: 'h.2vf3aiors22l', ritmos: 'h.si3m5xlsyd92', unidades: 'h.cdhx3lo2hd5x' };
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
// Módulo de ritmo: me sale o no me sale (y si no, que me escriban)
const PROGRESO_RITMO = [
  { id: 'listo', label: 'Me sale', nivel: 'listo' },
  { id: 'cuesta', label: 'No me sale', nivel: 'cuesta', resp: 'Escribime por WhatsApp y lo vemos!' },
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
    tipo: 'cifrado', titulo: 'Cómo sumar compases sin perder profundidad ni control', velocidad: 1, audio: 'audio/compases/', audioNo: 'audio/compases-no/', empiezaNo: true,
    sub: 'Los primeros 16 compases de un standard. Cada tanda es un rato de práctica.',
    unidades: Array.from({ length: 16 }, (_, i) => String(i + 1)),
    acordes: ['F-7', 'Bb-7', 'Eb7', 'Abmaj7', 'Dbmaj7', 'D-7', 'G7', 'Cmaj7', 'C-7', 'F-7', 'Bb7', 'Ebmaj7', 'Abmaj7', 'A-7b5', 'D7', 'Gmaj7'],
    contar: 'Veces que practicaste cada compás',
    tandas: [
      { sel: [-1, -1], pausa: true, grande: true, vis: 'sumar', t: 'Cómo sumar compases\nsin perder la profundidad y el control\nque venís construyendo hasta ahora' },
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
        { sel: [-1, -1], pausa: true, grande: true, vis: 'ciclo', t: 'Ahora la idea es que sumes compases del standard\nrepitiendo el mismo proceso que ya venís haciendo.' },
        { sel: [-1, -1], pausa: true, grande: true, vis: 'no-sumar', t: 'Cómo **no** sumar compases' },
        { sel: [0, 3], t: 'Lo que hace casi todo el mundo: siempre desde el principio. Del 1 al 4.' },
        { sel: [0, 7], t: 'Del 1 al 8.' },
        { sel: [0, 11], t: 'Del 1 al 12.' },
        { sel: [0, 15], t: 'Del 1 al 16.' },
        { sel: [0, 15], pausa: true, malo: true, t: '**El compás 1 lo practicaste 4 veces y el 16 una sola.** Y justo lo nuevo, que es lo que más cuesta, es lo que menos atención recibe.' },
      ],
    },
  },
  cierreFijo: {
    tipo: 'texto', titulo: 'Cierre de los ritmos fijos', audio: 'audio/cierre-fijo/', velocidad: 1,
    sub: 'Lo que ya tenés para practicar ritmo, y cómo seguir.',
    unidades: [],
    tandas: [
      { sel: [-1, -1], pausa: true, grande: true, vis: 'rf-ritmos', t: 'Ya aprendiste a entrenar con **ritmos fijos**,' },
      { sel: [-1, -1], pausa: true, grande: true, vis: 'rf-cuerpo', t: 'con un camino ordenado\nque te lleva **del cuerpo a la guitarra**.' },
      { sel: [-1, -1], pausa: true, grande: true, vis: 'rf-escalera', t: 'Una sola nota, una escala más abierta,\ncambios de acorde con arpegios\ny cambios de acorde con escalas.' },
      { sel: [-1, -1], pausa: true, grande: true, vis: 'rf-donde', t: 'No importa hasta dónde hayas llegado\nni si estás más cómodo con unas cosas que con otras.' },
      { sel: [-1, -1], pausa: true, grande: true, vis: 'rf-mapa', t: 'Ya tenés **un mapa** de cómo practicar ritmo.' },
      { sel: [-1, -1], pausa: true, grande: true, vis: 'rf-compases', t: 'Un ritmo de 1 o 2 compases,\n**sostenido durante mucho tiempo**,' },
      { sel: [-1, -1], pausa: true, grande: true, vis: 'rf-redoblante', t: 'dejando que **las notas se adapten al ritmo**\ny no al revés.' },
      { sel: [-1, -1], pausa: true, grande: true, vis: 'rf-nuestro', t: 'Dejándonos influenciar por eso que viene de afuera\ny **haciéndolo nuestro**.' },
      { sel: [-1, -1], pausa: true, grande: true, vis: 'rf-generador', t: 'Para que sigas practicando de acá en más,\nte dejo un **generador de ritmos fijos**.' },
      { sel: [-1, -1], pausa: true, grande: true, vis: 'rf-seguimos', t: 'Ahora le damos un cierre a los ritmos fijos\ny pasamos a **improvisar con unidades rítmicas**.' },
      { sel: [-1, -1], pausa: true, grande: true, vis: 'rf-chau', boton: { t: 'Generador de ritmos fijos', url: 'https://ritmo.ajuste-elastico.com/#fijo', suave: true }, t: '**Nos vemos en lo que viene.**' },
    ],
  },
  whatsapp: {
    tipo: 'texto', titulo: 'Cómo usar el acompañamiento por WhatsApp', audio: 'audio/whatsapp/',
    sub: 'Cuándo mandarme una consulta o un video, y por qué conviene hacerlo antes de que esté listo.',
    unidades: [],
    tandas: [
      { sel: [-1, -1], pausa: true, grande: true, vis: 'chat', t: 'Cómo usar el acompañamiento por WhatsApp' },
      { sel: [-1, -1], pausa: true, grande: true, vis: 'chat', t: 'En este programa, el acompañamiento por WhatsApp\npuede tener el mismo o hasta **más efecto sobre tu avance que las clases**.' },
      { sel: [-1, -1], pausa: true, grande: true, vis: 'registro', t: 'Es la manera de tener un registro, momento a momento,\nde **los errores y los aciertos** de tu práctica.' },
      { sel: [-1, -1], pausa: true, grande: true, vis: 'destrabar', t: 'Con esta herramienta entendemos **qué corregir**\npara destrabar el avance…' },
      { sel: [-1, -1], pausa: true, grande: true, vis: 'avanzar', t: '…y **cuándo dejar de dar vueltas** sobre lo mismo\ny pasar a lo siguiente, sin perder tiempo ni energía.' },
      { sel: [-1, -1], pausa: true, grande: true, vis: 'chat', t: 'Muchos alumnos tardan en entender\ncuál es el mejor momento para mandar una consulta o un video.' },
      { sel: [-1, -1], pausa: true, grande: true, vis: 'duda', t: 'Uno de los mejores momentos es justo **cuando no entendés una consigna**,\no cuando te resulta **demasiado difícil** una tarea.' },
      { sel: [-1, -1], pausa: true, grande: true, vis: 'zona', t: 'En este proceso las consignas nunca tienen que ser tan difíciles.\nSiempre requieren algo de trabajo,\npero **todo tiene que funcionar** sin demasiado problema.' },
      { sel: [-1, -1], pausa: true, grande: true, vis: 'video-no', t: 'Muchas veces uno no quiere mandar un video\npor miedo a que **no sea perfecto**…' },
      { sel: [-1, -1], pausa: true, grande: true, vis: 'video-no', t: '…o porque, de alguna manera,\n**no está listo**.' },
      { sel: [-1, -1], pausa: true, grande: true, malo: true, t: 'Pero no hay nada más equivocado que esto!' },
      { sel: [-1, -1], pausa: true, grande: true, vis: 'video-ok', t: 'Para destrabar un ejercicio, lo más efectivo es mandar el video\n**haciéndolo, aunque no esté bien**:\nasí corregimos las sutilezas que traban el progreso.' },
      { sel: [-1, -1], pausa: true, grande: true, vis: 'chat', t: 'Así que te invito a usar el acompañamiento por WhatsApp\n**desde el primer momento**.' },
      { sel: [-1, -1], pausa: true, grande: true, vis: 'camino', t: 'Para avanzar de la manera más fluida posible,\nsin frustraciones, sobreesfuerzos ni estancamientos innecesarios.' },
    ],
  },
  cuerdas: {
    tipo: 'cuerdas', titulo: 'Cómo bajar de cuerdas y volver a juntarlas', audio: 'audio/cuerdas/', audioNo: 'audio/cuerdas-no/', empiezaNo: true,
    sub: 'Cuando 3 cuerdas se complican, bajá a 2. Y si 2 también, a 1.',
    unidades: ['1ª', '2ª', '3ª', '4ª', '5ª', '6ª'],
    tandas: [
      { sel: [-1, -1], pausa: true, grande: true, vis: 'separar', t: 'Cómo bajar de cuerdas y volver a juntarlas' },
      { sel: [0, 2], trabaAca: true, t: 'Si con 3 cuerdas la cosa se complica, bajás a 2.' },
      { sel: [0, 1], t: '**La 1 y la 2.**' },
      { sel: [1, 2], t: 'Después **la 2 y la 3**.' },
      { sel: [0, 2], t: 'Y recién ahí **las 3 juntas**.' },
      { sel: [-1, -1], pausa: true, grande: true, vis: 'traba', t: 'Si con alguno de los grupos te seguís trabando,\no sentís que no ves las cosas con suficiente claridad…' },
      { sel: [1, 2], traba: 2, t: 'Bajá a **una sola cuerda**.' },
      { sel: [1, 1], zoom: true, t: 'Primero, **la 2 sola**.' },
      { sel: [2, 2], zoom: true, t: 'Después, **la 3 sola**.' },
      { sel: [1, 2], arregla: 2, t: 'Otra vez **la 2 y la 3**.' },
      { sel: [0, 2], t: 'Y finalmente, **las 3 juntas**.' },
      { sel: [-1, -1], pausa: true, grande: true, vis: 'control', t: 'Volvemos al mismo lugar donde empezaste,\npero ahora con **muchísimo más control y seguridad**.' },
    ],
    no: {
      tandas: [
        { sel: [-1, -1], pausa: true, grande: true, vis: 'cuerdas', t: 'Uno de los parámetros más importantes\npara ajustar bien la práctica\nes **la cantidad de cuerdas** con las que trabajamos.' },
        { sel: [-1, -1], pausa: true, grande: true, vis: 'tempo-cuerdas', t: 'Es mucho mejor bajar la exigencia de ese modo\nque **bajando el tempo**.' },
        { sel: [-1, -1], pausa: true, grande: true, vis: 'info', t: 'Así reducimos **la cantidad de información total**,\nen vez de la velocidad a la que la practicamos.' },
        { sel: [-1, -1], pausa: true, grande: true, vis: 'no-cuerdas', t: 'Cómo **no** regular la cantidad de cuerdas' },
        { sel: [0, 0], t: 'Lo que hace casi todo el mundo: arrancar con **la 1**.' },
        { sel: [0, 1], t: 'Después **la 1 y la 2**.' },
        { sel: [0, 2], t: '**La 1, la 2 y la 3.**' },
        { sel: [0, 5], t: 'Y así hasta **las 6**.' },
        { sel: [0, 5], pausa: true, malo: true, veces: true, t: 'Así terminás practicando algunas cuerdas **muchísimo más que otras**,\ny arrastrás errores que no te concentrás en corregir.' },
      ],
    },
  },
  transcripcion: {
    tipo: 'ola', titulo: 'Cómo armar el solo por partes', velocidad: 1, audio: 'audio/transcripcion/', audioNo: 'audio/transcripcion-no/', empiezaNo: true,
    sub: 'Objetivo: **30 segundos del solo**. Lo partís en frases: A, B, C…',
    unidades: ['A', 'B1', 'B2', 'B3', 'C', 'D', 'E', 'F', 'G', 'H'],
    grupos: [['A', 0, 0], ['B', 1, 3], ['C', 4, 4], ['D', 5, 5], ['E', 6, 6], ['F', 7, 7], ['G', 8, 8], ['H', 9, 9]],
    contar: 'Veces que cantaste cada parte',
    tandas: [
      { sel: [-1, -1], pausa: true, grande: true, vis: 'partir', t: 'Cómo armar el solo **por partes**' },
      { sel: [0, 0], t: 'Frase A.' },
      { sel: [1, 3], traba: 1, t: 'Frase B… y se complicó.' },
      { sel: [1, 1], zoom: true, partir: 1, t: 'Partís la B en las partes que necesites: **B1**…' },
      { sel: [2, 2], zoom: true, t: '…B2…' },
      { sel: [3, 3], zoom: true, t: '…B3.' },
      { sel: [1, 2], zoom: true, t: 'B1 con B2…' },
      { sel: [2, 3], zoom: true, t: '…B2 con B3…' },
      { sel: [1, 3], arregla: 1, t: '…y la B completa. Ya sale.' },
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
      { sel: [0, 9], t: 'Y el solo entero: **los 30 segundos**.' },
      { sel: [-1, -1], pausa: true, grande: true, vis: 'directo', t: 'Si en algún momento vuelve a aparecer una traba como en la B,\npartís ese fragmento en **los pedazos que necesites**.' },
      { sel: [-1, -1], pausa: true, grande: true, extra: 4500, boton: { t: 'Cómo escuchar nota x nota en AudioStretch', url: 'https://www.youtube.com/shorts/CZ-87rYPIKY' }, t: 'O hasta podés pasar el dedo por la pantalla en la app\npara ir **nota x nota**.' },
      { sel: [-1, -1], pausa: true, grande: true, vis: 'control', t: 'Así, **no podés fallar**.' },
      { sel: [-1, -1], pausa: true, grande: true, vis: 'contar', t: 'Otra cosa que sirve mucho es\n**contar los pulsos con los dedos**…' },
      { sel: [-1, -1], pausa: true, grande: true, vis: 'contar', t: '…para recordar las entradas\nde las frases más inesperadas.' },
      { sel: [-1, -1], pausa: true, grande: true, vis: 'avanzar', t: 'Ahora sí, no hay excusas. **¡A trabajar!**' },
    ],
    no: {
      tandas: [
        { sel: [-1, -1], pausa: true, grande: true, vis: 'cantar', t: 'Ya viste el método para transcribir eficientemente.' },
        { sel: [-1, -1], pausa: true, grande: true, vis: 'partir', t: 'Ahora quiero hacer hincapié\nen **el reparto de los fragmentos**…' },
        { sel: [-1, -1], pausa: true, grande: true, vis: 'traba', t: '…porque esto suele ser una traba,\ny no quiero que te estanques.' },
        { sel: [-1, -1], pausa: true, grande: true, vis: 'no-transcribir', t: 'Cómo **no** armar el solo' },
        { sel: [0, 0], t: 'Lo que harías normalmente es ir desde el principio.\nUn fragmento A, digamos.' },
        { sel: [0, 3], t: 'A y B.' },
        { sel: [0, 4], t: 'A, B y C.' },
        { sel: [0, 5], t: 'Hasta la D.' },
        { sel: [0, 7], t: 'Hasta la F.' },
        { sel: [0, 7], pausa: true, malo: true, veces: true, t: '**La A la cantaste 5 veces y la F una sola.**\nSe genera un obvio desbalance entre las partes.' },
        { sel: [0, 7], pausa: true, malo: true, veces: true, t: 'Unas cuestan más que otras,\ny eso solo se perpetúa con el tiempo si acumulamos así los fragmentos.' },
      ],
    },
  },
  fragmento: {
    tipo: 'cifrado', titulo: 'Cómo ubicar tu fragmento en el solo', velocidad: 1, audio: 'audio/fragmento/',
    sub: 'De la forma del tema a los compases, de los compases a los acordes, y de los acordes a la escala madre.',
    unidades: ['1', '2', '3', '4', '5', '6', '7', '8'],
    acordes: ['Bbmaj7', 'G7', 'C-7', 'F7', 'D-7', 'G7', 'C-7', 'F7'],
    tandas: [
      { sel: [-1, -1], pausa: true, grande: true, vis: 'forma', t: 'Cómo ubicar tu fragmento en el solo' },
      { sel: [-1, -1], pausa: true, grande: true, vis: 'escuchar', t: 'Primero escuchá el tema de cero\ny asegurate de saber bien **en qué momento empieza la forma**.' },
      { sel: [-1, -1], pausa: true, grande: true, t: 'Si no tenés la armonía,\nbuscá el standard en **iReal** o su partitura.' },
      { sel: [-1, -1], pausa: true, grande: true, vis: 'forma', t: 'Escuchá la melodía hasta que termine\ny fijate en qué momento empiezan **los compases de la forma para el solo**.' },
      { sel: [-1, -1], pausa: true, grande: true, vis: 'contar', t: 'Después ubicá el fragmento en los compases que corresponden.\nSi hace falta, **contá los pulsos con los dedos**\npara saber en qué momento está sucediendo.' },
      { sel: [0, 7], t: 'Por ejemplo, estos son los compases del solo.' },
      { sel: [2, 3], t: 'Supongamos que tu fragmento cae en **el 3 y el 4**.' },
      { sel: [2, 3], zoom: true, t: 'Entonces suena sobre **C-7** y **F7**.' },
      { sel: [-1, -1], pausa: true, grande: true, vis: 'escala', t: 'C-7 y F7 son el **II y el V de Bb mayor**:\nesa es la **escala madre** donde pensás la frase.' },
      { sel: [-1, -1], pausa: true, grande: true, vis: 'grados', t: 'Con la escala madre clara,\nla frase se puede mover por **todos los grados** de esa escala.' },
      { sel: [-1, -1], pausa: true, grande: true, vis: 'control', t: 'Y así realizar la **mecanización e integración** correspondiente.' },
    ],
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
      id: 'p0w', etapa: 'pre', opcional: true, sinVideo: true, soloVer: true,
      titulo: 'Cómo usar el acompañamiento por WhatsApp',
      stop: 'whatsapp',
      pregunta: '¿Se entiende?',
      progreso: [
        { id: 'listo', label: 'Sí, dale', nivel: 'listo' },
        { id: 'duda', label: 'Tengo dudas', nivel: 'cuesta', resp: 'Escribime por WhatsApp y lo vemos!' },
      ],
    },
    {
      id: 'p2', etapa: 'pre', entrega: 'video', envia: 'un video nombrando en voz alta los intervalos, sin tempo, en las 4 posiciones de las primeras 3 cuerdas para los 4 tipos de acorde.',
      video: { id: '2DfcA6_JdW4' }, hotmart: 'k458JjqROl',
      grupo: 'Intervalos por posición, en 4 tipos de acorde',
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
      detalle: 'Poné un **tempo cómodo** y hacé **el mismo ejercicio en tiempo real**.\nAcá **acortamos los nombres**: **"siete, uno, tres"** en vez de "séptima mayor, tónica, tercera mayor", así fluye mejor.',
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
      id: 'p3c', etapa: 'pre', opcional: true, sinVideo: true, soloVer: true,
      titulo: 'Cómo bajar de cuerdas y volver a juntarlas',
      stop: 'cuerdas',
      pregunta: '¿Se entiende?',
      progreso: [
        { id: 'listo', label: 'Sí, lo tengo claro', nivel: 'listo' },
        { id: 'duda', label: 'Tengo dudas', nivel: 'cuesta', resp: 'Escribime por WhatsApp y lo vemos!' },
      ],
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
      id: 'llt1', etapa: 'pre', soloLlamada: true, sinVideo: true, sinTexto: true,
      titulo: 'Testimonio de Igna',
      embed: { tipo: 'yt', id: '3pFH0fIg5PI', recorte: '9/16' },
      pregunta: '¿Seguimos?',
      progreso: [
        { id: 'listo', label: 'Vi el video y estoy listo para seguir', nivel: 'listo' },
        { id: 'visto', label: 'Ya lo había visto', nivel: 'listo', resp: 'Entonces mirá este otro, el de Manu 👇', embed: { tipo: 'yt', id: '5nnkrbhQ4qI', fuente: '4/3', recorte: '4/5' } },
      ],
    },
    {
      id: 'llfin', etapa: 'pre', soloLlamada: true, sinVideo: true, sinTexto: true,
      titulo: 'Video de bienvenida',
      embed: { tipo: 'yt', id: 'A6bIbYywz3I', recorte: '9/16' },
      pregunta: '¿Seguimos?',
      progreso: [{ id: 'listo', label: 'Vi el video y estoy listo para seguir', nivel: 'listo' }],
    },
    {
      id: 'llt2', etapa: 'pre', soloLlamada: true, sinVideo: true, sinTexto: true,
      titulo: 'Testimonio de Manu',
      embed: { tipo: 'yt', id: '5nnkrbhQ4qI', fuente: '4/3', recorte: '4/5' },
      pregunta: '¿Seguimos?',
      progreso: [{ id: 'listo', label: 'Vi el video y estoy listo para seguir', nivel: 'listo' }],
    },
    {
      id: 'p5', etapa: 'pre',
      grupo: 'Ejercitación Nº1: Enlaces de arpegios',
      titulo: 'Elegir el standard',
      detalle: 'Escribime por WhatsApp y elegimos juntos **el standard** con el que vas a trabajar',
      wa: { label: 'Escribime para elegir el standard', txt: 'Hola Andy! Escribo para que elijamos juntos el standard con el que voy a trabajar' },
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

    {
      id: 'e1', etapa: 'pre', entrega: 'video', envia: 'un video de los enlaces con dirección y ritmo fijos (en blancas) sobre los mismos compases, con metrónomo o iReal.',
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
            { titulo: 'Práctica', video: 'https://www.youtube.com/watch?v=c_aQIVXsF9M', tv: 'Ver el video de la demostración', url: DOC_M1, sec: SEC_M1.guia, td: 'Leer el documento práctico' },
            { titulo: 'Explicación (si con la práctica no alcanza)', video: 'https://www.youtube.com/watch?v=iHEcRTrt12I', tv: 'Ver el video de la explicación', url: DOC_M1, sec: SEC_M1.expl, td: 'Leer el documento de la explicación' } ] },
          { t: 'Cuello de botella #2: notas por cuerda', cuando: 'Para cuando sabés la progresión y entendés las posiciones, pero no lo manejás como quisieras.', url: DOC_M1, sec: SEC_M1.cuello2, video: 'https://www.youtube.com/watch?v=JHJhLmtCsno' },
        ],
      },
      problemas: [
        { id: 'loop', q: 'Repetir siempre el mismo recorrido',
          fix: 'Si arrancás dos veces desde la misma nota, hacés el mismo recorrido. **Empezá desde una nota nueva**, o desde la misma pero en la dirección contraria.' },
        { id: 'complica', q: 'Que se complique demasiado',
          fix: 'Antes de bajar el tempo, **achicá**: menos compases (2 en vez de 4) o menos cuerdas (primero 1 y 2, después 2 y 3, y finalmente las 3). Vas a ver qué rápido se destraba!' },
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
      id: 'e2', etapa: 'enlaces', entrega: 'video', envia: 'un video de los enlaces con dirección melódica libre, en blancas, sobre los mismos compases.',
      video: { id: 'TylWJrfPxu0', t: 1516 }, hotmart: 'PeAgJn18OW',
      progreso: [ { id: 'nuevos', label: 'Encuentro caminos nuevos', nivel: 'listo' }, { id: 'conocido', label: 'Me sale, pero vuelvo a lo que ya sabía', nivel: 'casi', muestra: ['esconder'] }, { id: 'fijo', label: 'Me cuesta salir del recorrido fijo', nivel: 'cuesta', muestra: ['esconder'] } ],
      stop: 'cuerdas', stopCerrado: true,
      titulo: 'Dirección melódica libre',
      detalle: '# Mismo ritmo de blancas, mismas posiciones y compases, pero ahora elegís cómo enlazar\n- Quedarte en una nota común\n- Repetir una nota y cambiar las de alrededor\n- Cambiar de dirección cuando quieras\n- Saltear…',
      recursos: [{ t: 'Video: ver ejemplo con dirección melódica libre', url: VIDEO_ENLACES + '&t=1516s' }, { t: 'Video: Recomendado: Cuello de botella #3', url: 'https://www.youtube.com/watch?v=we8Wgy3SmF8', destacado: true }, { t: 'Doc: Enlaces de Arpegios', url: DOC_M1, sec: ['h.q2948mi1lvc6', 'Paso 3 · Soltar la dirección melódica'] }],
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
      recursos: [{ t: 'Video: ver ejemplo con ritmo libre', url: VIDEO_ENLACES + '&t=1691s' }, { t: 'Doc: Enlaces de Arpegios', url: DOC_M1, sec: ['h.1u2xjx9x7ij7', 'Paso 4 · Soltar el ritmo'] }],
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
      recursos: [{ t: 'Doc: Anticipaciones armónicas', url: DOC_M1, sec: [SEC_M1.antic, 'Anticipaciones armónicas'] }],
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
            { titulo: 'Práctica', video: 'https://www.youtube.com/watch?v=c_aQIVXsF9M', tv: 'Ver el video de la demostración', url: DOC_M1, sec: SEC_M1.guia, td: 'Leer el documento práctico' },
            { titulo: 'Explicación (si con la práctica no alcanza)', video: 'https://www.youtube.com/watch?v=iHEcRTrt12I', tv: 'Ver el video de la explicación', url: DOC_M1, sec: SEC_M1.expl, td: 'Leer el documento de la explicación' } ] },
          { t: 'Cuello de botella #2: notas por cuerda', cuando: 'Si sabés la progresión y entendés las posiciones, pero no encontrás rápido las notas en cada cuerda: para anticipar necesitás tenerlas a mano.', url: DOC_M1, sec: SEC_M1.cuello2, video: 'https://www.youtube.com/watch?v=JHJhLmtCsno' },
          { t: 'Cuello de botella #3: dirección melódica libre', cuando: 'Si las notas las tenés, pero los enlaces te salen siempre iguales o rígidos: suelta la dirección para que la anticipación pueda caer donde la frase lo pide.', video: 'https://www.youtube.com/watch?v=we8Wgy3SmF8' },
        ],
      },
      titulo: 'Anticipaciones con ritmo fijo',
      detalle: 'Hacelo tal cual el video, **con el ritmo fijo**, sobre tus compases. Probá en grupos de **1, 2 y 3 cuerdas**, y con **1, 2 y 3 notas por acorde**. Que esté desafiante!',
      recursos: [{ t: 'Doc: Anticipaciones armónicas', url: DOC_M1, sec: ['h.d64b8tcry81', 'El ejercicio de anticipaciones'] }],
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
      detalle: 'Volvé a improvisar con ritmo libre, pero ahora **anticipando a veces**: alguna nota del acorde que viene en el "y" del 4, o hasta en el 4. Acá no hace falta el ritmo fijo.\nCantando, y buscando "dar" (generar) **discurso**.',
      recursos: [{ t: 'Doc: Anticipaciones armónicas', url: DOC_M1, sec: ['h.d64b8tcry81', 'El ejercicio de anticipaciones'] }],
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
      detalle: 'Mirá el video de **superposiciones**.\n# Todavía no hace falta tocarlo: traé las dudas a la clase.',
      recursos: [
        { t: 'Video: Ejercitación N3', url: 'https://www.youtube.com/watch?v=_GkCOK9r3Wg' },
        { t: 'Doc: Superposiciones de arpegios', url: DOC_M1, sec: [SEC_M1.super, 'Superposiciones de arpegios'] },
      ],
    },
    {
      id: 's3', etapa: 'super', entrega: 'video', envia: 'un video mostrando las posiciones (nombrando qué intervalos son para el acorde original y para el nuevo) y los enlaces con las superposiciones.',
      video: { id: '_GkCOK9r3Wg' }, hotmart: 'k45bBv9Qel',
      titulo: 'Elegir superposiciones y enlazarlas',
      progreso: [
        { id: 'listo', label: 'Ya estoy', nivel: 'listo' },
        { id: 'cuesta', label: 'Todavía me cuesta', nivel: 'cuesta', resp: 'Escribime tus preguntas por WhatsApp!' },
      ],
      detalle: 'Elegí **1 sola superposición para cada acorde** de la armonía que vas a practicar (idealmente, 4 compases de tu standard) y acomodá las posiciones como hiciste con los arpegios originales.\nDespués repetí todo el proceso de enlaces, ahora con las superposiciones en vez de los acordes originales. Por partes, como antes, y terminá **cantando**.\nEn el video mostrame las posiciones y **nombrá los intervalos** que significa esa superposición para el acorde original y para el nuevo.',
      ciclo: { pasos: ['Acomodar las posiciones', 'Dirección y ritmo fijos, sin tempo', 'Dirección y ritmo fijos, a tempo', 'Dirección melódica libre', 'Ritmo libre'] },
      recursos: [{ t: 'Doc: Superposiciones de arpegios', url: DOC_M1, sec: ['h.vfkluicha2wa', '¿Cómo usar estas tablas?'] }, { t: 'Doc: Superposiciones de arpegios', url: DOC_M1, sec: ['h.vug3bvs4kaom', 'Tablas de superposición de arpegios'] }],
      problemas: [
        { id: 'menormaj', q: 'No entiendo cómo se escriben algunos acordes (por ejemplo -maj7)',
          fix: '-maj7 es menor con 7ma mayor: 3ra menor y 7ma mayor. Por ejemplo, A-maj7 es La menor con 7ma mayor.' },
      ],
    },

    /* ---------- Módulo 2: ADN del Jazz ---------- */
    {
      id: 'obj2', etapa: 'm2', opcional: true,
      titulo: 'Los objetivos de este módulo',
      hojaDeRuta: {
        objetivos: [
          '**Transcribir 30 segundos de un solo**: primero cantando, después en la viola.',
          '**Conocer o reordenar los elementos** del lenguaje del jazz.',
          '**Incorporarlos en 3 etapas**: reconocimiento, mecanización e integración. Primero con los cromáticos ascendentes.',
          '**Decodificar un fragmento de tu solo** y pasarlo por el mismo proceso.',
        ],
        puente: { desde: 'Lo que entendemos en teoría', pasos: ['Reconocimiento', 'Mecanización', 'Integración'], hasta: 'Lo que logramos usar al improvisar' },
        meta: 'Llegar a trabajar un fragmento de tu solo **entre la clase 3 y la 4**.',
        importante: ['No importa en cuántos elementos lo hagas, sino **qué tan profundo** y bien lo hacés.'],
        cierre: 'Que te vayas con **un método para sumar recursos del lenguaje a tu tocada**.',
      },
      pregunta: '¿Arrancamos?',
      progreso: [
        { id: 'listo', label: 'Lo leí y entiendo las prioridades del módulo, ¡avancemos nomás!', nivel: 'listo' },
      ],
    },
    {
      id: 'm2v', etapa: 'm2',
      video: { id: 'BK6LGMZTU9M' }, hotmart: 'r48bWKZw7R',
      titulo: 'Cómo transcribir eficientemente',
      detalle: 'Elegí un solo para transcribir y mirá **el video**: ahí te muestro cómo transcribir **cantando**, con Audiostretch.',
      progreso: [
        { id: 'visto', label: 'Ya lo vi, ¡se entiende bien!', nivel: 'listo' },
        { id: 'duda', label: 'Tengo dudas', nivel: 'cuesta', resp: 'Escribime tus preguntas por WhatsApp!' },
      ],
      recursos: [{ t: 'Doc: Módulo 2 - ADN del Jazz', url: DOC_M2, sec: [SEC_M2.transcribir, 'Cómo transcribir eficientemente'] }],
    },
    {
      id: 'm2', etapa: 'm2', entrega: 'audio o video', envia: 'un audio o video cantando 30 segundos del solo encima de la pista.',
      sinVideo: true, hotmart: 'r48bWKZw7R',
      stop: 'transcripcion',
      titulo: 'Cantar 30 segundos del solo',
      detalle: 'Armalo **por partes**, como en la animación.\nDespués mandame un audio o video cantando **30 segundos del solo encima de la pista** (del solo, no de la intro ni de la melo!).',
      progreso: [
        { id: 'listo', label: 'Ya estoy para mandarlo', nivel: 'listo' },
        { id: 'quince', label: 'Tengo solo 15 segundos', nivel: 'listo', envia: 'esos 15 segundos cantando el solo encima de la pista.', resp: 'Mandame esos 15 segundos y seguí sumando hasta los 30! Para lo que falta, **hacelo por partes**:\n- **Loops cortos**: de 2 a 5 segundos, de 3 a 5 notas como mucho.\n- Si una nota no sale, pasá el dedo por encima de las notas en la app y escuchalas una por una.\n- Armá los pedacitos que necesites y andá juntándolos, como en la animación.' },
        { id: 'cuesta', label: 'Me cuesta mucho', nivel: 'cuesta', envia: 'aunque sea 15 segundos cantando el solo encima de la pista. Si no sale, escribime y lo resolvemos.', resp: '**Hacelo por partes**:\n- **Loops cortos**: de 2 a 5 segundos, de 3 a 5 notas como mucho.\n- Si una nota no sale, pasá el dedo por encima de las notas en la app y escuchalas una por una.\n- Armá los pedacitos que necesites y andá juntándolos, como en la animación.\nVa a salir' },
        { id: 'saltear', label: 'Saltearlo por ahora', nivel: 'casi', saltea: true, resp: 'Dale, seguí con lo que viene. Cuando lo tengas, volvé a este paso y mandámelo.' },
      ],
      recursos: [{ t: 'Doc: Módulo 2 - ADN del Jazz', url: DOC_M2, sec: ['h.vb6cfms5yiq', 'Cómo regular la dificultad'] }],
    },
    {
      id: 'm1', etapa: 'm2',
      video: { id: 'o-sV1KM5J-o' }, hotmart: 'RO9qy9mjOP',
      titulo: 'Cromáticos ascendentes: mirar el video',
      detalle: 'Mirá **el video completo** una vez y después leé el doc. Todavía no hace falta tocar: en los pasos que siguen vamos ejercitación por ejercitación.',
      progreso: [{ id: 'visto', label: 'Vi el video y leí el doc', nivel: 'listo' }],
      recursos: [{ t: 'Doc: ADN del Jazz, notas de aproximación', url: DOC_M2, sec: [SEC_M2.adn, 'ADN del Jazz: notas de aproximación'] }],
    },
    {
      id: 'c1', etapa: 'm2', entrega: 'video', envia: 'un video de la Ejercitación Nº1 a tempo, para arriba y para abajo.',
      video: { id: 'o-sV1KM5J-o', t: 178 }, hotmart: 'RO9qy9mjOP',
      titulo: 'Cromáticos ascendentes: Ejercitación 1 · Mecanización',
      detalle: 'Antes de empezar, tené **bien clara la escala y la posición** en la que estás trabajando: todo el ejercicio se apoya en eso.\n- A) Elegí una posición de la escala mayor y ubicá las notas objetivo. En cada una buscá la nota **un semitono abajo**: esa es su aproximación. Probalo lento, sin tempo.\n- B) Pasalo a tempo, empezando en el contratiempo. [Ejemplo a 55 BPM](https://youtu.be/o-sV1KM5J-o?t=178) · [a 85 BPM](https://youtu.be/o-sV1KM5J-o?t=208)\n# El cromático en el aire, la nota de la escala en la tierra\n- C) Lo mismo con la escala descendente. [Ejemplo](https://youtu.be/o-sV1KM5J-o?t=266)\nBuscá una velocidad que te **desafíe un poco**, aunque sea lenta, pero constante.',
      progreso: [
        { id: 'listo', label: 'Copié el ejemplo tal cual y estoy para mandarlo', nivel: 'listo' },
        { id: 'errores', label: 'Tengo trabas o errores', nivel: 'casi', wa: true, resp: 'Podés hacerlo **por partes**, de a dos cuerdas, e ir juntando de a poquito.\nMandámelo como te salga, no tiene que ser perfecto!' },
      ],
      recursos: [{ t: 'Doc: ADN del Jazz, notas de aproximación', url: DOC_M2, sec: ['h.jdcef9tf1otq', 'Ejercitación 1'] }],
    },
    {
      id: 'c2', etapa: 'm2', entrega: 'video', envia: 'un video de la Ejercitación Nº2.',
      video: { id: 'o-sV1KM5J-o', t: 388 }, hotmart: 'RO9qy9mjOP',
      titulo: 'Cromáticos ascendentes: Ejercitación 2 · Mecanización',
      detalle: 'Líneas cromáticas de **6 y de 10 notas** que empiezan en cada grado de la escala.\n- Grupos de 3 parejas (6 notas): desde la tónica, cromáticos a tónica, 2da y 3ra; desde la 2da, a 2da, 3ra y 4ta; desde la 3ra, a 3ra, 4ta y 5ta; y así por toda la escala. Después, lo mismo con 5 parejas (10 notas).\n- Antes de cada grupo, **decí en voz alta en qué grado arrancás**.\n- Cuando la nota objetivo es la 4ta o la tónica, el cromático es la 3ra o la 7ma: **esa nota se repite**.\n- **Copiá exactamente el patrón del ejemplo**, en ritmo y en cantidad de notas.\n- Revisalo bien parte por parte antes de hacerlo a tempo. Podés trabajarlo por grupos de cuerdas, no hace falta hacer todo de un tirón: cuando tenés las partes, las juntás.\n- Finalmente, si podés, subí el tempo.\n[Ejemplo a 95 BPM, 3 parejas](https://youtu.be/o-sV1KM5J-o?t=388) · [Ejemplo con 5 parejas](https://youtu.be/o-sV1KM5J-o?t=462)',
      progreso: [
        { id: 'listo', label: 'Copié el ejemplo tal cual y estoy para mandarlo', nivel: 'listo' },
        { id: 'algunas', label: 'Desde algunas notas me trabo', nivel: 'casi', resp: 'Tené solo dos cosas en la cabeza: **en qué nota arrancás** (decila en voz alta) y **qué nota se repite** (la 3ra o la 7ma).\nPodés practicar las líneas por grupos de cuerdas, de a 3 o 4 líneas como máximo, y después juntar las piezas. Lo que te confunda, revisalo sin tempo.' },
        { id: 'cuesta', label: 'Me cuesta mucho', nivel: 'cuesta', resp: 'Bajá la velocidad o volvé a la Ejercitación Nº1 desde la nota donde te trabás, o escribime y lo resolvemos.' },
      ],
      recursos: [{ t: 'Doc: ADN del Jazz, notas de aproximación', url: DOC_M2, sec: ['h.fxoyvbdit16z', 'Ejercitación 2: Etapa de Mecanización'] }],
    },
    {
      id: 'c3', etapa: 'm2', entrega: 'video', envia: 'un video improvisando sobre la progresión, primero solo con cromáticos ascendentes y después mezclándolos con la escala.',
      video: { id: 'o-sV1KM5J-o', t: 604 }, hotmart: 'RO9qy9mjOP',
      titulo: 'Cromáticos ascendentes: Ejercitación 3 · Integración',
      detalle: 'Poné una progresión simple (II–V–I o II–V–I–VI) y usá **solo este recurso**, de todas las formas que puedas:\n- Líneas para arriba, para abajo y con cambios de dirección.\n- Distintas longitudes: cromáticos sueltos (2 notas), líneas cortas (4 a 6), medianas (8 a 12) y largas (14 a 20).\n- Distintos puntos de comienzo en el compás.\nRecién después **mezclalo con la escala mayor**, tocando libre y cantando si querés: lo nuevo con lo viejo.\n# Hay dos videos, mirate ambos',
      progreso: [
        { id: 'listo', label: 'Ya estoy para mandarlo', nivel: 'listo' },
        { id: 'mismas', label: 'Me quedo siempre en las mismas líneas', nivel: 'casi', resp: 'Trabajá las variantes **de a una**: un rato solo líneas para abajo, otro para arriba, otro solo largas, otro solo cortas, otro empezando en distintos lugares del compás. Y lueeego... **mezclalas**.' },
        { id: 'cuesta', label: 'Me cuesta mucho', nivel: 'cuesta', resp: 'Volvé un rato a la Ejercitación Nº2 y después probá con **líneas cortas sobre un solo acorde**. Y si querés, escribime por WhatsApp!' },
      ],
      recursos: [
        { t: 'Video: Ejemplos de la Ejercitación 3', url: 'https://youtu.be/o-sV1KM5J-o?t=604' },
        { t: 'Video: Momento de integración libre', url: 'https://youtu.be/saRjud2tZw4?t=0' },
        { t: 'Doc: ADN del Jazz, notas de aproximación', url: DOC_M2, sec: ['h.aib8rdfi7b9', 'Ejercitación 3: Etapa de Integración'] },
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
      recursos: [{ t: 'Doc: Cómo transcribir eficientemente', url: DOC_M2, sec: ['h.g588m8ye6z2g', 'Recién ahora, la guitarra'] }],
    },
    {
      id: 'n7', etapa: 'm2', entrega: 'video', entregaOpcional: true, envia: 'videos de tu proceso de mecanización o de integración! Mencioná el elemento en el video.', video: { id: 'M6jHqGGAF8w' }, hotmart: 'PeAgnBd1OW',
      titulo: 'Más elementos del lenguaje',
      detalle: 'Elegí alguno de estos elementos y hacé el mismo proceso que con los cromáticos:',
      etapasVis: ['Reconocimiento', 'Mecanización', 'Integración'],
      nota2: 'La prioridad sigue siendo el solo.',
      panel: [
        { t: 'Cromático descendente', video: 'M6jHqGGAF8w' },
        { t: 'Auxiliar', video: 'pd8IgNbFJIo' },
        { t: 'Resoluciones indirectas 1', video: 'C7LsWB2xgz4' },
        { t: 'Resoluciones indirectas 2', video: 'JvzNRJduA_I' },
      ],
      pregunta: '¿Cómo venís con estos elementos?',
      progreso: [
        { id: 'trabajo', label: 'Estoy trabajando alguno', nivel: 'listo' },
        { id: 'vistos', label: 'Miré los videos', nivel: 'listo', resp: 'Bien! Si alguno aparece en el solo que sacaste, ese es **buen candidato para mecanizar**' },
        { id: 'duda', label: 'Tengo dudas', nivel: 'cuesta', resp: 'Escribime tus preguntas por WhatsApp!' },
      ],
      recursos: [{ t: 'Doc: ADN del Jazz, notas de aproximación', url: DOC_M2, sec: ['h.wuqwlhdguj6r', 'Entonces, recapitulando…'] }],
    },
    /* Combinación de elementos del lenguaje, en pasos */
    {
      id: 'k1', etapa: 'm2', video: { id: 'GrXVCxwRs6g' }, hotmart: '0Ovo3xZN4j',
      titulo: 'Combinación de elementos: mirar el video',
      detalle: 'Mirá **el video** con **el doc al lado**. Todavía no hace falta tocar: en los pasos que siguen lo hacemos con **el solo que transcribiste**.',
      progreso: [
        { id: 'visto', label: 'Vi el video y leí el doc', nivel: 'listo' },
        { id: 'sinsolo', label: 'Todavía no tengo el solo en la guitarra', nivel: 'casi', saltea: true, wa: true, resp: 'Ponete las pilas con el solo! 😛 Podés ir viendo el video igual. Si algo te traba escribime así avanzamos!' },
        { id: 'duda', label: 'Tengo dudas', nivel: 'cuesta', resp: 'Escribime tus preguntas por WhatsApp!' },
      ],
      recursos: [{ t: 'Doc: Combinación de elementos del lenguaje', url: DOC_M2, sec: [SEC_M2.combinacion, 'Combinación de elementos del lenguaje'] }],
    },
    {
      id: 'k2', etapa: 'm2', entrega: 'video', envia: 'un video explicando sobre qué acordes suena tu fragmento y en qué escala madre lo ubicás.',
      video: { id: 'GrXVCxwRs6g', t: 353 }, videoTit: 'Video: Elegir frase y ubicar escala madre', hotmart: '0Ovo3xZN4j',
      stop: 'fragmento',
      titulo: 'Elegir el fragmento y ubicarlo en el solo',
      detalle: '1) Elegí **un fragmento chico** del solo, **de 4 a 8 notas**. Uno alcanza (dos como mucho).\n2) Fijate **en qué compases del solo** está sonando.\n3) Con eso, **sobre qué acordes** suena.\n4) Y con los acordes, **en qué escala madre** lo podés pensar: mayor, menor armónica o menor melódica.\n# Mandame un video contando sobre qué acordes suena y en qué escala madre lo ubicás\nTener clara la escala madre es lo que después te deja mover la frase por **todos los grados** de esa escala.',
      progreso: [
        { id: 'listo', label: 'Ya lo tengo ubicado', nivel: 'listo' },
        { id: 'escala', label: 'No me doy cuenta de en qué escala madre está', nivel: 'cuesta', resp: 'Escribime por WhatsApp y lo vemos!' },
        { id: 'largo', label: 'No sé qué fragmento elegir', nivel: 'casi', resp: 'Elegí uno que **te guste** y que sientas que vas a poder mecanizar: porque lo reconocés dentro de una escala, porque entendés cómo funciona, o porque creés que lo vas a entender. Y que sea **corto**: no tiene por qué ser algo largo.' },
      ],
      recursos: [{ t: 'Doc: Combinación de elementos del lenguaje', url: DOC_M2, sec: ['h.5fi2xqft8img', 'La escala madre'] }],
    },
    {
      id: 'k3', etapa: 'm2', entrega: 'video', envia: 'un video explicando de qué está hecho tu fragmento: nota x nota o por estructuras interválicas.',
      video: { id: 'GrXVCxwRs6g', t: 605 }, hotmart: '0Ovo3xZN4j',
      titulo: 'Decodificar el fragmento',
      detalle: 'Poné en palabras exactas **de qué está hecha** la frase, así la podés reconstruir en cualquier grado de la escala sin dudar. Es más trabajo de escritorio que de instrumento.\nHay dos maneras, las dos valen:\n- **Nota x nota**: cada nota por su relación con la tónica de la escala madre.\n- **Estructuras interválicas**: las distancias entre las notas (tríadas, arpegios, seguidillas por la escala, etc.), más alguna nota de aproximación.\n# Escribilo, y mandame un video explicándolo\nSé lo más preciso posible: si hay un error acá, se repite en todas las transposiciones.',
      progreso: [
        { id: 'listo', label: 'Ya lo tengo escrito', nivel: 'listo' },
        { id: 'resumir', label: 'No sé si resumirlo o ir nota por nota', nivel: 'casi', resp: 'Nota x nota es más seguro, pero después moverla es más engorroso. Si la resumís en estructuras todo se vuelve más simple… **pero si la resumís mal, te equivocás**. Ahí está el juego: resumir sin cometer errores. Al principio, escribila nota x nota.' },
        { id: 'cuesta', label: 'No me doy cuenta de qué está hecha', nivel: 'cuesta', resp: 'Probá con **un pedazo más corto**, de 3 o 4 notas. Si igual no sale, mandame el fragmento y lo decodificamos juntos.' },
      ],
      recursos: [
        { t: 'Video: Ejemplos de decodificación', url: 'https://youtu.be/GrXVCxwRs6g?t=605' },
        { t: 'Doc: Combinación de elementos del lenguaje', url: DOC_M2, sec: ['h.tc0vb1lte1jo', 'Nota x nota o estructuras interválicas'] },
      ],
    },
    {
      id: 'k4', etapa: 'm2', entrega: 'video', envia: 'un video de la mecanización del fragmento por los grados de la escala, en una posición.',
      video: { id: 'GrXVCxwRs6g', t: 949 }, sinVerVideo: true, hotmart: '0Ovo3xZN4j',
      titulo: 'Mecanizar el fragmento',
      detalle: '1) **Reconocelo** sin metrónomo: movelo por **todos los grados** de la escala, dentro de **una posición**. Si lo anotaste nota x nota, bajale un número a todos los grados y así sucesivamente.\n2) **Mecanizalo** a tiempo real, todavía sin acordes: **una sola manera** de tocarlo y con el ritmo de la frase original.\n3) Los errores los corregís sin metrónomo, justo donde aparecen, y volvés a tempo.\n4) Cuando sale, **subí el tempo** para tener resto.\n# Con la oreja o adivinando, no: usá lo que escribiste',
      progreso: [
        { id: 'listo', label: 'Ya estoy para mandarlo', nivel: 'listo' },
        { id: 'cuesta', label: 'Me cuesta mucho', nivel: 'cuesta', resp: '**Partila todavía más**: mecanizá un pedacito más corto y después decidís si juntás todo o no. Igual que con la transcripción o los enlaces: menos información, más rápido y con menos frustración.' },
      ],
      recursos: [
        { t: 'Video: Ejemplo de reconocimiento y transposición', url: 'https://youtu.be/GrXVCxwRs6g?t=949', col: 1 },
        { t: 'Doc: Combinación de elementos del lenguaje', url: DOC_M2, sec: ['h.5u84fu4gcxst', '2. Reconocimiento'], col: 1 },
        { t: 'Video: Mecanización', url: 'https://youtu.be/GrXVCxwRs6g?t=1254', col: 2 },
        { t: 'Doc: Combinación de elementos del lenguaje', url: DOC_M2, sec: ['h.vj9synhvjvip', '3. Mecanización'], col: 2 },
      ],
    },
    {
      id: 'n6', etapa: 'm2', entrega: 'video', envia: 'un video integrando el fragmento sobre una progresión de esa escala madre.',
      video: { id: 'GrXVCxwRs6g' }, hotmart: '0Ovo3xZN4j',
      titulo: 'Integrar el fragmento',
      detalle: 'Poné una progresión que refleje **la escala madre** de la frase y tocá el fragmento **desde distintos grados**, en desorden y empezando en **distintos lugares del compás**.\nPrimero la meta es tocarlo a tiempo real sin equivocarte, con el ritmo y las notas que corresponden.\nDespués **flexibilizalo**: pedacitos, mezclado con notas sueltas de la escala, variando el ritmo.',
      progreso: [
        { id: 'listo', label: 'Ya estoy para mandarlo', nivel: 'listo' },
        { id: 'olvido', label: 'Lo había mecanizado y ahora no me sale', nivel: 'casi', resp: 'Es normal: **hoy te acostaste y mañana no está** 😛 Volvé a mecanizarlo un rato, incluso en la posición que ya practicaste, y después volvé a integrarlo.' },
        { id: 'cuesta', label: 'Me cuesta mucho', nivel: 'cuesta', resp: 'Volvé a mecanizar o repasá **la zona que no sale**. A veces es cuestión de refrescar un poco la memoria nada más 😉' },
      ],
      recursos: [
        { t: 'Doc: Combinación de elementos del lenguaje', url: DOC_M2, sec: ['h.o2ku5r6a0gf7', '4. Integración'] },
        { t: 'Doc: Combinación de elementos del lenguaje', url: DOC_M2, sec: ['h.bt1nozkeibiw', 'Te vas a olvidar, y está bien!'] },
      ],
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
      detalle: 'Mirá el video de introducción. En este módulo sacamos el foco de las notas por un rato y nos concentramos en el ritmo: primero con **ritmos fijos**, después **improvisando con tierras y contratiempos** y con **unidades rítmicas**.',
      verYSeguir: true,
    },
    {
      id: 'r2', etapa: 'ritmo', video: { id: 'CY11GrypJpo' }, hotmart: '37dp00Kk7L', progreso: PROGRESO_RITMO,
      entrega: 'video', envia: 'un video marcando el ritmo A con el cuerpo y cantándolo.',
      grupo: 'Práctica con ritmos fijos',
      titulo: 'Ritmo A + ritmo al cuerpo',
      detalle: 'Ritmo A: **contratiempos con swing**. El desafío es tocarlo sin que se mueva el pulso ni el swing.\nMirá el video y practicalo **con el cuerpo**, como muestro ahí.\n- **Cantá el ritmo** mientras lo marcás: la voz te confirma que es el correcto y te hace darte cuenta de lo que estás tocando.\n- No frenes nunca. Si te confundís, frená, repasá el ritmo y volvé a empezar.\n# Mandame un video marcando el ritmo A con el cuerpo y cantándolo',
    },
    {
      id: 'r3', etapa: 'ritmo', video: { id: 'Y5o2rSOFpnQ' }, hotmart: '97B2PPYx7p', progreso: PROGRESO_RITMO,
      entrega: 'video', envia: 'un video marcando el ritmo B con el cuerpo y cantándolo.',
      titulo: 'Ritmo B + cómo destrabar cualquier ritmo',
      detalle: 'Ritmo B: a los contratiempos se suma **una tierra**. El desafío es dominar esa combinación.\nMirá el video: ahí te muestro también **cómo destrabar cualquier ritmo**. Practicalo con el cuerpo, cantándolo.\n- Si se traba, practicalo **de a un compás**, o borrá pedazos y después los juntás.\n# Mandame un video marcando el ritmo B con el cuerpo y cantándolo',
    },
    {
      id: 'r4', etapa: 'ritmo', video: { id: 'Zi8GzfFqmOI' }, hotmart: 'ROxwydYK7D', progreso: PROGRESO_RITMO,
      entrega: 'video', envia: 'un video tocando el ritmo A en la viola, en el nivel en el que estés (una nota, una escala o una progresión).',
      titulo: 'Ritmo A + aplicaciones varias al instrumento',
      detalle: 'Ahora llevá el **ritmo A a la viola**. Mirá el video con el doc al lado.\n# El ritmo es fijo: las notas se adaptan al ritmo, no al revés\n- Arrancá con **una sola nota**: toda la atención queda en sostener el ritmo y en cómo lo articulás.\n- Después, **dentro de una escala**: primero con cosas que ya sabés, después con cosas nuevas.\n- Y por último, **sobre una progresión**: solo arpegios, o las escalas de cada acorde.\nSi te sale perfecto, subí la dificultad. Si los errores superan a los aciertos, modificá algo: tempo, longitud de la progresión, material usado (1 o 2 notas por acorde, arpegio completo, superposición, escala completa).\n# Mandame un video tocando el ritmo A en la viola, en el nivel en el que estés',
      recursos: [
        { t: 'Doc: Integración de un ritmo al instrumento', url: DOC_M3, sec: [SEC_M3.integracion, 'Integración de un ritmo al instrumento'] },
        { t: 'Doc: Integración de un ritmo al instrumento', url: DOC_M3, sec: ['h.2i00i28i36lq', 'Reglas del ejercicio'] },
      ],
    },
    {
      id: 'r5', etapa: 'ritmo', video: { id: 'ersUb9-L1zA' }, hotmart: 'y4bp2dGy7R', progreso: PROGRESO_RITMO,
      entrega: 'video', envia: 'un video tocando el ritmo B en la viola, en el nivel en el que estés.',
      titulo: 'Ritmo B: ejemplos en el instrumento',
      detalle: 'Lo mismo con el **ritmo B**, con los mismos niveles que el A: una nota, una escala, una progresión.\n- Hay ritmos más difíciles que otros: capaz con el B necesitás un nivel distinto que con el A.\n- **Cantá el ritmo** mientras tocás.\nSe busca que haya errores: eso muestra que estás al límite. La práctica funciona cuando estás concentrado pero no desbordado.\n# Mandame un video tocando el ritmo B en la viola, en el nivel en el que estés',
      recursos: [{ t: 'Doc: Integración de un ritmo al instrumento', url: DOC_M3, sec: ['h.p0dip9fimibq', 'Progresión de dificultad'] }],
    },
    {
      id: 'r6', etapa: 'ritmo', video: { id: 'CHKJyTSdmIg' }, hotmart: 'LO0b9KRaeG', progreso: PROGRESO_RITMO,
      entrega: 'video', envia: 'un video marcando los ritmos C, D y E con el cuerpo y cantándolos.',
      titulo: 'Ritmos C, D y E',
      detalle: 'Tres ritmos fijos nuevos:\n- **C**: desplazamiento en ciclo de 5 corcheas. Suena como un pulso dentro de otro pulso.\n- **D**: desplazamiento en ciclo de 3 corcheas, más corto que el anterior.\n- **E**: tierras y contratiempos con **mucho más espacio**. El silencio es parte del ritmo.\nTomate el tiempo que necesites para asimilarlos: por compás, o borrando pedazos y después juntándolos.\n# Mandame un video marcando los ritmos C, D y E con el cuerpo y cantándolos',
      recursos: [{ t: 'Doc: Ritmos C, D y E + improvisación con tiempos y contratiempos', url: DOC_M3, sec: [SEC_M3.ritmos, 'Ritmos C, D y E'] }],
    },
    {
      id: 'r6i', etapa: 'ritmo', video: { id: 'CHKJyTSdmIg', t: 408 }, hotmart: 'LO0b9KRaeG', progreso: PROGRESO_RITMO,
      entrega: 'video', envia: 'un video improvisando un buen rato con tierras y contratiempos, usando los ritmos como disparador.',
      titulo: 'Improvisación con tiempos y contratiempos',
      detalle: 'Ahora improvisá con **tierras y contratiempos**, usando los ritmos del A al E como disparador:\n- Uno solo como **clave**: lo tenés en la cabeza pero cantás solo fragmentos, poniendo silencios donde no los hay.\n- **Desordenando** fragmentos de los ritmos.\n- O eligiendo **2 o 3 ritmos** y dejando que te disparen ideas.\nImprovisá durante un buen rato y grabate. Escuchate: ¿cuánto del material aparece? ¿Te repetís? Si pasa, volvé a basarte en un solo ritmo.\n# Mandame un video improvisando un buen rato con tierras y contratiempos',
      recursos: [{ t: 'Doc: Ritmos C, D y E + improvisación con tiempos y contratiempos', url: DOC_M3, sec: [SEC_M3.ritmos, 'Ritmos C, D y E'] }],
    },
    {
      id: 'rfin', etapa: 'ritmo', sinVideo: true, soloVer: true,
      titulo: 'Cierre de los ritmos fijos',
      stop: 'cierreFijo',
      progreso: [{ id: 'listo', label: 'Listo', nivel: 'listo' }],
      recursos: [{ t: 'Abrir el generador de ritmos fijos', url: 'https://ritmo.ajuste-elastico.com/#fijo', web: true }],
    },
    {
      id: 'r7', etapa: 'ritmo', progreso: PROGRESO_RITMO, entrega: 'video', envia: 'un video improvisando con el cuerpo o con la guitarra: elegí 1 o 2 elementos (1 o 2 unidades rítmicas), contá en el video cuáles son y hacé una improvisación buscando hacer mucho con poco.',
      video: { id: 'A4rxE6i5VwY' },
      grupo: 'Improvisación con unidades rítmicas',
      titulo: 'Unidades rítmicas y variabilidad en la improvisación',
      detalle: 'Ahora improvisamos con **una sola unidad rítmica, o muy pocas**: la idea es hacer mucho con poco.\n- Elegí 2 o 3 unidades y trabajá **una a la vez** con el cuerpo, usando el **entrenador rítmico**: en loop, en continuo o con Desplazamientos.\n- Después improvisá **solo con esa unidad**, sin mirar la pantalla y con el metrónomo. Grabala y mandámela.\n- Lo mismo con otra unidad, y después con **2 a la vez**.\n# Mandame una impro con un elemento y otra con dos',
      recursos: [
        { t: 'Doc: Improvisación con unidades rítmicas', url: DOC_M3, sec: [SEC_M3.unidades, 'Improvisación con unidades rítmicas'] },
        { t: 'Abrir el entrenador rítmico', url: 'https://ritmo.ajuste-elastico.com/', web: true },
      ],
    },
  ],

  /* Lo que se espera tener ANTES de cada clase, por nivel.
     Es acumulativo: el nivel 2 incluye lo del 1, y cada clase incluye las anteriores. */
  esperado: {
    1: { min: ['p2', 'p3', 'p4', 'p5', 'p5b', 'p6', 'p7'], esp: ['e1'], ideal: ['e2'] },
    2: { min: ['e1'], esp: ['e2', 'e3'], ideal: ['e4', 'a1', 'a2'] },
    3: { min: ['e2', 'e3'], esp: ['a1', 'a2', 'a3'], ideal: ['e4', 's1'] },
    4: { min: ['a1', 'a2', 'a3', 's1'], esp: ['s3'], ideal: ['m1', 'm2v', 'm2'] },
    5: { min: [], esp: ['m1', 'm2v', 'm2', 'c1'], ideal: ['c2', 'c3'] },
  },
  clases: 4,
  consejoGeneral: 'Todo lo que signifique incorporar algo nuevo pide dar un paso atrás: menos compases, menos cuerdas, o repasar las posiciones y los acordes fuera del ritmo. Bajar el tempo también sirve, pero suele haber mejores opciones.',
};
