// ======== 弥彦 V43：去掉开场地图的镜头顺序 + 原来的日月主线和换景方式 ========
// 由 viz/tools/build-yahiko-v43.py 内嵌进 yahiko-v43.html；不要直接改 HTML 里的这一段。
// 时间轴 N（秒，28.1 循环）。全片是同一对两个人的一天：
//   0–2.8    亮灯的红叶谷（封面，是片尾那一镜的延续；两人相拥）。一阵风，叶子吹过切点——
//   2.8–6.0  一之鸟居（早晨的太阳在左边林子后面）
//   6.0–12.6 林中拜殿 → 缆车（太阳从天上往左下走；缆车的景沉下去，山顶的景从下面升上来，天和太阳不断）
//   12.6–16.6 山顶观景台（两人拍照，手机闪光；太阳落进左边的海）
//   16.6–17.5 天黑，月亮从右边海上升起
//   17.5–23.3 山顶的景沉下去，温泉街升上来（月亮接着走）；两人走进旅馆。一阵风，叶子吹过切点——
//   23.3–28.1 温泉街沉下去，还没亮灯的红叶谷升上来；两人走上桥，三段点灯，相拥，亮着接回开头
const V41={DUR:28.1,COVER:2.8,TORII:6.0,SUMMIT0:12.6,DUSK0:16.6,TOWN0:17.5,VALLEY0:23.3,VLEN:4.8,RISE:.9,TOWN_LEN:5.8};
const DUR42=V41.DUR,v41Round=x=>Math.round(x*1e9)/1e9;
// ---------------- 叶片画法：一张平的枫叶，按朝向压扁、翻面；不再用折面三角 ----------------
const LEAF41_LOBES=[[0,1],[40,.95],[-40,.95],[80,.74],[-80,.74],[124,.44],[-124,.44]];
const LEAF41_OUTLINE=(()=>{                       // 七裂、裂片细长带齿（单位半径 1，叶柄接点在原点，主裂片朝上）
  const order=[-124,-80,-40,0,40,80,124],len={0:1,40:.95,80:.74,124:.44},pts=[];
  const lobe=[[.30,-.105],[.44,-.15],[.5,-.115],[.62,-.135],[.7,-.085],[.8,-.092],[1,0],[.8,.092],[.7,.085],[.62,.135],[.5,.115],[.44,.15],[.30,.105]];
  order.forEach((deg,k)=>{const a=deg*Math.PI/180,L=len[Math.abs(deg)],ux=Math.sin(a),uy=-Math.cos(a),px=Math.cos(a),py=Math.sin(a);
    if(k>0){const m=(order[k-1]+deg)/2*Math.PI/180,r=.2+.05*(k%2);pts.push([Math.sin(m)*r,-Math.cos(m)*r]);}   // 裂片之间的缺口
    for(const [d,w] of lobe)pts.push([ux*d*L+px*w*L*(.8+.2*L),uy*d*L+py*w*L*(.8+.2*L)]);});
  pts.push([.05,.1],[0,.13],[-.05,.1]);
  return pts;})();
const leaf41Cache=new Map();
function leaf41Sprite(rgb,back,dim){
  const key=rgb.join(',')+(back?'b':'f')+(dim?'d':'');let s=leaf41Cache.get(key);if(s)return s;
  let c=rgb.slice();if(back)c=c.map((v,i)=>v*.66+[206,160,118][i]*.3);if(dim)c=c.map((v,i)=>v*.3+[26,34,58][i]*.5);
  const col=(k,a=1)=>`rgba(${c.map(v=>Math.max(0,Math.min(255,Math.round(v*k)))).join(',')},${a})`;
  s=layer(b=>{b.translate(128,132);const R=112;
    const path=()=>{b.beginPath();LEAF41_OUTLINE.forEach(([x,y],i)=>b[i?'lineTo':'moveTo'](x*R,y*R));b.closePath();};
    path();const q=b.createRadialGradient(0,-R*.1,R*.08,0,-R*.15,R*1.02);q.addColorStop(0,col(back?.9:.8));q.addColorStop(.55,col(1));q.addColorStop(1,col(back?1.06:1.16));
    b.fillStyle=q;b.lineJoin='round';b.fill();b.strokeStyle=col(.62,.8);b.lineWidth=1.6;b.stroke();
    // 一侧稍暗：叶面微微鼓起，不是对折
    b.save();path();b.clip();const sh=b.createLinearGradient(-R,0,R,0);sh.addColorStop(0,'rgba(20,6,4,.20)');sh.addColorStop(.5,'rgba(20,6,4,0)');sh.addColorStop(1,'rgba(255,236,200,.10)');b.fillStyle=sh;b.fillRect(-R*1.2,-R*1.2,R*2.4,R*2.4);b.restore();
    // 叶脉：每个裂片一条主脉，两侧几条细侧脉
    b.lineCap='round';
    for(const [deg,L] of LEAF41_LOBES){const a=deg*Math.PI/180,ux=Math.sin(a),uy=-Math.cos(a);
      b.strokeStyle=back?col(.58,.75):`rgba(255,214,150,${dim?.22:.5})`;b.lineWidth=back?2.1:1.7;b.beginPath();b.moveTo(0,R*.04);b.quadraticCurveTo(ux*R*L*.5+uy*4,uy*R*L*.5-ux*4,ux*R*L*.93,uy*R*L*.93);b.stroke();
      b.lineWidth=.8;for(const d of [.38,.56,.72])for(const sd of [-1,1]){const bx=ux*R*L*d,by=uy*R*L*d,ex=bx+(ux*.09+Math.cos(a)*sd*.1)*R*L,ey=by+(uy*.09+Math.sin(a)*sd*.1)*R*L;b.beginPath();b.moveTo(bx,by);b.lineTo(ex,ey);b.stroke();}}
    b.strokeStyle=col(.5);b.lineWidth=3;b.beginPath();b.moveTo(0,R*.1);b.quadraticCurveTo(R*.02,R*.33,R*.1,R*.5);b.stroke();   // 叶柄
  },256,256,1.5);
  leaf41Cache.set(key,s);return s;
}
const LEAF41_RGB=reds.map(hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)));
// o：x,y 位置；r 半径；rz 屏幕内的倾斜；tilt 绕横轴的俯仰（0 正对、π/2 侧对、过了就是叶背）；r0 叶片自身的朝向；dim 0..1 没亮灯时压暗
function leaf41(b,o){
  const rgb=o.rgb||LEAF41_RGB[o.color??4],ct=Math.cos(o.tilt),back=ct<0,sy=Math.max(.11,Math.abs(ct)),a=o.alpha??1;if(a<=.01)return;
  b.save();b.translate(o.x,o.y);b.rotate(o.rz||0);b.scale(1,sy);b.rotate(o.r0||0);const s=o.r/112,d=o.dim||0;
  if(d<1){b.globalAlpha=a;b.drawImage(leaf41Sprite(rgb,back,false),-128*s,-132*s,256*s,256*s);}
  if(d>0){b.globalAlpha=a*d;b.drawImage(leaf41Sprite(rgb,back,true),-128*s,-132*s,256*s,256*s);}
  b.restore();
}

// ---------------- 飘落：左右荡着往下掉；荡到两头慢、过中间快；风大了才翻滚着被带走 ----------------
// 每片叶子从出生起按 1/60 秒积分一次并缓存；之后每帧只查表，所以倒着拖时间轴也一样。
const pulse41=(x,rise,decay)=>x<=0?0:x<rise?ease(x/rise):Math.exp(-(x-rise)/decay);
function gust41(G){return (x,y,t)=>{let wx=0,wy=0;
  for(const g of G){const k=g.U*pulse41(t-g.t0-(x+200)/g.c,g.rise||.3,g.decay||.9);wx+=k;wy+=k*(g.up??-.16);}
  // 平时也有一点不规则的气流
  wx+=22*Math.sin(t*.9+y*.004)+14*Math.sin(t*2.3+x*.006+1.7);wy+=10*Math.sin(t*1.4+x*.005+.6);return [wx,wy];};}
function sim41(o){   // o:{x,y,born,size,seed,wind,life,vx0,near,land(x,y,st)->null|{...}}
  const dt=1/60,n=Math.ceil((o.life||8)/dt),P=new Float32Array(n*5),r=k=>rnd(o.seed,4100+k),near=o.near||1;
  let x=o.x,y=o.y,psi=r(1)*TAU,vxw=o.vx0||0,vyw=o.vy0||0,tum=0,spin=r(2)*TAU,rest=null,restAt=-1;
  const A=(18+o.size*1.5)*(.7+r(3)*.6),wf=(3.3-Math.min(1.5,o.size*.035))*(.8+r(4)*.4),vt=(64+o.size*2.6)*(.8+r(5)*.4)*near,base=.5+r(6)*.62,relax=1/(.16+o.size*.007);
  for(let i=0;i<n;i++){const t=o.born+i*dt;
    if(!rest||(o.release!=null&&t>=o.release)){
      if(rest){rest=null;vyw=-70;psi=Math.PI/2;}                                       // 被风掀起来
      const [wx,wy]=o.wind?o.wind(x,y,t):[0,0],s=Math.hypot(wx,wy)*near,calm=1/(1+s/170);
      vxw+=(wx*near*.9-vxw)*relax*dt;vyw+=(wy*near*.9-vyw)*relax*dt;
      psi+=wf*(1+s/420)*dt;const c=Math.cos(psi);
      x+=(A*wf*c*calm+vxw)*dt;y+=(vt*(.28+.72*c*c)*(.4+.6*calm)+vyw-s*.1*Math.abs(Math.sin(tum)))*dt;
      tum+=(s/75)*dt;spin+=(.25+s/260)*dt*(r(7)>.5?1:-1);
      if(o.land&&(o.release==null||t<o.release)){const L=o.land(x,y,o,t);if(L){if(L.slide){x+=L.slide*dt;y=L.y;}else if(L.bounce){x-=(A*wf*c*calm+vxw)*dt*2;psi+=Math.PI;}else{rest=L;restAt=t;x=L.x;y=L.y;}}}
      const k=i*5;P[k]=x;P[k+1]=y;P[k+2]=rest?(rest.rz||0):-.42*c*calm+.25*Math.sin(tum*.5);P[k+3]=rest?rest.tilt:base+.32*Math.sin(psi)*calm+tum;P[k+4]=spin;
    }else{const k=i*5;P[k]=rest.x;P[k+1]=rest.y;P[k+2]=rest.rz||0;P[k+3]=rest.tilt;P[k+4]=spin;}
  }
  return {P,n,restAt,rested:restAt>=0};
}
function at41(L,age){   // 查表（线性插值）；返回 null 表示还没出生或寿命已到
  if(age<0)return null;const f=age*60,i=Math.floor(f);if(i>=L.sim.n-1)return null;const u=f-i,P=L.sim.P,k=i*5;
  return {x:P[k]+(P[k+5]-P[k])*u,y:P[k+1]+(P[k+6]-P[k+1])*u,rz:P[k+2]+(P[k+7]-P[k+2])*u,tilt:P[k+3]+(P[k+8]-P[k+3])*u,r0:P[k+4]+(P[k+9]-P[k+4])*u,resting:L.sim.restAt>=0&&L.o.born+age>=L.sim.restAt&&(L.o.release==null||L.o.born+age<L.o.release)};
}
const mk41=o=>({o,sim:sim41(o)});
function drawGroup41(b,group,clock,dim=0,clip=null){for(const L of group){const s=at41(L,clock-L.o.born);if(!s||s.x<-220||s.x>W+220||s.y<-220||s.y>H+220)continue;
  const fade=Math.min(1,(clock-L.o.born)*5);leaf41(b,{x:s.x,y:s.y,r:L.o.size,rz:s.rz,tilt:s.tilt,r0:s.r0,color:L.o.color,rgb:L.o.rgb,alpha:fade*(L.o.alpha||1),dim});}}

// 旧的叶片入口都换成新画法（温泉街石板上、屋顶上的叶子仍用原来的落点和时间）
flyingLeaf=function(b,x,y,size,spin,color,alpha=1){leaf41(b,{x,y,r:size*1.05,rz:spin*.28+.25*Math.sin(spin*.9),tilt:.55+.5*Math.sin(spin*.71+color*.9)+(size<16?spin*.35:0),r0:spin*.2+color,color,alpha});};
const drawTownPhysicalLeafV31_shadowOnly=drawTownPhysicalLeafV31;
drawTownPhysicalLeafV31=function(b,s){const opacity=s.alpha*s.morph;
  if(s.height!==null&&s.height<280){b.save();b.globalAlpha=opacity;b.translate(s.ground.x,s.ground.y+3);b.rotate(.1);b.scale(1,.24);const radius=s.size*.95+s.height*.1,q=b.createRadialGradient(0,0,1,0,0,radius);q.addColorStop(0,`rgba(3,8,10,${.32*Math.exp(-s.height/95)})`);q.addColorStop(1,'rgba(3,8,10,0)');b.fillStyle=q;b.beginPath();b.arc(0,0,radius,0,TAU);b.fill();b.restore();}
  leaf41(b,{x:s.x,y:s.y,r:s.size*1.08,rz:s.spin,tilt:s.pitch,r0:s.yaw*.6,rgb:s.base,alpha:opacity});};
// 林子里零星飘过的小叶子：不再匀速排队，而是一阵一阵、荡着走
let NO_DIR41=false;
const dir41=Array.from({length:14},(_,i)=>mk41({x:-60-rnd(i,4301)*200,y:300+rnd(i,4302)*800,born:rnd(i,4303)*5.5+(i%3)*.4,size:5+rnd(i,4304)*9,seed:4310+i,color:2+i%5,life:9,
  wind:gust41([{U:150,t0:.4,c:900,rise:.8,decay:2.5,up:-.05},{U:170,t0:3.4,c:900,rise:.8,decay:2.5,up:-.05}])}));
directionalLeaves=function(b,t,strength=1){if(NO_DIR41)return;const c=t%7;for(const L of dir41){const s=at41(L,c-L.o.born);if(s)leaf41(b,{x:s.x,y:s.y,r:L.o.size,rz:s.rz,tilt:s.tilt,r0:s.r0,color:L.o.color,alpha:strength*1.6*Math.min(1,(c-L.o.born)*3,(7-c)*2)});}};

// ---------------- 人物：平涂剪影（全片是同一对两个人）----------------
const person41C=layer(()=>{},120,130,3);
function person41(B,x,y,s,o){   // 先不透明地画在小画布上，再整体半透明贴上去：重叠的地方不会更黑；上深下浅，像被空气和地面的光托着
  const ph=o.ph||0,w=o.walk||0,arm=o.arm||0,bow=o.bow||0,col=o.col||[10,14,24],b=person41C.getContext('2d');
  b.setTransform(3,0,0,3,0,0);b.globalCompositeOperation='source-over';b.clearRect(0,0,120,130);
  b.save();b.translate(60,118);b.fillStyle='#000';b.strokeStyle='#000';b.lineCap='round';b.lineJoin='round';b.lineWidth=5.2;
  for(const sd of [-1,1]){const q=ph+(sd>0?0:Math.PI);
    if(o.back){const k=Math.sin(q)*w;b.beginPath();b.moveTo(sd*4.5,-30);b.lineTo(sd*5+k*1.5,-2-Math.max(0,k)*5);b.stroke();}
    else{const th=Math.sin(q)*.45*w,fx=Math.sin(th)*30,fy=-Math.max(0,Math.cos(q))*4*w;b.beginPath();b.moveTo(sd*2,-30);b.quadraticCurveTo(Math.sin(th)*15+3*w,-15,fx,-1+fy);b.lineTo(fx+5,-1+fy);b.stroke();}}
  b.save();b.translate(0,-30);if(o.back)b.scale(1,1-bow*.3);else b.rotate(bow*.75);b.translate(0,30);
  b.beginPath();b.moveTo(-8,-83);b.quadraticCurveTo(0,-88,8,-83);b.quadraticCurveTo(12,-80,11.5,-62);b.lineTo(12.5,-28);b.quadraticCurveTo(0,-24,-12.5,-28);b.lineTo(-11.5,-62);b.quadraticCurveTo(-12,-80,-8,-83);b.closePath();b.fill();
  if(o.robe){b.beginPath();b.moveTo(-12,-32);b.lineTo(-13.5,-6);b.lineTo(13.5,-6);b.lineTo(12,-32);b.closePath();b.fill();}
  b.beginPath();b.ellipse(o.back?0:2,-94,7,8.6,0,0,TAU);b.fill();
  b.lineWidth=4.6;const sw=Math.sin(ph+Math.PI)*.4*w;
  b.beginPath();b.moveTo(-9,-77);b.quadraticCurveTo(-13-sw*6,-60,-11-sw*14,-46);b.stroke();
  const ex=lerp(12+sw*6,20,arm),ey=lerp(-60,-84,arm),hx=lerp(11+sw*14,o.point?34:18,arm),hy=lerp(-46,o.point?-104:-100,arm);
  b.beginPath();b.moveTo(9,-77);b.quadraticCurveTo(ex,ey,hx,hy);b.stroke();b.restore();b.restore();
  b.setTransform(3,0,0,3,0,0);b.globalCompositeOperation='source-in';const q=b.createLinearGradient(0,10,0,120),lift=o.lift||[10,8,8];
  q.addColorStop(0,`rgb(${col.join(',')})`);q.addColorStop(1,`rgb(${col.map((v,i)=>Math.round(v+(lift[i]))).join(',')})`);b.fillStyle=q;b.fillRect(0,0,120,130);b.globalCompositeOperation='source-over';
  B.save();B.translate(x,y-Math.abs(Math.sin(ph))*1.8*w*s);B.scale(s*(o.back?1:(o.dir||1)),s);B.globalAlpha*=o.alpha??1;B.drawImage(person41C,-60,-118,120,130);
  if(o.phone&&arm>.6){B.globalAlpha=(arm-.6)/.4*.85;B.fillStyle='#d2e2ff';B.fillRect(hx-3,hy-9,7,11);}
  B.restore();
}
function flash41(b,x,y,f,s){b.save();b.globalCompositeOperation='lighter';glow(b,x,y,150*s*(.6+f),150*s*(.6+f),[255,250,236],.85*f);glow(b,x,y,34*s,34*s,[255,255,255],f);
  b.strokeStyle=`rgba(255,252,240,${f})`;b.lineCap='round';b.lineWidth=2.4*s;for(let k=0;k<4;k++){const a=k*Math.PI/4+.2,r=(46+70*(1-f))*s;b.beginPath();b.moveTo(x-Math.cos(a)*r,y-Math.sin(a)*r);b.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);b.stroke();}b.restore();}
// 鸟居：一个人靠参道左边走过来，在鸟居前停一下、鞠一躬，再走进去
// 桥上：两人走上桥，停在桥中间；桥上的灯一亮，抱在一起，一直抱到封面
const bridgeHug41=bridgeVisitors;
bridgeVisitors=function(b,t,reflection=false){
  const v=V41V,deck=x=>1090-Math.sin(clamp((x-70)/950)*Math.PI)*60;
  if(v>=3.15){const k=Math.sin(Math.PI*clamp((v-3.15)/.4))*.06;b.save();b.translate(588,1031);b.scale(1+k,1-k);b.translate(-588,-1031);bridgeHug41(b,t,reflection);b.restore();return;}
  const u=ease(clamp((v-.3)/2.0)),close=ease(clamp((v-2.8)/.35)),xA=lerp(330,600,u)-7*close,xB=lerp(303,573,u)+8*close,w=(u>0&&u<1?1:0)+close*.6;
  b.save();if(reflection){b.translate(0,1300);b.scale(1,-.92);b.translate(0,-1300);b.globalAlpha=.13;}
  person41(b,xB,deck(xB),1,{ph:xB*.15,walk:w,robe:true});person41(b,xA,deck(xA),1,{ph:xA*.15+1.3,walk:w,robe:true});
  if(!reflection){const lo=Math.floor(xB-34),hi=Math.ceil(xA+44);
    for(let k=0;k<3;k++){b.strokeStyle=NU?(k?'#24222e':'#2c2a36'):(k?'#ad4f3b':'#d77953');b.lineWidth=k?5:8;b.beginPath();for(let x=lo;x<=hi;x+=2)b[x===lo?'moveTo':'lineTo'](x,deck(x)-51+k*18);b.stroke();}
    for(let x=lo;x<=hi;x++){if((x-70)%48===0){b.fillStyle=NU?'#26242f':'#b3513e';b.fillRect(x-3.2,deck(x)-51,6.4,51);}}}
  b.restore();
};

// ---------------- 红叶谷（片尾 4.8 秒 + 封面 3 秒是同一镜，时钟 v = 0..7.8） ----------------
const camV41=v=>({z:1.04+.019*v,x:540+6*v,y:955-2.2*v});
let V41V=0;
const V41_LIGHT=[1.4,1.95,2.5],V41_RAMP=.55;               // 左岸、右岸、桥和中间：一段一段亮
const valleyLit41=v=>V41_LIGHT.map(t0=>ease(clamp((v-t0)/V41_RAMP)));
function valleyShot41(b,v){
  const lit=valleyLit41(v),vt=5.6+v;CAM_OVERRIDE=camV41(v);NIGHT_T=21.1+v*.25;NO_DIR41=true;V41V=v;
  const bump0=lit.map(a=>Math.sin(Math.PI*a)),kick=.014*(bump0[0]+bump0[1]+bump0[2]);b.save();b.translate(W/2,H/2);b.scale(1+kick,1+kick);b.translate(-W/2,-H/2);
  const idx=t0=>LIGHTS.findIndex(l=>l[0]===t0);
  valleyShot(b,vt,'reveal',false);
  if(lit[2]<1){
    // 刚亮的那一下，灯照到的地方多亮一点，再落回去
    const bump=lit.map(a=>Math.sin(Math.PI*a));
    if(bump.some(a=>a>.02)){const m=tintC.getContext('2d');m.setTransform(1,0,0,1,0,0);m.globalCompositeOperation='source-over';m.clearRect(0,0,W,H);
      maskInto(m,t0=>bump[idx(t0)]);m.globalCompositeOperation='source-in';m.drawImage(b.canvas,0,0,W,H);m.globalCompositeOperation='source-over';
      b.save();b.setTransform(1,0,0,1,0,0);b.globalCompositeOperation='lighter';b.globalAlpha=.62;b.drawImage(tintC,0,0,W,H);b.restore();}
    const u=unlitC.getContext('2d');u.setTransform(1,0,0,1,0,0);u.globalCompositeOperation='source-over';u.globalAlpha=1;u.clearRect(0,0,W,H);
    NU=true;valleyShot(u,vt,'reveal',false);NU=false;
    u.globalCompositeOperation='destination-out';maskInto(u,t0=>lit[idx(t0)]);u.globalCompositeOperation='source-over';
    b.save();b.setTransform(1,0,0,1,0,0);b.drawImage(unlitC,0,0,W,H);b.restore();
  }
  b.restore();
  if(lit[2]<1){b.save();b.setTransform(1,0,0,1,0,0);b.globalCompositeOperation='lighter';[[190,900],[900,900],[560,1040]].forEach(([x,y],i)=>glow(b,x,y,520,520,[255,170,96],.2*bump0[i]));b.restore();}
  CAM_OVERRIDE=null;NO_DIR41=false;
}
// 红叶谷里的叶子：平时零星地落，有的落到水面上漂着；封面时一阵风从左边过来，带走一批，其中一片从镜头前掠过
const VW41=gust41([{U:560,t0:6.3,c:1500,rise:.35,decay:1.05,up:-.2}]);
const valleyAmb41=Array.from({length:26},(_,i)=>{const r=k=>rnd(i,4400+k),q=r(1),size=q<.68?7+r(2)*6:q<.94?15+r(2)*9:30+r(2)*14,water=r(8)<.3&&size<26;
  return mk41({x:40+r(3)*1000,y:330+r(4)*520,born:-2+r(5)*8.2,size,seed:4420+i,color:2+i%5,wind:VW41,life:10,
    land:water?((x,y,o)=>y>=o.wy?{x,y:o.wy,tilt:1.32,rz:(rnd(o.seed,9)-.5)*.3}:null):null,wy:1345+r(9)*210});});
const valleyGust41=Array.from({length:18},(_,i)=>{const r=k=>rnd(i,4500+k),x=-40+r(1)*900;
  return mk41({x,y:360+r(2)*560,born:6.35+(x+200)/1500+r(3)*.35,size:9+r(4)*17,seed:4520+i,color:2+i%5,wind:VW41,life:5});});
const valleyHero41=mk41({x:-230,y:1330,born:6.3,size:150,seed:4599,rgb:[222,104,40],wind:gust41([{U:900,t0:6.1,c:1500,rise:.25,decay:2.2,up:-.4}]),near:1.7,life:4});   // 封面那阵风里，从镜头前掠过的一片大叶
function valleyLeaves41(b,v){
  const lit=valleyLit41(v),dim=1-(lit[0]+lit[1]+lit[2])/3;
  // 水面上的叶子跟着镜头一起动（它们在水面上，不在屏幕上）
  const c0=camV41(0),c=camV41(v);
  for(const L of valleyAmb41){const s=at41(L,v-L.o.born);if(!s)continue;let x=s.x,y=s.y;
    if(s.resting){const c1=camV41(L.sim.restAt),wx=c1.x+(x-540)/c1.z,wy=c1.y+(y-960)/c1.z,age=v-L.sim.restAt;x=540+(wx+age*5-c.x)*c.z;y=960+(wy-c.y)*c.z;
      if(age<1.6){b.save();b.strokeStyle=`rgba(226,198,160,${.34*(1-age/1.6)*(1-dim*.6)})`;b.lineWidth=1.3;for(const k of [0,.35]){const a2=age-k;if(a2>0){b.beginPath();b.ellipse(x,y+2,8+a2*46,2+a2*9,0,0,TAU);b.stroke();}}b.restore();}}
    if(x<-80||x>W+80||y>H+80)continue;leaf41(b,{x,y,r:L.o.size,rz:s.rz,tilt:s.tilt,r0:s.r0,color:L.o.color,alpha:Math.min(1,(v-L.o.born)*4),dim});}
  drawGroup41(b,valleyGust41,v,dim);drawGroup41(b,[valleyHero41],v,dim);
}

// ---------------- 鸟居：两边的红叶零星落到参道上；开头几片是封面那阵风带过来的 ----------------
const toriiA41=t=>{const u=clamp((t-3.2)/3.2);return 3.2*(u-.75*u*u+.5*u*u*u);};          // 鸟居镜头自己的推进量（见 toriiShot）
const toriiProj41=(wx,wy,a)=>{const z=1.035+.05*a;return [540+z*(wx-540-5*a),1000+z*(wy-1000+2*a)];};
const toriiInv41=(sx,sy,a)=>{const z=1.035+.05*a;return [(sx-540)/z+540+5*a,(sy-1000)/z+1000-2*a];};
const toriiLand41=(x,y,o)=>y>=o.ly?{x,y:o.ly,tilt:1.24,rz:(rnd(o.seed,9)-.5)*.4}:null;
const toriiLeaves41=[
  ...Array.from({length:6},(_,i)=>{const r=k=>rnd(i,4600+k);return mk41({x:-60+r(1)*380,y:520+r(2)*520,born:3.2-r(3)*.12,size:11+r(4)*13,seed:4620+i,color:2+i%5,vx0:330+r(5)*160,vy0:-40,wind:gust41([]),life:6,land:toriiLand41,ly:1500+r(6)*300});}),
  ...Array.from({length:13},(_,i)=>{const r=k=>rnd(i,4700+k),left=r(1)<.5;return mk41({x:left?10+r(2)*230:850+r(2)*220,y:560+r(3)*420,born:3.25+r(4)*2.5,size:8+r(5)*11,seed:4720+i,color:2+i%5,wind:gust41([]),life:6,land:toriiLand41,ly:1480+r(6)*330});}),
];
function toriiLeaves41Draw(b,t){const a=toriiA41(t);
  for(const L of toriiLeaves41){const s=at41(L,t-L.o.born);if(!s)continue;let x=s.x,y=s.y;
    if(s.resting){const w=toriiInv41(x,y,toriiA41(L.sim.restAt));[x,y]=toriiProj41(w[0],w[1],a);b.save();b.globalAlpha=.28;b.fillStyle='#1c1810';b.beginPath();b.ellipse(x+2,y+3,L.o.size*.9,L.o.size*.24,0,0,TAU);b.fill();b.restore();}
    leaf41(b,{x,y,r:L.o.size,rz:s.rz,tilt:s.tilt,r0:s.r0,color:L.o.color,alpha:Math.min(1,(t-L.o.born)*5)});}
}

// ---------------- 温泉街最后那阵风：带着叶子越过切点，吹进还没亮灯的红叶谷 ----------------
const TW41=gust41([{U:620,t0:22.35,c:1500,rise:.35,decay:1.3,up:-.22}]);
const townGust41=Array.from({length:16},(_,i)=>{const r=k=>rnd(i,4800+k),x=-60+r(1)*1000;
  return mk41({x,y:420+r(2)*900,born:22.4+(x+200)/1500+r(3)*.4,size:9+r(4)*16,seed:4820+i,color:2+i%5,wind:TW41,life:4.2});});

const townHero41=mk41({x:-230,y:1250,born:22.4,size:140,seed:4899,rgb:[222,104,40],wind:gust41([{U:900,t0:22.2,c:1500,rise:.25,decay:2.2,up:-.42}]),near:1.7,life:4});   // 温泉街那阵风里的大叶，一直飞进红叶谷

// ---------------- 落在标题上的叶子：真的碰到字的上沿才停，斜笔画上会滑下去，起风被掀走 ----------------
let title41=null;
function titleMask41(){
  if(title41)return title41;titleText='弥彦';const c=mask(),d=c.getContext('2d').getImageData(0,0,c.width,c.height),w=c.width,h=c.height,ox=74-TX,oy=404-TB;
  const filled=(x,y)=>{const mx=Math.round(x-ox),my=Math.round(y-oy);return mx>=0&&my>=0&&mx<w&&my<h&&d.data[(my*w+mx)*4+3]>120;};
  const top=(x,y)=>{for(let k=-9;k<=9;k++)if(!filled(x,y+k-1)&&filled(x,y+k))return y+k;return null;};   // 附近这条笔画的上沿
  title41={filled,top};return title41;
}
function titleLand41(x,y,o){
  const M=titleMask41(),cy=y+o.size*.3;if(!M.filled(x,cy))return null;
  let ys=cy,d=0;while(d<16&&M.filled(x,ys-1)){ys--;d++;}
  if(d>=16)return {bounce:1};                                                         // 撞在笔画侧面：弹开，不穿进去
  const l=M.top(x-6,ys),r2=M.top(x+6,ys);
  if(l!=null&&r2!=null&&Math.abs(r2-l)<4.5)return {x,y:ys-o.size*.3,tilt:.82+rnd(o.seed,8)*.28,rz:Math.atan2(r2-l,12)+(rnd(o.seed,9)-.5)*.25,surface:ys};   // 够平：停下
  const dir=l==null?-1:r2==null?1:(r2>l?1:-1);return {slide:dir*70,y:ys-o.size*.3-.5};                                                // 斜的或到了笔画尽头：滑下去
}
const TITLE41_PLAN=[[25.6,1.6,5],[26.2,1.8,3],[26.8,22.7,4],[27.3,1.95,6],[3.5,14.6,6],[4.4,22.8,3],[6.8,14.8,5],[9.0,22.75,4],[18.6,22.9,5]];   // [出生, 被哪阵风带走, 颜色]（循环时钟）
let titleLeaves41=null;
function buildTitleLeaves41(){
  titleMask41();titleLeaves41=[];
  TITLE41_PLAN.forEach(([born,off,color],i)=>{
    const life=((off-born+V41.DUR)%V41.DUR)+3.2;let best=null;
    for(let k=0;k<60&&!best;k++){const r=q=>rnd(i*61+k,4900+q),o={x:70+r(1)*290,y:120+r(2)*70,born:0,size:21+r(3)*8,seed:4950+i*61+k,color,life,release:life-3.2,land:titleLand41,
        wind:(x,y,t)=>{const g=520*pulse41(t-(life-3.2)+.25-(x-60)/900,.3,1.1);return [g+14*Math.sin(t*2.1+i),-g*.3+6*Math.sin(t*1.3+i)];}};
      const L=mk41(o);if(L.sim.rested&&L.sim.restAt<3.2)best=L;}
    if(best){best.born=born;titleLeaves41.push(best);}
  });
}
function drawTitleLeaves41(N){
  if(!titleLeaves41)buildTitleLeaves41();
  for(const L of titleLeaves41){const age=(N-L.born+V41.DUR)%V41.DUR,s=at41(L,age);if(!s)continue;
    let tilt=s.tilt,rz=s.rz;
    if(s.resting){const q=N*3.1+L.o.seed;tilt+=.05*Math.sin(q)+.03*Math.sin(q*2.7);rz+=.03*Math.sin(q*1.3);   // 停着也会被气流碰得微微颤
      g.save();g.globalAlpha=.3;g.fillStyle='#1a120c';g.beginPath();g.ellipse(s.x+2,s.y+L.o.size*.3+3,L.o.size*.75,3,0,0,TAU);g.fill();g.restore();}
    leaf41(g,{x:s.x,y:s.y,r:L.o.size,rz,tilt,r0:s.r0,color:L.o.color,alpha:Math.min(1,age*4)});}
}

// ---------------- 太阳：整条路线左右对调——白天从拜殿上方往左下走，傍晚落在左边的海上；佐渡在右边，月亮从右边升起 ----------------
sunScreen=function(T){const d=T-13.0,L=d<0?69*d+2.12*d*d:69*d,k=.00008*L*Math.abs(L);return [430-(L*SUN_D[0]+k*SUN_N[0]),600+L*SUN_D[1]+k*SUN_N[1]];};

// ---------------- 山顶观景台：亮一些、暖一些（实拍只当作「有什么」的参考，不照它的曝光） ----------------
// 傍晚的光照着碎石地和秋色的树篱；正中是细高的展望塔，左边是山名碑；只有这两个人在拍照。
const plaza43=layer(b=>{
  const tx=660,base=1300,top=560;   // 塔顶压在旁白那一行以下，不穿过字
  const tg=b.createLinearGradient(tx-15,0,tx+15,0);tg.addColorStop(0,'#fff0d6');tg.addColorStop(.5,'#e6d2c2');tg.addColorStop(1,'#a898a8');b.fillStyle=tg;b.fillRect(tx-15,top,30,base-top);
  for(let y=top+30;y<base;y+=44){b.fillStyle='rgba(90,70,90,.16)';b.fillRect(tx-15,y,30,1.4);}
  for(const y of [top+86,top+150]){const gg=b.createLinearGradient(tx-15,0,tx+15,0);gg.addColorStop(0,'#9fd6ba');gg.addColorStop(1,'#5a9484');b.fillStyle=gg;b.fillRect(tx-15,y,30,34);}
  const cg=b.createLinearGradient(tx-34,0,tx+34,0);cg.addColorStop(0,'#fff4de');cg.addColorStop(.5,'#e2cfc0');cg.addColorStop(1,'#9a8c9e');b.fillStyle=cg;b.fillRect(tx-34,top-66,68,66);
  b.fillStyle='rgba(78,84,120,.7)';b.fillRect(tx-34,top-44,68,12);b.fillStyle='rgba(255,246,226,.7)';b.fillRect(tx-34,top-66,68,3);
  b.strokeStyle='#7a6e86';b.lineWidth=1.6;b.beginPath();b.moveTo(tx-34,top-80);b.lineTo(tx+34,top-80);for(let x=-34;x<=34;x+=11.3){b.moveTo(tx+x,top-80);b.lineTo(tx+x,top-66);}b.moveTo(tx,top-80);b.lineTo(tx,top-128);b.stroke();
  // 左边坡上的红叶和灌木
  b.fillStyle='#6a3a40';b.beginPath();b.moveTo(-40,1340);b.lineTo(-40,1060);b.quadraticCurveTo(120,1080,230,1180);b.quadraticCurveTo(340,1240,440,1310);b.lineTo(440,1340);b.closePath();b.fill();
  for(let i=0;i<70;i++){const x=-30+rnd(i,6101)*440,y=1090+rnd(i,6102)*240;if(y<1060+x*.56)continue;treeCrown(b,x,y,34+rnd(i,6103)*34,30+rnd(i,6104)*20,6300+i,[['#6e2a30','#b8443a','#ee8250'],['#7a4a2c','#c4803b','#f0bc64'],['#5a2430','#a03a38','#dc6a48']][i%3]);}
  // 海边一排秋色的树篱
  for(let i=0;i<210;i++){const x=380+rnd(i,6111)*740,y=1290+rnd(i,6112)*50,r=14+rnd(i,6113)*24;b.fillStyle=['#7a3a36','#a8523a','#c88a48','#5c4a3c','#8e4038','#d8a45c'][i%6];b.beginPath();b.ellipse(x,y,r,r*.7,0,0,TAU);b.fill();}
  b.fillStyle='rgba(255,196,130,.22)';for(let i=0;i<120;i++){const x=380+rnd(i,6141)*740,y=1276+rnd(i,6142)*40;b.beginPath();b.ellipse(x,y,9+rnd(i,6143)*12,4,0,0,TAU);b.fill();}
  // 碎石地：被夕阳染成暖的灰粉色，近处才沉下来
  const gq=b.createLinearGradient(0,1318,0,1800);gq.addColorStop(0,'#b08a86');gq.addColorStop(.3,'#8a6a72');gq.addColorStop(1,'#4a3a4c');b.fillStyle=gq;b.beginPath();b.moveTo(-40,1340);b.quadraticCurveTo(540,1312,1120,1348);b.lineTo(1120,H+140);b.lineTo(-40,H+140);b.closePath();b.fill();
  for(let i=0;i<2600;i++){const y=1326+Math.pow(rnd(i,6132),1.5)*560,x=-30+rnd(i,6131)*1140,d=(y-1326)/560;b.fillStyle=i%5?`rgba(70,48,60,${.10+.08*d})`:`rgba(255,214,170,${.16+.08*d})`;b.fillRect(x,y,1.2+d*3,1+d*1.2);}
  for(let x=436;x<=1100;x+=86){const y=1338+Math.sin(x*.01)*4;b.fillStyle='#6a4a3c';b.fillRect(x-6,y-58,12,64);b.fillStyle='rgba(255,196,130,.6)';b.fillRect(x-6,y-58,3,60);
    if(x+86<=1100){b.strokeStyle='#8a6a50';b.lineWidth=3;b.beginPath();b.moveTo(x,y-44);b.quadraticCurveTo(x+43,y-26,x+86,y-44+Math.sin((x+86)*.01)*4-Math.sin(x*.01)*4);b.stroke();}}
  // 山名碑
  b.fillStyle='rgba(60,40,56,.25)';b.beginPath();b.ellipse(250,1366,170,16,0,0,TAU);b.fill();b.fillStyle='#9a8486';b.beginPath();b.ellipse(240,1356,150,15,0,0,TAU);b.fill();
  const mg=b.createLinearGradient(140,0,220,0);mg.addColorStop(0,'#d89a66');mg.addColorStop(1,'#7a4a38');b.fillStyle=mg;b.beginPath();b.moveTo(136,1352);b.quadraticCurveTo(150,1254,142,1174);b.quadraticCurveTo(138,1114,172,1100);b.quadraticCurveTo(204,1094,210,1134);b.quadraticCurveTo(208,1184,222,1234);b.quadraticCurveTo(228,1304,240,1352);b.closePath();b.fill();
  const sg=b.createLinearGradient(0,1236,0,1300);sg.addColorStop(0,'#e0a876');sg.addColorStop(1,'#8a5a42');b.fillStyle=sg;b.beginPath();b.moveTo(198,1240);b.quadraticCurveTo(280,1226,364,1238);b.quadraticCurveTo(376,1268,362,1296);b.quadraticCurveTo(280,1304,204,1298);b.closePath();b.fill();
},W,H+140,1.5);
function plazaPeople43(b,s){
  b.fillStyle='rgba(74,40,28,.9)';b.textAlign='center';b.textBaseline='middle';b.font=`700 34px ${FONTS.cjk}`;[...'弥彦山'].forEach((c,i)=>b.fillText(c,246+i*40,1268));b.textAlign='left';b.textBaseline='alphabetic';
  const col=[38,24,40],lift=[26,10,8],arm=ease(clamp((s-.45)/.35))*(1-ease(clamp((s-3.3)/.4))),fl=t0=>s>t0?Math.exp(-(s-t0)/.14):0,f=Math.max(fl(1.3),fl(2.4));
  for(const [x,y] of [[470,1420],[532,1424]]){b.save();b.globalAlpha=.22;b.fillStyle='#3a2434';b.beginPath();b.ellipse(x+34,y+6,60,9,0,0,TAU);b.fill();b.restore();}   // 夕阳在左，影子落在右边
  person41(b,470,1420,2.0,{back:true,arm,phone:true,col,lift});person41(b,532,1424,1.9,{back:true,arm:arm*.55,point:true,col,lift});
  if(f>.02)flash41(b,470+18*2.0,1420-108*2.0,f,1.7);
}
sunsetShot=function(b,t,Tp){
  const u=clamp((t-14.6)/10.6),lift=u*.85+.15*u*u,hy=930-100*lift,Tq=Tp??(13.0+(t-14.6)*4/10.6),S=sunScreen(Tq),sunX=S[0],sunY=S[1]+(hy-930)+sunDrop(Tq);CLOUD_OFF=easeIn(clamp((Tq-16.7)/.3));
  if(!NOSKY)sunsetSky(b,u,hy,sunX,sunY);CLOUD_OFF=0;
  {const x0=520,x1=1130,wd=x1-x0;b.fillStyle=blendTone('#8a7c98','#75698a',u);b.globalAlpha=.78;b.beginPath();b.moveTo(x0,hy+1);
   for(let x=x0;x<=x1;x+=4){const k=(x-x0)/wd,env=Math.pow(Math.sin(Math.PI*Math.min(1,k*1.15)),.6);b.lineTo(x,hy-1-env*(15+13*Math.max(0,Math.sin(k*7.4+.6))+7*Math.sin(k*17)+2*Math.sin(x*.3)));}
   b.lineTo(x1,hy+1);b.closePath();b.fill();b.globalAlpha=1;}
  const sea=b.createLinearGradient(0,hy,0,hy+420);sea.addColorStop(0,blendTone('#e2b48e','#d6a488',u));sea.addColorStop(.22,blendTone('#9a94ac','#8a84a0',u));sea.addColorStop(1,blendTone('#5a6c8c','#4a5a7c',u));b.fillStyle=sea;b.fillRect(0,hy,W,H-hy);
  b.save();b.beginPath();b.rect(0,hy,W,440);b.clip();glow(b,sunX,hy+170,170,400,[248,191,128],.24);
  for(let i=0;i<150;i++){const v=Math.pow(i/150,1.5),yy=hy+3+v*400,n=5+Math.round(v*3);
    for(let j=0;j<n;j++){const id=i*9+j,len=6+v*52+rnd(id,2621)*v*30,xx=fract(rnd(id,2622)+t*.003*(1+v))*(W+200)-100,th=.5+v*1.3;
      b.fillStyle=`rgba(255,226,190,${(.1+.12*(1-v))*(.6+.4*rnd(id,2623))})`;b.fillRect(xx,yy,len,th);b.fillStyle=`rgba(24,38,64,${.08+.1*v})`;b.fillRect(xx+len*.1,yy+th+.5+v,len*.85,th);}}
  for(let i=0;i<200;i++){const v=i/200,yy=hy+4+v*380,spread=(10+v*v*120)*(1-.4*u),xx=sunX+Math.sin(i*2.31+t*.55)*spread*.5,tw=.55+.45*Math.sin(t*5+i*1.7);
    b.fillStyle=`rgba(255,226,176,${(.4+.42*rnd(i,2612))*(1-v*.55)*tw})`;b.fillRect(xx-(6+v*26)/2,yy,6+v*26,1+v*1.2);}
  b.restore();
  b.save();b.translate(0,hy-930);b.drawImage(plaza43,0,0,W,H+140);plazaPeople43(b,u*4);b.restore();
};
sunsetLit=function(b,t){
  sunsetShot(b,t);const u=clamp((t-14.6)/10.6);
  let k=0;while(k<SUNSET_GRADE.length-2&&u>SUNSET_GRADE[k+1][0])k++;
  const [u0,c0]=SUNSET_GRADE[k],[u1,c1]=SUNSET_GRADE[k+1],f=ease(clamp((u-u0)/(u1-u0))),rgb=c0.map((v,i)=>Math.round(lerp(v,c1[i],f)));
  const c=tintC.getContext('2d');c.setTransform(1,0,0,1,0,0);c.fillStyle=`rgb(${rgb.join(',')})`;c.fillRect(0,0,W,H);
  b.save();b.setTransform(1,0,0,1,0,0);b.globalCompositeOperation='multiply';b.drawImage(tintC,0,0,W,H);
  const lift=u*.85+.15*u*u,hy=930-100*lift,Ss=sunScreen(13.0+(t-14.6)*4/10.6),sx=Ss[0],sy=Ss[1]+(hy-930)+sunDrop(13.0+(t-14.6)*4/10.6),g2=Math.sin(Math.PI*clamp((u-.2)/.7));
  b.globalCompositeOperation='lighter';glow(b,sx,sy,460,170,[255,196,140],.15*g2);b.restore();
};

// ---------------- 鸟居：不放人。画面自己把放字的地方压暗：左上角的杉枝，参道上鸟居横梁的影子 ----------------
const toriiShade42=layer(b=>{glow(b,330,330,560,300,[26,44,32],.62);
  for(let i=0;i<22;i++){b.save();b.translate(-60+rnd(i,6201)*760,200+rnd(i,6202)*330);b.rotate(-.2+rnd(i,6203)*.9);shrineSpray(b,0,0,230+rnd(i,6204)*200,6210+i,['#22392a','#2c4a34','#1c3024'][i%3]);b.restore();}},W,720,1);
function torii42(b,a){
  b.save();b.setTransform(1,0,0,1,0,0);b.drawImage(toriiShade42,0,0,W,720);b.restore();
  const q=b.createLinearGradient(0,1360,0,1580);q.addColorStop(0,'rgba(34,40,26,0)');q.addColorStop(.35,'rgba(34,40,26,.46)');q.addColorStop(.7,'rgba(34,40,26,.46)');q.addColorStop(1,'rgba(34,40,26,0)');b.fillStyle=q;b.beginPath();b.moveTo(120,1360);b.lineTo(960,1360);b.lineTo(1120,1580);b.lineTo(-40,1580);b.closePath();b.fill();
}

// ---------------- 温泉街：两个人按平常的步子走向旅馆，掀帘进去 ----------------
const TOWN_DOOR42=[652,1200];
townCoupleV25=function(b,a){
  const u=ease(clamp((a-1.3)/3.9)),q=1-u,P=[[742,1440],[706,1330],TOWN_DOOR42],x=q*q*P[0][0]+2*q*u*P[1][0]+u*u*P[2][0],y=q*q*P[0][1]+2*q*u*P[1][1]+u*u*P[2][1],s=lerp(1.42,.8,u),al=1-ease(clamp((u-.88)/.12)),walk=a>1.3&&u<.99?1:0;
  if(al<=0)return;person41(b,x-16*s,y-4*s,s,{back:true,ph:a*6.4+1.5,walk,robe:true,alpha:al});person41(b,x+14*s,y,s*.96,{back:true,ph:a*6.4,walk,robe:true,alpha:al});
};
townMoonTime=a=>17.9+3.2*ease(clamp(a/V41.TOWN_LEN));   // 月亮：从海上升起之后接着走，不跳

// ---------------- 字：极简，不加字影。可读性靠画面本身（放字的地方是暗的、平的），实在不够才在字后面铺一片很淡很大的暗 ----------------
const HL42={size:68,weight:300,sp:8,y1:1440,sub:30,subW:400,subSp:5,y2:1504,subCol:'rgba(255,246,230,.82)'};
const scrim42=()=>verticalSprite('type-v42-caption',[[0,[5,12,20,0]],[.42,[5,12,20,84]],[.72,[5,12,20,84]],[1,[5,12,20,0]]]);
headlineC=function(s,segs,sub){
  rise(s,()=>{g.shadowColor='transparent';g.shadowBlur=0;g.shadowOffsetY=0;g.drawImage(scrim42(),0,1300,W,330);
    const ws=segs.map(([q])=>measure(q,HL42.size,HL42.weight,HL42.sp)+HL42.sp);let x=(W-ws.reduce((p,q)=>p+q,0)+HL42.sp)/2;
    segs.forEach(([q,key],i)=>{text(q,x,HL42.y1,HL42.size,key?HL_C.key:HL_C.head,HL42.weight,'left',HL42.sp);x+=ws[i];});
    if(sub)text(sub,W/2,HL42.y2,HL42.sub,HL42.subCol,HL42.subW,'center',HL42.subSp);});
};
// 旁白：和「NIIGATA」、标题左边对齐（竖线 x=80，字 x=102，和原来一样）。秋天的味道放在细处：
// 竖线从枫红渐到金，数字用铜色，字像落叶一样从左上方轻轻落到位。不加字影。
let STORY_DARK42=0;
drawStory=function(t,story,color=NARRATION){
  const item=story.filter(([from])=>t>=from).at(-1)||story[0];if(!item)return;const [from,,str]=item,size=44,age=t-from,inst=from<0;
  g.save();g.shadowColor='transparent';g.shadowBlur=0;g.shadowOffsetY=0;
  if(STORY_DARK42>0)glow(g,330,430,640,250,[8,14,22],STORY_DARK42);
  const bar=g.createLinearGradient(0,447,0,491);bar.addColorStop(0,'#e0563a');bar.addColorStop(1,'#f0be7c');g.fillStyle=bar;g.fillRect(80,447,3,44);
  let x=102,y=480;g.textAlign='left';
  [...str].forEach((c,i)=>{const lat=/[0-9A-Za-z]/.test(c);setFont(size,500,1.5,lat?'latin':'cjk');const w=g.measureText(c).width;if(x+w>990){x=102;y+=58;}
    const p=inst||i<4?1:ease(clamp((age-(i-4)*.05)/.38));if(p>0){g.save();g.globalAlpha=p;g.translate(x-6*(1-p),y-11*(1-p));g.rotate(-.12*(1-p));g.fillStyle=lat?'#f4c68c':color;g.fillText(c,0,0);g.restore();}x+=w;});
  g.restore();
};

// ---------------- 字幕（新时间轴） ----------------
const STORY41=[[-2,0,'红叶最好看在 11 月上中旬。'],[V41.COVER,0,'新潟坐电车，约一个半小时。'],[7.6,0,'弥彦山 634 米，和晴空塔一样高。'],[V41.SUMMIT0,0,'天晴时，能看到佐渡岛。'],[V41.TOWN0,0,'下山后，住一晚弥彦温泉。'],[V41.VALLEY0,0,'天黑后，红叶谷每晚点灯。'],[27.4,0,'红叶最好看在 11 月上中旬。']];
const sc41=(N,from,to)=>N<from||N>to?0:{p:easeOut((N-from)/.55),out:clamp((to-N)/.35)};
function townCard41(N){
  rise(sc41(N,18.7,23.0),()=>{g.shadowColor='transparent';g.shadowBlur=0;g.drawImage(scrim42(),0,1310,W,330);
    const w1=measure('日落之后 ',HL42.size,300,HL42.sp)+HL42.sp;text('日落之后 ',92,1440,HL42.size,HL_C.head,300,'left',HL42.sp);text('住进温泉街',92+w1,1440,HL42.size,HL_C.key,300,'left',HL42.sp);
    g.fillStyle=TYPE.coral;g.beginPath();g.arc(99,1494,4,0,TAU);g.fill();text('缆车傍晚 5 点前就收班',116,1504,HL42.sub,HL42.subCol,HL42.subW,'left',HL42.subSp);});
}
function titles41(N){
  const day=N>=V41.COVER&&N<V41.DUSK0,sunset=day?ease(clamp((N-9.9)/1.8))*(1-ease(clamp((N-16.3)/.3))):0,lit=N<V41.COVER?1:N>=V41.VALLEY0?valleyLit41(N-V41.VALLEY0)[2]:N>=V41.TOWN0?ease(clamp((N-V41.TOWN0)/1)):0;
  STORY_DARK42=N<V41.TORII?0:N<V41.SUMMIT0?.24:N<V41.DUSK0?.12:0;
  g.save();drawHeader(12,{light:.12+.55*sunset+.28*lit,lc:sunset>0?[255,188,111]:lit>0?[255,213,156]:[224,234,241],x:sunset>0?sunScreen(Math.min(17,N+.4))[0]:600},{title:'弥彦',place:'新潟县弥彦村',story:STORY41,storyT:N,storyShadow:'rgba(8,16,26,.95)',sheen:[440,560,500,260],reflect:true,accent:'#deb985',storyColor:'#fff6e6'});g.restore();
  headlineC(N>=27.5?{p:easeOut(clamp((N-27.5)/.5)),out:1}:N<2.4?{p:1,out:clamp((2.4-N)/.3)}:0,[['上山看海 ',0],['入夜看秋',1]],'新潟 · 弥彦');
  headlineC(sc41(N,3.6,5.85),[['一之鸟居',1]],'弥彦神社');
  headlineC(sc41(N,7.0,9.2),[['山下参拜 ',0],['山上看海',1]],'十一月，还有菊花祭');
  headlineC(sc41(N,10.4,12.4),[['缆车 ',0],['5',1],[' 分钟到山顶',0]],'走表参道上山 约 90 分钟');
  headlineC(sc41(N,13.6,16.25),[['上山之后 是',0],['海',1]],'山顶望向日本海');
  townCard41(N);
  headlineC(sc41(N,25.9,27.35),[['弥彦公园 ',0],['红叶谷',1]],'观月桥');
}

// ---------------- 每一帧 ----------------
function render(N){
  N=v41Round(fract(N/V41.DUR)*V41.DUR);if(N>=V41.DUR)N=0;
  g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.fillStyle=ink;g.fillRect(0,0,W,H);
  const b=screenA.getContext('2d');CAM_OVERRIDE=null;VPUSH=0;NO_DIR41=false;NOSKY=false;NU=false;SKYONLY=false;
  const clear=(c=b)=>{c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.clearRect(0,0,W,H);};
  let tTown=null;
  if(N<V41.COVER||N>=V41.VALLEY0){const v=N<V41.COVER?V41.VLEN+N:N-V41.VALLEY0;clear();
    if(v<V41.RISE){   // 换景：温泉街沉下去，还没亮灯的红叶谷从下面升上来；夜空和月亮不断
      const vt=5.6+v;CAM_OVERRIDE=camV41(v);NIGHT_T=21.1+v*.25;NO_DIR41=true;V41V=v;
      SKYONLY=true;valleyShot(b,vt,'reveal',false);SKYONLY=false;b.setTransform(1,0,0,1,0,0);
      const s=setC.getContext('2d');clear(s);townSetDraw(s,V41.TOWN_LEN);b.drawImage(setC,0,H*easeIn(clamp(v/.6)),W,H);
      const u=unlitC.getContext('2d');clear(u);NOSKY=true;NU=true;valleyShot(u,vt,'reveal',false);NU=false;NOSKY=false;b.setTransform(1,0,0,1,0,0);b.drawImage(unlitC,0,H*(1-easeOut(clamp((v-.1)/.8)))*.9,W,H);
      CAM_OVERRIDE=null;NO_DIR41=false;}
    else valleyShot41(b,v);
    b.setTransform(1,0,0,1,0,0);if(N>=V41.VALLEY0){drawGroup41(b,townGust41,N,1-valleyLit41(v)[1]);drawGroup41(b,[townHero41],N,1);}valleyLeaves41(b,v);}
  else if(N<V41.TORII){const t=v41Round(3.2+N-V41.COVER);paintShot(screenA,'torii',t);b.setTransform(1,0,0,1,0,0);toriiLeaves41Draw(b,t);}
  else if(N<V41.SUMMIT0){const t=v41Round(6.4+N-V41.TORII);paintShot(screenA,shotAt(t),t);}
  else if(N<V41.DUSK0){const t=v41Round(13.0+N-V41.SUMMIT0);paintShot(screenA,'sunset',t);}
  else if(N<V41.TOWN0){   // 太阳下去了：天一下子黑了，月亮从右边海上斜着升起来，海上有它的倒影
    clear();const T=17.0+(N-V41.DUSK0),c=camV41(0),m=moonG(T),hy=830;NIGHT_T=T;b.save();camera(b,c.z,c.x,c.y);b.drawImage(nightSkyL,0,0,W,H);b.restore();
    MOONDX=c.x+(m[0]-540)/c.z-785;MOONDY=c.y+(m[1]-960)/c.z-570;drawMoonAt(b,m[0],m[1],c.z);
    const c2=landC.getContext('2d');clear(c2);NOSKY=true;sunsetShot(c2,25.2,40);NOSKY=false;gradeSet(c2,[70,80,124]);b.drawImage(landC,0,0,W,H);
    if(m[1]<hy+30){b.save();b.globalCompositeOperation='lighter';const k=clamp((hy+30-m[1])/120);for(let i=0;i<46;i++){const v=i/46,yy=hy+3+v*420,ww=(10+v*60)*(.6+.4*Math.sin(T*5+i*1.7));b.fillStyle=`rgba(226,222,200,${.35*k*(1-v)})`;b.fillRect(m[0]-ww/2+Math.sin(i*2.3+T*3)*v*14,yy,ww,1.5+v*1.5);}b.restore();}}
  else{   // 温泉街：山顶的景沉下去，温泉街从下面升上来；月亮接着走
    clear();const a=N-V41.TOWN0;tTown=v41Round(TOWN0+a);CAM_OVERRIDE=camV41(0);
    const vs=valleyShot;if(a<.7)valleyShot=function(s){sunsetShot(s,25.2,40);gradeSet(s,[70,80,124]);};
    townShot(b,tTown);valleyShot=vs;CAM_OVERRIDE=null;b.setTransform(1,0,0,1,0,0);drawGroup41(b,townGust41,N);drawGroup41(b,[townHero41],N);}
  g.setTransform(1,0,0,1,0,0);g.drawImage(screenA,0,0);
  if(tTown!==null)drawSfx(g,tTown);
  const vg=g.createRadialGradient(540,900,430,540,900,1250);vg.addColorStop(0,'rgba(2,7,16,0)');vg.addColorStop(1,'rgba(2,7,16,.37)');g.fillStyle=vg;g.fillRect(0,0,W,H);
  titles41(N);drawTitleLeaves41(N);
}
