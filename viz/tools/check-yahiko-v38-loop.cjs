const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'../autumn/yahiko-v38.html'),'utf8');
for(const [,js]of html.matchAll(/<script(?![^>]*type=)[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(js);
const code=html.slice(html.indexOf('function windMomentTime(t){'),html.indexOf('function openLeaves(b,t,loopOnly){'));
const states=[],noop=()=>{},b=new Proxy({},{get:()=>noop,set:()=>true});
const ctx={W:1080,TAU:Math.PI*2,clamp:(v,a=0,z=1)=>Math.max(a,Math.min(z,v)),reds:Array(7).fill('#c65a2c'),maple:noop,flyingLeaf:noop,drawTownPhysicalLeafV31:(_,s)=>states.push(s)};
vm.createContext(ctx);vm.runInContext(code,ctx);ctx.drawWindSceneMoment(b,27.8-1e-7);ctx.drawWindSceneMoment(b,0);assert.equal(states.length,2);
for(const key of ['x','y','size','spin','pitch','yaw','fold','alpha'])assert(Math.abs(states[0][key]-states[1][key])<.001,`Loop continuity: ${key}`);
const pile=html.slice(html.indexOf('const TITLE_PILE='),html.indexOf('function windMomentTime(t){'));
ctx.ease=u=>u*u*(3-2*u);ctx.windField=()=>[0,0];vm.runInContext(pile,ctx);
for(let i=0;i<11;i++){const a=ctx.titleLeafState(27.8-1e-7,i),b=ctx.titleLeafState(0,i);for(const key of ['x','y','spin','alpha'])assert(Math.abs(a[key]-b[key])<.001,`Title pile loop: ${i}/${key}`);assert.equal(b.alpha,1);}
const middle=ctx.titleLeafState(2,0),waiting=ctx.titleLeafState(2,10);assert(middle.y>330&&waiting.y<320,'Leaves release at staggered times');assert.equal(ctx.titleLeafState(2.4,0).y,middle.y,'Leaf rests in the middle of the lettering');
const wav=fs.readFileSync(path.join(__dirname,'../autumn/audio/yahiko-v38/master.wav'));assert.equal(wav.toString('ascii',0,4),'RIFF');assert.equal((wav.length-44)/wav.readUInt32LE(28),27.8);
assert(html.includes('audio.loop = true'));assert(html.includes('playing = false'));
console.log('PASS: script syntax; hero leaf position, rotation, fold and alpha across loop; 27.8s soundtrack.');
