// Reuses committed V25 stems; PLAYWRIGHT_MODULE points to an existing install.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),vm=require('node:vm'),{execFileSync}=require('node:child_process');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'../..'),out=path.join(root,'viz/autumn/audio/yahiko-v38');
const visual=fs.readFileSync(path.join(root,'viz/autumn/yahiko-v38.html'),'utf8');
const model=visual.slice(visual.indexOf('function townWind(a){'),visual.indexOf('const townTreeSpecs='))+visual.slice(visual.indexOf('const townWindowSpringV30='),visual.indexOf('function townOpenWindows('));
const windowMotion=vm.runInNewContext(model+';Array.from({length:1729},(_,i)=>{const s=townWindowState(i/240);return Math.min(1,(Math.abs(s.lv)+Math.abs(s.rv))*.6)})',{clamp:(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),lerp:(a,b,u)=>a+(b-a)*u});
const get=p=>execFileSync('git',['show','HEAD:'+p],{cwd:root,maxBuffer:30*1024*1024});
const old=get('viz/autumn/yahiko-v25-sound.html').toString(),m=old.match(/id="yahiko-audio-data"[^>]*>\s*data:audio\/[^;]+;base64,([^<]+)/);assert(m);
const inputs={base:get('output/autumn/yahiko-v25-sound-review/02-B-water.m4a'),quiet:Buffer.from(m[1].trim(),'base64'),leaves:get('reference/yahiko-v25/sound-candidates-v1/edited-v1/02-leaves-soft.wav'),water:get('output/autumn/yahiko-v25-sound-review/stems/water.m4a'),ropeway:get('output/autumn/yahiko-v25-sound-review/stems/ropeway.m4a'),cat:fs.readFileSync(path.join(out,'cat-source.mp3')),chime:get('output/autumn/yahiko-v25-sound-review/stems/chime.m4a'),window:fs.readFileSync(path.join(out,'window-source.mp3'))};
(async()=>{const server=http.createServer((q,s)=>{const key=q.url.slice(1);if(!key){s.setHeader('Content-Type','text/html');return s.end('<!doctype html><title>Audio mixer</title>')}if(!inputs[key]){s.writeHead(404);return s.end()}s.end(inputs[key])}).listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));let browser;
try{browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage();await page.goto(`http://127.0.0.1:${server.address().port}/`);
const result=await page.evaluate(async(windowMotion)=>{
 const sr=32000,duration=27.8,N=Math.round(sr*duration),context=new OfflineAudioContext(2,N,sr),buffers={};
 await Promise.all(['base','quiet','leaves','water','ropeway','cat','chime','window'].map(async k=>{buffers[k]=await context.decodeAudioData(await(await fetch('/'+k)).arrayBuffer())}));
 async function filter(key,hp,lp){const b=buffers[key],c=new OfflineAudioContext(2,b.length,sr),s=c.createBufferSource(),h=c.createBiquadFilter(),l=c.createBiquadFilter();s.buffer=b;h.type='highpass';h.frequency.value=hp;l.type='lowpass';l.frequency.value=lp;s.connect(h).connect(l).connect(c.destination);s.start();buffers[key]=await c.startRendering();}
 await Promise.all([filter('window',160,1900),filter('chime',500,5400)]);
 const channels=[new Float32Array(N),new Float32Array(N)];
 function add(key,start,offset,length,gain,fadeIn=.05,fadeOut=.15,wrap=false,pan=0){const b=buffers[key],n=Math.min(Math.round(length*sr),b.length-Math.round(offset*sr));for(let i=0;i<n;i++){let target=Math.round(start*sr)+i;if(wrap)target=((target%N)+N)%N;if(target<0||target>=N)continue;let env=Math.min(1,i/Math.max(1,fadeIn*sr),(n-1-i)/Math.max(1,fadeOut*sr));const time=target/sr;
 if(key==='base'){const dip=Math.min(1,Math.max(0,(time-3)/.25))*Math.min(1,Math.max(0,(5.2-time)/.35));env*=1-.98*dip;}
 if(key==='window')env*=windowMotion[Math.max(0,Math.min(windowMotion.length-1,Math.round((time-20.6)*240)))];
 for(let c=0;c<2;c++)channels[c][target]+=b.getChannelData(Math.min(c,b.numberOfChannels-1))[Math.round(offset*sr)+i]*gain*env*Math.sqrt(1+(c?pan:-pan));}}
 add('base',0,0,24.6,1,.025,.2);
 // Replace the noisy 4s section with the approved quiet bed, rather than hiding it under louder effects.
 add('quiet',3,20.8,2.2,2,.25,.35);
 add('quiet',24.4,20.8,3.4,2,.2,.12);
 add('water',24.2,.2,3.6,.85,.4,.2);
 add('ropeway',9.8,0,3.2,.65,.4,.6);
 let leavesPeak=0;for(const c of [0,1])for(const x of buffers.leaves.getChannelData(Math.min(c,buffers.leaves.numberOfChannels-1)))leavesPeak=Math.max(leavesPeak,Math.abs(x));
 const leafGain=Math.min(4,.045/Math.max(.00001,leavesPeak));
 // Overlapping low-level tails keep the shrine ambience continuous, without a mechanically repeated loud strike.
 for(const [at,gain]of [[3.25,.38],[5.45,.3],[7.6,.35]])add('chime',at,0,Math.min(3.7,9.8-at),gain,.06,.5,false,-.12);
 for(const at of [3.2,5.55,7.9])add('leaves',at,0,Math.min(3.2,9.9-at),leafGain*.23,.6,.65,false,.08);
 const wood=buffers.window.getChannelData(0);let woodPeak=0;for(const x of wood)woodPeak=Math.max(woodPeak,Math.abs(x));const woodGain=Math.min(1,.035/Math.max(.00001,woodPeak));
 for(const at of [20.6,22.7,24.8,26.9])add('window',at,.1,Math.min(2.5,27.8-at,buffers.window.duration-.1),woodGain,.2,.25,false,.25);
 add('leaves',17.45,0,3.05,leafGain,.4,.65,false,-.18);
 add('leaves',25.8,0,3.3,leafGain*.9,.35,.7,true,.18);
 const cat=buffers.cat.getChannelData(0);let peak=0;for(const x of cat)peak=Math.max(peak,Math.abs(x));let onset=0;while(onset<cat.length&&Math.abs(cat[onset])<peak*.06)onset++;const offset=Math.max(0,onset/sr-.025),catLength=Math.min(1.25,buffers.cat.duration-offset);
 add('cat',23.45,offset,catLength,Math.min(1,.14/Math.max(peak,.0001)),.015,.12,false,.22);
 let max=0;for(const c of channels)for(const x of c)max=Math.max(max,Math.abs(x));if(!Number.isFinite(max))throw Error('Non-finite mix');const gain=max>.92?.92/max:1;
 const wav=new ArrayBuffer(44+N*4),v=new DataView(wav),str=(p,s)=>{for(let i=0;i<s.length;i++)v.setUint8(p+i,s.charCodeAt(i))};str(0,'RIFF');v.setUint32(4,wav.byteLength-8,true);str(8,'WAVE');str(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,2,true);v.setUint32(24,sr,true);v.setUint32(28,sr*4,true);v.setUint16(32,4,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,N*4,true);for(let i=0;i<N;i++)for(let c=0;c<2;c++)v.setInt16(44+i*4+c*2,Math.round(channels[c][i]*gain*32767),true);
 const bytes=new Uint8Array(wav);let text='';for(let i=0;i<bytes.length;i+=32768)text+=String.fromCharCode(...bytes.subarray(i,i+32768));
 return {data:btoa(text),duration,sampleRate:sr,peak:max*gain,catAt:23.45,catSourceOffset:offset,catLength,leafGain,wrapWind:true,noiseDip:[3,5.2],shrineChimes:[3.25,5.45,7.6],forestWind:[3.2,9.9],windowMotionDriven:true};
},windowMotion);const wav=Buffer.from(result.data,'base64');delete result.data;assert.equal(wav.length,44+Math.round(27.8*32000)*4);assert(result.peak<1);fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'master.wav'),wav);fs.writeFileSync(path.join(out,'mix.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}finally{if(browser)await browser.close();server.close()}})().catch(e=>{console.error(e);process.exitCode=1});
