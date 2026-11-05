// 温泉小镇静态设计稿：在 yahiko-v24.html 里运行（用页面里的 glow / nightCrown / cedarShape / poly / rnd 等）
function nightBase(b,mx,my){
  b.setTransform(1,0,0,1,0,0);b.globalAlpha=1;b.globalCompositeOperation='source-over';
  b.drawImage(nightSkyL,0,0,W,H);drawMoonAt(b,mx,my,1);moonlight(b,mx,my,0);
}
function lampPost(b,x,y,h,s){b.strokeStyle='#14141a';b.lineWidth=3*s;b.beginPath();b.moveTo(x,y);b.lineTo(x,y-h);b.stroke();
  b.save();b.globalCompositeOperation='lighter';glow(b,x,y-h,60*s,60*s,[255,190,120],.5);glow(b,x,y,90*s,26*s,[255,170,100],.25);b.restore();
  b.fillStyle='#ffe6b8';b.beginPath();b.arc(x,y-h,5*s,0,TAU);b.fill();}
function shopFront(b,x0,y0,x1,y1,depth,opt){
  // 透视里的一个店面（左右两点：近处 x0/y0 高、远处 x1/y1），opt：awning 颜色、两层、亮
  const {aw,h0,h1,lit=1,banner}=opt;
  poly(b,[[x0,y0],[x1,y1],[x1,y1-h1],[x0,y0-h0]],'#2a1d18');               // 墙
  poly(b,[[x0,y0-h0*.06],[x1,y1-h1*.06],[x1,y1-h1*.42],[x0,y0-h0*.42]],`rgba(232,${170+Math.round(30*lit)},110,${.72*lit})`);   // 一楼店面的光
  for(let k=1;k<8;k++){const u=k/8,xa=lerp(x0,x1,u),ya=lerp(y0,y1,u),ha=lerp(h0,h1,u);b.strokeStyle='rgba(40,22,14,.7)';b.lineWidth=2;b.beginPath();b.moveTo(xa,ya-ha*.06);b.lineTo(xa,ya-ha*.42);b.stroke();}
  // 二楼：深色木格栅 + 白灰墙 + 木框
  poly(b,[[x0,y0-h0*.55],[x1,y1-h1*.55],[x1,y1-h1*.95],[x0,y0-h0*.95]],'#737477');
  poly(b,[[lerp(x0,x1,.1),lerp(y0,y1,.1)-lerp(h0,h1,.1)*.6],[lerp(x0,x1,.7),lerp(y0,y1,.7)-lerp(h0,h1,.7)*.6],[lerp(x0,x1,.7),lerp(y0,y1,.7)-lerp(h0,h1,.7)*.86],[lerp(x0,x1,.1),lerp(y0,y1,.1)-lerp(h0,h1,.1)*.86]],'rgba(255,214,150,.75)');
  for(let k=0;k<=24;k++){const u=.1+.6*k/24,xa=lerp(x0,x1,u),ya=lerp(y0,y1,u),ha=lerp(h0,h1,u);b.strokeStyle='#2a1a12';b.lineWidth=2.5;b.beginPath();b.moveTo(xa,ya-ha*.6);b.lineTo(xa,ya-ha*.86);b.stroke();}
  for(const f of [.55,.95]){b.strokeStyle='#3a2a20';b.lineWidth=6;b.beginPath();b.moveTo(x0,y0-h0*f);b.lineTo(x1,y1-h1*f);b.stroke();}
  // Wood framing and uneven warm shop interiors, rather than one luminous rectangle.
  for(let k=0;k<=5;k++){const u=k/5,xx=lerp(x0,x1,u),yy=lerp(y0,y1,u),hh=lerp(h0,h1,u);b.strokeStyle='#211c1c';b.lineWidth=k===0||k===5?8:3;b.beginPath();b.moveTo(xx,yy);b.lineTo(xx,yy-hh*.95);b.stroke();}
  for(let k=0;k<11;k++){const u=(k+.3)/12,xx=lerp(x0,x1,u),yy=lerp(y0,y1,u),hh=lerp(h0,h1,u);b.fillStyle=k%3===0?'#473126':'#786043';b.fillRect(xx-3,yy-hh*.14,7,hh*(.035+.025*(k%3)));}
  // 屋顶（深瓦，屋檐一道月光）
  poly(b,[[x0-20,y0-h0*.95],[x1+6,y1-h1*.95],[x1+6,y1-h1*1.12],[x0-20,y0-h0*1.18]],'#1c1f2a');
  b.strokeStyle='rgba(190,204,232,.6)';b.lineWidth=3;b.beginPath();b.moveTo(x0-20,y0-h0*.95);b.lineTo(x1+6,y1-h1*.95);b.stroke();
  for(let j=1;j<7;j++){const v=j/7;b.strokeStyle='rgba(153,170,190,.18)';b.lineWidth=1.5;b.beginPath();b.moveTo(x0-20,y0-h0*(.95+v*.23));b.lineTo(x1+6,y1-h1*(.95+v*.17));b.stroke();}
  // 遮阳棚
  if(aw){poly(b,[[x0-6,y0-h0*.45],[x1,y1-h1*.45],[x1-depth*.3,y1-h1*.33],[x0-depth,y0-h0*.32]],aw);
    poly(b,[[x0-depth,y0-h0*.32],[x1-depth*.3,y1-h1*.33],[x1-depth*.3,y1-h1*.30],[x0-depth,y0-h0*.28]],'rgba(255,255,255,.35)');}
  // 光落在地上
  b.save();b.globalCompositeOperation='lighter';glow(b,lerp(x0,x1,.4)-depth*.6,lerp(y0,y1,.4)+20,(x0-x1)*.7,60,[255,170,95],.45*lit);b.restore();
  if(banner)banner.forEach(([u,c])=>{const xa=lerp(x0,x1,u)-depth*.7,ya=lerp(y0,y1,u),ha=lerp(h0,h1,u);b.strokeStyle='#1a1410';b.lineWidth=3;b.beginPath();b.moveTo(xa,ya);b.lineTo(xa,ya-ha*.52);b.stroke();
    b.fillStyle=c;b.fillRect(xa+2,ya-ha*.5,ha*.09,ha*.36);b.fillStyle='rgba(255,246,230,.85)';for(let j=0;j<4;j++)b.fillRect(xa+2+ha*.03,ya-ha*.46+j*ha*.08,ha*.03,ha*.05);});
}

// ---------- A：从神社的一之鸟居里往外看 ----------
// 参考 1：站在鸟居内侧，石阶下去是门前的街，两边店铺亮着，街一直伸到远处的山；鸟居和两边的大树把画面框住
function foliage(b,x0,y0,x1,y1,seed,n,col){for(let i=0;i<n*3;i++){const x=lerp(x0,x1,rnd(i,seed)),y=lerp(y0,y1,rnd(i,seed+1)),r=8+rnd(i,seed+2)*20;b.fillStyle=col;b.beginPath();
  for(let k=0;k<10;k++){const a=k/10*TAU,rr=r*(.7+rnd(i*10+k,seed+3)*.5);b[k?'lineTo':'moveTo'](x+Math.cos(a)*rr,y+Math.sin(a)*rr*.8);}b.closePath();b.fill();}}
function designA(b){
  nightBase(b,420,700);
  const VP=[545,1120];
  // 远山
  b.fillStyle='#27314c';b.beginPath();b.moveTo(250,1050);[[330,1010],[430,985],[520,995],[600,970],[700,990],[820,1015]].forEach(p=>b.lineTo(...p));b.lineTo(820,1100);b.lineTo(250,1100);b.fill();
  b.strokeStyle='rgba(170,186,222,.35)';b.lineWidth=2;b.beginPath();[[330,1010],[430,985],[520,995],[600,970],[700,990]].forEach((p,i)=>b[i?'lineTo':'moveTo'](...p));b.stroke();
  // 街（先下坡再远去），湿的路面映灯
  poly(b,[[VP[0]-6,VP[1]],[VP[0]+6,VP[1]],[860,1430],[230,1430]],'#2a2c35');
  b.strokeStyle='rgba(235,235,245,.35)';b.lineWidth=2;for(const sd of [-1,1]){b.beginPath();b.moveTo(VP[0]+sd*4,VP[1]);b.lineTo(545+sd*150,1430);b.stroke();}
  // 两边的店：近的大、远的小，一楼店面亮、二楼窗子亮
  for(const sd of [-1,1]){let u=0;while(u<1){const du=.05+u*.16,u1=Math.min(1,u+du),P=v=>[lerp(VP[0]+sd*7,sd<0?60:1030,v),lerp(VP[1],1420,v)],Hh=v=>lerp(8,390,v);
      const [xa,ya]=P(u),[xb,yb]=P(u1),ha=Hh(u)*(.85+.3*rnd(u*97,9901)),hb=Hh(u1)*(.85+.3*rnd(u*97,9901)),t=rnd(u*97,9902);
      poly(b,[[xa,ya],[xb,yb],[xb,yb-hb],[xa,ya-ha]],blendTone('#2a2024','#3a2a26',t));
      poly(b,[[xa,ya-ha*.04],[xb,yb-hb*.04],[xb,yb-hb*.4],[xa,ya-ha*.4]],t<.24?'#342b2c':`rgb(${170+Math.round(65*t)},${140+Math.round(60*t)},${90+Math.round(40*t)})`);
      for(let k=1;k<6;k++){const v=k/6;b.strokeStyle='rgba(50,26,16,.65)';b.lineWidth=1+u*1.5;b.beginPath();b.moveTo(lerp(xa,xb,v),lerp(ya,yb,v)-lerp(ha,hb,v)*.04);b.lineTo(lerp(xa,xb,v),lerp(ya,yb,v)-lerp(ha,hb,v)*.4);b.stroke();}
      poly(b,[[xa,ya-ha*.42],[xb,yb-hb*.42],[xb+sd*u*20,yb-hb*.36],[xa+sd*u*24,ya-ha*.36]],'#15161d');   // 一楼的檐
      if(t>.3)poly(b,[[lerp(xa,xb,.2),lerp(ya,yb,.2)-lerp(ha,hb,.2)*.6],[lerp(xa,xb,.8),lerp(ya,yb,.8)-lerp(ha,hb,.8)*.6],[lerp(xa,xb,.8),lerp(ya,yb,.8)-lerp(ha,hb,.8)*.84],[lerp(xa,xb,.2),lerp(ya,yb,.2)-lerp(ha,hb,.2)*.84]],'rgba(255,214,150,.72)');
      poly(b,[[xa,ya-ha],[xb,yb-hb],[xb+sd*u*10,yb-hb*1.1],[xa+sd*u*12,ya-ha*1.1]],'#1b1e29');
      b.strokeStyle='rgba(196,210,238,.55)';b.lineWidth=1+u*2;b.beginPath();b.moveTo(xa,ya-ha);b.lineTo(xb,yb-hb);b.stroke();
      b.save();b.globalCompositeOperation='lighter';glow(b,(xa+xb)/2-sd*40*u,(ya+yb)/2,Math.abs(xb-xa)+20,24+50*u,[255,170,95],.42);b.restore();
      if(rnd(u*97,9903)<.5){const x=lerp(xa,xb,.5)-sd*10*u,y=lerp(ya,yb,.5)-lerp(ha,hb,.5)*.46,s=2+u*9;b.save();b.globalCompositeOperation='lighter';glow(b,x,y,s*4,s*4,[255,160,80],.5);b.restore();b.fillStyle='#f3e2c4';b.fillRect(x-s*.5,y-s*.7,s,s*1.4);b.fillStyle='#c4261c';b.fillRect(x-s*.5,y-s*.1,s,s*.25);}
      u=u1+.004;}}
  // 电线杆和电线（参考照片里很显眼）
  for(const [u,sd] of [[.25,1],[.55,1],[.4,-1],[.85,-1]]){const x=lerp(VP[0]+sd*14,sd<0?330:760,u),y=lerp(VP[1],1420,u),h=lerp(70,640,u);b.strokeStyle='#101116';b.lineWidth=lerp(2,8,u);b.beginPath();b.moveTo(x,y);b.lineTo(x,y-h);b.stroke();b.lineWidth=lerp(1.5,5,u);b.beginPath();b.moveTo(x-h*.07,y-h*.94);b.lineTo(x+h*.07,y-h*.94);b.stroke();}
  b.strokeStyle='rgba(16,16,22,.7)';b.lineWidth=1.2;for(const k of [0,1,2]){b.beginPath();b.moveTo(560,990-k*5);b.quadraticCurveTo(700,1010-k*8,800,830-k*12);b.stroke();b.beginPath();b.moveTo(530,995-k*5);b.quadraticCurveTo(420,1000-k*8,330,960-k*12);b.stroke();}
  // 路灯
  for(const [u,sd] of [[.15,-1],[.35,1],[.6,-1],[.9,1]]){const x=lerp(VP[0]+sd*10,sd<0?370:720,u),y=lerp(VP[1],1425,u);lampPost(b,x,y,lerp(18,230,u),lerp(.3,1.2,u));}
  // 鸟居前的石阶，月光照在台阶边上
  for(let i=0;i<6;i++){const y=1430+i*34,w=230+i*55;poly(b,[[545-w,y],[545+w,y],[545+w,y+34],[545-w,y+34]],blendTone('#2c2d36','#4c4e5a',i/6));b.fillStyle='rgba(206,216,240,.28)';b.fillRect(545-w,y,2*w,3);}
  // 两边的大树：树干＋一簇簇针叶，月光在叶缘上
  b.fillStyle='#06080d';b.fillRect(0,0,W,300);b.fillRect(0,0,60,H);b.fillRect(1020,0,60,H);
  foliage(b,-60,0,1140,380,9911,170,'#06080d');foliage(b,60,300,200,1250,9915,60,'#06080d');foliage(b,880,300,1020,1200,9919,60,'#06080d');
  foliage(b,0,0,1080,330,9923,40,'rgba(110,128,176,.08)');
  for(const [x,w] of [[60,80],[1020,90]]){b.fillStyle='#0b0c11';b.fillRect(x-w/2,0,w,H);b.fillStyle='rgba(140,158,200,.12)';b.fillRect(x-w/2,0,4,H);}
  // 一之鸟居：粗柱、上翘的笠木、贯，木色背光
  const tc='#140e0c';b.fillStyle=tc;
  b.fillRect(165,600,84,1000);b.fillRect(831,600,84,1000);
  b.fillRect(110,800,860,50);b.fillRect(520,660,40,140);
  b.beginPath();b.moveTo(20,600);b.quadraticCurveTo(540,560,1060,600);b.lineTo(1075,535);b.quadraticCurveTo(540,488,5,535);b.closePath();b.fill();
  b.fillRect(70,600,940,40);
  b.strokeStyle='rgba(176,192,228,.4)';b.lineWidth=3;b.beginPath();b.moveTo(5,535);b.quadraticCurveTo(540,488,1075,535);b.stroke();
  b.save();b.globalCompositeOperation='lighter';glow(b,249,1150,30,380,[255,170,100],.16);glow(b,831,1150,30,380,[255,170,100],.16);b.restore();
  // Two small visitors give the street a human scale.
  for(const [x,y,s] of [[535,1360,1],[559,1350,.82]]){b.fillStyle='#171c26';b.beginPath();b.arc(x,y-25*s,5*s,0,TAU);b.fill();poly(b,[[x-6*s,y-18*s],[x+6*s,y-18*s],[x+9*s,y],[x-8*s,y]],'#8f7763');b.strokeStyle='#111723';b.lineWidth=3*s;b.beginPath();b.moveTo(x-3*s,y);b.lineTo(x-4*s,y+10*s);b.moveTo(x+3*s,y);b.lineTo(x+5*s,y+10*s);b.stroke();}
  // 石栏
  for(const [x0,x1] of [[0,165],[915,1080]]){b.fillStyle='#16161c';b.fillRect(x0,1440,x1-x0,90);for(let x=x0+20;x<x1;x+=60)b.fillRect(x,1405,22,40);b.fillStyle='rgba(190,200,230,.22)';b.fillRect(x0,1440,x1-x0,3);}
}

// ---------- B：神社旁的土产店，斜着看过去 ----------
function designB(b){
  nightBase(b,330,680);
  // 后面的神社树林（深）
  b.fillStyle='#0b1018';b.beginPath();b.moveTo(0,1120);for(let x=0;x<=1080;x+=40)b.lineTo(x,780+Math.sin(x*.02)*40+rnd(x,9931)*60);b.lineTo(1080,1400);b.lineTo(0,1400);b.fill();
  for(let i=0;i<40;i++){const x=rnd(i,9932)*700,y=820+rnd(i,9933)*120;cedarShape(b,x,y+140,200+rnd(i,9934)*160,30,'#0c121b');}
  // 路面
  poly(b,[[0,1240],[1080,1080],[1080,1920],[0,1920]],'#22242c');
  b.strokeStyle='rgba(230,230,240,.35)';b.lineWidth=4;b.beginPath();b.moveTo(0,1500);b.quadraticCurveTo(500,1380,1080,1260);b.stroke();
  // 店铺一排：从右边近处斜着排到左边远处
  const shops=[[1180,1520,880,1380,820,640,'#2f4f8a',[[.45,'#c43a2c']]],[870,1376,650,1290,620,520,'#c9542e',[[.3,'#2a5a3a'],[.75,'#d8a03a']]],[640,1286,470,1226,500,430,'#2c6a4a',[[.5,'#c43a2c']]],[462,1222,330,1182,410,360,'#2f4f8a',null],[324,1180,220,1150,340,300,'#c9542e',null]];
  for(let i=shops.length-1;i>=0;i--){const [x0,y0,x1,y1,h0,h1,aw,ban]=shops[i];shopFront(b,x0,y0,x1,y1,90*(1-i*.18),{aw,h0,h1,banner:ban});}
  // 店前的红毛毡长凳和野点伞、木桶
  poly(b,[[880,1560],[1060,1600],[1060,1640],[880,1600]],'#a8322a');poly(b,[[880,1600],[1060,1640],[1060,1660],[880,1620]],'#5a1a16');
  {b.fillStyle='#b23a2c';b.beginPath();b.moveTo(820,1330);b.quadraticCurveTo(960,1250,1100,1330);b.closePath();b.fill();b.strokeStyle='#2a1a12';b.lineWidth=4;b.beginPath();b.moveTo(960,1290);b.lineTo(960,1560);b.stroke();}
  // 招牌（不写真实店名）
  poly(b,[[960,700],[1080,660],[1080,940],[960,970]],'#3a2a20');b.fillStyle='#e8d6b0';b.font='bold 46px sans-serif';b.save();b.translate(1020,740);b.fillText('名',-24,40);b.fillText('物',-24,100);b.restore();
  // 月光：屋顶和树梢一道冷边已在 shopFront 里；再给左上的树一点
  lampPost(b,170,1250,260,1.1);
}

// ---------- C：从弥彦山上往下看小镇和平原 ----------
function designC(b){
  nightBase(b,440,420);
  // 远山（平原另一边），月光下一层层
  for(const [y,c,a] of [[830,'#2c3756',1],[870,'#25304c',1]]){b.fillStyle=c;b.beginPath();b.moveTo(0,y+40);for(let x=0;x<=1080;x+=30)b.lineTo(x,y+Math.sin(x*.008+y)*18+rnd(x,y)*8);b.lineTo(1080,1100);b.lineTo(0,1100);b.fill();}
  // 平原：暗的田，薄雾，一点点村落的灯，几条路灯连成的线
  grad(b,0,880,W,700,[[0,'#1c2438'],[1,'#121826']]);for(let i=0;i<70;i++){const y=900+Math.pow(i/70,1.7)*560;b.strokeStyle='rgba(120,138,180,.10)';b.lineWidth=1;b.beginPath();b.moveTo(0,y);b.lineTo(W,y-30);b.stroke();}for(let i=0;i<40;i++){const x=rnd(i,9947)*1300-100;b.strokeStyle='rgba(120,138,180,.08)';b.beginPath();b.moveTo(x,900);b.lineTo(540+(x-540)*2.6,1480);b.stroke();}
  b.save();b.globalCompositeOperation='lighter';
  for(let i=0;i<900;i++){const v=Math.pow(rnd(i,9941),1.6),y=900+v*560,x=rnd(i,9942)*1180-50,cl=rnd(i,9943)<.7;if(cl&&rnd(Math.floor(x/90)+Math.floor(y/40)*13,9944)<.55)continue;const s=.6+v*2.2;b.fillStyle=`rgba(255,${190+Math.round(40*rnd(i,9945))},130,${.5+.4*rnd(i,9946)})`;b.fillRect(x,y,s,s);}
  for(const [x0,y0,x1,y1] of [[60,1420,900,940],[300,1460,1080,1060],[700,1470,420,930]])for(let k=0;k<60;k++){const u=k/60,x=lerp(x0,x1,u),y=lerp(y0,y1,u);b.fillStyle='rgba(255,210,150,.6)';b.fillRect(x,y,1.5+(1-u)*1.5,1.5+(1-u)*1.5);}
  b.restore();
  grad(b,0,900,W,160,[[0,'rgba(120,140,190,.25)'],[1,'rgba(120,140,190,0)']]);   // 远处的薄雾被月光照着
  // 山脚的小镇：神社的杉林（一大块暗）和旁边一簇暖灯，几缕温泉热气
  b.fillStyle='#0a1018';b.beginPath();b.ellipse(640,1430,260,70,-.1,0,TAU);b.fill();
  b.save();b.globalCompositeOperation='lighter';glow(b,430,1480,300,110,[255,170,95],.35);
  for(let i=0;i<420;i++){const a=rnd(i,9951)*TAU,r=Math.sqrt(rnd(i,9952)),x=430+Math.cos(a)*r*260,y=1480+Math.sin(a)*r*95;b.fillStyle=`rgba(255,${190+Math.round(40*rnd(i,9953))},120,${.6+.4*rnd(i,9954)})`;const s=1.5+rnd(i,9955)*2.5;b.fillRect(x,y,s,s);}
  b.restore();
  {b.fillStyle='#c8432a';b.fillRect(612,1462,3,12);b.fillRect(624,1462,3,12);b.fillRect(608,1460,22,3);}   // 小小的红鸟居
  for(const [x,y] of [[380,1460],[470,1500],[520,1450]])for(let k=0;k<5;k++){const u=k/5;b.globalAlpha=.05*(1-u);glow(b,x+u*30,y-u*120,30+u*50,24+u*40,[210,220,240],1);}b.globalAlpha=1;
  // 近处：弥彦山的山坡，红叶（暗、被月光勾边），左边一棵枝干伸出来的树
  b.fillStyle='#170f12';b.beginPath();b.moveTo(0,1260);b.quadraticCurveTo(300,1380,520,1640);b.lineTo(1080,1700);b.lineTo(1080,1920);b.lineTo(0,1920);b.fill();
  nightCrown(b,120,1400,260,180,9961,.12,900);nightCrown(b,420,1700,300,170,9963,.1,900);nightCrown(b,900,1780,320,160,9965,.1,900);b.fillStyle='rgba(8,10,24,.62)';b.fillRect(0,1150,W,H);
  b.strokeStyle='#0c0a0c';b.lineCap='round';
  const br=(x,y,a,l,w,d)=>{if(d>6||l<12)return;const x2=x+Math.cos(a)*l,y2=y+Math.sin(a)*l;b.lineWidth=w;b.beginPath();b.moveTo(x,y);b.lineTo(x2,y2);b.stroke();br(x2,y2,a-.35-rnd(d*7+x,9971)*.3,l*.74,w*.68,d+1);br(x2,y2,a+.3+rnd(d*5+y,9972)*.3,l*.7,w*.66,d+1);};
  br(60,1500,-1.1,220,22,0);
  b.strokeStyle='rgba(160,180,220,.25)';b.lineWidth=2;b.beginPath();b.moveTo(0,1262);b.quadraticCurveTo(300,1382,520,1642);b.stroke();
}
