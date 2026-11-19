# Receta final de audios del aula (bienvenida, stops): UNA sola pasada desde la grabación original de Andy.
# Recorta silencio de punta a punta, highpass 70 Hz, fundido 30 ms al entrar y 200 ms donde termina la voz,
# volumen a -25 LUFS (más fuerte le resultaba molesto), 0,4 s de silencio al final, AAC 128k mono 48 kHz.
# Sin limitador ni reducción de ruido (saturaban). Nunca reprocesar un audio ya procesado: siempre desde el original.
# Uso: python3 herramientas/audio_limpio.py original.m4a audio/carpeta/NN.m4a
# Al reemplazar audios, subir el ?v= de la URL en fuente/vista.js para que el navegador no use el viejo.
import subprocess, sys, re, numpy as np
def run(a): return subprocess.run(a, capture_output=True, text=True)
inp, out = sys.argv[1], sys.argv[2]
# fin de la voz
raw = subprocess.run(['ffmpeg','-v','error','-i',inp,'-ac','1','-ar','16000','-f','s16le','-'],capture_output=True).stdout
x = np.frombuffer(raw,np.int16).astype(float)/32768; w=160
r = [20*np.log10(np.sqrt(np.mean(x[k:k+w]**2))+1e-9) for k in range(0,len(x)-w,w)]
voz = [i for i,v in enumerate(r) if v > -60]
ini = max(0, voz[0]*w/16000 - 0.08); fin = min(len(x)/16000, (voz[-1]+1)*w/16000 + 0.12)
dur = fin - ini
base = f"aformat=sample_fmts=flt,atrim={ini:.3f}:{fin:.3f},asetpts=N/SR/TB,highpass=f=70,afade=t=in:d=0.03,afade=t=out:st={max(0,dur-0.2):.3f}:d=0.2"
m = run(['ffmpeg','-i',inp,'-af',base+',ebur128','-f','null','-'])
I = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', m.stderr)[-1])
g = -25 - I
subprocess.run(['ffmpeg','-v','error','-y','-i',inp,'-af',base+f',volume={g:.2f}dB,apad=pad_dur=0.4','-ac','1','-ar','48000','-c:a','aac','-b:a','128k',out],check=True)
print(out, f'{dur:.2f}s gain {g:+.1f}dB')
