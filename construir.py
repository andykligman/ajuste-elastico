import re
shell=open('fuente/shell.html').read().replace('/*CSS_ALUMNO*/', open('fuente/alumno.css').read())
logo=open('fuente/logo.svg').read().replace('`','')
logo=re.sub(r'width="494" height="112" ','role="img" aria-label="Ajuste Elástico" ',logo)
js='\n'.join(open('fuente/'+f).read() for f in ['programa.js','motor.js','datos.js','ui.js']).replace('/*VISTA_ALUMNO*/', open('fuente/vista.js').read())
js=js.replace("if (typeof module !== 'undefined') module.exports","if (typeof module !== 'undefined' && typeof window === 'undefined') module.exports")
out=shell.replace('/*LOGO*/',logo).replace('/*JS*/',js)
import hashlib, json
version=hashlib.sha1(out.encode()).hexdigest()[:10]   # cambia solo si cambió algo de la página
out=out.replace('__VERSION_AULA__',version,1)
open('version.json','w').write(json.dumps({'v':version})+'\n')
open('index.html','w').write(out); print(len(out))
import subprocess
subprocess.run(['node','herramientas/pasos_json.js'],check=True)
