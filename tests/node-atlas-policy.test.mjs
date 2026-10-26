import { test } from 'node:test';
import assert from 'node:assert/strict';
import '../node-atlas-policy.js';

const P=globalThis.MajakkaNodePolicy;
const base={
 source:'osm',sourceId:'osm:node:900',point:{lat:61.5,lng:23.75},
 tags:{tourism:'artwork',name:'Community mural',access:'yes'},
 flags:{permanent:true},
 evidence:{
   pedestrianAccessVerified:true,publicAccessVerified:true,placementVerified:true,
   duplicateChecked:true,localReviewEvidence:true,photoScreened:true
 }
};

test('OSM public art can enter a review queue, never become public automatically',()=>{
 const r=P.assess(base);
 assert.equal(r.type,'artwork');assert.equal(r.status,'review_ready');
 assert.equal(r.publicationAllowed,false);
});
test('an unverified public path is not considered safe just because OSM says access=yes',()=>{
 const r=P.assess({...base,evidence:{...base.evidence,pedestrianAccessVerified:false}});
 assert.equal(r.status,'needs_evidence');
 assert.ok(r.reasons.includes('pedestrian_access_not_verified'));
});
test('private residential property and denied pedestrian access are rejected',()=>{
 for(const item of [
  {...base,flags:{privateResidentialProperty:true}},
  {...base,tags:{...base.tags,foot:'private'}},
  {...base,tags:{...base.tags,access:'no'}}
 ]){
  assert.equal(P.assess(item).status,'rejected');
 }
});
test('school, childcare, emergency sites, railways and sensitive landuse are rejected',()=>{
 for(const tags of [
  {amenity:'school'}, {amenity:'kindergarten'}, {amenity:'fire_station'},
  {landuse:'military'}, {landuse:'industrial'}, {historic:'tomb'},
  {landuse:'cemetery'}
 ]){
  assert.equal(P.assess({...base,tags:{...base.tags,...tags}}).status,'rejected');
 }
});
test('parks may be anchors near verified public entrances but never by centroid automatically',()=>{
 const park={...base,tags:{leisure:'park',name:'Green park',access:'yes'}};
 const insufficient=P.assess(park);
 assert.equal(insufficient.status,'needs_evidence');
 assert.ok(insufficient.reasons.includes('park_anchor_must_use_public_entrance_or_path'));
 const approvedForReview=P.assess({...park,evidence:{...park.evidence,placementKind:'public_path'}});
 assert.equal(approvedForReview.status,'review_ready');
 assert.equal(approvedForReview.publicationAllowed,false);
});
test('community photograph requires rights and metadata screening',()=>{
 const r=P.assess({...base,source:'community'});
 assert.equal(r.status,'needs_evidence');
 assert.ok(r.reasons.includes('photo_rights_not_confirmed'));
 assert.ok(r.reasons.includes('remove_exif_before_review'));
 const ready=P.assess({...base,source:'community',evidence:{
  ...base.evidence,photographerRightsConfirmed:true,metadataStripped:true
 }});
 assert.equal(ready.status,'review_ready');
 assert.equal(ready.publicationAllowed,false);
});
test('paid or permissive access needs separate review',()=>{
 for(const access of ['customers','permissive']){
  const r=P.assess({...base,tags:{...base.tags,access}});
  assert.equal(r.status,'needs_evidence');
 }
});
test('bad coordinates and ephemeral installations reject safely',()=>{
 assert.equal(P.assess({...base,point:{lat:NaN,lng:50}}).status,'rejected');
 assert.equal(P.assess({...base,flags:{permanent:false}}).status,'rejected');
 assert.equal(P.assess(null).status,'rejected');
});
test('unrecognized categories do not become approved anchors',()=>{
 const r=P.assess({...base,tags:{amenity:'parking',name:'Generic parking'}});
 assert.equal(r.type,null);
 assert.equal(r.status,'needs_evidence');
});
test('duplicate inspection detects identical original source and nearby same-name places',()=>{
 const a={...base,point:{lat:61.5,lng:23.75}};
 const nearby={...base,sourceId:'osm:node:901',point:{lat:61.5001,lng:23.7501}};
 assert.equal(P.possibleDuplicates(a,[nearby]).length,1);
 assert.equal(P.possibleDuplicates(a,[{...nearby,point:{lat:61.6,lng:23.8}}]).length,0);
 assert.equal(P.possibleDuplicates(a,[{...nearby,sourceId:a.sourceId}]).length,1);
});
