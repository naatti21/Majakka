import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';

const folder='experiments/node-network-v072/';
const strand=readFileSync(folder+'organic-strand.js','utf8');
const world=readFileSync(folder+'network-world.js','utf8');
const html=readFileSync(folder+'index.html','utf8');
const previous=readFileSync('experiments/node-network-v071/organic-strand.js','utf8');
const strip=s=>s.replace(/^\s*import .*?;\s*$/gm,'').replace(/^\s*export /gm,'');

test('v0.7.2 modules and inline mobile controls parse',()=>{
 const ui=html.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];
 assert.ok(ui);
 for(const js of [strand,world,ui])new Script(strip(js));
 assert.match(html,/network-world\.js\?v=074/);
 assert.match(world,/organic-strand\.js\?v=073/);
});

test('the liked organic shell and path are identical to v0.7.1',()=>{
 const section=(source,begin,end)=>source.slice(source.indexOf(begin),source.indexOf(end));
 for(const [begin,end] of [
   ['function makeMembraneGeometry','function makePath'],
   ['function makePath','export function buildOrganicStrand'],
 ]){
   assert.ok(previous.includes(begin)&&strand.includes(begin));
   assert.equal(section(strand,begin,end),section(previous,begin,end));
 }
 assert.match(strand,/roughnessMap:materialMaps\.roughnessMap/);
 assert.match(strand,/bumpMap:materialMaps\.bumpMap/);
});

test('remove ONLY the extra serpentine inner ribbons and keep faint main core',()=>{
 assert.match(previous,/const filaments=\[\]/);
 assert.doesNotMatch(strand,/const filaments=\[\]|filaments\[|new THREE\.CatmullRomCurve3\(path\)/);
 assert.match(strand,/const inner=new THREE\.Mesh\(/);
 assert.match(strand,/const fadeMeshes=\[membrane,inner\]/);
 assert.match(strand,/return \{group,curve,membrane,inner,particles,update,dispose\}/);
});

test('more and brighter particles with constant screen-space size when zooming',()=>{
 assert.match(strand,/const MAX_PARTICLES=34/);
 assert.match(strand,/Object\.freeze\(\{low:12,medium:22,high:34\}\)/);
 assert.match(strand,/size:4\.0,sizeAttenuation:false/);
 assert.match(strand,/material\.opacity=\.92\*level/);
 assert.match(strand,/brightness=\.76\+\.23/);
 assert.match(strand,/\.lerp\(warmWhite,\.50\)/);
 assert.match(strand,/geometry\.setDrawRange\(0,count\)/);
 assert.match(world,/createRadialGradient\(16,16,0,16,16,16\)/);
 assert.match(strand,/new THREE\.Points\(geometry,material\)/);
 assert.doesNotMatch(strand,/SphereGeometry\(/);
});

test('lightweight cached curve samples: no arc-length search inside every frame',()=>{
 assert.match(strand,/const sampledCurve=Array\.from\(\{length:257\}/);
 assert.match(strand,/tmp\.copy\(sampledCurve\[i0\]\)\.lerp\(sampledCurve\[i0\+1\],arcT-i0\)/);
 assert.match(strand,/positionsAttr\.setUsage\(THREE\.DynamicDrawUsage\)/);
 assert.match(strand,/colorsAttr\.setUsage\(THREE\.DynamicDrawUsage\)/);
 assert.match(strand,/positionsAttr\.needsUpdate=true/);
 assert.match(strand,/colorsAttr\.needsUpdate=true/);
 assert.doesNotMatch(strand,/requestAnimationFrame/);
});

test('three Node links, staged network and map depth still function',()=>{
 for(const id of ['relay','grove','prism'])assert.match(world,new RegExp("id:'"+id+"'"));
 for(const edge of ['from:0,to:1','from:0,to:2','from:1,to:2'])assert.ok(world.includes(edge));
 for(const n of [0,1,2,3])assert.match(html,new RegExp('id="stage-'+n+'"'));
 assert.match(world,/edge\.organic\.update\(elapsed,level,quality,movementReduced\)/);
 assert.match(world,/this\.renderer\.clearDepth\(\)/);
 assert.match(world,/this\.particleSprite\?\.dispose\(\)/);
 assert.match(world,/this\.membraneMaps\?\.dispose\(\)/);
 assert.match(html,/Vertaa v0\.7\.1/);
 assert.doesNotMatch(html+world,/navigator\.geolocation|watchPosition|getCurrentPosition|localStorage/);
});
