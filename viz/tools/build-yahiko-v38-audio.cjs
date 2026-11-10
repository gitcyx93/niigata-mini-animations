// Rebuild the approved recipe from local inputs; the default output is a separate audition.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const crypto = require('node:crypto');
const os = require('node:os');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const approved = path.join(root, 'viz/autumn/audio/yahiko-v38');
const sourceKeys = ['base', 'quiet', 'leaves', 'water', 'ropeway', 'cat', 'windchime', 'window', 'sea', 'bird1', 'bird2'];
const groups = [...sourceKeys, 'forest'];
const options = {config: path.join(approved, 'build-config.json'), out: path.join(root, 'output/audio/yahiko-v38'), updateRelease: false, force: false};
let customOut = false;
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--help' || arg === '-h') {
    console.log('Usage: node viz/tools/build-yahiko-v38-audio.cjs [--config recipe.json] [--out directory] [--force] [--update-release]\n\nDefault: write a separate mix to output/audio/yahiko-v38.\n--force permits replacing existing audition files outside output/.\n--update-release explicitly replaces the approved release audio.\nThe recipe controls source files, per-layer enabled/gainDb, and masterGainDb.');
    process.exit(0);
  }
  if (arg === '--update-release') options.updateRelease = true;
  else if (arg === '--force') options.force = true;
  else if (arg === '--config' || arg === '--out') {
    assert(args[i + 1] && !args[i + 1].startsWith('--'), `Missing value for ${arg}`);
    options[arg.slice(2)] = path.resolve(args[++i]);
    if (arg === '--out') customOut = true;
  } else throw new Error(`Unknown argument: ${arg}`);
}
if (options.updateRelease) {
  assert(!customOut || options.out === approved, '--update-release writes only the approved audio directory; omit --out');
  options.out = approved;
}
// Resolve existing parents too, so --out cannot bypass the release guard via a symlink.
function realOutput(p) {
  if (fs.existsSync(p)) return fs.realpathSync(p);
  return path.join(realOutput(path.dirname(p)), path.basename(p));
}
const out = realOutput(options.out);
const relative = path.relative(fs.realpathSync(approved), realOutput(out));
const insideRelease = relative === '' || (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative));
assert(!insideRelease || options.updateRelease, 'Approved audio is protected. Use --update-release to explicitly replace it.');
const generatedRelative = path.relative(realOutput(path.join(root, 'output')), realOutput(out));
const insideGenerated = generatedRelative === '' || (!generatedRelative.startsWith('..' + path.sep) && generatedRelative !== '..' && !path.isAbsolute(generatedRelative));
const mayReplace = insideGenerated || options.force || options.updateRelease;
const wavDurations = {'master.wav':27.8, 'effects.wav':27.8, 'audition-base-3-6.wav':3, 'audition-shrine-chime.wav':6.6, 'audition-shrine-wind.wav':6.7, 'audition-sea.wav':4.3};
const outputNames = [...Object.keys(wavDurations), 'mix.json'];
function checkDestinations() {
  for (const name of outputNames) {
    const target = path.join(out, name), stat = fs.lstatSync(target, {throwIfNoEntry:false});
    assert(!stat || stat.isFile(), `Refusing non-file or symlink output: ${target}`);
    assert(!stat || mayReplace, `Output exists: ${target}. Use --force to explicitly replace it.`);
  }
}
checkDestinations();
// Validate the entire result first, stage it on the same filesystem, then replace.
// A failed replacement restores every previous file before reporting the error.
function publish(files) {
  checkDestinations();
  fs.mkdirSync(out, {recursive:true});
  const staging = fs.mkdtempSync(path.join(out, '.audio-build-'));
  const changes = [];
  let canClean = false;
  try {
    for (const [name, bytes] of files) fs.writeFileSync(path.join(staging, name), bytes, {flag:'wx'});
    checkDestinations();
    for (const [name] of files) {
      const target = path.join(out, name), backup = path.join(staging, name + '.previous');
      const change = {target, backup, saved:false, installed:false};
      changes.push(change);
      if (fs.existsSync(target)) {fs.renameSync(target, backup);change.saved = true;}
      fs.renameSync(path.join(staging, name), target);change.installed = true;
    }
    canClean = true;
  } catch (error) {
    const recoveryErrors = [];
    for (const change of changes.reverse()) {
      try {
        if (change.installed) fs.unlinkSync(change.target);
        if (change.saved) fs.renameSync(change.backup, change.target);
      } catch (failure) {recoveryErrors.push(failure);}
    }
    if (recoveryErrors.length) throw new AggregateError([error, ...recoveryErrors], `Audio output failed; recovery files retained in ${staging}`);
    canClean = true;
    throw error;
  } finally {
    if (canClean) fs.rmSync(staging, {recursive:true, force:true});
  }
}

const config = JSON.parse(fs.readFileSync(options.config, 'utf8'));
assert.equal(config.version, 1, 'Unsupported audio recipe version');
assert(Number.isFinite(config.masterGainDb), 'masterGainDb must be finite');
assert(config.sources && typeof config.sources === 'object', 'sources is required');
assert(config.levels && typeof config.levels === 'object', 'levels is required');
for (const key of Object.keys(config.sources)) assert(sourceKeys.includes(key), `Unknown source: ${key}`);
for (const key of Object.keys(config.levels)) assert(groups.includes(key), `Unknown layer: ${key}`);
for (const key of groups) {
  const level = config.levels[key];
  assert(level && typeof level.enabled === 'boolean' && Number.isFinite(level.gainDb), `Invalid enabled/gainDb for ${key}`);
}
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const inputs = Object.create(null);
const inputHashes = {};
const sourceFiles = {};
for (const key of sourceKeys) {
  assert(typeof config.sources[key] === 'string' && config.sources[key], `Missing source file: ${key}`);
  sourceFiles[key] = path.resolve(path.dirname(options.config), config.sources[key]);
  inputs[key] = fs.readFileSync(sourceFiles[key]);
  inputHashes[key] = hash(inputs[key]);
}
const visualPath = path.join(root, 'src/yahiko-v38/animation.js');
const visual = fs.readFileSync(visualPath, 'utf8');
function between(start, end) {
  const a = visual.indexOf(start), b = visual.indexOf(end, a);
  assert(a >= 0 && b > a, `Window-motion source markers missing: ${start}`);
  return visual.slice(a, b);
}
const model = between('function townWind(a){', 'const townTreeSpecs=') + between('const townWindowSpringV30=', 'function townOpenWindows(');
const windowMotion = vm.runInNewContext(model + ';Array.from({length:1729},(_,i)=>{const s=townWindowState(i/240);return Math.min(1,(Math.abs(s.lv)+Math.abs(s.rv))*.6)})', {
  clamp: (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp: (a, b, u) => a + (b - a) * u
}, {timeout: 2000});
const {launchBrowser} = require('./lib/browser.cjs');
(async()=>{
const fallbackInputs = [];
let pcmDirectory;
const serverErrors = [];
const server=http.createServer((q,s)=>{
  const request=q.url.slice(1), pcm=request.startsWith('pcm/'), key=pcm?request.slice(4):request;
  if(!key){s.setHeader('Content-Type','text/html');return s.end('<!doctype html><title>Audio mixer</title>')}
  if(!Object.hasOwn(inputs,key)){s.writeHead(404);return s.end()}
  try {
    if(!pcm)return s.end(inputs[key]);
    // Chromium distributions without AAC support still use the same browser mixer.
    // FFmpeg only decodes the unavailable source codec; native sample rate/channels
    // and float samples are retained for the browser's existing resampling/filtering.
    pcmDirectory ||= fs.mkdtempSync(path.join(os.tmpdir(),'yahiko-audio-'));
    const target=path.join(pcmDirectory,key+'.wav');
    if(!fs.existsSync(target)){
      execFileSync(process.env.FFMPEG||'ffmpeg',['-nostdin','-v','error','-i',sourceFiles[key],'-map','0:a:0','-c:a','pcm_f32le',target],{windowsHide:true,maxBuffer:1024*1024,timeout:60000});
      fallbackInputs.push(key);
    }
    s.setHeader('Content-Type','audio/wav');s.end(fs.readFileSync(target));
  }catch(e){s.writeHead(500);s.end(`Cannot decode ${key}. Set FFMPEG to an installed FFmpeg. ${e.message}`)}
});
server.on('error', error => {serverErrors.push(error);server.closeAllConnections();});
let browser;
try{
 await new Promise((resolve,reject)=>{
   const ready=()=>{server.off('error',failed);resolve()};
   const failed=error=>{server.off('listening',ready);reject(error)};
   server.once('listening',ready);server.once('error',failed);server.listen(0,'127.0.0.1');
 });
 browser=await launchBrowser();const page=await browser.newPage();await page.goto(`http://127.0.0.1:${server.address().port}/`);
const result=await page.evaluate(async({windowMotion,config})=>{
 const sr=32000,duration=27.8,N=Math.round(sr*duration),context=new OfflineAudioContext(2,N,sr),buffers={};
 await Promise.all(['base','quiet','leaves','water','ropeway','cat','windchime','window','sea','bird1','bird2'].map(async k=>{
   const original=await(await fetch('/'+k,{signal:AbortSignal.timeout(30000)})).arrayBuffer();
   try { buffers[k]=await context.decodeAudioData(original); }
   catch { const pcm=await fetch('/pcm/'+k,{signal:AbortSignal.timeout(30000)});if(!pcm.ok)throw Error(await pcm.text());buffers[k]=await context.decodeAudioData(await pcm.arrayBuffer()); }
 }));
 async function filter(key,hp,lp){const b=buffers[key],c=new OfflineAudioContext(2,b.length,sr),s=c.createBufferSource(),h=c.createBiquadFilter(),l=c.createBiquadFilter();s.buffer=b;h.type='highpass';h.frequency.value=hp;l.type='lowpass';l.frequency.value=lp;s.connect(h).connect(l).connect(c.destination);s.start();buffers[key]=await c.startRendering();}
 await Promise.all([filter('window',160,1900),filter('windchime',350,6200),filter('sea',100,3200)]);
 const channels=[new Float32Array(N),new Float32Array(N)],layers={};
 function add(key,start,offset,length,gain,fadeIn=.05,fadeOut=.15,wrap=false,pan=0,group=key){if(['base','windchime','forest','sea'].includes(group)&&!layers[group])layers[group]=[new Float32Array(N),new Float32Array(N)];const level=config.levels[group];if(!level.enabled)return;gain*=Math.pow(10,(level.gainDb+config.masterGainDb)/20);const b=buffers[key],n=Math.min(Math.round(length*sr),b.length-Math.round(offset*sr));for(let i=0;i<n;i++){let target=Math.round(start*sr)+i;if(wrap)target=((target%N)+N)%N;if(target<0||target>=N)continue;let env=Math.min(1,i/Math.max(1,fadeIn*sr),(n-1-i)/Math.max(1,fadeOut*sr));const time=target/sr;
 // Replace only the summit's old open-field wind; other approved base audio is untouched.
 if(key==='base')env*=1-Math.min(1,Math.max(0,(time-12.8)/.5),Math.max(0,(17.1-time)/.65));
 if(key==='window')env*=windowMotion[Math.max(0,Math.min(windowMotion.length-1,Math.round((time-20.6)*240)))];
 for(let c=0;c<2;c++){const value=b.getChannelData(Math.min(c,b.numberOfChannels-1))[Math.round(offset*sr)+i]*gain*env*Math.sqrt(1+(c?pan:-pan));channels[c][target]+=value;if(layers[group])layers[group][c][target]+=value;}}}
 add('base',0,0,24.6,1,.025,.2);
 // The 4s bed stays restored; only the 12.8–17.1s summit bed is replaced.
 const seaOffset=Math.min(12,Math.max(0,buffers.sea.duration-4.3));let seaSquares=0,seaPeak=0;const seaSamples=Math.round(4.3*sr),seaData=buffers.sea.getChannelData(0);for(let i=0;i<seaSamples;i++){const x=seaData[Math.round(seaOffset*sr)+i]||0;seaSquares+=x*x;seaPeak=Math.max(seaPeak,Math.abs(x));}
 const seaGain=Math.min(.0065/Math.max(1e-8,Math.sqrt(seaSquares/seaSamples)),.025/Math.max(1e-8,seaPeak));add('sea',12.8,seaOffset,4.3,seaGain,.5,.65);
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
},{windowMotion,config});
assert.deepEqual(serverErrors, [], 'Local audio server failed');
result.decoding={browser:browser.version(),ffmpegFallbackInputs:fallbackInputs.sort(),ffmpegVersion:fallbackInputs.length?execFileSync(process.env.FFMPEG||'ffmpeg',['-version'],{encoding:'utf8',timeout:5000,windowsHide:true}).split('\n')[0]:null};
result.configuration={file:path.relative(root,options.config),sha256:hash(fs.readFileSync(options.config)),masterGainDb:config.masterGainDb,levels:config.levels,sourceSha256:inputHashes,visualSource:path.relative(root,visualPath),visualSha256:hash(visual)};
assert.deepEqual(Object.keys(result.files).sort(), Object.keys(wavDurations).sort());
const files = new Map();
for (const [name, data] of Object.entries(result.files)) {
  const wav = Buffer.from(data, 'base64');
  assert.equal(wav.length, 44 + Math.round(wavDurations[name] * 32000) * 4, `Unexpected duration: ${name}`);
  assert.equal(wav.toString('ascii',0,4),'RIFF');assert.equal(wav.toString('ascii',8,12),'WAVE');
  assert.equal(wav.readUInt32LE(4),wav.length-8);assert.equal(wav.readUInt32LE(40),wav.length-44);
  assert.equal(wav.readUInt16LE(20),1);assert.equal(wav.readUInt16LE(22),2);
  assert.equal(wav.readUInt32LE(24),32000);assert.equal(wav.readUInt16LE(34),16);
  files.set(name, wav);
}
assert(files.get('master.wav').equals(files.get('effects.wav')), 'Release must have no music');
assert(Number.isFinite(result.peak) && result.peak < 1, 'Invalid audio peak');
delete result.files;
files.set('mix.json', Buffer.from(JSON.stringify(result,null,2)+'\n'));
publish(files);
console.log(JSON.stringify({output:path.relative(root,out),...result},null,2));
} finally {
  try {if(browser)await browser.close();}
  finally {
    server.closeAllConnections();
    await new Promise(resolve=>server.close(()=>resolve()));
    if(pcmDirectory)fs.rmSync(pcmDirectory,{recursive:true,force:true});
  }
}
})().catch(e=>{console.error(e);process.exitCode=1});
