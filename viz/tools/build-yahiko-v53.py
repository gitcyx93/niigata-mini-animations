"""Package the approved B/Reverie mix; only chime -2dB and two text positions change."""
from pathlib import Path
import argparse,base64,hashlib,json,re,subprocess
import numpy as np
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'viz/autumn/audio/yahiko-v53';OUT.mkdir(parents=True,exist_ok=True);(OUT/'stems').mkdir(exist_ok=True)
SR=32000;N=899200
parser=argparse.ArgumentParser();parser.add_argument('--import-approved',type=Path,help='Local audio-tools-trial directory; one-time import of approved stems');args=parser.parse_args()
def run(cmd,raw=None):return subprocess.run(cmd,input=raw,capture_output=True,check=True).stdout
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def pcm(p):
 x=np.frombuffer(run(['ffmpeg','-v','error','-i',str(p),'-ar',str(SR),'-ac','2','-f','s16le','pipe:1']),'<i2').reshape(-1,2).copy();assert x.shape==(N,2);return x
def flac(p,x):
 assert np.max(np.abs(x.astype(np.int32)))<32767
 if p.exists():assert np.array_equal(pcm(p),x),'Existing asset differs: '+str(p);return
 run(['ffmpeg','-v','error','-n','-f','s16le','-ar',str(SR),'-ac','2','-i','pipe:0','-c:a','flac',str(p)],x.astype('<i2').tobytes())
if args.import_approved:
 home=args.import_approved;approved=home/'reverie-mix-r5/master.wav';old_chime=home/'full-remix/stems/chime.wav';music=home/'reverie-mix-r5/music.wav'
 source_hashes={p.name:sha(p) for p in [approved,old_chime,music]};mixed=pcm(approved);original=pcm(old_chime)
 locked=mixed.astype(np.int32)-original.astype(np.int32);assert np.abs(locked).max()<32767
 flac(OUT/'locked-other.flac',locked.astype(np.int16));flac(OUT/'original-chime.flac',original)
 files={key:home/'full-remix/stems'/f'{key}.wav' for key in ['breeze','leaves','birds','sea','water','window','door','shutter']}
 files.update(steps=home/'footsteps-r2/steps.wav',ropeway=home/'rope-cat-r3/ropeway.wav',cat=home/'rope-cat-r3/cat.wav',music=music)
 for key,p in files.items():flac(OUT/'stems'/f'{key}.flac',pcm(p))
 for p in [approved,old_chime,music]:assert sha(p)==source_hashes[p.name]
 (OUT/'approved-source-hashes.json').write_text(json.dumps({'approved_mix_sha256':source_hashes['master.wav'],'original_chime_sha256':source_hashes['chime.wav'],'approved_music_sha256':source_hashes['music.wav'],'description':'Approved B footsteps revision, replacement ropeway/cat, Reverie music-only integration. No local usernames or credentials recorded.'},indent=2),encoding='utf8')
locked=pcm(OUT/'locked-other.flac').astype(np.int32);original=pcm(OUT/'original-chime.flac');gain=10**(-2/20);chime=np.rint(original.astype(float)*gain).astype(np.int16)
master=locked+chime.astype(np.int32);assert np.abs(master).max()<32767;master=master.astype(np.int16)
assert np.array_equal(master.astype(np.int32)-chime.astype(np.int32),locked)
assert np.array_equal(master[~np.any(original,axis=1)].astype(np.int32),locked[~np.any(original,axis=1)])
measured_db=20*np.log10(np.sqrt(np.mean(chime.astype(float)**2))/np.sqrt(np.mean(original.astype(float)**2)));assert abs(measured_db+2)<.01
flac(OUT/'stems/chime.flac',chime);flac(OUT/'master.flac',master)
if not (OUT/'master.mp3').exists():run(['ffmpeg','-v','error','-n','-i',str(OUT/'master.flac'),'-c:a','libmp3lame','-b:a','192k',str(OUT/'master.mp3')])
oldfx=(ROOT/'viz/autumn/yahiko-v50-fx.js').read_text(encoding='utf8');fx=(ROOT/'viz/autumn/yahiko-v53-fx.js').read_text(encoding='utf8')
expected=oldfx.replace("[V41.TOWN0,0,'不赶时间的话，住一晚再走吧。']","[V41.TOWN0,0,'有的旅馆 已经开了 300 多年']").replace("headlineC(sc41(N,18.2,21.9),[['神社出来 是',0],['温泉小镇',1]],'有的旅馆 已经开了 300 多年');","headlineC(sc41(N,18.2,21.9),[['神社出来 是',0],['温泉小镇',1]],'不赶时间的话，住一晚再走吧。');")
assert fx==expected,'Visual code changed beyond the two requested strings'
page=(ROOT/'viz/autumn/yahiko-v52.html').read_text(encoding='utf8');assert page.count(oldfx)==1;page=page.replace(oldfx,fx,1)
page=page.replace('弥彦 V52 · 轻微风版','弥彦 V53 · 中文发布版').replace('audio/yahiko-v52/','audio/yahiko-v53/')
page,n=re.subn(r'(<script id="yahiko-audio-data"[^>]*>).*?(</script>)',lambda m:m[1]+'data:audio/mpeg;base64,'+base64.b64encode((OUT/'master.mp3').read_bytes()).decode()+m[2],page,count=1,flags=re.S);assert n==1
config={'duration_seconds':28.1,'name':'Yahiko V53 Chinese release; approved B mix with Reverie, chime -2dB','music':'Reverie — Scott Buckley, CC BY 4.0','sample_rate':SR}
page,n=re.subn(r'(<script id="yahiko-sound-config"[^>]*>).*?(</script>)',lambda m:m[1]+json.dumps(config,ensure_ascii=False)+m[2],page,count=1,flags=re.S);assert n==1
page=page.replace("document.title += ' · 环境音';","document.title += ' · 音效与配乐';")
page=page.replace("note.textContent = '试作：V38 的环境音按画面里发生的事重新排过（没有新录的声音）。点击画面有声播放。';","note.textContent = '中文发布版：已认可的B式音效与Reverie配乐，风铃轻降2dB。温泉街两句文字已互换位置，其他画面与声音保持。';")
credits='音乐：Reverie — Scott Buckley · CC BY 4.0；海声：Luftrum · CC BY 3.0。其余采用CC0或公有领域素材。<a href="audio/yahiko-v53/LICENSES.md" target="_blank" rel="noopener">完整来源、署名与改动说明</a>'
page,n=re.subn(r"credits\.innerHTML='.*?';",lambda m:'credits.innerHTML='+json.dumps(credits,ensure_ascii=False)+';',page,count=1);assert n==1
sheet='<summary>V53 · 全部音轨与发布记录</summary><p>28.1秒；只降低风铃2dB，音乐避让包络、脚步、索道、猫叫等均保留已认可版本。</p><div id="solo-buttons" style="display:flex;gap:5px;flex-wrap:wrap"></div><table style="width:100%;text-align:left;font-size:12px;line-height:1.8"><tbody><tr><td>全片</td><td>微风与Reverie配乐，音乐保持已认可电平及避让</td></tr><tr><td>3.1–8.45秒</td><td>连续风铃，-2dB</td></tr><tr><td>9.35–12.65秒</td><td>索道机械拟音</td></tr><tr><td>18.5–19.4秒 / 19.85秒</td><td>木滑门 / 短猫叫</td></tr><tr><td>17–22.3秒</td><td>上方：有的旅馆 已经开了 300 多年；下方：不赶时间的话，住一晚再走吧。</td></tr></tbody></table>'
page,n=re.subn(r'sheet\.innerHTML=.*?;\n',lambda m:'sheet.innerHTML='+json.dumps(sheet,ensure_ascii=False)+';\n',page,count=1);assert n==1
old="[['微风','breeze.wav'],['风铃','chime.wav'],['拉门','door.wav'],['快门','shutter.wav'],['脚步','steps.wav'],['温泉街细节','town-details.wav']]"
new=[[label,'stems/'+key+'.flac'] for label,key in [('微风','breeze'),('叶片','leaves'),('风铃 -2dB','chime'),('鸟鸣','birds'),('索道','ropeway'),('海声','sea'),('水声','water'),('窗框','window'),('拉门','door'),('快门','shutter'),('脚步','steps'),('猫叫','cat'),('Reverie配乐','music')]]
assert old in page;page=page.replace(old,json.dumps(new,ensure_ascii=False))
page=page.replace('播放中 · 环境音，无背景音乐。','播放中 · 音效与Reverie配乐。').replace('环境音播放音量','混音播放音量')
(ROOT/'viz/autumn/yahiko-v53-zh.html').write_text(page,encoding='utf8')
report={'version':'V53 Chinese release','duration':28.1,'sample_rate':SR,'chime_gain_db':-2,'chime_measured_db':float(measured_db),'music_frozen':True,'other_audio_pcm_frozen':True,'master_pcm_sha256':hashlib.sha256(master.astype('<i2').tobytes()).hexdigest(),'text_changes':{'top':'有的旅馆 已经开了 300 多年','subtitle':'不赶时间的话，住一晚再走吧。'},'checks':['exact non-chime integer PCM residual retained','chime level verified within 0.01dB','visual FX unchanged except two strings','13 current stems retained as lossless FLAC'],'notes':'Master is authoritative; summing independently quantized historical stems may differ by a few LSB. No remix or music re-ducking after chime adjustment.'}
(OUT/'mix.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(report,ensure_ascii=False,indent=2))
