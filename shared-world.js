/* MAJAKKA Shared Echo pilot v0.10 — enabled only with an explicit API endpoint.
 * This module NEVER sends GPS, routes, home coordinates or map center.
 * Only stable fictional Echo IDs are queried. No simulated success on network failures. */
(()=>{
'use strict';
const cfg=document.querySelector('meta[name="majakka-api"]')?.getAttribute('content')?.trim()||'';
let base='';
try{const u=new URL(cfg);if(u.protocol==='https:'&&u.username===''&&u.password===''&&u.search===''&&u.hash==='')base=u.origin;}catch{}
const tokenKey='majakka-shared-pilot-session-v1',items=new Map();
let token='',wallet=null,lastRequest=0,currentIds='',pending=false,timer=null;
try{token=localStorage.getItem(tokenKey)||'';}catch{}
const ui=document.createElement('div');ui.id='shared-pilot-label';ui.hidden=!base;
ui.textContent='ECHO NETWORK · CONNECTING';document.body.append(ui);
const style=document.createElement('style');
style.textContent=`
#shared-pilot-label{position:fixed;z-index:26;left:12px;bottom:calc(209px + env(safe-area-inset-bottom,0px));
 max-width:190px;pointer-events:none;background:#092534eb;border:1px solid #71d5ca75;border-radius:11px;
 padding:7px 9px;color:#c8f0e4;font:650 10px/1.35 system-ui;box-shadow:0 6px 18px #0008}
#shared-pilot-label[hidden]{display:none!important}
body.journal-open #shared-pilot-label,body.field-open #shared-pilot-label,body.living-selected #shared-pilot-label{display:none!important}
`;document.head.append(style);
function status(s){if(base){ui.textContent=s;ui.hidden=false;}}
function notifyUser(s){if(typeof notify==='function')notify(s);}
function publish(){window.dispatchEvent(new Event('majakka:shared-update'));}
async function request(path,{method='GET',data=null,auth=false}={}){
 if(!base)throw Error('Shared pilot not connected');
 const headers={'Accept':'application/json'};
 if(data)headers['Content-Type']='application/json';
 if(auth){if(!token)await start();headers['Authorization']='Bearer '+token;}
 const ctl=new AbortController(),timeout=setTimeout(()=>ctl.abort(),9000);
 try{
  const result=await fetch(base+path,{method,headers,body:data?JSON.stringify(data):undefined,mode:'cors',cache:'no-store',signal:ctl.signal});
  const body=await result.json().catch(()=>({error:'bad_server_reply'}));
  if(!result.ok){const error=new Error(body.error||'network_error');error.code=result.status;error.body=body;throw error;}
  return body;
 }finally{clearTimeout(timeout);}
}
async function start(){
 if(token)return;
 const response=await request('/v1/session',{method:'POST'});
 if(typeof response.token!=='string')throw Error('invalid_session');
 token=response.token;wallet=response.wallet||null;
 try{localStorage.setItem(tokenKey,token);}catch{}
 publish();
}
async function refresh(force=false){
 if(!base||navigator.onLine===false||document.hidden||pending)return;
 const atlas=globalThis.MajakkaAtlas?.snapshot?.();
 const ids=(atlas?.echoes||[]).map(n=>n.id).filter(id=>/^atlas-echo-/.test(id)).slice(0,24);
 if(!ids.length)return;
 const key=ids.join(','),now=Date.now();
 if(!force&&currentIds===key&&now-lastRequest<12000)return;
 pending=true;lastRequest=now;
 try{
  const resp=await request('/v1/nodes?ids='+encodeURIComponent(key));
  if(resp.sync!=='authoritative'||!Array.isArray(resp.nodes))throw Error('invalid_world_response');
  currentIds=key;
  for(const item of resp.nodes)if(item?.node_id&&Number.isInteger(item.charge))items.set(item.node_id,item);
  status('SHARED ECHO PILOT · '+resp.nodes.filter(x=>x.charge>=2).length+'/'+resp.nodes.length+' AWAKE'+(wallet?' · ✧ '+wallet.balance:''));
  publish();
 }catch(e){status('ECHO NETWORK · UNAVAILABLE');}
 finally{pending=false;}
}
async function action(kind,nodeId=null){
 if(!base)throw Error('Shared backend is not connected');
 const operationId=crypto.randomUUID(),data={operationId};
 if(kind==='attune'){
  if(!globalThis.MajakkaAtlasCore?.echoById(nodeId))throw Error('Invalid Echo node');
  data.nodeId=nodeId;
 }
 const reply=await request(kind==='attune'?'/v1/attune':'/v1/channel',{method:'POST',data,auth:true});
 if(reply.node)items.set(reply.node.node_id,reply.node);
 if(reply.wallet)wallet=reply.wallet;
 const name=kind==='attune'?'Shared Echo resonance':'Shared Lumen channel';
 status('SHARED ECHO PILOT · ✧ '+(wallet?.balance??'?'));
 notifyUser(name+' confirmed by server.');
 publish();
 return reply;
}
const api={
 enabled:()=>Boolean(base),
 get:id=>items.get(id)||null,
 wallet:()=>wallet?{...wallet}:null,
 attune:id=>action('attune',id),
 channel:()=>action('channel'),
 refresh:()=>refresh(true)
};
globalThis.MajakkaSharedWorld=api;
if(!base)return;
window.addEventListener('majakka:mapready',()=>void refresh(true));
window.addEventListener('majakka:atlasupdate',()=>void refresh());
window.addEventListener('online',()=>void refresh(true));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)void refresh(true);});
timer=setInterval(()=>{if(!document.hidden)void refresh();},15000);
void refresh(true);
})();
