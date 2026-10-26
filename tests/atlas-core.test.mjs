import {test} from 'node:test';
import assert from 'node:assert/strict';
import '../atlas-core.js';
const A=globalThis.MajakkaAtlasCore,c={lat:61.4984,lng:23.7623};
const p=(north,east,t,i,extra={})=>({id:i,lat:c.lat+north/111320,lng:c.lng+east/(111320*Math.cos(c.lat*Math.PI/180)),source:'osm',tags:{...(t==='art'?{tourism:'artwork'}:t==='history'?{historic:'memorial'}:t==='nature'?{leisure:'park'}:{amenity:'library'}),...extra}});
const themes=['art','history','nature','culture'];
test('Deterministic global Echo lattice keeps sparse areas alive and safe',()=>{
 for(const lat of [0,40,61.5,78]){
  const ctr={lat,lng:24.5};
  const a=A.place(ctr,[]),b=A.place(ctr,[]);
  assert.deepEqual(a,b);
  assert.equal(a.echoes.length,6);
  for(const [i,x] of a.echoes.entries()){
   assert.ok(A.meters(x,ctr)<=1000);
   for(const other of a.echoes.slice(0,i))assert.ok(A.meters(x,other)>=125);
   assert.equal(x.remoteOnly,true);
  }
 }
 const a=A.place(c,[]).echoes,b=A.place({lat:c.lat+.0001,lng:c.lng+.0001},[]).echoes;
 assert.ok(a.some(x=>b.some(y=>x.id===y.id&&x.lat===y.lat&&x.lng===y.lng)));
});
test('At most 24 real nodes, at least 125m apart, balanced among the four families',()=>{
 const raw=[];let i=0;
 for(let n=-800;n<=800;n+=200)for(let e=-800;e<=800;e+=200)raw.push(p(n,e,themes[i++%4],i));
 const r=A.place(c,raw);
 assert.equal(r.real.length,24);
 assert.deepEqual(themes.map(t=>r.real.filter(x=>x.type===t).length),[6,6,6,6]);
 for(const [j,x] of r.real.entries()){
  assert.ok(A.meters(x,c)<=1000);
  assert.ok(r.real.slice(0,j).every(y=>A.meters(x,y)>=125));
  assert.equal(x.remoteOnly,true);
 }
 assert.deepEqual(A.place(c,raw),r);
});
test('Restricted, private, school and unstable points excluded even when named',()=>{
 const raw=[
  p(150,0,'art','a',{access:'private'}),
  p(150,200,'history','b',{military:'bunker'}),
  p(150,400,'nature','d',{access:'restricted'}),
  p(150,600,'history','e',{amenity:'school'}),
  p(150,800,'nature','f',{location:'underground'}),
  p(400,200,'culture','g',{access:'yes'}),
  p(400,200,'culture','g',{access:'yes'})
 ];
 const r=A.place(c,raw);assert.equal(r.real.length,1);assert.equal(r.real[0].sourceId,'g');
 assert.equal(r.real[0].remoteOnly,true);
});
test('A physically short distance is not sufficient to call a place safe to walk to',()=>{
 const item=A.normalize({id:'osm/7',lat:c.lat,lng:c.lng,name:'Public sculpture',tags:{tourism:'artwork',access:'yes'}});
 assert.equal(item.remoteOnly,true);
 assert.equal(A.normalize({id:'osm/8',lat:c.lat,lng:c.lng,tags:{tourism:'artwork',access:'private'}}),null);
});
