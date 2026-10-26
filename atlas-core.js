/* MAJAKKA Auto Atlas v0.1 — deterministic, source-aware placement rules.
   Real POIs require external documented source. Echoes are fictional and never destinations. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.MajakkaAtlasCore=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const RANGE=1000,MIN_GAP=125,MAX_REAL=24,MIN_ECHO=6,DEG=Math.PI/180,EARTH=6371000;
const types=['art','history','nature','culture'];
function hash(s){let h=2166136261>>>0;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;return h>>>0;}
function valid(p){return !!p&&Number.isFinite(p.lat)&&Number.isFinite(p.lng)&&Math.abs(p.lat)<=80&&Math.abs(p.lng)<=180;}
function meters(a,b){if(!valid(a)||!valid(b))return Infinity;const d=(b.lat-a.lat)*DEG,f=(b.lng-a.lng)*DEG,v=Math.sin(d/2)**2+Math.cos(a.lat*DEG)*Math.cos(b.lat*DEG)*Math.sin(f/2)**2;return 2*EARTH*Math.asin(Math.min(1,Math.sqrt(Math.max(0,v))));}
function add(a,n,e){return {lat:a.lat+n/111320,lng:a.lng+e/(111320*Math.max(.18,Math.cos(a.lat*DEG)))};}
function category(t){
 const v=x=>String(x||'').toLowerCase();
 if(t.tourism==='artwork'||['gallery','arts_centre','theatre'].includes(v(t.amenity)))return 'art';
 if(t.historic||['monument','memorial','archaeological_site'].includes(v(t.tourism)))return 'history';
 if(['nature_reserve','park','garden'].includes(v(t.leisure))||['viewpoint','picnic_site'].includes(v(t.tourism))||t.natural==='tree')return 'nature';
 if(['museum','attraction'].includes(v(t.tourism))||['library','community_centre'].includes(v(t.amenity)))return 'culture';
 return null;
}
function dangerous(t){
 const s=v=>String(v??'').toLowerCase();
 if(['no','private','restricted','military','customers','permit'].includes(s(t.access)))return true;
 if(['no','private','restricted'].includes(s(t.foot)))return true;
 if(t.military||t.landuse==='military'||t.amenity==='prison'||t.amenity==='school'||t.amenity==='kindergarten')return true;
 if(['construction','brownfield','industrial'].includes(s(t.landuse))||s(t.construction)==='yes')return true;
 if(['private','residential'].includes(s(t.ownership))||t.boundary==='protected_area'&&s(t.access)!=='yes')return true;
 if(['yes','true','1'].includes(s(t.abandoned))||['yes','true','1'].includes(s(t.disused)))return true;
 if(['underground','underwater','roof'].includes(s(t.location)))return true;
 return false;
}
function normalize(raw){
 const t=raw.tags||{},pos=raw.center||raw.geometry?.coordinates&&{lng:raw.geometry.coordinates[0],lat:raw.geometry.coordinates[1]}||raw;
 if(!valid(pos)||dangerous(t))return null;
 const type=raw.atlasType||category(t);if(!types.includes(type))return null;
 const id=raw.sourceId!=null?String(raw.sourceId):raw.id!=null?String(raw.id):'';
 if(!id)return null;
 const name=String(raw.name||t.name||t['name:en']||'Unknown place').trim().slice(0,90);
 return {id:'poi-'+(hash(String(raw.source||'osm')+':'+id)).toString(36),sourceId:id,source:raw.source||'osm',lat:pos.lat,lng:pos.lng,name:name||'Unnamed place',type,kind:'atlas-real',remoteOnly:true};
}
function place(center,rawCandidates=[]){
 if(!valid(center))throw Error('Invalid atlas center');
 const input=(Array.isArray(rawCandidates)?rawCandidates:[]).slice(0,3000).map(normalize).filter(Boolean)
   .filter(p=>meters(center,p)<=RANGE);
 const uniques=new Map();for(const n of input)if(!uniques.has(n.id))uniques.set(n.id,n);
 const pools=types.map(type=>[...uniques.values()].filter(p=>p.type===type).sort((a,b)=>hash(a.id)-hash(b.id)||a.id.localeCompare(b.id)));
 const real=[],seen=new Set();
 // Category round-robin avoids city-center overrepresentation.
 while(real.length<MAX_REAL&&pools.some(p=>p.length)){
  for(const list of pools){
   while(list.length){
    const candidate=list.shift();if(seen.has(candidate.id))continue;seen.add(candidate.id);
    if(real.every(n=>meters(n,candidate)>=MIN_GAP)){real.push(candidate);break;}
   }
   if(real.length>=MAX_REAL)break;
  }
 }
 // Global fixed lattice. Echoes are stable when the viewing circle moves.
 const cell=275,R=6378137,phi=center.lat*DEG,x=R*center.lng*DEG,y=R*Math.log(Math.tan(Math.PI/4+phi/2));
 const projectedRadius=RANGE/Math.max(.18,Math.cos(phi)),echoes=[];
 const gx0=Math.floor((x-projectedRadius-350)/cell),gx1=Math.ceil((x+projectedRadius+350)/cell);
 const gy0=Math.floor((y-projectedRadius-350)/cell),gy1=Math.ceil((y+projectedRadius+350)/cell);
 for(let gx=gx0;gx<=gx1;gx++)for(let gy=gy0;gy<=gy1;gy++){
  const h=hash('echo|'+gx+':'+gy),jx=((h&255)/255-.5)*55,jy=(((h>>>8)&255)/255-.5)*55;
  const mx=(gx+.5)*cell+jx,my=(gy+.5)*cell+jy;
  const point={lat:(2*Math.atan(Math.exp(my/R))-Math.PI/2)/DEG,lng:(mx/R)/DEG};
  if(!valid(point)||meters(center,point)>RANGE-40)continue;
  echoes.push({...point,id:'atlas-echo-'+gx+'-'+gy,name:'Unmapped Echo',kind:'atlas-echo',type:types[h%4],remoteOnly:true});
 }
 echoes.sort((a,b)=>meters(center,a)-meters(center,b)||a.id.localeCompare(b.id));
 // Real nodes win placement, but preserve the minimum six fictional tasks in sparse areas.
 const sparse=real.length<6,wanted=sparse?MIN_ECHO:0;
 const chosen=[];
 for(const e of echoes)if(chosen.length<wanted&&[...real,...chosen].every(p=>meters(p,e)>=MIN_GAP))chosen.push(e);
 return {real,echoes:chosen,center:{lat:center.lat,lng:center.lng},source:'candidate-based',radius:RANGE};
}
return {RANGE,MIN_GAP,MAX_REAL,MIN_ECHO,types,meters,category,dangerous,normalize,place};
});