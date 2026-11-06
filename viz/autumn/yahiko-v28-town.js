// v28: only the final shot changes. Bridge-style pair, moving feet, open windows and a running roof cat.
function townBathPath(b){b.beginPath();b.moveTo(800,1352);b.bezierCurveTo(806,1310,870,1289,942,1298);b.bezierCurveTo(1008,1299,1064,1314,1070,1353);b.bezierCurveTo(1078,1390,1024,1425,945,1433);b.bezierCurveTo(877,1438,813,1418,802,1382);b.closePath();}
function townUV(p,u,v){return [lerp(lerp(p[0][0],p[1][0],u),lerp(p[3][0],p[2][0],u),v),lerp(lerp(p[0][1],p[1][1],u),lerp(p[3][1],p[2][1],u),v)];}
function townPanel(b,p,u,v,w,h,c){poly(b,[townUV(p,u,v),townUV(p,u+w,v),townUV(p,u+w,v+h),townUV(p,u,v+h)],c);}
function townLine(b,p,u,v,u2,v2,c,w=1){b.strokeStyle=c;b.lineWidth=w;b.beginPath();b.moveTo(...townUV(p,u,v));b.lineTo(...townUV(p,u2,v2));b.stroke();}
function townWindow(b,p,u,v,w,h,seed,scale){
 const bright=rnd(seed,25001)>.24;
 townPanel(b,p,u-.008,v-.008,w+.016,h+.016,'#171e25');
 const a=townUV(p,u,v+h),z=townUV(p,u,v),q=b.createLinearGradient(a[0],a[1],z[0],z[1]);q.addColorStop(0,bright?'#a77f4f':'#27323c');q.addColorStop(1,bright?'#ebc88b':'#192731');townPanel(b,p,u,v,w,h,q);
 for(let j=1;j<5;j++)townLine(b,p,u+w*j/5,v,u+w*j/5,v+h,'#51412c',1.3*scale);
 for(let j=1;j<3;j++)townLine(b,p,u,v+h*j/3,u+w,v+h*j/3,'#6c5334',1*scale);
 townLine(b,p,u,v,u+w,v,'#b69863',1.2*scale);
}
function townRoof(b,e0,e1,r0,r1){
 const q=b.createLinearGradient(0,Math.min(r0[1],r1[1]),0,Math.max(e0[1],e1[1]));q.addColorStop(0,'#4d5a64');q.addColorStop(.65,'#293642');q.addColorStop(1,'#172633');poly(b,[e0,e1,r1,r0],q);
 for(let j=1;j<8;j++){const v=j/8;b.strokeStyle='rgba(9,19,30,.55)';b.lineWidth=1.6;b.beginPath();b.moveTo(lerp(e0[0],r0[0],v),lerp(e0[1],r0[1],v));b.lineTo(lerp(e1[0],r1[0],v),lerp(e1[1],r1[1],v));b.stroke();}
 for(let j=0;j<=32;j++){const v=j/32;b.strokeStyle='rgba(163,179,190,.24)';b.lineWidth=1;b.beginPath();b.moveTo(lerp(e0[0],e1[0],v),lerp(e0[1],e1[1],v));b.lineTo(lerp(r0[0],r1[0],v),lerp(r0[1],r1[1],v));b.stroke();}
 b.strokeStyle='#9ba9ae';b.lineWidth=2.2;b.beginPath();b.moveTo(...r0);b.lineTo(...r1);b.stroke();b.strokeStyle='#101f2b';b.lineWidth=8;b.beginPath();b.moveTo(...e0);b.lineTo(...e1);b.stroke();b.strokeStyle='#657786';b.lineWidth=2;b.beginPath();b.moveTo(e0[0],e0[1]-3);b.lineTo(e1[0],e1[1]-3);b.stroke();
}
function townLantern(b,x,y,s=1){
 b.save();glow(b,x,y,47*s,65*s,[255,171,83],.18);b.strokeStyle='#201e25';b.lineWidth=2*s;b.beginPath();b.moveTo(x,y-30*s);b.lineTo(x,y-13*s);b.stroke();
 b.fillStyle='#e9be77';b.beginPath();b.ellipse(x,y,9*s,14*s,0,0,TAU);b.fill();b.fillStyle='#ffdf9a';b.beginPath();b.ellipse(x-1*s,y,5*s,12*s,0,0,TAU);b.fill();
 for(let k=-2;k<=2;k++){b.strokeStyle='rgba(131,72,39,.4)';b.lineWidth=.8*s;b.beginPath();b.moveTo(x-7*s,y+k*4.6*s);b.lineTo(x+7*s,y+k*4.6*s);b.stroke();}b.fillStyle='#393039';b.fillRect(x-6*s,y-16*s,12*s,3*s);b.fillRect(x-5*s,y+13*s,10*s,3*s);b.restore();
}
function townFacade(b,p,floors,bays,seed,shop=false){
 const xs=p.map(q=>q[0]),ys=p.map(q=>q[1]),q=b.createLinearGradient(Math.min(...xs),0,Math.max(...xs),0);q.addColorStop(0,'#322b2c');q.addColorStop(.45,'#66513d');q.addColorStop(1,'#302a2d');poly(b,p,q);
 for(let i=1;i<37;i++)townLine(b,p,0,i/37,1,i/37,'rgba(18,22,28,.4)',1);
 for(let f=0;f<floors;f++){
  const v=f/floors;
  if(f>0)townPanel(b,p,.02,v+.06/floors,.96,.83/floors,'#817b6b');
  for(let k=0;k<bays;k++)townWindow(b,p,.045+k*.94/bays,v+(f?.26:.12)/floors,.76/bays,(f?.42:.65)/floors,seed+k+f*11,1.25);
  if(f>0){
   townPanel(b,p,0,v,1,.16/floors,'#45352e');
   for(let k=0;k<bays*8;k++)townLine(b,p,k/(bays*8),v+.02/floors,k/(bays*8),v+.28/floors,'#2e2928',2.3);
   townLine(b,p,0,v+.28/floors,1,v+.28/floors,'#a3865d',3);
   const a=townUV(p,-.025,v),z=townUV(p,1.025,v);poly(b,[[a[0]-7,a[1]+12],[z[0]+7,z[1]+12],[z[0],z[1]-7],[a[0],a[1]-7]],'#24313b');
   b.strokeStyle='#667581';b.lineWidth=1.6;b.beginPath();b.moveTo(a[0]-7,a[1]+12);b.lineTo(z[0]+7,z[1]+12);b.stroke();
  }
 }
 for(let k=0;k<=bays;k++){townLine(b,p,k/bays,0,k/bays,1,'#28242a',7);townLine(b,p,k/bays+.009,0,k/bays+.009,1,'rgba(170,139,89,.45)',1.5);}
 if(shop){
  townPanel(b,p,.07,.045,.85,.24,'#5b3c2b');
  for(let row=0;row<2;row++){townLine(b,p,.07,.07+row*.11,.92,.07+row*.11,'#c1a06c',3);for(let j=0;j<9;j++)townPanel(b,p,.11+j*.085,.08+row*.11,.05,.055,['#ad8d57','#d1b57e','#7d7e57'][j%3]);}
  for(let k=0;k<4;k++)townPanel(b,p,.08+k*.21,.45,.19,.15,'#663645');
  const l=townUV(p,.89,.36);townLantern(b,l[0],l[1],1.15);
 }
}
const townFarV25=layer(b=>{
 // Same flat mountain silhouettes and cedar vocabulary as the bridge, not the painterly reference texture.
 mountain(b,930,'#1a2938');mountain(b,1010,'#172731');
 for(let i=0;i<65;i++){const x=-40+rnd(i,25101)*1160,y=990+rnd(i,25102)*75;cedarShape(b,x,y,65+rnd(i,25103)*170,12+rnd(i,25104)*15,'#12232c');}
 [[70,1000,180,135,25120,.55],[1030,995,175,160,25140,.6],[385,975,150,110,25160,.45]].forEach(a=>nightCrown(b,...a));
},W,H,1.25);
const townMidV25=layer(b=>{
 // The path is the organising shape: it turns past a shop, then reaches the inn rather than an empty plaza.
 grad(b,0,1130,W,790,[[0,'#273439'],[1,'#141e27']]);
 b.beginPath();b.moveTo(352,1920);b.bezierCurveTo(438,1650,793,1550,596,1337);b.bezierCurveTo(540,1267,575,1190,644,1160);b.lineTo(741,1160);b.bezierCurveTo(619,1283,719,1290,837,1440);b.bezierCurveTo(1002,1643,770,1780,720,1920);b.closePath();b.fillStyle='#555a59';b.fill();
 b.save();b.clip();for(let k=0;k<650;k++){const y=1165+rnd(k,25201)*755,x=rnd(k,25202)*1080,w=20+(y-1165)*.09,h=9+(y-1165)*.025;poly(b,[[x,y],[x+w,y-3],[x+w+4,y+h],[x+2,y+h+3]],['#63645e','#5d605c','#424d50','#737266'][k%4]);}b.restore();
 // Smaller receding houses establish that the ryokan is part of a town.
 townFacade(b,[[70,1256],[320,1174],[320,953],[70,992]],2,3,25230);
 townRoof(b,[49,995],[337,953],[105,902],[289,882]);
 townFacade(b,[[305,1154],[461,1173],[461,977],[305,969]],2,2,25260);
 townRoof(b,[291,972],[475,980],[332,904],[434,909]);
 // A single old ryokan with two visible faces, a grounded veranda and a modest gabled entry.
 poly(b,[[506,1210],[1031,1132],[1062,1174],[492,1258]],'#827257');
 for(let j=1;j<7;j++){b.strokeStyle='rgba(41,37,33,.4)';b.lineWidth=1;b.beginPath();b.moveTo(506-j*2,1210+j*7);b.lineTo(1031+j*4,1132+j*7);b.stroke();}
 townFacade(b,[[509,1210],[1017,1137],[1017,799],[509,875]],2,5,25300);
 townFacade(b,[[1017,1137],[1113,1070],[1113,755],[1017,799]],2,2,25330);
 townRoof(b,[488,880],[1040,802],[616,710],[988,668]);
 poly(b,[[1040,802],[1130,754],[988,668]],'#293745');
 const ep=[[650,1193],[800,1171],[800,1039],[650,1061]];
 poly(b,ep,'#19252c');townWindow(b,ep,.08,.03,.84,.79,25351,1.2);
 for(let k=0;k<3;k++)townPanel(b,ep,.04+k*.31,.69,.29,.27,'#485f57');
 poly(b,[[618,1065],[727,978],[827,1038],[799,1060],[727,1006],[648,1080]],'#3a4247');
 b.strokeStyle='#a89a78';b.lineWidth=3;b.beginPath();b.moveTo(618,1065);b.lineTo(727,978);b.lineTo(827,1038);b.stroke();
 for(const x of [645,806]){const y=x===645?1075:1050;grad(b,x,y,10,134,[[0,'#9d7e52'],[.5,'#66503a'],[1,'#3b3030']]);}
 townLantern(b,632,1141,1.1);townLantern(b,822,1115,.9);
 for(let k=0;k<3;k++)poly(b,[[644-k*9,1220+k*11],[819+k*9,1193+k*11],[824+k*9,1200+k*11],[639-k*9,1227+k*11]],k%2?'#7a7c70':'#929081');
 // Quiet vertical plaque, generic inn name rather than claiming to reproduce a real hotel.
 poly(b,[[979,965],[1009,960],[1009,1060],[979,1065]],'#344542');b.save();b.fillStyle='#d7c491';b.font='23px sans-serif';b.textAlign='center';b.fillText('湯',994,996);b.fillText('宿',994,1033);b.restore();
 // A recognisable stone bath beside the inn, not water hidden behind a front screen.
 poly(b,[[802,1254],[1085,1208],[1100,1509],[821,1535],[778,1431]],'#3d4542');
 // Privacy screen stays BEHIND the bath, leaving the near water and coping visible.
 poly(b,[[825,1280],[1085,1238],[1085,1136],[825,1178]],'#343d35');
 for(let x=830;x<1090;x+=12){const y=1178-(x-825)*.16;b.strokeStyle='#69705a';b.lineWidth=3;b.beginPath();b.moveTo(x,y);b.lineTo(x,y+100);b.stroke();}
 b.strokeStyle='#8c8468';b.lineWidth=5;b.beginPath();b.moveTo(822,1178);b.lineTo(1088,1135);b.stroke();
 // Built into the garden terrace, with a rough stone retaining face rather than a floating round tub.
 b.fillStyle='#34453e';b.beginPath();b.moveTo(786,1366);b.bezierCurveTo(793,1436,986,1488,1080,1369);b.lineTo(1074,1434);b.bezierCurveTo(1009,1486,839,1495,785,1415);b.closePath();b.fill();
 for(let j=0;j<9;j++){const x=803+j*29,y=1434+Math.sin(j/8*Math.PI)*24;poly(b,[[x,y-12],[x+24,y-7],[x+21,y+14],[x-3,y+10]],['#46544a','#526052','#3b4c44'][j%3]);}
 const bath=b.createLinearGradient(0,1295,0,1435);bath.addColorStop(0,'#79958a');bath.addColorStop(.45,'#668d83');bath.addColorStop(1,'#466d6b');
 b.fillStyle=bath;townBathPath(b);b.fill();
 for(let j=0;j<19;j++){const a=j/19*TAU,x=930+Math.cos(a)*(145+rnd(j,25379)*6),y=1366+Math.sin(a)*(70+rnd(j,25378)*5);
  const rx=18+rnd(j,25380)*15,ry=11+rnd(j,25381)*11;
  const points=[[-.9,-.3],[-.55,-.9],[.35,-.8],[.95,-.15],[.7,.65],[-.35,.8]].map(([u,v],k)=>[x+u*rx+(rnd(j*7+k,25382)-.5)*5,y+v*ry]);
  poly(b,points,['#737a69','#92917b','#59695c','#6c7565'][j%4]);
  b.strokeStyle='rgba(204,196,159,.28)';b.lineWidth=2;b.beginPath();b.moveTo(...points[0]);b.lineTo(...points[1]);b.lineTo(...points[2]);b.stroke();
 }
 // Modest wooden hot-water inlet; no fountain or decorative pool effect.
 poly(b,[[1020,1285],[1041,1281],[1041,1323],[1020,1327]],'#857958');
 poly(b,[[1011,1281],[1047,1277],[1047,1290],[1011,1294]],'#b2a17a');
 townLantern(b,790,1256,.85);glow(b,817,1350,115,65,[226,181,116],.12);
 // A broad, dry stone coping supports the seated pair along the near-left edge.
 poly(b,[[766,1329],[800,1317],[857,1416],[820,1436]],'#626b63');
 poly(b,[[766,1329],[820,1436],[820,1450],[766,1341]],'#374741');
 b.strokeStyle='#a39d80';b.lineWidth=2;b.beginPath();b.moveTo(766,1329);b.lineTo(820,1436);b.stroke();
 // Two pairs of sandals stay on the dry paving, not in the water.
 for(const [x,y] of [[772,1380],[781,1377],[797,1428],[806,1425]]){b.fillStyle='#b29a6c';b.beginPath();b.ellipse(x,y,4,8,-.35,0,TAU);b.fill();b.strokeStyle='#544c3d';b.lineWidth=1.5;b.beginPath();b.moveTo(x-3,y-1);b.lineTo(x,y-4);b.lineTo(x+3,y-1);b.stroke();}
 // Folded towel on the dry coping: a small, physical bathing cue without a sign.
 poly(b,[[830,1444],[854,1437],[866,1448],[842,1456]],'#acae9b');
 b.strokeStyle='#717f79';b.lineWidth=2;b.beginPath();b.moveTo(839,1446);b.lineTo(858,1440);b.stroke();
 // Damp paving catches light near the entry, not across the entire street.
 glow(b,732,1260,155,55,[255,168,89],.13);glow(b,579,1548,160,90,[255,171,90],.08);
},W,H,1.25);
const townNearV25=layer(b=>{
 // Foreground sweet/souvenir shop follows the slope. Lower counter and split noren distinguish it from the inn.
 townFacade(b,[[-35,1785],[416,1570],[416,1303],[-35,1400]],1,4,25400,true);
 townRoof(b,[-50,1402],[435,1305],[42,1227],[298,1178]);
 poly(b,[[-30,1510],[421,1390],[436,1432],[-36,1558]],'#405b59');
 b.strokeStyle='#b9a77d';b.lineWidth=2;b.beginPath();b.moveTo(-36,1558);b.lineTo(436,1432);b.stroke();
 const sign=[[317,1420],[370,1396],[370,1516],[317,1540]];poly(b,sign,'#423126');b.save();b.fillStyle='#dfc18b';b.font='26px sans-serif';b.textAlign='center';b.fillText('茶',343,1458);b.fillText('屋',343,1494);b.restore();
 // Individual rocks and branches use the same simplified shape language as the bridge shore.
 for(let i=0;i<22;i++){const x=265+rnd(i,25421)*230,y=1725+rnd(i,25422)*195;b.fillStyle=['#353039','#292c32','#403235'][i%3];b.beginPath();b.ellipse(x,y,12+rnd(i,25423)*25,6+rnd(i,25424)*12,-.2,0,TAU);b.fill();}
 branch(b,1098,1870,330,.2,25,3,25450);
 [[1125,740,255,210,25460,.9],[1180,1570,165,155,25480,.85],[-95,1775,250,155,25500,.8],[-10,575,190,170,25520,.77]].forEach(a=>nightCrown(b,...a));
 // Modest fence beside the sloping path; silhouettes will sit behind its near rail.
 const rail=x=>1660-(x-790)*.28;
 for(let x=820;x<1110;x+=49){b.fillStyle='#4e352f';b.fillRect(x-3,rail(x)-70,7,75);b.fillStyle='#8b6b4c';b.fillRect(x-3,rail(x)-70,1.5,73);}
 for(const d of [0,27]){b.strokeStyle=d?'#50382f':'#967653';b.lineWidth=d?4:6;b.beginPath();b.moveTo(820,rail(820)-65+d);b.lineTo(1110,rail(1110)-65+d);b.stroke();}
},W,H,1.25);
function townFeet(a){
 return [[25,-19],[33,-15],[42,-15],[50,-11]].map(([x,y],i)=>{
  const swing=Math.sin(a*1.65+i*.85)*7.5,ankle=[x+5+swing,3+Math.cos(a*1.65+i*.85)*1.4];
  return {knee:[x,y],ankle,tip:[ankle[0]+8,ankle[1]+3]};
 });
}
function townCoupleV25(b,a){
 // The bridge pair's exact head shapes, near-black silhouettes and leaning embrace.
 // Only their hips and legs change: both are supported by the coping, feet swing in water.
 b.save();b.translate(807,1408);b.scale(1.3,1.3);b.lineCap='round';b.lineJoin='round';
 for(const f of townFeet(a)){
  b.strokeStyle='#a99d7b';b.lineWidth=4.8;b.beginPath();b.moveTo(...f.knee);b.quadraticCurveTo(f.knee[0]+3,-4,...f.ankle);b.stroke();
  b.save();b.globalAlpha=.65;b.strokeStyle='#c3ccb1';b.lineWidth=3.8;b.beginPath();b.moveTo(...f.ankle);b.quadraticCurveTo(f.ankle[0]+4,f.ankle[1]+4,...f.tip);b.stroke();b.restore();
 }
 b.fillStyle='#080e15';b.strokeStyle='#080e15';
 // Seated thighs point into the bath, with a visible knee bend before the bare lower legs.
 poly(b,[[-15,-33],[-2,-35],[25,-23],[30,-16],[19,-12],[-14,-20]],'#080e15');
 poly(b,[[1,-31],[19,-32],[49,-18],[54,-9],[41,-6],[16,-15],[1,-19]],'#080e15');
 b.save();b.translate(0,Math.sin(a*.8)*.35);
 b.beginPath();b.ellipse(-6,-87,7.2,9,.25,0,TAU);b.fill();b.beginPath();b.ellipse(5,-82,7,8.5,-.35,0,TAU);b.fill();
 b.beginPath();b.moveTo(-14,-78);b.quadraticCurveTo(-4,-83,1,-68);b.lineTo(6,-29);b.lineTo(-16,-29);b.lineTo(-18,-61);b.closePath();b.fill();
 b.beginPath();b.moveTo(5,-73);b.quadraticCurveTo(14,-81,20,-69);b.lineTo(23,-28);b.lineTo(1,-28);b.lineTo(-2,-60);b.closePath();b.fill();
 b.lineWidth=6;b.beginPath();b.moveTo(-14,-72);b.quadraticCurveTo(-21,-54,17,-59);b.moveTo(18,-69);b.quadraticCurveTo(8,-79,-9,-69);b.stroke();
 b.strokeStyle='rgba(168,161,126,.22)';b.lineWidth=1.1;b.beginPath();b.moveTo(-12,-80);b.quadraticCurveTo(-18,-68,-16,-47);b.stroke();b.restore();b.restore();
}
function townWindowState(a,phase=0){return {opening:.73+.15*Math.sin(a*1.3+phase),drift:Math.sin(a*1.3+phase)*3};}
function townOpenWindows(b,a){
 const front=[[509,1210],[1017,1137],[1017,799],[509,875]];
 for(const [k,phase] of [[2,0],[3,.8]]){
  const u=.045+k*.94/5,v=.63,w=.152,h=.21,state=townWindowState(a,phase);
  townPanel(b,front,u-.006,v-.012,w+.012,h+.024,'#1c2929');
  const interior=b.createLinearGradient(0,900,0,1000);interior.addColorStop(0,'#a78e5c');interior.addColorStop(1,'#514b37');townPanel(b,front,u,v,w,h,interior);
  townPanel(b,front,u+.04,v+.02,w-.075,h-.04,'#4a4635');
  const bl=townUV(front,u,v),tl=townUV(front,u,v+h),br=townUV(front,u+w,v),tr=townUV(front,u+w,v+h);
  for(const [bottom,top,sign] of [[bl,tl,-1],[br,tr,1]]){
   const spread=17+state.opening*18,tilt=sign*(8+state.drift);
   const fb=[bottom[0]+sign*spread,bottom[1]+tilt],ft=[top[0]+sign*spread,top[1]+tilt];
   const panel=sign<0?[fb,bottom,top,ft]:[bottom,fb,ft,top];
   poly(b,panel,'#786548','#292d28',2.4);
   townPanel(b,panel,.12,.08,.76,.84,'#a99b70');
   for(let j=1;j<4;j++)townLine(b,panel,j/4,.05,j/4,.95,'#4e4935',2.2);
   townLine(b,panel,.08,.48,.92,.48,'#514b37',2.4);
   b.strokeStyle='#bba477';b.lineWidth=1.3;b.beginPath();b.moveTo(...top);b.lineTo(...ft);b.stroke();
  }
  // Fixed sill and interior stay put while only the two hinged panels sway.
  townLine(b,front,u-.015,v-.012,u+w+.015,v-.012,'#b7a47d',4);
 }
}
function townCatState(a){const u=clamp((a-1.1)/4.4),distance=470*ease(u);return {x:605+distance,y:844-distance*.14,phase:distance/31*TAU,run:u>0&&u<1?Math.pow(Math.sin(Math.PI*u),.3):0};}
function townRoofCat(b,a){
 const s=townCatState(a),bob=Math.sin(s.phase*2)*1.1*s.run;
 b.save();b.translate(s.x,s.y);b.rotate(-.139);b.fillStyle='#0a141c';b.strokeStyle='#0a141c';b.lineCap='round';b.lineJoin='round';
 b.save();b.globalAlpha=.22;b.fillStyle='#080e13';b.beginPath();b.ellipse(0,1,26,3,0,0,TAU);b.fill();b.restore();
 // Alternating feet, with stride tied to travelled distance so the cat does not skate.
 for(const [hip,phase] of [[-13,0],[-8,Math.PI],[11,Math.PI],[16,0]]){
  const step=Math.sin(s.phase+phase)*8*s.run,lift=Math.max(0,Math.cos(s.phase+phase))*5*s.run;
  b.lineWidth=3;b.beginPath();b.moveTo(hip,-13+bob);b.quadraticCurveTo(hip+step*.5,-6,hip+step,-lift);b.lineTo(hip+step+4,-lift);b.stroke();
 }
 b.beginPath();b.ellipse(0,-16+bob,20,7,0,0,TAU);b.fill();b.beginPath();b.ellipse(20,-21+bob,7,6,0,0,TAU);b.fill();
 poly(b,[[15,-24+bob],[16,-33+bob],[21,-26+bob],[25,-31+bob],[27,-23+bob]],'#0a141c');
 b.lineWidth=3.8;b.beginPath();b.moveTo(-17,-18+bob);b.bezierCurveTo(-28,-21,-28,-35-Math.sin(a*2)*3,-39,-30);b.stroke();
 b.fillStyle='#b4b89b';b.beginPath();b.arc(24,-22+bob,.85,0,TAU);b.fill();
 b.strokeStyle='rgba(158,174,182,.28)';b.lineWidth=1;b.beginPath();b.ellipse(-1,-17+bob,18,6,0,Math.PI,TAU);b.stroke();b.restore();
}
function townPose(a){const u=clamp(a/7.2),s=ease(u);return {z:1+.105*s,x:-12*s,y:3*s};}
function townSetDraw(b,a){
 const p=townPose(a),paint=(img,depth)=>{b.save();b.translate(840,1350);b.scale(1+(p.z-1)*depth,1+(p.z-1)*depth);b.translate(-840+p.x*depth,-1350+p.y*depth);b.drawImage(img,0,0,W,H);b.restore();};
 paint(townFarV25,.35);paint(townMidV25,.82);
 b.save();b.translate(840,1350);b.scale(1+(p.z-1)*.82,1+(p.z-1)*.82);b.translate(-840+p.x*.82,-1350+p.y*.82);
 townOpenWindows(b,a);townRoofCat(b,a);
 // Slow plumes rise from the actual hot water, not from the roof.
 for(let k=0;k<15;k++){const u=fract(a*.105+k/15),lane=k%3;
  glow(b,883+lane*52+Math.sin(u*4+k*.8)*15+u*19,1362-u*177,24+u*29,20+u*39,[222,229,211],.23*Math.sin(Math.PI*u));
 }
 b.save();townBathPath(b);b.clip();
 for(let k=0;k<10;k++){const y=1330+k*8+Math.sin(a*.7+k)*1.2,x=826+Math.sin(a*.8+k)*7;b.strokeStyle=`rgba(203,217,197,${.10+.065*(.5+.5*Math.sin(a*1.1+k*1.7))})`;b.lineWidth=1.6;b.beginPath();b.moveTo(x+k%3*18,y);b.quadraticCurveTo(x+48,y+3,x+88,y-3);b.stroke();}
 // Ripples originate where feet meet the water, not from arbitrary decorative particles.
 for(const [index,foot] of townFeet(a).entries())for(let k=0;k<2;k++){
  const u=fract(a*.32+k/2+index*.17),x=807+foot.tip[0]*1.3,y=1408+foot.tip[1]*1.3;
  b.strokeStyle=`rgba(222,231,214,${.26*(1-u)})`;b.lineWidth=1.2;
  b.beginPath();b.ellipse(x,y,5+u*27,2+u*9,-.1,0,TAU);b.stroke();
 }
 b.strokeStyle='rgba(204,220,206,.4)';b.lineWidth=2;b.beginPath();b.moveTo(1030,1323);b.quadraticCurveTo(1025,1330,1029,1346);b.stroke();
 for(let k=0;k<3;k++){const u=fract(a*.38+k/3);b.strokeStyle=`rgba(210,221,204,${.22*(1-u)})`;b.beginPath();b.ellipse(1029,1348,6+u*21,2+u*6,0,0,TAU);b.stroke();}
 b.restore();
 // People share the bath's exact camera transform, so their seats never drift off the coping.
 townCoupleV25(b,a);b.restore();
 paint(townNearV25,1);
 if(a>.7){b.save();b.globalAlpha=.28*clamp((a-.7)/.6);glow(b,350,1090,580,230,[6,13,22],1);b.restore();}
}
