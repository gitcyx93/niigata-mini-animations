"""Colour-only V54: stronger orange accents and orange torii heading/subtitle."""
from pathlib import Path
import re,hashlib,json
R=Path(__file__).resolve().parents[2]
old=(R/'viz/autumn/yahiko-v53-fx.js').read_text(encoding='utf8');new=(R/'viz/autumn/yahiko-v54-fx.js').read_text(encoding='utf8')
expected=old.replace('const HL42={size:74',"HL_C.key='#ed8b2f'; // V54：强调字改为饱和橙色，不改左上旁白。\nconst HL42={size:74",1).replace("if(sub)text(sub,W/2,HL42.y2,HL42.sub,HL42.subCol,HL42.subW,'center',HL42.subSp);","if(sub)text(sub,W/2,HL42.y2,HL42.sub,segs.some(([q])=>q==='一之鸟居')?HL_C.key:HL42.subCol,HL42.subW,'center',HL42.subSp);",1).replace("headlineC(sc41(N,3.6,5.85),[['一之鸟居',0]],'弥彦神社');   // 压在很亮的晨雾上，用白色","headlineC(sc41(N,3.6,5.85),[['一之鸟居',1]],'弥彦神社');   // V54：鸟居标题与小字均为橙色",1)
assert new==expected,'Unrequested FX changes'
page=(R/'viz/autumn/yahiko-v53-zh.html').read_text(encoding='utf8');assert page.count(old)==1
before=re.search(r'<script id="yahiko-audio-data"[^>]*>(.*?)</script>',page,re.S)[1]
page=page.replace(old,new,1).replace('V53','V54').replace('中文发布版：已认可的B式音效与Reverie配乐，风铃轻降2dB。温泉街两句文字已互换位置，其他画面与声音保持。','中文发布版：沿用已认可声音，只加深橙色强调字，鸟居标题与小字也使用橙色。其他内容不动。')
after=re.search(r'<script id="yahiko-audio-data"[^>]*>(.*?)</script>',page,re.S)[1];assert before==after
(R/'viz/autumn/yahiko-v54-zh.html').write_text(page,encoding='utf8')
print(json.dumps({'accent':'#ed8b2f','torii_title_and_subtitle':'orange','audio_data_unchanged':True,'audio_sha256':hashlib.sha256(before.encode()).hexdigest()},ensure_ascii=False))
