# Audios que Andy ya mejoró en el iPhone ("Mejorar grabación"): UNA sola pasada desde ese archivo.
# Sin EQ ni reducción de ruido. Recorta punta y final con fundidos mínimos (10 ms al entrar, 40 ms al salir), 80 ms de aire antes de la voz,
# acorta las pausas largas en el medio (> 0,35 s quedan en 0,22 s, con cruce de 10 ms) para que sea ágil,
# volumen a -25 LUFS y 0,12 s de aire al final. AAC 128k mono 48 kHz.
# Uso: python3 herramientas/audio_fino.py original.m4a audio/carpeta/NN.m4a
# Además corta el "trrrr": a veces el "Mejorar grabación" del iPhone repite en loop un pedacito de ~85 ms en la cola
# de la última sílaba. Se detecta como un tramo que se repite casi idéntico (similitud > 0,944) y se corta ahí.
import subprocess, sys, re, numpy as np
inp, out = sys.argv[1], sys.argv[2]
SR = 48000
raw = subprocess.run(['ffmpeg','-v','error','-i',inp,'-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout
x = np.frombuffer(raw, np.float32).astype(np.float64)
def loop_iphone(x):
    sr = 16000; y = np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i',inp,'-ac','1','-ar','16000','-f','f32le','-'],capture_output=True).stdout, np.float32).astype(np.float64); n, h = 256, 80; fr = sr / h
    S = np.array([np.log(np.abs(np.fft.rfft(y[k:k+n]*np.hanning(n)))[3:80]+1e-6) for k in range(0, len(y)-n, h)])
    e = np.array([np.sqrt(np.mean(y[k:k+n]**2)) for k in range(0, len(y)-n, h)])
    on = 20*np.log10(e/e.max()+1e-9) > -30
    S = S - S.mean(1, keepdims=True); S /= np.linalg.norm(S, axis=1, keepdims=True) + 1e-9
    cand = None
    for lag in range(int(.06*fr), int(.16*fr)):
        sim = np.sum(S[:-lag]*S[lag:], 1) * (on[:-lag] & on[lag:]); L = int(1.6*lag)
        for k in range(int(len(sim)*0.3), len(sim)-L):
            if sim[k:k+L].mean() > 0.944 and (cand is None or k < cand[0]): cand = (k, lag); break
    if not cand: return None
    return int((cand[0] + cand[1]) * h * 3)   # muestra donde cortar: dejo un solo período
corte = loop_iphone(x)
if corte: print('  loop del iPhone en %.2fs: corto ahí' % (corte/SR)); x = x[:corte].copy(); x[-int(.05*SR):] *= np.linspace(1, 0, int(.05*SR))
w = SR // 100   # ventanas de 10 ms
r = np.array([20*np.log10(np.sqrt(np.mean(x[k:k+w]**2))+1e-9) for k in range(0, len(x)-w, w)])
umbral = max(-62, r.max() - 42)
voz = r > umbral
idx = np.where(voz)[0]
ini = max(0, idx[0] - 8)            # 80 ms antes de la primera palabra (el celu a veces se come el arranque)
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
