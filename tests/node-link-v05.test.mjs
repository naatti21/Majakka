import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';

const base='experiments/node-link-v05/';
const page=readFileSync(base+'index.html','utf8');
const layer=readFileSync(base+'link-world.js','utf8');
const lighthouse=readFileSync('experiments/relay-concept-lab/relay-lighthouse.js','utf8');

test('v0.5 map page and 3D strand source parse as JavaScript',()=>{
 const inline=page.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];
 assert.ok(inline,'inline module was not found');
 new Script(inline.replace(/^\s*import .*?;\s*$/gm,''));
 new Script(layer.replace(/^\s*import .*?;\s*$/gm,'').replace(/^\s*export /gm,''));
 new Script(lighthouse.replace(/^\s*export /gm,''));
});

test('two distinct fixed DEMO geocoordinates anchor lighthouses in the same mercator 3D scene',()=>{
 assert.match(layer,/DEMO_NODE_COORDS=\[\s*\[23\.7603,61\.4991\],\s*\[23\.7627,61\.4996\]/);
 assert.match(layer,/MercatorCoordinate\.fromLngLat\(coords\[0\],0\)/);
 assert.match(layer,/MercatorCoordinate\.fromLngLat\(coords\[1\],0\)/);
 assert.match(layer,/meterInMercatorCoordinateUnits\(\)/);
 assert.match(layer,/const dx=\(geo1\.x-geo0\.x\)\/meter, dz=\(geo1\.y-geo0\.y\)\/meter/);
 assert.match(layer,/this\.groupB\.position\.set\(dx,35,dz\)/);
 assert.match(layer,/this\.groupB\.rotation\.y=heading\+Math\.PI/);
 assert.match(layer,/this\.beaconA=buildRelayLighthouse\(THREE,this\.groupA\)/);
 assert.match(layer,/this\.beaconB=buildRelayLighthouse\(THREE,this\.groupB\)/);
 assert.match(page,/const NODES=\[\[23\.7603,61\.4991\],\[23\.7627,61\.4996\]\]/);
});

test('actual organic floating 3D tube attaches to both upper crown outlets',()=>{
 assert.match(layer,/const start=new THREE\.Vector3\(Math\.sin\(heading\)\*8\.08,35\+21\.3/);
 assert.match(layer,/const end=new THREE\.Vector3\(dx-Math\.sin\(heading\)\*8\.08,35\+21\.3/);
 assert.match(layer,/pos\.y\+=arc\*\(16\+3\*Math\.sin\(Math\.PI\*2\*t\)\)/);
 assert.match(layer,/this\.curve=new THREE\.CatmullRomCurve3/);
 assert.match(layer,/new THREE\.TubeGeometry\(this\.curve,116,1\.55/);
 assert.match(layer,/new THREE\.TubeGeometry\(this\.curve,116,\.66/);
 assert.match(layer,/for\(let side=0;side<2;side\+\+\)/);
 assert.match(layer,/point\.addScaledVector\(lateral,amplitude\*Math\.cos\(phase\)\)/);
 assert.match(layer,/this\.pulses\.push\(bead\)/);
});

test('link on/off user interaction changes the 3D visible strand but not Node positions',()=>{
 assert.match(page,/id="linkToggle"/);
 assert.match(page,/worldLayer\.setConnected\(!worldLayer\.isConnected\(\)\)/);
 assert.match(page,/const linkedInitially=cameraQuery\.get\('linked'\)!=='0'/);
 assert.match(layer,/let enabled=true, connected=!!initialConnected/);
 assert.match(layer,/setConnected\(value\)/);
 assert.match(layer,/this\.strength\+=clamp\(target-this\.strength/);
 assert.match(layer,/this\.strand\.visible=this\.strength>\.005/);
 assert.match(layer,/this\.strandMaterials\.forEach/);
 assert.match(layer,/onChange\(\{connected,distanceM:Math\.round\(distance\)\}\)/);
 assert.match(page,/MUODOSTA YHTEYS/);
});

test('preserve approved MapLibre style and last-layer Three depth-buffer repair',()=>{
 assert.match(page,/const styleURL='https:\/\/tiles\.openfreemap\.org\/styles\/dark'/);
 assert.match(page,/function applyReadableDark\(\)/);
 assert.match(page,/map\.addLayer\(layer\);/);
 assert.match(layer,/renderingMode:'3d'/);
 assert.match(layer,/defaultProjectionData\.mainMatrix/);
 assert.match(layer,/this\.renderer\.resetState\(\);\s*this\.renderer\.clearDepth\(\);\s*this\.renderer\.render\(this\.scene,this\.camera\)/);
 assert.match(page,/map\.addLayer\(\{id:'link-glow-foot'/);
 assert.match(page,/map\.addLayer\(\{id:'link-glow-core'/);
 assert.doesNotMatch(page,/navigator\.geolocation|watchPosition|getCurrentPosition/);
 assert.match(page,/fiktiivistä 3D-majakkaa/);
 assert.match(layer,/onRemove\(\)/);
});

test('graphical LOW/MED/HIGH and fixed QA cameras are separate from gameplay',()=>{
 for(const level of ['low','medium','high'])assert.match(page,new RegExp('id="quality-'+level+'"'));
 assert.match(layer,/setQuality\(level\)/);
 assert.match(layer,/bead\.visible=quality!=='low'\|\|i===0/);
 for(const prop of ['zoom','pitch','bearing'])assert.match(page,new RegExp("value\\('"+prop+"'"));
 assert.match(page,/worldLayer\?\.setQuality\(level\)/);
 // No simulated Lumen gains, guardian boosts, live player GPS or durable Node unlocks.
 assert.doesNotMatch(page+layer,/localStorage|sessionStorage|navigator\.geolocation|Lumen\s*\+=/);
});

test('DEMO distance is approximately 140 m, not a player interaction radius',()=>{
 const lat1=61.4991,lat2=61.4996,lon1=23.7603,lon2=23.7627;
 const rad=x=>x*Math.PI/180;
 const dLat=rad(lat2-lat1),dLon=rad(lon2-lon1);
 const aa=Math.sin(dLat/2)**2+Math.cos(rad(lat1))*Math.cos(rad(lat2))*Math.sin(dLon/2)**2;
 const m=2*6371000*Math.atan2(Math.sqrt(aa),Math.sqrt(1-aa));
 assert.ok(m>125 && m<155, 'distance '+m+' m must stay a compact two-Node demo');
 assert.match(page,/Nämä eivät ole oikeita pelipaikkoja/);
});
