from pathlib import Path
import json
import numpy as np
from PIL import Image, ImageDraw
ROOT=Path(__file__).resolve().parent
ids=['501168','575645','637977','349076','257468','240532']
im=Image.new('RGB',(1600,1200),'#faf9f4'); d=ImageDraw.Draw(im)
for row, ident in enumerate(ids):
    meta=json.loads((ROOT/'decoded'/f'{ident}.json').read_text())
    x=np.fromfile(ROOT/'decoded'/f'{ident}.f32',dtype='<f4').reshape(-1,meta['channels'])
    assert np.isfinite(x).all()
    sr=meta['sample_rate']; peak=float(np.max(np.abs(x))); duration=len(x)/sr
    y=row*200
    d.text((20,y+8),f'{ident}  duration={duration:.3f}s  peak={20*np.log10(max(peak,1e-9)):.1f}dBFS  display auto-scaled',fill='black')
    bounds=np.linspace(0,len(x),1521,dtype=int)
    for i in range(1520):
        block=x[bounds[i]:bounds[i+1]]
        lo,hi=float(block.min()),float(block.max())
        d.line((50+i,y+95-hi/peak*65,50+i,y+95-lo/peak*65),fill='#235e50')
    for t in np.linspace(0,duration,11):
        xx=50+t/duration*1520;d.text((xx-10,y+170),f'{t:.1f}',fill='black')
    # 50ms RMS bins identify impacts and relatively quiet, stable candidate regions.
    n=2400; a=x[:len(x)//n*n].reshape(-1,n,x.shape[1]); rms=np.sqrt(np.mean(a*a,axis=(1,2)))
    peaks=[(round(i*.05,2),round(float(v),4)) for i,v in enumerate(rms) if 0<i<len(rms)-1 and v>rms[i-1] and v>=rms[i+1]]
    print(ident,'strongest RMS peaks',sorted(peaks,key=lambda p:p[1],reverse=True)[:16])
    if duration>20:
        candidates=[]
        for start in np.arange(1,duration-5,.5):
            r=rms[int(start/.05):int((start+4)/.05)]
            candidates.append((round(float(np.mean(r)+np.std(r)),5),float(start),round(float(np.mean(r)),5)))
        print('quiet stable 4s windows',sorted(candidates)[:8])
im.save(ROOT/'source-waveforms.png')
