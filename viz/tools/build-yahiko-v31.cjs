// v31 removes the mistakenly added cross-film hero leaf. Only actual bridge-gust particles carry into the town.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8'),hash=s=>crypto.createHash('sha256').update(s).digest('hex');
let html=read('viz/autumn/yahiko-v30.html');const baseline=hash(html);
const old=read('viz/autumn/yahiko-v30-town.js').replace('// V30_OBJECTS_INSERT',read('viz/autumn/yahiko-v30-motion.js')+'\n'+read('viz/autumn/yahiko-v30-objects.js'));
const scenery=read('viz/autumn/yahiko-v31-town.js'),motion=read('viz/autumn/yahiko-v31-motion.js'),objects=read('viz/autumn/yahiko-v31-objects.js');
assert.equal(scenery.split('// V31_OBJECTS_INSERT').length,2);const town=scenery.replace('// V31_OBJECTS_INSERT',motion+'\n'+objects);
assert.equal(html.split(old).length,2);html=html.replace(old,town);
const hero=' drawHeroLeafV30(g,t);\n';assert.equal(html.split(hero).length,2);html=html.replace(hero,'');
const tail=' if(a<.6){b.save();b.globalAlpha=.28*(1-a/.6);windLeaves(b,5.0+a,null,1-a/.6);b.restore();}';assert.equal(html.split(tail).length,2);html=html.replace(tail,' drawTownLeafCarryV31(b,t);');
const captionStart=Number(html.match(/function endCardC\(t\)[\s\S]*?rise\(t>=(\d+(?:\.\d+)?)/)[1]);
assert.equal(captionStart,Number(objects.match(/TOWN_LEAF_RELEASE_V31=(\d+(?:\.\d+)?)/)[1]),'Leaf release must match the first ending caption');
assert(!html.includes('drawHeroLeafV30')&&!html.includes('heroFlightsV30')&&!html.includes('HERO_LEAF_DISABLED'),'Unauthorized hero leaf code remains');
html=html.replaceAll('弥彦｜秋日山海 v30','弥彦｜秋日山海 v31').replaceAll('新潟四季 · 秋 / V30','新潟四季 · 秋 / V31').replaceAll('弥彦 · 秋日山海 v30','弥彦 · 秋日山海 v31');
fs.writeFileSync(path.join(root,'viz/autumn/yahiko-v31.html'),html);
const out=path.join(root,'reference/yahiko-v31');fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'build.json'),JSON.stringify({baseline:'viz/autumn/yahiko-v30.html',baseline_sha256:baseline,visual_sha256:hash(html),scenery_sha256:hash(scenery),motion_sha256:hash(motion),objects_sha256:hash(objects),duration_seconds:27.8,town_interval:[20.6,27.8],removed:'entire cross-film single hero-leaf effect',carried_leaf_count:7,source_particle_ids:[353,379,394,412,425,441,445],ground_contacts:[21.2,21.308],wind_release_at_caption:captionStart,leaves_gone_by:23,timeline_changed:false,camera_changed:false,caption_text_changed:false,silent_only:true},null,2)+'\n');
console.log('Built v31: seven original bridge leaves land in the town and blow away at the 21.5s caption. Single hero leaf removed.');
