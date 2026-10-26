/* Majakka Shared Echo API v0.10 (Cloudflare Worker + D1).
 * Server authoritative for Echo resonances. No GPS, locations or player IPs stored.
 * Requires a standalone MAJAKKA D1 binding and a >=32 character SIGNING_SECRET.
 * Refuses all writes unless MUTATIONS_ENABLED='true'. Never expose secrets in the PWA.
 */
import '../atlas-core.js';

const Atlas=globalThis.MajakkaAtlasCore;
const encoder=new TextEncoder();
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const json=(body,status=200,headers={})=>new Response(JSON.stringify(body),{
 status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}
});
function cors(request,env){
 const origin=request.headers.get('Origin');
 if(origin&&origin!==env.ALLOWED_ORIGIN)return null;
 return {'Access-Control-Allow-Origin':origin||env.ALLOWED_ORIGIN||'','Vary':'Origin',
  'Access-Control-Allow-Headers':'Authorization, Content-Type',
  'Access-Control-Allow-Methods':'GET, POST, OPTIONS',
  'Access-Control-Max-Age':'600'};
}
const bytes64=s=>btoa(String.fromCharCode(...s)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
const base64bytes=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-s.length%4)%4)),c=>c.charCodeAt(0));
async function signer(env){
 const secret=String(env.SIGNING_SECRET||'');
 if(secret.length<32)throw Error('Misconfigured signing secret');
 return crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);
}
async function mint(env,id){
 const payload=bytes64(encoder.encode(JSON.stringify({v:1,id,exp:Math.floor(Date.now()/1000)+30*86400})));
 const sig=new Uint8Array(await crypto.subtle.sign('HMAC',await signer(env),encoder.encode(payload)));
 return payload+'.'+bytes64(sig);
}
async function identity(request,env){
 const value=request.headers.get('Authorization')||'';
 if(!value.startsWith('Bearer ')||value.length>800)return null;
 const token=value.slice(7),parts=token.split('.');
 if(parts.length!==2||parts.some(p=>!p||p.length>500))return null;
 try{
  const parsed=JSON.parse(new TextDecoder().decode(base64bytes(parts[0])));
  if(parsed.v!==1||!UUID.test(parsed.id)||!Number.isInteger(parsed.exp)||parsed.exp<Math.floor(Date.now()/1000)||parsed.exp>Math.floor(Date.now()/1000)+31*86400)return null;
  const ok=await crypto.subtle.verify('HMAC',await signer(env),base64bytes(parts[1]),encoder.encode(parts[0]));
  return ok?parsed.id:null;
 }catch{return null;}
}
const missing=()=>json({error:'not_found'},404);
const paused=()=>json({error:'read_only',message:'Shared world mutations not enabled'},503);
async function wallet(db,id){
 return db.prepare('SELECT balance, earned_today, earned_day, channel_at FROM players WHERE id=?').bind(id).first();
}
async function nodes(request,db){
 const raw=new URL(request.url).searchParams.get('ids')||'';
 const ids=[...new Set(raw.split(',').filter(Boolean))];
 if(!ids.length||ids.length>24||raw.length>1600||ids.some(id=>!Atlas.echoById(id)))return json({error:'invalid_echo_ids'},400);
 const q=ids.map(()=>'?').join(',');
 const found=await db.prepare('SELECT node_id, charge, revision, updated_at FROM world_nodes WHERE node_id IN ('+q+')').bind(...ids).all();
 const lookup=new Map((found.results||[]).map(row=>[row.node_id,row]));
 return json({nodes:ids.map(id=>lookup.get(id)||{node_id:id,charge:0,revision:0,updated_at:0}),sync:'authoritative',serverTime:Date.now()});
}
async function parseBody(request){
 const size=Number(request.headers.get('content-length')||0);
 if(size>2048)return null;
 try{const text=await request.text();if(text.length>2048)return null;const v=JSON.parse(text);return v&&typeof v==='object'&&!Array.isArray(v)?v:null;}catch{return null;}
}
async function session(env){
 const id=crypto.randomUUID();
 await env.DB.prepare('INSERT INTO players(id,created_at) VALUES(?,unixepoch())').bind(id).run();
 return json({token:await mint(env,id),wallet:{balance:6,earned_today:0},expiresIn:30*86400});
}
async function channel(env,id,op){
 const db=env.DB;
 const sql=`INSERT OR IGNORE INTO operations(operation_id,player_id,kind,node_id)
 SELECT ?,id,'channel',NULL FROM players
 WHERE id=? AND balance<=18 AND channel_at<=unixepoch()-120
 AND (CASE WHEN earned_day=date('now') THEN earned_today ELSE 0 END)<=34`;
 const results=await db.batch([
  db.prepare(sql).bind(op,id),
  db.prepare(`UPDATE players SET balance=balance+2,
    earned_today=CASE WHEN earned_day=date('now') THEN earned_today+2 ELSE 2 END,
    earned_day=date('now'),channel_at=unixepoch()
    WHERE id=? AND EXISTS(SELECT 1 FROM operations WHERE operation_id=? AND player_id=? AND kind='channel' AND applied=0)`).bind(id,op,id),
  db.prepare("UPDATE operations SET applied=1 WHERE operation_id=? AND player_id=? AND kind='channel' AND applied=0").bind(op,id),
  db.prepare('SELECT operation_id, player_id, kind, applied FROM operations WHERE operation_id=?').bind(op),
  db.prepare('SELECT balance, earned_today, earned_day, channel_at FROM players WHERE id=?').bind(id)
 ]);
 const operation=results[3].results?.[0],current=results[4].results?.[0];
 if(operation&&operation.player_id!==id)return json({error:'operation_collision'},409);
 if(!operation)return json({error:'channel_cooldown_or_daily_cap',wallet:current},409);
 return json({ok:true,operationId:op,applied:Boolean(operation.applied),wallet:current});
}
async function attune(env,id,op,nodeId){
 const echo=Atlas.echoById(nodeId);
 if(!echo)return json({error:'invalid_node'},400);
 const db=env.DB;
 const results=await db.batch([
  db.prepare('INSERT OR IGNORE INTO world_nodes(node_id,archetype) VALUES(?,?)').bind(nodeId,echo.type),
  db.prepare(`INSERT OR IGNORE INTO operations(operation_id,player_id,kind,node_id)
   SELECT ?,p.id,'attune',n.node_id FROM players p JOIN world_nodes n ON n.node_id=?
   WHERE p.id=? AND p.balance>=2 AND n.charge<2
   AND NOT EXISTS(SELECT 1 FROM operations o WHERE o.player_id=p.id AND o.node_id=n.node_id AND o.kind='attune')`).bind(op,nodeId,id),
  db.prepare(`UPDATE players SET balance=balance-2 WHERE id=?
   AND EXISTS(SELECT 1 FROM operations WHERE operation_id=? AND player_id=? AND kind='attune' AND applied=0)`).bind(id,op,id),
  db.prepare(`UPDATE world_nodes SET charge=MIN(2,charge+1), revision=revision+1, updated_at=unixepoch()
   WHERE node_id=? AND EXISTS(SELECT 1 FROM operations WHERE operation_id=? AND player_id=? AND kind='attune' AND applied=0)`).bind(nodeId,op,id),
  db.prepare("UPDATE operations SET applied=1 WHERE operation_id=? AND player_id=? AND kind='attune' AND applied=0").bind(op,id),
  db.prepare('SELECT operation_id,player_id,kind,node_id,applied FROM operations WHERE operation_id=?').bind(op),
  db.prepare('SELECT node_id,charge,revision,updated_at FROM world_nodes WHERE node_id=?').bind(nodeId),
  db.prepare('SELECT balance,earned_today,earned_day,channel_at FROM players WHERE id=?').bind(id)
 ]);
 const operation=results[5].results?.[0],node=results[6].results?.[0],w=results[7].results?.[0];
 if(operation&&(operation.player_id!==id||operation.node_id!==nodeId||operation.kind!=='attune'))return json({error:'operation_collision'},409);
 if(!operation)return json({error:'no_lumen_or_node_settled_or_already_contributed',node,wallet:w},409);
 return json({ok:true,operationId:op,applied:Boolean(operation.applied),node,wallet:w});
}
export default {
 async fetch(request,env){
  const allowed=cors(request,env);
  if(!allowed)return json({error:'origin_not_allowed'},403);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:allowed});
  try{
   const url=new URL(request.url),path=url.pathname;
   const send=(response)=>{const h=new Headers(response.headers);for(const [k,v] of Object.entries(allowed))if(v)h.set(k,v);return new Response(response.body,{status:response.status,headers:h});};
   if(path==='/v1/health'&&request.method==='GET')return send(json({ok:Boolean(env.DB),mutationsEnabled:env.MUTATIONS_ENABLED==='true',world:'Majakka Echo Pilot'}));
   if(!env.DB)return send(json({error:'database_not_configured'},503));
   if(path==='/v1/nodes'&&request.method==='GET')return send(await nodes(request,env.DB));
   if(!['/v1/session','/v1/wallet','/v1/channel','/v1/attune'].includes(path))return send(missing());
   if(env.MUTATIONS_ENABLED!=='true'&&path!=='/v1/wallet')return send(paused());
   if(!env.SIGNING_SECRET||String(env.SIGNING_SECRET).length<32)return send(json({error:'server_not_ready'},503));
   if(path==='/v1/session'&&request.method==='POST')return send(await session(env));
   const id=await identity(request,env);
   if(!id)return send(json({error:'unauthorized'},401));
   if(path==='/v1/wallet'&&request.method==='GET'){
    const w=await wallet(env.DB,id);
    return send(w?json({wallet:w}):json({error:'unknown_player'},401));
   }
   if(request.method!=='POST')return send(json({error:'method_not_allowed'},405));
   const body=await parseBody(request);
   if(!body||typeof body.operationId!=='string'||!UUID.test(body.operationId))return send(json({error:'invalid_operation_id'},400));
   if(path==='/v1/channel')return send(await channel(env,id,body.operationId));
   if(path==='/v1/attune')return send(await attune(env,id,body.operationId,body.nodeId));
   return send(missing());
  }catch(error){
   console.error('Majakka API failed',error?.message||String(error));
   return json({error:'server_error'},500);
  }
 }
};
