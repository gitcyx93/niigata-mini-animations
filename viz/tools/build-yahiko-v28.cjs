// v28 returns to the v25 baseline: every pre-town shot keeps its original timing and drawing.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8'),hash=s=>crypto.createHash('sha256').update(s).digest('hex');
let html=read('viz/autumn/yahiko-v25.html');const baseline=hash(html);
function replace(old,next){assert.equal(html.split(old).length,2,'Expected unique match: '+old.slice(0,100));html=html.replace(old,next);}
const town=read('viz/autumn/yahiko-v28-town.js');replace(read('viz/autumn/yahiko-v25-town.js'),town);
// Keep the legacy scene clock too: changing T changes floating-point phases inside since().
replace('const T = 24.6;', 'const T = 24.6;\nconst V28_DURATION = 27.8;');
replace("function duration(){return variant==='V6'?20:T;}", "function duration(){return variant==='V6'?20:V28_DURATION;}");
replace("['town',TOWN0,24.6]", "['town',TOWN0,V28_DURATION]");
replace("[TOWN0,24.6,'下山后，住一晚弥彦温泉。']", "[TOWN0,V28_DURATION,'下山后，住一晚弥彦温泉。']");
// No changes to TOWN0=20.6, NIGHT0, sourceTime, cameraState, nightV18, moonG or earlier moonLayer.
const start=html.indexOf('function townShot(b,t){'),end=html.indexOf('const flashAt=',start);assert(start>0&&end>start);
html=html.slice(0,start)+`const townMoonLayerV28=layer(b=>{
 glow(b,785,570,280,280,[139,157,184],.10);glow(b,785,570,95,95,[208,209,186],.13);
 b.save();b.shadowColor='rgba(215,218,201,.35)';b.shadowBlur=7;b.fillStyle='#d0d2bf';b.beginPath();b.arc(785,570,33,0,TAU);b.fill();b.restore();
 b.fillStyle='rgba(140,151,147,.12)';[[776,555,9],[794,577,13],[773,582,6]].forEach(([x,y,r])=>{b.beginPath();b.arc(x,y,r,0,TAU);b.fill();});
});
function townMoonTime(a){return TOWN0+4*ease(clamp(a/7.2));}
function townShot(b,t){
 const a=t-TOWN0,c=cameraState(5.0,'reveal'),mt=townMoonTime(a),m=moonG(mt);NIGHT_T=mt;
 camera(b,c.z,c.x,c.y);b.drawImage(nightSkyL,0,0,W,H);
 const soft=ease(clamp(a/1.2)),mx=c.x+(m[0]-540)/c.z-785,my=c.y+(m[1]-960)/c.z-570;
 b.save();b.globalAlpha=1-soft;b.drawImage(moonLayer,mx,my,W,H);b.globalAlpha=soft;b.drawImage(townMoonLayerV28,mx,my,W,H);b.restore();
 b.setTransform(1,0,0,1,0,0);glow(b,m[0],m[1],610,550,[121,143,177],.065);glow(b,m[0],m[1],240,220,[186,200,215],.055);
 b.save();for(const [dx,dy,w,h,sd] of [[-150,70,320,32,9801],[170,-40,280,28,9803],[60,140,360,34,9805]]){b.globalAlpha=.19;softCloud(b,m[0]+dx+a*2,m[1]+dy,w,h,sd,.10);}b.restore();
 const up=1-easeOut(clamp((a-.1)/.9));
 {const s=setC.getContext('2d');s.setTransform(1,0,0,1,0,0);s.clearRect(0,0,W,H);townSetDraw(s,a);b.drawImage(setC,0,H*up*.9,W,H);}
 const down=easeIn(clamp(a/.65));
 if(down<1){const s=landC.getContext('2d');s.setTransform(1,0,0,1,0,0);s.clearRect(0,0,W,H);MOONDX=mx;MOONDY=my;NOSKY=true;valleyShot(s,5.0,'reveal',false);NOSKY=false;b.drawImage(landC,0,H*down,W,H);}
 if(a<.6){b.save();b.globalAlpha=.28*(1-a/.6);windLeaves(b,5.0+a,null,1-a/.6);b.restore();}
}
`+html.slice(end);
// Keep the previously requested final-frame hold and replay controls, without retiming any earlier shot.
replace("play.onclick=()=>{playing=!playing;lastTime=0;status();};", "play.onclick=()=>{if(!playing&&playTime>=duration()-.011)playTime=0;playing=!playing;lastTime=0;status();};");
replace("function update(t){playTime=((t%duration())+duration())%duration();render(playTime);status();}", "function update(t){playTime=clamp(Number(t),0,duration()-.01);render(playTime);status();}");
replace("play.textContent=playing?'暂停':'播放';", "play.textContent=playing?'暂停':playTime>=duration()-.011?'重播':'播放';");
replace("if(lastTime)playTime=(playTime+(now-lastTime)/1000)%duration();render(playTime);status();", "if(lastTime){playTime=Math.min(duration()-.01,playTime+(now-lastTime)/1000);if(playTime>=duration()-.01)playing=false;}render(playTime);status();");
// Loading feedback from the local-preview repair, outside the animation canvas.
replace('window.READY=true;', "window.READY=true;document.getElementById('load-state').hidden=true;");
replace('<main class="film"', '<p id="load-state" role="status" style="position:fixed;top:12px;left:12px;z-index:10;background:#111d28;padding:10px 14px;border-radius:4px;font-size:13px">正在准备画面…</p><script>window.addEventListener(\'error\',()=>{const n=document.getElementById(\'load-state\');if(n){n.hidden=false;n.textContent=\'画面加载失败，请重新打开文件。\';}});</script><main class="film"');
html=html.replaceAll('弥彦｜秋日山海 v25','弥彦｜秋日山海 v28').replaceAll('新潟四季 · 秋 / V25','新潟四季 · 秋 / V28').replaceAll('弥彦 · 秋日山海 v16','弥彦 · 秋日山海 v28').replaceAll('24.6 秒','27.8 秒').replace('max="24.59"','max="27.79"');
fs.writeFileSync(path.join(root,'viz/autumn/yahiko-v28.html'),html);
const out=path.join(root,'reference/yahiko-v28');fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'build.json'),JSON.stringify({baseline:'viz/autumn/yahiko-v25.html',baseline_sha256:baseline,visual_sha256:hash(html),town_sha256:hash(town),duration_seconds:27.8,unchanged_before_seconds:20.6,town_interval:[20.6,27.8],night_interval:[17,20.6],changes:['bridge-style seated pair with moving immersed feet','irregular mineral-water rock bath and steam','open swaying upstairs window panels','cat running along the roof','final-shot zoom and soft moon only'],silent_only:true,caption_text_changed:false},null,2)+'\n');
console.log('Built v28 from v25: first 20.6s unchanged; town 7.2s; total 27.8s.');
