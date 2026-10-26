import {test} from 'node:test';
import assert from 'node:assert/strict';
import '../node-atlas-policy.js';
import '../atlas-import.js';
const A=globalThis.MajakkaAtlasImport,P=globalThis.MajakkaNodePolicy;
const raw={
 elements:[
  {type:'node',id:90001,lat:61.497,lon:23.762,tags:{tourism:'artwork',name:'Test artwork'}},
  {type:'way',id:90120,center:{lat:61.5,lon:23.765},tags:{leisure:'park',name:'Public park'}},
  {type:'node',id:90001,lat:61.497,lon:23.762,tags:{tourism:'artwork',name:'Duplicated'},
  },
  {type:'node',id:30300,lat:61.496,lon:23.763,tags:{amenity:'school',tourism:'artwork',name:'Unsafe place'}},
  {type:'relation',id:91080,center:{lat:61.494,lon:23.758},tags:{tourism:'museum',name:'Museum'}},
  {type:'way',id:90044,tags:{leisure:'park',name:'No center'}},
  {type:'node',id:1010,lat:NaN,lon:23.766,tags:{amenity:'library'}}
 ]
};
test('Overpass query is bounded by manual radius, 18s timeout and 125 results',()=>{
 const q=A.query({lat:61.4978,lng:23.761},1200);
 assert.ok(q.includes('(around:1200,61.497800,23.761000)'));
 assert.ok(q.includes('[timeout:18]'));
 assert.ok(q.includes('out center 125;'));
 assert.ok(q.includes('["leisure"="park"]'));
 assert.equal((q.match(/nwr\[/g)||[]).length,5);
});
test('rejects arbitrary coordinates and an unsafe search radius',()=>{
 assert.throws(()=>A.query({lat:NaN,lng:23.76},1200));
 assert.throws(()=>A.query({lat:61,lng:23},10000));
 assert.throws(()=>A.query({lat:89,lng:23},1200));
 assert.throws(()=>A.query({lat:61,lng:23},1));
});
test('OSM element IDs, original provenance and geometry are preserved',()=>{
 const entries=A.parseResponse(raw,P);
 assert.equal(entries.length,4);
 const artwork=entries.find(x=>x.sourceId==='osm:node:90001');
 assert.equal(artwork.name,'Test artwork');
 assert.deepEqual(artwork.point,{lat:61.497,lng:23.762});
 assert.equal(artwork.geometryKind,'point');
});
test('area centroid is not an approved park entrance',()=>{
 const park=A.parseResponse(raw,P).find(x=>x.sourceId==='osm:way:90120');
 assert.equal(park.geometryKind,'approximate_center');
 assert.equal(park.evidence.placementKind,'geometry_center');
 assert.equal(park.classification.status,'needs_evidence');
 assert.ok(park.classification.reasons.includes('park_anchor_must_use_public_entrance_or_path'));
});
test('OSM result is never auto-published by parser',()=>{
 for(const entry of A.parseResponse(raw,P))assert.equal(entry.classification.publicationAllowed,false);
});
test('review list preserves restricted places for visible rejection and safety audit',()=>{
 const items=A.parseResponse(raw,P);
 const unsafe=items.find(x=>x.sourceId==='osm:node:30300');
 assert.equal(unsafe.classification.status,'rejected');
 assert.ok(unsafe.classification.reasons.includes('sensitive_or_restricted_place'));
});
test('malformed OSM records and duplicate elements are safely ignored',()=>{
 const items=A.parseResponse(raw,P);
 assert.equal(items.filter(x=>x.sourceId==='osm:node:90001').length,1);
 assert.equal(items.length,4);
 assert.throws(()=>A.parseResponse({error:'invalid'},P));
 assert.throws(()=>A.parseResponse(null,P));
});
test('review summary counts are accurate and not approvals',()=>{
 const stats=A.stats(A.parseResponse(raw,P));
 assert.equal(stats.total,4);
 assert.equal(stats.rejected,1);
 assert.equal(stats.review_ready,0);
 assert.equal(stats.needs_evidence,3);
});
