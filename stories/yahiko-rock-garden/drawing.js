'use strict';
// New composition studies, independent of the rejected v24 A/B/C layouts.
const W=900,H=1600,TAU=Math.PI*2;
let g,seed=1;
const rand=()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;};
const mix=(a,b,t)=>a+(b-a)*t;
function poly(p,c){g.beginPath();p.forEach(([x,y],i)=>g[i?'lineTo':'moveTo'](x,y));g.closePath();g.fillStyle=c;g.fill();}
function line(p,c,w=1){g.beginPath();p.forEach(([x,y],i)=>g[i?'lineTo':'moveTo'](x,y));g.strokeStyle=c;g.lineWidth=w;g.stroke();}
function ellipse(x,y,rx,ry,c){g.beginPath();g.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,TAU);g.fillStyle=c;g.fill();}
function glow(x,y,rx,ry,c,a=1){g.save();g.translate(x,y);g.scale(rx,ry);const q=g.createRadialGradient(0,0,0,0,0,1);q.addColorStop(0,`rgba(${c},${a})`);q.addColorStop(1,`rgba(${c},0)`);g.fillStyle=q;g.fillRect(-1,-1,2,2);g.restore();}
function gradient(y0,y1,c0,c1){const q=g.createLinearGradient(0,y0,0,y1);q.addColorStop(0,c0);q.addColorStop(1,c1);return q;}
function sky(id){
 g.fillStyle=gradient(0,1150,'#101b35','#576779');g.fillRect(0,0,W,H);
 glow(550,650,660,380,'123,155,168',.16);
 for(let i=0;i<100;i++){let x=rand()*W,y=80+rand()*650;ellipse(x,y,.45+rand()*.7,.45+rand()*.7,`rgba(230,233,224,${rand()*.45})`);}
 const mx=id===1?620:id===2?270:640,my=id===1?385:id===2?390:365;
 glow(mx,my,130,125,'189,216,227',.14);glow(mx,my,48,48,'221,237,236',.18);ellipse(mx,my,16,16,'#f6ead4');
 g.save();g.globalAlpha=.3;for(let j=0;j<6;j++){const x=140+j*160+rand()*60,y=460+j*19;glow(x,y,130+rand()*100,8+rand()*9,'148,173,184',.11);}g.restore();
 for(let k=0;k<3;k++){const y=660+k*85;const p=[[-100,H]];for(let x=-100;x<1100;x+=25)p.push([x,y+Math.sin(x*.006+k*1.9)*48+Math.sin(x*.018+k)*13]);p.push([1100,H]);poly(p,['#344858','#283c46','#20343a'][k]);}
 for(let i=0;i<100;i++){const x=rand()*W,y=770+rand()*110;pine(x,y,40+rand()*95,'#20343a',.6);}
 g.fillStyle=gradient(880,1600,'#293c40','#151f2b');g.fillRect(0,930,900,670);
}
function pine(x,y,h,c,opacity=1){g.save();g.globalAlpha=opacity;line([[x,y],[x+2,y-h]],c,Math.max(1,h*.026));for(let k=0;k<11;k++){const t=k/11,w=h*.21*t;poly([[x,y-h+h*t*.9],[x-w*(.8+rand()*.3),y-h+h*t*.9+h*.13],[x+w,y-h+h*t*.9+h*.1]],c);}g.restore();}
function shrubs(x,y,w,h,col){for(let i=0;i<120;i++){const a=rand()*TAU,r=Math.sqrt(rand());ellipse(x+Math.cos(a)*r*w,y+Math.sin(a)*r*h,2+rand()*7,1.5+rand()*4,col[i%col.length]);}}
function maple(x,y,h,spread,autumn=true){
 const tips=[];function branch(px,py,a,len,width,d){const xx=px+Math.cos(a)*len,yy=py+Math.sin(a)*len;g.lineCap='round';line([[px,py],[(px+xx)/2+5, (py+yy)/2],[xx,yy]],'#252a2a',width);line([[px-width*.15,py],[xx-width*.12,yy]],'rgba(150,133,106,.25)',Math.max(.5,width*.14));if(d>4){tips.push([xx,yy]);return;}branch(xx,yy,a-.3-rand()*.33,len*(.61+rand()*.13),width*.65,d+1);branch(xx,yy,a+.27+rand()*.35,len*(.61+rand()*.12),width*.62,d+1);if(d<2)branch(xx,yy,a-.07,len*.73,width*.58,d+1);}
 branch(x,y,-Math.PI/2+(rand()-.5)*.2,h*.36,h*.045,0);
 const cols=autumn?['#4a2529','#6f292c','#932f30','#b74635','#cd5a3d','#dc8850']:['#233f3b','#385447','#52634a','#71805a'];
 for(const [tx,ty] of tips){for(let j=0;j<34;j++){const xx=tx+(rand()-.5)*spread*.27,yy=ty+(rand()-.5)*spread*.14,r=2+rand()*5;g.save();g.translate(xx,yy);g.rotate(rand()*3);poly([[0,-r],[r*.45,-r*.2],[r,0],[r*.3,r*.45],[0,r],[-r*.3,r*.25],[-r,0],[-r*.4,-r*.2]],cols[Math.floor(rand()*cols.length)]);g.restore();}}
}
function stones(x,y,n=30,scale=1){for(let i=0;i<n;i++){const xx=x+(rand()-.5)*200*scale,yy=y+(rand()-.5)*70*scale;ellipse(xx,yy,(3+rand()*9)*scale,(2+rand()*4)*scale,['#485052','#3d464c','#626568'][i%3]);}}
function lantern(x,y,s=1){
 glow(x,y,55*s,65*s,'249,178,87',.25);glow(x,y+35*s,80*s,18*s,'231,160,78',.11);
 line([[x,y-35*s],[x,y-13*s]],'#282829',2*s);ellipse(x,y,10*s,15*s,'#d5904d');ellipse(x-1*s,y-1*s,7*s,13*s,'#f9d48c');
 for(let k=-2;k<=2;k++)line([[x-8*s,y+k*5*s],[x+8*s,y+k*5*s]],'rgba(128,66,36,.35)',.8*s);
 poly([[x-7*s,y-16*s],[x+7*s,y-16*s],[x+8*s,y-13*s],[x-8*s,y-13*s]],'#3c3430');line([[x-7*s,y+15*s],[x+7*s,y+15*s]],'#69462f',2*s);
}
function lamp(x,y,s=1){line([[x,y],[x,y-110*s],[x+15*s,y-115*s]],'#222d32',4*s);lantern(x+15*s,y-90*s,.8*s);glow(x+15*s,y,100*s,23*s,'237,173,97',.2);}
function house(x,y,w,h,d=65,tilt=0,opt={}){
 const floor=opt.floors||2,roof=h*.27,sign=opt.sign||'',bright=opt.bright??.7;
 const wall=['#474444','#5c5548','#414b4b'][opt.tone||0];
 const F=(u,v)=>[x+u*w,y+u*tilt-v*h];
 const panel=(a,b,c,e,color)=>poly([F(a,b),F(c,b),F(c,e),F(a,e)],color);
 // Back and side faces are shaded separately to keep the volume legible.
 poly([[x+w,y+tilt],[x+w+d,y+tilt-d*.5],[x+w+d,y-h+tilt-d*.5],[x+w,y-h+tilt]],'#293b40');
 poly([F(0,0),F(1,0),F(1,1),F(0,1)],wall);
 for(let j=0;j<Math.round(h/7);j++){const v=j/Math.round(h/7);line([F(0,v),F(1,v)],j%3===0?'rgba(175,151,114,.16)':'rgba(16,24,27,.35)',.9);}
 // A few distinct rooms, not a continuous luminous facade.
 const bays=opt.bays||3;
 for(let f=0;f<floor;f++)for(let k=0;k<bays;k++){
  const u=.07+k*.86/bays,v=.10+f*.82/floor,ww=.69/bays,vh=.62/floor;
  const lit=rand()<bright;panel(u-.012,v-.013,u+ww+.012,v+vh+.013,'#202b2d');
  const center=F(u+ww/2,v+vh/2);g.fillStyle=gradient(center[1]-vh*h/2,center[1]+vh*h/2,lit?'#b88b54':'#33454b',lit?'#f0cf8f':'#273940');poly([F(u,v),F(u+ww,v),F(u+ww,v+vh),F(u,v+vh)],g.fillStyle);
  if(lit){glow(center[0],center[1],w*ww*.85,h*vh*.75,'243,172,74',.08);panel(u+.02,v+.01,u+ww-.01,v+.07,'rgba(112,79,46,.24)');}
  for(let z=1;z<5;z++)line([F(u+ww*z/5,v),F(u+ww*z/5,v+vh)],'#4b4335',Math.max(1,w*.006));
  for(let z=1;z<3;z++)line([F(u,v+vh*z/3),F(u+ww,v+vh*z/3)],'#594b37',Math.max(.7,w*.003));
  // Glass and lattice receive a cool edge from the night sky.
  line([F(u,v+vh),F(u+ww,v+vh)],'rgba(188,203,197,.28)',1);
 }
 for(let j=0;j<=bays;j++){const u=j/bays;line([F(u,0),F(u,1)],'#252c2c',w*.018);line([F(u+.009,0),F(u+.009,1)],'rgba(167,150,119,.25)',1.2);}
 for(let f=1;f<floor;f++){const v=f/floor;poly([F(-.04,v-.04),F(1.04,v-.04),F(1.02,v+.025),F(-.02,v+.025)],'#1b2b30');line([F(-.04,v-.04),F(1.04,v-.04)],'#657276',1.6);}
 // Curved eaves, broad tiled front slope and small gable end.
 const e0=[x-20,y-h+6],e1=[x+w+20,y-h+tilt+6],r0=[x+d*.48,y-h-roof-d*.16],r1=[x+w+d*.48,y-h-roof+tilt-d*.16];
 poly([e0,e1,r1,r0],gradient(r0[1],e0[1],'#647780','#253943'));
 poly([e1,[x+w+d+16,y-h+tilt-d*.5],r1],'#30464d');
 for(let j=1;j<8;j++){const t=j/8;line([[mix(e0[0],r0[0],t),mix(e0[1],r0[1],t)],[mix(e1[0],r1[0],t),mix(e1[1],r1[1],t)]],'rgba(9,24,31,.5)',2);}
 for(let j=0;j<w/11;j++){const t=j/(w/11);line([[mix(e0[0],e1[0],t),mix(e0[1],e1[1],t)],[mix(r0[0],r1[0],t),mix(r0[1],r1[1],t)]],'rgba(160,181,184,.2)',.9);}
 line([r0,r1],'#819293',3);line([e0,e1],'#15282f',8);line([[e0[0],e0[1]-3],[e1[0],e1[1]-3]],'#748586',1.6);
 line([[x,y+2],[x+w,y+tilt+2]],'#121e25',7);
 // Entry porch gives the visitor somewhere specific to go.
 if(opt.entry){const u=opt.entry,xx=x+u*w,yy=y+u*tilt,ww=w*.22,hh=h*.39;
  poly([[xx-ww/2,yy],[xx+ww/2,yy],[xx+ww/2,yy-hh],[xx-ww/2,yy-hh]],'#16282b');
  glow(xx,yy-hh*.5,ww*.6,hh*.55,'246,174,76',.3);
  poly([[xx-ww*.42,yy-4],[xx+ww*.42,yy-4],[xx+ww*.42,yy-hh*.85],[xx-ww*.42,yy-hh*.85]],'#c49c61');
  for(let j=0;j<5;j++)line([[xx-ww*.36+j*ww*.18,yy-4],[xx-ww*.36+j*ww*.18,yy-hh*.85]],'#554b37',2);
  for(let k=0;k<3;k++)poly([[xx-ww*.56+k*ww*.37,yy-hh],[xx-ww*.2+k*ww*.37,yy-hh],[xx-ww*.2+k*ww*.37,yy-hh*.62],[xx-ww*.56+k*ww*.37,yy-hh*.60]],opt.curtain||'#405e60');
  poly([[xx-ww*.7,yy-hh-2],[xx+ww*.75,yy-hh-2],[xx+ww*.58,yy-hh-20],[xx-ww*.55,yy-hh-20]],'#23363b');line([[xx-ww*.7,yy-hh-2],[xx+ww*.75,yy-hh-2]],'#8f9b91',1.5);
  for(let k=0;k<3;k++)poly([[xx-ww*.65-k*5,yy+k*5],[xx+ww*.65+k*5,yy+k*5],[xx+ww*.65+k*5,yy+k*5+4],[xx-ww*.65-k*5,yy+k*5+4]],'#707978');
  glow(xx,yy+30,ww*1.7,32,'241,177,94',.24);lantern(xx-ww*.7,yy-hh*.6,.75);lantern(xx+ww*.7,yy-hh*.6,.75);
 }
 if(sign){const xx=x+w*.9,yy=y-h*.63;poly([[xx,yy-25],[xx+29,yy-25],[xx+29,yy+55],[xx,yy+55]],'#263f3e');line([[xx+2,yy-23],[xx+27,yy-23],[xx+27,yy+53]],'#8d8666',1);g.fillStyle='#dbc69c';g.font='15px serif';g.textAlign='center';[...sign].forEach((s,i)=>g.fillText(s,xx+15,yy+i*21));}
}
function steam(x,y,s=1){g.save();for(let j=0;j<12;j++){const t=j/11;glow(x+Math.sin(t*5)*20*s,y-t*130*s,(12+t*33)*s,(15+t*24)*s,'201,222,218',.105*(1-t*.7));}g.restore();}
function person(x,y,s=1,coat='#b9a58a',facing='back'){
 ellipse(x,y+4*s,14*s,4*s,'rgba(8,18,24,.4)');line([[x-4*s,y-16*s],[x-5*s,y+1*s]],'#182831',4*s);line([[x+4*s,y-16*s],[x+6*s,y+1*s]],'#182831',4*s);
 poly([[x-8*s,y-42*s],[x+8*s,y-42*s],[x+11*s,y-15*s],[x-11*s,y-15*s]],coat);line([[x-8*s,y-39*s],[x-13*s,y-25*s]],coat,5*s);line([[x+8*s,y-39*s],[x+12*s,y-24*s]],coat,5*s);ellipse(x,y-49*s,6*s,7*s,facing==='back'?'#283137':'#c49d79');ellipse(x,y-53*s,6*s,4*s,'#252e32');
}
function groundLeaves(y0,n){const cols=['#965b3e','#af7347','#c08d58','#6d4a3b'];for(let i=0;i<n;i++){const x=rand()*W,y=y0+rand()*(H-y0),s=1+(y-y0)/(H-y0)*3;g.save();g.translate(x,y);g.rotate(rand()*TAU);poly([[-s,0],[0,-s*.6],[s*1.4,0],[0,s*.5]],cols[i%4]);g.restore();}}
function grain(){const im=g.getImageData(0,0,W,H);for(let i=0;i<im.data.length;i+=4){const v=(rand()-.5)*8;im.data[i]+=v;im.data[i+1]+=v;im.data[i+2]+=v;}g.putImageData(im,0,0);}
function seated(x,y,s,coat){
 // Bent thighs, clothed shins and shoes touching the paving, not dangling over water.
 ellipse(x+4*s,y+36*s,23*s,6*s,'rgba(18,32,38,.28)');
 line([[x-7*s,y-5*s],[x-11*s,y+8*s],[x-8*s,y+33*s]],'#38454b',7*s);
 line([[x+5*s,y-5*s],[x+12*s,y+7*s],[x+16*s,y+31*s]],'#34434a',7*s);
 ellipse(x-5*s,y+34*s,8*s,3.3*s,'#202f38');ellipse(x+20*s,y+32*s,8*s,3.3*s,'#202f38');
 poly([[x-10*s,y-39*s],[x+9*s,y-39*s],[x+14*s,y-3*s],[x-13*s,y-3*s]],coat);
 line([[x-9*s,y-32*s],[x-15*s,y-15*s],[x-6*s,y-10*s]],coat,6*s);
 line([[x+9*s,y-31*s],[x+17*s,y-17*s],[x+11*s,y-12*s]],coat,6*s);
 ellipse(x+1*s,y-49*s,7*s,8*s,'#30383b');ellipse(x+5*s,y-47*s,3*s,4*s,'#bca082');
 line([[x-7*s,y-38*s],[x+8*s,y-37*s]],'#b9b3a1',2*s);
}
