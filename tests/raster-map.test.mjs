import { test } from 'node:test';
import assert from 'node:assert/strict';
import R from '../raster-map.js';

class FakeElement {
 constructor(){this.clientWidth=390;this.clientHeight=844;this.style={};this.children=[];this.events={};this.classList={add(){}};}
 appendChild(child){this.children.push(child);}
 replaceChildren(...children){this.children=children;}
 addEventListener(name,fn){this.events[name]=fn;}
 removeEventListener(name){delete this.events[name];}
 setPointerCapture(){}
 remove(){}
}
function withMap(fn){
 const prior=globalThis.document;
 const root=new FakeElement();
 globalThis.document={getElementById:id=>id==='real-map'?root:null,createElement:()=>new FakeElement()};
 let map=null;
 try{map=new R.Map({container:'real-map',center:[23.7623,61.4984],zoom:15,minZoom:3,maxZoom:19});return fn(map,root);}
 finally{map?.remove();globalThis.document=prior;}
}
test('Mercator round trips geographic coordinates across the world',()=>{
 for(const [lng,lat] of [[23.7623,61.4984],[25.7482,62.2415],[-74.006,40.7128],[179.9,0],[-179.9,50]]){
  const p=R.projectWorld(lng,lat,15),q=R.unprojectWorld(p.x,p.y,15);
  assert.ok(Math.abs(lng-q.lng)<1e-8);assert.ok(Math.abs(lat-q.lat)<1e-8);
 }
});
test('only visible viewport tiles are requested, no prefetch',()=>withMap(map=>{
 assert.ok(map.tiles.size>0 && map.tiles.size<=20);
 for(const [key,tile] of map.tiles){assert.match(key,/^15\/\d+\/\d+$/);assert.match(tile.src,/^https:\/\/tile\.openstreetmap\.org\/15\/\d+\/\d+\.png$/);}
}));
test('tile load event releases ready state exactly once',()=>withMap(map=>{
 let loaded=0;map.on('load',()=>loaded++);
 const tile=map.tiles.values().next().value;tile.onload();tile.onload();
 assert.equal(loaded,1);
}));
test('map center projects to viewport center in demo and GPS coordinates',()=>withMap(map=>{
 let p=map.project([23.7623,61.4984]);
 assert.equal(p.x,195);assert.equal(p.y,422);
 map.flyTo({center:[25.7482,62.2415],zoom:15});
 p=map.project([25.7482,62.2415]);
 assert.ok(Math.abs(p.x-195)<1e-5);assert.ok(Math.abs(p.y-422)<1e-5);
}));
test('drag and zoom change map without automatic recenter',()=>withMap(map=>{
 const original=map.getCenter();map._pan(100,-60);
 assert.notDeepEqual(map.getCenter(),original);
 map._zoomBy(1);assert.equal(map.getZoom(),16);
 map.resize();assert.notDeepEqual(map.getCenter(),original);
}));
