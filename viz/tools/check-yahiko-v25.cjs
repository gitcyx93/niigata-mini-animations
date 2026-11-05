// Deterministic 30 fps export, then continuous playback of the encoded movie.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{spawn,spawnSync}=require('node:child_process');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'../..'),ref=path.join(root,'reference/yahiko-v25'),out=path.join(root,'output/autumn/yahiko-v25');
const base=process.env.YAHIKO_BASE_URL||'http://127.0.0.1:8768/v25/viz/autumn/',ffmpeg=process.env.FFMPEG_EXE||'ffmpeg';
const read=p=>fs.readFileSync(path.join(root,p),'utf8'),hash=x=>crypto.createHash('sha256').update(x).digest('hex');
fs.mkdirSync(out,{recursive:true});fs.rmSync(path.join(ref,'validation.json'),{force:true});
const old=read('viz/autumn/yahiko-v24.html'),next=read('viz/autumn/yahiko-v25.html'),start='// ======== v22：弥彦温泉（入夜的小镇全景）========',tail='// 月光：月亮周围一大圈冷光',newStart='// v25: reconstruct concept #3';
const oldAt=old.indexOf(start),newAt=next.indexOf(newStart),oldEnd=old.indexOf(tail,oldAt),newEnd=next.indexOf(tail,newAt);assert(oldAt>0&&newAt>0&&oldEnd>oldAt&&newEnd>newAt);
assert.equal(next.slice(0,newAt),old.slice(0,oldAt).replace('弥彦｜秋日山海 v24','弥彦｜秋日山海 v25').replace('新潟四季 · 秋 / V24','新潟四季 · 秋 / V25').replace('老旅馆「みのや」，开了 300 多年。','下山后，住一晚弥彦温泉。'),'Unexpected changes outside the town');
assert.equal(next.slice(newEnd),old.slice(oldEnd),'Other scene/playback code changed');assert(!next.includes('TOWN_PAINTING'));
const audioPattern=/<script id="yahiko-audio-data" type="text\/plain">([\s\S]*?)<\/script>/;
const oldAudio=read('viz/autumn/yahiko-v24-sound.html').match(audioPattern)[1],newAudio=read('viz/autumn/yahiko-v25-sound.html').match(audioPattern)[1];assert.equal(newAudio,oldAudio);
const audioBytes=Buffer.from(newAudio.trim().split(';base64,')[1],'base64');assert(audioBytes.length>100000);const audioPath=path.join(out,'v24-existing-ambience.m4a');fs.writeFileSync(audioPath,audioBytes);
const full=path.join(out,'yahiko-v25-ambience.mp4'),silent=path.join(out,'yahiko-v25-silent.mp4'),temporary=path.join(out,'yahiko-v25-rendering.mp4');
const errors=[];function run(args){const r=spawnSync(ffmpeg,['-nostdin','-hide_banner','-loglevel','error',...args],{encoding:'utf8',maxBuffer:2e6,windowsHide:true});if(r.error)throw r.error;assert.equal(r.status,0,r.stderr);}
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true,args:['--autoplay-policy=no-user-gesture-required']});let encoder;
 try{
  const page=await browser.newPage({viewport:{width:1400,height:1100}});page.on('pageerror',e=>errors.push(e.message));console.log('Loading full v25');
  await page.goto(base+'yahiko-v25.html?record=1',{waitUntil:'domcontentloaded',timeout:240000});await page.waitForFunction(()=>window.READY,{},{timeout:240000});
  const state=await page.evaluate(()=>({duration:duration(),plan:PLAN,rendering:typeof TOWN_PAINTING==='undefined'?'native-canvas':'bitmap'}));assert.equal(state.duration,24.6);assert.equal(state.rendering,'native-canvas');
  const markers=new Set([0,135,240,345,465,585,618,627,642,705,737]);
  let stderr='';encoder=spawn(ffmpeg,['-nostdin','-hide_banner','-loglevel','error','-y','-f','image2pipe','-framerate','30','-c:v','mjpeg','-i','pipe:0','-i',audioPath,'-map','0:v:0','-map','1:a:0','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-c:a','copy','-t','24.6','-movflags','+faststart',temporary],{stdio:['pipe','ignore','pipe'],windowsHide:true});
  encoder.stderr.on('data',b=>{stderr=(stderr+b.toString()).slice(-12000)});const done=new Promise((resolve,reject)=>{encoder.on('error',reject);encoder.on('close',code=>code===0?resolve():reject(Error(stderr||'FFmpeg failed')))});done.catch(()=>{});
  console.log('Rendering 738 frames');
  for(let i=0;i<738;i++){
   const data=await page.evaluate(i=>{render(i/30);return document.querySelector('#c').toDataURL('image/jpeg',.95).split(';base64,')[1]},i);
   const bytes=Buffer.from(data,'base64');assert(bytes.length>10000);if(!encoder.stdin.write(bytes))await new Promise((resolve,reject)=>{const fail=e=>{encoder.stdin.off('drain',drain);reject(e)},drain=()=>{encoder.stdin.off('error',fail);resolve()};encoder.stdin.once('drain',drain);encoder.stdin.once('error',fail);});
   if(markers.has(i)){const png=await page.evaluate(()=>document.querySelector('#c').toDataURL('image/png').split(';base64,')[1]);fs.writeFileSync(path.join(ref,'frame-'+String(+(i/30).toFixed(2)).replace('.','-')+'.png'),Buffer.from(png,'base64'));}
   if(i%150===0)console.log('frame',i);
  }
  encoder.stdin.end();await done;encoder=undefined;assert(fs.statSync(temporary).size>1000000);fs.renameSync(temporary,full);
  run(['-y','-i',full,'-map','0:v:0','-c','copy','-an','-movflags','+faststart',silent]);run(['-i',full,'-map','0:a:0','-f','null','-']);
  console.log('Exported both movies; playing the final encoded sound version continuously');
  const movieUrl=new URL('../../output/autumn/yahiko-v25/yahiko-v25-ambience.mp4',base).href;
  const playback=await page.evaluate(async url=>{
   playing=false;const v=document.createElement('video');v.muted=true;v.playsInline=true;v.preload='auto';v.src=url;document.body.append(v);
   await new Promise((resolve,reject)=>{v.onloadedmetadata=resolve;v.onerror=()=>reject(Error('Movie failed to decode'))});
   const media={duration:v.duration,width:v.videoWidth,height:v.videoHeight};const start=performance.now();let minDelta=Infinity,last=0,updates=0;
   v.ontimeupdate=()=>{if(v.currentTime>last){minDelta=Math.min(minDelta,v.currentTime-last);last=v.currentTime;updates++;}};
   const end=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Playback did not finish')),40000);v.onended=()=>{clearTimeout(timer);resolve()};v.onerror=()=>{clearTimeout(timer);reject(Error('Movie playback error'))}});
   await v.play();await end;const q=v.getVideoPlaybackQuality();const result={...media,elapsedMs:performance.now()-start,timeUpdates:updates,totalVideoFrames:q.totalVideoFrames,droppedVideoFrames:q.droppedVideoFrames,ended:v.ended};v.remove();return result;
  },movieUrl);
  assert(Math.abs(playback.duration-24.6)<.05);assert.equal(playback.width,1080);assert.equal(playback.height,1920);assert(playback.ended&&playback.totalVideoFrames>=735);assert.deepEqual(errors,[]);
  const validation={edition:'v25-native-canvas',duration_seconds:24.6,fps:30,rendered_frames:738,source_boundary_unchanged:true,existing_audio_identical:true,new_sound_effects_mixed:false,visual_sha256:hash(Buffer.from(next)),audio_sha256:hash(audioBytes),sound_movie_sha256:hash(fs.readFileSync(full)),silent_movie_sha256:hash(fs.readFileSync(silent)),state,playback,errors};fs.writeFileSync(path.join(ref,'validation.json'),JSON.stringify(validation,null,2)+'\n');console.log('PASS',JSON.stringify(playback));
 }finally{if(encoder)encoder.kill();await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
