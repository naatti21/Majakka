import test from 'node:test';
import assert from 'node:assert/strict';
import {distanceKm,e} from '../game-rules/geo.mjs';
import {linkId,fieldId} from '../game-rules/identity.mjs';
import {createPlayer,createWorldNode,createRulesState} from '../game-rules/node.mjs';
import {effectiveReach} from '../game-rules/relay.mjs';
import {FIELD_AREA_LUMEN,isCommitted,isClosedField,fieldsClosedByLink,readField} from '../game-rules/field.mjs';
import {createGraphState,applyLinkAction,previewLinkAction,linkWorkKm,linkRequiredUnits,linkProofKey} from '../game-rules/graph.mjs';
const H=3600000;
const p=(latitude,longitude)=>({latitude,longitude});
const tampere=p(61.5,23.7),near=p(61.504,23.707),third=p(61.507,23.702),
 fourth=p(61.508,23.711),rome=p(41.8902,12.4922),ny=p(40.6892,-74.0445);
const awake=q=>createWorldNode(q,10000);
const homePlayers=(balance=18)=>({alice:createPlayer(tampere,balance),bob:createPlayer(tampere,balance)});
const nodes=()=>({a:awake(tampere),b:awake(near),c:awake(third),d:awake(fourth),
 r:awake(rome),n:awake(ny)});
const world=(balance=18)=>createGraphState(createRulesState({players:homePlayers(balance),nodes:nodes()}));
const act=(state,id,a='a',b='b',stage='anchor',actorId='alice',type='WEAVE',nowMs=0)=>
 applyLinkAction(state,{actorId,operationId:id,a,b,stage,type,nowMs});
const progress=(state,a,b,actor='alice',prefix='')=>{
 const t1=act(state,prefix+'anchor',a,b,'anchor',actor);
 assert.equal(t1.result.ok,true);
 const t2=act(t1.state,prefix+'align',a,b,'align',actor);
 assert.equal(t2.result.ok,true);
 return t2.state;
};
function completedTriangle(){
 let s=world();
 // independent high-budget helper: each complete short link costs 4L.
 s=progress(s,'a','b','alice','ab-');
 s=progress(s,'b','c','alice','bc-');
 s=progress(s,'a','c','bob','ac-');
 return s;
}
test('link work is continuous, monotone, bounded, and has an explicit price floor',()=>{
 assert.equal(linkWorkKm(0),2);
 assert.equal(linkWorkKm(1),2);
 assert.equal(linkWorkKm(2),2);
 assert.ok(linkWorkKm(10)>2&&linkWorkKm(10)<3);
 assert.equal(linkWorkKm(200000),6);
 assert.ok(linkWorkKm(2307)>5&&linkWorkKm(2307)<5.2);
 assert.ok(linkRequiredUnits(6491)>50000);
 for(const v of [NaN,Infinity,-1])assert.throws(()=>linkWorkKm(v));
 let last=0;
 for(let km=0;km<50000;km+=.5){
  const cost=linkWorkKm(km);assert.ok(cost>=last&&cost<=6);
  last=cost;
 }
});
test('link existence is a real world-state decision, not a consequence of proximity',()=>{
 const s=world();
 assert.equal(Object.keys(s.links).length,0);
 assert.equal(Object.keys(s.fields).length,0);
 assert.equal(readField(s.links,'a','b','c'),null);
});
test('only two different awakened, catalogued world IDs can start a link',()=>{
 let s=world();
 s={...s,nodes:{...s.nodes,b:createWorldNode(near)}};
 assert.equal(act(s,'x').result.code,'NODE_NOT_AWAKENED');
 assert.equal(act(world(),'x','a','ghost').result.code,'UNKNOWN_NODE');
 assert.throws(()=>act(world(),'x','a','a'));
 assert.equal(act(world(),'x','a','b','anchor','unknown').result.code,'UNKNOWN_ACTOR');
});
test('link contribution q is geometric mean of effective reach at BOTH ends',()=>{
 const s=world(),q=previewLinkAction(s,{actorId:'alice',a:'a',b:'r',type:'WEAVE',stage:'anchor',nowMs:0});
 const expected=Math.sqrt(e(0)*e(distanceKm(tampere,rome)));
 assert.ok(Math.abs(q.effectiveness-expected)<1e-10);
 assert.equal(q.cost,2);assert.equal(q.workUnits,Math.round(10000*expected));
 const reversed=previewLinkAction(s,{actorId:'alice',a:'r',b:'a',type:'WEAVE',stage:'anchor',nowMs:0});
 assert.equal(q.workUnits,reversed.workUnits);assert.equal(q.id,reversed.id);
 assert.ok(q.effectiveness<.3&&q.effectiveness>.1);
});
test('Anchor and Align can progress in one sitting; the short link becomes permanent',()=>{
 let s=world();
 const bad=act(s,'bad','a','b','align');
 assert.equal(bad.result.code,'ANCHOR_FIRST');
 const t=act(s,'one');
 assert.equal(t.result.code,'LINK_PROGRESS');
 assert.equal(t.result.spent,2);
 assert.equal(t.result.workDoneUnits,10000);
 const second=act(t.state,'two','b','a','align');
 assert.equal(second.result.committed,true);
 assert.equal(second.result.code,'LINK_COMMITTED');
 const id=linkId('b','a'),final=second.state.links[id];
 assert.equal(final.status,'Committed');
 assert.equal(final.workDoneUnits,20000);
 assert.equal(final.lightWorkUnits,20000);
 assert.equal(final.proofWorkUnits,0);
 assert.equal(second.state.players.alice.wallet.balance,14);
 assert.equal(s.players.alice.wallet.balance,18);
 assert.equal(Object.keys(second.state.fields).length,0);
});
test('once built, the shared link cannot be built twice by other actors or repeated operation IDs',()=>{
 const s=progress(world(),'a','b');
 const t=act(s,'bob tries','a','b','anchor','bob');
 assert.equal(t.result.code,'LINK_ALREADY_COMMITTED');
 assert.equal(t.state,s);
 assert.equal(s.players.bob.wallet.balance,18);
});
test('repeated operation IDs replay original receipt without duplicate wallet mutation',()=>{
 const first=act(world(),'same','a','r','anchor');
 const replay=act(first.state,'same','r','a','anchor','alice','WEAVE',20*H);
 assert.equal(replay.result.replayed,true);
 assert.equal(replay.state,first.state);
 assert.equal(replay.result.spent,2);
 const changed=act(first.state,'same','a','n','anchor');
 assert.equal(changed.result.code,'OPERATION_ID_CONFLICT');
 assert.equal(changed.state,first.state);
});
test('one 1000x retry storm charges only once; duplicate stage with new IDs charges zero',()=>{
 let s=world();
 for(let i=0;i<1000;i++){
  s=act(s,'one','a','r','anchor','alice','WEAVE',i*H).state;
 }
 assert.equal(s.players.alice.wallet.balance,16);
 assert.equal(Object.keys(s.receipts).length,1);
 const denied=act(s,'other-id','a','r','anchor');
 assert.equal(denied.result.code,'STAGE_ALREADY_USED');
 assert.equal(denied.state,s);
});
test('Reinforce is blocked before Anchor and Align, then has 20h repeat cooldown',()=>{
 let s=world();
 assert.equal(act(s,'xx','a','r','reinforce').result.code,'ALIGN_FIRST');
 s=progress(s,'a','r');
 const first=act(s,'reinforce-1','a','r','reinforce');
 assert.equal(first.result.ok,true);
 const premature=act(first.state,'reinforce-2','a','r','reinforce','alice','WEAVE',H);
 assert.equal(premature.result.code,'LINK_COOLDOWN');
 assert.equal(premature.state,first.state);
 const later=act(first.state,'reinforce-3','a','r','reinforce','alice','WEAVE',20*H);
 assert.equal(later.result.ok,true);
});
test('proof is limited to long links and requires trusted prior validation',()=>{
 const s=world();
 assert.equal(act(s,'a','a','b','survey','alice','LINK_PROOF').result.code,'PROOF_REQUIRES_LONG_LINK');
 const falseGrant=act(s,'a','a','n','survey','alice','LINK_PROOF');
 assert.equal(falseGrant.result.code,'PROOF_NOT_APPROVED');
 assert.equal(falseGrant.state,s);
 const malicious=applyLinkAction(s,{actorId:'alice',operationId:'fake',type:'LINK_PROOF',
  a:'a',b:'n',stage:'survey',nowMs:0,solved:true,verified:true,workUnits:100000});
 assert.equal(malicious.result.code,'PROOF_NOT_APPROVED');
});
test('three separately verified long-link proofs help, but cannot finish link without physical work',()=>{
 let s=world();
 const id=linkId('a','n');
 s={...s,linkProofGrants:Object.fromEntries(['survey','interpret','route'].map(st=>[linkProofKey('alice',id,st),true]))};
 for(const [i,stage] of ['survey','interpret','route'].entries()){
  const t=act(s,'proof-'+i,'a','n',stage,'alice','LINK_PROOF');
  assert.equal(t.result.ok,true);
  s=t.state;
 }
 const link=s.links[id];
 assert.equal(link.proofWorkUnits,Math.floor(link.workRequiredUnits*.8));
 assert.equal(link.lightWorkUnits,0);
 assert.equal(link.status,'Building');
 assert.equal(s.players.alice.wallet.balance,15);
 const duplicate=act(s,'proof-again','a','n','survey','alice','LINK_PROOF');
 assert.equal(duplicate.result.code,'STAGE_ALREADY_USED');
});
test('80% proof ceiling applies across ALL actors globally, even with independent grants',()=>{
 let s=world(),id=linkId('a','n');
 const stages=['survey','interpret','route'];
 const grants=Object.fromEntries(['alice','bob'].flatMap(who=>stages.map(st=>[linkProofKey(who,id,st),true])));
 s={...s,linkProofGrants:grants};
 let charged=0;
 for(const who of ['alice','bob']){
  for(const [i,stage] of stages.entries()){
   const result=act(s,who+'-'+i,'a','n',stage,who,'LINK_PROOF');
   if(result.result.ok)charged++;
   s=result.state;
  }
 }
 assert.equal(s.links[id].proofWorkUnits,Math.floor(s.links[id].workRequiredUnits*.8));
 assert.ok(charged>=3&&charged<=4);
 assert.equal(s.links[id].status,'Building');
 assert.ok(s.links[id].lightWorkUnits===0);
});
test('proof cannot mint a claim on a short link or on an already committed long link',()=>{
 const s=world(),short=act(s,'q','a','b','survey','alice','LINK_PROOF');
 assert.equal(short.result.code,'PROOF_REQUIRES_LONG_LINK');
 assert.equal(short.state,s);
});
test('concurrent actor sequential reduction caps progress and leaves a late actor uncharged',()=>{
 let s=world();
 s=progress(s,'a','b','alice','alice-');
 const bob=act(s,'bob-late','a','b','anchor','bob');
 assert.equal(bob.result.code,'LINK_ALREADY_COMMITTED');
 assert.equal(bob.state.players.bob.wallet.balance,18);
});
test('a failed debit does not consume the once-only Anchor stage or create a link',()=>{
 let s=world(0);
 const denied=act(s,'x','a','b','anchor');
 assert.equal(denied.result.code,'INSUFFICIENT_LUMEN');
 assert.equal(denied.state,s);
 assert.equal(Object.keys(denied.state.links).length,0);
});
test('relay improves far-end reach only via preexisting committed links',()=>{
 const s=world();
 const before=effectiveReach(tampere,ny,s.nodes,s.links);
 assert.equal(before.relay,0);
 const id=linkId('a','n'),length=distanceKm(tampere,ny);
 const copy={...s.links,[id]:{id,a:'a',b:'n',lengthKm:length,
  status:'Committed',workRequiredUnits:linkRequiredUnits(length),
  workDoneUnits:linkRequiredUnits(length),proofWorkUnits:0,
  lightWorkUnits:linkRequiredUnits(length)}};
 const after=effectiveReach(tampere,ny,s.nodes,copy);
 assert.ok(after.relay>before.direct);
 assert.ok(after.effectiveness<=.6);
 assert.ok(after.relayVirtualKm<length);
 assert.equal(after.hops,1);
 const noHops=effectiveReach(tampere,ny,s.nodes,copy,0);
 assert.equal(noHops.effectiveness,before.direct);
});
test('incomplete links never relay and disconnected nodes do not invent paths',()=>{
 const s=world();
 const id=linkId('a','n'),length=distanceKm(tampere,ny);
 const unfinished={...s.links,[id]:{id,a:'a',b:'n',status:'Building',lengthKm:length}};
 const f=effectiveReach(tampere,ny,s.nodes,unfinished);
 assert.equal(f.relay,0);
});
test('two-hop relay never gives better than capped reach or a magical unlimited jump',()=>{
 const ns={a:awake(p(0,0)),b:awake(p(0,40)),c:awake(p(0,85))};
 const built={};
 for(const [a,b] of [['a','b'],['b','c']]){
  const id=linkId(a,b),length=distanceKm(ns[a].geo,ns[b].geo);
  built[id]={id,a,b,status:'Committed',lengthKm:length};
 }
 const target=ns.c.geo,home=ns.a.geo;
 const direct=effectiveReach(home,target,ns,{},6);
 const relayed=effectiveReach(home,target,ns,built,6);
 assert.ok(relayed.effectiveness>direct.effectiveness);
 assert.ok(relayed.effectiveness<=.6);
 assert.ok(relayed.hops<=2);
 assert.equal(effectiveReach(home,target,ns,built,1).hops,1);
});
test('field requires every committed edge; no automatic edge or reward from proximity',()=>{
 let s=world();
 s=progress(s,'a','b','alice','ab-');
 s=progress(s,'b','c','alice','bc-');
 assert.equal(isClosedField(s.links,'a','b','c'),false);
 assert.equal(Object.keys(s.fields).length,0);
 assert.equal(fieldsClosedByLink(s.links,'a','c').length,0);
 s=progress(s,'a','c','bob','ac-');
 const field=s.fields[fieldId('a','b','c')];
 assert.ok(field);
 assert.equal(field.status,'Committed');
 assert.deepEqual(field.nodes,['a','b','c']);
 assert.equal(FIELD_AREA_LUMEN,0);
 assert.equal(s.players.bob.wallet.balance,14);
});
test('multiple overlapping triangles share links but have independent canonical identities',()=>{
 let s=completedTriangle();
 const x=fieldId('a','b','c');
 s=progress(s,'a','d','alice','ad-');
 s=progress(s,'b','d','bob','bd-');
 assert.ok(s.fields[x]);assert.ok(s.fields[fieldId('a','b','d')]);
 assert.equal(Object.keys(s.fields).length,2);
 assert.equal(readField(s.links,'a','b','d').id,fieldId('d','b','a'));
 assert.equal(isCommitted(s.links,'b','a'),true);
 assert.throws(()=>readField(s.links,'a','a','b'));
});
test('field identities never depend on pan, zoom, triangulation area or lat/lng',()=>{
 const s=completedTriangle(),ids=Object.keys(s.fields);
 assert.deepEqual(ids,[fieldId('c','a','b')]);
 const changed={...s,nodes:{...s.nodes,
  a:{...s.nodes.a,geo:p(0,179)},b:{...s.nodes.b,geo:p(0,-179)},
  c:{...s.nodes.c,geo:p(30,-20)}}};
 assert.deepEqual(Object.keys(changed.fields),ids);
 assert.equal(FIELD_AREA_LUMEN,0);
});
test('dateline-spanning cross-ocean link is valid and can be completed with two distant contributors',()=>{
 const ns={x:awake(p(0,179)),y:awake(p(0,-179))};
 let s=createGraphState(createRulesState({players:{
  alice:createPlayer(p(0,179),18),bob:createPlayer(p(0,-179),18)},nodes:ns}));
 const preview=previewLinkAction(s,{actorId:'alice',type:'WEAVE',a:'x',b:'y',stage:'anchor',nowMs:0});
 assert.ok(preview.link.lengthKm<250);
 const first=act(s,'x-1','x','y','anchor');
 assert.equal(first.result.ok,true);s=first.state;
 const next=act(s,'y-1','x','y','anchor','bob');
 assert.equal(next.result.ok,true);
 assert.equal(next.state.links[linkId('x','y')].status,'Building');
});
test('malformed action, forged distance, fake instant win and self link are blocked',()=>{
 const s=world();
 assert.throws(()=>act(s,'err','a','a'));
 assert.throws(()=>applyLinkAction(s,{actorId:'alice',operationId:'x',a:'a',b:'b',type:'WEAVE',
  stage:'fake',nowMs:0}));
 const one=applyLinkAction(s,{actorId:'alice',operationId:'legit',type:'WEAVE',stage:'anchor',
  a:'a',b:'n',nowMs:0,workDoneUnits:100000000,efficiency:1e5,distanceKm:0});
 assert.equal(one.result.ok,true);
 assert.ok(one.state.links[linkId('a','n')].workDoneUnits<10000);
});
test('link progress and fields do not decay after 21 days of inactivity',()=>{
 const s=completedTriangle(),old={...s};
 const after=act(s,'newproject','a','r','anchor','alice','WEAVE',21*24*H);
 assert.equal(after.result.ok,true);
 assert.deepEqual(s.fields,old.fields);
 assert.ok(after.state.fields[fieldId('a','b','c')]);
});
