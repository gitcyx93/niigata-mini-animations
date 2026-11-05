"""Reproducible additive sound proposals; leaves published v25 unchanged.
Needs ffmpeg, numpy, scipy, matplotlib. Never downloads or alters source media.
"""
from pathlib import Path
import importlib.util,json,subprocess,hashlib
import numpy as np
from scipy.signal import butter,sosfilt
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
spec=importlib.util.spec_from_file_location('inspect_mix',Path(__file__).with_name('inspect-yahiko-v25-mix.py'))
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
ROOT,SRC,OUT,SR=m.ROOT,m.SRC,m.OUT,m.SR
DURATION=24.6;N=round(DURATION*SR)
(OUT/'stems').mkdir(exist_ok=True,parents=True)
VIDEO=ROOT/'output/autumn/yahiko-v25/yahiko-v25-ambience.mp4'
base=m.decode(VIDEO)[:N]
assert len(base)==N

def db(x):return float(20*np.log10(max(float(x),1e-12)))
def stats(x):return {'peak_dbfs':db(np.max(abs(x))),'rms_dbfs':db(np.sqrt(np.mean(x*x))),'duration_seconds':len(x)/SR,'clipped_samples':int(np.sum(abs(x)>=1))}
def encode(x,path,codec):
    args=['ffmpeg','-y','-v','error','-f','f32le','-ar',str(SR),'-ac','2','-i','pipe:0']+codec+[str(path)]
    subprocess.run(args,input=x.astype('<f4').tobytes(),check=True)
def fade(x,fi,fo):
    for count,reverse in [(round(fi*SR),False),(round(fo*SR),True)]:
        if not count:continue
        ramp=.5-.5*np.cos(np.linspace(0,np.pi,count))
        if reverse:x[-count:]*=ramp[::-1,None]
        else:x[:count]*=ramp[:,None]
    return x

# The main chime peak is at source 0.445s. Crop 0.400 retains its attack and full decay.
# Leaves retain the previously selected low-transient area, not the louder early spikes.
# Water uses the small-trickle source; adjacent-rapids alternate is deliberately unused.
# Ropeway uses the quieter early region, excluding the high-energy later events.
SPECS=[
 dict(id='leaves',file='02-leaves/575645-leaves-preview.mp3',crop=[24.5,27.95],at=17.15,fade=[.48,.70],hp=180,lp=6500,target_rms=-47.0,max_peak=-29.0,width=.8,pan=0),
 dict(id='chime',file='01-wind-chime/501168-furin-preview.mp3',crop=[.4,4.18],at=20.45,fade=[.008,.40],hp=650,lp=6800,target_rms=-49.0,max_peak=-28.0,width=.45,pan=-.16),
 dict(id='water',file='03-water/637977-small-water-trickle-preview.mp3',crop=[34,38],at=20.6,fade=[.60,.65],hp=220,lp=4200,target_rms=-51.0,max_peak=-33.0,width=0,pan=.14),
 dict(id='ropeway',file='05-ropeway/240532-ropeway-preview.mp3',crop=[1,4.2],at=9.8,fade=[.45,.65],hp=100,lp=1300,target_rms=-51.0,max_peak=-35.0,width=.35,pan=0),
]
stems={};records=[]
fig,axes=plt.subplots(4,2,figsize=(14,10))
for row,s in enumerate(SPECS):
    raw=m.decode(SRC/s['file']);a,b=[round(t*SR) for t in s['crop']];x=raw[a:b].astype(np.float64)
    x-=x.mean(axis=0)
    x=sosfilt(butter(2,s['hp'],btype='highpass',fs=SR,output='sos'),x,axis=0)
    x=sosfilt(butter(2,s['lp'],btype='lowpass',fs=SR,output='sos'),x,axis=0)
    mid=x.mean(axis=1);side=(x[:,0]-x[:,1])*.5*s['width'];x=np.stack([mid+side,mid-side],axis=1)
    x[:,0]*=np.sqrt(1-s['pan']);x[:,1]*=np.sqrt(1+s['pan'])
    fade(x,*s['fade'])
    gain=min(s['target_rms']-stats(x)['rms_dbfs'],s['max_peak']-stats(x)['peak_dbfs'])
    x*=10**(gain/20);stems[s['id']]=x
    encode(x,OUT/'stems'/f"{s['id']}.flac",['-c:a','flac','-sample_fmt','s32'])
    # Solo audition uses the SAME +6dB as mixed playback, not a secretly boosted stem.
    encode(x*10**(6/20),OUT/'stems'/f"{s['id']}.m4a",['-c:a','aac','-b:a','192k'])
    records.append({**s,'gain_after_eq_db':gain,'source_sha256':hashlib.sha256((SRC/s['file']).read_bytes()).hexdigest(),'processed_pre_master':stats(x)})
    for col,arr in enumerate([raw[a:b],x]):
        t,pk,rms=m.envelope(arr);ax=axes[row,col];ax.fill_between(t,0,20*np.log10(pk+1e-9),alpha=.2);ax.plot(t,20*np.log10(rms+1e-9),lw=.8);ax.set_ylim(-85,0);ax.grid(alpha=.2);ax.set_title(s['id']+(' source crop' if col==0 else ' processed (before shared +6dB)'));ax.set_xlabel('Seconds');ax.set_ylabel('dBFS')
fig.tight_layout();fig.savefig(OUT/'edited-waveforms.png',dpi=130);plt.close(fig)
variants=[('00-original',[], '原版对照'),('01-A-air',['leaves','chime'],'A · 风叶与风铃'),('02-B-water',['leaves','chime','water'],'B · 加温泉细水'),('03-C-ropeway',['leaves','chime','water','ropeway'],'C · 再加索道低鸣')]
report=[]
for ident,tracks,title in variants:
    mix=base.astype(np.float64).copy()
    for s in SPECS:
        if s['id'] not in tracks:continue
        x=stems[s['id']];a=round(s['at']*SR);b=min(a+len(x),N);mix[a:b]+=x[:b-a]
    mix*=10**(6/20)  # common gain to every proposal AND baseline; no per-version normalization
    assert np.max(abs(mix))<.95,'Unexpected headroom loss'
    encode(mix,OUT/f'{ident}.flac',['-c:a','flac','-sample_fmt','s32'])
    encode(mix,OUT/f'{ident}.m4a',['-c:a','aac','-b:a','192k'])
    subprocess.run(['ffmpeg','-y','-v','error','-i',str(VIDEO),'-i',str(OUT/f'{ident}.m4a'),'-map','0:v:0','-map','1:a:0','-c','copy','-t',str(DURATION),'-movflags','+faststart',str(OUT/f'{ident}.mp4')],check=True)
    decoded=m.decode(OUT/f'{ident}.mp4')[:N]
    subprocess.run(['ffmpeg','-v','error','-i',str(OUT/f'{ident}.mp4'),'-f','null','-'],check=True)
    report.append({'id':ident,'title':title,'tracks':tracks,'pcm':stats(mix),'encoded_aac':stats(decoded),'full_decode':'passed'})
meta={'source_commit':'77f5ec0e','baseline':str(VIDEO.relative_to(ROOT)),'duration':DURATION,'shared_master_gain_db':6,'per_variant_normalization':False,'original_video_unchanged':True,'aural_review':'pending user listening; waveform and numerical checks only','notes':['MP3 public previews, not original lossless recordings.','Natural source ambience is not Yahiko field recording.','No music, footsteps, global reverb or second chime.','No changes to original film or its published audio.'],'edits':records,'variants':report,'license_ropeway':'concretica, Freesound 240532, CC BY 4.0; preview cropped 1.0–4.2s, filtered, faded, stereo narrowed and gain adjusted. https://freesound.org/people/concretica/sounds/240532/ https://creativecommons.org/licenses/by/4.0/'}
(OUT/'mix-manifest.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(report,ensure_ascii=False,indent=2))
