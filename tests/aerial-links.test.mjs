import {test} from 'node:test';
import assert from 'node:assert/strict';
import '../aerial-links.js';
const A=globalThis.MajakkaAerialLinks;
const a={lat:62.241,lng:25.75},b={lat:62.243,lng:25.754};
test('threads are real 3D polygons suspended above ground',()=>{
 const m=A.build([[a,b]]);assert.equal(m.core.length,16);assert.equal(m.halo.length,16);
 for(const f of [...m.core,...m.halo]){
  assert.equal(f.geometry.type,'Polygon');
  assert.ok(f.properties.base>0);
  assert.ok(f.properties.height>f.properties.base);
  const p=f.geometry.coordinates[0];assert.deepEqual(p[0],p.at(-1));
 }
});
test('natural aerial arch rises between two beacon tops',()=>{
 const hs=A.build([[a,b]]).core.map(x=>x.properties.height);
 assert.ok(hs[7]>hs[0]);assert.ok(hs[8]>hs.at(-1));
 assert.ok(hs[0]>45);
});
test('invalid and excessive distances do not generate world-scale beams',()=>{
 assert.equal(A.build([[a,a]]).core.length,0);
 assert.equal(A.build([[a,{lat:65,lng:25}]]).core.length,0);
});
test('all three chosen links form bounded geometry',()=>{
 const c={lat:62.242,lng:25.755};
 const result=A.build([[a,b],[b,c],[c,a]]);
 assert.equal(result.core.length,48);assert.equal(result.halo.length,48);
});
