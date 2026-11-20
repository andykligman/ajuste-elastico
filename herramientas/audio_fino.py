# Audios que Andy ya mejoró en el iPhone ("Mejorar grabación"): UNA sola pasada desde ese archivo.
# Sin EQ ni reducción de ruido. Recorta punta y final con fundidos mínimos (10 ms al entrar, 40 ms al salir),
# acorta las pausas largas en el medio (> 0,35 s quedan en 0,22 s, con cruce de 10 ms) para que sea ágil,
# volumen a -25 LUFS y 0,12 s de aire al final. AAC 128k mono 48 kHz.
# Uso: python3 herramientas/audio_fino.py original.m4a audio/carpeta/NN.m4a
import subprocess, sys, re, numpy as np
inp, out = sys.argv[1], sys.argv[2]
SR = 48000
raw = subprocess.run(['ffmpeg','-v','error','-i',inp,'-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout
x = np.frombuffer(raw, np.float32).astype(np.float64)
w = SR // 100   # ventanas de 10 ms
r = np.array([20*np.log10(np.sqrt(np.mean(x[k:k+w]**2))+1e-9) for k in range(0, len(x)-w, w)])
umbral = max(-62, r.max() - 42)
voz = r > umbral
idx = np.where(voz)[0]
ini = max(0, idx[0] - 4)            # 40 ms antes de la primera palabra
fin = min(len(r), idx[-1] + 1 + 6)  # 60 ms después de la última
# pausas internas
keep = []; k = ini; i = ini
while i < fin:
    if not voz[i]:
        j = i
        while j < fin and not voz[j]: j += 1
        largo = j - i
        if largo > 35 and j < fin:
            sobra = largo - 22
            keep.append((k, i + 11)); k = i + 11 + sobra
        i = j
    else: i += 1
keep.append((k, fin))
cf = SR // 100   # cruce de 10 ms
y = x[keep[0][0]*w: keep[0][1]*w].copy()
for a, b in keep[1:]:
    seg = x[a*w: b*w]
    ramp = np.linspace(0, 1, cf)
    y[-cf:] = y[-cf:]*(1-ramp) + seg[:cf]*ramp
    y = np.concatenate([y, seg[cf:]])
fi, fo = int(0.01*SR), int(0.04*SR)
y[:fi] *= np.linspace(0, 1, fi); y[-fo:] *= np.linspace(1, 0, fo)
y = np.concatenate([y, np.zeros(int(0.12*SR))])
tmp = out + '.tmp.f32'
y.astype(np.float32).tofile(tmp)
m = subprocess.run(['ffmpeg','-f','f32le','-ar',str(SR),'-ac','1','-i',tmp,'-af','ebur128','-f','null','-'],capture_output=True,text=True)
I = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', m.stderr)[-1]); g = -25 - I
subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(SR),'-ac','1','-i',tmp,'-af',f'volume={g:.2f}dB','-c:a','aac','-b:a','128k',out],check=True)
import os; os.remove(tmp)
print(out, f'{len(x)/SR:.2f}s -> {len(y)/SR:.2f}s, pausas cortadas {len(keep)-1}, gain {g:+.1f}dB')
