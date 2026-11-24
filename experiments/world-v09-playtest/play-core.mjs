// Isolated local playtest; never use as server authority or production economy.
export const NODES=Object.freeze(['relay','grove','prism']);
export const EDGES=Object.freeze([Object.freeze(['relay','grove']),Object.freeze(['relay','prism']),Object.freeze(['grove','prism'])]);
export const COST=2, START_LUMEN=6, KEY='majakka.world-v09.playtest.v1';
export function initial(){return {version:1,restored:[],stage:0};}
export function valid(s){
 return !!s&&s.version===1&&Array.isArray(s.restored)&&s.restored.length<=3&&
 new Set(s.restored).size===s.restored.length&&s.restored.every(x=>NODES.includes(x))&&
 Number.isInteger(s.stage)&&s.stage>=0&&s.stage<=3&&
 EDGES.slice(0,s.stage).every(e=>e.every(x=>s.restored.includes(x)));
}
export function lumen(s){return START_LUMEN-COST*s.restored.length;}
export function nextEdge(s){return EDGES[s.stage]??null;}
export function transition(s,action){
 if(!valid(s))return {ok:false,reason:'invalid-state',state:s};
 if(action?.type==='restore'){
  const id=action.id;
  if(!NODES.includes(id)||s.restored.includes(id)||lumen(s)<COST)return {ok:false,reason:'unavailable',state:s};
  return {ok:true,state:{...s,restored:[...s.restored,id]}};
 }
 if(action?.type==='link'){
  const edge=nextEdge(s);
  if(!edge||!edge.every(id=>s.restored.includes(id)))return {ok:false,reason:'restore-endpoints',state:s};
  return {ok:true,state:{...s,stage:s.stage+1}};
 }
 return {ok:false,reason:'unknown-action',state:s};
}
export function load(storage){
 try{const raw=storage.getItem(KEY);if(raw===null)return {state:initial(),status:'new'};
 const s=JSON.parse(raw);return valid(s)?{state:s,status:'saved'}:{state:initial(),status:'invalid'};}
 catch{return {state:initial(),status:'unavailable'};}
}
export function save(storage,s){
 if(!valid(s))return false;
 try{storage.setItem(KEY,JSON.stringify(s));return true;}catch{return false;}
}
