import test from 'node:test';
import assert from 'node:assert/strict';
import {createWallet,spendLumen,grantEarnedLumen,channelLumen,WALLET_LIMITS} from '../game-rules/wallet.mjs';
import {createPlayer,createWorldNode,createRulesState,applyNodeAction} from '../game-rules/node.mjs';
import {researchKey,RESEARCH_STAGES} from '../game-rules/research.mjs';
const H=3600000,DAY=24*H;
const p=(latitude,longitude)=>({latitude,longitude});
const home=p(61.5,23.7);
const make=(players={alice:createPlayer(home)},nodes={a:createWorldNode(home),b:createWorldNode(p(61.501,23.701))})=>
 createRulesState({players,nodes});
const run=(s,type,operationId,extras={})=>applyNodeAction(s,{actorId:'alice',type,operationId,nowMs:0,...extras});
const next=(s,type,id,extras={})=>run(s,type,id,extras).state;
test('wallet rejects negatives, fractions, capacity overflow and overspending without mutation',()=>{
 assert.throws(()=>createWallet(-1));assert.throws(()=>createWallet(18.1));assert.throws(()=>createWallet(19));
 const w=createWallet(8);
 assert.deepEqual(spendLumen(w,9).ok,false);
 assert.equal(spendLumen(w,9).wallet,w);
 assert.equal(spendLumen(w,4).wallet.balance,4);
 assert.equal(w.balance,8);
 assert.throws(()=>spendLumen(w,-1));assert.throws(()=>grantEarnedLumen(w,1,NaN));
 assert.equal(WALLET_LIMITS.cap,18);
});
test('GPS-free Channel gives 4 Lumen, respects 20h cooldown and never produces streak debt',()=>{
 const start=createWallet();
 const first=channelLumen(start,0);
 assert.equal(first.granted,4);assert.equal(first.wallet.balance,12);
 assert.equal(channelLumen(first.wallet,20*H-1).reason,'CHANNEL_COOLDOWN');
 const second=channelLumen(first.wallet,20*H);
 assert.equal(second.granted,4);assert.equal(second.wallet.balance,16);
 assert.equal(channelLumen(second.wallet,21*DAY).granted,2);
 assert.equal(start.balance,8);
});
test('failed Channel when full does not use an opportunity; a later useful grant is allowed',()=>{
 const full=createWallet(18),no=channelLumen(full,0);
 assert.equal(no.ok,false);assert.equal(no.wallet.lastChannelAtMs,null);
 const spent=spendLumen(no.wallet,5).wallet;
 assert.equal(channelLumen(spent,0).granted,4);
});
test('rolling earnings cap spans Channel and any trusted source and expires at exactly 24h',()=>{
 let w=createWallet(0);
 w=grantEarnedLumen(w,7,0).wallet;
 const add=channelLumen(w,2*H);
 assert.equal(add.granted,3);assert.equal(add.wallet.balance,10);
 assert.equal(channelLumen(add.wallet,23*H).reason,'CHANNEL_COOLDOWN');
 const whenExpired=channelLumen(add.wallet,26*H);
 assert.equal(whenExpired.granted,4);
 assert.equal(whenExpired.wallet.balance,14);
 assert.ok(whenExpired.wallet.earned.every(x=>26*H-x.atMs<24*H));
});
test('wallet declines backdated grants instead of exploiting a moving client clock',()=>{
 const w=channelLumen(createWallet(),10000).wallet;
 assert.throws(()=>channelLumen(w,9999));
 assert.throws(()=>grantEarnedLumen(w,1,9000));
});
test('two local node awakenings cost 4L without a cooldown wait; leave 4L for later link work',()=>{
 const a=make(),original=a;
 const first=run(a,'ATTUNE','attune-1',{nodeId:'a'});
 assert.equal(first.result.ok,true);assert.equal(first.result.chargeUnits,10000);
 const second=run(first.state,'ATTUNE','attune-2',{nodeId:'b'});
 assert.equal(second.result.ok,true);
 assert.equal(second.state.players.alice.wallet.balance,4);
 assert.equal(second.state.nodes.a.status,'Awakened');
 assert.equal(second.state.nodes.b.status,'Awakened');
 assert.equal(original.nodes.a.chargeUnits,0);
 assert.equal(original.players.alice.wallet.balance,8);
});
test('already awakened node is free on attempted repeat even using a new operation ID',()=>{
 const a=make();
 const first=run(a,'ATTUNE','first',{nodeId:'a'});
 const duplicate=run(first.state,'ATTUNE','second',{nodeId:'a'});
 assert.equal(duplicate.result.code,'ALREADY_AWAKENED');
 assert.equal(duplicate.state,first.state);
 assert.equal(duplicate.state.players.alice.wallet.balance,6);
});
test('same operation id replays original receipt only; changed payload is rejected',()=>{
 const a=make();
 const one=run(a,'ATTUNE','uuid-1',{nodeId:'a'});
 const re=run(one.state,'ATTUNE','uuid-1',{nodeId:'a',nowMs:22*H});
 assert.equal(re.result.replayed,true);assert.equal(re.result.spent,2);assert.equal(re.state,one.state);
 const conflict=run(one.state,'ATTUNE','uuid-1',{nodeId:'b'});
 assert.equal(conflict.result.code,'OPERATION_ID_CONFLICT');
 assert.equal(conflict.state,one.state);
});
test('1000 exact operation replays never duplicate a wallet debit or charge',()=>{
 let s=make(),result;
 for(let i=0;i<1000;i++){const r=run(s,'ATTUNE','uuid-1',{nodeId:'a',nowMs:i*H});s=r.state;result=r.result;}
 assert.equal(s.players.alice.wallet.balance,6);
 assert.equal(s.nodes.a.chargeUnits,10000);
 assert.equal(Object.keys(s.receipts).length,1);
 assert.equal(result.replayed,true);
});
test('distant pulse is weak and same actor/node cooldown cannot be bypassed with a new UUID',()=>{
 const nodes={rome:createWorldNode(p(41.89,12.49))};
 const a=make({alice:createPlayer(home,8)},nodes);
 const first=run(a,'ATTUNE','pulse-1',{nodeId:'rome'});
 assert.ok(first.result.chargeUnits>=400&&first.result.chargeUnits<=500);
 const spam=run(first.state,'ATTUNE','pulse-2',{nodeId:'rome',nowMs:H});
 assert.equal(spam.result.code,'PULSE_COOLDOWN');
 assert.equal(spam.state,first.state);
 const later=run(first.state,'ATTUNE','pulse-3',{nodeId:'rome',nowMs:20*H});
 assert.equal(later.result.ok,true);
 assert.ok(later.result.chargeUnits>first.result.chargeUnits);
});
test('world node source geometry and home anchor override malicious action camera/GPS fields',()=>{
 const world=make(),request={nodeId:'a',location:p(0,0),home:p(0,0),camera:p(0,0),efficiency:200,chargeUnits:10000};
 const a=run(world,'ATTUNE','x',request);
 const b=run(world,'ATTUNE','x',{nodeId:'a'});
 assert.deepEqual(a.state.nodes.a,b.state.nodes.a);
 assert.deepEqual(a.state.players.alice.wallet,b.state.players.alice.wallet);
});
test('unknown actors and nodes fail without minting entities or spending Lumen',()=>{
 const world=make();
 const unknown=applyNodeAction(world,{actorId:'mallory',operationId:'x',nowMs:0,type:'CHANNEL'});
 assert.equal(unknown.result.code,'UNKNOWN_ACTOR');assert.equal(unknown.state,world);
 const no=run(world,'ATTUNE','y',{nodeId:'non-existent'});
 assert.equal(no.result.code,'UNKNOWN_NODE');assert.equal(no.state,world);
 assert.throws(()=>run(world,'POISON','z'));
});
test('research requires server-approved grant; client verified/solved flags are ignored',()=>{
 const world=make();
 const no=run(world,'RESEARCH','r1',{nodeId:'a',stage:'survey',verified:true,solved:true});
 assert.equal(no.result.code,'PROOF_NOT_APPROVED');
 assert.equal(no.state,world);
});
test('three independent approved stages add 0.90 charge, cost 3L, and each can only be used once',()=>{
 const grants=Object.fromEntries(RESEARCH_STAGES.map(stage=>[researchKey('alice','a',stage),true]));
 let world=make();
 world={...world,researchGrants:grants};
 for(const [i,stage] of RESEARCH_STAGES.entries()){
  const done=run(world,'RESEARCH','stage-'+i,{nodeId:'a',stage});
  assert.equal(done.result.ok,true);
  assert.equal(done.result.spent,1);
  assert.equal(done.result.chargeUnits,(i+1)*3000);
  world=done.state;
 }
 assert.equal(world.players.alice.wallet.balance,5);
 assert.equal(world.nodes.a.status,'Dormant');
 const again=run(world,'RESEARCH','different',{nodeId:'a',stage:'survey'});
 assert.equal(again.result.code,'STAGE_ALREADY_USED');
 assert.equal(again.state,world);
 const malformed=()=>run(world,'RESEARCH','oops',{nodeId:'a',stage:'invented'});
 assert.throws(malformed);
});
test('research cannot mint repeated credit on a fully awakened node, even with unused grants',()=>{
 let world=make();
 world={...world,researchGrants:{[researchKey('alice','a','survey')]:true}};
 world=run(world,'ATTUNE','a1',{nodeId:'a'}).state;
 const no=run(world,'RESEARCH','a2',{nodeId:'a',stage:'survey'});
 assert.equal(no.result.code,'ALREADY_AWAKENED');
 assert.equal(no.state,world);
});
test('validated research plus a direct pulse saturates charge at 10000, never above',()=>{
 const r=make();
 let world={...r,researchGrants:Object.fromEntries(RESEARCH_STAGES.map(s=>[researchKey('alice','a',s),true]))};
 for(const [i,stage] of RESEARCH_STAGES.entries())world=run(world,'RESEARCH','r'+i,{nodeId:'a',stage}).state;
 const done=run(world,'ATTUNE','finish',{nodeId:'a'});
 assert.equal(done.result.chargeUnits,10000);
 assert.equal(done.result.contributedUnits,1000);
 assert.equal(done.state.nodes.a.status,'Awakened');
});
test('second player contribution completes common node once; failed late action costs nothing',()=>{
 const nodes={r:createWorldNode(p(61.51,23.71),6500)};
 const a=make({alice:createPlayer(home),bob:createPlayer(home)},nodes);
 const a1=run(a,'ATTUNE','first',{nodeId:'r'});
 assert.equal(a1.result.chargeUnits,10000);
 const b1=applyNodeAction(a1.state,{actorId:'bob',operationId:'later',type:'ATTUNE',nodeId:'r',nowMs:0});
 assert.equal(b1.result.code,'ALREADY_AWAKENED');
 assert.equal(b1.state.players.bob.wallet.balance,8);
});
test('a depleted wallet fails atomically and can succeed later with a new operation',()=>{
 const a=make({alice:createPlayer(home,0)});
 const x=run(a,'ATTUNE','try-1',{nodeId:'a'});
 assert.equal(x.result.code,'INSUFFICIENT_LUMEN');assert.equal(x.state,a);
 const channel=run(a,'CHANNEL','earn');
 assert.equal(channel.result.granted,4);
 const success=run(channel.state,'ATTUNE','try-2',{nodeId:'a'});
 assert.equal(success.result.ok,true);assert.equal(success.state.players.alice.wallet.balance,2);
});
test('channel operations are idempotent, ignore GPS claims and cannot produce phantom Lumen',()=>{
 const world=make();
 const a=run(world,'CHANNEL','c1',{fakeGPS:p(1,1),granted:100});
 const b=run(a.state,'CHANNEL','c1',{nowMs:50*H});
 assert.equal(b.result.replayed,true);assert.equal(b.state.players.alice.wallet.balance,12);
 const sameTime=run(a.state,'CHANNEL','c2',{nowMs:H});
 assert.equal(sameTime.result.code,'CHANNEL_COOLDOWN');
 const future=run(a.state,'CHANNEL','c3',{nowMs:20*H});
 assert.equal(future.result.granted,4);
 assert.equal(future.state.players.alice.wallet.balance,16);
});
test('21 days away never automatically drains Lumen or downgrades node',()=>{
 let state=make();
 state=run(state,'ATTUNE','one',{nodeId:'a'}).state;
 const after=run(state,'CHANNEL','return',{nowMs:21*DAY});
 assert.equal(after.state.nodes.a.status,'Awakened');
 assert.equal(after.state.players.alice.wallet.balance,10);
 assert.equal(after.result.ok,true);
});
test('state property trial: random action replays never increase wallet above cap',()=>{
 let state=make({alice:createPlayer(home,8)},{a:createWorldNode(p(61.8,23.9))});
 let seed=0x29FEE;
 for(let i=0;i<800;i++){
  seed=(Math.imul(seed,1664525)+1013904223)>>>0;
  const name=['ATTUNE','CHANNEL'][seed%2];
  const id='f'+(seed%30);
  const act=run(state,name,id,{nodeId:'a',nowMs:i*H});
  state=act.state;
  assert.ok(state.players.alice.wallet.balance>=0&&state.players.alice.wallet.balance<=18);
  assert.ok(state.nodes.a.chargeUnits>=0&&state.nodes.a.chargeUnits<=10000);
 }
});
