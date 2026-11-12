import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';

const base='experiments/relay-concept-lab/';
const page=readFileSync(base+'index.html','utf8');
const model=readFileSync(base+'relay-3d.js','utf8');

test('Relay three-option HTML module and 3D module are parsable',()=>{
 const script=page.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];
 assert.ok(script);
 new Script(script.replace(/^\s*import .*?;\s*$/gm,''));
 new Script(model.replace(/^\s*import .*?;\s*$/gm,'').replace(/^\s*export /gm,''));
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
 assert.match(page,/import\('\.\/relay-3d\.js\?v=001'\)/);
});
