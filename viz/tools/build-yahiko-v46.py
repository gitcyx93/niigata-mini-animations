#!/usr/bin/env python3
"""Build viz/autumn/yahiko-v46.html from the V40 page plus viz/autumn/yahiko-v46-fx.js.
Usage: python3 viz/tools/build-yahiko-v46.py   (run from the repository root)"""
import pathlib
root=pathlib.Path(__file__).resolve().parents[2]
s=(root/'viz/autumn/yahiko-v40.html').read_text(encoding='utf8')
fx=(root/'viz/autumn/yahiko-v46-fx.js').read_text(encoding='utf8')
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
rep('data-time="17" data-legacy="0"><small>17 秒</small>红叶谷点灯','data-time="17.5" data-legacy="0"><small>17.5 秒</small>温泉街')
rep('data-time="21.6" data-legacy="13"><small>21.6 秒</small>温泉街','data-time="23.3" data-legacy="13"><small>23.3 秒</small>红叶谷点灯')
rep("新潟四季 · 秋 / V40 试作（无声）","新潟四季 · 秋 / V46 试作（无声）");rep("<title>弥彦｜V40 试作 · 夜景开场 · 无声循环</title>","<title>弥彦 V46 试作</title>")
rep("'弥彦 V40 试作 · 无声 · '","'弥彦 V46 试作 · 无声 · '");rep("update(13.0);playing=true","update(12.6);playing=true")
(root/'viz/autumn/yahiko-v46.html').write_text(s,encoding='utf8');print('built',len(s))
