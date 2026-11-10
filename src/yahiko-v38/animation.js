
// 弥彦 · 把秋天多留一晚。独立导演版，原版保持不变。
// 场景是插画式重构，不表示地理位置、月相或夜间照明的精确再现。
// 事实来源见 stories/yahiko.md。所有动画以 t 为唯一时间源。
const T = 24.6;
const V28_DURATION = 27.8;
const scenePlan=[
 {id:'reveal',start:0,end:4,source:0,span:4},
 {id:'gate',start:4,end:8,source:4,span:4},
 {id:'shrine',start:8,end:12.5,source:4,span:4},
 {id:'ascent',start:12.5,end:18,source:8,span:5},
 {id:'summit',start:18,end:25,source:13,span:7},
];
function duration(){return variant==='V6'?20:V28_DURATION;}
const Q = 1.5;
let NU = false,NOSKY = false,SKYONLY = false,CAR_OFF = 0,MOONDX = 0,MOONDY = 0;   // v14：NOSKY 只画布景（换景用）；MOONDX/DY 月亮在夜景里的位移
const easeIn=x=>x*x*x;   // v12：画「没亮灯」的红叶谷时为 true（见 nightLit）
const ink = '#0b121d';
const reds = ['#491c31','#702132','#9c2932','#ba3933','#d95135','#ed7740','#ffac59'];
function layer(draw,w=W,h=H,q=Q){const c=document.createElement('canvas'); c.width=w*q;c.height=h*q;const b=c.getContext('2d');b.scale(q,q);draw(b);return c;}
function grad(b,x,y,w,h,stops){const q=b.createLinearGradient(0,y,0,y+h);stops.forEach(([p,c])=>q.addColorStop(p,c));b.fillStyle=q;b.fillRect(x,y,w,h);}
function glow(b,x,y,rx,ry,color,a=.3){b.save();b.globalAlpha=a;b.drawImage(radialSprite(color,1.8),x-rx,y-ry,rx*2,ry*2);b.restore();}
function poly(b,pts,fill,stroke,width=1){b.beginPath();pts.forEach(([x,y],i)=>b[i?'lineTo':'moveTo'](x,y));b.closePath();if(fill){b.fillStyle=fill;b.fill();}if(stroke){b.strokeStyle=stroke;b.lineWidth=width;b.stroke();}}
const leafOutline=[[0,-1],[.13,-.5],[.48,-.78],[.33,-.25],[.84,-.43],[.51,.01],[.9,.16],[.44,.3],[.5,.56],[.13,.43],[0,.66],[-.13,.43],[-.5,.56],[-.44,.3],[-.9,.16],[-.51,.01],[-.84,-.43],[-.33,-.25],[-.48,-.78],[-.13,-.5]];
function maple(b,x,y,s,a,c){const co=Math.cos(a),si=Math.sin(a);b.fillStyle=c;b.beginPath();leafOutline.forEach(([px,py],j)=>b[j?'lineTo':'moveTo'](x+s*(px*co-py*si),y+s*(px*si+py*co)));b.closePath();b.fill();}
function nightCrown(b,x,y,rx,ry,seed,lit=1,n=540){
 const lobes=[];
 for(let j=0;j<32;j++){const a=rnd(j,seed+1)*TAU,r=Math.sqrt(rnd(j,seed+2));lobes.push({x:x+Math.cos(a)*rx*r*.88,y:y+Math.sin(a)*ry*r*.86,w:rx*(.12+rnd(j,seed+3)*.19),h:ry*(.10+rnd(j,seed+4)*.15),j});}
 lobes.sort((a,c)=>a.y-c.y);
 for(const l of lobes){  b.strokeStyle='#38232b';b.lineWidth=1.6;b.beginPath();b.moveTo(x,y+ry*.7);b.quadraticCurveTo(x+(l.x-x)*.4,l.y+35,l.x,l.y);b.stroke();}
 for(const l of lobes){
  const v=clamp((.25+(l.y-y)/ry*.22+rnd(l.j,seed+8)*.18)*lit),idx=Math.min(4,Math.max(1,Math.floor(v*6)));
  const tone=b.createLinearGradient(0,l.y-l.h,0,l.y+l.h);tone.addColorStop(0,reds[Math.max(0,idx-1)]);tone.addColorStop(.65,reds[idx]);tone.addColorStop(1,reds[Math.min(6,idx+1)]);b.fillStyle=tone;b.beginPath();for(let k=0;k<32;k++){const a=k/32*TAU,r=.81+rnd(k,seed+l.j*51)*.19;b[k?'lineTo':'moveTo'](l.x+Math.cos(a)*l.w*r,l.y+Math.sin(a)*l.h*r);}b.closePath();b.fill();
  for(let k=0;k<95;k++){const a=rnd(k,seed+l.j*29)*TAU,r=Math.sqrt(rnd(k,seed+l.j*31+7)),xx=l.x+Math.cos(a)*l.w*r,yy=l.y+Math.sin(a)*l.h*r;
   const bright=yy>l.y-l.h*.15&&rnd(k,seed+5)>.30;
   maple(b,xx,yy,3+rnd(k,seed+6)*5.5,a,reds[Math.min(6,idx+(bright?2:0))]);}
 }
}
function crown(b,x,y,rx,ry,seed,lit=1,n=540){
 // Ragged overlapping sprays, with small gaps instead of circular silhouettes.
 const lobes=Array.from({length:13},(_,j)=>{let a=rnd(j,seed+1)*TAU,r=Math.sqrt(rnd(j,seed+2));return [x+Math.cos(a)*rx*r*.78,y+Math.sin(a)*ry*r*.75,rx*(.18+rnd(j,seed+3)*.2),ry*(.2+rnd(j,seed+4)*.2)];});
 b.fillStyle=lit<.5?'#20272b':'#382329';
 lobes.forEach(([xx,yy,ww,hh],j)=>{b.beginPath();for(let k=0;k<36;k++){let a=k/36*TAU,r=.72+rnd(k,seed+j)*.28;b[k?'lineTo':'moveTo'](xx+Math.cos(a)*ww*r,yy+Math.sin(a)*hh*r);}b.closePath();b.fill();});
 for(let j=0;j<n*1.7;j++){const l=lobes[j%13],a=rnd(j+seed,2)*TAU,r=Math.sqrt(rnd(j+seed,3)),xx=l[0]+Math.cos(a)*l[2]*r,yy=l[1]+Math.sin(a)*l[3]*r;
 const v=clamp((.2+rnd(j+seed,6)*.52+(yy-y)/ry*.24)*lit);b.globalAlpha=.60+rnd(j+seed,4)*.4;maple(b,xx,yy,2.5+rnd(j+seed,5)*4.6,a,reds[Math.min(6,Math.floor(v*7))]);}b.globalAlpha=1;
}
function branch(b,x,y,len,angle,width,depth,seed){
  let ex=x+Math.sin(angle)*len,ey=y-Math.cos(angle)*len;
  b.strokeStyle='#251b25';b.lineCap='round';b.lineWidth=width;b.beginPath();b.moveTo(x,y);b.quadraticCurveTo(x+Math.sin(angle+.18)*len*.55,y-Math.cos(angle+.18)*len*.55,ex,ey);b.stroke();
  if(depth>0){branch(b,ex,ey,len*.65,angle-.48,width*.59,depth-1,seed+4);branch(b,ex,ey,len*.7,angle+.4,width*.61,depth-1,seed+9);}
}
function cedarShape(b,x,y,h,w,color){b.fillStyle=color;b.beginPath();b.moveTo(x,y-h);for(let k=1;k<=13;k++){let yy=y-h+k*h/14;let ww=w*k/13;b.lineTo(x+ww,yy);b.lineTo(x+ww*.52,yy+7);}b.lineTo(x+4,y);b.lineTo(x-4,y);for(let k=13;k>=1;k--){let yy=y-h+k*h/14;let ww=w*k/13;b.lineTo(x-ww*.52,yy+7);b.lineTo(x-ww,yy);}b.closePath();b.fill();}
function mountain(b,y,col){b.fillStyle=col;b.beginPath();b.moveTo(-30,H);for(let x=-30;x<=W+30;x+=8){let yy=y-175*Math.exp(-Math.pow((x-690)/360,2))+12*Math.sin(x/110)+5*Math.sin(x/29);b.lineTo(x,yy);}b.lineTo(W+30,H);b.closePath();b.fill();}
function valleySky(b){
  grad(b,0,0,W,H,[[0,'#080f21'],[.38,'#25334b'],[.62,'#172334'],[1,'#070f1c']]);
  for(let i=0;i<90;i++){let x=rnd(i,1)*W,y=80+rnd(i,2)*600;b.fillStyle='rgba(217,222,230,'+(.1+rnd(i,3)*.3)+')';b.fillRect(x,y,1.4,1.4);}
}
function valleyBody(b){
  mountain(b,900,'#1a2938');
  for(let i=0;i<30;i++)cedarShape(b,i*42-30,1125,180+rnd(i,5)*210,22+rnd(i,6)*16,'#17252d');
  // Dark, receding trees; middle remains open so the bridge reads clearly.
  [[-30,875,240,260,61,.62],[200,870,210,190,71,.7],[935,855,210,260,82,.68],[1150,920,280,280,92,.8],[415,970,155,140,106,.7],[640,955,130,135,118,.68]].forEach(a=>nightCrown(b,...a));
  // Distant ground, under the bridge.
  poly(b,[[0,1240],[240,1180],[500,1215],[790,1180],[1080,1230],[1080,1320],[0,1320]],'#172123');
  // Keep the illustrated night composition; give the bridge weight and planted ends.
  const deck=x=>1090-Math.sin(clamp((x-70)/950)*Math.PI)*60;
  // Small wooded shoulders meet each end of the bridge rather than leaving it floating.
  poly(b,[[-30,1070],[70,1064],[150,1092],[230,1170],[305,1288],[-30,1310]],'#252b29');
  poly(b,[[1100,1060],[1018,1066],[948,1101],[878,1190],[825,1292],[1100,1310]],'#242b28');
  for(const side of [-1,1])for(let i=0;i<16;i++){
    const x=side<0?20+rnd(i,3001)*155:920+rnd(i,3001)*155,y=1100+rnd(i,3002)*168;
    b.fillStyle=['#3b3433','#42372f','#303530'][i%3];b.beginPath();b.ellipse(x,y,12+rnd(i,3003)*21,5+rnd(i,3004)*10,-side*.18,0,TAU);b.fill();
  }
  // Timber supports, with brackets beneath the curved girder.
  [330,670,840].forEach(x=>{
    const y=deck(x)+27;
    poly(b,[[x-7,y],[x+7,y],[x+13,1288],[x-3,1288]],'#562b2d');
    b.fillStyle='#754038';b.fillRect(x-5,y,3,1288-y);
    b.strokeStyle='#64322f';b.lineWidth=6;b.beginPath();b.moveTo(x+1,y+55);b.lineTo(x-31,y+1);b.moveTo(x+1,y+55);b.lineTo(x+33,y+1);b.stroke();
  });
  const band=(top,bottom,color)=>poly(b,Array.from({length:49},(_,i)=>{const x=70+i*950/48;return[x,deck(x)+top];}).concat(Array.from({length:49},(_,i)=>{const x=1020-i*950/48;return[x,deck(x)+bottom];})),color);
  band(-3,27,'#a64a39');band(18,30,'#562b2c');band(-3,1,'#df8962');
  // Three horizontal rails and substantial uprights keep the familiar red silhouette.
  for(let k=0;k<3;k++){
    b.strokeStyle=NU?(k?'#24222e':'#2c2a36'):(k?'#ad4f3b':'#d77953');b.lineWidth=k?5:8;b.beginPath();
    for(let x=70;x<=1020;x+=5)b[x===70?'moveTo':'lineTo'](x,deck(x)-51+k*18);b.stroke();
  }
  for(let x=70;x<=1020;x+=48){b.fillStyle=NU?'#26242f':'#b3513e';b.fillRect(x-3.2,deck(x)-51,6.4,51);b.fillStyle='#df8760';b.fillRect(x-3.2,deck(x)-49,1.4,47);}
  [70,307,545,783,1020].forEach(x=>{
    const y=deck(x);b.fillStyle='#8c4033';b.fillRect(x-7,y-66,14,67);b.fillStyle='#ce7450';b.fillRect(x-6,y-64,3,63);
    b.fillStyle='#333034';b.beginPath();b.moveTo(x-8,y-66);b.quadraticCurveTo(x-12,y-73,x,y-80);b.quadraticCurveTo(x+12,y-73,x+8,y-66);b.closePath();b.fill();
    b.strokeStyle='#b88d58';b.lineWidth=1.5;b.beginPath();b.moveTo(x-7,y-70);b.quadraticCurveTo(x-7,y-74,x-1,y-77);b.stroke();
  });
  // Visitors are painted each frame by bridgeVisitors(), behind the near rail.
  // Near trees around, never an equally bright ring.
  branch(b,86,1290,245,.3,20,3,50);branch(b,1030,1310,310,-.3,25,3,60);
  [[-35,1060,205,230,201,1.08,1400],[160,928,180,180,211,1.05,1150],[20,760,200,170,221,.91,1100],[985,925,220,210,231,1.12,1350],[1120,735,210,240,241,.94,1200],[940,1180,180,95,251,1.04,800],[140,1225,190,90,261,1.16,850]].forEach(a=>nightCrown(b,...a));
  [105,235,925,1030].forEach((x,i)=>{glow(b,x,1250,120,155,[255,121,47],.13);b.fillStyle='#f1b86b';b.fillRect(x,1270,4,4);});
  // Rough shore and its silhouette.
  for(let i=0;i<55;i++){b.fillStyle=['#353039','#292c32','#403235'][i%3];b.beginPath();b.ellipse(i*21,1290+rnd(i,10)*12,14+rnd(i,12)*20,8+rnd(i,11)*14,0,0,TAU);b.fill();}
}
const valley=layer(b=>{valleySky(b);valleyBody(b);});
const valleySet=layer(valleyBody),nightSkyL=layer(valleySky);   // v14：夜景拆成天幕和下面的布景（换景时天幕不动）
// Close woodland approach: layered cedar trunks, carved eaves, stone and moss.
// An illustrative composition, not a reconstruction of a particular camera position.
function cedarTrunk(b,x,base,h,w,seed,colors){
 const top=base-h,lean=(rnd(seed,2)-.5)*30;
 b.save();b.beginPath();b.moveTo(x-w*.68,base);b.bezierCurveTo(x-w*.38,base-h*.25,x+lean-w*.23,top+h*.25,x+lean-w*.12,top);b.lineTo(x+lean+w*.12,top);b.bezierCurveTo(x+lean+w*.25,top+h*.25,x+w*.34,base-h*.2,x+w*.64,base);b.closePath();
 const g=b.createLinearGradient(x-w*.6,0,x+w*.6,0);colors.forEach((c,i)=>g.addColorStop(i/(colors.length-1),c));b.fillStyle=g;b.fill();b.clip();
 for(let j=0;j<19;j++){let xx=x-w*.62+rnd(j,seed)*w*1.25;b.strokeStyle=j%3?'rgba(6,17,19,.3)':'rgba(184,174,129,.18)';b.lineWidth=.7+rnd(j,seed+1)*2.5;b.beginPath();b.moveTo(xx,base);for(let k=1;k<9;k++)b.lineTo(xx+Math.sin(k*.8+j)*3+lean*k/8,base-h*k/8);b.stroke();}
 b.restore();
 for(let i=0;i<3;i++){b.strokeStyle=colors[0];b.lineWidth=w*.10;b.beginPath();b.moveTo(x+(i-1)*w*.2,base-18);b.quadraticCurveTo(x+(i-1)*w*.9,base+8,x+(i-1)*w*1.1,base+25);b.stroke();}
}
function cedarBough(b,x,y,w,seed,color){
 b.strokeStyle=color;b.lineWidth=3;b.beginPath();b.moveTo(x-w*.65,y-14);b.quadraticCurveTo(x,y+16,x+w*.7,y-18);b.stroke();b.fillStyle=color;
 for(let i=0;i<70;i++){let u=rnd(i,seed),xx=x+(u-.5)*w,yy=y+Math.sin(u*Math.PI)*23+(rnd(i,seed+1)-.5)*32;b.beginPath();b.ellipse(xx,yy,8+rnd(i,seed+2)*19,2+rnd(i,seed+3)*5,(u-.5)*.6,0,TAU);b.fill();}
}
function stoneLantern(b,x,y,s){
 b.save();b.translate(x,y);b.scale(s,s);
 glow(b,0,14,112,38,[239,177,85],.19);
 poly(b,[[-33,12],[32,12],[25,0],[-25,0]],'#687067');poly(b,[[-22,0],[22,0],[15,-15],[-15,-15]],'#859085');
 poly(b,[[-9,-15],[10,-15],[8,-88],[-7,-88]],'#697668');b.fillStyle='#899381';b.fillRect(-7,-86,3,70);
 poly(b,[[-24,-88],[25,-88],[16,-101],[-17,-101]],'#939986');b.fillStyle='#566458';b.fillRect(-20,-137,40,36);
 grad(b,-13,-131,26,25,[[0,'#d8a05b'],[1,'#ffe1a0']]);b.fillStyle='#666b56';b.fillRect(-2,-133,4,30);
 b.beginPath();b.moveTo(-36,-138);b.quadraticCurveTo(-17,-148,-7,-163);b.lineTo(8,-163);b.quadraticCurveTo(20,-148,37,-138);b.lineTo(29,-133);b.lineTo(-29,-133);b.closePath();b.fillStyle='#879181';b.fill();
 b.strokeStyle='#bac0a1';b.lineWidth=2;b.beginPath();b.moveTo(-32,-139);b.quadraticCurveTo(-9,-146,0,-158);b.stroke();
 b.fillStyle='#8c927b';b.beginPath();b.arc(0,-168,5,0,TAU);b.fill();glow(b,0,-118,73,92,[255,188,99],.23);b.restore();
}
function shrineHall(b){
 b.save();b.translate(629,1095);b.transform(1,-.025,.045,1,0,0);
 // The visible right wall and shaded veranda establish depth.
 poly(b,[[216,-48],[323,-92],[323,105],[216,153]],'#323d35');
 poly(b,[[220,18],[313,-17],[313,99],[220,138]],'#61553e');
 for(let j=0;j<7;j++){let xx=226+j*13;b.strokeStyle=j%2?'#887354':'#3c4032';b.lineWidth=4;b.beginPath();b.moveTo(xx,15-(xx-226)*.36);b.lineTo(xx,135-(xx-226)*.4);b.stroke();}
 // Stone foundation, veranda planks, five shallow steps.
 poly(b,[[-264,149],[220,149],[330,107],[330,127],[220,173],[-264,173]],'#646e65');
 poly(b,[[-270,140],[220,140],[333,99],[337,111],[220,155],[-270,155]],'#96927b');
 poly(b,[[-260,114],[220,114],[326,76],[326,101],[220,141],[-260,141]],'#3c3d2f');
 for(let y=119;y<143;y+=7){b.strokeStyle='#8b7758';b.lineWidth=1.5;b.beginPath();b.moveTo(-262,y);b.lineTo(218,y);b.lineTo(328,y-41);b.stroke();}
 for(let i=0;i<5;i++){let yy=150+i*13,l=-98-i*11,r=124+i*11;poly(b,[[l,yy],[r,yy],[r+7,yy+8],[l-7,yy+8]],i%2?'#a19c82':'#92937d');poly(b,[[l-7,yy+8],[r+7,yy+8],[r+7,yy+13],[l-7,yy+13]],'#545f54');b.strokeStyle='#c6b594';b.lineWidth=1;b.beginPath();b.moveTo(l,yy);b.lineTo(r,yy);b.stroke();}
 // Timber face: mostly shadow, small pools of warm light, no luminous rectangle.
 grad(b,-244,-42,464,155,[[0,'#2e362e'],[.5,'#705a3d'],[1,'#443e2d']]);
 for(const [xx,ww] of [[-219,80],[-121,82],[51,65],[136,58]]){
  grad(b,xx,-21,ww,106,[[0,'#60543a'],[1,'#aa8551']]);b.fillStyle='rgba(223,180,107,.14)';b.fillRect(xx+5,4,ww-10,70);
  for(let k=0;k<=ww;k+=9){b.fillStyle='#3e4030';b.fillRect(xx+k,-21,2.5,107);}for(let y=-10;y<88;y+=17){b.fillStyle='#4a4732';b.fillRect(xx,y,ww,2);}
 }
 // Recessed doorway and offering chest sit behind the columns.
 grad(b,-29,-34,67,140,[[0,'#172a28'],[1,'#403d2a']]);b.fillStyle='#bd9d66';b.fillRect(-33,-33,5,140);b.fillRect(37,-33,4,140);
 b.fillStyle='#796246';b.fillRect(-49,91,107,35);poly(b,[[-54,85],[60,85],[55,94],[-49,94]],'#b59664');
 for(let x=-43;x<55;x+=9){b.strokeStyle='#332e25';b.lineWidth=2;b.beginPath();b.moveTo(x,86);b.lineTo(x-3,92);b.stroke();}
 // Round columns, carved beam ends and brackets.
 for(const x of [-243,-135,-38,45,124,213]){const g=b.createLinearGradient(x-8,0,x+8,0);g.addColorStop(0,'#635039');g.addColorStop(.38,'#c0a578');g.addColorStop(.7,'#a88b5d');g.addColorStop(1,'#5f5036');b.fillStyle=g;b.fillRect(x-8,-62,16,184);b.fillStyle='#d1b889';b.fillRect(x-11,111,22,7);
  poly(b,[[x-22,-63],[x+22,-63],[x+17,-50],[x+10,-46],[x-10,-46],[x-17,-50]],'#ab9061');b.fillStyle='#493f2e';b.fillRect(x-14,-62,28,4);}
 b.fillStyle='#b49b70';b.fillRect(-260,-48,484,9);b.fillStyle='#453f2f';b.fillRect(-260,-39,484,7);
 // Deep underside, visible rafters; light catches only their front edges.
 poly(b,[[-308,-87],[246,-87],[359,-127],[348,-101],[241,-60],[-300,-60]],'#172a29');
 for(let i=0;i<45;i++){let x=-302+i*12.4;b.strokeStyle=i%3?'#776c4d':'#a28b5a';b.lineWidth=3;b.beginPath();b.moveTo(x,-85);b.lineTo(x+5,-63);b.stroke();}
 // Broad, gently concave copper roof and its receding hip.
 b.beginPath();b.moveTo(-316,-93);b.bezierCurveTo(-241,-117,-208,-157,-151,-260);b.lineTo(146,-260);b.bezierCurveTo(171,-181,216,-116,249,-94);b.quadraticCurveTo(-25,-76,-316,-93);b.closePath();
 const roof=b.createLinearGradient(0,-260,0,-80);roof.addColorStop(0,'#708277');roof.addColorStop(.28,'#536d64');roof.addColorStop(.8,'#334e49');roof.addColorStop(1,'#213b37');b.fillStyle=roof;b.fill();
 poly(b,[[146,-260],[243,-292],[284,-218],[366,-132],[249,-94]],'#2b4944');
 // Horizontal seams follow the slope and curve rather than a flat triangle.
 b.save();b.beginPath();b.moveTo(-316,-93);b.bezierCurveTo(-241,-117,-208,-157,-151,-260);b.lineTo(146,-260);b.bezierCurveTo(171,-181,216,-116,249,-94);b.quadraticCurveTo(-25,-76,-316,-93);b.closePath();b.clip();
 for(let i=0;i<23;i++){let u=i/22,yy=-253+u*166;b.strokeStyle=i%2?'rgba(169,183,150,.22)':'rgba(13,37,34,.35)';b.lineWidth=1.2;b.beginPath();b.moveTo(-340,yy-7);b.quadraticCurveTo(-18,yy+13,280,yy-5);b.stroke();}
 for(let i=0;i<24;i++){let x=-150+i*13;b.strokeStyle='rgba(187,196,156,.12)';b.lineWidth=1;b.beginPath();b.moveTo(x,-258);b.lineTo(x*1.75-30,-91);b.stroke();}b.restore();
 b.strokeStyle='#a0aa87';b.lineWidth=3;b.beginPath();b.moveTo(-316,-94);b.quadraticCurveTo(-26,-76,249,-94);b.lineTo(366,-132);b.stroke();
 poly(b,[[-166,-264],[151,-264],[251,-297],[250,-284],[151,-252],[-166,-252]],'#627369');b.strokeStyle='#acb598';b.lineWidth=2;b.beginPath();b.moveTo(-166,-264);b.lineTo(151,-264);b.lineTo(251,-297);b.stroke();
 // Entrance gable: shadowed face, curved bargeboard, layered roof edge.
 b.beginPath();b.moveTo(-133,-48);b.bezierCurveTo(-88,-56,-74,-125,-12,-131);b.bezierCurveTo(48,-130,65,-62,111,-50);b.lineTo(103,-34);b.lineTo(-125,-34);b.closePath();b.fillStyle='#303e32';b.fill();
 for(let i=-5;i<=5;i++){let x=-12+i*17;b.strokeStyle='#89764d';b.lineWidth=3;b.beginPath();b.moveTo(x,-44);b.lineTo(-12+(x+12)*.45,-109+Math.abs(i)*4);b.stroke();}
 b.beginPath();b.moveTo(-143,-51);b.bezierCurveTo(-89,-58,-79,-139,-12,-143);b.bezierCurveTo(53,-140,70,-60,120,-53);b.strokeStyle='#192f2e';b.lineWidth=18;b.stroke();b.strokeStyle='#b8ab7f';b.lineWidth=7;b.stroke();b.strokeStyle='#e3cc98';b.lineWidth=1.5;b.stroke();
 b.fillStyle='#ab8e55';b.beginPath();b.arc(-12,-89,8,0,TAU);b.fill();b.fillStyle='#354234';b.beginPath();b.arc(-12,-89,4.5,0,TAU);b.fill();
 // Shimenawa and paper streamers remain a small architectural detail.
 b.strokeStyle='#aa9567';b.lineWidth=4;b.beginPath();b.moveTo(-115,-24);b.quadraticCurveTo(-9,-8,101,-24);b.stroke();
 for(const x of [-80,-34,15,65]){poly(b,[[x,-16],[x+8,-12],[x+2,-3],[x+8,1],[x+1,12],[x-7,5],[x-1,-3],[x-7,-7]],'#c8c2a2');}
 // Warm reflections, cast by two low eave lights.
 for(const x of [-179,165]){glow(b,x,64,82,90,[251,184,94],.16);b.fillStyle='#e0b16c';b.fillRect(x-4,-31,8,9);glow(b,x,-26,35,40,[255,202,125],.28);}
 b.restore();
}
function drawApproachForest(b,includeHall){
 grad(b,0,0,W,H,[[0,'#0b1b25'],[.37,'#29413f'],[.63,'#566253'],[1,'#172b28']]);
 glow(b,710,851,430,520,[156,174,140],.16);
 // Distant trunks vary in spacing, lean and thickness; foliage is above eye level.
 for(let i=0;i<26;i++){let x=rnd(i,300)*1210-60,base=1165+rnd(i,301)*170;cedarTrunk(b,x,base,1050+rnd(i,302)*400,15+rnd(i,303)*21,310+i,['#293d36','#3c4f40','#2d4137']);}
 for(let i=0;i<36;i++){let x=rnd(i,340)*1300-110,y=130+rnd(i,341)*710;cedarBough(b,x,y,110+rnd(i,342)*240,350+i,i%3?'#1b3833':'#30473b');}
 grad(b,0,480,W,850,[[0,'rgba(116,142,127,0)'],[.65,'rgba(116,142,127,.13)'],[1,'rgba(116,142,127,0)']]);
 for(const [x,y,w,s] of [[267,1310,42,361],[915,1315,48,364],[1061,1380,62,365],[395,1195,22,366]])cedarTrunk(b,x,y,1390,w,s,['#202e29','#615f48','#283e32']);
 // Uneven woodland floor, stone approach bending gently toward the hall.
 grad(b,0,1270,W,650,[[0,'rgba(30,51,39,0)'],[.19,'#2b3b2d'],[1,'#152b26']]);
 for(let i=0;i<1250;i++){let x=rnd(i,380)*W,y=1280+rnd(i,381)*640;b.fillStyle=['#556248','#344d38','#7a7144','#263b2c'][i%4];b.globalAlpha=.15+rnd(i,382)*.4;b.beginPath();b.ellipse(x,y,3+rnd(i,383)*19,2+rnd(i,384)*5,0,0,TAU);b.fill();}b.globalAlpha=1;
 const center=u=>628-(includeHall?350:88)*u*u,width=u=>116+550*u;
 b.beginPath();for(let i=0;i<=35;i++){let u=i/35;b[i?'lineTo':'moveTo'](center(u)-width(u)/2,1255+u*665);}for(let i=35;i>=0;i--){let u=i/35;b.lineTo(center(u)+width(u)/2,1255+u*665);}b.closePath();
 b.fillStyle='#626c5c';b.fill();b.save();b.clip();
 grad(b,0,1255,W,665,[[0,'rgba(191,180,142,.18)'],[.35,'rgba(160,165,136,.1)'],[1,'rgba(13,36,33,.3)']]);
 for(let j=0;j<16;j++){let u0=(Math.exp(j/6)-1)/(Math.exp(16/6)-1),u1=(Math.exp((j+1)/6)-1)/(Math.exp(16/6)-1),y0=1255+u0*665,y1=1255+u1*665;
  for(let k=0;k<4;k++){let f0=k/4-.5,f1=(k+1)/4-.5,pts=[[center(u0)+width(u0)*f0+1,y0+1],[center(u0)+width(u0)*f1-1,y0+1],[center(u1)+width(u1)*f1-1,y1-2],[center(u1)+width(u1)*f0+1,y1-2]];poly(b,pts,['#757b66','#6b7462','#83846b','#626e5d'][(j*3+k)%4],'#45594b',1.1);b.strokeStyle='rgba(213,205,165,.19)';b.lineWidth=1;b.beginPath();b.moveTo(...pts[0]);b.lineTo(...pts[1]);b.stroke();}
 }
 for(let i=0;i<1800;i++){let y=1255+rnd(i,390)*665,x=rnd(i,391)*W;b.fillStyle=i%3?'rgba(202,198,164,.13)':'rgba(24,46,37,.18)';b.fillRect(x,y,1+rnd(i,392)*3,1);}
 // Soft branch shadows and warm light fall across the stone, rather than floating.
 for(let i=0;i<7;i++){b.strokeStyle='rgba(13,37,32,.20)';b.lineWidth=11+i*3;b.beginPath();b.moveTo(0,1350+i*85);b.bezierCurveTo(250,1440+i*70,550,1400+i*70,900,1490+i*60);b.stroke();}
 glow(b,493,1454,185,100,[244,192,109],.15);glow(b,705,1290,135,70,[251,193,109],.14);b.restore();
 // Irregular moss lips and leaf piles break the geometric path boundary.
 for(let i=0;i<420;i++){let u=rnd(i,395),side=i%2?-1:1,x=center(u)+side*(width(u)/2+7+rnd(i,396)*34),y=1255+u*665;b.fillStyle=['#52603a','#667048','#3b5538'][i%3];b.beginPath();b.ellipse(x,y,2+u*11,2+u*5,rnd(i,397),0,TAU);b.fill();if(i%2)maple(b,x+side*6,y+5,2+u*6,rnd(i,398)*TAU,reds[2+i%4]);}
 if(includeHall)shrineHall(b);
 stoneLantern(b,427,1457,.94);stoneLantern(b,854,1355,.68);
 // A restrained maple branch breaks the roof line without obscuring it.
 branch(b,1100,1210,205,-.24,13,2,408);
 [[1060,770,155,170,411,.62,530],[987,1000,114,88,414,.7,470],[1010,1120,86,90,415,.7,320]].forEach(a=>crown(b,...a));
}
const forest=layer(b=>drawApproachForest(b,true));
const gateForest=layer(b=>drawApproachForest(b,false));
const shrineForeground=layer(b=>{
 // Complete gate silhouette, with both lintel ends and both feet inside frame.
 b.save();
 for(const x of [243,837]){const gr=b.createLinearGradient(x-20,0,x+20,0);gr.addColorStop(0,'#57392e');gr.addColorStop(.35,'#a66847');gr.addColorStop(.7,'#925335');gr.addColorStop(1,'#49372c');poly(b,[[x-17,739],[x+17,739],[x+24,1456],[x-24,1456]],gr);b.fillStyle='#24382e';b.fillRect(x-25,1420,50,45);}
 b.beginPath();b.moveTo(151,704);b.quadraticCurveTo(540,749,929,704);b.lineTo(917,737);b.quadraticCurveTo(540,776,163,737);b.closePath();b.fillStyle='#294039';b.fill();
 b.beginPath();b.moveTo(164,733);b.quadraticCurveTo(540,769,916,733);b.lineTo(907,750);b.quadraticCurveTo(540,788,173,750);b.closePath();b.fillStyle='#a16946';b.fill();
 b.fillStyle='#875639';b.fillRect(198,829,684,26);b.fillStyle='#bd8960';b.fillRect(198,829,684,4);b.fillStyle='#785034';b.fillRect(529,763,22,66);
 b.restore();
 // Large, irregular cedar trunks and roots anchor the near plane.
 cedarTrunk(b,28,1820,1960,116,445,['#142923','#4a4c36','#20382b']);
 cedarTrunk(b,1039,1840,1980,144,449,['#142923','#5a5740','#263b2b']);
 for(let j=0;j<17;j++){let x=j%2?1034:23,y=1380+rnd(j,451)*360;b.fillStyle='#52613c';b.globalAlpha=.4;b.beginPath();b.ellipse(x+(rnd(j,453)-.5)*25,y,8+rnd(j,454)*12,18+rnd(j,455)*25,-.2,0,TAU);b.fill();}b.globalAlpha=1;
 cedarBough(b,115,540,430,465,'#122e2b');cedarBough(b,1003,565,340,466,'#17362d');
 branch(b,-45,1180,220,.5,12,2,470);
 [[-30,970,145,190,471,.67,600],[83,883,105,95,477,.73,450],[-5,1340,160,120,481,.72,630],[1120,1520,146,150,491,.72,580]].forEach(a=>crown(b,...a));
});

// V6: photo-informed east-facing wooded ravine and west-facing Skyline road.
function ridgePath(b,p){b.beginPath();p.forEach(([x,y],i)=>b[i?'lineTo':'moveTo'](x,y));b.lineTo(W+80,H+80);b.lineTo(-80,H+80);b.closePath();}
function ridge(b,p,c){ridgePath(b,p);b.fillStyle=c;b.fill();}
function highClouds(b,seed){for(let i=0;i<22;i++){b.fillStyle='rgba(241,233,213,.06)';b.beginPath();b.ellipse(rnd(i,seed)*W,540+rnd(i,seed+1)*230,100+rnd(i,seed+2)*230,2+rnd(i,seed+3)*6,-.03,0,TAU);b.fill();}}
// Small compound crowns: shadow underneath, uneven sunlit sprays above.
const forestSprites=['#8b823e','#b58a40','#a95e36','#765c35','#3c6245','#ce9d4c'].map((c,j)=>layer(b=>{for(let k=0;k<26;k++){const a=rnd(k,j+810)*TAU,r=Math.sqrt(rnd(k,j+820)),x=35+Math.cos(a)*25*r,y=37+Math.sin(a)*24*r;b.fillStyle=k<8?'#243d32':c;b.globalAlpha=k<8?.9:.72;poly(b,Array.from({length:9},(_,i)=>{const a=i/9*TAU,rr=6+rnd(i+k,j+830)*9;return[x+Math.cos(a)*rr,y+Math.sin(a)*rr*.75];}),b.fillStyle);}b.globalAlpha=1;},72,72,1));
function woodedSlope(b,p,seed,base,n=5200){ridge(b,p,base);b.save();ridgePath(b,p);b.clip();const points=Array.from({length:n},(_,i)=>({i,x:rnd(i,seed)*W,y:650+rnd(i,seed+1)*1320})).sort((a,c)=>a.y-c.y);for(const {i,x,y}of points){const s=7+(y-650)*.026+rnd(i,seed+2)*9;const patch=Math.sin(x*.009+y*.004)+Math.cos(y*.012-x*.006);let color=patch<-.65?4:Math.floor(rnd(i,seed+3)*6);b.drawImage(forestSprites[color],x-s,y-s,s*2,s*2);}b.restore();}
const ascentLandscapeV6=layer(b=>{
 grad(b,0,0,W,H,[[0,'#244958'],[.35,'#8da7a5'],[.49,'#d0c8aa'],[1,'#203a31']]);highClouds(b,611);
 ridge(b,[[-40,795],[100,754],[170,778],[280,734],[390,773],[510,749],[615,780],[770,741],[890,766],[1100,731]],'#8b9d97');
 grad(b,0,793,W,450,[[0,'#b7bea8'],[1,'#7f926e']]);
 for(let row=0;row<20;row++){let u=row/20,y=796+u*u*420,yn=796+Math.pow((row+1)/20,2)*420;for(let col=0;col<32;col++){let x=col*43-100+(row%3)*13,w=23+rnd(col,row+620)*31;poly(b,[[x,y],[x+w,y],[x+w+u*14,yn-1],[x+u*14,yn-1]],['#b6b397','#a1ab8a','#b4b79d','#8f9e83'][Math.floor(rnd(col,row+630)*4)]);}}
 for(let i=0;i<520;i++){let x=400+rnd(i,640)*700,y=835+rnd(i,641)*340,s=1+(y-830)*.014;b.fillStyle=i%3?'#6c8075':'#b9bdab';b.fillRect(x,y,s*1.7,s);}
 b.strokeStyle='#c6c7ad';b.lineWidth=3;b.beginPath();b.moveTo(770,805);b.bezierCurveTo(840,915,580,945,650,1240);b.stroke();
 grad(b,0,775,W,435,[[0,'rgba(218,219,199,.58)'],[.65,'rgba(205,215,193,.13)'],[1,'rgba(160,187,162,0)']]);
 woodedSlope(b,[[-40,1030],[110,1035],[270,1090],[390,1120],[520,1195],[630,1140],[750,1090],[910,1060],[1120,990]],647,'#6c8059',2200);
 // Steep wooded walls, a descending valley opening onto the distant plain.
 woodedSlope(b,[[-40,688],[75,735],[153,786],[245,805],[325,883],[390,980],[468,1090],[555,1220],[750,1500],[1100,1810]],650,'#4e6542',4600);
 woodedSlope(b,[[410,1990],[570,1580],[660,1390],[745,1240],[810,1110],[907,1044],[980,965],[1120,923]],670,'#244b3b',3300);
 b.save();b.globalAlpha=.23;ridge(b,[[450,1950],[660,1440],[790,1220],[900,1160],[1110,1040]],'#122d2b');b.restore();
 for(let i=0;i<75;i++){let x=720+rnd(i,690)*400,y=1260+rnd(i,691)*600;cedarShape(b,x,y,25+rnd(i,692)*78,7+rnd(i,693)*13,'#264b3a');}
});
// Common new ropeway view: eastern plain beyond a steep wooded ravine.
// Structure and cabin colours reference the operator's autumn photograph.
function contourY(points,x){for(let i=1;i<points.length;i++)if(x<=points[i][0]){const a=points[i-1],c=points[i],u=clamp((x-a[0])/(c[0]-a[0]));return a[1]+(c[1]-a[1])*u;}return points.at(-1)[1];}
function smoothRidge(b,p){b.beginPath();b.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length-1;i++){const n=p[i+1];b.quadraticCurveTo(p[i][0],p[i][1],(p[i][0]+n[0])/2,(p[i][1]+n[1])/2);}b.lineTo(...p.at(-1));b.lineTo(W+150,H+200);b.lineTo(-150,H+200);b.closePath();}
function naturalRidge(b,points,seed,colors,density=14000){
 b.save();smoothRidge(b,points);b.fillStyle=colors[0];b.fill();b.clip();
 // Fine foliage follows rounded ridges and falls into deeper, cooler valleys.
 for(let i=0;i<density;i++){
  const x=rnd(i,seed)*1220-70,y=730+rnd(i,seed+1)*1250;
  const top=contourY(points,x);if(y<top-50)continue;
  const distance=clamp((y-730)/1200),size=1.5+distance*5+rnd(i,seed+2)*4;
  const band=Math.sin(x*.012+y*.006)+Math.cos(x*.005-y*.009);
  const light=clamp(.44+.19*band+(rnd(i,seed+3)-.5)*.65-(y-top)/1900);
  b.fillStyle=colors[Math.min(colors.length-1,Math.floor(light*colors.length))];
  b.globalAlpha=.35+rnd(i,seed+4)*.30;
  b.beginPath();b.ellipse(x,y,size,size*(.48+rnd(i,seed+5)*.32),rnd(i,seed+6)*2,0,TAU);b.fill();
 }
 b.globalAlpha=1;
 const shade=b.createLinearGradient(0,800,900,1900);shade.addColorStop(0,'rgba(223,200,135,.05)');shade.addColorStop(.58,'rgba(14,39,36,.02)');shade.addColorStop(1,'rgba(10,37,34,.30)');b.fillStyle=shade;b.fillRect(-100,700,1300,1300);b.restore();
}
function softCloud(b,x,y,w,h,seed,alpha=.2){
 b.save();for(let i=0;i<18;i++){let xx=x+(rnd(i,seed)-.5)*w,yy=y+(rnd(i,seed+1)-.5)*h;
 let q=b.createRadialGradient(xx,yy,0,xx,yy,w*.25);q.addColorStop(0,`rgba(255,239,211,${alpha})`);q.addColorStop(1,'rgba(255,239,211,0)');b.save();b.translate(xx,yy);b.scale(1,h/w*.8);b.translate(-xx,-yy);b.fillStyle=q;b.fillRect(xx-w*.3,yy-w*.3,w*.6,w*.6);b.restore();}b.restore();
}
const ascentLandscape=layer(b=>{
 grad(b,0,0,W,H,[[0,'#244f65'],[.31,'#7ea6b1'],[.46,'#c5cfbb'],[1,'#264b3c']]);
 softCloud(b,780,680,840,95,101,.17);softCloud(b,400,530,760,70,104,.10);
 ridge(b,[[-60,879],[200,851],[340,866],[485,840],[630,857],[790,834],[960,851],[1160,835]],'#8da49e');
 grad(b,0,870,W,430,[[0,'#b8bea1'],[1,'#8e9e79']]);
 for(let r=0;r<24;r++){let u=r/24,y=872+u*u*350,yn=872+Math.pow((r+1)/24,2)*350;for(let j=0;j<42;j++){let x=j*30-40+(r%3)*7;b.fillStyle=['#c4c1a1','#adba93','#9cac87','#b9b996'][Math.floor(rnd(j,r+150)*4)];b.fillRect(x,y,24+rnd(j,r+155)*8,yn-y-1);}}
 b.strokeStyle='#ccd0b9';b.lineWidth=2;b.beginPath();b.moveTo(880,874);b.bezierCurveTo(790,960,1020,1050,730,1270);b.stroke();
 for(let i=0;i<680;i++){let x=390+rnd(i,170)*780,y=900+rnd(i,171)*230,z=.7+(y-900)*.007;b.fillStyle=i%4?'#8d9c8e':'#cbd0bd';b.fillRect(x,y,z*2,z);}
 grad(b,0,860,W,410,[[0,'rgba(215,225,215,.48)'],[1,'rgba(195,209,188,0)']]);
 naturalRidge(b,[[-60,1060],[130,1045],[300,1090],[470,1130],[580,1195],[730,1125],[890,1070],[1130,1040]],181,['#41664c','#537751','#6d8858','#88925a','#a49d62'],9000);
 naturalRidge(b,[[-60,715],[70,753],[180,805],[260,878],[320,975],[410,1085],[470,1210],[560,1350],[720,1510],[900,1670],[1140,1810]],201,['#234c3b','#3c603b','#61733d','#86823d','#a59045','#be9a4e','#b98240','#c99c55'],19000);
 naturalRidge(b,[[290,1990],[400,1810],[550,1610],[685,1450],[770,1300],[850,1190],[940,1110],[1140,1040]],221,['#1e4335','#28513b','#386346','#4c724b','#6a8051','#89884b'],17000);
 // A narrow, darker ravine recedes towards the plain, with no geometric hole.
 b.save();b.globalAlpha=.1;smoothRidge(b,[[400,1950],[550,1650],[700,1450],[790,1290],[880,1195],[1140,1100]]);b.fillStyle='#102f2b';b.fill();b.restore();
});

function cableHeight(x){return 1330-.55*x;}
function cabin(b,x,y,s){b.save();b.translate(x,y);b.scale(s,s);
 b.strokeStyle='#263d40';b.lineWidth=6;b.beginPath();b.moveTo(-43,23);b.lineTo(44,-24);b.stroke();for(const xx of [-30,30]){b.fillStyle='#263638';b.beginPath();b.arc(xx,-xx*.55,7,0,TAU);b.fill();}
 b.strokeStyle='#d1d6c5';b.lineWidth=10;b.beginPath();b.moveTo(-9,5);b.quadraticCurveTo(-15,78,23,99);b.lineTo(23,125);b.stroke();b.strokeStyle='#6e9189';b.lineWidth=3;b.stroke();
 poly(b,[[-127,136],[44,115],[116,151],[112,281],[-46,301],[-125,262]],'#deded0','#254846',2);
 poly(b,[[-127,136],[44,115],[116,151],[41,144],[-126,165]],'#41977e');
 poly(b,[[-119,168],[36,149],[36,218],[-119,238]],'#315b63');poly(b,[[44,149],[106,161],[103,224],[44,218]],'#264954');
 for(let i=0;i<5;i++){let xx=-109+i*29;b.strokeStyle='#dbdfce';b.lineWidth=4;b.beginPath();b.moveTo(xx,167-(xx+109)*.12);b.lineTo(xx,236-(xx+109)*.12);b.stroke();poly(b,[[xx+3,172-(xx+109)*.12],[xx+20,169-(xx+109)*.12],[xx+8,204-(xx+109)*.12],[xx+3,205-(xx+109)*.12]],'rgba(202,226,215,.19)');}
 b.strokeStyle='#d4dfd0';b.lineWidth=4;b.beginPath();b.moveTo(74,155);b.lineTo(74,221);b.stroke();
 poly(b,[[-125,244],[40,224],[113,231],[113,248],[40,240],[-125,260]],'#d9a23e');poly(b,[[-124,267],[40,246],[112,254],[112,280],[40,271],[-46,300],[-124,281]],'#458a71');
 for(let i=0;i<4;i++){let xx=-88+i*31,yy=209-(xx+88)*.12;b.fillStyle='#223f45';b.beginPath();b.arc(xx,yy,5,0,TAU);b.fill();b.fillRect(xx-5,yy+4,10,12);}b.restore();}
function ascentShotV6(b,t){const u=clamp((t-8)/5);b.save();const {z,x,y}=cameraState(t,'ascent');camera(b,z,x,y);b.drawImage(ascentLandscapeV6,0,0,W,H);for(const dy of[-4,5]){b.strokeStyle=dy<0?'#304b4b':'#a4b2a0';b.lineWidth=dy<0?2.8:1.3;b.beginPath();b.moveTo(-100,cableHeight(-100)+dy);b.lineTo(1180,cableHeight(1180)+dy);b.stroke();}const xx=335+u*325;cabin(b,xx,cableHeight(xx),1.04-u*.12);b.restore();}
const seaLandscape=layer(b=>{grad(b,0,0,W,820,[[0,'#204b62'],[.55,'#8babaf'],[1,'#e5d6b4']]);highClouds(b,701);glow(b,260,735,420,290,[255,218,163],.22);grad(b,0,820,W,H-820,[[0,'#9fb8b7'],[.08,'#6a9da8'],[.65,'#387f96'],[1,'#266174']]);for(let i=0;i<1600;i++){let y=825+rnd(i,710)*1000;b.fillStyle=i%3?'rgba(213,225,215,.11)':'rgba(25,77,99,.10)';b.fillRect(rnd(i,711)*W,y,2+rnd(i,712)*30,1);}ridge(b,[[560,1180],[660,1050],[755,1030],[840,948],[920,921],[1100,875]],'#73958b');woodedSlope(b,[[655,1410],[725,1170],[803,1060],[930,995],[1090,930]],740,'#47684f',1900);});
const roadBend=s=>90*Math.sin(s/270)-.11*s;
function roadPoint(z,offset,travel,u){const f=920/z;return {x:535+(roadBend(travel+z)-roadBend(travel)+offset)*f,y:895-u*16+(83+u*9)*f,f};}
function roadCar(b,x,y,s,angle){b.save();b.translate(x,y);b.rotate(angle);b.scale(s,s);glow(b,0,12,40,19,[5,15,18],.48);b.fillStyle='#172b2f';b.fillRect(-23,-30,8,47);b.fillRect(15,-30,8,47);poly(b,[[-21,22],[-24,-28],[-17,-48],[16,-48],[24,-28],[21,22]],'#e4dec9','#45636a',1);poly(b,[[-17,-28],[-12,-41],[12,-41],[18,-28]],'#3a606a');poly(b,[[-17,5],[-15,-13],[15,-13],[17,5]],'#274b59');b.fillStyle='#f4e7c7';b.fillRect(-18,10,36,8);b.fillStyle='#ab493b';b.fillRect(-19,17,7,3);b.fillRect(12,17,7,3);b.fillStyle='#e8d3a3';b.fillRect(-5,20,10,3);b.restore();}
function summitShotV6(b,t){const u=clamp((t-13)/7),travel=60+u*104;b.save();b.translate(-u*22,-u*6);b.scale(1+u*.026,1+u*.026);b.drawImage(seaLandscape,0,0,W,H);b.restore();
 // A continuous forward flight: all roadside objects share world coordinates.
 const zs=Array.from({length:116},(_,i)=>900-i*7.3);
 const left=zs.map(z=>roadPoint(z,-35,travel,u)),right=zs.map(z=>roadPoint(z,35,travel,u));
 poly(b,left.map(p=>[p.x,p.y]).concat([[-150,2300],[-150,1390],[40,1330],[120,1260],[180,1200],[215,1150],[230,1090],[270,1050]]),'#405b42');
 poly(b,right.map(p=>[p.x,p.y]).concat([[1250,2300],[1250,867],[1050,912],[950,940],[820,970],[710,980],[610,1005]]),'#435c3d');
 poly(b,left.map(p=>[p.x,p.y]).concat(right.toReversed().map(p=>[p.x,p.y])),'#626863');
 for(const [off,color,width]of [[0,'#d9a350',.65],[-32,'#dedbc6',.7],[32,'#d3d4c2',.7]]){b.strokeStyle=color;b.beginPath();for(let i=0;i<zs.length;i++){const p=roadPoint(zs[i],off,travel,u);if(i){const prev=roadPoint(zs[i-1],off,travel,u);b.lineWidth=Math.max(.7,width*p.f);b.beginPath();b.moveTo(prev.x,prev.y);b.lineTo(p.x,p.y);b.stroke();}}}
 // Rockfall-net cuts on the landward side, textured into the wooded bank.
 for(let k=42;k>=0;k--){const zw=k*21+150,z=zw-travel;if(z<53||z>900)continue;const r=roadPoint(z,43,travel,u);b.strokeStyle='rgba(167,169,139,.28)';b.lineWidth=Math.max(.5,r.f*.23);b.beginPath();b.moveTo(r.x,r.y);b.lineTo(r.x+55*r.f,r.y-30*r.f);b.stroke();}
 // Forest outside the road; sprites are ordered by depth, not random draw order.
 for(let k=2200;k>=0;k--){const zw=140+k*.41,z=zw-travel;if(z<54||z>900)continue;const side=k%3?1:-1,off=side*(48+rnd(k,780)*145),p=roadPoint(z,off,travel,u),h=(6+rnd(k,781)*11)*p.f;const yy=p.y+(side<0?Math.min(24,(Math.abs(off)-40)*.38):-Math.min(28,(off-40)*.33))*p.f;if(p.x+h<0||p.x-h>W||yy-h>H||yy+h<930)continue;b.drawImage(forestSprites[k%6],p.x-h,yy-h*1.4,h*2,h*2);}
 // Silver guardrail on the sea side, all posts travel toward the camera.
 b.strokeStyle='#c3c8b7';b.lineWidth=2.5;b.beginPath();for(let z=900;z>=56;z-=5){const p=roadPoint(z,-38,travel,u);b[z===900?'moveTo':'lineTo'](p.x,p.y-3.6*p.f);}b.stroke();
 for(let k=70;k>=0;k--){let z=k*16+128-travel;if(z<55||z>900)continue;let p=roadPoint(z,-38,travel,u);b.strokeStyle='#aeb7a4';b.lineWidth=Math.max(1,p.f*.45);b.beginPath();b.moveTo(p.x,p.y);b.lineTo(p.x,p.y-4.6*p.f);b.stroke();}
 const car=roadPoint(173,-17,travel,u),ahead=roadPoint(187,-17,travel,u);roadCar(b,car.x,car.y,1.22,Math.atan2(ahead.x-car.x,car.y-ahead.y)*.65);
 for(let i=0;i<40;i++){const y=846+i*5,x=220+Math.sin(i*.7+t*.3)*35;b.fillStyle='rgba(245,224,178,.13)';b.fillRect(x,y,5+rnd(i,790)*25,1);}
}

// A single frontal courtyard composition; abstracted from Yahiko's broad haiden.
const shrineBackdrop=layer(b=>{
 grad(b,0,0,W,H,[[0,'#203e4c'],[.38,'#a7b2a0'],[.68,'#6b7a55'],[1,'#364f3c']]);
 naturalRidge(b,[[-60,770],[80,720],[190,650],[330,700],[470,610],[590,635],[710,570],[830,650],[990,620],[1140,730]],932,['#53674b','#76805b','#908764','#a09166'],6500);
 for(let i=0;i<34;i++){let x=-80+rnd(i,935)*1240,top=450+rnd(i,936)*400;cedarTrunk(b,x,1230,1230-top,15+rnd(i,937)*23,940+i,['#263d31','#5d6046','#304935']);for(let j=0;j<160;j++){let y=top+rnd(j,i+960)*(1180-top),w=20+(y-top)*.18,xx=x+(rnd(j,i+990)-.5)*w*2;b.fillStyle=['#294b3a','#39573d','#486144','#60704b','#7b8054'][j%5];b.beginPath();b.ellipse(xx,y,5+rnd(j,i+1010)*15,3+rnd(j,i+1020)*7,0,0,TAU);b.fill();}}
 glow(b,810,760,430,430,[225,203,142],.16);
});
function broadHaiden(b){
 // Courtyard and wide shallow stone stairs.
 grad(b,0,1290,W,630,[[0,'#92927c'],[1,'#636c5d']]);
 for(let i=0;i<2600;i++){b.fillStyle=i%2?'rgba(219,209,173,.16)':'rgba(34,45,35,.18)';b.fillRect(rnd(i,1040)*W,1290+rnd(i,1041)*630,1+rnd(i,1042)*3,1);}
 poly(b,[[450,1460],[625,1460],[790,1920],[220,1920]],'#a8a48c');
 for(let i=0;i<9;i++){let y=1460+Math.pow(i/8,1.5)*460;b.strokeStyle='#717a69';b.lineWidth=2;b.beginPath();b.moveTo(450-(y-1460)*.5,y);b.lineTo(625+(y-1460)*.36,y);b.stroke();}
 for(let i=0;i<6;i++){let y=1370+i*20;poly(b,[[160-i*17,y],[920+i*17,y],[929+i*17,y+13],[151-i*17,y+13]],'#b0ad94');b.fillStyle='#687365';b.fillRect(151-i*17,y+13,778+i*34,7);}
 // Side corridors and recessed timber facade.
 poly(b,[[-70,1180],[200,1160],[200,1352],[-70,1375]],'#514a36');poly(b,[[880,1160],[1150,1180],[1150,1375],[880,1352]],'#484733');
 grad(b,140,1060,800,302,[[0,'#172b28'],[.55,'#343c2c'],[1,'#6f5d40']]);
 for(let i=0;i<8;i++){let x=167+i*95;b.fillStyle='#8a754f';b.fillRect(x,1130,70,184);for(let k=0;k<7;k++){b.fillStyle='#394232';b.fillRect(x+5+k*10,1130,3,184);}for(let y=1150;y<1310;y+=24){b.fillStyle='#424735';b.fillRect(x,y,70,3);}}
 grad(b,435,1110,210,236,[[0,'#0e2424'],[1,'#293a2c']]);
 for(const x of [145,250,360,430,650,720,830,935]){grad(b,x-8,1075,16,285,[[0,'#c2a373'],[.5,'#9f8358'],[1,'#675b40']]);b.fillStyle='#b59b6b';b.fillRect(x-15,1337,30,13);}
 b.fillStyle='#ab9064';b.fillRect(135,1100,810,13);b.fillStyle='#302f24';b.fillRect(135,1113,810,12);
 b.fillStyle='#87704d';b.fillRect(468,1290,145,55);poly(b,[[458,1283],[623,1283],[613,1296],[468,1296]],'#b69d70');
 // Main rear gable: a steep central peak, not a tall rectangular roof.
 poly(b,[[248,1002],[540,735],[832,1002]],'#3a4c45','#b99f6e',7);
 poly(b,[[295,990],[540,779],[785,990]],'#a48c5c');poly(b,[[328,982],[540,804],[752,982]],'#3e4635');
 for(let i=-7;i<=7;i++){b.strokeStyle='#9e895d';b.lineWidth=3;b.beginPath();b.moveTo(540,817);b.lineTo(540+i*26,976);b.stroke();}
 b.fillStyle='#ccb585';b.beginPath();b.arc(540,847,16,0,TAU);b.fill();
 // Broad wings with slightly lifted eaves.
 b.beginPath();b.moveTo(64,1017);b.bezierCurveTo(222,1044,319,1022,386,962);b.lineTo(694,962);b.bezierCurveTo(761,1022,858,1044,1016,1017);b.lineTo(973,1100);b.quadraticCurveTo(540,1140,107,1100);b.closePath();
 const r=b.createLinearGradient(0,960,0,1130);r.addColorStop(0,'#6b7869');r.addColorStop(.6,'#3d514a');r.addColorStop(1,'#1c3733');b.fillStyle=r;b.fill();b.strokeStyle='#b4a279';b.lineWidth=4;b.stroke();
 for(let i=0;i<57;i++){let x=112+i*15;b.strokeStyle=i%3?'#92866a':'#c2ac7b';b.lineWidth=3;b.beginPath();b.moveTo(x,1105);b.lineTo(x+2,1125);b.stroke();}
 // Forward karahafu canopy: broad shoulders, a soft central arch and deep underside.
 b.beginPath();b.moveTo(267,1065);b.bezierCurveTo(360,1110,388,1080,434,1010);b.bezierCurveTo(476,944,604,944,646,1010);b.bezierCurveTo(692,1080,720,1110,813,1065);b.lineTo(788,1130);b.bezierCurveTo(690,1150,655,1110,624,1063);b.bezierCurveTo(588,1017,492,1017,456,1063);b.bezierCurveTo(425,1110,390,1150,292,1130);b.closePath();b.fillStyle='#263d37';b.fill();b.strokeStyle='#bba574';b.lineWidth=6;b.stroke();
 b.strokeStyle='#77806a';b.lineWidth=10;b.beginPath();b.moveTo(272,1064);b.bezierCurveTo(360,1102,389,1069,435,1004);b.bezierCurveTo(478,941,602,941,645,1004);b.bezierCurveTo(690,1069,720,1102,808,1064);b.stroke();
 for(const x of [418,662]){grad(b,x-10,1110,20,257,[[0,'#c3a576'],[1,'#7c694a']]);b.fillStyle='#c1aa7d';b.fillRect(x-18,1350,36,13);}
 b.fillStyle='#bba36e';b.beginPath();b.arc(540,1039,14,0,TAU);b.fill();
 for(let i=0;i<5;i++){let x=466+i*37;poly(b,[[x,1135],[x+12,1145],[x+4,1155],[x+15,1166],[x+5,1180],[x-5,1167],[x+2,1156],[x-8,1147]],'#e0d7b7');}
 stoneLantern(b,110,1510,1.05);stoneLantern(b,970,1510,1.05);
}
const shrineArchitecture=layer(b=>broadHaiden(b));
// A complete frontal gate in its own cedar approach shot.
// The cut to the courtyard avoids inventing a shared axis with the haiden.
function gateShot(b,t){
 const e=ease(clamp((t-4)/4));
 b.save();camera(b,1+.018*e,540,960-3*e);b.drawImage(gateForest,0,0,W,H);leaves(b,t);b.restore();
 b.save();camera(b,1+.04*e,540,960-5*e);b.drawImage(shrineForeground,0,0,W,H);b.restore();
}
function shrineShot(b,t){
 if(variant==='V6'){shrineShotV6(b,t);return;}
 const u=clamp((t-4)/4),e=ease(u);
 b.save();camera(b,1+.018*e,540+7*e,960);b.drawImage(shrineBackdrop,0,0,W,H);b.restore();
 b.save();camera(b,1.015+.065*e,540+23*e,960-12*e);b.drawImage(shrineArchitecture,0,0,W,H);b.restore();

}

// ======== Claude 版：红叶谷夜景 → 神社（俯瞰鸟居，冲进红叶，斜侧面的拜殿）→ 缆车 → 山顶日落（23.3 秒）========
// 每段多长按内容定：夜景开场 4.5 秒、神社 6.8 秒（鸟居 → 一瞬间冲进红叶 → 拜殿）、缆车 4.8 秒、日落 7.2 秒。
const OV=3.6,OVS=OV-2.2;   // v13：开场从 2.2 秒延长到 3.6 秒（入夜看得出来），后面整体往后挪 1.4 秒
// v18：按一天的时间排——白天导览 → 鸟居 → 拜殿 → 缆车 → 山顶日落 → 入夜红叶谷点灯 → 温泉街
const TOWN0=20.6,NIGHT0=17.0;
const PLAN=[['overview',0,3.2],['torii',3.2,6.4],['glade',6.4,9.8],['ascent',9.8,13.0],['sunset',13.0,NIGHT0],['night',NIGHT0,TOWN0],['town',TOWN0,V28_DURATION]];
// Retiming only: the original scene drawing functions keep their source
// clocks and geometry. No uniform speed-up of the entire film.
function sourceTime(t){   // 播放时间 → 各镜头原来的源时间（各镜头的画法不动）
 let source;
 if(t<3.2)source=t;
 else if(t<6.4){const u=(t-3.2)/3.2;source=5.6+3.2*(u-.75*u*u+.5*u*u*u);}
 else if(t<13.0)source=t+1.6;
 else if(t<NIGHT0)source=14.6+(t-13.0)*10.6/(NIGHT0-13.0);
 else if(t<TOWN0)source=1.4+(t-NIGHT0);      // 夜景：先换景，18.2 秒点灯
 else source=t;
 return Math.round(source*1e9)/1e9;
}
const MAP1=5.4,TOR0=5.6;
function addGlow(b,x,y,rx,ry,c,a){b.globalCompositeOperation='lighter';glow(b,x,y,rx,ry,c,a);b.globalCompositeOperation='source-over';}
// ---- 神社（插画分层，和其他镜头同一种画法）----
// 从高处看参道上的朱红鸟居，镜头一直匀速往前走；参道上方挂着的一枝红叶越来越近，盖满画面时（7.72）切到斜侧面的拜殿，
// 叶子从画面四边退出去，镜头减速后继续很慢地往前。
const SH0=4.5,CUTT=7.0,SH1=11.3,VP=[540,600];
function sunBeams(b,x0,n,seed,a){b.save();b.globalCompositeOperation='lighter';
  for(let i=0;i<n;i++){const x=x0+(rnd(i,seed)-.5)*700,w=30+rnd(i,seed+1)*90,q=b.createLinearGradient(x,0,x-560,1700);
    q.addColorStop(0,`rgba(255,226,170,${a*(.5+rnd(i,seed+2))})`);q.addColorStop(1,'rgba(255,226,170,0)');b.fillStyle=q;
    b.beginPath();b.moveTo(x,-50);b.lineTo(x+w,-50);b.lineTo(x+w-560,1700);b.lineTo(x-560-w*.4,1700);b.closePath();b.fill();}b.restore();}
const LIGHT_TRUNK=['#4a5a48','#7d7a5c','#566550'],FAR_TRUNK=['#7c8c74','#93997e','#80907a'];
// Shrine-only cedars: broad irregular trunks, short bark marks and attached needle sprays.
function shrineTrunk(b,x,base,h,w,seed,colors){
 const top=base-h,lean=(rnd(seed,2)-.5)*w*.7;
 b.save();b.beginPath();b.moveTo(x-w*.72,base);
 b.bezierCurveTo(x-w*.42,base-h*.15,x+lean-w*.30,top+h*.3,x+lean-w*.27,top);
 b.lineTo(x+lean+w*.28,top);b.bezierCurveTo(x+lean+w*.33,top+h*.3,x+w*.4,base-h*.17,x+w*.7,base);b.closePath();
 const q=b.createLinearGradient(x-w*.6,0,x+w*.6,0);q.addColorStop(0,colors[0]);q.addColorStop(.63,colors[1]);q.addColorStop(1,colors[2]);b.fillStyle=q;b.fill();b.clip();
 for(let i=0;i<Math.ceil(h/18);i++){
  const u=rnd(i,seed+1),yy=top+u*h,xx=x+lean*(1-u)+(rnd(i,seed+2)-.5)*w*.9;
  b.strokeStyle=i%4?'rgba(15,26,22,.16)':'rgba(195,175,135,.12)';b.lineWidth=.6+rnd(i,seed+3)*Math.max(1,w*.055);
  b.beginPath();b.moveTo(xx,yy);b.bezierCurveTo(xx-w*.03,yy+14,xx+w*.025,yy+33,xx-w*.015,yy+24+rnd(i,seed+4)*90);b.stroke();
 }
 b.restore();
}
function shrineSpray(b,x,y,w,seed,color){
 b.save();b.lineCap='round';const side=rnd(seed,1)>.5?1:-1;
 b.translate(x,y);b.scale(side,1);
 b.strokeStyle='#354235';b.lineWidth=Math.max(1.5,w*.013);b.beginPath();b.moveTo(0,0);b.bezierCurveTo(w*.22,-w*.035,w*.48,w*.09,w*.73,-w*.02);b.stroke();
 for(let j=0;j<20;j++){
  const u=.07+j*.033,xx=w*u,yy=Math.sin(u*4)*w*.025,dir=j%2?1:-1,len=w*(.09+rnd(j,seed)*.13)*(1-u*.5);
  const tx=xx+len*.65,ty=yy+dir*len*.52;
  b.strokeStyle=color;b.lineWidth=1.1+w*.003;b.beginPath();b.moveTo(xx,yy);b.quadraticCurveTo(xx+len*.3,yy+dir*len*.15,tx,ty);b.stroke();
  for(let k=0;k<13;k++){
   const v=k/13,px=lerp(xx,tx,v),py=lerp(yy,ty,v),sz=len*(.16+.23*rnd(k+j*13,seed+2))*(1-v*.5);
   b.fillStyle=k%4?color:'rgba(112,138,100,.24)';
   poly(b,[[px-sz*.25,py+sz*.2],[px-sz*.85,py-dir*sz],[px+sz*.45,py-dir*sz*.4],[px+sz*.95,py-dir*sz*.8],[px+sz*.6,py+sz*.3]],b.fillStyle);
  }
 }b.restore();
}

// Connected sprays of autumn foliage: broad colour masses, branching and a few readable leaves.
function shrineCanopy(b,x,y,rx,ry,seed){
 const lobes=[];
 for(let i=0;i<23;i++){
  const a=rnd(i,seed)*TAU,r=Math.sqrt(rnd(i,seed+1)),xx=x+Math.cos(a)*rx*r*.82,yy=y+Math.sin(a)*ry*r*.75;
  lobes.push({x:xx,y:yy,h:ry*(.28+rnd(i,seed+2)*.38),w:rx*(.19+rnd(i,seed+3)*.25),i});
 }
 b.save();b.lineCap='round';
 const rootX=x<540?x-rx*.85:x+rx*.85,rootY=y+ry*1.1;
 for(const l of lobes){b.strokeStyle=l.i%3?'#514132':'#70503a';b.lineWidth=2+rx*.012;b.beginPath();b.moveTo(rootX,rootY);b.quadraticCurveTo(x,y+ry*.3,l.x,l.y-l.h*.3);b.stroke();}
 const pal=[['#57342c','#8b4030','#b76c44'],['#63302b','#a74631','#ca7947'],['#444535','#705435','#9b7946'],['#59302c','#8c3b30','#b65d3e']];
 lobes.sort((a,c)=>a.y-c.y).forEach(l=>treeCrown(b,l.x,l.y,l.h,l.w,seed+l.i*29,pal[l.i%4]));
 // Sparse attached edge leaves, unequal and turned away from the viewer.
 for(let i=0;i<105;i++){
  const l=lobes[i%lobes.length],a=rnd(i,seed+7)*TAU,r=.7+rnd(i,seed+8)*.35;
  const xx=l.x+Math.cos(a)*l.w*r,yy=l.y-l.h*.5+Math.sin(a)*l.h*.44*r,s=3+rx*.018*rnd(i,seed+9);
  b.save();b.translate(xx,yy);b.rotate(a*.35);b.scale(.5+rnd(i,seed+10)*.6,1);
  maple(b,0,0,s,a,pal[i%4][i%3]);if(s>5){b.strokeStyle='rgba(227,181,115,.30)';b.lineWidth=.6;b.beginPath();b.moveTo(0,s*.45);b.lineTo(0,-s*.65);b.stroke();}b.restore();
 }b.restore();
}

// 地面和参道：从高处往下看，参道往远处收窄
const approachGround=layer(b=>{
  grad(b,0,0,W,H,[[0,'#2f4a3a'],[.22,'#768a6c'],[.3,'#a6ae8c'],[.36,'#6c7a52'],[1,'#3c4a2e']]);
  glow(b,VP[0],VP[1]-60,520,300,[236,232,190],.35);
  for(let i=0;i<32;i++){const x=rnd(i,801)*1300-110,base=560+rnd(i,802)*120;shrineTrunk(b,x,base,base+200,10+rnd(i,803)*16,820+i,FAR_TRUNK);}
  grad(b,0,520,W,200,[[0,'rgba(200,210,180,.0)'],[.5,'rgba(200,210,180,.45)'],[1,'rgba(200,210,180,0)']]);
  for(let i=0;i<2600;i++){const y=600+Math.pow(rnd(i,805),.8)*1320,s=(y-560)/1360;b.fillStyle=['#5a6a3c','#465832','#6e7444','#7a5a32'][i%4];b.globalAlpha=.25+rnd(i,806)*.4;b.beginPath();b.ellipse(rnd(i,807)*W,y,2+s*14,1+s*5,0,0,TAU);b.fill();}
  b.globalAlpha=1;
  const half=y=>30+(y-600)/(H-600)*380,N=26;
  b.beginPath();b.moveTo(VP[0]-half(600),600);b.lineTo(VP[0]+half(600),600);b.lineTo(VP[0]+half(H),H);b.lineTo(VP[0]-half(H),H);b.closePath();b.fillStyle='#8e8c72';b.fill();
  for(let k=0;k<N;k++){const y0=600+(H-600)*Math.pow(k/N,1.7),y1=600+(H-600)*Math.pow((k+1)/N,1.7);
    for(let j=0;j<4;j++){const f0=j/4-.5,f1=(j+1)/4-.5,v=.88+rnd(k*4+j,811)*.24,gap=1+(y1-y0)*.06;
      poly(b,[[VP[0]+half(y0)*2*f0+gap,y0+gap],[VP[0]+half(y0)*2*f1-gap,y0+gap],[VP[0]+half(y1)*2*f1-gap,y1-gap],[VP[0]+half(y1)*2*f0+gap,y1-gap]],`rgb(${Math.round(158*v)},${Math.round(154*v)},${Math.round(128*v)})`);}}
  for(let i=0;i<500;i++){const y=600+Math.pow(rnd(i,815),.7)*1320,side=i%2?-1:1,x=VP[0]+side*(half(y)+rnd(i,816)*30*(y/900));b.fillStyle=['#52603a','#667048','#3b5538'][i%3];b.beginPath();b.ellipse(x,y,2+y/180,1+y/500,0,0,TAU);b.fill();}
  for(let i=0;i<145;i++){const y=640+rnd(i,821)*1280,x=VP[0]+(rnd(i,822)-.5)*2*half(y)*1.4;maple(b,x,y,1.5+y/440,rnd(i,823)*TAU,['#875237','#ad7142','#704b32'][i%3]);}
  for(const [y,s] of [[700,.32],[860,.5],[1130,.78],[1560,1.15]])for(const side of [-1,1])stoneLantern(b,VP[0]+side*(half(y)+30+s*40),y,s);
  sunBeams(b,980,8,830,.08);
});
// 中景的杉树（参道两侧）
const approachMid=layer(b=>{
  for(let i=0;i<16;i++){const side=i%2?-1:1,y=640+rnd(i,841)*560,x=VP[0]+side*(70+(y-600)*.75+rnd(i,842)*140);shrineTrunk(b,x,y+40,y+120,14+(y-600)*.06,850+i,LIGHT_TRUNK);}
  [[200,880,110,90,861,.95,420],[900,780,95,80,862,.95,380],[120,1180,150,120,863,.9,520]].forEach(a=>shrineCanopy(b,...a));
});
// 朱红鸟居，从斜上方看：能看见笠木的顶面
const toriiTop=layer(b=>{
  const L=330,R=750,top=640,base=1180;
  // Cast shadows start at the feet; the previous detached ellipse made the gate float.
  for(const x of [L,R]){
    poly(b,[[x-22,base],[x+22,base],[x-72,base+170],[x-125,base+170]],'rgba(28,39,27,.19)');
    for(const [xx,yy,rx,ry] of [[x,base+5,34,9],[x-15,base-25,20,6],[x+15,base+23,23,7]]){
      b.fillStyle='rgba(27,35,24,.37)';b.beginPath();b.ellipse(xx,yy,rx,ry,-.05,0,TAU);b.fill();
    }
    poly(b,[[x-31,base-2],[x+27,base-2],[x+31,base+9],[x-34,base+9]],'#8c8c76');
    poly(b,[[x-31,base-2],[x-26,base-9],[x+24,base-9],[x+27,base-2]],'#bab79e');
  }
  // Ryobu torii auxiliary posts, tied to the main pillars; grounded in the official photo.
  for(const x of [L,R]){
    const rear=x-15;
    poly(b,[[rear-11,915],[rear+11,915],[rear+13,base-28],[rear-13,base-28]],'#8e332a');
    poly(b,[[rear-18,911],[rear,902],[rear+19,913],[rear+17,922],[rear-17,920]],'#49423b');
    poly(b,[[rear-10,990],[x+9,1011],[x+9,1025],[rear-10,1005]],'#c34c37');
  }
  for(const x of [L,R]){const gr=b.createLinearGradient(x-22,0,x+22,0);gr.addColorStop(0,'#7a1c0e');gr.addColorStop(.4,'#e6502c');gr.addColorStop(.75,'#c63f22');gr.addColorStop(1,'#5c160a');
    poly(b,[[x-17,top+40],[x+17,top+40],[x+21,base],[x-21,base]],gr);b.fillStyle='#9b9988';b.fillRect(x-25,base-5,50,10);b.fillStyle='rgba(255,220,170,.25)';b.fillRect(x-8,top+60,4,base-top-100);}
  const nk=780;poly(b,[[L-70,nk-14],[R+70,nk-14],[R+62,nk],[L-62,nk]],'#e8643c');poly(b,[[L-62,nk],[R+62,nk],[R+62,nk+20],[L-62,nk+20]],'#b8381e');
  poly(b,[[536,690],[584,690],[584,nk-14],[536,nk-14]],'#c43c20');
  poly(b,[[L-80,676],[R+80,676],[R+80,694],[L-80,694]],'#c8401f');
  const up=x=>18*Math.pow(Math.abs(x-560)/(R-L+220)*2,3);
  b.beginPath();b.moveTo(L-140,628-up(L-140));for(let x=L-140;x<=R+140;x+=10)b.lineTo(x,628-up(x)-0);for(let x=R+130;x>=L-130;x-=10)b.lineTo(x,604-up(x));b.closePath();b.fillStyle='#4a4440';b.fill();
  b.beginPath();b.moveTo(L-140,628-up(L-140));for(let x=L-140;x<=R+140;x+=10)b.lineTo(x,628-up(x));for(let x=R+140;x>=L-140;x-=10)b.lineTo(x,662-up(x)*.6);b.closePath();b.fillStyle='#1b1512';b.fill();
  b.strokeStyle='rgba(255,230,190,.35)';b.lineWidth=2;b.beginPath();for(let x=L-130;x<=R+130;x+=10)b[x===L-130?'moveTo':'lineTo'](x,605-up(x));b.stroke();
  // Front auxiliary posts have small copper caps and timber ties.
  for(const x of [L,R]){
    const xx=x+15;
    poly(b,[[x-10,1002],[xx+9,1020],[xx+9,1037],[x-10,1018]],'#a73b2b');
    const q=b.createLinearGradient(xx-12,0,xx+12,0);q.addColorStop(0,'#7e2b23');q.addColorStop(.5,'#d35740');q.addColorStop(1,'#9b3428');
    poly(b,[[xx-11,947],[xx+11,947],[xx+14,base+20],[xx-14,base+20]],q);
    poly(b,[[xx-22,946],[xx,932],[xx+23,946],[xx+21,953],[xx,941],[xx-21,953]],'#51463d');
    b.fillStyle='#b5b09c';b.fillRect(xx-17,base+17,34,8);
  }
  // Painted timber joints and restrained surface variation.
  for(const x of [L,R]){
    for(let i=0;i<20;i++){const xx=x-14+rnd(i,x)*28,yy=top+65+rnd(i,x+1)*(base-top-145);b.strokeStyle=i%3?'rgba(89,33,20,.13)':'rgba(255,184,122,.13)';b.lineWidth=.6+rnd(i,x+2)*1.3;b.beginPath();b.moveTo(xx,yy);b.lineTo(xx+.8,yy+25+rnd(i,x+3)*90);b.stroke();}
    b.fillStyle='rgba(63,25,16,.28)';b.fillRect(x-19,nk+20,38,6);b.fillRect(x-17,694,34,7);
  }
});
function paintToriiPlaque(){const b=toriiTop.getContext('2d');b.save();b.setTransform(Q,0,0,Q,0,0);
  // Black-and-gold plaque seen on the actual entrance gate.
  poly(b,[[515,673],[565,673],[566,794],[514,794]],'#b99b60');
  poly(b,[[519,677],[561,677],[562,790],[518,790]],'#152324');
  b.save();b.font='600 21px "Source Han Sans SC",sans-serif';b.textAlign='center';b.textBaseline='middle';b.fillStyle='#ddc88e';
  ['弥','彦','神','社'].forEach((ch,i)=>b.fillText(ch,540,691+i*28));b.restore();
b.restore();}
// 近处的大杉树和红叶，在画面两边，冲的时候最先飞出去
const approachNear=layer(b=>{
  shrineTrunk(b,-30,1960,2000,150,871,['#24382c','#5c5a40','#2c4234']);shrineTrunk(b,1110,1960,2000,170,872,['#24382c','#6a6447','#30463a']);
  shrineSpray(b,110,320,420,873,'#21402f');shrineSpray(b,980,260,380,874,'#264636');
  [[-40,1500,230,190,875,.95,800],[1110,1240,200,200,876,.9,760],[60,560,150,120,877,.9,500]].forEach(a=>shrineCanopy(b,...a));
});
// ---- 拜殿：斜侧面（从左前方看），用透视算出各点的位置，再一笔笔画出来 ----
const HP=(()=>{const C=[-14,2.4,-26],yw=.5,pt=.03,FF=1400,ox=540,oy=1150,cy=Math.cos(yw),sy=Math.sin(yw),cp=Math.cos(pt),sp=Math.sin(pt);
  return (x,y,z)=>{const dx=x-C[0],dy=y-C[1],dz=z-C[2],x1=dx*cy-dz*sy,z1=dx*sy+dz*cy,y2=dy*cp-z1*sp,z2=dy*sp+z1*cp;return [ox+FF*x1/z2,oy-FF*y2/z2];};})();
function hp(b,pts,fill,stroke,w){poly(b,pts.map(p=>HP(...p)),fill,stroke,w);}
function hline(b,a,c,col,w){const p=HP(...a),q=HP(...c);b.strokeStyle=col;b.lineWidth=w;b.beginPath();b.moveTo(...p);b.lineTo(...q);b.stroke();}
function hgrad(b,pts,top,bottom){const s=pts.map(p=>HP(...p)),ys=s.map(p=>p[1]),q=b.createLinearGradient(0,Math.min(...ys),0,Math.max(...ys));q.addColorStop(0,top);q.addColorStop(1,bottom);poly(b,s,q);}
const hallBack=layer(b=>{
  grad(b,0,0,W,H,[[0,'#1c3426'],[.35,'#36503a'],[.52,'#4e6448'],[.6,'#62684e'],[1,'#6c7058']]);
  glow(b,800,700,500,400,[240,230,190],.12);
  // Receding trunks sit in shade; the nearer branches grow from their own trunks.
  for(let i=0;i<25;i++){const x=rnd(i,901)*1300-110,base=1110+rnd(i,902)*100;shrineTrunk(b,x,base,base+150,13+rnd(i,903)*18,910+i,['#3c5140','#56634b','#405642']);}
  grad(b,0,0,W,1160,[[0,'rgba(34,58,43,.24)'],[.6,'rgba(95,116,80,.18)'],[1,'rgba(131,141,104,.28)']]);
  for(let i=0;i<15;i++){
   const x=-100+i*90+(rnd(i,941)-.5)*88,base=1130+rnd(i,942)*100,w=27+rnd(i,943)*32;
   shrineTrunk(b,x,base,base+210,w,950+i,['#293e32','#62614b','#364b39']);
   for(let j=0;j<5;j++){const y=35+rnd(i*5+j,944)*1050;shrineSpray(b,x,y,125+rnd(i*5+j,945)*180,1000+i*13+j,['#223e2e','#2b4a35','#36553d'][j%3]);}
  }
  grad(b,0,1150,W,770,[[0,'#a8a48a'],[.4,'#bdb69a'],[1,'#8e8a70']]);
  for(let i=0;i<3000;i++){const y=1160+Math.pow(rnd(i,907),.8)*760;b.fillStyle=i%2?'rgba(240,232,205,.25)':'rgba(90,86,66,.22)';b.fillRect(rnd(i,908)*W,y,1+(y-1150)/300,1);}
  glow(b,860,1380,700,400,[245,210,150],.12);
  sunBeams(b,1050,7,940,.06);
});
const hallPaint=layer(b=>{
 // Frontal haiden: a tall central gable, low side wings, deep porch and broad stairs.
 // The architecture is the subject; the courtyard is deliberately unoccupied.
 const path=(draw,fill,stroke,w=1)=>{b.beginPath();draw();if(fill){b.fillStyle=fill;b.fill();}if(stroke){b.strokeStyle=stroke;b.lineWidth=w;b.stroke();}};
 const line=(x,y,xx,yy,c,w)=>{b.strokeStyle=c;b.lineWidth=w;b.beginPath();b.moveTo(x,y);b.lineTo(xx,yy);b.stroke();};
 const timber=(x,y,w,h)=>{const q=b.createLinearGradient(x,0,x+w,0);q.addColorStop(0,'#49372b');q.addColorStop(.35,'#a9865d');q.addColorStop(.65,'#806347');q.addColorStop(1,'#44362b');b.fillStyle=q;b.fillRect(x,y,w,h);};
 // Contact shadow, rear corridors, and a stone plinth shared with the stair geometry.
 b.fillStyle='rgba(31,41,30,.24)';b.beginPath();b.ellipse(540,1455,470,46,0,0,TAU);b.fill();
 grad(b,52,1110,976,270,[[0,'#554739'],[1,'#28291f']]);
 for(let x=65;x<=1015;x+=48){timber(x,1120,10,252);for(let j=1;j<4;j++)line(x+j*10,1160,x+j*10,1344,'#6b5840',1.2);}
 // The long, low wings make the central roof read as the principal building.
 for(const side of [-1,1]){b.save();b.translate(540,0);b.scale(side,1);
   path(()=>{b.moveTo(120,1104);b.lineTo(465,1104);b.quadraticCurveTo(488,1090,505,1066);b.quadraticCurveTo(328,1075,176,1047);b.closePath();},'#444a43','#9a8b6d',3);
   poly(b,[[125,1104],[465,1104],[449,1122],[132,1122]],'#282d25');
   for(let x=145;x<460;x+=15)line(x,1105,x-3,1119,'#b49668',2);
   b.restore();}
 // Raised veranda and doors beneath the eaves.
 grad(b,194,1070,692,310,[[0,'#191e1a'],[.65,'#24241c'],[1,'#3e3628']]);
 for(const x of [224,330,414,646,730,836]){
   b.fillStyle='#302a20';b.fillRect(x,1120,68,210);
   for(let i=0;i<8;i++)line(x+i*9,1120,x+i*9,1330,'rgba(156,127,83,.52)',1.5);
   for(const y of [1175,1240,1290])line(x,y,x+68,y,'#68553a',2);
 }
 for(const x of [205,319,415,643,747,861])timber(x,1085,17,300);
 grad(b,194,1352,692,28,[[0,'#b1a080'],[1,'#6c6553']]);
 // Continuous main roof behind the gable: no sky gap between the two roof levels.
 const mainRoof=b.createLinearGradient(0,930,0,1090);mainRoof.addColorStop(0,'#596057');mainRoof.addColorStop(1,'#303d35');
 path(()=>{b.moveTo(164,1056);b.quadraticCurveTo(240,1040,324,945);b.lineTo(756,945);b.quadraticCurveTo(840,1040,916,1056);b.lineTo(884,1098);b.lineTo(196,1098);b.closePath();},mainRoof);
 for(let x=200;x<890;x+=15)line(x,1034,x+Math.sign(x-540)*10,1080,'rgba(168,175,148,.15)',1);
 // Central gable back plane, visible above the porch's curved eave.
 path(()=>{b.moveTo(305,1015);b.quadraticCurveTo(435,923,540,740);b.quadraticCurveTo(645,923,775,1015);b.closePath();},'#6b4d34');
 path(()=>{b.moveTo(361,985);b.quadraticCurveTo(468,895,540,787);b.quadraticCurveTo(612,895,719,985);b.closePath();},'#252922');
 for(let i=0;i<11;i++){const x=410+i*26,top=795+Math.abs(x-540)*.92;line(x,top,x,991,'rgba(162,127,76,.65)',3);}
 line(383,973,697,973,'#a18356',9);line(444,904,636,904,'#a18356',6);
 // Sweeping roof edges, with copper-grey slopes and a warm carved bargeboard.
 for(const side of [-1,1]){b.save();b.translate(540,0);b.scale(side,1);
   path(()=>{b.moveTo(0,711);b.bezierCurveTo(62,809,161,918,318,978);b.quadraticCurveTo(282,1002,217,1002);b.bezierCurveTo(118,936,48,850,0,768);b.closePath();},'#515851','#a99b7e',3);
   path(()=>{b.moveTo(0,733);b.bezierCurveTo(63,835,146,921,278,985);},null,'#252f2c',10);
   path(()=>{b.moveTo(0,754);b.bezierCurveTo(55,846,140,936,251,989);},null,'#d0b380',7);
   path(()=>{b.moveTo(0,772);b.bezierCurveTo(58,861,131,943,235,992);},null,'#806341',3);
   for(let i=1;i<11;i++){const u=i/11,x=318*u,y=711+267*Math.pow(u,.78);line(x-5,y+8,x+8,y+18,'rgba(195,196,170,.25)',1.5);}
   b.restore();}
 // Small restrained crest and carved timber details under the gable.
 b.fillStyle='#b89961';b.beginPath();b.ellipse(540,722,9,14,0,0,TAU);b.fill();
 for(const [x,y,r]of [[540,847,15],[490,923,12],[590,923,12]]){b.strokeStyle='#b99c66';b.lineWidth=3;b.beginPath();b.arc(x,y,r,.2,5.6);b.stroke();line(x-r*.7,y+8,x+r*.7,y+8,'#7d6646',3);}
 // Lower broad roof spans the facade; its curved centre remains separate from the high gable.
 const eave=(x)=>{const k=Math.abs((x-540)/367);return 1094-76*Math.exp(-Math.pow(k/.29,2))+13*Math.pow(k,6);};
 const upper=(x)=>eave(x)-60-20*(1-Math.abs((x-540)/367));
 const q=b.createLinearGradient(0,945,0,1120);q.addColorStop(0,'#5c6158');q.addColorStop(.5,'#414b44');q.addColorStop(1,'#29352f');
 path(()=>{b.moveTo(164,upper(164));for(let x=164;x<=916;x+=4)b.lineTo(x,upper(x));for(let x=916;x>=164;x-=4)b.lineTo(x,eave(x));b.closePath();},q);
 for(let x=175;x<910;x+=13)line(x,upper(x)+3,x,eave(x)-4,'rgba(145,155,133,.23)',1);
 for(const d of [0,9,18])path(()=>{b.moveTo(164,eave(164)+d);for(let x=164;x<=916;x+=4)b.lineTo(x,eave(x)+d);},null,d===0?'#b8a17a':d===9?'#51432e':'#272d24',d===0?5:8);
 for(let x=190;x<900;x+=18)line(x,eave(x)+17,x+2,eave(x)+31,'#8d7653',3);
 // Projecting central porch: front posts, capitals and a deep shadow behind the lintel.
 grad(b,426,1117,228,246,[[0,'#151d19'],[1,'#302b20']]);
 for(const x of [412,648]){timber(x,1103,20,278);b.fillStyle='#ac9061';b.fillRect(x-6,1105,32,14);b.fillRect(x-2,1350,24,10);b.fillStyle='#a9a58e';b.fillRect(x-4,1370,28,12);}
 path(()=>{b.moveTo(423,1130);b.quadraticCurveTo(453,1140,467,1121);b.quadraticCurveTo(540,1094,613,1121);b.quadraticCurveTo(627,1140,657,1130);b.lineTo(657,1150);b.lineTo(423,1150);b.closePath();},'#9c7c50');
 line(430,1162,650,1162,'#b59d65',5);
 for(const x of [466,514,566,614])poly(b,[[x,1161],[x+5,1170],[x-2,1178],[x+4,1185],[x-4,1196],[x-10,1188],[x-5,1180],[x-10,1172]],'#e8dfc4');
 // Veranda rails, altar and wide layered stone steps keep the building grounded.
 for(const [l,r]of [[200,402],[678,880]]){
   for(let x=l;x<=r;x+=37)timber(x,1313,7,65);
   line(l,1318,r,1318,'#ac9b7d',6);line(l,1342,r,1342,'#7d7259',4);
 }
 grad(b,496,1333,88,49,[[0,'#8b7656'],[1,'#4d4839']]);poly(b,[[486,1333],[594,1333],[585,1324],[495,1324]],'#b2a284');
 for(let i=0;i<6;i++){
   const x=177-i*15,y=1380+i*23,w=726+i*30;
   poly(b,[[x,y],[x+w,y],[x+w+13,y+13],[x-13,y+13]],i%2?'#b7b5a1':'#c0bdab');
   grad(b,x-13,y+13,w+26,10,[[0,'#9d9e8b'],[1,'#777e70']]);
   line(x-13,y+13,x+w+13,y+13,'#d5cdb4',1.4);
 }
 // A central paved approach is quiet and converges toward the stair centre.
 poly(b,[[425,1520],[655,1520],[815,1920],[265,1920]],'#b4b09a');
 for(let k=1;k<8;k++){const u=k/8,y=1520+400*Math.pow(u,1.35),half=115+(y-1520)*.4;line(540-half,y,540+half,y,'#8d907e',1.2);}
 for(const dx of [-75,0,75])line(540+dx,1520,540+dx*2.4,1920,'#8b8e7c',1.2);
});
const hallNear=layer(b=>{[[-60,520,220,200,981,.95,800],[1120,420,200,240,982,.95,800],[-80,1700,240,200,983,.9,820]].forEach(a=>shrineCanopy(b,...a));branch(b,1110,260,320,-1.15,16,3,984);});
// One cedar is already at the right edge of the path. Camera moves right and forward past it.
// The edit lies behind its opaque trunk, rather than an added leaf curtain.
const cedarOccluder=layer(b=>{
 b.beginPath();b.moveTo(64,-50);b.bezierCurveTo(75,470,45,1180,15,2020);b.lineTo(505,2020);b.bezierCurveTo(470,1160,445,430,430,-50);b.closePath();b.clip();
 const q=b.createLinearGradient(0,0,520,0);q.addColorStop(0,'#202c25');q.addColorStop(.35,'#4e5140');q.addColorStop(.65,'#77705a');q.addColorStop(1,'#343e30');b.fillStyle=q;b.fillRect(0,0,520,2000);
 for(let i=0;i<165;i++){
  const x=rnd(i,3101)*520,w=.5+rnd(i,3102)*5;b.strokeStyle=i%3?'rgba(25,31,24,.36)':'rgba(179,165,125,.24)';b.lineWidth=w;b.beginPath();
  for(let y=-20;y<=2020;y+=35){const xx=x+Math.sin(y*.004+i)*6+Math.sin(y*.017+i*3)*2;b[y===-20?'moveTo':'lineTo'](xx,y);}b.stroke();
 }
 for(let i=0;i<70;i++){const x=rnd(i,3103)*500,y=rnd(i,3104)*2000;b.strokeStyle=i%2?'rgba(37,48,28,.4)':'rgba(104,116,66,.22)';b.lineWidth=3+rnd(i,3105)*13;b.beginPath();b.moveTo(x,y);b.bezierCurveTo(x+8,y+30,x-5,y+75,x+2,y+100);b.stroke();}
},520,2000,1.5);
function cedarPass(t){const u=clamp((t-4.5)/3.75),f=900/(3.8-3*u);return{x:540+(2.4-3.6*u)*f,w:.74*f,u};}
function zoomLayer(b,img,z,cx=VP[0],cy=VP[1]){b.save();b.translate(cx,cy);b.scale(z,z);b.translate(-cx,-cy);b.drawImage(img,0,0,W,H);b.restore();}
function approachScene(b,t){const s=t-SH0,p=cedarPass(t).u;
 // A shared transform keeps the gate feet, paving and cast shadows registered throughout the shot.
 b.save();b.translate(-34*p,0);zoomLayer(b,approachGround,1+s*.027);zoomLayer(b,approachMid,1+s*.045);zoomLayer(b,toriiTop,1+s*.027);b.restore();
 b.save();b.translate(-125*p,0);zoomLayer(b,approachNear,1+s*.07,540,960);b.restore();
}
function courtyardScene(b,t){const s=Math.max(0,t-6.5),z=1+s*.013;
 // A straight, slow approach keeps the facade centred and its roof silhouette readable.
 zoomLayer(b,hallBack,1.25+s*.006,540,1100);zoomLayer(b,hallPaint,z,540,1180);zoomLayer(b,hallNear,1.02+s*.015,540,1100);
}
function shrineShot2D(b,t){
 const {x,w}=cedarPass(t);
 if(x-w*.5>W){approachScene(b,t);return;}
 if(x+w*.5<0){courtyardScene(b,t);return;}
 approachScene(b,t);
 b.save();b.beginPath();b.rect(x,0,W+100-x,H);b.clip();courtyardScene(b,t);b.restore();
 b.drawImage(cedarOccluder,x-w*.5,-40,w,H+80);
}

// Painterly tree groups: coherent crowns, receding scale and patches of warm light.
function blendTone(a,c,k){const rgb=x=>[1,3,5].map(i=>parseInt(x.slice(i,i+2),16));const p=rgb(a),q=rgb(c);return '#'+p.map((v,i)=>Math.round(v+(q[i]-v)*k).toString(16).padStart(2,'0')).join('');}
function treeCrown(b,x,y,h,w,seed,colors,conifer=false){
 b.save();b.translate(x,y);
 if(conifer){
  b.strokeStyle=colors[0];b.lineWidth=Math.max(1,h*.022);b.beginPath();b.moveTo(0,0);b.lineTo(h*.035,-h);b.stroke();
  for(let j=0;j<11;j++){const u=j/11,yy=-h+h*u*.9,ww=w*(.12+u*.7)*(.55+rnd(j,seed)*.55);b.fillStyle=j%3===0?colors[1]:colors[0];
   poly(b,[[-ww*.75,yy+h*.12],[-ww*.4,yy+h*.04],[h*.035,yy-h*.06],[ww,yy+h*.09],[ww*.28,yy+h*.12]],b.fillStyle);}
 }else{
  const pts=[];for(let j=0;j<29;j++){const a=j/29*TAU,r=.7+rnd(j,seed)*.3;pts.push([Math.cos(a)*w*r, -h*.5+Math.sin(a)*h*.48*r]);}
  b.fillStyle=colors[1];b.beginPath();b.moveTo(...pts[0]);for(let j=1;j<=pts.length;j++){const a=pts[j%pts.length],n=pts[(j+1)%pts.length];b.quadraticCurveTo(a[0],a[1],(a[0]+n[0])/2,(a[1]+n[1])/2);}b.closePath();b.fill();b.clip();
  const sh=b.createLinearGradient(0,-h,0,0);sh.addColorStop(0,colors[2]);sh.addColorStop(.45,colors[1]);sh.addColorStop(1,colors[0]);b.fillStyle=sh;b.fillRect(-w,-h,w*2,h);
  for(let j=0;j<32;j++){
   const xx=(rnd(j,seed+1)-.5)*w*2,yy=-h*rnd(j,seed+2),ww=w*(.08+rnd(j,seed+3)*.18),hh=h*(.03+rnd(j,seed+4)*.05);
   b.globalAlpha=.18+rnd(j,seed+5)*.22;b.fillStyle=j%3?colors[2]:colors[0];b.beginPath();b.ellipse(xx,yy,ww,hh,(rnd(j,seed+6)-.5)*.6,0,TAU);b.fill();
  }
 }
 b.restore();
}
function woodlandRidge(b,p,seed,pal,scale=1){
 const top=Math.min(...p.map(v=>v[1]));
 b.save();smoothRidge(b,p);b.clip();grad(b,-100,top-80,W+200,H-top+220,[[0,pal[2]],[.5,pal[1]],[1,pal[0]]]);
 // Soft overlapping areas read as folds in the wooded hillside, not bands.
 for(let i=0;i<13;i++){const x=-100+rnd(i,seed+4)*1280,y=contourY(p,x)+100+rnd(i,seed+5)*600;glow(b,x,y,100+rnd(i,seed+6)*180,220,[24,30,27],scale<.6?.045:.08);}b.restore();
 const trees=[],count=Math.round(1600/Math.sqrt(scale));
 for(let i=0;i<count;i++){
  const x=-90+rnd(i,seed+10)*1260,y=top+15+rnd(i,seed+11)*(H-top+180);if(x<p[0][0]||x>p.at(-1)[0]||y<contourY(p,x)+5)continue;
  const depth=clamp((y-top)/(H-top+180)),h=(20+depth*55)*(.6+rnd(i,seed+12)*.8)*scale;
  const patch=Math.sin(x*.009+y*.004)+Math.cos(y*.01-x*.004),ci=patch>.25?2:1;
  trees.push({x,y,h,w:h*(.4+rnd(i,seed+13)*.38),i,ci,patch});
 }
 trees.sort((a,c)=>a.y-c.y).forEach(v=>{
  const evergreen=rnd(v.i,seed+14)<.13;
  let colors;
  if(seed===431||seed===441){
   const palettes=[['#542d32','#9e3738','#dc6550'],['#692831','#bf4237','#f1844e'],['#243e36','#42604b','#73865c'],['#815031','#c4803b','#edb85f']];
   colors=palettes[evergreen?2:v.patch<-.5?0:v.patch>.7?3:1];
  }else{
   const base=blendTone(pal[v.ci],pal[1],.5);colors=[blendTone(base,pal[0],.3),base,blendTone(base,pal.at(-1),.22)];
  }
  treeCrown(b,v.x,v.y,v.h,v.w,seed+v.i*7,colors,evergreen);
 });
}
// ---- 缆车（重画）：缆车沿索道往右上方爬，镜头跟着往上；脚下是红叶的陡坡，远处是晴空下渐淡的越后平原 ----
const AS0=11.4,AS1=14.6;
function asFarSky(b){
  grad(b,0,0,W,H,[[0,'#397fa8'],[.28,'#8fc6db'],[.43,'#d8e8da'],[1,'#92a573']]);
  softCloud(b,825,360,580,38,401,.16);softCloud(b,210,500,410,24,405,.11);
}
function asFarBody(b){
  // Clear autumn air: small distant fields, foothills, then the close forest.
  b.fillStyle='#95b6c6';smoothRidge(b,[[-80,786],[50,765],[170,724],[240,745],[360,697],[450,736],[550,716],[680,755],[780,716],[900,738],[1000,695],[1160,753]]);b.fill();
  b.fillStyle='#7fa3b0';smoothRidge(b,[[-80,817],[100,792],[220,788],[340,756],[460,782],[590,772],[720,802],[860,764],[1010,784],[1160,771]]);b.fill();
  grad(b,0,817,W,H-817,[[0,'#c0cba3'],[.30,'#b8bd7f'],[1,'#7f9860']]);
  const P=(x,z)=>[510+(x+z*.10)*1100/(z+36),790+10000/(z+36)];
  const tones=['#bdb783','#b4b681','#c5bb89','#aeb27e','#c2b98b','#b9bd8b','#bab380'];
  for(let row=110;row>=0;row--){
    const z=row*2.8;
    for(let col=-100;col<100;col++){
      const x=col*1.25+(Math.floor(row/4)%3)*.11,idx=row*211+col+100,gap=.035;
      const corners=[P(x+gap,z+gap),P(x+1.20,z+gap),P(x+1.20,z+2.66),P(x+gap,z+2.66)];
      if(corners.every(v=>v[0]<-60)||corners.every(v=>v[0]>1140))continue;
      // Atmospheric perspective comes from the colors, not a veil over the image.
      const distance=clamp(row/110),color=blendTone(tones[Math.floor(rnd(idx,4501)*tones.length)],'#c6d5bc',.25+distance*.62);
      poly(b,corners,color);
    }
  }
  for(const x of [-20,-3,18,37]){
    b.strokeStyle='#d4cba5';b.lineWidth=1.3;b.beginPath();for(let j=0;j<72;j++){const z=j*4;b[j?'lineTo':'moveTo'](...P(x,z));}b.stroke();
  }
  for(const z of [8,28,61,105]){b.strokeStyle='rgba(228,215,170,.7)';b.lineWidth=1;b.beginPath();b.moveTo(...P(-150,z));b.lineTo(...P(150,z));b.stroke();}
  const river=[];for(let i=0;i<100;i++){const z=300-i*3;river.push(P(32+Math.sin(z*.035)*4,z));}
  b.strokeStyle='#7daba7';b.lineWidth=4;b.lineJoin='round';b.beginPath();river.forEach((v,i)=>b[i?'lineTo':'moveTo'](...v));b.stroke();
  b.strokeStyle='#c4d8bf';b.lineWidth=1.2;b.stroke();
  for(const [cx,cz,seed] of [[5,7,4601],[-10,27,4701],[13,52,4801],[35,95,4901],[-25,140,5001]]){
    for(let i=0;i<65;i++){
      const x=cx+(rnd(i,seed)-.5)*9,z=cz+(rnd(i,seed+1)-.5)*7,[xx,yy]=P(x,z),scale=1100/(z+36),w=scale*(.12+rnd(i,seed+2)*.12),h=w*.5;
      b.fillStyle=i%4?'#d3d0b5':'#e0d9bc';b.fillRect(xx-w/2,yy-h,w,h);
      poly(b,[[xx-w*.6,yy-h],[xx-w*.15,yy-h*1.6],[xx+w*.55,yy-h*1.2],[xx+w*.5,yy-h*.6]],i%3?'#7c9186':'#9c9981');
    }
  }
  // Low wooded folds bridge the scale between the distant plain and the close slope.
  woodlandRidge(b,[[-80,1250],[100,1210],[280,1230],[440,1170],[570,1140],[700,1080],[820,1100],[960,1045],[1160,1020]],453,['#638878','#7f9872','#a7b186','#c8c592'],.70);
  woodlandRidge(b,[[-80,1560],[100,1510],[300,1540],[490,1460],[660,1420],[800,1300],[960,1200],[1160,1170]],457,['#476d59','#66835a','#91a366','#bab87e'],.85);
}
const asFar=layer(b=>{asFarSky(b);asFarBody(b);});
const asFarLand=layer(asFarBody),asFarSkyL=layer(asFarSky);   // v14：缆车镜头拆成天空和下面的景（换景时天空不动）
const asSlope=[[-80,640],[90,720],[210,820],[330,940],[450,1070],[560,1200],[680,1360],[800,1520],[960,1720],[1160,1900]];
const asCable=x=>1180-x*.57;
const towerX=410,towerCableY=asCable(towerX);
const asMid=layer(b=>{
 woodlandRidge(b,asSlope,431,['#382f30','#823b32','#b8583a','#e6a264'],1.2);
 const tx=towerX,top=towerCableY+18,foot=1120;
 b.strokeStyle='#5c665d';b.lineWidth=5;b.beginPath();b.moveTo(tx-28,foot);b.lineTo(tx-6,top);b.moveTo(tx+28,foot);b.lineTo(tx+6,top);
 for(let k=0;k<5;k++){const u=k/5,yy=top+(foot-top)*u,w=6+22*u;b.moveTo(tx-w,yy);b.lineTo(tx+w+4,yy+(foot-top)/5);}b.stroke();
 b.strokeStyle='#667169';b.lineWidth=8;b.beginPath();b.moveTo(tx-39,asCable(tx-39)+18);b.lineTo(tx+39,asCable(tx+39)+18);b.stroke();
 for(const dx of [-28,-14,0,14,28]){b.fillStyle='#38483f';b.beginPath();b.arc(tx+dx,asCable(tx+dx)+6,6,0,TAU);b.fill();b.fillStyle='#aeb3a0';b.beginPath();b.arc(tx+dx,asCable(tx+dx)+6,2,0,TAU);b.fill();}
});
const asNear=layer(b=>{
 woodlandRidge(b,[[410,1990],[570,1580],[660,1390],[745,1240],[810,1110],[907,1044],[980,965],[1160,923]],441,['#292e2c','#70302e','#ad4434','#e5864b'],1.65);
});
// ======== v3 转场二：山顶的树扫过画面，后面是海 ========
// 缆车镜头从第一帧起右边就露着一排山顶的树。车厢快到山顶时，镜头跟着往右移，这排树从右往左扫过整个画面；
// 被树挡住的那一下，天色从白天换成傍晚；树从左边出去，后面就是日本海和夕阳（另一侧的山坡上原来看不到的海）。
const WALL_W=1900;
const WALL_PAD=180;
const summitWall=null&&layer(b=>{   // v6 不用b.translate(WALL_PAD,0);
  const edge=y=>130+Math.sin(y*.006)*60+Math.sin(y*.021+1)*34+Math.sin(y*.057)*14;    // 左边缘：不是一条直线
  const edgeR=y=>WALL_W-150+Math.sin(y*.008+2)*60+Math.sin(y*.026)*30;   // 右边缘也不是直线
  b.fillStyle='#2a2a22';b.beginPath();b.moveTo(edge(0),0);for(let y=0;y<=H;y+=40)b.lineTo(edge(y),y);for(let y=H;y>=0;y-=40)b.lineTo(edgeR(y),y);b.closePath();b.fill();
  const items=[];
  for(let i=0;i<46;i++){const x=rnd(i,731)*(WALL_W-200)+60,base=H+40-rnd(i,732)*260,h=900+rnd(i,733)*1100,ev=rnd(i,734)<.35;
    if(x<edge(base-h*.5)-60)continue;
    items.push([base-4000,()=>{shrineTrunk(b,x,base,base-h*.2,18+rnd(i,735)*26,740+i,['#2b2620','#5a4a36','#3a3228']);
      treeCrown(b,x,base-h*.45,h*.55,ev?90+rnd(i,736)*50:140+rnd(i,736)*90,760+i,ev?['#1f3326','#2e4a34','#4d6a46']:[['#5e2a1e','#9c4a2a','#cf7a3e'],['#6e5226','#a8823c','#d8b05a'],['#4e3a22','#80603a','#b08a52']][i%3],ev);}]);}
  const P3=[['#5e2a1e','#9c4a2a','#cf7a3e'],['#6e5226','#a8823c','#d8b05a'],['#33402a','#55603a','#7f8a52'],['#6a2e24','#b25234','#e08c4a'],['#584020','#8e6a34','#c49c50']];
  for(let i=0;i<320;i++){const y=rnd(i,741)*(H+100)-50,x=edge(y)-110+rnd(i,742)*(edgeR(y)-edge(y)+200),w=50+rnd(i,743)*100;items.push([y+w,()=>treeCrown(b,x,y+w*.9,w*1.5,w,800+i,P3[Math.floor(rnd(i,744)*5)])]);}   // 一团团小一点的树冠叠起来，像近处的树叶
  for(let i=0;i<60;i++){const y=rnd(i,745)*H,x=edge(y)+rnd(i,746)*(WALL_W-60);b.save();items.push([y+2000,()=>{maple(b,x,y,14+rnd(i,747)*16,rnd(i,748)*TAU,reds[i%reds.length]);}]);b.restore();}   // 几片单独的红叶
  items.sort((p,q)=>p[0]-q[0]).forEach(([,f])=>f());
},WALL_W+WALL_PAD*2,H,1);
const summitWallWarm=null&&layer(b=>{b.drawImage(summitWall,0,0,WALL_W+WALL_PAD*2,H);b.globalCompositeOperation='source-atop';b.fillStyle='rgba(150,70,60,.38)';b.fillRect(0,0,WALL_W+WALL_PAD*2,H);},WALL_W+WALL_PAD*2,H,1);   // 傍晚那一侧：树也染上夕阳的颜色
function wallX(t){                                             // 树墙左边缘在画面上的位置
  const ts=AS1-.9;if(t<ts)return 1010-(t-AS0)*12;
  const x0=1010-(ts-AS0)*12;return x0-(x0+2050)*ease(clamp((t-ts)/1.7));
}
function drawWall(b,t,warm){const x=wallX(t);if(x-WALL_PAD>W||x<-WALL_W-WALL_PAD)return;b.drawImage(warm?summitWallWarm:summitWall,x-WALL_PAD,0,WALL_W+WALL_PAD*2,H);}
function ascentNew(b,t){
  // One continuous clock before AND after the reveal: no clamped/frozen preroll.
  // Track uphill with the cabin; near/far scenery has different parallax.
  const travel=(t-AS0)*155,followX=travel*.23,followY=travel*.18;
  if(!NOSKY){b.fillStyle='#426f89';b.fillRect(0,0,W,H);}
  b.drawImage(NOSKY?asFarLand:asFar,-45-followX*.15,-80+followY*.18,W+90,H+160);
  b.save();b.translate(-followX,followY);b.drawImage(asMid,-180,-80,W+360,H+160);b.restore();
  // Cable, tower and car must share the same projection. Landscape overscan
  // is baked into the common transform below, rather than moving the car alone.
  b.save();b.translate(-followX,followY);b.translate(-180,-80);b.scale((W+360)/W,(H+160)/H);b.globalAlpha=1-CAR_OFF;b.translate(0,-260*CAR_OFF*CAR_OFF);   // v16：换景前先把缆车和索道收走
  for(const [off,col,w] of [[-6,'#d6dccf',1.4],[0,'#3a4a48',3],[8,'#d6dccf',1.2]]){b.strokeStyle=col;b.lineWidth=w;b.beginPath();b.moveTo(-100,asCable(-100)+off);b.lineTo(1180,asCable(1180)+off);b.stroke();}
  const x=345+travel*.72;
  b.save();b.translate(x,asCable(x));b.scale(((H+160)/H)/((W+360)/W),1);refinedCabin(b,0,0,.94);b.restore();
  b.restore();
  b.drawImage(asNear,-180-followX*1.45,-80+followY*1.45,W+360,H+160);
  // Warm sun grazes the canopy; keep shadows cool instead of a red filter.
  glow(b,880,930,480,360,[255,183,108],.055);
  leaves(b,t);
}
// ---- 山顶看日落：抽象观景亭，镜头升起，海和夕阳在前面展开 ----
const SUN={x:785,r:40};
const duskClouds=layer(b=>{for(let i=0;i<46;i++){const y=470+rnd(i,701)*470,w=180+rnd(i,702)*520,x=rnd(i,703)*1300-110,h=3+rnd(i,704)*9;
  const warm=clamp((y-470)/470);b.fillStyle=`rgba(${255},${Math.round(150+warm*70)},${Math.round(150-warm*40)},${.12+rnd(i,705)*.22})`;b.beginPath();b.ellipse(x,y,w/2,h,-.01,0,TAU);b.fill();}});
function rimRidge(b,p,seed,colors,rim){
 const distance=seed===711?.38:seed===721?.55:seed===731?.8:1.05;
 woodlandRidge(b,p,seed,colors,distance);
 b.save();smoothRidge(b,p);b.clip();const top=Math.min(...p.map(q=>q[1]));
 const q=b.createLinearGradient(0,top,0,top+350);q.addColorStop(0,'rgba(239,166,117,.14)');q.addColorStop(1,'rgba(239,166,117,0)');b.fillStyle=q;b.fillRect(-100,top-50,1300,500);b.restore();
}
// A contemporary visit to the mountain: the sea opens beyond a modest lookout.
// A stylised composition, not an architectural reconstruction of a named deck.
function overlookHill(b,p,seed,pal){
 const top=Math.min(...p.map(v=>v[1]));
 b.save();smoothRidge(b,p);b.clip();grad(b,0,top-30,W,H-top+60,[[0,pal[2]],[.38,pal[1]],[1,pal[0]]]);
 for(let i=0;i<42;i++){
  const x=rnd(i,seed)*W,y=top+rnd(i,seed+1)*(H-top),w=90+rnd(i,seed+2)*170;
  glow(b,x,y,w,w*.65,i%3?[24,35,43]:[166,115,81],i%3?.11:.05);
 }
 for(let i=0;i<2300;i++){
  const x=rnd(i,seed+3)*W,y=top+rnd(i,seed+4)*(H-top),r=1.5+rnd(i,seed+5)*7;
  b.fillStyle=i%3?'rgba(191,153,121,.055)':'rgba(18,29,36,.07)';b.beginPath();b.ellipse(x,y,r*1.5,r,.1,0,TAU);b.fill();
 }
 b.restore();
 // Small irregular breaks along the distant canopy, without a repeated tree row.
 for(let i=0;i<160;i++){
  const x=rnd(i,seed+9)*W,y=contourY(p,x)+4,r=2+rnd(i,seed+10)*5;
  b.fillStyle=pal[2];b.globalAlpha=.3;b.beginPath();b.ellipse(x,y,r*1.4,r,0,0,TAU);b.fill();
 }b.globalAlpha=1;
}
const overlookMid=layer(b=>overlookHill(b,[[-80,1290],[120,1230],[270,1250],[470,1350],[640,1380],[800,1320],[990,1245],[1160,1190]],2401,['#253643','#3c4852','#6a6067']));
const overlookNear=layer(b=>overlookHill(b,[[-80,1510],[110,1430],[280,1475],[490,1550],[680,1510],[900,1390],[1160,1340]],2501,['#172e32','#2b4141','#50594c']));
function headland(b,hy,u){
 b.save();b.translate(0,hy-950+u*48);
 b.beginPath();b.moveTo(1160,1015);b.bezierCurveTo(1080,1018,1028,1050,990,1080);b.bezierCurveTo(954,1102,960,1120,916,1134);b.bezierCurveTo(892,1154,852,1163,828,1174);b.bezierCurveTo(910,1195,1007,1198,1160,1222);b.closePath();
 const q=b.createLinearGradient(850,1040,1150,1260);q.addColorStop(0,'#ad8b8e');q.addColorStop(1,'#766d80');b.fillStyle=q;b.fill();b.clip();
 glow(b,1000,1125,230,120,[244,182,139],.18);b.restore();
}
function overlookVisitor(b,x,y,s,pose,raising=1){
 b.save();b.translate(x,y);b.scale(s,s);b.lineCap='round';b.lineJoin='round';
 b.fillStyle='rgba(17,28,35,.18)';b.beginPath();b.ellipse(1,3,30,6,0,0,TAU);b.fill();
 // Separate trouser legs, light soles and short jackets establish present-day dress.
 b.strokeStyle=pose?'#324957':'#59605a';b.lineWidth=14;
 b.beginPath();b.moveTo(-10,-73);b.lineTo(-13,-39);b.lineTo(-15,-5);b.moveTo(10,-73);b.lineTo(13,-38);b.lineTo(20,-5);b.stroke();
 b.strokeStyle='#dad6c8';b.lineWidth=7;b.beginPath();b.moveTo(-19,-1);b.lineTo(-7,-1);b.moveTo(15,-1);b.lineTo(29,-1);b.stroke();
 const jacket=pose?'#c9bca0':'#536d76',shade=pose?'#9a947e':'#3d555f';
 b.fillStyle=jacket;b.beginPath();b.moveTo(-19,-136);b.quadraticCurveTo(0,-148,20,-135);b.lineTo(25,-78);b.quadraticCurveTo(2,-67,-23,-78);b.closePath();b.fill();
 b.strokeStyle=shade;b.lineWidth=3;b.beginPath();b.moveTo(-18,-128);b.lineTo(-18,-82);b.moveTo(19,-125);b.lineTo(21,-82);b.stroke();
 b.strokeStyle=jacket;b.lineWidth=13;
 if(pose){
  const arm=50*(1-raising);
  b.beginPath();b.moveTo(19,-130);b.lineTo(35,-105-12*raising);b.lineTo(48,-149+arm);b.moveTo(-18,-131);b.lineTo(-10,-102-9*raising);b.lineTo(38,-141+arm);b.stroke();
  b.strokeStyle='#bf9473';b.lineWidth=7;b.beginPath();b.moveTo(48,-149+arm);b.lineTo(47,-156+arm);b.moveTo(38,-141+arm);b.lineTo(43,-152+arm);b.stroke();
  b.save();b.translate(47,-162+arm);b.rotate(.13);b.fillStyle='#253740';b.fillRect(-6,-11,12,21);b.fillStyle='#68838b';b.fillRect(-4,-9,8,16);b.fillStyle='#e4c394';b.fillRect(-5,-11,1.5,20);b.restore();
 }else{
  b.beginPath();b.moveTo(-19,-131);b.lineTo(-28,-108);b.lineTo(-24,-87);b.moveTo(19,-130);b.lineTo(29,-108);b.lineTo(31,-86);b.stroke();
  b.strokeStyle='#b5967c';b.lineWidth=7;b.beginPath();b.moveTo(-24,-87);b.lineTo(-22,-82);b.moveTo(31,-86);b.lineTo(32,-81);b.stroke();
  b.strokeStyle='#313f40';b.lineWidth=5;b.beginPath();b.moveTo(-12,-135);b.quadraticCurveTo(-23,-119,-18,-93);b.moveTo(12,-135);b.quadraticCurveTo(20,-117,17,-94);b.stroke();
  b.fillStyle='#9b7953';b.beginPath();b.roundRect(-17,-131,34,44,10);b.fill();b.fillStyle='#806744';b.beginPath();b.roundRect(-13,-105,26,15,4);b.fill();b.strokeStyle='#c5a67b';b.lineWidth=2;b.beginPath();b.moveTo(-12,-127);b.quadraticCurveTo(2,-133,13,-126);b.stroke();
 }
 b.fillStyle='#b9997f';b.fillRect(-6,-148,12,10);b.beginPath();b.ellipse(0,-157,12,15,0,0,TAU);b.fill();
 b.fillStyle=pose?'#9e5c40':'#263439';b.beginPath();b.ellipse(-1,-163,13,11,0,Math.PI,TAU);b.lineTo(12,-155);b.quadraticCurveTo(1,-160,-13,-153);b.closePath();b.fill();
 if(pose){b.strokeStyle='#c98655';b.lineWidth=4;b.beginPath();b.moveTo(-12,-157);b.quadraticCurveTo(1,-160,12,-156);b.stroke();}
 b.strokeStyle='rgba(255,207,145,.65)';b.lineWidth=2;b.beginPath();b.moveTo(9,-169);b.quadraticCurveTo(15,-162,12,-150);b.moveTo(20,-132);b.lineTo(25,-113);b.stroke();
 b.restore();
}
function lookoutDeck(b,u,hy){
 // An abstract open pavilion, based on the slim framed lookout photographed at the summit park.
 const camY=4+2.1*u,camZ=-8+1.5*u,F=1250;
 const P=(x,y,z)=>[540+(x+.8-.30*u)*F/(z-camZ),hy-(y-camY)*F/(z-camZ)];
 const face=(points,c)=>poly(b,points.map(p=>P(...p)),c);
 const beam=(a,c,width,col)=>{const m=(a[2]+c[2])/2;b.strokeStyle=col;b.lineWidth=Math.max(1,width*F/(m-camZ));b.lineCap='butt';b.beginPath();b.moveTo(...P(...a));b.lineTo(...P(...c));b.stroke();};
 b.save();
 // A modest terrace sunk into the slope, with an exposed front edge and grounded posts.
 const ground=[[-8.5,0,-5],[.4,0,-5],[1.3,0,12],[-7.2,0,12]];
 face(ground,'#96968a');b.save();poly(b,ground.map(p=>P(...p)),'#96968a');b.clip();
 grad(b,0,hy+200,W,H,[[0,'#b9ac92'],[.5,'#95998c'],[1,'#657b76']]);
 for(let x=-9;x<3;x+=1.5)beam([x,.003,-5],[x,.003,12],.012,'rgba(61,75,70,.22)');
 for(let z=-5;z<12;z+=1.5)beam([-9,.003,z],[3,.003,z],.012,'rgba(61,75,70,.18)');
 face([[-5.5,.005,10.8],[-1.2,.005,10.8],[-3.1,.005,3.3],[-7.5,.005,3.3]],'rgba(39,54,59,.17)');
 for(let x=-5.6;x<=-1.1;x+=.55)beam([x,.008,10.8],[x-1.5,.008,3.3],.08,'rgba(40,56,60,.14)');
 b.restore();
 // Quiet perimeter handrail and the same present-day visitors.
 for(let x=-7.1;x<=1.31;x+=1.2)beam([x,0,12],[x,1.03,12],.045,'#637779');
 beam([-7.2,1.03,12],[1.3,1.03,12],.065,'#d0c7ad');beam([-7.2,.48,12],[1.3,.48,12],.02,'#778987');
 for(let z=-4.5;z<12;z+=1.4){const x=.4+(z+5)*.9/17;beam([x,0,z],[x,1.03,z],.04,'#637779');}
 beam([.4,1.03,-5],[1.3,1.03,12],.055,'#c4c7b3');beam([.4,.48,-5],[1.3,.48,12],.018,'#778987');
 // Back posts first. Plain supports and open roof avoid a temple-like silhouette.
 const posts=[[-5.6,10.4],[-1.2,10.4],[-5.6,5.2],[-1.2,5.2]];
 for(const [x,z]of posts.slice(0,2)){
   face([[x-.16,0,z-.16],[x+.16,0,z-.16],[x+.16,.13,z+.16],[x-.16,.13,z+.16]],'#6c7970');
   beam([x,.1,z],[x,3.25,z],.12,'#74776b');beam([x+.04,.13,z],[x+.04,3.25,z],.025,'#d9bc86');
 }
 // Two simple benches beneath the frame.
 for(const z of [6.2,9.2]){
   for(const x of [-4.9,-2.5]){beam([x,0,z],[x,.47,z],.1,'#4e6261');beam([x,0,z+.43],[x,.47,z+.43],.1,'#4e6261');}
   face([[-5.15,.48,z-.05],[-2.25,.48,z-.05],[-2.25,.48,z+.5],[-5.15,.48,z+.5]],'#b39b72');
   beam([-5.15,.45,z-.05],[-2.25,.45,z-.05],.07,'#786b52');
 }
 for(const [x,z,pose]of [[-.4,10.6,0],[.65,9.1,1]]){const [xx,yy]=P(x,0,z);overlookVisitor(b,xx,yy,F/(z-camZ)/100,pose,ease(clamp(u/.25)));}
 for(const [x,z]of posts.slice(2)){
   face([[x-.16,0,z-.16],[x+.16,0,z-.16],[x+.16,.13,z+.16],[x-.16,.13,z+.16]],'#6c7970');
   beam([x,.1,z],[x,3.25,z],.13,'#72766b');beam([x+.045,.13,z],[x+.045,3.25,z],.025,'#dfc28c');
 }
 // Rectangular roof rim, open slats and small diagonal braces: a light, abstract pavilion.
 for(const z of [5,10.6]){
   beam([-5.85,3.25,z],[-.95,3.25,z],.18,'#555f59');beam([-5.85,3.34,z],[-.95,3.34,z],.035,'#ddbc83');
 }
 for(const x of [-5.7,-1.1])beam([x,3.25,4.9],[x,3.25,10.7],.16,'#797d6c');
 for(let x=-5.7;x<=-1.05;x+=.48){
   face([[x,3.34,4.85],[x+.15,3.34,4.85],[x+.15,3.34,10.75],[x,3.34,10.75]],'#a99b7c');
   beam([x,3.34,4.85],[x,3.34,10.75],.025,'#ecd0a0');
 }
 for(const [x,z]of posts){const dir=x<-3?1:-1;beam([x,2.6,z],[x+dir*.65,3.2,z],.075,'#8a8b74');beam([x,2.7,z],[x,3.2,z+(z<8?.7:-.7)],.07,'#8a8b74');}
 b.restore();
}
const lookoutAutumn=layer(b=>{
 const p=[[530,2050],[670,1870],[820,1700],[980,1540],[1160,1490]];
 overlookHill(b,p,2701,['#203b38','#3f5245','#6c694b']);
 const trees=[];for(let i=0;i<220;i++){const x=650+rnd(i,2702)*530,y=1540+rnd(i,2703)*470;if(y<contourY(p,x)+24)continue;trees.push({x,y,i});}
 trees.sort((a,c)=>a.y-c.y).forEach(({x,y,i})=>{const h=28+rnd(i,2704)*65;treeCrown(b,x,y,h,h*(.45+rnd(i,2705)*.25),2800+i*7,i%4===0?['#314b3c','#526042','#7a7950']:i%3===0?['#71513c','#987044','#b4965e']:['#5d4a38','#82623d','#a58247'],i%11===0);});
});
const sunsetScenicRidge=layer(b=>{
 const p=[[-100,1540],[55,1480],[165,1495],[290,1550],[420,1660],[555,1700],[690,1665],[825,1585],[960,1515],[1160,1550]];
 overlookHill(b,p,6101,['#24323a','#39464b','#635e60']);
 // Just a small suggestion of the summit lookout, embedded in the ridge rather than a foreground plaza.
 poly(b,[[105,1531],[250,1531],[268,1543],[92,1543]],'#7e8070');
 poly(b,[[92,1543],[268,1543],[265,1550],[99,1550]],'#4f5e55');
 for(const [x,y]of [[124,1526],[228,1526],[112,1540],[243,1540]]){b.fillStyle='#53615a';b.fillRect(x,y-61,3.5,62);b.fillStyle='#c3b18a';b.fillRect(x+2,y-61,1,61);}
 poly(b,[[105,1478],[246,1478],[231,1455],[119,1455]],'#707a6a');
 for(let x=119;x<232;x+=12){lineRidge(x,1456,105+(x-119)*141/112,1478,'#b5a686',2);}
 lineRidge(105,1478,246,1478,'#a89b7c',3);
 lineRidge(119,1455,231,1455,'#c6af83',2);
 poly(b,[[140,1521],[213,1521],[207,1517],[144,1517]],'#a19372');
 for(const x of [148,201])lineRidge(x,1521,x,1531,'#4e5b50',2);
 function lineRidge(x,y,xx,yy,c,w){b.strokeStyle=c;b.lineWidth=w;b.beginPath();b.moveTo(x,y);b.lineTo(xx,yy);b.stroke();}
 // An irregular foreground rim frames the wide sea without competing with it.
 const trees=[];for(let i=0;i<180;i++){const x=rnd(i,6201)*W,y=1550+rnd(i,6202)*430;if(y<contourY(p,x)+36)continue;trees.push({x,y,i});}
 trees.sort((a,c)=>a.y-c.y).forEach(({x,y,i})=>{const h=18+rnd(i,6203)*42;treeCrown(b,x,y,h,h*.65,6301+i,['#28383b','#3c4943','#5b584b'],i%7===0);});
});
const sunsetHorizonClouds=layer(b=>{
 b.save();b.filter='blur(9px)';
 for(let i=0;i<16;i++){const xx=-70+i*84,yy=80-7-rnd(i,6701)*18;b.fillStyle=`rgba(109,105,129,${.08+rnd(i,6702)*.10})`;b.beginPath();b.ellipse(xx,yy,74+rnd(i,6703)*70,9+rnd(i,6704)*12,0,0,TAU);b.fill();}b.restore();
},W,160,1);
// ---- Claude v2 结尾：山顶往下看，红叶山坡一路落到海边，弯弯的海岸线和沿岸的小镇，太阳沉进日本海，镇上的灯一盏盏亮起来 ----
const COAST=[[-80,1340],[120,1326],[300,1298],[470,1276],[620,1266],[760,1256],[900,1232],[1040,1204],[1160,1190]];
const coastLand=layer(b=>{
  woodlandRidge(b,COAST.map(([x,y])=>[x,y+40]),2741,['#2a2830','#3e3438','#5e4038','#7a5440'],.42);
  smoothRidge(b,COAST);b.save();b.clip();grad(b,-100,1150,1300,90,[[0,'#6a6066'],[1,'rgba(74,66,72,0)']]);b.restore();
  b.strokeStyle='rgba(255,226,196,.75)';b.lineWidth=3;b.beginPath();COAST.forEach(([x,y],i)=>b[i?'lineTo':'moveTo'](x,y+2));b.stroke();          // 浪花
  b.strokeStyle='rgba(214,186,160,.55)';b.lineWidth=7;b.beginPath();COAST.forEach(([x,y],i)=>b[i?'lineTo':'moveTo'](x,y+9));b.stroke();          // 沙滩
  for(let i=0;i<160;i++){const x=rnd(i,2701)*1180-60,y=contourY(COAST,x)+16+rnd(i,2702)*34;b.fillStyle=['#6e6266','#5a5258','#7a6a68'][i%3];b.fillRect(x,y,4+rnd(i,2703)*7,3+rnd(i,2704)*3);}   // 沿岸的房子
});
const coastLights=Array.from({length:120},(_,i)=>{const x=rnd(i,2711)*1180-60;return {x,y:contourY(COAST,x)+18+rnd(i,2712)*32,on:rnd(i,2713),s:1.6+rnd(i,2714)*1.6};});
const dusk=['#232c37','#51303c','#993e39','#cb6944','#e8a565'];
const slopeMidV2=layer(b=>woodlandRidge(b,[[-80,1420],[120,1395],[300,1420],[480,1380],[640,1400],[820,1350],[1000,1300],[1160,1280]],2721,dusk,.7));
const slopeNearV2=layer(b=>woodlandRidge(b,[[-80,1680],[140,1620],[320,1650],[520,1600],[720,1630],[900,1570],[1160,1550]],2731,dusk,1.15));
function sunsetLandV2(b,t,u,lift,hy){
  const base=hy-930;
  b.drawImage(coastLand,0,base+20*lift,W,H);
  for(const l of coastLights){const a=clamp((u-.35-l.on*.5)/.15);if(a<=0)continue;const x=l.x,y=l.y+base+20*lift;glow(b,x,y,14,10,[255,200,130],.5*a);b.fillStyle=`rgba(255,226,170,${a})`;b.fillRect(x-l.s/2,y-l.s/2,l.s,l.s);}
  b.drawImage(slopeMidV2,-8*u,base+260*lift,W,H);
  b.drawImage(slopeNearV2,-20*u,base+620*lift,W,H);
}
function sunsetShot(b,t,Tp){
 const u=clamp((t-14.6)/10.6),lift=u*.85+.15*u*u,hy=930-100*lift,Tq=Tp??(13.0+(t-14.6)*4/10.6),S=sunScreen(Tq),sunX=S[0],sunY=S[1]+(hy-930)+sunDrop(Tq);CLOUD_OFF=easeIn(clamp((Tq-16.7)/.3));   // 镜头往下压时，太阳跟着天一起移
 if(!NOSKY)sunsetSky(b,u,hy,sunX,sunY);CLOUD_OFF=0;
 // 佐渡岛：在太阳右边（西北）的海平线上，远、发灰。北边高一点的大佐渡山脊，中间一段平原，南边低一点的小佐渡
 b.fillStyle=blendTone('#8a7f98','#776f8c',u);b.globalAlpha=.62;b.beginPath();b.moveTo(842,hy+1);
 for(let x=842;x<=1090;x+=4){const k=(x-842)/248,big=Math.max(0,1-Math.abs(k-.78)/.24),small=Math.max(0,1-Math.abs(k-.2)/.17);b.lineTo(x,hy-1-26*Math.pow(big,.7)-12*Math.pow(small,.8)-2.5*Math.sin(x*.21)*(big+small)-1.5);}
 b.lineTo(1090,hy+1);b.closePath();b.fill();b.globalAlpha=1;
 const sea=b.createLinearGradient(0,hy,0,H);sea.addColorStop(0,blendTone('#e2b48e','#d6a488',u));sea.addColorStop(.22,blendTone('#8f8ca8','#85809e',u));sea.addColorStop(.6,'#5e7090');sea.addColorStop(1,blendTone('#33506c','#2c4562',u));b.fillStyle=sea;b.fillRect(0,hy,W,H-hy);
 b.save();b.beginPath();b.rect(0,hy,W,H-hy);b.clip();
 glow(b,sunX,hy+250,180,570,[248,191,128],.23);
 // A soft reflection broken into water-sized ripples, not white confetti.
 for(let i=0;i<700;i++){
  const v=rnd(i,2601),yy=hy+3+v*(H-hy),ww=3+v*28,xx=rnd(i,2602)*W+Math.sin(t*.28+i)*2;
  b.fillStyle=i%3?'rgba(231,197,172,.10)':'rgba(62,90,118,.08)';b.fillRect(xx,yy,ww,.5+v*1.2);
 }
 // v15：海面有浪——远处细密、近处宽长，每道浪上沿映天光、下沿暗；慢慢往岸边推
 for(let i=0;i<190;i++){const v=Math.pow(i/190,1.7),yy=hy+3+v*(H-hy),n=5+Math.round(v*4);
  for(let j=0;j<n;j++){const id=i*9+j,len=8+v*110+rnd(id,2621)*v*60,xx=fract(rnd(id,2622)+t*.004*(1+v))*(W+200)-100+Math.sin(t*.6+id)*2*(1+v*3),th=.5+v*2.4;
   b.fillStyle=`rgba(255,226,190,${(.1+.14*(1-v))*(.6+.4*rnd(id,2623))})`;b.fillRect(xx,yy,len,th);
   b.fillStyle=`rgba(24,38,64,${.12+.16*v})`;b.fillRect(xx+len*.1,yy+th+.5+v*2,len*.85,th*1.3);}}
 for(let i=0;i<220;i++){
  const v=i/220,yy=hy+4+v*(H-hy),spread=10+v*v*180,phase=Math.sin(i*2.31+t*.55),xx=sunX+phase*spread*.5;
  const tw=.55+.45*Math.sin(t*5+i*1.7);b.fillStyle=`rgba(255,224,172,${(.35+.42*rnd(i,2612))*(1-v*.62)*tw})`;b.fillRect(xx-(7+v*40)/2,yy,7+v*40,1+v*1.5);   // 太阳的倒影碎成一闪一闪的光
 }
 b.restore();
 // Low mountain silhouettes, open sea and a continuous rise following the scenic reference.
 sunsetLandV2(b,t,u,lift,hy);
}

// ======== v4 开场：弥彦全景（封面）========
// 从上到下：秋天的弥彦山（山顶的展望塔、山坡上一条缆车索道）→ 山脚一片深色杉林（彌彦神社，林边一座小小的朱红鸟居）
// → 左边弥彦公园红叶谷的一片红、一座小红桥 → 右边温泉街的屋顶 → 最下面收割过的稻田。镜头慢慢往前，最后朝鸟居推进去，接参道上的鸟居
// v5 全景：站得更远——大片天空，横着一道弥彦山的山脊（右边高的是弥彦山，有展望塔；左边是多宝山），山脚一小片深色杉林和一座小鸟居，
// 左边一点红是红叶谷，右边是温泉街，前面是一大片收割过的越后平原（田块、田埂、河、一丛丛的村子和树）。东西都画小、画多，远处蒙一层空气
const PANO_T=[548,1206],PANO_TS=.034;
// 白天的枫树冠：和夜景同一种一片片枫叶的画法，但底色是红的、叶子更亮（被阳光照着）
function dayCrown(b,x,y,rx,ry,seed,n=700){
 const lobes=Array.from({length:13},(_,j)=>{let a=rnd(j,seed+1)*TAU,r=Math.sqrt(rnd(j,seed+2));return [x+Math.cos(a)*rx*r*.78,y+Math.sin(a)*ry*r*.75,rx*(.18+rnd(j,seed+3)*.2),ry*(.2+rnd(j,seed+4)*.2)];});
 b.fillStyle='#8a2c24';lobes.forEach(([xx,yy,ww,hh],j)=>{b.beginPath();for(let k=0;k<36;k++){let a=k/36*TAU,r=.72+rnd(k,seed+j)*.28;b[k?'lineTo':'moveTo'](xx+Math.cos(a)*ww*r,yy+Math.sin(a)*hh*r);}b.closePath();b.fill();});
 const pal=['#9c2932','#ba3933','#d95135','#ed7740','#f4924a','#ffac59','#f6c56a'];
 for(let j=0;j<n*1.7;j++){const l=lobes[j%13],a=rnd(j+seed,2)*TAU,r=Math.sqrt(rnd(j+seed,3)),xx=l[0]+Math.cos(a)*l[2]*r,yy=l[1]+Math.sin(a)*l[3]*r;
  const v=clamp(.15+rnd(j+seed,6)*.6-(yy-y)/ry*.22);b.globalAlpha=.7+rnd(j+seed,4)*.3;maple(b,xx,yy,3+rnd(j+seed,5)*5,a,pal[Math.min(6,Math.floor(v*7))]);}b.globalAlpha=1;
}
const panoLayer=null&&layer(b=>{   // v6 不用全景（不预先画）
  grad(b,0,0,W,1180,[[0,'#2c6b99'],[.45,'#7fb3cf'],[.82,'#cfe0dd'],[1,'#ece7d6']]);
  softCloud(b,760,250,620,30,1411,.16);softCloud(b,260,380,460,22,1413,.12);softCloud(b,880,520,420,16,1415,.10);softCloud(b,180,600,380,14,1417,.08);
  b.save();b.translate(0,200);   // 山、山脚、平原整体往下放 200，近处留给红叶
  b.fillStyle='#b4c8cc';smoothRidge(b,[[-80,900],[90,880],[230,895],[380,870],[540,888],[700,872],[860,860],[1000,878],[1160,866]]);b.fill();   // 远山
  // 弥彦山一带的山脊：左边多宝山，右边弥彦山
  const M=[[-80,960],[20,900],[110,840],[190,790],[260,760],[330,745],[400,752],[460,770],[520,762],[580,730],[640,690],[690,660],[730,648],[770,652],[820,672],[880,712],[950,760],[1020,810],[1100,860],[1160,890]];
  b.save();smoothRidge(b,M);b.clip();grad(b,0,640,W,420,[[0,'#7a6448'],[1,'#4a4632']]);b.restore();
  {const pals=[['#6a5238','#937046','#b58e58'],['#724833','#a2663c','#c88c4e'],['#45563c','#667046','#8c935c'],['#7a6038','#ab8848','#ceac66'],['#70301f','#a84a2c','#d27a40'],['#5c3c24','#8e5c32','#ba844c']];
   const tr=[];for(let i=0;i<9000;i++){const x=-80+rnd(i,1421)*1240,top=contourY(M,x),y=top+3+Math.pow(rnd(i,1422),1.1)*(1075-top);if(y>1070)continue;
     const h=(5+(y-640)/430*9)*(.7+rnd(i,1423)*.6),patch=Math.sin(x*.016+y*.01)+Math.cos(y*.019-x*.007),ev=rnd(i,1424)<.12;
     tr.push([y,x,h,ev?2:patch>.7?4:patch<-.7?0:patch>.1?1:patch<-.3?5:3,ev,i]);}
   tr.sort((p,q)=>p[0]-q[0]).forEach(([y,x,h,pi,ev,i])=>treeCrown(b,x,y,h,h*(ev?.3:.6),1500+i,pals[pi],ev));}
  b.save();smoothRidge(b,M);b.clip();
  b.globalCompositeOperation='multiply';grad(b,0,640,W,440,[[0,'rgba(170,165,180,.55)'],[1,'rgba(190,180,170,.25)']]);b.globalCompositeOperation='source-over';
  for(let i=0;i<16;i++){const x=30+i*70+(rnd(i,1431)-.5)*30;glow(b,x,830+rnd(i,1432)*160,22,220,[40,30,28],.12);}
  b.globalCompositeOperation='lighter';glow(b,860,760,300,260,[255,200,130],.14);b.globalCompositeOperation='source-over';
  grad(b,0,640,W,300,[[0,'rgba(220,232,236,.38)'],[1,'rgba(220,232,236,0)']]);b.restore();
  b.strokeStyle='#f2f3ea';b.lineWidth=2;b.beginPath();b.moveTo(752,652);b.lineTo(752,610);b.stroke();b.fillStyle='#f4f5ee';b.fillRect(747,610,10,6);   // 展望塔
  const L=x=>1000-(x-430)*1.0;b.strokeStyle='rgba(44,52,50,.75)';b.lineWidth=1.3;b.beginPath();b.moveTo(430,L(430));b.lineTo(722,L(722));b.stroke();   // 缆车索道
  refinedCabin(b,560,L(560)+2,.05);
  // 越后平原（长焦的样子：田块远近差不多大）：先铺田，一直铺到山脚
  const D=90,F=3000,P=(x,z)=>[540+x*F/(z+D),909+49608/(z+D)],U=z=>F/(z+D);   // 平原是山脚下窄窄的一条：近处（z=0）约在 1260（下移后 1460），z=300 在山脚
  grad(b,0,1030,W,890,[[0,'#cfc39c'],[.25,'#c8ae74'],[1,'#ad9256']]);
  const tones=['#cdb57a','#c4a86a','#d2bc84','#bca266','#c6ae72','#b4a874','#9e8a5a','#c9b47e'];
  for(let r=0;r<75;r++){const z0=r*4,z1=z0+3.9;for(let c=-26;c<=26;c++){const x0=c*2.2+((r*7)%5)*.25,x1=x0+2.12,q=[P(x0,z1),P(x1,z1),P(x1,z0),P(x0,z0)];if(q.every(v=>v[0]<-30)||q.every(v=>v[0]>1110))continue;
    const col=blendTone(tones[Math.floor(rnd(r*61+c,1471)*tones.length)],'#d6d8c8',clamp(z0/300)*.5);poly(b,q,col);
    b.strokeStyle=blendTone(col,'#6a5434',.22);b.lineWidth=.7;for(let k=1;k<4;k++){const zz=z0+k*.97;b.beginPath();b.moveTo(...P(x0+.05,zz));b.lineTo(...P(x1-.05,zz));b.stroke();}}}   // 每块田里几道割过的稻茬
  for(let i=0;i<5000;i++){const z=rnd(i,1541)*300,x=(rnd(i,1542)-.5)*60,[px,py]=P(x,z),u=U(z);b.fillStyle=i%2?'rgba(110,84,46,.22)':'rgba(240,224,180,.24)';b.fillRect(px,py,u*.08+.6,.8);}   // 稻茬
  const river=[];for(let i=0;i<=150;i++){const z=300-i*2;river.push(P(-6+Math.sin(z*.025)*5+z*.02,z));}
  b.strokeStyle='#8fb0aa';b.lineWidth=2.4;b.lineJoin='round';b.beginPath();river.forEach((v,i)=>b[i?'lineTo':'moveTo'](...v));b.stroke();b.strokeStyle='rgba(222,236,228,.6)';b.lineWidth=.8;b.stroke();
  const items=[];
  for(const [z,x0,x1,seed] of [[30,-20,6,1561],[95,-4,22,1571],[160,-24,-2,1581],[220,4,20,1591]]){   // 稻架树（はさ木）：田埂上一排细高的树
    for(let x=x0;x<x1;x+=.9){const [px,py]=P(x,z),u=U(z);items.push([py,()=>{b.strokeStyle='#4a4030';b.lineWidth=Math.max(.6,u*.03);b.beginPath();b.moveTo(px,py);b.lineTo(px,py-u*.9);b.stroke();treeCrown(b,px,py-u*.45,u*.6,u*.12,seed+Math.round(x*10),[['#3a4a30','#56603a','#7a8250'],['#5a4426','#86663a','#a88a50']][Math.round(x*3)%2===0?0:1],true);}]);}}
  for(const [cx,cz,n,seed] of [[-16,12,30,1481],[18,40,34,1491],[-26,80,30,1501],[8,120,34,1511],[26,175,28,1521],[-14,210,26,1531],[14,255,24,1601]]){   // 一丛丛的村子：屋顶 + 一圈防风林
    for(let i=0;i<n;i++){const x=cx+(rnd(i,seed)-.5)*7,z=cz+(rnd(i,seed+1)-.5)*8,[px,py]=P(x,z),u=U(z);
      if(i%3===0)items.push([py,()=>treeCrown(b,px,py,u*(.7+rnd(i,seed+2)*.5),u*.38,seed+i,[['#34452e','#566240','#7e8a56'],['#6e2f22','#a4482c','#d0773e'],['#7a5a2c','#b58a3e','#d8b25a']][i%9===0?1:i%9===3?2:0])]);
      else items.push([py,()=>{const w=u*(.5+rnd(i,seed+3)*.35),h=w*.48;b.fillStyle=['#e8dfcd','#ddd3bf','#d2c9b6'][i%3];b.fillRect(px-w/2,py-h*.45,w,h*.55);poly(b,[[px-w/2-w*.06,py-h*.45],[px,py-h*1.05],[px+w/2+w*.06,py-h*.45]],['#4c4c56','#5e5048','#6a5c50','#3e4250'][i%4]);}]);}}
  items.sort((p,q)=>p[0]-q[0]).forEach(([,f])=>f());
  grad(b,0,1030,W,200,[[0,'rgba(228,232,224,.38)'],[1,'rgba(228,232,224,0)']]);   // 远处平原上一层空气
  // 山脚：彌彦神社的杉林、拜殿屋顶、左边红叶谷、右边温泉街
  const ft=[];for(let i=0;i<260;i++){const x=400+rnd(i,1441)*330,y=992+rnd(i,1442)*42+Math.abs(x-565)*.07,h=16+rnd(i,1443)*14;ft.push([y,()=>treeCrown(b,x,y,h,h*.22,1600+i,[['#132a1d','#20402c','#3c5c44'],['#17301f','#284a32','#46664a']][i%2],true)]);}
  for(let i=0;i<200;i++){const x=40+rnd(i,1451)*340,y=1000+rnd(i,1452)*50,h=10+rnd(i,1453)*9;ft.push([y,()=>treeCrown(b,x,y,h,h*.6,1700+i,[['#6e1f1c','#b23a2a','#e2683a'],['#7a3a1e','#c25a2a','#ec8a3e'],['#6a4a20','#b0802e','#e0b04a'],['#5a1a20','#962a2c','#cc4a34']][i%4])]);}
  for(let i=0;i<110;i++){const x=620+rnd(i,1461)*480,y=1012+rnd(i,1462)*38,w=7+rnd(i,1463)*8;ft.push([y,()=>{const h=w*.45;b.fillStyle=['#ece4d4','#e0d6c2','#d6cebe'][i%3];b.fillRect(x-w/2,y-h*.2,w,h*.8);poly(b,[[x-w/2-1.5,y-h*.2],[x,y-h*.8],[x+w/2+1.5,y-h*.2]],['#4c4c56','#5e5048','#3e4250','#6a5c50'][i%4]);}]);}
  for(let i=0;i<60;i++){const x=620+rnd(i,1465)*480,y=1015+rnd(i,1466)*36,h=8+rnd(i,1467)*6;ft.push([y+.5,()=>treeCrown(b,x,y,h,h*.6,1800+i,[['#6e2f22','#a4482c','#d0773e'],['#3f5037','#626b41','#89905a'],['#7a5a2c','#b58a3e','#d8b25a']][i%3])]);}
  ft.sort((p,q)=>p[0]-q[0]).forEach(([,f])=>f());
  poly(b,[[553,1010],[565,1002],[577,1010]],'#5a766c');b.fillStyle='#3a2a20';b.fillRect(556,1010,18,3);   // 林子里一点拜殿屋顶
  b.restore();
  // 近处：弥彦公园红叶谷的枫树（白天），从左右两边和下面框住画面，中间留一个窗口看街和平原
  branch(b,-30,1900,520,-1.05,26,5,1921);branch(b,1110,1900,520,-2.1,26,5,1923);
  for(const [x,y,rx,ry,seed] of [[-40,1320,220,170,1901],[1120,1300,220,180,1903],[30,1600,300,230,1905],[1060,1580,300,230,1907],[200,1880,380,220,1909],[880,1890,380,220,1911],[540,2010,560,200,1913]])dayCrown(b,x,y,rx,ry,seed,1100);
  for(const [x,y,rx,ry,seed] of [[160,1450,150,110,1931],[930,1430,160,120,1933],[340,1760,200,130,1935],[740,1770,210,130,1937]])dayCrown(b,x,y,rx,ry,seed,700);
},W,H,2.5);
function panoShot(b,t){
  const zEnd=5.2,lz=.03*t+Math.log(zEnd)*Math.pow(clamp((t-2.7)/1.7),2.3),k=clamp(lz/(.03*4.4+Math.log(zEnd))),z=Math.exp(lz);   // 先很慢地往前，最后朝鸟居推进去
  const sx=lerp(PANO_T[0],540,k),sy=lerp(PANO_T[1],1078,k);   // 鸟居慢慢移到下一个镜头里鸟居的位置
  b.save();b.translate(sx,sy);b.scale(z,z);b.translate(-PANO_T[0],-PANO_T[1]);
  b.drawImage(panoLayer,0,0,W,H);
  b.save();b.translate(PANO_T[0],PANO_T[1]);b.scale(PANO_TS,PANO_TS);b.translate(-540,-1180);b.drawImage(toriiTop,0,0,W,H);b.restore();   // 鸟居用参道上同一张画缩小，推近时不糊
  b.restore();
  leaves(b,t);
}
function nightShot(b,t){valleyShot(b,t,'reveal');}
function nightEnd(b,t){valleyShot(b,t-21,'reveal');}   // v4：入夜的红叶谷放到最后（看完夕阳下山，5 点开始点灯）
// 文字（全系列统一，见 CLAUDE.md「文字」）：左上角旁白讲信息（背景、实用信息，整句带标点），每个镜头一句，接得紧，全程有字；
// 中下方大字讲这一镜头要记住的一句（不带标点，关键词换强调色），下面一行小字补一个具体细节
const STORY_C=[[-2,3.4,'红叶最好看在 11 月上中旬。'],[3.2,6.6,'新潟坐电车，在吉田换乘弥彦线。'],[6.4,10.0,'新潟到弥彦，约一个半小时。'],[9.8,13.2,'弥彦山 634 米，和晴空塔一样高。'],[13.0,17.2,'天晴时，能看到佐渡岛。'],[NIGHT0,20.8,'神社附近的红叶谷，每晚点灯。'],[TOWN0,V28_DURATION,'下山后，住一晚弥彦温泉。']];   // v18 按新顺序
// Local narration adapter: a readable opening phrase is always present;
// the remaining characters appear progressively. No overlapping sentences.
drawStory = function(t, story, color=NARRATION, bar=TYPE.accent, shadow=STORY_SHADOW){
 const item=story.filter(([from])=>t>=from).at(-1)||story[0];
 if(!item)return;const [from,,s]=item;const size=44;
 g.save();g.globalAlpha=1;g.fillStyle=bar;g.fillRect(80,447,3,44);
 setFont(size,500,1.5);g.textAlign='left';g.shadowColor=shadow;g.shadowBlur=4;g.shadowOffsetY=1;
 let x=102,y=480;[...s].forEach((c,i)=>{const w=g.measureText(c).width;if(x+w>990){x=102;y+=58;}const p=from<0||i<4?1:ease(clamp((t-from-(i-4)*.05)/.35));g.globalAlpha=p;g.fillStyle=color;g.fillText(c,x,y+8*(1-p));x+=w;});g.restore();
};
const HL_C={y1:1440,y2:1512,size:68,weight:300,sp:8,sub:40,head:'#fff6e6',key:'#f4c586',subColor:'#fff6e6'};
function headlineC(s,segs,sub){
  rise(s,()=>{
    g.drawImage(verticalSprite('type-trial-caption',[[0,[5,12,20,0]],[.45,[5,12,20,65]],[.7,[5,12,20,65]],[1,[5,12,20,0]]]),0,1310,W,320);
    g.shadowColor='rgba(8,16,26,.95)';g.shadowBlur=6;g.shadowOffsetY=2;
    const ws=segs.map(([q])=>measure(q,HL_C.size,HL_C.weight,HL_C.sp)+HL_C.sp);
    let x=(W-ws.reduce((p,q)=>p+q,0)+HL_C.sp)/2;segs.forEach(([q,key],i)=>{text(q,x,HL_C.y1,HL_C.size,key?HL_C.key:HL_C.head,HL_C.weight,'left',HL_C.sp);x+=ws[i];});
    if(sub)text(sub,W/2,HL_C.y2+6,HL_C.sub,HL_C.subColor,500,'center',2);
    g.shadowColor='transparent';g.shadowBlur=0;
  });
}
// 片尾下移到街景前景，保留左对齐和底部安全区。
function endCardC(t){
  rise(t>=21.5?{p:easeOut(clamp((t-21.5)/.55)),out:1}:0,()=>{
    g.drawImage(verticalSprite('type-trial-end',[[0,[5,12,20,0]],[.4,[5,12,20,72]],[.7,[5,12,20,72]],[1,[5,12,20,0]]]),0,1300,W,440);
    g.shadowColor='rgba(8,16,26,.95)';g.shadowBlur=6;g.shadowOffsetY=2;
    text('看完日落和夜红叶，',92,1430,60,HL_C.head,300,'left',4);text('就在神社门前住一晚。',92,1514,60,HL_C.head,300,'left',4);g.shadowColor='transparent';g.shadowBlur=0;});
  rise(t>=21.9?{p:easeOut(clamp((t-21.9)/.55)),out:1}:0,()=>{g.shadowColor='rgba(8,16,26,.85)';g.shadowBlur=12;
    g.fillStyle=TYPE.coral;g.beginPath();g.arc(100,1594,6,0,TAU);g.fill();text('缆车末班要先查好哦',120,1608,40,HL_C.key,400,'left',2);g.shadowColor='transparent';g.shadowBlur=0;});
}
function titlesC(t){
  const sunset=ease(clamp((t-10.35)/1.8))*(1-ease(clamp((t-16.72)/.28))),lamps=ease(clamp((t-18.2)/1.8));
  g.save();drawHeader(t,{light:.12+.55*sunset+.28*lamps,lc:sunset>0?[255,188,111]:lamps>0?[255,213,156]:[224,234,241],x:sunset>0?sunScreen(t)[0]:600},{title:'弥彦',place:'新潟县弥彦村',story:STORY_C,storyShadow:'rgba(8,16,26,.95)',sheen:[440,560,500,260],reflect:true,accent:'#deb985',storyColor:'#fff6e6'});g.restore();
  headlineC(t<2.7?{p:1,out:clamp((2.7-t)/.35)}:0,[['上山看海 ',0],['入夜看秋',1]],'新潟 · 弥彦');
  headlineC(scene(t,18.6,20.4),[['弥彦公园 ',0],['红叶谷',1]],'观月桥');   // 第 0 秒就在（封面）
  headlineC(scene(t,4.2,6.3),[['一之鸟居',1]],'弥彦神社');
  headlineC(scene(t,7.4,9.6),[['山下参拜 ',0],['山上看海',1]],'十一月，还有菊花祭');
  headlineC(scene(t,10.8,12.9),[['缆车 ',0],['5',1],[' 分钟到山顶',0]],'走表参道上山 约 90 分钟');
  headlineC(scene(t,14.0,16.6),[['上山之后 是',0],['海',1]],'山顶望向日本海');
  endCardC(t);
}

// ======== Claude v2：神社一镜到底 ========
// 一之鸟居 → 长长的杉林表参道 → 随神门。随神门从第一帧起就在参道尽头。镜头一直往前走、越走越快，
// 穿过鸟居，走进随神门的门洞，从门洞后面的出口看到正面的拜殿，出门后减速。没有切镜，遮挡就是随神门本身。
// 画法和其他镜头一样：每样东西是一张插画，按它离镜头的远近决定大小和位置（越远越小，越近越大）。
const WK0=4.5,WK1=11.8,WF=1100,WHC=1.7,WY0=1000;            // 焦距、眼睛高度（米）、地平线
const TORII_Z=24,GATE_Z=30,GATE_D=4,HALL_Z=GATE_Z+GATE_D+20;   // v4：参道压短（鸟居到门 6 米），不用冲
const WX1=3.6,WS1=34,WA=(WS1-1.5*WX1)/(WX1*WX1),WV1=1.5+2*WA*WX1,WK=3;
// 走法（v5）：鸟居前慢慢往前（每秒 2 米）；5.4 秒起升起、在林子里看到拜殿、推近，7.8 秒切到拜殿正面（拜殿前慢慢往前）
const TR0=5.5,TR1=7.9,S_HALL=HALL_Z-18.8;
function walkS(t){if(t<TR1)return 2*Math.max(0,t-WK0);return S_HALL+.3*(t-TR1);}
const walkV=t=>(walkS(t+.01)-walkS(t-.01))/.02;
const blurTmp=layer(()=>{},W,H,1);
function motionBlur(b,t){                                       // 往前冲时的放射状运动模糊：同一帧按消失点放大几次叠起来求平均
  const v=walkV(t),amt=clamp((v-8)/50)*.11;if(amt<=.002)return;
  const c=blurTmp.getContext('2d');c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,W,H);c.drawImage(b.canvas,0,0,W,H);
  b.save();b.setTransform(1,0,0,1,0,0);for(let k=1;k<=6;k++){const z=1+amt*k/6;b.globalAlpha=1/(k+1);b.drawImage(blurTmp,540-540*z,WY0-WY0*z,W*z,H*z);}b.restore();b.globalAlpha=1;
}
const wPx=d=>WF/d,wY=d=>WY0+WHC*WF/d;
// 远处的杉林（无限远，不动）
const walkBack=layer(b=>{
  grad(b,0,0,W,H,[[0,'#1f3a2c'],[.3,'#3d5a44'],[.46,'#7f927a'],[.515,'#b7bfa2'],[.522,'#7d8a5e'],[1,'#56633e']]);
  glow(b,540,940,520,260,[236,232,196],.32);
  for(let i=0;i<70;i++){const x=rnd(i,2001)*1300-110,base=WY0+4+rnd(i,2002)*14;shrineTrunk(b,x,base,base+60,4+rnd(i,2003)*7,2010+i,['#7b8b74','#949a80','#83907a']);}
  for(let i=0;i<46;i++)shrineSpray(b,rnd(i,2004)*1300-110,40+rnd(i,2005)*640,160+rnd(i,2006)*220,2100+i,['#203a2c','#2a4634','#36523e'][i%3]);
  sunBeams(b,980,7,2007,.07);
});
// 杉树干（几种，近大远小地贴）
const trunkSprites=[0,1,2,3].map(k=>layer(b=>{shrineTrunk(b,60,1990,1990,100,2200+k*7,[['#22362a','#5e5c44','#2c4234'],['#26392d','#6a6447','#30463a'],['#2a3c30','#545a42','#33463a'],['#1f3227','#5a5640','#2a3f31']][k]);},120,2000,1));
const canopySprites=[0,1,2,3].map(k=>layer(b=>{shrineCanopy(b,350,330,230,180,2300+k*11);},700,600,1));
const spraySprites=[0,1,2].map(k=>layer(b=>{shrineSpray(b,20,200,560,2400+k,['#1e3a2c','#284634','#33523c'][k]);},640,400,1));
// 树、灯笼、红叶放在参道两边（米）
const WALK_ITEMS=(()=>{const out=[];
  for(let i=0;i<150;i++){const side=i%2?-1:1,row=rnd(i,2501);const x=side*(row<.5?3.2+rnd(i,2502)*1.6:6+rnd(i,2503)*12),z=1+rnd(i,2504)*80;
    if(Math.abs(z-TORII_Z)<1.2&&Math.abs(x)<4)continue;if(z>GATE_Z-2&&z<GATE_Z+GATE_D+1&&Math.abs(x)<8)continue;
    out.push({k:'trunk',x,z,w:.55+rnd(i,2505)*.5,v:i%4});}
  for(let i=0;i<26;i++){const side=i%2?-1:1;out.push({k:'canopy',x:side*(3+rnd(i,2511)*2.2),z:2+rnd(i,2512)*30,s:4.5+rnd(i,2513)*2.5,v:i%4,flip:side>0});}
  for(let i=0;i<40;i++){const side=i%2?-1:1;out.push({k:'spray',x:side*(2.6+rnd(i,2521)*5),y:7+rnd(i,2522)*9,z:2+rnd(i,2523)*60,s:6+rnd(i,2524)*5,v:i%3,flip:side<0});}
  for(let z=3;z<GATE_Z-3;z+=6.5)for(const side of [-1,1])out.push({k:'lantern',x:side*2.5,z});
  return out;})();
// 随神门（门洞是空的，门洞里面另外画）：11 米宽，屋顶高约 9.5 米，门洞 3.6 × 4.4 米
const GPX=60;
const gateSprite=layer(b=>{
  const cx=380,by=600,m=GPX,dw=1.8*m,dh=4.4*m;
  grad(b,cx-4.6*m,by-5.2*m,9.2*m,5.2*m,[[0,'#e8e2cc'],[1,'#c9c2a8']]);                     // 两边白墙
  for(const sx of [-1,1]){const x0=cx+sx*3.2*m;b.fillStyle='#3a2a1c';b.fillRect(x0-1.1*m,by-3.9*m,2.2*m,2.6*m);
    for(let k=0;k<9;k++){b.fillStyle='#a8865a';b.fillRect(x0-1.1*m+k*.27*m,by-3.9*m,4,2.6*m);}}
  for(const x of [-4.6,-1.8,1.8,4.6]){const q=b.createLinearGradient(cx+x*m-12,0,cx+x*m+12,0);q.addColorStop(0,'#6e4c2e');q.addColorStop(.45,'#c99b62');q.addColorStop(1,'#704e30');b.fillStyle=q;b.fillRect(cx+x*m-12,by-5.4*m,24,5.4*m);}
  b.fillStyle='#b88a54';b.fillRect(cx-4.8*m,by-5.6*m,9.6*m,.35*m);b.fillStyle='#6a4a2e';b.fillRect(cx-4.8*m,by-5.25*m,9.6*m,.12*m);
  for(let k=0;k<26;k++){b.fillStyle=k%2?'#c49a60':'#8a6440';b.fillRect(cx-4.7*m+k*.36*m,by-6*m,.22*m,.4*m);}  // 斗拱
  b.fillStyle='#2a2018';b.beginPath();b.moveTo(cx-5.9*m,by-6.05*m);b.lineTo(cx+5.9*m,by-6.05*m);b.lineTo(cx+5.4*m,by-5.6*m);b.lineTo(cx-5.4*m,by-5.6*m);b.fill();
  const roof=b.createLinearGradient(0,by-9.6*m,0,by-6*m);roof.addColorStop(0,'#6f7f72');roof.addColorStop(1,'#3e544c');b.fillStyle=roof;
  b.beginPath();b.moveTo(cx-6.4*m,by-6.05*m);b.quadraticCurveTo(cx-4.6*m,by-6.5*m,cx-3.2*m,by-8.6*m);b.lineTo(cx+3.2*m,by-8.6*m);b.quadraticCurveTo(cx+4.6*m,by-6.5*m,cx+6.4*m,by-6.05*m);b.quadraticCurveTo(cx,by-6.3*m,cx-6.4*m,by-6.05*m);b.fill();
  for(let k=1;k<9;k++){const u=k/9;b.strokeStyle='rgba(20,40,34,.3)';b.lineWidth=1.4;b.beginPath();b.moveTo(cx-6.2*m+u*3*m,by-6.1*m-u*2.5*m);b.lineTo(cx+6.2*m-u*3*m,by-6.1*m-u*2.5*m);b.stroke();}
  poly(b,[[cx-2.2*m,by-8.6*m],[cx+2.2*m,by-8.6*m],[cx,by-9.7*m]],'#d8cfb4');poly(b,[[cx-3.4*m,by-8.55*m],[cx+3.4*m,by-8.55*m],[cx+3.2*m,by-8.75*m],[cx-3.2*m,by-8.75*m]],'#34463f');
  b.strokeStyle='#e8dcc0';b.lineWidth=3;b.beginPath();b.moveTo(cx-2.3*m,by-8.6*m);b.lineTo(cx,by-9.75*m);b.lineTo(cx+2.3*m,by-8.6*m);b.stroke();
  b.strokeStyle='#e6d8a8';b.lineWidth=3;b.beginPath();b.moveTo(cx-6.4*m,by-6.05*m);b.quadraticCurveTo(cx,by-6.3*m,cx+6.4*m,by-6.05*m);b.stroke();
  poly(b,[[cx-5*m,by],[cx+5*m,by],[cx+5.2*m,by+.25*m],[cx-5.2*m,by+.25*m]],'#9a988a');
  b.globalCompositeOperation='destination-out';b.fillRect(cx-dw,by-dh,dw*2,dh);b.globalCompositeOperation='source-over';
},760,640,1);
function gateRect(d,half=1.8,hgt=4.4){const p=wPx(Math.max(d,.05)),yb=wY(Math.max(d,.05));return {x0:540-half*p,x1:540+half*p,y0:yb-hgt*p,y1:yb};}
// 出了门以后看到的拜殿（GPT 的正面拜殿），按离拜殿的距离放大
function courtyard(b,s){const dist=HALL_Z-s,z=21.3/dist;
  b.fillStyle='#2c4434';b.fillRect(0,0,W,H);
  zoomLayer(b,hallBack,Math.max(.7,1+(z-1)*.45)*1.12,540,1100);zoomLayer(b,hallPaint,z,540,1180);zoomLayer(b,hallNear,1+(z-1)*1.6+.02,540,1100);}
function walkGround(b,s){
  // 地面：苔和落叶的林地
  grad(b,0,WY0,W,H-WY0,[[0,'#8a9468'],[.08,'#5e6c40'],[1,'#3a4a2c']]);
  const P=[];for(let k=0;k<=60;k++){const d=.4+k*k*.03;P.push(d);}
  b.fillStyle='#8c8a70';b.beginPath();P.forEach((d,i)=>b[i?'lineTo':'moveTo'](540-1.8*wPx(d),wY(d)));for(let i=P.length-1;i>=0;i--)b.lineTo(540+1.8*wPx(P[i]),wY(P[i]));b.closePath();b.fill();
  // 石板：按世界里的位置编号，走过去时一块块往后退
  const r0=Math.floor((s+.45)/.9);
  for(let r=r0+60;r>=r0;r--){const z0=r*.9,z1=z0+.9,d0=z0-s,d1=z1-s;if(d1<=.45)continue;if(z0>GATE_Z-.3)continue;const da=Math.max(d0,.45);
    for(let c=0;c<4;c++){const x0=-1.8+c*.9,x1=x0+.9,v=.86+rnd(r*4+c,2601)*.26,gap=.03;
      poly(b,[[540+(x0+gap)*wPx(da),wY(da)-1],[540+(x1-gap)*wPx(da),wY(da)-1],[540+(x1-gap)*wPx(d1),wY(d1)+1],[540+(x0+gap)*wPx(d1),wY(d1)+1]],`rgb(${Math.round(160*v)},${Math.round(156*v)},${Math.round(130*v)})`);}}
  // 落叶和苔：也固定在地上
  for(let r=r0;r<r0+40;r++){const d=r*.9-s;if(d<.5)continue;for(let c=-9;c<=9;c++){const h=rnd(r*19+c,2611);if(h>.55)continue;const x=c*.95+rnd(r*19+c,2612)*.9,p=wPx(d);
    const onPath=Math.abs(x)<1.8,sz=(.05+rnd(r*19+c,2613)*.1)*p;if(onPath&&h>.18)continue;
    if(onPath)maple(b,540+x*p,wY(d),sz*.9,rnd(r,c)*TAU,reds[2+((r+c)&3)]);else{b.fillStyle=['#52603a','#667048','#3b5538','#7a5a32'][(r+c)&3];b.beginPath();b.ellipse(540+x*p,wY(d),sz*1.6,sz*.5,0,0,TAU);b.fill();}}}
}
function walkScene(b,t){walkSceneAt(b,t,walkS(t));}
function walkSceneAt(b,t,s){
  const dF=GATE_Z-s,dB=GATE_Z+GATE_D-s;
  if(dB<.3){courtyard(b,s);return;}
  b.drawImage(walkBack,0,0,W,H);walkGround(b,s);
  const items=[];
  for(const it of WALK_ITEMS){const d=it.z-s;if(d<.35||d>85)continue;items.push([d,it]);}
  items.push([TORII_Z-s,{k:'torii'}]);items.push([dB,{k:'courtyard'}]);items.push([(dF+dB)/2,{k:'passage'}]);items.push([dF,{k:'gate'}]);
  items.sort((a,c)=>c[0]-a[0]);
  let hazed=0;
  for(const [d,it] of items){
    if(d<.35&&it.k!=='passage'&&it.k!=='courtyard')continue;
    if(!hazed&&d<20){hazed=1;const q=b.createLinearGradient(0,WY0-260,0,WY0+120);q.addColorStop(0,'rgba(196,206,180,0)');q.addColorStop(.75,'rgba(196,206,180,.32)');q.addColorStop(1,'rgba(196,206,180,0)');b.fillStyle=q;b.fillRect(0,WY0-260,W,380);}
    const p=wPx(Math.max(d,.05)),yb=wY(Math.max(d,.05));
    if(it.k==='trunk'){const w=it.w*p*1.5,h=32*p;b.drawImage(trunkSprites[it.v],540+it.x*p-w/2,yb-h*.995,w,h);}
    else if(it.k==='canopy'){const w=it.s*p,h=w*600/700;b.save();b.translate(540+it.x*p,yb-1.2*p);if(it.flip)b.scale(-1,1);b.drawImage(canopySprites[it.v],-w/2,-h*.82,w,h);b.restore();}
    else if(it.k==='spray'){const w=it.s*p,h=w*400/640;b.save();b.translate(540+it.x*p,yb-it.y*p);if(it.flip)b.scale(-1,1);b.drawImage(spraySprites[it.v],0,-h/2,w,h);b.restore();}
    else if(it.k==='lantern'){stoneLantern(b,540+it.x*p,yb,2.1*p/170);}
    else if(it.k==='torii'){const k=p/95;b.save();b.translate(540,yb);b.scale(k,k);b.translate(-540,-1180);b.drawImage(toriiTop,0,0,W,H);b.restore();}
    else if(it.k==='courtyard'){const r=gateRect(dB,1.6,4.2);b.save();b.beginPath();b.rect(r.x0,r.y0,r.x1-r.x0,r.y1-r.y0);b.clip();courtyard(b,s);b.restore();}
    else if(it.k==='passage'){const f=gateRect(Math.max(dF,.3)),bk=gateRect(dB,1.6,4.2);
      const fx0=Math.min(f.x0,-50),fx1=Math.max(f.x1,W+50),fy0=Math.min(f.y0,-50),fy1=Math.max(f.y1,H+50),use=dF<=.3;
      const F0=use?[fx0,fy0,fx1,fy1]:[f.x0,f.y0,f.x1,f.y1];
      poly(b,[[F0[0],F0[1]],[F0[2],F0[1]],[bk.x1,bk.y0],[bk.x0,bk.y0]],'#120c08');               // 天花板
      poly(b,[[F0[0],F0[3]],[F0[2],F0[3]],[bk.x1,bk.y1],[bk.x0,bk.y1]],'#2c261e');               // 石地面
      poly(b,[[F0[0],F0[1]],[bk.x0,bk.y0],[bk.x0,bk.y1],[F0[0],F0[3]]],'#24180f');poly(b,[[F0[2],F0[1]],[bk.x1,bk.y0],[bk.x1,bk.y1],[F0[2],F0[3]]],'#1c120b');
      for(let k=1;k<5;k++){const u=k/5,lerpP=(a,c)=>a+(c-a)*u;b.strokeStyle='rgba(150,110,70,.35)';b.lineWidth=2;b.beginPath();b.moveTo(lerpP(F0[0],bk.x0),lerpP(F0[1],bk.y0));b.lineTo(lerpP(F0[2],bk.x1),lerpP(F0[1],bk.y0));b.stroke();}
      const q=b.createRadialGradient(540,(bk.y0+bk.y1)/2,0,540,(bk.y0+bk.y1)/2,(bk.x1-bk.x0)*1.2);q.addColorStop(0,'rgba(255,236,190,.25)');q.addColorStop(1,'rgba(255,236,190,0)');b.fillStyle=q;b.fillRect(0,0,W,H);}
    else if(it.k==='gate'){if(dF<.3)continue;const k=p/GPX;b.save();b.translate(540,yb);b.scale(k,k);b.drawImage(gateSprite,-380,-600,760,640);b.restore();}
  }
  leaves(b,t);
}
// ======== v3 转场一：拜殿后面就是弥彦山 ========
// 走出随神门以后镜头不停：慢慢升起来，拜殿和杉树干往下沉，杉树顶露出来，后面是整座弥彦山，山坡上一条缆车索道和一个小车厢；
// 镜头接着往车厢推，车厢的位置、方向和下一个缆车镜头开头一样，在推进中切过去（同一个车厢的跳近）。
const CR0=12.2,CR1=14.5,RISE=1750,CAB0=[230,1031];
const mtnLayer=layer(b=>{
  grad(b,0,0,W,H,[[0,'#3f7fa6'],[.3,'#86bcd6'],[.5,'#cfe2df'],[1,'#a8b48a']]);
  softCloud(b,780,300,520,34,611,.16);softCloud(b,240,420,380,22,613,.12);
  b.fillStyle='#9cb9c6';smoothRidge(b,[[-80,900],[60,860],[180,880],[300,820],[420,860],[520,820],[700,860],[860,800],[1000,840],[1160,820]]);b.fill();   // 远处的山
  // 弥彦山：圆圆的山头偏右，左右两条山脊往下，满山红叶（远，树小）
  const M=[[-80,1180],[40,1120],[150,1060],[240,1030],[330,960],[400,930],[470,860],[540,800],[600,730],[650,690],[700,680],[750,700],[800,690],[860,740],[930,800],[1000,830],[1080,880],[1160,900]];
  woodlandRidge(b,M,431,['#364b34','#715c32','#a7793e','#c69a55'],.72);
  b.save();smoothRidge(b,M);b.clip();for(let i=0;i<9;i++){const x=80+i*120+(rnd(i,617)-.5)*60;glow(b,x,900+rnd(i,618)*300,60,420,[40,34,30],.10);}b.restore();   // 山坡上几道顺着山势的沟（暗一点）
  b.save();smoothRidge(b,M);b.clip();grad(b,0,520,W,900,[[0,'rgba(200,220,230,.30)'],[.5,'rgba(200,220,230,.12)'],[1,'rgba(200,220,230,0)']]);b.restore();   // 远山上一层空气
  // 山顶的展望塔（细细一根）
  b.strokeStyle='#d9dccf';b.lineWidth=4;b.beginPath();b.moveTo(712,686);b.lineTo(712,616);b.stroke();b.fillStyle='#e9ece0';b.fillRect(702,616,20,12);
  // 索道：从左下的山麓站往右上斜着上去（和下一个镜头里的方向一样）
  const L=x=>1200-(x+40)*.62;
  b.strokeStyle='rgba(50,64,62,.85)';b.lineWidth=2.4;b.beginPath();b.moveTo(-40,L(-40));b.lineTo(690,L(690));b.stroke();
  b.strokeStyle='rgba(230,236,226,.7)';b.lineWidth=1;b.beginPath();b.moveTo(-40,L(-40)-3);b.lineTo(690,L(690)-3);b.stroke();
  for(const x of [120,420]){b.strokeStyle='#5c665d';b.lineWidth=3;b.beginPath();b.moveTo(x-10,L(x)+60);b.lineTo(x,L(x)+4);b.lineTo(x+10,L(x)+60);b.stroke();}
  b.fillStyle='#7d6c58';b.fillRect(670,L(690)-10,44,26);                                       // 山顶站
});
const cedarTops=layer(b=>{                                     // 杉树顶：高低、粗细都不一样的树梢，中间夹几棵红叶，盖住下面杉林的上沿
  grad(b,0,1700,W,H-1700,[[0,'#26422f'],[1,'#243e2e']]);
  const items=[];
  for(let i=0;i<30;i++){const x=-90+i*42+(rnd(i,621)-.5)*40,top=1380+Math.pow(rnd(i,622),.7)*380;items.push([top,()=>treeCrown(b,x,H-40,H-40-top,40+rnd(i,623)*60,640+i,[['#1d3426','#2c4a34','#4f6e4a'],['#22392a','#355238','#5c7a52']][i%2],true)]);}
  for(let i=0;i<7;i++){const x=rnd(i,627)*1180-50,top=1560+rnd(i,628)*120;items.push([top+40,()=>treeCrown(b,x,H-170,H-170-top,110+rnd(i,629)*80,690+i,[['#6e2f22','#a4482c','#d0773e'],['#7a5a2c','#b58a3e','#d8b25a']][i%2])]);}
  items.sort((p,q)=>p[0]-q[0]).forEach(([,f])=>f());
  for(let i=0;i<16;i++)shrineSpray(b,rnd(i,624)*1300-110,1680+rnd(i,625)*160,160+rnd(i,626)*160,660+i,['#203a2c','#2a4634','#36523e'][i%3]);
});
function craneScene(b,t){
  const s=walkS(t),dist=HALL_Z-s,z=21.3/dist,u=clamp((t-CR0)/(CR1-CR0));
  const Y=RISE*(u<.75?ease(u/.75):1);                          // 先升起来（约 1.7 秒）
  const pz=Math.pow(2.5,ease(clamp((t-(CR0+1.35))/(CR1-CR0-1.35))));   // 再朝车厢推
  b.fillStyle='#2c4434';b.fillRect(0,0,W,H);
  b.save();b.translate(CAB0[0],CAB0[1]);b.scale(pz,pz);b.translate(-CAB0[0],-CAB0[1]);
  b.drawImage(mtnLayer,0,-RISE*.35+Y*.35,W,H);
  const cx=CAB0[0]+(t-CR0)*18,cy=1200-(cx+40)*.62;           // 小车厢沿索道慢慢往上
  refinedCabin(b,cx,cy+6,.17);
  b.restore();
  b.save();b.translate(0,Y*.92);zoomLayer(b,hallBack,Math.max(.7,1+(z-1)*.45)*1.12,540,1100);b.restore();
  b.save();b.translate(0,Y*.92-132);b.drawImage(cedarTops,0,-H+40,W,H);b.restore();
  {const y0=Y*.92-92,fa=clamp((Y*.92-92)/200);const q=b.createLinearGradient(0,y0-10,0,y0+260);q.addColorStop(0,`rgba(36,62,46,${fa})`);q.addColorStop(1,'rgba(36,62,46,0)');b.fillStyle=q;b.fillRect(0,y0-10,W,270);}   // 树梢和下面的杉林之间不留一道直线
  b.save();b.translate(0,Y*1.15);zoomLayer(b,hallPaint,z,540,1180);b.restore();
  b.save();b.translate(0,Y*1.4);zoomLayer(b,hallNear,1+(z-1)*1.6+.02,540,1100);b.restore();
}
// ======== v5 转场：鸟居处升起，林子里露出拜殿 ========
// 在鸟居前镜头慢慢升起：鸟居和参道往下沉，杉树梢从上面过去，前面一片杉林里有一块空地，随神门在前、拜殿在后；
// 镜头往拜殿推，拜殿用的就是下一个镜头里那张正面拜殿缩小，推近后直接切到拜殿正面（同一座建筑的跳近）
const GLADE_HC=[540,1230],GLADE_S=.25;
const clearR=a=>1+.1*Math.sin(3*a+1.3)+.06*Math.sin(5*a+.4)+.035*Math.sin(11*a+2.1);   // v12：空地边缘的起伏
// V11 refinement: keep the original clearing, temple scale and camera framing.
// Only this grove uses the new cedar drawing; map, cable slopes and torii stay intact.
function gladeCedar(b,x,y,h,w,seed,colors,detail=1){
  b.save();b.translate(x,y);w*=.72;
  const lean=(rnd(seed,4101)-.5)*h*.1,sides=[];
  // Narrow, irregular sprays, with curved drooping tips instead of saw teeth.
  for(const sign of [-1,1]){
    const pts=[[lean,-h]];
    for(let j=1;j<=20;j++){
      const u=j/21,yy=-h+h*u*.93,cx=lean*(1-u);
      const spread=w*Math.pow(Math.sin(u*Math.PI*.88),1.05);
      const reach=spread*(.65+rnd(j,seed+sign*31)*.45);
      pts.push([cx+sign*reach,yy+h*(rnd(j,seed+47)-.5)*.018]);
      pts.push([cx+sign*reach*.8,yy+h*.018]);
    }
    sides.push(pts);
  }
  const pts=[...sides[0],[0,-h*.025],...sides[1].reverse()];
  const shade=b.createLinearGradient(-w,0,w,0);
  shade.addColorStop(0,colors[1]);shade.addColorStop(.6,colors[0]);shade.addColorStop(1,colors[1]);
  b.fillStyle=shade;b.beginPath();b.moveTo(...pts[0]);
  for(let j=1;j<pts.length;j++){
    const a=pts[j],next=pts[(j+1)%pts.length];b.quadraticCurveTo(a[0],a[1],(a[0]+next[0])/2,(a[1]+next[1])/2);
  }
  b.closePath();b.fill();
  if(detail>.45){
    b.strokeStyle=blendTone(colors[0],'#857858',.23);b.lineWidth=Math.max(.7,h*.012);
    b.beginPath();b.moveTo(0,0);b.quadraticCurveTo(lean*.4,-h*.4,lean,-h*.91);b.stroke();
    for(let j=0;j<16;j++){
      const u=.15+rnd(j,seed+101)*.7,sign=j%2?1:-1;
      const cx=lean*(1-u),yy=-h+h*u;
      const reach=w*Math.pow(Math.sin(u*Math.PI*.88),1.05)*(.6+rnd(j,seed+102)*.4);
      const drop=h*(.012+rnd(j,seed+103)*.027);
      b.strokeStyle=blendTone(colors[1],j%3?colors[0]:colors[2],j%3?.2:.21);
      b.lineWidth=Math.max(.8,h*.007);b.lineCap='round';
      b.beginPath();b.moveTo(cx,yy);b.quadraticCurveTo(cx+sign*reach*.6,yy-drop*.35,cx+sign*reach,yy+drop);b.stroke();
      // Needles hang in small, uneven sprays, rather than bright horizontal stripes.
      for(let k=1;k<6;k++){
        const f=k/6,xx=cx+sign*reach*f,by=yy+drop*f*f;
        const length=h*(.008+rnd(j*6+k,seed+110)*.018)*detail;
        b.beginPath();b.moveTo(xx,by-length*.2);b.lineTo(xx-sign*length*.35,by+length);b.stroke();
      }
    }
  }
  b.restore();
}
const gladeFar=layer(b=>{
  // Tree-covered folds, with a transparent, uneven upper boundary throughout the lift.
  for(const [y0,col,n,hh,wr,seed] of [[620,'#819b8c',72,108,.35,1101],[700,'#6e8b78',82,125,.34,1131],[790,'#52745f',90,150,.33,1161],[880,'#3c5c49',96,170,.32,1191]]){
    const floor=[[-80,H]];
    for(let x=-80;x<=W+80;x+=16)floor.push([x,y0+65+30*Math.sin(x*.009+seed)+18*Math.sin(x*.023)]);
    floor.push([W+80,H]);poly(b,floor,col);
    for(let i=0;i<n;i++){
      const x=-60+i*(1200/n)+(rnd(i,seed)-.5)*(1200/n)*.95;   // v12：间距和高矮拉开，不排成一排
      const h=hh*(.6+rnd(i,seed+1)*.8)*(.75+rnd(i,seed+3)*.6);
      const fold=30*Math.sin(x*.009+seed)+18*Math.sin(x*.023);
      gladeCedar(b,x,y0+80+fold+rnd(i,seed+2)*34,h,h*wr,seed+i,
        [blendTone(col,'#243c33',.13),col,blendTone(col,'#fff4dc',.1)],.3);
    }
    // 两排树之间一层不均匀的薄雾（v12：远山不再是一层层干净的剪纸）
    for(let k=0;k<7;k++)glow(b,rnd(k,seed+7)*1200-60,y0+120+rnd(k,seed+8)*40,180+rnd(k,seed+9)*220,40+rnd(k,seed+10)*40,[214,226,214],.16+rnd(k,seed+11)*.14);
  }
},W,H,1.25);
const gladeItems=(()=>{
  const tr=[],P3=[['#14281d','#22402e','#46684c'],['#17301f','#284a32','#52724e'],['#1b3326','#2e4c36','#5e7c58'],['#122419','#1e3a2a','#3e5e46']];
  // v12：空地边缘不规则，前面和两侧的树可以伸进空地一点，压住边缘；后面（拜殿那一侧）不挡建筑
  const inClear=(x,y)=>{const dx=(x-540)/350,dy=(y-1290)/140,r=clearR(Math.atan2(dy,dx))*(dy>-.2?.9:1);return dx*dx+dy*dy<r*r||(Math.abs(x-540)<170&&y>1120&&y<1300);};
  for(let i=0;i<1500;i++){
    const x=-90+rnd(i,1181)*1260,y=950+Math.pow(rnd(i,1182),.9)*1080;
    const d=clamp((y-950)/1000),h=(60+d*230)*(.7+rnd(i,1183)*.6);
    if(inClear(x,y-h*.08)||(Math.abs(x-540)<110+d*60&&y>1300))continue;
    const air=(1-d)*.16,pal=P3[i%4].map(c=>blendTone(c,'#6d8977',air));
    tr.push({y,draw:b=>gladeCedar(b,x,y,h,h*(.26+rnd(i,1184)*.14),1200+i,pal,.45+d*.55)});
  }
  for(let i=0;i<0;i++){   // v12：去掉杉林里零散的红黄小树冠（像贴上去的色块），秋色交给飘落的红叶
    const x=rnd(i,1191)*1180-50,y=1100+rnd(i,1192)*800,d=clamp((y-950)/1000),h=50+d*160;
    if(inClear(x,y)||(Math.abs(x-540)<140&&y>1300))continue;
    tr.push({y:y+1,draw:b=>treeCrown(b,x,y,h,h*.62,1300+i,[['#6e2f22','#a4482c','#d0773e'],['#7a5a2c','#b58a3e','#d8b25a'],['#6a1f1e','#b03a2c','#e0683a']][i%3])});
  }
  tr.push({y:1682,draw:b=>poly(b,[[505,1680],[575,1680],[650,1940],[430,1940]],'#b4ae94')});
  tr.push({y:1681,draw:b=>{b.save();b.translate(540,1680);b.scale(.5,.5);b.drawImage(gateSprite,-380,-600,760,640);b.restore();}});
  return tr.sort((a,c)=>a.y-c.y);
})();
const gladeMiddle=layer(b=>{
  // Ground begins below the rear crowns; no rectangular edge is exposed to the sky.
  grad(b,0,960,W,H-960,[[0,'rgba(52,81,62,0)'],[.15,'#34513e'],[1,'#22392b']]);
  // v12：空地不是规整的椭圆；地面有明暗：后面被高杉挡住偏暗，中间一块阳光，边上有苔藓，几道杉树的影子斜着落在碎石上
  const pts=[];for(let k=0;k<=160;k++){const a=k/160*TAU,r=clearR(a);pts.push([540+Math.cos(a)*350*r,1290+Math.sin(a)*140*r]);}
  b.save();poly(b,pts,'#aaa287');b.clip();
  glow(b,600,1310,330,120,[236,226,192],.75);
  grad(b,0,1130,W,170,[[0,'rgba(28,42,32,.55)'],[1,'rgba(28,42,32,0)']]);
  for(let i=0;i<3200;i++){
    const x=170+rnd(i,1171)*740,y=1130+rnd(i,1172)*330;
    b.fillStyle=i%2?'rgba(240,232,205,.32)':'rgba(96,92,74,.28)';b.fillRect(x,y,1.3,1);
  }
  for(let i=0;i<9;i++){const x=640+rnd(i,1175)*300,y=1170+rnd(i,1176)*240,l=180+rnd(i,1177)*260,w=10+rnd(i,1178)*26;
    const k=.16+rnd(i,1174)*.14;poly(b,[[x,y-w/2],[x-l,y+l*k-w*.25],[x-l*.96,y+l*k+w*.35],[x,y+w/2]],'rgba(30,44,34,.14)');}
  for(let i=0;i<14;i++){const a=rnd(i,1179)*TAU,r=clearR(a)*.97;glow(b,540+Math.cos(a)*350*r,1290+Math.sin(a)*140*r,60+rnd(i,1180)*70,22+rnd(i,1181)*18,[70,92,56],.35);}
  b.lineWidth=50;b.strokeStyle='rgba(30,44,32,.28)';b.beginPath();pts.forEach(([x,y],i)=>b[i?'lineTo':'moveTo'](x,y));b.closePath();b.stroke();
  b.restore();
  b.save();b.translate(GLADE_HC[0],GLADE_HC[1]);b.scale(GLADE_S,GLADE_S);b.translate(-540,-1180);b.drawImage(hallPaint,0,0,W,H);b.restore();
  gladeItems.filter(it=>it.y<1510).forEach(it=>it.draw(b));
},W,H,1.25);
const gladeNear=layer(b=>{
  gladeItems.filter(it=>it.y>=1510).forEach(it=>it.draw(b));
  // 几道斜光从右上穿过杉林落到空地上（很淡，不是光柱特效）
  b.save();b.globalCompositeOperation='lighter';
  for(const [x0,w,a] of [[940,120,.07],[1060,80,.05],[820,60,.045]]){const q=b.createLinearGradient(0,600,0,1450);q.addColorStop(0,`rgba(255,236,190,0)`);q.addColorStop(.55,`rgba(255,236,190,${a})`);q.addColorStop(1,'rgba(255,236,190,0)');
    b.fillStyle=q;b.beginPath();b.moveTo(x0,600);b.lineTo(x0+w,600);b.lineTo(x0+w-470,1450);b.lineTo(x0-470-w*.4,1450);b.closePath();b.fill();}
  b.restore();
},W,H,1.25);
// Retain a flattened view for the dormant legacy transition, not for V11 playback.
const gladeLayer=layer(b=>{
  for(const img of [gladeFar,gladeMiddle,gladeNear])b.drawImage(img,0,0,W,H);
},W,H,1);
function riseToShrine(b,t){
  const s=walkS(Math.min(t,TR0))+.8*(t-TR0),RISE1=1900,Y=RISE1*ease(clamp((t-TR0)/1.3)),pz=Math.pow(2.4,ease(clamp((t-(TR0+1.2))/(TR1-TR0-1.2))));
  b.fillStyle='#8fa58a';b.fillRect(0,0,W,H);
  b.save();b.translate(GLADE_HC[0],GLADE_HC[1]);b.scale(pz,pz);b.translate(-GLADE_HC[0],-GLADE_HC[1]);
  b.drawImage(gladeLayer,0,-RISE1*.55+Y*.55,W,H);
  if(Y<RISE1*.999||pz<1.01){
    b.save();b.translate(0,Y);walkSceneAt(b,t,s);b.restore();
    b.save();b.translate(0,Y-H+40);b.drawImage(cedarTops,0,0,W,H);b.restore();
    {const y0=Y+40,fa=clamp(Y/200);const q=b.createLinearGradient(0,y0-10,0,y0+260);q.addColorStop(0,`rgba(36,62,46,${fa})`);q.addColorStop(1,'rgba(36,62,46,0)');b.fillStyle=q;b.fillRect(0,y0-10,W,270);}
  }
  b.restore();
  leaves(b,t);
}
// ======== v8 鸟居：照官方照片（观光协会彌彦神社页第 2 张）的机位——站在参道上偏一点，低低地仰看一之鸟居 ========
// 両部鳥居：两根主柱各有前后两根小稚児柱；笠木两端上翘、上面一道深色的盖；中间额束挂「彌彦神社」的匾。左前方一座石灯笼，后面高高的杉树往天上收，两边是红叶。
// 重点不在运镜：镜头几乎不动，靠光和风——树缝里的斜光慢慢移，一阵风吹落一把红叶
const TP=(X,Y,Z)=>{const p=.384,cy=1.2,dy=Y-cy,y1=dy*Math.cos(p)-Z*Math.sin(p),z1=dy*Math.sin(p)+Z*Math.cos(p);return [540+900*X/z1,1000-900*y1/z1];};
const TOX=-.25,TOZ=8.6;
function tq(b,pts,fill){poly(b,pts.map(q=>TP(...q)),fill);}
function tbeam(b,x0,x1,y0,y1,z,lift,cols,seg=16){         // 一根横梁（正面），两端可以上翘
  const top=[],bot=[];for(let k=0;k<=seg;k++){const u=k/seg,x=x0+(x1-x0)*u,l=lift*Math.pow(Math.abs(u-.5)*2,2.2);top.push(TP(TOX+x,y1+l,TOZ+z));bot.push(TP(TOX+x,y0+l*.75,TOZ+z));}
  const [a,c]=[top,bot];const q=b.createLinearGradient(0,Math.min(...a.map(p=>p[1])),0,Math.max(...c.map(p=>p[1])));q.addColorStop(0,cols[0]);q.addColorStop(1,cols[1]);
  b.fillStyle=q;b.beginPath();a.forEach((p,i)=>b[i?'lineTo':'moveTo'](...p));c.slice().reverse().forEach(p=>b.lineTo(...p));b.closePath();b.fill();return [a,c];}
function tpost(b,x,z,r,h,cols){                                // 一根柱子（圆柱：左暗右亮的渐变）
  const L0=TP(TOX+x-r,0,TOZ+z),R0=TP(TOX+x+r,0,TOZ+z),L1=TP(TOX+x-r*.92,h,TOZ+z),R1=TP(TOX+x+r*.92,h,TOZ+z);
  const q=b.createLinearGradient(L0[0],0,R0[0],0);q.addColorStop(0,cols[0]);q.addColorStop(.38,cols[1]);q.addColorStop(.7,cols[2]);q.addColorStop(1,cols[0]);
  b.fillStyle=q;b.beginPath();b.moveTo(...L0);b.lineTo(...R0);b.lineTo(...R1);b.lineTo(...L1);b.closePath();b.fill();}
const VERM=['#8e2a1c','#e0482c','#c23a24'],VERM_SH=['#6a1c14','#b0341f','#962c1c'];
const toriiLow=layer(b=>{
  // 天：树冠缝里的亮天
  grad(b,0,0,W,1400,[[0,'#eaf2e4'],[.4,'#d6e4cc'],[1,'#b5c8a2']]);
  b.save();b.globalCompositeOperation='lighter';glow(b,760,120,620,420,[255,248,220],.5);b.restore();
  // 地面：参道（碎石）往远处收，两边苔和落叶
  const hz=TP(0,1.2,400)[1];
  grad(b,0,hz-10,W,H-hz+10,[[0,'#7d8a62'],[.25,'#5e6c44'],[1,'#3e4a2e']]);
  poly(b,[TP(TOX-2.2,0,2),TP(TOX+2.2,0,2),TP(TOX+1.2,0,120),TP(TOX-1.2,0,120)],'#b9b39c');
  for(const sx of [-1,1])for(let i=0;i<260;i++){const Z=2+Math.pow(rnd(i,3003+sx),1.5)*50,X=TOX+sx*(2.2-Z/120)+sx*(rnd(i,3004)*.8-.3),[x,y]=TP(X,0,Z),w=(14+rnd(i,3009)*20)/Z*3;b.fillStyle=['rgba(86,110,58,.6)','rgba(120,136,72,.5)','rgba(64,84,46,.6)'][i%3];b.beginPath();b.ellipse(x,y,w,w*.35,0,0,TAU);b.fill();}   // 参道两边的苔
  for(let i=0;i<2200;i++){const Z=2+Math.pow(rnd(i,3001),1.6)*60,X=TOX+(rnd(i,3002)-.5)*4.2*(1-Z/150),[x,y]=TP(X,0,Z);b.fillStyle=i%3?'rgba(240,234,214,.4)':'rgba(96,92,74,.35)';b.fillRect(x,y,1+6/Z,1);}
  for(let i=0;i<160;i++){const Z=1.5+rnd(i,3005)*25,X=TOX+(rnd(i,3006)-.5)*14,[x,y]=TP(X,0,Z),s=(18+rnd(i,3007)*10)/Z*3;maple(b,x,y,s,rnd(i,3008)*TAU,reds[2+i%5]);}
  // 后面的杉树：很高，往天上收；远的淡、近的深
  const trunks=[];for(let i=0;i<20;i++){const side=i%2?1:-1,X=TOX+side*(3.2+rnd(i,3011)*9),Z=TOZ+3+rnd(i,3012)*22;trunks.push([Z,X,.55+rnd(i,3013)*.45,i]);}
  trunks.sort((a,c)=>c[0]-a[0]).forEach(([Z,X,r,i])=>{const far=clamp((Z-TOZ)/26),c=[blendTone('#2c221a','#8c9c84',far*.75),blendTone('#6e5640','#b8bea6',far*.75),blendTone('#4a3a2a','#9eaa92',far*.75)];
    const L0=TP(X-r*1.25,0,Z),R0=TP(X+r*1.25,0,Z),L1=TP(X-r,1.4,Z),R1=TP(X+r,1.4,Z),L2=TP(X-r*.3,140,Z),R2=TP(X+r*.3,140,Z);   // v14：树干一直长出画面上方，不在半空截断
    const q=b.createLinearGradient(L1[0],0,R1[0],0);q.addColorStop(0,c[0]);q.addColorStop(.55,c[1]);q.addColorStop(.85,c[2]);q.addColorStop(1,c[0]);
    b.fillStyle=q;b.beginPath();b.moveTo(...L0);b.lineTo(...R0);b.lineTo(...R1);b.lineTo(...R2);b.lineTo(...L2);b.lineTo(...L1);b.closePath();b.fill();   // 树干：根部张开，往上收细
    for(let k=0;k<9;k++){const u=.08+k*.1+rnd(i*9+k,3014)*.05,a0=TP(X-r+2*r*u,.2,Z),a1=TP(X+(-r+2*r*u)*.3,140,Z);b.strokeStyle=k%3===0?`rgba(220,200,160,${.18-far*.1})`:`rgba(24,16,10,${.35-far*.2})`;b.lineWidth=k%3===0?1:1.6;b.beginPath();b.moveTo(...a0);b.lineTo(...a1);b.stroke();}   // 竖的树皮纹
    // v14：枝条从树干上长出来，往外、往下垂，越高越短；不是一排排平行漂着的枝
    if(far<.75)for(let k=0;k<7;k++){const Y=13+k*7+rnd(i*7+k,3041)*4,[x,y]=TP(X,Y,Z);if(y<-140||y>760)continue;
      for(const sd of [-1,1]){if(rnd(i*14+k*2+(sd>0),3042)<.3)continue;const seed=3050+i*20+k*2+(sd>0),side=rnd(seed,1)>.5?1:-1;
        const len=(170+rnd(seed,3043)*150)*(1-k*.07)*(1-far*.45),a=(.22+rnd(seed,3044)*.35)*side;
        b.save();b.translate(x,y);b.rotate(a);shrineSpray(b,0,0,len,seed,[blendTone('#2a4632','#8c9c84',far*.6),blendTone('#365a3e','#8c9c84',far*.6),blendTone('#1f3a2a','#8c9c84',far*.6)][k%3]);b.restore();}}
    if(far<.5){const m0=TP(X-r*1.2,0,Z),m1=TP(X+r*1.2,2.2,Z);b.fillStyle='rgba(70,96,52,.45)';b.beginPath();b.ellipse((m0[0]+m1[0])/2,m0[1]-(m0[1]-m1[1])*.3,Math.abs(m1[0]-m0[0])/2,(m0[1]-m1[1])*.35,0,0,TAU);b.fill();}   // 根部的苔
  });
  grad(b,0,TP(0,1.2,400)[1]-260,W,300,[[0,'rgba(214,226,200,0)'],[.7,'rgba(214,226,200,.55)'],[1,'rgba(214,226,200,0)']]);   // 远处参道上的一层雾，把杉树根部和地平线融在一起
  // 树冠：头顶一片杉枝，缝里透天
  for(let i=0;i<26;i++){const x=rnd(i,3021)*1300-110,y=-90+rnd(i,3022)*230;b.save();b.translate(x,y);b.rotate((rnd(i,3024)-.5)*1.1);shrineSpray(b,0,0,200+rnd(i,3023)*220,3030+i,['#2a4632','#365a3e','#44694a','#1f3a2a'][i%4]);b.restore();}   // v14：只在最上面补一些，角度各不相同
  // 鸟居
  const H1=8.0,KW=5.4,PX=3.15;
  const subPost=(sx,z)=>{tpost(b,sx*PX,z,.19,3.3,z>0?VERM_SH:VERM);const c0=TP(TOX+sx*PX-.5,3.3,TOZ+z),c1=TP(TOX+sx*PX+.5,3.3,TOZ+z),c2=TP(TOX+sx*PX-.28,3.48,TOZ+z),c3=TP(TOX+sx*PX+.28,3.48,TOZ+z);poly(b,[c0,c1,c3,c2],'#3a3430');poly(b,[c0,c1,[c1[0],c1[1]+5],[c0[0],c0[1]+5]],'#24201c');   // 稚児柱和它的小屋顶
    const a0=TP(TOX+sx*PX,2.9,TOZ+z),a1=TP(TOX+sx*PX,2.9,TOZ);b.strokeStyle=z>0?'#962c1c':'#c83c24';b.lineWidth=Math.max(4,900*.22/(TOZ+z));b.beginPath();b.moveTo(...a0);b.lineTo(...a1);b.stroke();};   // 连到主柱的横木
  for(const sx of [-1,1])subPost(sx,1.1);                          // 后面的两根（先画）
  for(const sx of [-1,1]){tpost(b,sx*PX,0,.36,H1,VERM);}           // 主柱
  for(const sx of [-1,1]){const p0=TP(TOX+sx*PX-.5,0,TOZ),p1=TP(TOX+sx*PX+.5,.45,TOZ);b.fillStyle='#2e2a26';b.fillRect(Math.min(p0[0],p1[0]),p1[1],Math.abs(p1[0]-p0[0]),p0[1]-p1[1]);}   // 柱脚的黑色根卷
  for(const sx of [-1,1])subPost(sx,-1.1);                         // 前面的两根（后画）
  tbeam(b,-4.3,4.3,6.25,6.7,0,0,['#e8502e','#a8301e']);                                               // 贯
  poly(b,[TP(TOX-.18,6.7,TOZ),TP(TOX+.18,6.7,TOZ),TP(TOX+.18,7.85,TOZ),TP(TOX-.18,7.85,TOZ)],'#b63424'); // Upright only; plaque is painted after fonts load.   // 匾
  tbeam(b,-KW+.4,KW-.4,7.85,8.25,0,.18,['#e8502e','#b0341f']);                                        // 島木
  tbeam(b,-KW,KW,8.25,8.75,.05,.55,['#d8462a','#9a2c1a']);                                             // 笠木
  tbeam(b,-KW-.1,KW+.1,8.75,8.92,.05,.62,['#3a3430','#1e1a18']);                                       // 笠木上面的深色盖
  // 两边的红叶（近处，大）
  for(const [x,y,rx,ry,seed] of [[-90,640,240,200,3101],[1170,600,260,220,3103],[-20,1150,170,150,3105],[1110,1120,190,160,3107]])dayCrown(b,x,y,rx,ry,seed,900);
  // 左前方的石灯笼
  stoneLantern(b,190,1640,2.6);
},W,H,1.5);
let lowPlaque=null;
function drawLowPlaque(b){
 if(!lowPlaque){lowPlaque=layer(c=>{c.fillStyle='#201d1a';c.fillRect(0,0,144,320);c.strokeStyle='#c39b4e';c.lineWidth=6;c.strokeRect(7,7,130,306);c.strokeStyle='#685632';c.lineWidth=2;c.strokeRect(15,15,114,290);c.fillStyle='#e5c77b';c.font='500 48px "Source Han Sans SC"';c.textAlign='center';c.textBaseline='middle';[...'弥彦神社'].forEach((ch,i)=>c.fillText(ch,72,63+i*65));},144,320,2);}
 const a=TP(TOX-.25,7.82,TOZ-.13),d=TP(TOX+.25,7.82,TOZ-.13),c=TP(TOX+.25,6.78,TOZ-.13),e=TP(TOX-.25,6.78,TOZ-.13);
 // Scanlines follow all four projected corners, not an unrelated screen rectangle.
 for(let i=0;i<160;i++){const u=i/160,v=(i+1)/160,x=lerp(a[0],e[0],u),r=lerp(d[0],c[0],u),y=lerp(a[1],e[1],u),yn=lerp(a[1],e[1],v);b.drawImage(lowPlaque,0,i*4,288,4,x,y,r-x,yn-y+.15);}
}
const TORII_HALL=[540,1318,.1];
function toriiShot(b,t){
  const a=t-TOR0,z=1.035+.014*a;b.save();b.translate(540,1000);b.scale(z,z);b.translate(-540-5*a,-1000+2*a);b.drawImage(toriiLow,0,0,W,H);
  // v13：参道尽头的杉林里隐约是拜殿——下一镜的主体，切过去时在画面上的位置相同
  b.save();b.translate(540,TORII_HALL[1]);b.scale(TORII_HALL[2],TORII_HALL[2]);b.translate(-540,-1180);b.drawImage(hallPaint,0,0,W,H);b.restore();
  glow(b,540,TORII_HALL[1]-30,190,110,[226,236,220],.55);
  drawLowPlaque(b);
  morningLight(b,a);toriiGroundLeaves(b);b.restore();
  // v13：夜景那阵风只把近处几片大叶子带过切点，很快飞出画面；鸟居里不再下密集的叶子雨
}
// v19：早晨。太阳在左边杉林后面、低低的，慢慢往上走（这一天的太阳从左边升起，傍晚在右边的海上落下）；
// 光从太阳那边一道道射出来，照亮雾气；鸟居和石灯笼背光，柱子在参道上拖出长影子，影子朝镜头这边、朝右。
function morningLight(b,a){
  const sx=362+4*a,sy=1165-14*a;   // 左柱和拜殿之间、杉林后面
  // 整体：左边暖、右边偏冷一点的晨光
  b.save();b.globalCompositeOperation='multiply';const g=b.createLinearGradient(0,0,W,0);g.addColorStop(0,'rgb(255,236,206)');g.addColorStop(1,'rgb(222,228,236)');b.fillStyle=g;b.fillRect(-200,-200,W+400,H+400);b.restore();
  // 柱子、灯笼的影子：从柱脚往右前方拖长
  b.save();b.fillStyle='rgba(44,52,40,.20)';
  [[150,1548,70],[900,1548,64],[880,1640,0]].forEach(([x,y,w])=>{if(!w)return;b.beginPath();b.moveTo(x-w/2,y);b.lineTo(x+w/2,y);b.lineTo(x+w/2+260,y+380);b.lineTo(x-w/2+170,y+380);b.closePath();b.fill();});
  b.restore();
  b.save();b.globalCompositeOperation='lighter';
  // 光束：从太阳往右下方散开，慢慢转
  for(let i=0;i<9;i++){const ang=-.12+i*.17+Math.sin(a*.35+i*1.7)*.03,len=2300,wd=.035+rnd(i,3301)*.05,al=.06+rnd(i,3302)*.06;
    const q=b.createLinearGradient(sx,sy,sx+Math.cos(ang)*len*.8,sy+Math.sin(ang)*len*.8);q.addColorStop(0,`rgba(255,226,170,${al})`);q.addColorStop(.5,`rgba(255,226,170,${al*.45})`);q.addColorStop(1,'rgba(255,226,170,0)');
    b.fillStyle=q;b.beginPath();b.moveTo(sx,sy);b.lineTo(sx+Math.cos(ang-wd)*len,sy+Math.sin(ang-wd)*len);b.lineTo(sx+Math.cos(ang+wd)*len,sy+Math.sin(ang+wd)*len);b.closePath();b.fill();}
  // 太阳：被杉树挡住一半的亮光，周围一大圈晨雾里的光晕
  glow(b,sx,sy,560,500,[255,214,150],.26);glow(b,sx,sy,190,170,[255,232,186],.42);glow(b,sx,sy,52,52,[255,250,228],.9);
  b.restore();
}
// ======== v8 开场：一张手绘的观光地图（絵地図）========
// 纸上画的弥彦：西边是日本海（远处佐渡），海边隆起弥彦山和多宝山（满山一个个小树章，山顶展望塔、Skyline 山路、缆车索道），
// 东麓是神社的杉林（拜殿屋顶、一之鸟居），往南是红叶谷和观月桥、JR 弥彦站和温泉街，再往东是一块块的稻田。线条略带抖动，像手画的
const MAPPT={bridge:[722,1252],torii:[742,1150],shrine:[684,1062],rope:[652,1004],summit:[466,812]};
function wobPath(b,pts,amp,seed,closed=true){const q=pts.map(([x,y],i)=>[x+(rnd(i,seed)-.5)*amp,y+(rnd(i,seed+1)-.5)*amp]);b.beginPath();b.moveTo((q[0][0]+q[1][0])/2,(q[0][1]+q[1][1])/2);for(let i=1;i<q.length+(closed?1:-1);i++){const a=q[i%q.length],c=q[(i+1)%q.length];b.quadraticCurveTo(a[0],a[1],(a[0]+c[0])/2,(a[1]+c[1])/2);}if(closed)b.closePath();return q;}
const INK='rgba(84,64,44,.55)';
const picMap=layer(b=>{
  b.fillStyle='#f1e6cd';b.fillRect(0,0,W,H);                                         // 纸
  for(let i=0;i<9000;i++){const x=rnd(i,4001)*W,y=rnd(i,4002)*H;b.fillStyle=i%2?'rgba(150,120,80,.06)':'rgba(255,250,236,.12)';b.fillRect(x,y,1+rnd(i,4003)*3,1);}
  for(let i=0;i<260;i++){const x=rnd(i,4004)*W,y=rnd(i,4005)*H,a=rnd(i,4006)*TAU,l=6+rnd(i,4007)*20;b.strokeStyle='rgba(140,110,70,.08)';b.lineWidth=.8;b.beginPath();b.moveTo(x,y);b.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);b.stroke();}   // 纸的纤维
  // 稻田（先铺，在山和海下面）：一块块颜色略不同、边线手画
  // 平原：一层淡淡的水彩（金、黄、浅绿几块晕开），只在一些地方画几道田埂，不把每块田都画出来
  b.fillStyle='#ecdcaa';b.fillRect(240,0,W-240,H);
  for(let i=0;i<90;i++){const x=260+rnd(i,4015)*840,y=rnd(i,4016)*1920,r=60+rnd(i,4017)*140;b.save();b.globalAlpha=.32;b.drawImage(radialSprite([[226,198,128],[214,206,146],[238,214,160],[200,190,120],[230,186,110]][i%5],1.4),x-r,y-r*.7,r*2,r*1.4);b.restore();}
  for(let i=0;i<70;i++){const x=300+rnd(i,4018)*760,y=40+rnd(i,4019)*1860,a=(rnd(i,4020)-.5)*.5,n=3+Math.floor(rnd(i,4021)*4),l=30+rnd(i,4022)*50;b.save();b.translate(x,y);b.rotate(a);b.strokeStyle='rgba(170,140,86,.38)';b.lineWidth=1;
    for(let k=0;k<n;k++){b.beginPath();b.moveTo(-l/2,k*9);b.lineTo(l/2,k*9);b.stroke();}b.beginPath();b.moveTo(-l/2+l*rnd(i,4023),-3);b.lineTo(-l/2+l*rnd(i,4023),n*9-6);b.stroke();b.restore();}   // 几小片田埂
  for(const pts of [[[600,300],[700,520],[820,620],[1080,700]],[[760,1320],[700,1560],[640,1920]],[[880,1300],[1080,1260]],[[300,1500],[520,1460],[700,1560]]]){b.strokeStyle='#f6ecd2';b.lineWidth=4;b.beginPath();pts.forEach((p,i)=>b[i?'lineTo':'moveTo'](...p));b.stroke();b.strokeStyle='rgba(130,100,60,.35)';b.lineWidth=1;b.stroke();}   // 几条乡间路
  b.strokeStyle='#9cc4cc';b.lineWidth=6;b.lineCap='round';b.beginPath();b.moveTo(1090,420);b.bezierCurveTo(900,560,980,760,860,880);b.bezierCurveTo(780,960,880,1080,820,1150);b.stroke();b.strokeStyle='rgba(255,255,255,.5)';b.lineWidth=1.5;b.stroke();   // 一条河
  // 海
  const coast=[[360,-20],[330,160],[300,330],[284,480],[268,640],[262,800],[250,960],[236,1120],[214,1300],[190,1480],[160,1680],[130,1940]];
  b.fillStyle='#a8ccd2';b.beginPath();b.moveTo(-20,-20);coast.forEach(p=>b.lineTo(...p));b.lineTo(-20,1940);b.closePath();b.fill();
  b.strokeStyle='#f3e9cf';b.lineWidth=10;b.beginPath();coast.forEach((p,i)=>b[i?'lineTo':'moveTo'](p[0]+4,p[1]));b.stroke();          // 沙滩
  b.strokeStyle=INK;b.lineWidth=2;b.beginPath();coast.forEach((p,i)=>b[i?'lineTo':'moveTo'](...p));b.stroke();
  for(let i=0;i<70;i++){const y=40+rnd(i,4021)*1860,xMax=contourY(coast.map(([x,y])=>[y,x]),y)-30,x=10+rnd(i,4022)*Math.max(10,xMax-20);b.strokeStyle='rgba(255,255,255,.7)';b.lineWidth=1.6;b.beginPath();b.arc(x,y,9,Math.PI*1.15,Math.PI*1.85);b.arc(x+16,y,9,Math.PI*1.15,Math.PI*1.85);b.stroke();}   // 浪花的小弧线
  b.fillStyle='#d9d3a8';wobPath(b,[[10,560],[70,520],[140,540],[170,600],[120,660],[40,680],[0,640]],6,4031);b.fill();b.strokeStyle=INK;b.lineWidth=1.6;b.stroke();   // 佐渡（远远的一块）
  // 山：沿海边南北走向的一道山脉（地图上俯看的样子）：中间一条山脊，北边多宝山、南边弥彦山两个山顶；西坡背光，东坡亮，几道支脉往下伸
  const ridgeX=y=>440+Math.sin((y-500)/260)*26-Math.max(0,(y-1000))*.12;
  const wid=y=>{const u=clamp((y-470)/780);return 20+190*Math.pow(Math.sin(Math.PI*u),.65);};
  const westE=y=>ridgeX(y)-wid(y)*(1+.13*Math.sin(y/37+1)+.08*Math.sin(y/14)+.05*Math.sin(y/7.3)),eastE=y=>ridgeX(y)+wid(y)*(1.12+.16*Math.sin(y/41)+.09*Math.sin(y/16+2)+.05*Math.sin(y/6.1));   // 两边的边缘有起伏（一道道支脉伸出去）
  const mass=new Path2D();mass.moveTo(ridgeX(462),462);for(let y=462;y<=1252;y+=6)mass.lineTo(eastE(y),y);for(let y=1252;y>=462;y-=6)mass.lineTo(westE(y),y);mass.closePath();
  b.save();b.translate(-16,12);b.fillStyle='rgba(90,64,40,.2)';b.fill(mass);b.restore();   // 影子
  b.fillStyle='#c8904c';b.fill(mass);b.save();b.clip(mass);
  b.fillStyle='rgba(96,58,40,.32)';b.beginPath();b.moveTo(0,400);for(let y=400;y<=1300;y+=10)b.lineTo(ridgeX(y),y);b.lineTo(0,1300);b.closePath();b.fill();   // 西坡背光
  for(const [py,r] of [[600,170],[810,200]]){b.save();b.globalCompositeOperation='lighter';glow(b,ridgeX(py)+40,py,r,r*.8,[255,220,150],.16);b.restore();}   // 两个山头被照亮
  const st=[];for(let i=0;i<5200;i++){const x=200+rnd(i,4047)*640,y=450+rnd(i,4048)*820;if(!b.isPointInPath(mass,x*2,y*2))continue;st.push([y,x,i]);}
  st.sort((p,q)=>p[0]-q[0]).forEach(([y,x,i])=>{const ev=rnd(i,4049)<.14,h=8+rnd(i,4050)*6,west=x<ridgeX(y);const pal=ev?['#3a5034','#557046','#7a9258']:[['#8a3a24','#c25a30','#e8874a'],['#9a6a2a','#cf9a44','#ecc066'],['#7a2c22','#b8432c','#e0663e'],['#8a5a2c','#bc8442','#deaa5c']][i%4];
    treeCrown(b,x,y,h,h*(ev?.32:.62),4051*7+i,west?pal.map(c=>blendTone(c,'#5a3a30',.25)):pal,ev);});
  b.strokeStyle='rgba(255,236,200,.45)';b.lineWidth=2;b.beginPath();for(let y=470;y<=1240;y+=10)b[y===470?'moveTo':'lineTo'](ridgeX(y),y);b.stroke();   // 山脊线
  for(const [y0,dx] of [[560,1],[640,-1],[720,1],[880,1],[930,-1],[1010,1],[1080,-1],[1150,1]]){b.strokeStyle='rgba(255,230,190,.25)';b.lineWidth=1.5;b.beginPath();b.moveTo(ridgeX(y0),y0);b.quadraticCurveTo(ridgeX(y0)+dx*80,y0+30,ridgeX(y0)+dx*150,y0+80);b.stroke();}   // 支脉
  b.restore();b.strokeStyle=INK;b.lineWidth=2.2;b.stroke(mass);
  const hillP=[[214,1360],[236,1300],[276,1256],[330,1238],[386,1250],[432,1290],[462,1340],[476,1376]];   // 南边的小山
  b.fillStyle='#c39050';wobPath(b,hillP,4,4045);b.fill();b.save();b.clip();for(let i=0;i<500;i++){const x=214+rnd(i,4091)*262,y=1236+rnd(i,4092)*140,h=8+rnd(i,4093)*5;treeCrown(b,x,y,h,h*.62,4094+i,[['#8a3a24','#c25a30','#e8874a'],['#9a6a2a','#cf9a44','#ecc066'],['#3a5034','#557046','#7a9258']][i%3],i%3===2);}b.restore();wobPath(b,hillP,4,4045);b.strokeStyle=INK;b.lineWidth=1.8;b.stroke();
  // Skyline 山路（弯弯的一条）
  const road=[[300,1250],[352,1170],[330,1090],[392,1010],[378,930],[430,880],[458,830],[452,760],[414,690],[436,620],[480,580],[560,560]];
  b.strokeStyle='#f6eedb';b.lineWidth=5;b.lineJoin='round';b.beginPath();road.forEach((p,i)=>b[i?'lineTo':'moveTo'](...p));b.stroke();b.strokeStyle='rgba(120,90,60,.45)';b.lineWidth=1;b.stroke();
  // 缆车索道 + 山顶展望塔
  b.strokeStyle='#3a342e';b.lineWidth=1.8;b.setLineDash([7,5]);b.beginPath();b.moveTo(...MAPPT.rope);b.lineTo(480,818);b.stroke();b.setLineDash([]);
  refinedCabin(b,566,910,.11);
  b.fillStyle='#f6f3e8';b.fillRect(462,764,8,48);b.strokeStyle=INK;b.lineWidth=1.4;b.strokeRect(462,764,8,48);b.fillStyle='#e9e4d4';b.beginPath();b.ellipse(466,768,12,6,0,0,TAU);b.fill();b.stroke();
  // 神社的杉林、拜殿、一之鸟居、参道
  b.fillStyle='#41583c';wobPath(b,[[600,1000],[660,982],[730,992],[780,1030],[792,1100],[760,1150],[690,1160],[630,1130],[598,1070]],5,4061);b.fill();b.strokeStyle=INK;b.lineWidth=1.8;b.stroke();
  for(let i=0;i<120;i++){const x=600+rnd(i,4062)*190,y=990+rnd(i,4063)*160;if(Math.hypot((x-694)/96,(y-1070)/82)>1)continue;treeCrown(b,x,y,14+rnd(i,4064)*8,5,4065+i,[['#1e3626','#2e4c34','#4c6a48'],['#24402c','#36583c','#587652']][i%2],true);}
  b.fillStyle='#cfc6a6';wobPath(b,[[742,1150],[760,1162],[800,1240],[780,1246],[746,1170]],2,4066);b.fill();   // 参道
  poly(b,[[656,1062],[684,1046],[712,1062]],'#5f8a7c');b.fillStyle='#e6dcc4';b.fillRect(662,1062,44,12);b.fillStyle='#4a6a60';b.fillRect(658,1060,52,4);b.strokeStyle=INK;b.lineWidth=1.2;b.strokeRect(662,1062,44,12);   // 拜殿
  // 红叶谷 + 观月桥
  b.fillStyle='#b8462c';wobPath(b,[[650,1196],[720,1184],[800,1200],[820,1260],[790,1310],[700,1316],[648,1280]],5,4071);b.fill();b.strokeStyle=INK;b.lineWidth=1.6;b.stroke();
  for(let i=0;i<90;i++){const x=650+rnd(i,4072)*170,y=1190+rnd(i,4073)*126;if(Math.hypot((x-735)/86,(y-1252)/62)>1)continue;treeCrown(b,x,y,12+rnd(i,4074)*7,8,4075+i,[['#7a1f1c','#c23a2a','#ec6a3a'],['#8a3a1e','#d05a2a','#f08a3e'],['#8a5a20','#c8902e','#ecbc4a']][i%3]);}
  b.strokeStyle='#e04a2e';b.lineWidth=4;b.beginPath();b.moveTo(698,1258);b.quadraticCurveTo(722,1240,746,1258);b.stroke();b.lineWidth=1.5;b.beginPath();b.moveTo(698,1252);b.quadraticCurveTo(722,1234,746,1252);b.stroke();
  // JR 弥彦站、温泉街、铁路
  b.strokeStyle='#3a342e';b.lineWidth=4;b.beginPath();b.moveTo(880,1300);b.lineTo(960,1420);b.lineTo(1100,1560);b.stroke();b.strokeStyle='#f6f0de';b.lineWidth=2;b.setLineDash([10,10]);b.stroke();b.setLineDash([]);
  for(let i=0;i<26;i++){const x=820+rnd(i,4081)*130,y=1150+rnd(i,4082)*150,w=14+rnd(i,4083)*10;b.fillStyle='#f6efe0';b.fillRect(x-w/2,y-w*.3,w,w*.5);poly(b,[[x-w/2-2,y-w*.3],[x,y-w*.7],[x+w/2+2,y-w*.3]],['#5a5a66','#8a4a3a','#6a5a4a'][i%3]);b.strokeStyle=INK;b.lineWidth=.8;b.strokeRect(x-w/2,y-w*.3,w,w*.5);}
  b.fillStyle='#f6efe0';b.fillRect(862,1286,40,16);poly(b,[[858,1286],[882,1272],[906,1286]],'#7a4a3a');b.strokeStyle=INK;b.lineWidth=1.2;b.strokeRect(862,1286,40,16);   // 车站
  // 平原上的村子和稻架树（小）
  for(const [cx,cy] of [[900,980],[1010,1120],[880,1520],[620,1520],[1000,1700],[470,1660],[760,1800]]){for(let i=0;i<8;i++){const x=cx+(rnd(i,cx)-.5)*60,y=cy+(rnd(i,cy)-.5)*40;if(i%3===0)treeCrown(b,x,y,12,7,cx+i,[['#4a5a3a','#6a7a4a','#8e9a5a'],['#8a3a24','#c25a30','#e8874a']][i%2]);else{b.fillStyle='#f4ecdc';b.fillRect(x-6,y-3,12,6);poly(b,[[x-7,y-3],[x,y-8],[x+7,y-3]],'#6a5a50');}}}
  for(const [x0,y0,x1,y1] of [[560,1420,700,1430],[820,1640,980,1650],[400,1560,520,1566]]){for(let k=0;k<=12;k++){const x=x0+(x1-x0)*k/12,y=y0+(y1-y0)*k/12;b.strokeStyle='#5a4a32';b.lineWidth=1;b.beginPath();b.moveTo(x,y);b.lineTo(x,y-10);b.stroke();b.fillStyle='#4f6040';b.beginPath();b.ellipse(x,y-11,2.5,4,0,0,TAU);b.fill();}}
  // 纸边一圈暗一点
  const v=b.createRadialGradient(540,960,600,540,960,1250);v.addColorStop(0,'rgba(120,90,50,0)');v.addColorStop(1,'rgba(120,90,50,.22)');b.fillStyle=v;b.fillRect(0,0,W,H);
},W,H,2);
// ======== v8 地图上的动作：路线、标记、圆形的窗 ========
// v11 keeps Claude's hand-drawn overview, enlarges its landmarks, and exits once.
const overviewDetails=layer(b=>{
 b.drawImage(picMap,0,0,W,H);
 // Bridge, temple and cable are large enough to identify on a phone.
 b.fillStyle='#547b7a';b.beginPath();b.ellipse(722,1252,68,29,-.08,0,TAU);b.fill();
 b.strokeStyle='#89332c';b.lineWidth=12;b.beginPath();b.moveTo(660,1255);b.quadraticCurveTo(722,1219,784,1255);b.stroke();
 b.strokeStyle='#e57e51';b.lineWidth=4;b.beginPath();b.moveTo(660,1242);b.quadraticCurveTo(722,1206,784,1242);b.stroke();
 for(let i=0;i<9;i++){const x=662+i*15,y=1242-18*Math.sin(i/8*Math.PI);b.beginPath();b.moveTo(x,y);b.lineTo(x,y+13);b.stroke();}
 b.fillStyle='#e6d6b4';b.fillRect(646,1045,77,32);b.fillStyle='#3d3a2d';b.fillRect(673,1054,21,23);
 poly(b,[[634,1048],[682,1012],[736,1048],[718,1054],[682,1032],[652,1054]],'#35594c','#a7a583',2);
 b.fillStyle='#b95033';b.fillRect(730,1120,7,43);b.fillRect(762,1120,7,43);b.fillRect(722,1116,55,7);b.fillRect(726,1130,47,5);
 refinedCabin(b,563,897,.19);
},W,H,1.5);
// Two opening studies share the same film from 2.2s onwards. These are
// stylised compositions, not surveyed viewpoints or navigation maps.
let openingVariant=params.get('opening')==='C'?'C':'A';
const openingCache={};
const openingPalettes=[['#5e3434','#94483e','#c47458'],['#6a3a30','#a8664a','#d39d72'],['#3a4a42','#52664f','#7d8c6c'],['#6e4234','#b07a52','#d5ab7c'],['#3c5236','#5d7a48','#93a868'],['#7a6428','#bc9a3c','#e6cc6c']];   // v15：加了还绿的树、黄叶
function openingTerrain(b,points,seed,count=950,scale=1){
 // Extend the two closing ground corners off-canvas before smoothing;
 // otherwise rounded polygon corners expose triangular sea gaps below.
 const outline=points.map(([x,y],i)=>y>=1900?[i===points.length-1?-1200:2280,3200]:[x,y]);
 b.save();wobPath(b,outline,8,seed);b.fillStyle='#60443c';b.fill();b.clip();
 const left=Math.min(...points.map(p=>p[0])),right=Math.max(...points.map(p=>p[0]));
 const top=Math.min(...points.map(p=>p[1])),bottom=Math.max(...points.map(p=>p[1]));
 grad(b,left,top,right-left,bottom-top,[[0,'#926447'],[.6,'#864235'],[1,'#412e36']]);
 const trees=Array.from({length:Math.round(count*1.25)},(_,i)=>({i,x:left+rnd(i,seed)*(right-left),y:top+rnd(i,seed+1)*(bottom-top)})).sort((a,c)=>a.y-c.y);
 for(const {i,x,y}of trees){
  const h=(24+38*(y-top)/(bottom-top))*(.7+rnd(i,seed+2)*.8)*scale;
  const patch=Math.sin(x*.013+y*.006)+Math.cos(y*.017-x*.004),pi=terrainPal(i,seed,patch);
  treeCrown(b,x,y,h,h*(pi===2?.28:.68),seed+i*5,openingPalettes[pi],pi===2);
 }
 // Soft light follows the slope; no hard terrain stripes or map grid.
 glow(b,right-130,top+100,390,360,[255,200,137],.12);
 b.restore();
 // v15：山脊上沿着轮廓再种一排树冠（不裁），山的边缘是一棵棵树的轮廓，不是一条光滑的线把树切掉
 for(let s=0;s<points.length-1;s++){const [x0,y0]=points[s],[x1,y1]=points[s+1];if(y0>=1900||y1>=1900||Math.max(x0,x1)<-60||Math.min(x0,x1)>1140)continue;
  const n=Math.ceil(Math.hypot(x1-x0,y1-y0)/26);
  for(let k=0;k<n;k++){const i=s*97+k,u=(k+rnd(i,seed+11))/n,x=x0+(x1-x0)*u,y=y0+(y1-y0)*u,h=(16+rnd(i,seed+12)*12)*scale;
   const patch=Math.sin(x*.013+y*.006)+Math.cos(y*.017-x*.004),pi=terrainPal(i+5000,seed,patch);
   treeCrown(b,x,y+h*.42,h,h*(pi===2?.28:.68),seed+9000+i,openingPalettes[pi],pi===2);}}
}
// v15：红叶谷那一片（池塘周围）绿、黄多一些，红少一些，桥才跳得出来
const GREENER_SEEDS=[];   // v16：不再刻意加绿加黄（太花）
function terrainPal(i,seed,patch){
 if(GREENER_SEEDS.includes(seed)){const r=rnd(i,seed+3);return r<.3?4:r<.42?2:r<.6?5:r<.82?1:patch>.3?3:0;}
 return rnd(i,seed+3)<.12?2:patch>.7?3:patch<-.5?0:1;
}
function openingBridge(b,x,y,s){
 b.save();b.translate(x,y);b.scale(s,s);
 // Same span, sinusoidal arch, rails and cap spacing as the night bridge.
 // Only the daylight palette and the partly concealed supports differ.
 const k=460/950,arch=x=>-Math.sin(clamp((x+230)/460)*Math.PI)*60*k;
 const band=(top,bottom,color)=>poly(b,Array.from({length:49},(_,i)=>{const x=-230+i*460/48;return[x,arch(x)+top*k];}).concat(Array.from({length:49},(_,i)=>{const x=230-i*460/48;return[x,arch(x)+bottom*k];})),color);
 for(const xx of[-104,60,143]){const yy=arch(xx)+14;b.strokeStyle='#654539';b.lineWidth=5;b.beginPath();b.moveTo(xx,yy);b.lineTo(xx,55);b.stroke();b.lineWidth=3;b.beginPath();b.moveTo(xx,yy+22);b.lineTo(xx-13,yy);b.moveTo(xx,yy+22);b.lineTo(xx+13,yy);b.stroke();}
 band(-3,27,'#d8402a');band(18,30,'#4a1812');band(-3,1,'#ffc09a');   // v15：朱红更正、上沿亮、下沿暗，和周围的红叶拉开
 for(let j=0;j<3;j++){
  b.strokeStyle=j?'#e04a2c':'#ff9a68';b.lineWidth=(j?5:8)*k;b.beginPath();
  for(let xx=-230;xx<=230;xx+=2)b[xx===-230?'moveTo':'lineTo'](xx,arch(xx)+(-51+j*18)*k);b.stroke();
 }
 for(let xx=-230;xx<=230;xx+=48*k){b.fillStyle='#e8532f';b.fillRect(xx-3.2*k,arch(xx)-51*k,6.4*k,51*k);}
 for(const xx of[-230,-115,0,115,230]){
  b.fillStyle='#c63d26';b.fillRect(xx-7*k,arch(xx)-66*k,14*k,67*k);
  b.fillStyle='#465047';b.beginPath();b.moveTo(xx-8*k,arch(xx)-66*k);b.quadraticCurveTo(xx-12*k,arch(xx)-73*k,xx,arch(xx)-80*k);b.quadraticCurveTo(xx+12*k,arch(xx)-73*k,xx+8*k,arch(xx)-66*k);b.closePath();b.fill();
 }
 b.restore();
}
function openingShrine(b,x,y,s){
 b.save();b.translate(x,y);b.scale(s,s);
 b.fillStyle='#d0c4a5';b.fillRect(-74,-20,148,44);
 b.fillStyle='#493c31';for(let xx=-64;xx<=64;xx+=21)b.fillRect(xx,-20,5,44);
 b.fillStyle='#273c36';b.fillRect(-31,-18,62,39);
 poly(b,[[-96,-22],[-74,-31],[-30,-51],[0,-77],[30,-51],[74,-31],[96,-22],[60,-15],[-60,-15]],'#33574d','#b8ad87',3);
 poly(b,[[-41,-21],[0,-52],[41,-21],[24,-17],[0,-38],[-24,-17]],'#43675b','#d7bd85',2);
 b.strokeStyle='#dab77c';b.lineWidth=2;b.beginPath();b.moveTo(-78,-21);b.lineTo(78,-21);b.stroke();
 b.fillStyle='#aaa58e';b.fillRect(-83,24,166,7);b.restore();
}
function openingAtmosphere(b,warm=false){
 grad(b,0,0,W,H,[[0,warm?'#283b57':'#233e54'],[.26,warm?'#8195a3':'#8daeba'],[.48,warm?'#eed0ac':'#d1dfd7'],[1,'#64878a']]);
 softCloud(b,800,220,670,32,6201,.13);softCloud(b,310,550,610,18,6203,.12);
 const horizon=warm?720:570;
 grad(b,0,horizon,W,H-horizon,[[0,warm?'#c5c4b5':'#94b5bc'],[.23,'#739da9'],[1,'#365e70']]);
 for(let i=0;i<105;i++){
  const y=horizon+20+rnd(i,6211)*700,x=rnd(i,6212)*W;
  b.strokeStyle='rgba(233,234,210,'+(.08+rnd(i,6213)*.14)+')';b.lineWidth=.7+rnd(i,6214);
  b.beginPath();b.moveTo(x,y);b.lineTo(x+12+rnd(i,6215)*95,y);b.stroke();
 }
 // A distant island silhouette, intentionally atmospheric rather than a pin.
 poly(b,[[-80,horizon+25],[65,horizon+17],[135,horizon-7],[210,horizon-10],[290,horizon+7],[360,horizon+25]],warm?'#8e9fa6':'#7999a5');
}
function openingAssets(kind){
 if(openingCache[kind])return openingCache[kind];
 const background=layer(b=>{
  openingAtmosphere(b,kind==='C');
  if(kind==='A'){
   // The sea stays beyond a continuous ridge. The park's enclosed water
   // and the shrine's eastern foothill must not read as a seaside complex.
   openingTerrain(b,[[-180,950],[30,920],[190,944],[330,891],[480,819],[610,728],[700,674],[780,657],[875,707],[990,768],[1200,845],[1200,1950],[-180,1950]],6251,2600,1.05);
   // A wooded shoulder separates the lower station from the shrine clearing.
   openingTerrain(b,[[-150,1110],[40,1030],[210,1010],[380,1070],[550,1040],[690,1110],[830,1200],[1190,1240],[1190,1950],[-150,1950]],6257,1800,1);
   const lower=[520,1060],upper=[714,747];
   b.strokeStyle='#43524c';b.lineWidth=2;b.beginPath();b.moveTo(...lower);b.lineTo(...upper);b.stroke();
   b.strokeStyle='rgba(224,217,179,.6)';b.lineWidth=1;b.beginPath();b.moveTo(lower[0]+3,lower[1]);b.lineTo(upper[0]+3,upper[1]);b.stroke();
   // Small terminals sit on land, below the crest rather than on a bare tip.
   for(const [x,y]of[lower,upper]){b.fillStyle='#c5c1a7';b.fillRect(x-17,y-6,34,14);poly(b,[[x-23,y-6],[x-9,y-17],[x+19,y-17],[x+24,y-6]],'#465f54');}
   const carX=620,carY=lower[1]+(upper[1]-lower[1])*(carX-lower[0])/(upper[0]-lower[0]);refinedCabin(b,carX,carY,.22);
   // A modest clearing and a bent approach distinguish the shrine precinct
   // from the park. It is not the lower ropeway station or a summit building.
   wobPath(b,[[758,1125],[821,1114],[911,1131],[942,1176],[889,1200],[811,1195],[756,1170]],5,6259);b.fillStyle='#9b9e80';b.fill();
   b.strokeStyle='#a4a384';b.lineWidth=18;b.lineCap='butt';b.beginPath();b.moveTo(844,1175);b.quadraticCurveTo(881,1210,855,1240);b.quadraticCurveTo(829,1305,886,1450);b.stroke();
   const woods=Array.from({length:145},(_,i)=>({i,x:660+rnd(i,6261)*450,y:1045+rnd(i,6262)*277})).sort((a,c)=>a.y-c.y);
   let hallPainted=false;
   for(const {i,x,y}of woods){
    if(!hallPainted&&y>1170){openingShrine(b,848,1158,.75);hallPainted=true;}
    const clearing=Math.hypot((x-848)/119,(y-1157)/76)<1,approach=y>1160&&Math.abs(x-855)<47;
    if(clearing||approach)continue;
    gladeCedar(b,x,y,38+rnd(i,6263)*65,15+rnd(i,6264)*14,6270+i,['#29443b','#3d5c4a','#73866b'],.6);
   }
   if(!hallPainted)openingShrine(b,848,1158,.75);
   b.save();b.translate(855,1268);b.fillStyle='#a94231';b.fillRect(-27,-44,6,61);b.fillRect(21,-44,6,61);b.fillRect(-35,-47,70,7);b.fillRect(-29,-29,58,5);b.restore();
   // Park banks form a separate foreground valley, with no open water route
   // to the sea and no straight path from the bridge to the shrine.
   openingTerrain(b,[[-180,1190],[-20,1137],[140,1146],[285,1172],[438,1160],[593,1192],[730,1354],[930,1415],[1200,1420],[1200,1950],[-180,1950]],6291,1100,1.05);
   const pond=new Path2D();pond.moveTo(285,1201);pond.bezierCurveTo(375,1180,438,1210,485,1224);pond.bezierCurveTo(540,1241,560,1288,553,1328);pond.bezierCurveTo(546,1380,607,1410,557,1470);pond.bezierCurveTo(504,1532,385,1537,338,1585);pond.bezierCurveTo(300,1626,196,1595,175,1555);pond.bezierCurveTo(150,1506,231,1457,208,1405);pond.bezierCurveTo(187,1368,146,1317,183,1278);pond.bezierCurveTo(213,1244,245,1210,285,1201);pond.closePath();
   b.save();b.clip(pond);grad(b,100,1180,550,470,[[0,'#506b58'],[.4,'#294d48'],[1,'#182f36']]);
   // v12：水面不是平涂的一块——映着岸上的红叶（边上一圈暖色、中间斑驳），岸下一道暗影，一道天光，水上漂着落叶
   for(let i=0;i<46;i++)glow(b,170+rnd(i,6281)*440,1185+rnd(i,6282)*445,50+rnd(i,6283)*70,18+rnd(i,6284)*20,[[198,96,52],[214,140,70],[120,60,44]][i%3],.13+rnd(i,6285)*.1);
   b.lineJoin='round';b.lineWidth=44;b.strokeStyle='rgba(196,96,52,.2)';b.stroke(pond);
   b.lineWidth=12;b.strokeStyle='rgba(16,28,26,.5)';b.stroke(pond);
   glow(b,330,1420,230,40,[196,214,206],.13);
   for(let i=0;i<70;i++){const x=180+rnd(i,6287)*420,y=1200+rnd(i,6288)*420;b.fillStyle=['#d0703c','#b84a30','#e2a254'][i%3];b.beginPath();b.ellipse(x,y,2+rnd(i,6289)*2.5,1.2+rnd(i,6290)*1.2,rnd(i,6291)*3,0,TAU);b.fill();}
   // Reflection pivots around the waterline instead of floating above it.
   b.save();b.globalAlpha=.2;b.translate(0,1335);b.scale(1,-.78);b.translate(0,-1335);openingBridge(b,365,1270,1.12);b.restore();
   for(let i=0;i<36;i++){b.strokeStyle='rgba(177,196,162,.15)';b.lineWidth=1.2;b.beginPath();const y=1260+i*8,x=190+rnd(i,6299)*240;b.moveTo(x,y);b.lineTo(x+25+rnd(i,6300)*82,y);b.stroke();}b.restore();
   // Stone abutments and short approach paths plant both bridge ends on land.
   for(const [x,side]of [[107,-1],[623,1]]){
    b.strokeStyle='#b0a17b';b.lineWidth=20;b.beginPath();b.moveTo(x,1270);b.quadraticCurveTo(x+side*42,1260,x+side*68,1300);b.stroke();
    poly(b,[[x-20,1268],[x+20,1268],[x+29,1308],[x-26,1310]],'#6b6652');
    b.strokeStyle='#a59b7a';b.lineWidth=2;b.beginPath();b.moveTo(x-19,1281);b.lineTo(x+21,1281);b.moveTo(x-22,1294);b.lineTo(x+25,1294);b.stroke();
   }
   openingBridge(b,365,1270,1.12);
   for(const [x,y]of [[180,1290],[183,1360],[209,1410],[180,1510],[220,1592],[390,1551],[550,1475],[563,1360]]){
    b.fillStyle='#56604e';b.beginPath();b.ellipse(x,y,9+rnd(x,y)*12,4+rnd(y,x)*5,-.2,0,TAU);b.fill();
   }
   for(const [x,y,rx,ry,seed]of [[20,1190,130,128,6321],[645,1244,106,108,6323],[-20,1450,175,145,6325],[680,1500,128,115,6327]])dayCrown(b,x,y,rx,ry,seed,430);
   // 岸边的树冠压住水边，让池塘的轮廓断开，不是一个光滑的圆团
   for(const [x,y,rx,ry,seed]of [[178,1352,58,40,6331],[262,1618,92,56,6335],[572,1430,64,46,6339]])dayCrown(b,x,y,rx,ry,seed,300);
  }else{
   // Scenic panorama, not a map: an open sea horizon behind layered slopes.
   wobPath(b,[[530,1120],[665,1010],[810,897],[890,914],[980,960],[1150,977],[1150,1450],[490,1450]],4,6341);b.fillStyle='#8aa3a5';b.fill();
   openingTerrain(b,[[-100,1060],[75,1030],[230,1080],[375,1175],[580,1280],[835,1340],[1150,1370],[1150,1950],[-100,1950]],6351,1400,1.2);
   openingTerrain(b,[[400,1590],[500,1380],[610,1190],[730,1020],[835,960],[925,941],[1015,986],[1150,1080],[1220,2040],[300,2040]],6361,1050,1.05);
   // Air between slopes is a local, feathered veil, not a horizontal band.
   glow(b,430,1120,390,160,[201,212,196],.24);
   for(let i=0;i<80;i++){
    const x=720+rnd(i,6371)*330,y=1230+rnd(i,6372)*190;
    gladeCedar(b,x,y,30+rnd(i,6373)*55,13+rnd(i,6374)*12,6380+i,['#263d39','#3f584a','#70836a'],.5);
   }
   // A restrained roof among the trees; no route, pins or oversized icons.
   openingShrine(b,850,1320,.38);
  }
 },W,H,1.25);
 const foreground=layer(b=>{
  // Only remove the opening A lower-corner overlay trees and their branches.
  if(kind==='A')return;
  branch(b,-100,1900,440,-1.18,18,4,6411);branch(b,1180,1900,460,-2.05,21,4,6413);
  const groups=kind==='A'?[[0,1740,210,170],[1030,1730,260,190],[280,1970,360,190],[850,1990,400,200]]:
    [[-110,1010,230,190],[1190,930,245,210],[-30,1540,240,220],[1110,1600,230,210],[160,1930,410,240],[950,1980,470,250]];
  groups.forEach(([x,y,rx,ry],i)=>dayCrown(b,x,y,rx,ry,6441+i*3,650));
 },W,H,1.25);
 return openingCache[kind]={background,foreground};
}
function openingCameraA(t){
 // v13：不再一路推进池塘；轻推的同时往上抬，把天空留出来给月亮
 // v15：恢复推向桥（夜景镜像后，桥的位置按镜像后的夜景对齐）；先停在全景看月亮升起、天变暗，再推
 // v16：往桥的方向推，但推得浅一些，天和月亮一直留在画面里（下一镜要接着用）
 {const p=ease(clamp((t-1.2)/1.6));return {z:lerp(1,OVCAM_END.z,p),x:lerp(540,OVCAM_END.x,p),y:lerp(960,OVCAM_END.y,p)};}
 const p=ease(clamp((t-.65)/1.55)),night=cameraState(2.2,'reveal');
 // Match the bridge span and deck baseline to the first night frame.
 const endZ=night.z*950/(460*1.12),endX=365-night.z*(545-night.x)/endZ,endY=1270-night.z*(1090-night.y)/endZ;
 return {z:lerp(1,endZ,p),x:lerp(540,endX,p),y:lerp(960,endY,p)};
}
function overviewShot(b,t){
 const kind=openingVariant,{background,foreground}=openingAssets(kind),u=clamp(t/2.2);
 const push=ease(clamp((t-.65)/1.55));
 if(kind==='A'){overviewDay(b,t,background,foreground);return;}
 b.save();
 camera(b,1+.035*u,540+15*u,960-12*u);
 b.drawImage(background,0,0,W,H);b.restore();
 // Overscan keeps the pre-rendered foliage edges outside the frame during parallax.
 const pv=ease(clamp((t-.3)/(OV-.3)));b.save();b.translate(W/2+(kind==='A'?-20*pv:-12*u),H/2+(kind==='A'?230*pv:12*u));b.scale(1.08,1.08);b.drawImage(foreground,-W/2,-H/2,W,H);b.restore();
 // Maintain the existing title layout; sky remains calm behind the header.
 grad(b,0,0,W,570,[[0,'rgba(10,25,41,.3)'],[1,'rgba(10,25,41,0)']]);
 // A uses a geometry-matched day/night cut, avoiding two superimposed bridges.
 if(kind==='C'&&t>2){const c=irisC.getContext('2d');c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,W,H);valleyShot(c,t,'reveal',false);b.save();b.globalAlpha=ease(clamp((t-2)/.2));b.drawImage(irisC,0,0);b.restore();}
 windLeaves(b,t*2.2/OV);   // 飞叶的时钟和夜景接上
 if(kind==='A'){duskTint(b,duskColor(t));openingMoon(b,t);}
}
// v14：月亮按真实的样子走——从海平线斜着往右上升起（越升越平一点），开始快、之后慢慢走；夜景里接着走
// v16：同一个月亮——开场升起来的月亮停在天上，换景后夜景接着用（同一片天、同一个位置），往右上慢慢走
const MOON_END=[760,350],MOON_D=[.616,-.788],MOON_N=[.788,.616];
const OVCAM_END={z:1.3,x:440,y:940};
const moonLo=t=>t<.6?0:136.6*(1-Math.exp(-(t-.6)/.7))+12*(t-.6),MOON_LO_END=moonLo(3.6);
function moonWorld(t){const d=moonLo(t)-MOON_LO_END,k=.0006*d*d,ex=OVCAM_END.x+(MOON_END[0]-540)/OVCAM_END.z,ey=OVCAM_END.y+(MOON_END[1]-960)/OVCAM_END.z;return [ex+d*MOON_D[0]+k*MOON_N[0],ey+d*MOON_D[1]+k*MOON_N[1]];}
function moonScreen(T){if(T<=OV){const w=moonWorld(T);return [540+(w[0]-OVCAM_END.x)*OVCAM_END.z,960+(w[1]-OVCAM_END.y)*OVCAM_END.z];}
  const v=12*OVCAM_END.z*(T-OV);return [MOON_END[0]+v*MOON_D[0],MOON_END[1]+v*MOON_D[1]];}
// v13：入夜分两段——先变成暖黄的傍晚，再沉到蓝色的夜；整整 3 秒，看得出来
// v14：开场 = 天幕（白天 → 暖黄 → 夜空，带月亮）+ 下面的布景（海、山、红叶谷）。
// 最后像话剧换景：天幕和月亮不动，白天的布景沉下去，夜里的红叶谷从下面升上来（灯还没亮）。
const STAGE_OUT=[2.85,.5],STAGE_IN=[3.0,.6];
function overviewA(b,t,background,foreground){
  const c=openingCameraA(t),hs=960+(570-c.y)*c.z,night=ease(clamp((t-1.5)/1.5)),push=ease(clamp((t-1.2)/1.6));
  if(t>=STAGE_OUT[0]){SKYONLY=true;valleyShot(b,t-OVS,'reveal',false);SKYONLY=false;}   // 换景时露出来的天幕：夜景的夜空和月亮
  else{
    b.save();camera(b,c.z,c.x,c.y);b.beginPath();b.rect(-600,-600,2400,1170);b.clip();b.drawImage(background,0,0,W,H);b.restore();
    duskTint(b,duskColor(Math.min(t,2.2)));
    if(night>0){b.save();b.globalAlpha=night;b.drawImage(nightSkyL,0,0,W,H);b.restore();}
    overviewMoon(b,t,c);
  }
  // 夜里的红叶谷从下面升上来
  const up=t<STAGE_IN[0]?1:1-easeOut(clamp((t-STAGE_IN[0])/STAGE_IN[1]));
  if(up<1){const u=unlitC.getContext('2d');u.setTransform(1,0,0,1,0,0);u.globalCompositeOperation='source-over';u.globalAlpha=1;u.clearRect(0,0,W,H);
    NOSKY=true;NU=true;valleyShot(u,t-OVS,'reveal',false);NU=false;NOSKY=false;b.drawImage(unlitC,0,H*up*.9,W,H);}
  // 白天的布景（推向桥），最后沉下去
  const down=easeIn(clamp((t-STAGE_OUT[0])/STAGE_OUT[1]));
  if(down<1){const off=H*down;
    b.save();b.translate(0,off);camera(b,c.z,c.x,c.y);b.beginPath();b.rect(-600,570,2400,2400);b.clip();b.drawImage(background,0,0,W,H);b.restore();
    b.save();b.translate(W/2-20*push,H/2+18*push+off);b.scale(1.08,1.08);b.drawImage(foreground,-W/2,-H/2,W,H);b.restore();
    b.save();b.beginPath();b.rect(0,hs+off,W,H*3);b.clip();duskTint(b,duskColor(.5+(t-.5)*1.36));b.restore();}
  grad(b,0,0,W,570,[[0,'rgba(10,25,41,.3)'],[1,'rgba(10,25,41,0)']]);
  windLeaves(b,t-OVS);                                          // 飞叶的时钟和夜景接上（原设计，不改）
}
// v15：开场的月亮挂在天上（随镜头移），从佐渡那一侧的海平线斜着往右上升起，0.6 秒就出来，开始快、后面慢
function overviewMoon(b,t,c){
  if(t<.6)return;const [wx,wy]=moonWorld(t),x=540+(wx-c.x)*c.z,y=960+(wy-c.y)*c.z,r=36.6*c.z/1.045/1.3*1.045,m=clamp(moonLo(t)/90);
  b.save();b.beginPath();b.rect(0,0,W,Math.max(0,hsOf(c)));b.clip();
  glow(b,x,y,240*c.z,240*c.z,[142,167,211],.23*m);glow(b,x,y,78*c.z,78*c.z,[255,236,194],.3*m);
  b.fillStyle=blendTone('#f0a46a','#f6e7c7',m);b.beginPath();b.arc(x,y,r,0,TAU);b.fill();
  b.fillStyle='rgba(154,155,150,.14)';[[-9,-15,9],[9,7,13],[-12,12,6]].forEach(([dx,dy,rr])=>{b.beginPath();b.arc(x+dx*c.z,y+dy*c.z,rr*c.z,0,TAU);b.fill();});
  b.restore();
}
function overviewDay(b,t,background,foreground){
  // v19：先横移到图上的神社，再推近；推近越来越快，带着速度切进鸟居
  const m=ease(clamp((t-.1)/1.5)),zq=clamp((t-1.15)/2.05),zz=zq*zq*(1.6-.6*zq),p=.35*m+.65*zz,
        z=lerp(1,1.4,m)*lerp(1,2.3/1.4,zz),x=Math.min(W-540/z,lerp(540,690,m)+160*zz),y=Math.min(H-960/z,lerp(960,1150,m)+40*zz);
  b.save();camera(b,z,x,y);b.drawImage(background,0,0,W,H);b.restore();
  b.save();b.translate(W/2-40*p,H/2+60*p);b.scale(1.08+.1*p,1.08+.1*p);b.drawImage(foreground,-W/2,-H/2,W,H);b.restore();
  grad(b,0,0,W,570,[[0,'rgba(10,25,41,.3)'],[1,'rgba(10,25,41,0)']]);
}
const hsOf=c=>960+(570-c.y)*c.z;
function duskColor(t){const d=clamp((t-.5)/(OV-.6)),warm=[255,206,160];
  return d<.42?[255,255,255].map((v,i)=>lerp(v,warm[i],ease(d/.42))):warm.map((v,i)=>lerp(v,DUSK[i],ease((d-.42)/.58)));}
// 月亮从海平线升起（刚出来时偏橙、朦胧，越升越亮），升到夜景里月亮的同一个位置时切镜
function openingMoon(b,t){
  if(t<.9)return;const m=clamp((t-.9)/1.2);
  const e=openingCameraA(OV),c=openingCameraA(t),S=moonScreen(t);   // 天上的位置按切镜那一刻的镜头换算，再随当前镜头移动
  const wx=e.x+(S[0]-540)/e.z,wy=e.y+(S[1]-960)/e.z,x=540+(wx-c.x)*c.z,y=960+(wy-c.y)*c.z,r=36.6*c.z/1.12;
  b.save();
  glow(b,x,y,240,240,[142,167,211],.23*m);glow(b,x,y,78,78,[255,236,194],.3*m);
  b.globalAlpha=clamp(m*2.5);b.fillStyle=blendTone('#f0a46a','#f6e7c7',clamp(m*1.3));b.beginPath();b.arc(x,y,r,0,TAU);b.fill();
  b.fillStyle='rgba(154,155,150,.14)';[[-9,-15,9],[9,7,13],[-12,12,6]].forEach(([dx,dy,rr])=>{b.beginPath();b.arc(x+dx*1.045,y+dy*1.045,rr*1.045,0,TAU);b.fill();});
  b.restore();
}
const irisC=layer(()=>{},W,H,1);
// ======== v12：入夜与点灯 ========
// 开场推近时天色转暗（入夜）；切到同一座桥时灯还没亮，只有月光；然后红叶谷分三波亮灯（左、右、桥和水面），
// 每亮一处闪一下暖光，镜头轻轻往前顶一下——这是弥彦这一集的视觉爆点，也正好对上旁白「每晚点灯」。
const tintC=layer(()=>{},W,H,1),unlitC=layer(()=>{},W,H,1);
const DUSK=[56,66,104];
// 没亮灯的样子：按颜色压暗——红叶、桥这些暖色压得很暗、略带月光的蓝，天空和远山基本不变（所以亮灯时天上不会出现圆形的亮斑）
const unlitCache={};
function unlit(key,src){
  if(unlitCache[key])return unlitCache[key];
  const c=document.createElement('canvas');c.width=src.width;c.height=src.height;const x=c.getContext('2d');x.drawImage(src,0,0);
  const img=x.getImageData(0,0,c.width,c.height),d=img.data;
  for(let i=0;i<d.length;i+=4){const r=d[i],gg=d[i+1],bb=d[i+2],w=Math.min(1,Math.max(0,(r-bb-8)/90)),l=.3*r+.59*gg+.11*bb;
    d[i]=lerp(r,l*.3+6,w);d[i+1]=lerp(gg,l*.34+9,w);d[i+2]=lerp(bb,l*.46+18,w);}
  x.putImageData(img,0,0);return unlitCache[key]=c;
}
// 三处灯区：左边红叶、右边红叶、桥和中间水面（连同各自的倒影）。形状按树丛画，边缘用阴影羽化，不是圆形光斑
function lightMask(pts){return layer(b=>{b.translate(-3000,0);b.shadowColor='#fff';b.shadowBlur=70;b.shadowOffsetX=3000;b.fillStyle='#fff';
  b.beginPath();pts.forEach(([x,y],i)=>b[i?'lineTo':'moveTo'](x,y));b.closePath();b.fill();b.fill();},W,H,1);}
const LIGHTS=[
  [2.6,lightMask([[-80,-80],[430,-80],[470,520],[420,960],[330,1180],[300,1330],[330,1500],[420,1960],[-80,1960]])],
  [2.74,lightMask([[1160,-80],[640,-80],[610,520],[680,960],[770,1180],[800,1330],[770,1500],[680,1960],[1160,1960]])],
  [2.88,lightMask([[380,820],[700,820],[820,1100],[860,1330],[840,1960],[260,1960],[240,1330],[280,1100]])],
];
function maskInto(c,alphaOf){c.save();c.setTransform(1,0,0,1,0,0);LIGHTS.forEach(([t0,m])=>{const a=alphaOf(t0);if(a>0){c.globalAlpha=a;c.drawImage(m,0,0,W,H);}});c.restore();}
function duskTint(b,rgb){if(rgb.every(v=>v>254))return;const c=tintC.getContext('2d');c.setTransform(1,0,0,1,0,0);c.fillStyle=`rgb(${rgb.map(Math.round).join(',')})`;c.fillRect(0,0,W,H);
  b.save();b.setTransform(1,0,0,1,0,0);b.globalCompositeOperation='multiply';b.drawImage(tintC,0,0,W,H);b.restore();}
// v14：太阳按真实的样子走——往右下斜着落（越落越陡一点），速度夸张一些；缆车和山顶共用一个太阳、一片天
const SUN_P0=[500,90],SUN_D=[.53,.848],SUN_N=[-.848,.53],SUN_V=104;
// v19：太阳匀速往右下落，越落越陡一点（不停、不变速）；17 秒前后正好碰到海平线，接着跟山顶的景一起沉下去
function sunScreen(T){const d=T-13.0,L=d<0?69*d+2.12*d*d:69*d,k=.00008*L*Math.abs(L);return [760+L*SUN_D[0]+k*SUN_N[0],600+L*SUN_D[1]+k*SUN_N[1]];}
// v20：月亮在左上方（「弥彦」标题右边、旁白上面），跟着红叶谷一下子升上来，落定后继续慢慢往右上走、越走越平
function moonG(T){if(T<17.9){const v=clamp((T-17.0)/.9),s=1-(1-v)*(1-v),q=1-s,A=[215,885],B=[255,520],C=[440,395];return [q*q*A[0]+2*q*s*B[0]+s*s*C[0],q*q*A[1]+2*q*s*B[1]+s*s*C[1]];}const s=(T-17.9)/6.7,P0=[440,395],P1=[478,348],P2=[532,332],q=1-s;return [q*q*P0[0]+2*q*s*P1[0]+s*s*P2[0],q*q*P0[1]+2*q*s*P1[1]+s*s*P2[1]];}
let NIGHT_T=17;
// 夕阳的天（夸张一点：深靛、玫紫、火橙、金黄），盖满整个画面当天幕；太阳在 hy 以下被海挡住
let CLOUD_OFF=0;const sunDrop=T=>320*easeIn(clamp((T-16.72)/.26));   // v23：最后一下太阳「biu」地沉下去，云往两边撤走
function sunsetSky(b,u,hy,sx,sy){
  const q=b.createLinearGradient(0,0,0,hy);q.addColorStop(0,blendTone('#1c2a5c','#1a1f48',u));q.addColorStop(.38,blendTone('#76648f','#6a5486',u));q.addColorStop(.72,blendTone('#f2a066','#e88a5c',u));q.addColorStop(1,blendTone('#ffd27a','#ffbe6a',u));
  b.fillStyle=q;b.fillRect(0,0,W,hy+2);b.fillStyle=blendTone('#ffd27a','#ffbe6a',u);b.fillRect(0,hy+1,W,H-hy);
  b.save();b.globalAlpha=.6;b.drawImage(duskClouds,-14*u-1300*CLOUD_OFF,hy-1030-160*CLOUD_OFF,W,H);b.restore();
  b.drawImage(sunsetHorizonClouds,1200*CLOUD_OFF,hy-80,W,160);
  glow(b,sx,sy,640,420,[255,190,120],.36);glow(b,sx,sy,170,160,[255,233,190],.48);
  b.save();b.beginPath();b.rect(0,0,W,hy);b.clip();const disk=b.createLinearGradient(0,sy-26,0,sy+26);disk.addColorStop(0,'#fff6d9');disk.addColorStop(.5,'#ffdf9e');disk.addColorStop(1,'#ffad68');b.fillStyle=disk;b.beginPath();b.arc(sx,sy,26,0,TAU);b.fill();b.restore();
}
// v13：缆车往上走，左上方山脊上的太阳越来越低、越来越暖，整面山坡染上傍晚的光——下一镜就是山顶看日落
const ASTAGE_OUT=[13.85,.45],ASTAGE_IN=[14.0,.6];   // 源时间：缆车的景沉下去，山顶的海和海岸从下面升上来
const landC=layer(()=>{},W,H,1),setC=layer(()=>{},W,H,1);
function ascentLit(b,t){
  const mix=ease(clamp((t-11.95)/1.8)),S=sunScreen(t-1.6),travel=(t-AS0)*155,followX=travel*.23,followY=travel*.18;
  // 天幕：拉长蓝天到夕阳的渐变，日轮始终保持半径 26。
  b.fillStyle='#426f89';b.fillRect(0,0,W,H);b.drawImage(asFarSkyL,-45-followX*.15,-80+followY*.18,W+90,H+160);
  // v22：白天的太阳从拜殿那一镜就在天上，慢慢往右下走，到缆车最后烧成夕阳
  if(mix<1){b.save();b.globalAlpha=1-mix;b.globalCompositeOperation='lighter';glow(b,S[0],S[1],240,220,[255,236,200],.08);glow(b,S[0],S[1],70,66,[255,244,220],.16);b.restore();
    b.save();b.globalAlpha=(1-mix)*.92;b.fillStyle='#fff3d6';b.beginPath();b.arc(S[0],S[1],26,0,TAU);b.fill();b.restore();}
  if(mix>0){b.save();b.globalAlpha=mix;sunsetSky(b,0,930,S[0],S[1]);b.restore();}
  // 山顶的海和海岸从下面升上来
  const up=t<ASTAGE_IN[0]?1:1-easeOut(clamp((t-ASTAGE_IN[0])/ASTAGE_IN[1]));
  if(up<1){const c=setC.getContext('2d');c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='source-over';c.globalAlpha=1;c.clearRect(0,0,W,H);
    NOSKY=true;sunsetShot(c,14.6,t-1.6);NOSKY=false;b.drawImage(setC,0,H*up*.9,W,H);}
  // 缆车的景（山坡、平原、缆车），越来越暖，最后沉下去
  const down=easeIn(clamp((t-ASTAGE_OUT[0])/ASTAGE_OUT[1]));
  if(down<1){const c=landC.getContext('2d');c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='source-over';c.globalAlpha=1;c.clearRect(0,0,W,H);
    NOSKY=true;CAR_OFF=clamp((t-(ASTAGE_OUT[0]-.35))/.25);ascentNew(c,t);CAR_OFF=0;NOSKY=false;
    if(mix>0){c.globalCompositeOperation='source-atop';c.fillStyle=`rgba(255,120,60,${.2*mix})`;c.fillRect(0,0,W,H);c.globalCompositeOperation='source-over';}
    b.drawImage(landC,0,H*down,W,H);}
}
// v13：山顶日落——太阳往下沉，画面从暖黄的亮，变成橙红，最后暗下来、偏蓝紫；太阳贴近海面时海上的光最亮
const SUNSET_GRADE=[[0,[255,255,255]],[.3,[255,240,220]],[.88,[248,226,206]],[1,[124,120,160]]];   // v24：一直亮着，最后约 0.45 秒（太阳 biu 下去那一下）迅速变暗   // v15：少一些红
function sunsetLit(b,t){
  sunsetShot(b,t);const u=clamp((t-14.6)/10.6);
  let k=0;while(k<SUNSET_GRADE.length-2&&u>SUNSET_GRADE[k+1][0])k++;
  const [u0,c0]=SUNSET_GRADE[k],[u1,c1]=SUNSET_GRADE[k+1],f=ease(clamp((u-u0)/(u1-u0))),rgb=c0.map((v,i)=>Math.round(lerp(v,c1[i],f)));
  const c=tintC.getContext('2d');c.setTransform(1,0,0,1,0,0);c.fillStyle=`rgb(${rgb.join(',')})`;c.fillRect(0,0,W,H);
  b.save();b.setTransform(1,0,0,1,0,0);b.globalCompositeOperation='multiply';b.drawImage(tintC,0,0,W,H);
  const lift=u*.85+.15*u*u,hy=930-100*lift,Ss=sunScreen(13.0+(t-14.6)*4/10.6),sx=Ss[0],sy=Ss[1]+(hy-930)+sunDrop(13.0+(t-14.6)*4/10.6),g2=Math.sin(Math.PI*clamp((u-.2)/.7));
  b.globalCompositeOperation='lighter';glow(b,sx,sy,460,170,[255,196,140],.15*g2);b.restore();
}
// ======== v18：山顶日落 → 入夜的红叶谷（话剧换景） ========
// 天从落日后的颜色沉成夜空，月亮已经在左边的天上慢慢走；山顶的海和海岸沉下去，夜里的红叶谷从下面升上来（灯还没亮），再三波点灯。
// v19：先「太阳下山」——山顶的景带着贴在海平线上的太阳一起沉下去，天暗成夜空；
// 再「月亮升起」——夜里的红叶谷带着月亮从下面升上来，落定后月亮接着在天上慢慢走。两段接得紧，不同时在台上。
const alphaC=layer(()=>{},W,H,1);
function gradeSet(c,rgb){const m=alphaC.getContext('2d');m.setTransform(1,0,0,1,0,0);m.globalCompositeOperation='copy';m.drawImage(c.canvas,0,0);
  c.save();c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='multiply';c.fillStyle=`rgb(${rgb.join(',')})`;c.fillRect(0,0,W,H);c.globalCompositeOperation='destination-in';c.drawImage(alphaC,0,0);c.restore();}
function drawMoonAt(b,x,y,z){b.save();b.translate(x,y);b.scale(z,z);b.drawImage(moonLayer,-785,-570,W,H);b.restore();}
const NIGHT_OUT=[0,.3],NIGHT_IN=[.12,.48];const skyC=layer(()=>{},W,H,1);   // 秒（从 17.0 起）：旧景沉下去；新景升上来
function nightV18(b,src){
  // v23：太阳一下去天就黑了（不渐变）。山顶画面的上半部分——夜空、海——留着，月亮从左边的海里斜着升上来；
  // 然后入夜的红叶谷（还没亮灯）从下面升上来，盖住海和海岸，17.95 秒落定，再三波点灯。
  const T=src-1.4+NIGHT0,a=T-NIGHT0;NIGHT_T=T;
  if(a>=.95){nightLit(b,src);return;}
  const c=cameraState(src,'reveal'),hy=830,m=moonG(T);
  b.save();camera(b,c.z,c.x,c.y);b.drawImage(nightSkyL,0,0,W,H);b.restore();
  MOONDX=c.x+(m[0]-540)/c.z-785;MOONDY=c.y+(m[1]-960)/c.z-570;drawMoonAt(b,m[0],m[1],c.z);
  // 山顶的海和海岸，换成夜里的颜色；太阳已经在海平线下面
  const up=1-easeOut(clamp((a-.35)/.6));
  if(up>.02){const c2=landC.getContext('2d');c2.setTransform(1,0,0,1,0,0);c2.globalCompositeOperation='source-over';c2.globalAlpha=1;c2.clearRect(0,0,W,H);
    NOSKY=true;sunsetShot(c2,25.2,40);NOSKY=false;gradeSet(c2,[70,80,124]);b.drawImage(landC,0,0,W,H);
    // 海上月亮的倒影
    if(m[1]<hy+30){b.save();b.globalCompositeOperation='lighter';const k=clamp((hy+30-m[1])/120);
      for(let i=0;i<46;i++){const v=i/46,yy=hy+3+v*420,ww=(10+v*60)*(.6+.4*Math.sin(T*5+i*1.7));b.fillStyle=`rgba(226,222,200,${.35*k*(1-v)})`;b.fillRect(m[0]-ww/2+Math.sin(i*2.3+T*3)*v*14,yy,ww,1.5+v*1.5);}b.restore();}}
  if(up<1){const u=unlitC.getContext('2d');u.setTransform(1,0,0,1,0,0);u.globalCompositeOperation='source-over';u.globalAlpha=1;u.clearRect(0,0,W,H);
   NOSKY=true;NU=true;valleyShot(u,src,'reveal',false);NU=false;NOSKY=false;b.drawImage(unlitC,0,H*up*.9,W,H);}
  windLeaves(b,src);
}

// v31: retain the final-shot objects; carry a few actual bridge-gust leaves onto the paving.
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
 townRoofBaseV30(b,[488,880],[1040,802],[616,710],[988,668]);
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
 // Foreground branches and crowns are separate moving layers, not baked into the shop.
 // Modest fence beside the sloping path; silhouettes will sit behind its near rail.
 const rail=x=>1660-(x-790)*.28;
 for(let x=820;x<1110;x+=49){b.fillStyle='#4e352f';b.fillRect(x-3,rail(x)-70,7,75);b.fillStyle='#8b6b4c';b.fillRect(x-3,rail(x)-70,1.5,73);}
 for(const d of [0,27]){b.strokeStyle=d?'#50382f':'#967653';b.lineWidth=d?4:6;b.beginPath();b.moveTo(820,rail(820)-65+d);b.lineTo(1110,rail(1110)-65+d);b.stroke();}
},W,H,1.25);
// All time values here are local to the final 7.2-second town shot.
// One wind field drives branches, window hinges, steam and the standing person's gesture.
function townWind(a){
 const gust=(start,length,amount)=>{const u=(a-start)/length;return u>0&&u<1?amount*Math.pow(Math.sin(Math.PI*u),2):0;};
 return gust(.9,1.6,.4)+gust(5.95,1.5,1.25)+.055*Math.sin(a*2.1)*Math.min(1,Math.max(0,a));   // v32：大风挪到片尾，叶子被吹起来的那一下
}
const townTreeSpecs=[
 {x:1125,y:740,rx:255,ry:210,seed:25460,lit:.9,anchor:[1200,1060],lag:0,flex:.052},
 {x:1180,y:1570,rx:165,ry:155,seed:25480,lit:.85,anchor:[1098,1870],lag:.14,flex:.066},
 {x:-95,y:1775,rx:250,ry:155,seed:25500,lit:.8,anchor:[-145,1990],lag:.25,flex:.057},
 {x:-10,y:575,rx:190,ry:170,seed:25520,lit:.77,anchor:[-60,830],lag:.08,flex:.061},
];
const townWindCrowns=townTreeSpecs.map(s=>{
 const width=Math.ceil(s.rx*2.8+60),height=Math.ceil(s.ry*2.8+60);
 return {width,height,image:layer(b=>nightCrown(b,width/2,height/2,s.rx,s.ry,s.seed,s.lit),width,height,1.25)};
});
function townTreeState(a,i){const s=townTreeSpecs[i],wind=townWind(a-s.lag);return {angle:s.flex*wind,flutter:Math.sin(a*4.2+i)*wind*.006,wind};}
function townWindTrees(b,a){
 for(let i=0;i<townTreeSpecs.length;i++){
  const s=townTreeSpecs[i],state=townTreeState(a,i),sprite=townWindCrowns[i];
  b.save();b.translate(...s.anchor);b.rotate(state.angle);b.translate(-s.anchor[0],-s.anchor[1]);
  if(i===1)branch(b,1098,1870,330,.2,25,3,25450);
  if(i===2)branch(b,-145,1990,235,.24,14,2,25504);
  if(i===3)branch(b,-60,830,205,.1,10,2,25524);
  // The branch root stays planted; flexible leaf clusters lag the heavier limb slightly.
  b.translate(s.x,s.y);b.rotate(state.flutter);b.drawImage(sprite.image,-sprite.width/2,-sprite.height/2,sprite.width,sprite.height);b.restore();
 }
}
function townFeet(a){
 const phase=a*1.75,tip=[43+Math.sin(phase)*8.5,3+Math.cos(phase)*2.6];
 return [
  {knee:[25,-19],ankle:[tip[0]-7,tip[1]-3],tip,stirring:true},
  {knee:[33,-15],ankle:[42,2],tip:[49,5],stirring:false},
 ];
}
function townStandingPose(a){const wind=townWind(a-.18);return {hand:ease(clamp((wind-.08)/.62)),hem:wind*3.8,lean:wind*.012};}
function townCoupleV25(b,a){
 const ink='#080e15';
 // Standing on dry paving: looking towards the seated companion, holding wind-blown hair.
 const pose=townStandingPose(a);
 b.save();b.translate(757,1428);b.scale(1.45,1.45);b.fillStyle=ink;b.strokeStyle=ink;b.lineCap='round';b.lineJoin='round';
 b.lineWidth=5;b.beginPath();b.moveTo(-7,-29);b.lineTo(-10,-2);b.lineTo(-5,-1);b.moveTo(6,-28);b.lineTo(10,-2);b.lineTo(15,-2);b.stroke();
 b.save();b.translate(0,-29);b.rotate(pose.lean);b.translate(0,29);
 b.beginPath();b.ellipse(0,-94,7.2,9,.18,0,TAU);b.fill();
 b.beginPath();b.moveTo(-10,-83);b.quadraticCurveTo(1,-89,10,-80);b.lineTo(12+pose.hem,-30);b.quadraticCurveTo(1,-25,-13+pose.hem,-30);b.lineTo(-15,-62);b.closePath();b.fill();
 // Small fixed hand at the waist; the other arm rises with the gust, not a repetitive wave.
 b.lineWidth=5.5;b.beginPath();b.moveTo(-10,-76);b.quadraticCurveTo(-19,-57,-9,-48);b.stroke();
 const elbow=[lerp(16,23,pose.hand),lerp(-55,-78,pose.hand)],hand=[lerp(13,6,pose.hand),lerp(-37,-99,pose.hand)];
 b.beginPath();b.moveTo(8,-77);b.quadraticCurveTo(elbow[0],elbow[1],...hand);b.stroke();
 b.lineWidth=2;b.beginPath();b.moveTo(3,-102);b.quadraticCurveTo(9+pose.hem,-101,8+pose.hem,-95);b.stroke();b.restore();b.restore();
 // One seated figure, in the same flat silhouette style as the bridge. No skin-coloured feet.
 b.save();b.translate(807,1408);b.scale(1.3,1.3);b.fillStyle=ink;b.strokeStyle=ink;b.lineCap='round';b.lineJoin='round';
 for(const f of townFeet(a)){
  b.lineWidth=4.6;b.beginPath();b.moveTo(...f.knee);b.quadraticCurveTo(f.knee[0]+3,-4,...f.ankle);b.stroke();
  b.save();b.globalAlpha=.72;b.lineWidth=4.2;b.beginPath();b.moveTo(...f.ankle);b.quadraticCurveTo(f.ankle[0]+4,f.ankle[1]+4,...f.tip);b.stroke();b.restore();
 }
 poly(b,[[-14,-32],[-1,-34],[30,-23],[38,-13],[29,-9],[12,-16],[-13,-19]],ink);
 b.save();b.translate(0,Math.sin(a*.8)*.3);
 b.beginPath();b.ellipse(-6,-74,7.2,9,.25,0,TAU);b.fill();
 b.beginPath();b.moveTo(-14,-65);b.quadraticCurveTo(-4,-70,3,-58);b.lineTo(8,-28);b.lineTo(-14,-25);b.lineTo(-18,-49);b.closePath();b.fill();
 b.lineWidth=5.3;b.beginPath();b.moveTo(-13,-58);b.quadraticCurveTo(-21,-39,-20,-23);b.moveTo(1,-56);b.quadraticCurveTo(7,-34,25,-23);b.stroke();b.restore();b.restore();
}
// Deterministic hinge dynamics: a gust accelerates each leaf, then it settles under inertia and damping.
const townWindowSpringV30=(()=>{
 const dt=1/240,rows=[];let left=1.02,right=1.16,lv=0,rv=0;
 for(let i=0;i<=Math.ceil(7.2/dt)+1;i++){
  const t=i*dt,wind=townWind(t-.12);
  rows.push({opening:left,right,wind,lv,rv});
  const step=(angle,velocity,target,frequency,damping)=>{
   velocity+=((target-angle)*frequency*frequency-2*damping*frequency*velocity)*dt;angle+=velocity*dt;
   if(angle<.48){angle=.48;velocity=Math.abs(velocity)*.12;}if(angle>1.49){angle=1.49;velocity=-Math.abs(velocity)*.12;}
   return [angle,velocity];
  };
  [left,lv]=step(left,lv,1.02+.85*wind,7.2,.3);[right,rv]=step(right,rv,1.16-.75*wind,6.2,.28);   // v33：大风把窗扇猛地推开、撞到头再弹回来
 }
 return rows;
})();
function townWindowState(a){
 const f=clamp(a,0,7.2)*240,i=Math.floor(f),u=f-i,A=townWindowSpringV30[i],B=townWindowSpringV30[i+1];
 return Object.fromEntries(Object.keys(A).map(k=>[k,lerp(A[k],B[k],u)]));
}
function townOpenWindows(b,a){
 const face=[[509,1210],[1017,1137],[1017,799],[509,875]],u=.418,v=.615,w=.338,h=.235;
 // A single coherent wide window: recessed room, solid surround, and two glazed wooden leaves.
 townPanel(b,face,u-.018,v-.018,w+.036,h+.036,'#302c26');
 const room=b.createLinearGradient(0,900,0,1000);room.addColorStop(0,'#756146');room.addColorStop(.5,'#514738');room.addColorStop(1,'#373a32');
 townPanel(b,face,u,v,w,h,room);
 townPanel(b,face,u+.055,v+.025,w-.11,h-.06,'#444333');
 townLine(b,face,u+.06,v+.055,u+w-.06,v+.055,'rgba(203,167,106,.27)',2);
 const state=townWindowState(a),half=508*w*.49;
 const bl=townUV(face,u,v),tl=townUV(face,u,v+h),br=townUV(face,u+w,v),tr=townUV(face,u+w,v+h);
 for(const [bottom,top,dir,angle] of [[bl,tl,1,state.opening],[br,tr,-1,state.right]]){
  // Only the free edge moves; hinge edge remains fixed in the window frame.
  const dx=dir*half*Math.cos(angle),depth=half*Math.sin(angle)*.26;
  const fb=[bottom[0]+dx,bottom[1]+depth-dx*.145],ft=[top[0]+dx,top[1]+depth-dx*.145];
  const pane=dir===1?[bottom,fb,ft,top]:[fb,bottom,top,ft];
  // Moving cast shadow and angle-dependent reflection distinguish glass from a pasted opaque panel.
  b.save();poly(b,[bl,br,tr,tl]);b.clip();poly(b,pane.map(([x,y])=>[x+7,y+5]),'rgba(10,17,18,.19)');b.restore();
  poly(b,pane,`rgba(126,155,158,${.07+.15*Math.abs(Math.sin(angle))})`,'#3e3429',3);
  townPanel(b,pane,0,0,.08,1,'#826547');townPanel(b,pane,.92,0,.08,1,'#826547');
  townPanel(b,pane,0,0,1,.055,'#826547');townPanel(b,pane,0,.945,1,.055,'#826547');
  townPanel(b,pane,.12+.54*clamp((angle-.48)/1.01),.13,.10,.72,'rgba(210,220,214,.20)');
  townLine(b,pane,.5,.05,.5,.95,'#67513a',2.2);townLine(b,pane,.07,.51,.93,.51,'#67513a',2.5);
  townLine(b,pane,.04,.96,.96,.96,'#baa37a',1.5);
  const handle=dir===1?.82:.18;townLine(b,pane,handle,.37,handle,.51,'#242a27',2.3);townLine(b,pane,handle,.43,handle+(dir===1?-.06:.06),.43,'#b5aa88',1.5);
  for(const q of [.18,.80]){const y=lerp(bottom[1],top[1],q);b.fillStyle='#282e2a';b.fillRect(bottom[0]-2,y-3,4,6);}
 }
 townLine(b,face,u-.025,v-.014,u+w+.025,v-.014,'#b19a70',5);
 townLine(b,face,u-.012,v+h+.012,u+w+.012,v+h+.012,'#a1875d',3);
}
function townCatState(a){
 let x=605,jump=0,run=0,look=0,stage='alert',tilt=0,landing=0;
 if(a>=.9&&a<2.3){const u=(a-.9)/1.4;x=605+150*ease(u);run=Math.sin(Math.PI*u)**.25;stage='trot';}
 else if(a>=2.3&&a<2.8){x=755;look=Math.sin(Math.PI*(a-2.3)/.5);stage='look-back';}
 else if(a>=2.8&&a<3.65){const u=(a-2.8)/.85;x=755+100*u;jump=36*Math.sin(Math.PI*u);tilt=-.24*Math.cos(Math.PI*u);run=.7;stage='hop';}
 else if(a>=3.65&&a<5.3){const u=(a-3.65)/1.65;x=855+210*ease(u);run=Math.sin(Math.PI*u)**.23;landing=Math.exp(-(a-3.65)*13)*.23;stage='scamper';}
 else if(a>=5.3){x=1065;stage='behind-tree';}
 return {x,y:844-(x-605)*.14,jump,run,look,stage,tilt,landing,phase:(x-605)/27*TAU};
}
function townRoofCat(b,a){
 const s=townCatState(a),ink='#0a141c',bob=Math.sin(s.phase*2)*2.4*s.run;
 b.save();b.translate(s.x,s.y);b.rotate(-.139);
 b.save();b.globalAlpha=.23*(1-s.jump/80);b.fillStyle='#080e13';b.beginPath();b.ellipse(0,1,27-s.jump*.12,3,0,0,TAU);b.fill();b.restore();
 b.translate(0,-s.jump);b.rotate(s.tilt);b.scale(1.18*(1+s.jump*.003),1.18*(1-s.landing));b.fillStyle=ink;b.strokeStyle=ink;b.lineCap='round';b.lineJoin='round';
 for(const [hip,phase] of [[-13,0],[-8,Math.PI],[11,Math.PI],[16,0]]){
  let step=Math.sin(s.phase+phase)*10*s.run,lift=Math.max(0,Math.cos(s.phase+phase))*7*s.run;
  if(s.stage==='hop'){step=hip<0?-5:8;lift=6+Math.sin(s.jump/36*Math.PI)*3;}
  b.lineWidth=3;b.beginPath();b.moveTo(hip,-13+bob);b.quadraticCurveTo(hip+step*.5,-6,hip+step,-lift);b.lineTo(hip+step+4,-lift);b.stroke();
 }
 b.beginPath();b.ellipse(0,-16+bob,20,7,0,0,TAU);b.fill();
 // Head looks over its shoulder during the planted pause; the torso keeps facing forward.
 b.save();b.translate(19,-22+bob);b.rotate(-s.look*.8);b.beginPath();b.ellipse(0,0,7,6,0,0,TAU);b.fill();
 {const tw=Math.max(0,Math.sin(a*11))**6*3,tw2=Math.max(0,Math.sin(a*11+2.2))**6*3;poly(b,[[-5,-3],[-6-tw*.4,-12+tw],[0,-6],[5+tw2*.4,-11+tw2],[7,-2]],ink);}   // v35：耳朵抖一下
 b.fillStyle='#b4b89b';b.beginPath();b.arc(4-7*s.look,-1,.85,0,TAU);b.fill();b.restore();
 b.strokeStyle=ink;b.lineWidth=3.8;b.beginPath();b.moveTo(-17,-18+bob);b.bezierCurveTo(-27,-19,-28,-35-Math.sin(a*3.4)*5,-39,-28-Math.sin(a*2.4)*6);b.stroke();
 b.strokeStyle='rgba(158,174,182,.28)';b.lineWidth=1;b.beginPath();b.ellipse(-1,-17+bob,18,6,0,Math.PI,TAU);b.stroke();b.restore();
}

// Roof articulation retained; the only physical leaves are seven members of the original bridge gust.
function townRoofBaseV30(b,e0,e1,r0,r1){
 const q=b.createLinearGradient(0,Math.min(r0[1],r1[1]),0,Math.max(e0[1],e1[1]));q.addColorStop(0,'#354650');q.addColorStop(1,'#192a36');poly(b,[e0,e1,r1,r0],q);
 b.strokeStyle='#101f2b';b.lineWidth=8;b.beginPath();b.moveTo(...e0);b.lineTo(...e1);b.stroke();
}
const townRoofPlaneV30=[[488,880],[1040,802],[988,668],[616,710]];
function townTileStateV30(a,row,col){
 const v=(row+.5)/8,u=(col+.5+(row%2)*.5)/18,center=townUV(townRoofPlaneV30,u,v),wind=townWind(a-col*.012-row*.025);
 const exposure=Math.pow(1-row/8,3);let landing=0;
 for(const L of townRoofLandsV33()){const age=a-L.a,distance=Math.hypot(center[0]-L.p[0],center[1]-L.p[1]);if(age>=0&&age<.8)landing+=Math.sin(age*13)*Math.exp(-age*6)*Math.max(0,1-distance/70)*2.2;}
 const rattle=wind*wind*2.6*Math.sin(a*38+row*2.1+col*1.37)*(.4+exposure);
 return {lift:clamp(wind*(.35+3.1*exposure)+landing*.95+rattle,-1.5,8),wind,center,landing};   // v33：叶子落在瓦上，附近的瓦跳一下；片尾大风里瓦片一片片咯噔咯噔地抖
}
function townRoofTilesV30(b,a){
 b.save();poly(b,townRoofPlaneV30);b.clip();
 for(let row=7;row>=0;row--)for(let col=-1;col<18;col++){
  const u=(col+(row%2)*.5)/18,v=row/8,w=1/18,h=1/8+.012,state=townTileStateV30(a,row,col);
  const p=[townUV(townRoofPlaneV30,u,v),townUV(townRoofPlaneV30,u+w,v),townUV(townRoofPlaneV30,u+w,v+h),townUV(townRoofPlaneV30,u,v+h)];
  poly(b,p,'#14232d');p[0][1]-=state.lift;p[1][1]-=state.lift;
  const light=.79+rnd(row*31+col,30801)*.15+state.lift*.035,color=[57,73,82].map(c=>Math.round(c*light));poly(b,p,`rgb(${color.join(',')})`);
  const mid=[(p[0][0]+p[1][0])/2,(p[0][1]+p[1][1])/2],back=[(p[2][0]+p[3][0])/2,(p[2][1]+p[3][1])/2];
  b.strokeStyle='rgba(128,149,157,.27)';b.lineWidth=1;b.beginPath();b.moveTo(...mid);b.lineTo(...back);b.stroke();
  b.strokeStyle='rgba(9,21,30,.58)';b.lineWidth=1.3;b.beginPath();b.moveTo(...p[0]);b.lineTo(...p[3]);b.stroke();
  b.strokeStyle=`rgba(151,164,160,${.19+state.lift*.026})`;b.lineWidth=1;b.beginPath();b.moveTo(...p[0]);b.quadraticCurveTo(mid[0],mid[1]+1.8,...p[1]);b.stroke();
 }
 b.restore();b.strokeStyle='#71818a';b.lineWidth=1.8;b.beginPath();b.moveTo(616,710);b.lineTo(988,668);b.stroke();
 b.strokeStyle='#101f2b';b.lineWidth=6;b.beginPath();b.moveTo(488,880);b.lineTo(1040,802);b.stroke();
}
// This value is checked against endCardC by the builder and tests.
const TOWN_LEAF_RELEASE_V31=21.5;
const townCarrySpecV31=[
 [353,700,1620,22],[379,690,1760,24],[394,630,1640,21],[412,590,1740,26],
 [425,520,1810,23],[441,610,1850,25],[445,640,1790,22],
];
let townCarryCacheV31=null;
function townCarryLeavesV31(){
 if(townCarryCacheV31)return townCarryCacheV31;
 townCarryCacheV31=townCarrySpecV31.map(([id,x,y,size],i)=>{
  const particle=gust[id],initial=windLeafState(particle,5),start=windLeafState(particle,5.1);
  if(!initial||!start)throw Error('Bridge leaf unavailable at cut: '+id);
  const goal=.25+i*.43,spin=start.spin+Math.atan2(Math.sin(goal-start.spin),Math.cos(goal-start.spin));
  const hex=reds[particle.color].slice(1),base=[0,2,4].map(k=>parseInt(hex.slice(k,k+2),16));
  return {id,i,particle,initial,start,world:[x,y],size,spin,land:.60+i*.018,base};
 });return townCarryCacheV31;
}
function townCarryGroundV31(t,world){
 const a=Math.max(0,t-TOWN0),p=townPose(a),z=1+(p.z-1)*.82;
 return {x:840+z*(world[0]-840+p.x*.82),y:1350+z*(world[1]-1350+p.y*.82)+H*.9*(1-easeOut(clamp((a-.1)/.9))),world};
}
function townCarryStateV31(d,t){
 const a=t-TOWN0;if(a<0)return {visible:false,phase:'before-town',id:d.id};
 const ground=townCarryGroundV31(t,d.world),common={id:d.id,base:d.base,ground};
 if(a<.1){const p=windLeafState(d.particle,5+a);return {...common,...p,visible:!!p,phase:'bridge-tail',morph:0,pitch:0,yaw:0,fold:.2,height:null};}
 if(a<d.land){
  const u=clamp((a-.1)/(d.land-.1)),target=townCarryGroundV31(TOWN0+d.land,d.world),p=d.start;
  return {...common,visible:true,phase:'fall',x:lerp(p.x,target.x,easeOut(u)),y:lerp(p.y,target.y,.25*u+.75*u*u),size:lerp(p.size,d.size,ease(u)),spin:lerp(p.spin,d.spin,ease(u)),pitch:lerp(.15,1.14,u*u),yaw:lerp(Math.acos(.28+.72*Math.abs(Math.cos(p.spin*.71))),.08,ease(u)),fold:lerp(.25,.16,u),alpha:lerp(p.alpha,1,u),morph:ease(clamp((a-.1)/.25)),color:p.color,height:(1-u)*Math.max(0,target.y-p.y)};
 }
 if(t<TOWN_LEAF_RELEASE_V31){const age=a-d.land;return {...common,visible:true,phase:'ground',x:ground.x,y:ground.y,size:d.size,spin:d.spin,pitch:1.14+.04*Math.exp(-age*20)*Math.sin(age*32),yaw:.08,fold:.16,alpha:1,morph:1,height:0};}
 const u=clamp((t-TOWN_LEAF_RELEASE_V31-d.i*.022)/1.1),q=Math.pow(clamp((u-.08)/.92),1.25),A=[ground.x,ground.y],B=[ground.x+360,ground.y-100],C=[W+200+d.i*18,800+d.i*55],v=1-q;
 const x=v*v*A[0]+2*v*q*B[0]+q*q*C[0],y=v*v*A[1]+2*v*q*B[1]+q*q*C[1];
 return {...common,visible:u<1&&x<W+d.size*2,phase:'caption-gust',x,y,size:lerp(d.size,d.size*1.3,q),spin:d.spin+q*(3.6+d.i*.2),pitch:lerp(1.14,-.45,clamp(u*2)),yaw:.08+Math.sin(q*5+d.i*.7)*q,fold:.16+.2*Math.sin(Math.PI*u),alpha:1,morph:1,height:q*900};
}
function townPhysicalVertexV31(x,y,s){
 const size=s.size,z=(Math.abs(x)*s.fold+.035*Math.sin(y*4))*size;let X=x*size,Y=y*size,Z=z;
 const cp=Math.cos(s.pitch),sp=Math.sin(s.pitch),cy=Math.cos(s.yaw),sy=Math.sin(s.yaw);[Y,Z]=[Y*cp-Z*sp,Y*sp+Z*cp];[X,Z]=[X*cy+Z*sy,-X*sy+Z*cy];
 const c=Math.cos(s.spin),n=Math.sin(s.spin);[X,Y]=[X*c-Y*n,X*n+Y*c];const perspective=1/(1+Z/440);return {x:X*perspective,y:Y*perspective,z:Z,X,Y};
}
function drawTownPhysicalLeafV31(b,s){
 const opacity=s.alpha*s.morph;
 if(s.height!==null&&s.height<280){b.save();b.globalAlpha=opacity;b.translate(s.ground.x,s.ground.y+3);b.rotate(.1);b.scale(1,.24);const radius=s.size*.95+s.height*.1,q=b.createRadialGradient(0,0,1,0,0,radius);q.addColorStop(0,`rgba(3,8,10,${.32*Math.exp(-s.height/95)})`);q.addColorStop(1,'rgba(3,8,10,0)');b.fillStyle=q;b.beginPath();b.arc(0,0,radius,0,TAU);b.fill();b.restore();}
 const points=leafOutline.map(([x,y])=>townPhysicalVertexV31(x,y,s)),center=townPhysicalVertexV31(0,.12,s);
 b.save();b.globalAlpha=opacity;b.translate(s.x,s.y);
 const contour=(dx=0,dy=0)=>{b.beginPath();points.forEach((p,i)=>b[i?'lineTo':'moveTo'](p.x+dx,p.y+dy));b.closePath();};
 contour(.4,1);b.fillStyle='#54291d';b.fill();
 for(let i=0;i<points.length;i++){
  const p=points[i],q=points[(i+1)%points.length],ax=p.X-center.X,ay=p.Y-center.Y,az=p.z-center.z,bx=q.X-center.X,by=q.Y-center.Y,bz=q.z-center.z;
  let nx=ay*bz-az*by,ny=az*bx-ax*bz,nz=ax*by-ay*bx;const length=Math.hypot(nx,ny,nz)||1;nx/=length;ny/=length;nz/=length;
  const light=clamp(.78+Math.abs(-.24*nx-.35*ny+.84*nz)*.34,.65,1.12),base=nz<0?s.base.map(c=>c*.72):s.base,rgb=base.map(c=>Math.min(255,Math.round(c*light)));
  poly(b,[[center.x,center.y],[p.x,p.y],[q.x,q.y]],`rgb(${rgb.join(',')})`);
 }
 contour();b.strokeStyle='rgba(92,39,20,.68)';b.lineWidth=.85;b.stroke();
 const origin=townPhysicalVertexV31(0,.38,s);b.strokeStyle='rgba(242,181,108,.42)';b.lineWidth=Math.max(.65,s.size*.021);b.beginPath();
 for(const [x,y] of [[0,-1],[.48,-.78],[.84,-.43],[.9,.16],[-.48,-.78],[-.84,-.43],[-.9,.16]]){const p=townPhysicalVertexV31(x*.86,y*.86,s);b.moveTo(origin.x,origin.y);b.lineTo(p.x,p.y);}b.stroke();
 const A=townPhysicalVertexV31(0,.62,s),C=townPhysicalVertexV31(.02,.93,s),E=townPhysicalVertexV31(.19,1.18,s);b.strokeStyle='#6b3d23';b.lineWidth=Math.max(1,s.size*.034);b.lineCap='round';b.beginPath();b.moveTo(A.x,A.y);b.quadraticCurveTo(C.x,C.y,E.x,E.y);b.stroke();b.restore();
}
// ======== v32：桥上那阵风的红叶跟进温泉镇，慢慢落满石板路，片尾一阵风再吹起来 ========
// 切点时桥那阵风里的叶子（约 60 片，同一批粒子、同样的位置/颜色/大小）减速、左右荡着落下，21.4–25.8 秒陆续落到石板上；
// 右上角的红叶树也零星掉叶子。26.9 秒（片尾前约 0.9 秒）起风，所有叶子卷起来往右上吹，片子在叶子飞起来时结束。
const TOWN_FINAL_GUST_V32=26.9;
let townLeafCacheV32=null;
function townLeavesV32(){
 if(townLeafCacheV32)return townLeafCacheV32;const L=[];let k=0;
 gust.forEach((l,id)=>{const p0=windLeafState(l,5),p1=windLeafState(l,5.1);if(!p0||!p1||p1.x<-40||p1.x>W+40||p1.y>H)return;if(rnd(id,32001)>.5||L.length>=62)return;
  const hex=reds[l.color].slice(1);L.push({id,src:'bridge',particle:l,start:p1,color:l.color,base:[0,2,4].map(j=>parseInt(hex.slice(j,j+2),16)),k:k++});});
 for(let j=0;j<18;j++){const c=2+j%5,hex=reds[c].slice(1);L.push({id:9000+j,src:'tree',born:1.4+rnd(j,32011)*3.6,start:{x:860+rnd(j,32012)*240,y:120+rnd(j,32013)*420,size:9+rnd(j,32014)*12,spin:rnd(j,32015)*TAU,alpha:.95},color:c,base:[0,2,4].map(q=>parseInt(hex.slice(q,q+2),16)),k:k++});}
 L.forEach((d,i)=>{const r=v=>rnd(d.id,32020+v);
  d.world=[lerp(160,960,r(1)),lerp(1480,1860,Math.pow(r(2),.8))];
  d.land=d.src==='tree'?d.born+2.2+r(3)*1.2:.8+Math.pow(r(3),.9)*4.4;   // 落地时间散开：21.4–25.8 秒
  d.size=lerp(16,28,r(4));d.spin=r(5)*TAU;d.wob=30+r(6)*60;d.ph=r(7)*TAU;d.i=i;});
 return townLeafCacheV32=L;
}
function townLeafStateV32(d,t){
 const a=t-TOWN0;if(a<0)return {visible:false};
 const ground=townCarryGroundV31(t,d.world),common={id:d.id,base:d.base,ground,color:d.color};
 const t0=d.src==='tree'?d.born:.1;if(a<t0){if(d.src==='bridge'){const p=windLeafState(d.particle,5+a);return p?{...common,...p,visible:true,morph:0,pitch:0,yaw:0,fold:.2,height:null}:{visible:false};}return {visible:false};}
 if(a<d.land){
  const u=clamp((a-t0)/(d.land-t0)),target=townCarryGroundV31(TOWN0+d.land,d.world),p=d.start,sway=Math.sin(a*1.9+d.ph)*d.wob*(1-u)*Math.min(1,u*6);
  const ex=d.src==='bridge'?1-Math.pow(1-u,3):u;   // 桥上来的叶子先带着风往右冲一下，再慢下来
  return {...common,visible:true,x:lerp(p.x,target.x,ex)+sway,y:lerp(p.y,target.y,.3*u+.7*u*u),size:lerp(p.size,d.size,ease(u)),spin:lerp(p.spin,d.spin+d.wob*.05,ease(u))+Math.sin(a*2.3+d.ph)*.6*(1-u),
   pitch:lerp(.15,1.14,u*u),yaw:Math.sin(a*2.7+d.ph)*.9*(1-u)+.08*u,fold:lerp(.25,.16,u),alpha:d.src==='tree'?Math.min(1,(a-t0)/.35):lerp(p.alpha,1,u),morph:ease(clamp((a-t0)/.35)),height:(1-u)*Math.max(0,target.y-(lerp(p.y,target.y,.3*u+.7*u*u)))};
 }
 if(t<TOWN_FINAL_GUST_V32+d.i*.006){const age=a-d.land;return {...common,visible:true,x:ground.x,y:ground.y,size:d.size,spin:d.spin,pitch:1.14+.04*Math.exp(-age*20)*Math.sin(age*32),yaw:.08,fold:.16,alpha:1,morph:1,height:0};}
 const u=clamp((t-TOWN_FINAL_GUST_V32-d.i*.006)/1.3),q=Math.pow(u,1.35),A=[ground.x,ground.y],B=[ground.x+260+rnd(d.id,32031)*200,ground.y-260-rnd(d.id,32032)*200],C=[W+220+rnd(d.id,32033)*200,200+rnd(d.id,32034)*700],v=1-q;
 return {...common,visible:true,x:v*v*A[0]+2*v*q*B[0]+q*q*C[0],y:v*v*A[1]+2*v*q*B[1]+q*q*C[1],size:lerp(d.size,d.size*1.35,q),spin:d.spin+q*(4+rnd(d.id,32035)*3),pitch:lerp(1.14,-.45,clamp(u*2.2)),yaw:.08+Math.sin(q*5+d.i)*q,fold:.16+.2*Math.sin(Math.PI*u),alpha:1,morph:1,height:q*900};
}
function drawTownLeafCarryV32(b,t){
 if(t<TOWN0)return;const a=t-TOWN0,leaves=townLeavesV32(),selected=new Set(leaves.filter(d=>d.particle).map(d=>d.particle));
 if(a<.22)windLeaves(b,5+a,l=>!selected.has(l),1-a/.22);   // 没被选中的那部分叶子随原来的风很快出画
 const st=leaves.map(d=>townLeafStateV32(d,t)).filter(s=>s.visible&&s.x>-150&&s.x<W+150&&s.y>-150&&s.y<H+80);
 st.sort((p,q)=>(p.height===0?0:1)-(q.height===0?0:1));   // 地上的先画，空中的在上面
 for(const s of st){if(s.morph<1)flyingLeaf(b,s.x,s.y,s.size,s.spin,s.color,s.alpha*(1-s.morph));if(s.morph>0)drawTownPhysicalLeafV31(b,s);}
}
// ======== v33：桥上的风接进温泉镇——大部分叶子随风飞走，一小部分落进这个场景 ========
// 切点时桥那阵风里的叶子：大部分照原来的风继续往右飞出画面（不淡出）；挑 10 片慢下来落进场景：2 片落在近处屋顶上（附近的瓦跳一下），
// 2 片落进温泉池里（漂着、一圈圈涟漪），6 片落在前景的石板路上（离镜头近、大一些）。右上角的红叶树又零星掉几片。
// 片尾（26.8 秒起）一阵风从左往右扫过：风到哪里，那里的叶子才被掀起来——按物理算：随风加速、翻面、打旋，轻的飞走，
// 重的几片只在地上翻滚一段又停下，留在前景里；池里的叶子被吹着漂。瓦片在风里抖，窗扇被推开撞到头再弹回。
const TOWN_GUST_V33=26.55,TOWN_FRONT_SPEED_V33=1700;
const TOWN_STAY_V33=[ // [落点(中景坐标), 落地时间(镜头内秒), 类型, 大小]
 [[700,742],1.25,'roof',24],[[790,722],1.95,'roof',22],
 [[880,1352],2.35,'bath',24],[[580,1830],3.05,'ground',36],
 [[330,1590],1.6,'ground',34],[[520,1680],2.1,'ground',38],[[230,1730],2.7,'ground',36],[[640,1620],3.2,'ground',32],[[430,1780],3.7,'ground',40],[[760,1720],4.3,'ground',35],
];
let townStayCacheV33=null;
function townStayLeavesV33(){
 if(townStayCacheV33)return townStayCacheV33;
 const pool=gust.map((l,id)=>({l,id,p:windLeafState(l,5.1)})).filter(o=>o.p&&o.p.x>40&&o.p.x<760&&o.p.y>200&&o.p.y<1500).sort((A,B)=>rnd(A.id,33001)-rnd(B.id,33001));
 const out=TOWN_STAY_V33.map(([world,land,kind,size],i)=>{const o=pool[i],hex=reds[o.l.color].slice(1);
  return {i,id:o.id,particle:o.l,start:o.p,world,land,kind,size,color:o.l.color,base:[0,2,4].map(j=>parseInt(hex.slice(j,j+2),16)),spin:rnd(o.id,33002)*TAU,wob:30+rnd(o.id,33003)*50,ph:rnd(o.id,33004)*TAU,heavy:kind==='ground'&&i%3===1};});
 for(let j=0;j<6;j++){const c=2+j%5,hex=reds[c].slice(1);out.push({i:out.length,id:9100+j,src:'tree',born:1.6+j*.55+rnd(j,33011)*.3,start:{x:900+rnd(j,33012)*170,y:150+rnd(j,33013)*380,size:11+rnd(j,33014)*8,spin:rnd(j,33015)*TAU,alpha:1},
  world:[[280,1640],[600,1760],[150,1820],[820,1640],[380,1700],[700,1840]][j],land:4.2+j*.45,kind:'ground',size:28+rnd(j,33016)*10,color:c,base:[0,2,4].map(q=>parseInt(hex.slice(q,q+2),16)),spin:rnd(j,33017)*TAU,wob:40+rnd(j,33018)*40,ph:rnd(j,33019)*TAU,heavy:j===2});}
 return townStayCacheV33=out;
}
function townRoofLandsV33(){return townStayLeavesV33().filter(d=>d.kind==='roof').map(d=>({p:d.world,a:d.land}));}
// 片尾的风：从风到达这片叶子开始，按固定步长积分（确定性，拖动时间轴也一样）
function townGustFlightV33(d,ground,t){
 const arrive=TOWN_GUST_V33+(ground.x+200)/TOWN_FRONT_SPEED_V33+rnd(d.id,33021)*.12;if(t<arrive)return null;
 const dt=1/120,n=Math.floor((t-arrive)/dt),light=d.heavy?.25:(.7+rnd(d.id,33022)*.6),lift=d.kind==='roof'?1.2:light;
 let x=0,y=0,vx=0,vy=0,spin=d.spin,w=0,flip=0,fw=0;
 for(let k=0;k<n;k++){const tt=k*dt,gx=(700+260*Math.sin(tt*3.1+d.ph))*light,gy=(-220-380*lift+170*Math.sin(tt*4.7+d.ph*2))*(d.heavy?.15:1),drag=1.8+2.2*light;
  vx+=((gx-vx)*drag)*dt;vy+=((gy-vy)*drag+260)*dt;x+=vx*dt;y+=vy*dt;
  if(y>0){y=0;vy=-vy*.25;vx*=d.heavy?.9:.97;}   // 贴地的叶子在地上翻滚、被石板挡一下
  w+=((vx*.012+Math.sin(tt*6+d.ph)*3)-w)*3*dt;spin+=w*dt;fw+=((Math.abs(vx)*.02+4)-fw)*2*dt;flip+=fw*dt;}
 return {dx:x,dy:y,spin,flip,speed:Math.hypot(vx,vy)};
}
function townStayStateV33(d,t){
 const a=t-TOWN0;if(a<0)return null;
 const ground=townCarryGroundV31(t,d.world),common={id:d.id,base:d.base,ground,color:d.color};
 const t0=d.src==='tree'?d.born:.1;
 if(a<t0){if(d.src==='tree')return null;const p=windLeafState(d.particle,5+a);return p?{...common,...p,morph:0,pitch:0,yaw:0,fold:.2,height:null}:null;}
 if(a<d.land){
  const u=clamp((a-t0)/(d.land-t0)),target=townCarryGroundV31(TOWN0+d.land,d.world),p=d.start,ex=d.src==='tree'?u:1-Math.pow(1-u,3),y=lerp(p.y,target.y,.3*u+.7*u*u);
  return {...common,x:lerp(p.x,target.x,ex)+Math.sin(a*1.9+d.ph)*d.wob*(1-u)*Math.min(1,u*6),y,size:lerp(p.size,d.size,ease(u)),spin:lerp(p.spin,d.spin,ease(u))+Math.sin(a*2.3+d.ph)*.6*(1-u),
   pitch:lerp(.15,1.14,u*u),yaw:Math.sin(a*2.7+d.ph)*.9*(1-u)+.08*u,fold:lerp(.25,.16,u),alpha:d.src==='tree'?Math.min(1,(a-t0)/.35):lerp(p.alpha,1,u),morph:ease(clamp((a-t0)/.35)),height:d.kind==='roof'?null:Math.max(0,target.y-y)};
 }
 const age=a-d.land;let x=ground.x,y=ground.y,spin=d.spin;
 if(d.kind==='ground'){const sk=(1-Math.exp(-age*5))*14;x+=sk;spin+=(1-Math.exp(-age*5))*.25;}   // 落地时顺着风滑一下
 if(d.kind==='bath'){x+=Math.sin(age*.6+d.ph)*6+age*3;y+=Math.sin(age*1.7+d.ph)*1.5;spin+=Math.sin(age*.5)*.2;}   // 漂在水上
 const f=d.kind==='bath'?null:townGustFlightV33(d,{x,y},t);
 if(f)return {...common,x:x+f.dx,y:y+f.dy,size:d.size*(1+Math.min(.35,-f.dy/900)),spin:f.spin,pitch:1.14*Math.cos(f.flip),yaw:.5*Math.sin(f.flip*.7),fold:.16+.12*Math.abs(Math.sin(f.flip)),alpha:1,morph:1,height:d.kind==='roof'?null:Math.max(0,-f.dy)};
 if(d.kind==='bath'&&t>TOWN_GUST_V33+.6){x+=(t-TOWN_GUST_V33-.6)**2*60;}
 return {...common,x,y,size:d.size,spin,pitch:1.14+.04*Math.exp(-age*20)*Math.sin(age*32),yaw:.08,fold:.16,alpha:1,morph:1,height:d.kind==='roof'?null:0,age};
}
function drawTownLeafCarryV33(b,t){
 if(t<TOWN0)return;const a=t-TOWN0,stay=townStayLeavesV33(),picked=new Set(stay.filter(d=>d.particle).map(d=>d.particle));
 if(a<1.8)windLeaves(b,5+a,l=>!picked.has(l),1);   // 大部分叶子照原来的风继续飞出画面
 const st=[];for(const d of stay){const s=townStayStateV33(d,t);if(s&&s.x>-160&&s.x<W+160&&s.y>-160&&s.y<H+80)st.push([d,s]);}
 // 池子里：叶子落水的一圈圈涟漪
 for(const [d,s] of st)if(d.kind==='bath'&&s.age!==undefined){for(let k=0;k<3;k++){const u=fract((s.age-k*.45)/1.4);if(s.age<k*.45)continue;const fade=Math.exp(-s.age*.35);
  b.strokeStyle=`rgba(222,231,214,${.4*(1-u)*fade})`;b.lineWidth=1.3;b.beginPath();b.ellipse(s.x,s.y+2,6+u*34,2+u*10,-.1,0,TAU);b.stroke();}}
 st.sort((p,q)=>((p[1].height===0||p[1].height===null)?0:1)-((q[1].height===0||q[1].height===null)?0:1));
 for(const [d,s] of st){if(s.morph<1)flyingLeaf(b,s.x,s.y,s.size,s.spin,s.color,s.alpha*(1-s.morph));if(s.morph>0)drawTownPhysicalLeafV31(b,s);}
}
function drawTownLeafCarryV31(b,t){
 if(t<TOWN0)return;const a=t-TOWN0,leaves=townCarryLeavesV31(),selected=new Set(leaves.map(d=>d.particle));
 // The unselected original gust clears quickly. Selected leaves keep their original identity and positions.
 if(a<.22)windLeaves(b,5+a,l=>!selected.has(l),1-a/.22);
 for(const d of leaves){const s=townCarryStateV31(d,t);if(!s.visible)continue;
  if(s.morph<1)flyingLeaf(b,s.x,s.y,s.size,s.spin,s.color,s.alpha*(1-s.morph));
  if(s.morph>0)drawTownPhysicalLeafV31(b,s);
 }
}

function townPose(a){const u=clamp(a/7.2),e=1-Math.pow(1-u,2.4),g=easeIn(clamp((a-6.2)/1));return {z:1+.17*e+.03*g,x:-70*e,y:10*e+45*g};}   // v34：最后 0.75 秒越推越快（和开场推进鸟居同一种转场），接回开头   // v32：带着换景的势头往前推、往左移，片尾跟着风往上抬
function townSetDraw(b,a){
 const p=townPose(a),paint=(img,depth)=>{b.save();b.translate(840,1350);b.scale(1+(p.z-1)*depth,1+(p.z-1)*depth);b.translate(-840+p.x*depth,-1350+p.y*depth);b.drawImage(img,0,0,W,H);b.restore();};
 paint(townFarV25,.35);paint(townMidV25,.82);
 b.save();b.translate(840,1350);b.scale(1+(p.z-1)*.82,1+(p.z-1)*.82);b.translate(-840+p.x*.82,-1350+p.y*.82);
 townRoofTilesV30(b,a);townOpenWindows(b,a);townRoofCat(b,a);
 // Slow plumes rise from the actual hot water, not from the roof.
 for(let k=0;k<15;k++){const u=fract(a*.105+k/15),lane=k%3;
  glow(b,883+lane*52+Math.sin(u*4+k*.8)*15+u*(19+townWind(a-.2)*38),1362-u*177,24+u*29,20+u*39,[222,229,211],.23*Math.sin(Math.PI*u));
 }
 b.save();townBathPath(b);b.clip();
 for(let k=0;k<10;k++){const y=1330+k*8+Math.sin(a*.7+k)*1.2,x=826+Math.sin(a*.8+k)*7;b.strokeStyle=`rgba(203,217,197,${.10+.065*(.5+.5*Math.sin(a*1.1+k*1.7))})`;b.lineWidth=1.6;b.beginPath();b.moveTo(x+k%3*18,y);b.quadraticCurveTo(x+48,y+3,x+88,y-3);b.stroke();}
 // Ripples originate where feet meet the water, not from arbitrary decorative particles.
 for(let k=0;k<3;k++){
  const u=fract(a*.35+k/3),foot=townFeet(Math.max(0,a-u*1.1))[0];
  const x=807+foot.tip[0]*1.3,y=1408+foot.tip[1]*1.3;
  b.strokeStyle=`rgba(222,231,214,${.26*(1-u)})`;b.lineWidth=1.2;
  b.beginPath();b.ellipse(x,y,5+u*27,2+u*9,-.1,0,TAU);b.stroke();
 }
 b.strokeStyle='rgba(204,220,206,.4)';b.lineWidth=2;b.beginPath();b.moveTo(1030,1323);b.quadraticCurveTo(1025,1330,1029,1346);b.stroke();
 for(let k=0;k<3;k++){const u=fract(a*.38+k/3);b.strokeStyle=`rgba(210,221,204,${.22*(1-u)})`;b.beginPath();b.ellipse(1029,1348,6+u*21,2+u*6,0,0,TAU);b.stroke();}
 b.restore();
 // People share the bath's exact camera transform, so their seats never drift off the coping.
 townCoupleV25(b,a);b.restore();
 paint(townNearV25,1);
 b.save();b.translate(840,1350);b.scale(p.z,p.z);b.translate(-840+p.x,-1350+p.y);townWindTrees(b,a);b.restore();
 if(a>.7){b.save();b.globalAlpha=.28*clamp((a-.7)/.6);glow(b,350,1090,580,230,[6,13,22],1);b.restore();}
}

// 月光：月亮周围一大圈冷光，旁边几缕被照亮的薄云
function moonlight(b,x,y,a){
  b.save();b.globalCompositeOperation='lighter';glow(b,x,y,560,520,[120,146,196],.16);glow(b,x,y,200,190,[200,214,240],.14);b.restore();
  b.save();for(const [dx,dy,w,h,sd] of [[-150,70,300,18,9801],[170,-40,260,14,9803],[60,140,360,20,9805]]){b.globalAlpha=.5;softCloud(b,x+dx+a*6,y+dy,w,h,sd,.16);}b.restore();
}
const townMoonLayerV28=layer(b=>{
 glow(b,785,570,280,280,[139,157,184],.10);glow(b,785,570,95,95,[208,209,186],.13);
 b.save();b.shadowColor='rgba(215,218,201,.35)';b.shadowBlur=7;b.fillStyle='#d0d2bf';b.beginPath();b.arc(785,570,33,0,TAU);b.fill();b.restore();
 b.fillStyle='rgba(140,151,147,.12)';[[776,555,9],[794,577,13],[773,582,6]].forEach(([x,y,r])=>{b.beginPath();b.arc(x,y,r,0,TAU);b.fill();});
});
function townMoonTime(a){return TOWN0+4*ease(clamp(a/7.2));}
function townShot(b,t){
 const a=t-TOWN0,c=cameraState(5.0,'reveal'),mt=townMoonTime(a),m=moonG(mt);NIGHT_T=mt;
 camera(b,c.z,c.x,c.y);b.drawImage(nightSkyL,0,0,W,H);
 const soft=ease(clamp(a/1.2)),mx=c.x+(m[0]-540)/c.z-785,my=c.y+(m[1]-960)/c.z-570;
 b.save();b.globalAlpha=1-soft;b.drawImage(moonLayer,mx,my,W,H);b.globalAlpha=soft;b.drawImage(townMoonLayerV28,mx,my,W,H);b.restore();
 b.setTransform(1,0,0,1,0,0);glow(b,m[0],m[1],610,550,[121,143,177],.065);glow(b,m[0],m[1],240,220,[186,200,215],.055);
 b.save();for(const [dx,dy,w,h,sd] of [[-150,70,320,32,9801],[170,-40,280,28,9803],[60,140,360,34,9805]]){b.globalAlpha=.19;softCloud(b,m[0]+dx+a*2,m[1]+dy,w,h,sd,.10);}b.restore();
 const up=1-easeOut(clamp((a-.1)/.9));
 {const s=setC.getContext('2d');s.setTransform(1,0,0,1,0,0);s.clearRect(0,0,W,H);townSetDraw(s,a);b.drawImage(setC,0,H*up*.9,W,H);}
 const down=easeIn(clamp(a/.65));
 if(down<1){const s=landC.getContext('2d');s.setTransform(1,0,0,1,0,0);s.clearRect(0,0,W,H);MOONDX=mx;MOONDY=my;NOSKY=true;valleyShot(s,5.0,'reveal',false);NOSKY=false;b.drawImage(landC,0,H*down,W,H);}
 drawTownLeafCarryV33(b,t);
}
const flashAt=(t,t0)=>t<t0?0:Math.exp(-(t-t0)/.24)*(1-Math.exp(-(t-t0)/.03));
function nightLit(b,t){
  const kick=LIGHTS.reduce((s,[t0])=>s+flashAt(t,t0),0)*.012,end=LIGHTS[2][0]+.3;
  const shot=(c,dark)=>{c.save();if(kick>0){c.translate(W/2,H/2);c.scale(1+kick,1+kick);c.translate(-W/2,-H/2);}NU=dark;valleyShot(c,t,'reveal');NU=false;c.restore();};
  shot(b,false);
  if(t>=end)return;
  // 亮的一瞬间：灯区闪一下（按亮的画面加亮，只有红叶和桥变亮）
  if(LIGHTS.some(([t0])=>flashAt(t,t0)>.01)){
    const m=tintC.getContext('2d');m.setTransform(1,0,0,1,0,0);m.globalCompositeOperation='source-over';m.clearRect(0,0,W,H);
    maskInto(m,t0=>flashAt(t,t0));m.globalCompositeOperation='source-in';m.drawImage(b.canvas,0,0,W,H);m.globalCompositeOperation='source-over';
    b.save();b.setTransform(1,0,0,1,0,0);b.globalCompositeOperation='lighter';b.globalAlpha=.45;b.drawImage(tintC,0,0,W,H);b.restore();
  }
  // 没亮的地方盖上「没亮灯」的画面
  const u=unlitC.getContext('2d');u.setTransform(1,0,0,1,0,0);u.globalCompositeOperation='source-over';u.globalAlpha=1;u.clearRect(0,0,W,H);
  shot(u,true);
  u.globalCompositeOperation='destination-out';maskInto(u,t0=>easeOut(clamp((t-t0)/.12)));u.globalCompositeOperation='source-over';
  b.save();b.setTransform(1,0,0,1,0,0);b.drawImage(unlitC,0,0,W,H);b.restore();
}
function iris(b,cx,cy,r,draw){if(r<=0)return;const c=irisC.getContext('2d');c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,W,H);c.globalAlpha=1;draw(c);
  b.save();b.shadowColor='rgba(60,40,20,.45)';b.shadowBlur=28;b.fillStyle='#fff6e4';b.beginPath();b.arc(cx,cy,r+5,0,TAU);b.fill();b.restore();   // 窗的边：一圈纸色，带一点影子，像从地图上开了一个洞
  b.save();b.beginPath();b.arc(cx,cy,r,0,TAU);b.clip();b.drawImage(irisC,0,0);b.restore();}
function pinIcon(b,x,y,kind,pop,done){const k=pop<1?1+Math.sin(pop*Math.PI)*.35:1;if(pop<=0)return;b.save();b.translate(x,y-34*k);b.scale(k*Math.min(1,pop*3),k*Math.min(1,pop*3));
  b.shadowColor='rgba(60,40,20,.35)';b.shadowBlur=10;b.shadowOffsetY=4;b.fillStyle=done?'#c8452c':'#fff8ea';b.beginPath();b.arc(0,0,26,0,TAU);b.fill();b.beginPath();b.moveTo(-10,20);b.lineTo(0,36);b.lineTo(10,20);b.fill();b.shadowColor='transparent';
  b.strokeStyle=done?'#fff8ea':'#c8452c';b.lineWidth=3;b.beginPath();b.arc(0,0,26,0,TAU);b.stroke();const ic=done?'#fff8ea':'#c8452c';b.strokeStyle=ic;b.fillStyle=ic;
  if(kind==='bridge'){b.lineWidth=4;b.beginPath();b.moveTo(-15,6);b.quadraticCurveTo(0,-10,15,6);b.stroke();b.lineWidth=2;for(const xx of [-8,0,8]){b.beginPath();b.moveTo(xx,xx?-1:-3);b.lineTo(xx,6);b.stroke();}}
  else if(kind==='torii'){b.fillRect(-13,-11,26,4);b.fillRect(-10,-5,20,3);b.fillRect(-9,-8,4,20);b.fillRect(5,-8,4,20);}
  b.restore();}
function pulse(b,x,y,a){for(let k=0;k<3;k++){const q=fract(a*.9-k/3);b.save();b.globalAlpha=(1-q)*.6;b.strokeStyle='#c8452c';b.lineWidth=2.5;b.beginPath();b.ellipse(x,y,10+q*60,(10+q*60)*.45,0,0,TAU);b.stroke();b.restore();}}
function shade(b,cx,cy,rx,ry,a){b.save();b.translate(cx,cy);b.scale(1,ry/rx);const g=b.createRadialGradient(0,0,0,0,0,rx);g.addColorStop(0,`rgba(70,44,24,${a})`);g.addColorStop(.55,`rgba(70,44,24,${a*.6})`);g.addColorStop(1,'rgba(70,44,24,0)');b.fillStyle=g;b.fillRect(-rx,-rx,rx*2,rx*2);b.restore();}
function route(b,pts,u){if(u<=0)return;let L=0;const seg=[];for(let i=1;i<pts.length;i++){const d=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);seg.push(d);L+=d;}
  let left=L*u;b.save();b.strokeStyle='#c8452c';b.lineWidth=7;b.lineCap='round';b.setLineDash([2,14]);b.beginPath();b.moveTo(...pts[0]);let hx=pts[0][0],hy=pts[0][1];
  for(let i=1;i<pts.length&&left>0;i++){const f=Math.min(1,left/seg[i-1]);hx=pts[i-1][0]+(pts[i][0]-pts[i-1][0])*f;hy=pts[i-1][1]+(pts[i][1]-pts[i-1][1])*f;b.lineTo(hx,hy);left-=seg[i-1];}
  b.stroke();b.setLineDash([]);b.fillStyle='#c8452c';b.beginPath();b.arc(hx,hy,7,0,TAU);b.fill();b.restore();}
const NB0=1.4;                                                    // 夜里的红叶谷从 1.4 秒开始（在窗里先动起来）
const ROUTE_BT=[MAPPT.bridge,[770,1215],[786,1180],MAPPT.torii];
function mapView(t){                                              // 地图的取景：先停在红叶谷附近，后面移到鸟居附近
  const k=ease(clamp((t-6.0)/1.0)),ax=lerp(MAPPT.bridge[0],MAPPT.torii[0],k),ay=lerp(MAPPT.bridge[1],MAPPT.torii[1],k),z=t<5?1+.2*ease(clamp(t/2.2)):1.2+.45*ease(clamp((t-5.8)/1.0));
  const sx=lerp(540,lerp(MAPPT.bridge[0],MAPPT.torii[0],k)*.0+620,clamp(t/2.2)),sy=lerp(960,1150,clamp(t/2.2));const v={z,ax,ay,sx:t<2.2?lerp(ax,620,ease(clamp(t/2.2))):620,sy:t<2.2?lerp(ay,1150,ease(clamp(t/2.2))):1150};
  v.ax=clamp(v.ax,v.sx/z,W-(W-v.sx)/z);v.ay=clamp(v.ay,v.sy/z,H-(H-v.sy)/z);return v;}   // 不让地图边露出来
function toScreen(v,[x,y]){return [v.sx+(x-v.ax)*v.z,v.sy+(y-v.ay)*v.z];}
function mapShot(b,t){
  const v=mapView(t);
  b.save();b.translate(v.sx,v.sy);b.scale(v.z,v.z);b.translate(-v.ax,-v.ay);b.drawImage(picMap,0,0,W,H);
  route(b,ROUTE_BT,clamp((t-6.0)/.8));b.restore();
  shade(b,330,380,460,230,.24);if(t<1.8)shade(b,540,1450,560,190,.34*(1-clamp((t-1.3)/.5)));   // 浅色纸上，把标题和大字背后压暗一点
  const PB=toScreen(v,MAPPT.bridge),PT=toScreen(v,MAPPT.torii),done=t>6.0;
  if(t<6.0)pulse(b,PB[0],PB[1],t-.6);
  pinIcon(b,PB[0],PB[1],'bridge',clamp((t-.4)/.5),done);
  if(t>6.5){pulse(b,PT[0],PT[1],t-6.6);pinIcon(b,PT[0],PT[1],'torii',clamp((t-6.5)/.5),false);}
  if(t<MAP1E){const r=t<5?1500*ease(clamp((t-NB0)/.85)):1500*(1-ease(clamp((t-5.4)/.6)));iris(b,PB[0],PB[1]-34,r,c=>valleyShot(c,t-NB0,'reveal'));}   // 窗打开：夜里的红叶谷；回来时窗关上
  else{const r=1500*ease(clamp((t-TOR0)/.75));iris(b,PT[0],PT[1]-34,r,c=>toriiShot(c,t));}
}
const MAP1E=6.2;
// 神社：林中深处（v6 第 7 秒那个景别）——镜头先几乎不动，再慢慢升起，杉林沉下去，后面露出弥彦山和缆车，推向车厢，切到缆车
function gladeShot(b,t){
  // The reveal and cable shot share the same world, projection and clock.
  // Hold the forest composition with a gentle drift before lifting it away.
  const age=t-GL0,lift=ease(clamp((age-1.6)/1.8));
  ascentLit(b,t);
  // Same starting view and reveal duration. Nearby trees pass faster than the
  // temple, whose background recedes more slowly; no opacity wipe or new cut.
  for(const [img,depth,drop] of [[gladeFar,.86,GLADE_REVEAL],[gladeMiddle,1,0],[gladeNear,1.14,0]]){
    const Y=10*age*depth+2180*lift*depth+drop,z=1.06+lift*(depth-1)*.025;
    b.save();b.translate(-26-age*4*depth,Y-8);
    b.translate(540,1400);b.scale(z,z);b.translate(-540,-1400);
    // Compensate the pivot so frame zero retains V11's exact 1.06 projection.
    b.translate(540*.06/z,1400*.06/z);b.drawImage(img,0,0,W,H);b.restore();
  }
  directionalLeaves(b,t,.4);
}
const GL0=8,GLADE_REVEAL=170;   // v14：后排杉林往下放，后面的山多露出来一些
function shrineWalk(b,t){if(t<TR0||(t>=TR1&&t<CR0))walkScene(b,t);else if(t<TR1)riseToShrine(b,t);else craneScene(b,t);}

let variant='A';
function newCableY(x){return 1335-x*.57;}
function refinedCabin(b,x,y,s){
 b.save();b.translate(x,y);b.scale(-s,s);b.lineJoin='round';b.lineCap='round';
 // Running gear follows the same cable slope as the scene.
 b.strokeStyle='#344e50';b.lineWidth=8;b.beginPath();b.moveTo(-50,-28.5);b.lineTo(50,28.5);b.stroke();
 for(const xx of [-39,-23,23,39]){b.fillStyle='#233c40';b.beginPath();b.arc(xx,xx*.57,6,0,TAU);b.fill();b.strokeStyle='#b9c9c1';b.lineWidth=1.7;b.stroke();}
 b.strokeStyle='#b5c8bc';b.lineWidth=12;b.beginPath();b.moveTo(3,8);b.bezierCurveTo(13,50,10,87,-22,121);b.lineTo(-22,145);b.stroke();
 b.strokeStyle='#edf0da';b.lineWidth=3;b.beginPath();b.moveTo(0,10);b.bezierCurveTo(9,51,6,86,-26,120);b.stroke();
 poly(b,[[-45,140],[0,134],[16,149],[-51,157]],'#667f73');
 // Rounded roof lip and a shaded end face give the cabin weight.
 poly(b,[[-145,169],[-136,155],[57,133],[72,137],[132,166],[135,178],[61,167],[-145,190]],'#5ca394','#2b625c',1.5);
 poly(b,[[-136,157],[57,136],[119,165],[61,158],[-139,179]],'#84b9a2');
 poly(b,[[-142,186],[61,163],[61,282],[-134,306],[-143,295]],'#d4ddc6');
 poly(b,[[61,163],[132,177],[129,290],[61,282]],'#9db5a7');
 poly(b,[[-134,194],[53,172],[53,253],[-134,276]],'#244c57');
 poly(b,[[69,174],[123,184],[121,253],[69,250]],'#31535a');
 b.save();poly(b,[[-134,194],[53,172],[53,253],[-134,276]],null);b.clip();
 grad(b,-140,170,200,110,[[0,'rgba(143,194,198,.52)'],[.45,'rgba(74,127,139,.12)'],[1,'rgba(14,40,46,.6)']]);
 for(const [xx,yy,h]of [[-105,244,25],[-56,240,29],[18,231,23]]){b.fillStyle='rgba(17,37,42,.63)';b.beginPath();b.ellipse(xx,yy-h,4.5,5.5,0,0,TAU);b.fill();b.beginPath();b.ellipse(xx,yy-6,8,14,-.10,0,TAU);b.fill();}
 poly(b,[[-125,192],[-82,187],[-117,270],[-137,273]],'rgba(209,232,221,.19)');poly(b,[[-31,181],[0,178],[-38,263],[-64,267]],'rgba(219,236,224,.12)');b.restore();
 for(const xx of [-91,-48,-5,53]){const yy=194-(xx+134)*.118;b.strokeStyle='#b9d0c1';b.lineWidth=3.3;b.beginPath();b.moveTo(xx,yy);b.lineTo(xx,yy+81);b.stroke();b.strokeStyle='#658d87';b.lineWidth=1;b.beginPath();b.moveTo(xx+2,yy+1);b.lineTo(xx+2,yy+80);b.stroke();}
 b.strokeStyle='#bccdbb';b.lineWidth=3;b.beginPath();b.moveTo(96,180);b.lineTo(95,252);b.stroke();
 poly(b,[[-142,280],[61,257],[129,261],[129,270],[61,268],[-140,292]],'#e7c263');
 poly(b,[[-139,295],[61,272],[129,275],[128,291],[61,290],[-132,313],[-140,305]],'#327d6b');
 poly(b,[[-132,313],[61,290],[128,291],[117,300],[58,301],[-123,322]],'#254d4b');
 b.strokeStyle='#bad4b9';b.lineWidth=1.5;b.beginPath();b.moveTo(-132,297);b.lineTo(57,275);b.stroke();
 // Door seams, rubber edges and ventilation remain subordinate to the windows.
 b.strokeStyle='#78978a';b.lineWidth=1;b.beginPath();b.moveTo(-46,257);b.lineTo(-46,302);b.moveTo(-6,253);b.lineTo(-6,298);b.stroke();
 b.fillStyle='#68867b';b.fillRect(-41,277,2,7);b.fillRect(-12,274,2,7);
 for(let j=0;j<5;j++){b.strokeStyle='#306453';b.beginPath();b.moveTo(77+j*6,280);b.lineTo(77+j*6,287);b.stroke();}
 b.restore();
}
function ascentShot(b,t){
 if(variant==='V6'){ascentShotV6(b,t);return;}
 const u=clamp((t-8)/5),v=ease(u);
 b.save();camera(b,1.04+.025*u,558-12*u,976-9*u);b.drawImage(ascentLandscape,0,0,W,H);
 for(const offset of [-6,2,8]){b.strokeStyle=offset===2?'#314c49':'#9fb7a6';b.lineWidth=offset===2?3:1.3;b.beginPath();b.moveTo(-100,newCableY(-100)+offset);b.lineTo(1180,newCableY(1180)+offset);b.stroke();}
 const x=350+270*u;refinedCabin(b,x,newCableY(x),1.02+.045*u);b.restore();
}
// Layered western slopes, based on the official summit view towards the sea.
const blueSea=layer(b=>{
 grad(b,0,0,W,900,[[0,'#30586b'],[.48,'#8eb0b6'],[1,'#e3d9bc']]);
 softCloud(b,710,560,1020,115,301,.12);softCloud(b,220,740,980,60,305,.19);
 grad(b,0,880,W,H-880,[[0,'#b6c6bf'],[.12,'#8faeae'],[.7,'#588e9a'],[1,'#397281']]);
 for(let i=0;i<1700;i++){let y=890+rnd(i,311)*1000,d=(y-880)/1000;b.fillStyle=i%3?'rgba(224,232,215,.11)':'rgba(41,84,96,.09)';b.fillRect(rnd(i,312)*W,y,3+rnd(i,313)*(12+d*30),.5+d);}
});
const goldenSea=layer(b=>{
 grad(b,0,0,W,900,[[0,'#345567'],[.32,'#708c93'],[.69,'#c4bda3'],[1,'#e7c890']]);
 softCloud(b,780,600,1100,160,321,.23);softCloud(b,200,780,880,50,325,.22);
 glow(b,286,815,470,350,[255,214,145],.4);glow(b,286,815,105,100,[255,224,154],.55);
 b.fillStyle='#fff0bb';b.beginPath();b.arc(286,815,23,0,TAU);b.fill();
 grad(b,0,884,W,H-884,[[0,'#c3bfa3'],[.12,'#a3afa5'],[.6,'#729390'],[1,'#527b7e']]);
 for(let i=0;i<1700;i++){let y=888+rnd(i,331)*1000;b.fillStyle=i%3?'rgba(236,228,194,.13)':'rgba(45,83,87,.11)';b.fillRect(rnd(i,332)*W,y,3+rnd(i,333)*35,1);}
});
const summitFar=layer(b=>{
 naturalRidge(b,[[-70,1555],[50,1490],[110,1480],[200,1510],[300,1460],[390,1390],[475,1320],[570,1280],[650,1300],[760,1215],[860,1160],[945,1180],[1040,1120],[1150,1040]],351,['#4c7066','#648171','#7b8f73','#8f9b7a'],11000);
});
const summitMid=layer(b=>{
 naturalRidge(b,[[-60,1810],[70,1700],[170,1635],[260,1580],[345,1530],[430,1420],[520,1350],[610,1360],[700,1450],[780,1430],[875,1300],[960,1210],[1080,1155],[1150,1115]],371,['#284f43','#365d47','#4d7050','#667f50','#83915a','#9c9c61'],15500);
});
const summitNear=layer(b=>{
 naturalRidge(b,[[-70,2070],[240,1980],[480,1890],[620,1760],[700,1640],[765,1520],[840,1430],[910,1400],[970,1320],[1070,1230],[1160,1195]],391,['#1d4135','#2d523b','#406343','#587346','#76824c','#969253','#a59656'],17000);
});
const summitGround=layer(b=>{
 poly(b,[[-100,1740],[130,1680],[270,1645],[395,1620],[470,1618],[580,1650],[740,1710],[1100,1850],[1100,2020],[-100,2020]],'#555f47');
 poly(b,[[-60,2010],[680,2010],[605,1830],[575,1720],[500,1650],[430,1635],[350,1645],[265,1690],[180,1780]],'#a49d7d');
 for(let i=0;i<900;i++){let x=rnd(i,410)*1100,y=1635+rnd(i,411)*300;b.fillStyle=i%3?'rgba(34,49,38,.15)':'rgba(231,217,173,.16)';b.beginPath();b.ellipse(x,y,1+rnd(i,412)*3,.7+rnd(i,413),0,0,TAU);b.fill();}
 // Modest chain-and-post barrier, grounded in the summit reference photograph.
 const posts=[[70,1727,53],[210,1674,48],[350,1648,42],[510,1652,43],[690,1715,51]];
 for(let i=0;i<posts.length-1;i++){let [x,y,h]=posts[i],[xx,yy,hh]=posts[i+1];b.strokeStyle='#919482';b.lineWidth=2.5;b.beginPath();b.moveTo(x,y-h*.8);b.quadraticCurveTo((x+xx)/2,(y+yy-h-hh)/2+24,xx,yy-hh*.8);b.stroke();}
 for(const[x,y,h]of posts){grad(b,x-4,y-h,8,h,[[0,'#687465'],[1,'#394e41']]);b.fillStyle='#a3a48a';b.fillRect(x-5,y-h,10,3);}
});
function visitor(b,x,y,s,color){b.save();b.translate(x,y);b.scale(s,s);b.fillStyle='#2a3739';b.beginPath();b.ellipse(0,2,12,3,0,0,TAU);b.fill();b.strokeStyle='#233638';b.lineWidth=4.5;b.lineCap='round';b.beginPath();b.moveTo(-3,-20);b.lineTo(-4,0);b.moveTo(4,-20);b.lineTo(6,0);b.stroke();poly(b,[[-7,-47],[6,-47],[10,-20],[-9,-20]],color);b.fillStyle='#c7b79b';b.beginPath();b.arc(0,-55,6,0,TAU);b.fill();b.fillStyle='#394449';b.beginPath();b.ellipse(0,-58,7,3,0,0,TAU);b.fill();b.strokeStyle=color;b.lineWidth=4;b.beginPath();b.moveTo(-6,-44);b.lineTo(-12,-26);b.moveTo(6,-44);b.lineTo(12,-29);b.stroke();b.restore();}
function grasses(b,t,side,offset=0){
 b.save();b.translate(offset,0);for(let i=0;i<60;i++){let x=side<0?rnd(i,441)*235-40:880+rnd(i,442)*250,y=1760+rnd(i,443)*220,h=50+rnd(i,444)*150,sway=Math.sin(t*.65+i*.31)*(4+rnd(i,445)*5),tip=x+(rnd(i,446)-.5)*70+sway;
 b.strokeStyle=i%3?'#7c8457':'#aba174';b.lineWidth=1+rnd(i,447)*1.5;b.beginPath();b.moveTo(x,y);b.quadraticCurveTo(x+9,y-h*.5,tip,y-h);b.stroke();
 b.strokeStyle='rgba(209,193,148,.58)';b.lineWidth=1;for(let j=0;j<10;j++){b.beginPath();b.moveTo(tip,y-h+j*3);b.lineTo(tip+(j%2?1:-1)*(8-j*.4),y-h+j*3-9);b.stroke();}}
 b.restore();
}
function seaGlitter(b,t,warm){for(let i=0;i<120;i++){let y=900+i*4.8,w=(warm?12:4)+i*.28,x=286+Math.sin(i*.71+t*.36)*w*.5;b.fillStyle=`rgba(255,230,173,${(warm?.24:.09)*(1-i/145)})`;b.fillRect(x-w*.5,y,w*(.5+rnd(i,461)),1.1);}}
function summitShot(b,t){
 if(variant==='V6'){summitShotV6(b,t);return;}
 const u=clamp((t-13)/7),e=ease(u),warm=variant==='B';
 // A: approach a lookout; B: lateral overlook. Sea stays stable, near terrain moves.
 b.save();b.translate(warm?-8*e:-3*e,warm?0:-3*e);b.scale(1.01,1.01);b.drawImage(warm?goldenSea:blueSea,0,0,W,H);seaGlitter(b,t,warm);b.restore();
 b.save();b.translate(warm?-20*e:0,warm?4*e:12*e);b.scale(1.025,1.025);b.drawImage(summitFar,0,0,W,H);b.restore();
 b.save();b.translate(warm?-53*e:-14*e,warm?10*e:30*e);b.scale(1.065,1.065);b.drawImage(summitMid,0,0,W,H);b.restore();
 b.save();b.translate(warm?-115*e:-28*e,warm?18*e:60*e);b.scale(1.14,1.14);b.drawImage(summitNear,0,0,W,H);b.restore();
 if(!warm){
  b.save();camera(b,1+.12*e,540,960-75*e);b.drawImage(summitGround,0,0,W,H);visitor(b,411,1636,1.03,'#b19c74');visitor(b,445,1640,.94,'#6c7e7b');b.restore();
  grasses(b,t,-1,-24*e);grasses(b,t,1,25*e);
  // A few foreground leaves retreat to the left as the view opens.
  b.save();b.translate(-80*e,32*e);branch(b,-85,1660,210,.58,7,2,481);for(let i=0;i<200;i++){const x=-20+rnd(i,482)*125,y=1370+rnd(i,483)*290;maple(b,x,y,5+rnd(i,484)*8,rnd(i,485)*TAU,['#625a37','#8e713e','#b59351'][i%3]);}b.restore();
 }else{
  // A low, unobtrusive summit edge holds the viewpoint on the mountain.
  b.save();b.translate(-150*e,28*e);poly(b,[[-80,1790],[30,1770],[160,1810],[320,1870],[500,1940],[1200,2020],[-80,2020]],'#364c3c');
  for(let i=0;i<400;i++){let x=rnd(i,501)*500-60,y=1790+rnd(i,502)*220;b.fillStyle=['#506348','#718052','#938756'][i%3];b.fillRect(x,y,2+rnd(i,503)*3,1.5);}b.restore();
  grasses(b,t,-1,-150*e);grasses(b,t,1,-110*e);
 }
}

const moonLayer=layer(b=>{
  glow(b,785,570,230,230,[142,167,211],.23);glow(b,785,570,75,75,[255,236,194],.3);
  b.fillStyle='#f6e7c7';b.beginPath();b.arc(785,570,35,0,TAU);b.fill();
  b.fillStyle='rgba(154,155,150,.14)';[[776,555,9],[794,577,13],[773,582,6]].forEach(([x,y,r])=>{b.beginPath();b.arc(x,y,r,0,TAU);b.fill();});
});
const leafNear=layer(b=>{
  // v15：角上的树改成从画面外伸进来的一根横枝，枝上几簇叶（原来是从顶上一直挂到桥边的一整条叶柱）
  b.strokeStyle='#120c0c';b.lineCap='round';b.lineWidth=13;b.beginPath();b.moveTo(1130,-30);b.quadraticCurveTo(1010,40,860,70);b.stroke();
  b.lineWidth=6;b.beginPath();b.moveTo(1000,40);b.quadraticCurveTo(930,110,880,160);b.stroke();
  [[1040,30,170,80,501,.82,700],[870,80,120,60,511,.9,420],[905,170,80,52,513,.95,300],[-85,1570,200,250,521,.66,950]].forEach(a=>nightCrown(b,...a));
});
const leafSprites=reds.map(c=>layer(b=>{
  // Five unequal lobes and a visible stem keep close leaves recognisable.
  const shape=[[0,-1],[.14,-.46],[.3,-.57],[.25,-.2],[.67,-.67],[.55,-.15],[.95,-.26],[.73,.07],[.94,.18],[.47,.31],[.54,.53],[.18,.48],[0,.63],[-.18,.48],[-.54,.53],[-.47,.31],[-.94,.18],[-.73,.07],[-.95,-.26],[-.55,-.15],[-.67,-.67],[-.25,-.2],[-.3,-.57],[-.14,-.46]];
  b.strokeStyle=c;b.lineWidth=2.6;b.beginPath();b.moveTo(72,100);b.quadraticCurveTo(72,120,80,138);b.stroke();
  poly(b,shape.map(([x,y])=>[72+x*61,72+y*61]),c);
  b.strokeStyle='rgba(255,210,137,.42)';b.lineWidth=1.1;b.beginPath();for(const [x,y] of [[72,14],[34,34],[111,34],[17,60],[127,60]]){b.moveTo(72,105);b.lineTo(x,y);}b.stroke();
},144,144,1));
const flyingLeafColors=reds.map(hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)));
const flyingLeafFaces=reds.map(()=>[]);
function flyingLeaf(b,x,y,size,spin,color,alpha=1){
  // 近景复用温泉街的折面叶片；远景保留轻量贴图，避免密集落叶拖慢播放。
  if(size>=16){
    // 缓存 48 个翻面姿态；同色同姿态的叶子不再逐帧重复计算折面光照。
    const frame=Math.floor(fract((spin*.71+color*.9)/TAU)*48),phase=frame/48*TAU;
    const face=flyingLeafFaces[color][frame]||(flyingLeafFaces[color][frame]=layer(c=>drawTownPhysicalLeafV31(c,{x:72,y:72,size:61,spin:0,pitch:.35+1.5*Math.sin(phase),yaw:.55*Math.sin(phase*2),fold:.16+.04*Math.sin(phase),alpha:1,morph:1,height:null,base:flyingLeafColors[color]}),144,144,2));
    b.save();b.shadowColor='transparent';b.shadowBlur=0;b.shadowOffsetY=0;b.globalAlpha=alpha;b.translate(x,y);b.rotate(spin*.28+.25*Math.sin(spin*.9));b.drawImage(face,-size,-size,size*2,size*2);b.restore();return;
  }
  b.save();b.globalAlpha=alpha;b.translate(x,y);b.rotate(spin);b.scale(.28+.72*Math.abs(Math.cos(spin*.71)),1);b.drawImage(leafSprites[color],-size,-size,size*2,size*2);b.restore();
}
// One continuous build, not two gusts. Stratified birth times increase the
// emission rate smoothly; each leaf is emitted once and never recycled.
const gust=Array.from({length:260},(_,i)=>{
  const depth=rnd(i,151),birth=(i+rnd(i,152))/260;
  return {start:1.65+4.05*Math.sqrt(birth),life:1.35+(1-depth)*1.35,depth,y:300+rnd(i,153)*950,size:depth>.75?30+(depth-.75)*160:5+depth*22,spin:rnd(i,154)*TAU,fall:480+rnd(i,155)*640,color:2+i%5};
});
function windTravel(t){
  // Integral of a smooth speed ramp: 0.24 -> 1.15 from 2.2 to 5.6s.
  // Integrating speed (rather than multiplying age by current speed) keeps
  // trajectories and velocity continuous, including across the scene cut.
  const age=Math.max(0,t-2.2),span=3.4,u=clamp(age/span);
  return .24*(t-1.65)+.91*(span*(u*u*u-.5*u*u*u*u)+Math.max(0,age-span));
}
function windLeafState(l,t){
  if(t<l.start)return null;
  const u=(windTravel(t)-windTravel(l.start))/l.life;
  if(u<=0||u>=1)return null;
  return {x:-120+u*(W+300),y:l.y+u*l.fall+Math.sin(u*TAU+l.spin)*24,
    size:l.size,spin:l.spin+u*(5+l.depth*4),color:l.color,
    alpha:Math.min(1,u*12,(1-u)*9)*(.88+l.depth*.12)};
}
function windLeaves(b,t,keep,fade=1){
  // The bridge and torii use the same global clock and the same particles.
  // After the build, stop emitting and let the existing leaves exit naturally.
  for(const l of gust){
    if(keep&&!keep(l))continue;
    const p=windLeafState(l,t);
    if(p&&fade>0)flyingLeaf(b,p.x,p.y,p.size,p.spin,p.color,p.alpha*fade);
  }
}
function directionalLeaves(b,t,strength=1){
 b.save();for(let i=0;i<24;i++){
  const depth=rnd(i,3801),speed=60+depth*115,life=(W+240)/speed;
  const age=((t+rnd(i,3802)*life)%life),x=-120+age*speed;
  const y=350+rnd(i,3803)*850+age*28+Math.sin(age*.7+i)*18;
  flyingLeaf(b,x,y,4+depth*9,t*(.7+depth)+i,2+i%5,strength*(.3+depth*.35));
 }b.restore();
}
function bridgeVisitors(b,t,reflection=false){
 const deck=x=>1090-Math.sin(clamp((x-70)/950)*Math.PI)*60;
 b.save();if(reflection){b.translate(0,1300);b.scale(1,-.92);b.translate(0,-1300);b.globalAlpha=.13;}
 // Two distinct black silhouettes already embracing; no repetitive arm swing.
 // Heads lean together, arms wrap around the partner; hands are hidden.
 b.save();b.translate(588+Math.sin(t*.8)*.65,deck(588));b.rotate(Math.sin(t*.8)*.009);
 b.fillStyle='#080e15';b.strokeStyle='#080e15';b.lineCap='round';b.lineJoin='round';
 b.beginPath();b.ellipse(-6,-87,7.2,9,.25,0,TAU);b.fill();b.beginPath();b.ellipse(5,-82,7,8.5,-.35,0,TAU);b.fill();
 b.beginPath();b.moveTo(-14,-78);b.quadraticCurveTo(-4,-83,1,-68);b.lineTo(6,-25);b.lineTo(-16,-25);b.lineTo(-18,-61);b.closePath();b.fill();
 b.beginPath();b.moveTo(5,-73);b.quadraticCurveTo(14,-81,20,-69);b.lineTo(23,-24);b.lineTo(1,-24);b.lineTo(-2,-60);b.closePath();b.fill();
 b.lineWidth=6;b.beginPath();b.moveTo(-14,-72);b.quadraticCurveTo(-21,-54,17,-59);b.moveTo(18,-69);b.quadraticCurveTo(8,-79,-9,-69);b.stroke();
 b.lineWidth=5;b.beginPath();b.moveTo(-11,-26);b.lineTo(-13,-2);b.moveTo(-3,-26);b.lineTo(-1,-1);b.moveTo(8,-25);b.lineTo(7,-1);b.moveTo(17,-25);b.lineTo(19,-1);b.stroke();b.restore();
 // Repaint the near rail so walkers are inside, not pasted over the bridge.
 if(!reflection){for(let k=0;k<3;k++){b.strokeStyle=NU?(k?'#24222e':'#2c2a36'):(k?'#ad4f3b':'#d77953');b.lineWidth=k?5:8;b.beginPath();for(let x=550;x<=690;x+=2)b[x===550?'moveTo':'lineTo'](x,deck(x)-51+k*18);b.stroke();}
 for(let x=550;x<=690;x++){if((x-70)%48===0){b.fillStyle=NU?'#26242f':'#b3513e';b.fillRect(x-3.2,deck(x)-51,6.4,51);}}
 }
 b.restore();
}
const motif=Array.from({length:20},(_,i)=>({x:rnd(i,91)*1400-150,y:rnd(i,92)*1900,s:3+rnd(i,93)*8,p:rnd(i,94),c:reds[2+i%5]}));
function leaves(b,t,wind=0){motif.forEach((l,i)=>{let u=fract(l.p+t/20),x=l.x+Math.sin(u*TAU+i)*28+wind*130*Math.sin(i),y=fract(l.y/H+t/20)*H; b.globalAlpha=.5+.4*Math.sin(Math.PI*u);maple(b,x,y,l.s,TAU*u+i,l.c);});b.globalAlpha=1;}
// 倒影：预先把翻转、压扁、逐渐变淡的倒影画成一张（每行 1 像素），播放时按 6 像素一条整条地左右晃，条与条不重叠——
// 原来每帧画约 300 条 2 像素的细条、相互重叠 0.2 像素，镜头一推，重叠的细线落在不同像素上，水面会一闪一闪
let reflV=null;
function bakeRefl(){reflV=layer(b=>{for(let yy=1300;yy<H;yy++){const d=yy-1300,src=1300-d*.92;b.globalAlpha=Math.max(0,.58-d*.00048);b.drawImage(valley,0,src*Q,W*Q,.92*Q,0,yy,W,1);}b.globalAlpha=1;});}
function water(b,t){
  if(!reflV)bakeRefl();
  grad(b,0,1300,W,620,[[0,'#14232d'],[.5,'#152434'],[1,'#081522']]);
  for(let yy=1300;yy<H;yy+=6){const d=yy-1300,off=Math.sin(yy*.017+TAU*t/10)*1.6+Math.sin(yy*.007-TAU*t/20)*(1+d*.004);b.drawImage(NU?unlit('reflV',reflV):reflV,0,yy*Q,W*Q,6*Q,off,yy,W,6);}
  b.globalAlpha=1;
  glow(b,785+MOONDX,1530,100,230,[157,177,195],.1);
  for(let i=0;i<24;i++){let yy=1485+i*12,ww=(24+Math.sin(i*.3)*11)*(1-i/65),x=785+MOONDX+Math.sin(i*.9+TAU*t/10)*(4+i*.22);b.fillStyle='rgba(232,223,195,'+(.32*(1-i/45))+')';b.fillRect(x-ww/2,yy,ww,1.5);}
  for(let i=0;i<20;i++){let y=1320+rnd(i,102)*600,x=rnd(i,101)*W,w=8+rnd(i,103)*45;b.strokeStyle='rgba(169,189,195,.07)';b.lineWidth=1;b.beginPath();b.moveTo(x+Math.sin(TAU*t/20+i)*8,y);b.lineTo(x+w+Math.sin(TAU*t/20+i)*8,y);b.stroke();}
}
function camera(b,z,x,y){b.translate(W/2,H/2);b.scale(z,z);b.translate(-x,-y);}
function cameraState(t,mode){
  if(mode==='shrine'){let u=ease(clamp((t-4)/4));return {z:1+.075*u,x:540+12*u,y:960-10*u};}
  if(mode==='ascent'){let u=clamp((t-8)/5);return {z:1+.02*u,x:540+8*u,y:960-8*u};}
  if(mode==='summit'){let u=clamp((t-13)/7);return {z:1+.026*u,x:540+22*u,y:960+6*u};}
  if(mode==='water')return {z:1.8,x:660,y:1360};
  let u=clamp((t-2.2)/3.4),travel=.12*u+.88*u*u*u;return {z:1.045+.15*travel,x:528+90*travel,y:960-22*travel};
}
function valleyShot(b,t,mode,showGust=true){
  b.save();const {z,x,y}=cameraState(t,mode);
  camera(b,z,x,y);if(!NOSKY){b.drawImage(nightSkyL,0,0,W,H);const m=moonG(NIGHT_T);MOONDX=x+(m[0]-540)/z-785;MOONDY=y+(m[1]-960)/z-570;b.drawImage(moonLayer,MOONDX,MOONDY,W,H);}
  if(SKYONLY){b.restore();return;}
  b.drawImage(NU?unlit('valleySet',valleySet):valleySet,0,0,W,H);water(b,t);bridgeVisitors(b,t);bridgeVisitors(b,t,true);
  // A single leaf arrives at the surface: motion gives the reflection a cause.
  if(mode==='water'){let u=clamp((t-14)/1.5),xx=690-38*u,yy=1170+300*u;maple(b,xx,yy,14-u*3,1+u*3,'#e79551');if(t>15.5){let age=t-15.5;for(let k=0;k<3;k++){let a=age-k*.22;if(a<0)continue;b.strokeStyle='rgba(220,192,147,'+(.35*clamp(1-a/4.5))+')';b.lineWidth=1.2;b.beginPath();b.ellipse(652,1470,12+a*63,3+a*13,0,0,TAU);b.stroke();}}}
  b.restore();
  directionalLeaves(b,t,.5);                                     // 飘的小叶子不镜像，和那阵风同一个方向
  // Foreground parallax is independent of the background camera.
  if(mode!=='water'){b.save();const wind=Math.sin(clamp((t-1)/6)*Math.PI);b.translate(-65*Math.pow(clamp((t-2.2)/3.4),2)+wind*8,wind*3);b.drawImage(NU?unlit('leafNear',leafNear):leafNear,0,0,W,H);b.restore();if(showGust)windLeaves(b,t);}
}
function shrineShotV6(b,t){const u=ease(clamp((t-4)/4));b.save();const {z,x,y}=cameraState(t,'shrine');camera(b,z,x,y);b.drawImage(forest,0,0,W,H);leaves(b,t);b.restore();b.save();b.translate(-13*u,9*u);b.drawImage(shrineForeground,0,0,W,H);b.restore();}
const screenA=layer(()=>{},W,H,1),screenB=layer(()=>{},W,H,1);
function paintShot(c,id,t){
 const b=c.getContext('2d');b.setTransform(1,0,0,1,0,0);b.clearRect(0,0,W,H);
 // Re-time only the lengthened shots. Opening, gate and sea keep real-time speed.
 if(variant!=='V6'){({overview:overviewShot,map:mapShot,night:nightV18,torii:toriiShot,glade:gladeShot,ascent:ascentLit,sunset:sunsetLit,town:townShot})[id](b,sourceTime(t));return;}
 if(variant!=='V6'){const s=scenePlan.find(s=>s.id===id);t=s.source+(t-s.start)*s.span/(s.end-s.start);}
 if(id==='gate')gateShot(b,t);else if(id==='shrine')shrineShot(b,t);else if(id==='ascent')ascentShot(b,t);else if(id==='summit')summitShot(b,t);else valleyShot(b,t,id);
}
function shotAt(t){
 if(variant!=='V6')return PLAN.find(([,a,c])=>t>=a&&t<c)[0];
 if(false)return scenePlan.find(s=>t>=s.start&&t<s.end)?.id||'reveal';
 if(t<4)return 'reveal';if(t<8)return 'shrine';if(t<13)return 'ascent';return 'summit';
}
const transitions=[]; // Clean cuts between independent shots; no overlapping architecture.
const facts=[
 [0,4,'弥彦公园 · 红叶谷与观月桥'],
 [4,9.2,'弥彦神社 · 穿过鸟居 走进杉林'],
 [9.2,12.5,'弥彦神社 · 山林环抱的拜殿'],
 [12.5,18,'弥彦山缆车 · 约五分钟上山'],
 [18,22,'弥彦山 · 山顶望向日本海'],
 [22,25,'弥彦山 · 山风与海光'],
];
function smallType(t){
 const active=facts.find(([a,b])=>t>=a&&t<b);if(!active)return;
 g.save();g.shadowColor='#08101a';g.shadowBlur=9;g.shadowOffsetY=2;
 g.fillStyle='#ca9e73';g.fillRect(80,449,2,29);text(active[2],99,480,32,'#ece0c8',400,'left',.8);g.restore();
}
function titles(t){
 // Place title and upper-left caption remain visible through every scene.
 let a=1;
 if(a>0){g.save();g.globalAlpha=a;drawHeader(t,{light:.12,lc:[235,196,144],x:785},{title:'弥彦',place:'新潟县弥彦村',story:[],sheen:[100,650,700,600],reflect:false,accent:'#cba77c',storyColor:'#b6c1c8'});g.restore();smallType(t);}
 let headline='',sub='',alpha=0;
 if(t<3.9){headline='把秋天多留一晚';sub='新潟 · 弥彦';alpha=t<3.3?1:1-ease((t-3.3)/.6);}
 if(alpha>0){g.save();g.globalAlpha=alpha;g.shadowColor='#08101a';g.shadowBlur=16;text(headline,490,1465,66,'#f2e5cd',400,'center',5);text(sub,490,1520,27,'#b2c0c6',400,'center',3);g.restore();}
 if(t>=18.5){let a=ease(clamp((t-18.5)/.8));g.save();g.globalAlpha=a;g.shadowColor='#142d35';g.shadowBlur=14;g.shadowOffsetY=2;text(variant==='B'?'山风吹来 海在眼前':'走到山顶 海就展开',505,680,57,'#f2e5cd',400,'center',5);text(variant==='B'?'在这里 多看一会儿':'把山海也留进这个秋天',505,733,28,'#ece0c8',400,'center',2);g.restore();}
 // Quiet chapter label, away from platform UI.
 if(t>9.6&&t<12.3){g.save();g.globalAlpha=Math.min(clamp((t-9.6)/.4),clamp((12.3-t)/.3));text('山林深处 一座弥彦神社',490,1495,39,'#e6d7be',400,'center',3);g.restore();}
}
const factsV6=[
 [0,4,'弥彦公园 · 红叶谷与观月桥'],
 [4,8,'彌彦神社 · 二礼四拍手一礼'],
 [8,13,'弥彦山缆车 · 约五分钟上山'],
 [13,17,'弥彦山 Skyline · 山路望向日本海'],
 [17,20,'弥彦山 Skyline · 秋色与日本海'],
];
function smallTypeV6(t){
 const active=factsV6.find(([a,b])=>t>=a&&t<b);if(!active)return;
 g.save();g.shadowColor='#08101a';g.shadowBlur=9;g.shadowOffsetY=2;
 g.fillStyle='#ca9e73';g.fillRect(80,449,2,29);text(active[2],99,480,32,'#ece0c8',400,'left',.8);g.restore();
}
function titlesV6(t){
 // Place title and upper-left caption remain visible through every scene.
 let a=1;
 if(a>0){g.save();g.globalAlpha=a;drawHeader(t,{light:.12,lc:[235,196,144],x:785},{title:'弥彦',place:'新潟县弥彦村',story:[],sheen:[100,650,700,600],reflect:false,accent:'#cba77c',storyColor:'#b6c1c8'});g.restore();smallTypeV6(t);}
 let headline='',sub='',alpha=0;
 if(t<3.9){headline='把秋天多留一晚';sub='新潟 · 弥彦';alpha=t<3.3?1:1-ease((t-3.3)/.6);}
 if(alpha>0){g.save();g.globalAlpha=alpha;g.shadowColor='#08101a';g.shadowBlur=16;text(headline,490,1465,66,'#f2e5cd',400,'center',5);text(sub,490,1520,27,'#b2c0c6',400,'center',3);g.restore();}
 if(t>=13.5){let a=ease(clamp((t-13.5)/.8));g.save();g.globalAlpha=a;g.shadowColor='#142d35';g.shadowBlur=14;g.shadowOffsetY=2;text('上山之后 是海',430,680,60,'#f2e5cd',400,'center',5);text('把山海也留进这个秋天',430,733,28,'#ece0c8',400,'center',2);g.restore();}
 // Quiet chapter label, away from platform UI.
 if(t>4.2&&t<7.8){g.save();g.globalAlpha=Math.min(clamp((t-4.2)/.3),clamp((7.8-t)/.3));text('沿着杉林 走进彌彦神社',490,1495,39,'#e6d7be',400,'center',3);g.restore();}
}

// ======== v34：拟声词（漫画式的小字，跳出来、停一下、淡掉）========
const SFX=[ // v36：只留猫的；v37：日落月升加一个
 [16.8,'ストン',()=>{const S=sunScreen(16.8);return [S[0]-70,S[1]-170];},62,-.08,'lines'],
 [TOWN0+2.3,'！',()=>{const c=townCatState(2.3),q=townCarryGroundV31(TOWN0+2.3,[c.x,c.y]);return [q.x+20,q.y-70];},50,0,'lines'],
 [TOWN0+2.85,'ニャッ',()=>{const c=townCatState(2.85),q=townCarryGroundV31(TOWN0+2.85,[c.x,c.y]);return [q.x+30,q.y-95];},54,-.12,'lines'],
];
const SFX_FILL='#ffd84a',SFX_INK='rgba(26,16,8,.9)';
function sfxMark(b,kind,w,size,u){
 b.save();b.strokeStyle=SFX_FILL;b.lineCap='round';
 const ink=(f)=>{b.save();b.strokeStyle=SFX_INK;b.lineWidth+=size*.09;f();b.restore();f();};
 if(kind==='lines'){b.lineWidth=size*.09;for(const k of [0,1]){const x=-w/2-size*.25-k*size*.18,y=-size*.55+k*size*.08;ink(()=>{b.beginPath();b.moveTo(x,y);b.lineTo(x-size*.22,y-size*.32);b.stroke();});}}   // 两条短线（漫画里吃惊/强调）
 if(kind==='burst'){b.lineWidth=size*.07;for(let k=0;k<8;k++){const an=k/8*TAU+.2,r0=Math.max(w*.62,size*.75)*(1+.15*u),r1=r0+size*.35*(1-u*.5);ink(()=>{b.beginPath();b.moveTo(Math.cos(an)*r0,Math.sin(an)*r0*.7);b.lineTo(Math.cos(an)*r1,Math.sin(an)*r1*.7);b.stroke();});}}   // 放射线
 if(kind==='note'){b.font=`900 ${size*.9}px "Hiragino Sans","Noto Sans JP","IPAGothic",sans-serif`;b.textAlign='center';b.textBaseline='middle';b.lineWidth=size*.14;b.strokeStyle=SFX_INK;b.strokeText('♪',w/2+size*.45,-size*.45);b.fillStyle=SFX_FILL;b.fillText('♪',w/2+size*.45,-size*.45);}
 if(kind==='drops'){for(const [dx,dy] of [[-.4,.7],[0,.85],[.4,.7]]){b.fillStyle=SFX_FILL;b.strokeStyle=SFX_INK;b.lineWidth=size*.06;b.beginPath();b.ellipse(dx*w,dy*size*(1+u*.6),size*.07,size*.11,0,0,TAU);b.fill();b.stroke();}}
 b.restore();
}
function drawSfx(b,t,only){
 for(const [t0,word,pos,size,rot,mark] of SFX){const u=(t-t0)/.8;if(u<0||u>1)continue;if(only&&!only(t0))continue;
  const [x,y]=typeof pos==='function'?pos():pos,grow=lerp(.62,1.22,easeOut(u)),al=u<.7?1:1-(u-.7)/.3;   // 字慢慢变大
  b.save();b.globalAlpha=al;b.translate(x,y-u*16);b.rotate(rot);b.scale(grow,grow);
  b.font=`900 ${size}px "Hiragino Sans","Noto Sans JP","Yu Gothic","IPAGothic",sans-serif`;b.textAlign='center';b.textBaseline='middle';b.lineJoin='round';
  const total=b.measureText(word).width*.92;let cx=-total/2;
  for(const [i,ch] of [...word].entries()){const w=b.measureText(ch).width,dy=Math.sin(i*1.7+t0)*size*.08,r=(rnd(i,t0*10)-.5)*.18;
   b.save();b.translate(cx+w/2,dy);b.rotate(r);b.strokeStyle=SFX_INK;b.lineWidth=size*.17;b.strokeText(ch,0,0);b.fillStyle=SFX_FILL;b.fillText(ch,0,0);b.restore();cx+=w*.92;}
  if(mark)sfxMark(b,mark,total,size,u);
  b.restore();}
}
// ======== v35：漫画式的风——几条细线吹过来，打一个小圈，再吹走；叶子跟着风走 ========
const WINDS=[
 {id:'loop',leafy:1,t0:-1.0,t1:.7,P:[[-150,1700],[300,1400],[700,1100],[1260,700]],la:.9,lb:.95,R:0,riders:0,seed:35050,nolines:1,nofront:1,amp:.42},
 {id:'map',leafy:1,t0:.55,t1:2.25,P:[[-150,980],[300,1060],[720,690],[1260,540]],la:.4,lb:.62,R:110,riders:24,spread:70,seed:35100},
 {id:'cut',leafy:1,t0:2.45,t1:4.45,P:[[-150,1260],[340,1160],[720,1260],[1260,780]],la:.5,lb:.72,R:130,riders:28,spread:90,seed:35200,detach:{n:8,s:.8}},
 {id:'bridge',t0:19.0,t1:20.4,P:[[-150,720],[320,880],[700,520],[1260,640]],la:.44,lb:.64,R:100,riders:0,seed:35300},
 {id:'town',t0:26.45,t1:27.25,P:[[-150,1500],[300,1340],[720,1520],[1260,980]],la:.45,lb:.66,R:115,riders:0,seed:35400},
];
function windCurve(w,s){const q=1-s,P=w.P,x=q*q*q*P[0][0]+3*q*q*s*P[1][0]+3*q*s*s*P[2][0]+s*s*s*P[3][0],y=q*q*q*P[0][1]+3*q*q*s*P[1][1]+3*q*s*s*P[2][1]+s*s*s*P[3][1];
 const ph=TAU*clamp((s-w.la)/(w.lb-w.la));return [x+w.R*Math.sin(ph),y-w.R*(1-Math.cos(ph))];}
const windHead=(w,t)=>lerp(-.06,1.3,(t-w.t0)/(w.t1-w.t0));
function windNormal(w,s){const a=windCurve(w,clamp(s-.004)),c=windCurve(w,clamp(s+.004)),dx=c[0]-a[0],dy=c[1]-a[1],l=Math.hypot(dx,dy)||1;return [-dy/l,dx/l];}
function drawWindLines(b,w,t){
 if(w.nolines)return;
 if(t<w.t0||t>w.t1)return;const h=windHead(w,t),fade=Math.min(1,(t-w.t0)/.15,(w.t1-t)/.2);
 for(const [k,off,len] of [[0,-15,.2],[1,0,.3],[2,17,.16]]){
  const s1=Math.min(1,h),s0=Math.max(0,h-len);if(s1<=s0)continue;const n=36,pts=[];
  for(let i=0;i<=n;i++){const ss=lerp(s0,s1,i/n),c=windCurve(w,ss),nm=windNormal(w,ss);pts.push([c[0]+nm[0]*off,c[1]+nm[1]*off]);}
  for(const pass of [0,1])for(let i=1;i<=n;i++){const u=i/n,wd=(.6+3.6*Math.sin(Math.PI*Math.min(1,u*1.15)))*(k===1?1.25:1);
   b.strokeStyle=pass?`rgba(255,250,236,${.32*fade})`:`rgba(30,22,16,${.08*fade})`;b.lineWidth=wd*.6+(pass?0:2);/* v36：更淡，只是示意 */b.lineCap='round';b.beginPath();b.moveTo(...pts[i-1]);b.lineTo(...pts[i]);b.stroke();}
 }
}
// v36：叶子不再贴着风线走，而是自己按物理动——重力、空气阻力、风推、旋涡卷、翻转；风只是一个看不见的速度场，风线只是示意。
function windField(x,y,t){
 let vx=0,vy=0;
 for(const w of WINDS){if(!w.leafy||t<w.t0||t>w.t1)continue;const u=(t-w.t0)/(w.t1-w.t0),env=Math.pow(Math.sin(Math.PI*u),2);
  const front=windCurve(w,clamp(windHead(w,t)))[0]+120,reach=w.nofront?1:clamp((front-x)/260);   // 风到哪里才吹到哪里
  const dx=w.P[3][0]-w.P[0][0],dy=w.P[3][1]-w.P[0][1],l=Math.hypot(dx,dy);const amp=1150*(w.amp||1);vx+=dx/l*amp*env*reach;vy+=dy/l*amp*env*reach;
  const ls=(w.la+w.lb)/2,c=windCurve(w,ls),tl=w.t0+(ls+.06)/1.36*(w.t1-w.t0),ve=Math.exp(-Math.pow((t-tl)/.35,2));   // 打圈的地方有个小旋涡
  const rx=x-c[0],ry=y-(c[1]-w.R),r2=rx*rx+ry*ry,sw=1300*ve*Math.exp(-r2/(170*170));vx+=-ry/170*sw;vy+=rx/170*sw;}
 return [vx,vy];
}
const OPEN_LEAVES=(()=>{const L=[];
 for(let j=0;j<18;j++){const r=v=>rnd(j,36100+v);L.push({born:.1+r(1)*1.7,x:-60+r(2)*560,y:300+r(3)*900,vx:40,vy:-20,size:12+r(4)*20,color:2+j%5,ph:r(5)*TAU,k:1.4+r(6)*1.4,land:null});}   // 地图上被风卷起来的
 for(let j=0;j<16;j++){const r=v=>rnd(j,36200+v);L.push({born:2.15+r(1)*.9,x:-80+r(2)*520,y:650+r(3)*800,vx:60,vy:0,size:13+r(4)*21,color:2+j%5,ph:r(5)*TAU,k:1.3+r(6)*1.4,land:1480+r(7)*300});}   // 跨过切点、落进鸟居的
 for(let j=0;j<12;j++){const r=v=>rnd(j,36300+v),left=r(2)<.5;L.push({born:3.25+r(1)*2.9,x:left?20+r(3)*230:820+r(3)*240,y:330+r(4)*520,vx:(left?40:-40),vy:60,size:10+r(5)*13,color:2+j%5,ph:r(6)*TAU,k:1.9+r(7)*1.2,land:1480+r(8)*320});}   // 鸟居两边的红叶，树上很快落下来
 // 循环：温泉街满屏硬切到开场，同一批叶子接着飞（时间 τ = t − 片长 < 0 时就是片尾）。
 for(let j=0;j<22;j++){const r=v=>rnd(j,36400+v);L.push({born:-.85+r(1)*.25,x:40+r(2)*560,y:1380+r(3)*360,vx:150+r(4)*200,vy:-520-r(5)*380,size:24+r(6)*22,color:2+j%5,ph:r(7)*TAU,k:1.2+r(8)*1.2,land:null,loop:true});}
 return L;})();
// v37：鸟居参道上已经停着的实体叶子（有折面、叶脉、贴地阴影，跟着画面一起动）
const TORII_GROUND=Array.from({length:16},(_,j)=>{const r=v=>rnd(j,37100+v),y=1520+r(1)*340,half=lerp(120,330,(y-1500)/360),c=2+j%5,hex=reds[c].slice(1);
 return {x:540+(r(2)-.5)*2*half,y,size:lerp(12,22,(y-1500)/360)*(.8+r(3)*.4),spin:r(4)*TAU,base:[0,2,4].map(q=>parseInt(hex.slice(q,q+2),16))};});
function toriiGroundLeaves(b){for(const l of TORII_GROUND)drawTownPhysicalLeafV31(b,{x:l.x,y:l.y,size:l.size,spin:l.spin,pitch:1.14,yaw:.08,fold:.16,alpha:1,morph:1,height:0,ground:{x:l.x,y:l.y},base:l.base});}
const openLeafState = createLeafStateSampler(windField);
function windMomentTime(t){return t<2.2?t+3.4:t>=24.4?t-24.4:t-17;}
function drawWindSceneMoment(b,t){
 const a=windMomentTime(t);if(a<0||a>(t<2.2||t>=24.4?5.6:3.4))return;
 const right=t<2.2||t>=24.4,side=right?-1:1,force=q=>Math.pow(Math.sin(Math.PI*clamp((q-.45)/1.9)),2),fade=clamp(a/.3)*clamp(((right?5.6:3.4)-a)/.35);
 // 近枝先偏转，后枝延迟响应；附着叶片到各自时刻才脱落。
 for(let branch=1;branch>=0;branch--){const lag=branch*.22,f=force(a-lag);b.save();b.globalAlpha=fade*clamp((3.4-a)/.35)*(branch?.55:1);b.translate(right?W+20:-20,branch?790:610);b.scale(side,1);b.rotate(-.12*f);b.strokeStyle=branch?'#4c4030':'#382c24';b.lineWidth=branch?5:8;b.lineCap='round';b.beginPath();b.moveTo(0,65);b.quadraticCurveTo(105,10,260,-35);b.stroke();for(let j=0;j<10;j++){const release=.75+lag+j*.045;if(a<release)maple(b,35+j*22,50-j*9,15+j%3*6,-.4+j*.3,reds[2+j%5]);}b.restore();}
 for(let i=0;i<7;i++){const age=a-(.82+i*.09);if(age<0)continue;const x=side>0?30+i*23+85*age+170*age*age:W-30-i*23-85*age-170*age*age,y=590-i*8-145*age+72*age*age;flyingLeaf(b,x,y,17+i%3*10,i*.8+age*(.65+i*.12),2+i%5,fade);}
 // 单片近景主角：被风托住半拍，再翻出暗面、掠过镜头，露出桥或温泉街。
 const u=right?(a-1.35)/2.8:(a-.8)/1.85;if(u>=0&&u<=1){const p=u+.11*Math.sin(TAU*u),q=1-p,x=-130*q*q*q+3*330*q*q*p+3*560*q*p*p+1320*p*p*p,y=530*q*q*q+3*650*q*q*p+3*760*q*p*p+1290*p*p*p;
  drawTownPhysicalLeafV31(b,{x:right?W-x:x,y:y+(right?130:0),size:45+165*Math.pow(Math.sin(Math.PI*u),1.4),spin:(right?-.3:.25)+u*.9,pitch:-.45+u*3.8,yaw:.45*Math.sin(u*Math.PI),fold:.2,alpha:Math.min(1,u*10,(1-u)*10),morph:1,height:null,base:[216,96,36]});}
}
function openLeaves(b,t,loopOnly){
 if(t>6.4)return;
 for(const l of OPEN_LEAVES){if(loopOnly&&!l.loop)continue;const s=openLeafState(l,t);if(!s||s.x<-80||s.x>W+80||s.y<-80||s.y>H+60)continue;
  if(l.land!==null&&t<3.2&&l.born>2.15&&false)continue;
  b.save();b.shadowColor='transparent';b.shadowBlur=0;flyingLeaf(b,s.x,s.y,l.size,s.rest?l.ph:s.spin,l.color,Math.min(1,(t-l.born)*4));b.restore();}   // v37：带一点影子，在红叶的地图上也看得清
}
// 桥上相拥的情侣：点灯以后冒出几颗小爱心
function heart(b,x,y,s,col){b.save();b.translate(x,y);b.scale(s/20,s/20);b.beginPath();b.moveTo(0,6);b.bezierCurveTo(-14,-4,-10,-16,0,-8);b.bezierCurveTo(10,-16,14,-4,0,6);b.closePath();b.lineWidth=3;b.strokeStyle=SFX_INK;b.stroke();b.fillStyle=col;b.fill();b.restore();}
function coupleHearts(b,t){
 if(t<18.7||t>20.6)return;const src=sourceTime(t),c=cameraState(src,'reveal'),bx=540+(588-c.x)*c.z,by=960+(930-c.y)*c.z;
 for(let k=0;k<3;k++){const t0=18.75+k*.42,u=(t-t0)/1.1;if(u<0||u>1)continue;const al=u<.75?1:1-(u-.75)/.25;b.save();b.globalAlpha=al;
  heart(b,bx+(k-1)*22+Math.sin(u*6+k)*10,by-u*120,lerp(14,24,easeOut(u))*(k===1?1.25:1),k===1?'#ff6f8f':'#ffd84a');b.restore();}
}
function mangaOverlay(b,t){
 openLeaves(b,t);for(const w of WINDS)drawWindLines(b,w,t);
}
function render(t){
 t=Math.round(fract(t/duration())*duration()*1e9)/1e9;if(t>=duration())t=0;g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.fillStyle=ink;g.fillRect(0,0,W,H);

 const tr=transitions.find(([at,,,dur])=>Math.abs(t-at)<dur/2);
 if(tr){const [at,before,after,dur]=tr;let u=ease(clamp((t-at+dur/2)/dur));paintShot(screenA,before,t);paintShot(screenB,after,t);g.drawImage(screenA,0,0);g.globalAlpha=u;g.drawImage(screenB,0,0);g.globalAlpha=1;}
 else{paintShot(screenA,shotAt(t),t);g.drawImage(screenA,0,0);}
 mangaOverlay(g,t);drawSfx(g,t);drawWindSceneMoment(g,t);if(t>=V28_DURATION-.9)openLeaves(g,t-V28_DURATION,true);
 // Fine vignette, no black subtitle band.
 const v=g.createRadialGradient(540,900,430,540,900,1250);v.addColorStop(0,'rgba(2,7,16,0)');v.addColorStop(1,'rgba(2,7,16,.37)');g.fillStyle=v;g.fillRect(0,0,W,H);
 if(variant==='V6')titlesV6(t);else titlesC(t);
}
// Accessible playback controls also make precise, manual review possible.
let playing=!params.has('record'),playTime=Number(params.get('t')||0),lastTime=0;
window.render=render;
setTimeout(()=>{unlit('valleySet',valleySet);unlit('leafNear',leafNear);if(!reflV)bakeRefl();unlit('reflV',reflV);},0);   // v12：预先做好「没亮灯」的画面，免得亮灯那一刻卡一下window.LOOP_SECONDS=T;
const play=document.getElementById('play'),seek=document.getElementById('seek'),clock=document.getElementById('clock');
function status(){play.textContent=playing?'暂停':playTime>=duration()-.011?'重播':'播放';play.setAttribute('aria-label',playing?'暂停动画':'播放动画');const d=duration();seek.max=(d-.01).toFixed(2);seek.value=(playTime%d).toFixed(2);clock.textContent=(playTime%d).toFixed(1)+' / '+d+' 秒';window.LOOP_SECONDS=d;document.getElementById('duration-note').textContent='弥彦 · 画面方案　/　'+d+' 秒';}
function update(t){playTime=clamp(Number(t),0,duration()-.01);render(playTime);status();}
play.onclick=()=>{if(!playing&&playTime>=duration()-.011)playTime=0;playing=!playing;lastTime=0;status();};
seek.oninput=()=>{playing=false;update(Number(seek.value));};
document.querySelectorAll('[data-time]').forEach(el=>el.onclick=()=>{playing=false;update(Number(variant==='V6'?el.dataset.legacy:el.dataset.time));});
document.getElementById('restart').onclick=()=>{update(0);playing=true;lastTime=0;status();};
cv.onclick=()=>play.click();
const openingNotes={A:'A：从导览图进入夜里的观月桥。',C:'C：红叶前景与远海的开场，作对照。'};
function syncOpeningControls(){
 document.querySelectorAll('[data-opening]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.opening===openingVariant)));
 document.getElementById('opening-note').textContent=openingNotes[openingVariant];
}
document.querySelectorAll('[data-opening]').forEach(el=>el.onclick=()=>{
 openingVariant=el.dataset.opening;syncOpeningControls();lastTime=0;update(0);
 // Preserve paused/playing state so both first frames can be compared.
});
syncOpeningControls();
document.getElementById('watch-end').onclick=()=>{update(variant==='V6'?8:13.0);playing=true;lastTime=0;status();};
const descriptions={A:'从山顶步道向前轻推，近处枝叶让开，海面在层层山脊后展开。',B:'沿山顶缓缓横移，近坡与远海产生视差，夕光落在海上。',V6:'原 v6 的 Skyline 跟车结尾，保留作对照。'};
document.querySelectorAll('[data-option]').forEach(el=>el.onclick=()=>{const previousDuration=duration();variant=el.dataset.option;playTime=playTime/previousDuration*duration();document.querySelectorAll('[data-time]').forEach(ch=>{ch.hidden=variant==='V6'&&ch.dataset.chapter==='gate';ch.querySelector('small').textContent=(variant==='V6'?ch.dataset.legacy:ch.dataset.time)+' 秒';});document.querySelectorAll('[data-option]').forEach(b=>b.setAttribute('aria-pressed',String(b===el)));document.getElementById('option-note').textContent=descriptions[variant];update(playTime);});

document.addEventListener('keydown',e=>{if(e.code==='Space'&&e.target.tagName!=='INPUT'&&e.target.tagName!=='BUTTON'){e.preventDefault();play.click();}});
document.addEventListener('visibilitychange',()=>{lastTime=0;});
if(matchMedia('(prefers-reduced-motion: reduce)').matches&&!params.has('record'))playing=false;
loadFonts().catch(()=>{}).then(()=>{paintToriiPlaque();update(playTime);window.READY=true;document.getElementById('load-state').hidden=true;function tick(now){if(playing&&!document.hidden){if(lastTime){playTime=Math.min(duration()-.01,playTime+(now-lastTime)/1000);if(playTime>=duration()-.01)playing=false;}render(playTime);status();}lastTime=now;requestAnimationFrame(tick);}requestAnimationFrame(tick);});
