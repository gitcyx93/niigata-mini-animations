// Isolated Chrome/CDP validation, including pixel-for-pixel comparison of every sampled pre-town frame.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {spawn}=require('node:child_process'),{pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'../..'),out=path.join(root,'reference/yahiko-v29');fs.mkdirSync(out,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),'yahiko-v29-check-'));
 const proc=spawn(process.env.BROWSER_EXE||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--disable-gpu','--disable-accelerated-2d-canvas','--remote-debugging-port=0','--user-data-dir='+profile,'--no-first-run','--window-size=1280,1000','about:blank'],{stdio:'ignore'});
 let ws;const errors=[],results={};
 try{
  let port;for(let i=0;i<100;i++){await sleep(100);try{port=fs.readFileSync(path.join(profile,'DevToolsActivePort'),'utf8').split('\n')[0];break;}catch{}}assert(port,'Chrome failed to start');
  const tabs=await(await fetch('http://127.0.0.1:'+port+'/json')).json();ws=new WebSocket(tabs[0].webSocketDebuggerUrl);await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
  let id=0;const pending=new Map();ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){clearTimeout(p.timer);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);};
  const call=(method,params={})=>new Promise((resolve,reject)=>{const key=++id,timer=setTimeout(()=>{pending.delete(key);reject(Error('Timeout: '+method));},40000);pending.set(key,{resolve,reject,timer});ws.send(JSON.stringify({id:key,method,params}));});
  const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
  await call('Runtime.enable');await call('Page.enable');
  const load=async filename=>{const url=pathToFileURL(path.join(root,'viz/autumn',filename)).href+'?record=1';await call('Page.navigate',{url});for(let i=0;i<100;i++){if(await evaluate(`location.href===${JSON.stringify(url)}&&Boolean(window.READY)`))return;await sleep(200);}throw Error('Page never ready: '+filename);};
  const digest=async t=>evaluate(`(async()=>{update(${t});const pixels=cv.getContext('2d').getImageData(0,0,W,H).data;const h=await crypto.subtle.digest('SHA-256',pixels);return [...new Uint8Array(h)].map(x=>x.toString(16).padStart(2,'0')).join('');})()`);
  const samples=[...new Set([...Array.from({length:42},(_,i)=>i*.5),3.199,3.2,6.399,6.4,9.799,9.8,12.999,13,16.999,17,17.9,18.2,20.599])].sort((a,b)=>a-b);
  await load('yahiko-v25.html');const baseline={};for(const t of samples){baseline[t]=await digest(t);if(t===0){const image=await evaluate('cv.toDataURL()');fs.writeFileSync(path.join(out,'baseline-0.png'),Buffer.from(image.split(',')[1],'base64'));}}
  const signatures=await evaluate('[sourceTime,cameraState,nightV18,moonG,nightLit,bridgeVisitors].map(f=>f.toString())');
  const beforePlan=await evaluate('PLAN.slice(0,-1)');
  await load('yahiko-v29.html');assert.deepEqual(await evaluate('[sourceTime,cameraState,nightV18,moonG,nightLit,bridgeVisitors].map(f=>f.toString())'),signatures,'Pre-town functions changed');assert.deepEqual(await evaluate('PLAN.slice(0,-1)'),beforePlan,'Pre-town timeline changed');
  results.preTownComparison=[];
  for(const t of samples){const actual=await digest(t),matched=actual===baseline[t];results.preTownComparison.push({time:t,matched,baseline:baseline[t],actual});if(t===0){const image=await evaluate('cv.toDataURL()');fs.writeFileSync(path.join(out,'current-0.png'),Buffer.from(image.split(',')[1],'base64'));}}
  assert(results.preTownComparison.every(x=>x.matched),'Pre-town pixel mismatch at: '+results.preTownComparison.filter(x=>!x.matched).map(x=>x.time).join(', '));
  results.duration=await evaluate('duration()');assert.equal(results.duration,27.8);results.plan=await evaluate('PLAN');
  results.frames=[];
  for(const t of [20.599,20.6,21.2,22,22.7,23,23.15,23.4,23.8,24,24.25,25,26,27,27.79]){
   const image=await evaluate(`(()=>{update(${t});const c=document.createElement('canvas');c.width=540;c.height=960;c.getContext('2d').drawImage(cv,0,0,540,960);return c.toDataURL('image/jpeg',.9);})()`);
   fs.writeFileSync(path.join(out,'frame-'+t+'.jpg'),Buffer.from(image.split(',')[1],'base64'));results.frames.push(t);
  }
  results.feet=await evaluate(`(()=>{const b=document.createElement('canvas').getContext('2d');townBathPath(b);return Array.from({length:37},(_,i)=>{const t=i*.2;return {time:t,feet:townFeet(t).map(f=>({tip:[807+f.tip[0]*1.3,1408+f.tip[1]*1.3],inWater:b.isPointInPath(807+f.tip[0]*1.3,1408+f.tip[1]*1.3)}))};});})()`);
  assert(results.feet.every(s=>s.feet.every(f=>f.inWater)),'A swinging foot leaves the water');
  assert.notDeepEqual(results.feet[0].feet[0].tip,results.feet[4].feet[0].tip,'Feet are not swinging');
  results.windows=await evaluate('[0,1,2,3,4,5,6,7].map(a=>townWindowState(a))');assert(new Set(results.windows.map(x=>x.opening.toFixed(3))).size>5,'Window panels do not move');
  results.cat=await evaluate('[0,1.1,2,2.55,3.2,3.65,4.5,5.5,7.2].map(a=>townCatState(a))');
  assert(results.cat[2].x<results.cat[6].x,'Cat does not traverse the roof');
  assert(results.cat.some(s=>s.stage==='look-back'&&s.look>.9),'Cat never looks back');
  assert(results.cat.some(s=>s.stage==='hop'&&s.jump>30),'Cat never visibly hops');
  assert.equal(results.cat[5].jump,0,'Cat did not land');
  results.wind=await evaluate('[0,1,2,2.3,3,4,5,6,7.2].map(a=>({time:a,wind:townWind(a),trees:townTreeSpecs.map((_,i)=>townTreeState(a,i)),windows:townWindowState(a),person:townStandingPose(a)}))');
  assert(results.wind.some(s=>s.trees.every(t=>Math.abs(t.angle)>.02)),'Trees do not respond to a shared gust');
  assert(results.wind.some(s=>s.person.hand>.85),'Standing person does not react to wind');
  assert(results.wind.at(-1).person.hand<.1,'Standing gesture does not relax after the wind');
  assert.equal(results.feet[0].feet.length,2,'Expected just the seated person’s two feet');
  assert.deepEqual(results.feet[0].feet[1].tip,results.feet[8].feet[1].tip,'The resting foot should stay still');
  assert.notEqual(results.feet[0].feet[0].tip[1],results.feet[8].feet[0].tip[1],'Stirring foot should follow an oval, not only swing sideways');
  results.leaves=await evaluate('(()=>{let n=0;const old=leaves,oldWind=windLeaves;leaves=(...args)=>{n++;return old(...args)};windLeaves=(...args)=>{n++;return oldWind(...args)};try{update(22);update(26);return n;}finally{leaves=old;windLeaves=oldWind;}})()');assert.equal(results.leaves,0);
  await evaluate("document.getElementById('restart').click()");const start=Date.now();results.playback=[];
  while(Date.now()-start<35000){await sleep(1000);const s=await evaluate('({time:playTime,playing})');results.playback.push(s);if(!s.playing&&s.time>27.7)break;}
  assert(results.playback.at(-1).time>27.7&&!results.playback.at(-1).playing,'Did not finish');await sleep(1000);results.held=await evaluate('({time:playTime,playing,label:play.textContent})');assert.equal(results.held.time,27.79);assert.equal(results.held.label,'重播');
  await evaluate('play.click()');await sleep(500);results.replay=await evaluate('({time:playTime,playing})');assert(results.replay.playing&&results.replay.time<2);
  results.seek=await evaluate("(()=>{seek.value='20.6';seek.dispatchEvent(new Event('input'));return {time:playTime,playing,shot:shotAt(playTime)};})()");assert.equal(results.seek.shot,'town');assert.equal(results.seek.playing,false);
  await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});results.mobile=await evaluate('({viewport:innerWidth,body:document.body.scrollWidth})');assert(results.mobile.body<=results.mobile.viewport+1);
  assert.equal(errors.length,0);results.errors=errors;results.passed=true;fs.writeFileSync(path.join(out,'validation.json'),JSON.stringify(results,null,2)+'\n');
  console.log(JSON.stringify({passed:true,preTownFramesCompared:samples.length,preTownPixelMatches:results.preTownComparison.filter(x=>x.matched).length,duration:results.duration,feetAllInsideWater:true,windowMotion:true,catTraversesRoof:true,continuousPlaybackSamples:results.playback.length,held:results.held,errors:errors.length}));
 }catch(e){results.errors=errors;results.passed=false;results.failure=e.message;fs.writeFileSync(path.join(out,'validation.json'),JSON.stringify(results,null,2)+'\n');throw e;}finally{ws?.close();proc.kill();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
