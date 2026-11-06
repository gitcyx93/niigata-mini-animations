// Individual roof tiles and one persistent maple-leaf object. No image assets or cloned leaf trails.
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
  poly(b,p,'#14232d');
  p[0][1]-=state.lift;p[1][1]-=state.lift;
  const light=.79+rnd(row*31+col,30801)*.15+state.lift*.035;
  const color=[57,73,82].map(c=>Math.round(c*light));poly(b,p,`rgb(${color.join(',')})`);
  const mid=[(p[0][0]+p[1][0])/2,(p[0][1]+p[1][1])/2],back=[(p[2][0]+p[3][0])/2,(p[2][1]+p[3][1])/2];
  b.strokeStyle='rgba(128,149,157,.27)';b.lineWidth=1;b.beginPath();b.moveTo(...mid);b.lineTo(...back);b.stroke();
  b.strokeStyle='rgba(9,21,30,.58)';b.lineWidth=1.3;b.beginPath();b.moveTo(...p[0]);b.lineTo(...p[3]);b.stroke();
  b.strokeStyle=`rgba(151,164,160,${.19+state.lift*.026})`;b.lineWidth=1;b.beginPath();b.moveTo(...p[0]);b.quadraticCurveTo(mid[0],mid[1]+1.8,...p[1]);b.stroke();
 }
 b.restore();b.strokeStyle='#71818a';b.lineWidth=1.8;b.beginPath();b.moveTo(616,710);b.lineTo(988,668);b.stroke();
 b.strokeStyle='#101f2b';b.lineWidth=6;b.beginPath();b.moveTo(488,880);b.lineTo(1040,802);b.stroke();
}
const heroFlightsV30=[
 [2.5,3.2,3.95,[-90,640],[520,860],[1170,1010]],
 [5.75,6.4,7.1,[-90,1150],[540,990],[1170,780]],
 [9.15,9.8,10.5,[-90,640],[560,800],[1170,700]],
 [12.35,13,13.7,[-90,980],[540,800],[1170,860]],
 [16.35,17,17.7,[-90,640],[520,900],[1170,1220]],
];
function heroBezierV30(A,B,C,u){const q=1-u;return [q*q*A[0]+2*q*u*B[0]+u*u*C[0],q*q*A[1]+2*q*u*B[1]+u*u*C[1]];}
function heroGroundV30(t){
 const a=Math.max(0,t-TOWN0),p=townPose(a),z=1+(p.z-1)*.82;
 return {x:840+z*(590-840+p.x*.82),y:1350+z*(1740-1350+p.y*.82)+H*.9*(1-easeOut(clamp((a-.1)/.9))),world:[590,1740]};
}
function heroLeafStateV30(t){
 for(const [t0,cut,t1,A,C,B] of heroFlightsV30){
  if(t<t0||t>t1)continue;
  const stop=cut-.075,resume=cut+.055;
  const u=t<stop?.5*ease(clamp((t-t0)/(stop-t0))):t<=resume?.5:.5+.5*ease(clamp((t-resume)/(t1-resume)));
  const control=[2*C[0]-.5*(A[0]+B[0]),2*C[1]-.5*(A[1]+B[1])],[x,y]=heroBezierV30(A,control,B,u);
  return {visible:true,phase:t>=stop&&t<=resume?'cut-hold':'flight',x,y,size:60,spin:.3+u*2.8,pitch:.3+Math.sin(u*TAU)*.8,yaw:Math.sin(u*TAU+.5)*1.05,fold:.22+.1*Math.sin(u*Math.PI),height:null};
 }
 if(t<19.9)return {visible:false,phase:'hidden'};
 const ground=heroGroundV30(t),landing=21.5,lift=duration()-1;
 if(t<20.2){const u=easeOut((t-19.9)/.3);return {visible:true,phase:'approach',x:lerp(-90,525,u),y:lerp(800,1110,u),size:lerp(60,70,u),spin:lerp(-1,.9,u),pitch:lerp(-.5,.45,u),yaw:lerp(.8,-.1,u),fold:.23,height:null};}
 if(t<TOWN0)return {visible:true,phase:'cut-hold',x:525,y:1110,size:70,spin:.9,pitch:.45,yaw:-.1,fold:.23,height:null};
 if(t<landing){const u=clamp((t-TOWN0)/(landing-TOWN0));return {visible:true,phase:'drop',x:lerp(525,ground.x,ease(u)),y:lerp(1110,ground.y,u*u),size:lerp(70,36,ease(u)),spin:lerp(.9,.35,u),pitch:lerp(.45,1.14,u*u*u),yaw:lerp(-.1,.08,u),fold:lerp(.23,.18,u),height:(1-u*u)*630,ground};}
 if(t<lift){const age=t-landing;return {visible:true,phase:age<.22?'contact':'rest',x:ground.x,y:ground.y,size:36,spin:.35,pitch:1.14+.045*Math.exp(-age*18)*Math.sin(age*32),yaw:.08,fold:.18+.10*Math.exp(-age*18)*Math.sin(age*32),height:0,ground};}
 const u=clamp((t-lift)/(duration()-lift)),q=Math.pow(clamp((u-.12)/.88),1.35),[x,y]=heroBezierV30([ground.x,ground.y],[1060,1550],[1280,230],q);
 return {visible:x<1200,phase:'lift-off',x,y,size:lerp(36,54,q),spin:.35+q*4.2,pitch:lerp(1.14,-.55,clamp(u*2.2)),yaw:.08+Math.sin(q*5)*1.15,fold:.18+.27*Math.sin(Math.PI*u),height:q*1000,ground};
}
function heroVertexV30(x,y,s){
 const size=s.size,z=(Math.abs(x)*s.fold+.035*Math.sin(y*4))*size;
 let X=x*size,Y=y*size,Z=z;
 const cp=Math.cos(s.pitch),sp=Math.sin(s.pitch),cy=Math.cos(s.yaw),sy=Math.sin(s.yaw);
 [Y,Z]=[Y*cp-Z*sp,Y*sp+Z*cp];[X,Z]=[X*cy+Z*sy,-X*sy+Z*cy];
 const c=Math.cos(s.spin),n=Math.sin(s.spin);[X,Y]=[X*c-Y*n,X*n+Y*c];
 const perspective=1/(1+Z/440);return {x:X*perspective,y:Y*perspective,z:Z,X,Y};
}
function drawHeroLeafV30(b,t){
 if(window.HERO_LEAF_DISABLED||variant==='V6')return;const s=heroLeafStateV30(t);if(!s.visible)return;
 if(s.ground&&s.height<360){
  b.save();b.translate(s.ground.x,s.ground.y+5);b.rotate(.12);b.scale(1,.24);
  const radius=35+s.height*.12,q=b.createRadialGradient(0,0,2,0,0,radius);q.addColorStop(0,`rgba(3,8,10,${.34*Math.exp(-s.height/100)})`);q.addColorStop(1,'rgba(3,8,10,0)');b.fillStyle=q;b.beginPath();b.arc(0,0,radius,0,TAU);b.fill();b.restore();
 }
 const points=leafOutline.map(([x,y])=>heroVertexV30(x,y,s)),center=heroVertexV30(0,.12,s);
 const day=t<17,base=day?[213,77,29]:t<TOWN0?[195,100,45]:[191,88,38];
 b.save();b.translate(s.x,s.y);
 const contour=(dx=0,dy=0)=>{b.beginPath();points.forEach((p,i)=>b[i?'lineTo':'moveTo'](p.x+dx,p.y+dy));b.closePath();};
 // Thin dark edge under the folded blade gives thickness without a bright sticker outline.
 contour(.5,1.5);b.fillStyle='#54291d';b.fill();
 for(let i=0;i<points.length;i++){
  const p=points[i],q=points[(i+1)%points.length],ax=p.X-center.X,ay=p.Y-center.Y,az=p.z-center.z,bx=q.X-center.X,by=q.Y-center.Y,bz=q.z-center.z;
  let nx=ay*bz-az*by,ny=az*bx-ax*bz,nz=ax*by-ay*bx;const length=Math.hypot(nx,ny,nz)||1;nx/=length;ny/=length;nz/=length;
  const back=nz<0,light=clamp(.65+Math.abs(-.24*nx-.35*ny+.84*nz)*.36,.55,1.08),rgb=(back?[133,69,35]:base).map(c=>Math.round(c*light));
  poly(b,[[center.x,center.y],[p.x,p.y],[q.x,q.y]],`rgb(${rgb.join(',')})`);
 }
 contour();b.strokeStyle='rgba(92,39,20,.72)';b.lineWidth=1.1;b.stroke();
 const origin=heroVertexV30(0,.38,s);b.strokeStyle='rgba(242,181,108,.43)';b.lineWidth=Math.max(.7,s.size*.021);b.beginPath();
 for(const [x,y] of [[0,-1],[.48,-.78],[.84,-.43],[.9,.16],[-.48,-.78],[-.84,-.43],[-.9,.16]]){const p=heroVertexV30(x*.86,y*.86,s);b.moveTo(origin.x,origin.y);b.lineTo(p.x,p.y);}b.stroke();
 const a=heroVertexV30(0,.62,s),c=heroVertexV30(.02,.93,s),end=heroVertexV30(.19,1.18,s);b.strokeStyle='#6b3d23';b.lineWidth=Math.max(1.2,s.size*.034);b.lineCap='round';b.beginPath();b.moveTo(a.x,a.y);b.quadraticCurveTo(c.x,c.y,end.x,end.y);b.stroke();b.restore();
}
