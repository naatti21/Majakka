// Majakka Gate 1 PR-04. Pure UTC event scheduler, never a browser timer.
// Only a trusted world scheduler may publish an event; player actions cannot.
import config from './balance-config.json' with {type:'json'};
import {linkId} from './identity.mjs';
import {isCommitted} from './field.mjs';
const P=config.parameters, HOUR=3600000, DAY=24*HOUR;
export const EVENT_PHASES=Object.freeze(['Scheduled','Signal','Interference','Recovery','Calm']);
export function utcMs(value){
 if(!Number.isSafeInteger(value)||value<0)throw new TypeError('Trusted UTC milliseconds required');
 return value;
}
export function canonicalId(value){
 if(typeof value!=='string'||!value||value.length>160||value.trim()!==value||
  /[\u0000-\u001f\u007f-\u009f\ud800-\udfff]/u.test(value))
  throw new TypeError('Invalid canonical ID');
 return value;
}
export const SIGNAL_MS=P.interference_signal_hours*HOUR;
export const ACTIVE_MS=P.interference_active_hours*HOUR;
export const RECOVERY_MS=P.interference_recovery_hours*HOUR;
export const EVENT_GAP_MS=P.interference_min_gap_days_same_region*DAY;
export function eventPhase(event,nowMs){
 const now=utcMs(nowMs);
 if(!event||!Number.isSafeInteger(event.startsAtMs)||event.startsAtMs<0)
  throw new TypeError('Invalid scheduled event');
 const start=event.startsAtMs,signalEnd=start+SIGNAL_MS,activeEnd=signalEnd+ACTIVE_MS;
 if(now<start)return {phase:'Scheduled',lossPP:0,fade:0};
 if(now<signalEnd)return {phase:'Signal',lossPP:0,fade:0};
 if(event.stabilizedAtMs!==null&&event.stabilizedAtMs!==undefined){
  const stopped=utcMs(event.stabilizedAtMs);
  if(stopped<signalEnd||stopped>=activeEnd)throw new TypeError('Invalid stabilization time');
  if(now>=stopped){
   const elapsed=now-stopped;
   return elapsed<RECOVERY_MS?
    {phase:'Recovery',lossPP:0,fade:1-elapsed/RECOVERY_MS}:
    {phase:'Calm',lossPP:0,fade:0};
  }
 }
 if(now<activeEnd)return {phase:'Interference',lossPP:P.interference_one_event_penalty_pp,fade:1};
 const remaining=now-activeEnd;
 if(remaining<RECOVERY_MS)return {phase:'Recovery',
  lossPP:P.interference_one_event_penalty_pp*(1-remaining/RECOVERY_MS),
  fade:1-remaining/RECOVERY_MS};
 return {phase:'Calm',lossPP:0,fade:0};
}
// The world-state record contains region, permanent ID and a sparse list
// of affected *existing* fields with exactly one affected committed edge each.
// No GPS, camera center or dynamically spawned POI belongs in this record.
export function createInterferenceEvent(state,{eventId,regionId,startsAtMs,fieldImpacts}){
 const id=canonicalId(eventId),region=canonicalId(regionId),at=utcMs(startsAtMs);
 if(!state||!state.fields||!state.links||!state.players)throw new TypeError('Graph state required');
 if(state.events?.[id])throw new RangeError('Event ID already exists');
 const existing=Object.values(state.events||{}).filter(ev=>ev.regionId===region);
 for(const older of existing){
  if(Math.abs(at-older.startsAtMs)<EVENT_GAP_MS)throw new RangeError('Regional interference cooldown');
 }
 if(!Array.isArray(fieldImpacts)||!fieldImpacts.length)throw new RangeError('Event needs canonical field impacts');
 const seen=new Set(),impacts=[];
 for(const input of fieldImpacts){
  const fieldId=canonicalId(input?.fieldId),affectedLinkId=canonicalId(input?.affectedLinkId);
  if(seen.has(fieldId))throw new RangeError('Duplicate field impact');
  seen.add(fieldId);
  const field=state.fields[fieldId];
  if(!field||field.status!=='Committed'||!Array.isArray(field.nodes)||field.nodes.length!==3)
   throw new RangeError('Interference may only affect committed fields');
  const [a,b,c]=field.nodes;
  const candidates=[linkId(a,b),linkId(a,c),linkId(b,c)];
  if(!candidates.includes(affectedLinkId))throw new RangeError('Affected edge not in field');
  const edge=state.links[affectedLinkId];
  if(!edge||!isCommitted(state.links,edge.a,edge.b))
   throw new RangeError('Affected edge must be committed');
  impacts.push({fieldId,affectedLinkId});
 }
 const event=Object.freeze({id,regionId:region,startsAtMs:at,
  stabilizedAtMs:null,fieldImpacts:impacts});
 return {...state,events:{...(state.events||{}),[id]:event}};
}
export function createEventState(graph){
 if(!graph||!graph.players||!graph.links||!graph.fields||!graph.receipts)throw new TypeError('Graph state required');
 return {...graph,events:{...(graph.events||{})},investigationGrants:{...(graph.investigationGrants||{})}};
}
export function archivedEvent(event,nowMs){
 const current=eventPhase(event,nowMs);
 return current.phase==='Calm';
}
