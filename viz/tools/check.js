#!/usr/bin/env node
'use strict';
// Compatibility entry point; inspection and browser startup share the current tools.
const fs = require('node:fs'), path = require('node:path');
const {spawnSync} = require('node:child_process');
const {ROOT} = require('./lib/catalog.cjs');
const {launchBrowser, openAnimation, assertNoPageErrors} = require('./lib/browser.cjs');

(async () => {
  const args=process.argv.slice(2), options={};
  if (!args.length || args.includes('--help')) {
    console.log('Usage: node viz/tools/check.js <page.html> [--strip output/frames.png] [--at 0,4,12] [--compare old.html]');
    if (!args.length) process.exitCode=1;
    return;
  }
  const file=path.resolve(args.shift());
  for(let i=0;i<args.length;i++) {
    if (!['--strip','--at','--compare'].includes(args[i]) || !args[i+1] || args[i+1].startsWith('--')) throw Error('Invalid option: '+args[i]);
    options[args[i].slice(2)]=args[++i];
  }
  const report=path.join(ROOT,'output/checks',path.basename(file,'.html')+'-inspection.json');
  const forwarded=[path.join(__dirname,'inspect-animation.cjs'),file,'--out',report];
  if(options.at) forwarded.push('--times',options.at);
  if(options.compare) forwarded.push('--compare',options.compare);
  const result=spawnSync(process.execPath,forwarded,{stdio:'inherit'});
  if(result.error) throw result.error;
  if(result.status!==0) {process.exitCode=result.status||1;return;}
  if(!options.strip) return;
  const output=path.resolve(options.strip);
  if(path.extname(output)!=='.png') throw Error('--strip must end in .png');
  if(output.startsWith(ROOT+path.sep)&&!output.startsWith(path.join(ROOT,'output')+path.sep)) throw Error('Save generated images under output/');
  const browser=await launchBrowser({pixelStable:true});
  let opened;
  try {
    opened=await openAnimation(browser,file);
    const {page,metadata,errors}=opened;
    const png=await page.evaluate(duration=>{
      const source=document.getElementById('c'),count=Math.ceil(duration/.5),columns=10,w=216,h=Math.round(w*source.height/source.width);
      const canvas=document.createElement('canvas');canvas.width=columns*w;canvas.height=Math.ceil(count/columns)*(h+24);
      const context=canvas.getContext('2d');context.fillStyle='#08090f';context.fillRect(0,0,canvas.width,canvas.height);context.font='16px sans-serif';
      for(let i=0;i<count;i++) {window.render(i*.5);const x=i%columns*w,y=Math.floor(i/columns)*(h+24);context.drawImage(source,x,y+24,w,h);context.fillStyle='#dde4f0';context.fillText(i*.5+'s',x+6,y+17);}
      return canvas.toDataURL('image/png').split(',')[1];
    },metadata.duration);
    assertNoPageErrors(errors);
    fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,Buffer.from(png,'base64'));
    for(const text of (options.at||'').split(',').filter(Boolean)) {
      const time=Number(text);
      if(!Number.isFinite(time)||time<0||time>=metadata.duration) throw Error('Invalid sample time: '+text);
      await page.evaluate(t=>window.render(t),time);
      await page.locator('#c').screenshot({path:output.slice(0,-4)+'-'+time+'.png'});
    }
    assertNoPageErrors(errors);
    console.log(output);
  } finally {if(opened)await opened.context.close();await browser.close();}
})().catch(error=>{console.error(error.message);process.exitCode=1;});
