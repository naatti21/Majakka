import {test} from 'node:test';
import assert from 'node:assert/strict';
import '../living-core.js';
const C=globalThis.MajakkaLivingCore;
const base={lat:62.2415,lng:25.7482};
test('12 stable and separated nodes per region',()=>{
 const cell=C.region(base),w=C.positions(cell.center),again=C.positions(cell.center);
 assert.equal(w.nodes.length,12);
 assert.deepEqual(w,again);
 assert.deepEqual(w.nodes.slice(0,3).map(n=>n.id),['echo-0','echo-1','echo-2']);
 const separation=[];
 for(let i=0;i<12;i++)for(let j=i+1;j<12;j++)separation.push(C.meters(w.nodes[i],w.nodes[j]));
 assert.ok(Math.min(...separation)>130);
});
test('neighbor regions offer distant visual hints',()=>{
 const w=C.positions(C.region(base).center),projection=C.projection(C.blank(),w);
 assert.equal(projection.outer.length,8);
 assert.ok(projection.outer.every(x=>x.kind==='distant'));
});
test('legacy three-node progress and newly created nodes coexist',()=>{
 const state=C.blank();state.nodes.splice(0,3,2,1,0);
 assert.equal(state.nodes.length,12);
 assert.equal(state.nodes[0],2);
 assert.equal(state.nodes[3],0);
});
test('any awake triangle can harmonize without completing all twelve nodes',()=>{
 const w=C.positions(C.region(base).center),s=C.blank();
 for(const i of [1,4,10])s.nodes[i]=2;
 for(const [a,b] of [[1,4],[4,10],[1,10]])assert.equal(C.weave(s,'echo-'+a,'echo-'+b,{method:'decode'}).ok,true);
 assert.equal(C.pulse(s).opened,true);
 const projection=C.projection(s,w);
 assert.equal(projection.fields.length,1);
 assert.equal(projection.edges.length,3);
 assert.deepEqual(projection.fields[0],['echo-1','echo-4','echo-10']);
});
test('distant signals settle, near ones can complete earlier',()=>{
 const w=C.positions(C.region(base).center),s=C.blank(),point=w.nodes[0],now=1_700_000_000_000;
 const first=C.contribute(s,{target:point.id,method:'decode',player:base,accuracy:7,lumen:0,world:w,now});
 assert.equal(first.ok,true);C.pulse(s);
 assert.equal(C.contribute(s,{target:point.id,method:'decode',player:base,accuracy:7,lumen:0,world:w,now:now+100_000}).ok,false);
 const close=C.contribute(s,{target:point.id,method:'lumen',player:point,accuracy:4,lumen:3,world:w,now:now+110_000});
 assert.equal(close.ok,true);assert.equal(close.cost,2);
});
test('cosmetic energy is scattered around any fix and deterministic',()=>{
 const a=C.energyField(base),b=C.energyField(base);
 assert.equal(a.length,18);assert.deepEqual(a,b);
 assert.ok(a.every(p=>p.kind==='lumen'&&C.meters(p,base)<400));
 assert.notDeepEqual(a,C.energyField({lat:base.lat+.02,lng:base.lng}));
});
test('bad node IDs cannot unlock arbitrarily',()=>{
 const s=C.blank();
 assert.equal(C.weave(s,'echo-4','echo-35',{method:'decode'}).ok,false);
 assert.equal(C.weave(s,'echo-11','echo-11',{method:'decode'}).ok,false);
});
