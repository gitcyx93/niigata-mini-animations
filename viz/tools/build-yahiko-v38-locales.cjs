// Reuses the repository's OpenCC + Fontsource localisation approach; never rewrites the approved Chinese source.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {Converter}=require('opencc-js'),convert=Converter({from:'cn',to:'twp'});
const root=path.resolve(__dirname,'../..'),file=path.join(root,'viz/autumn/yahiko-v38.html');
const source=fs.readFileSync(file,'utf8'),fontMarker=/\/\*FONTS-START[\s\S]*?\/\*FONTS-END\*\//;
function traditionalFonts(html){const sandbox={};vm.runInNewContext(source.match(fontMarker)[0]+';this.faces=FONT_DATA;',sandbox,{timeout:2000});const faces=Array.from(sandbox.faces).filter(f=>f[0]==='Sora').map(f=>Array.from(f));const chars=new Set([...html.replace(fontMarker,'')].map(c=>c.codePointAt(0)));const css=require.resolve('@fontsource-variable/noto-sans-tc/wght.css');for(const m of fs.readFileSync(css,'utf8').matchAll(/@font-face\s*\{([\s\S]*?)\}/g)){const range=m[1].match(/unicode-range:\s*([^;]+)/)?.[1],url=m[1].match(/url\(([^)]+)\)/)?.[1];if(!range||!url)continue;const ranges=range.split(',').map(r=>r.trim().replace(/^U\+/i,'').split('-').map(v=>parseInt(v,16)));if(![...chars].some(c=>ranges.some(([a,b=a])=>c>=a&&c<=b)))continue;faces.push(['Source Han Sans TC','100 900',range,fs.readFileSync(path.resolve(path.dirname(css),url.replace(/^['"]|['"]$/g,''))).toString('base64')]);}assert(faces.some(f=>f[0]==='Source Han Sans TC'));return html.replace(fontMarker,()=> '/*FONTS-START Source Han Sans TC|Sora*/\nconst FONT_DATA = '+JSON.stringify(faces)+';\n/*FONTS-END*/');}
let tw=source.replace(fontMarker,'__FONT_BLOCK__');tw=convert(tw).replace('__FONT_BLOCK__',source.match(fontMarker)[0]);
for(const [a,b]of [['lang="zh-CN"','lang="zh-TW"'],['Source Han Sans SC','Source Han Sans TC'],['Noto Sans SC','Noto Sans TC'],['PingFang SC','PingFang TC'],['Microsoft YaHei','Microsoft JhengHei'],['坐電車','搭電車'],['坐纜車','搭纜車'],['634 米','634 公尺']])tw=tw.split(a).join(b);
tw=traditionalFonts(tw);
let en=source.replace('lang="zh-CN"','lang="en"');
const start=en.indexOf('const STORY_C='),end=en.indexOf('// ======== Claude v2',start);assert(start>=0&&end>start);let captions=en.slice(start,end);
const translations={
 '红叶最好看在 11 月上中旬。':'Best colour: early–mid November.',
 '新潟坐电车，在吉田换乘弥彦线。':'From Niigata, change at Yoshida.',
 '新潟到弥彦，约一个半小时。':'About 90 minutes from Niigata.',
 '弥彦山 634 米，和晴空塔一样高。':'634 m high, like Tokyo Skytree.',
 '天晴时，能看到佐渡岛。':'Clear days reveal Sado Island.',
 '神社附近的红叶谷，每晚点灯。':'Autumn evenings light up Momijidani.',
 '下山后，住一晚弥彦温泉。':'Stay the night at Yahiko Onsen.',
 '新潟县弥彦村':'Yahiko Village',"title:'弥彦'":"title:'Yahiko'",
 '看完日落和夜红叶，':'After sunset and autumn lights,','就在神社门前住一晚。':'stay a night in the shrine town.','缆车末班要先查好哦':'Check the last ropeway departure.',
 '上山看海 ':'Sea by day ','入夜看秋':'Autumn by night','新潟 · 弥彦':'Yahiko · Niigata','弥彦公园 ':'Yahiko Park ','红叶谷':'Momijidani','观月桥':'Kangetsukyo Bridge','一之鸟居':'First Torii Gate','弥彦神社':'Yahiko Shrine',
 '山下参拜 ':'Shrine below ','山上看海':'Sea above','十一月，还有菊花祭':'Chrysanthemum Festival in November','缆车 ':'Ropeway: ',' 分钟到山顶':' minutes to the top','走表参道上山 约 90 分钟':'About 90 min on foot via the main trail','上山之后 是':'Above the hills: ',"[['Above the hills: ',0],['海',1]]":"[['Above the hills: ',0],['the sea',1]]",'山顶望向日本海':'Overlooking the Sea of Japan'};
for(const [a,b]of Object.entries(translations))captions=captions.split(a).join(b);
captions=captions.replace('const size=44','const size=40').replace('size:68,weight:300,sp:8,sub:40','size:54,weight:400,sp:1,sub:34');
captions=captions.replaceAll(',60,HL_C.head,300,\'left\',4',',46,HL_C.head,400,\'left\',1').replace(',40,HL_C.key,400,\'left\',2',',34,HL_C.key,400,\'left\',.5');
en=en.slice(0,start)+captions+en.slice(end);
en=en.replace('const latinOnly =',"if(document.documentElement.lang==='en')FONTS.cjk=FONTS.latin;\nconst latinOnly =").replace('800 132px ${FONTS.cjk}','800 108px ${FONTS.cjk}').replace("x.letterSpacing = '6px'","x.letterSpacing = '2px'");
en=en.replace(/<title>[^<]*<\/title>/,'<title>Yahiko | Autumn by the Sea</title>');
const panel=`<aside class="panel"><div class="eyebrow">NIIGATA · AUTUMN / V38</div><h1>Yahiko<br>Sea by day, autumn by night</h1><p class="intro">A shrine in the cedar forest, a ropeway to the sea view,<br>and warm autumn lights after dark.</p><div class="control"><p id="opening-note" hidden></p><div class="buttons"><button id="play">Play</button><button id="restart">Restart</button><button id="watch-end">Watch the ending</button><span id="clock"></span></div><input id="seek" aria-label="Playback time in seconds" type="range" min="0" max="27.79" step=".01" value="0"><div class="chapters">${[[0,'Overview'],[3.2,'Torii'],[6.4,'Shrine'],[9.8,'Ropeway'],[13,'Sunset'],[17,'Autumn lights'],[20.6,'Onsen town']].map(([t,label])=>`<button data-time="${t}" data-legacy="${t}"><small>${t}s</small>${label}</button>`).join('')}</div></div><div class="credit" id="duration-note">Yahiko · 27.8 seconds</div><p class="sources">A stylised journey through Yahiko, Niigata.<br>Ambience only; no background music.</p></aside>`;
en=en.replace(/<aside class="panel">[\s\S]*?<\/aside>/,()=>panel);
const ui={
 '正在准备画面…':'Preparing the animation…','画面加载失败，请重新打开文件。':'Unable to load. Please reopen the page.','您的浏览器不支持画布动画。':'Your browser does not support canvas animation.',
 '有声播放':'Play with sound','暂停动画':'Pause animation','播放动画与环境音':'Play animation with ambience','播放动画':'Play animation','已暂停。':'Paused.','暂停':'Pause','重播':'Replay','播放结束。':'Playback finished.','已暂停；画面与声音使用同一音频时钟。':'Paused. Sound and picture share one clock.','播放中 · 环境音，无背景音乐。':'Playing ambience; no music.','播放':'Play','静音':'Mute','开声音':'Unmute','音量 ':'Volume ','循环':'Loop','环境音播放音量':'Ambience volume','环境音版':'Ambience version','环境音':'Ambience',
 '正式发布版：无配乐，原远处鸟鸣延续到温泉街。海浪、风铃、猫叫、窗框与循环风叶保留；点击有声播放。':'Release version: no music. The original distant birds continue into the onsen town, with surf, chimes, cat, window and wind-leaf sounds.',
 '猫叫：Mike Koenig · CC BY 3.0；索道：concretica · CC BY 4.0；海浪：Luftrum · CC BY 3.0。':'Cat: Mike Koenig · CC BY 3.0; ropeway: concretica · CC BY 4.0; surf: Luftrum · CC BY 3.0. ',
 '音效来源与授权':'Sound credits and licences','音效时间表与分轨试听':'Sound timeline and solo tracks','4秒原声已恢复。先单听下面三层，确定哪一层不对；分轨保留成片音量。':'Solo tracks use the same gain as the finished mix.','音效分轨试听':'Solo sound audition','原底轨：3–6秒':'Original bed: 3–6s','神社风铃':'Shrine chimes','神社树林风':'Forest breeze','只听海景':'Surf only',
 '开场静场（与杉林底音交叠）':'Opening ambience','原杉林环境底轨（含4秒原声）':'Original cedar-forest bed','新增树林风':'Forest breeze layer','自然风铃连响，一段实录、不循环':'One continuous wind-chime recording','缆车空气；9.8–13秒叠轻索道低鸣':'Ropeway air; low mechanism at 9.8–13s','两句鸟鸣':'Two distant bird phrases','轻远海浪，替换原开阔地风声':'Soft distant surf','夜景静场；17.15–20.6秒叠风叶声':'Night ambience and wind in leaves','原小镇单声风铃及尾音':'Town chime and tail','细水、窗框声（随窗扇动作）':'Water and moving window frame','猫叫':'Cat meow','片尾跨循环风叶':'Wind leaves across the loop','延续原远处鸟鸣；全片无配乐':'Original distant birds continue; no music','下一轮1.3秒':'1.3s into the next loop','请点击分轨播放器的播放键':'Press play on the solo audio player.',
 '弥彦 V38 · 环境音与猫叫 · 27.8 秒':'Yahiko V38 · ambience · 27.8 seconds','弥彦 · 画面方案　/　':'Yahiko / ',"+' 秒'":"+' s'",' 秒</td>':' s</td>',' 秒`':' s`',' · 环境音':' · Ambience',
 'ニャッ':'MEOW','ストン':'DIP!'};
for(const [a,b]of Object.entries(ui).sort((a,b)=>b[0].length-a[0].length))en=en.split(a).join(b);
for(const [lang,html]of [['en',en],['tw',tw]]){assert(!html.includes('musicEnabled'));for(const [,js]of html.matchAll(/<script(?![^>]*type=)[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(js);fs.writeFileSync(path.join(root,`viz/autumn/yahiko-v38-${lang}.html`),html);}
console.log('English and Taiwan Traditional Chinese pages built with embedded fonts.');
