import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';

const folder='experiments/node-network-v08/';
const flow=readFileSync(folder+'organic-strand.js','utf8');
const fog=readFileSync(folder+'coverage-mist.js','utf8');
const world=readFileSync(folder+'network-world.js','utf8');
const html=readFileSync(folder+'index.html','utf8');
const previous=readFileSync('experiments/node-network-v072/organic-strand.js','utf8');
const strip=s=>s.replace(/^\s*import .*?;\s*$/gm,'').replace(/^\s*export /gm,'');

test('all v0.8 JavaScript modules and mobile page parse',()=>{
 const inline=html.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];
 assert.ok(inline);
 for(const s of [flow,fog,world,inline])new Script(strip(s));
 assert.match(html,/network-world\.js\?v=081/);
 assert.match(world,/organic-strand\.js\?v=080/);
 assert.match(world,/coverage-mist\.js\?v=081/);
});

test('approved v0.7.2 organic tube and curved path remain literally unchanged',()=>{
 for(const [start,end] of [
  ['function makeMembraneGeometry','function makePath'],
  ['function makePath','export function buildOrganicStrand']
 ]){
  const extract=s=>s.slice(s.indexOf(start),s.indexOf(end));
  assert.equal(extract(flow),extract(previous));
 }
 assert.match(flow,/roughnessMap:materialMaps\.roughnessMap/);
 assert.match(flow,/bumpMap:materialMaps\.bumpMap/);
 assert.doesNotMatch(flow,/const filaments=\[\]/);
});

test('two very short afterglow samples follow particles and disappear at origin',()=>{
 assert.match(flow,/const TRAIL_SAMPLES=2/);
 assert.match(flow,/new Float32Array\(MAX_PARTICLES\*TRAIL_SAMPLES\*3\)/);
 assert.match(flow,/const trailMaterial=new THREE\.PointsMaterial\(/);
 assert.match(flow,/const trails=new THREE\.Points\(trailGeometry,trailMaterial\)/);
 assert.match(flow,/const lag=k===0\?\.014:\.030/);
 assert.match(flow,/if\(tailT>=0\)/);
 assert.match(flow,/trailColors\[p\]=trailColors\[p\+1\]=trailColors\[p\+2\]=0/);
 assert.match(flow,/const dim=k===0\?\.65:\.27/);
 assert.match(flow,/trailMaterial\.opacity=\.34\*level/);
 assert.match(flow,/trails\.visible=particles\.visible&&showTrails/);
 assert.match(flow,/const showTrails=quality!=='low'&&!motionReduced/);
});

test('one extra point-cloud draw call per link, no per-frame objects or textures',()=>{
 assert.match(flow,/trailPositions=new Float32Array/);
 assert.match(flow,/trailColors=new Float32Array/);
 assert.match(flow,/trailPositionAttr\.setUsage\(THREE\.DynamicDrawUsage\)/);
 assert.match(flow,/trailColorAttr\.setUsage\(THREE\.DynamicDrawUsage\)/);
 assert.match(flow,/trailGeometry\.setDrawRange\(0,showTrails\?count\*TRAIL_SAMPLES:0\)/);
 assert.equal([...flow.matchAll(/new THREE\.Points\(/g)].length,2);
 assert.match(flow,/particleCount=Object\.freeze\(\{low:12,medium:22,high:34\}\)/);
 assert.match(flow,/size:5\.5,sizeAttenuation:false/);
 assert.match(flow,/return \{group,curve,membrane,inner,particles,trails,update,dispose\}/);
 assert.match(flow,/geometries\.forEach\(g=>g\.dispose\(\)\)/);
});

test('one small alpha-textured canopy has a softly feathered triangular boundary',()=>{
 assert.match(fog,/const steps=14/);
 assert.match(fog,/const size=192,canvas=document\.createElement/);
 assert.match(fog,/const feather=smooth\(clamp\(edge\/\.125\)\)/);
 assert.match(fog,/image\.data\[i\+3\]=Math\.round\(200\*feather/);
 assert.match(fog,/new THREE\.CanvasTexture\(canvas\)/);
 assert.match(fog,/map\.flipY=false/);
 assert.match(fog,/new THREE\.MeshBasicMaterial\(/);
 assert.match(fog,/transparent:true,opacity:0/);
 assert.match(fog,/fogMaterial\.opacity=opacity\*/);
 assert.match(fog,/positionAttr\.setY\(i,12\+\.90\*Math\.sin/);
 assert.match(fog,/positionAttr\.needsUpdate=true/);
 assert.doesNotMatch(fog,/new THREE\.ShaderMaterial|raymarch|for\(.*gl_FragCoord/);
});

test('static mist motes use one Points draw; LOW keeps textured canopy',()=>{
 assert.match(fog,/const MAX_MOTES=48/);
 assert.match(fog,/moteGeometry\.setDrawRange\(0,28\)/);
 assert.match(fog,/const count=quality==='high'\?48:quality==='medium'\?28:0/);
 assert.match(fog,/const motes=new THREE\.Points\(moteGeometry,moteMaterial\)/);
 assert.match(fog,/motes\.visible=count>0/);
 assert.match(fog,/const group=new THREE\.Group\(\)/);
 assert.match(fog,/geometry\.dispose\(\);fogMaterial\.dispose\(\);fogTexture\.dispose\(\)/);
 assert.match(fog,/moteGeometry\.dispose\(\);moteMaterial\.dispose\(\)/);
 assert.doesNotMatch(fog,/requestAnimationFrame|setInterval|SphereGeometry/);
});

test('coverage only appears when the 3-node loop closes, with optional UI toggle',()=>{
 assert.match(world,/this\.coverage=buildCoverageMist\(THREE,local,this\.particleSprite\)/);
 assert.match(world,/const enclosed=stage===3\?smooth\(this\.edges\[2\]\?\.alpha\?\?0\):0/);
 assert.match(world,/this\.coverage\?\.update\(elapsed,enclosed,quality,movementReduced,dt\)/);
 assert.match(world,/setCoverageEnabled\(value\)/);
 assert.match(world,/this\.coverage\?\.setEnabled\(coverageEnabled\)/);
 assert.match(world,/this\.coverage\?\.dispose\(\)/);
 assert.match(html,/id="mistToggle"/);
 assert.match(html,/function toggleMist\(\)/);
 assert.match(html,/network\?\.setCoverageEnabled\(mistEnabled\)/);
 assert.match(html,/query\.get\('mist'\)!=='0'/);
 for(const i of [0,1,2,3])assert.match(html,new RegExp('id="stage-'+i+'"'));
});

test('validated geographic 3D depth fix, mobile settings and zero GPS remain',()=>{
 for(const id of ['relay','grove','prism'])assert.match(world,new RegExp("id:'"+id+"'"));
 assert.match(world,/this\.renderer\.clearDepth\(\)/);
 assert.match(world,/this\.renderer\.render\(this\.scene,this\.camera\)/);
 assert.match(world,/this\.repaintTimer=setTimeout/);
 assert.match(world,/clearTimeout\(this\.repaintTimer\)/);
 assert.match(world,/this\.particleSprite\?\.dispose\(\)/);
 assert.match(world,/this\.membraneMaps\?\.dispose\(\)/);
 assert.match(world,/tiles\.openfreemap|MercatorCoordinate\.fromLngLat/);
 assert.doesNotMatch(html+world,/navigator\.geolocation|watchPosition|getCurrentPosition|localStorage|sessionStorage/);
});
