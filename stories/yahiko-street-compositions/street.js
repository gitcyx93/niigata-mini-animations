// Roads and connected building fronts determine these scenes; no use of the old isolated-house layouts.
function uv(p,u,v){return [mix(mix(p[0][0],p[1][0],u),mix(p[3][0],p[2][0],u),v),mix(mix(p[0][1],p[1][1],u),mix(p[3][1],p[2][1],u),v)];}
function patch(p,u0,v0,u1,v1,color){poly([uv(p,u0,v0),uv(p,u1,v0),uv(p,u1,v1),uv(p,u0,v1)],color);}
function strokeUV(p,u0,v0,u1,v1,color,width=1){line([uv(p,u0,v0),uv(p,u1,v1)],color,width);}
function litWindow(p,u,v,w,h,lit,scale=1){
 patch(p,u-.009,v-.009,u+w+.009,v+h+.009,'#171e22');
 const top=uv(p,u,v+h),bottom=uv(p,u,v);patch(p,u,v,u+w,v+h,gradient(top[1],bottom[1],lit?'#866749':'#27343a',lit?'#e9ba72':'#18272e'));
 if(lit){patch(p,u+.012,v+.01,u+w-.012,v+h*.22,'rgba(91,54,27,.3)');strokeUV(p,u+.03,v+h*.28,u+w-.02,v+h*.28,'rgba(62,41,26,.4)',2);}
 for(let j=1;j<5;j++)strokeUV(p,u+w*j/5,v,u+w*j/5,v+h,'#3c3228',1.1*scale);
 strokeUV(p,u,v+h*.53,u+w,v+h*.53,'#574532',1.4*scale);strokeUV(p,u,v,u+w,v,'#aa8960',1*scale);
}
function signboard(p,u,v,label,lit=false){
 const a=uv(p,u,v),b=uv(p,u,v+.25),h=Math.max(35,a[1]-b[1]),w=h*.28;
 poly([[a[0]-w/2,a[1]],[a[0]+w/2,a[1]-3],[b[0]+w/2,b[1]-3],[b[0]-w/2,b[1]]],lit?'#c8b783':'#392e26');
 line([[a[0]-w/2,a[1]],[b[0]-w/2,b[1]]],'#9a815a',1);
 g.save();g.font=`${Math.max(10,h*.21)}px serif`;g.fillStyle=lit?'#393c30':'#dcc599';g.textAlign='center';[...label].forEach((c,i)=>g.fillText(c,mix(b[0],a[0],(i+.6)/label.length),b[1]+h*(i+.8)/(label.length+.2)));g.restore();
}
function face(p,opt={}){
 const floors=opt.floors||2,bays=opt.bays||3,inn=opt.inn,scale=Math.min(2.5,Math.hypot(p[1][0]-p[0][0],p[1][1]-p[0][1])/250);
 const top=Math.min(p[2][1],p[3][1]),bottom=Math.max(p[0][1],p[1][1]);
 poly(p,gradient(top,bottom,opt.side?'#34403e':inn?'#5c5140':'#47433b',opt.side?'#202e31':'#302d28'));
 // Weatherboard below, plaster panels above, all aligned to the same perspective plane.
 for(let j=0;j<36;j++)strokeUV(p,0,j/36,1,j/36,'rgba(22,25,23,.36)',1.1);
 for(let f=0;f<floors;f++){
  const low=f/floors+.07/floors,high=(f+1)/floors-.09/floors;
  if(f>0){patch(p,.015,low-.025,.985,high+.025,opt.side?'#50564a':inn?'#8b8067':'#807963');
   patch(p,.015,low-.025,.985,low+.12/floors,opt.side?'#303c35':'#4c4030');
   for(let j=0;j<bays*10;j++)strokeUV(p,.02+j*.96/(bays*10),low-.025,.02+j*.96/(bays*10),low+.12/floors,'rgba(151,119,73,.25)',1);
  }
  for(let k=0;k<bays;k++){const u=.055+k*.94/bays,w=.69/bays,v=f/floors+(f===0?.09:.25)/floors,h=(f===0?.69:.43)/floors;
   const lit=opt.side?rand()>.72:(f===0?rand()>.1:rand()>.27);
   litWindow(p,u,v,w,h,lit,scale);
   if(inn&&f>0){
    const vv=low+.04/floors;patch(p,u-.025,low-.04/floors,u+w+.025,vv,'#443a2d');
    for(let r=0;r<9;r++)strokeUV(p,u+w*r/8,low-.04/floors,u+w*r/8,vv+.20/floors,'#372e24',1.9*scale);
    strokeUV(p,u-.025,vv+.20/floors,u+w+.025,vv+.20/floors,'#a18860',2*scale);
   }
  }
  // Each floor has an actual projecting eave, a dark underside and exposed rafter ends.
  const v=(f+1)/floors,aa=uv(p,-.035,v),bb=uv(p,1.035,v),drop=9*scale;
  poly([[aa[0]-7*scale,aa[1]+drop],[bb[0]+7*scale,bb[1]+drop],[bb[0],bb[1]-5*scale],[aa[0],aa[1]-5*scale]],'#24363b');
  line([[aa[0]-7*scale,aa[1]+drop],[bb[0]+7*scale,bb[1]+drop]],'#819089',1.2*scale);
  for(let j=0;j<bays*5;j++){const q=uv(p,j/(bays*5),v);line([[q[0],q[1]+6*scale],[q[0],q[1]+13*scale]],'#413a2d',2*scale);}
  if(f<floors-1)strokeUV(p,0,(f+1)/floors,1,(f+1)/floors,'#1e2829',6*scale);
 }
 for(let k=0;k<=bays;k++){strokeUV(p,k/bays,0,k/bays,1,'#252a25',5*scale);strokeUV(p,k/bays+.006,0,k/bays+.006,1,'rgba(181,148,92,.35)',1.1*scale);}
 if(opt.shop){
  // Open shop counter, rows of stock and split noren establish a shop, not a generic lit window.
  patch(p,.08,.025,.88,.185,'#483329');
  for(let row=0;row<2;row++){const v=.045+row*.052;strokeUV(p,.08,v,.88,v,'#b19564',3*scale);for(let i=0;i<11;i++){const u=.11+i*.068;patch(p,u,v+.008,u+.038,v+.034,['#c9ac73','#8e7b51','#a98757','#6e6246'][i%4]);}}
  const cloth=opt.cloth||'#344f51';
  for(let k=0;k<5;k++)patch(p,.08+k*.162,.19,.225+k*.162,.265,cloth);
  const center=uv(p,.5,.225);g.fillStyle='#e4d6ae';g.font=`${Math.max(11,scale*15)}px serif`;g.textAlign='center';g.fillText(opt.shop,center[0],center[1]);
  signboard(p,.92,.28,opt.shop,false);
  const l=uv(p,.08,.19);lantern(l[0],l[1]+20*scale,.68*scale);
  const r=uv(p,.82,.15);lantern(r[0],r[1]+12*scale,.5*scale);
 }
 if(inn){
  // A recessed entrance and a small gabled porch, separate from the repeated upper rooms.
  patch(p,.33,.008,.64,.25,'#111e21');litWindow(p,.37,.018,.22,.18,true,scale);
  for(let k=0;k<3;k++)patch(p,.325+k*.11,.17,.43+k*.11,.245,'#475f52');
  const a=uv(p,.29,.255),b=uv(p,.69,.255),mid=uv(p,.49,.32);
  poly([[a[0]-8,a[1]+9],mid,[b[0]+8,b[1]+9]],'#2b3a3b');line([[a[0]-8,a[1]+9],mid,[b[0]+8,b[1]+9]],'#a2a18c',2);
  const pos=uv(p,.88,.21);signboard(p,.88,.23,'湯宿',false);
  for(const u of [.29,.7]){const q=uv(p,u,.13);lantern(q[0],q[1],scale*.7);}
  const entry=uv(p,.5,0);glow(entry[0],entry[1]+8,90*scale,24*scale,'242,177,77',.22);
 }
 // Drains and narrow boundary posts follow the wall, not scattered across open ground.
 strokeUV(p,.987,0,.987,1,'#203039',4*scale);
}
function tiledRoof(left,right,dx,dy){
 const a=[left[0]+dx,left[1]+dy],b=[right[0]+dx,right[1]+dy];
 poly([left,right,b,a],gradient(Math.min(a[1],b[1]),Math.max(left[1],right[1]),'#64716e','#293a3f'));
 for(let i=1;i<8;i++){const t=i/8;line([[mix(left[0],a[0],t),mix(left[1],a[1],t)],[mix(right[0],b[0],t),mix(right[1],b[1],t)]],'rgba(19,29,32,.6)',2);}
 const n=Math.max(8,Math.hypot(right[0]-left[0],right[1]-left[1])/13);for(let i=0;i<=n;i++){const t=i/n;line([[mix(left[0],right[0],t),mix(left[1],right[1],t)],[mix(a[0],b[0],t),mix(a[1],b[1],t)]],'rgba(165,175,156,.25)',1);}
 line([a,b],'#8b9380',3);line([left,right],'#182a30',7);line([[left[0],left[1]-3],[right[0],right[1]-3]],'#a1a790',1.4);
}
function background(id){
 g.fillStyle=gradient(0,1100,'#111e30','#425657');g.fillRect(0,0,W,H);
 glow(470,700,500,460,'119,141,131',.12);
 const mx=[470,735,625][id-1];glow(mx,280,100,100,'209,222,212',.12);ellipse(mx,280,11,11,'#eee3c8');
 for(let i=0;i<60;i++){const x=rand()*W,y=rand()*650;ellipse(x,y,.6,.6,`rgba(223,228,214,${rand()*.3})`);}
 const p=[[0,1000]];for(let x=0;x<=900;x+=25)p.push([x,850+Math.sin(x*.009)*70+Math.sin(x*.022)*18]);p.push([900,1600],[0,1600]);poly(p,'#253d3d');
 for(let i=0;i<50;i++)pine(rand()*W,920,50+rand()*130,'#203738');
}
function streetGround(center,bend=0,steps=false){
 g.fillStyle=gradient(900,1600,'#5a6259','#3b4c4d');g.fillRect(0,920,900,680);
 const cx=y=>center+bend*Math.pow((y-920)/680,1.7);
 for(let y=926,row=0;y<1630;row++){
  const t=(y-920)/680,h=7+t*24,w=15+t*49;
  for(let x=-w+(row%2)*w*.5;x<950;x+=w){const xx=x+cx(y)-450;poly([[xx+1,y],[xx+w-2,y-1],[xx+w-4,y+h-2],[xx+2,y+h-1]],['#59625c','#62695f','#525e59','#677067'][Math.floor(rand()*4)]);}
  if(steps&&row%3===0){line([[0,y+h-1],[900,y+h-1]],'#2c4142',4);line([[0,y+h-4],[900,y+h-4]],'#9ca18b',1.2);}
  y+=h;
 }
 for(let i=0;i<160;i++){const x=rand()*900,y=980+rand()*620;line([[x,y],[x+3+rand()*12,y]],'rgba(204,198,155,.08)',1);}
}
function warmPaving(x,y,rx,ry){glow(x,y,rx,ry,'246,176,75',.17);for(let i=0;i<22;i++){const xx=x+(rand()-.5)*rx,yy=y+rand()*ry;line([[xx,yy],[xx+5+rand()*16,yy]],'rgba(239,186,101,.12)',1.5);}}
function pair(x,y,h){
 const one=(xx,yy,hh,phase)=>{const s=hh/100;g.save();g.translate(xx,yy);g.scale(s,s);g.fillStyle='#080e15';g.strokeStyle='#080e15';g.lineCap='round';g.lineJoin='round';ellipse(0,-91,6.1,7.7,'#080e15');
 g.beginPath();g.moveTo(-6,-83);g.quadraticCurveTo(-14,-81,-12,-62);g.lineTo(-11,-36);g.quadraticCurveTo(0,-32,12,-36);g.lineTo(10,-66);g.quadraticCurveTo(10,-83,4,-83);g.closePath();g.fill();
 g.lineWidth=4.5;g.beginPath();g.moveTo(-6,-36);g.lineTo(-7-phase*3,-19);g.lineTo(-12+phase*3,0);g.moveTo(6,-36);g.lineTo(6+phase*4,-20);g.lineTo(10-phase*3,-1);g.stroke();
 g.lineWidth=4;g.beginPath();g.moveTo(-10,-76);g.lineTo(-16,-54);g.lineTo(-12,-40);g.moveTo(10,-75);g.lineTo(16,-57);g.lineTo(17,-43);g.stroke();ellipse(-12+phase*3,0,5,2,'#080e15');ellipse(11-phase*3,-1,5,2,'#080e15');g.restore();};
 ellipse(x+12,y+4,h*.43,h*.07,'rgba(6,15,22,.35)');one(x-h*.16,y,h,1);one(x+h*.17,y-4,h*.95,-1);
 line([[x+h*.01,y-h*.43],[x+h*.04,y-h*.45]],'#080e15',h*.045);
}
function lampStreet(x,y,s){line([[x,y],[x,y-145*s]],'#17292e',3.5*s);poly([[x-12*s,y-149*s],[x+12*s,y-149*s],[x+8*s,y-121*s],[x-8*s,y-121*s]],'#e8cf93');poly([[x-16*s,y-151*s],[x+16*s,y-151*s],[x,y-164*s]],'#243a3c');glow(x,y-136*s,45*s,55*s,'246,186,103',.18);warmPaving(x,y,80*s,35*s);}
function bathHint(x,y,s){
 // A private side entrance and screened yard: steam is readable without exposing a public-facing tub.
 g.save();g.translate(x,y);g.scale(s,s);
 poly([[0,0],[114,-14],[114,-142],[0,-128]],'#324a41');
 for(let i=0;i<20;i++)line([[i*6,-i*.13],[i*6,-130-i*.13]],i%2?'#657758':'#4e654d',2.5);
 line([[0,-28],[114,-42]],'#2b4239',4);line([[0,-109],[114,-123]],'#2b4239',4);
 poly([[-40,8],[0,0],[0,-143],[-40,-134]],'#3b3f31');poly([[-47,-132],[3,-143],[-1,-154],[-38,-143]],'#263c3c');
 poly([[-35,-126],[-6,-133],[-6,-79],[-35,-72]],'#566853');g.fillStyle='#e4d0a1';g.font='20px serif';g.fillText('湯',-29,-93);
 steam(60,-125,.7);steam(93,-129,.63);lantern(-40,-75,.45);g.restore();
}
function awning(left,right,color){poly([left,right,[right[0]+9,right[1]+34],[left[0]-15,left[1]+38]],color);line([[left[0]-15,left[1]+38],[right[0]+9,right[1]+34]],'#c3b08a',2);}
function sceneA(){
 background(1);streetGround(490,60);
 // Far shops make the lane turn rather than end in a black vanishing point.
 face([[377,1036],[488,1023],[488,843],[377,851]],{floors:2,bays:2,shop:'茶'});tiledRoof([365,853],[501,843],12,-43);
 face([[490,1027],[583,1061],[583,824],[490,837]],{floors:2,bays:2});tiledRoof([480,839],[594,826],14,-40);
 // Hero inn hugs the right-hand street bend. Three timber floors and balconies read as an old ryokan.
 face([[570,1069],[1030,1468],[1030,350],[570,590]],{floors:3,bays:4,inn:true});
 face([[570,1069],[521,1031],[521,648],[570,590]],{floors:3,bays:1,side:true});
 tiledRoof([548,597],[1051,351],20,-119);
 // Near and middle shops form the left boundary, with recognizable open counters and noren.
 face([[210,1239],[373,1052],[373,710],[210,544]],{floors:2,bays:2,shop:'土産',cloth:'#754a38'});tiledRoof([197,548],[383,713],-14,-80);
 face([[-80,1720],[215,1238],[215,540],[-80,130]],{floors:2,bays:3,shop:'甘味',cloth:'#344f51'});tiledRoof([-110,134],[228,542],-10,-91);
 awning([-50,1020],[204,958],'#4b6260');
 // Gutters, thresholds and light all belong to the street edges.
 line([[215,1600],[368,1110],[401,1045]],'#293e3d',12);line([[219,1600],[372,1110],[405,1045]],'#9a9f87',2);
 line([[810,1600],[580,1080]],'#273d3f',8);
 warmPaving(295,1342,145,160);warmPaving(667,1258,165,130);lampStreet(438,1052,.42);
 // A courtyard is glimpsed beside the inn, not a swimming pool in the main street.
 bathHint(831,1393,.72);maple(972,1470,820,270);
 pair(479,1230,106);
 line([[244,620],[451,792],[565,710]],'rgba(15,27,33,.5)',1.2);
 groundLeaves(1040,75);
}
function sceneB(){
 background(2);streetGround(478,30,true);
 // The lane meets the old inn at a small bend; the broad facade is the destination.
 face([[235,1141],[735,1114],[735,536],[235,562]],{floors:3,bays:5,inn:true});
 face([[735,1114],[836,1059],[836,515],[735,536]],{floors:3,bays:2,side:true});
 tiledRoof([211,566],[757,538],46,-116);poly([[757,538],[851,514],[803,420]],'#304448');
 // A modest triangular gable and projecting verandas, not a square cabin roof.
 poly([[325,478],[474,378],[643,461]],'#4a4b3c');line([[325,478],[474,378],[643,461]],'#8a9988',3);
 for(let i=0;i<13;i++){const x=372+i*16,y=478-(1-Math.abs(x-474)/149)*95;line([[x,477],[x,y]],'#283630',3);}
 // Screened bath access sits behind the near shops, not pasted onto their street facades.
 bathHint(790,1112,.56);
 // Two very different shops frame the approach at walking scale.
 face([[-90,1670],[286,1220],[286,830],[-90,464]],{floors:2,bays:3,shop:'茶屋',cloth:'#7a5140'});tiledRoof([-100,463],[300,831],-12,-88);
 face([[737,1230],[1010,1620],[1010,594],[737,854]],{floors:2,bays:3,shop:'土産',cloth:'#52614b'});tiledRoof([725,857],[1020,594],15,-79);
 // Low steps draw the eye to the inn; the side passages remain connected.
 for(let k=0;k<4;k++){poly([[313-k*13,1153+k*17],[702+k*10,1134+k*17],[702+k*10,1142+k*17],[313-k*13,1161+k*17]],'#6b7568');line([[313-k*13,1153+k*17],[702+k*10,1134+k*17]],'#a3a68b',1.5);}
 warmPaving(490,1235,190,100);warmPaving(290,1450,150,160);warmPaving(721,1460,130,160);
 lampStreet(319,1264,.68);
 maple(60,1535,950,250);pair(486,1370,125);
 groundLeaves(1150,95);
}
function sceneC(){
 background(3);streetGround(610,-75);
 // A corner inn shows two faces and gives the street a reason to bend around it.
 face([[302,1138],[649,1319],[649,507],[302,586]],{floors:3,bays:3,inn:true});
 face([[302,1138],[113,1045],[113,641],[302,586]],{floors:3,bays:2,side:true});
 tiledRoof([287,589],[667,511],13,-109);poly([[287,589],[96,645],[130,552],[300,480]],'#35494c');
 // A side lane continues past the corner into a warm cluster, not an isolated courtyard.
 face([[690,1080],[789,1045],[789,799],[690,796]],{floors:2,bays:2,shop:'茶'});tiledRoof([681,796],[799,799],6,-51);
 face([[789,1045],[913,1090],[913,826],[789,799]],{floors:2,bays:2});tiledRoof([783,799],[924,828],12,-51);
 // Close souvenir shop on the right, cropped only because the viewer is standing beside it.
 face([[776,1348],[1050,1720],[1050,343],[776,715]],{floors:2,bays:3,shop:'菓子',cloth:'#5c6b50'});tiledRoof([762,715],[1060,343],19,-88);
 awning([778,1116],[1010,1249],'#54685b');
 line([[291,1600],[488,1395],[687,1110],[790,1075]],'#263d3c',10);line([[295,1600],[492,1395],[691,1110],[792,1079]],'#929c81',2);
 // The bath access belongs to a narrow side alley of the inn, screened from passing pedestrians.
 bathHint(153,1235,.77);maple(0,1400,750,275);
 warmPaving(581,1380,175,100);warmPaving(820,1460,150,140);lampStreet(724,1102,.53);
 pair(660,1455,135);groundLeaves(1170,85);
}
function renderStreet(c,key){if(!['A','B','C'].includes(key))throw Error('Invalid street');c.width=W;c.height=H;g=c.getContext('2d',{willReadFrequently:true});seed=3914+key.charCodeAt(0);g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.filter='none';g.lineJoin='round';({A:sceneA,B:sceneB,C:sceneC})[key]();const v=g.createRadialGradient(470,1050,280,450,950,1100);v.addColorStop(0,'rgba(6,15,23,0)');v.addColorStop(1,'rgba(6,15,23,.33)');g.fillStyle=v;g.fillRect(0,0,W,H);grain();}
window.renderStreet=renderStreet;for(const c of document.querySelectorAll('canvas[data-street]'))renderStreet(c,c.dataset.street);window.STREET_READY=true;
