import test from 'node:test';
import assert from 'node:assert/strict';
import {createPlayer,createWorldNode,createRulesState} from '../game-rules/node.mjs';
import {createGraphState,applyLinkAction} from '../game-rules/graph.mjs';
import {linkId,fieldId} from '../game-rules/identity.mjs';
import {createEventState,createInterferenceEvent,eventPhase,SIGNAL_MS,
 ACTIVE_MS,RECOVERY_MS,EVENT_GAP_MS,archivedEvent} from '../game-rules/events.mjs';
import {setFieldFocus,fieldSignalQuality,applyInterferenceAction,
 investigationKey,rerouteKey} from '../game-rules/interference.mjs';
const H=3600000,D=24*H;
const coords=(latitude,longitude)=>({latitude,longitude});
const P={a:coords(61.5,23.7),b:coords(61.502,23.701),
 c:coords(61.504,23.703),d:coords(61.508,23.709)};
const A=fieldId('a','b','c'),B=fieldId('a','b','d');
const ab=linkId('a','b'),ac=linkId('a','c'),bc=linkId('b','c'),
 ad=linkId('a','d'),bd=linkId('b','d');
const committed=(a,b)=>({id:linkId(a,b),a,b,status:'Committed'});
const fixture=()=>{
 const all={};
 for(const [a,b] of [['a','b'],['a','c'],['b','c'],['a','d'],['b','d']])
  all[linkId(a,b)]=committed(a,b);
 const players={alice:createPlayer(P.a,18),bob:createPlayer(P.a,18),cara:createPlayer(P.a,18)};
 const nodes=Object.fromEntries(Object.entries(P).map(([id,geo])=>[id,createWorldNode(geo,10000)]));
 const s=createEventState(createGraphState(createRulesState({nodes,players})));
 return {...s,links:all,fields:{
  [A]:{id:A,nodes:['a','b','c'],status:'Committed'},
  [B]:{id:B,nodes:['a','b','d'],status:'Committed'}}};
};
const publish=(s,eventId='e1',regionId='tampere',fieldId=A,edge=ab,start=0)=>
 createInterferenceEvent(s,{eventId,regionId,startsAtMs:start,
  fieldImpacts:[{fieldId,affectedLinkId:edge}]});
const act=(state,type,id,nowMs=25*H,actorId='alice',eventId='e1',fieldId=A,extra={})=>
 applyInterferenceAction(state,{type,operationId:id,nowMs,actorId,eventId,fieldId,...extra});
const focus=(s,role='Lens',actorId='alice',fieldId=A,nowMs=0)=>
 setFieldFocus(s,{actorId,fieldId,role,nowMs}).state;
test('UTC phase boundaries are deterministic: 24h warning, 72h active, 48h fading, then calm',()=>{
 const s=publish(fixture()),ev=s.events.e1;
 assert.equal(eventPhase(ev,0).phase,'Signal');
 assert.equal(eventPhase(ev,24*H-1).lossPP,0);
 assert.equal(eventPhase(ev,24*H).phase,'Interference');
 assert.equal(eventPhase(ev,24*H).lossPP,20);
 assert.equal(eventPhase(ev,96*H-1).lossPP,20);
 assert.equal(eventPhase(ev,96*H).phase,'Recovery');
 assert.equal(eventPhase(ev,96*H).lossPP,20);
 assert.equal(eventPhase(ev,120*H).lossPP,10);
 assert.equal(eventPhase(ev,144*H).phase,'Calm');
 assert.equal(eventPhase(ev,21*D).lossPP,0);
 assert.equal(archivedEvent(ev,21*D),true);
 assert.equal(SIGNAL_MS+ACTIVE_MS+RECOVERY_MS,144*H);
});
test('future event is Scheduled, no penalty; server time only, not GPS or camera',()=>{
 const s=publish(fixture(),'e1','tampere',A,ab,20*H),ev=s.events.e1;
 assert.equal(eventPhase(ev,19*H).phase,'Scheduled');
 assert.equal(eventPhase(ev,20*H).phase,'Signal');
 assert.throws(()=>eventPhase(ev,NaN));
 assert.throws(()=>eventPhase(ev,-1));
 assert.throws(()=>eventPhase({...ev,stabilizedAtMs:1},48*H));
});
test('region cooldown prohibits spam but permits a later canonical event at exactly day 21',()=>{
 let s=publish(fixture());
 assert.throws(()=>publish(s,'copy','tampere',A,ab,2*D),/cooldown/);
 assert.throws(()=>publish(s,'e1','other',A,ab,0),/exists/);
 s=publish(s,'later','tampere',A,ab,EVENT_GAP_MS);
 assert.equal(Object.keys(s.events).length,2);
 assert.equal(eventPhase(s.events.e1,EVENT_GAP_MS).phase,'Calm');
});
test('reject phantom, duplicate or malformed field/edge impacts before publishing',()=>{
 const s=fixture();
 assert.throws(()=>createInterferenceEvent(s,{eventId:'x',regionId:'a',startsAtMs:0,fieldImpacts:[]}));
 assert.throws(()=>publish(s,'bad','a','fake',ab));
 assert.throws(()=>publish(s,'bad','a',A,linkId('x','y')));
 assert.throws(()=>createInterferenceEvent(s,{eventId:'x',regionId:'a',startsAtMs:0,
  fieldImpacts:[{fieldId:A,affectedLinkId:ab},{fieldId:A,affectedLinkId:bc}]}));
 const noEdge={...s,links:{...s.links,[ab]:{...s.links[ab],status:'Building'}}};
 assert.throws(()=>publish(noEdge));
});
test('baseline interference weakens at most 20pp per event, 40pp for two regions',()=>{
 let s=focus(publish(fixture()),'Lens');
 assert.equal(fieldSignalQuality(s,'alice',A,25*H).quality,.8);
 s=publish(s,'e2','nokia',A,ac,0);
 const q=fieldSignalQuality(s,'alice',A,25*H);
 assert.equal(q.quality,.6);
 assert.equal(q.lossPP,40);
 assert.equal(fieldSignalQuality(s,'alice',B,25*H).quality,1);
 assert.equal(q.breakdown.length,2);
});
test('personal Shelter protects only ONE ongoing event and cannot alter another player',()=>{
 let s=focus(publish(fixture()),'Shelter');
 s=publish(s,'e2','nokia',A,ab,0);
 const a=fieldSignalQuality(s,'alice',A,25*H);
 const b=fieldSignalQuality(s,'bob',A,25*H);
 assert.equal(a.quality,.8);
 assert.equal(a.shieldedEventId,'e1');
 assert.equal(b.quality,.6);
 assert.equal(s.fields[A].status,'Committed');
});
test('focus is personal and capped at two, never overwrites a shared field role',()=>{
 let s=publish(fixture());
 const one=setFieldFocus(s,{actorId:'alice',fieldId:A,role:'Lens',nowMs:0});
 assert.equal(one.result.ok,true);s=one.state;
 s=focus(s,'Shelter','alice',B);
 assert.deepEqual(Object.keys(s.players.alice.fieldFocuses).sort(),[A,B].sort());
 const thirdId=fieldId('a','c','d');
 s={...s,fields:{...s.fields,[thirdId]:{id:thirdId,nodes:['a','c','d'],status:'Committed'}}};
 const limit=setFieldFocus(s,{actorId:'alice',fieldId:thirdId,role:'Beacon',nowMs:0});
 assert.equal(limit.result.code,'FOCUS_LIMIT');
 assert.equal(s.players.bob.fieldFocuses,undefined);
 const unchanged=setFieldFocus(s,{actorId:'alice',fieldId:A,role:'Lens',nowMs:25*H});
 assert.equal(unchanged.result.code,'FOCUS_UNCHANGED');
 const blocked=setFieldFocus(s,{actorId:'alice',fieldId:A,role:'Shelter',nowMs:25*H});
 assert.equal(blocked.result.code,'FOCUS_LOCKED_DURING_INTERFERENCE');
 assert.equal(blocked.state,s);
});
test('a newcomer can select focus during the disturbance but cannot retroactively shield',()=>{
 let s=publish(fixture());
 const late=setFieldFocus(s,{actorId:'cara',fieldId:A,role:'Shelter',nowMs:30*H});
 assert.equal(late.result.ok,true);
 s=late.state;
 assert.equal(fieldSignalQuality(s,'cara',A,30*H).quality,.8);
 assert.equal(fieldSignalQuality(s,'alice',A,30*H).quality,.8);
});
test('stabilize costs 2 L once worldwide and removes functional damage immediately',()=>{
 const before=focus(publish(fixture()),'Lens');
 const at=26*H,answer=act(before,'STABILIZE','stabilize1',at);
 assert.equal(answer.result.ok,true);
 assert.equal(answer.result.spent,2);
 assert.equal(answer.state.players.alice.wallet.balance,16);
 assert.equal(answer.state.players.bob.wallet.balance,18);
 assert.equal(eventPhase(answer.state.events.e1,at).phase,'Recovery');
 assert.equal(fieldSignalQuality(answer.state,'alice',A,at).lossPP,0);
 assert.equal(fieldSignalQuality(answer.state,'bob',A,at).lossPP,0);
 assert.equal(before.events.e1.stabilizedAtMs,null);
 assert.equal(answer.state.nodes.a.status,'Awakened');
 assert.equal(answer.state.links[ab].status,'Committed');
 assert.equal(answer.state.fields[A].status,'Committed');
});
test('stabilize is no-op when already resolved, in warning phase, or long after',()=>{
 const s=publish(fixture());
 assert.equal(act(s,'STABILIZE','early',0).result.code,'NOT_ACTIVE_OR_ALREADY_RESOLVED');
 assert.equal(act(s,'STABILIZE','late',7*D).result.code,'NOT_ACTIVE_OR_ALREADY_RESOLVED');
 const a=act(s,'STABILIZE','first',25*H);
 const b=act(a.state,'STABILIZE','another',26*H,'bob');
 assert.equal(b.result.code,'NOT_ACTIVE_OR_ALREADY_RESOLVED');
 assert.equal(b.state.players.bob.wallet.balance,18);
 assert.equal(a.state.players.alice.wallet.balance,16);
});
test('repeat stabilization returns same receipt; reused operation ID for another action conflicts',()=>{
 let s=publish(fixture());
 const one=act(s,'STABILIZE','same',25*H);
 const twice=act(one.state,'STABILIZE','same',27*H);
 assert.equal(twice.result.replayed,true);
 assert.equal(twice.state,one.state);
 const conflicting=act(one.state,'INVESTIGATE','same',27*H);
 assert.equal(conflicting.result.code,'OPERATION_ID_CONFLICT');
});
test('1000 retry storm never charges stabilization twice',()=>{
 let s=publish(fixture()),last;
 for(let i=0;i<1000;i++){
  const x=act(s,'STABILIZE','same',25*H+i);s=x.state;last=x;
 }
 assert.equal(s.players.alice.wallet.balance,16);
 assert.equal(Object.keys(s.receipts).length,1);
 assert.equal(last.result.replayed,true);
});
test('insufficient funds leave event untouched and allow another player to help',()=>{
 let s=publish(fixture());
 s={...s,players:{...s.players,alice:{...s.players.alice,wallet:{...s.players.alice.wallet,balance:0}}}};
 const denied=act(s,'STABILIZE','poor',25*H);
 assert.equal(denied.result.code,'INSUFFICIENT_LUMEN');
 assert.equal(denied.state,s);
 const helped=act(s,'STABILIZE','bob1',25*H,'bob');
 assert.equal(helped.result.ok,true);
 assert.equal(helped.state.players.bob.wallet.balance,16);
});
test('Investigate needs trusted authored proof; client solved=true is NOT authorization',()=>{
 const s=publish(fixture());
 const fake=act(s,'INVESTIGATE','try',25*H,'alice','e1',A,
  {solved:true,correct:true,fragmentId:'hacked'});
 assert.equal(fake.result.code,'PROOF_NOT_APPROVED');
 assert.equal(fake.state,s);
 const future=publish(fixture(),'future','rural',A,ab,100*H);
 assert.equal(act(future,'INVESTIGATE','early',50*H,'alice','future').result.code,'EVENT_NOT_STARTED');
});
test('Investigate stores unique personal fragment at zero L, even from archived event',()=>{
 let s=publish(fixture());
 const key=investigationKey('alice','e1');
 s={...s,investigationGrants:{[key]:{fragmentId:'missing-beat-fragment'}}};
 const archived=act(s,'INVESTIGATE','journal',21*D);
 assert.equal(archived.result.ok,true);
 assert.equal(archived.result.spent,0);
 assert.equal(archived.state.players.alice.wallet.balance,18);
 assert.equal(archived.state.players.alice.findings[key].fragmentId,'missing-beat-fragment');
 assert.equal(archived.state.events.e1.stabilizedAtMs,null);
 const duplicate=act(archived.state,'INVESTIGATE','new-id',21*D+1);
 assert.equal(duplicate.result.code,'ALREADY_INVESTIGATED');
 assert.equal(duplicate.state,archived.state);
 assert.equal(archived.state.players.bob.findings,undefined);
});
test('IGNORE is safe, stateless, free, and creates no backlog or ghost receipts',()=>{
 let s=publish(fixture());
 for(const now of [0,25*H,4*D,21*D]){
  const x=act(s,'IGNORE','ignored-'+now,now);
  assert.equal(x.result.ok,true);assert.equal(x.result.spent,0);
  assert.equal(x.state,s);s=x.state;
 }
 assert.equal(Object.keys(s.receipts).length,0);
});
test('personal Reroute is limited to an actually clean alternate committed path',()=>{
 let s=focus(publish(fixture()));
 const before=fieldSignalQuality(s,'alice',A,26*H).lossPP;
 const one=act(s,'REROUTE','route',26*H);
 assert.equal(before,20);
 assert.equal(one.result.ok,true);
 assert.equal(one.result.spent,1);s=one.state;
 assert.equal(fieldSignalQuality(s,'alice',A,26*H).lossPP,10);
 assert.equal(fieldSignalQuality(s,'bob',A,26*H).lossPP,20);
 assert.equal(s.players.alice.wallet.balance,17);
 assert.equal(s.links[ab].status,'Committed');
 assert.equal(act(s,'REROUTE','again',27*H).result.code,'ALREADY_REROUTED');
 assert.equal(fieldSignalQuality(s,'alice',A,51*H).lossPP,20);
});
test('reroute is not chargeable if no focus, event finished, field unaffected or route blocked',()=>{
 let s=publish(fixture());
 assert.equal(act(s,'REROUTE','no-focus').result.code,'FOCUS_REQUIRED');
 s=focus(s);
 assert.equal(act(s,'REROUTE','late',7*D).result.code,'NOT_ACTIVE_OR_ALREADY_RESOLVED');
 assert.equal(act(s,'REROUTE','different',25*H,'alice','e1',B).result.code,'FIELD_NOT_AFFECTED');
 s=publish(s,'e2','nokia',A,ac,0);
 assert.equal(act(s,'REROUTE','blocked').result.code,'NO_CLEAN_ALTERNATE_PATH');
 assert.equal(s.players.alice.wallet.balance,18);
});
test('Shelter cannot be farmed with a useless reroute',()=>{
 let s=focus(publish(fixture()),'Shelter');
 const no=act(s,'REROUTE','useless',25*H);
 assert.equal(no.result.code,'NO_FUNCTIONAL_BENEFIT');
 assert.equal(no.state,s);
});
test('21 days away leaves ALL nodes, links, fields, wallet and discoveries unchanged',()=>{
 let s=focus(publish(fixture()));
 const key=investigationKey('alice','e1');
 s={...s,investigationGrants:{[key]:{fragmentId:'rare-one'}}};
 s=act(s,'INVESTIGATE','observe',25*H).state;
 const before=s.players.alice.wallet.balance;
 const permanent={
  nodes:s.nodes,links:s.links,fields:s.fields,findings:s.players.alice.findings};
 assert.equal(fieldSignalQuality(s,'alice',A,21*D).quality,1);
 assert.deepEqual(s.nodes,permanent.nodes);
 assert.deepEqual(s.links,permanent.links);
 assert.deepEqual(s.fields,permanent.fields);
 assert.deepEqual(s.players.alice.findings,permanent.findings);
 assert.equal(s.players.alice.wallet.balance,before);
});
test('true link/field reducer output can be used by event rules without a second private world',()=>{
 let s=createGraphState(createRulesState({players:{alice:createPlayer(P.a,18)},
  nodes:{a:createWorldNode(P.a,10000),b:createWorldNode(P.b,10000),
   c:createWorldNode(P.c,10000)}}));
 for(const [a,b] of [['a','b'],['b','c'],['a','c']]){
  for(const stage of ['anchor','align']){
   const result=applyLinkAction(s,{actorId:'alice',operationId:a+b+stage,
    a,b,stage,type:'WEAVE',nowMs:0});
   assert.equal(result.result.ok,true);s=result.state;
  }
 }
 assert.ok(s.fields[A]);
 s=publish(createEventState(s));
 const answer=act(s,'STABILIZE','first',25*H);
 assert.equal(answer.result.ok,true);
 assert.equal(answer.state.fields[A].id,A);
});
test('bounded scenario sweep 21-day absences and arbitrary clock reads never reduce world assets',()=>{
 let seed=20261027,s=focus(publish(fixture()));
 const snapshot=JSON.stringify({nodes:s.nodes,links:s.links,fields:s.fields});
 for(let i=0;i<5000;i++){
  seed=(Math.imul(1664525,seed)+1013904223)>>>0;
  const now=seed%(40*D);
  const phase=eventPhase(s.events.e1,now);
  const quality=fieldSignalQuality(s,'alice',A,now);
  assert.ok(phase.lossPP>=0&&phase.lossPP<=20);
  assert.ok(quality.lossPP>=0&&quality.lossPP<=40);
  assert.ok(quality.quality>=.6&&quality.quality<=1);
  assert.equal(JSON.stringify({nodes:s.nodes,links:s.links,fields:s.fields}),snapshot);
 }
});
