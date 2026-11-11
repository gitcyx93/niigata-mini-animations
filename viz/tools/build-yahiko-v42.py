#!/usr/bin/env python3
"""Build viz/autumn/yahiko-v42.html from the V39 page (V38 timeline, transitions and sound)
plus viz/autumn/yahiko-v42-fx.js.  Usage: python3 viz/tools/build-yahiko-v42.py  (repository root)"""
import pathlib
root=pathlib.Path(__file__).resolve().parents[2]
s=(root/'viz/autumn/yahiko-v39.html').read_text(encoding='utf8')
fx=(root/'viz/autumn/yahiko-v42-fx.js').read_text(encoding='utf8')
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(a[:80],s.count(a));s=s.replace(a,b)
j=s.index("// Accessible playback controls");s=s[:j]+fx+"\n"+s[j:]
# back to the original torii push so the hall at the end of the path still matches the next shot
rep("const a=t-TOR0,z=1.035+.05*a;","const a=t-TOR0,z=1.035+.014*a;")
rep("morningLight(b,a);toriiGroundLeaves(b);b.restore();","morningLight(b,a);toriiGroundLeaves(b);torii42(b,a);b.restore();")
# foot bath: nobody sits there any more, so no ripples from feet
rep("for(let k=0;k<3;k++){\n  const u=fract(a*.35+k/3),foot=townFeet(","for(let k=0;k<0;k++){\n  const u=fract(a*.35+k/3),foot=townFeet(")
# lights-on: same three waves, a little further apart and each one eased in, so it reads as lamps coming on
rep("  [2.6,lightMask(","  [2.5,lightMask(");rep("  [2.74,lightMask(","  [2.86,lightMask(");rep("  [2.88,lightMask(","  [3.22,lightMask(")
rep("maskInto(u,t0=>easeOut(clamp((t-t0)/.12)));","maskInto(u,t0=>easeOut(clamp((t-t0)/.34)));")
rep("end=LIGHTS[2][0]+.3;","end=LIGHTS[2][0]+.5;")
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
    "  for(const [yy,al] of [[1190,.15],[1390,.12],[1610,.09]])tr.push({y:yy,draw:b=>{const q=b.createLinearGradient(0,yy-150,0,yy+10);q.addColorStop(0,'rgba(150,180,160,0)');q.addColorStop(.75,`rgba(150,180,160,${al})`);q.addColorStop(1,'rgba(150,180,160,0)');b.fillStyle=q;b.fillRect(0,yy-150,W,160);}});\n  for(let i=0;i<0;i++){   // v12：")
rep("新潟四季 · 秋 / V39 试作","新潟四季 · 秋 / V42 试作");rep("<title>弥彦｜V39 试作 · 风过红叶 · 有声循环</title>","<title>弥彦 V42 试作</title>")
rep("'弥彦 V39 试作 · 环境音与猫叫 · 27.8 秒'","'弥彦 V42 试作 · 环境音与猫叫 · 27.8 秒'")
(root/'viz/autumn/yahiko-v42.html').write_text(s,encoding='utf8');print('built',len(s))
