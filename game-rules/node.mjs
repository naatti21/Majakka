// Majakka Gate 1 PR-02. Deterministic, immutable candidate reducer.
// NOT an API security boundary: identity, time, proof grant and atomic DB commit
// must be supplied/verified by an authoritative server in Gate 3.
import config from './balance-config.json' with { type: 'json' };
import {distanceKm,e,validateCoordinates} from './geo.mjs';
import {createWallet,spendLumen,channelLumen} from './wallet.mjs';
import {RESEARCH_STAGES,researchKey,verifiedResearchGrant,researchCreditUnits,researchCost} from './research.mjs';
const P=config.parameters;
export const CHARGE_SCALE=10000;
export const HOUR_MS=3600000;
const own=(obj,key)=>Object.prototype.hasOwnProperty.call(obj||{},key);
function textId(value){
 if(typeof value!=='string'||value.length<1||value.length>160||value.trim()!==value||/[\u0000-\u001f\u007f]/u.test(value))throw new TypeError('Invalid identity');
 return value;
}
function trustedTime(value){
 if(!Number.isSafeInteger(value)||value<0)throw new TypeError('Expected authoritative UTC milliseconds');
 return value;
}
export function createPlayer(home,initialLumen=P.wallet_start){
 return {home:validateCoordinates(home),wallet:createWallet(initialLumen),lastNodePulses:{},usedResearch:{}};
}
export function createWorldNode(geo,chargeUnits=0){
 if(!Number.isSafeInteger(chargeUnits)||chargeUnits<0||chargeUnits>CHARGE_SCALE)throw new RangeError('Invalid node charge');
 return {geo:validateCoordinates(geo),chargeUnits,status:chargeUnits===CHARGE_SCALE?'Awakened':'Dormant'};
}
export function createRulesState({players={},nodes={},researchGrants={}}={}){
 return {players:{...players},nodes:{...nodes},researchGrants:{...researchGrants},receipts:{}};
}
export function applyNodeAction(state,action){
 if(!state||!action||typeof action!=='object')throw new TypeError('Missing state or action');
 const actorId=textId(action.actorId),operationId=textId(action.operationId);
 const type=action.type;
 if(!['ATTUNE','RESEARCH','CHANNEL'].includes(type))throw new RangeError('Unsupported action');
 const now=trustedTime(action.nowMs);
 const targetId=type==='CHANNEL'?null:textId(action.nodeId);
 const stage=type==='RESEARCH'?action.stage:null;
 if(type==='RESEARCH'&&!RESEARCH_STAGES.includes(stage))throw new RangeError('Unknown research stage');
 // Clock is server-verified; neither camera, client GPS nor action-provided
 // coordinates are ever used to select the home anchor or target geometry.
 const key=JSON.stringify([actorId,operationId]);
 const signature=JSON.stringify([type,targetId,stage]);
 const old=state.receipts?.[key];
 if(old)return old.signature===signature?{state,result:{...old.result,replayed:true}}:
  {state,result:{ok:false,code:'OPERATION_ID_CONFLICT'}};
 if(!own(state.players,actorId))return {state,result:{ok:false,code:'UNKNOWN_ACTOR'}};
 const player=state.players[actorId],wallet=player.wallet;
 let nextWallet=wallet,nextNode=null,nextPlayer=null,result=null;
 if(type==='CHANNEL'){
  const channel=channelLumen(wallet,now);
  if(!channel.ok)return {state,result:{ok:false,code:channel.reason,availableAtMs:channel.availableAtMs??null}};
  nextWallet=channel.wallet;
  result={ok:true,code:'CHANNELLED',granted:channel.granted,balance:nextWallet.balance};
 }else{
  if(!own(state.nodes,targetId))return {state,result:{ok:false,code:'UNKNOWN_NODE'}};
  const node=state.nodes[targetId];
  if(!node||!Number.isSafeInteger(node.chargeUnits)||node.chargeUnits<0||node.chargeUnits>CHARGE_SCALE)
   throw new TypeError('Corrupt canonical node');
  if(node.chargeUnits===CHARGE_SCALE)return {state,result:{ok:false,code:'ALREADY_AWAKENED'}};
  let units,cost;
  if(type==='ATTUNE'){
   const last=player.lastNodePulses?.[targetId];
   if(last!==undefined){
    trustedTime(last);
    if(now<last)throw new RangeError('Trusted clock moved backwards');
    if(now-last<P.node_attune_cooldown_hours*HOUR_MS)
     return {state,result:{ok:false,code:'PULSE_COOLDOWN',availableAtMs:last+P.node_attune_cooldown_hours*HOUR_MS}};
   }
   units=Math.max(1,Math.round(CHARGE_SCALE*e(distanceKm(player.home,node.geo))));
   cost=P.node_attune_lumen;
   nextPlayer={...player,lastNodePulses:{...player.lastNodePulses,[targetId]:now}};
  }else{
   const stageKey=researchKey(actorId,targetId,stage);
   if(player.usedResearch?.[stageKey])return {state,result:{ok:false,code:'STAGE_ALREADY_USED'}};
   // Authoritative Grant is written only by a future content validator.
   // Passing "verified:true", "solved:true" etc. in action does nothing.
   if(!verifiedResearchGrant(state,actorId,targetId,stage))
    return {state,result:{ok:false,code:'PROOF_NOT_APPROVED'}};
   units=researchCreditUnits();
   cost=researchCost();
   nextPlayer={...player,usedResearch:{...player.usedResearch,[stageKey]:true}};
  }
  const spend=spendLumen(wallet,cost);
  if(!spend.ok)return {state,result:{ok:false,code:spend.reason}};
  nextWallet=spend.wallet;
  const after=Math.min(CHARGE_SCALE,node.chargeUnits+units);
  nextNode={...node,chargeUnits:after,status:after===CHARGE_SCALE?'Awakened':'Dormant'};
  result={ok:true,code:type==='ATTUNE'?'NODE_ATTUNED':'NODE_RESEARCHED',
    nodeId:targetId,stage,spent:cost,contributedUnits:after-node.chargeUnits,
    chargeUnits:after,awakened:after===CHARGE_SCALE,balance:nextWallet.balance};
 }
 const savedPlayer={...(nextPlayer||player),wallet:nextWallet};
 const nextState={
  ...state,
  players:{...state.players,[actorId]:savedPlayer},
  nodes:nextNode?{...state.nodes,[targetId]:nextNode}:state.nodes,
  receipts:{...state.receipts,[key]:{signature,result}}
 };
 return {state:nextState,result};
}
