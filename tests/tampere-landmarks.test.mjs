import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import '../atlas-core.js';

const A=globalThis.MajakkaAtlasCore;
const source=readFileSync(new URL('../pilot-sites.js',import.meta.url),'utf8');
const root={MajakkaAtlasCore:A};
root.globalThis=root;
runInNewContext(source,root);
const pilot=root.MajakkaPilotSites;
const tampere={lat:61.4984,lng:23.7623};
const nokia={lat:61.48,lng:23.529};

test('Tampere has real sourced landmark nodes even when Overpass returns nothing',()=>{
 const sites=pilot.nearby(tampere,5000);
 assert.ok(sites.length>=6);
 const keys=new Set(sites.map(p=>p.id));
 assert.equal(keys.size,sites.length);
 assert.ok(sites.every(p=>p.source==='osm'&&p.kind==='atlas-real'&&p.sourceId.startsWith('way/')||p.sourceId.startsWith('node/')));
});
test('Nokia gets real sourced pilot landmarks, not synthetic grid nodes',()=>{
 const sites=pilot.nearby(nokia,2300);
 assert.ok(sites.length>=2);
 assert.ok(sites.some(s=>s.name==='Nokian kirkko'));
 assert.ok(sites.some(s=>s.name==='Hinttalan kotiseutumuseo'));
});
test('Locations and IDs are stable across players and never depend on GPS position',()=>{
 const first=pilot.normalized(),second=pilot.normalized().reverse();
 const a=new Map(first.map(p=>[p.sourceId,[p.id,p.lat,p.lng]]));
 const b=new Map(second.map(p=>[p.sourceId,[p.id,p.lat,p.lng]]));
 assert.deepEqual(a,b);
 assert.ok(first.every(p=>!p.id.startsWith('atlas-echo-')));
});
test('The curated pilot is limited and excludes restricted private destinations',()=>{
 const v=pilot.normalized();
 assert.equal(v.length,8);
 assert.ok(v.every(p=>A.types.includes(p.type)));
 assert.ok(!v.some(p=>p.name==='Nokian Kartano'));
});
test('The active 2D and 3D paths use sourced catalogue, not camera-reseeded nodes',()=>{
 const atlas=readFileSync(new URL('../atlas-world.js',import.meta.url),'utf8');
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const world=readFileSync(new URL('../world-3d.html',import.meta.url),'utf8');
 assert.match(html,/<script src="\.\/pilot-sites\.js\?v=115" defer><\/script><script src="\.\/atlas-world\.js\?v=115"/);
 assert.match(atlas,/const catalogue=new Map\(\)/);
 assert.match(atlas,/globalThis\.MajakkaPilotSites\?\.normalized/);
 assert.match(atlas,/catalogue\.values\(\)/);
 assert.match(atlas,/const nearest=document\.createElement\('button'\)/);
 assert.match(world,/points\.push\(\.\.\.\(atlas\.real\|\|\[\]\)\)/);
});
test('Restore two different sourced landmarks in one district to unlock First Chord',()=>{
 const sites=pilot.normalized();
 const a=sites.find(p=>p.name==='Museokeskus Vapriikki'),b=sites.find(p=>p.name==='Tampereen tuomiokirkko');
 const R=6378137;
 const d=({lat,lng})=>Math.floor(R*lng*Math.PI/180/2600)+':'+Math.floor(R*Math.log(Math.tan(Math.PI/4+lat*Math.PI/360))/2600);
 assert.equal(d(a),d(b));
});
