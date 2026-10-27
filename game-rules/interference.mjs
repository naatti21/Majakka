// Majakka Gate 1 PR-04: non-destructive Interference decisions.
// This deterministic reference reducer is NOT authentication or a DB transaction.
import config from './balance-config.json' with {type:'json'};
import {spendLumen} from './wallet.mjs';
import {linkId} from './identity.mjs';
import {isCommitted} from './field.mjs';
import {eventPhase,utcMs,canonicalId,SIGNAL_MS} from './events.mjs';
const P=config.parameters, DAY=24*3600000;
export const FIELD_ROLES=Object.freeze(['Beacon','Shelter','Lens']);
export const RESPONSES=Object.freeze(['STABILIZE','INVESTIGATE','REROUTE','IGNORE']);
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o||{},k);
export const investigationKey=(actorId,eventId)=>JSON.stringify([canonicalId(actorId),canonicalId(eventId)]);
export const rerouteKey=(eventId,fieldId)=>JSON.stringify([canonicalId(eventId),canonicalId(fieldId)]);
const effects=(state,fieldId,nowMs)=>
 Object.values(state.events||{}).flatMap(ev=>{
  if(!ev.fieldImpacts?.some(x=>x.fieldId===fieldId))return [];
  const phase=eventPhase(ev,nowMs);
  return phase.lossPP>0?[{id:ev.id,start:ev.startsAtMs,lossPP:phase.lossPP,phase:phase.phase}]:[];
 }).sort((a,b)=>a.start-b.start||(a.id<b.id?-1:a.id>b.id?1:0));
// Field focus is PERSONAL. Switching during an ongoing affected event cannot
// instantly claim all three bonuses. No world field configuration is changed.
export function setFieldFocus(state,{actorId,fieldId,role,nowMs}){
 const who=canonicalId(actorId),which=canonicalId(fieldId),now=utcMs(nowMs);
 if(!state.players?.[who])return {state,result:{ok:false,code:'UNKNOWN_ACTOR'}};
 if(!state.fields?.[which]||state.fields[which].status!=='Committed')
  return {state,result:{ok:false,code:'UNKNOWN_FIELD'}};
 if(role!==null&&!FIELD_ROLES.includes(role))throw new RangeError('Unsupported field focus');
 const player=state.players[who],focuses=player.fieldFocuses||{};
 const before=focuses[which]??null;
 if(before===role)return {state,result:{ok:true,code:'FOCUS_UNCHANGED',role}};
 if(before!==null&&effects(state,which,now).some(x=>x.phase==='Interference'))
  return {state,result:{ok:false,code:'FOCUS_LOCKED_DURING_INTERFERENCE'}};
 if(role!==null&&before===null&&Object.keys(focuses).length>=P.focus_slots)
  return {state,result:{ok:false,code:'FOCUS_LIMIT'}};
 const next={...focuses};
 if(role===null)delete next[which];else next[which]=role;
 return {state:{...state,players:{...state.players,[who]:{...player,fieldFocuses:next,
   fieldFocusChosenAtMs:{...(player.fieldFocusChosenAtMs||{}),[which]:now}}}},
  result:{ok:true,code:'FOCUS_SET',role,fieldId:which}};
}
export function fieldSignalQuality(state,actorId,fieldId,nowMs){
 const who=canonicalId(actorId),which=canonicalId(fieldId),now=utcMs(nowMs);
 if(!state.players?.[who]||!state.fields?.[which])
  throw new RangeError('Known actor and committed field required');
 const player=state.players[who],items=effects(state,which,now);
 const chosenAt=player.fieldFocusChosenAtMs?.[which]??0;
 const shielded=player.fieldFocuses?.[which]==='Shelter'?
  items.find(item=>chosenAt<=item.start+SIGNAL_MS)?.id??null:null;
 const breakdown=items.map(item=>{
  const shieldedThis=shielded===item.id;
  const expired=player.reroutes?.[rerouteKey(item.id,which)]??null;
  const reduction=!shieldedThis&&Number.isSafeInteger(expired)&&now<expired?
   Math.min(10,item.lossPP):0;
  const lossPP=shieldedThis?0:Math.max(0,item.lossPP-reduction);
  return {...item,lossPP,shielded:shieldedThis,rerouteReductionPP:reduction};
 });
 const lossPP=Math.min(P.interference_total_penalty_pp,
  breakdown.reduce((total,item)=>total+item.lossPP,0));
 return {quality:1-lossPP/100,lossPP,shieldedEventId:shielded,breakdown};
}
function viableAlternate(state,fieldId,eventId,nowMs){
 const field=state.fields?.[fieldId],event=state.events?.[eventId];
 const affected=event?.fieldImpacts?.find(x=>x.fieldId===fieldId)?.affectedLinkId;
 if(!field||!affected||field.nodes?.length!==3)return false;
 const [a,b,c]=field.nodes;
 const all=[linkId(a,b),linkId(a,c),linkId(b,c)];
 if(!all.includes(affected)||!all.every(id=>{
  const edge=state.links?.[id];
  return edge&&isCommitted(state.links,edge.a,edge.b);
 }))return false;
 const alternative=all.filter(id=>id!==affected);
 const blocked=new Set(Object.values(state.events||{}).flatMap(ev=>
  eventPhase(ev,nowMs).lossPP>0?ev.fieldImpacts
   .filter(x=>x.fieldId===fieldId).map(x=>x.affectedLinkId):[]));
 return alternative.every(id=>!blocked.has(id));
}
export function applyInterferenceAction(state,action){
 if(!state||!action||typeof action!=='object')throw new TypeError('State and action required');
 const actorId=canonicalId(action.actorId),type=action.type,now=utcMs(action.nowMs);
 if(!RESPONSES.includes(type))throw new RangeError('Unknown Interference action');
 if(!state.players?.[actorId])return {state,result:{ok:false,code:'UNKNOWN_ACTOR'}};
 // IGNORE is a zero-cost, stateless choice: never create upkeep debt.
 if(type==='IGNORE')return {state,result:{ok:true,code:'LEFT_FOR_LATER',spent:0}};
 const operationId=canonicalId(action.operationId),eventId=canonicalId(action.eventId);
 const fieldId=type==='REROUTE'?canonicalId(action.fieldId):null;
 const signature=JSON.stringify(['interference-v1',type,eventId,fieldId]);
 const receiptKey=JSON.stringify([actorId,operationId]);
 const old=state.receipts?.[receiptKey];
 if(old)return old.signature===signature?
  {state,result:{...old.result,replayed:true}}:
  {state,result:{ok:false,code:'OPERATION_ID_CONFLICT'}};
 const event=state.events?.[eventId];
 if(!event)return {state,result:{ok:false,code:'UNKNOWN_EVENT'}};
 const phase=eventPhase(event,now);
 const player=state.players[actorId];
 let changedEvent=null,changedPlayer=null,result;
 if(type==='STABILIZE'){
  if(phase.phase!=='Interference')
   return {state,result:{ok:false,code:'NOT_ACTIVE_OR_ALREADY_RESOLVED'}};
  const paid=spendLumen(player.wallet,2);
  if(!paid.ok)return {state,result:{ok:false,code:paid.reason}};
  changedEvent={...event,stabilizedAtMs:now};
  changedPlayer={...player,wallet:paid.wallet};
  result={ok:true,code:'STABILIZED',eventId,spent:2,
   phase:'Recovery',balance:paid.wallet.balance};
 }else if(type==='INVESTIGATE'){
  if(phase.phase==='Scheduled')
   return {state,result:{ok:false,code:'EVENT_NOT_STARTED'}};
  const key=investigationKey(actorId,eventId);
  if(own(player.findings,key))
   return {state,result:{ok:false,code:'ALREADY_INVESTIGATED'}};
  // The grant must be issued by an independent authored-content evaluator.
  // Client "solved", "fragmentId" or "correct" fields cannot create a grant.
  const grant=state.investigationGrants?.[key];
  if(!grant||typeof grant!=='object'||!grant.fragmentId)
   return {state,result:{ok:false,code:'PROOF_NOT_APPROVED'}};
  const fragmentId=canonicalId(grant.fragmentId);
  changedPlayer={...player,findings:{...(player.findings||{}),
   [key]:{fragmentId,eventId,foundAtMs:now}}};
  result={ok:true,code:'DISCOVERED',eventId,fragmentId,spent:0};
 }else{
  if(phase.phase!=='Interference')
   return {state,result:{ok:false,code:'NOT_ACTIVE_OR_ALREADY_RESOLVED'}};
  if(!state.fields?.[fieldId]||state.fields[fieldId].status!=='Committed')
   return {state,result:{ok:false,code:'UNKNOWN_FIELD'}};
  if(!player.fieldFocuses?.[fieldId])
   return {state,result:{ok:false,code:'FOCUS_REQUIRED'}};
  if(!event.fieldImpacts.some(x=>x.fieldId===fieldId))
   return {state,result:{ok:false,code:'FIELD_NOT_AFFECTED'}};
  const key=rerouteKey(eventId,fieldId),until=player.reroutes?.[key];
  if(Number.isSafeInteger(until)&&until>now)
   return {state,result:{ok:false,code:'ALREADY_REROUTED'}};
  const fieldQuality=fieldSignalQuality(state,actorId,fieldId,now);
  const ownImpact=fieldQuality.breakdown.find(x=>x.id===eventId);
  if(!ownImpact||ownImpact.lossPP<=0)
   return {state,result:{ok:false,code:'NO_FUNCTIONAL_BENEFIT'}};
  if(!viableAlternate(state,fieldId,eventId,now))
   return {state,result:{ok:false,code:'NO_CLEAN_ALTERNATE_PATH'}};
  const paid=spendLumen(player.wallet,1);
  if(!paid.ok)return {state,result:{ok:false,code:paid.reason}};
  changedPlayer={...player,wallet:paid.wallet,
   reroutes:{...(player.reroutes||{}),[key]:now+DAY}};
  result={ok:true,code:'PERSONAL_REROUTE',eventId,fieldId,spent:1,
   rerouteEndsAtMs:now+DAY,balance:paid.wallet.balance};
 }
 const stateNext={...state,
  players:changedPlayer?{...state.players,[actorId]:changedPlayer}:state.players,
  events:changedEvent?{...state.events,[eventId]:changedEvent}:state.events,
  receipts:{...state.receipts,[receiptKey]:{signature,result}}};
 return {state:stateNext,result};
}
