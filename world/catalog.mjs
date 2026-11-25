export function overlaps([w,s,e,n], [a,b,c,d]){
 if(n<b||s>d)return false;
 if(e-w>=360)return true;
 while(e<w)e+=360;
 const shift=360*Math.floor((w-a)/360);
 return [shift,shift+360].some(k=>e>=a+k&&w<=c+k);
}
export function catalogClient(fetcher=fetch){
 let manifest,controller;
 const cache=new Map();
 async function json(path,signal){
  const response=await fetcher(path,{signal});
  if(!response.ok)throw Error('Catalog unavailable.');
  return response.json();
 }
 return async function load(bounds){
  controller?.abort();controller=new AbortController();
  const {signal}=controller;
  if(!manifest){const result=await json('./data/manifest.json',signal);signal.throwIfAborted();manifest=result;}
  const areas=manifest.regions.filter(r=>overlaps(bounds,r.bounds)),nodes=new Map();
  async function region(r){
   if(!cache.has(r.file)){
    const records=await json('./data/'+r.file,signal);signal.throwIfAborted();
    for(const p of records){
     if(!p.id||!p.name||!['walkup','remote'].includes(p.mode)||(p.mode==='remote'?'location' in p:
      !Number.isFinite(p.location?.lat)||!Number.isFinite(p.location?.lng)||!p.review))throw Error('Invalid regional catalog.');
    }
    cache.set(r.file,records);
   }
   for(const p of cache.get(r.file))nodes.set(p.id,p);
  }
  for(let i=0;i<areas.length;i+=2)await Promise.all(areas.slice(i,i+2).map(region));
  signal.throwIfAborted();
  return {version:manifest.version,areas,records:[...nodes.values()]};
 };
}
