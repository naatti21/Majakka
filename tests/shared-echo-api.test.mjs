import {test} from 'node:test';
import assert from 'node:assert/strict';
import '../atlas-core.js';
import api from '../backend/worker.mjs';
const Atlas=globalThis.MajakkaAtlasCore;
const ORIGIN='https://naatti21.github.io';
function env(db={prepare(){throw Error('DB query unexpectedly called');}}){
 return {DB:db,ALLOWED_ORIGIN:ORIGIN,MUTATIONS_ENABLED:'false'};
}
const url=(path)=>'https://majakka-api.example'+path;
async function call(path,{method='GET',origin=ORIGIN,headers={},body,environment=env()}={}){
 const h={Origin:origin,...headers};
 if(body)h['Content-Type']='application/json';
 const resp=await api.fetch(new Request(url(path),{method,headers:h,body:body&&JSON.stringify(body)}),environment);
 return {status:resp.status,data:await resp.json().catch(()=>null),headers:resp.headers};
}
test('health is read only by default and does not claim multiplayer launch',async()=>{
 const r=await call('/v1/health');
 assert.equal(r.status,200);
 assert.equal(r.data.mutationsEnabled,false);
 assert.equal(r.headers.get('access-control-allow-origin'),ORIGIN);
});
test('requests from unauthorized web origins are rejected',async()=>{
 const r=await call('/v1/health',{origin:'https://attacker.example'});
 assert.equal(r.status,403);
});
test('both session registration and mutations fail closed until enabled',async()=>{
 assert.equal((await call('/v1/session',{method:'POST'})).status,503);
 const body={operationId:crypto.randomUUID(),nodeId:'atlas-echo-1-1'};
 assert.equal((await call('/v1/attune',{method:'POST',body})).status,503);
});
test('only globally reproducible Echo IDs can be read as shared nodes',async()=>{
 const one=Atlas.place({lat:61.4984,lng:23.7623},[]).echoes[0].id;
 const two=Atlas.place({lat:61.4984,lng:23.7623},[]).echoes[1].id;
 const db={
  prepare(sql){
   assert.match(sql,/world_nodes/);
   return {bind(...ids){
    assert.deepEqual(ids,[one,two]);
    return {all:async()=>({results:[{node_id:one,charge:1,revision:2,updated_at:12345}]})};
   }};
  }
 };
 const r=await call('/v1/nodes?ids='+encodeURIComponent(one+','+two),{environment:env(db)});
 assert.equal(r.status,200);
 assert.equal(r.data.sync,'authoritative');
 assert.equal(r.data.nodes[0].charge,1);
 assert.equal(r.data.nodes[1].charge,0);
 assert.equal(r.data.nodes[1].revision,0);
 assert.equal(r.data.nodes[1].node_id,two);
});
test('arbitrary addresses, raw GPS and invented ids cannot be read as nodes',async()=>{
 for(const id of ['home:61.5:23.7','poi-123','echo-1','atlas-echo-nope','atlas-echo-9999999-0']){
  const r=await call('/v1/nodes?ids='+encodeURIComponent(id));
  assert.equal(r.status,400,id);
 }
});
test('invalid bearer tokens are rejected even with mutations enabled',async()=>{
 const configured={...env(),MUTATIONS_ENABLED:'true',SIGNING_SECRET:'z'.repeat(40)};
 const r=await call('/v1/wallet',{environment:configured,headers:{Authorization:'Bearer forged'}});
 assert.equal(r.status,401);
});
test('no session or coordinates are required to read shared public Echo state',async()=>{
 const id=Atlas.place({lat:61.4984,lng:23.7623},[]).echoes[0].id;
 const db={prepare(){return{bind(){return{all:async()=>({results:[]})}}}}};
 const r=await call('/v1/nodes?ids='+id,{environment:env(db)});
 assert.equal(r.status,200);
 assert.equal(r.data.nodes[0].charge,0);
});
