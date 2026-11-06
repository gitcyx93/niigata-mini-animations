// Roof articulation retained; the only physical leaves are seven members of the original bridge gust.
function townRoofBaseV30(b,e0,e1,r0,r1){
 const q=b.createLinearGradient(0,Math.min(r0[1],r1[1]),0,Math.max(e0[1],e1[1]));q.addColorStop(0,'#354650');q.addColorStop(1,'#192a36');poly(b,[e0,e1,r1,r0],q);
 b.strokeStyle='#101f2b';b.lineWidth=8;b.beginPath();b.moveTo(...e0);b.lineTo(...e1);b.stroke();
}
const townRoofPlaneV30=[[488,880],[1040,802],[988,668],[616,710]];
function townTileStateV30(a,row,col){
 const v=(row+.5)/8,u=(col+.5+(row%2)*.5)/18,center=townUV(townRoofPlaneV30,u,v),wind=townWind(a-col*.012-row*.025);
 const exposure=Math.pow(1-row/8,3),distance=Math.hypot(center[0]-855,center[1]-809),age=a-3.65;
 const landing=age>=0&&age<.8?Math.sin(age*13)*Math.exp(-age*6)*Math.max(0,1-distance/70):0;
 return {lift:clamp(wind*(.35+3.1*exposure)+landing*.95,-.5,4.2),wind,center,landing};
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
function drawTownLeafCarryV31(b,t){
 if(t<TOWN0)return;const a=t-TOWN0,leaves=townCarryLeavesV31(),selected=new Set(leaves.map(d=>d.particle));
 // The unselected original gust clears quickly. Selected leaves keep their original identity and positions.
 if(a<.22)windLeaves(b,5+a,l=>!selected.has(l),1-a/.22);
 for(const d of leaves){const s=townCarryStateV31(d,t);if(!s.visible)continue;
  if(s.morph<1)flyingLeaf(b,s.x,s.y,s.size,s.spin,s.color,s.alpha*(1-s.morph));
  if(s.morph>0)drawTownPhysicalLeafV31(b,s);
 }
}
