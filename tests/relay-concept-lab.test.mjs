import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';

const base='experiments/relay-concept-lab/';
const page=readFileSync(base+'index.html','utf8');
const model=readFileSync(base+'relay-3d.js','utf8');
const lighthouse=readFileSync(base+'relay-lighthouse.js','utf8');

test('Relay three-option HTML module and 3D module are parsable',()=>{
 const script=page.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];
 assert.ok(script);
 new Script(script.replace(/^\s*import .*?;\s*$/gm,''));
 new Script(model.replace(/^\s*import .*?;\s*$/gm,'').replace(/^\s*export /gm,''));
 new Script(lighthouse.replace(/^\s*export /gm,''));
});

test('MapLibre readable Dark and approved depth fix are unchanged',()=>{
 assert.match(page,/styleURL\s*=\s*'https:\/\/tiles\.openfreemap\.org\/styles\/dark'/);
 assert.match(page,/applyReadableDark\(\)/);
 assert.match(page,/map\.addLayer\(layer\);/);
 assert.doesNotMatch(page,/map\.addLayer\(layer\s*,\s*firstLabel\)/);
 assert.match(model,/this\.renderer\.resetState\(\);\s*this\.renderer\.clearDepth\(\);\s*this\.renderer\.render\(this\.scene,this\.camera\)/);
 assert.match(model,/renderingMode:'3d'/);
 assert.match(model,/defaultProjectionData\.mainMatrix/);
 assert.match(model,/MercatorCoordinate\.fromLngLat/);
 assert.match(model,/meterInMercatorCoordinateUnits\(\)/);
});

test('Three visually distinct Relay variants and client switching',()=>{
 for(const kind of ['haara','portti','kudos']){
  assert.match(model,new RegExp('function build'+kind.charAt(0).toUpperCase()+kind.slice(1)+'\\('));
  assert.match(page,new RegExp('id="choose-'+kind+'"'));
  assert.match(model,new RegExp(kind+':build'+kind.charAt(0).toUpperCase()+kind.slice(1)+'\\('));
 }
 assert.match(model,/setConcept\(id\)/);
 assert.match(page,/nodeLayer\?\.setConcept\(id\)/);
 assert.match(page,/createRelay3DLayer\(maplibregl,NODE_COORDS,selected/);
 assert.match(model,/new THREE\.TubeGeometry/);
 assert.match(model,/new THREE\.TorusGeometry/);
 assert.match(model,/transparent:true, opacity:0\.16/);
});

test('Relay is prototype and DEMO only, no GPS or live Node data',()=>{
 assert.match(page,/EI LUKITTU/);
 assert.match(page,/Ei GPS:ää/i);
 assert.doesNotMatch(page,/navigator\.geolocation|getCurrentPosition|watchPosition/);
 assert.match(model,/setEnabled\(value\)/);
 assert.match(model,/onRemove\(\)/);
 assert.match(page,/import\('\.\/relay-3d\.js\?v=005'\)/);
});

test('contrast tuning exposes Relay edges rather than burying bright geometry',()=>{
 assert.match(model,/color:0x164d5a/);
 assert.match(model,/new THREE\.TorusGeometry\(24\.2,1\.1/);
 assert.match(model,/points\.map\(\(\[x,y,z\]\)=>\[x,y\+3\.6,z\]\)/);
});

test('v0.2 premium Chromatic Relay has a distinctive solid multi-material 3D body',()=>{
 assert.match(model,/function buildChromatic\(parent\)/);
 assert.match(model,/chromatic:buildChromatic\(this\.anchor\)/);
 assert.match(page,/id="choose-chromatic"/);
 assert.match(page,/let selected=Object\.hasOwn\(CONCEPTS,requested\)\?requested:'lighthouse'/);
 assert.match(model,/new THREE\.MeshStandardMaterial/);
 assert.match(model,/new THREE\.HemisphereLight/);
 for(const color of ['0x163a49','0xff8e74','0xffd99a','0x8f74d9','0x31dccf'])
   assert.ok(model.includes(color),'missing rich hero palette '+color);
 assert.match(model,/for\(let arm=0;arm<3;arm\+\+\)/);
 assert.match(model,/three|three exits|3 readable living exits/i);
 assert.doesNotMatch(page,/navigator\.geolocation|getCurrentPosition|watchPosition/);
});

test('v0.2 optional Low Medium High only changes graphical VFX',()=>{
 assert.match(model,/setQuality\(level\)/);
 assert.match(model,/fx\.visible=level!=='low'/);
 assert.match(model,/getQuality\(\)/);
 for(const level of ['low','medium','high'])assert.match(page,new RegExp('id="quality-'+level+'"'));
 assert.match(page,/nodeLayer\?\.setQuality\(value\)/);
});

test('six repeatable visual QA camera orientations may be selected without GPS',()=>{
 assert.match(page,/const START_CAMERA=\{/);
 assert.match(page,/cameraNumber\('zoom',17\.1,10,19\)/);
 assert.match(page,/pitch:cameraNumber\('pitch',55,0,70\)/);
 assert.match(page,/bearing:cameraNumber\('bearing',-15,-360,360\)/);
 assert.match(page,/zoom:START_CAMERA\.zoom/);
 assert.match(page,/bearing:START_CAMERA\.bearing/);
 assert.match(page,/choose-chromatic/);
});

test('v0.3 lighthouse is an actual layered 3D tower with compact three-port lantern',()=>{
 assert.match(model,/import \{ buildRelayLighthouse \} from '\.\/relay-lighthouse\.js\?v=031'/);
 assert.match(model,/lighthouse:buildRelayLighthouse\(THREE,this\.anchor\)/);
 assert.match(page,/id="choose-lighthouse"/);
 assert.match(lighthouse,/CylinderGeometry\(6\.7,8\.8,38,12,3\)/);
 assert.match(lighthouse,/for\(let i=0;i<3;i\+\+\)/);
 assert.match(lighthouse,/new THREE\.HemisphereLight/);
 assert.match(lighthouse,/new THREE\.TubeGeometry/);
 assert.match(lighthouse,/CONE/i);
 assert.match(lighthouse,/copper|brass|amethyst|cyan/);
});

test('v0.3 cosmetic grade levels are independent from rendering L\/M\/H and gameplay',()=>{
 assert.match(model,/setGrade\(level\)/);
 assert.match(model,/getGrade\(\)/);
 assert.match(page,/nodeLayer\?\.setGrade\(value\)/);
 assert.match(lighthouse,/setGrade\(level\)/);
 assert.match(lighthouse,/secondTier\.visible=grade>=2/);
 assert.match(lighthouse,/thirdTier\.visible=grade>=3/);
 assert.match(lighthouse,/setQuality\(level\)/);
 for(const level of [1,2,3])assert.match(page,new RegExp('id="grade-'+level+'"'));
 assert.doesNotMatch(page,/navigator\.geolocation|watchPosition/);
});

test('Grade II amber signal differs substantially from Grade I basic cyan',()=>{
 assert.match(lighthouse,/const amberGrade=material\(0xffa665/);
 assert.match(lighthouse,/portGlow\[i\]\.material=grade>=3\?\(i===1\?amethyst:cyan\):\(grade===2\?champagne:cyan\)/);
 assert.match(lighthouse,/tip\.material=grade>=3\?amethyst:\(grade===2\?champagne:patina\)/);
});
