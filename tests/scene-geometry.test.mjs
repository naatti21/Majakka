import {test} from 'node:test';
import assert from 'node:assert/strict';
import '../scene-geometry.js';
const G=globalThis.MajakkaSceneGeometry;
const p={id:'k',lat:61.5,lng:23.76,kind:'quiet'};
test('beacon ground rings close and keep meter-sized radius',()=>{
 const ring=G.circle(p,35).coordinates[0];
 assert.deepEqual(ring[0],ring.at(-1));
 const longitudeRadius=Math.abs(ring[0][0]-p.lng)*111320*Math.cos(p.lat*Math.PI/180);
 assert.ok(Math.abs(longitudeRadius-35)<.06);
});
test('longitude scale accounts for latitude',()=>{
 const tropic=G.circle({lat:0,lng:0},40);
 const north=G.circle({lat:65,lng:0},40);
 assert.ok(north.coordinates[0][0][0]>tropic.coordinates[0][0][0]);
});
test('node layers use map units and separate click targets',()=>{
 const e=G.build([p,{id:'l',lat:61.5002,lng:23.7602,kind:'lumen'}]);
 assert.equal(e.ground.length,2);assert.equal(e.shafts.length,2);
 assert.equal(e.cores.length,1);assert.equal(e.targets.length,1);assert.equal(e.lumens.length,1);
 assert.equal(e.shafts[0].geometry.type,'Polygon');
 assert.equal(e.targets[0].geometry.type,'Point');
});
test('awakening grows the real map-height rather than a CSS pixel size',()=>{
 const quiet=G.build([p]).shafts[0].properties.height;
 const awake=G.build([{...p,kind:'awake'}]).shafts[0].properties.height;
 assert.ok(awake>quiet);
});
test('trial lights are distinguishable from public nodes',()=>{
 const e=G.build([{...p,id:'trial-0',kind:'trial'}, {...p,id:'player',kind:'player'}]);
 assert.equal(e.targets[0].properties.id,'trial-0');
 assert.equal(e.targets[1].properties.id,'player');
 assert.ok(e.shafts.length>=4);
});
test('bad geometry gets rejected',()=>{
 assert.throws(()=>G.circle({lat:0,lng:0},-5));
 assert.throws(()=>G.circle({lat:NaN,lng:0},5));
});
