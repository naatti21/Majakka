import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import '../living-core.js';
const W=globalThis.MajakkaLivingCore,c={lat:61.4984,lng:23.7623};
test('identical full-power resonance from a couch and next to the selected node',()=>{
 const world=W.positions(W.region(c).center),node=world.nodes[0];
 const couch=W.blank(),walk=W.blank();
 const a=W.contribute(couch,{target:node.id,method:'lumen',player:null,accuracy:Infinity,lumen:12,world,remote:true});
 const b=W.contribute(walk,{target:node.id,method:'lumen',player:node,accuracy:5,lumen:12,world,remote:true});
 assert.equal(a.ok,true);assert.equal(b.ok,true);
 assert.equal(a.gain,2);assert.equal(a.cost,2);
 assert.equal(a.gain,b.gain);assert.equal(a.cost,b.cost);
 assert.equal(W.pulse(couch).awakened,1);assert.equal(W.pulse(walk).awakened,1);
});
test('no GPS coordinates or movement are required to weave a complete field',()=>{
 const world=W.positions(W.region(c).center),s=W.blank();
 for(const i of [0,1,2]){const out=W.contribute(s,{target:world.nodes[i].id,method:'decode',player:null,accuracy:Infinity,lumen:0,world,remote:true});assert.equal(out.gain,2);}
 W.pulse(s);
 for(const [a,b] of [[0,1],[1,2],[0,2]])assert.equal(W.weave(s,world.nodes[a].id,world.nodes[b].id,{method:'decode',lumen:0}).ok,true);
 assert.equal(W.pulse(s).opened,true);
});
test('the connected world has no twelve-minute GPS trial or offline application shell',()=>{
 const geo=readFileSync(new URL('../live-field.js',import.meta.url),'utf8');
 const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
 assert.doesNotMatch(geo,/DURATION_MS|12-minute trial|◎ LIVE/);
 assert.match(geo,/Locate me/);
 assert.match(geo,/Channel Lumen/);
 assert.doesNotMatch(sw,/caches\.match\(/);
 assert.match(sw,/cache:'no-store'/);
});
