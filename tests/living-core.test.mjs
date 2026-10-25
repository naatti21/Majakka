import {test} from 'node:test';
import assert from 'node:assert/strict';
import '../living-core.js';
const C=globalThis.MajakkaLivingCore,home={lat:62.2415,lng:25.7482};
test('repeatable local field has 12 dispersed nodes, rift, neighbor echoes',()=>{
 const a=C.region(home),w=C.positions(a.center);
 assert.equal(w.nodes.length,12);assert.equal(w.lumen.length,6);
 assert.equal(C.surrounding(a.center).length,8);
 assert.deepEqual(C.positions(a.center),w);
 assert.ok(w.nodes.every(n=>C.meters(n,a.center)<1200));
});
test('near activation strong, remote activation weak and cooldown retained',()=>{
 const w=C.positions(C.region(home).center),s=C.blank(),n=w.nodes[0],now=1700000000000;
 const a=C.contribute(s,{target:n.id,method:'decode',lumen:0,player:home,accuracy:8,world:w,now});
 assert.equal(a.gain,1);C.pulse(s);
 assert.equal(C.contribute(s,{target:n.id,method:'decode',lumen:0,player:home,accuracy:8,world:w,now:now+100000}).ok,false);
 assert.equal(C.contribute(s,{target:n.id,method:'lumen',lumen:3,player:n,accuracy:5,world:w,now:now+100000}).gain,2);
});
test('three selected awake nodes can form a harmonic field',()=>{
 const w=C.positions(C.region(home).center),s=C.blank();
 for(const i of [0,5,11])s.nodes[i]=2;
 assert.equal(C.weave(s,'echo-0','echo-5',{method:'decode'}).ok,true);
 assert.equal(C.weave(s,'echo-5','echo-11',{method:'decode'}).ok,true);
 assert.equal(C.weave(s,'echo-11','echo-0',{method:'decode'}).ok,true);
 assert.equal(C.pulse(s).opened,true);
 assert.equal(C.projection(s,w).fields.length,1);
 assert.equal(C.pulse(s).reward,0);
});
test('rift requires distinct pulses and cannot grant same reward again',()=>{
 const w=C.positions(home),s=C.blank();
 assert.equal(C.contribute(s,{target:'veil',method:'decode',world:w,lumen:0}).ok,true);
 assert.equal(C.contribute(s,{target:'veil',method:'decode',world:w,lumen:0}).ok,false);
 assert.equal(C.pulse(s).cleared,false);
 assert.equal(C.contribute(s,{target:'veil',method:'decode',world:w,lumen:0}).ok,true);
 assert.equal(C.pulse(s).cleared,true);
 assert.equal(C.contribute(s,{target:'veil',method:'decode',world:w,lumen:0}).ok,false);
});
test('cosmetic spark field moves when player moves but cannot itself mint Lumen',()=>{
 const first=C.energyField(home),second=C.energyField({lat:home.lat+.01,lng:home.lng+.01});
 assert.equal(first.length,18);assert.notDeepEqual(first,second);
 assert.equal(C.blank().nodes.length,C.NODE_COUNT);
});
test('invalid node and links are rejected safely',()=>{
 const w=C.positions(home),s=C.blank();
 assert.equal(C.contribute(s,{target:'unknown',method:'lumen',lumen:10,world:w}).ok,false);
 assert.equal(C.weave(s,'echo-20','echo-1',{method:'decode'}).ok,false);
});
