// Uses an existing Playwright install; no animation dependency is added.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs=require('node:fs'),http=require('node:http'),assert=require('node:assert/strict'),vm=require('node:vm'),path=require('node:path'),os=require('node:os');
const html=fs.readFileSync(path.join(__dirname,'../autumn/yahiko-v37-leaf-type.html'),'utf8');
for(const [,script]of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(script);
assert(!html.includes('LOOP_SPOT'),'Keep the hard-cut ending');
assert(html.includes("HL_C.subColor,300,'center'"),'Keep light caption weight');
(async()=>{
 const server=http.createServer((q,s)=>{s.setHeader('Content-Type','text/html; charset=utf-8');s.end(html)}).listen(0,'127.0.0.1');
 await new Promise(r=>server.once('listening',r));let browser;
 try{
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1000,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/?record=1`,{waitUntil:'domcontentloaded',timeout:120000});
  await page.waitForFunction(()=>window.READY,null,{timeout:120000});
  const result=await page.evaluate(()=>{
   const check=(v,m)=>{if(!v)throw Error(m)};
   check(duration()===27.8,'Duration unchanged');
   for(const [,,s]of STORY_C)check(measure(s,44,400,1.5)<=888,'Narration fits');
   check(flyingLeafColors.every(c=>c.length===3&&c.every(Number.isFinite)),'Valid leaf colors');
   for(let i=0;i<2;i++){
    check(titleLeafState(0,i)===null,'No static title sticker');
    const land=.68+i*.2,a=titleLeafState(land-.00001,i),b=titleLeafState(land,i);
    check(Math.hypot(a.x-b.x,a.y-b.y)<.1,'Continuous landing');
    const flight=titleLeafState(2.2,i);check(Math.hypot(flight.x-b.x,flight.y-b.y)>50,'Wind releases title leaf');
    check(JSON.stringify(titleLeafState(2.2,i))===JSON.stringify(flight),'Deterministic motion');
   }
   flyingLeafFaces.forEach(frames=>frames.length=0);
   const originalDraw=drawTownPhysicalLeafV31,physical=[];
   try{drawTownPhysicalLeafV31=(_,s)=>physical.push(s);const c=document.createElement('canvas').getContext('2d');
    flyingLeaf(c,0,0,20,0,3);flyingLeaf(c,0,0,20,2,3);flyingLeaf(c,0,0,8,2,3);
    check(physical.length===2,'Detailed near leaves, cheap distant leaves');
    check(physical[0].pitch!==physical[1].pitch&&physical[0].yaw!==physical[1].yaw,'Out-of-plane folding');
   }finally{drawTownPhysicalLeafV31=originalDraw;flyingLeafFaces.forEach(frames=>frames.length=0);}
   for(const leaf of OPEN_LEAVES.filter(l=>l.loop)){
    const a=openLeafState(leaf,-.000001),b=openLeafState(leaf,0);
    check(a&&b&&Math.hypot(a.x-b.x,a.y-b.y)<20,'Loop boundary has no trajectory reset');
   }
   const frames=[];for(let i=0;i<140;i++){const t=i*27.8/140,start=performance.now();render(t);frames.push(performance.now()-start);}
   const coldMeanRenderMs=Math.round(frames.reduce((a,b)=>a+b)/frames.length);frames.length=0;
   for(let i=0;i<140;i++){const start=performance.now();render(i*27.8/140);frames.push(performance.now()-start);}
   frames.sort((a,b)=>a-b);return {sampledFrames:280,coldMeanRenderMs,warmMeanRenderMs:Math.round(frames.reduce((a,b)=>a+b)/frames.length),warmP95RenderMs:Math.round(frames[Math.floor(frames.length*.95)])};
  });
  const screenshots=fs.mkdtempSync(path.join(os.tmpdir(),'yahiko-leaf-type-'));
  for(const [name,t]of [['opening',0],['title',.92],['wind',1.65],['cable',12],['night',19.3],['end',24],['loop',27.7]]){
   await page.evaluate(t=>render(t),t);await page.locator('#c').screenshot({path:path.join(screenshots,name+'.png')});
  }
  assert.deepEqual(errors,[]);console.log(JSON.stringify({pass:true,...result,screenshots}));
 }finally{if(browser)await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
