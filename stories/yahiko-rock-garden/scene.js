// Rock-edged bath inspired by Yumotoya's official photos; not a reconstruction of that inn.
function rock(x,y,w,h,tone=0){
 const pts=[[x-w*.53,y+h*.15],[x-w*.42,y-h*.47],[x-w*.14,y-h*.66],[x+w*.28,y-h*.5],[x+w*.55,y-h*.1],[x+w*.48,y+h*.35],[x-w*.18,y+h*.48]];
 poly(pts,['#53615c','#657169','#485952','#768078'][tone%4]);
 poly([pts[0],pts[1],pts[2],pts[3],[x+w*.14,y-h*.15],[x-w*.25,y-h*.05]],'rgba(187,190,159,.18)');
 line([[x-w*.15,y-h*.54],[x-w*.08,y-h*.13],[x+w*.16,y+h*.12]],'rgba(26,46,43,.35)',1.2);
}
function bambooScreen(x0,y0,x1,y1,h){
 poly([[x0,y0],[x1,y1],[x1,y1-h],[x0,y0-h]],'#52624c');
 const n=Math.ceil(Math.hypot(x1-x0,y1-y0)/6);
 for(let i=0;i<=n;i++){const t=i/n,x=mix(x0,x1,t),y=mix(y0,y1,t);line([[x,y],[x,y-h]],i%3===0?'#899475':'#697a5c',3.5);for(let k=1;k<5;k++)line([[x-2,y-h*k/5],[x+2,y-h*k/5]],'#424f3c',1);}
 for(const v of [.16,.83])line([[x0,y0-h*v],[x1,y1-h*v]],'#3b4f3e',4);
 for(const t of [0,1]){const x=mix(x0,x1,t),y=mix(y0,y1,t);line([[x,y+4],[x,y-h-12]],'#354d3f',9);line([[x-2,y],[x-2,y-h-10]],'#7c8c66',1);}
}
function renderGarden(c){
 c.width=W;c.height=H;g=c.getContext('2d',{willReadFrequently:true});seed=98371;g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.lineJoin='round';sky(3);
 g.fillStyle=gradient(940,1600,'#465a50','#253e46');g.fillRect(0,970,W,630);
 // The dry path leads to the inn and skirts the enclosed bath garden.
 g.beginPath();g.moveTo(365,1600);g.bezierCurveTo(410,1370,460,1260,363,1060);g.lineTo(430,1040);g.bezierCurveTo(552,1260,530,1440,530,1600);g.closePath();g.fillStyle=gradient(1040,1600,'#879080','#536d6c');g.fill();
 g.save();g.clip();for(let i=0;i<130;i++){const x=rand()*W,y=1040+rand()*560;line([[x,y],[x+40+rand()*30,y-4]],'rgba(42,65,62,.22)',1.4);}g.restore();
 // A substantial inn, rather than a pool sitting in the street.
 house(125,1039,411,336,77,15,{entry:.58,tone:1,bays:4,bright:.6,curtain:'#577264',sign:'湯宿'});
 poly([[113,1041],[550,1057],[579,1101],[101,1088]],'#807c62');
 for(let j=0;j<5;j++)line([[111-j*2,1047+j*8],[554+j*4,1063+j*8]],'rgba(44,52,38,.34)',1.3);
 lantern(175,965,.83);lantern(471,981,.8);
 // A modest tea/souvenir shop at the frame edge gives the inn a small-town neighbour.
 const savedSeed=seed;
 house(-20,1153,160,143,32,-10,{entry:.42,tone:2,floors:1,bays:2,bright:.8,sign:'茶',curtain:'#8e604a'});
 poly([[-30,1059],[146,1048],[160,1076],[-36,1090]],'#526b68');
 poly([[-36,1090],[160,1076],[160,1087],[-36,1101]],'#3d5755');
 line([[-36,1090],[160,1076]],'#8b9c87',1.5);
 // Short hanging curtains and goods under the eave, without turning the shop into a second hero.
 for(let i=0;i<3;i++)poly([[12+i*18,1092-i],[28+i*18,1091-i],[28+i*18,1115-i],[12+i*18,1115-i]],'#ac8460');
 poly([[103,1135],[137,1132],[137,1157],[103,1160]],'#685b43');
 for(const [x,y] of [[111,1134],[123,1132],[131,1133]]){ellipse(x,y,5,4,'#ada37a');line([[x,y-5],[x,y-8]],'#455740',1.5);}
 lantern(149,1107,.58);glow(94,1168,93,18,'241,176,91',.12);
 seed=savedSeed;
 // Bath-garden rear enclosure and planting: the pool is sunk into this private garden.
 bambooScreen(592,1060,899,1099,190);
 shrubs(830,1004,105,60,['#2c4839','#536345','#798155']);pine(861,1080,270,'#284738');
 poly([[548,1027],[900,1057],[900,1220],[535,1183]],'#4b6052');
 for(let i=0;i<170;i++){const x=548+rand()*352,y=1045+rand()*150;ellipse(x,y,1+rand()*2,1+rand(),'rgba(155,164,130,.22)');}
 // Low, irregular stone pool: top-down ellipse is only a starting contour, never a raised box.
 const pool=[[578,1098],[594,1068],[637,1055],[692,1058],[739,1063],[787,1080],[812,1106],[790,1137],[739,1150],[686,1157],[638,1148],[604,1129]];
 poly(pool,gradient(1050,1160,'#799484','#496f6b'));
 g.save();g.beginPath();pool.forEach(([x,y],i)=>g[i?'lineTo':'moveTo'](x,y));g.closePath();g.clip();
 glow(656,1095,130,55,'232,215,149',.12);
 for(let i=0;i<65;i++){const x=580+rand()*240,y=1060+rand()*100;line([[x,y],[x+9+rand()*30,y-2]],'rgba(206,222,194,.18)',1);}
 // Submerged floor hints keep this shallow soaking water, not a swimming pool.
 for(let i=0;i<17;i++)ellipse(600+rand()*190,1080+rand()*60,8+rand()*12,4+rand()*6,'rgba(112,141,117,.12)');g.restore();
 // Stones vary in size and orientation; much of the near rim will be screened from view.
 [[576,1093,49,39],[598,1068,58,39],[646,1055,58,36],[705,1059,49,34],[751,1070,55,45],[791,1092,51,48],[810,1122,44,40],[777,1143,62,40],[722,1157,60,34],[669,1157,52,34],[621,1141,55,40],[588,1118,43,33]].forEach((p,i)=>rock(...p,i));
 // A low spout pours into the bath, not a cloud emerging from the roof.
 rock(647,1052,44,44,2);line([[645,1036],[656,1054],[657,1066]],'rgba(213,227,201,.62)',3);ellipse(658,1070,15,3,'rgba(215,227,200,.24)');
 steam(637,1103,.88);steam(705,1106,1.12);steam(757,1111,.72);
 g.save();g.filter='blur(3px)';
 for(const [x,y,h] of [[628,1098,103],[692,1102,125],[748,1110,110]]){const v=g.createLinearGradient(0,y,0,y-h);v.addColorStop(0,'rgba(220,237,216,.08)');v.addColorStop(.5,'rgba(228,238,216,.3)');v.addColorStop(1,'rgba(228,238,218,0)');g.strokeStyle=v;g.lineWidth=16;g.beginPath();g.moveTo(x,y);g.bezierCurveTo(x-15,y-h*.35,x+30,y-h*.6,x+12,y-h);g.stroke();}g.restore();
 // Screen between resting guests and bathing area: the camera sees only a glimpse over it.
 bambooScreen(535,1195,894,1260,111);
 bambooScreen(535,1195,528,1092,116);
 shrubs(566,1237,72,36,['#294a3c','#4b6545','#737f50']);shrubs(858,1290,100,60,['#254a3e','#486447','#6c7851']);
 rock(510,1199,62,43,2);rock(544,1233,64,40,1);
 // A shaded resting corner, not a bench in the middle of a huge square.
 ellipse(217,1290,230,105,'#304a40');maple(77,1262,652,253);
 gardenBench(65,1360,1.08);
 lamp(432,1198,.84);glow(367,1340,185,35,'231,178,102',.08);
 shrubs(23,1515,160,130,['#1a393c','#304e42']);shrubs(865,1525,170,140,['#193b3b','#3c5643']);groundLeaves(1160,130);
 const v=g.createRadialGradient(480,1050,380,450,880,1100);v.addColorStop(0,'rgba(9,24,29,0)');v.addColorStop(1,'rgba(7,20,28,.2)');g.fillStyle=v;g.fillRect(0,0,W,H);grain();
}
const canvas=document.querySelector('#scene');renderGarden(canvas);
// Keep the new silhouette separate from the earlier coloured-person studies.
if(canvas.width!==900||canvas.height!==1600||typeof restingCouple!=='function')throw Error('Incomplete composition');
window.GARDEN_READY=true;
