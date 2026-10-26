import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import '../atlas-core.js';
const Core=globalThis.MajakkaAtlasCore;
const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
const anchor={lat:61.5,lng:23.7};
const offset=(id,name,type,n,e)=>{
 const tags={name};
 if(type==='history')tags.historic='monument';
 if(type==='art')tags.tourism='artwork';
 if(type==='nature')tags.leisure='park';
 if(type==='culture')tags.tourism='museum';
 return {source:'osm',sourceId:'node/'+id,lat:anchor.lat+n/111320,lng:anchor.lng+e/(111320*Math.cos(anchor.lat*Math.PI/180)),tags};
};
const raw=[
 offset(1,'Old Clock Tower','history',0,0),
 offset(2,'River Art Wall','art',430,0),
 offset(3,'North Park','nature',0,490),
 offset(4,'City Museum','culture',530,530),
 offset(5,'Near Duplicate','history',22,12),
 {source:'osm',sourceId:'node/6',lat:anchor.lat+.002,lng:anchor.lng,tags:{name:'Private school garden',leisure:'park',amenity:'school'}},
];
test('landmarks are named, source-backed, sparse and ID-stable when input order changes',()=>{
 const a=Core.landmarks(anchor,raw),b=Core.landmarks(anchor,[...raw].reverse());
 assert.ok(a.length>0&&a.length<=3);
 assert.deepEqual(a.map(p=>p.id),b.map(p=>p.id));
 assert.ok(a.every(p=>p.id.startsWith('poi-')&&p.name!=='Unknown place'));
 for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)assert.ok(Core.meters(a[i],a[j])>=360);
 for(const p of a)assert.ok(!p.name.includes('Private school'));
});
test('empty or disallowed areas contain exactly zero site nodes (never a made-up filler)',()=>{
 assert.deepEqual(Core.landmarks(anchor,[]),[]);
 assert.deepEqual(Core.landmarks(anchor,[raw[5]]),[]);
});
function harness(storage=new Map()){
 let balance=12,earned=0;
 class Fake{
  constructor(){this.textContent='';this.children=[];this.classes=new Set();this.classList={add:(x)=>this.classes.add(x)};this.attrs={};}
  setAttribute(key,val){this.attrs[key]=val;}
  append(node){this.children.push(node);}
  addEventListener(){}
  querySelector(){return new Fake();}
 }
 const body=new Fake();
 const document={body,head:new Fake(),createElement:()=>new Fake(),querySelector:()=>({click(){}})};
 const ctx={
  document,navigator:{onLine:true},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},
  MajakkaAtlasCore:Core,
  MajakkaLiving:{balance:()=>balance,spend:n=>{if(balance<n)return false;balance-=n;return true;},award:n=>{earned+=n;balance+=n;return n;}},
  MajakkaFeedback:{play(){}},window:{dispatchEvent(){}},Event:class{constructor(t){this.type=t;}},
  notify(){},Date,JSON,Math,Number,Array,Object,
 };
 ctx.globalThis=ctx;
 runInNewContext(read('landmark-world.js'),ctx);
 return {game:ctx.MajakkaSites,balance:()=>balance,earned:()=>earned,storage,body};
}
test('two separate OSM landmarks in one district permanently restore a chord and pay once',()=>{
 const a=Core.normalize(raw[0]),b=Core.normalize(raw[1]);
 const h=harness();assert.equal(h.game.attune(a).ok,true);
 assert.equal(h.game.attune(a).ok,false);
 assert.equal(h.balance(),10);
 const second=h.game.attune(b);
 assert.equal(second.ok,true);
 assert.equal(second.completed,true);
 assert.equal(second.reward,3);
 assert.equal(h.balance(),11);
 assert.equal(h.earned(),3);
 assert.equal(h.game.summary().districts,1);
 assert.equal(h.game.attune(b).ok,false);
 assert.equal(h.earned(),3);
 const reloaded=harness(h.storage);
 assert.ok(reloaded.game.get(a.id));assert.ok(reloaded.game.get(b.id));
 assert.equal(reloaded.game.summary().districts,1);
});
test('legacy procedural nodes are excluded from visible maps and 3D',()=>{
 const app=read('atlas-world.js'),scene=read('world-3d.html');
 assert.match(app,/echoes:\[\]/);
 assert.match(app,/A\.landmarks\(c,source\)/);
 assert.match(scene,/if\(atlas\)\{/);
 assert.match(scene,/points\.push\(\.\.\.\(atlas\.real\|\|\[\]\)\)/);
 assert.doesNotMatch(scene,/points\.push\(\.\.\.live\.nodes\)/);
 assert.match(read('living-world.js'),/classList\.contains\('place-first'\)/);
});
