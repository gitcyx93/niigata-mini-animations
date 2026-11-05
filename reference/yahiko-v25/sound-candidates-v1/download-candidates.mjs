import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const picks=[['501168','01-wind-chime','furin','ayustat2001','首选：小镇转场约20.4–21.5秒；短风铃，保留自然尾音。'],['575645','02-leaves','leaves','Garuda1982','首选：17–20.6秒落叶；选柔和阵风，须试听确认无杂声。'],['349076','03-water','trickling-stream','Yoyodaman234','暂选：20.6–24.6秒温泉；描述提到附近急流，须确认底噪不过强。'],['257468','04-footsteps','gravel-steps','mlsulli','步行镜头3.2–9.8秒备选；只取1–2步，片尾不用。'],['240532','05-ropeway','ropeway','concretica','真实索道录音备选：9.8–13秒；尚未确认是否足够低稳，不能视为最终推荐。']];
const manifest={status:'downloaded_candidates_not_auditioned',files:[],errors:[],notes:['公开预览，不是登录后原件；未混音、未修改动画。','来源描述筛选，未完成听感验收；波形不等于声音内容鉴定。']};
function audioSignature(b){return b.subarray(0,3).toString()==='ID3'||(b[0]===255&&(b[1]&224)===224);}
assert(audioSignature(Buffer.from([255,251,144,0])));assert(!audioSignature(Buffer.from('<html>')));
for(const [id,category,slug,author,use] of picks){try{
 const html=fs.readFileSync('source-pages/'+id+'.html','utf8');
 const url=html.match(/data-mp3="([^"]+)"/)?.[1];
 const licenseUrl=html.match(/href="([^"]*creativecommons[^\"]*)"/)?.[1];
 assert(url?.startsWith('https://cdn.freesound.org/previews/'));assert(licenseUrl&&(/publicdomain\/zero|licenses\/by\//.test(licenseUrl)));
 const path=`${category}/${id}-${slug}-preview.mp3`;
 assert(!fs.existsSync(path),'Will not overwrite '+path);
 execFileSync('curl',['-fL','--retry','2','--max-time','60',url,'-o',path],{stdio:'pipe'});
 const b=fs.readFileSync(path);assert(b.length>1024&&audioSignature(b),'Not an MP3');
 manifest.files.push({local_file:path,category,author,source_page:`https://freesound.org/people/${encodeURIComponent(author)}/sounds/${id}/`,direct_download_url:url,license:licenseUrl.includes('/zero/')?'CC0 1.0':'CC BY 4.0',license_url:licenseUrl,is_preview:true,format:'MP3',size_bytes:b.length,source_duration_seconds:Number(html.match(/data-duration="([^"]+)"/)?.[1])||null,duration_note:'来源页面标注的声音时长；预览解码时长尚未核对',recommended_use:use,quality_status:'依据作者描述初筛，未试听',signature_check:'MP3 signature verified once'});
 console.log('Downloaded',path,b.length);
 }catch(e){manifest.errors.push({id,error:e.message});console.error(id,e.message)}
 fs.writeFileSync('manifest.json',JSON.stringify(manifest,null,2));
}
const categories=picks.map(p=>p[1]);
fs.writeFileSync('DONE.json',JSON.stringify({status:manifest.errors.length?'partial_download':'download_complete_pending_audio_review',successful_file_count:manifest.files.length,category_counts:Object.fromEntries(categories.map(c=>[c,manifest.files.filter(f=>f.category===c).length])),unfinished:['未完成试听、波形检查及后续裁切处理','细流水是否受附近急流干扰、索道声是否适合低稳底音待确认',...manifest.errors.map(e=>e.id+': '+e.error)]},null,2));
