// ======== 弥彦 V48：V47 + 字不带任何阴影、日月一换就切景、鸟居鞠躬、旅馆开门迎客、桥上各种拍照的人、声音放回 ========
// 由 viz/tools/build-yahiko-v48.py 内嵌进 yahiko-v48.html；不要直接改 HTML 里的这一段。
// 时间轴 N（秒，28.1 循环）。各镜头的画法、日月、换景方式都是 V39 的：
//   0–2.8    亮灯的红叶谷（封面，是片尾那一镜的延续）。一阵风，叶子吹过切点——
//   2.8–6.0  一之鸟居（两人沿参道左边往里走）
//   6.0–12.6 林中拜殿 → 缆车（车厢里两个人的剪影）→ 缆车的景沉下去，山顶的景升上来
//   12.6–16.6 山顶远望：夕阳、佐渡、近坡上的展望塔
//   16.6–17.5 天黑，月亮从海上升起
//   17.5–23.3 山顶的景沉下去，温泉街升上来；两人从画外走进来，近处一棵枫树；起风，大片落叶——
//   23.3–28.1 温泉街沉下去，还没亮灯的红叶谷升上来；落叶接着吹过来，三波点灯，接回开头
const V41={DUR:29.1,COVER:2.8,TORII:6.0,SUMMIT0:12.6,DUSK0:16.6,TOWN0:17.0,VALLEY0:23.3,VLEN:5.8,RISE:.9,TOWN_LEN:6.3};   // V48：日月一换（0.4 秒）就换景；片尾多 1 秒放两段字
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
  const fade=L.o.nofade?1:Math.min(1,(clock-L.o.born)*5);leaf41(b,{x:s.x,y:s.y,r:L.o.size,rz:s.rz,tilt:s.tilt,r0:s.r0,color:L.o.color,rgb:L.o.rgb,alpha:fade*(L.o.alpha||1),dim});}}

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
// 桥上：两人走上桥；灯一亮，停下来对看一眼，抱在一起（抱着的剪影是 V39 原来的）
const bridgeHug41=bridgeVisitors;
// 桥上很多人，各做各的：桥中间一个网红摆姿势、同伴半蹲着给她拍；右边两个人凑在一起自拍、一个人举着手机拍红叶；
// 左边是排队等着上桥中间拍的人——低头看手机的、踮脚张望的、蹦蹦跳跳的小孩，还有那对情侣（头顶一颗粉色的平面爱心）
const FLASH48=[[1.9,538,72],[2.5,703,100],[3.3,538,72],[3.95,781,104],[4.6,538,72],[5.2,703,100],[5.9,538,72],[6.5,781,104],[7.1,538,72],[7.7,703,100],[8.25,538,72]];   // [时刻, x, 离桥面的高度]
function heart47(b,x,y,s){b.save();b.translate(x,y);b.scale(s,s);b.fillStyle='#ff7fa8';b.beginPath();b.moveTo(0,16);b.bezierCurveTo(-34,-8,-22,-34,0,-16);b.bezierCurveTo(22,-34,34,-8,0,16);b.closePath();b.fill();b.restore();}
bridgeVisitors=function(b,t,reflection=false){
  const v=V41V,deck=x=>1090-Math.sin(clamp((x-70)/950)*Math.PI)*60,col=[9,14,22],lit=ease(clamp((v-1.6)/.4)),P=(x,h,o)=>person41(b,x,deck(x),h,Object.assign({col},o));
  b.save();if(reflection){b.translate(0,1300);b.scale(1,-.92);b.translate(0,-1300);b.globalAlpha=.13;}
  // 排队的人；每拍完一张，队伍往前挪半步
  const step=.5-.5*Math.cos(Math.PI*clamp((v-4.7)/.7)),sh=14*step,wk=step>0&&step<1?.5:0;
  P(250+sh,.95,{ph:step*6,walk:wk,bow:.16+.03*Math.sin(v*.8)});                                       // 低头看手机
  P(292+sh,1.04,{ph:step*6+1,walk:wk,robe:true,dir:-1});                                               // 回头和后面的人说话
  {const hop=Math.abs(Math.sin(v*4.2));b.save();b.translate(0,-9*hop);P(322+sh+3*Math.sin(v*2.1),.58,{ph:v*7,walk:.5,arm:.5+.4*hop,point:true});b.restore();}   // 小孩
  const cx=372+sh;P(cx-12,1.0,{ph:step*6+2,walk:wk,dir:1,bow:.06});P(cx+12,.93,{ph:step*6+3,walk:wk,robe:true,dir:-1,bow:.06});   // 情侣：面对面挨着
  {const tip=Math.max(0,Math.sin(v*1.6));b.save();b.translate(0,-5*tip);P(424+sh,.98,{ph:step*6+4,walk:wk,robe:true});b.restore();}  // 踮脚往前张望
  P(466+sh,1.0,{ph:step*6+5,walk:wk,arm:.9*lit,phone:true});                                           // 举着手机先拍一张
  // 桥中间：半蹲着拍的人，和换着姿势的网红
  b.save();b.translate(520,deck(520));b.scale(1,.72);person41(b,0,0,1,{col,dir:1,arm:.62,phone:true,bow:.18});b.restore();
  {const pose=Math.floor(Math.max(0,v-1.9)/1.35)%3,sw=Math.sin(v*1.4);P(606,1.0,{dir:-1,robe:true,arm:[.95,.45,.8][pose],point:pose!==1,bow:[-.06,.1,0][pose]+.02*sw});}
  // 右边：两个人头挨着头自拍；一个人举手机拍头顶的红叶
  P(700,.94,{dir:-1,robe:true,bow:.1});P(722,1.0,{dir:-1,arm:lit,phone:true,bow:-.05});
  P(778,1.02,{dir:1,arm:.95*lit,phone:true,bow:-.1});
  b.restore();
  if(reflection)return;
  for(let k=0;k<3;k++){b.strokeStyle=NU?(k?'#24222e':'#2c2a36'):(k?'#ad4f3b':'#d77953');b.lineWidth=k?5:8;b.beginPath();for(let x=214;x<=816;x+=2)b[x===214?'moveTo':'lineTo'](x,deck(x)-51+k*18);b.stroke();}
  for(let x=214;x<=816;x++){if((x-70)%48===0){b.fillStyle=NU?'#26242f':'#b3513e';b.fillRect(x-3.2,deck(x)-51,6.4,51);}}
  if(v>1.75){const p=clamp((v-1.75)/.45),pop=p<1?1+.9*Math.sin(Math.PI*p)*(1-p)-(1-p)*(1-p):1,bob=Math.sin(v*2.2);heart47(b,cx,deck(cx)-128-5*bob,.8*pop*(1+.05*bob));}
  for(const [t0,x,h] of FLASH48){const f=v<t0?0:Math.exp(-(v-t0)/.2);if(f>.02)flash41(b,x,deck(x)-h,f,h<80?1.2:.95);}
};
// 拜殿：两人在殿前并排拜两下
function hallCouple45(b,age){const bw=Math.max(Math.pow(Math.sin(Math.PI*clamp((age-.45)/.7)),2),Math.pow(Math.sin(Math.PI*clamp((age-1.3)/.7)),2));
  for(const [x,y,sc] of [[HALL45[0]-13,HALL45[1],.31],[HALL45[0]+13,HALL45[1]+1,.29]])person41(b,x,y,sc,{back:true,bow:bw,robe:true,col:[22,30,28]});}
const HALL45=[536,1290];
gladeShot=function(b,t){
  const age=t-GL0,lift=ease(clamp((age-1.6)/1.8));ascentLit(b,t);
  for(const [img,depth,drop] of [[gladeFar,.86,GLADE_REVEAL],[gladeMiddle,1,0],[gladeNear,1.14,0]]){
    const Y=10*age*depth+2180*lift*depth+drop,z=1.06+lift*(depth-1)*.025;
    b.save();b.translate(-26-age*4*depth,Y-8);b.translate(540,1400);b.scale(z,z);b.translate(-540,-1400);b.translate(540*.06/z,1400*.06/z);b.drawImage(img,0,0,W,H);if(img===gladeMiddle)hallCouple45(b,age);b.restore();}
  directionalLeaves(b,t,.4);
};

// ---------------- 红叶谷（片尾 4.8 秒 + 封面 3 秒是同一镜，时钟 v = 0..7.8） ----------------
const camV41=v=>{const k=clamp((v-V41.VLEN)/2.8),e=k*k*(3-2*k);return {z:1.04+.013*Math.min(v,V41.VLEN)+.012*Math.max(0,v-V41.VLEN)+.3*e,x:540+5*v-22*e,y:955-2*v+78*e};};
let V41V=0;
const V41_LIGHT=[1.5,1.64,1.78],V41_RAMP=.12;               // V39 的三波点灯：间隔、亮起的快慢、亮的那一下闪光都照原样
const valleyLit41=v=>V41_LIGHT.map(t0=>easeOut(clamp((v-t0)/V41_RAMP)));
const valleyFlash44=v=>V41_LIGHT.map(t0=>flashAt(v,t0));
function valleyShot41(b,v){
  const lit=valleyLit41(v),fl=valleyFlash44(v),vt=5.6+v;CAM_OVERRIDE=camV41(v);NIGHT_T=23.7+v*.25;NO_DIR41=true;V41V=v;
  const kick=.012*(fl[0]+fl[1]+fl[2]);b.save();b.translate(W/2,H/2);b.scale(1+kick,1+kick);b.translate(-W/2,-H/2);
  const idx=t0=>LIGHTS.findIndex(l=>l[0]===t0);
  valleyShot(b,vt,'reveal',false);
  if(fl.some(a=>a>.01)){const m=tintC.getContext('2d');m.setTransform(1,0,0,1,0,0);m.globalCompositeOperation='source-over';m.clearRect(0,0,W,H);
    maskInto(m,t0=>fl[idx(t0)]);m.globalCompositeOperation='source-in';m.drawImage(b.canvas,0,0,W,H);m.globalCompositeOperation='source-over';
    b.save();b.setTransform(1,0,0,1,0,0);b.globalCompositeOperation='lighter';b.globalAlpha=.45;b.drawImage(tintC,0,0,W,H);b.restore();}
  if(lit[2]<1){
    const u=unlitC.getContext('2d');u.setTransform(1,0,0,1,0,0);u.globalCompositeOperation='source-over';u.globalAlpha=1;u.clearRect(0,0,W,H);
    NU=true;valleyShot(u,vt,'reveal',false);NU=false;
    u.globalCompositeOperation='destination-out';maskInto(u,t0=>lit[idx(t0)]);u.globalCompositeOperation='source-over';
    b.save();b.setTransform(1,0,0,1,0,0);b.drawImage(unlitC,0,0,W,H);b.restore();
  }
  b.restore();CAM_OVERRIDE=null;NO_DIR41=false;
}
// 红叶谷里的叶子：平时零星地落，有的落到水面上漂着；封面时一阵风从左边过来，带走一批，其中一片从镜头前掠过
const VW41=gust41([{U:560,t0:7.3,c:1500,rise:.35,decay:1.7,up:-.16}]);
const valleyAmb41=Array.from({length:26},(_,i)=>{const r=k=>rnd(i,4400+k),q=r(1),size=q<.68?7+r(2)*6:q<.94?15+r(2)*9:30+r(2)*14,water=r(8)<.3&&size<26;
  return mk41({x:40+r(3)*1000,y:330+r(4)*520,born:-2+r(5)*9.2,size,seed:4420+i,color:2+i%5,wind:VW41,life:10,
    land:water?((x,y,o)=>y>=o.wy?{x,y:o.wy,tilt:1.32,rz:(rnd(o.seed,9)-.5)*.3}:null):null,wy:1345+r(9)*210});});
const valleyGust41=Array.from({length:34},(_,i)=>{const r=k=>rnd(i,4500+k),x=-270+r(1)*230;
  return mk41({x,y:240+r(2)*1100,born:7.1+r(3)*1.5,size:r(5)<.8?11+r(4)*17:34+r(4)*26,seed:4520+i,color:2+i%5,wind:VW41,life:5.2,nofade:1,near:r(5)<.8?1:1.35});});
const valleyHero41=mk41({x:-230,y:1330,born:7.3,size:150,seed:4599,rgb:[222,104,40],wind:gust41([{U:900,t0:7.1,c:1500,rise:.25,decay:2.2,up:-.4}]),near:1.7,life:4});   // 封面那阵风里，从镜头前掠过的一片大叶
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
  ...Array.from({length:6},(_,i)=>{const r=k=>rnd(i,4600+k);return mk41({x:-230+r(1)*190,y:520+r(2)*520,born:2.75-r(3)*.2,size:11+r(4)*13,seed:4620+i,color:2+i%5,vx0:330+r(5)*160,vy0:-40,wind:gust41([]),life:6,land:toriiLand41,ly:1500+r(6)*300});}),
  ...Array.from({length:13},(_,i)=>{const r=k=>rnd(i,4700+k),left=r(1)<.5;return mk41({x:left?10+r(2)*230:850+r(2)*220,y:560+r(3)*420,born:3.25+r(4)*2.5,size:8+r(5)*11,seed:4720+i,color:2+i%5,wind:gust41([]),life:6,land:toriiLand41,ly:1480+r(6)*330});}),
];
function toriiLeaves41Draw(b,t){const a=toriiA41(t);
  for(const L of toriiLeaves41){const s=at41(L,t-L.o.born);if(!s)continue;let x=s.x,y=s.y;
    if(s.resting){const w=toriiInv41(x,y,toriiA41(L.sim.restAt));[x,y]=toriiProj41(w[0],w[1],a);b.save();b.globalAlpha=.28;b.fillStyle='#1c1810';b.beginPath();b.ellipse(x+2,y+3,L.o.size*.9,L.o.size*.24,0,0,TAU);b.fill();b.restore();}
    leaf41(b,{x,y,r:L.o.size,rz:s.rz,tilt:s.tilt,r0:s.r0,color:L.o.color,alpha:Math.min(1,(t-L.o.born)*5)});}
}

// ---------------- 温泉街：近处一棵枫树；起风，大片落叶从这里开始，一直吹进红叶谷 ----------------
const NM44_LIMBS=[[[-90,1260],[40,1040],[190,900],[330,790],34],[[130,935],[230,960],[340,930],[440,965],13],[[235,850],[290,720],[370,660],[470,625],15],[[30,1060],[70,930],[95,830],[150,735],12],[[330,790],[420,770],[500,800],[560,770],9]];
const nm44At=(L,s)=>{const q=1-s;return [q*q*q*L[0][0]+3*q*q*s*L[1][0]+3*q*s*s*L[2][0]+s*s*s*L[3][0],q*q*q*L[0][1]+3*q*q*s*L[1][1]+3*q*s*s*L[2][1]+s*s*s*L[3][1]];};
const NM44_PTS=(()=>{const P=[];NM44_LIMBS.forEach((L,li)=>{const n=li?26:30;for(let i=0;i<n;i++){const r=k=>rnd(li*97+i,5100+k),s=(li?.25:.5)+r(1)*(li?.8:.5),c=nm44At(L,Math.min(1,s)),rad=(26+70*r(2))*(li?1:.8),an=r(3)*TAU;
  P.push([c[0]+Math.cos(an)*rad,c[1]+Math.sin(an)*rad*.7+18,20+r(4)*22,r(5),r(6),2+(li*3+i)%5]);}});return P;})();
const nearMaple44=layer(b=>{
  b.lineCap='round';b.lineJoin='round';
  for(const L of NM44_LIMBS){for(let i=0;i<26;i++){const s0=i/26,s1=(i+1.3)/26,a=nm44At(L,s0),c=nm44At(L,Math.min(1,s1));b.strokeStyle=i%2?'#1b1419':'#221a1d';b.lineWidth=L[4]*(1-.82*s0)+2;b.beginPath();b.moveTo(...a);b.lineTo(...c);b.stroke();}}
  // 叶簇：先画暗处的，再画朝着旅馆灯光的
  for(const pass of [0,1])for(const [x,y,r,q1,q2,color] of NM44_PTS){if((q1<.45)!==(pass===0))continue;
    leaf41(b,{x,y,r:r*(pass?1:1.1),rz:(q2-.5)*2.4,tilt:.25+q1*.9,r0:q2*TAU,color,dim:pass?.12+.3*q2:.72});}
},W,H,1);
function drawNearMaple44(b,a,dy){   // a：温泉街时钟；dy：跟着布景一起升降
  const w=townWind(a);b.save();b.translate(-90,1260+dy);b.rotate(.008*Math.sin(a*1.3)+.03*w+.006*w*Math.sin(a*9));b.translate(90,-1260);b.drawImage(nearMaple44,0,0,W,H);b.restore();
}
const TW41=gust41([{U:210,t0:21.2,c:1500,rise:.5,decay:.8,up:-.06},{U:700,t0:21.9,c:1500,rise:.35,decay:2.3,up:-.17}]);
const townGust41=[
  // 起风前：树上偶尔自己落下一两片
  ...Array.from({length:7},(_,i)=>{const r=k=>rnd(i,5200+k),p=NM44_PTS[Math.floor(r(1)*NM44_PTS.length)];return mk41({x:p[0],y:p[1],born:18.7+i*.42+r(2)*.3,size:13+r(3)*10,seed:5220+i,color:p[5],wind:TW41,life:5});}),
  // 起风：近处这棵树上的叶子一批一批被扯下来
  ...Array.from({length:110},(_,i)=>{const r=k=>rnd(i,5300+k),p=NM44_PTS[Math.floor(r(1)*NM44_PTS.length)],q=r(4);return mk41({x:p[0],y:p[1],born:21.4+Math.pow(r(2),1.25)*1.7+(p[0]+100)/1500,size:q<.45?12+r(3)*8:q<.87?21+r(3)*15:42+r(3)*30,seed:5320+i,color:p[5],wind:TW41,life:4.4,near:q>=.87?1.35:1});}),
  // 画面外左边林子里的叶子也跟着这阵风涌进来
  ...Array.from({length:120},(_,i)=>{const r=k=>rnd(i,5400+k),q=r(4);return mk41({x:-50-r(1)*230,y:180+r(2)*1350,born:21.9+r(3)*2.3,size:q<.45?11+r(5)*9:q<.86?20+r(5)*16:46+r(5)*40,seed:5420+i,color:2+i%5,wind:TW41,life:3.8,near:q>=.86?1.45:1});}),
];
const townHero41=mk41({x:-230,y:1250,born:22.15,size:140,seed:4899,rgb:[222,104,40],wind:gust41([{U:900,t0:21.95,c:1500,rise:.25,decay:2.2,up:-.42}]),near:1.7,life:4});   // 这阵风里从镜头前掠过的一片大叶（V39 就有的那片主角叶）
// V39 的漫画风线：温泉街起风、吹进红叶谷、封面吹向鸟居，各一道
const WIND44=[{t0:21.95,t1:22.95,P:[[-150,1500],[300,1340],[720,1520],[1260,980]],la:.45,lb:.66,R:115},
  {t0:23.75,t1:25.0,P:[[-150,720],[320,880],[700,520],[1260,640]],la:.44,lb:.64,R:100},
  {t0:1.45,t1:3.3,P:[[-150,1260],[340,1160],[720,1260],[1260,780]],la:.5,lb:.72,R:130}];


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
const TITLE41_PLAN=[[25.6,1.6,5],[26.4,1.8,3],[27.2,22.7,4],[28.2,1.95,6],[3.5,14.6,6],[4.4,22.8,3],[6.8,14.8,5],[9.0,22.75,4],[18.6,22.9,5]];   // [出生, 被哪阵风带走, 颜色]（循环时钟）
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

// ---------------- 山顶：从空中俯看缆车终点站（展望塔、展望食堂、站房），太阳落在左边的海里，佐渡在右边，不摇镜头 ----------------
// 结构参考：山顶站一带是弥彦山顶公园，有展望台、展望食堂和 100 米高的回转升降展望塔（新潟县观光协会、缆车运营方）。
// 太阳走一段椭圆弧：白天在右上，往左、往下弯过去，傍晚贴着左边的海平线落下
sunScreen=function(T){const th=(T<=13?82+(T-4.8)*(148.7-82)/8.2:148.7+(T-13)*(176-148.7)/3.72)*Math.PI/180;return [760+470*Math.cos(th),830-520*Math.sin(th)];};
const SADO45=[575,1005];
sunsetShot=function(b,t,Tp){
 const u=clamp((t-14.6)/10.6),lift=u*.85+.15*u*u,hy=930-100*lift,Tq=Tp??(13.0+(t-14.6)*4/10.6),S=sunScreen(Tq),pan=0,sunX=S[0]-pan,sunY=S[1]+(hy-930)+sunDrop(Tq);CLOUD_OFF=easeIn(clamp((Tq-16.7)/.3));   // 镜头往下压时，太阳跟着天一起移
 SKY_PAN=pan;if(!NOSKY)sunsetSky(b,u,hy,sunX,sunY);CLOUD_OFF=0;SKY_PAN=0;
 // 佐渡岛：在太阳右边（西北）的海平线上，远、发灰。北边高一点的大佐渡山脊，中间一段平原，南边低一点的小佐渡
 {const x0=SADO45[0],x1=SADO45[1],wd=x1-x0;b.fillStyle=blendTone('#7f7594','#6a6286',u);b.globalAlpha=.8;b.beginPath();b.moveTo(x0,hy+1);
 for(let x=x0;x<=x1;x+=4){const k=(x-x0)/wd,big=Math.max(0,1-Math.abs(k-.7)/.3),small=Math.max(0,1-Math.abs(k-.2)/.2),xw=x+pan;b.lineTo(x,hy-1-42*Math.pow(big,.75)-21*Math.pow(small,.85)-7*Math.pow(Math.sin(Math.PI*k),.5)-3*Math.sin(xw*.13)*(big+small)-1.5*Math.sin(xw*.41)*big-1.5);}
 b.lineTo(x1,hy+1);b.closePath();b.fill();b.globalAlpha=1;}
 const sea=b.createLinearGradient(0,hy,0,H);sea.addColorStop(0,blendTone('#e2b48e','#d6a488',u));sea.addColorStop(.22,blendTone('#8f8ca8','#85809e',u));sea.addColorStop(.6,'#5e7090');sea.addColorStop(1,blendTone('#33506c','#2c4562',u));b.fillStyle=sea;b.fillRect(0,hy,W,H-hy);
 b.save();b.beginPath();b.rect(0,hy,W,H-hy);b.clip();
 glow(b,sunX,hy+250,180,570,[248,191,128],.23);
 // A soft reflection broken into water-sized ripples, not white confetti.
 for(let i=0;i<700;i++){
  const v=rnd(i,2601),yy=hy+3+v*(H-hy),ww=3+v*28,xx=fract(rnd(i,2602)-pan/W)*W+Math.sin(t*.28+i)*2;
  b.fillStyle=i%3?'rgba(231,197,172,.10)':'rgba(62,90,118,.08)';b.fillRect(xx,yy,ww,.5+v*1.2);
 }
 // v15：海面有浪——远处细密、近处宽长，每道浪上沿映天光、下沿暗；慢慢往岸边推
 for(let i=0;i<190;i++){const v=Math.pow(i/190,1.7),yy=hy+3+v*(H-hy),n=5+Math.round(v*4);
  for(let j=0;j<n;j++){const id=i*9+j,len=8+v*110+rnd(id,2621)*v*60,xx=fract(rnd(id,2622)+t*.004*(1+v)-pan/(W+200))*(W+200)-100+Math.sin(t*.6+id)*2*(1+v*3),th=.5+v*2.4;
   b.fillStyle=`rgba(255,226,190,${(.1+.14*(1-v))*(.6+.4*rnd(id,2623))})`;b.fillRect(xx,yy,len,th);
   b.fillStyle=`rgba(24,38,64,${.12+.16*v})`;b.fillRect(xx+len*.1,yy+th+.5+v*2,len*.85,th*1.3);}}
 for(let i=0;i<220;i++){
  const v=i/220,yy=hy+4+v*(H-hy),spread=10+v*v*180,phase=Math.sin(i*2.31+t*.55),xx=sunX+phase*spread*.5;
  const tw=.55+.45*Math.sin(t*5+i*1.7);b.fillStyle=`rgba(255,224,172,${(.35+.42*rnd(i,2612))*(1-v*.62)*tw})`;b.fillRect(xx-(7+v*40)/2,yy,7+v*40,1+v*1.5);   // 太阳的倒影碎成一闪一闪的光
 }
 b.restore();
 // Low mountain silhouettes, open sea and a continuous rise following the scenic reference.
 sunsetLandV2(b,t,u,lift,hy);
};
sunsetLit=function(b,t){
  sunsetShot(b,t);const u=clamp((t-14.6)/10.6);
  let k=0;while(k<SUNSET_GRADE.length-2&&u>SUNSET_GRADE[k+1][0])k++;
  const [u0,c0]=SUNSET_GRADE[k],[u1,c1]=SUNSET_GRADE[k+1],f=ease(clamp((u-u0)/(u1-u0))),rgb=c0.map((v,i)=>Math.round(lerp(v,c1[i],f)));
  const c=tintC.getContext('2d');c.setTransform(1,0,0,1,0,0);c.fillStyle=`rgb(${rgb.join(',')})`;c.fillRect(0,0,W,H);
  b.save();b.setTransform(1,0,0,1,0,0);b.globalCompositeOperation='multiply';b.drawImage(tintC,0,0,W,H);
  const lift=u*.85+.15*u*u,hy=930-100*lift,Ss=sunScreen(13.0+(t-14.6)*4/10.6),sx=Ss[0]-0,sy=Ss[1]+(hy-930)+sunDrop(13.0+(t-14.6)*4/10.6),g2=Math.sin(Math.PI*clamp((u-.2)/.7));
  b.globalCompositeOperation='lighter';glow(b,sx,sy,460,170,[255,196,140],.15*g2);b.restore();
};
// 山顶站照实拍重画（新潟县观光协会「弥彦山ロープウェー山頂駅」等照片）：林子里一块不大的空地，一栋红褐色四坡顶的平房站房，
// 旁边一小块带木栏杆的观景台；展望塔在站房后面。
const TOWER_X46=452,TOWER_Y46=842;
const SUMMIT_WIN45=[[612,1262,26,24],[652,1261,26,24],[736,1258,26,24],[776,1257,26,24],[816,1256,26,24],[888,1262,18,20]];
const summitL45=layer(b=>{
  const wallL='#cf7f5e',wall='#a35c48',wallD='#74404a',roofL='#b25a48',roof='#84403c',roofD='#5a2e3a',wood='#5a4238';
  // 展望塔（在站房后面）
  poly(b,[[424,1300],[424,1262],[452,1258],[452,1300]],'#edc7a4');poly(b,[[452,1300],[452,1258],[482,1262],[482,1300]],'#62506a');
  poly(b,[[445,1262],[448,760],[452,760],[452,1262]],'#edc7a4');poly(b,[[452,1262],[452,760],[456,760],[459,1262]],'#62506a');
  poly(b,[[430,858],[426,843],[432,828],[452,828],[452,858]],'#edc7a4');poly(b,[[452,858],[452,828],[472,828],[478,843],[474,858]],'#62506a');
  b.fillStyle='rgba(60,48,70,.75)';for(let k=0;k<8;k++)b.fillRect(431+k*5.4,836,3.2,8);
  b.strokeStyle='#62506a';b.lineWidth=2;b.beginPath();b.moveTo(452,760);b.lineTo(452,730);b.stroke();
  // 林间空地和观景台（不大）
  poly(b,[[300,1330],[380,1300],[600,1296],[640,1318],[600,1352],[340,1362]],'#b79a86');poly(b,[[300,1330],[380,1300],[600,1296],[640,1318],[470,1322]],'#c9aa93');
  b.strokeStyle=wood;b.lineWidth=3;b.beginPath();b.moveTo(304,1320);b.lineTo(382,1291);b.lineTo(540,1288);b.stroke();b.lineWidth=2;b.beginPath();b.moveTo(304,1327);b.lineTo(382,1298);b.lineTo(540,1295);b.stroke();
  for(let x=306;x<540;x+=26){const y=x<382?1320-(x-304)*.372:1291-(x-382)*.02;b.fillStyle=wood;b.fillRect(x,y-3,4,16);}
  poly(b,[[548,1300],[548,1272],[590,1271],[590,1300]],'#6b4f40');b.fillStyle='#e6d2b8';b.fillRect(553,1277,32,9);   // 「弥彦山顶」木牌
  // 站房：红褐色四坡顶的平房，右边接着出车的站台棚
  poly(b,[[578,1316],[578,1240],[600,1248],[600,1326]],wallL);poly(b,[[600,1326],[600,1248],[930,1238],[930,1312]],wall);
  poly(b,[[556,1244],[640,1178],[872,1170],[962,1232],[930,1244],[600,1254]],roof,roofD,1.2);poly(b,[[556,1244],[640,1178],[650,1186],[600,1254]],roofL);poly(b,[[640,1178],[872,1170],[880,1178],[650,1186]],roofL);
  poly(b,[[690,1326],[690,1262],[722,1261],[722,1325]],wallD);poly(b,[[676,1262],[706,1236],[738,1260]],roof,roofD,1);   // 入口的小山墙
  poly(b,[[930,1312],[930,1244],[1010,1262],[1010,1322]],wallD);poly(b,[[914,1240],[962,1226],[1040,1256],[1010,1268],[930,1250]],roofD);poly(b,[[946,1312],[946,1268],[1000,1278],[1000,1318]],'#2a2030');
  for(const [x,y,w,h] of SUMMIT_WIN45){b.fillStyle='#3a2c3c';b.fillRect(x,y,w,h);b.fillStyle='#e9d9c4';b.fillRect(x-1.5,y+h/2-1,w+3,2);}
  b.fillStyle='#2f5fa0';b.fillRect(742,1242,80,11);   // 蓝底白字的站名牌
  // 把空地围起来的树
  for(let i=0;i<26;i++){const r=k=>rnd(i,6600+k),x=i<9?250+i*12+r(1)*36:i<17?600+(i-9)*44+r(1)*20:300+r(1)*640,y=i<9?1350+r(2)*22:i<17?1338+r(2)*16:1372+r(2)*18,q=16+r(3)*14;
    b.fillStyle=['#8a3d2c','#a8502e','#b8702f','#7a3328','#5e3a30'][i%5];b.beginPath();b.arc(x,y,q,0,TAU);b.fill();b.fillStyle='rgba(255,196,130,.26)';b.beginPath();b.arc(x-q*.3,y-q*.3,q*.6,0,TAU);b.fill();}
},W,H,1);
function summit45(b,t,u){
  b.drawImage(summitL45,0,0,W,H);
  const on=clamp((u-.4)/.35);if(on>0){for(const [x,y,w,h] of SUMMIT_WIN45){b.fillStyle=`rgba(255,214,150,${.9*on})`;b.fillRect(x,y,w,h);}b.save();b.globalCompositeOperation='lighter';glow(b,760,1290,220,60,[255,190,120],.16*on);b.restore();}
  for(const [off,col,w] of [[-3,'#d6c8c0',1],[0,'#40343f',2]]){b.strokeStyle=col;b.lineWidth=w;b.beginPath();b.moveTo(985,1290+off);b.lineTo(1230,1560+off);b.stroke();}
  if(PLAZA45!==null){const s=PLAZA45,cx=lerp(1170,1030,easeOut(clamp((s+.5)/3.2)));refinedCabin39(b,cx,1290+(cx-985)*1.102+2,.2);}
}
// 塔上的灯：像灯塔一样转着照出去。天还亮时淡淡的，太阳落下、天一黑就是画面里最亮的东西
function beam46(b,T,al,dy){
  if(al<=0)return;const [x,y0]=TOWER46,y=y0+dy;b.save();b.globalCompositeOperation='lighter';
  for(const ph of [0,Math.PI]){const a=T*1.9+ph,c=Math.cos(a),sn=Math.sin(a),front=.5+.5*sn,L=820,ex=x+c*L,ey=y+sn*L*.2+40*front,wd=40+90*front,nx=-(ey-y),ny=ex-x,nl=Math.hypot(nx,ny)||1;
    const q=b.createLinearGradient(x,y,ex,ey);q.addColorStop(0,`rgba(255,244,206,${al*(.34+.3*front)})`);q.addColorStop(1,'rgba(255,244,206,0)');b.fillStyle=q;
    b.beginPath();b.moveTo(x,y-3);b.lineTo(ex+nx/nl*wd,ey+ny/nl*wd);b.lineTo(ex-nx/nl*wd,ey-ny/nl*wd);b.lineTo(x,y+3);b.closePath();b.fill();}
  glow(b,x,y,90,70,[255,238,200],.5*al);glow(b,x,y,20,16,[255,255,240],.9*al);b.restore();
}
sunsetLandV2=function(b,t,u,lift,hy){
  const base=hy-930,ay=1300+base,z=1.03+.05*u;b.save();b.translate(540,ay);b.scale(z,z);b.translate(-540,-ay);   // 无人机慢慢往前、往下压
  b.drawImage(coastLand,0,base+20*lift,W,H);
  for(const l of coastLights){const a=clamp((u-.35-l.on*.5)/.15);if(a<=0)continue;const x=l.x,y=l.y+base+20*lift;glow(b,x,y,14,10,[255,200,130],.5*a);b.fillStyle=`rgba(255,226,170,${a})`;b.fillRect(x-l.s/2,y-l.s/2,l.s,l.s);}
  b.drawImage(slopeMidV2,-8*u,base-50+45*lift,W,H);
  const nx=-12*u,ny=base-300+85*lift;
  b.drawImage(slopeNearV2,nx-30,ny,W+60,H);b.drawImage(slopeNearV2,nx-160,ny+250,W+220,H);b.drawImage(slopeNearV2,nx-90,ny+560,W+140,H);
  b.save();b.translate(nx,ny+300);{const m=b.getTransform();TOWER46=[m.a*TOWER_X46+m.c*TOWER_Y46+m.e,m.b*TOWER_X46+m.d*TOWER_Y46+m.f];}summit45(b,t,u);b.restore();
  b.restore();
};

// ---------------- 鸟居：两个人沿参道左边往里走（背影，匀速，不停步）。放字的地方由画面自己压暗 ----------------
const toriiShade42=layer(b=>{glow(b,330,330,560,300,[26,44,32],.62);
  for(let i=0;i<22;i++){b.save();b.translate(-60+rnd(i,6201)*760,200+rnd(i,6202)*330);b.rotate(-.2+rnd(i,6203)*.9);shrineSpray(b,0,0,230+rnd(i,6204)*200,6210+i,['#22392a','#2c4a34','#1c3024'][i%3]);b.restore();}},W,720,1);
const TORII_COUPLE44=[[-2.3,0,1],[-1.72,1.5,.94]];   // [参道上的横向位置, 步子的相位, 身高]
function toriiCouple44(b,a){   // 画在鸟居的世界坐标里：先在鸟居前站定、一起鞠一躬，再走进去
  const bw=Math.pow(Math.sin(Math.PI*clamp((a-.3)/1.05)),2),go=Math.max(0,a-1.5),walk=clamp(go/.15),Z=7.5+1.95*go;
  for(const [X,ph,sc] of TORII_COUPLE44){const f=TP(X,0,Z),h=TP(X,1.66*sc,Z),s=(f[1]-h[1])/103;
    b.save();b.globalAlpha=.26;b.fillStyle='#1c2416';b.translate(f[0],f[1]);b.rotate(-.5);b.beginPath();b.ellipse(0,s*40,s*13,s*44*(1-.25*bw),0,0,TAU);b.fill();b.restore();
    person41(b,f[0],f[1],s,{back:true,ph:go*5.4+ph,walk,bow:bw,robe:true,col:[24,32,28],lift:[18,16,8]});}
}
function torii42(b,a){
  toriiCouple44(b,a);
  b.save();b.setTransform(1,0,0,1,0,0);b.drawImage(toriiShade42,0,0,W,720);b.restore();
  const q=b.createLinearGradient(0,1360,0,1580);q.addColorStop(0,'rgba(34,40,26,0)');q.addColorStop(.35,'rgba(34,40,26,.46)');q.addColorStop(.7,'rgba(34,40,26,.46)');q.addColorStop(1,'rgba(34,40,26,0)');b.fillStyle=q;b.beginPath();b.moveTo(120,1360);b.lineTo(960,1360);b.lineTo(1120,1580);b.lineTo(-40,1580);b.closePath();b.fill();
}

// ---------------- 缆车：车厢改成两扇大玻璃，逆着天光能看清里面只有这两个人 ----------------
let CAB45=0,PLAZA45=null,CABOTHER46=false,CABNEAR46=0,TOWER46=[540,900];
// 缆车是两节车厢对开（うみひこ、やまひこ）：上山这一节走到半路，下山那一节从对面过来，两边的人互相挥手
ascentNew=function(b,t){
  const travel=(t-AS0)*155,followX=travel*.23,followY=travel*.18;
  if(!NOSKY){b.fillStyle='#426f89';b.fillRect(0,0,W,H);}
  b.drawImage(NOSKY?asFarLand:asFar,-45-followX*.15,-80+followY*.18,W+90,H+160);
  b.save();b.translate(-followX,followY);b.drawImage(asMid,-180,-80,W+360,H+160);b.restore();
  b.save();b.translate(-followX,followY);b.translate(-180,-80);b.scale((W+360)/W,(H+160)/H);
  const x=235+travel*2.45,x2=820-travel*2.25,k2=((H+160)/H)/((W+360)/W);CABNEAR46=Math.pow(clamp(1-Math.abs(x2-x-60)/430),.7);
  // 对面那条线在后面一点、高一点
  for(const [off,col,w] of [[-5,'#c9d2c8',1.1],[0,'#4c5c5a',2.2]]){b.strokeStyle=col;b.lineWidth=w;b.beginPath();b.moveTo(-100,asCable(-100)-118+off);b.lineTo(1300,asCable(1300)-118+off);b.stroke();}
  b.save();b.translate(x2,asCable(x2)-118);b.scale(k2*-1,1);CABOTHER46=true;refinedCabin(b,0,0,.8);CABOTHER46=false;b.restore();
  for(const [off,col,w] of [[-6,'#d6dccf',1.4],[0,'#3a4a48',3],[8,'#d6dccf',1.2]]){b.strokeStyle=col;b.lineWidth=w;b.beginPath();b.moveTo(-100,asCable(-100)+off);b.lineTo(1180,asCable(1180)+off);b.stroke();}
  b.save();b.translate(x,asCable(x));b.scale(k2,1);refinedCabin(b,0,0,1.08);b.restore();
  b.restore();
  b.drawImage(asNear,-180-followX*1.45,-80+followY*1.45,W+360,H+160);
  glow(b,880,930,480,360,[255,183,108],.055);
  leaves(b,t);
};

const refinedCabin39=refinedCabin;
refinedCabin=function(b,x,y,s){
  if(s<.5){refinedCabin39(b,x,y,s);return;}
  const d=24,wy=x=>-(x+134)*.118;   // d：车身加高，全留给车窗；wy：车身横线的斜度
  b.save();b.translate(x,y);b.scale(-s,s);b.lineJoin='round';b.lineCap='round';
  b.strokeStyle='#344e50';b.lineWidth=8;b.beginPath();b.moveTo(-50,-28.5);b.lineTo(50,28.5);b.stroke();
  for(const xx of [-39,-23,23,39]){b.fillStyle='#233c40';b.beginPath();b.arc(xx,xx*.57,6,0,TAU);b.fill();b.strokeStyle='#b9c9c1';b.lineWidth=1.7;b.stroke();}
  b.strokeStyle='#b5c8bc';b.lineWidth=12;b.beginPath();b.moveTo(3,8);b.bezierCurveTo(13,50,10,87,-22,121);b.lineTo(-22,145);b.stroke();
  b.strokeStyle='#edf0da';b.lineWidth=3;b.beginPath();b.moveTo(0,10);b.bezierCurveTo(9,51,6,86,-26,120);b.stroke();
  poly(b,[[-45,140],[0,134],[16,149],[-51,157]],'#667f73');
  poly(b,[[-145,169],[-136,155],[57,133],[72,137],[132,166],[135,178],[61,167],[-145,190]],'#5ca394','#2b625c',1.5);
  poly(b,[[-136,157],[57,136],[119,165],[61,158],[-139,179]],'#84b9a2');
  poly(b,[[-142,186],[61,163],[61,282+d],[-134,306+d],[-143,295+d]],'#d4ddc6');
  poly(b,[[61,163],[132,177],[129,290+d],[61,282+d]],'#9db5a7');
  // 侧面一整面玻璃：透过去是亮的天，人是逆光的剪影
  const win=[[-134,193],[53,171],[53,255+d],[-134,278+d]],end=[[69,174],[123,184],[121,255+d],[69,252+d]];
  poly(b,win,'#244c57');poly(b,end,'#31535a');
  b.save();poly(b,win,null);b.clip();
  grad(b,-140,165,200,150,[[0,'rgba(255,240,212,.96)'],[.55,'rgba(250,220,178,.94)'],[1,'rgba(236,190,146,.92)']]);
  const ink='#13242a',floor=xx=>278+d+wy(xx)+4;
  // 高一点的那个抬手指着窗外，矮一点的靠着他
  const k=CAB45,other=CABOTHER46,near=CABNEAR46,up=other?0:ease(clamp((k-9.7)/.5))*(1-near),wave=near,lean=other?0:3*ease(clamp((k-10.1)/.6));
  for(const [xx0,hh,arm] of (other?[[-70,80,0],[-20,84,0],[20,70,0]]:[[-96,86,1],[-62,76,0]])){const xx=xx0-(arm?0:lean),fy=floor(xx),hy=fy-hh;b.fillStyle=ink;b.strokeStyle=ink;
    b.beginPath();b.ellipse(xx+(arm?1.5:-2),hy,8.6,10,arm?.1:-.16,0,TAU);b.fill();
    b.beginPath();b.moveTo(xx-4,hy+9);b.quadraticCurveTo(xx-17,hy+13,xx-18,hy+30);b.lineTo(xx-17,fy);b.lineTo(xx+17,fy);b.lineTo(xx+18,hy+30);b.quadraticCurveTo(xx+17,hy+13,xx+4,hy+9);b.closePath();b.fill();
    if(arm&&wave<.5){b.lineWidth=7;b.beginPath();b.moveTo(xx-14,hy+20);b.quadraticCurveTo(xx-30,lerp(hy+36,hy+22,up),lerp(xx-24,xx-41,up),lerp(hy+52,hy+2,up));b.stroke();}
    if(wave>0&&!(other&&xx0===-20)){b.lineWidth=6;b.beginPath();b.moveTo(xx+13,hy+20);b.quadraticCurveTo(xx+24,hy+14,xx+22+5*Math.sin(k*13+xx0),hy+20-34*wave);b.stroke();}}   // 一个抬手指窗外，另一个凑过来，快到站时挥挥手
  poly(b,[[-128,192],[-106,189],[-126,300],[-137,301]],'rgba(255,255,255,.22)');poly(b,[[8,177],[30,174],[2,286],[-18,288]],'rgba(255,255,255,.16)');b.restore();
  b.save();poly(b,end,null);b.clip();grad(b,60,170,70,120,[[0,'rgba(255,236,206,.5)'],[1,'rgba(228,186,150,.35)']]);b.restore();
  for(const xx of [-22,53]){const yy=193+wy(xx);b.strokeStyle='#c6d7c6';b.lineWidth=4.4;b.beginPath();b.moveTo(xx,yy);b.lineTo(xx,yy+85+d);b.stroke();b.strokeStyle='#658d87';b.lineWidth=1;b.beginPath();b.moveTo(xx+2.6,yy+1);b.lineTo(xx+2.6,yy+84+d);b.stroke();}
  b.strokeStyle='#c6d7c6';b.lineWidth=3.2;b.beginPath();b.moveTo(-134,193);b.lineTo(53,171);b.moveTo(-134,278+d);b.lineTo(53,255+d);b.moveTo(-133,193);b.lineTo(-133,278+d);b.stroke();
  b.strokeStyle='#bccdbb';b.lineWidth=3;b.beginPath();b.moveTo(96,180);b.lineTo(95,252+d);b.stroke();
  poly(b,[[-142,280+d],[61,257+d],[129,261+d],[129,270+d],[61,268+d],[-140,292+d]],'#e7c263');
  poly(b,[[-139,295+d],[61,272+d],[129,275+d],[128,291+d],[61,290+d],[-132,313+d],[-140,305+d]],'#327d6b');
  poly(b,[[-132,313+d],[61,290+d],[128,291+d],[117,300+d],[58,301+d],[-123,322+d]],'#254d4b');
  b.strokeStyle='#bad4b9';b.lineWidth=1.5;b.beginPath();b.moveTo(-132,297+d);b.lineTo(57,275+d);b.stroke();
  for(let j=0;j<5;j++){b.strokeStyle='#306453';b.lineWidth=1;b.beginPath();b.moveTo(77+j*6,280+d);b.lineTo(77+j*6,287+d);b.stroke();}
  b.restore();
};

// ---------------- 温泉街：两个人从画面下方走进来，按平常的步子走到足汤边；起风时抬头看落叶 ----------------
townWind=function(a){const gust=(s,l,m)=>{const u=(a-s)/l;return u>0&&u<1?m*Math.pow(Math.sin(Math.PI*u),2):0;};
  return gust(4.2,2.7,1.25)+.055*Math.sin(a*2.1)*Math.min(1,Math.max(0,a));};   // 大风挪到这一镜的后段，接着吹进红叶谷
drawTownLeafCarryV33=function(){};   // V39 这里的叶子是红叶谷那阵风带来的；现在红叶谷在后面，风从这里起
const TOWN_DOOR48=[652,1200];
townCoupleV25=function(b,a){
  // 旅馆的人拉开门出来，在门口鞠躬迎客；门里的灯光照到门前
  const open=ease(clamp((a-3.6)/.5)),out=ease(clamp((a-4.0)/.6)),greet=Math.pow(Math.sin(Math.PI*clamp((a-4.7)/1.3)),2);
  if(open>0){b.fillStyle=`rgba(255,220,160,${.92*open})`;b.fillRect(TOWN_DOOR48[0]-20*open,1126,40*open,74);b.save();b.globalCompositeOperation='lighter';glow(b,TOWN_DOOR48[0],1215,110*open,40*open,[255,200,130],.3*open);b.restore();}
  if(out>0)person41(b,TOWN_DOOR48[0]+2,TOWN_DOOR48[1]+14*out,.82,{ph:out*5,walk:out<1?.6:0,robe:true,bow:.55*greet,col:[30,20,22],lift:[26,16,8],alpha:Math.min(1,out*3)});
  const u=clamp((a-.6)/3.3),e=1-Math.pow(1-u,1.35),q=1-e,P=[[672,2030],[676,1660],[752,1432]],x=q*q*P[0][0]+2*q*e*P[1][0]+e*e*P[2][0],y=q*q*P[0][1]+2*q*e*P[1][1]+e*e*P[2][1];
  const s=lerp(1.45,2.5,clamp((y-1432)/600)),walk=clamp((1-u)/.07),ph=e*24,back=Math.pow(Math.sin(Math.PI*clamp((a-5.0)/1.0)),2),col=[9,14,22];
  person41(b,x-17*s,y-3*s,s,{back:true,ph:ph+1.5,walk,robe:true,col,arm:.8*ease(clamp((a-5.3)/.45))});   // 一个伸手去接落叶
  person41(b,x+15*s,y,s*.95,{back:true,ph,walk,robe:true,col,bow:.8*back});                              // 一个朝门口回礼
};
townMoonTime=a=>17.4+a;
moonG=function(T){const th=(T<18.4?60*(1-Math.pow(1-clamp((T-17)/1.4),2)):T<23.7?60+10*(T-18.4)/5.3:70+6*clamp((T-23.7)/2.2))*Math.PI/180;return [560+440*Math.cos(th),1250-980*Math.sin(th)];};

// ---------------- 字：极简，不加字影。可读性靠画面本身（放字的地方是暗的、平的），实在不够才在字后面铺一片很淡很大的暗 ----------------
const HL42={size:74,weight:400,sp:7,y1:1440,sub:38,subW:500,subSp:4,y2:1512,subCol:'rgba(255,246,230,.96)'};
const scrim42=()=>verticalSprite('type-v47-caption',[[0,[5,12,20,0]],[.4,[5,12,20,84]],[.74,[5,12,20,84]],[1,[5,12,20,0]]]);
headlineC=function(s,segs,sub){
  rise(s,()=>{g.shadowColor='transparent';g.shadowBlur=0;g.shadowOffsetY=0;
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

  const bar=g.createLinearGradient(0,447,0,491);bar.addColorStop(0,'#e0563a');bar.addColorStop(1,'#f0be7c');g.fillStyle=bar;g.fillRect(80,447,3,44);
  let x=102,y=480;g.textAlign='left';
  [...str].forEach((c,i)=>{const lat=/[0-9A-Za-z]/.test(c);setFont(size,500,1.5,lat?'latin':'cjk');const w=g.measureText(c).width;if(x+w>990){x=102;y+=58;}
    const p=inst||i<4?1:ease(clamp((age-(i-4)*.05)/.38));if(p>0){g.save();g.globalAlpha=p;g.translate(x-6*(1-p),y-11*(1-p));g.rotate(-.12*(1-p));g.fillStyle=lat?'#f4c68c':color;g.fillText(c,0,0);g.restore();}x+=w;});
  g.restore();
};

// ---------------- 字幕：文字是 V39 的原话，只按新顺序改了出现的时间 ----------------
const STORY41=[[-2,0,'白天来，夜里来，都好看。'],[V41.COVER,0,'新潟坐电车，在吉田换乘弥彦线。'],[V41.TORII,0,'新潟到弥彦，约一个半小时。'],[9.4,0,'弥彦山 634 米，和晴空塔一样高。'],[V41.SUMMIT0,0,'天晴时，能看到佐渡岛。'],[V41.TOWN0,0,'下山后，住一晚弥彦温泉。'],[V41.VALLEY0,0,'红叶谷晚上点灯，很多人来拍照打卡。'],[28.3,0,'白天来，夜里来，都好看。']];
const sc41=(N,from,to)=>N<from||N>to?0:{p:easeOut((N-from)/.55),out:clamp((to-N)/.35)};
function endCard47(N){   // 片尾提醒放在最后一镜（红叶谷点灯之后）：左对齐两行 + 一行小字，小字前面是一片小枫叶
  rise(sc41(N,26.6,28.6),()=>{g.shadowColor='transparent';g.shadowBlur=0;
    text('红叶最好看的时节',92,1340,62,HL_C.head,400,'left',4);text('通常在',92,1424,62,HL_C.head,400,'left',4);text('十一月中上旬哦',92+measure('通常在',62,400,4)+18,1424,62,HL_C.key,400,'left',4);});
  rise(sc41(N,27.0,28.6),()=>{g.shadowColor='transparent';g.shadowBlur=0;leaf41(g,{x:108,y:1506,r:17,rz:-.35,tilt:.35,color:4});text('红叶情报 官网会更新哦～',134,1518,40,HL_C.key,500,'left',2);});
}
function titles41(N){
  const day=N>=V41.COVER&&N<V41.DUSK0,sunset=day?ease(clamp((N-9.9)/1.8))*(1-ease(clamp((N-16.3)/.3))):0,lit=N<V41.COVER?1:N>=V41.VALLEY0?valleyLit41(N-V41.VALLEY0)[2]:N>=V41.TOWN0?ease(clamp((N-V41.TOWN0)/1)):0;
  STORY_DARK42=N<V41.TORII?0:N<V41.SUMMIT0?.24:N<V41.DUSK0?.12:0;
  g.save();drawHeader(12,{light:.12+.55*sunset+.28*lit,lc:sunset>0?[255,188,111]:lit>0?[255,213,156]:[224,234,241],x:sunset>0?sunScreen(Math.min(17,N+.4))[0]:600},{title:'弥彦',place:'新潟县弥彦村',story:STORY41,storyT:N,storyShadow:'rgba(8,16,26,.95)',sheen:[440,560,500,260],reflect:true,accent:'#deb985',storyColor:'#fff6e6'});g.restore();
  headlineC(N>=28.7?{p:easeOut(clamp((N-28.7)/.4)),out:1}:N<2.4?{p:1,out:clamp((2.4-N)/.3)}:0,[['弥彦公园 ',0],['红叶谷',1]],'观月桥');   // 封面：桥的名字
  headlineC(sc41(N,24.9,26.4),[['上山看海 ',0],['入夜看秋',1]],'新潟 · 弥彦');                       // 灯亮起来的时候
  headlineC(sc41(N,3.6,5.85),[['一之鸟居',1]],'弥彦神社');
  headlineC(sc41(N,7.0,9.2),[['山下参拜 ',0],['山上看海',1]],'十一月，还有菊花祭');
  headlineC(sc41(N,10.4,12.4),[['缆车 ',0],['5',1],[' 分钟到山顶',0]],'走表参道上山 约 90 分钟');
  headlineC(sc41(N,13.6,16.25),[['上山之后 是',0],['海',1]],'山顶望向日本海');
  headlineC(sc41(N,18.4,22.7),[['看完日落 是',0],['温泉小镇',1]],'有的旅馆 已经开了 300 多年');
  endCard47(N);
}


// ---------------- 每一帧 ----------------
function render(N){
  N=v41Round(fract(N/V41.DUR)*V41.DUR);if(N>=V41.DUR)N=0;
  g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.fillStyle=ink;g.fillRect(0,0,W,H);
  CAB45=N;PLAZA45=N>=V41.SUMMIT0-.5&&N<V41.DUSK0?N-V41.SUMMIT0:null;
  const b=screenA.getContext('2d');CAM_OVERRIDE=null;VPUSH=0;NO_DIR41=false;NOSKY=false;NU=false;SKYONLY=false;
  const clear=(c=b)=>{c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.clearRect(0,0,W,H);};
  let tTown=null;
  if(N<V41.COVER||N>=V41.VALLEY0){const v=N<V41.COVER?V41.VLEN+N:N-V41.VALLEY0;clear();
    if(v<V41.RISE){   // 换景（V39 的方式）：温泉街沉下去，还没亮灯的红叶谷从下面升上来；夜空和月亮不断
      const vt=5.6+v;CAM_OVERRIDE=camV41(v);NIGHT_T=23.7+v*.25;NO_DIR41=true;V41V=v;
      SKYONLY=true;valleyShot(b,vt,'reveal',false);SKYONLY=false;b.setTransform(1,0,0,1,0,0);
      const down=H*easeIn(clamp(v/.6)),s=setC.getContext('2d');clear(s);townSetDraw(s,V41.TOWN_LEN);b.drawImage(setC,0,down,W,H);drawNearMaple44(b,V41.TOWN_LEN+v,down);
      const u=unlitC.getContext('2d');clear(u);NOSKY=true;NU=true;valleyShot(u,vt,'reveal',false);NU=false;NOSKY=false;b.setTransform(1,0,0,1,0,0);b.drawImage(unlitC,0,H*(1-easeOut(clamp((v-.1)/.8)))*.9,W,H);
      CAM_OVERRIDE=null;NO_DIR41=false;}
    else valleyShot41(b,v);
    b.setTransform(1,0,0,1,0,0);if(N>=V41.VALLEY0){drawGroup41(b,townGust41,N,.75*(1-valleyLit41(v)[1]));drawGroup41(b,[townHero41],N,.6*(1-valleyLit41(v)[1]));}valleyLeaves41(b,v);}
  else if(N<V41.TORII){const t=v41Round(3.2+N-V41.COVER);paintShot(screenA,'torii',t);b.setTransform(1,0,0,1,0,0);toriiLeaves41Draw(b,t);drawGroup41(b,valleyGust41,V41.VLEN+N);drawGroup41(b,[valleyHero41],V41.VLEN+N);}   // 封面那阵风里的叶子原样吹过切点
  else if(N<V41.SUMMIT0){const t=v41Round(6.4+N-V41.TORII);paintShot(screenA,shotAt(t),t);}
  else if(N<V41.DUSK0){const t=v41Round(13.0+N-V41.SUMMIT0);paintShot(screenA,'sunset',t);b.setTransform(1,0,0,1,0,0);beam46(b,17.0+(N-V41.DUSK0),.65*ease(clamp((N-13.9)/.9)),0);}
  else if(N<V41.TOWN0){   // V39 的日月切换：太阳一下去天就黑了，月亮从另一边的海平线升起来，海上有它的倒影；塔上的灯扫过来
    clear();const T=17.0+(N-V41.DUSK0),c=camV41(0),m=moonG(T),hy=830;NIGHT_T=T;b.save();camera(b,c.z,c.x,c.y);b.drawImage(nightSkyL,0,0,W,H);b.restore();
    MOONDX=c.x+(m[0]-540)/c.z-785;MOONDY=c.y+(m[1]-960)/c.z-570;drawMoonAt(b,m[0],m[1],c.z);
    const c2=landC.getContext('2d');clear(c2);NOSKY=true;sunsetShot(c2,25.2,40);NOSKY=false;gradeSet(c2,[70,80,124]);b.drawImage(landC,0,0,W,H);
    beam46(b,T,1,0);}
  else{   // 温泉街：山顶的景沉下去，温泉街从下面升上来；月亮接着走
    clear();const a=N-V41.TOWN0;tTown=v41Round(TOWN0+a);CAM_OVERRIDE=camV41(0);
    const vs=valleyShot;if(a<.7)valleyShot=function(s){sunsetShot(s,25.2,40);gradeSet(s,[70,80,124]);};
    townShot(b,tTown);valleyShot=vs;CAM_OVERRIDE=null;b.setTransform(1,0,0,1,0,0);if(a<.65)beam46(b,17.4+a,1,H*easeIn(clamp(a/.65)));
    drawNearMaple44(b,a,H*(1-easeOut(clamp((a-.1)/.9)))*.9);drawGroup41(b,townGust41,N);drawGroup41(b,[townHero41],N);}
  g.setTransform(1,0,0,1,0,0);g.drawImage(screenA,0,0);
  for(const w of WIND44)drawWindLines(g,w,N);
  if(tTown!==null)drawSfx(g,tTown);
  const vg=g.createRadialGradient(540,900,430,540,900,1250);vg.addColorStop(0,'rgba(2,7,16,0)');vg.addColorStop(1,'rgba(2,7,16,.37)');g.fillStyle=vg;g.fillRect(0,0,W,H);
  titles41(N);drawTitleLeaves41(N);
}

