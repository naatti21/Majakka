import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {build,pedestrianEntrance} from '../tools/world/import.mjs';
import {catalogClient,overlaps} from '../world/catalog.mjs';
import {initial,reduce,motionSession,reach,validate} from '../world/player.mjs';
import reviews from '../tools/world/access-reviews.json' with {type:'json'};
const way=(id,lng,tags={leisure:'park'})=>({id,type:'way',tags:{name:'Test '+id,...tags},geometry:[{lat:61.5,lon:lng}]});
const location={lat:61.5,lng:23.76};
const node={id:'test',mode:'walkup',location};
const clock=100000;
const gps=(meters,t,accuracy=4)=>({lat:location.lat+meters/111200,lng:location.lng,time:t,accuracy,speed:1.3});
test('empty, single and three candidates; duplicates, order, exclusions and redaction',()=>{
 for(const count of [0,1,3]){
  const rows=Array.from({length:count},(_,i)=>way(i+1,23.75+i*.008));
  const a=build(rows).data.tampere;
  assert.equal(a.length,count);
  assert.deepEqual(build(rows.toReversed()).data.tampere,a);
  if(count)assert.deepEqual(build([...rows,rows[0]]).data.tampere,a);
  for(const n of a){assert.equal(n.mode,'remote');assert(!/lat|lng|coordinate/.test(JSON.stringify(Object.keys(n))));assert(!('location' in n));}
 }
 for(const t of [{access:'private'},{landuse:'military'},{amenity:'school'},{waterway:'river'},{railway:'platform'}])
  assert.deepEqual(build([way(1,23.76,{leisure:'park',...t})]).data.tampere,[]);
});
test('three-way entrance joint and independent, revision-bound review; alias and removal',()=>{
 const p=way(1528781437,23.76,{name:'Vanhankirkonpuisto',leisure:'park'}),f=way(71464310,23.76,{highway:'footway'}),q=way(1528794859,23.76,{highway:'pedestrian'});
 const features=[p,f,q],ways=new Map(features.map(w=>[w.id,w]));
 assert.deepEqual(pedestrianEntrance(ways,reviews[0]),location);
 assert.equal(build(features).data.tampere[0].aliases[0].namespace,'tampere');
 assert.equal(build([p,f]).data.tampere[0].mode,'remote');
 assert.equal(build(features,[],{omitIds:['osm:way/1528781437']}).data.tampere.length,0);
 f.tags.access='private';assert.equal(pedestrianEntrance(ways,reviews[0]),null);
});
test('published source-backed three-region chunks and overlap/cache',async()=>{
 const requests=[];
 const load=catalogClient(async(path)=>{requests.push(path);return {ok:true,json:async()=>JSON.parse(await readFile(new URL('../world/'+path,import.meta.url)))};});
 const a=await load([23,61,25,63]);
 assert.equal(a.records.length,7);assert.equal(a.records.filter(n=>n.location).length,1);
 const mapped=a.records.find(n=>n.location);assert.equal(mapped.id,'osm:way/1528781437');
 const b=await load([23.75,61.49,23.77,61.51]);assert.deepEqual(b.records.find(n=>n.location),mapped);
 assert.equal(requests.length,4);assert.deepEqual((await load([-80,10,-70,20])).records,[]);
 assert(overlaps([179,-5,-179,5],[-179.8,-2,-179.6,2]));
});
test('GPS freshness, uncertainty margin, speed, jitter and replay-safe movement wallet',()=>{
 assert(reach(gps(144,clock),node,clock));assert(!reach(gps(149,clock),node,clock));
 assert(!reach(gps(0,clock,75),node,clock));assert(!reach(gps(0,clock),node,clock+20001));
 const m=motionSession();let wallet=initial(),gain=0;
 for(let i=0;i<=6;i++){
  const fix=gps(i*18,clock+i*15000);const step=m.sample(fix,fix.time);assert(step.accepted);
  if(step.gain){gain+=step.gain;const a={kind:'Movement',time:fix.time,gain:step.gain};
   wallet=reduce(wallet,a,fix.time);assert.deepEqual(reduce(wallet,a,fix.time),wallet);}
 }
 assert.equal(gain,1);assert.equal(wallet.wallet.balance,9);
 assert(!m.sample(gps(900,clock+92000),clock+92000).accepted);
 assert(!m.sample({...gps(110,clock+95000),speed:20},clock+95000).accepted);
 m.clear();assert.equal(m.sample(gps(500,clock+100000),clock+100000).gain,0);
 assert(!JSON.stringify(wallet).includes('lat'));
});
test('local survey, research and wallet have independent receipts and no graph effects',()=>{
 let s=reduce(initial(),{kind:'NodeAction',mode:'study',node,evidence:'walkup'},clock);
 assert.deepEqual(s.studies,['test']);assert.equal(s.wallet.balance,8);
 assert.throws(()=>reduce(s,{kind:'NodeAction',mode:'visit',node},clock));
 s=reduce(s,{kind:'NodeAction',mode:'visit',node,fix:gps(0,clock)},clock);
 assert.deepEqual(s.visits,['test']);s=reduce(s,{kind:'Channel'},clock);
 assert.throws(()=>reduce(s,{kind:'Channel'},clock+1));assert.throws(()=>validate({...s,schema:9}));
});


test('obsolete viewport results cannot replace a later region',async()=>{
 let resume;
 const regions=[{id:'a',file:'a',bounds:[1,1,2,2]},{id:'b',file:'b',bounds:[3,3,4,4]}];
 const load=catalogClient(async(path)=>{
  if(path.endsWith('manifest.json'))return {ok:true,json:async()=>({version:'test',regions})};
  if(path.endsWith('/a'))await new Promise(r=>{resume=r;});
  return {ok:true,json:async()=>[]};
 });
 const first=load(regions[0].bounds);
 while(!resume)await new Promise(resolve=>setTimeout(resolve,0));
 assert.equal((await load(regions[1].bounds)).areas[0].id,'b');
 resume();await assert.rejects(first);
});
