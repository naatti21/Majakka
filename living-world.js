/* MAJAKKA v0.5 — LIVE local-only living-world trial.
  No persistent geographic coordinates, no invented public POIs, no background work. */
(()=>{
'use strict';
const L=globalThis.MajakkaLivingCore;
if(!L||!document.getElementById('world-overlay'))return;
const by=id=>document.getElementById(id);
let origin=null,world=null,progress=L.blank(),position=null,accuracy=Infinity,chosen=null,challenge=null,stageTimer=0;
let epoch=0;
const PRIVATE_KEY='majakka-living-counters-v1';
let counters={day:new Date().toISOString().slice(0,10),earned:0,fields:0,veils:0,fieldPaid:false,veilPaid:false};
try{
 const saved=JSON.parse(localStorage.getItem(PRIVATE_KEY)||'null');
 if(saved&&typeof saved==='object'){
  counters.fields=Math.max(0,Math.min(99999,Number(saved.fields)||0));
  counters.veils=Math.max(0,Math.min(99999,Number(saved.veils)||0));
  if(saved.day===counters.day){
   counters.earned=Math.max(0,Math.min(12,Number(saved.earned)||0));
   counters.fieldPaid=Boolean(saved.fieldPaid);counters.veilPaid=Boolean(saved.veilPaid);
  }
 }
}catch{}
function saveCounters(){try{localStorage.setItem(PRIVATE_KEY,JSON.stringify(counters));}catch{}}
function award(amount,type='spark'){
 const today=new Date().toISOString().slice(0,10);
 if(counters.day!==today){counters.day=today;counters.earned=0;counters.fieldPaid=false;counters.veilPaid=false;}
 if(type==='field'&&counters.fieldPaid||type==='veil'&&counters.veilPaid)return 0;
 if(type==='field')counters.fieldPaid=true;
 if(type==='veil')counters.veilPaid=true;
 const granted=Math.max(0,Math.min(amount,12-counters.earned,C.MAX_LUMEN-state.lumen));
 counters.earned+=granted;state.lumen+=granted;
 saveCounters();if(granted){save();render();}
 return granted;
}
const layer=document.createElement('div');layer.id='living-markers';by('world-overlay').append(layer);
const wrap=document.createElement('div');wrap.id='living-ui';wrap.hidden=true;
wrap.innerHTML='<div id="living-info" hidden></div><div id="living-actions" hidden><button id="living-spend" type="button">✧ Attune</button><button id="living-decode" type="button">◇ Decode</button><button id="living-close" type="button" aria-label="Close signal">×</button></div><button id="living-pulse" type="button" aria-label="Advance the local world pulse">↻ Pulse</button><div id="living-challenge" hidden role="dialog" aria-label="Decode a signal"><strong id="living-prompt"></strong><div id="living-symbols"></div><div id="living-answers"></div><button id="living-cancel" type="button">Cancel</button></div><div id="living-status" aria-live="polite"></div>';
document.body.append(wrap);
const info=by('living-info'),actions=by('living-actions'),pulse=by('living-pulse'),status=by('living-status');
const message=text=>{status.textContent=text;if(typeof notify==='function')notify(text);};
function emit(){window.dispatchEvent(new Event('majakka:livingupdate'));}
function resetWorld(){
  origin=null;world=null;progress=L.blank();position=null;accuracy=Infinity;chosen=null;epoch++;
  layer.replaceChildren();wrap.hidden=true;clearTimeout(stageTimer);challenge=null;updateUI();emit();
}
function isActive(){return globalThis.MajakkaLive?.isActive()===true;}
function create(originFix){
  world=L.positions(originFix);origin={...originFix};progress=L.blank();chosen=null;
  wrap.hidden=false;message('Local preview created · virtual signals are NOT navigation destinations.');
  redraw();updateUI();emit();
}
function renderMap(){
 if(!world||!isActive()||document.body.classList.contains('perspective-ready')){layer.replaceChildren();return;}
 if(typeof map==='undefined'||!map||!mapReady)return;
 const data=L.projection(progress,world);
 const items=[...data.nodes,data.rift,...data.lumen];
 layer.replaceChildren();
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
 for(const p of items){
  const pt=map.project([p.lng,p.lat]);
  if(pt.x< -55||pt.x>innerWidth+55||pt.y< -55||pt.y>innerHeight+55)continue;
  const b=document.createElement('button');b.type='button';b.className='living-point '+p.kind;
  b.style.left=pt.x+'px';b.style.top=pt.y+'px';
  b.setAttribute('aria-label',p.kind==='lumen'?'Collect Lumen preview':p.kind==='rift'||p.kind==='restored'?'Interference preview':p.name+' virtual node');
  b.innerHTML='<i aria-hidden="true"></i>';
  if(p.kind!=='lumen'){const text=document.createElement('span');text.textContent=p.name;b.appendChild(text);}
  b.addEventListener('click',()=>p.kind==='lumen'?collect(p.id):choose(p.id));
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
 return (p.name.toUpperCase())+' · '+(near?'CLEAR':'FAINT')+' · '+Math.round(distance)+' m · '+(n>=2?'Awake':n+'/2 resonance');
}
function updateUI(){
 if(!world||!isActive()){info.hidden=actions.hidden=true;return;}
 const p=current();
 info.hidden=actions.hidden=!p;
 if(p){
  info.textContent=infoText();
  const done=chosen==='veil'?progress.riftClear:progress.nodes[world.nodes.findIndex(n=>n.id===chosen)]>=2;
  const pending=chosen==='veil'?progress.riftPending:Boolean(progress.pending[world.nodes.findIndex(n=>n.id===chosen)]);
  by('living-spend').disabled=done||pending;
  by('living-decode').disabled=done||pending;
  by('living-spend').textContent='✧ '+(chosen==='veil'?'Stabilize':L.near(position,p,accuracy)?'Attune · 2':'Attune · 3');
  by('living-decode').textContent='◇ Decode';
 }
 pulse.textContent='↻ Pulse '+(progress.cycle+1);
 pulse.disabled=progress.cycle>=L.MAX_CYCLES;
}
function choose(id){
 if(!world)return;
 const valid=id==='veil'||world.nodes.some(n=>n.id===id);
 if(!valid)return;
 chosen=id;
 document.body.classList.add('living-selected');
 updateUI();emit();
}
function close(){
 chosen=null;document.body.classList.remove('living-selected');updateUI();cancel();
}
function positive(){if(navigator.vibrate)try{navigator.vibrate([20,35,40]);}catch{};if(typeof tone==='function'&&typeof state!=='undefined'&&state.sound)tone([0,2,4]);}
function apply(method){
 if(!world||!chosen)return;
 const result=L.contribute(progress,{target:chosen,method,player:position,accuracy,lumen:state.lumen,world});
 if(!result.ok){message(result.reason);return;}
 state.lumen-=result.cost;save();render();updateUI();redraw();emit();positive();message(result.reason);
}
function collect(id){
 if(!world||!position)return;
 const result=L.collect(progress,id,position,accuracy,world);
 if(!result.ok){message(result.reason);return;}
 const gain=award(result.reward,'spark');
 redraw();updateUI();emit();positive();
 message(gain?'✧ Lumen gathered · +'+gain:'Sonde full · signal retained');
}
function nextPulse(){
 if(!world)return;
 const r=L.pulse(progress);
 if(!r.ok){message(r.reason);return;}
 const gain=(r.cleared?award(3,'veil'):0)+(r.opened?award(3,'field'):0);
 if(r.cleared)counters.veils++;
 if(r.opened)counters.fields++;
 if(r.cleared||r.opened)saveCounters();
 redraw();updateUI();emit();positive();
 message(r.reason+(gain?' ✧ +'+gain:'')+(r.opened?' · Fields '+counters.fields:'')+(r.cleared?' · Restorations '+counters.veils:''));
}
function cancel(){clearTimeout(stageTimer);challenge=null;by('living-challenge').hidden=true;}
function startDecode(){
 if(!chosen||!world)return;
 cancel();
 const i=chosen==='veil'?3:world.nodes.findIndex(n=>n.id===chosen);
 const level=chosen==='veil'?progress.rift+1:progress.nodes[i]+1;
 const values=['◆','●','▲','✦'];
 const sequence=Array.from({length:Math.min(5,level+2)},(_,j)=>(i*2+j*3+level+j*j)%4);
 challenge={sequence,next:0,ready:false};
 const dialog=by('living-challenge');dialog.hidden=false;
 by('living-prompt').textContent='Decode · remember '+sequence.length+' symbols';
 by('living-symbols').textContent=sequence.map(n=>values[n]).join(' ');
 by('living-answers').replaceChildren();
 stageTimer=setTimeout(()=>{
  if(!challenge)return;
  challenge.ready=true;by('living-symbols').textContent='? '.repeat(sequence.length);
  for(let i=0;i<4;i++){
   const b=document.createElement('button');b.type='button';b.textContent=values[i];
   b.addEventListener('click',()=>{
    if(!challenge?.ready)return;
    if(i!==challenge.sequence[challenge.next]){
     if(navigator.vibrate)navigator.vibrate(60);
     message('Signal slipped. Try again or spend Lumen.');cancel();return;
    }
    challenge.next++;
    by('living-symbols').textContent='✦ '.repeat(challenge.next)+'· '.repeat(sequence.length-challenge.next);
    if(challenge.next===sequence.length){cancel();apply('decode');}
   });
   by('living-answers').appendChild(b);
  }
 },1300+sequence.length*150);
}
by('living-spend').addEventListener('click',()=>apply('lumen'));
by('living-decode').addEventListener('click',startDecode);
by('living-cancel').addEventListener('click',cancel);
by('living-close').addEventListener('click',close);
pulse.addEventListener('click',nextPulse);
window.addEventListener('majakka:livestart',resetWorld);
window.addEventListener('majakka:livestop',()=>{close();resetWorld();document.body.classList.remove('living-selected');});
window.addEventListener('majakka:livefix',event=>{
 if(!isActive())return;
 const d=event.detail;if(!d||![d.lat,d.lng,d.accuracy].every(Number.isFinite))return;
 position={lat:d.lat,lng:d.lng};accuracy=d.accuracy;
 if(!world&&accuracy<=65)create(position);
 if(world){redraw();updateUI();emit();}
});
window.addEventListener('majakka:mapready',redraw);
window.addEventListener('resize',redraw);
window.addEventListener('majakka:livingselect',e=>choose(e.detail?.id));
window.addEventListener('majakka:livingcollect',e=>collect(e.detail?.id));
window.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
globalThis.MajakkaLiving={
 snapshot:()=>world&&isActive()?{projection:L.projection(progress,world),position:position?{...position}:null}:null,
 award,
 select:choose,collect,restore:()=>{close();resetWorld();}
};
})();
