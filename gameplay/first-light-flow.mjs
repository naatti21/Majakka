// Gate 2 / PR-06: full small, deterministic, map-independent story loop.
// An archived case snapshot is immutable. Nothing here writes the live
// world's historical event, node, graph, field or another player's story.
import {spendLumen} from '../game-rules/wallet.mjs';
import {MISSING_BEAT,ROLES,ROUTES,caseSnapshot,measurementFor,evaluateHypothesis} from './mission-planner.mjs';
const ID=MISSING_BEAT.id;
const actorKey=id=>JSON.stringify([id,ID]);
const validId=x=>{if(typeof x!=='string'||!x||x.length>160||x.trim()!==x||
 /[\u0000-\u001f\u007f-\u009f\ud800-\udfff]/u.test(x))throw new TypeError('Invalid action ID');return x;};
export function createExpeditionState(existing){
 if(!existing?.players||!existing?.nodes||!existing?.receipts)throw new TypeError('World state required');
 return {...existing,expeditions:{...(existing.expeditions||{})}};
}
export function getExpeditionView(state,actorId){
 const actor=validId(actorId),player=state?.players?.[actor];
 if(!player)throw new RangeError('Unknown player');
 const exp=state.expeditions?.[actorKey(actor)]??null;
 const status=exp?.status??'NotStarted';
 return {caseId:ID,title:MISSING_BEAT.title,question:MISSING_BEAT.question,
  fictionNotice:MISSING_BEAT.fictionNotice,
  status,role:exp?.role??null,measurements:exp?.measurements?.map(x=>({
   route:x.route,quality:x.quality,visible:x.visible}))??[],
  hypotheses:MISSING_BEAT.hypothesisOptions.map(h=>({...h})),
  roleChoices:MISSING_BEAT.roles.map(r=>({...r})),
  availableRoutes:[...ROUTES],lumen:player.wallet.balance,
  nextAction:status==='NotStarted'?'START':
   status==='Completed'?'JOURNAL':
   status==='Solved'?'FINISH':
   !exp.role?'SELECT_ROLE':
   exp.measurements.length===0?'MEASURE':
   'INTERPRET_OR_MEASURE',
  purpose:'Compare routes to explain a repeated signal; your finding will be saved permanently.'};
}
export function applyExpeditionAction(state,action){
 if(!state||!action||typeof action!=='object')throw new TypeError('State and action required');
 const actorId=validId(action.actorId),op=validId(action.operationId);
 const type=action.type;
 if(!['START','SELECT_ROLE','MEASURE','INTERPRET','FINISH'].includes(type))
  throw new RangeError('Unknown expedition action');
 const role=type==='SELECT_ROLE'?action.role:null,
  route=type==='MEASURE'?action.route:null,
  hypothesis=type==='INTERPRET'?action.hypothesis:null;
 // The registered ID/actor is injected by the authoritative controller.
 // Client-supplied answer flags, quality, timestamp, GPS or Lumen are ignored.
 const signature=JSON.stringify(['expedition-v1',ID,type,role,route,hypothesis]);
 const receiptKey=JSON.stringify([actorId,op]);
 const old=state.receipts?.[receiptKey];
 if(old)return old.signature===signature?
  {state,result:{...old.result,replayed:true}}:
  {state,result:{ok:false,code:'OPERATION_ID_CONFLICT'}};
 if(!state.players?.[actorId])return {state,result:{ok:false,code:'UNKNOWN_ACTOR'}};
 const player=state.players[actorId],key=actorKey(actorId);
 const current=state.expeditions?.[key]??null;
 let next=current,nextPlayer=player;
 let result;
 if(type==='START'){
  if(current)return {state,result:{ok:false,code:'EXPEDITION_ALREADY_STARTED'}};
  if(player.findings?.[ID])return {state,result:{ok:false,code:'CASE_ALREADY_SOLVED'}};
  const snap=caseSnapshot(state);
  if(!snap.ok)return {state,result:{ok:false,code:snap.code}};
  next={id:ID,version:MISSING_BEAT.version,fieldId:snap.fieldId,
   eventId:snap.eventId,snapshotAtMs:snap.atMs,baselineQuality:snap.signalQuality,
   role:null,measurements:[],status:'ChoosingRole',method:null};
  result={ok:true,code:'CASE_STARTED',question:MISSING_BEAT.question,
   options:ROLES,why:'Choose what your triangle should measure before comparing the two routes.'};
 }else{
  if(!current)return {state,result:{ok:false,code:'CASE_NOT_STARTED'}};
  if(current.status==='Completed')return {state,result:{ok:false,code:'CASE_ALREADY_SOLVED'}};
  if(type==='SELECT_ROLE'){
   if(!ROLES.includes(role))throw new RangeError('Unknown field function');
   if(current.measurements.length)return {state,result:{ok:false,code:'ROLE_LOCKED_AFTER_MEASUREMENT'}};
   next={...current,role,status:'ReadyToMeasure'};
   result={ok:true,code:'ROLE_SELECTED',role,why:MISSING_BEAT.roles.find(r=>r.id===role).effect};
  }else if(type==='MEASURE'){
   if(!ROUTES.includes(route))throw new RangeError('Unknown route');
   if(!current.role)return {state,result:{ok:false,code:'CHOOSE_ROLE_FIRST'}};
   if(current.status==='Solved')return {state,result:{ok:false,code:'ALREADY_SOLVED'}};
   if(current.measurements.some(m=>m.route===route))
    return {state,result:{ok:false,code:'ROUTE_ALREADY_MEASURED'}};
   const cost=player.tutorialMeasurementUsed?1:0;
   const payment=spendLumen(player.wallet,cost);
   if(!payment.ok)return {state,result:{ok:false,code:payment.reason}};
   const observation=measurementFor(current.role,route,current.baselineQuality);
   next={...current,status:'Investigating',measurements:[...current.measurements,observation]};
   nextPlayer={...player,wallet:payment.wallet,tutorialMeasurementUsed:true};
   result={ok:true,code:'MEASURED',route,role:current.role,spent:cost,
    quality:observation.quality,observation:observation.visible,
    why:'Choose another route or test the explanation using the evidence.'};
  }else if(type==='INTERPRET'){
   if(current.measurements.length===0)return {state,result:{ok:false,code:'MEASURE_FIRST'}};
   const judgement=evaluateHypothesis(current.measurements,hypothesis);
   if(!judgement.solved)return {state,result:{ok:false,code:judgement.code,
    explanation:judgement.explanation,spent:0}};
   next={...current,status:'Solved',method:judgement.method,conclusion:judgement.explanation};
   result={ok:true,code:'INTERPRETATION_SUPPORTED',method:judgement.method,
    explanation:judgement.explanation,spent:0,
    why:'Finish to archive the finding and unlock the next question.'};
  }else{
   if(current.status!=='Solved')return {state,result:{ok:false,code:'CASE_NOT_SOLVED'}};
   const discovery=MISSING_BEAT.outcome;
   next={...current,status:'Completed'};
   nextPlayer={...player,findings:{...(player.findings||{}),
    [ID]:{findingId:discovery.findingId,method:current.method,version:current.version}},
    unlockedMethods:{...(player.unlockedMethods||{}),[discovery.methodUnlock]:true}};
   result={ok:true,code:'FINDING_ARCHIVED',spent:0,
    findingId:discovery.findingId,method:current.method,unlocked:discovery.methodUnlock,
    nextQuestion:discovery.nextQuestion};
  }
 }
 const output={...state,players:{...state.players,[actorId]:nextPlayer},
  expeditions:{...(state.expeditions||{}),[key]:next},
  receipts:{...state.receipts,[receiptKey]:{signature,result}}};
 return {state:output,result};
}
