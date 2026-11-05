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
 const cols=autumn?['#4f2b2a','#72382b','#984733','#b35938','#ce7346','#db9354']:['#233f3b','#385447','#52634a','#71805a'];
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
function first(){
 sky(1);
 // A single welcoming inn, with a quiet lane turning toward its front door.
 g.beginPath();g.moveTo(-120,1580);g.bezierCurveTo(150,1380,680,1340,610,1020);g.lineTo(560,970);g.bezierCurveTo(520,1250,110,1230,-100,1380);g.closePath();g.fillStyle=gradient(1000,1550,'#74746c','#465358');g.fill();
 g.save();g.clip();for(let i=0;i<230;i++){const x=rand()*900,y=1000+rand()*600;poly([[x,y],[x+25+rand()*30,y-2],[x+28,y+8],[x-8,y+9]],'rgba(166,172,158,.1)');}g.restore();
 // Low side building and old inn form an L, not a serial row of houses.
 house(390,920,155,145,45,-20,{tone:2,bright:.45,bays:2});
 house(390,1110,355,300,100,-42,{entry:.45,sign:'湯宿',tone:1,bays:4,bright:.75,curtain:'#4e6b69'});
 house(710,1115,143,165,48,-26,{tone:2,floors:1,bays:2,bright:.55});
 // Moonlit plaster boundary wall, stone steps, and a garden island.
 poly([[100,1170],[330,1100],[330,1153],[100,1225]],'#5d6964');poly([[91,1160],[331,1090],[344,1102],[100,1177]],'#263d42');line([[100,1170],[330,1100]],'#9caaa0',2);
 shrubs(280,1103,78,45,['#253e38','#3b5240','#64714b']);shrubs(790,1150,70,28,['#283e38','#43543e']);
 stones(350,1160,25,.7);stones(815,1175,22,.8);
 maple(155,1190,650,240);maple(840,1120,380,155);
 glow(480,1110,160,180,'255,181,85',.07);lamp(322,1208,1.12);
 person(459,1230,1.25,'#c29d76');person(483,1213,1.05,'#607e80');
 poly([[493,1214],[508,1217],[508,1231],[493,1229]],'#785a43');line([[498,1216],[498,1209],[504,1210],[504,1217]],'#c2aa7e',1);
 steam(778,912,.65);steam(752,929,.45);
 // Foreground shrubs and leaves make the lane feel discovered rather than staged.
 shrubs(830,1500,230,130,['#132d2e','#243c35','#3c4c39']);shrubs(0,1490,120,90,['#163032','#30483c']);groundLeaves(1150,140);
 glow(390,1310,170,40,'234,174,101',.09);
}
function second(){
 sky(2);
 // A pocket of town wrapped around water; deliberately fictional, not a Yahiko map.
 g.fillStyle=gradient(950,1600,'#314c59','#193b50');g.beginPath();g.moveTo(550,980);g.bezierCurveTo(450,1090,540,1210,300,1350);g.bezierCurveTo(190,1430,270,1530,360,1600);g.lineTo(760,1600);g.bezierCurveTo(540,1420,690,1310,670,1180);g.bezierCurveTo(650,1060,680,1040,690,980);g.closePath();g.fill();
 // The buildings sit on a planted stone embankment, not on isolated floating platforms.
 poly([[340,938],[810,892],[845,1130],[691,1160],[660,1040],[420,1090],[322,1035]],'#344a49');
 poly([[100,983],[345,967],[430,1052],[370,1170],[115,1245]],'#344b4a');
 line([[420,1090],[660,1040],[691,1160]],'#6e807b',10);line([[115,1245],[370,1170],[430,1052]],'#647a77',8);
 house(410,969,315,250,90,-35,{entry:.54,sign:'旅籠',tone:2,bays:3,bright:.68});house(185,1000,165,145,50,14,{entry:.5,tone:1,bays:2,bright:.6});
 shrubs(793,1035,57,24,['#2a453e','#506344','#7a794e']);shrubs(326,1054,48,20,['#2d493d','#607147']);
 maple(810,1140,540,195);maple(125,1120,400,190);
 // Little landing at the inn and stepping embankments.
 poly([[430,996],[690,960],[736,1000],[439,1058]],'#697978');line([[430,996],[690,960]],'#9aaba4',3);
 for(let i=0;i<9;i++){const y=1060+i*45,x=450+Math.sin(i*.5)*28-i*12;ellipse(x,y,26,11,'#4f676b');ellipse(x-2,y-3,23,6,'#748381');}
 for(let i=0;i<9;i++){const y=1040+i*52,x=710+Math.sin(i*.7)*30;ellipse(x,y,24,10,'#405a60');}
 // Warm reflections break into ripples instead of vertical solid bars.
 glow(600,1090,45,90,'240,188,109',.14);glow(590,1230,50,100,'240,188,109',.07);
 for(let i=0;i<180;i++){const y=1030+rand()*500,x=590+(rand()-.5)*(25+(y-1000)*.28)+Math.sin(y*.025)*25;line([[x,y],[x+5+rand()*22,y]],`rgba(227,${156+Math.floor(rand()*50)},95,${.06+rand()*.16})`,1+rand()*2);}
 for(let i=0;i<90;i++){const y=1080+rand()*520,x=360+rand()*330;line([[x,y],[x+8+rand()*30,y]],'rgba(159,195,205,.12)',1);}
 // A small near footbridge creates a broad sweep, not a central symmetrical avenue.
 g.beginPath();g.moveTo(110,1280);g.quadraticCurveTo(360,1160,690,1225);g.lineTo(690,1255);g.quadraticCurveTo(360,1190,110,1310);g.closePath();g.fillStyle='#64736f';g.fill();
 const edge=t=>[110+580*t,1280-240*t*(1-t)-55*t];
 for(let i=0;i<=16;i++){const t=i/16,[x,y]=edge(t);line([[x,y],[x,y+29]],'#394e54',2);}
 for(const off of [-47,-30]){g.beginPath();g.moveTo(110,1280+off);g.quadraticCurveTo(360,1160+off,690,1225+off);g.strokeStyle='#334c50';g.lineWidth=8;g.stroke();g.strokeStyle='#94a59a';g.lineWidth=1.5;g.stroke();}
 for(let i=0;i<9;i++){const [x,y]=edge(i/8);line([[x,y],[x,y-54]],'#394f50',7);}
 lamp(135,1310,1.1);lamp(705,1246,.9);person(403,1213,.9,'#b9a88b');person(426,1207,.8,'#6c8580');
 shrubs(65,1430,180,160,['#172f35','#2c4540','#4d5b41']);shrubs(820,1500,150,180,['#1d3538','#3c5145']);stones(110,1390,30,1.2);
 steam(760,883,.7);groundLeaves(1280,65);
}
function seated(x,y,s,coat){ellipse(x,y-41*s,7*s,8*s,'#29343a');poly([[x-10*s,y-32*s],[x+10*s,y-32*s],[x+12*s,y],[x-12*s,y]],coat);line([[x-6*s,y],[x-8*s,y+23*s]],'#b09b81',5*s);line([[x+6*s,y],[x+8*s,y+23*s]],'#b09b81',5*s);line([[x-11*s,y],[x+12*s,y]],'#333b39',3*s);}
function third(){
 sky(3);
 // The ending is about resting, not touring: a small public footbath in a tucked-away courtyard.
 poly([[0,1050],[900,980],[900,1600],[0,1600]],gradient(980,1600,'#687671','#3c5358'));
 for(let i=0;i<35;i++){const y=1060+i*17;line([[0,y],[900,y-50]],'rgba(33,59,62,.24)',1);}
 for(let i=0;i<26;i++){const x=i*45;line([[x,1000],[450+(x-450)*2,1600]],'rgba(33,59,62,.2)',1);}
 house(95,1030,210,185,58,20,{entry:.63,tone:2,bays:3,bright:.48,sign:'茶'});
 house(490,1015,275,260,85,-23,{entry:.35,tone:1,bays:3,bright:.72,curtain:'#5c7170'});
 // Low plaster wall, gate recess and quiet golden maple are the middle-distance hinge.
 poly([[320,1000],[461,986],[461,1041],[320,1059]],'#89928a');poly([[312,992],[461,977],[472,987],[320,1008]],'#30474c');
 maple(403,1065,540,245);pine(855,1000,240,'#264038');
 // The basin is small and visibly a footbath, with a thick timber rim.
 poly([[180,1250],[570,1150],[795,1268],[378,1405]],'#263f46');
 poly([[196,1253],[570,1170],[768,1268],[380,1382]],gradient(1170,1390,'#4e8286','#42666d'));
 poly([[180,1250],[378,1405],[378,1438],[180,1283]],'#735a42');poly([[378,1405],[795,1268],[795,1301],[378,1438]],'#51493b');
 poly([[155,1240],[570,1134],[600,1150],[182,1263]],'#a38861');poly([[570,1134],[816,1265],[795,1286],[570,1157]],'#9f845f');
 poly([[155,1240],[378,1386],[378,1417],[155,1271]],'#a18a69');poly([[378,1386],[816,1265],[816,1294],[378,1417]],'#baa17b');
 for(let i=0;i<55;i++){const y=1190+rand()*160,x=360+rand()*270;line([[x,y],[x+5+rand()*25,y-4]],'rgba(194,218,204,.14)',1);}
 // Bench, two seated travellers, a pair of shoes: the small details explain the scene.
 poly([[197,1200],[487,1127],[507,1145],[214,1221]],'#b7976d');
 for(let j=0;j<3;j++){line([[201,1201+j*5],[487,1130+j*5]],'rgba(72,62,46,.3)',1);}
 ellipse(677,1336,18,9,'#846c48');ellipse(677,1331,18,7,'#bba278');ellipse(677,1331,12,4,'#73654b');
 line([[220,1215],[220,1240]],'#574a3c',8);line([[465,1154],[465,1184]],'#574a3c',8);
 seated(330,1183,1.25,'#6b8988');seated(383,1171,1.3,'#d1b387');
 ellipse(265,1265,12,5,'#273943');ellipse(283,1278,12,5,'#293e45');poly([[457,1141],[481,1135],[487,1147],[463,1154]],'#d3d5be');
 steam(430,1260,1.25);steam(560,1254,1);steam(630,1223,.72);
 // A short old stone lantern belongs to the garden rather than to a city street.
 poly([[100,1288],[133,1288],[125,1181],[110,1181]],'#5b6e6e');poly([[92,1180],[142,1180],[135,1137],[100,1137]],'#52686a');poly([[83,1136],[150,1136],[130,1118],[104,1118]],'#81918a');
 poly([[109,1148],[125,1148],[125,1172],[109,1172]],'#f0c889');glow(116,1158,60,60,'241,190,113',.2);glow(120,1290,100,25,'230,173,94',.13);
 lamp(790,1110,.85);shrubs(870,1410,120,120,['#243e3d','#40594b','#657354']);shrubs(0,1440,150,150,['#193739','#345044']);groundLeaves(1100,150);
}
function render(canvas,id){if(![1,2,3].includes(id))throw Error('Unknown concept');canvas.width=W;canvas.height=H;g=canvas.getContext('2d',{willReadFrequently:true});seed=3400+id*37;g.lineJoin='round';[first,second,third][id-1]();const vign=g.createRadialGradient(470,1030,380,450,900,1100);vign.addColorStop(0,'rgba(9,20,31,0)');vign.addColorStop(1,'rgba(8,17,29,.2)');g.fillStyle=vign;g.fillRect(0,0,W,H);grain();}
window.renderConcept=render;
for(const c of document.querySelectorAll('canvas[data-concept]'))render(c,Number(c.dataset.concept));
window.CONCEPTS_READY=true;
