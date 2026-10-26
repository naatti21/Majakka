/* MAJAKKA v0.5 — LIVE local-only living-world trial.
  No persistent geographic coordinates, no invented public POIs, no background work. */
(()=>{
'use strict';
const L=globalThis.MajakkaLivingCore;
if(!L||!document.getElementById('world-overlay'))return;
const by=id=>document.getElementById(id);
let origin=null,world=null,progress=L.blank(),position=null,accuracy=Infinity,chosen=null,challenge=null,stageTimer=0,linkTarget=null;
let epoch=0,activeRegion=null,activeKey=null,switching=false,pulseTimer=null;
const REGIONS_KEY='majakka-field-regions-v1',SALT_KEY='majakka-field-private-seed-v1';
function readRegions(){
 try{const obj=JSON.parse(localStorage.getItem(REGIONS_KEY)||'{}');return obj&&typeof obj==='object'&&!Array.isArray(obj)?obj:{};}catch{return {};}
}
function sanitize(input){
 const s=L.blank();if(!input||typeof input!=='object')return s;
 const clamp=(x,lo,hi)=>Number.isFinite(Number(x))?Math.max(lo,Math.min(hi,Math.floor(Number(x)))):lo;
 s.cycle=clamp(input.cycle,0,L.MAX_CYCLES);
 s.nodes=Array.from({length:L.NODE_COUNT},(_,i)=>clamp(input.nodes?.[i],0,2));
 s.pending=Array.from({length:L.NODE_COUNT},(_,i)=>clamp(input.pending?.[i],0,2));
 s.lastNodeCycle=Array.from({length:L.NODE_COUNT},(_,i)=>clamp(input.lastNodeCycle?.[i],-1,L.MAX_CYCLES));
 s.rift=clamp(input.rift,0,2);s.riftPending=input.riftPending===true;
 s.riftLastCycle=clamp(input.riftLastCycle,-1,L.MAX_CYCLES);
 s.riftClear=input.riftClear===true;s.field=input.field===true;
 s.interference=clamp(input.interference,0,3);
 s.claimed=Array.isArray(input.claimed)?input.claimed.filter(x=>/^spark-[0-5]$/.test(x)).slice(0,6):[];
 s.visited=Array.isArray(input.visited)?input.visited.filter(x=>/^echo-(?:[0-9]|1[01])$/.test(x)).slice(0,L.NODE_COUNT):[];
 s.decodeRewards=Array.isArray(input.decodeRewards)?[...new Set(input.decodeRewards.filter(x=>/^(echo-(?:[0-9]|1[01])|veil|link-[0-9]+-[0-9]+)$/.test(x)))].slice(0,80):[];
 s.links=Array.isArray(input.links)?[...new Set(input.links.filter(x=>/^\d+-\d+$/.test(x)&&x.split('-').every(v=>Number(v)>=0&&Number(v)<L.NODE_COUNT)))]:[];
 s.lastPulseAt=Math.min(Date.now(),Math.max(0,Number(input.lastPulseAt)||0));
 s.remoteAt=Array.from({length:L.NODE_COUNT},(_,i)=>Math.max(0,Math.min(Date.now(),Number(input.remoteAt?.[i])||0)));
 return s;
}
function saveProgress(){
 if(!activeKey)return;
 try{
  const zones=readRegions();zones[activeKey]=sanitize(progress);
  const keys=Object.keys(zones);
  while(keys.length>35){const oldest=keys.shift();delete zones[oldest];}
  localStorage.setItem(REGIONS_KEY,JSON.stringify(zones));
 }catch(e){console.warn('Private field save unavailable',e);}
}
function secret(){
 let salt=localStorage.getItem(SALT_KEY);
 if(!salt){const bytes=new Uint8Array(16);crypto.getRandomValues(bytes);
   salt=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');localStorage.setItem(SALT_KEY,salt);}
 return salt;
}
async function regionKey(cell){
 if(!crypto.subtle)return null;
 const msg=new TextEncoder().encode(secret()+':'+cell.id);
 const hash=new Uint8Array(await crypto.subtle.digest('SHA-256',msg));
 return Array.from(hash.slice(0,12),b=>b.toString(16).padStart(2,'0')).join('');
}
function eraseFields(){
 globalThis.MajakkaLumen?.clear?.();
 try{localStorage.removeItem(REGIONS_KEY);localStorage.removeItem(SALT_KEY);}catch{}
 activeKey=null;resetWorld();
 message('Stored local field progress cleared. This does not reset other Majakka data.');
}

const PRIVATE_KEY='majakka-living-counters-v1';
let counters={day:new Date().toLocaleDateString('sv-SE'),earned:0,fields:0,veils:0,fieldPaid:false,veilPaid:false};
try{
 const saved=JSON.parse(localStorage.getItem(PRIVATE_KEY)||'null');
 if(saved&&typeof saved==='object'){
  counters.fields=Math.max(0,Math.min(99999,Number(saved.fields)||0));
  counters.veils=Math.max(0,Math.min(99999,Number(saved.veils)||0));
  if(saved.day===counters.day){
   counters.earned=Math.max(0,Math.min(36,Number(saved.earned)||0));
   counters.fieldPaid=Boolean(saved.fieldPaid);counters.veilPaid=Boolean(saved.veilPaid);
  }
 }
}catch{}
function saveCounters(){try{localStorage.setItem(PRIVATE_KEY,JSON.stringify(counters));}catch{}}
function award(amount,type='spark'){
 const today=new Date().toLocaleDateString('sv-SE');
 if(counters.day!==today){counters.day=today;counters.earned=0;counters.fieldPaid=false;counters.veilPaid=false;}
 if(type==='field'&&counters.fieldPaid||type==='veil'&&counters.veilPaid)return 0;
 if(type==='field')counters.fieldPaid=true;
 if(type==='veil')counters.veilPaid=true;
 const granted=Math.max(0,Math.min(amount,36-counters.earned,C.MAX_LUMEN-state.lumen));
 counters.earned+=granted;state.lumen+=granted;
 saveCounters();if(granted){save();render();}
 return granted;
}
const layer=document.createElement('div');layer.id='living-markers';by('world-overlay').append(layer);
const wrap=document.createElement('div');wrap.id='living-ui';wrap.hidden=true;
wrap.innerHTML='<div id="living-objective"></div><div id="living-info" hidden></div><div id="living-actions" hidden><button id="living-spend" type="button">✧ Attune</button><button id="living-decode" type="button">◇ Decode</button><button id="living-weave" type="button" hidden>⌁ Weave</button><button id="living-close" type="button" aria-label="Close signal">×</button></div><div id="living-link-targets" hidden></div><button id="living-pulse" type="button" aria-label="Advance the local world pulse">↻ Pulse</button><div id="living-challenge" hidden role="dialog" aria-label="Decode a signal"><strong id="living-prompt"></strong><div id="living-symbols"></div><div id="living-answers"></div><button id="living-cancel" type="button">Cancel</button></div><div id="living-status" aria-live="polite"></div><button type="button" id="living-haptics">Vibe on</button><button type="button" id="living-erase">Clear local fields</button><button type="button" id="living-report">Copy field report</button>';
document.body.append(wrap);
// Field diary/settings remain reachable from Memory even between GPS sessions.
for(const id of ['living-haptics','living-erase','living-report'])document.body.appendChild(by(id));
const info=by('living-info'),actions=by('living-actions'),pulse=by('living-pulse'),status=by('living-status'),linkTargets=by('living-link-targets');
const fb=(kind)=>globalThis.MajakkaFeedback?.play(kind);
const metric=(type)=>globalThis.MajakkaFieldMetrics?.count(type);
const message=text=>{status.textContent=text;if(typeof notify==='function')notify(text);};
function emit(){window.dispatchEvent(new Event('majakka:livingupdate'));}
function resetWorld(){
  saveProgress();origin=null;world=null;progress=L.blank();position=null;accuracy=Infinity;chosen=null;activeKey=null;activeRegion=null;switching=false;epoch++;
  layer.replaceChildren();clearPointElements();wrap.hidden=true;clearTimeout(stageTimer);clearTimeout(pulseTimer);challenge=null;linkTargets.hidden=true;document.body.classList.remove('living-selected');updateUI();emit();
}
function isActive(){return navigator.onLine!==false;}
async function create(originFix){
 if(switching)return;switching=true;
 const token=++epoch;
 const cell=L.region(originFix);
 const key=await regionKey(cell).catch(()=>null);
 if(token!==epoch||!isActive()){switching=false;return;}
 saveProgress();
 activeKey=key;activeRegion=cell.id;origin=cell.center;
 world=L.positions(cell.center);progress=key?sanitize(readRegions()[key]):L.blank();chosen=null;linkTarget=null;
 cancel();document.body.classList.remove('living-selected');linkTargets.hidden=true;
 switching=false;wrap.hidden=false;
 status.textContent='Virtual signals are not walking destinations. Remote resonance is enabled.';
 redraw();updateUI();emit();
}
/* Keep actual touch targets mounted while map pans.
   Recreating all DOM markers each frame caused flicker and lost pointer taps. */
const pointElements=new Map();
function clearPointElements(){for(const el of pointElements.values())el.remove();pointElements.clear();}
function renderMap(){
 if(!world||!isActive()||document.body.classList.contains('perspective-ready')){
  layer.replaceChildren();clearPointElements();return;
 }
 if(typeof map==='undefined'||!map||!mapReady)return;
 const data=L.projection(progress,world);
 const items=[...data.nodes,data.rift,...(data.outer||[])];
 for(const old of layer.querySelectorAll('.living-curves,.living-haze,.living-glimmer'))old.remove();
 if(data.edges?.length||data.fields?.length){
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('class','living-curves');svg.setAttribute('viewBox','0 0 '+innerWidth+' '+innerHeight);
  svg.setAttribute('width','100%');svg.setAttribute('height','100%');
  for(const trio of data.fields||[]){
   const ps=trio.map(id=>data.nodes.find(n=>n.id===id)).filter(Boolean).map(n=>map.project([n.lng,n.lat]));
   if(ps.length!==3)continue;
   const polygon=document.createElementNS('http://www.w3.org/2000/svg','polygon');
   polygon.setAttribute('class','living-harmonic-area');
   polygon.setAttribute('points',ps.map(p=>p.x+','+p.y).join(' '));svg.appendChild(polygon);
  }
  for(const [aid,bid] of data.edges){
   const a=data.nodes.find(n=>n.id===aid),b=data.nodes.find(n=>n.id===bid);
   if(!a||!b)continue;
   const A=map.project([a.lng,a.lat]),B=map.project([b.lng,b.lat]);
   const dx=B.x-A.x,dy=B.y-A.y,d=Math.hypot(dx,dy)||1;
   const curv=Math.min(30,d*.13),mx=(A.x+B.x)/2-dy/d*curv,my=(A.y+B.y)/2+dx/d*curv;
   for(const cls of ['living-curve-halo','living-curve-core']){
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('class',cls);
    path.setAttribute('d','M '+A.x+' '+A.y+' Q '+mx+' '+my+' '+B.x+' '+B.y);svg.appendChild(path);
   }
  }
  layer.appendChild(svg);
 }
 if(data.interference>0&&data.rift.kind==='rift'){
  const center=map.project([data.rift.lng,data.rift.lat]);
  const far=L.addMeters(data.rift,0,80+data.interference*34);
  const edge=map.project([far.lng,far.lat]),radius=Math.max(12,Math.abs(edge.x-center.x));
  const haze=document.createElement('div');haze.className='living-haze';
  haze.style.left=center.x+'px';haze.style.top=center.y+'px';haze.style.width=radius*2+'px';haze.style.height=radius*2+'px';
  layer.appendChild(haze);
 }
 const seen=new Set(),viewport=by('map-viewport'),w=viewport?.clientWidth||innerWidth,h=viewport?.clientHeight||innerHeight;
 for(const p of items){
  if(p.kind==='lumen'||p.kind==='distant')continue; // never advertise unplayable beacons
  const pt=map.project([p.lng,p.lat]);
  if(pt.x<-50||pt.x>w+50||pt.y<-50||pt.y>h+50)continue;
  let b=pointElements.get(p.id);
  if(!b){
   b=document.createElement('button');b.type='button';
   b.innerHTML='<i aria-hidden="true"></i><span></span>';
   b.addEventListener('click',event=>{event.stopPropagation();choose(p.id);});
   layer.appendChild(b);pointElements.set(p.id,b);
  }
  b.className='living-point '+p.kind+' '+(p.archetype||'');
  b.style.left=pt.x+'px';b.style.top=pt.y+'px';
  b.setAttribute('aria-label',(p.kind==='rift'||p.kind==='restored'?'Interference':p.name)+' · Open node actions');
  b.lastElementChild.textContent=p.name||'Signal';seen.add(p.id);
 }
 for(const [id,el] of pointElements)if(!seen.has(id)){el.remove();pointElements.delete(id);}
}
let attachedMap=null;
function redraw(){
 if(!isActive()||!world)return;
 if(typeof map!=='undefined'&&map&&mapReady&&map!==attachedMap){attachedMap=map;map.on('move',renderMap);}
 renderMap();
}
function current(){return chosen==='veil'?world?.rift:world?.nodes?.find(n=>n.id===chosen);}
function infoText(){
 if(!world||!current())return '';
 const p=current(),distance=L.meters(position,p),near=L.near(position,p,accuracy);
 if(chosen==='veil')return 'INTERFERENCE · '+progress.rift+'/'+L.RIFT_TARGET+' · '+(progress.riftClear?'Restored':'Needs two world pulses');
 const i=world.nodes.findIndex(n=>n.id===chosen),n=progress.nodes[i];
 const next=progress.remoteAt?.[i]&&Date.now()-progress.remoteAt[i]<L.REMOTE_SETTLE_MS;
 const status=near?'CLEAR · HERE':'CLEAR · REMOTE';
 return p.name.toUpperCase()+' · '+status+(Number.isFinite(distance)?' · '+Math.round(distance)+' m':'')+' · '+(n>=2?'Awake':n+'/2 resonance');
}
function pairKey(a,b){return [a.replace('echo-',''),b.replace('echo-','')].sort().join('-');}
function openLinkOptions(){
 if(!world||!chosen||chosen==='veil')return;
 const i=world.nodes.findIndex(n=>n.id===chosen);
 if(i<0||progress.nodes[i]<L.NODE_TARGET){message('Awaken this light before weaving it into the network.');return;}
 linkTargets.replaceChildren();linkTargets.hidden=false;
 let possible=0;
 for(const node of world.nodes){
  if(node.id===chosen||progress.nodes[world.nodes.indexOf(node)]<L.NODE_TARGET)continue;
  if((progress.links||[]).includes(pairKey(chosen,node.id)))continue;
  possible++;
  const spend=document.createElement('button');spend.type='button';spend.textContent='⌁ '+node.name+' · 1✧';
  spend.addEventListener('click',()=>{linkTarget=node.id;connect('lumen');});
  const decode=document.createElement('button');decode.type='button';decode.textContent='◇ Decode';
  decode.setAttribute('aria-label','Decode link to '+node.name);
  decode.addEventListener('click',()=>{linkTarget=node.id;startDecode();});
  linkTargets.append(spend,decode);
 }
 if(!possible){linkTargets.hidden=true;message('All available connections from this node are already woven.');}
}
function connect(method){
 if(!world||!chosen||!linkTarget)return;
 const out=L.weave(progress,chosen,linkTarget,{method,lumen:state.lumen});
 if(!out.ok){message(out.reason);return out;}
 state.lumen-=out.cost;save();render();saveProgress();metric('threads');linkTarget=null;linkTargets.hidden=true;
 redraw();updateUI();emit();fb('weave');message(out.reason+'. '+progress.links.length+' links joined.');return out;
}
function updateUI(){
 if(!world||!isActive()){info.hidden=actions.hidden=true;return;}
 const awake=progress.nodes.filter(n=>n>=L.NODE_TARGET).length;
 by('living-objective').textContent=progress.field?'HARMONY RESTORED · '+(progress.links||[]).length+' living threads':
  'LOCAL FIELD · '+awake+'/'+L.NODE_COUNT+' awake · '+(progress.links||[]).length+' threads · '+(progress.riftClear?'veil clear':'veil '+progress.rift+'/2');
 const p=current();
 info.hidden=actions.hidden=!p;
 if(p){
  info.textContent=infoText();
  const done=chosen==='veil'?progress.riftClear:progress.nodes[world.nodes.findIndex(n=>n.id===chosen)]>=2;
  const pending=chosen==='veil'?progress.riftPending:Boolean(progress.pending[world.nodes.findIndex(n=>n.id===chosen)]);
  const remoteCooling=false; // No distance penalty for playing from home.
  by('living-spend').disabled=done||pending||remoteCooling;
  by('living-decode').disabled=done||pending||remoteCooling;
  by('living-weave').hidden=chosen==='veil'||!done;
  by('living-weave').disabled=chosen==='veil'||!done;
  by('living-spend').textContent='✧ '+(chosen==='veil'?'Stabilize':'Attune · 2');
  by('living-decode').textContent='◇ Decode';
 }
 const remain=Math.max(0,90000-(Date.now()-progress.lastPulseAt));
 pulse.textContent=remain>0?'↻ Settling '+Math.ceil(remain/1000)+'s':'↻ Pulse '+(progress.cycle+1);
 pulse.disabled=progress.cycle>=L.MAX_CYCLES||remain>0;
 if(remain>0){clearTimeout(pulseTimer);pulseTimer=setTimeout(()=>{if(isActive())updateUI();},remain+80);}
}
function choose(id){
 if(!world)return;
 const valid=id==='veil'||world.nodes.some(n=>n.id===id);
 if(!valid)return;
 chosen=id;linkTarget=null;linkTargets.hidden=true;
 document.body.classList.add('living-selected');
 updateUI();emit();
 message((id==='veil'?'Interference':world.nodes.find(n=>n.id===id)?.name||'Node')+' selected · choose Attune or Decode');
}
function close(){
 chosen=null;linkTarget=null;linkTargets.hidden=true;document.body.classList.remove('living-selected');updateUI();cancel();
}
function positive(type='attune'){fb(type);}
function apply(method){
 if(!world||!chosen)return;
 const result=L.contribute(progress,{target:chosen,method,player:position,accuracy,lumen:state.lumen,world,remote:true});
 if(!result.ok){message(result.reason);return result;}
 state.lumen-=result.cost;save();render();saveProgress();metric('nodeSignals');updateUI();redraw();emit();positive('attune');message(result.reason);return result;
}
function collect(id){
 message('Lumen appears around you and gathers automatically as you move.');
}
function nextPulse(){
 if(!world)return;
 const now=Date.now();
 if(now-progress.lastPulseAt<90000){message('World pulse is settling. A new pulse arrives after a short real-time interval.');return;}
 const r=L.pulse(progress);
 if(!r.ok){message(r.reason);return;}
 progress.lastPulseAt=now;saveProgress();metric('pulses');
 const gain=0; // LIVE energy comes only from motion.
 if(r.cleared){counters.veils++;metric('veils');}
 if(r.opened){counters.fields++;metric('fields');}
 if(r.cleared||r.opened)saveCounters();
 redraw();updateUI();emit();positive(r.opened?'field':r.cleared?'clear':'pulse');
 message(r.reason+(gain?' ✧ +'+gain:'')+(r.opened?' · Fields '+counters.fields:'')+(r.cleared?' · Restorations '+counters.veils:''));
}
function cancel(){clearTimeout(stageTimer);challenge?.cleanup?.();challenge=null;by('living-challenge').hidden=true;}
/* Optional three-piece circuit repair; normal Lumen attunement remains one tap.
   First successful repair of a node earns +1 Lumen (subject to daily caps). */
function startDecode(){
 if(!chosen||!world)return;
 cancel();
 const selected=chosen,link=linkTarget;
 const rewardKey=link?'link-'+pairKey(selected,link):selected;
 const dialog=by('living-challenge'),prompt=by('living-prompt'),
       symbols=by('living-symbols'),answers=by('living-answers');
 const seed=(selected==='veil'?17:Number(selected.replace('echo-',''))*7)+progress.cycle*5+(link?11:0);
 const orientations=[1,(seed%2===0?1:0),1];
 dialog.hidden=false;symbols.replaceChildren();answers.replaceChildren();
 metric('decodes');
 challenge={variant:'circuit',started:Date.now(),level:progress.cycle};
 prompt.textContent=link?'Repair the thread · rotate to connect':'Reconnect the signal · rotate three conductors';
 const board=document.createElement('div');board.className='living-circuit';
 board.setAttribute('role','group');board.setAttribute('aria-label','Rotate three conductors to connect the terminals');
 const left=document.createElement('span');left.className='circuit-port';left.textContent='●';
 board.append(left);
 for(let i=0;i<3;i++){
  const tile=document.createElement('button');tile.type='button';tile.className='circuit-tile';
  tile.setAttribute('aria-label','Rotate conductor '+(i+1));
  const paint=()=>{tile.textContent=orientations[i]===0?'━':'┃';tile.classList.toggle('connected',orientations[i]===0);};
  paint();
  tile.addEventListener('click',()=>{
   if(!challenge||challenge.variant!=='circuit')return;
   orientations[i]=1-orientations[i];paint();fb('decode');
   if(orientations.every(v=>v===0)){
    const result=link?connect('decode'):apply('decode');
    cancel();
    if(!result?.ok)return;
    progress.decodeRewards??=[];
    let bonus=0;
    if(!progress.decodeRewards.includes(rewardKey)){
     progress.decodeRewards.push(rewardKey);
     bonus=award(1,'decode');saveProgress();
    }
    message(bonus?'Circuit complete · free resonance + 1 Lumen':'Circuit complete · free resonance');
    positive('field');
   }
  });
  board.append(tile);
 }
 const right=document.createElement('span');right.className='circuit-port target';right.textContent='◆';
 board.append(right);symbols.append(board);
 const clue=document.createElement('small');clue.className='living-circuit-note';
 clue.textContent='Connect ● to ◆. The first successful repair earns 1 extra Lumen.';
 symbols.append(clue);
 const skip=document.createElement('button');skip.type='button';skip.className='living-circuit-exit';
 skip.textContent='Use 2 Lumen instead';
 skip.addEventListener('click',()=>{cancel();apply('lumen');});
 answers.append(skip);
}
by('living-spend').addEventListener('click',()=>apply('lumen'));
by('living-decode').addEventListener('click',startDecode);
by('living-weave').addEventListener('click',openLinkOptions);
by('living-haptics').addEventListener('click',()=>{
 const fb=globalThis.MajakkaFeedback;if(!fb)return;
 const enabled=fb.setHaptics(!fb.haptics());by('living-haptics').textContent='Vibe '+(enabled?'on':'off');
});
by('living-erase').addEventListener('click',()=>{
 if(confirm('Erase all local field progress and test statistics on this device? This cannot be undone.')){globalThis.MajakkaFieldMetrics?.clear();eraseFields();}
});
by('living-haptics').textContent='Vibe '+(globalThis.MajakkaFeedback?.haptics()?'on':'off');
by('living-report').addEventListener('click',async ()=>{
 const ok=await globalThis.MajakkaFieldMetrics?.copy();
 message(ok?'Test report copied. You can paste it into ChatGPT Work for review.':'Report displayed for manual copying.');
});
by('living-cancel').addEventListener('click',cancel);
by('living-close').addEventListener('click',close);
pulse.addEventListener('click',nextPulse);
// One continuous online world. GPS start/pause never clears the visible world.
window.addEventListener('majakka:livestop',()=>{position=null;accuracy=Infinity;redraw();updateUI();emit();});
window.addEventListener('majakka:livefix',event=>{
 if(!isActive())return;
 const d=event.detail;if(!d||![d.lat,d.lng,d.accuracy].every(Number.isFinite))return;
 position={lat:d.lat,lng:d.lng};accuracy=d.accuracy;
 // GPS updates the avatar only; browsing the map determines the active world region.
 if(world){redraw();updateUI();emit();}
});
function viewedPoint(){if(typeof map==='undefined'||!map?.getCenter||!mapReady)return null;const c=map.getCenter();return {lat:c.lat,lng:c.lng};}
 function refreshRegion(){
  const c=viewedPoint();if(!c||!isActive()||switching)return;
  let cell;try{cell=L.region(c);}catch{return;}
  if(!world||cell.id!==activeRegion)void create(c);
  else{wrap.hidden=false;redraw();}
 }
 window.addEventListener('majakka:mapready',refreshRegion);
 window.addEventListener('online',refreshRegion);
 window.addEventListener('offline',()=>{layer.replaceChildren();wrap.hidden=true;});
 let regionMap=null,attachAttempts=0;
 function attachRegionMap(){
  if(typeof map!=='undefined'&&map&&mapReady){
    if(map!==regionMap){regionMap=map;let moveTimer=0;map.on('move',()=>{clearTimeout(moveTimer);moveTimer=setTimeout(refreshRegion,220);});}
    refreshRegion();
  }else if(attachAttempts++<35)setTimeout(attachRegionMap,400);
 }
 attachRegionMap();
window.addEventListener('resize',redraw);
window.addEventListener('majakka:livingselect',e=>choose(e.detail?.id));
window.addEventListener('majakka:livingcollect',e=>collect(e.detail?.id));
window.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
globalThis.MajakkaLiving={
 snapshot:()=>world&&isActive()?{projection:{...L.projection(progress,world),lumen:L.energyField(position)},position:position?{...position}:null}:null,
 eraseFields,
 award,
 balance:()=>Number.isFinite(state?.lumen)?state.lumen:0,
 spend:amount=>{
  if(!Number.isSafeInteger(amount)||amount<=0||!isActive()||state.lumen<amount)return false;
  state.lumen-=amount;save();render();emit();return true;
 },
 navigate:point=>{if(!point||!isActive()||switching)return;try{if(!world||L.region(point).id!==activeRegion)void create(point);}catch{}},
 select:choose,collect,restore:()=>{close();resetWorld();}
};
})();
