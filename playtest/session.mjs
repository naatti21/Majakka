// Isolated Gate 2 / PR-07 playtest adapter. Uses the PR-01..PR-06 rules,
// NOT a mock success flag or a live world backend.
import fixture from '../world-data/fixtures/tampere.json' with {type:'json'};
import {validateCatalog} from '../world-data/catalog-policy.mjs';
import {createPlayer,createWorldNode,createRulesState} from '../game-rules/node.mjs';
import {createGraphState,applyLinkAction} from '../game-rules/graph.mjs';
import {createEventState,createInterferenceEvent} from '../game-rules/events.mjs';
import {linkId,fieldId} from '../game-rules/identity.mjs';
import {MISSING_BEAT} from '../gameplay/mission-planner.mjs';
import {createExpeditionState,applyExpeditionAction,getExpeditionView} from '../gameplay/first-light-flow.mjs';

export const PLAYTEST_KEY='majakka-missing-beat-gate2-playtest-v1';
const ACTOR='demo:player';
const ids=Object.values(MISSING_BEAT.anchors);
export function createDemoState(){
 const catalog=validateCatalog(fixture,{allowFixtures:true});
 const nodes=Object.fromEntries(catalog.sites.map(site=>[site.id,createWorldNode(site.geo,10000)]));
 const home=catalog.byId.get(ids[0]).geo;
 // Only the isolated scenario starts with a ready field and 18 L.
 // Authentic Gate 2 progression from a new 8-L wallet is NOT simulated here.
 const players={[ACTOR]:createPlayer(home,18)};
 let state=createGraphState(createRulesState({nodes,players}));
 for(const [i,[a,b]] of [[ids[0],ids[1]],[ids[1],ids[2]],[ids[0],ids[2]]].entries()){
  for(const stage of ['anchor','align']){
   const attempt=applyLinkAction(state,{type:'WEAVE',actorId:ACTOR,
    operationId:'fixture:'+i+':'+stage,a,b,stage,nowMs:0});
   if(!attempt.result.ok)throw new Error('Fixture graph setup failed: '+attempt.result.code);
   state=attempt.state;
  }
 }
 const field=fieldId(...ids);
 if(!state.fields[field])throw new Error('Fixture did not close the expected field');
 state=createEventState(state);
 state=createInterferenceEvent(state,{eventId:'demo:missing-beat',
  regionId:'demo:tampere',startsAtMs:0,
  fieldImpacts:[{fieldId:field,affectedLinkId:linkId(ids[0],ids[1])}]});
 return createExpeditionState({...state,catalog,caseSnapshots:{
  [MISSING_BEAT.id]:{eventId:'demo:missing-beat',atMs:25*3600000}}});
}
export function getDemoView(state){return getExpeditionView(state,ACTOR);}
export function applyDemoAction(state,{type,...rest}){
 // Unique only within this ephemeral local UI, never a trusted online action.
 const id='playtest:'+Date.now()+':'+Math.random().toString(36).slice(2);
 return applyExpeditionAction(state,{...rest,type,actorId:ACTOR,operationId:id});
}
export function saveDemoState(state){
 try {
  const snapshot={version:1,player:state.players[ACTOR],
   expedition:state.expeditions[JSON.stringify([ACTOR,MISSING_BEAT.id])]??null,
   receipts:state.receipts};
  localStorage.setItem(PLAYTEST_KEY,JSON.stringify(snapshot));
  return true;
 }catch{return false;}
}
export function loadDemoState(){
 let state=createDemoState();
 try {
  const data=JSON.parse(localStorage.getItem(PLAYTEST_KEY)||'null');
  if(data?.version!==1||!data?.player)return state;
  const validWallet=data.player.wallet?.balance;
  if(!Number.isSafeInteger(validWallet)||validWallet<0||validWallet>18)return state;
  // This snapshot is a local, user-editable TEST record, not a server receipt.
  const actorId=JSON.stringify([ACTOR,MISSING_BEAT.id]);
  state={...state,players:{...state.players,[ACTOR]:data.player},
   expeditions:data.expedition?{[actorId]:data.expedition}:{},
   receipts:data.receipts&&typeof data.receipts==='object'?data.receipts:state.receipts};
  getDemoView(state); // Reject corrupted snapshots by falling back to fresh.
 }catch{state=createDemoState();}
 return state;
}
export function resetDemoState(){
 try{localStorage.removeItem(PLAYTEST_KEY);}catch{}
 return createDemoState();
}
