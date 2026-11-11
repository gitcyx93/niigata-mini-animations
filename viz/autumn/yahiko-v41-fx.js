// ======== 弥彦 V41：新时间轴、山顶重画、叶片（画法 / 飘落 / 落在标题上）========
// 由 viz/tools/build-yahiko-v41.py 内嵌进 yahiko-v41.html；不要直接改 HTML 里的这一段。
// 时间轴 N（秒，26.4 循环）：
//   0–2.8   亮灯的红叶谷（封面；是片尾那一镜的延续）→ 一阵风，大叶子从镜头前扫过，切到白天
//   2.8–6.0 一之鸟居      6.0–12.2 林中拜殿 → 缆车      12.2–16.6 山顶日落
//   16.6–21.6 温泉街（两个人离开足汤往外走）      21.6–26.4 红叶谷：两人走上桥 → 三段点灯 → 亮着接回开头
const V41={DUR:26.4,COVER:2.8,TORII:6.0,SUMMIT0:12.2,TOWN0:16.6,VALLEY0:21.6,VLEN:4.8};
const v41Round=x=>Math.round(x*1e9)/1e9;

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

// ---------------- 人物：平涂剪影，会走、会停、会抬手；难画的手和脸不画 ----------------
// 单位：脚在 (0,0)，头顶约 -103。o：ph 步伐相位，walk 0..1，dir 朝向，back 背对/正对镜头，arm 抬手 0..1（point 指、phone 举手机），bow 鞠躬，robe 浴衣下摆
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
// 桥上：两个人从左边走上桥，走到桥中间停下；灯亮了，一个抬手指，一个举起手机；封面里放下手，站着看
const bridgeHug41=bridgeVisitors;   // 原来那对相拥的剪影，留着用
bridgeVisitors=function(b,t,reflection=false){
  const v=V41V,deck=x=>1090-Math.sin(clamp((x-70)/950)*Math.PI)*60;
  if(v>=4.15){const k=Math.sin(Math.PI*clamp((v-4.15)/.4))*.07;b.save();b.translate(588,1031);b.scale(1+k,1-k);b.translate(-588,-1031);bridgeHug41(b,t,reflection);b.restore();return;}   // 抱在一起，一直抱到封面
  const u=easeOut(clamp(v/1.3)),close=ease(clamp((v-3.8)/.35)),xA=lerp(250,600,u)-7*close,xB=lerp(223,573,u)+8*close,w=clamp((1-u)*7)+close*.6;
  const hop=k=>Math.abs(Math.sin(clamp((v-2.5-k*.08)/.55)*Math.PI*2))*10;                      // 桥上的灯一亮，两个人蹦两下
  const point=ease(clamp((v-1.5)/.25))*(1-ease(clamp((v-2.6)/.3))),phone=ease(clamp((v-2.9)/.22))*(1-ease(clamp((v-3.75)/.22))),flash=v>3.3?Math.exp(-(v-3.3)/.13):0;
  b.save();if(reflection){b.translate(0,1300);b.scale(1,-.92);b.translate(0,-1300);b.globalAlpha=.13;}
  person41(b,xB,deck(xB)-hop(1),1,{ph:xB*.2,walk:w,arm:phone,phone:true,robe:true});
  person41(b,xA,deck(xA)-hop(0),1,{ph:xA*.2+1.3,walk:w,arm:Math.max(point,phone*.8),point:true,robe:true});
  if(!reflection){const lo=Math.floor(xB-34),hi=Math.ceil(xA+44);   // 重画人前面的栏杆：人在桥里面
    for(let k=0;k<3;k++){b.strokeStyle=NU?(k?'#24222e':'#2c2a36'):(k?'#ad4f3b':'#d77953');b.lineWidth=k?5:8;b.beginPath();for(let x=lo;x<=hi;x+=2)b[x===lo?'moveTo':'lineTo'](x,deck(x)-51+k*18);b.stroke();}
    for(let x=lo;x<=hi;x++){if((x-70)%48===0){b.fillStyle=NU?'#26242f':'#b3513e';b.fillRect(x-3.2,deck(x)-51,6.4,51);}}
    if(flash>.02)flash41(b,xB+18,deck(xB)-108,flash,1);}                                     // 自拍：闪光灯「啪」地亮一下
  b.restore();
};
function flash41(b,x,y,f,s){b.save();b.globalCompositeOperation='lighter';glow(b,x,y,150*s*(.6+f),150*s*(.6+f),[255,250,236],.85*f);glow(b,x,y,34*s,34*s,[255,255,255],f);
  b.strokeStyle=`rgba(255,252,240,${f})`;b.lineCap='round';b.lineWidth=2.4*s;for(let k=0;k<4;k++){const a=k*Math.PI/4+.2,r=(46+70*(1-f))*s;b.beginPath();b.moveTo(x-Math.cos(a)*r,y-Math.sin(a)*r);b.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);b.stroke();}b.restore();}
// 鸟居：一个人靠参道左边走过来，在鸟居前停一下、鞠一躬，再走进去
function toriiWalker41(b,a){
  const Z=a<.55?lerp(6.2,8.0,a/.55):a<.95?8.0:8.0+(a-.95)*3.6,bow=a>.55&&a<.95?Math.sin((a-.55)/.4*Math.PI):0,X=TOX-1.3,f=TP(X,0,Z),h=TP(X,1.7,Z),s=(f[1]-h[1])/100;
  b.save();b.globalAlpha=.22;b.fillStyle='#1c1810';b.beginPath();b.ellipse(f[0]+8*s,f[1]+3*s,22*s,5*s,0,0,TAU);b.fill();b.restore();
  person41(b,f[0],f[1],s*.86,{back:true,ph:a*11,walk:bow>0?0:1,bow,col:[40,32,26],lift:[26,24,16],alpha:.94});
}
// 温泉街：两个人快步走向旅馆，掀开门帘进去（足汤边不再坐人）
townCoupleV25=function(b,a){
  const u=clamp((a-1.05)/3.2),q=1-u,P=[[742,1440],[706,1330],[TOWN_DOOR41[0],TOWN_DOOR41[1]]],x=q*q*P[0][0]+2*q*u*P[1][0]+u*u*P[2][0],y=q*q*P[0][1]+2*q*u*P[1][1]+u*u*P[2][1],s=lerp(1.42,.8,u),al=1-ease(clamp((u-.84)/.16));
  if(al<=0)return;person41(b,x-16*s,y-4*s,s,{back:true,ph:a*10+1.5,walk:1,robe:true,alpha:al});person41(b,x+14*s,y,s*.96,{back:true,ph:a*10,walk:1,robe:true,alpha:al});
};
const TOWN_DOOR41=[652,1200];

// ---------------- 大叶子从镜头前扫过：封面→白天、温泉街→红叶谷 两处切镜各一次 ----------------
function wipe41(N){
  [V41.COVER,V41.VALLEY0].forEach((tc,ci)=>{const d=N-tc;if(d<-.6||d>.6)return;
    for(let i=0;i<7;i++){const r=k=>rnd(i+ci*9,5200+k),t0=-.46+i*.05+r(1)*.03,u=(d-t0)/.66;if(u<0||u>1)continue;
      const x=-540+u*(W+1080),y=160+i*255+r(2)*120-u*280,size=290+r(3)*230;
      for(const k of [2,1,0])leaf41(g,{x:x-k*80,y:y+k*18,r:size,rz:-.5+u*1.4+r(4),tilt:.45+u*2.3+r(5)*2,r0:r(6)*6,rgb:[[190,62,34],[214,92,40],[160,44,36]][i%3],alpha:k?.26:.97,dim:ci?.5:0});}});
}

// ---------------- 红叶谷（片尾 4.8 秒 + 封面 3 秒是同一镜，时钟 v = 0..7.8） ----------------
const camV41=v=>({z:1.04+.019*v,x:540+6*v,y:955-2.2*v});
let V41V=0;
const V41_LIGHT=[1.4,1.95,2.5],V41_RAMP=.55;               // 左岸、右岸、桥和中间：一段一段亮
const valleyLit41=v=>V41_LIGHT.map(t0=>ease(clamp((v-t0)/V41_RAMP)));
function valleyShot41(b,v){
  const lit=valleyLit41(v),vt=5.6+v;CAM_OVERRIDE=camV41(v);NIGHT_T=24.6+v*.2;NO_DIR41=true;V41V=v;
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
function valleyLeaves41(b,v){
  const lit=valleyLit41(v),dim=1-(lit[0]+lit[1]+lit[2])/3;
  // 水面上的叶子跟着镜头一起动（它们在水面上，不在屏幕上）
  const c0=camV41(0),c=camV41(v);
  for(const L of valleyAmb41){const s=at41(L,v-L.o.born);if(!s)continue;let x=s.x,y=s.y;
    if(s.resting){const c1=camV41(L.sim.restAt),wx=c1.x+(x-540)/c1.z,wy=c1.y+(y-960)/c1.z,age=v-L.sim.restAt;x=540+(wx+age*5-c.x)*c.z;y=960+(wy-c.y)*c.z;
      if(age<1.6){b.save();b.strokeStyle=`rgba(226,198,160,${.34*(1-age/1.6)*(1-dim*.6)})`;b.lineWidth=1.3;for(const k of [0,.35]){const a2=age-k;if(a2>0){b.beginPath();b.ellipse(x,y+2,8+a2*46,2+a2*9,0,0,TAU);b.stroke();}}b.restore();}}
    if(x<-80||x>W+80||y>H+80)continue;leaf41(b,{x,y,r:L.o.size,rz:s.rz,tilt:s.tilt,r0:s.r0,color:L.o.color,alpha:Math.min(1,(v-L.o.born)*4),dim});}
  drawGroup41(b,valleyGust41,v,dim);
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
const TW41=gust41([{U:620,t0:20.7,c:1500,rise:.35,decay:1.3,up:-.22}]);
const townGust41=Array.from({length:16},(_,i)=>{const r=k=>rnd(i,4800+k),x=-60+r(1)*1000;
  return mk41({x,y:420+r(2)*900,born:20.75+(x+200)/1500+r(3)*.4,size:9+r(4)*16,seed:4820+i,color:2+i%5,wind:TW41,life:4.2});});

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
const TITLE41_PLAN=[[24.0,1.6,5],[24.5,1.8,3],[25.1,21.0,4],[25.6,1.95,6],[3.5,14.6,6],[4.4,21.1,3],[6.8,14.8,5],[9.0,21.05,4],[17.6,21.2,5]];   // [出生, 被哪阵风带走, 颜色]（循环时钟）
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

// ---------------- 山顶（第二次重画）：人站在山顶的栏杆边往下看 ----------------
// 从近到远：脚下的山顶平地和木栏杆（最大）→ 一路往下、越远越小的红叶山坡 → 山脚和海之间窄窄一条平地上的小镇、沿海公路、小渔港
// → 海 → 海平线上的佐渡岛和落日。左边稍低的山头上是山顶的展望塔和电视塔。镜头几乎不动，只很慢地往前。
const SUM41={hy:730,fx:470,len:V41.TOWN0-V41.SUMMIT0};
const sumYc=x=>1012-26*Math.sin((x+140)/1360*Math.PI)-34*Math.exp(-Math.pow((x-930)/70,2));   // 海岸线（右边一个小岬角）
const sumYf=x=>sumYc(x)+76+10*Math.sin(x*.006);                                               // 山脚：平地到这里为止
const sumEdge=x=>1352+x*.02;
const SUM_HILL=[[-60,1190],[20,1108],[128,1062],[236,1088],[340,1150],[420,1210]];   // 左边稍低的山头                                                                  // 脚下平地的边
const SUM_HOUSES=(()=>{const L=[];for(let i=0;i<300;i++){const r=k=>rnd(i,5300+k),x=r(1)<.62?300+(r(2)+r(3))*.5*520:-20+r(2)*1120,row=Math.floor(r(4)*5),y=sumYc(x)+13+row*11.5+r(5)*3;if(y>sumYf(x)-8)continue;
  L.push({x,y,w:7+r(6)*8,h:4+r(7)*3.2,c:i%4,lit:r(8)<.55,on:r(9)});}return L.sort((a,c)=>a.y-c.y);})();
const summitLand41=layer(b=>{
  // 山脚到海边的平地
  b.beginPath();b.moveTo(-40,sumYc(-40));for(let x=-40;x<=1120;x+=8)b.lineTo(x,sumYc(x));for(let x=1120;x>=-40;x-=8)b.lineTo(x,sumYf(x)+14);b.closePath();
  const q=b.createLinearGradient(0,970,0,1110);q.addColorStop(0,'#6a5c68');q.addColorStop(1,'#4a3c48');b.fillStyle=q;b.fill();
  for(let i=0;i<26;i++){const x=-30+rnd(i,5401)*1120,y=sumYc(x)+16+rnd(i,5402)*44,w=30+rnd(i,5403)*54,h=9+rnd(i,5404)*11;if(x>280&&x<780&&rnd(i,5405)<.7)continue;b.fillStyle=['rgba(120,104,88,.5)','rgba(92,96,84,.5)','rgba(134,112,92,.45)'][i%3];poly(b,[[x,y],[x+w,y-2],[x+w+5,y+h-2],[x+5,y+h]],b.fillStyle);}   // 镇外的田块
  const line=(off,col,w)=>{b.strokeStyle=col;b.lineWidth=w;b.beginPath();for(let x=-40;x<=1120;x+=8)b[x===-40?'moveTo':'lineTo'](x,sumYc(x)+off);b.stroke();};
  line(3.5,'rgba(222,196,170,.75)',5);line(-.5,'rgba(255,244,232,.8)',2);line(41,'rgba(150,134,138,.9)',2.4);   // 沙滩、浪花、沿海公路
  // 小渔港：两道防波堤
  b.strokeStyle='#74687a';b.lineWidth=3.2;b.lineJoin='round';b.beginPath();b.moveTo(226,sumYc(226));b.lineTo(214,sumYc(226)-36);b.lineTo(266,sumYc(226)-42);b.moveTo(306,sumYc(306));b.lineTo(296,sumYc(306)-28);b.stroke();
  // 岬角上一点树
  for(let i=0;i<26;i++){const x=880+rnd(i,5411)*110,y=sumYc(x)+6+rnd(i,5412)*12;treeCrown(b,x,y,7+rnd(i,5413)*5,6,5420+i,['#43303a','#6a3a3c','#8c4a40']);}
  // 房子：从高处看，先看到屋顶，下面一条墙
  for(const h of SUM_HOUSES){b.fillStyle='#3a3340';b.fillRect(h.x,h.y+h.h*.55,h.w,h.h*.7);b.fillStyle=['#857680','#96827e','#746a78','#a08a80'][h.c];poly(b,[[h.x-.6,h.y+h.h*.6],[h.x+1.2,h.y],[h.x+h.w-1.2,h.y],[h.x+h.w+.6,h.y+h.h*.6]],b.fillStyle);}
  // 山坡：几道山脊一层层落到山脚，远的小、蒙着傍晚的空气，近的大；不再是一片匀匀的树点
  const T=[];
  [[1084,14,.0105,1.2,.16],[1124,24,.008,3.4,.4],[1182,34,.0062,.6,.64],[1258,44,.005,2.2,.88]].forEach(([by,amp,fq,ph,d],k)=>{
    const ry=x=>k?by+amp*Math.sin(x*fq+ph)+amp*.5*Math.sin(x*fq*2.3+ph*1.7)-(k%2?x:1080-x)*.034*d:sumYf(x)+2,air=(1-d)*.6;   // 最远一道就是山脚线，不留缝
    b.beginPath();b.moveTo(-40,1500);for(let x=-40;x<=1120;x+=10)b.lineTo(x,ry(x));b.lineTo(1120,1500);b.closePath();const g2=b.createLinearGradient(0,by-amp,0,by+150);g2.addColorStop(0,blendTone('#8e3c38','#6a5266',air));g2.addColorStop(1,blendTone('#3c1822','#6a5266',air*.8));b.fillStyle=g2;b.fill();
    const n=Math.round(250/(.38+d)),h0=7+d*d*46,list=[];for(let i=0;i<n;i++){const r=q=>rnd(i+k*977,5500+q),x=-40+r(1)*1160,y=ry(x)+2+Math.pow(r(2),1.3)*(64+d*90),ever=r(4)<.1,pt=Math.sin(x*.004+k*2)+.6*Math.sin(x*.011+y*.01);
      const pal=ever?['#22343a','#34504a','#56705c']:pt>1?['#7a4a2c','#b87838','#e0aa58']:pt<-.5?['#4a2030','#84303a','#b8503e']:['#5c2630','#a83c36','#dc6c44'];list.push({x,y,h:h0*(.7+r(3)*.6),ever,pal:pal.map(c=>blendTone(c,'#6a5266',air)),i:i+k*977});}
    list.sort((a,c)=>a.y-c.y).forEach(t=>treeCrown(b,t.x,t.y,t.h,t.h*(t.ever?.5:.72),5600+t.i,t.pal,t.ever));
    b.save();b.globalCompositeOperation='source-atop';const rim=b.createLinearGradient(0,by-amp-10,0,by+30);rim.addColorStop(0,`rgba(255,170,96,${.22*d})`);rim.addColorStop(1,'rgba(255,170,96,0)');b.fillStyle=rim;b.fillRect(0,by-amp-12,W,60);b.restore();});
  // 左边稍低的山头：展望塔（细细的塔身、中间一圈观景舱）和两座电视塔
  const P=SUM_HILL;b.beginPath();b.moveTo(-60,1330);P.forEach(([x,y])=>b.lineTo(x,y));b.lineTo(420,1330);b.closePath();const hq=b.createLinearGradient(0,1040,0,1300);hq.addColorStop(0,'#3e2a36');hq.addColorStop(1,'#4a2630');b.fillStyle=hq;b.fill();
  for(let i=0;i<190;i++){const x=-50+rnd(i,5701)*460,y=contourY(P,clamp(x,-59,419))+5+rnd(i,5702)*150;treeCrown(b,x,y,15+rnd(i,5703)*15,13,5710+i,rnd(i,5704)<.2?['#1e2e34','#2e4640','#4c6452']:['#4c1e2a','#8a2e34','#c0523c'],rnd(i,5704)<.2);}
  for(const [x,hh] of [[66,78],[196,92]]){const y0=contourY(P,x);b.lineWidth=1.6;for(let k=0;k<6;k++){b.strokeStyle=k%2?'#e8dcd4':'#b8483c';b.beginPath();b.moveTo(x,y0-hh*k/6);b.lineTo(x,y0-hh*(k+1)/6);b.stroke();}b.strokeStyle='rgba(60,44,54,.8)';b.lineWidth=.8;b.beginPath();b.moveTo(x-5,y0);b.lineTo(x,y0-hh*.7);b.lineTo(x+5,y0);b.stroke();}
  const tx=128,ty=contourY(P,128);const tg=b.createLinearGradient(tx-4,0,tx+4,0);tg.addColorStop(0,'#f4dcc0');tg.addColorStop(1,'#8a7480');b.fillStyle=tg;b.fillRect(tx-3.5,ty-190,7,192);b.fillRect(tx-1,ty-222,2,32);
  b.fillStyle='#5a4a5c';b.beginPath();b.ellipse(tx,ty-108,16,6,0,0,TAU);b.fill();b.fillStyle='#f0d2b0';b.beginPath();b.ellipse(tx,ty-112,16,5.4,0,0,TAU);b.fill();b.fillStyle='#4a3c50';b.fillRect(tx-11,ty-113,22,2.4);
},W,H,1.5);
const summitFore41=layer(b=>{   // 脚下：山顶的平地、草、木栏杆
  b.beginPath();b.moveTo(-40,sumEdge(-40));for(let x=-40;x<=1120;x+=20)b.lineTo(x,sumEdge(x)+4*Math.sin(x*.05));b.lineTo(1120,H);b.lineTo(-40,H);b.closePath();const q=b.createLinearGradient(0,1340,0,1700);q.addColorStop(0,'#3a2428');q.addColorStop(.3,'#2a1a20');q.addColorStop(1,'#140e14');b.fillStyle=q;b.fill();
  for(let i=0;i<520;i++){b.fillStyle=i%4?'rgba(120,84,76,.14)':'rgba(236,160,110,.12)';b.fillRect(-30+rnd(i,5811)*1140,sumEdge(0)+18+Math.pow(rnd(i,5812),1.4)*330,2+rnd(i,5813)*3,1.2);}   // 地上的碎石
  b.lineCap='round';for(let i=0;i<170;i++){const x=-30+rnd(i,5801)*1140,y=sumEdge(x)+2+rnd(i,5802)*10,l=10+rnd(i,5803)*20;b.strokeStyle=i%3?'#3e2a2a':'#6a4434';b.lineWidth=1.4;b.beginPath();b.moveTo(x,y);b.quadraticCurveTo(x+(rnd(i,5804)-.5)*8,y-l*.6,x+(rnd(i,5805)-.5)*18,y-l);b.stroke();}
  for(const [dy,w] of [[-74,9],[-40,6.5]]){b.strokeStyle='#2c1c20';b.lineWidth=w;b.beginPath();b.moveTo(-40,sumEdge(-40)+dy);b.lineTo(1120,sumEdge(1120)+dy);b.stroke();b.strokeStyle='rgba(236,150,96,.45)';b.lineWidth=1.6;b.beginPath();b.moveTo(-40,sumEdge(-40)+dy-w/2);b.lineTo(1120,sumEdge(1120)+dy-w/2);b.stroke();}
  for(let x=-24;x<=1100;x+=124){const y=sumEdge(x);b.fillStyle='#2a1a1e';b.fillRect(x-6,y-84,12,96);b.fillStyle='rgba(236,150,96,.4)';b.fillRect(x-6,y-84,2.2,90);}
},W,H,1.5);
const summitBough41=layer(b=>{   // 右上角伸进来的一枝红叶：逆光，偏暗，边上被夕阳染亮
  b.strokeStyle='#2a1a16';b.lineCap='round';
  const tw=(x0,y0,x1,y1,x2,y2,w)=>{b.lineWidth=w;b.beginPath();b.moveTo(x0,y0);b.quadraticCurveTo(x1,y1,x2,y2);b.stroke();};
  tw(520,-20,400,110,250,170,12);tw(400,95,330,190,290,260,6);tw(330,130,250,120,170,150,5);tw(455,40,430,150,410,230,5);
  for(const [x,y,rx,ry,sd] of [[450,60,120,70,4101],[300,170,110,62,4103],[200,150,70,44,4105],[400,230,74,48,4107],[290,265,56,36,4109]])dayCrown(b,x,y,rx,ry,sd,420);
  b.globalCompositeOperation='source-atop';b.fillStyle='rgba(52,20,30,.42)';b.fillRect(0,0,560,340);
  const q=b.createLinearGradient(0,340,300,60);q.addColorStop(0,'rgba(255,178,96,.34)');q.addColorStop(.6,'rgba(255,178,96,0)');b.fillStyle=q;b.fillRect(0,0,560,340);
},560,340,1.5);
function summitSign41(b){   // 山顶的木牌
  const x=176,y0=sumEdge(176)+70;b.fillStyle='#2c1c1e';b.fillRect(x-7,y0-232,14,232);b.fillStyle='rgba(236,150,96,.35)';b.fillRect(x-7,y0-232,2.4,232);
  b.fillStyle='#3a2622';b.fillRect(x-27,y0-250,54,176);b.strokeStyle='rgba(236,150,96,.5)';b.lineWidth=1.6;b.strokeRect(x-27,y0-250,54,176);
  b.fillStyle='rgba(246,226,196,.86)';b.textAlign='center';b.textBaseline='middle';b.font=`500 30px ${FONTS.cjk}`;[...'弥彦山'].forEach((c,i)=>b.fillText(c,x,y0-226+i*36));b.font=`500 17px ${FONTS.latin||FONTS.cjk}`;b.fillText('634m',x,y0-102);b.textAlign='left';b.textBaseline='alphabetic';}
function susuki41(b,s){   // 脚边的芒草，逆着光，被海风吹得一起一伏
  b.save();b.lineCap='round';for(let i=0;i<26;i++){const r=k=>rnd(i,5900+k),right=i%2,x0=right?900+r(1)*200:-20+r(1)*110,y0=1640+r(2)*60,len=210+r(3)*150,sw=(.16+.1*Math.sin(s*1.5+i*.7)+.05*Math.sin(s*3.1+i))*(right?-1:1),tx=x0+Math.sin(sw)*len*1.1,ty=y0-Math.cos(sw)*len;
    b.strokeStyle='rgba(88,58,46,.9)';b.lineWidth=2;b.beginPath();b.moveTo(x0,y0);b.quadraticCurveTo(x0+(tx-x0)*.25,y0-len*.6,tx,ty);b.stroke();
    for(let k=0;k<9;k++){const v=k/9,px=lerp(tx,x0+(tx-x0)*.62,v*.5),py=lerp(ty,ty+len*.26,v),d2=(right?-1:1)*(16+k*2.2);b.strokeStyle=`rgba(244,206,160,${.5-.03*k})`;b.lineWidth=2.2;b.beginPath();b.moveTo(px,py);b.quadraticCurveTo(px+d2*.5,py-3,px+d2,py+9+k);b.stroke();}}b.restore();}
const summitDrift41=Array.from({length:4},(_,i)=>mk41({x:800+rnd(i,5001)*200,y:470+rnd(i,5002)*120,born:.3+i*.9,size:9+rnd(i,5003)*8,seed:5010+i,color:3+i%4,life:6,wind:(x,y,t)=>[-46-18*Math.sin(t*1.1+i),8*Math.sin(t*.8+i)]}));
function summitSea41(b,hy,sunX,u,t){
  const sea=b.createLinearGradient(0,hy,0,1220);sea.addColorStop(0,blendTone('#e8bc92','#dda686',u));sea.addColorStop(.25,blendTone('#a498ae','#9488a2',u));sea.addColorStop(1,blendTone('#5a6c8c','#4c5c7e',u));b.fillStyle=sea;b.fillRect(0,hy,W,H-hy);
  b.save();b.beginPath();b.rect(0,hy,W,440);b.clip();glow(b,sunX,hy+170,170,400,[248,191,128],.24);
  for(let i=0;i<150;i++){const v=Math.pow(i/150,1.5),yy=hy+3+v*400,n=5+Math.round(v*3);
    for(let j=0;j<n;j++){const id=i*9+j,len=6+v*52+rnd(id,2621)*v*30,xx=fract(rnd(id,2622)+t*.003*(1+v))*(W+200)-100,th=.5+v*1.3;
      b.fillStyle=`rgba(255,226,190,${(.1+.12*(1-v))*(.6+.4*rnd(id,2623))})`;b.fillRect(xx,yy,len,th);b.fillStyle=`rgba(24,38,64,${.08+.1*v})`;b.fillRect(xx+len*.1,yy+th+.5+v,len*.85,th);}}
  for(let i=0;i<200;i++){const v=i/200,yy=hy+4+v*380,spread=(10+v*v*120)*(1-.4*u),xx=sunX+Math.sin(i*2.31+t*.55)*spread*.5,tw=.55+.45*Math.sin(t*5+i*1.7);
    b.fillStyle=`rgba(255,226,176,${(.4+.42*rnd(i,2612))*(1-v*.55)*tw})`;b.fillRect(xx-(6+v*26)/2,yy,6+v*26,1+v*1.2);}   // 太阳的倒影：一条碎开的光路，太阳越低越窄
  b.restore();
}
function summitShot41(b,s){
  const p=clamp(s/SUM41.len),hy=SUM41.hy,sx=404+14*p,sy=556+(hy-8-556)*(.12*p+.88*p*p),dol=k=>1+k*(.25*p+.75*ease(p));
  const zoom=(k,cx,cy,f)=>{b.save();b.translate(cx,cy);b.scale(dol(k),dol(k));b.translate(-cx,-cy);f();b.restore();};
  b.setTransform(1,0,0,1,0,0);
  zoom(.012,SUM41.fx,hy,()=>{sunsetSky(b,.25+.75*p,hy,sx,sy);
    const x0=560,x1=1012,wd=x1-x0;const q=b.createLinearGradient(0,hy-54,0,hy);q.addColorStop(0,blendTone('#6d6488','#5d5580',p));q.addColorStop(1,blendTone('#9a86a0','#84728f',p));b.fillStyle=q;b.globalAlpha=.9;b.beginPath();b.moveTo(x0,hy+1);
    for(let x=x0;x<=x1;x+=3){const k=(x-x0)/wd,big=Math.max(0,1-Math.abs(k-.68)/.3),small=Math.max(0,1-Math.abs(k-.2)/.2);b.lineTo(x,hy-1-46*Math.pow(big,.75)-23*Math.pow(small,.85)-8*Math.pow(Math.sin(Math.PI*k),.5)-3*Math.sin(x*.13)*(big+small)-1.5*Math.sin(x*.41)*big);}
    b.lineTo(x1,hy+1);b.closePath();b.fill();b.globalAlpha=1;b.fillStyle='rgba(255,214,170,.16)';b.fillRect(x0-30,hy-9,wd+60,9);
    for(let i=0;i<5;i++){const bx=930-s*46-i*38-rnd(i,5101)*30,by=598+i*11+rnd(i,5102)*34+Math.sin(s*1.2+i)*5,fl=Math.sin(s*7+i*1.9)*.5+.2,w=8+rnd(i,5103)*3;b.strokeStyle='rgba(52,38,62,.7)';b.lineWidth=1.7;b.lineCap='round';b.beginPath();b.moveTo(bx-w,by-w*fl);b.quadraticCurveTo(bx-w*.4,by-w*.15,bx,by);b.quadraticCurveTo(bx+w*.4,by-w*.15,bx+w,by-w*fl);b.stroke();}
    summitSea41(b,hy,sx,p,s+20);});
  zoom(.03,SUM41.fx,hy,()=>b.drawImage(summitLand41,0,0,W,H));
  zoom(.075,540,1560,()=>b.drawImage(summitFore41,0,0,W,H));
  // 傍晚的色调：越来越暖、越来越沉，最后不到半秒才暗下来接夜景
  const dark=ease(clamp((s-(SUM41.len-.5))/.5)),rgb=[lerp(255,240,p)-70*dark,lerp(250,214,p)-70*dark,lerp(240,204,p)-40*dark].map(Math.round),c=tintC.getContext('2d');
  c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='source-over';c.fillStyle=`rgb(${rgb.join(',')})`;c.fillRect(0,0,W,H);
  b.save();b.globalCompositeOperation='multiply';b.drawImage(tintC,0,0,W,H);b.globalCompositeOperation='lighter';glow(b,sx,sy,480,190,[255,196,140],.16*Math.sin(Math.PI*clamp(p*1.1)));b.restore();
  // 天色一暗：镇上的窗、沿海公路的路灯从左到右一路亮过去；公路上两辆车；港口的灯和塔顶的灯一闪一闪
  zoom(.03,SUM41.fx,hy,()=>{const sweep=x=>clamp((p-.28-(x+60)/1180*.4)/.07);b.save();b.globalCompositeOperation='lighter';
    for(const h of SUM_HOUSES){if(!h.lit)continue;const a=clamp(sweep(h.x)*1.2-h.on*.2);if(a<=0)continue;glow(b,h.x+h.w/2,h.y+h.h,7,5,[255,196,120],.5*a);b.fillStyle=`rgba(255,226,168,${a})`;b.fillRect(h.x+h.w*.3,h.y+h.h*.75,1.8,1.5);}
    for(let x=-30;x<=1110;x+=44){const a=sweep(x+90);if(a<=0)continue;const y=sumYc(x)+40;glow(b,x,y,6,4,[255,214,150],.5*a);b.fillStyle=`rgba(255,236,196,${.9*a})`;b.fillRect(x-.8,y-.8,1.6,1.6);}
    for(const [k,dir] of [[0,1],[1,-1]]){const x=fract(k*.47+dir*s*.03)*1180-50,y=sumYc(x)+41,a=clamp((p-.3)/.2);glow(b,x+dir*5,y,13,5,[255,240,200],.6*a);b.fillStyle=`rgba(255,246,220,${a})`;b.fillRect(x-1,y-1,2.4,2);}
    const blink=q2=>Math.pow(Math.max(0,Math.sin(s*q2)),6);glow(b,266,sumYc(226)-42,16,12,[190,255,210],.75*blink(3.2));b.fillStyle=`rgba(210,255,224,${.5+.5*blink(3.2)})`;b.fillRect(264.5,sumYc(226)-44,3,3);
    glow(b,128,contourY(SUM_HILL,128)-222,14,14,[255,90,70],.8*blink(2.3));b.restore();});
  // 栏杆边的两个人（最近、最大）：一个举起手机，一个指给同伴看佐渡岛
  zoom(.075,540,1560,()=>{
    summitSign41(b);
    const hop=Math.abs(Math.sin(clamp((s-1.45)/.5)*Math.PI*2))*12,fl=t0=>s>t0?Math.exp(-(s-t0)/.13):0,f=Math.max(fl(1.0),fl(2.7));
    person41(b,790,sumEdge(790)+30,1.86,{back:true,arm:ease(clamp((s-.4)/.25)),phone:true,col:[26,14,22],lift:[22,8,4]});
    person41(b,872,sumEdge(872)+34-hop,1.76,{back:true,arm:Math.max(ease(clamp((s-1.4)/.22))*(1-ease(clamp((s-2.3)/.25))),ease(clamp((s-3.1)/.22))),point:true,col:[26,14,22],lift:[22,8,4]});
    if(f>.02)flash41(b,790+18*1.86,sumEdge(790)+30-108*1.86,f,1.5);
    susuki41(b,s);});
  const sway=Math.sin(s*1.3)*.012+Math.sin(s*2.9+1)*.006;b.save();b.translate(1100+30*p,300-18*p);b.rotate(sway);b.scale(1+.16*p,1+.16*p);b.drawImage(summitBough41,-540,-60,560,340);b.restore();
  drawGroup41(b,summitDrift41,s);
}

// ---------------- 字幕（新时间轴） ----------------
let STORY_DARK41=0;
drawStory=function(t,story,color=NARRATION){
  const item=story.filter(([from])=>t>=from).at(-1)||story[0];if(!item)return;const [from,,str]=item,size=44,age=t-from,inst=from<0;
  g.save();g.shadowColor='transparent';g.shadowBlur=0;g.shadowOffsetY=0;
  if(STORY_DARK41>0)glow(g,340,440,600,230,[8,14,22],STORY_DARK41);                       // 亮的画面里，只把字后面压暗一点
  const k=inst?0:Math.exp(-age*3.4);                                                        // 换句子时，小枫叶转一圈再停住；平时轻轻晃
  leaf41(g,{x:91,y:467,r:18,rz:-.4+.09*Math.sin(t*1.7)+k*6.2,tilt:.25+.9*k*Math.abs(Math.sin(age*8)),r0:.15,color:5});
  let x=120,y=480;g.textAlign='left';
  [...str].forEach((c,i)=>{const lat=/[0-9A-Za-z]/.test(c);setFont(size,500,1.5,lat?'latin':'cjk');const w=g.measureText(c).width;if(x+w>990){x=120;y+=58;}
    const p=inst?1:ease(clamp((age-Math.max(0,i-2)*.05)/.38));if(p>0){g.save();g.globalAlpha=p;g.translate(x-8*(1-p),y-14*(1-p));g.rotate(-.16*(1-p));g.fillStyle=lat?'#f4c68c':color;g.fillText(c,0,0);g.restore();}x+=w;});
  g.restore();
};
const STORY41=[[-2,0,'红叶最好看在 11 月上中旬。'],[V41.COVER,0,'新潟坐电车，约一个半小时。'],[7.2,0,'弥彦山 634 米，和晴空塔一样高。'],[V41.SUMMIT0,0,'天晴时，能看到佐渡岛。'],[V41.TOWN0,0,'下山后，住一晚弥彦温泉。'],[V41.VALLEY0,0,'天黑后，红叶谷每晚点灯。'],[25.7,0,'红叶最好看在 11 月上中旬。']];
const sc41=(N,from,to)=>N<from||N>to?0:{p:easeOut((N-from)/.55),out:clamp((to-N)/.35)};   // 不跨循环的出场/退场
// 极简：大字细、宽字距，不加任何字影；下面一行小、轻，只是补充。看不清时只把字后面的景物压暗一点（一条很淡的渐变）
const HL41={size:68,weight:300,sp:8,y1:1440,sub:30,subW:400,subSp:5,y2:1504,subCol:'rgba(255,246,230,.8)'};
const scrim41=()=>verticalSprite('type-v41-caption',[[0,[5,12,20,0]],[.42,[5,12,20,96]],[.72,[5,12,20,96]],[1,[5,12,20,0]]]);
headlineC=function(s,segs,sub){
  rise(s,()=>{g.shadowColor='transparent';g.shadowBlur=0;g.shadowOffsetY=0;g.drawImage(scrim41(),0,1300,W,330);
    const ws=segs.map(([q])=>measure(q,HL41.size,HL41.weight,HL41.sp)+HL41.sp);let x=(W-ws.reduce((p,q)=>p+q,0)+HL41.sp)/2;
    segs.forEach(([q,key],i)=>{text(q,x,HL41.y1,HL41.size,key?HL_C.key:HL_C.head,HL41.weight,'left',HL41.sp);x+=ws[i];});
    if(sub)text(sub,W/2,HL41.y2,HL41.sub,HL41.subCol,HL41.subW,'center',HL41.subSp);});
};
function townCard41(N){   // 温泉街：左对齐，让开往街里走的两个人；小字是出发前要知道的事
  rise(sc41(N,17.4,21.4),()=>{g.shadowColor='transparent';g.shadowBlur=0;g.drawImage(scrim41(),0,1310,W,330);
    const w1=measure('日落之后 ',HL41.size,300,HL41.sp)+HL41.sp;text('日落之后 ',92,1440,HL41.size,HL_C.head,300,'left',HL41.sp);text('住进温泉街',92+w1,1440,HL41.size,HL_C.key,300,'left',HL41.sp);
    g.fillStyle=TYPE.coral;g.beginPath();g.arc(99,1494,4,0,TAU);g.fill();text('缆车傍晚 5 点前就收班',116,1504,HL41.sub,HL41.subCol,HL41.subW,'left',HL41.subSp);});
}
function titles41(N){
  const day=N>=V41.COVER&&N<V41.TOWN0,ss=N-V41.SUMMIT0,sunset=day?ease(clamp((N-9.8)/1.8)):0,lit=N<V41.COVER?1:N>=V41.VALLEY0?valleyLit41(N-V41.VALLEY0)[2]:N>=V41.TOWN0?1:0;
  STORY_DARK41=N<V41.COVER?0:N<V41.TORII?.36:N<V41.SUMMIT0?.2:N<V41.TOWN0?.14:0;
  g.save();drawHeader(12,{light:.12+.55*sunset+.28*lit,lc:sunset>0?[255,188,111]:lit>0?[255,213,156]:[224,234,241],x:sunset>0?(ss>=0?400:760):600},{title:'弥彦',place:'新潟县弥彦村',story:STORY41,storyT:N,storyShadow:'rgba(8,16,26,.95)',sheen:[440,560,500,260],reflect:true,accent:'#deb985',storyColor:'#fff6e6'});g.restore();
  // 封面那句在片尾最后半秒多先升起来，循环回到第 0 秒时已经在画面上
  headlineC(N>=25.8?{p:easeOut(clamp((N-25.8)/.5)),out:1}:N<2.4?{p:1,out:clamp((2.4-N)/.3)}:0,[['上山看海 ',0],['入夜看秋',1]],'新潟 · 弥彦');
  headlineC(sc41(N,3.6,5.85),[['一之鸟居',1]],'弥彦神社');
  headlineC(sc41(N,6.6,8.8),[['山下参拜 ',0],['山上看海',1]],'十一月，还有菊花祭');
  headlineC(sc41(N,9.5,12.05),[['缆车 ',0],['5',1],[' 分钟到山顶',0]],'走表参道上山 约 90 分钟');
  headlineC(sc41(N,13.1,16.4),[['上山之后 是',0],['海',1]],'山顶望向日本海');
  townCard41(N);
  headlineC(sc41(N,24.1,25.65),[['弥彦公园 ',0],['红叶谷',1]],'观月桥');
}

// ---------------- 每一帧 ----------------
function render(N){
  N=v41Round(fract(N/V41.DUR)*V41.DUR);if(N>=V41.DUR)N=0;
  g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.fillStyle=ink;g.fillRect(0,0,W,H);
  const b=screenA.getContext('2d');CAM_OVERRIDE=null;VPUSH=0;NO_DIR41=false;
  const clear=()=>{b.setTransform(1,0,0,1,0,0);b.globalAlpha=1;b.globalCompositeOperation='source-over';b.clearRect(0,0,W,H);};
  let tTown=null;
  if(N<V41.COVER||N>=V41.VALLEY0){const v=N<V41.COVER?V41.VLEN+N:N-V41.VALLEY0;clear();valleyShot41(b,v);b.setTransform(1,0,0,1,0,0);
    if(N>=V41.VALLEY0)drawGroup41(b,townGust41,N,1-valleyLit41(v)[1]);valleyLeaves41(b,v);}
  else if(N<V41.TORII){const t=v41Round(3.2+N-V41.COVER);paintShot(screenA,'torii',t);b.setTransform(1,0,0,1,0,0);toriiLeaves41Draw(b,t);}
  else if(N<V41.SUMMIT0){const t=v41Round(6.8+N-V41.TORII);paintShot(screenA,shotAt(t),t);}
  else if(N<V41.TOWN0){clear();summitShot41(b,N-V41.SUMMIT0);}
  else{clear();tTown=v41Round(TOWN0+1+(N-V41.TOWN0));townShot(b,tTown);b.setTransform(1,0,0,1,0,0);drawGroup41(b,townGust41,N);}
  g.setTransform(1,0,0,1,0,0);g.drawImage(screenA,0,0);
  if(tTown!==null)drawSfx(g,tTown);
  const vg=g.createRadialGradient(540,900,430,540,900,1250);vg.addColorStop(0,'rgba(2,7,16,0)');vg.addColorStop(1,'rgba(2,7,16,.37)');g.fillStyle=vg;g.fillRect(0,0,W,H);
  wipe41(N);titles41(N);drawTitleLeaves41(N);
}
windLeaves=function(){};   // 旧的成排「彗星」飞叶不再使用
