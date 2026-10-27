import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const html=readFileSync(new URL('../playtest/majakka-missing-beat-offline.html',import.meta.url),'utf8');
const match=html.match(/<script>([\s\S]*?)<\/script>/);
if(!match)throw new Error('Standalone playtest has no bundled script');
const script=new vm.Script(match[1],{filename:'majakka-missing-beat-offline.html'});

class Element{
 constructor(tag='div'){
  this.tag=tag;this.children=[];this.listeners={};this.attrs={};this.style={};
  this.className='';this.textContent='';this.disabled=false;this.classList={toggle(){}};
 }
 appendChild(child){this.children.push(child);return child;}
 replaceChildren(...children){this.children=children;return this;}
 addEventListener(name,fn){this.listeners[name]=fn;}
 setAttribute(name,value){this.attrs[name]=value;}
}
function start(storage=new Map()){
 const byId=new Map();
 const document={
  getElementById(id){if(!byId.has(id))byId.set(id,new Element());return byId.get(id);},
  createElement(tag){return new Element(tag);}
 };
 const localStorage={
  getItem(k){return storage.get(k)??null;},
  setItem(k,v){storage.set(k,v);},
  removeItem(k){storage.delete(k);}
 };
 const context=vm.createContext({document,localStorage,
  confirm:()=>true,console,Date,Math,Object,Number,String,Map,Set,
  Array,JSON,Error,RangeError,TypeError,Uint8Array});
 script.runInContext(context,{timeout:12000});
 const nodes=()=>[...byId.get('game').children,...byId.get('feedback').children];
 function findButtons(){
  const out=[];const walk=n=>{
   if(n.tag==='button')out.push(n);
   for(const child of n.children)walk(child);
  };
  for(const n of nodes())walk(n);
  return out;
 }
 function click(label){
  const matching=findButtons().find(b=>b.children.some(c=>c.textContent===label));
  assert.ok(matching,'Button '+label+' must be visible');
  assert.equal(matching.disabled,false,'Button '+label+' must be enabled');
  matching.listeners.click();
 }
 const state=()=>vm.runInContext('__modules["playtest/session.mjs"].loadDemoState()',context);
 const view=()=>vm.runInContext('__modules["playtest/session.mjs"].getDemoView(__modules["playtest/session.mjs"].loadDemoState())',context);
 return {byId,storage,click,state,view,context};
}
test('single-file offline playtest bundles its own rules, styles and case data',()=>{
 assert.ok(html.includes('<style>'));
 assert.ok(html.includes('const __modules=Object.create(null);'));
 assert.ok(!html.includes('<script type="module"'));
 assert.ok(!html.includes('<link rel="stylesheet"'));
 assert.ok(!html.includes('src="https://'));
 assert.ok(!html.includes('href="https://'));
 assert.ok(html.length>50000);
});
test('mobile UI real click path: Start -> Lens -> route -> supported interpretation -> journal',()=>{
 const demo=start();
 assert.equal(demo.view().status,'NotStarted');
 demo.click('Begin investigation');
 assert.equal(demo.view().status,'ChoosingRole');
 demo.click('Lens');
 assert.equal(demo.view().role,'Lens');
 demo.click('A → B → C · Detour');
 assert.equal(demo.view().measurements.length,1);
 demo.click('The existing route repeats the signal');
 assert.equal(demo.view().status,'Solved');
 demo.click('Save discovery to journal');
 assert.equal(demo.view().status,'Completed');
 const finding=demo.state().players['demo:player'].findings['the-missing-beat'];
 assert.equal(finding.method,'LENS_SIGNATURE');
 assert.equal(demo.state().players['demo:player'].unlockedMethods['Echo Differentiation'],true);
});
test('playtest saves a completed case and resumes after simulated browser reload',()=>{
 const persisted=new Map(),demo=start(persisted);
 demo.click('Begin investigation');demo.click('Lens');
 demo.click('A → B → C · Detour');demo.click('The existing route repeats the signal');
 demo.click('Save discovery to journal');
 assert.ok(persisted.has('majakka-missing-beat-gate2-playtest-v1'));
 const resumed=start(persisted);
 assert.equal(resumed.view().status,'Completed');
 assert.equal(resumed.byId.get('lumen-count').textContent,'6');
});
test('false theory is free and does not erase evidence; can still solve later',()=>{
 const demo=start();
 demo.click('Begin investigation');demo.click('Lens');demo.click('A → B → C · Detour');
 const wallet=demo.state().players['demo:player'].wallet.balance;
 demo.click('A fourth source is secretly transmitting');
 assert.equal(demo.view().status,'Investigating');
 assert.equal(demo.state().players['demo:player'].wallet.balance,wallet);
 demo.click('The existing route repeats the signal');
 assert.equal(demo.view().status,'Solved');
});
test('local reset does not contact backend and allows a different solution route',()=>{
 const demo=start();
 demo.click('Begin investigation');demo.click('Lens');
 demo.byId.get('reset').listeners.click();
 assert.equal(demo.view().status,'NotStarted');
 demo.click('Begin investigation');
 demo.click('Shelter');
 demo.click('A → C · Direct');
 demo.click('A → B → C · Detour');
 demo.click('The existing route repeats the signal');
 assert.equal(demo.view().status,'Solved');
 assert.equal(demo.state().players['demo:player'].wallet.balance,5);
});
