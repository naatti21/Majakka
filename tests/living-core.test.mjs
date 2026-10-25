import { test } from 'node:test';
import assert from 'node:assert/strict';
import '../living-core.js';
const C=globalThis.MajakkaLivingCore;
const home={lat:62.2415,lng:25.7482};
test('virtual local preview has three independent nodes, one rift and six sparks',()=>{
 const w=C.positions(home);
 assert.equal(w.nodes.length,3);assert.equal(w.lumen.length,6);
 assert.ok(C.meters(home,w.rift)<200);
 assert.equal(new Set(w.nodes.map(x=>x.lat+':'+x.lng)).size,3);
});
test('all node distances are bounded, with one initially near node',()=>{
 const w=C.positions(home),d=w.nodes.map(p=>C.meters(home,p));
 assert.ok(d.every(x=>x>20&&x<210));assert.ok(d.some(x=>x<=85));
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
test('three awakened nodes close a triangle once and reward only once',()=>{
 const w=C.positions(home),s=C.blank();
 for(const n of w.nodes)assert.equal(C.contribute(s,{target:n.id,method:'decode',player:n,accuracy:8,lumen:0,world:w}).ok,true);
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
