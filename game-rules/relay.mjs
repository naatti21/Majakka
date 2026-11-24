// Majakka Gate 1 PR-03: bounded, deterministic relay reach through committed links.
// A pure candidate, not a world-sized query engine or authentication layer.
import config from './balance-config.json' with {type:'json'};
import {distanceKm,e,validateCoordinates} from './geo.mjs';
const P=config.parameters;
const allowed=id=>typeof id==='string'&&id.length>0;
const finite=(v)=>Number.isFinite(v)&&v>=0;
function liveLinks(nodes,links){
 const edges=[],vertices=new Set();
 for(const link of Object.values(links||{})){
  if(!link||link.status!=='Committed'||!allowed(link.a)||!allowed(link.b)||link.a===link.b)continue;
  if(!nodes?.[link.a]||!nodes?.[link.b])continue;
  if(nodes[link.a].status!=='Awakened'||nodes[link.b].status!=='Awakened')continue;
  const length=distanceKm(nodes[link.a].geo,nodes[link.b].geo);
  const cost=P.relay_edge_penalty_km+P.relay_attenuation_distance_fraction*length;
  if(!finite(cost)||cost<=0)continue;
  edges.push({a:link.a,b:link.b,cost});vertices.add(link.a);vertices.add(link.b);
 }
 return {edges,vertices:[...vertices].sort()};
}
export function effectiveReach(home,target,nodes={},links={},maxHops=P.relay_max_hops){
 const a=validateCoordinates(home),b=validateCoordinates(target);
 if(!Number.isSafeInteger(maxHops)||maxHops<0||maxHops>6)throw new RangeError('Invalid relay hop budget');
 const directKm=distanceKm(a,b),direct=e(directKm);
 if(maxHops===0)return {effectiveness:direct,direct,relay:0,directKm,relayVirtualKm:null,hops:0};
 const {edges,vertices}=liveLinks(nodes,links);
 if(!edges.length)return {effectiveness:direct,direct,relay:0,directKm,relayVirtualKm:null,hops:0};
 // Shortest path with a hop limit: entering and exiting the published graph
 // are charged at their full real-world geographic distances. Each completed
 // edge has strictly positive virtual length, so an optimal route has no cycles.
 let distances=new Map(vertices.map(id=>[id,distanceKm(a,nodes[id].geo)]));
 let minKm=Infinity,bestHops=0;
 const evaluate=(v,hops)=>{
  for(const id of vertices){
   const d=v.get(id)+distanceKm(nodes[id].geo,b);
   if(d<minKm){minKm=d;bestHops=hops;}
  }
 };
 for(let step=1;step<=maxHops;step++){
  const next=new Map();
  for(const {a:x,b:y,cost} of edges){
   const f=distances.get(x)+cost,g=distances.get(y)+cost;
   if(f<(next.get(y)??Infinity))next.set(y,f);
   if(g<(next.get(x)??Infinity))next.set(x,g);
  }
  if(next.size===0)break;
  evaluate(next,step);
  distances=next;
 }
 const relay=Math.min(P.relay_max_effectiveness,e(minKm));
 return {effectiveness:Math.max(direct,relay),direct,relay,directKm,
  relayVirtualKm:Number.isFinite(minKm)?minKm:null,
  hops:relay>direct?bestHops:0};
}
