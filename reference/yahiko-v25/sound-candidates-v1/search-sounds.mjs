import fs from 'node:fs/promises';
const queries = ['wind leaves rustling','small stream trickle','footsteps gravel slow','ropeway','cable car motor'];
await Promise.allSettled(queries.map(async q => {
 const r=await fetch('https://freesound.org/search/?q='+encodeURIComponent(q),{signal:AbortSignal.timeout(40000)}); if(!r.ok)throw Error(r.status);
 const s=await r.text(); await fs.writeFile('source-pages/search-'+q.replaceAll(' ','-')+'.html',s,{flag:'wx'});
 const matches=[...s.matchAll(/<h5[^>]*><a[^>]*href="([^"]+)"[^>]*title="([^"]+)"/g)].slice(0,12);
 console.log(q, JSON.stringify(matches.map(m=>({url:m[1],title:m[2]}))));
}));
