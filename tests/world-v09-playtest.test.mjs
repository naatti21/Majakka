import test from 'node:test';
import assert from 'node:assert/strict';
import {initial,valid,lumen,nextEdge,transition,load,save,KEY} from '../experiments/world-v09-playtest/play-core.mjs';
const restore=(s,id)=>transition(s,{type:'restore',id});
const link=s=>transition(s,{type:'link'});
test('six Lumen, no premature link, no invalid or duplicate debit',()=>{
 let s=initial();assert.equal(lumen(s),6);assert.equal(link(s).ok,false);
 assert.equal(restore(s,'other').ok,false);s=restore(s,'relay').state;
 assert.equal(lumen(s),4);assert.equal(restore(s,'relay').ok,false);assert.equal(link(s).ok,false);
});
test('all six restoration orders can finish, only closed triangle has stage 3',()=>{
 for(const order of [['relay','grove','prism'],['relay','prism','grove'],['grove','relay','prism'],['grove','prism','relay'],['prism','relay','grove'],['prism','grove','relay']]){
 let s=initial();for(const id of order)s=restore(s,id).state;
 assert.equal(lumen(s),0);
 for(let i=0;i<3;i++){assert.ok(nextEdge(s));const t=link(s);assert.equal(t.ok,true);s=t.state;assert.equal(s.stage,i+1);}
 assert.equal(nextEdge(s),null);assert.equal(link(s).ok,false);assert.ok(valid(s));
 }
});
test('first chord can form before third restoration; second link waits',()=>{
 let s=restore(restore(initial(),'relay').state,'grove').state;
 s=link(s).state;assert.equal(s.stage,1);assert.equal(link(s).ok,false);
 s=restore(s,'prism').state;assert.equal(link(s).state.stage,2);
});
test('reject corrupt, duplicate, impossible and wrong-version states',()=>{
 for(const s of [null,{}, {version:1,restored:['relay','relay'],stage:0},{version:1,restored:[],stage:1},{version:2,restored:[],stage:0},{version:1,restored:['relay'],stage:4}])assert.equal(valid(s),false);
});
test('isolated persistence, reload, invalid and inaccessible storage',()=>{
 const data=new Map(),storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};
 assert.equal(load(storage).status,'new');const s=restore(initial(),'grove').state;
 assert.ok(save(storage,s));assert.deepEqual(load(storage).state,s);
 data.set(KEY,'broken');assert.equal(load(storage).status,'unavailable');
 data.set(KEY,JSON.stringify({version:1,stage:3,restored:[]}));assert.equal(load(storage).status,'invalid');
 const blocked={getItem(){throw Error()},setItem(){throw Error()}};
 assert.equal(load(blocked).status,'unavailable');assert.equal(save(blocked,s),false);
});
