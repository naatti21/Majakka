import '../walk-energy.js';
import {createWallet,grantEarnedLumen,channelLumen,WALLET_LIMITS} from '../game-rules/wallet.mjs';
import {distanceKm} from '../game-rules/geo.mjs';

export const pilot=Object.freeze({version:'s1.1',reach:150,maxAge:20000,speed:4.5});
const geo=p=>({latitude:p.lat,longitude:p.lng});
const distance=(a,b)=>distanceKm(geo(a),geo(b))*1000;
export function validFix(fix,now){
 return fix&&Number.isFinite(fix.lat)&&Math.abs(fix.lat)<=90&&Number.isFinite(fix.lng)&&Math.abs(fix.lng)<=180&&
 Number.isFinite(fix.accuracy)&&fix.accuracy>=0&&fix.accuracy<=MajakkaWalkEnergy.MAX_ACCURACY&&
 Number.isFinite(fix.time)&&now>=fix.time&&now-fix.time<=pilot.maxAge&&
 (fix.speed==null||(Number.isFinite(fix.speed)&&fix.speed>=0&&fix.speed<=pilot.speed));
}
export function reach(fix,node,now){
 return Boolean(node?.mode==='walkup'&&node.location&&validFix(fix,now)&&distance(fix,node.location)+fix.accuracy<=pilot.reach);
}
export function motionSession(){
 const walk=MajakkaWalkEnergy.create();
 let prior=null;
 return {
  sample(fix,now){
   if(!validFix(fix,now))return {accepted:false,gain:0};
   if(prior&&(fix.time<=prior.time||distance(fix,prior)>pilot.speed*(fix.time-prior.time)/1000+Math.min(prior.accuracy,fix.accuracy)))return {accepted:false,gain:0};
   prior=fix;
   return {gain:walk.feed(fix).gain,accepted:true};
  },
  clear(){walk.reset();prior=null;}
 };
}
export function initial(){return {schema:1,wallet:createWallet(),studies:[],visits:[],lastMove:0};}
export function validate(s){
 const w=s?.wallet;
 if(s?.schema!==1||!Number.isSafeInteger(w?.balance)||w.balance<0||w.balance>WALLET_LIMITS.cap||
 !Array.isArray(w.earned)||w.earned.some(e=>!Number.isSafeInteger(e?.atMs)||e.atMs<0||!Number.isSafeInteger(e.amount)||e.amount<=0)||
 !(w.lastChannelAtMs===null||Number.isSafeInteger(w.lastChannelAtMs)&&w.lastChannelAtMs>=0)||
 !Number.isSafeInteger(s.lastMove)||s.lastMove<0||
 ![s.studies,s.visits].every(list=>Array.isArray(list)&&list.every(id=>typeof id==='string'&&id.length<180)))throw Error('Unrecognized local record. Saved data was preserved.');
 return s;
}
export function reduce(state,action,now){
 validate(state);
 const s=structuredClone(state);
 if(action.kind==='NodeAction'){
  const {node,mode,fix}=action;
  if(!node?.id||!['study','visit'].includes(mode))throw Error('Unknown node action.');
  if(mode==='visit'&&!reach(fix,node,now))throw Error('A fresh nearby location is required.');
  if(mode==='study'&&action.evidence!==node.mode)throw Error('Review the source and access information before recording the finding.');
  const list=mode==='study'?s.studies:s.visits;
  if(!list.includes(node.id))list.push(node.id);
 }else if(action.kind==='Movement'){
  if(!Number.isSafeInteger(action.time)||action.time<0||action.time>now)throw Error("Invalid movement time.");
  if(action.time<=s.lastMove)return s;
  const grant=grantEarnedLumen(s.wallet,action.gain,now);
  s.wallet=grant.wallet;s.lastMove=action.time;
 }else if(action.kind==='Channel'){
  const credit=channelLumen(s.wallet,now);
  if(!credit.ok)throw Error(credit.reason==='CHANNEL_COOLDOWN'?'Channel is recharging.':'Lumen capacity reached.');
  s.wallet=credit.wallet;
 }else throw Error('Unsupported pilot action.');
 return s;
}
// All tabs serialize read, validation and replacement in one IndexedDB transaction.
export async function openPlayer(){
 const db=await new Promise((resolve,reject)=>{
  const req=indexedDB.open('majakka.gps-world.pilot',1);
  req.onupgradeneeded=()=>req.result.createObjectStore('player');
  req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
 });
 return function transaction(action){
  return new Promise((resolve,reject)=>{
   const tx=db.transaction('player',action?'readwrite':'readonly'),store=tx.objectStore('player');
   let next,problem;
   const req=store.get('local');
   req.onsuccess=()=>{try{
    next=req.result===undefined?initial():validate(req.result);
    if(action){next=reduce(next,action,Date.now());store.put(next,'local');}
   }catch(e){problem=e;tx.abort();}};
   tx.oncomplete=()=>resolve(next);tx.onabort=()=>reject(problem||tx.error||Error('Local storage unavailable.'));
  });
 };
}
