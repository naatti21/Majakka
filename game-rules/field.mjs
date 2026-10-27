// Majakka Gate 1 PR-03: world topology, not cartographic shape.
// Fields are formed by three committed edges, irrespective of size,
// overlap, crossing, zoom or player camera position.
import {linkId,fieldId} from './identity.mjs';
export const FIELD_AREA_LUMEN=0;
export function isCommitted(links,a,b){
 const link=links?.[linkId(a,b)];
 return Boolean(link&&link.status==='Committed'&&
  link.a!==link.b&&
  ((link.a===a&&link.b===b)||(link.a===b&&link.b===a)));
}
export function isClosedField(links,a,b,c){
 if(new Set([a,b,c]).size!==3)throw new RangeError('Three distinct world nodes required');
 return isCommitted(links,a,b)&&isCommitted(links,b,c)&&isCommitted(links,c,a);
}
// Read only the neighbours of the latest committed edge. Do not scan
// all triples in a world containing millions of possible nodes.
export function fieldsClosedByLink(links,a,b){
 if(!isCommitted(links,a,b))return [];
 const aNeighbours=new Set(),bNeighbours=new Set();
 for(const link of Object.values(links||{})){
  if(link?.status!=='Committed')continue;
  if(link.a===a&&link.b!==b)aNeighbours.add(link.b);
  if(link.b===a&&link.a!==b)aNeighbours.add(link.a);
  if(link.a===b&&link.b!==a)bNeighbours.add(link.b);
  if(link.b===b&&link.a!==a)bNeighbours.add(link.a);
 }
 const out=[];
 for(const c of aNeighbours){
  if(c===a||c===b||!bNeighbours.has(c))continue;
  if(!isClosedField(links,a,b,c))continue;
  out.push({id:fieldId(a,b,c),nodes:[a,b,c].sort(),status:'Committed'});
 }
 out.sort((x,y)=>x.id<y.id?-1:x.id>y.id?1:0);
 return out;
}
export function readField(links,a,b,c){
 return isClosedField(links,a,b,c)?{id:fieldId(a,b,c),nodes:[a,b,c].sort(),status:'Committed'}:null;
}
