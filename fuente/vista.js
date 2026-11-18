/* ---------------- Vista del alumno: el camino ----------------
   Un camino dibujado de punta a punta. El paso actual está abierto en el camino:
   consigna, material y "¿Cómo te fue?". Al responder, aparece "Seguir" y el camino avanza.
   El video va al costado (arriba en el celular), uno por vez: cambia solo al avanzar,
   y los links a minutos del video lo adelantan ahí mismo. */

const ICONO = {
  video: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>',
  doc: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l5 5v13H7z M14 3v5h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M10 13h6M10 16.5h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  candado: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
  cruz: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  mandar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12l15-7-4.5 15-3-6.2z" fill="currentColor"/></svg>',
  girar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9a8 8 0 0 1 14.5-3.5L20 7M20 15a8 8 0 0 1-14.5 3.5L4 17M20 3v4h-4M4 21v-4h4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  enviar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12l16-7-6 15-2.5-6.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 12.5l4 4 9-9.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  ok: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="currentColor"/><path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#0E1F16" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  idea: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  abajo: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v13M6 13l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};
const ytId = url => { const m = String(url || '').match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/); return m ? m[1] : null; };
const ytT = url => { const m = String(url || '').match(/[?&](?:t|start)=(\d+)/); return m ? +m[1] : 0; };
const mmss = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

function titularEstado(e) {
  return { bien: 'Vas bien', meterle: 'Hay que meterle un poco', adelantado: 'Vas adelantado', pausa: 'Sin apuro', m2: 'Ya estás en el módulo 2' }[e.tipo];
}
function etiquetaAdmin(e) {
  return { bien: 'Va bien', meterle: 'Hay que meterle', adelantado: 'Adelantado', pausa: 'En pausa', m2: 'En módulo 2' }[e.tipo];
}
function bajadaEstado(st, e) {
  const proxima = e.k <= 4 ? `la clase ${e.k}` : 'lo que sigue';
  const nombres = ids => ids.slice(0, 3).map(id => PASO[id].titulo.toLowerCase()).join(', ').replace(/, ([^,]*)$/, ' y $1');
  if (e.tipo === 'm2') return 'Terminaste el módulo 1. El resto del módulo 2 lo seguimos por WhatsApp mientras se suma al mapa.';
  if (e.tipo === 'pausa') return 'Andy dejó tu mapa en pausa. Avanzá cuando puedas, sin presión.';
  if (e.tipo === 'meterle') return `Para ${proxima} conviene tener: ${nombres(e.faltan)}${e.faltan.length > 3 ? ', entre otras' : ''}.`;
  if (e.tipo === 'adelantado') return `Ya tenés lo necesario para ${proxima}. Si tenés ganas, podés seguir con lo que viene.`;
  if (e.faltan.length === 0) return `Ya tenés lo necesario para ${proxima}.`;
  return `Para ${proxima} te ${e.faltan.length === 1 ? 'queda' : 'quedan'} ${e.faltan.length} ${e.faltan.length === 1 ? 'paso' : 'pasos'}.`;
}

function tiraClases(st, e, animar) {
  const p = posicion(st);
  const tramos = ['Clase 1', 'Clase 2', 'Clase 3', 'Clase 4', 'Módulo 2'];
  return `<ol class="tira ${animar && !reduceMotion ? 'animar' : ''}" aria-label="Tu camino en el módulo">
    ${tramos.map((t, i) => {
      const n = i + 1, lleno = clamp(p - i, 0, 1), tuvo = n <= (st.clase || 0) && n <= 4, prox = n === e.k;
      return `<li class="tramo ${tuvo ? 'tuvo' : prox ? 'prox' : ''} ${prox && e.tipo === 'meterle' ? 'meterle' : ''}">
        <span class="barra-tramo"><span style="--lleno:${lleno}"></span></span>
        <span class="tramo-txt">${tuvo ? ICONO.check : ''}${t}</span>
        ${prox && e.tipo !== 'm2' ? '<span class="tramo-sub">próxima</span>' : ''}
      </li>`;
    }).join('')}
  </ol>`;
}

/* Texto con formato mínimo. Los links a YouTube se vuelven botones que mueven el video de al lado. */
function linkHTML(texto, url) {
  const id = ytId(url);
  if (id) return `<button class="link-seek" data-seek="${id}:${ytT(url)}">${ICONO.video}${texto}</button>`;
  return `<a href="${url}" target="_blank" rel="noopener">${texto}</a>`;
}
function enLinea(l) {
  return esc(l).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) => linkHTML(t, u));
}
function textoHTML(t) {
  const out = []; let lista = [];
  const cerrar = () => { if (lista.length) { out.push(`<ul class="reglas">${lista.map(l => `<li>${enLinea(l)}</li>`).join('')}</ul>`); lista = []; } };
  String(t || '').split('\n').forEach(l => { if (l.startsWith('- ')) lista.push(l.slice(2)); else { cerrar(); if (l.trim()) out.push(`<p>${enLinea(l)}</p>`); } });
  cerrar(); return out.join('');
}

function opcionesProgreso(p) { return p.progreso || (p.sinProgreso ? PROGRESO_SIMPLE : PROGRESO_BASE); }
function opcionElegida(st, p) {
  const pr = st.prog[p.id]; if (!pr) return null;
  return opcionesProgreso(p).find(o => o.id === pr.op) || opcionesProgreso(p).find(o => o.nivel === pr.como) || null;
}
function ayudaPara(p, sel) {
  if (!sel) return { apoyo: false, difs: [] };
  const probs = p.problemas || [];
  if (sel.muestra) return { apoyo: !!p.apoyo && sel.muestra.includes('apoyo'), difs: probs.filter(q => sel.muestra.includes(q.id)) };
  return { apoyo: false, difs: sel.nivel === 'cuesta' ? probs : [] };
}

/* Material: los videos se abren en el reproductor de al lado; los documentos, en otra pestaña */
const esDoc = r => r.url && !ytId(r.url);
function docNuevo(p, r) {
  const i = ORDEN.indexOf(p.id);
  for (let j = 0; j < i; j++) if ((PASO[ORDEN[j]].recursos || []).some(x => x.url === r.url)) return false;
  return true;
}
function materialHTML(p) {
  const rs = (p.recursos || []).filter(r => r.url);
  if (!rs.length) return '';
  const nuevos = rs.filter(r => esDoc(r) && docNuevo(p, r));
  const resto = rs.filter(r => !nuevos.includes(r));
  return `${nuevos.map(r => `<a class="doc-nuevo" href="${esc(r.url)}" target="_blank" rel="noopener"><span class="dn-ico">${ICONO.doc}</span><span><small>Documento nuevo: leelo antes de practicar</small><strong>${esc(r.t.replace(/^Doc:\s*/, ''))}</strong></span>${ICONO.abajo}</a>`).join('')}
  ${resto.length ? `<div class="material">${resto.map(r => {
    const id = ytId(r.url);
    if (id) { const t = ytT(r.url); return `<button class="mat" data-seek="${id}:${t}">${ICONO.video}<span>${esc(r.t.replace(/^Video:\s*/, ''))}${t ? `<small>desde ${mmss(t)}</small>` : ''}</span></button>`; }
    return `<a class="mat" href="${esc(r.url)}" target="_blank" rel="noopener">${ICONO.doc}<span>${esc(r.t)}</span></a>`;
  }).join('')}</div>` : ''}`;
}
function apoyoHTML(p) {
  return `<div class="apoyo"><h4>${esc(p.apoyo.titulo)}</h4>${p.apoyo.texto ? `<p>${esc(p.apoyo.texto)}</p>` : ''}
    ${p.apoyo.items.map(i => `<div class="apoyo-item"><p class="apoyo-t">${esc(i.t)}</p><p class="apoyo-c">${esc(i.cuando)}</p>
      ${(i.partes || [{ video: i.video, url: i.url }]).map(pt => `${pt.titulo ? `<p class="apoyo-parte">${esc(pt.titulo)}</p>` : ''}<div class="apoyo-links">${pt.video ? `<button class="mat" data-seek="${ytId(pt.video)}:0">${ICONO.video}<span>${esc(pt.tv || 'Ver el video')}</span></button>` : ''}${pt.url ? `<a class="mat" href="${esc(pt.url)}" target="_blank" rel="noopener">${ICONO.doc}<span>${esc(pt.td || 'Leer el documento')}</span></a>` : ''}</div>`).join('')}</div>`).join('')}</div>`;
}
function dificultadesHTML(difs) {
  if (!difs.length) return '';
  return `<div class="dificultades"><h4>Dificultades comunes</h4>${difs.map(q => `<div class="dif"><p class="dif-q">${esc(q.q)}</p><p>${enLinea(q.fix)}</p>
    ${q.url ? linkHTML('Ver esa parte del video', esc(q.url)) : ''}
    ${q.doc ? `<a href="${esc(q.doc.url)}" target="_blank" rel="noopener">${esc(q.doc.t)}</a>` : ''}</div>`).join('')}</div>`;
}

function standardHTML(st) {
  const elegido = st.standard || '';
  const item = STANDARDS.find(x => x.t === elegido);
  return `<div class="pregunta"><h4>¿Con qué tema vas a trabajar?</h4>
    <div class="standards" role="radiogroup" aria-label="Standards">${STANDARDS.map(x => `<button role="radio" aria-checked="${x.t === elegido}" class="chip-op ${x.t === elegido ? 'sel' : ''}" data-standard="${esc(x.t)}">${esc(x.t)}</button>`).join('')}</div>
    <form class="otro-standard" data-form-standard="1"><input name="otro" aria-label="Otro tema" placeholder="Otro tema" value="${item || !elegido ? '' : esc(elegido)}"><button class="secundario">Elegir este</button></form>
    ${elegido ? `<div class="respuesta resp-ok festejo" role="status"><span class="resp-ico">${ICONO.ok}</span><div><p class="resp-tit">Elegiste ${esc(elegido)}</p><p>¡Ya estás muy cerca de agendar el inicio de tus encuentros sincrónicos en Ajuste Elástico!</p>${item && item.pdf ? `<a href="${esc(item.pdf)}" target="_blank" rel="noopener">Descargar la parte para trabajar (PDF)</a>` : '<p class="suave chico">Andy te pasa la parte del tema para trabajar.</p>'}</div></div>` : ''}
  </div>`;
}

function preguntaHTML(st, p) {
  if (p.tipo === 'standard') return standardHTML(st);
  const sel = opcionElegida(st, p);
  const ayuda = ayudaPara(p, sel);
  return `<div class="pregunta"><h4>${esc(p.pregunta || '¿Cómo te fue?')}</h4>
    <div class="ops" role="radiogroup" aria-label="${esc(p.pregunta || 'Cómo te fue')}">
      ${opcionesProgreso(p).map(o => `<button role="radio" aria-checked="${sel === o}" class="op nivel-${o.nivel} ${sel === o ? 'sel' : ''}" data-op="${p.id}:${o.id}"><span class="op-punto"></span>${esc(o.label)}</button>`).join('')}
    </div>
    ${sel && sel.resp ? respuestaHTML(sel) : ''}
    ${ayuda.apoyo ? apoyoHTML(p) : ''}
    ${dificultadesHTML(ayuda.difs)}
  </div>`;
}

/* Respuesta según cómo le fue: verde con tilde si va bien, recuadro de recomendación si no */
function respuestaHTML(sel) {
  const ok = sel.nivel === 'listo';
  return `<div class="respuesta ${ok ? 'resp-ok' : 'resp-rec nivel-' + sel.nivel}" role="status">
    <span class="resp-ico">${ok ? ICONO.ok : ICONO.idea}</span>
    <div><p class="resp-tit">${ok ? 'Muy bien' : 'Recomendación'}</p>${String(sel.resp).split('\n\n').map(t => `<p>${esc(t)}</p>`).join('')}${sel.url ? linkHTML('Volver a ver el ejemplo', esc(sel.url)) : ''}</div>
  </div>`;
}
function videoAnterior(id) { const i = ORDEN.indexOf(id); for (let j = i - 1; j >= 0; j--) if (PASO[ORDEN[j]].video) return PASO[ORDEN[j]].video.id; return null; }
function siguienteDe(id) { const i = ORDEN.indexOf(id), sig = ORDEN[i + 1]; return sig && ST && pasoHabilitado(ST, sig) ? PASO[sig] : null; }

function tarjetaHTML(st, e, p) {
  const sel = opcionElegida(st, p);
  const sig = siguienteDe(p.id);
  const respondido = p.tipo === 'standard' ? !!st.standard : !!sel;
  const necesario = e.faltan.includes(p.id);
  return `<div class="tarjeta">
    <div class="chips">${p.entrega ? `<span class="chip">${ICONO.enviar}Mandar ${esc(p.entrega)} a Andy</span>` : ''}${necesario ? `<span class="chip ${e.tipo === 'meterle' ? 'chip-oxido' : ''}">Para la clase ${Math.min(e.k, 4)}</span>` : ''}</div>
    <div class="consigna">${textoHTML(p.detalle)}</div>
    ${materialHTML(p)}
    ${p.nota ? `<p class="nota-paso">${esc(p.nota)}</p>` : ''}
    ${p.tip ? `<div class="tip-paso">${ICONO.idea}<p>${esc(p.tip)}</p></div>` : ''}
    ${preguntaHTML(st, p)}
    ${respondido && p.entrega ? envioHTML(st, p) : ''}
    ${respondido && sig && (!p.entrega || st.prog[p.id]?.envio) ? `<div class="seguir">
        ${sel && sel.nivel === 'cuesta'
          ? `<button class="secundario" data-abrir="${sig.id}">Seguir igual con lo que viene</button>`
          : `<button class="primario" data-abrir="${sig.id}"><span>Seguir</span><small>${esc(sig.titulo)}</small>${ICONO.abajo}</button>`}
      </div>` : ''}
  </div>`;
}

function envioHTML(st, p) {
  const pr = st.prog[p.id] || {};
  const ok = !!pr.envio;
  const vids = pr.videos || [];
  const conVideo = /video/.test(p.entrega || '');
  const wa = typeof WHATSAPP_ANDY !== 'undefined' && WHATSAPP_ANDY ? `<a class="secundario boton" href="https://wa.me/${WHATSAPP_ANDY}" target="_blank" rel="noopener">${ICONO.enviar}Abrir WhatsApp</a>` : '';
  const pend = modo === 'alumno' ? pendientes(p.id) : [];
  const listaPend = pend.length ? `<p class="vid-pend"><span class="sp-anillo"></span>${pend.length === 1 ? 'Se está mandando tu video.' : 'Se están mandando tus videos.'} Podés seguir usando el aula; si la cerrás, se termina de mandar cuando la vuelvas a abrir.</p>` : '';
  const lista = vids.length ? `<ul class="vids">${vids.map((v, i) => `<li>${ICONO.check}<span>Video del ${fechaCorta(v.t)}${v.seg ? ' · ' + duracion(v.seg) : ''}</span>
      ${modo === 'admin-vista' ? `<button class="link" data-ver-video="${p.id}:${i}">${v.visto ? 'Ver' : 'Ver (nuevo)'}</button>` : ''}</li>`).join('')}</ul>` : '';
  const botonesVideo = conVideo && modo !== 'admin-vista' ? `<button class="primario boton-grabar" data-grabar="${p.id}"><i></i>${vids.length ? 'Grabar otro video' : 'Grabar el video acá'}</button>
      <label class="secundario boton subir-galeria">Subir uno que ya tengo<input type="file" accept="video/*" data-subir="${p.id}" hidden></label>` : '';
  return `<div class="envio ${ok ? 'envio-ok' : ''}">
    <p class="envio-t">${ok ? ICONO.check : ICONO.enviar}<strong>${ok && pend.length && !vids.length ? 'Mandando tu video a Andy…' : ok ? `Listo, ya se lo mandaste a Andy` : `Antes de seguir, mandale a Andy ${esc(p.envia || 'el ' + p.entrega)}`}</strong></p>
    ${ok ? '' : `<p class="envio-c">${conVideo ? 'Grabalo acá mismo o mandáselo por WhatsApp.' : 'Mandáselo por WhatsApp.'} Así lo ve antes de la clase y te devuelve lo que haga falta. El paso siguiente se abre cuando lo mandes.</p>`}
    ${lista}${listaPend}
    <div class="fila-botones">${botonesVideo}</div>
    ${vids.length || pend.length ? '' : `<div class="fila-botones">${ok ? '' : wa}<label class="envio-check"><input type="checkbox" data-envio="${p.id}" ${ok ? 'checked' : ''}><span>${conVideo ? 'Ya se lo mandé por WhatsApp' : 'Ya se lo mandé'}</span></label></div>`}
  </div>`;
}
function fechaCorta(f) { const [y, m, d] = String(f || '').split('-'); return d ? `${+d}/${+m}` : ''; }
function duracion(seg) { seg = Math.round(seg); return `${Math.floor(seg / 60)}:${String(seg % 60).padStart(2, '0')}`; }

const OLAS = [0, 34, 68, 34];
let verTodo = false;   // por defecto solo se ve el paso anterior, el actual y el siguiente
function nodoHTML(st, e, p, n, total) {
  const pr = st.prog[p.id] || {};
  const est = pr.hecho ? (pr.como || 'listo') : 'pendiente';
  const abiertoEste = p.id === abierto;
  const sel = opcionElegida(st, p);
  const sub = p.tipo === 'standard' && st.standard ? st.standard
    : pr.hecho && sel && pr.como !== 'listo' ? sel.label
    : !pr.hecho && e.faltan.includes(p.id) ? `Para la clase ${Math.min(e.k, 4)}` : '';
  return `<section class="nodo est-${est} ${abiertoEste ? 'abierto' : ''}" id="n-${p.id}" style="--ola:${abiertoEste ? 0 : OLAS[total % OLAS.length]}px">
    <div class="nodo-fila">
      <button class="punto" data-abrir="${p.id}" aria-label="${esc(p.titulo)}">${pr.hecho && pr.como !== 'cuesta' ? ICONO.check : n}</button>
      <button class="nodo-tit" data-abrir="${p.id}" aria-expanded="${abiertoEste}"><span>${esc(p.titulo)}</span>${sub ? `<small class="${!pr.hecho && e.tipo === 'meterle' || pr.como === 'cuesta' ? 'oxido' : ''}">${esc(sub)}</small>` : ''}</button>
      ${!abiertoEste && p.video && p.video.id !== videoAnterior(p.id) ? `<button class="mini" data-abrir="${p.id}" tabindex="-1" aria-hidden="true"><img src="https://i.ytimg.com/vi/${esc(p.video.id)}/mqdefault.jpg" alt="" loading="lazy"></button>` : ''}
    </div>
    ${abiertoEste ? tarjetaHTML(st, e, p) : ''}
  </section>`;
}
function caminoHTML(st, e) {
  // Todos los pasos visibles en orden, numerados de nuevo en cada etapa
  const items = []; const cerradas = [];
  const bloq = [], proximas = [];
  PROGRAMA.etapas.forEach(et => {
    const pasos = PROGRAMA.pasos.filter(p => p.etapa === et.id);
    const m = MODULO_DE[et.id];
    if (!moduloHabilitado(st, m)) { if (!bloq.includes(m)) bloq.push(m); return; }
    if (m >= 2 && sinModulos(st) && e.k < 4 && !pasos.some(p => tocado(st, p.id))) { cerradas.push(et); return; }
    if (!pasos.length) { if (verTodo || !items.length) proximas.push(et); return; }
    pasos.forEach((p, i) => items.push({ et, p, n: i + 1, total: items.length + 1 }));
  });
  const idx = Math.max(0, items.findIndex(x => x.p.id === abierto));
  const desde = verTodo ? 0 : Math.max(0, idx - 1), hasta = verTodo ? items.length - 1 : Math.min(items.length - 1, idx + 1);
  const antes = desde, despues = items.length - 1 - hasta;
  // Cada módulo va en su propio bloque, con su color y un título grande arriba: el cambio de módulo se nota
  let etapaPrev = null, modPrev = null, cuerpo = '';
  const etapasDelMod = m => PROGRAMA.etapas.filter(et => MODULO_DE[et.id] === m).length;
  items.slice(desde, hasta + 1).forEach(x => {
    const m = MODULO_DE[x.et.id];
    if (m !== modPrev) {
      if (modPrev !== null) cuerpo += '</section>';
      cuerpo += `<section class="mod-bloque" style="--mc:${MODULOS[m].color}">${bannerModulo(m, x.et)}`;
      modPrev = m; etapaPrev = etapasDelMod(m) === 1 ? x.et : null;
    }
    if (x.et !== etapaPrev) cuerpo += `<div class="etapa-label"><h3>${esc(x.et.titulo)}</h3><p>${esc(x.et.sub)}</p></div>`;
    etapaPrev = x.et;
    cuerpo += nodoHTML(st, e, x.p, x.n, x.total);
  });
  if (modPrev !== null) cuerpo += '</section>';
  const plural = (k, s1, s2) => `${k} ${k === 1 ? s1 : s2}`;
  return `<div class="camino" id="camino"><svg class="trazo" aria-hidden="true"><path class="trazo-base"/><path class="trazo-hecho"/></svg>
    ${verTodo ? `<button class="mas-pasos" data-accion="ver-menos">Mostrar solo el paso actual</button>`
      : antes ? `<button class="mas-pasos" data-accion="ver-todo">Ver ${plural(antes, 'paso anterior', 'pasos anteriores')}</button>` : ''}
    ${cuerpo}
    ${!verTodo && despues ? `<button class="mas-pasos" data-accion="ver-todo">Ver ${plural(despues, 'paso más', 'pasos más')}</button>` : ''}
    ${bloq.length && (verTodo || !despues) ? `<div class="etapa-bloq" style="--mc:${MODULOS[bloq[0]].color}">${ICONO.candado}<p><small>${esc(MODULOS[bloq[0]].titulo)}</small><strong>${esc(MODULOS[bloq[0]].nombre)}</strong>Andy te lo habilita cuando llegue el momento.</p></div>` : ''}
    ${proximas.map(et => `<section class="mod-bloque mod-pronto" style="--mc:${MODULOS[MODULO_DE[et.id]].color}">${bannerModulo(MODULO_DE[et.id], et, 'Muy pronto')}</section>`).join('')}
    ${verTodo ? cerradas.map(et => `<div class="etapa-label"><h3>${esc(et.titulo)}</h3><p>Se abre cuando llegues a la clase 4</p></div>`).join('') + `<div class="meta"><span>${ICONO.check}</span><p>Fin del módulo 1</p></div>` : ''}
  </div>`;
}

function bannerModulo(m, et, sub) {
  const M = MODULOS[m];
  return `<div class="mod-banner"><small>${esc(M.titulo)}</small><h2>${esc(M.nombre)}</h2>${sub || etapasUnica(m) ? `<p>${esc(sub || et.sub)}</p>` : ''}</div>`;
}
function etapasUnica(m) { return PROGRAMA.etapas.filter(et => MODULO_DE[et.id] === m).length === 1; }

/* Al entrar por primera vez a un módulo nuevo: pantalla de «Pasaste al módulo N» */
function moduloVisto(m) { const l = leerLocal('mapaAE_modVistos_' + (ST?.codigo || '')) || []; return l.includes(m); }
function marcarModuloVisto(m) { const k = 'mapaAE_modVistos_' + (ST?.codigo || ''); const l = leerLocal(k) || []; if (!l.includes(m)) { l.push(m); guardarLocal(k, l); } }
function celebrarModulo(m, alCerrar) {
  marcarModuloVisto(m);
  const M = MODULOS[m];
  const el = document.createElement('div');
  el.className = 'pase-modulo'; el.style.setProperty('--mc', M.color); el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Nuevo módulo');
  el.innerHTML = `<div class="pm-in"><p class="pm-pre">${m === 0 ? 'Empezás' : 'Pasaste al'}</p><p class="pm-num">${esc(M.titulo)}</p><h2>${esc(M.nombre)}</h2>
    <button class="primario" data-pm>${m === 0 ? 'Empezar' : 'Arrancar'}</button></div>`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('visible'));
  const cerrar = () => { el.classList.remove('visible'); setTimeout(() => el.remove(), 400); alCerrar && alCerrar(); };
  el.querySelector('[data-pm]').onclick = cerrar;
  el.querySelector('[data-pm]').focus();
}
function quizasCelebrar() {
  if (modo !== 'alumno' || !ST || !abierto || !PASO[abierto]) return;
  const m = MODULO_DE[PASO[abierto].etapa];
  if (m > 0 && !moduloVisto(m)) celebrarModulo(m);
  else if (m === 0) marcarModuloVisto(0);
}

function vistaHTML(st, e, animar) {
  const extrasPend = (st.extras || []).filter(x => !x.hecho);
  return `<header class="hero">
      <p class="hero-prog">${esc(PROGRAMA.programa)}${st.standard ? `<span>Tu standard: ${esc(st.standard)}</span>` : ''}</p>
      <h1>Hola, ${esc(st.nombre.split(' ')[0])}</h1>
      <div class="estado estado-${e.tipo}"><strong>${titularEstado(e)}</strong><span>${esc(bajadaEstado(st, e))}</span></div>
      ${tiraClases(st, e, animar)}
      ${e.k <= 4 ? `<div class="clase-hecha" id="claseHecha"><button class="link suave" data-accion="clase">Ya tuve la clase ${e.k}</button>${st.clase > 0 ? `<button class="link suave" data-accion="deshacer-clase">Todavía no tuve la clase ${st.clase}</button>` : ''}</div>` : ''}
    </header>
    ${st.nota ? `<blockquote class="nota"><p>${esc(st.nota).replace(/\n/g, '<br>')}</p><cite>Andy</cite></blockquote>` : ''}
    ${extrasPend.length ? `<section class="de-andy"><h2>Andy te dejó</h2>${extrasPend.map(x => `
      <label class="extra"><input type="checkbox" data-extra="${esc(x.id)}"><span><strong>${esc(x.titulo)}</strong>${x.detalle ? `<br><span class="suave">${esc(x.detalle)}</span>` : ''}</span></label>`).join('')}</section>` : ''}
    ${instalarAppHTML()}
    ${caminoHTML(st, e)}
    ${barraClaseHTML(st, e)}`;
}

/* Barra fija abajo: cuánto falta para la próxima clase y qué sigue (no el módulo entero) */
function barraClaseHTML(st, e) {
  if (e.tipo === 'm2' || e.k > PROGRAMA.clases) return '';
  const prev = new Set(requeridos(e.k - 1, e.col));
  const foco = e.R.filter(id => !prev.has(id) || !hecho(st, id));
  if (!foco.length) return '';
  const listos = foco.filter(id => hecho(st, id)).length;
  const sig = e.faltan.find(id => id !== abierto);
  const enActual = e.faltan.includes(abierto);
  const der = !e.faltan.length
    ? `<span class="bc-listo">${ICONO.check}Ya tenés todo para la clase ${e.k}</span>`
    : sig ? `<button class="bc-sig" data-abrir="${sig}"><small>${enActual ? 'Después' : 'Sigue'}</small><span>${esc(PASO[sig].titulo)}</span></button>`
    : `<span class="bc-listo bc-ultimo">Te queda este paso</span>`;
  return `<nav class="barra-clase" aria-label="Avance para la próxima clase">
    <div class="bc-izq"><strong>Para la clase ${e.k}</strong><span>${listos} de ${foco.length} listos</span>
      <span class="bc-puntos" aria-hidden="true">${foco.map(id => `<i class="${hecho(st, id) ? 'ok' : id === abierto ? 'ahora' : ''}"></i>`).join('')}</span></div>
    ${der}
  </nav>`;
}

/* ---------- El camino dibujado ---------- */
function dibujarCamino() {
  const cam = $('#camino'); if (!cam) return;
  const svg = cam.querySelector('.trazo');
  const base = cam.getBoundingClientRect();
  const centro = el => { const r = el.getBoundingClientRect(); return [r.left - base.left + r.width / 2, r.top - base.top + r.height / 2]; };
  const puntos = [...cam.querySelectorAll('.punto')].map(centro);
  const meta = cam.querySelector('.meta span'); if (meta) puntos.push(centro(meta));
  svg.setAttribute('width', cam.clientWidth); svg.setAttribute('height', cam.scrollHeight);
  const camino = pts => pts.map((p, i) => { if (!i) return `M ${p[0]} ${p[1]}`; const a = pts[i - 1], dy = (p[1] - a[1]) / 2; return `C ${a[0]} ${a[1] + dy}, ${p[0]} ${p[1] - dy}, ${p[0]} ${p[1]}`; }).join(' ');
  svg.querySelector('.trazo-base').setAttribute('d', camino(puntos));
  const idx = [...cam.querySelectorAll('.nodo')].findIndex(n => n.classList.contains('abierto'));
  svg.querySelector('.trazo-hecho').setAttribute('d', idx > 0 ? camino(puntos.slice(0, idx + 1)) : '');
}
window.addEventListener('resize', () => requestAnimationFrame(dibujarCamino));

/* ---------- El reproductor (uno solo, al costado) ---------- */
let player = null, playerVid = null, ytCargando = false, simple = false;
function panelVideoHTML() {
  return `<aside class="panel-video" id="panel-video" aria-label="Video"><div class="pv-marco"><div id="yt"></div></div><p class="pv-titulo"><span id="pv-titulo"></span><span class="pv-aviso" id="pv-aviso" aria-live="polite"></span></p></aside>`;
}
/* Líneas naranjas de fondo: 3 trazos gruesos de un solo color que cruzan toda la pantalla
   en diagonal, desde la esquina de arriba a la derecha. Van detrás del camino y del video;
   las tarjetas abiertas quedan por encima. Se curvan un poco con el scroll. */
const LINEAS = [
  { w: 86, y0: -0.30, o: 0 },
  { w: 34, y0: -0.10, o: 1.7 },
  { w: 12, y0: 0.06, o: 3.1 },
];
function trazoLinea(l, y, W, H) {
  const s1 = Math.sin(y / 520 + l.o) * 0.09 * W, s2 = Math.cos(y / 680 + l.o) * 0.11 * H;
  const y0 = l.y0 * H;
  return `M ${W * 1.12} ${y0} C ${W * .76 + s1} ${y0 + H * .18}, ${W * .64} ${y0 + H * .56 - s2}, ${W * .38} ${y0 + H * .72} S ${-W * .04 + s1} ${y0 + H * 1.06}, ${-W * .16} ${y0 + H * 1.32}`;
}
function lineasHTML() {
  const W = innerWidth, H = innerHeight;
  return `<svg class="lineas" viewBox="0 0 ${W} ${H}" aria-hidden="true">
    <defs>
      <linearGradient id="lg-cuerpo" gradientUnits="userSpaceOnUse" x1="${W}" y1="0" x2="0" y2="${H}">
        <stop offset="0" stop-color="#E8834F" stop-opacity=".45"/><stop offset=".55" stop-color="#E8834F" stop-opacity=".3"/><stop offset="1" stop-color="#E8834F" stop-opacity=".06"/>
      </linearGradient>
      <linearGradient id="lg-filo" gradientUnits="userSpaceOnUse" x1="${W}" y1="0" x2="0" y2="${H}">
        <stop offset="0" stop-color="#F6B48D" stop-opacity=".9"/><stop offset="1" stop-color="#F6B48D" stop-opacity=".1"/>
      </linearGradient>
    </defs>
    ${LINEAS.map((l, i) => `<path class="l-cuerpo" data-l="${i}" d="${trazoLinea(l, 0, W, H)}" stroke-width="${l.w}"/>`).join('')}
    ${LINEAS.map((l, i) => `<path class="l-filo" data-l="${i}" d="${trazoLinea(l, 0, W, H)}" stroke-width="1.2" transform="translate(${-l.w * .32} ${-l.w * .32})"/>`).join('')}
  </svg>`;
}
let rafLineas = 0;
function moverLineas() {
  const W = innerWidth, H = innerHeight, y = window.scrollY;
  document.querySelectorAll('.lineas path').forEach(p => p.setAttribute('d', trazoLinea(LINEAS[+p.dataset.l], y, W, H)));
}
window.addEventListener('scroll', () => {
  if (reduceMotion || rafLineas) return;
  rafLineas = requestAnimationFrame(() => { rafLineas = 0; moverLineas(); });
}, { passive: true });
window.addEventListener('resize', () => { const v = document.querySelector('.lineas'); if (v) v.outerHTML = lineasHTML(); moverLineas(); });

/* Que se note cuando cambia el video o salta a otro minuto */
let timerAviso = null;
function marcarCambio(texto) {
  const panel = $('#panel-video'), av = $('#pv-aviso'); if (!panel || !av) return;
  panel.classList.remove('cambio'); void panel.offsetWidth; panel.classList.add('cambio');
  av.textContent = texto; av.classList.add('ver');
  clearTimeout(timerAviso); timerAviso = setTimeout(() => av.classList.remove('ver'), 3500);
}
function asegurarYT(cb) {
  if (simple || (window.YT && window.YT.Player)) return cb();
  const prev = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = () => { prev && prev(); cb(); };
  if (!ytCargando) {
    ytCargando = true;
    const s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api';
    s.onerror = () => { simple = true; cb(); };
    document.head.appendChild(s);
    setTimeout(() => { if (!(window.YT && window.YT.Player) && !simple) { simple = true; cb(); } }, 4000);
  }
}
function sinSubtitulos(pl) { try { pl.unloadModule('captions'); } catch (e) {} try { pl.unloadModule('cc'); } catch (e) {} }
function ponerVideo(id, t = 0, play = false) {
  const tit = $('#pv-titulo'); if (tit) tit.textContent = VIDEOS[id] || '';
  if (playerVid && playerVid !== id) marcarCambio(t ? `Desde ${mmss(t)}` : '');
  else if (playerVid && t) marcarCambio(`Desde ${mmss(t)}`);
  if (simple || !(window.YT && window.YT.Player)) {
    const marco = $('#yt'); if (!marco) return;
    marco.outerHTML = `<iframe id="yt" src="https://www.youtube-nocookie.com/embed/${id}?rel=0&cc_load_policy=0&playsinline=1${t ? '&start=' + t : ''}${play ? '&autoplay=1' : ''}" title="${esc(VIDEOS[id] || 'Video')}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
    playerVid = id; return;
  }
  if (!player) {
    player = new YT.Player('yt', { videoId: id, playerVars: { start: t, rel: 0, cc_load_policy: 0, playsinline: 1, modestbranding: 1 },
      events: { onReady: ev => { sinSubtitulos(ev.target); if (play) ev.target.playVideo(); },
                onApiChange: ev => sinSubtitulos(ev.target),
                onStateChange: ev => { if (ev.data === 1) sinSubtitulos(ev.target); } } });
  } else if (playerVid !== id) {
    play ? player.loadVideoById({ videoId: id, startSeconds: t }) : player.cueVideoById({ videoId: id, startSeconds: t });
  } else { player.seekTo(t, true); if (play) player.playVideo(); }
  playerVid = id;
}
function videoParaAbierto(cambioDePaso) {
  const v = PASO[abierto] && PASO[abierto].video;
  if (!v) return;
  if (v.id !== playerVid || (cambioDePaso && v.t)) asegurarYT(() => ponerVideo(v.id, v.t || 0, false));
}

/* ---------- Render ---------- */
function renderAlumno(animar) {
  const st = ST; const { e, lista } = recomendaciones(st, 3);
  if (!abierto || !PASO[abierto]) abierto = (lista[0] && lista[0].id) || ORDEN[0];
  if (!$('#vista') || animar) {
    player = null; playerVid = null;
    app().innerHTML = `${barra(st.nombre)}<div class="layout"><main class="alumno" id="vista"></main>${panelVideoHTML()}</div>`;
  }
  $('#vista').innerHTML = vistaHTML(st, e, animar);
  requestAnimationFrame(dibujarCamino);
  if (!playerVid) {
    const v = (PASO[abierto] && PASO[abierto].video) || [...ORDEN].reverse().map(id => PASO[id].video).find(Boolean) || { id: 'TylWJrfPxu0' };
    asegurarYT(() => ponerVideo(v.id, v.t || 0, false));
  }
  enlazarAlumno();
  enlazarFormStandard();
  if (animar) setTimeout(() => irA(abierto, false), 80);
}

function irA(id, suave = true) {
  const el = document.getElementById('n-' + id); if (!el) return;
  const pv = $('#panel-video');
  const tapa = window.innerWidth < 1000 && pv ? pv.offsetHeight : 0;
  const y = el.getBoundingClientRect().top + window.scrollY - 76 - tapa;
  window.scrollTo({ top: Math.max(0, y), behavior: suave && !reduceMotion ? 'smooth' : 'auto' });
}
function abrirPaso(id) {
  const cambio = id !== abierto;
  verTodo = false;
  abierto = id; renderAlumno();
  videoParaAbierto(cambio);
  requestAnimationFrame(() => irA(id));
  quizasCelebrar();
}

function enlazarAlumno() {
  const root = app();
  root.onchange = ev => { const f = ev.target.closest('input[data-subir]'); if (f && f.files[0]) abrirGrabador(f.dataset.subir, f.files[0]); };
  root.onclick = ev => {
    const b = ev.target.closest('button, input'); if (!b) return;
    const d = b.dataset;
    if (d.abrir) abrirPaso(d.abrir);
    else if (d.seek) { const [id, t] = d.seek.split(':'); asegurarYT(() => ponerVideo(id, +t || 0, true)); }
    else if (d.op) {
      const [id, opId] = d.op.split(':'); const o = opcionesProgreso(PASO[id]).find(x => x.id === opId);
      const vids = ST.prog[id]?.videos;
      if (opcionElegida(ST, PASO[id]) === o) { if (vids) ST.prog[id] = { videos: vids }; else delete ST.prog[id]; }
      else ST.prog[id] = { hecho: true, como: o.nivel, op: o.id, t: hoyISO(), ...(ST.prog[id]?.envio ? { envio: true } : {}), ...(vids ? { videos: vids } : {}) };
      guardarAlumno(); renderAlumno();
    } else if (d.standard) {
      const primera = !ST.standard;
      ST.standard = d.standard; ST.prog.p5 = { hecho: true, como: 'listo', t: hoyISO() };
      guardarAlumno(); renderAlumno(); if (primera || ST.standard) confeti(b);
    } else if (d.grabar) abrirGrabador(d.grabar);
    else if (d.verVideo) { const [pid, i] = d.verVideo.split(':'); verVideoAdmin(ST, pid, +i, () => { guardarAlumno(); renderAlumno(); }); }
    else if (d.envio && b.tagName === 'INPUT') {
      const pr = ST.prog[d.envio]; if (!pr) return;
      if (b.checked) pr.envio = true; else delete pr.envio;
      guardarAlumno(); setTimeout(() => { renderAlumno(); if (b.checked) requestAnimationFrame(() => { const s = document.querySelector('.seguir'); if (s) s.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }); }, 200);
    } else if (d.extra !== undefined && b.tagName === 'INPUT') {
      const x = ST.extras.find(x => x.id === d.extra); x.hecho = b.checked; guardarAlumno(); setTimeout(() => renderAlumno(), 250);
    } else if (d.accion === 'clase') {
      const k = (ST.clase || 0) + 1;
      $('#claseHecha').innerHTML = `<p>¿Marcás que ya tuviste la clase ${k}?</p><button class="primario" data-accion="clase-ok">Sí, ya la tuve</button> <button class="link" data-accion="clase-no">Todavía no</button>`;
    } else if (d.accion === 'clase-ok') {
      ST.clase = (ST.clase || 0) + 1; ST.claseFecha = hoyISO(); guardarAlumno(); abierto = null; renderAlumno(true);
    } else if (d.accion === 'clase-no') renderAlumno();
    else if (d.accion === 'deshacer-clase') { ST.clase = Math.max(0, ST.clase - 1); guardarAlumno(); renderAlumno(); }
    else if (d.accion === 'ver-todo') { verTodo = true; renderAlumno(); }
    else if (d.accion === 'instalar-app' && avisoInstalar) { avisoInstalar.prompt(); avisoInstalar.userChoice.finally(() => { avisoInstalar = null; renderAlumno(); }); }
    else if (d.accion === 'no-instalar') { try { localStorage.setItem('mapaAE_sinInstalar', '1'); } catch (e) {} renderAlumno(); }
    else if (d.accion === 'ver-menos') { verTodo = false; renderAlumno(); requestAnimationFrame(() => irA(abierto)); }
    else if (d.accion === 'salir') salir();
    else if (d.accion === 'volver-admin') { abierto = null; abrirAdmin(); }
  };
}

function enlazarFormStandard() {
  const f = document.querySelector('[data-form-standard]'); if (!f) return;
  f.onsubmit = ev => { ev.preventDefault(); const v = new FormData(f).get('otro').trim(); if (!v) return;
    ST.standard = v; ST.prog.p5 = { hecho: true, como: 'listo', t: hoyISO() }; guardarAlumno(); renderAlumno(); };
}
/* Confeti al elegir el standard */
function confeti(origen) {
  if (reduceMotion) return;
  const r = origen.getBoundingClientRect();
  const c = document.createElement('canvas'); c.className = 'confeti'; c.width = innerWidth; c.height = innerHeight;
  document.body.appendChild(c); const g = c.getContext('2d');
  const colores = ['#E8834F', '#FFFFFF', '#5D7BB6', '#F2B591', '#C24A22'];
  const ps = Array.from({ length: 110 }, () => ({ x: r.left + r.width / 2, y: r.top + r.height / 2, vx: (Math.random() - .5) * 11, vy: -Math.random() * 11 - 3,
    s: 4 + Math.random() * 5, a: Math.random() * 6, va: (Math.random() - .5) * .3, col: colores[Math.floor(Math.random() * colores.length)] }));
  let f = 0;
  (function paso() {
    g.clearRect(0, 0, c.width, c.height);
    ps.forEach(p => { p.vy += .32; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va;
      g.save(); g.translate(p.x, p.y); g.rotate(p.a); g.fillStyle = p.col; g.globalAlpha = Math.max(0, 1 - f / 110); g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); g.restore(); });
    if (++f < 110) requestAnimationFrame(paso); else c.remove();
  })();
}
function enfocar(sel) { requestAnimationFrame(() => { const el = $(sel); el && el.focus({ preventScroll: true }); }); }

/* Invitar a instalar el aula como app en el celu (solo en celular, si no está instalada) */
let avisoInstalar = null;
window.addEventListener('beforeinstallprompt', ev => { ev.preventDefault(); avisoInstalar = ev; if (ST && modo === 'alumno') renderAlumno(); });
function instalarAppHTML() {
  const enApp = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone;
  const celu = /iPhone|iPad|iPod|Android/.test(navigator.userAgent);
  let cerrado = false; try { cerrado = localStorage.getItem('mapaAE_sinInstalar') === '1'; } catch (e) {}
  if (enApp || !celu || cerrado || modo !== 'alumno') return '';
  return `<div class="instalar-app"><img src="iconos/icono-192.png" alt="">
    <p><b>Tené el aula como app en tu celu</b>Queda un ícono y no tenés que volver a entrar.</p>
    ${avisoInstalar ? `<button class="ia-si" data-accion="instalar-app">Instalar</button>` : `<a href="instalar.html">Ver cómo</a>`}
    <button class="ia-no" data-accion="no-instalar" aria-label="Cerrar">×</button></div>`;
}

/* ================= Grabar y mandar videos (como en WhatsApp) ================= */
// Se graba liviano (≈2 Mbps, unos 15 MB por minuto) y sin reducción de ruido, para que la guitarra suene natural.
// Al tocar «Mandar», el grabador se cierra y el video se sube solo mientras el alumno sigue usando el aula.
// El video queda guardado en el celu hasta que termina de subir: si se cierra el aula o se corta la señal, sigue la próxima vez.
const GRAB = { maxSeg: 300, vbps: 2000000, abps: 128000 };
let gr = null;   // estado del grabador abierto

function tipoGrabacion() {
  if (typeof MediaRecorder === 'undefined') return '';
  return ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
    .find(t => { try { return MediaRecorder.isTypeSupported(t); } catch (e) { return false; } }) || '';
}

function abrirGrabador(pasoId, archivo) {
  cerrarGrabador();
  const p = PASO[pasoId];
  const el = document.createElement('div');
  el.className = 'grabador'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Grabar video');
  el.innerHTML = `<video class="gr-vivo" playsinline autoplay muted></video><video class="gr-ver" playsinline hidden></video>
    <div class="gr-cab"><button class="gr-x" data-gr="cerrar" aria-label="Cerrar">${ICONO.cruz}</button>
      <div class="gr-tit"><small>Video para Andy</small><strong>${esc(p.titulo)}</strong></div><span class="gr-reloj" hidden>0:00</span></div>
    <p class="gr-msg" hidden></p>
    <div class="gr-pie"></div>`;
  document.body.appendChild(el); document.body.classList.add('con-grabador');
  gr = { el, pasoId, cam: 'user', stream: null, rec: null, partes: [], blob: null, seg: 0, t0: 0, timer: null };
  el.onclick = ev => { const b = ev.target.closest('[data-gr]'); if (b) accionGrabador(b.dataset.gr); };
  if (archivo) { gr.blob = archivo; mostrarRevision(true); }
  else prenderCamara();
}

function piesGrabador(html) { gr.el.querySelector('.gr-pie').innerHTML = html; }
function msgGrabador(t) { const m = gr.el.querySelector('.gr-msg'); m.hidden = !t; m.textContent = t || ''; }

async function prenderCamara() {
  apagarCamara(); msgGrabador('');
  gr.el.classList.remove('revisando');
  if (!navigator.mediaDevices?.getUserMedia || !tipoGrabacion()) {
    msgGrabador('Este navegador no deja grabar desde la página. Usá «Subir uno que ya tengo» o mandalo por WhatsApp.');
    piesGrabador(''); return;
  }
  try {
    gr.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: gr.cam, width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: { ideal: 2 } },
    });
  } catch (e) {
    msgGrabador('No pude usar la cámara. Fijate de darle permiso a la página para usar la cámara y el micrófono, y volvé a intentar.');
    piesGrabador(`<button class="gr-texto" data-gr="reintentar">Volver a intentar</button>`); return;
  }
  if (!gr) { apagarCamara(); return; }
  const v = gr.el.querySelector('.gr-vivo');
  v.srcObject = gr.stream; v.hidden = false; v.classList.toggle('espejo', gr.cam === 'user');
  const ver = gr.el.querySelector('.gr-ver'); ver.pause(); ver.hidden = true;
  piesGrabador(`<span class="gr-lado"></span><button class="gr-rec" data-gr="grabar" aria-label="Empezar a grabar"><i></i></button>
    <button class="gr-lado gr-redondo" data-gr="girar" aria-label="Cambiar de cámara">${ICONO.girar}</button>`);
}
function apagarCamara() { if (gr?.stream) gr.stream.getTracks().forEach(t => t.stop()); if (gr) gr.stream = null; }

function empezarGrabacion() {
  const tipo = tipoGrabacion();
  try { gr.rec = new MediaRecorder(gr.stream, { mimeType: tipo, videoBitsPerSecond: GRAB.vbps, audioBitsPerSecond: GRAB.abps }); }
  catch (e) { gr.rec = new MediaRecorder(gr.stream); }
  gr.partes = [];
  gr.rec.ondataavailable = ev => { if (ev.data && ev.data.size) gr.partes.push(ev.data); };
  gr.rec.onstop = () => {
    if (!gr) return;
    gr.blob = new Blob(gr.partes, { type: (gr.rec.mimeType || tipo || 'video/mp4').split(';')[0] });
    gr.seg = (Date.now() - gr.t0) / 1000;
    apagarCamara(); mostrarRevision();
  };
  gr.rec.start(1000); gr.t0 = Date.now();
  gr.el.classList.add('grabando');
  const reloj = gr.el.querySelector('.gr-reloj'); reloj.hidden = false; reloj.textContent = '0:00';
  gr.timer = setInterval(() => {
    const s = (Date.now() - gr.t0) / 1000; reloj.textContent = duracion(s);
    if (s >= GRAB.maxSeg) pararGrabacion();
  }, 250);
  piesGrabador(`<span class="gr-lado"></span><button class="gr-rec grabando" data-gr="parar" aria-label="Terminar"><i></i></button><span class="gr-lado"></span>`);
}
function pararGrabacion() {
  clearInterval(gr.timer); gr.el.classList.remove('grabando'); gr.el.querySelector('.gr-reloj').hidden = true;
  if (gr.rec?.state === 'recording') gr.rec.stop();
}

function mostrarRevision(deGaleria) {
  gr.el.classList.add('revisando');
  const v = gr.el.querySelector('.gr-ver');
  gr.el.querySelector('.gr-vivo').hidden = true;
  if (gr.url) URL.revokeObjectURL(gr.url);
  gr.url = URL.createObjectURL(gr.blob); v.src = gr.url; v.hidden = false; v.controls = true;
  v.onloadedmetadata = () => { if (isFinite(v.duration)) gr.seg = v.duration; };
  const mb = gr.blob.size / 1048576;
  msgGrabador(mb > 380 ? 'Este video es muy pesado para mandarlo desde acá. Mandáselo a Andy por WhatsApp.' : '');
  piesGrabador(`<button class="gr-texto" data-gr="${deGaleria ? 'cerrar' : 'otra'}">${deGaleria ? 'Cancelar' : 'Grabar de nuevo'}</button>
    ${mb > 380 ? '' : `<button class="gr-mandar" data-gr="enviar" aria-label="Mandar a Andy">${ICONO.mandar}</button>`}`);
}

function accionGrabador(a) {
  if (!gr) return;
  if (a === 'cerrar') cerrarGrabador();
  else if (a === 'reintentar') prenderCamara();
  else if (a === 'girar') { gr.cam = gr.cam === 'user' ? 'environment' : 'user'; prenderCamara(); }
  else if (a === 'grabar') empezarGrabacion();
  else if (a === 'parar') pararGrabacion();
  else if (a === 'otra') { gr.blob = null; prenderCamara(); }
  else if (a === 'enviar') mandarVideo();
}
function cerrarGrabador() {
  if (!gr) return;
  clearInterval(gr.timer); if (gr.rec?.state === 'recording') { gr.rec.onstop = null; gr.rec.stop(); }
  apagarCamara(); const v = gr.el.querySelector('.gr-ver'); if (v) v.pause();
  if (gr.url) URL.revokeObjectURL(gr.url);
  gr.el.remove(); document.body.classList.remove('con-grabador'); gr = null;
}

/* ---------- Mandar: el grabador se cierra y el video se sube solo ---------- */
function mandarVideo() {
  const item = { id: 'v' + Date.now().toString(36), codigo: ST.codigo, pasoId: gr.pasoId, blob: gr.blob, mime: gr.blob.type || 'video/mp4', seg: Math.round(gr.seg || 0), t: hoyISO() };
  cerrarGrabador();
  if (modo !== 'alumno') { aviso('Vista de prueba: el video no se manda'); return; }
  const pr = ST.prog[item.pasoId] || (ST.prog[item.pasoId] = {});
  pr.envio = true;
  guardarAlumno();
  COLA.push(item); colaGuardar(item);
  renderAlumno();
  procesarCola();
}

// Videos esperando para subir (en memoria y guardados en el celu)
const COLA = [];
let subiendo = null;          // { item, p } mientras sube
function pendientes(pasoId) { return COLA.filter(x => x.pasoId === pasoId && x.codigo === ST?.codigo); }

async function procesarCola() {
  if (subiendo || !COLA.length || modo !== 'alumno' || !ST) return;
  const item = COLA.find(x => x.codigo === ST.codigo); if (!item) return;
  subiendo = { item, p: 0, error: '' }; pintarSubida();
  try {
    let id;
    if (!API_URL) { for (let k = 1; k <= 10; k++) { await new Promise(r => setTimeout(r, 250)); subiendo.p = k / 10; pintarSubida(); } id = 'demo-' + Date.now(); }
    else {
      const { url } = await llamar('video.iniciar', { token: TOKEN, paso: item.pasoId, mime: item.mime, tam: item.blob.size });
      id = await subirPorPartes(url, item.blob, p => { subiendo.p = p; pintarSubida(); });
    }
    const pr = ST.prog[item.pasoId] || (ST.prog[item.pasoId] = {});
    pr.videos = [...(pr.videos || []), { id, t: item.t, seg: item.seg }];
    pr.envio = true;
    guardarAlumno();
    COLA.splice(COLA.indexOf(item), 1); colaBorrar(item.id);
    subiendo = null; pintarSubida(true);
    if (abierto === item.pasoId) renderAlumno();
    setTimeout(procesarCola, 400);
  } catch (e) {
    const m = e.message || '';
    subiendo.error = /permiso|autoriz|UrlFetch/i.test(m) ? 'No se pudo mandar el video por un problema del aula. Avisale a Andy.'
      : /Acción desconocida/.test(m) ? 'Todavía no se pueden mandar videos desde acá.'
      : 'Se cortó la conexión. Lo vuelvo a intentar solo.';
    pintarSubida();
    const reintentar = /cortó|conexión|conectar/i.test(subiendo.error);
    subiendo = reintentar ? null : subiendo;
    if (reintentar) setTimeout(procesarCola, 8000);
  }
}
// Cartelito abajo con el avance, como el «enviando» de WhatsApp (se puede seguir usando el aula)
function pintarSubida(listo) {
  let el = document.getElementById('subida');
  if (!el) { el = document.createElement('div'); el.id = 'subida'; el.className = 'subida-pill'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
  clearTimeout(el._t);
  if (listo) { el.className = 'subida-pill ok'; el.innerHTML = `${ICONO.check}<span>Video enviado a Andy</span>`; el._t = setTimeout(() => el.remove(), 2600); return; }
  if (!subiendo) { el.remove(); return; }
  const pct = Math.round(subiendo.p * 100), mas = COLA.length > 1 ? ` (${COLA.length})` : '';
  el.className = 'subida-pill' + (subiendo.error ? ' error' : '');
  el.innerHTML = subiendo.error ? `<span>${esc(subiendo.error)}</span><button class="link" data-reintentar-subida>Reintentar</button>`
    : `<span class="sp-anillo" style="--p:${pct}"></span><span>Mandando video${mas}… ${pct}%</span>`;
  const b = el.querySelector('[data-reintentar-subida]'); if (b) b.onclick = () => { subiendo = null; procesarCola(); };
}
window.addEventListener('online', () => procesarCola());
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') procesarCola(); });

// Guardado en el celu (IndexedDB) para retomar si se cierra el aula a mitad de la subida
function colaDB() {
  return new Promise((ok, mal) => {
    if (!window.indexedDB) return mal(new Error('sin IndexedDB'));
    const r = indexedDB.open('aulaAE', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('subidas', { keyPath: 'id' });
    r.onsuccess = () => ok(r.result); r.onerror = () => mal(r.error);
  });
}
async function colaGuardar(item) { try { const db = await colaDB(); db.transaction('subidas', 'readwrite').objectStore('subidas').put(item); } catch (e) {} }
async function colaBorrar(id) { try { const db = await colaDB(); db.transaction('subidas', 'readwrite').objectStore('subidas').delete(id); } catch (e) {} }
async function reanudarSubidas() {
  try {
    const db = await colaDB();
    const todos = await new Promise((ok, mal) => { const q = db.transaction('subidas').objectStore('subidas').getAll(); q.onsuccess = () => ok(q.result || []); q.onerror = () => mal(q.error); });
    todos.forEach(x => { if (!COLA.some(y => y.id === x.id)) COLA.push(x); });
  } catch (e) {}
  procesarCola();
}

// Subida en partes de 8 MB directo a Drive (si se corta la señal, se reintenta la parte que faltaba)
function subirPorPartes(url, blob, progreso) {
  const PARTE = 8 * 1024 * 1024;
  const mandar = (desde, intento) => new Promise((ok, mal) => {
    const hasta = Math.min(desde + PARTE, blob.size);
    const x = new XMLHttpRequest();
    x.open('PUT', url);
    x.setRequestHeader('Content-Range', `bytes ${desde}-${hasta - 1}/${blob.size}`);
    x.upload.onprogress = ev => progreso((desde + ev.loaded) / blob.size);
    x.onload = () => {
      if (x.status === 200 || x.status === 201) { try { ok(JSON.parse(x.responseText).id); } catch (e) { ok(''); } }
      else if (x.status === 308) mandar(hasta, 0).then(ok, mal);
      else if (intento < 3) setTimeout(() => mandar(desde, intento + 1).then(ok, mal), 1500 * (intento + 1));
      else mal(new Error('Se cortó la conexión mientras subía el video.'));
    };
    x.onerror = () => intento < 3 ? setTimeout(() => mandar(desde, intento + 1).then(ok, mal), 2000 * (intento + 1)) : mal(new Error('Se cortó la conexión mientras subía el video.'));
    x.send(blob.slice(desde, hasta));
  });
  return mandar(0, 0);
}

/* Andy mira el video desde el panel (se reproduce desde su Drive) */
function verVideoAdmin(al, pasoId, i, alMarcar) {
  const v = al.prog?.[pasoId]?.videos?.[i]; if (!v) return;
  const el = document.createElement('div');
  el.className = 'grabador ver-video';
  el.innerHTML = `<div class="gr-cab"><button class="gr-x" aria-label="Cerrar">×</button>
    <div><small>${esc(al.nombre)} · ${fechaCorta(v.t)}</small><strong>${esc(PASO[pasoId].titulo)}</strong></div>
    <a class="link gr-drive" href="https://drive.google.com/file/d/${encodeURIComponent(v.id)}/view" target="_blank" rel="noopener">Abrir en Drive</a></div>
    <div class="gr-pantalla">${String(v.id).startsWith('demo-') ? '<p class="gr-msg">Video de prueba (modo demo)</p>' : `<iframe src="https://drive.google.com/file/d/${encodeURIComponent(v.id)}/preview" allow="autoplay; fullscreen" allowfullscreen></iframe>`}</div>
    <p class="gr-nota">Si dice que se está procesando, esperá un par de minutos: Drive tarda un poco con los videos recién subidos.</p>`;
  document.body.appendChild(el); document.body.classList.add('con-grabador');
  el.querySelector('.gr-x').onclick = () => { el.remove(); document.body.classList.remove('con-grabador'); };
  if (!v.visto) { v.visto = true; alMarcar && alMarcar(); }
}
function videosNuevos(al) { return Object.values(al.prog || {}).reduce((n, x) => n + (x.videos || []).filter(v => !v.visto).length, 0); }
