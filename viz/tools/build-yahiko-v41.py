#!/usr/bin/env python3
"""Build viz/autumn/yahiko-v41.html from the V40 page plus viz/autumn/yahiko-v41-fx.js.
Usage: python3 viz/tools/build-yahiko-v41.py   (run from the repository root)"""
import pathlib
root=pathlib.Path(__file__).resolve().parents[2]
s=(root/'viz/autumn/yahiko-v40.html').read_text(encoding='utf8')
fx=(root/'viz/autumn/yahiko-v41-fx.js').read_text(encoding='utf8')
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(a[:80],s.count(a));s=s.replace(a,b)
# new frame function and everything it needs replaces the V40 render()
i=s.index("function render(N){");j=s.index("// Accessible playback controls");s=s[:i]+fx+"\n"+s[j:]
rep("function duration(){return NEW_DUR;}","function duration(){return 24.0;}")
# ropeway shot no longer hands over to the old summit set; the summit is its own shot after a cut
rep("const ASTAGE_OUT=[13.85,.45],ASTAGE_IN=[14.0,.6];","const ASTAGE_OUT=[99,.45],ASTAGE_IN=[99,.6];")
rep("morningLight(b,a);toriiGroundLeaves(b);b.restore();","morningLight(b,a);toriiGroundLeaves(b);toriiWalker41(b,a);b.restore();")
# --- torii cedars: uneven spacing, a few very old thick trunks, slight leans
rep("for(let i=0;i<20;i++){const side=i%2?1:-1,X=TOX+side*(3.2+rnd(i,3011)*9),Z=TOZ+3+rnd(i,3012)*22;trunks.push([Z,X,.55+rnd(i,3013)*.45,i]);}",
    "for(let i=0;i<27;i++){const side=rnd(i,3016)<.5?1:-1,X=TOX+side*(3.0+Math.pow(rnd(i,3011),1.25)*11.5),Z=TOZ+2.5+rnd(i,3012)*26;trunks.push([Z,X,.3+Math.pow(rnd(i,3013),2.2)*1.0,i]);}")
rep("const L0=TP(X-r*1.25,0,Z),R0=TP(X+r*1.25,0,Z),L1=TP(X-r,1.4,Z),R1=TP(X+r,1.4,Z),L2=TP(X-r*.3,140,Z),R2=TP(X+r*.3,140,Z);",
    "const ln=(rnd(i,3015)-.5)*8,flare=1.2+rnd(i,3017)*.35;const L0=TP(X-r*flare,0,Z),R0=TP(X+r*flare,0,Z),L1=TP(X-r,1.4,Z),R1=TP(X+r,1.4,Z),L2=TP(X+ln-r*.3,140,Z),R2=TP(X+ln+r*.3,140,Z);")
rep("a1=TP(X+(-r+2*r*u)*.3,140,Z);","a1=TP(X+ln+(-r+2*r*u)*.3,140,Z);")
rep("const Y=13+k*7+rnd(i*7+k,3041)*4,[x,y]=TP(X,Y,Z);","const Y=9+k*7.5+rnd(i*7+k,3041)*7,[x,y]=TP(X+ln*Y/140,Y,Z);")
# --- shrine forest: height and tone vary in patches, thin mist between rows
rep("d=clamp((y-950)/1000),h=(60+d*230)*(.7+rnd(i,1183)*.6);",
    "d=clamp((y-950)/1000),h=(60+d*230)*(.7+rnd(i,1183)*.6)*(.74+.5*(.5+.5*Math.sin(x*.011+y*.007)*Math.cos(y*.013-x*.004)))*(rnd(i,1186)<.06?1.42:1);")
rep("pal=P3[i%4].map(c=>blendTone(c,'#6d8977',air));","pal=P3[Math.floor(fract(.5+.5*Math.sin(x*.006+1.3)*Math.cos(y*.008)+rnd(i,1187)*.35)*4)].map(c=>blendTone(c,'#6d8977',air));")
rep("  for(let i=0;i<0;i++){   // v12：",
    "  for(const [yy,al] of [[1190,.15],[1390,.12],[1610,.09]])tr.push({y:yy,draw:b=>{const q=b.createLinearGradient(0,yy-150,0,yy+10);q.addColorStop(0,'rgba(150,180,160,0)');q.addColorStop(.75,`rgba(150,180,160,${al})`);q.addColorStop(1,'rgba(150,180,160,0)');b.fillStyle=q;b.fillRect(0,yy-150,W,160);}});   // v41：树行之间的薄雾\n  for(let i=0;i<0;i++){   // v12：")
# --- page chrome
rep('data-time="3.2" data-legacy="4"><small>3.2 秒','data-time="2.4" data-legacy="4"><small>2.4 秒')
rep('data-time="6.4" data-legacy="8"><small>6.4 秒','data-time="5.4" data-legacy="8"><small>5.4 秒')
rep('data-time="9.8" data-legacy="8"><small>9.8 秒','data-time="8.2" data-legacy="8"><small>8.2 秒')
rep('data-time="13" data-legacy="13"><small>13 秒','data-time="11" data-legacy="13"><small>11 秒')
rep('data-time="17" data-legacy="0"><small>17 秒</small>红叶谷点灯','data-time="15" data-legacy="0"><small>15 秒</small>温泉街')
rep('data-time="21.6" data-legacy="13"><small>21.6 秒</small>温泉街','data-time="19.6" data-legacy="13"><small>19.6 秒</small>红叶谷点灯')
rep("新潟四季 · 秋 / V40 试作（无声）","新潟四季 · 秋 / V41 试作（无声）");rep("<title>弥彦｜V40 试作 · 夜景开场 · 无声循环</title>","<title>弥彦｜V41 试作 · 无声循环</title>")
rep("'弥彦 V40 试作 · 无声 · '","'弥彦 V41 试作 · 无声 · '");rep("update(13.0);playing=true","update(11);playing=true")
(root/'viz/autumn/yahiko-v41.html').write_text(s,encoding='utf8');print('built',len(s))
