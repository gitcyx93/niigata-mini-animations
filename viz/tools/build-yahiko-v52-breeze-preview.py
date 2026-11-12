"""Opening-only audition: replace mixed wind beds with one quiet field recording."""
import hashlib
import json
import shutil
import subprocess
import wave
from pathlib import Path
import numpy as np
ROOT=Path(__file__).resolve().parents[2]
A=ROOT/'viz/autumn/audio'
OUT=A/'yahiko-v52-breeze-preview'
OUT.mkdir(parents=True,exist_ok=True)
SR,N=32000,320000
ffmpeg=shutil.which('ffmpeg') or next((Path.home()/'AppData/Local/Microsoft/WinGet/Packages').glob('Gyan.FFmpeg.Essentials_*/ffmpeg-*/bin/ffmpeg.exe'),None)
assert ffmpeg
protected=A/'yahiko-v51/master.mp3'
before=hashlib.sha256(protected.read_bytes()).hexdigest()
def decode(path,filters=None):
    args=[str(ffmpeg),'-v','error','-i',str(path)]
    if filters:args+=['-af',filters]
    x=np.frombuffer(subprocess.check_output(args+['-ac','2','-ar',str(SR),'-f','f32le','pipe:1']),'<f4').reshape(-1,2).copy()
    assert np.isfinite(x).all()
    return x
def place(x,at,gain=1,fi=0,fo=0):
    x=x.copy()*gain
    for sec,end in [(fi,False),(fo,True)]:
        count=min(len(x)//2,round(sec*SR))
        if count:
            ramp=np.linspace(0,1,count)[:,None]
            if end:x[-count:]*=ramp[::-1]
            else:x[:count]*=ramp
    y=np.zeros((N,2),np.float32);start=round(at*SR);length=min(len(x),N-start)
    assert start>=0 and length>0
    y[start:start+length]=x[:length]
    return y
def wav(name,x):
    assert len(x)==N and np.isfinite(x).all() and np.max(np.abs(x))<.95
    with wave.open(str(OUT/name),'wb') as f:
        f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR)
        f.writeframes(np.round(x*32767).astype('<i2').tobytes())
# Use a forward section before the uploader's described stronger wind at the end.
source=next((ROOT/'reference/yahiko-v52-breeze').glob('fs_245824_*.mp3'))
breeze=decode(source,'highpass=f=180,lowpass=f=2800')[8*SR:18*SR]
assert len(breeze)==N
breeze*=min(.0009/max(1e-9,float(np.sqrt(np.mean(breeze*breeze)))),.0045/max(1e-9,float(np.max(np.abs(breeze)))))
# The audition starts in the middle of a scene, not with a new gust attack.
breeze=place(breeze,0,fi=.06,fo=.15)
chime=decode(A/'yahiko-v51/opening10-chime.wav')
shutter=decode(A/'yahiko-v51/shutter.wav')[:N]
steps=decode(A/'yahiko-v51/steps.wav')[:N]
# Rebuild only separately documented non-wind events; do not retain the old mixed wind bed.
# Gains follow V25's shared +6 dB and V38's .65 ropeway layer.
rope=place(decode(ROOT/'output/autumn/yahiko-v25-sound-review/stems/ropeway.m4a')[:round(3.2*SR)],9.4,gain=.65,fi=.4,fo=.6)
bird=place(decode(A/'yahiko-v18/stems/bird-01.flac'),9.75,gain=10**(6/20))
mix=breeze+chime+shutter+steps+rope+bird
assert np.array_equal(shutter,decode(A/'yahiko-v51/shutter.wav')[:N])
assert np.array_equal(steps,decode(A/'yahiko-v51/steps.wav')[:N])
assert np.max(np.abs(mix))<.95
# Short end fade is only for the 10s excerpt; no full-film loop claim.
preview=mix.copy();preview[-round(.02*SR):]*=np.linspace(1,0,round(.02*SR))[:,None]
wav('opening10.wav',preview);wav('breeze-only.wav',breeze)
manifest={'scope':'0–10s audition only; full film unchanged','removed':['extra shrine forest-wind layer','old opening/forest/leaf/ascent-air mixed environmental beds','added park recording in the opening'],
'preserved':['archival chime aligned -0.4s','V51 r2 camera and footstep stems with +4dB unchanged'],
'reconstructed':['ropeway at 9.4s','bird phrase at 9.75s'],
'limitations':['Incidental voices/birds embedded in replaced wind recordings are not separable and are also removed','Reconstructed archival layers may differ slightly from the lossy old master','No human listening verification; excerpt is not a final full-film loop'],
'new_source':{'id':245824,'author':'1ratatosk1','url':'https://freesound.org/people/1ratatosk1/sounds/245824/','license':'https://creativecommons.org/publicdomain/zero/1.0/','source_range_seconds':[8,18],'preview_mp3':True},
'breeze_rms_dbfs':float(20*np.log10(np.sqrt(np.mean(breeze*breeze))+1e-12)),'mix_peak':float(np.max(np.abs(mix))),'original_v51_sha256':before}
(OUT/'mix.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf8')
(OUT/'LICENSES.md').write_text('# 前十秒微风试听\n\n新增：Nightscapes Asplund ett min.mp3 — 1ratatosk1\nhttps://freesound.org/people/1ratatosk1/sounds/245824/\nCC0：https://creativecommons.org/publicdomain/zero/1.0/\n取 MP3 预览 8–18 秒，滤波、降音量。不是弥彦实地录音。\n\n其余沿用素材见 ../yahiko-v51/LICENSES.md 与 ../yahiko-v38/LICENSES.md。\n',encoding='utf8')
page='''<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>弥彦 · 前十秒微风试听</title><style>body{margin:0;background:#f4f0e7;color:#263c33;font:17px/1.8 system-ui,sans-serif}main{max-width:740px;margin:auto;padding:26px}section{background:#fffdf7;border:1px solid #d4d8cb;border-radius:12px;padding:20px;margin:20px 0}h1{font-size:27px}h2{font-size:21px}audio{width:100%}a{color:#24644d}</style><main><h1>前十秒 · 去掉叠风，换轻微风</h1><section><h2>▶ 听当前修改：0–10秒</h2><audio controls preload="metadata" src="opening10.wav"></audio><p>删除额外树林风；旧开场风叶、森林环境与公园杂底不再叠加，换一层轻微风实录。风铃保留，相机和脚步维持上一轮 +4 dB。</p></section><section><h2>只听替换后的微风</h2><audio controls preload="none" src="breeze-only.wav"></audio><p>与上面混音同音量，没有单独放大。CC0 夜间轻风拂树叶录音，取前段、滤掉低频轰声；不选末尾风势增强的部分。</p></section><p>微风持续铺到10秒，9.4秒接入索道低鸣，9.75秒接入远处鸟鸣。原风声里夹带的零散鸟声、人声无法独立拆开，随旧环境层一起移除；独立鸟鸣保留。</p><p>这里只做前十秒试音，尚未覆盖整片或处理全片循环。原 V51 成片未改。未做人耳听审。</p><p><a href="mix.json">处理记录</a> · <a href="LICENSES.md">录音来源与许可</a></p></main><script>document.querySelectorAll('audio').forEach(a=>a.addEventListener('play',()=>document.querySelectorAll('audio').forEach(b=>{if(a!==b)b.pause()})));</script></html>'''
(OUT/'index.html').write_text(page,encoding='utf8')
assert hashlib.sha256(protected.read_bytes()).hexdigest()==before
print(json.dumps({'peak':manifest['mix_peak'],'breeze_rms_dbfs':manifest['breeze_rms_dbfs'],'original_film_unchanged':True}))
