/* Majakka Solo Echo Alpha v0.10.1 — persistent local node gameplay.
 * Online map, one world, no requirement for multiplayer server or GPS.
 * Shared and solo Echo balances are distinct; this module is active ONLY
 * if no verified shared backend is configured.
 */
(()=>{
'use strict';
const Atlas=globalThis.MajakkaAtlasCore,key='majakka-solo-echo-v1';
const limit=1100,CHARGE=2;
if(!Atlas)return;
let states={};
try{
 const parsed=JSON.parse(localStorage.getItem(key)||'null');
 if(parsed&&parsed.v===1&&parsed.nodes&&typeof parsed.nodes==='object'&&!Array.isArray(parsed.nodes)){
  for(const [id,value] of Object.entries(parsed.nodes).slice(-limit)){
   if(Atlas.echoById(id)&&Number.isInteger(value?.charge)&&value.charge>=0&&value.charge<=CHARGE){
    states[id]={charge:value.charge,updatedAt:Number(value.updatedAt)||0};
   }
  }
 }
}catch{}
function active(){return navigator.onLine!==false&&!globalThis.MajakkaSharedWorld?.enabled?.();}
function get(id){return Atlas.echoById(id)?{node_id:id,charge:states[id]?.charge||0,revision:states[id]?.charge||0,updated_at:states[id]?.updatedAt||0}:null;}
function save(){
 try{
  const entries=Object.entries(states).sort((a,b)=>b[1].updatedAt-a[1].updatedAt).slice(0,limit);
  states=Object.fromEntries(entries);
  localStorage.setItem(key,JSON.stringify({v:1,nodes:states}));
  return true;
 }catch{return false;}
}
function attune(id){
 if(!active())return {ok:false,reason:'Online connection required'};
 if(!Atlas.echoById(id))return {ok:false,reason:'Unknown Echo'};
 const previous=states[id]?.charge||0;
 if(previous>=CHARGE)return {ok:false,reason:'This Echo is already awake'};
 const wallet=globalThis.MajakkaLiving;
 if(!wallet?.spend)return {ok:false,reason:'The Lumen wallet is still loading'};
 if((wallet.balance?.()||0)<2)return {ok:false,reason:'Need 2 Lumen. Use Channel Lumen to gather more'};
 // Persist first so failure cannot consume a user's Lumen.
 const prior=states[id];states[id]={charge:previous+1,updatedAt:Date.now()};
 if(!save()){if(prior)states[id]=prior;else delete states[id];return {ok:false,reason:'Storage unavailable. Echo was not charged'};}
 if(!wallet.spend(2)){
  if(prior)states[id]=prior;else delete states[id];save();
  return {ok:false,reason:'Insufficient Lumen'};
 }
 window.dispatchEvent(new Event('majakka:solo-update'));
 const charge=previous+1;
 globalThis.MajakkaFeedback?.play?.(charge>=CHARGE?'field':'attune');
 if(typeof notify==='function')notify(charge===CHARGE?'Echo awakened ✧':'Echo resonance '+charge+'/'+CHARGE);
 return {ok:true,charge,awake:charge===CHARGE,remaining:wallet.balance()};
}
globalThis.MajakkaSoloWorld={active,get,attune,counts:()=>({attuned:Object.keys(states).length,awake:Object.values(states).filter(x=>x.charge>=CHARGE).length})};
window.dispatchEvent(new Event('majakka:solo-update'));
})();