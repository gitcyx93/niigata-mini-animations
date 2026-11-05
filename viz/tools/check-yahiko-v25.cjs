const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'../..'),out=path.join(root,'reference/yahiko-v25');
const base=process.env.YAHIKO_BASE_URL||'http://127.0.0.1:8768/v25/viz/autumn/';
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const errors=[];
fs.rmSync(path.join(out,'validation.json'),{force:true});
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true,args:['--autoplay-policy=no-user-gesture-required']});
 try{
  const page=await browser.newPage({viewport:{width:1400,height:1100}});page.on('pageerror',e=>errors.push(e.message));
  console.log('Loading v25');await page.goto(base+'yahiko-v25.html?record=1',{waitUntil:'domcontentloaded',timeout:240000});
  await page.waitForFunction(()=>window.READY||window.READY_ERROR,{},{timeout:240000});assert.equal(await page.evaluate(()=>window.READY_ERROR),undefined);
  const state=await page.evaluate(()=>({duration:duration(),plan:PLAN,rendering:typeof TOWN_PAINTING==='undefined'?'native-canvas':'bitmap'}));assert.equal(state.duration,24.6);assert.equal(state.rendering,'native-canvas');
  const capture=async t=>{const data=await page.evaluate(t=>{window.render(t);return document.querySelector('#c').toDataURL('image/png').split(',')[1]},t);return Buffer.from(data,'base64');};
  const before={};for(const t of [0,9,18.8])before[t]=sha(await capture(t));
  const frames={};for(const t of [20.6,21.4,23.5,24.55]){const img=await capture(t),name='frame-'+String(t).replace('.','-')+'.png';fs.writeFileSync(path.join(out,name),img);frames[t]=sha(img);}
  assert.notEqual(frames[21.4],frames[24.55]);console.log('Frames saved; recording the ending');
  const recording=await page.evaluate(async()=>{
   playing=false;
   const types=['video/mp4;codecs=avc1.42001E','video/mp4','video/webm;codecs=vp9','video/webm'];const mime=types.find(s=>MediaRecorder.isTypeSupported(s));if(!mime)throw Error('No supported video recorder');
   const canvas=document.querySelector('#c'),stream=canvas.captureStream(30),rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:6000000}),parts=[];
   const complete=new Promise((resolve,reject)=>{rec.ondataavailable=e=>{if(e.data.size)parts.push(e.data)};rec.onerror=reject;rec.onstop=async()=>{const blob=new Blob(parts,{type:mime});const result=await new Promise((r,j)=>{const reader=new FileReader();reader.onload=()=>r(reader.result.split(',')[1]);reader.onerror=j;reader.readAsDataURL(blob)});resolve(result)};});
   const from=19.2,to=24.59;window.render(from);rec.start();let frames=0;const start=performance.now();
   await new Promise(resolve=>{function step(now){const t=from+(now-start)/1000;window.render(Math.min(to,t));frames++;if(t<to)requestAnimationFrame(step);else resolve();}requestAnimationFrame(step)});
   rec.stop();const data=await complete;stream.getTracks().forEach(t=>t.stop());return{data,mime,frames,seconds:(performance.now()-start)/1000};
  });
  const clip='town-preview.'+(recording.mime.includes('mp4')?'mp4':'webm');fs.writeFileSync(path.join(out,clip),Buffer.from(recording.data,'base64'));delete recording.data;console.log('Saved',clip,recording);
  // Exercise a complete real-time cycle; deterministic seek snapshots do not replace playback.
  const playback=await page.evaluate(async()=>{let frames=0,maxGap=0,last;const start=performance.now();await new Promise(resolve=>{function tick(now){if(last)maxGap=Math.max(maxGap,now-last);last=now;const t=(now-start)/1000;window.render(Math.min(t,24.59));frames++;if(t<24.6)requestAnimationFrame(tick);else resolve()}requestAnimationFrame(tick)});return{frames,maxGap,elapsedMs:performance.now()-start}});
  console.log('Full timeline exercised',playback);await page.close();
  console.log('Loading v24 for unchanged-shot regression');const baseline=await browser.newPage({viewport:{width:1400,height:1100}});baseline.on('pageerror',e=>errors.push(e.message));
  await baseline.goto(base+'yahiko-v24.html?record=1',{waitUntil:'domcontentloaded',timeout:240000});await baseline.waitForFunction(()=>window.READY,{},{timeout:240000});
  const regression={};for(const t of [0,9,18.8]){const data=await baseline.evaluate(t=>{window.render(t);return document.querySelector('#c').toDataURL('image/png').split(',')[1]},t);regression[t]=sha(Buffer.from(data,'base64'))===before[t];assert(regression[t],`Unrelated frame ${t} changed`);}
  assert.deepEqual(errors,[]);const result={state,frames,regression,recording,playback,clip,errors};fs.writeFileSync(path.join(out,'validation.json'),JSON.stringify(result,null,2)+'\n');console.log('PASS',JSON.stringify(regression));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
