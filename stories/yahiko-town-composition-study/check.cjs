const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
for(const name of ['A-clean','A-text','B-clean','B-text','C-clean','C-text','v24-original']){
 const b=fs.readFileSync(path.join(__dirname,name+'.png'));
 assert.equal(b.subarray(1,4).toString(),'PNG');assert.equal(b.readUInt32BE(16),1080);assert.equal(b.readUInt32BE(20),1920);
}
const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
for(const m of html.matchAll(/(?:src|href)="([^"#]+\.png)"/g))assert(fs.existsSync(path.join(__dirname,m[1])));
assert.equal((html.match(/data-key="/g)||[]).length,3);
for(const f of ['designs.js','compositions.js'])new(require('node:vm').Script)(fs.readFileSync(path.join(__dirname,f),'utf8'));
console.log('PASS: seven 1080x1920 images, gallery links, three compositions, JS syntax.');
