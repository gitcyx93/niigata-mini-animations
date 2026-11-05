// Composition study only: reuse v24's illustration primitives and exact text, never replace its scene.
function roofVillage(b){
 nightBase(b,370,650);
 for(let k=0;k<3;k++){
  const y=840+k*34; b.beginPath();b.moveTo(0,1000);
  for(let x=0;x<=1100;x+=25)b.lineTo(x,y+Math.sin(x*.007+k)*22+Math.sin(x*.019)*8);
  b.lineTo(W,1100);b.closePath();b.fillStyle=['#273149','#202b41','#1b2639'][k];b.fill();
 }
 grad(b,0,930,W,990,[[0,'#1b2634'],[1,'#171b23']]);
 // A readable open street, instead of filling the entire frame with interchangeable roofs.
 const roadX=z=>-5+(z-28)*.055;
 const houses=[];let id=20000;
 for(const z of [148,120,98,80,65,52,41,32,25]){
  for(const side of [-1,1])for(let j=0;j<3;j++){
   const w=5.5+rnd(id,4)*2.3,x=roadX(z)+side*(7+j*9.5);
   houses.push({id:id++,x,z:z+j*.9,w,d:5.3,h:4.2+rnd(id,8)*1.7,kind:'house',hip:rnd(id,9)>.4});
  }
 }
 for(let i=0;i<45;i++){const x=40+rnd(i,801)*1000,y=930+rnd(i,802)*75;b.fillStyle='rgba(240,194,119,.45)';b.fillRect(x,y,2,1.5);}
 const ground=[];for(let z=180;z>=22;z-=2)ground.push(TPV(roadX(z)-3.1,0,z));for(let z=22;z<=180;z+=2)ground.push(TPV(roadX(z)+3.1,0,z));poly(b,ground,'#33323b');
 b.strokeStyle='rgba(171,179,194,.32)';b.lineWidth=1.8;
 for(const sd of [-1,1]){b.beginPath();for(let z=180;z>=22;z-=2){const p=TPV(roadX(z)+sd*2.65,0,z);z===180?b.moveTo(...p):b.lineTo(...p);}b.stroke();}
 houses.sort((a,c)=>c.z-a.z).forEach(h=>drawHouse(b,h));
 // A larger inn anchors the near-right corner; it is not a reconstruction of Minoya.
 drawHouse(b,{id:22001,x:11,z:39,w:11,d:8,h:8.5,kind:'ryokan',hip:true});
 for(const z of [35,46,61,82,113]){const x=roadX(z)-3.5,p=TPV(x,0,z);lampPost(b,p[0],p[1],1100/z,38/z);}
 for(let i=0;i<4;i++){const x=800+i*15,y=1130-i*32;b.save();b.globalAlpha=.035;glow(b,x,y,25+i*10,45,[192,211,230],1);b.restore();}
 // Near red leaves frame the town without swallowing the roofs.
 nightCrown(b,20,1640,180,180,24001,.35,450);
 nightCrown(b,1080,1810,220,150,24002,.28,400);
}
const studyNames={A:'A · 鸟居之外',B:'B · 街角留宿',C:'C · 灯火归处',original:'当前 v24'};
const studyNotes={A:'神社内侧向外望：鸟居与杉树框景，台阶接门前街。建议慢推；最贴合你选的摄影视角。',B:'斜向看店铺：让格栅、屋檐与暖灯成为主体。建议沿店面缓慢横移；生活感最强。',C:'较低的俯视：保留一条可读的街道，以近处旅馆和屋顶建立小镇尺度。建议缓慢前推；整体灯火最好读。',original:'v24 原结尾，23.4 秒静帧，仅供对照。'};
let studyKey=new URLSearchParams(location.search).get('study')||'A',showCopy=true;
if(!(studyKey in studyNames))studyKey='A';
const cached={};
function renderStudy(key=studyKey,copy=showCopy){
 if(!(key in studyNames))throw Error('Unknown composition');
 studyKey=key;showCopy=copy;playing=false;
 if(key==='original'){render(23.4);if(!copy){g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,W,H);townShot(g,23.4);}}
 else{
  if(!cached[key]){const c=document.createElement('canvas');c.width=W;c.height=H;({A:designA,B:designB,C:roofVillage})[key](c.getContext('2d'));cached[key]=c;}
  g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.drawImage(cached[key],0,0);
  const v=g.createRadialGradient(540,1050,430,540,1050,1250);v.addColorStop(0,'rgba(4,8,18,0)');v.addColorStop(1,'rgba(4,8,18,.25)');g.fillStyle=v;g.fillRect(0,0,W,H);
  if(copy){g.save();glow(g,370,1100,650,230,[6,10,20],.28);g.restore();titlesC(23.4);}
 }
 document.getElementById('study-note').textContent=studyNotes[key];
 document.querySelectorAll('[data-study]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.study===key)));
 document.getElementById('copy-switch').checked=copy;
 window.STUDY_STATE={key,copy,width:W,height:H};
}
const studyStyle=document.createElement('style');studyStyle.textContent=`
.film{width:fit-content!important;max-width:none!important;height:auto!important;aspect-ratio:auto!important;margin:0 auto!important;border:0!important;overflow:visible!important}#study-toolbar label{display:inline-flex!important;position:static!important;align-items:center;gap:6px;width:auto!important}#copy-switch{position:static!important;width:16px!important;height:16px!important;appearance:auto!important;margin:0 5px!important}html,body{margin:0!important;background:#111820!important;color:#eee4d3!important}body{display:block!important;padding:22px!important;box-sizing:border-box!important}body>main,body>.layout{display:block!important}.panel{display:none!important}canvas#c{display:block!important;width:min(54vh,540px)!important;height:auto!important;max-height:none!important;margin:0 auto!important;border-radius:3px;box-shadow:0 20px 90px #0008}#study-toolbar{max-width:950px;margin:0 auto 18px;font:14px/1.7 system-ui}#study-toolbar h1{font:500 25px/1.4 system-ui;margin:0 0 5px}#study-toolbar p{color:#a6b2ba;margin:5px 0 10px}#study-toolbar button{background:#25323e;color:#dfd8ca;border:1px solid #40505e;border-radius:6px;padding:9px 15px;margin:0 6px 8px 0;cursor:pointer}#study-toolbar button[aria-pressed=true]{background:#dfc79a;color:#16202a}#study-toolbar label{white-space:nowrap}#study-note{min-height:26px}body.capture{padding:0!important;background:#111820!important}body.capture #study-toolbar{display:none!important}body.capture canvas#c{width:1080px!important;height:1920px!important;margin:0!important}body.capture main,body.capture .wrap,body.capture .stage{margin:0!important;padding:0!important;max-width:none!important;width:auto!important;display:block!important}`;
document.head.append(studyStyle);
const toolbar=document.createElement('section');toolbar.id='study-toolbar';toolbar.innerHTML=`<h1>弥彦 · 最后一晚，停在哪里？</h1><p>基于 v24 的独立构图试作 · 1080 × 1920 · 未改原片 · 夜景是设计演绎，不是实拍还原</p><div>${Object.entries(studyNames).map(([k,n])=>`<button data-study="${k}" aria-pressed="false">${n}</button>`).join('')}<label><input id="copy-switch" type="checkbox" checked> 叠加当前原文</label></div><p id="study-note"></p>`;document.body.prepend(toolbar);
cv.onclick=null;
document.querySelectorAll('[data-study]').forEach(el=>el.onclick=()=>renderStudy(el.dataset.study));document.getElementById('copy-switch').onchange=e=>renderStudy(studyKey,e.target.checked);
window.renderStudy=renderStudy;
const wait=setInterval(()=>{if(window.READY){clearInterval(wait);renderStudy();window.STUDY_READY=true;}},100);
