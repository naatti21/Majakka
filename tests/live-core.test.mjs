import {test} from 'node:test';
import assert from 'node:assert/strict';
import L from '../live-core.js';
const a={lat:61.49,lng:23.76,accuracy:12,speed:1,time:1000};
test('rejects invalid location and accuracy',()=>{
 assert.equal(L.validFix({latitude:91,longitude:2,accuracy:10},0),null);
 assert.equal(L.validFix({latitude:61,longitude:2,accuracy:-3},0),null);
 assert.equal(L.validFix({latitude:61.4,longitude:2,accuracy:30},100).time,100);
});
test('great-circle meters sensible',()=>{assert.equal(L.distance(a,a),0);assert.ok(L.distance(a,{...a,lat:61.492})>200);});
test('GPS jitter does not reward Lumen',()=>{assert.equal(L.canRewardMove(a,{...a,lat:61.4901,time:101000},101000,-Infinity,0),false);});
test('long, slow walk can reward and cap, but cooldown applies',()=>{
 const b={...a,lat:61.492,time:151000};
 assert.equal(L.canRewardMove(a,b,151000,-Infinity,0),true);
 assert.equal(L.canRewardMove(a,b,151000,90000,0),false);
 assert.equal(L.canRewardMove(a,b,151000,-Infinity,3),false);
});
test('poor accuracy and speed reject movement rewards',()=>{
 assert.equal(L.canRewardMove(a,{...a,lat:61.493,accuracy:130,time:201000},201000,-Infinity,0),false);
 assert.equal(L.canRewardMove(a,{...a,lat:61.493,speed:12,time:201000},201000,-Infinity,0),false);
});
test('short teleport disallowed',()=>{assert.equal(L.canRewardMove(a,{...a,lat:61.495,time:4000},4000,-Infinity,0),false);});
test('scan has a cooldown and session cap',()=>{
 assert.equal(L.canScan(10000,null,0),true);
 assert.equal(L.canScan(100000,90000,1),false);
 assert.equal(L.canScan(200000,90000,1),true);
 assert.equal(L.canScan(200000,null,2),false);
});