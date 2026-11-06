const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../autumn');
const routes={'/':['yahiko-v38.html','text/html; charset=utf-8'],'/yahiko':['yahiko-v38.html','text/html; charset=utf-8'],'/audio/yahiko-v38/master.wav':['audio/yahiko-v38/master.wav','audio/wav'],'/audio/yahiko-v38/LICENSES.md':['audio/yahiko-v38/LICENSES.md','text/plain; charset=utf-8']};
for(const name of ['effects.wav','music.wav','audition-base-3-6.wav','audition-shrine-chime.wav','audition-shrine-wind.wav'])routes['/audio/yahiko-v38/'+name]=['audio/yahiko-v38/'+name,'audio/wav'];
http.createServer((req,res)=>{
 const item=routes[req.url.split('?')[0]];if(!item){res.writeHead(404);return res.end('Not found');}
 const file=path.join(root,item[0]);fs.stat(file,(error,stat)=>{
  if(error){res.writeHead(503);return res.end('Preview unavailable');}
  let start=0,end=stat.size-1,status=200;
  if(req.headers.range){const m=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range);if(!m){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});return res.end();}start=Number(m[1]);end=m[2]?Math.min(Number(m[2]),end):end;if(start>end||!Number.isSafeInteger(start)){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});return res.end();}status=206;}
  const headers={'Content-Type':item[1],'Cache-Control':'no-store','Accept-Ranges':'bytes','Content-Length':end-start+1};if(status===206)headers['Content-Range']=`bytes ${start}-${end}/${stat.size}`;
  res.writeHead(status,headers);if(req.method==='HEAD')return res.end();fs.createReadStream(file,{start,end}).on('error',()=>res.destroy()).pipe(res);
 });
}).listen(8941,'127.0.0.1',()=>console.log('http://127.0.0.1:8941/yahiko'));
