import {test} from 'node:test';
import assert from 'node:assert/strict';
import '../walk-energy.js';
const W=globalThis.MajakkaWalkEnergy,origin={lat:62.2415,lng:25.7482};
function fix(n,e,t,{accuracy=5,speed=1.5}={}){
 return {lat:origin.lat+n/111320,lng:origin.lng+e/(111320*Math.cos(origin.lat*Math.PI/180)),accuracy,speed,time:t};
}
test('walking in any direction gains Lumen from actual distance',()=>{
 const w=W.create();let gained=0,t=1000000;
 for(let i=0;i<=16;i++)gained+=w.feed(fix(i*18,i%2?4:0,t+i*9000)).gain;
 assert.ok(gained>=3);
 assert.ok(w.stats().remaining<=70);
});
test('still GPS noise cannot earn energy',()=>{
 const w=W.create();let gained=0;
 for(let i=0;i<50;i++)gained+=w.feed(fix(Math.sin(i)*3,Math.cos(i)*3,1000000+i*7000,{speed:0,accuracy:12})).gain;
 assert.equal(gained,0);
});
test('car speeds, large jumps and poor accuracy do not award',()=>{
 const w=W.create();
 assert.equal(w.feed(fix(0,0,1000000)).gain,0);
 assert.equal(w.feed(fix(100,0,1010000,{speed:15})).gain,0);
 assert.equal(w.feed(fix(600,0,1020000)).gain,0);
 assert.equal(w.feed(fix(640,0,1030000,{accuracy:90})).gain,0);
});
test('turning and returning to an area still counts traveled motion',()=>{
 const w=W.create(),coords=[[0,0],[18,0],[36,0],[36,20],[36,40],[16,40],[-4,40],[-4,20],[-4,0]];
 let gained=0;
 coords.forEach(([n,e],i)=>gained+=w.feed(fix(n,e,1000000+i*10000)).gain);
 assert.ok(gained>=1);
});
test('reopening a session clears GPS anchor and residual motion without storing positions',()=>{
 const w=W.create();w.feed(fix(0,0,1000000));w.feed(fix(25,0,1015000));
 w.reset();
 assert.equal(w.stats().valid,0);
 assert.equal(w.stats().remaining,W.METERS_PER_LUMEN);
 assert.equal(w.feed(fix(999,999,1100000)).gain,0);
});
