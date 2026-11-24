// Majakka Gate 1 PR-03: deterministic shared-graph candidate.
// A trusted server must authenticate all actor/state/proof/time inputs and
// commit wallet, operation receipt, link and fields atomically (Gate 3).
import config from './balance-config.json' with {type:'json'};
import {distanceKm} from './geo.mjs';
import {linkId} from './identity.mjs';
import {effectiveReach} from './relay.mjs';
import {fieldsClosedByLink} from './field.mjs';
import {spendLumen} from './wallet.mjs';
const P=config.parameters;
export const WORK_SCALE=10000;
export const LINK_PROOF_STAGES=Object.freeze(['survey','interpret','route']);
export const LINK_LIGHT_STAGES=Object.freeze(['anchor','align','reinforce']);
const HOUR=3600000;
function validId(v){
 if(typeof v!=='string'||!v||v.length>160||v.trim()!==v||/[\u0000-\u001f\u007f-\u009f\ud800-\udfff]/u.test(v))
  throw new TypeError('Invalid world, player or operation ID');
 return v;
}
function validTime(v){
 if(!Number.isSafeInteger(v)||v<0)throw new TypeError('Expected trusted UTC milliseconds');
 return v;
}
export function linkWorkKm(lengthKm){
 if(!Number.isFinite(lengthKm)||lengthKm<0)throw new RangeError('Invalid link distance');
 return P.link_min_work+Math.min(P.link_max_work-P.link_min_work,
  Math.max(0,Math.log10(Math.max(1,lengthKm/2))));
}
export function linkRequiredUnits(lengthKm){return Math.round(linkWorkKm(lengthKm)*WORK_SCALE);}
export function linkProofKey(actor,id,stage){
 if(!LINK_PROOF_STAGES.includes(stage))throw new RangeError('Unknown link proof stage');
 return JSON.stringify([validId(actor),validId(id),stage]);
}
export function createGraphState(state){
 if(!state||!state.players||!state.nodes||!state.receipts)throw new TypeError('Requires current node rules state');
 return {...state,links:{...(state.links||{})},fields:{...(state.fields||{})},
  linkProofGrants:{...(state.linkProofGrants||{})}};
}
function getLink(state,id,a,b){
 const old=state.links?.[id];
 if(old){
  const valid=old.a===a&&old.b===b&&Number.isSafeInteger(old.workRequiredUnits)&&
   Number.isSafeInteger(old.workDoneUnits)&&Number.isSafeInteger(old.lightWorkUnits)&&
   Number.isSafeInteger(old.proofWorkUnits)&&
   old.workDoneUnits===old.lightWorkUnits+old.proofWorkUnits&&
   old.workDoneUnits>=0&&old.workDoneUnits<=old.workRequiredUnits&&
   old.proofWorkUnits<=Math.floor(old.workRequiredUnits*P.link_max_proof_fraction);
  if(!valid)throw new TypeError('Invalid committed/progress link state');
  return old;
 }
 const lengthKm=distanceKm(state.nodes[a].geo,state.nodes[b].geo);
 const workRequiredUnits=linkRequiredUnits(lengthKm);
 return {id,a,b,status:'Building',lengthKm,workRequiredUnits,workDoneUnits:0,
  lightWorkUnits:0,proofWorkUnits:0};
}
function preview(type,action,state,player,link,id,now){
 const stage=action.stage;
 const stageKey=JSON.stringify([id,stage]);
 if(type==='WEAVE'){
  if(!LINK_LIGHT_STAGES.includes(stage))throw new RangeError('Unknown link stage');
  const used=player.linkStages||{};
  if(stage==='align'&&!used[JSON.stringify([id,'anchor'])])
   return {ok:false,code:'ANCHOR_FIRST'};
  if(stage==='reinforce'&&!used[JSON.stringify([id,'align'])])
   return {ok:false,code:'ALIGN_FIRST'};
  if(stage!=='reinforce'&&used[stageKey])return {ok:false,code:'STAGE_ALREADY_USED'};
  if(stage==='reinforce'){
   const last=player.lastReinforce?.[id];
   if(last!==undefined){
    validTime(last);
    if(now<last)throw new RangeError('Trusted UTC time went backwards');
    if(now-last<P.link_reinforce_cooldown_hours*HOUR)
     return {ok:false,code:'LINK_COOLDOWN',availableAtMs:last+P.link_reinforce_cooldown_hours*HOUR};
   }
  }
  const ra=effectiveReach(player.home,state.nodes[link.a].geo,state.nodes,state.links);
  const rb=effectiveReach(player.home,state.nodes[link.b].geo,state.nodes,state.links);
  const q=Math.sqrt(ra.effectiveness*rb.effectiveness);
  return {ok:true,stageKey,cost:P.weave_lumen,
   workUnits:Math.max(1,Math.round(WORK_SCALE*q)),effectiveness:q,
   reachA:ra.effectiveness,reachB:rb.effectiveness};
 }
 if(!LINK_PROOF_STAGES.includes(stage))throw new RangeError('Unknown link proof stage');
 if(link.lengthKm<=P.link_research_min_distance_km)return {ok:false,code:'PROOF_REQUIRES_LONG_LINK'};
 if(player.linkProofStages?.[stageKey])return {ok:false,code:'STAGE_ALREADY_USED'};
 if(state.linkProofGrants?.[linkProofKey(action.actorId,id,stage)]!==true)
  return {ok:false,code:'PROOF_NOT_APPROVED'};
 // Total proof cap is shared by everyone, not per actor. Rounding down ensures
 // a fraction of actual light work is ALWAYS required.
 const remaining=Math.floor(link.workRequiredUnits*P.link_max_proof_fraction)-link.proofWorkUnits;
 if(remaining<=0)return {ok:false,code:'PROOF_LIMIT_REACHED'};
 return {ok:true,stageKey,cost:P.link_research_cost_each,
  workUnits:Math.min(remaining,Math.round(P.link_research_work_each*WORK_SCALE)),effectiveness:null};
}
// Pure preview: no debit, no stage consumption, no camera/movement input.
export function previewLinkAction(state,action){
 if(!state||!action||typeof action!=='object')throw new TypeError('State and action required');
 const actorId=validId(action.actorId),a=validId(action.a),b=validId(action.b);
 if(a===b)throw new RangeError('Cannot link node to itself');
 const type=action.type;
 if(type!=='WEAVE'&&type!=='LINK_PROOF')throw new RangeError('Unsupported link operation');
 const now=validTime(action.nowMs);
 if(!state.players?.[actorId])return {ok:false,code:'UNKNOWN_ACTOR'};
 if(!state.nodes?.[a]||!state.nodes?.[b])return {ok:false,code:'UNKNOWN_NODE'};
 if([a,b].some(id=>state.nodes[id].status!=='Awakened'||state.nodes[id].chargeUnits!==10000))
  return {ok:false,code:'NODE_NOT_AWAKENED'};
 const [left,right]=[a,b].sort(),id=linkId(left,right);
 const link=getLink(state,id,left,right);
 if(link.status==='Committed')return {ok:false,code:'LINK_ALREADY_COMMITTED',id};
 const step=preview(type,action,state,state.players[actorId],link,id,now);
 if(!step.ok)return {...step,id};
 return {...step,id,link,actorId,a:left,b:right,type,stage:action.stage,now};
}
export function applyLinkAction(state,action){
 if(!state||!action||typeof action!=='object')throw new TypeError('State and action required');
 const actorId=validId(action.actorId),operationId=validId(action.operationId);
 const [a,b]=[validId(action.a),validId(action.b)].sort();
 if(a===b)throw new RangeError('Cannot link node to itself');
 const targetId=linkId(a,b);
 const signature=JSON.stringify(['link-rule-v1',action.type,targetId,action.stage]);
 const receiptKey=JSON.stringify([actorId,operationId]);
 const existing=state.receipts?.[receiptKey];
 if(existing)return existing.signature===signature?
  {state,result:{...existing.result,replayed:true}}:
  {state,result:{ok:false,code:'OPERATION_ID_CONFLICT'}};
 const detail=previewLinkAction(state,action);
 if(!detail.ok)return {state,result:{ok:false,code:detail.code,
  availableAtMs:detail.availableAtMs??null}};
 const player=state.players[actorId];
 const paid=spendLumen(player.wallet,detail.cost);
 if(!paid.ok)return {state,result:{ok:false,code:paid.reason}};
 const link=detail.link,delta=Math.min(link.workRequiredUnits-link.workDoneUnits,detail.workUnits);
 if(delta<=0)return {state,result:{ok:false,code:'NO_WORK_REMAINING'}};
 const isProof=detail.type==='LINK_PROOF',isReinforce=detail.stage==='reinforce';
 const after=link.workDoneUnits+delta;
 const updated={...link,workDoneUnits:after,
  lightWorkUnits:link.lightWorkUnits+(isProof?0:delta),
  proofWorkUnits:link.proofWorkUnits+(isProof?delta:0),
  status:after===link.workRequiredUnits?'Committed':'Building'};
 const nextLinks={...state.links,[detail.id]:updated};
 const nextPlayer={...player,wallet:paid.wallet};
 if(isProof)nextPlayer.linkProofStages={
  ...(player.linkProofStages||{}),[detail.stageKey]:true};
 else if(isReinforce)nextPlayer.lastReinforce={
  ...(player.lastReinforce||{}),[detail.id]:detail.now};
 else nextPlayer.linkStages={
  ...(player.linkStages||{}),[detail.stageKey]:true};
 const born=updated.status==='Committed'?
  fieldsClosedByLink(nextLinks,detail.a,detail.b):[];
 const nextFields={...(state.fields||{})};
 const newFieldIds=[];
 for(const field of born)if(!nextFields[field.id]){
  nextFields[field.id]=field;newFieldIds.push(field.id);
 }
 const result={ok:true,code:updated.status==='Committed'?'LINK_COMMITTED':
  (isProof?'LINK_PROOF_ACCEPTED':'LINK_PROGRESS'),
  linkId:detail.id,stage:detail.stage,spent:detail.cost,
  creditedUnits:delta,workDoneUnits:after,workRequiredUnits:link.workRequiredUnits,
  proofWorkUnits:updated.proofWorkUnits,committed:updated.status==='Committed',
  newFieldIds,balance:nextPlayer.wallet.balance};
 return {state:{...state,players:{...state.players,[actorId]:nextPlayer},
  links:nextLinks,fields:nextFields,
  receipts:{...state.receipts,[receiptKey]:{signature,result}}},result};
}
