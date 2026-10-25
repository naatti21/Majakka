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
  layer.replaceChildren();wrap.hidden=true;clearTimeout(stageTimer);clearTimeout(pulseTimer);challenge=null;linkTargets.hidden=true;document.body.classList.remove('living-selected');updateUI();emit();
}
function isActive(){return globalThis.MajakkaLive?.isActive()===true;}
async function create(originFix){
 if(switching)return;switching=true;
 const token=++epoch;
 const cell=L.region(originFix);
 const key=await regionKey(cell).catch(()=>null);
 if(token!==epoch||!isActive()){switching=false;return;}
 saveProgress();
 activeKey=key;activeRegion=cell.id;origin=cell.center;
 world=L.positions(cell.center);progress=key?sanitize(readRegions()[key]):L.blank();chosen=null;linkTarget=null;
 switching=false;wrap.hidden=false;
 message('Local field '+(key?'restored':'opened')+' · virtual signals are NOT walking destinations.');
 redraw();updateUI();emit();
}
function renderMap(){
 if(!world||!isActive()||document.body.classList.contains('perspective-ready')){layer.replaceChildren();return;}
 if(typeof map==='undefined'||!map||!mapReady)return;
 const data=L.projection(progress,world);
 const items=[...data.nodes,data.rift,...(data.outer||[])];
 const glimmers=L.energyField(position);
 layer.replaceChildren();
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
    path.setAttribute('d','M '+A.x+' '+A.y+' Q '+mx+' '+my+' '+B.x+' '+B.y);
    svg.appendChild(path);
   }
  }
  layer.appendChild(svg);
 }
 if(data.interference>0&&data.rift.kind==='rift'){
  const center=map.project([data.rift.lng,data.rift.lat]);
  const far=L.addMeters(data.rift,0,80+data.interference*34);
  const edge=map.project([far.lng,far.lat]);
  const radius=Math.max(12,Math.abs(edge.x-center.x));
  const haze=document.createElement('div');haze.className='living-haze';
  haze.style.left=center.x+'px';haze.style.top=center.y+'px';
  haze.style.width=radius*2+'px';haze.style.height=radius*2+'px';
  layer.appendChild(haze);
 }
 for(const sparkle of glimmers){
  const p=map.project([sparkle.lng,sparkle.lat]);
  if(p.x<0||p.y<0||p.x>innerWidth||p.y>innerHeight)continue;
  const el=document.createElement('i');el.className='living-glimmer';
  el.style.left=p.x+'px';el.style.top=p.y+'px';
  layer.appendChild(el);
 }
 for(const p of items){
  const pt=map.project([p.lng,p.lat]);
  if(pt.x< -55||pt.x>innerWidth+55||pt.y< -55||pt.y>innerHeight+55)continue;
  const b=document.createElement('button');b.type='button';b.className='living-point '+p.kind;
  b.style.left=pt.x+'px';b.style.top=pt.y+'px';
  b.setAttribute('aria-label',p.kind==='lumen'?'Collect Lumen preview':p.kind==='rift'||p.kind==='restored'?'Interference preview':p.kind==='distant'?'Unexplored region signal':p.name+' virtual node');
  b.innerHTML='<i aria-hidden="true"></i>';
  if(p.kind!=='lumen'&&p.kind!=='distant'){const text=document.createElement('span');text.textContent=p.name;b.appendChild(text);}
  if(p.kind==='distant'){
   b.disabled=true;
   b.title='An undiscovered region. This light is not a verified real-world point of interest.';
  }else b.addEventListener('click',()=>choose(p.id));
  layer.appendChild(b);
 }
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
 const status=near?'CLEAR':next?'DISTANT · SETTLING':'FAINT';
 return p.name.toUpperCase()+' · '+status+' · '+Math.round(distance)+' m · '+(n>=2?'Awake':n+'/2 resonance');
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
 if(!out.ok){message(out.reason);return;}
 state.lumen-=out.cost;save();render();saveProgress();metric('threads');linkTarget=null;linkTargets.hidden=true;
 redraw();updateUI();emit();fb('weave');message(out.reason+'. '+progress.links.length+' links joined.');
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
  const remoteCooling=chosen!=='veil'&&!L.near(position,p,accuracy)&&
    Boolean(progress.remoteAt?.[world.nodes.findIndex(n=>n.id===chosen)])&&
    Date.now()-progress.remoteAt[world.nodes.findIndex(n=>n.id===chosen)]<L.REMOTE_SETTLE_MS;
  by('living-spend').disabled=done||pending||remoteCooling;
  by('living-decode').disabled=done||pending||remoteCooling;
  by('living-weave').hidden=chosen==='veil'||!done;
  by('living-weave').disabled=chosen==='veil'||!done;
  by('living-spend').textContent='✧ '+(chosen==='veil'?'Stabilize':L.near(position,p,accuracy)?'Attune · 2':'Attune · 3');
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
}
function close(){
 chosen=null;linkTarget=null;linkTargets.hidden=true;document.body.classList.remove('living-selected');updateUI();cancel();
}
function positive(type='attune'){fb(type);}
function apply(method){
 if(!world||!chosen)return;
 const result=L.contribute(progress,{target:chosen,method,player:position,accuracy,lumen:state.lumen,world});
 if(!result.ok){message(result.reason);return;}
 state.lumen-=result.cost;save();render();saveProgress();metric('nodeSignals');updateUI();redraw();emit();positive('attune');message(result.reason);
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
function startDecode(){
 if(!chosen||!world)return;
 cancel();
 const i=chosen==='veil'?3:world.nodes.findIndex(n=>n.id===chosen);
 const level=chosen==='veil'?progress.rift+1:progress.nodes[i]+1;
 const seed=i+progress.cycle+(linkTarget?1:0);
 const variant=((seed%3)+3)%3;
 const dialog=by('living-challenge'),prompt=by('living-prompt'),symbols=by('living-symbols'),answers=by('living-answers');
 dialog.hidden=false;symbols.replaceChildren();answers.replaceChildren();metric('decodes');
 challenge={variant,started:Date.now(),level};
 const success=()=>{cancel();linkTarget?connect('decode'):apply('decode');fb('decode');};
 const failure=()=>{metric('decodeMisses');fb('error');message('Not quite. Try another method or replay the signal.');cancel();};
 if(variant===0){
  // Visual phase alignment: sound and haptic optional, not required.
  const target=(17+seed*19+level*7)%87+7;
  prompt.textContent='Phase lock · align the cyan signal with the amber marker';
  const track=document.createElement('div');track.className='living-phase-track';
  const signal=document.createElement('span');signal.className='living-phase-target';signal.style.left=target+'%';
  const cursor=document.createElement('span');cursor.className='living-phase-cursor';cursor.style.left='50%';
  track.append(signal,cursor);symbols.appendChild(track);
  const input=document.createElement('input');input.type='range';input.min='0';input.max='100';input.value='50';
  input.setAttribute('aria-label','Adjust phase alignment');input.addEventListener('input',()=>{cursor.style.left=input.value+'%';});
  answers.appendChild(input);
  const confirm=document.createElement('button');confirm.type='button';confirm.textContent='Lock signal';
  confirm.addEventListener('click',()=>Math.abs(Number(input.value)-target)<=9?success():failure());
  answers.appendChild(confirm);
 }else if(variant===1){
  // Deduce the shared relay frequency — values vary with zone and pulse cycle.
  const answer=3+(seed*3+level)%8;
  const a=[answer-2,answer,answer+3],b=[answer+1,answer-3,answer];
  prompt.textContent='Relay filter · choose the one frequency shared by both sources';
  symbols.textContent='A: '+a.join('  ·  ')+'     B: '+b.join('  ·  ');
  for(const n of [answer-3,answer,answer+2,answer-2].sort((x,y)=>((x*17+seed)%7)-((y*17+seed)%7))){
   const button=document.createElement('button');button.type='button';button.textContent=String(n);
   button.addEventListener('click',()=>n===answer?success():failure());answers.appendChild(button);
  }
 }else{
  // An entirely visible metronome. No hearing, vibration or remembered audio required.
  prompt.textContent='Visual rhythm · tap when the moving light meets the center gate';
  const track=document.createElement('div');track.className='living-rhythm-track';
  const gate=document.createElement('span');gate.className='living-rhythm-gate';
  const marker=document.createElement('span');marker.className='living-rhythm-marker';
  gate.setAttribute('aria-hidden','true');marker.setAttribute('aria-hidden','true');
  track.append(gate,marker);symbols.appendChild(track);
  const caption=document.createElement('small');caption.className='living-rhythm-caption';
  caption.textContent='Center gate · 0 of 3 beats';caption.setAttribute('aria-live','polite');symbols.appendChild(caption);
  const indicator=document.createElement('div');indicator.className='living-rhythm-count';indicator.textContent='○ ○ ○';symbols.appendChild(indicator);
  const button=document.createElement('button');button.type='button';button.textContent='TAP ON LIGHT';
  const interval=1500,started=performance.now();let hits=0,lastCycle=-1,raf=0;
  let phase=0;
  const animate=(timestamp)=>{
   if(!challenge||challenge.variant!==2)return;
   phase=((timestamp-started)%interval)/interval;
   marker.style.left=(phase*100)+'%';
   const aligned=Math.abs(phase-.5)<=.17;
   track.classList.toggle('in-window',aligned);
   raf=requestAnimationFrame(animate);
  };
  const animateSafe=()=>{raf=requestAnimationFrame(animate);};
  animateSafe();
  const originalCancel=challenge;
  challenge.cleanup=()=>cancelAnimationFrame(raf);
  const untimed=document.createElement('button');untimed.type='button';
  untimed.textContent='Untimed visual alternative';
  untimed.className='living-rhythm-alternative';
  untimed.addEventListener('click',()=>{
   if(challenge!==originalCancel)return;
   originalCancel.cleanup?.();originalCancel.cleanup=null;
   track.remove();button.remove();untimed.remove();
   prompt.textContent='Pattern reading · which cadence repeats the short–long–short motif?';
   const motif=document.createElement('div');motif.className='living-pattern-reference';
   motif.textContent='SHORT · LONG · SHORT';symbols.prepend(motif);
   caption.textContent='Choose the matching pattern. No timer.';
   indicator.textContent='▮ ▰ ▮';
   for(const value of ['▮ ▮ ▰','▮ ▰ ▮','▰ ▮ ▮']){
    const b=document.createElement('button');b.type='button';b.textContent=value;
    b.setAttribute('aria-label',value==='▮ ▰ ▮'?'Short long short':'Different rhythm pattern');
    b.addEventListener('click',()=>value==='▮ ▰ ▮'?success():failure());
    answers.appendChild(b);
   }
  });
  button.addEventListener('click',()=>{
   if(!challenge||challenge.variant!==2)return;
   const elapsed=performance.now()-started;
   const cycle=Math.floor(elapsed/interval),p=(elapsed%interval)/interval;
   if(cycle===lastCycle)return; // only one accepted tap per sweep
   if(Math.abs(p-.5)>.17){
    caption.textContent='Watch the cyan dot reach the amber gate, then tap.';
    fb('error');return;
   }
   lastCycle=cycle;hits++;fb('decode');
   indicator.textContent='● '.repeat(hits)+'○ '.repeat(3-hits);
   caption.textContent='Aligned · '+hits+' of 3 beats';
   if(hits===3)success();
  });
  answers.append(button,untimed);

 }
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
window.addEventListener('majakka:livestart',resetWorld);
window.addEventListener('majakka:livestop',()=>{close();resetWorld();document.body.classList.remove('living-selected');});
window.addEventListener('majakka:livefix',event=>{
 if(!isActive())return;
 const d=event.detail;if(!d||![d.lat,d.lng,d.accuracy].every(Number.isFinite))return;
 position={lat:d.lat,lng:d.lng};accuracy=d.accuracy;
 if(accuracy<=65){
  if(!world&&!switching)void create(position);
  else if(world&&!switching&&L.meters(position,origin)>550&&L.region(position).id!==activeRegion)void create(position);
 }
 if(world){redraw();updateUI();emit();}
});
window.addEventListener('majakka:mapready',redraw);
window.addEventListener('resize',redraw);
window.addEventListener('majakka:livingselect',e=>choose(e.detail?.id));
window.addEventListener('majakka:livingcollect',e=>collect(e.detail?.id));
window.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
globalThis.MajakkaLiving={
 snapshot:()=>world&&isActive()?{projection:{...L.projection(progress,world),lumen:L.energyField(position)},position:position?{...position}:null}:null,
 eraseFields,
 award,
 select:choose,collect,restore:()=>{close();resetWorld();}
};
})();
