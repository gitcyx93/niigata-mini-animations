// v25: reconstruct concept #3 with the film's existing Canvas vocabulary. No bitmap background.
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
 // The private side garden stays tucked beside the inn. Only the upper water and stone rim show above the screen.
 poly(b,[[890,1195],[1110,1154],[1110,1290],[890,1305]],'#2d4139');
 b.fillStyle='#597b76';b.beginPath();b.ellipse(1018,1220,89,24,-.1,0,TAU);b.fill();
 for(let j=0;j<11;j++){const a=j/11*TAU,x=1018+Math.cos(a)*91,y=1220+Math.sin(a)*27;b.fillStyle=['#54605b','#6c7369','#3e514e'][j%3];b.beginPath();b.ellipse(x,y,12+rnd(j,25380)*9,6+rnd(j,25381)*7,-.1,0,TAU);b.fill();}
 poly(b,[[885,1253],[1100,1220],[1100,1310],[885,1343]],'#3e5546');
 for(let x=893;x<1100;x+=8){const y=1253-(x-885)*.153;b.strokeStyle=x%3?'#6e7b59':'#536a4d';b.lineWidth=3;b.beginPath();b.moveTo(x,y);b.lineTo(x,y+88);b.stroke();}
 b.strokeStyle='#8a9170';b.lineWidth=5;b.beginPath();b.moveTo(881,1252);b.lineTo(1100,1219);b.stroke();
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
 [[1125,740,255,210,25460,.9],[1065,1500,210,195,25480,1.04],[-95,1775,250,155,25500,.8],[-10,575,190,170,25520,.77]].forEach(a=>nightCrown(b,...a));
 // Modest fence beside the sloping path; silhouettes will sit behind its near rail.
 const rail=x=>1660-(x-790)*.28;
 for(let x=820;x<1110;x+=49){b.fillStyle='#4e352f';b.fillRect(x-3,rail(x)-70,7,75);b.fillStyle='#8b6b4c';b.fillRect(x-3,rail(x)-70,1.5,73);}
 for(const d of [0,27]){b.strokeStyle=d?'#50382f':'#967653';b.lineWidth=d?4:6;b.beginPath();b.moveTo(820,rail(820)-65+d);b.lineTo(1110,rail(1110)-65+d);b.stroke();}
},W,H,1.25);
function townCoupleV25(b,a){
 // Exactly the bridge's near-black, leaning pair; standing quietly beside the path, not walking in place.
 b.save();b.translate(788+Math.sin(a*.8)*.3,1615);b.scale(1.23,1.23);b.fillStyle='#080e15';b.strokeStyle='#080e15';b.lineCap='round';b.lineJoin='round';
 b.beginPath();b.ellipse(-6,-87,7.2,9,.25,0,TAU);b.fill();b.beginPath();b.ellipse(5,-82,7,8.5,-.35,0,TAU);b.fill();
 poly(b,[[-14,-78],[-4,-80],[1,-68],[6,-25],[-16,-25],[-18,-61]],'#080e15');poly(b,[[5,-73],[14,-78],[20,-69],[23,-24],[1,-24],[-2,-60]],'#080e15');
 b.lineWidth=6;b.beginPath();b.moveTo(-14,-72);b.quadraticCurveTo(-21,-54,17,-59);b.moveTo(18,-69);b.quadraticCurveTo(8,-79,-9,-69);b.stroke();b.lineWidth=5;b.beginPath();b.moveTo(-11,-26);b.lineTo(-13,-2);b.moveTo(-3,-26);b.lineTo(-1,-1);b.moveTo(8,-25);b.lineTo(7,-1);b.moveTo(17,-25);b.lineTo(19,-1);b.stroke();b.restore();
}
function townPose(a){const u=clamp(a/4);return {z:1+.055*u,x:-15*u,y:8*u};}
function townSetDraw(b,a){
 const p=townPose(a),paint=(img,depth)=>{b.save();b.translate(540,1200);b.scale(1+(p.z-1)*depth,1+(p.z-1)*depth);b.translate(-540+p.x*depth,-1200+p.y*depth);b.drawImage(img,0,0,W,H);b.restore();};
 paint(townFarV25,.35);paint(townMidV25,.82);
 b.save();b.translate(540,1200);b.scale(1+(p.z-1)*.82,1+(p.z-1)*.82);b.translate(-540+p.x*.82,-1200+p.y*.82);
 for(let k=0;k<7;k++){const u=fract(a*.22+k/7);glow(b,1005+u*20+Math.sin(u*5+k)*8,1213-u*94,10+u*22,13+u*21,[207,216,222],.06*Math.sin(Math.PI*u));}
 b.save();b.beginPath();b.ellipse(1018,1220,71,13,-.1,0,TAU);b.clip();for(let k=0;k<7;k++){const y=1214+k*2,x=963+Math.sin(a*1.5+k)*5;b.strokeStyle='rgba(194,209,203,.14)';b.lineWidth=1;b.beginPath();b.moveTo(x,y);b.lineTo(x+40,y-2);b.stroke();}b.restore();b.restore();
 paint(townNearV25,1);
 b.save();b.translate(540,1200);b.scale(p.z,p.z);b.translate(-540+p.x,-1200+p.y);townCoupleV25(b,a);b.restore();
 if(a>.7){b.save();b.globalAlpha=.28*clamp((a-.7)/.6);glow(b,350,1090,580,230,[6,13,22],1);b.restore();}
}
