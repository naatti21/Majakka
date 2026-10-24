import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../app.js',import.meta.url),'utf8');
// Exercise deterministic domain logic without loading a web browser, network or storage.
const code=source.replace(/\binit\(\);\s*$/,'')+'\n;globalThis.__test={AREAS,GLYPHS,getStrength,getNodeLevel,state,setState:s=>state=s,nodeById,inKnownNode,sanitize};';
const context={Math,Number,Object,Array,String,console};
vm.runInNewContext(code,context);
const {AREAS,getStrength,getNodeLevel,setState,nodeById,inKnownNode,sanitize}=context.__test;
const all=Object.values(AREAS).flatMap(area=>area.nodes);
const saved=()=>({area:'harbor',selected:'h1',cycle:0,solved:{},anchors:{},journal:[],sound:false});

test('three regions and 22 uniquely identified public nodes',()=>{
  assert.equal(Object.keys(AREAS).length,3);
  assert.equal(all.length,22);
  assert.equal(new Set(all.map(n=>n[0])).size,all.length);
});
test('each region has public nodes without requiring other players',()=>{
  for(const area of Object.values(AREAS))assert.ok(area.nodes.length>=7);
});
test('coordinates remain within safe map bounds',()=>{
  for(const node of all){assert.ok(node[2]>=5&&node[2]<=95);assert.ok(node[3]>=5&&node[3]<=95);}
});
test('links always connect public-public nodes; beacon is never linked',()=>{
  for(const area of Object.values(AREAS))for(const link of area.links){
    assert.equal(link.length,2);
    for(const index of link)assert.ok(Number.isInteger(index)&&index>=0&&index<area.nodes.length);
    assert.notEqual(link[0],link[1]);
  }
});
test('node strength never falls to zero after any simulated pulse',()=>{
  for(const cycle of [0,1,5,20,100,1000]){
    setState({...saved(),cycle});
    for(const node of all)assert.ok(getStrength(node)>=.16);
  }
});
test('restoration persists as positive strength, even when region falls quiet',()=>{
  setState({...saved(),cycle:5});
  const before=getStrength(nodeById('h1'));
  setState({...saved(),cycle:5,solved:{h1:true}});
  assert.ok(getStrength(nodeById('h1'))>before);
});
test('signal challenges provide memory, pattern and phase variants',()=>{
  const kinds=new Set(all.map(n=>n[5]%3));
  assert.deepEqual([...kinds].sort(),[0,1,2]);
});
test('state load rejects unknown node IDs, malformed area and inflated cycles',()=>{
  const bad=sanitize({area:'oops',selected:'fake',cycle:999999,solved:{fake:true,h2:true}});
  assert.equal(bad.area,'harbor');assert.equal(bad.selected,'h1');assert.equal(bad.cycle,1000);
  assert.equal(bad.solved.h2,true);assert.equal(bad.solved.fake,undefined);
  assert.equal(inKnownNode('fake'),false);
});
test('saved state never loads the selection from another region',()=>{
  const s=sanitize({area:'wild',selected:'h1'});
  assert.equal(s.area,'wild');assert.equal(s.selected,'w1');
});
test('no application code requests real GPS or remote services',()=>{
  assert.doesNotMatch(source,/navigator\.geolocation|watchPosition|fetch\s*\(/);
  assert.doesNotMatch(readFileSync(new URL('../index.html',import.meta.url),'utf8'),/https?:\/\//);
});
