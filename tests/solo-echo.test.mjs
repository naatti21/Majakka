import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import '../atlas-core.js';

const source=readFileSync(new URL('../solo-echo.js',import.meta.url),'utf8');
const Atlas=globalThis.MajakkaAtlasCore;
const echo=Atlas.place({lat:61.4984,lng:23.7623},[]).echoes[0];

function create(state={value:new Map(),balance:6,online:true}){
 const events=[],elements=[];
 const root={
  MajakkaAtlasCore:Atlas,
  MajakkaLiving:{
   balance:()=>state.balance,
   spend:n=>{if(state.balance<n)return false;state.balance-=n;return true;}
  },
  MajakkaFeedback:{play:()=>{}},
  document:{},
  navigator:{onLine:state.online},
  localStorage:{
   getItem:key=>state.value.get(key)||null,
   setItem:(key,val)=>state.value.set(key,val)
  },
  window:{dispatchEvent:event=>events.push(event.type)},
  Event:class {constructor(type){this.type=type;}},
  Date,JSON,Number,Object,Array,Math,
  notify:()=>{}
 };
 root.globalThis=root;
 runInNewContext(source,root);
 return {root,events,elements,state};
}
test('solo echoes can be activated without GPS or a multiplayer server',()=>{
 const {root,state}=create();
 const game=root.MajakkaSoloWorld;
 assert.equal(game.active(),true);
 assert.equal(game.get(echo.id).charge,0);
 assert.equal(game.attune(echo.id).ok,true);
 assert.equal(game.get(echo.id).charge,1);
 assert.equal(state.balance,4);
 const last=game.attune(echo.id);
 assert.equal(last.ok,true);assert.equal(last.awake,true);
 assert.equal(game.get(echo.id).charge,2);
 assert.equal(state.balance,2);
 assert.equal(game.attune(echo.id).ok,false);
 assert.equal(state.balance,2);
 assert.equal(game.counts().awake,1);
});
test('solo node progress persists across reload and never drains twice',()=>{
 const state={value:new Map(),balance:6,online:true};
 const first=create(state);assert.equal(first.root.MajakkaSoloWorld.attune(echo.id).ok,true);
 const second=create(state);assert.equal(second.root.MajakkaSoloWorld.get(echo.id).charge,1);
 assert.equal(second.root.MajakkaSoloWorld.attune(echo.id).ok,true);
 const third=create(state);assert.equal(third.root.MajakkaSoloWorld.get(echo.id).charge,2);
 assert.equal(state.balance,2);
});
test('invalid Echo, insufficient Lumen and offline mode never grant progress',()=>{
 const a=create({value:new Map(),balance:1,online:true});
 assert.equal(a.root.MajakkaSoloWorld.attune(echo.id).ok,false);
 assert.equal(a.root.MajakkaSoloWorld.attune('node-at-home').ok,false);
 assert.equal(a.root.MajakkaSoloWorld.get(echo.id).charge,0);
 const b=create({value:new Map(),balance:6,online:false});
 assert.equal(b.root.MajakkaSoloWorld.attune(echo.id).ok,false);
});
