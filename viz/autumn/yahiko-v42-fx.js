// ======== 弥彦 V42：恢复 V38 的时间轴、日月主线和全部转场，只换这些 ========
// 由 viz/tools/build-yahiko-v42.py 内嵌进 yahiko-v42.html；不要直接改 HTML 里的这一段。
// 换掉的：山顶那一镜的布景（按 Chen 的实拍重画）、太阳改为落向左边、叶片画法、落在标题上的叶子、
//        大字和旁白的样式（不加字影）、鸟居前的参拜者、温泉街走向旅馆的两个人。
// 没动的：镜头顺序和时长（27.8 秒）、每个切点的换景方式、风和叶子跨切点的接力、桥上相拥的两个人、声音。
const DUR42=27.8;
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

// ---------------- 人物：平涂剪影 ----------------
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
const TITLE41_PLAN=[[20.6,1.2,5],[21.4,1.5,3],[22.3,26.95,4],[3.6,19.3,6],[4.6,19.5,3],[7.0,14.6,5],[9.2,19.4,4]];   // [出生, 被哪阵风带走, 颜色]：开场那阵风、桥上那阵风、片尾那阵风   // [出生, 被哪阵风带走, 颜色]（循环时钟）
let titleLeaves41=null;
function buildTitleLeaves41(){
  titleMask41();titleLeaves41=[];
  TITLE41_PLAN.forEach(([born,off,color],i)=>{
    const life=((off-born+DUR42)%DUR42)+3.2;let best=null;
    for(let k=0;k<60&&!best;k++){const r=q=>rnd(i*61+k,4900+q),o={x:70+r(1)*290,y:120+r(2)*70,born:0,size:21+r(3)*8,seed:4950+i*61+k,color,life,release:life-3.2,land:titleLand41,
        wind:(x,y,t)=>{const g=520*pulse41(t-(life-3.2)+.25-(x-60)/900,.3,1.1);return [g+14*Math.sin(t*2.1+i),-g*.3+6*Math.sin(t*1.3+i)];}};
      const L=mk41(o);if(L.sim.rested&&L.sim.restAt<3.2)best=L;}
    if(best){best.born=born;titleLeaves41.push(best);}
  });
}
function drawTitleLeaves41(N){
  if(!titleLeaves41)buildTitleLeaves41();
  for(const L of titleLeaves41){const age=(N-L.born+DUR42)%DUR42,s=at41(L,age);if(!s)continue;
    let tilt=s.tilt,rz=s.rz;
    if(s.resting){const q=N*3.1+L.o.seed;tilt+=.05*Math.sin(q)+.03*Math.sin(q*2.7);rz+=.03*Math.sin(q*1.3);   // 停着也会被气流碰得微微颤
      g.save();g.globalAlpha=.3;g.fillStyle='#1a120c';g.beginPath();g.ellipse(s.x+2,s.y+L.o.size*.3+3,L.o.size*.75,3,0,0,TAU);g.fill();g.restore();}
    leaf41(g,{x:s.x,y:s.y,r:L.o.size,rz,tilt,r0:s.r0,color:L.o.color,alpha:Math.min(1,age*4)});}
}

// ---------------- 太阳：整条路线左右对调——白天从拜殿上方往左下走，傍晚落在左边的海上；佐渡在右边，月亮从右边升起 ----------------
sunScreen=function(T){const d=T-13.0,L=d<0?69*d+2.12*d*d:69*d,k=.00008*L*Math.abs(L);return [430-(L*SUN_D[0]+k*SUN_N[0]),600+L*SUN_D[1]+k*SUN_N[1]];};

// ---------------- 山顶（按实拍重画）：缆车终点旁的广场。碎石地、树篱和绳栏、正中一根细高的展望塔、左边的木雕山名碑 ----------------
// 布景的接口和原来一样（sunsetShot(b,t,Tp)，NOSKY 时只画布景），所以缆车→山顶、山顶→月升红叶谷的换景方式都不用改。
const plaza42=layer(b=>{
  const tx=640,base=1300,top=392;
  // 展望塔：迎着夕阳的左侧亮，右侧暗；一节一节的塔身，靠上两道绿色环带，顶上一个圆舱
  const tg=b.createLinearGradient(tx-15,0,tx+15,0);tg.addColorStop(0,'#e2c4a2');tg.addColorStop(.45,'#b9a79a');tg.addColorStop(1,'#5f5868');b.fillStyle=tg;b.fillRect(tx-15,top,30,base-top);
  for(let y=top+30;y<base;y+=44){b.fillStyle='rgba(40,30,44,.22)';b.fillRect(tx-15,y,30,1.6);}
  for(const y of [top+86,top+150]){const gg=b.createLinearGradient(tx-15,0,tx+15,0);gg.addColorStop(0,'#7fb89e');gg.addColorStop(1,'#3d6a62');b.fillStyle=gg;b.fillRect(tx-15,y,30,34);}
  const cg=b.createLinearGradient(tx-34,0,tx+34,0);cg.addColorStop(0,'#ecd2b2');cg.addColorStop(.5,'#b4a498');cg.addColorStop(1,'#565062');b.fillStyle=cg;b.fillRect(tx-34,top-66,68,66);
  b.fillStyle='rgba(44,38,56,.75)';b.fillRect(tx-34,top-44,68,12);b.fillStyle='rgba(255,236,206,.5)';b.fillRect(tx-34,top-66,68,3);
  b.strokeStyle='#4a4454';b.lineWidth=1.6;b.beginPath();b.moveTo(tx-34,top-80);b.lineTo(tx+34,top-80);for(let x=-34;x<=34;x+=11.3){b.moveTo(tx+x,top-80);b.lineTo(tx+x,top-66);}b.moveTo(tx,top-80);b.lineTo(tx,top-128);b.stroke();
  // 左边：坡上的树丛、爬坡车的站台和斜轨
  b.fillStyle='#211c22';b.beginPath();b.moveTo(-40,1340);b.lineTo(-40,1020);b.quadraticCurveTo(120,1040,230,1150);b.quadraticCurveTo(360,1210,470,1300);b.lineTo(470,1340);b.closePath();b.fill();
  for(let i=0;i<90;i++){const x=-30+rnd(i,6101)*470,y=1060+rnd(i,6102)*260;if(y<1020+x*.55)continue;b.fillStyle=['#2a232a','#322a2c','#3a2c2a'][i%3];b.beginPath();b.ellipse(x,y,16+rnd(i,6103)*26,12+rnd(i,6104)*16,0,0,TAU);b.fill();}
  b.fillStyle='#1a161c';b.fillRect(-20,1000,120,70);b.strokeStyle='#1a161c';b.lineWidth=11;b.lineCap='round';b.beginPath();b.moveTo(26,996);b.lineTo(190,1196);b.stroke();
  b.fillStyle='#86b4a8';b.beginPath();b.moveTo(74,956);b.lineTo(132,962);b.lineTo(138,1030);b.lineTo(120,1052);b.lineTo(74,1046);b.closePath();b.fill();b.fillStyle='#2a2630';b.fillRect(82,970,44,18);b.fillStyle='#b8523e';b.fillRect(76,996,60,3);
  // 海边的树篱（高矮不齐的灌木）和木桩绳栏
  for(let i=0;i<190;i++){const x=380+rnd(i,6111)*740,y=1286+rnd(i,6112)*52,r=14+rnd(i,6113)*26;b.fillStyle=['#231f20','#2e2622','#3a2c24','#2a2a24','#4a2e26'][i%5];b.beginPath();b.ellipse(x,y,r,r*.72,0,0,TAU);b.fill();}
  b.strokeStyle='#2a221e';b.lineWidth=1.6;for(let i=0;i<70;i++){const x=400+rnd(i,6121)*700,y=1270+rnd(i,6122)*20;b.beginPath();b.moveTo(x,y);b.lineTo(x+(rnd(i,6123)-.5)*22,y-16-rnd(i,6124)*30);b.stroke();}
  // 碎石地
  const gq=b.createLinearGradient(0,1318,0,1760);gq.addColorStop(0,'#3c3338');gq.addColorStop(.35,'#2a242a');gq.addColorStop(1,'#151216');b.fillStyle=gq;b.beginPath();b.moveTo(-40,1340);b.quadraticCurveTo(540,1312,1120,1348);b.lineTo(1120,H);b.lineTo(-40,H);b.closePath();b.fill();
  for(let i=0;i<2600;i++){const y=1326+Math.pow(rnd(i,6132),1.5)*560,x=-30+rnd(i,6131)*1140,d=(y-1326)/560;b.fillStyle=i%5?`rgba(150,128,128,${.07+.08*d})`:`rgba(236,170,130,${.08+.06*d})`;b.fillRect(x,y,1.2+d*3,1+d*1.2);}
  for(let x=436;x<=1100;x+=86){const y=1338+Math.sin(x*.01)*4;b.fillStyle='#3a2c28';b.fillRect(x-6,y-58,12,64);b.fillStyle='rgba(240,160,104,.4)';b.fillRect(x-6,y-58,2.4,60);
    if(x+86<=1100){b.strokeStyle='#5a4638';b.lineWidth=3;b.beginPath();b.moveTo(x,y-44);b.quadraticCurveTo(x+43,y-26,x+86,y-44+Math.sin((x+86)*.01)*4-Math.sin(x*.01)*4);b.stroke();}}
  // 山名碑：一段立着的老树干，横出一块刻字的木牌；下面两层石座
  b.fillStyle='#4a4046';b.beginPath();b.ellipse(280,1362,190,20,0,0,TAU);b.fill();b.fillStyle='#5a4e52';b.beginPath();b.ellipse(280,1350,150,15,0,0,TAU);b.fill();
  const mg=b.createLinearGradient(180,0,260,0);mg.addColorStop(0,'#9a6a4a');mg.addColorStop(1,'#4a3028');b.fillStyle=mg;b.beginPath();b.moveTo(176,1348);b.quadraticCurveTo(190,1250,182,1170);b.quadraticCurveTo(178,1110,212,1096);b.quadraticCurveTo(244,1090,250,1130);b.quadraticCurveTo(248,1180,262,1230);b.quadraticCurveTo(268,1300,280,1348);b.closePath();b.fill();
  const sg=b.createLinearGradient(0,1236,0,1300);sg.addColorStop(0,'#a87a56');sg.addColorStop(1,'#5a3c2e');b.fillStyle=sg;b.beginPath();b.moveTo(238,1240);b.quadraticCurveTo(320,1226,404,1238);b.quadraticCurveTo(416,1268,402,1296);b.quadraticCurveTo(320,1304,244,1298);b.closePath();b.fill();
},W,H,1.5);
function plazaPeople42(b,s){
  b.fillStyle='rgba(42,26,20,.92)';b.textAlign='center';b.textBaseline='middle';b.font=`700 34px ${FONTS.cjk}`;[...'弥彦山'].forEach((c,i)=>b.fillText(c,286+i*40,1268));b.textAlign='left';b.textBaseline='alphabetic';   // 木牌上的字
  const col=[22,16,24],lift=[18,8,6],arm=ease(clamp((s-.45)/.35))*(1-ease(clamp((s-3.2)/.4))),fl=t0=>s>t0?Math.exp(-(s-t0)/.14):0,f=Math.max(fl(1.3),fl(2.35));
  // 碑前自拍的两个人：举起手机，闪光灯亮两下
  person41(b,452,1400,1.72,{back:true,arm,phone:true,col,lift});person41(b,502,1403,1.64,{back:true,arm:arm*.5,point:true,col,lift});
  // 栏边：一个人举着手机拍夕阳，两个人并肩看海
  person41(b,716,1352,1.42,{back:true,arm:ease(clamp((s-.2)/.4)),phone:true,col,lift});
  person41(b,902,1356+Math.sin(s*1.1)*.6,1.42,{back:true,col,lift});person41(b,950,1358,1.36,{back:true,col,lift});
  if(f>.02)flash41(b,452+18*1.72,1400-108*1.72,f,1.5);
}
sunsetShot=function(b,t,Tp){
  const u=clamp((t-14.6)/10.6),lift=u*.85+.15*u*u,hy=930-100*lift,Tq=Tp??(13.0+(t-14.6)*4/10.6),S=sunScreen(Tq),sunX=S[0],sunY=S[1]+(hy-930)+sunDrop(Tq);CLOUD_OFF=easeIn(clamp((Tq-16.7)/.3));
  if(!NOSKY)sunsetSky(b,u,hy,sunX,sunY);CLOUD_OFF=0;
  // 佐渡岛：右半边海平线上长长一道，低、远、发灰
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
  b.save();b.translate(0,hy-930);b.drawImage(plaza42,0,0,W,H);b.fillStyle='#151216';b.fillRect(0,H-2,W,140);plazaPeople42(b,u*4);b.restore();
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

// ---------------- 鸟居：一个参拜的人，平常的步子；画面自己把放字的地方压暗（树影、枝叶），不靠字影 ----------------
function torii42(b,a){
  b.save();b.setTransform(1,0,0,1,0,0);b.drawImage(toriiShade42,0,0,W,720);b.restore();
  // 鸟居的横梁逆光，在参道上落下一道宽影子，正好托住中下方的大字
  const q=b.createLinearGradient(0,1360,0,1580);q.addColorStop(0,'rgba(34,40,26,0)');q.addColorStop(.35,'rgba(34,40,26,.46)');q.addColorStop(.7,'rgba(34,40,26,.46)');q.addColorStop(1,'rgba(34,40,26,0)');b.fillStyle=q;b.beginPath();b.moveTo(120,1360);b.lineTo(960,1360);b.lineTo(1120,1580);b.lineTo(-40,1580);b.closePath();b.fill();
  const Z=a<1?lerp(6.5,8.0,a):a<1.6?8.0:8.0+(a-1.6)*1.7,bow=a>1&&a<1.6?Math.sin((a-1)/.6*Math.PI):0,X=TOX-1.3,f=TP(X,0,Z),h=TP(X,1.7,Z),s=(f[1]-h[1])/100;
  b.save();b.globalAlpha=.22;b.fillStyle='#1c1810';b.beginPath();b.ellipse(f[0]+8*s,f[1]+3*s,22*s,5*s,0,0,TAU);b.fill();b.restore();
  person41(b,f[0],f[1],s*.86,{back:true,ph:a*6.4,walk:bow>0?0:1,bow,col:[40,32,26],lift:[26,24,16],alpha:.94});
}
const toriiShade42=layer(b=>{   // 左上角压下来的一片杉枝：标题和旁白后面是深色的叶子，不是亮天
  glow(b,330,330,560,300,[26,44,32],.62);
  for(let i=0;i<22;i++){b.save();b.translate(-60+rnd(i,6201)*760,200+rnd(i,6202)*330);b.rotate(-.2+rnd(i,6203)*.9);shrineSpray(b,0,0,230+rnd(i,6204)*200,6210+i,['#22392a','#2c4a34','#1c3024'][i%3]);b.restore();}
},W,720,1);

// ---------------- 温泉街：两个人慢慢走向旅馆，掀帘进去；足汤边不坐人 ----------------
const TOWN_DOOR42=[652,1200];
townCoupleV25=function(b,a){
  const u=ease(clamp((a-1.2)/5.2)),q=1-u,P=[[742,1440],[706,1330],TOWN_DOOR42],x=q*q*P[0][0]+2*q*u*P[1][0]+u*u*P[2][0],y=q*q*P[0][1]+2*q*u*P[1][1]+u*u*P[2][1],s=lerp(1.42,.8,u),al=1-ease(clamp((u-.88)/.12)),walk=a>1.2&&u<.99?1:0;
  if(al<=0)return;person41(b,x-16*s,y-4*s,s,{back:true,ph:a*6.2+1.5,walk,robe:true,alpha:al});person41(b,x+14*s,y,s*.96,{back:true,ph:a*6.2,walk,robe:true,alpha:al});
};

// ---------------- 字：极简，不加字影。可读性靠画面本身（放字的地方是暗的、平的），实在不够才在字后面铺一片很淡很大的暗 ----------------
const HL42={size:68,weight:300,sp:8,y1:1440,sub:30,subW:400,subSp:5,y2:1504,subCol:'rgba(255,246,230,.82)'};
const scrim42=()=>verticalSprite('type-v42-caption',[[0,[5,12,20,0]],[.42,[5,12,20,84]],[.72,[5,12,20,84]],[1,[5,12,20,0]]]);
headlineC=function(s,segs,sub){
  rise(s,()=>{g.shadowColor='transparent';g.shadowBlur=0;g.shadowOffsetY=0;g.drawImage(scrim42(),0,1300,W,330);
    const ws=segs.map(([q])=>measure(q,HL42.size,HL42.weight,HL42.sp)+HL42.sp);let x=(W-ws.reduce((p,q)=>p+q,0)+HL42.sp)/2;
    segs.forEach(([q,key],i)=>{text(q,x,HL42.y1,HL42.size,key?HL_C.key:HL_C.head,HL42.weight,'left',HL42.sp);x+=ws[i];});
    if(sub)text(sub,W/2,HL42.y2,HL42.sub,HL42.subCol,HL42.subW,'center',HL42.subSp);});
};
endCardC=function(t){   // 片尾：位置不变，去掉字影；提醒那一行小而轻
  rise(t>=21.5?{p:easeOut(clamp((t-21.5)/.55)),out:1}:0,()=>{g.shadowColor='transparent';g.shadowBlur=0;
    g.drawImage(verticalSprite('type-trial-end',[[0,[5,12,20,0]],[.4,[5,12,20,84]],[.7,[5,12,20,84]],[1,[5,12,20,0]]]),0,1300,W,440);
    text('看完日落和夜红叶，',92,1430,60,HL_C.head,300,'left',4);text('就在神社门前住一晚。',92,1514,60,HL_C.head,300,'left',4);});
  rise(t>=21.9?{p:easeOut(clamp((t-21.9)/.55)),out:1}:0,()=>{g.shadowColor='transparent';g.shadowBlur=0;
    g.fillStyle=TYPE.coral;g.beginPath();g.arc(99,1596,4.5,0,TAU);g.fill();text('缆车傍晚 5 点前就收班',118,1608,34,HL_C.key,400,'left',4);});
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

// ---------------- 每一帧：原来的 render 一点不动，只在最后加上落在标题上的叶子 ----------------
const render38=render;
render=function(t){
  const N=Math.round(fract(Number(t)/DUR42)*DUR42*1e9)/1e9;
  STORY_DARK42=N<3.2?.16:N<6.4?0:N<13?.24:N<17?.12:0;   // 鸟居那一镜靠左上角的杉枝，其余白天镜头铺一片很淡的暗
  render38(t);drawTitleLeaves41(N);
};
