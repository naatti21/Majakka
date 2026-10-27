import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateCatalog,assessCoverage,resolveSourceAlias} from '../world-data/catalog-policy.mjs';
const load=n=>JSON.parse(readFileSync(new URL('../world-data/fixtures/'+n+'.json',import.meta.url)));
const pos=(latitude,longitude)=>({latitude,longitude});
test('synthetic fixture is explicitly non-publishable and identity stable',()=>{
 const raw=load('tampere');
 assert.throws(()=>validateCatalog(raw));
 const a=validateCatalog(raw,{allowFixtures:true});
 const b=validateCatalog({...raw,sites:raw.sites.toReversed()},{allowFixtures:true});
 assert.deepEqual(a.sites.map(s=>s.id),b.sites.map(s=>s.id));
 assert.equal(a.sites.length,4);
 assert.ok(a.sites.every(s=>s.visitAllowed===false));
});
test('published real site requires source, attribution and reviewed access',()=>{
 const site={id:'world:uuid:1',kind:'real_place',category:'History',name:'Verified record',
  geo:pos(61.5,23.7),safetyClass:'remote_only',walkable:false,
  source:{namespace:'osm',sourceId:'way/1',attribution:'OSM contributors',license:'ODbL'}};
 const c=validateCatalog({version:'test',sites:[site]});
 assert.equal(resolveSourceAlias(c,{namespace:'osm',sourceId:'way/1'}),site.id);
 assert.throws(()=>validateCatalog({version:'test',sites:[{...site,source:null}]}));
 assert.throws(()=>validateCatalog({version:'test',sites:[{...site,walkable:true}]}));
 assert.throws(()=>validateCatalog({version:'test',sites:[{...site,safetyClass:'reviewed_public',walkable:true}]}));
 assert.equal(validateCatalog({version:'test',sites:[{...site,safetyClass:'reviewed_public',
  walkable:true,accessReview:'verified'}]}).sites[0].visitAllowed,true);
});
test('duplicate source references or site IDs are rejected',()=>{
 const r=load('tampere');
 assert.throws(()=>validateCatalog({...r,sites:[...r.sites,r.sites[0]]},{allowFixtures:true}));
 const site={id:'p1',kind:'real_place',category:'Art',name:'Source',geo:pos(0,0),
  safetyClass:'remote_only',walkable:false,source:{namespace:'osm',sourceId:'way/1',
  attribution:'OSM',license:'ODbL'}};
 assert.throws(()=>validateCatalog({version:'v1',sites:[site,{...site,id:'p2'}]}),/alias/);
});
test('published regional phenomenon is explicitly fictional and limited to one per region',()=>{
 const r=load('rural'),c=validateCatalog(r,{allowFixtures:true});
 assert.equal(c.regional.size,1);
 const one=r.sites[0];
 assert.throws(()=>validateCatalog({...r,sites:[{...one,fictionLabel:'A real site'},...r.sites.slice(1)]},{allowFixtures:true}));
 assert.throws(()=>validateCatalog({...r,sites:[...r.sites,{...one,id:'another'}]},{allowFixtures:true}));
});
test('0/1/3 reachable-site coverage and authored rural case readiness',()=>{
 const rural=load('rural'),home=pos(64.8,26.3);
 const minimal=validateCatalog({...rural,sites:[rural.sites[1]]},{allowFixtures:true});
 assert.equal(assessCoverage(minimal,home).status,'INSUFFICIENT_PUBLISHED_SITES');
 const full=validateCatalog(rural,{allowFixtures:true});
 assert.equal(assessCoverage(full,home).status,'MISSING_AUTHORED_RESEARCH');
 assert.equal(assessCoverage(full,home,{authoredResearch:true}).readyForPilot,true);
});
test('Tampere fixture works while dateline/global remains honest about coverage',()=>{
 const city=validateCatalog(load('tampere'),{allowFixtures:true});
 assert.equal(assessCoverage(city,pos(61.5,23.7)).readyForPilot,true);
 const globe=validateCatalog(load('worldwide'),{allowFixtures:true});
 assert.equal(globe.sites.length,5);
 assert.equal(assessCoverage(globe,pos(0,180)).readyForPilot,false);
 assert.throws(()=>assessCoverage(city,pos(95,0)));
});
