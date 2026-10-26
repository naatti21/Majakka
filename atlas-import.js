/* Majakka Atlas import, isolated review prototype. No automatic fetch. */
(function(root,factory){
 const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;
 root.MajakkaAtlasImport=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 const MAX_RADIUS=1200,MAX_RESULTS=125,MIN_FETCH_INTERVAL=30*60*1000;
 const ALLOWED_TYPES=new Set(["node","way","relation"]);
 function valid(center,radius){
  return !!center&&Number.isFinite(center.lat)&&Number.isFinite(center.lng)
   &&center.lat>=-85&&center.lat<=85&&center.lng>=-180&&center.lng<=180
   &&Number.isInteger(radius)&&radius>=200&&radius<=MAX_RADIUS;
 }
 function query(center,radius=MAX_RADIUS){
  if(!valid(center,radius))throw Error("Invalid atlas review area");
  const lat=center.lat.toFixed(6),lng=center.lng.toFixed(6),around="(around:"+radius+","+lat+","+lng+")";
  return '[out:json][timeout:18][maxsize:33554432];('+
   'nwr["tourism"~"^(artwork|viewpoint|museum)$"]'+around+';'+
   'nwr["historic"~"^(monument|memorial|archaeological_site)$"]'+around+';'+
   'nwr["amenity"~"^(library|community_centre|arts_centre)$"]'+around+';'+
   'nwr["information"~"^(guidepost|board)$"]'+around+';'+
   'nwr["leisure"="park"]'+around+';'+
   ');out center '+MAX_RESULTS+';';
 }
 function normalize(element){
  if(!element||!ALLOWED_TYPES.has(element.type)||!Number.isSafeInteger(element.id)||element.id<1)return null;
  const tags=element.tags&&typeof element.tags==="object"&&!Array.isArray(element.tags)?element.tags:{};
  const src=element.type==="node"?element:element.center;
  if(!src||!Number.isFinite(src.lat)||!Number.isFinite(src.lon)||src.lat>85||src.lat< -85||Math.abs(src.lon)>180)return null;
  const name=String(tags.name||tags["name:fi"]||tags["name:en"]||"").trim().slice(0,100);
  const candidate={
   source:"osm",sourceId:"osm:"+element.type+":"+element.id,
   point:{lat:src.lat,lng:src.lon},
   tags:{...tags},evidence:{},
   geometryKind:element.type==="node"?"point":"approximate_center",
   name:name||"Unnamed "+element.type
  };
  if(element.type!=="node"&&tags.leisure==="park")candidate.evidence.placementKind="geometry_center";
  return candidate;
 }
 function parseResponse(payload,policy){
  if(!payload||!Array.isArray(payload.elements)||!policy?.assess)throw Error("Malformed atlas data");
  const seen=new Set(),list=[];
  for(const item of payload.elements){
   const candidate=normalize(item);
   if(!candidate||seen.has(candidate.sourceId))continue;
   seen.add(candidate.sourceId);
   const result=policy.assess(candidate);
   list.push({...candidate,classification:result});
   if(list.length>=MAX_RESULTS)break;
  }
  return list.sort((a,b)=>b.classification.score-a.classification.score);
 }
 function stats(list){
  const counts={total:list.length,review_ready:0,needs_evidence:0,rejected:0};
  for(const c of list)if(Object.hasOwn(counts,c.classification.status))counts[c.classification.status]++;
  return counts;
 }
 return {MAX_RADIUS,MAX_RESULTS,MIN_FETCH_INTERVAL,valid,query,normalize,parseResponse,stats};
});
