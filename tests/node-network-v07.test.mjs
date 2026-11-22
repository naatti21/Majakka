import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';

const folder='experiments/node-network-v07/';
const html=readFileSync(folder+'index.html','utf8');
const world=readFileSync(folder+'network-world.js','utf8');
const strand=readFileSync(folder+'organic-strand.js','utf8');
const strip=s=>s.replace(/^\s*import .*?;\s*$/gm,'').replace(/^\s*export /gm,'');

test('v0.7 organic membrane modules and mobile page parse without JS syntax errors',()=>{
 const embedded=html.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];
 assert.ok(embedded,'missing inline UI module');
 for(const src of [embedded,world,strand])new Script(strip(src));
});

test('real variation in tube skin not a simple constant-radius debug line',()=>{
 assert.match(strand,/function makeMembraneGeometry\(/);
 assert.match(strand,/curve\.computeFrenetFrames\(segments,false\)/);
 assert.match(strand,/const taper=\.51\+\.49\*Math\.pow\(Math\.sin\(t\*Math\.PI\),\.34\)/);
 assert.match(strand,/const irregular=1\+\.065\*Math\.sin/);
 assert.match(strand,/const ridges=1\+\.042\*Math\.sin/);
 assert.match(strand,/radial\.copy\(frames\.normals\[i\]\)/);
 assert.match(strand,/new THREE\.BufferGeometry\(\)/);
 assert.match(strand,/geometry\.computeVertexNormals\(\)/);
 assert.match(strand,/const curve=makePath\(/);
 assert.match(strand,/new THREE\.CatmullRomCurve3\(points/);
 assert.doesNotMatch(strand,/CylinderGeometry\(/);
});

test('translucent organic PBR membrane has genuine microscopic surface response',()=>{
 assert.match(strand,/createMembraneMaps\(THREE\)/);
 assert.match(strand,/const rough=document\.createElement\('canvas'\),bump=document\.createElement\('canvas'\)/);
 assert.match(strand,/new THREE\.CanvasTexture\(rough\)/);
 assert.match(strand,/new THREE\.CanvasTexture\(bump\)/);
 assert.match(strand,/new THREE\.MeshStandardMaterial\(\{/);
 assert.match(strand,/vertexColors:true,transparent:true,opacity:\.48/);
 assert.match(strand,/depthWrite:false,side:THREE\.FrontSide/);
 assert.match(strand,/roughnessMap:materialMaps\.roughnessMap/);
 assert.match(strand,/bumpMap:materialMaps\.bumpMap,bumpScale:\.18/);
 assert.match(strand,/emissiveIntensity:\.12/);
 assert.match(strand,/const breath=motionReduced\?1:/);
});

test('inner structure and travel spheres rather than exposed lightning lines or marker diamonds',()=>{
 assert.match(strand,/const inner=new THREE\.Mesh/);
 assert.match(strand,/new THREE\.TubeGeometry\(curve/);
 assert.match(strand,/for\(let side=0;side<2;side\+\+\)/);
 assert.match(strand,/r=\.94\*Math\.sin\(Math\.PI\*t\)/);
 assert.match(strand,/for\(let n=0;n<3;n\+\+\)/);
 assert.match(strand,/new THREE\.SphereGeometry\(1\.08,12,8\)/);
 assert.match(strand,/new THREE\.SphereGeometry\(1\.74,12,8\)/);
 assert.match(strand,/d\.capsule\.position\.copy\(curve\.getPointAt\(t\)\)/);
 assert.match(strand,/d\.capsule\.visible=i<\(quality==='low'\?1:quality==='medium'\?2:3\)/);
 assert.doesNotMatch(strand,/IcosahedronGeometry/);
});

test('three geosited PBR beacons and stage 0–3 network remain intact and functional',()=>{
 for(const id of ['relay','grove','prism'])
   assert.match(world,new RegExp("id:'"+id+"'"));
 for(const edge of ['from:0,to:1','from:0,to:2','from:1,to:2'])
   assert.ok(world.includes(edge));
 assert.match(world,/MercatorCoordinate\.fromLngLat/);
 assert.match(world,/const organic=buildOrganicStrand\(/);
 assert.match(world,/this\.scene\.add\(organic\.group\)/);
 assert.match(world,/edge\.organic\.update\(elapsed,level,quality,movementReduced\)/);
 assert.match(world,/const target=i<stage\?1:0/);
 assert.match(html,/import\('\.\/network-world\.js\?v=071'\)/);
 for(const i of [0,1,2,3])assert.match(html,new RegExp('id="stage-'+i+'"'));
 assert.match(html,/id="replay"/);
 assert.match(html,/Vertaa v0\.6/);
 assert.match(html,/Valopallot virtaavat niiden sisällä/);
});

test('shared textures & surfaces are cleaned up, and 3D draw-depth map fix preserved',()=>{
 assert.match(world,/this\.membraneMaps=createMembraneMaps\(THREE\)/);
 assert.match(world,/this\.membraneMaps\?\.dispose\(\)/);
 assert.match(world,/for\(const e of this\.edges\|\|\[\]\)e\.organic\.dispose\(\)/);
 assert.match(strand,/geometries\.forEach\(g=>g\.dispose\(\)\)/);
 assert.match(strand,/materials\.forEach\(m=>m\.dispose\(\)\)/);
 assert.match(world,/this\.renderer\.resetState\(\)/);
 assert.match(world,/this\.renderer\.clearDepth\(\)/);
 assert.match(world,/this\.renderer\.render\(this\.scene,this\.camera\)/);
 assert.ok(world.indexOf('this.renderer.resetState()')<world.indexOf('this.renderer.clearDepth()'));
 assert.ok(world.indexOf('this.renderer.clearDepth()')<world.indexOf('this.renderer.render(this.scene,this.camera)'));
 assert.match(html,/tiles\.openfreemap\.org\/styles\/dark/);
 assert.doesNotMatch(html+world,/navigator\.geolocation|watchPosition|getCurrentPosition|localStorage|sessionStorage/);
});

test('motion accessibility and frame load scales with phone quality choice',()=>{
 assert.match(world,/prefers-reduced-motion: reduce/);
 assert.match(strand,/const segments=quality==='low'\?56:quality==='high'\?112:84/);
 assert.match(strand,/const sides=quality==='low'\?8:12/);
 assert.match(world,/const redrawRate=quality==='high'\?18:quality==='medium'\?33:55/);
 assert.match(world,/this\.repaintTimer=setTimeout/);
 assert.match(world,/clearTimeout\(this\.repaintTimer\)/);
 assert.match(strand,/motionReduced\?\(d\.offset\+\.13\)%1/);
});

test('organic tube faces outward rather than using a double-rendered inside-out shell',()=>{
 assert.match(strand,/indices\.push\(a,a\+1,b,b,a\+1,b\+1\)/);
 assert.match(world,/organic-strand\.js\?v=002/);
});
