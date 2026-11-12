#!/usr/bin/env python3
"""Build viz/autumn/yahiko-v49.html from the V40 page plus viz/autumn/yahiko-v49-fx.js.
Usage: python3 viz/tools/build-yahiko-v49.py   (run from the repository root)"""
import pathlib
root=pathlib.Path(__file__).resolve().parents[2]
s=(root/'viz/autumn/yahiko-v40.html').read_text(encoding='utf8')
fx=(root/'viz/autumn/yahiko-v49-fx.js').read_text(encoding='utf8')
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(a[:80],s.count(a));s=s.replace(a,b)
# new frame function and everything it needs replaces the V40 render()
i=s.index("function render(N){");j=s.index("// Accessible playback controls");s=s[:i]+fx+"\n"+s[j:]
rep("function duration(){return NEW_DUR;}","function duration(){return 28.1;}")
rep("morningLight(b,a);toriiGroundLeaves(b);b.restore();","morningLight(b,a);toriiGroundLeaves(b);torii42(b,a);b.restore();")
rep("for(let k=0;k<3;k++){\n  const u=fract(a*.35+k/3),foot=townFeet(","for(let k=0;k<0;k++){\n  const u=fract(a*.35+k/3),foot=townFeet(")   # 足汤边不再坐人，也就没有脚拨出的水纹
# --- page chrome
rep('data-time="3.2" data-legacy="4"><small>3.2 秒','data-time="2.8" data-legacy="4"><small>2.8 秒')
rep('data-time="6.4" data-legacy="8"><small>6.4 秒','data-time="6" data-legacy="8"><small>6.0 秒')
rep('data-time="9.8" data-legacy="8"><small>9.8 秒','data-time="9" data-legacy="8"><small>9.0 秒')
rep('data-time="13" data-legacy="13"><small>13 秒','data-time="12.6" data-legacy="13"><small>12.6 秒')
rep('data-time="17" data-legacy="0"><small>17 秒</small>红叶谷点灯','data-time="17" data-legacy="0"><small>17 秒</small>温泉街')
rep('data-time="21.6" data-legacy="13"><small>21.6 秒</small>温泉街','data-time="22.3" data-legacy="13"><small>22.3 秒</small>红叶谷点灯')
rep("新潟四季 · 秋 / V40 试作","新潟四季 · 秋 / V49 试作");rep("<title>弥彦｜V40 试作 · 夜景开场 · 无声循环</title>","<title>弥彦 V49 试作</title>")
rep("'弥彦 V40 试作 · 无声 · '","'弥彦 V49 试作 · '");rep("update(13.0);playing=true","update(12.6);playing=true")
# --- 字不带阴影：左上角主标题的投影也去掉（金属浮雕本身保留）
rep("  g.drawImage(titleShadow(), X, Y);\n","")
# --- 声音：V38 母带按新顺序重剪（viz/autumn/audio/yahiko-v49/master.mp3），用 V39 页面里原来的声音控制器；音频直接内嵌，单个文件就能播
import base64
v39=(root/'viz/autumn/yahiko-v39.html').read_text(encoding='utf8')
a=v39.index('<script id="yahiko-sound-config"');b=v39.index('</body>',a);snd=v39[a:b]
def srep(x,y):
    global snd
    assert snd.count(x)==1,(x[:60],snd.count(x));snd=snd.replace(x,y)
srep('"duration_seconds":27.8','"duration_seconds":28.1');srep('"name":"Yahiko V38 ambience-only release"','"name":"Yahiko V49 trial, V38 ambience re-cut to the new shot order"')
srep('audio/yahiko-v38/master.wav','data:audio/mpeg;base64,'+base64.b64encode((root/'viz/autumn/audio/yahiko-v49/master.mp3').read_bytes()).decode())
srep('正式发布版：无配乐，原远处鸟鸣延续到温泉街。海浪、风铃、猫叫、窗框与循环风叶保留；点击有声播放。','试作：V38 的环境音按画面里发生的事重新排过（没有新录的声音）。点击画面有声播放。')
i=s.rindex('</body>');s=s[:i]+snd+s[i:]
(root/'viz/autumn/yahiko-v49.html').write_text(s,encoding='utf8');print('built',len(s))
