/* Majakka Node Atlas — conservative candidate pre-screening, NOT public approval.
 * No network requests, map location collection, photo upload, AI recognition, or publishing.
 * OSM source mapping needs ODbL attribution and a separate licence review.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 root.MajakkaNodePolicy=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 const EARTH=6371000;
 const TYPES=Object.freeze({
  artwork:{weight:32,label:"Public art"},
  historic:{weight:35,label:"History & heritage"},
  lookout:{weight:27,label:"Viewpoint"},
  trail:{weight:28,label:"Trail information"},
  nature:{weight:25,label:"Nature education"},
  museum:{weight:28,label:"Museum & culture"},
  library:{weight:23,label:"Public library"},
  park:{weight:22,label:"Park & public space"},
  community:{weight:23,label:"Community landmark"}
 });
 const SENSITIVE_AMENITIES=new Set(["school","kindergarten","childcare","child_care","hospital","fire_station","police","prison","grave_yard"]);
 const RESTRICTED_ACCESS=new Set(["private","no"]);
 const RESTRICTED_LANDUSE=new Set(["military","industrial","construction","cemetery"]);
 const HIGH_RISK_FLAGS=["privateResidentialProperty","schoolGrounds","unsafePedestrianAccess","railwayTrack","motorway","inWater","emergencyAccess","sensitiveSite","ownerRemovalRequest"];
 function validPoint(point){
  return point&&Number.isFinite(point.lat)&&Number.isFinite(point.lng)&&
   Math.abs(point.lat)<=85&&Math.abs(point.lng)<=180;
 }
 function classify(tags={},hint){
  if(tags.tourism==="artwork"||tags.artwork_type||hint==="artwork")return "artwork";
  if(["memorial","monument","archaeological_site"].includes(tags.historic)||hint==="historic")return "historic";
  if(tags.tourism==="viewpoint"||hint==="lookout")return "lookout";
  if(tags.information==="guidepost"||hint==="trail")return "trail";
  if(tags.information==="board"&&["nature","wildlife","environment"].includes(tags.board_type)||hint==="nature")return "nature";
  if(tags.tourism==="museum"||hint==="museum")return "museum";
  if(tags.amenity==="library"||hint==="library")return "library";
  if(tags.leisure==="park"||tags.place==="square"||hint==="park")return "park";
  if(["community_centre","arts_centre"].includes(tags.amenity)||hint==="community")return "community";
  return null;
 }
 function assess(candidate){
  if(!candidate||typeof candidate!=="object")return {status:"rejected",score:0,type:null,reasons:["invalid_candidate"]};
  const tags=candidate.tags&&typeof candidate.tags==="object"?candidate.tags:{};
  const flags=candidate.flags&&typeof candidate.flags==="object"?candidate.flags:{};
  const proof=candidate.evidence&&typeof candidate.evidence==="object"?candidate.evidence:{};
  const type=classify(tags,candidate.type),reasons=[];
  if(!validPoint(candidate.point))reasons.push("invalid_coordinates");
  if(RESTRICTED_ACCESS.has(tags.access)||RESTRICTED_ACCESS.has(tags.foot))
   reasons.push("restricted_access");
  if(SENSITIVE_AMENITIES.has(tags.amenity)||RESTRICTED_LANDUSE.has(tags.landuse)||
   tags.historic==="tomb"||tags.landuse==="railway")reasons.push("sensitive_or_restricted_place");
  for(const key of HIGH_RISK_FLAGS)if(flags[key]===true)reasons.push("safety:"+key);
  if(flags.permanent===false)reasons.push("temporary_object");
  const hardReject=reasons.length>0;
  if(!type)reasons.push("unrecognized_landmark_type");
  if(!["osm","community","curated"].includes(candidate.source))reasons.push("unknown_provenance");
  if(tags.access==="customers"||tags.access==="permissive"||tags.access==="destination")
   reasons.push("restricted_or_conditional_visiting_hours");
  if(proof.pedestrianAccessVerified!==true)reasons.push("pedestrian_access_not_verified");
  if(proof.publicAccessVerified!==true)reasons.push("public_access_not_verified");
  if(proof.placementVerified!==true)reasons.push("anchor_placement_not_verified");
  if(type==="park"&&proof.placementKind!=="entrance"&&proof.placementKind!=="public_path")
   reasons.push("park_anchor_must_use_public_entrance_or_path");
  if(proof.duplicateChecked!==true)reasons.push("duplicate_check_required");
  if(proof.localReviewEvidence!==true)reasons.push("independent_review_required");
  if(proof.photoScreened!==true)reasons.push("photo_screening_required");
  if(candidate.source==="community"){
   if(proof.photographerRightsConfirmed!==true)reasons.push("photo_rights_not_confirmed");
   if(proof.metadataStripped!==true)reasons.push("remove_exif_before_review");
  }
  const score=Math.min(100,Math.max(0,(TYPES[type]?.weight||0)
   +(typeof tags.name==="string"&&tags.name.trim()?12:0)
   +(proof.pedestrianAccessVerified?12:0)
   +(proof.publicAccessVerified?12:0)
   +(proof.placementVerified?8:0)
   +(proof.duplicateChecked?8:0)
   +(proof.photoScreened?8:0)));
  return {status:hardReject?"rejected":reasons.length?"needs_evidence":"review_ready",
   type,score,reasons,publicationAllowed:false};
 }
 function distance(a,b){
  if(!validPoint(a)||!validPoint(b))return Infinity;
  const rad=Math.PI/180,dp=(b.lat-a.lat)*rad,dl=(b.lng-a.lng)*rad;
  const v=Math.sin(dp/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dl/2)**2;
  return 2*EARTH*Math.asin(Math.sqrt(Math.max(0,Math.min(1,v))));
 }
 function possibleDuplicates(candidate,others,meters=45){
  if(!validPoint(candidate?.point)||!Array.isArray(others))return [];
  const qname=String(candidate?.tags?.name||candidate?.name||"").trim().toLocaleLowerCase();
  return others.filter(other=>{
   if(!validPoint(other?.point))return false;
   if(candidate?.sourceId&&other.sourceId&&candidate.sourceId===other.sourceId)return true;
   const d=distance(candidate.point,other.point);
   if(d<12)return true;
   const otherName=String(other?.tags?.name||other?.name||"").trim().toLocaleLowerCase();
   return d<=meters&&!!qname&&qname===otherName;
  });
 }
 return {TYPES,assess,classify,distance,possibleDuplicates};
});
