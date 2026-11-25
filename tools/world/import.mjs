// Developer-side batch only. The private source geometry never enters regional chunks.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import '../../atlas-autogen.js';
import {validateCatalog} from '../../world-data/catalog-policy.mjs';

const atlas=globalThis.MajakkaAtlasAutoGen;
import accessReviews from './access-reviews.json' with {type:'json'};
const osm='https://www.openstreetmap.org/';
const revision='e684e4e04487adf1984c3cdedc05cfe5e92e7c32';
export const regions=[
  {id:'tampere',name:'Tampere',bounds:[23.70,61.47,23.84,61.53]},
  {id:'nokia',name:'Nokia',bounds:[23.32,61.43,23.60,61.51]},
  {id:'ruovesi',name:'Ruovesi',bounds:[23.70,61.94,24.05,62.12]}
];
// Independent municipality access review is bound to one specific geometry revision.
// The anchor must be the same vertex of the park, public square and pedestrian path.
export function pedestrianEntrance(ways,review){
 const park=ways.get(review.siteId),path=ways.get(review.pathId),square=ways.get(review.pedestrianAreaId);
 if(park?.tags.name!==review.siteName||path?.tags.highway!=='footway'||square?.tags.highway!=='pedestrian')return null;
 if([park,path,square].some(w=>restricted(w.tags)))return null;
 const same=(a,b)=>a.lat===b.lat&&a.lon===b.lon;
 const shared=path.geometry.filter(p=>park.geometry.some(v=>same(v,p))&&square.geometry.some(v=>same(v,p)));
 return shared.length===1?{lat:shared[0].lat,lng:shared[0].lon}:null;
}
function restricted(t){
 return ['private','no','customers','permit'].includes(t.access)||['no','private'].includes(t.foot)||
 ['school','kindergarten','hospital','prison','fire_station','police','grave_yard'].includes(t.amenity)||
 ['military','cemetery','residential'].includes(t.landuse)||Boolean(t.railway||t.waterway||t.military||t.barrier)||
 t.natural==='water'||['residential','house','apartments','school'].includes(t.building);
}
const category={Grove:'Nature',Relay:'Nature',Archive:'History',Prism:'Art',Observer:'Nature',Commons:'Culture'};
export function build(elements,coarse=[],{omitIds=[]}={}){
 const ways=new Map(),conflicts=new Set();
 for(const w of elements){
  if(ways.has(w.id)&&JSON.stringify(ways.get(w.id))!==JSON.stringify(w))conflicts.add(w.id);
  else ways.set(w.id,w);
 }
 for(const id of conflicts)ways.delete(id);
 const reviews=new Map(accessReviews.map(r=>[r.siteId,r]));
 const rejects={conflicts:conflicts.size,excluded:0,unclassified:0,selection:0},candidates=[];
 for(const w of ways.values()){
  if(!w.tags?.name||w.type!=='way'||!w.geometry?.length)continue;
  if(restricted(w.tags)){rejects.excluded++;continue;}
  const id='osm:way/'+w.id;
  const p={id,name:w.tags.name,source:'osm',tags:w.tags,point:{lat:w.geometry[0].lat,lng:w.geometry[0].lon},sourceLicense:'ODbL-1.0'};
  if(omitIds.includes(id)){rejects.excluded++;continue;}
  const review=reviews.get(w.id),entrance=review&&pedestrianEntrance(ways,review);
  if(entrance) Object.assign(p,{
   source:'municipal',point:entrance,entrance:{point:entrance,publiclyApproachable:true},
   walking:{connectedToPublicNetwork:true,footAllowed:true,metersToEntrance:0},
   access:{publicPedestrian:true}});
  if(!atlas.candidate(p)){rejects.unclassified++;continue;}
  candidates.push(p);
 }
 const selection=atlas.choose({zoneId:'tampere',center:{lat:61.5,lng:23.76},pois:candidates});
 rejects.selection=candidates.length-selection.physical.length-selection.remote.length;
 const data={tampere:[],nokia:[],ruovesi:[]}, privateSites=[];
 function add(region,id,name,type,source,point,location,aliases=[],review){
  if(omitIds.includes(id))return;
  const site={id,kind:'real_place',category:category[type],name,geo:{latitude:point.lat,longitude:point.lng},
   safetyClass:location?'reviewed_public':'remote_only',walkable:Boolean(location),accessReview:location?'verified':undefined,
   source,aliases};
  privateSites.push(site);
  // Explicit public projection. No unreviewed source geometry, distance or centroid.
  data[region].push({id,name,type,source,aliases,mode:location?'walkup':'remote',...(location?{location,review}:{})});
 }
 for(const p of [...selection.physical,...selection.remote]){
  const key=p.id.slice(4);
  const source={namespace:'osm',sourceId:key,attribution:'OpenStreetMap contributors',url:osm+key,license:'ODbL-1.0',date:'2026-11-09'};
  const review=reviews.get(Number(key.split('/')[1]));
  const aliases=review?[{namespace:review.provider,sourceId:review.sourceId}]:[];
  add('tampere',p.id,p.name,p.nodeType,source,candidates.find(c=>c.id===p.id).point,p.location,aliases,review?.url);
 }
 for(const p of coarse){
  if(!['nokia','ruovesi'].includes(p.region)||!/^Q\d+$/.test(p.id))throw Error('Invalid regional source');
  const kind=atlas.typeOf({category:p.category});
  if(!kind)throw Error('Unknown category');
  add(p.region,'wikidata:'+p.id,p.name,atlas.MAP[kind].nodeType,{namespace:'wikidata',sourceId:p.id,
   attribution:'Wikidata',license:'CC0-1.0',date:p.date,url:'https://www.wikidata.org/wiki/'+p.id},p.point,null);
 }
 if(privateSites.length)validateCatalog({version:'s1',sites:privateSites});
 for(const rows of Object.values(data))rows.sort((a,b)=>a.id.localeCompare(b.id,'en'));
 return {data,rejects};
}
const digest=s=>createHash('sha256').update(s).digest('hex').slice(0,16);
export async function emit(root,batch){
 await mkdir(root,{recursive:true});
 const entries=[];
 for(const area of regions){
  const json=JSON.stringify(batch.data[area.id])+'\n';
  const file=area.id+'-'+digest(json)+'.json';
  await writeFile(root+'/'+file,json);
  entries.push({...area,file});
 }
 await writeFile(root+'/manifest.json',JSON.stringify({version:digest(JSON.stringify(entries)),regions:entries},null,2)+'\n');
}
// A reduced real street basemap for the Tampere pilot when online tiles fail.
function basemap(elements){
 const features=[];
 for(const {geometry,tags:t} of elements){
  const area=geometry.length>3&&geometry[0].lat===geometry.at(-1).lat&&geometry[0].lon===geometry.at(-1).lon;
  const kind=t.highway?'street':area&&(t.natural==='water'||t.waterway==='riverbank')?'water':
   area&&t.building?'building':area&&t.leisure==='park'?'park':null;
  if(!kind)continue;
  const coords=geometry.map(p=>[p.lon,p.lat]);
  features.push({type:'Feature',properties:{kind,...(kind==='street' && t.name?{name:t.name}:{})},geometry:kind==='street'?{type:'LineString',coordinates:coords}:{type:'Polygon',coordinates:[coords]}});
 }
 return {type:'FeatureCollection',features};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const raw=process.argv[2]?await readFile(process.argv[2]):execFileSync('git',['show',revision+':native-client/assets/maps/tampere-vector-pilot.json'],{maxBuffer:3e6});
 // The municipality review applies only to the pinned developer extract.
 const pinnedHash='8753f43afcc9104f19c8bc01e0e6dc822b9dc4a6287133528c0ebdc973068cc7';
 if(createHash('sha256').update(raw).digest('hex')!==pinnedHash)throw Error('Re-review source revision before generating walk-up anchors');
 const {elements}=JSON.parse(raw);
 const coarse=JSON.parse(await readFile(process.argv[3]??'tools/world/regional-sources.json'));
 const omitIds=JSON.parse(await readFile(new URL('./withdrawn.json',import.meta.url)));
 const batch=build(elements,coarse,{omitIds});
 await emit('world/data',batch);
 await writeFile('world/data/tampere-streets.geojson',JSON.stringify(basemap(elements)));
 console.log({sourceWays:elements.length,rejects:batch.rejects,regions:Object.fromEntries(Object.entries(batch.data).map(([k,v])=>[k,{walkup:v.filter(p=>p.location).length,remote:v.filter(p=>!p.location).length}]))});
}
