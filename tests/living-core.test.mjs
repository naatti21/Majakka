import { test } from 'node:test';
import assert from 'node:assert/strict';
import '../living-core.js';
const C=globalThis.MajakkaLivingCore;
const home={lat:62.2415,lng:25.7482};
test('virtual local preview has three independent nodes, one rift and six sparks',()=>{
 const w=C.positions(home);
 assert.equal(w.nodes.length,3);assert.equal(w.lumen.length,6);
 assert.ok(C.meters(home,w.rift)>200 && C.meters(home,w.rift)<430);
 assert.equal(new Set(w.nodes.map(x=>x.lat+':'+x.lng)).size,3);
});
test('nodes are distributed over a district, not clustered beside player',()=>{
 const w=C.positions(home),d=w.nodes.map(p=>C.meters(home,p));
 assert.ok(d.every(x=>x>280&&x<800));
 const distances=[[0,1],[0,2],[1,2]].map(([a,b])=>C.meters(w.nodes[a],w.nodes[b]));
 assert.ok(distances.every(m=>m>450));
});
test('near location boosts node contribution and costs less',()=>{
 const w=C.positions(home),s=C.blank(),n=w.nodes[0];
 const r=C.contribute(s,{target:n.id,method:'lumen',player:n,accuracy:12,lumen:10,world:w});
 assert.equal(r.ok,true);assert.equal(r.cost,2);assert.equal(r.gain,2);
 assert.equal(C.contribute(s,{target:n.id,method:'decode',player:n,lumen:0,world:w}).ok,false);
});
test('afar decode is playable without Lumen but progresses more slowly',()=>{
 const w=C.positions(home),s=C.blank(),n=w.nodes[1];
 const r=C.contribute(s,{target:n.id,method:'decode',player:home,accuracy:8,lumen:0,world:w});
 assert.equal(r.cost,0);assert.equal(r.gain,1);
 C.pulse(s);assert.equal(s.nodes[1],1);assert.equal(s.field,false);
});
test('bad GPS accuracy cannot produce strong near signal',()=>{
 const w=C.positions(home),s=C.blank(),n=w.nodes[0];
 assert.equal(C.near(n,n,180),false);
 assert.equal(C.contribute(s,{target:n.id,method:'lumen',player:n,accuracy:180,lumen:10,world:w}).cost,3);
});
test('three awakened nodes still need deliberate links to close a living circuit',()=>{
 const w=C.positions(home),s=C.blank();
 for(const n of w.nodes)assert.equal(C.contribute(s,{target:n.id,method:'decode',player:n,accuracy:8,lumen:0,world:w}).ok,true);
 assert.equal(C.pulse(s).opened,false);
 assert.equal(C.projection(s,w).edges.length,0);
 assert.equal(C.weave(s,'echo-0','echo-1',{method:'lumen',lumen:1}).cost,1);
 assert.equal(C.weave(s,'echo-0','echo-1',{method:'decode'}).ok,false);
 assert.equal(C.weave(s,'echo-1','echo-2',{method:'decode'}).ok,true);
 assert.equal(C.weave(s,'echo-0','echo-2',{method:'decode'}).ok,true);
 const p=C.pulse(s);assert.equal(p.opened,true);assert.equal(p.reward,3);
 const render=C.projection(s,w);assert.equal(render.edges.length,3);assert.equal(render.field,true);
 assert.equal(C.pulse(s).reward,0);
});
test('rift needs distinct cycles and restores color after completion',()=>{
 const w=C.positions(home),s=C.blank();
 assert.equal(C.contribute(s,{target:'veil',method:'decode',world:w,lumen:0}).ok,true);
 assert.equal(C.contribute(s,{target:'veil',method:'decode',world:w,lumen:0}).ok,false);
 const p1=C.pulse(s);assert.equal(p1.cleared,false);assert.ok(s.interference>=1);
 assert.equal(C.contribute(s,{target:'veil',method:'lumen',world:w,lumen:2}).cost,2);
 const p2=C.pulse(s);assert.equal(p2.cleared,true);assert.equal(p2.reward,3);
 assert.equal(s.interference,0);
 assert.equal(C.contribute(s,{target:'veil',method:'decode',world:w,lumen:0}).ok,false);
});
test('sparks require proximity and do not respawn during pulses',()=>{
 const w=C.positions(home),s=C.blank(),p=w.lumen[0];
 assert.equal(C.collect(s,p.id,home,150,w).ok,false);
 assert.equal(C.collect(s,p.id,p,5,w).reward,1);
 C.pulse(s);assert.equal(C.collect(s,p.id,p,5,w).ok,false);
});
test('safe unrecognized targets never change progress',()=>{
 const s=C.blank(),w=C.positions(home);
 assert.equal(C.contribute(s,{target:'not-a-real-node',method:'lumen',world:w,lumen:100}).ok,false);
 assert.equal(C.collect(s,'missing',home,5,w).ok,false);
 assert.deepEqual(s,C.blank());
});

test('nearby sessions reopen the same stable map cell, distant visits use another',()=>{
 const a=C.region(home),b=C.region({lat:home.lat+.0001,lng:home.lng+.0001});
 assert.equal(a.id,b.id);assert.deepEqual(C.positions(a.center),C.positions(b.center));
 const distant=C.region({lat:home.lat+.025,lng:home.lng});
 assert.notEqual(a.id,distant.id);
 assert.ok(C.meters(home,a.center)<1000);
});
test('weaving disallows locked endpoints, duplicate links and invalid IDs',()=>{
 const s=C.blank(),w=C.positions(home);
 assert.equal(C.weave(s,'echo-0','echo-1',{method:'decode'}).ok,false);
 for(const n of w.nodes)C.contribute(s,{target:n.id,method:'decode',player:n,accuracy:3,lumen:0,world:w});
 C.pulse(s);
 assert.equal(C.weave(s,'echo-0','echo-0',{method:'decode'}).ok,false);
 assert.equal(C.weave(s,'echo-0','echo-2',{method:'lumen',lumen:0}).ok,false);
 assert.equal(C.weave(s,'echo-0','echo-2',{method:'decode'}).ok,true);
 assert.equal(C.weave(s,'echo-2','echo-0',{method:'decode'}).ok,false);
});

test('constellation orientation and names change deterministically by neighborhood',()=>{
 const a=C.region(home),b=C.region({lat:home.lat+.025,lng:home.lng+.025});
 const wa=C.positions(a.center),wb=C.positions(b.center);
 assert.deepEqual(C.positions(a.center),wa);
 assert.notDeepEqual(wa.nodes.map(n=>n.lng),wb.nodes.map(n=>n.lng));
 assert.equal(wa.nodes.length,3);
});
test('eight neighbor-region echoes are visible but distinct and non-interactive',()=>{
 const a=C.region(home),world=C.positions(a.center),outer=C.projection(C.blank(),world).outer;
 assert.equal(outer.length,8);
 assert.ok(outer.every(n=>n.id.startsWith('ambient-')&&n.kind==='distant'));
 assert.ok(outer.filter(n=>C.meters(n,world.origin)>500).length>=5);
 assert.deepEqual(outer,C.projection(C.blank(),world).outer);
});
test('remote node contributions need hours between pulses but remain playable from home',()=>{
 const world=C.positions(home),s=C.blank(),n=world.nodes[0],now=1700000000000;
 const first=C.contribute(s,{target:n.id,method:'decode',player:home,accuracy:8,lumen:0,world,now});
 assert.equal(first.ok,true);assert.equal(first.gain,1);
 C.pulse(s);
 const repeat=C.contribute(s,{target:n.id,method:'decode',player:home,accuracy:8,lumen:0,world,now:now+600000});
 assert.equal(repeat.ok,false);
 const later=C.contribute(s,{target:n.id,method:'decode',player:home,accuracy:8,lumen:0,world,now:now+C.REMOTE_SETTLE_MS+1000});
 assert.equal(later.ok,true);
 C.pulse(s);assert.equal(s.nodes[0],2);
});
test('a real nearby signal can resolve a remote node without waiting a day',()=>{
 const world=C.positions(home),s=C.blank(),n=world.nodes[0],now=1700000000000;
 C.contribute(s,{target:n.id,method:'decode',player:home,accuracy:8,lumen:0,world,now});
 C.pulse(s);
 const stronger=C.contribute(s,{target:n.id,method:'lumen',player:n,accuracy:6,lumen:2,world,now:now+120000});
 assert.equal(stronger.ok,true);
 assert.equal(stronger.cost,2);
 C.pulse(s);assert.equal(s.nodes[0],2);
});
