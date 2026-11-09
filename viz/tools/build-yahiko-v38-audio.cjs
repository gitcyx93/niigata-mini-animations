// Reuses committed V25 stems; PLAYWRIGHT_MODULE points to an existing install.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),vm=require('node:vm'),{execFileSync}=require('node:child_process');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'../..'),sourceDir=path.join(root,'viz/autumn/audio/yahiko-v38');
const experiment=process.env.YAHIKO_SEA_EXPERIMENT?JSON.parse(fs.readFileSync(process.env.YAHIKO_SEA_EXPERIMENT,'utf8')):null;
let out=sourceDir;
if(experiment){
 assert.equal(experiment.start,12.8);assert.equal(experiment.end,17.1);
 assert(Number.isFinite(experiment.sourceOffset)&&experiment.sourceOffset>=0);
 assert(Number.isFinite(experiment.gain)&&experiment.gain>0&&experiment.gain<=100);
 for(const key of ['fadeIn','fadeOut'])if(experiment[key]!==undefined)assert(Number.isFinite(experiment[key])&&experiment[key]>=0&&experiment[key]<=4.3);
 assert(path.isAbsolute(experiment.source)&&fs.statSync(experiment.source).isFile());
 assert(path.isAbsolute(experiment.output));out=path.resolve(experiment.output);
 assert(out!==sourceDir&&!out.startsWith(sourceDir+path.sep),'Experiment output must be separate');
 assert(!fs.existsSync(out),'Experiment output already exists');
}
const visual=fs.readFileSync(path.join(root,'viz/autumn/yahiko-v38.html'),'utf8');
const model=visual.slice(visual.indexOf('function townWind(a){'),visual.indexOf('const townTreeSpecs='))+visual.slice(visual.indexOf('const townWindowSpringV30='),visual.indexOf('function townOpenWindows('));
const windowMotion=vm.runInNewContext(model+';Array.from({length:1729},(_,i)=>{const s=townWindowState(i/240);return Math.min(1,(Math.abs(s.lv)+Math.abs(s.rv))*.6)})',{clamp:(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),lerp:(a,b,u)=>a+(b-a)*u});
const get=p=>execFileSync('git',['show','HEAD:'+p],{cwd:root,maxBuffer:30*1024*1024});
const old=get('viz/autumn/yahiko-v25-sound.html').toString(),m=old.match(/id="yahiko-audio-data"[^>]*>\s*data:audio\/[^;]+;base64,([^<]+)/);assert(m);
const inputs={base:get('output/autumn/yahiko-v25-sound-review/02-B-water.m4a'),quiet:Buffer.from(m[1].trim(),'base64'),leaves:get('reference/yahiko-v25/sound-candidates-v1/edited-v1/02-leaves-soft.wav'),water:get('output/autumn/yahiko-v25-sound-review/stems/water.m4a'),ropeway:get('output/autumn/yahiko-v25-sound-review/stems/ropeway.m4a'),cat:fs.readFileSync(path.join(sourceDir,'cat-source.mp3')),windchime:fs.readFileSync(path.join(sourceDir,'windchimes-source.ogg')),window:fs.readFileSync(path.join(sourceDir,'window-source.mp3')),sea:fs.readFileSync(experiment?experiment.source:path.join(sourceDir,'sea-source.ogg')),bird1:get('viz/autumn/audio/yahiko-v18/stems/bird-01.flac'),bird2:get('viz/autumn/audio/yahiko-v18/stems/bird-02.flac')};
(async()=>{const server=http.createServer((q,s)=>{const key=q.url.slice(1);if(!key){s.setHeader('Content-Type','text/html');return s.end('<!doctype html><title>Audio mixer</title>')}if(!inputs[key]){s.writeHead(404);return s.end()}s.end(inputs[key])}).listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));let browser;
try{browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage();await page.goto(`http://127.0.0.1:${server.address().port}/`);
const result=await page.evaluate(async({windowMotion,experiment})=>{
 const sr=32000,duration=27.8,N=Math.round(sr*duration),context=new OfflineAudioContext(2,N,sr),buffers={};
 await Promise.all(['base','quiet','leaves','water','ropeway','cat','windchime','window','sea','bird1','bird2'].map(async k=>{buffers[k]=await context.decodeAudioData(await(await fetch('/'+k)).arrayBuffer())}));
 async function filter(key,hp,lp){const b=buffers[key],c=new OfflineAudioContext(2,b.length,sr),s=c.createBufferSource(),h=c.createBiquadFilter(),l=c.createBiquadFilter();s.buffer=b;h.type='highpass';h.frequency.value=hp;l.type='lowpass';l.frequency.value=lp;s.connect(h).connect(l).connect(c.destination);s.start();buffers[key]=await c.startRendering();}
 await Promise.all([filter('window',160,1900),filter('windchime',350,6200),filter('sea',100,3200)]);
 const channels=[new Float32Array(N),new Float32Array(N)],layers={};
 function add(key,start,offset,length,gain,fadeIn=.05,fadeOut=.15,wrap=false,pan=0,group=key){if(['base','windchime','forest','sea'].includes(group)&&!layers[group])layers[group]=[new Float32Array(N),new Float32Array(N)];const b=buffers[key],n=Math.min(Math.round(length*sr),b.length-Math.round(offset*sr));for(let i=0;i<n;i++){let target=Math.round(start*sr)+i;if(wrap)target=((target%N)+N)%N;if(target<0||target>=N)continue;let env=Math.min(1,i/Math.max(1,fadeIn*sr),(n-1-i)/Math.max(1,fadeOut*sr));const time=target/sr;
 // Replace only the summit's old open-field wind; other approved base audio is untouched.
 if(key==='base')env*=1-Math.min(1,Math.max(0,(time-12.8)/.5),Math.max(0,(17.1-time)/.65));
 if(key==='window')env*=windowMotion[Math.max(0,Math.min(windowMotion.length-1,Math.round((time-20.6)*240)))];
 for(let c=0;c<2;c++){const value=b.getChannelData(Math.min(c,b.numberOfChannels-1))[Math.round(offset*sr)+i]*gain*env*Math.sqrt(1+(c?pan:-pan));channels[c][target]+=value;if(layers[group])layers[group][c][target]+=value;}}}
 add('base',0,0,24.6,1,.025,.2);
 // The 4s bed stays restored; only the 12.8–17.1s summit bed is replaced.
 if(experiment&&buffers.sea.duration<experiment.sourceOffset+4.3)throw Error('Sea candidate too short');
 const seaOffset=experiment?experiment.sourceOffset:Math.min(12,Math.max(0,buffers.sea.duration-4.3));let seaSquares=0,seaPeak=0;const seaSamples=Math.round(4.3*sr),seaData=buffers.sea.getChannelData(0);for(let i=0;i<seaSamples;i++){const x=seaData[Math.round(seaOffset*sr)+i]||0;seaSquares+=x*x;seaPeak=Math.max(seaPeak,Math.abs(x));}
 const seaGain=experiment?experiment.gain:Math.min(.0065/Math.max(1e-8,Math.sqrt(seaSquares/seaSamples)),.025/Math.max(1e-8,seaPeak));add('sea',12.8,seaOffset,4.3,seaGain,experiment?.fadeIn??.5,experiment?.fadeOut??.65);
 add('quiet',24.4,20.8,3.4,2,.2,.12);
 add('water',24.2,.2,3.6,.85,.4,.2);
 add('ropeway',9.8,0,3.2,.65,.4,.6);
 let leavesPeak=0;for(const c of [0,1])for(const x of buffers.leaves.getChannelData(Math.min(c,buffers.leaves.numberOfChannels-1)))leavesPeak=Math.max(leavesPeak,Math.abs(x));
 const leafGain=Math.min(4,.045/Math.max(.00001,leavesPeak));
 // One uninterrupted wind-chime recording: no repeated strike or assembled bell loop.
 const chimeLength=Math.min(6.5,buffers.windchime.duration);let chimePeak=0;for(const x of buffers.windchime.getChannelData(0))chimePeak=Math.max(chimePeak,Math.abs(x));
 add('windchime',3.3,0,chimeLength,Math.min(1,.055/Math.max(.00001,chimePeak)),.25,.6,false,-.12);
 for(const at of [3.2,5.55,7.9])add('leaves',at,0,Math.min(3.2,9.9-at),leafGain*.23,.6,.65,false,.08,'forest');
 const wood=buffers.window.getChannelData(0);let woodPeak=0;for(const x of wood)woodPeak=Math.max(woodPeak,Math.abs(x));const woodGain=Math.min(1,.035/Math.max(.00001,woodPeak));
 for(const at of [20.6,22.7,24.8,26.9])add('window',at,.1,Math.min(2.5,27.8-at,buffers.window.duration-.1),woodGain,.2,.25,false,.25);
 add('leaves',17.45,0,3.05,leafGain,.4,.65,false,-.18);
 add('leaves',25.8,0,3.3,leafGain*.9,.35,.7,true,.18);
 const cat=buffers.cat.getChannelData(0);let peak=0;for(const x of cat)peak=Math.max(peak,Math.abs(x));let onset=0;while(onset<cat.length&&Math.abs(cat[onset])<peak*.06)onset++;const offset=Math.max(0,onset/sr-.025),catLength=Math.min(1.25,buffers.cat.duration-offset);
 // Continue the approved distant-bird phrases into the town; leave the cat cue clear.
 for(const [key,at,gain]of [['bird1',21.6,1.3],['bird2',22.7,1.3],['bird1',25.1,1.1],['bird2',26.25,1.1]])add(key,at,0,buffers[key].duration,gain,.01,.15,false,-.18);
 add('cat',23.45,offset,catLength,Math.min(1,.14/Math.max(peak,.0001)),.015,.12,false,.22);
 const peakOf=cs=>{let p=0;for(const c of cs)for(const x of c)p=Math.max(p,Math.abs(x));return p;};
 const rms=cs=>{let sum=0;for(const c of cs)for(const x of c)sum+=x*x;return Math.sqrt(sum/(cs[0].length*cs.length));};
 const mixed=channels,effectRms=rms(channels),max=peakOf(channels);if(!Number.isFinite(max)||max>=.95)throw Error('Unexpected mix headroom');
 function encode(cs,start=0,length=duration){const begin=Math.round(start*sr),n=Math.min(Math.round(length*sr),cs[0].length-begin),wav=new ArrayBuffer(44+n*4),v=new DataView(wav),str=(p,s)=>{for(let i=0;i<s.length;i++)v.setUint8(p+i,s.charCodeAt(i))};str(0,'RIFF');v.setUint32(4,wav.byteLength-8,true);str(8,'WAVE');str(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,2,true);v.setUint32(24,sr,true);v.setUint32(28,sr*4,true);v.setUint16(32,4,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,n*4,true);for(let i=0;i<n;i++)for(let c=0;c<2;c++)v.setInt16(44+i*4+c*2,Math.round(cs[c][begin+i]*32767),true);const bytes=new Uint8Array(wav);let text='';for(let i=0;i<bytes.length;i+=32768)text+=String.fromCharCode(...bytes.subarray(i,i+32768));return btoa(text);}
 return {files:{'master.wav':encode(mixed),'effects.wav':encode(channels),'audition-base-3-6.wav':encode(layers.base,3,3),'audition-shrine-chime.wav':encode(layers.windchime,3.2,6.6),'audition-shrine-wind.wav':encode(layers.forest,3.2,6.7),'audition-sea.wav':encode(layers.sea,12.8,4.3)},duration,sampleRate:sr,peak:max,effectsRmsDb:20*Math.log10(effectRms),music:false,townBirds:[21.6,22.7,25.1,26.25],birdSpecies:'unconfirmed; reused original distant-bird stems',catAt:23.45,catSourceOffset:offset,catLength,leafGain,wrapWind:true,noiseDip:null,shrineChimes:[3.3,3.3+chimeLength],chimeSourceDuration:buffers.windchime.duration,forestWind:[3.2,9.9],windowMotionDriven:true,sea:{start:12.8,end:17.1,sourceOffset:seaOffset,gain:seaGain,highpassHz:100,lowpassHz:3200,replaces:'old open-field wind in B mix'}};
},{windowMotion,experiment});fs.mkdirSync(out,{recursive:true});for(const [name,data]of Object.entries(result.files)){const wav=Buffer.from(data,'base64');assert.equal(wav.toString('ascii',0,4),'RIFF');if(['master.wav','effects.wav','music.wav'].includes(name))assert.equal(wav.length,44+Math.round(27.8*32000)*4);fs.writeFileSync(path.join(out,name),wav);}delete result.files;if(experiment)result.experiment=experiment;assert(result.peak<1);fs.writeFileSync(path.join(out,'mix.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));

}finally{if(browser)await browser.close();server.close()}})().catch(e=>{console.error(e);process.exitCode=1});

