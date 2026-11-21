import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';

const base='experiments/node-family-v01/';
const html=readFileSync(base+'index.html','utf8');
const surface=readFileSync(base+'beacon-materials.js','utf8');
const model=readFileSync(base+'beacon-model.js','utf8');
const layer=readFileSync(base+'beacon-layer.js','utf8');
const strip=s=>s.replace(/^\s*import .*?;\s*$/gm,'').replace(/^\s*export /gm,'');
test('four modules parse and six family selectors exist',()=>{
 const script=html.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];
 assert.ok(script);
 for(const s of [strip(script),strip(surface),strip(model),strip(layer)])new Script(s);
 const ids=['prism','archive','grove','relay','observer','commons'];
 for(const id of ids){
   assert.match(html,new RegExp('id="choose-'+id+'"'));
   assert.match(surface,new RegExp("id:'"+id+"'"));
   assert.match(model,new RegExp(id+':\\s*\\[\\['));
 }
});
test('proposed six role-material pairs match recovered Atlas without gameplay being claimed',()=>{
 for(const pair of [
  ['Prism','Porcelain'],['Archive','Stone'],['Grove','Moss'],
  ['Relay','Copper'],['Observer','Pearl / Mineral'],['Commons','Timber']
 ])assert.match(surface,new RegExp("name:'"+pair[0]+"',material:'"+pair[1].replace('/','\\/')+"'"));
 assert.match(html,/EI LUKITTU/);
 assert.match(html,/fiktiivistä|fiktiivinen|fictitious/);
});
test('surface PBR means actual separate color, roughness and bump texture maps',()=>{
 assert.match(surface,/new THREE\.CanvasTexture\(color\)/);
 assert.match(surface,/new THREE\.CanvasTexture\(rough\)/);
 assert.match(surface,/new THREE\.CanvasTexture\(bump\)/);
 assert.match(surface,/map\.colorSpace=THREE\.SRGBColorSpace/);
 assert.match(surface,/new THREE\.MeshPhysicalMaterial/);
 assert.match(surface,/iridescence:/);
 assert.match(surface,/new THREE\.MeshStandardMaterial/);
 assert.match(surface,/roughnessMap,bumpMap,bumpScale:/);
 assert.match(surface,/const moss=clamp/);
 assert.match(surface,/const grain=Math\.sin/);
 assert.match(surface,/const oxide=clamp/);
 assert.match(surface,/const mortar=/);
 assert.match(surface,/const crack=/);
});
test('distinct buildings AND distinct crowns, not six identical cylinders',()=>{
 assert.match(model,/new THREE\.LatheGeometry/);
 assert.match(model,/const profiles=\{/);
 assert.match(model,/commons: \[\[-28,10\]/);
 assert.match(model,/const sides=\{prism:8,archive:12,grove:10,relay:12,observer:9,commons:4\}/);
 assert.match(model,/if\(id==='prism'\)/);
 assert.match(model,/else if\(id==='archive'\)/);
 assert.match(model,/else if\(id==='grove'\)/);
 assert.match(model,/else if\(id==='relay'\)/);
 assert.match(model,/else if\(id==='observer'\)/);
 assert.match(model,/else if\(id==='commons'\)/);
 assert.match(model,/for\(let n=0;n<3;n\+\+\)/);
 assert.match(model,/const lensFrame=cylinder/);
 assert.match(model,/const bulbs=\[\]/);
});
test('GPU memory clean on model change and low-res texture option',()=>{
 assert.match(model,/group\.traverse\(obj=>/);
 assert.match(model,/geometries\.forEach\(g=>g\.dispose\(\)\)/);
 assert.match(model,/materials\.forEach\(m=>m\.dispose\(\)\)/);
 assert.match(model,/textures\.forEach\(t=>t\.dispose\(\)\)/);
 assert.match(layer,/this\.anchor\.remove\(this\.current\.group\)/);
 assert.match(layer,/this\.current\.dispose\(\)/);
 assert.match(surface,/quality==='low'\?192:384/);
 assert.match(surface,/quality==='low'\?384:768/);
});
test('validated geocoordinate + dark readable roads + final Three depth order',()=>{
 assert.match(html,/const DEMO=\[23\.7603,61\.4991\]/);
 assert.match(html,/const styleURL='https:\/\/tiles\.openfreemap\.org\/styles\/dark'/);
 assert.match(html,/applyReadableDark\(\)/);
 assert.match(html,/map\.addLayer\(study\)/);
 assert.match(layer,/maplibregl\.MercatorCoordinate\.fromLngLat/);
 assert.match(layer,/meterInMercatorCoordinateUnits\(\)/);
 assert.match(layer,/renderingMode:'3d'/);
 assert.match(layer,/this\.renderer\.resetState\(\);\s*this\.renderer\.clearDepth\(\);\s*this\.renderer\.render\(this\.scene,this\.camera\);/);
 assert.match(layer,/defaultProjectionData\.mainMatrix/);
 assert.doesNotMatch(html+layer,/navigator\.geolocation|watchPosition|getCurrentPosition/);
});
test('one rendered 3D beacon at a time and accessible mobile selector',()=>{
 assert.match(layer,/this\.anchor\.add\(this\.current\.group\)/);
 assert.match(layer,/this\.current=buildBeacon\(THREE,id,quality\)/);
 assert.match(html,/role="group" aria-label="Kuusi pelillistä Node-tyyppiä"/);
 assert.match(html,/aria-pressed="true"/);
 assert.match(html,/function setBeacon\(type\)/);
 assert.match(html,/layer\.switchType\(type\)/);
 assert.match(html,/quality-medium/);
 assert.match(html,/camera=\{zoom:number\('zoom',17\.1/);
});
