import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';

const base='experiments/node-network-v071/';
const strand=readFileSync(base+'organic-strand.js','utf8');
const world=readFileSync(base+'network-world.js','utf8');
const html=readFileSync(base+'index.html','utf8');
const old=readFileSync('experiments/node-network-v07/organic-strand.js','utf8');
const strip=s=>s.replace(/^\s*import .*?;\s*$/gm,'').replace(/^\s*export /gm,'');
test('new v0.7.1 sources and mobile UI parse',()=>{
 const embedded=html.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];
 assert.ok(embedded);
 for(const s of [embedded,strand,world])new Script(strip(s));
 assert.match(html,/network-world\.js\?v=073/);
 assert.match(world,/organic-strand\.js\?v=071/);
});

test('large animated spheres eliminated only from new version',()=>{
 assert.match(old,/new THREE\.SphereGeometry\(1\.08,12,8\)/);
 assert.doesNotMatch(strand,/new THREE\.SphereGeometry|droplets|capsule/);
 assert.match(strand,/new THREE\.Points\(geometry,material\)/);
 assert.match(strand,/new THREE\.BufferGeometry\(\)/);
 assert.match(strand,/new THREE\.PointsMaterial\(\{/);
 assert.match(strand,/sizeAttenuation:true/);
});

test('exact tier budgets and one particle draw call per link',()=>{
 assert.match(strand,/const MAX_PARTICLES=26/);
 assert.match(strand,/Object\.freeze\(\{low:8,medium:14,high:26\}\)/);
 assert.match(strand,/geometry\.setDrawRange\(0,count\)/);
 assert.match(strand,/positionsAttr\.needsUpdate=true/);
 assert.match(strand,/colorsAttr\.needsUpdate=true/);
 assert.match(strand,/positionsAttr\.setUsage\(THREE\.DynamicDrawUsage\)/);
 assert.match(strand,/colorsAttr\.setUsage\(THREE\.DynamicDrawUsage\)/);
 assert.match(world,/this\.particleSprite=createParticleSprite\(THREE\)/);
 assert.match(world,/this\.membraneMaps\.dispose|this\.membraneMaps\?\.dispose\(\)/);
 assert.match(world,/this\.particleSprite\?\.dispose\(\)/);
});

test('soft transparent round glow, not points rendered as sharp squares',()=>{
 assert.match(world,/createRadialGradient\(16,16,0,16,16,16\)/);
 assert.match(world,/glow\.addColorStop\(1,'rgba\(255,255,255,0\)'\)/);
 assert.match(world,/new THREE\.CanvasTexture\(canvas\)/);
 assert.match(strand,/map:particleTexture/);
 assert.match(strand,/transparent:true,opacity:\.70,depthWrite:false,depthTest:false/);
 assert.match(strand,/blending:THREE\.NormalBlending,alphaTest:\.04/);
});

test('constant low-overhead flow inside wall with material-inspired colors and gentle speed offsets',()=>{
 assert.match(strand,/curve\.computeFrenetFrames\(96,false\)/);
 assert.match(strand,/const radial=\.23\+\.67/);
 assert.match(strand,/tmp\.copy\(curve\.getPointAt\(t\)\)/);
 assert.match(strand,/particleFrames\.normals\[frame\]/);
 assert.match(strand,/particleFrames\.binormals\[frame\]/);
 assert.match(strand,/\.084\+\.038/);
 assert.match(strand,/tint\.copy\(from\)\.lerp\(to,t\)\.lerp\(warmWhite,\.34\)/);
 assert.match(strand,/particleColors\[j\*3\]/);
 assert.doesNotMatch(strand,/new THREE\.Points\([^)]*\)[\s\S]*requestAnimationFrame/);
});

test('the material PBR outer shell and 3-stage network are preserved',()=>{
 assert.match(strand,/makeMembraneGeometry\(/);
 assert.match(strand,/roughnessMap:materialMaps\.roughnessMap/);
 assert.match(strand,/bumpMap:materialMaps\.bumpMap/);
 assert.match(strand,/const filaments=\[\]/);
 assert.match(world,/id:'relay'/);
 assert.match(world,/id:'grove'/);
 assert.match(world,/id:'prism'/);
 for(const edge of ['from:0,to:1','from:0,to:2','from:1,to:2'])
   assert.ok(world.includes(edge));
 assert.match(world,/edge\.organic\.update\(elapsed,level,quality,movementReduced\)/);
 assert.match(world,/this\.renderer\.clearDepth\(\)/);
 for(const i of [0,1,2,3])
   assert.match(html,new RegExp('id="stage-'+i+'"'));
 assert.match(html,/Herätä|HERÄTÄ/);
 assert.match(html,/Vertaa v0\.7/);
 assert.doesNotMatch(html+world,/navigator\.geolocation|watchPosition|getCurrentPosition|localStorage/);
});

test('original v0.7 remains intact as a compare path and every particle resource can be disposed',()=>{
 assert.match(html,/href="\.\.\/node-network-v07\//);
 assert.match(strand,/geometry\.setAttribute\('position',positionsAttr\)/);
 assert.match(strand,/geometry\.setAttribute\('color',colorsAttr\)/);
 assert.match(strand,/geometries\.forEach\(g=>g\.dispose\(\)\)/);
 assert.match(strand,/materials\.forEach\(m=>m\.dispose\(\)\)/);
 assert.match(world,/for\(const e of this\.edges\|\|\[\]\)e\.organic\.dispose\(\)/);
});

test('mobile particle readability improved without increasing particle budgets',()=>{
 assert.match(strand,/size:5\.0,sizeAttenuation:true/);
 assert.match(strand,/material\.opacity=\.86\*level/);
 assert.match(world,/organic-strand\.js\?v=072/);
 assert.match(strand,/const MAX_PARTICLES=26/);
});
