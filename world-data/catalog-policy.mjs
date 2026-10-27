// Gate 2 / PR-05: canonical published-site validation, not live OSM ingestion.
// Camera/GPS data NEVER creates a site; fixture-only locations are rejected by default.
import {distanceKm,validateCoordinates} from '../game-rules/geo.mjs';
export const SITE_KINDS=Object.freeze(['real_place','regional_phenomenon']);
export const SITE_CATEGORIES=Object.freeze(['Nature','History','Art','Culture','Regional']);
const unsafeKinds=new Set(['private_home','school','healthcare','emergency_access','restricted_access','military','sensitive']);
function string(v,label,max=200){
 if(typeof v!=='string'||v.length===0||v.length>max||v.trim()!==v||
  /[\u0000-\u001f\u007f-\u009f\ud800-\udfff]/u.test(v))throw new TypeError('Invalid '+label);
 return v;
}
function record(x,label){if(!x||typeof x!=='object'||Array.isArray(x))throw new TypeError('Invalid '+label);return x;}
function sourceKey(s){
 record(s,'source');
 const ns=string(s.namespace,'namespace',40),key=string(s.sourceId,'sourceId',200);
 return JSON.stringify([ns,key]);
}
function siteFromRaw(raw,{allowFixtures}){
 const s=record(raw,'site');
 const id=string(s.id,'canonical ID',160),kind=string(s.kind,'kind',32);
 if(kind==='test_site'&&!allowFixtures)throw new RangeError('Fixture-only site cannot be published');
 if(kind!=='test_site'&&!SITE_KINDS.includes(kind))throw new RangeError('Unknown site kind');
 const category=string(s.category,'category',32);
 if(!SITE_CATEGORIES.includes(category))throw new RangeError('Unknown category');
 const name=string(s.name,'name');
 const geo=validateCoordinates(s.geo);
 if(unsafeKinds.has(s.safetyClass))throw new RangeError('Sensitive/restricted site must be excluded');
 if(s.safetyClass!=='reviewed_public'&&s.safetyClass!=='remote_only')
  throw new RangeError('Access safety not reviewed: must default remote_only explicitly');
 const visitAllowed=s.safetyClass==='reviewed_public';
 if(s.walkable!==visitAllowed)throw new RangeError('Walking suggestion must match access review');
 if(kind==='real_place'){
  if(category==='Regional')throw new RangeError('Real place must use a real-place category');
  const sources=record(s.source,'source metadata');
  sourceKey(sources);
  if(typeof sources.attribution!=='string'||!sources.attribution.trim())
   throw new TypeError('Real places require source attribution');
  if(typeof sources.license!=='string'||!sources.license.trim())
   throw new TypeError('Real places require an explicit license review label');
  if(s.safetyClass==='reviewed_public'&&s.accessReview!=='verified')
   throw new RangeError('A real public visit requires verified access review');
 }else if(kind==='regional_phenomenon'){
  if(category!=='Regional'||s.safetyClass!=='remote_only'||s.walkable)
   throw new RangeError('Fictional region is not a physical walkable place');
  string(s.regionId,'published region id',160);
  if(s.fictionLabel!=='Fictional regional signal')
   throw new RangeError('Region must be explicitly labelled fictional');
  if(s.source)throw new RangeError('A fictional signal must not impersonate a real data source');
 }else{
  if(category==='Regional'||s.safetyClass!=='remote_only'||s.walkable)
   throw new RangeError('Test sites are not walking targets or real regional phenomena');
  if(s.source)throw new RangeError('Synthetic fixtures cannot claim real source records');
 }
 const aliases=[];
 if(kind==='real_place'){
  const all=[s.source,...(s.aliases||[])];
  if(!Array.isArray(s.aliases||[]))throw new TypeError('aliases must be a list');
  for(const source of all)aliases.push(sourceKey(source));
  if(new Set(aliases).size!==aliases.length)throw new RangeError('Duplicate source alias');
 }
 return Object.freeze({...s,id,kind,category,name,geo:Object.freeze(geo),
  sourceAliases:aliases,visitAllowed});
}
export function validateCatalog(input,{allowFixtures=false}={}){
 const x=record(input,'catalog');
 const version=string(x.version,'catalog version',100);
 if(!Array.isArray(x.sites)||x.sites.length<1)throw new RangeError('Catalog needs published site records');
 if(allowFixtures!==true&&x.fixtureOnly===true)throw new RangeError('A fixture cannot be published');
 if(allowFixtures===true&&x.fixtureOnly!==true)throw new RangeError('Fixture validation requires fixtureOnly:true');
 const sites=new Map(),aliases=new Map(),regional=new Map();
 for(const raw of x.sites){
  const s=siteFromRaw(raw,{allowFixtures});
  if(sites.has(s.id))throw new RangeError('Duplicate immutable site ID');
  sites.set(s.id,s);
  for(const alias of s.sourceAliases){
   if(aliases.has(alias))throw new RangeError('Source alias maps to more than one world node');
   aliases.set(alias,s.id);
  }
  if(s.kind==='regional_phenomenon'){
   if(regional.has(s.regionId))throw new RangeError('Only one published regional phenomenon per region');
   regional.set(s.regionId,s.id);
  }
 }
 return Object.freeze({version,fixtureOnly:x.fixtureOnly===true,
  sites:Object.freeze([...sites.values()].sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0)),
  byId:sites,aliases,regional});
}
export function assessCoverage(catalog,center,{localRadiusKm=15,reachableRadiusKm=50,authoredResearch=false}={}){
 if(!catalog?.sites)throw new TypeError('Published catalog required');
 const home=validateCoordinates(center);
 for(const radius of [localRadiusKm,reachableRadiusKm])
  if(!Number.isFinite(radius)||radius<=0)throw new RangeError('Bad coverage radius');
 if(reachableRadiusKm<localRadiusKm)throw new RangeError('Reach must cover local radius');
 const available=catalog.sites
  .filter(s=>s.safetyClass==='reviewed_public'||s.safetyClass==='remote_only')
  .map(s=>({id:s.id,kind:s.kind,km:distanceKm(home,s.geo)}))
  .sort((a,b)=>a.km-b.km||(a.id<b.id?-1:1));
 const local=available.filter(s=>s.km<=localRadiusKm);
 const reachable=available.filter(s=>s.km<=reachableRadiusKm);
 const nearHome=available.some(s=>s.km<=5);
 const enough=reachable.length>=3 && nearHome;
 const needsResearch=reachable.some(s=>s.km>5);
 return {localCount:local.length,reachableCount:reachable.length,
  nearHome,needsRegionalSupport:local.filter(s=>s.kind==='real_place').length<2,
  requiresRemoteResearch:needsResearch,
  readyForPilot:enough&&(!needsResearch||authoredResearch===true),
  status:!enough?'INSUFFICIENT_PUBLISHED_SITES':
   needsResearch&&!authoredResearch?'MISSING_AUTHORED_RESEARCH':'READY_FOR_PILOT',
  nearestIds:reachable.map(s=>s.id).slice(0,3)};
}
export function resolveSourceAlias(catalog,source){
 const alias=sourceKey(source);
 return catalog.aliases.get(alias)??null;
}
