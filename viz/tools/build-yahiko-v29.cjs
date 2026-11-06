// v29 changes only the town drawing block of the verified v28 page.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8'),hash=s=>crypto.createHash('sha256').update(s).digest('hex');
let html=read('viz/autumn/yahiko-v28.html');const baseline=hash(html),old=read('viz/autumn/yahiko-v28-town.js');
const scenery=read('viz/autumn/yahiko-v29-town.js'),motion=read('viz/autumn/yahiko-v29-motion.js');
assert.equal(scenery.split('// V29_MOTION_INSERT').length,2);const town=scenery.replace('// V29_MOTION_INSERT',motion);
assert.equal(html.split(old).length,2);html=html.replace(old,town);
html=html.replaceAll('弥彦｜秋日山海 v28','弥彦｜秋日山海 v29').replaceAll('新潟四季 · 秋 / V28','新潟四季 · 秋 / V29').replaceAll('弥彦 · 秋日山海 v28','弥彦 · 秋日山海 v29');
fs.writeFileSync(path.join(root,'viz/autumn/yahiko-v29.html'),html);
const out=path.join(root,'reference/yahiko-v29');fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'build.json'),JSON.stringify({baseline:'viz/autumn/yahiko-v28.html',baseline_sha256:baseline,visual_sha256:hash(html),scenery_sha256:hash(scenery),motion_sha256:hash(motion),duration_seconds:27.8,town_interval:[20.6,27.8],unchanged_before_seconds:20.6,changes:['one seated silhouette stirs water with one foot, one standing silhouette tends hair in wind','same dark silhouette style for all limbs','glazed wooden window with fixed hinges','single gust field drives branches, crowns, window leaves and steam','cat trots, looks back, hops, lands and scampers'],caption_text_changed:false,timeline_changed:false,camera_changed:false,silent_only:true},null,2)+'\n');
console.log('Built v29: final-shot acting and coherent wind only; timing, camera and earlier scenes unchanged.');
