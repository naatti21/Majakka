import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import '../scene-geometry.js';
const G=globalThis.MajakkaSceneGeometry;
const root=new URL('../',import.meta.url);
const file=name=>readFileSync(new URL(name,root),'utf8');
const p={id:'n',lat:61.5,lng:23.76,kind:'trial',archetype:'nature'};
test('node sculptures are compact asymmetric polygons, not 50m columns',()=>{
 const v=G.build([p]);
 assert.ok(v.facets.length>=3);
 assert.ok(v.facets.every(f=>f.geometry.type==='Polygon'));
 assert.ok(v.facets.some(f=>f.geometry.coordinates[0].length!==v.facets[0].geometry.coordinates[0].length));
 assert.ok(v.shafts.every(f=>f.properties.height<10));
 assert.ok(v.facets.every(f=>f.properties.height<=24));
 assert.equal(v.targets.length,1);
});
test('awake shards grow, while all public beacons keep the separate touch targets',()=>{
 const sleepy=G.build([p]),awake=G.build([{...p,kind:'awake'}]);
 assert.ok(awake.facets[0].properties.height>sleepy.facets[0].properties.height);
 assert.equal(awake.targets.length,sleepy.targets.length);
});
test('Lumen size classes survive geometry and remain tiny in 2D and 3D',()=>{
 const q=G.build([{id:'grain',lat:61.5,lng:23.76,kind:'lumen',size:'heart'}]);
 assert.equal(q.lumens.length,1);
 assert.equal(q.lumens[0].properties.size,'heart');
 assert.match(file('lumen-world.js'),/personal-spark\.heart::after\{width:4\.5px/);
 assert.match(file('world-3d.html'),/heart',2\.1/);
});
test('every ordinary node can bypass puzzles and the old phase slider is removed',()=>{
 const source=file('living-world.js');
 assert.match(source,/by\('living-spend'\)\.addEventListener\('click',\(\)=>apply\('lumen'\)\)/);
 assert.match(source,/Rotate three conductors/);
 assert.doesNotMatch(source,/Phase lock · align the cyan/);
 assert.doesNotMatch(source,/Untimed visual alternative/);
 assert.match(source,/decodeRewards/);
});
test('3D map transforms vector basemap itself to almost black',()=>{
 const source=file('world-3d.html');
 assert.match(source,/function applyNightPalette\(/);
 assert.match(source,/background-color';color='#04080b'/);
 assert.match(source,/applyNightPalette\(\);/);
 assert.match(source,/fill-extrusion-base':\['coalesce',\['get','base'\],0\]/);
});
