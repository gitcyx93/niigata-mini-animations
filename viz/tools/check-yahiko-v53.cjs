const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');const path=require('node:path'),{pathToFileURL}=require('node:url'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const root=path.resolve(__dirname,'../..'),page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.join(root,'viz/autumn/yahiko-v53-zh.html')).href,{waitUntil:'domcontentloaded',timeout:120000});await page.waitForFunction(()=>window.READY&&window.YahikoSound&&YahikoSound.audio.readyState>=1,null,{timeout:120000});
 await page.evaluate(()=>YahikoSound.seek(20));await page.waitForFunction(()=>Math.abs(YahikoSound.getState().renderedTime-20)<.05);const state=await page.evaluate(()=>({title:document.title,top:STORY41.find(x=>x[0]===V41.TOWN0)[2],time:YahikoSound.getState().time,soloButtons:document.querySelectorAll('#solo-buttons button').length,music:YahikoSound.metadata.music}));assert(state.title.includes('V53'));assert.equal(state.top,'有的旅馆 已经开了 300 多年');assert.equal(state.soloButtons,13);assert(state.music.includes('Reverie'));assert.deepEqual(errors,[]);
 // Current lightweight delivery page, served separately from the repository.
 await page.goto('http://127.0.0.1:18764/yahiko-final-zh/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.querySelector('#video').readyState>=2&&!document.querySelector('#seek').disabled);
 for(const t of ['20','4.5']){await page.locator('#seconds').fill(t);await page.locator('#go').click();await page.waitForFunction(t=>{const v=document.querySelector('#video');return !v.seeking&&Math.abs(v.currentTime-Number(t))<.05;},t);}
 assert.deepEqual(errors,[]);console.log('PASS source playback/20s text/13 stems/music metadata and mobile-width lightweight seeking');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
