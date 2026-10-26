/* MAJAKKA Atlas AutoGen v0.1 — deterministic node placement from EXISTING real POIs.
 * Independent of current LIVE game, no network, GPS, photo submissions or publishing.
 * Input facts about paths/restrictions are supplied by a separate verified GIS importer.
 * Conservative: missing path/access data NEVER qualifies a location for walk-up activation.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 root.MajakkaAtlasAutoGen=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 const R=6371000,rad=Math.PI/180;
 const VERSION="autogen-0.1";
 const POLICY=Object.freeze({
  radiusMeters:1000,maximumPhysical:24,targetTotal:18,
  minimumSpacingMeters:125,duplicatesMeters:45,maximumPathDistanceMeters:40,
  minimumExistenceConfidence:0.70,minimumWalkupConfidence:0.82,
  maximumCategoryFraction:0.42
 });
 const MAP=Object.freeze({
  art:{weight:38,nodeType:"Prism"},heritage:{weight:40,nodeType:"Archive"},
  park:{weight:29,nodeType:"Grove"},trail:{weight:34,nodeType:"Relay"},
  viewpoint:{weight:38,nodeType:"Observer"},library:{weight:26,nodeType:"Commons"},
  culture:{weight:30,nodeType:"Commons"},nature:{weight:33,nodeType:"Grove"}
 });
 const forbiddenCategories=new Set(["school","kindergarten","daycare","childcare","hospital","prison","police","fire_station","residence","private_home","military_base","cemetery","graveyard","railway_station_platform"]);
 const categoryKeys={
  public_art:"art",artwork:"art",mural:"art",sculpture:"art",
  memorial:"heritage",monument:"heritage",historic_site:"heritage",archaeological_site:"heritage",
  park:"park",public_park:"park",garden:"park",
  trailhead:"trail",trail_guidepost:"trail",information_board:"trail",
  viewpoint:"viewpoint",observation_point:"viewpoint",lookout:"viewpoint",
  library:"library",museum:"culture",cultural_center:"culture",arts_center:"culture",
  community_center:"culture",nature_reserve:"nature",nature_center:"nature",botanical_garden:"nature"
 };
 const finite=v=>typeof v==="number"&&Number.isFinite(v);
 function point(p){return !!p&&finite(p.lat)&&finite(p.lng)&&Math.abs(p.lat)<=85&&Math.abs(p.lng)<=180;}
 function meters(a,b){
  if(!point(a)||!point(b))return Infinity;
  const dp=(b.lat-a.lat)*rad,dl=(b.lng-a.lng)*rad;
  const h=Math.sin(dp/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dl/2)**2;
  return 2*R*Math.asin(Math.sqrt(Math.max(0,Math.min(1,h))));
 }
 function hash(str){let h=2166136261;for(let i=0;i<str.length;i++)h=Math.imul(h^str.charCodeAt(i),16777619)>>>0;return h>>>0;}
 function normalizeCategory(raw){
  const c=String(raw||"").trim().toLowerCase().replace(/[\s-]+/g,"_");
  return categoryKeys[c]||null;
 }
 function typeOf(poi){
  const tag=poi?.tags||{};
  const labels=[poi?.category,poi?.taxonomy?.primary,poi?.basic_category,
   tag.tourism==="artwork"?"artwork":null,
   tag.tourism==="viewpoint"?"viewpoint":null,
   tag.tourism==="museum"?"museum":null,
   tag.leisure==="park"?"park":null,
   tag.amenity==="library"?"library":null,
   tag.historic==="memorial"||tag.historic==="monument"?tag.historic:null,
   tag.information==="guidepost"?"trail_guidepost":null];
  return labels.map(normalizeCategory).find(Boolean)||null;
 }
 function idOf(poi){
  const id=String(poi?.id||poi?.sourceId||"").trim();
  return /^[a-zA-Z0-9:_./-]{2,120}$/.test(id)?id:null;
 }
 function sortCompare(a,b){return a.id.localeCompare(b.id,"en");}
 function candidate(poi){
  const id=idOf(poi),kind=typeOf(poi);
  if(!id||!point(poi?.point)||!kind)return null;
  const c=poi.confidence;
  if(c!==undefined&&c!==null&&(!finite(c)||c<0||c>1))return null;
  const confidence=c==null?null:c;
  const access=poi.access||{};
  const walking=poi.walking||{};
  const overlay=poi.overlays||{};
  const cat=String(poi.category||poi.basic_category||"").toLowerCase().replaceAll("-","_");
  // A single explicitly restricted flag excludes the site altogether.
  const restricted=forbiddenCategories.has(cat)||poi.permanentlyClosed===true||
   access.private===true||access.foot==="no"||access.foot==="private"||
   overlay.privateResidential===true||overlay.restrictedZone===true||
   overlay.schoolGrounds===true||overlay.water===true||overlay.railTrack===true||
   overlay.motorway===true||overlay.emergencyAccess===true||overlay.sensitive===true;
  if(restricted)return null;
  if(confidence!==null&&confidence<POLICY.minimumExistenceConfidence)return null;
  const entrance=poi.entrance&&point(poi.entrance.point)?poi.entrance:null;
  const stablePoint=entrance?.point||poi.point;
  // Walk-up requires positive, corroborated *path* and legal/public-access evidence.
  // Unknown means REMOTE-ONLY; never infer public access from a missing tag.
  const walkup=access.publicPedestrian===true&&access.restrictionUnknown!==true&&
   walking.connectedToPublicNetwork===true&&walking.footAllowed===true&&
   finite(walking.metersToEntrance)&&walking.metersToEntrance>=0&&
   walking.metersToEntrance<=POLICY.maximumPathDistanceMeters&&
   entrance?.publiclyApproachable===true&&
   (confidence===null?poi.source==="municipal":confidence>=POLICY.minimumWalkupConfidence);
  const reasons=[];
  if(!walkup)reasons.push("no_verified_public_pedestrian_approach");
  if(confidence===null)reasons.push("existence_confidence_unknown");
  if(entrance===null)reasons.push("verified_entrance_missing");
  const weight=MAP[kind].weight;
  const name=String(poi.name||"").trim().slice(0,90);
  return {id,source:poi.source||"unknown",name,category:kind,nodeType:MAP[kind].nodeType,
   rawPoint:poi.point,walkupPoint:walkup?stablePoint:null,
   // remote-only feature intentionally supplies no exact gameplay location:
   location:walkup?stablePoint:null,mode:walkup?"walkup_candidate":"remote_only",
   confidence,score:weight+(name?8:0)+(walkup?20:0)+Math.floor((confidence??.7)*9),
   reasons,sourceLicense:poi.sourceLicense||null};
 }
 function choose({zoneId,center,pois=[],options={}}){
  if(!point(center)||!zoneId||!Array.isArray(pois)||pois.length>100000)throw Error("Invalid zone input");
  const cfg={...POLICY,...options};
  if(!Number.isInteger(cfg.maximumPhysical)||cfg.maximumPhysical<1||cfg.maximumPhysical>100||
   !finite(cfg.radiusMeters)||cfg.radiusMeters<200||cfg.radiusMeters>15000)throw Error("Invalid zone limits");
  const possibilities=pois.map(candidate).filter(Boolean)
   .filter(c=>meters(center,c.rawPoint)<=cfg.radiusMeters)
   .sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id,"en"));
  const unique=[];
  const seen=new Set();
  for(const c of possibilities){
   const key=c.id;
   if(seen.has(key))continue;
   seen.add(key);
   const clash=unique.find(x=>meters(c.rawPoint,x.rawPoint)<cfg.duplicatesMeters&&
     (meters(c.rawPoint,x.rawPoint)<12||
      x.name.toLocaleLowerCase()===c.name.toLocaleLowerCase()));
   if(!clash)unique.push(c);
  }
  // Deterministic greedy selection balancing category, distance, confidence and quality.
  const selected=[],used=new Set(),counts={};
  while(selected.length<cfg.maximumPhysical){
   let best=null,bestScore=-Infinity;
   for(const c of unique){
    if(used.has(c.id))continue;
    const existing=selected.filter(s=>s.location&&c.location?meters(s.location,c.location)<cfg.minimumSpacingMeters:
      meters(s.rawPoint,c.rawPoint)<cfg.minimumSpacingMeters);
    if(existing.length)continue;
    const same=counts[c.category]||0;
    if(selected.length>=5&&(same+1)/(selected.length+1)>cfg.maximumCategoryFraction)continue;
    const preference=c.score-same*14+
     (c.mode==="walkup_candidate"?12:0)+
     ((hash(String(zoneId)+":"+c.id)%1000)/10000);
    if(preference>bestScore){best=c;bestScore=preference;}
   }
   if(!best)break;
   selected.push(best);used.add(best.id);counts[best.category]=(counts[best.category]||0)+1;
  }
  // Strip exact source POI coordinates from remote gameplay payloads.
  // The offline importer may retain raw coordinates securely for data refresh,
  // but the client should only receive stable IDs, types and coarse zone context.
  const physical=selected.filter(c=>c.mode==="walkup_candidate").map(({rawPoint,...v})=>v);
  const remote=selected.filter(c=>c.mode==="remote_only").map(({rawPoint,walkupPoint,...v})=>v);
  // Fallback Echoes are ONLY abstract game objects for region-local remote gameplay.
  // No GPS coordinate, marker to physically visit or invented real-world place.
  const echoCount=Math.max(6,Math.min(20,cfg.targetTotal-selected.length));
  const echoes=Array.from({length:echoCount},(_,i)=>({
   id:"echo:"+zoneId+":"+i,kind:"virtual_echo",mode:"remote_only",
   coordinate:null,nodeType:["Archive","Grove","Prism","Observer","Relay","Commons"][(hash(String(zoneId)+":"+i))%6]
  }));
  return {version:VERSION,zoneId,physical,remote,echoes,
   stats:{sourceRecords:pois.length,eligible:unique.length,walkupCandidates:physical.length,
    remoteCandidates:remote.length,virtualEchoes:echoes.length},
   warning:"Generated anchors are candidates, not a guarantee of safety or legal access. Walk-up needs dynamic ground-truth checks and always has a remote alternative."};
 }
 return {POLICY,MAP,VERSION,point,meters,typeOf,candidate,choose};
});
