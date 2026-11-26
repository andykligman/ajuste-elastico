#!/usr/bin/env python3
"""Captura un paso del aula directo, sin la intro "Cómo funciona" ni el cartel "Pasaste al módulo".

Uso (desde la raíz del repo, después de `python3 construir.py`):
    python3 herramientas/ver_paso.py cv4            -> /tmp/ver_cv4_390.png (celu)
    python3 herramientas/ver_paso.py cv4 cv2 --compu  -> también 1440 px
Levanta un servidor local en :8765 si no hay uno, abre ?demo&paso=ID con las marcas de
intro y módulos ya vistas en localStorage, y saca una captura del paso entero (de la tarjeta).
"""
import sys, os, subprocess, time, urllib.request
from playwright.sync_api import sync_playwright

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUERTO = 8765
args = [a for a in sys.argv[1:] if not a.startswith('--')]
anchos = [390] + ([1440] if '--compu' in sys.argv else [])

def servidor():
    try: urllib.request.urlopen(f'http://localhost:{PUERTO}/', timeout=1); return
    except Exception: pass
    subprocess.Popen([sys.executable, '-m', 'http.server', str(PUERTO)], cwd=RAIZ,
                     stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)

# Marca intro vista y todos los módulos vistos para el alumno de prueba (__demo)
PRE = """try {
  localStorage.setItem('mapaAE_intro___demo', '1');
  localStorage.setItem('mapaAE_modVistos___demo', JSON.stringify([1,2,3,4,5,6,7,8]));
  localStorage.setItem('mapaAE_sinInstalar', '1');
} catch (e) {}"""

servidor()
with sync_playwright() as p:
    b = p.chromium.launch()
    for paso in args:
        for w in anchos:
            pg = b.new_page(viewport={'width': w, 'height': 900 if w < 800 else 1000})
            errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.add_init_script(PRE)
            pg.goto(f'http://localhost:{PUERTO}/?demo&paso={paso}')
            pg.wait_for_timeout(5000)  # deja terminar las animaciones de entrada
            # Saca lo flotante (WhatsApp, «Para la clase») para que no tape la captura
            pg.add_style_tag(content='#consulta,.barra-clase{display:none!important}')
            el = pg.query_selector('.consigna')
            tarjeta = el.evaluate_handle('e => e.closest("section, article, .panel-paso, .paso-abierto") || e.parentElement') if el else None
            out = f'/tmp/ver_{paso}_{w}.png'
            try: tarjeta.as_element().screenshot(path=out)
            except Exception: pg.screenshot(path=out, full_page=True)
            print(out, ('ERRORES: ' + ' | '.join(errs)) if errs else '')
    b.close()
