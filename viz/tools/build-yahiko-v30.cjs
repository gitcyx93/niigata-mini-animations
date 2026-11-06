// Restore the single-leaf motif and articulate the final-shot objects; retain all shot clocks.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8'),hash=s=>crypto.createHash('sha256').update(s).digest('hex');
let html=read('viz/autumn/yahiko-v29.html');const baseline=hash(html);
const old=read('viz/autumn/yahiko-v29-town.js').replace('// V29_MOTION_INSERT',read('viz/autumn/yahiko-v29-motion.js'));
const scenery=read('viz/autumn/yahiko-v30-town.js'),motion=read('viz/autumn/yahiko-v30-motion.js'),objects=read('viz/autumn/yahiko-v30-objects.js');
assert.equal(scenery.split('// V30_OBJECTS_INSERT').length,2);const town=scenery.replace('// V30_OBJECTS_INSERT',motion+'\n'+objects);
assert.equal(html.split(old).length,2);html=html.replace(old,town);
const captionCall=" if(variant==='V6')titlesV6(t);else titlesC(t);";assert.equal(html.split(captionCall).length,2);html=html.replace(captionCall,' drawHeroLeafV30(g,t);\n'+captionCall);
html=html.replaceAll('弥彦｜秋日山海 v29','弥彦｜秋日山海 v30').replaceAll('新潟四季 · 秋 / V29','新潟四季 · 秋 / V30').replaceAll('弥彦 · 秋日山海 v29','弥彦 · 秋日山海 v30');
fs.writeFileSync(path.join(root,'viz/autumn/yahiko-v30.html'),html);
const out=path.join(root,'reference/yahiko-v30');fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'build.json'),JSON.stringify({baseline:'viz/autumn/yahiko-v29.html',baseline_sha256:baseline,visual_sha256:hash(html),scenery_sha256:hash(scenery),motion_sha256:hash(motion),objects_sha256:hash(objects),duration_seconds:27.8,town_interval:[20.6,27.8],leaf:{source:'v21 single-leaf narrative, redrawn as folded geometry',cut_holds:true,final_hold:[20.2,20.6],ground_contact:21.5,world_anchor:[590,1740],lift_off:[26.8,27.8]},changes:['single faceted leaf with stem, thickness, folded blade and contact shadow','explicit contact/rest phase, ground-locked through camera movement','wind lifts the leaf again in the final second','window hinges follow spring dynamics with cast shadows and moving reflections','individual roof tiles react locally to wind and cat landing'],timeline_changed:false,camera_changed:false,caption_text_changed:false,silent_only:true},null,2)+'\n');
console.log('Built v30: one physical leaf motif and articulated final-shot roof/windows. Timeline remains 27.8s.');
