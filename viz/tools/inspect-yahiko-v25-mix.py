"""Read-only waveform inspection of downloaded public previews."""
from pathlib import Path
import subprocess, json
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
ROOT=Path(__file__).resolve().parents[2]
SRC=ROOT/'reference/yahiko-v25/sound-candidates-v1'
OUT=ROOT/'output/autumn/yahiko-v25-sound-review'
OUT.mkdir(exist_ok=True,parents=True)
SR=48000

def decode(p):
    b=subprocess.check_output(['ffmpeg','-v','error','-i',str(p),'-f','f32le','-ac','2','-ar',str(SR),'-'])
    return np.frombuffer(b,dtype='<f4').reshape(-1,2).copy()

def envelope(x, step=480):
    n=len(x)//step
    z=x[:n*step].reshape(n,step,2)
    return (np.arange(n)+.5)*step/SR,np.max(np.abs(z),axis=(1,2)),np.sqrt(np.mean(z*z,axis=(1,2)))

if __name__=='__main__':
    entries=[('Chime','01-wind-chime/501168-furin-preview.mp3',.4,4.18),('Leaves','02-leaves/575645-leaves-preview.mp3',24.5,28.1),('Water','03-water/637977-small-water-trickle-preview.mp3',34,38),('Footsteps','04-footsteps/257468-gravel-steps-preview.mp3',0,2),('Ropeway','05-ropeway/240532-ropeway-preview.mp3',1,4.2)]
    fig,axes=plt.subplots(5,2,figsize=(17,14))
    stats=[]
    for row,(name,file,a,b) in enumerate(entries):
        x=decode(SRC/file)
        for col,(lo,hi) in enumerate([(0,len(x)/SR),(a,b)]):
            seg=x[int(lo*SR):int(hi*SR)]
            t,pk,rms=envelope(seg,480 if col==0 else 48)
            ax=axes[row,col];ax.fill_between(t+lo,0,pk,alpha=.35,label='peak');ax.plot(t+lo,rms,lw=.7,label='RMS');ax.set_title(f'{name} {lo:.2f}–{hi:.2f}s');ax.set_xlabel('Source seconds');ax.grid(alpha=.2)
            if col==0:ax.axvspan(a,b,color='orange',alpha=.3)
            ax.legend(fontsize=8)
        stats.append({'name':name,'duration':len(x)/SR,'peak_dbfs':float(20*np.log10(np.max(abs(x))+1e-12))})
    fig.tight_layout();fig.savefig(OUT/'source-waveforms.png',dpi=125)
    print(json.dumps(stats,indent=2))
