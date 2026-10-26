import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import '../lumen-core.js';
import '../atlas-core.js';
const L=globalThis.MajakkaLumenCore,A=globalThis.MajakkaAtlasCore;
const seed='majakka-global-world-lumen-v1';
const at={lat:61.5,lng:23.7};
const src=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
test('Lumen grains cover a stable rectangular world viewport instead of a 1km camera cloud',()=>{
 const low=L.visibleField(at,seed,{zoom:12,width:390,height:1100,max:190});
 assert.ok(low.length>=15&&low.length<=190);
 const ys=low.map(p=>L.merc(p).y);
 const xs=low.map(p=>L.merc(p).x);
 assert.ok(Math.max(...ys)-Math.min(...ys)>10000,'Vertical footprint must expand with low zoom');
 assert.ok(Math.max(...xs)-Math.min(...xs)>3000,'Horizontal footprint must fill geography');
 const centre=L.merc(at),halves=[
  low.filter(p=>p.y<centre.y).length,low.filter(p=>p.y>=centre.y).length,
  low.filter(p=>p.x<centre.x).length,low.filter(p=>p.x>=centre.x).length
 ];
 assert.ok(halves.every(x=>x>=5),'Grains must cover each side of the view');
});
test('panning does not respawn existing global Lumen points',()=>{
 const a=L.visibleField(at,seed,{zoom:13,width:390,height:1100});
 const b=L.visibleField({lat:at.lat+.001,lng:at.lng+.001},seed,{zoom:13,width:390,height:1100});
 const byId=new Map(b.map(p=>[p.id,p]));
 const matches=a.filter(p=>byId.has(p.id));
 assert.ok(matches.length>=a.length*.65,'Small camera movements should retain most grains');
 for(const p of matches){const q=byId.get(p.id);assert.equal(q.lat,p.lat);assert.equal(q.lng,p.lng);}
});
test('Zoomed-out Lumen points remain the same real grains when zooming closer',()=>{
 const far=L.visibleField(at,seed,{zoom:13,width:390,height:1100,max:190});
 const near=L.visibleField(at,seed,{zoom:14,width:1500,height:2300,max:240});
 const byId=new Map(near.map(p=>[p.id,p]));
 assert.ok(far.length>20);
 for(const p of far){
  const q=byId.get(p.id);
  assert.ok(q,'Far-zoom grain must persist in the closer field');
  assert.equal(q.lat,p.lat);assert.equal(q.lng,p.lng);
 }
});
test('Every visible grain uses the same physical cell ID as the shared worldwide collection field',()=>{
 const grains=L.visibleField(at,seed,{zoom:14,width:390,height:1100});
 for(const p of grains.slice(0,12)){
  const inCell=L.cells(p,seed,200);
  assert.ok(inCell.some(q=>q.id===p.id&&q.lat===p.lat&&q.lng===p.lng),'LOD points must be existing fixed-world grains');
 }
});
test('2D and 3D request zoom/viewport-aware Lumen instead of camera-centred circle',()=>{
 const world=src('lumen-world.js'),perspective=src('perspective.js'),scene=src('world-3d.html');
 assert.match(world,/Core\.visibleField\(center,seed,/);
 assert.doesNotMatch(world,/Core\.cells\(center,seed,990\)/);
 assert.match(perspective,/zoom:Number\.isFinite\(cameraZoom\)/);
 assert.match(scene,/zoom:map\.getZoom\(\)/);
});
test('Landmark nodes are auto-discovered per fixed place cell with caching, never simulated Echo filling',()=>{
 const atlas=src('atlas-world.js');
 assert.match(atlas,/scheduleSites\(600\)/);
 assert.match(atlas,/majakka:camera-area/);
 assert.match(atlas,/majakka-place-catalog-cache-v1/);
 assert.match(atlas,/overpass\.private\.coffee/);
 assert.match(atlas,/const catalogue=new Map\(\)/);
 assert.match(atlas,/catalogue\.values\(\)/);
 assert.match(atlas,/for\(const p of eligible\)catalogue\.set\(p\.id,p\)/);
 assert.deepEqual(A.landmarks(at,[]),[]);
});
