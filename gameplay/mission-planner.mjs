// Gate 2 / PR-06: authored evidence and interpretation logic.
// This is a fixture-only narrative, not fabricated history about a real place.
import chapter from '../content/cases/the-missing-beat.json' with {type:'json'};
import {linkId,fieldId} from '../game-rules/identity.mjs';
import {isCommitted} from '../game-rules/field.mjs';
import {eventPhase} from '../game-rules/events.mjs';
export const MISSING_BEAT=chapter;
export const ROUTES=Object.freeze(['direct','via_b']);
export const ROLES=Object.freeze(['Lens','Shelter','Beacon']);
export function caseTopology(state){
 const {a,b,c}=chapter.anchors;
 for(const id of [a,b,c])if(state.nodes?.[id]?.status!=='Awakened')
  return {ok:false,code:'MISSING_AWAKENED_ANCHOR',nodeId:id};
 for(const pair of [[a,b],[b,c],[a,c]])
  if(!isCommitted(state.links,...pair))return {ok:false,code:'MISSING_COMMITTED_THREAD',threadId:linkId(...pair)};
 const id=fieldId(a,b,c);
 if(state.fields?.[id]?.status!=='Committed')return {ok:false,code:'MISSING_COMMITTED_FIELD'};
 if(state.catalog?.fixtureOnly!==true||!Object.values(chapter.anchors).every(nodeId=>state.catalog.byId.has(nodeId)))
  return {ok:false,code:'REQUIRES_APPROVED_FIXTURE_CATALOG'};
 return {ok:true,fieldId:id};
}
export function caseSnapshot(state){
 const topology=caseTopology(state);
 if(!topology.ok)return topology;
 const snapshot=state.caseSnapshots?.[chapter.id];
 if(!snapshot||!Number.isSafeInteger(snapshot.atMs)||!snapshot.eventId)
  return {ok:false,code:'CASE_SNAPSHOT_MISSING'};
 const ev=state.events?.[snapshot.eventId];
 if(!ev||!ev.fieldImpacts?.some(x=>x.fieldId===topology.fieldId)||
  eventPhase(ev,snapshot.atMs).phase!=='Interference')
  return {ok:false,code:'CASE_SNAPSHOT_NOT_VALIDATED'};
 const phase=eventPhase(ev,snapshot.atMs);
 return {...topology,atMs:snapshot.atMs,eventId:snapshot.eventId,
  signalQuality:1-phase.lossPP/100};
}
export function measurementFor(role,route,baselineQuality){
 if(!ROLES.includes(role)||!ROUTES.includes(route))throw new RangeError('Unknown role or measurement path');
 if(!Number.isFinite(baselineQuality)||baselineQuality<0||baselineQuality>1)
  throw new RangeError('Invalid fixed case signal quality');
 const quality=role==='Shelter'?1:baselineQuality;
 const evidence=route==='direct'?['direct-clean']:
  role==='Lens'?['detour-delay','same-source-signature']:
  role==='Shelter'?['detour-delay','clean-detour']:
  ['detour-delay','direction-b'];
 const visible=route==='direct'?['Single pulse on the direct A–C link','No additional delay']:
  role==='Lens'?['Two pulses share a source signature','The second pulse is delayed only along A–B–C']:
  role==='Shelter'?['Clean recording isolates the A–B–C delay','Detour and direct routes differ']:
  ['The extra pulse begins near relay B','The direct route should be checked'];
 return {route,role,quality,evidence,visible,costDescription:'First tutorial reading is free; later readings cost 1 Lumen.'};
}
export function evaluateHypothesis(measurements,hypothesis){
 if(!chapter.hypothesisOptions.some(o=>o.id===hypothesis))throw new RangeError('Unknown hypothesis');
 const evidence=new Set(measurements.flatMap(m=>m.evidence));
 const byLens=evidence.has('same-source-signature')&&evidence.has('detour-delay');
 const byComparison=evidence.has('direct-clean')&&evidence.has('clean-detour')&&evidence.has('detour-delay');
 const byDirection=evidence.has('direct-clean')&&evidence.has('direction-b')&&evidence.has('detour-delay');
 if(hypothesis!=='route_echo')return {solved:false,code:'CONTRADICTED',
  explanation:hypothesis==='local_noise'?
   'Unrelated local noise would not follow the same route-dependent timing.':
   'A hidden source is not supported by the recorded source and route comparison.'};
 if(byLens)return {solved:true,method:'LENS_SIGNATURE',
  explanation:'Lens reveals the same origin twice, but the second copy follows the B detour.'};
 if(byComparison)return {solved:true,method:'SHELTER_COMPARISON',
  explanation:'The sheltered direct reference is clean; the detour adds precisely the delayed second pulse.'};
 if(byDirection)return {solved:true,method:'BEACON_TRIANGULATION',
  explanation:'Beacon identifies B as the delay origin, while the direct route rules out a fourth sender.'};
 return {solved:false,code:'NEEDS_COMPARISON',
  explanation:'You need a distinctive source signature or a direct-vs-detour observation before concluding.'};
}
