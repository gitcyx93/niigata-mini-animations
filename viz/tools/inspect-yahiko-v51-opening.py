"""Export 0–10s at mix gain; never change the film or its master."""
from pathlib import Path
import hashlib
import html
import json
import shutil
import subprocess
import wave
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
A = ROOT/'viz/autumn/audio'
OUT = A/'yahiko-v51'
SR, N = 32000, 320000
ffmpeg=shutil.which('ffmpeg') or next((Path.home()/'AppData/Local/Microsoft/WinGet/Packages').glob('Gyan.FFmpeg.Essentials_*/ffmpeg-*/bin/ffmpeg.exe'),None)
assert ffmpeg, 'FFmpeg required'
def decode(p):
    b=subprocess.check_output([str(ffmpeg),'-v','error','-i',str(p),'-ac','2','-ar',str(SR),'-f','f32le','pipe:1'])
    return np.frombuffer(b,'<f4').reshape(-1,2).copy()
def wav(p,x):
    assert len(x)==N and np.isfinite(x).all() and np.max(np.abs(x))<1
    with wave.open(str(p),'wb') as f:
        f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR)
        f.writeframes(np.round(x*32767).astype('<i2').tobytes())
master=OUT/'master.mp3';before=hashlib.sha256(master.read_bytes()).hexdigest()
base=decode(A/'yahiko-v49/master.mp3')[:N]
tracks={'mix':decode(OUT/'master.wav')[:N],'base':base}
for k in ['park','shutter','steps']:
    tracks[k]=decode(OUT/(k+'.wav'))[:N]
# Existing V38 audition files start at 3.2s. V49/V51 daytime audio maps source t to t-0.4.
# These are archival layer reconstructions, not lossless source separation of the MP3.
for k,filename in [('chime','audition-shrine-chime.wav'),('forest','audition-shrine-wind.wav')]:
    x=decode(A/'yahiko-v38'/filename)
    y=np.zeros_like(base);start=round(2.8*SR);length=min(len(x),N-start)
    y[start:start+length]=x[:length];tracks[k]=y
tracks['residual']=base-tracks['chime']-tracks['forest']
assert np.allclose(tracks['residual']+tracks['chime']+tracks['forest'],base,atol=2e-8)
assert np.max(np.abs(tracks['mix']-(base+tracks['park']+tracks['shutter']+tracks['steps'])))<5/32767
for k,x in tracks.items():wav(OUT/f'opening10-{k}.wav',x)

items=[
('mix','全部声音：前十秒原样','当前 V51 r2 的前十秒；相机与脚步已按上轮要求 +4 dB。这次没有再调整。'),
('base','① 旧底轨整体','包括旧开场环境／风叶、神社环境、自然鸟声与后段索道声；不是单一声源。先判断吵声是否来自这里。'),
('park','② 新加公园氛围｜0–2.8 秒','东京黄昏公园录音，素材描述含远处人声、树叶风、鸟与交通。不是纯人声；当前片段中各声源是否明显，仍需要听审辨认。'),
('shutter','③ 相机｜开场短尾音、2.1 秒','0–约0.06秒为上一轮快门尾音；2.1秒完整一次。保留当前 +4 dB 音量。'),
('steps','④ 新增脚步｜5.31、5.66、5.99 秒','两人过鸟居后的砂砾脚步；第三步尾音延续到约6.21秒。没有在红叶谷开头铺脚步。'),
('chime','⑤ 神社风铃｜约2.9–8.25秒','原 V38 自然多次铃响实录，按 V49 的提前0.4秒映射摆回当前时间。不是新加的手机提示音。此条为归档分轨重排参考，非从MP3无损提取。'),
('forest','⑥ 神社树林风｜2.8–9.5秒','旧版额外叠的风叶沙沙层；三段从原3.2、5.55、7.9秒移到当前2.8、5.15、7.5秒，尾音有交叠。此条为归档分轨重排参考。'),
('residual','⑦ 旧底剩余声音｜含开场风叶、原树林底音与索道','从旧底轨减去上面两条重排参考所得。约1.35–3秒旧风叶仍在这里；9.2秒起缆车周围空气底音、9.4秒起额外索道低鸣，9.75秒起第一小句远处鸟鸣也都留在这里。不是纯净独立声轨，可能保留MP3编码／重排差分，不将它标成单一鸟声或风声。')]
rows=[
('0–约0.06','旧开场底音＋公园氛围＋上一轮快门尾音'),
('约0.06–1.35','旧开场底音＋公园氛围'),
('约1.35–2.8','旧风叶段＋公园氛围；2.1秒相机快门'),
('2.8–约3.0','公园层结束；旧风叶切入神社环境，树林风开始，约2.9秒风铃起'),
('约3.0–5.31','原树林环境（其中可能有自然鸟声）＋额外树林风＋风铃'),
('5.31–约6.21','上述三层＋三次新增砂砾脚步及尾音'),
('约6.21–8.25','原树林环境＋额外树林风＋风铃'),
('约8.25–9.2','风铃结束；原树林环境＋额外树林风'),
('9.2–9.4','缆车周围空气底音进入，树林环境交叠'),
('9.4–9.5','旧索道低鸣开始，额外树林风收尾'),
('9.5–9.75','旧底轨的缆车／环境声音；额外树林风已结束'),
('9.75–10','缆车环境＋索道低鸣＋第一小句远处鸟鸣（后续超出本页十秒范围）')]
page='''<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>V51 前十秒声音全表</title><style>body{margin:0;background:#f4f0e7;color:#263c33;font:16px/1.7 system-ui,sans-serif}main{max-width:900px;margin:auto;padding:24px}h1{font-size:27px}h2{font-size:20px}section{background:#fffdf7;border:1px solid #d5d9cb;border-radius:12px;padding:18px;margin:16px 0}audio{width:100%}a{color:#24644d}table{width:100%;border-collapse:collapse}td,th{padding:10px;text-align:left;vertical-align:top;border-bottom:1px solid #d5d9cb}small{color:#59645f}</style><main><h1>V51 · 前十秒都有什么声音</h1><p><a href="../../yahiko-v51.html?mix=r2">返回当前动画</a></p><p><b>本次不调音量，只展示与拆解。</b>每条都在0–10秒同一时间轴、同成片增益，没有单独归一化。灰暗静默段是该轨尚未出现，请勿因此调高系统音量。</p><p>新增分轨是实际混音分轨；旧风铃与额外树林风用归档分轨重排供辨认，剩余旧底不能假称已完整分离。没有拉门、猫叫或海浪的新事件在这十秒内。</p><h2>按时间听</h2><table><tr><th>秒数</th><th>声音</th></tr>'''
page+=''.join('<tr><td>'+html.escape(t)+'</td><td>'+html.escape(s)+'</td></tr>' for t,s in rows)+'</table><h2>单独试听（一次只响一条）</h2>'
for k,title,note in items:
    page+=f'<section><h2>{html.escape(title)}</h2><p>{html.escape(note)}</p><audio controls preload="none" src="opening10-{k}.wav"></audio></section>'
page+='''<p>若吵的是铃声，告诉我“⑤风铃”；若是连续沙沙，先比较“⑥树林风”和“⑦旧底剩余”；若只在前2.8秒嘈杂，比较“②公园”与“①旧底”。</p></main><script>document.querySelectorAll('audio').forEach(a=>a.addEventListener('play',()=>document.querySelectorAll('audio').forEach(b=>{if(a!==b)b.pause()})));</script></html>'''
(OUT/'opening10.html').write_text(page,encoding='utf8')
(OUT/'opening10.json').write_text(json.dumps({'seconds':10,'gain_changed':False,'master_sha256':before,'timeline':rows,'reconstruction_note':'V38 archival wind/chime shifted -0.4s; remaining old bed is a residual, not clean original stems'},ensure_ascii=False,indent=2),encoding='utf8')
assert before==hashlib.sha256(master.read_bytes()).hexdigest()
assert page.count('<audio ')==8
print('PASS: eight 10-second audition tracks; reconstruction sums verified; master unchanged.')
