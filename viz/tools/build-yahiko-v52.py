"""Build the full 28.1s V52: approved gentle breeze throughout, frozen V50 visuals."""
import base64
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import wave
import numpy as np

ROOT=Path(__file__).resolve().parents[2]
A=ROOT/'viz/autumn/audio'; OUT=A/'yahiko-v52'; OUT.mkdir(parents=True,exist_ok=True)
SR,DUR=32000,28.1; N=round(SR*DUR)
f=os.environ.get('FFMPEG') or shutil.which('ffmpeg') or next((Path.home()/'AppData/Local/Microsoft/WinGet/Packages').glob('Gyan.FFmpeg.Essentials_*/ffmpeg-*/bin/ffmpeg.exe'),None)
if not f:raise RuntimeError('Set FFMPEG to an installed FFmpeg executable')
def decode(p,filters=None):
    cmd=[str(f),'-v','error','-i',str(p)]
    if filters:cmd+=['-af',filters]
    x=np.frombuffer(subprocess.check_output(cmd+['-ac','2','-ar',str(SR),'-f','f32le','pipe:1']),'<f4').reshape(-1,2).copy()
    assert len(x) and np.isfinite(x).all()
    return x

def envelope(x,fi=0,fo=0):
    x=x.copy()
    for seconds,end in [(fi,False),(fo,True)]:
        count=min(len(x)//2,round(seconds*SR))
        if count:
            ramp=np.linspace(0,1,count)[:,None]
            if end:x[-count:]*=ramp[::-1]
            else:x[:count]*=ramp
    return x

def place(x,at,gain=1,fi=0,fo=0):
    x=envelope(x*gain,fi,fo); out=np.zeros((N,2),np.float32);start=round(at*SR)
    src=max(0,-start);dst=max(0,start);length=min(len(x)-src,N-dst)
    assert length>0
    out[dst:dst+length]=x[src:src+length]
    return out

def wav(name,x):
    assert len(x)==N and np.isfinite(x).all() and np.max(np.abs(x))<.95
    with wave.open(str(OUT/name),'wb') as out:
        out.setnchannels(2);out.setsampwidth(2);out.setframerate(SR)
        out.writeframes(np.round(x*32767).astype('<i2').tobytes())

# Match the accepted preview's source, filtering and gain calculation exactly.
source=next((ROOT/'reference/yahiko-v52-breeze').glob('fs_245824_*.mp3'))
x=decode(source,'highpass=f=180,lowpass=f=2800')
reference=x[8*SR:18*SR]
gain=min(.0009/max(1e-9,float(np.sqrt(np.mean(reference*reference)))),.0045/max(1e-9,float(np.max(np.abs(reference)))))
breeze=x[8*SR:8*SR+N]*gain
assert len(breeze)==N and np.max(np.abs(breeze))<.02
# Quiet natural boundary, no backwards audio and no end-of-film gust.
breeze=envelope(breeze,.06,.06)
assert np.max(np.abs(breeze[[0,-1]]))==0
tracks={'breeze':breeze}
# These include the already-approved +4dB; never re-normalize individual Foley here.
for key in ['door','shutter','steps']:
    tracks[key]=decode(A/f'yahiko-v51/{key}.wav')
    assert len(tracks[key])==N
tracks['chime']=place(decode(A/'yahiko-v38/audition-shrine-chime.wav'),2.8)
tracks['ropeway']=place(decode(ROOT/'output/autumn/yahiko-v25-sound-review/stems/ropeway.m4a')[:round(3.2*SR)],9.4,.65,.4,.6)
tracks['birds']=sum(place(decode(A/f'yahiko-v18/stems/{name}.flac'),at,10**(6/20)) for name,at in [('bird-01',9.75),('bird-02',11.05)])
tracks['sea']=place(decode(A/'yahiko-v38/audition-sea.wav'),12.4)
# V49's town section maps to V38 20.6–24.2. Remove the two original quiet wind beds,
# keeping the existing water, town chime, motion-driven window, cat and town birds.
# Subtraction uses archival stems; tiny lossy-codec residuals are not new wind layers.
old=decode(A/'yahiko-v38/master.wav')
town=old[round(20.6*SR):round(24.2*SR)].copy()
for name,start,g in [('night-quiet',16.8,10**(6/20)),('town-quiet',20.4,10**(4/20))]:
    bed=decode(A/f'yahiko-v18/stems/{name}.flac')*g
    begin=round((20.6-start)*SR);length=min(len(town),len(bed)-begin)
    if length>0:town[:length]-=bed[begin:begin+length]
tracks['town-details']=place(town,17,1,.18,.15)
master=sum(tracks.values())
assert np.max(np.abs(master))<.95
# No old mixed base, park, forest or leaf track is included in the full-film sum.
assert set(tracks)=={'breeze','door','shutter','steps','chime','ropeway','birds','sea','town-details'}
for k,x in tracks.items():wav(k+'.wav',x)
wav('master.wav',master)
subprocess.run([str(f),'-v','error','-y','-i',str(OUT/'master.wav'),'-c:a','libmp3lame','-b:a','192k',str(OUT/'master.mp3')],check=True)
encoded=decode(OUT/'master.mp3');assert len(encoded)==N and np.max(np.abs(encoded))<.95
# Verify accepted 0–10s sound before its preview-only fadeout.
accepted=decode(A/'yahiko-v52-breeze-preview/opening10.wav')
assert np.max(np.abs(master[:round(9.8*SR)]-accepted[:round(9.8*SR)]))<5/32767
manifest={'version':'V52','duration':DUR,'sample_rate':SR,'peak':float(np.max(np.abs(master))),'encoded_peak':float(np.max(np.abs(encoded))),
'wind_source':{'id':245824,'author':'1ratatosk1','url':'https://freesound.org/people/1ratatosk1/sounds/245824/','license':'https://creativecommons.org/publicdomain/zero/1.0/','range_seconds':[8,36.1],'gain':gain,'boundary_fades_seconds':[.06,.06]},
'kept_foley_sha256':{k:hashlib.sha256((A/f'yahiko-v51/{k}.wav').read_bytes()).hexdigest() for k in ['door','shutter','steps']},
'removed':['extra shrine forest wind','old opening and leaf wind beds','old ascent air wind bed','park recording throughout','old town quiet wind beds'],
'kept':['wind chimes','sea','ropeway','bird phrases','town water/window/cat details','door','camera +4dB','footsteps +4dB'],
'validation':['accepted first 9.8 seconds matches within PCM quantization; excerpt-only end fade removed','28.1-second encoded duration','no clipping','breeze boundary zero crossing','V50 FX byte content unchanged'],
'limitations':['Town wind subtraction may retain small codec residuals','New full-film mix not independently listened to; opening direction approved by user']}
(OUT/'mix.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf8')
credits='# V52 微风版\n\n新增微风：Nightscapes Asplund ett min.mp3 — 1ratatosk1\nhttps://freesound.org/people/1ratatosk1/sounds/245824/\nCC0：https://creativecommons.org/publicdomain/zero/1.0/\n使用MP3预览8–36.1秒，滤波、降音量、首尾短淡化；不是弥彦现场录音。\n\n'+(A/'yahiko-v51/LICENSES.md').read_text(encoding='utf8')
credits+='\nV51 的公园录音在 V52 已撤掉，历史来源记录不代表仍使用。\n'
(OUT/'LICENSES.md').write_text(credits,encoding='utf8')
page=(ROOT/'viz/autumn/yahiko-v51.html').read_text(encoding='utf8')
page=page.replace('弥彦 V51 · 动作音效试听版','弥彦 V52 · 轻微风版').replace('新潟四季 · 秋 / V51 音效试听','新潟四季 · 秋 / V52 轻微风版')
page=page.replace('Yahiko V51, V49 base unchanged plus action-timed Foley','Yahiko V52, gentle breeze throughout, action Foley retained')
page=page.replace('audio/yahiko-v51/','audio/yahiko-v52/')
page=re.sub(r'(<script id="yahiko-audio-data"[^>]*>).*?(</script>)',lambda m:m[1]+'data:audio/mpeg;base64,'+base64.b64encode((OUT/'master.mp3').read_bytes()).decode()+m[2],page,count=1,flags=re.S)
page=page.replace('快门、脚步、公园氛围：CC0','快门、脚步、微风（1ratatosk1）：CC0')
sheet='<summary>V52 轻微风版 · 分轨试听</summary><p>全片使用同一条轻微风实录，删除额外树林风、旧风叶与公园杂底。相机与脚步保留 +4 dB。首尾风声短淡化衔接，不倒放。</p><div id="solo-buttons" style="display:flex;gap:5px;flex-wrap:wrap"></div><table style="width:100%;text-align:left;font-size:12px;line-height:1.8"><tbody>'
for when,what in [('全片','轻微风；无配乐'),('2.1 / 24.6 / 27.9秒','相机快门'),('2.9–8.25秒','神社风铃'),('参道与温泉街','人物脚步，维持加大后的音量'),('9.4秒起','索道低鸣与原独立鸟鸣'),('12.4秒起','远海声，不作为风声删除'),('17秒起','温泉街细水、窗框、猫叫等非风细节'),('18.5–19.4秒','半扇木滑门')]:sheet+=f'<tr><td>{when}</td><td>{what}</td></tr>'
sheet+='</tbody></table>'
page,n=re.subn(r'sheet\.innerHTML=.*?;\n',lambda m:'sheet.innerHTML='+json.dumps(sheet,ensure_ascii=False)+';\n',page,count=1);assert n==1
old="[['全部新增音效','new-effects.wav'],['拉门','door.wav'],['快门','shutter.wav'],['脚步','steps.wav'],['公园氛围','park.wav']]"
assert old in page
page=page.replace(old,"[['微风','breeze.wav'],['风铃','chime.wav'],['拉门','door.wav'],['快门','shutter.wav'],['脚步','steps.wav'],['温泉街细节','town-details.wav']]")
fx=(ROOT/'viz/autumn/yahiko-v50-fx.js').read_text(encoding='utf8');assert fx in page
(ROOT/'viz/autumn/yahiko-v52.html').write_text(page,encoding='utf8')
print(json.dumps({'duration':DUR,'peak':manifest['peak'],'encoded_peak':manifest['encoded_peak'],'opening_preserved':True,'output':'viz/autumn/yahiko-v52.html'}))
