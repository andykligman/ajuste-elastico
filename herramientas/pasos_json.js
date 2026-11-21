// Arma pasos.json (catálogo de pasos del aula) para el servidor: lo usa al leer las transcripciones de clase
const fs = require('fs');
global.window = undefined; global.location = { search: '' };
const src = ['programa.js', 'motor.js'].map(f => fs.readFileSync(__dirname + '/../fuente/' + f, 'utf8')).join('\n')
  .replace(/^const /mg, 'var ').replace(/^let /mg, 'var ');
eval(src);
const corto = t => String(t || '').replace(/\*\*|#|\[|\]\([^)]*\)/g, '').replace(/\s+/g, ' ').trim().slice(0, 240);
const out = PROGRAMA.pasos.filter(p => !p.soloLlamada && !p.hojaDeRuta).map(p => ({
  id: p.id, modulo: MODULO_DE[p.etapa], titulo: p.titulo, consigna: corto(p.detalle),
  opciones: (p.progreso || []).map(o => o.label),
}));
fs.writeFileSync(__dirname + '/../pasos.json', JSON.stringify(out));
console.log('pasos.json', out.length);
