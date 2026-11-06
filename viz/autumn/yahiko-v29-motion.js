// All time values here are local to the final 7.2-second town shot.
// One wind field drives branches, window hinges, steam and the standing person's gesture.
function townWind(a){
 const gust=(start,length,amount)=>{const u=(a-start)/length;return u>0&&u<1?amount*Math.pow(Math.sin(Math.PI*u),2):0;};
 return gust(.65,3.15,.92)+gust(4.7,2.5,.65)+.055*Math.sin(a*2.1)*Math.min(1,Math.max(0,a));
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
function townWindowState(a){
 const wind=townWind(a-.12),flutter=.035*Math.sin(a*6)*Math.max(0,wind);
 return {opening:1.02+.32*wind+flutter,right:1.16-.26*wind+flutter*.7,wind};
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
  // Draw wood only at the edges: a solid wood under-fill would make the glass look like a board.
  poly(b,pane,'rgba(126,155,158,.17)','#3e3429',3);
  townPanel(b,pane,0,0,.08,1,'#826547');townPanel(b,pane,.92,0,.08,1,'#826547');
  townPanel(b,pane,0,0,1,.055,'#826547');townPanel(b,pane,0,.945,1,.055,'#826547');
  townPanel(b,pane,.16,.13,.13,.72,'rgba(210,220,214,.16)');
  townLine(b,pane,.5,.05,.5,.95,'#67513a',2.2);townLine(b,pane,.07,.51,.93,.51,'#67513a',2.5);
  townLine(b,pane,.04,.96,.96,.96,'#baa37a',1.5);
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
 poly(b,[[-5,-3],[-5,-12],[0,-6],[5,-11],[7,-2]],ink);
 b.fillStyle='#b4b89b';b.beginPath();b.arc(4-7*s.look,-1,.85,0,TAU);b.fill();b.restore();
 b.strokeStyle=ink;b.lineWidth=3.8;b.beginPath();b.moveTo(-17,-18+bob);b.bezierCurveTo(-27,-19,-28,-35-Math.sin(a*3.4)*5,-39,-28-Math.sin(a*2.4)*6);b.stroke();
 b.strokeStyle='rgba(158,174,182,.28)';b.lineWidth=1;b.beginPath();b.ellipse(-1,-17+bob,18,6,0,Math.PI,TAU);b.stroke();b.restore();
}
