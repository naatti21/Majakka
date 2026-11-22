import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';

const base='experiments/node-network-v06/';
const html=readFileSync(base+'index.html','utf8');
const world=readFileSync(base+'network-world.js','utf8');
const model=readFileSync('experiments/node-family-v01/beacon-model.js','utf8');
const strip=s=>s.replace(/^\s*import .*?;\s*$/gm,'').replace(/^\s*export /gm,'');
test('v0.6 HTML and 3D module JavaScript parse successfully',()=>{
 const script=html.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];
 assert.ok(script);
 for(const s of [script,world])new Script(strip(s));
});

test('network includes three DIFFERENT PBR lighthouses in fixed DEMO positions',()=>{
 for(const id of ['relay','grove','prism']){
   assert.match(world,new RegExp("id:'"+id+"'"));
   assert.match(html,new RegExp("id:'"+id+"'"));
 }
 assert.match(world,/const merc=NETWORK_NODES\.map/);
 assert.match(world,/MercatorCoordinate\.fromLngLat\(x\.coords,0\)/);
 assert.match(world,/meterInMercatorCoordinateUnits\(\)/);
 assert.match(world,/obj\.group\.position\.copy\(local\[i\]\)/);
 assert.match(world,/buildBeacon\(THREE,data\.id,quality,true\)/);
 assert.match(model,/sharedLighting=false/);
 assert.match(model,/if\(!sharedLighting\)group\.add\(hemi,warm,cool\)/);
 assert.match(world,/const hemi=new THREE\.HemisphereLight/);
 assert.match(world,/this\.beacons\.push\(obj\)/);
 assert.match(world,/NETWORK_NODES\.length/);
 assert.match(html,/Kaksi|Kolme|kolme erilaista 3D-majakkaa/i);
});

test('three separate organic suspended 3D links form a real triangle',()=>{
 assert.match(world,/export const NETWORK_EDGES=Object\.freeze\(\[/);
 assert.match(world,/\{from:0,to:1/);
 assert.match(world,/\{from:0,to:2/);
 assert.match(world,/\{from:1,to:2/);
 assert.match(world,/const start=a\.clone\(\)\.addScaledVector\(dir,7\.8\)/);
 assert.match(world,/const end=b\.clone\(\)\.addScaledVector\(dir,-7\.8\)/);
 assert.match(world,/q\.y\+=arc\*\(11\.5\+2\.2\*Math\.sin/);
 assert.match(world,/new THREE\.CatmullRomCurve3/);
 assert.match(world,/new THREE\.TubeGeometry\(curve,120,1\.00,7,false\)/);
 assert.match(world,/new THREE\.TubeGeometry\(curve,120,\.29,6,false\)/);
 assert.match(world,/for\(let side=0;side<2;side\+\+\)/);
 assert.match(world,/this\.edges\.push\(/);
 assert.match(world,/edge\.group\.visible=level>\.002/);
});

test('stage controls include 0,1,2,3 and replay transitions without permanent gameplay unlock',()=>{
 assert.match(html,/id="replay"/);
 for(const stage of [0,1,2,3])assert.match(html,new RegExp('id="stage-'+stage+'"'));
 assert.match(world,/setStage\(value\)/);
 assert.match(world,/if\(!Number\.isInteger\(n\)\|\|n<0\|\|n>3\)return false/);
 assert.match(world,/const target=i<stage\?1:0/);
 assert.match(world,/const level=smooth\(edge\.alpha\)/);
 assert.match(html,/function stopReplay\(\)/);
 assert.match(html,/function replay\(\)/);
 assert.match(html,/replayTimers\.push\(setTimeout\(\(\)=>chooseStage\(i,true\),1100\*i\)\)/);
 assert.match(html,/network\.setStage\(stage\)/);
 assert.match(html,/onStageStatus/);
 assert.doesNotMatch(html+world,/localStorage|sessionStorage|navigator\.geolocation|watchPosition|Lumen\s*\+=/);
});

test('retains validated dark MapLibre map and depth clearing after all basemap layers',()=>{
 assert.match(html,/tiles\.openfreemap\.org\/styles\/dark/);
 assert.match(html,/applyReadableDark\(\)/);
 assert.match(html,/map\.addLayer\(instance\)/);
 assert.match(world,/renderingMode:'3d'/);
 assert.match(world,/defaultProjectionData\.mainMatrix/);
 assert.match(world,/this\.renderer\.resetState\(\);\s*this\.renderer\.clearDepth\(\);/);
 assert.match(world,/this\.renderer\.render\(this\.scene,this\.camera\)/);
 assert.match(html,/const NODES=\[/);
});

test('animation is throttled and cleanup releases all model and strand resources',()=>{
 assert.match(world,/const redrawRate=quality==='high'\?18:quality==='medium'\?33:55/);
 assert.match(world,/this\.repaintTimer=setTimeout/);
 assert.match(world,/clearTimeout\(this\.repaintTimer\)/);
 assert.match(world,/for\(const b of this\.beacons\|\|\[\]\)b\.dispose\(\)/);
 assert.match(world,/obj\.geometry\?\.dispose\(\)/);
 assert.match(world,/mat\.dispose\(\)/);
 assert.match(world,/this\.renderer\?\.dispose\(\)/);
 assert.match(world,/movementReduced/);
});

test('only DEMO geography; not a claim of public physical access or user range',()=>{
 assert.match(html,/DEMO · EI GPS/);
 assert.match(html,/fiktiiv|fictional|DEMO/i);
 assert.doesNotMatch(html+world,/geolocation|navigator\.permissions|watchPosition|fetch\(.*overpass/);
 const coords=[[23.7603,61.4991],[23.7622,61.4992],[23.7612,61.5006]];
 const rad=x=>x*Math.PI/180;
 const meters=(a,b)=>{
   const lat1=rad(a[1]),lat2=rad(b[1]),dl=rad(b[0]-a[0]),dp=lat2-lat1;
   const hav=Math.sin(dp/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dl/2)**2;
   return 2*6371000*Math.atan2(Math.sqrt(hav),Math.sqrt(1-hav));
 };
 for(let i=0;i<3;i++)for(let j=i+1;j<3;j++){
   const m=meters(coords[i],coords[j]);
   assert.ok(m>50&&m<240, 'demo edge '+i+'-'+j+' should be local, got '+m.toFixed(1)+'m');
 }
});
