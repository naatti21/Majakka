/* Majakka Landmark Sites v0.11.1 — a purpose for every visible node.
 * Locally persistent solo prototype: physical positions derive ONLY from OSM
 * landmark coordinates/IDs, never from player GPS, camera-relative RNG or a grid.
 * The game never offers directions or asserts a place is pedestrian-accessible.
 */
(()=>{
'use strict';
const Core=globalThis.MajakkaAtlasCore;
if(!Core)return;
const KEY='majakka-landmark-restorations-v1',GOAL=2;
const validSite=p=>p&&p.kind==='atlas-real'&&p.source==='osm'&&/^poi-[a-z0-9]+$/.test(p.id)&&
  Core.types.includes(p.type)&&Number.isFinite(p.lat)&&Number.isFinite(p.lng)&&typeof p.name==='string'&&p.name.trim().length>2;
function district(p){
 if(!p||!Number.isFinite(p.lat)||!Number.isFinite(p.lng)||Math.abs(p.lat)>80||Math.abs(p.lng)>180)return null;
 const rad=Math.PI/180,R=6378137,y=R*Math.log(Math.tan(Math.PI/4+p.lat*rad/2)),x=R*p.lng*rad;
 return Math.floor(x/2600)+':'+Math.floor(y/2600);
}
let state={v:1,sites:{},districts:{}};
try{
 const v=JSON.parse(localStorage.getItem(KEY)||'null');
 if(v&&v.v===1&&v.sites&&typeof v.sites==='object'&&!Array.isArray(v.sites)){
  for(const [id,row] of Object.entries(v.sites).slice(-1000)){
   if(!/^poi-[a-z0-9]+$/.test(id)||!row||!Core.types.includes(row.type)||typeof row.district!=='string')continue;
   state.sites[id]={district:row.district,type:row.type,created:Math.max(0,Number(row.created)||0)};
  }
  if(v.districts&&typeof v.districts==='object'&&!Array.isArray(v.districts))
   for(const [id,date] of Object.entries(v.districts).slice(-350))
    if(/^-?\d+:-?\d+$/.test(id))state.districts[id]=Math.max(0,Number(date)||0);
 }
}catch{}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));return true;}catch{return false;}}
const panel=document.createElement('section');panel.id='landmark-summary';panel.innerHTML='<button type="button" aria-label="Close district view">×</button><h3>First Chord</h3><p></p>';document.body.append(panel);
panel.querySelector('button').addEventListener('click',()=>document.querySelector('.map-bottom-nav [data-panel="world"]')?.click());
const status=document.createElement('div');status.id='landmark-mission';status.setAttribute('role','status');
status.textContent='YOUR MISSION · Discover a landmark to restore its light';document.body.append(status);
const styles=document.createElement('style');styles.textContent=`
body.place-first #living-ui,body.place-first #living-markers,
body.place-first #living-pulse,body.place-first #living-objective,
body.place-first #world-markers,body.place-first #field-layer,body.place-first #hud-rift-markers,
body.place-first #hud-node-info,body.place-first #hud-node-actions,
body.place-first #hud-rift-actions,body.place-first #hud-rift-info,
body.place-first #hud-world-pulse,body.place-first #hud-rhythm,
body.place-first #map-intro{display:none!important}
#landmark-mission{position:fixed;left:12px;right:84px;bottom:calc(164px + env(safe-area-inset-bottom,0px));
 z-index:24;max-width:295px;background:#06131adf;color:#e2d6ba;border:1px solid #8c8b6957;
 border-radius:12px;padding:8px 10px;font:650 10px/1.4 system-ui;pointer-events:none;
 box-shadow:0 5px 20px #0008}
body.place-first .field-card,body.place-first .signal-card{display:none!important}
#landmark-summary{display:none;position:fixed;left:12px;right:12px;bottom:calc(92px + env(safe-area-inset-bottom,0px));
 z-index:34;max-width:410px;margin:auto;padding:19px;background:#06131bf5;border:1px solid #bba37673;
 border-radius:18px;color:#e3e9dc;box-shadow:0 16px 36px #000a;font:12px/1.6 system-ui}
body.place-first.field-open #landmark-summary{display:block}
#landmark-summary h3{margin:0 0 10px;color:#eacb8d;font-size:17px}
#landmark-summary p{margin:0;white-space:pre-line}
#landmark-summary button{position:absolute;right:9px;top:7px;background:none;color:#c0d4c7;border:0;font-size:22px}
body.journal-open #landmark-mission,body.field-open #landmark-mission{display:none!important}
@media(max-width:350px){#landmark-mission{right:100px;font-size:9px}}
`;document.head.append(styles);
document.body.classList.add('place-first');
const get=id=>state.sites[id]?{...state.sites[id]}:null;
function progress(p){
 const area=district(p);
 const restored=Object.entries(state.sites).filter(([id,row])=>row.district===area).length;
 return {district:area,restored:Math.min(GOAL,restored),goal:GOAL,complete:Boolean(state.districts[area])};
}
function updatePanel(){
 const n=Object.keys(state.sites).length,d=Object.keys(state.districts).length;
 panel.querySelector('p').textContent='Restored landmarks: '+n+'\\nAwakened districts: '+d+
 '\\n\\nFind a named art, historical, natural or cultural landmark on the map. Restore it with 2 Lumen. Restore another landmark in the same district to awaken a permanent First Chord and earn up to 3 Lumen.\\n\\nAll positions come from OpenStreetMap data. Your progress is local to this device; shared-world sync comes later. Walking is never required.';
}
function update(p=null){
 const n=p?progress(p):null;
 updatePanel();
 status.textContent=n?(n.complete?'DISTRICT AWAKE · '+n.restored+'/'+GOAL+' real places restored':
  'RESTORE THE DISTRICT · '+n.restored+'/'+GOAL+' landmarks · '+(GOAL-n.restored)+' to go'):
  'YOUR MISSION · Find a real landmark, restore its light, then restore another nearby';
}
function attune(p){
 if(!validSite(p))return {ok:false,reason:'Not a named public map landmark'};
 if(navigator.onLine===false)return {ok:false,reason:'Connection required'};
 if(state.sites[p.id])return {ok:false,reason:'This landmark is already restored'};
 const bank=globalThis.MajakkaLiving;
 if(!bank?.balance||!bank?.spend)return {ok:false,reason:'Lumen wallet is not ready'};
 if(bank.balance()<2)return {ok:false,reason:'Need 2 Lumen · collect grains or Channel Lumen'};
 const area=district(p);
 if(!area)return {ok:false,reason:'Invalid landmark coordinates'};
 const backup=JSON.stringify(state);
 const count=Object.values(state.sites).filter(v=>v.district===area).length;
 const completed=count+1>=GOAL&&!state.districts[area];
 state.sites[p.id]={district:area,type:p.type,created:Date.now()};
 if(completed)state.districts[area]=Date.now();
 if(!save())return (state=JSON.parse(backup),{ok:false,reason:'Storage unavailable, no Lumen was charged'});
 if(!bank.spend(2)){
  state=JSON.parse(backup);save();
  return {ok:false,reason:'Lumen debit failed; progress rolled back'};
 }
 const reward=completed?(bank.award?.(3,'landmark')||0):0;
 const restored=progress(p);
 update(p);
 const message=completed?'DISTRICT AWAKENED · permanent light restored'+(reward?' · +'+reward+' Lumen':''):
  p.name+' restored · '+restored.restored+'/'+GOAL+' toward a living district';
 if(typeof notify==='function')notify(message);
 globalThis.MajakkaFeedback?.play?.(completed?'field':'attune');
 window.dispatchEvent(new Event('majakka:site-update'));
 return {ok:true,completed,reward,progress:restored};
}
function select(p){update(p);}
globalThis.MajakkaSites={get,attune,progress,district,select,summary:()=>({
 sites:Object.keys(state.sites).length,districts:Object.keys(state.districts).length})};
update();
})();
