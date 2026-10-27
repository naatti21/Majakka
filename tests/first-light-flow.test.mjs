import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateCatalog} from '../world-data/catalog-policy.mjs';
import {createPlayer,createWorldNode,createRulesState} from '../game-rules/node.mjs';
import {createGraphState,applyLinkAction} from '../game-rules/graph.mjs';
import {createEventState,createInterferenceEvent,eventPhase} from '../game-rules/events.mjs';
import {linkId,fieldId} from '../game-rules/identity.mjs';
import {caseTopology,caseSnapshot,evaluateHypothesis,MISSING_BEAT} from '../gameplay/mission-planner.mjs';
import {createExpeditionState,applyExpeditionAction,getExpeditionView} from '../gameplay/first-light-flow.mjs';
const H=3600000;
const fixture=()=>JSON.parse(readFileSync(new URL('../world-data/fixtures/tampere.json',import.meta.url)));
const ids=['test:tampere:a','test:tampere:b','test:tampere:c'];
const fld=fieldId(...ids);
function makeWorld(){
 const catalog=validateCatalog(fixture(),{allowFixtures:true});
 const nodes=Object.fromEntries(catalog.sites.map(site=>[site.id,createWorldNode(site.geo,10000)]));
 const players={alice:createPlayer(catalog.byId.get(ids[0]).geo,18),
  bob:createPlayer(catalog.byId.get(ids[0]).geo,18)};
 let state=createGraphState(createRulesState({players,nodes}));
 for(const [i,[a,b]] of [[ids[0],ids[1]],[ids[1],ids[2]],[ids[0],ids[2]]].entries()){
  for(const stage of ['anchor','align']){
   const answer=applyLinkAction(state,{actorId:'alice',operationId:'build-'+i+'-'+stage,
    a,b,stage,type:'WEAVE',nowMs:0});
   assert.equal(answer.result.ok,true);
   state=answer.state;
  }
 }
 assert.ok(state.fields[fld]);
 state=createEventState(state);
 state=createInterferenceEvent(state,{eventId:'case-event',regionId:'tampere-test',
  startsAtMs:0,fieldImpacts:[{fieldId:fld,affectedLinkId:linkId(ids[0],ids[1])}]});
 return createExpeditionState({...state,catalog,
  caseSnapshots:{[MISSING_BEAT.id]:{eventId:'case-event',atMs:25*H}}});
}
const call=(s,type,id,extra={},actorId='alice')=>applyExpeditionAction(s,{
 actorId,operationId:id,type,...extra});
const advance=(s,type,id,extra={},actorId='alice')=>{
 const x=call(s,type,id,extra,actorId);assert.equal(x.result.ok,true,x.result.code);return x.state;
};
test('a closed real graph, canonical fixture and archived active signal are required',()=>{
 const state=makeWorld();
 assert.equal(caseTopology(state).fieldId,fld);
 assert.equal(caseSnapshot(state).signalQuality,.8);
 const absent={...state,links:{...state.links,[linkId(ids[0],ids[2])]:undefined}};
 assert.equal(call(absent,'START','s1').result.code,'MISSING_COMMITTED_THREAD');
 const unsourced={...state,catalog:null};
 assert.equal(call(unsourced,'START','s2').result.code,'REQUIRES_APPROVED_FIXTURE_CATALOG');
});
test('full Lens loop: one signature measurement -> interpretation -> permanent new method',()=>{
 const initial=makeWorld(),oldWorld={nodes:initial.nodes,links:initial.links,fields:initial.fields,events:initial.events};
 let s=advance(initial,'START','start');
 assert.equal(getExpeditionView(s,'alice').nextAction,'SELECT_ROLE');
 s=advance(s,'SELECT_ROLE','lens',{role:'Lens'});
 assert.equal(getExpeditionView(s,'alice').nextAction,'MEASURE');
 s=advance(s,'MEASURE','via',{route:'via_b'});
 assert.equal(s.players.alice.wallet.balance,6); // building field used 12 of original 18, first measurement free
 const view=getExpeditionView(s,'alice');
 assert.match(view.measurements[0].visible.join(' '),/source signature/);
 s=advance(s,'INTERPRET','answer',{hypothesis:'route_echo'});
 assert.equal(s.expeditions[JSON.stringify(['alice',MISSING_BEAT.id])].method,'LENS_SIGNATURE');
 s=advance(s,'FINISH','finish');
 assert.equal(s.players.alice.findings[MISSING_BEAT.id].method,'LENS_SIGNATURE');
 assert.equal(s.players.alice.unlockedMethods['Echo Differentiation'],true);
 assert.equal(getExpeditionView(s,'alice').nextAction,'JOURNAL');
 assert.deepEqual(s.nodes,oldWorld.nodes);assert.deepEqual(s.links,oldWorld.links);
 assert.deepEqual(s.fields,oldWorld.fields);assert.deepEqual(s.events,oldWorld.events);
 assert.equal(initial.players.alice.findings,undefined);
});
test('Shelter solution demands two distinct routes, pays only second reading and finds another evidence method',()=>{
 let s=makeWorld();
 s=advance(s,'START','start');
 s=advance(s,'SELECT_ROLE','shelter',{role:'Shelter'});
 s=advance(s,'MEASURE','baseline',{route:'direct'});
 assert.equal(s.expeditions[JSON.stringify(['alice',MISSING_BEAT.id])].measurements[0].quality,1);
 const tooSoon=call(s,'INTERPRET','guess',{hypothesis:'route_echo'});
 assert.equal(tooSoon.result.code,'NEEDS_COMPARISON');
 assert.equal(tooSoon.state,s);
 const oldBalance=s.players.alice.wallet.balance;
 s=advance(s,'MEASURE','detour',{route:'via_b'});
 assert.equal(s.players.alice.wallet.balance,oldBalance-1);
 s=advance(s,'INTERPRET','now',{hypothesis:'route_echo'});
 assert.equal(s.expeditions[JSON.stringify(['alice',MISSING_BEAT.id])].method,'SHELTER_COMPARISON');
 s=advance(s,'FINISH','end');
 assert.equal(s.players.alice.findings[MISSING_BEAT.id].method,'SHELTER_COMPARISON');
});
test('Beacon gives a meaningful alternative, needing an additional direct comparison',()=>{
 let s=makeWorld();
 s=advance(s,'START','start');
 s=advance(s,'SELECT_ROLE','beacon',{role:'Beacon'});
 s=advance(s,'MEASURE','detour',{route:'via_b'});
 assert.equal(call(s,'INTERPRET','hasty',{hypothesis:'route_echo'}).result.code,'NEEDS_COMPARISON');
 s=advance(s,'MEASURE','direct',{route:'direct'});
 s=advance(s,'INTERPRET','explain',{hypothesis:'route_echo'});
 assert.equal(s.expeditions[JSON.stringify(['alice',MISSING_BEAT.id])].method,'BEACON_TRIANGULATION');
});
test('wrong explanation is reversible, no arbitrary answer flags accepted',()=>{
 let s=makeWorld();
 s=advance(s,'START','start');
 s=advance(s,'SELECT_ROLE','lens',{role:'Lens'});
 s=advance(s,'MEASURE','via',{route:'via_b'});
 const old=s.players.alice.wallet.balance;
 for(const hypothesis of ['hidden_source','local_noise']){
  const x=call(s,'INTERPRET',hypothesis,{hypothesis,correct:true,solved:true,extraLumen:100});
  assert.equal(x.result.code,'CONTRADICTED');
  assert.equal(x.state,s);
 }
 assert.equal(s.players.alice.wallet.balance,old);
 s=advance(s,'INTERPRET','right',{hypothesis:'route_echo'});
 assert.equal(s.players.alice.wallet.balance,old);
});
test('idempotent retry never repeats measurement costs, journal reward or changes the world',()=>{
 let s=makeWorld();
 s=advance(s,'START','start');
 s=advance(s,'SELECT_ROLE','role',{role:'Shelter'});
 s=advance(s,'MEASURE','m1',{route:'direct'});
 const two=call(s,'MEASURE','m2',{route:'via_b'});
 assert.equal(two.result.spent,1);
 const replay=call(two.state,'MEASURE','m2',{route:'via_b'});
 assert.equal(replay.result.replayed,true);
 assert.equal(replay.state,two.state);
 assert.equal(replay.state.players.alice.wallet.balance,s.players.alice.wallet.balance-1);
 const conflict=call(two.state,'INTERPRET','m2',{hypothesis:'route_echo'});
 assert.equal(conflict.result.code,'OPERATION_ID_CONFLICT');
 const duplicateRoute=call(two.state,'MEASURE','different',{route:'via_b'});
 assert.equal(duplicateRoute.result.code,'ROUTE_ALREADY_MEASURED');
});
test('role cannot change after a measurement; second player retains independent decisions',()=>{
 let s=makeWorld();
 s=advance(s,'START','s');
 s=advance(s,'SELECT_ROLE','r',{role:'Lens'});
 s=advance(s,'MEASURE','m',{route:'via_b'});
 assert.equal(call(s,'SELECT_ROLE','switch',{role:'Shelter'}).result.code,'ROLE_LOCKED_AFTER_MEASUREMENT');
 s=advance(s,'START','bob-start',{},'bob');
 s=advance(s,'SELECT_ROLE','bob-shelter',{role:'Shelter'},'bob');
 assert.equal(s.expeditions[JSON.stringify(['bob',MISSING_BEAT.id])].role,'Shelter');
 assert.equal(s.expeditions[JSON.stringify(['alice',MISSING_BEAT.id])].role,'Lens');
 assert.equal(s.players.bob.wallet.balance,18);
});
test('case snapshot remains reproducible after Interference recovers 21 days later',()=>{
 let s=makeWorld();
 const event=s.events['case-event'];
 assert.equal(eventPhase(event,21*24*H).phase,'Calm');
 s=advance(s,'START','start');
 s=advance(s,'SELECT_ROLE','lens',{role:'Lens'});
 s=advance(s,'MEASURE','measure',{route:'via_b'});
 const obs=getExpeditionView(s,'alice').measurements[0];
 assert.equal(obs.quality,.8);
 assert.equal(s.events['case-event'].stabilizedAtMs,null);
});
