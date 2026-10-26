import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import '../lumen-core.js';

const core=globalThis.MajakkaLumenCore;
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

function makeHarness(){
 const store=new Map(),listeners=new Map(),canvases=[];
 let balance=0;
 class Element{
  constructor(tag){this.tagName=tag;this.children=[];this.listeners={};this.style={setProperty(key,value){this[key]=value;}};this.hidden=false;this.className='';}
  setAttribute(k,v){this[k]=v;}
  append(...xs){for(const x of xs)this.appendChild(x);}
  appendChild(el){el.parent=this;this.children.push(el);return el;}
  remove(){if(this.parent)this.parent.children=this.parent.children.filter(x=>x!==this);this.parent=null;}
  replaceChildren(...els){for(const el of this.children)el.parent=null;this.children=[];this.append(...els);}
  addEventListener(type,fn){this.listeners[type]=fn;}
  click(){this.listeners.click?.({preventDefault(){},stopPropagation(){}});}
 }
 const overlay=new Element('overlay'),viewport={clientWidth:350,clientHeight:550};
 const camera={lat:61.5,lng:23.7};
 const map={getCenter:()=>camera,project:([lng,lat])=>({x:175+(lng-camera.lng)*9000,y:275+(lat-camera.lat)*9000}),on(type,fn){listeners.set(type,fn);}};
 const document={getElementById(id){return id==='map-viewport'?viewport:id==='world-overlay'?overlay:null;},createElement(tag){const el=new Element(tag);if(tag==='div')canvases.push(el);return el;},head:new Element('head')};
 const root={
  document,map,mapReady:true,window:{addEventListener(type,fn){listeners.set('window:'+type,fn);},dispatchEvent(){}},
  navigator:{onLine:true},
  MajakkaLumenCore:core,MajakkaPerspective:{getCenter:()=>null},
  MajakkaLiving:{award:(n)=>{balance+=n;return n;}},
  localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},
  crypto:{getRandomValues(a){for(let i=0;i<a.length;i++)a[i]=i+7;return a;}},
  Event:class{constructor(type){this.type=type;}},
  setTimeout:()=>0,clearTimeout:()=>{},notify:()=>{}
 };
 root.globalThis=root;
 runInNewContext(read('lumen-world.js'),root);
 return {root,move:()=>listeners.get('move')?.(),overlay,store,getBalance:()=>balance};
}
test('2D Lumen grains keep the same clickable DOM identity after map redraw',()=>{
 const h=makeHarness();
 h.move();
 const canvas=h.overlay.children.find(c=>c.id==='personal-lumen');
 assert.ok(canvas);
 assert.ok(canvas.children.length>10,'Expected visible procedural grains');
 const old=canvas.children[0];
 h.move();h.move();
 assert.equal(canvas.children[0],old,'Map motion should not recreate a Lumen button');
});
test('tap a visible Lumen grain gives value exactly once without a GPS fix',()=>{
 const h=makeHarness();h.move();
 const canvas=h.overlay.children.find(c=>c.id==='personal-lumen');
 const target=canvas.children[0];assert.ok(target.listeners.click);
 target.click();
 assert.ok(h.getBalance()>=1,'Lumen should be credited to wallet');
 assert.ok(!canvas.children.includes(target),'Collected grain should disappear');
 const before=h.getBalance();
 target.click();assert.equal(h.getBalance(),before,'Double clicks cannot duplicate pickup');
 assert.equal(h.root.MajakkaLumen.claim('fake-grain'),false,'Invented grains never pay');
});
test('3D collection connects the marker ID through map controls to the same Lumen claim',()=>{
 const snapshotSource=read('lumen-world.js');
 const scene=read('world-3d.html'),parent=read('perspective.js');
 assert.match(snapshotSource,/\.map\(\(\{id,lat,lng,size\}\)=>\(\{id,lat,lng,size\}\)\)/);
 assert.match(scene,/id:'personal-sparks-hit'/);
 assert.match(scene,/reply\('lumen-claim',\{id\}\)/);
 assert.match(parent,/MajakkaLumen\?\.claim\?\.\(data\.id\)/);
});
test('3D nodes use persistent accessible button markers; 2D no longer replaces them during pan',()=>{
 const scene=read('world-3d.html');
 const living=read('living-world.js'),atlas=read('atlas-world.js');
 assert.match(scene,/const nodeTouches=new Map\(\)/);
 assert.match(scene,/syncNodeTouches\(points\)/);
 assert.match(scene,/new lib\.Marker\(\{element:el,anchor:'center'/);
 assert.doesNotMatch(scene,/map\.setTerrain\(/);
 assert.match(living,/const pointElements=new Map\(\)/);
 assert.match(atlas,/const atlasElements=new Map\(\)/);
 assert.doesNotMatch(atlas,/layer\.replaceChildren\(frag\)/);
});
