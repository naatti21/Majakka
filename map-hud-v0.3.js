/* MAJAKKA v0.3 — narrow perimeter HUD + local-only interference experiment. */
(() => {
 'use strict';
 const el=id=>document.getElementById(id), R=globalThis.MajakkaRift;
 if(!R||!el('world-overlay')||!el('world-markers'))return;
 const KEY='majakka-rift-local-v1';
 let rift=R.blank(),mode='',challenge=null,challengeTimer=0,decodedByCycle={};
 try{decodedByCycle=JSON.parse(localStorage.getItem(KEY+'-decoded')||'{}')||{};}catch{}
 try{rift=R.sanitize(JSON.parse(localStorage.getItem(KEY)||'null'));}catch{}
 const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(rift));}catch{}};
 const hud=(tag,id,parent=document.body)=>{const x=document.createElement(tag);x.id=id;parent.appendChild(x);return x;};
 const info=hud('aside','hud-node-info'),actions=hud('div','hud-node-actions'),rinfo=hud('aside','hud-rift-info'),ractions=hud('div','hud-rift-actions');
 info.hidden=actions.hidden=rinfo.hidden=ractions.hidden=true;
 const walk=el('demo-walk'),attune=el('attune'),listen=el('listen');
 if(!walk||!attune||!listen)return;
 const skillNode=document.createElement('button');skillNode.textContent='Decode · free';skillNode.type='button';skillNode.id='skill-node';
 [attune,skillNode,listen,walk].forEach(b=>actions.appendChild(b));
 const spend=document.createElement('button');spend.id='rift-spend';spend.textContent='Stabilize · ✧✧';spend.type='button';
 const skillRift=document.createElement('button');skillRift.id='rift-decode';skillRift.textContent='Decode · free';skillRift.type='button';
 [spend,skillRift].forEach(b=>ractions.appendChild(b));
 const rhythm=hud('section','hud-rhythm');rhythm.hidden=true;rhythm.setAttribute('role','dialog');rhythm.setAttribute('aria-label','Decode a signal');
 rhythm.innerHTML='<h3>DECODE THE SIGNAL</h3><p id="hud-rhythm-hint">Watch the short sequence, then repeat it.</p><div id="hud-rhythm-display" aria-live="polite"></div><div id="hud-rhythm-buttons"></div><button type="button" id="hud-rhythm-dismiss">Cancel · spend Lumen instead</button>';
 const closer=()=>{clearTimeout(challengeTimer);challenge=null;rhythm.hidden=true;};
 el('hud-rhythm-dismiss').addEventListener('click',closer);
 const riftLayer=hud('div','hud-rift-markers',el('world-overlay'));
 const riftButton=document.createElement('button');riftButton.className='rift-node';riftButton.type='button';riftButton.setAttribute('aria-label','Select local interference zone');riftButton.innerHTML='<span>Interference</span>';riftLayer.appendChild(riftButton);
 const anomaly={lat:61.4966,lng:23.7646};
 function positionRift(){
  if(typeof point!=='function')return;
  const p=point(anomaly);riftButton.style.left=p.x+'px';riftButton.style.top=p.y+'px';
  const size=rift.cleared?72:72+Math.min(25,state.cycle*2);riftButton.style.width=size+'px';riftButton.style.height=size+'px';
  riftButton.classList.toggle('restored',rift.cleared);
  riftButton.querySelector('span').textContent=rift.cleared?'Restored field':'Interference';
  for(const marker of document.querySelectorAll('.node-marker')){
   const label=marker.getAttribute('aria-label')||'';
   const data=C.NODES.find(n=>label.includes(n.name));
   marker.classList.toggle('corrupted',!rift.cleared&&Boolean(data)&&C.distanceMeters(data,anomaly)<(390+Math.min(130,state.cycle*9)));
  }
 }
 let busy=false;
 new MutationObserver(()=>{if(busy)return;busy=true;requestAnimationFrame(()=>{busy=false;positionRift();});}).observe(el('world-markers'),{childList:true});
 function nodeSummary(){
  if(typeof selected!=='function')return;
  const n=selected(),q=C.proximity(C.distanceMeters(state.player,n));
  const title=document.createElement('strong');title.textContent=n.name;
  const summary=document.createElement('small');summary.textContent=(q==='near'?'CLEAR · Nearby':q==='faint'?'WEAK · Within reach':'FAINT · Distant echo')+' · '+((state.world[n.id]||0)>=C.CHARGE_TARGET?'Awakened':'Quiet');
  info.replaceChildren(title,summary);
  skillNode.disabled=!(q==='near'||state.discovered.includes(n.id))||decodedByCycle[n.id]===state.cycle;
 }
 function riftSummary(){
  const progress=rift.committed+(rift.pending?1:0);
  const title=document.createElement('strong');title.textContent=rift.cleared?'Restored resonance':'Interference zone';
  const summary=document.createElement('small');summary.textContent=rift.cleared?'The light holds. No more farming.':'Stability '+('◈'.repeat(progress))+('◇'.repeat(Math.max(0,R.TARGET-progress)))+' · '+(rift.pending?'Pulse pending':'Clear the distortion');
  rinfo.replaceChildren(title,summary);
  spend.disabled=rift.cleared||!R.canContribute(rift,state.cycle)||state.lumen<R.COST;
  skillRift.disabled=rift.cleared||!R.canContribute(rift,state.cycle);
 }
 function hideEverywhere(){
  document.body.classList.remove('interference-open');
  info.hidden=actions.hidden=rinfo.hidden=ractions.hidden=true;
  closer();
 }
 function openNode(){
  hideEverywhere();mode='node';document.body.classList.add('node-open');
  info.hidden=actions.hidden=false;nodeSummary();
 }
 function openRift(){
  hideEverywhere();mode='rift';
  document.querySelector('[data-panel="world"]')?.click();
  mode='rift';
  document.body.classList.remove('node-open');
  document.body.classList.add('interference-open');
  rinfo.hidden=ractions.hidden=false;riftSummary();positionRift();
 }
 function refresh(){if(mode==='node')nodeSummary();if(mode==='rift')riftSummary();positionRift();}
 riftButton.addEventListener('click',openRift);
 el('world-markers').addEventListener('click',e=>{if(e.target.closest('.node-marker'))queueMicrotask(openNode);});
 document.querySelector('.map-bottom-nav')?.addEventListener('click',e=>{const b=e.target.closest('[data-panel]');if(!b)return;hideEverywhere();mode='';});
 const pulseMini=document.createElement('button');pulseMini.type='button';pulseMini.id='hud-world-pulse';pulseMini.className='map-button';pulseMini.textContent='↻';pulseMini.title='Advance delayed world pulse (demo)';pulseMini.setAttribute('aria-label','Advance delayed world pulse');document.querySelector('.map-right')?.appendChild(pulseMini);
 pulseMini.addEventListener('click',()=>el('advance-pulse').click());
 el('advance-pulse').addEventListener('click',()=>{
  const result=R.pulse(rift);
  if(result.reward){
   state.lumen=Math.min(C.MAX_LUMEN,state.lumen+result.reward);
   state.journal.unshift('An interference zone was restored. A lasting echo remains.');
   save();render();notify('INTERFERENCE CLEARED · The light returns. ✧ +'+result.reward);
  } else if(result.changed)notify('The distortion eases. Its next phase is quieter.');
  persist();refresh();
 });
 function stabilize(method){
  const result=R.contribute(rift,{cycle:state.cycle,lumen:state.lumen,method});
  if(!result.ok){notify(result.reason);return;}
  state.lumen-=result.cost;save();persist();render();riftSummary();notify(result.reason);
 }
 spend.addEventListener('click',()=>stabilize('lumen'));
 const symbols=['◆','✦','◈'];
 function startDecode(target){
  if(target==='rift'&&!R.canContribute(rift,state.cycle))return;
  if(target==='node'){
   const n=selected();if(decodedByCycle[n.id]===state.cycle){notify('Signal already decoded this cycle. Let it settle.');return;}
   const q=C.proximity(C.distanceMeters(state.player,n));
   if(q!=='near'&&!state.discovered.includes(n.id)){notify('Visit this node before decoding its signal.');return;}
  }
  clearTimeout(challengeTimer);
  const level=target==='rift'?Math.min(3,1+rift.committed):Math.min(3,1+Math.floor((state.world[selected().id]||0)/2));
  const count=2+level,seed=target==='rift'?rift.committed+3:selected().note+state.cycle+2;
  const sequence=Array.from({length:count},(_,i)=>(seed+i*2+Math.floor(i/2))%3);
  challenge={target,sequence,index:0,ready:false};rhythm.hidden=false;
  el('hud-rhythm-hint').textContent='Level '+level+' · Remember '+count+' symbols. No penalty for a mistake.';
  el('hud-rhythm-display').textContent=sequence.map(i=>symbols[i]).join(' ');
  el('hud-rhythm-buttons').replaceChildren();
  challengeTimer=setTimeout(()=>{
   if(!challenge)return;challenge.ready=true;
   el('hud-rhythm-display').textContent='?'.repeat(count);
   symbols.forEach((symbol,value)=>{
    const b=document.createElement('button');b.type='button';b.textContent=symbol;
    b.setAttribute('aria-label','Choose '+symbol);b.addEventListener('click',()=>choose(value));el('hud-rhythm-buttons').appendChild(b);
   });
  },1700+count*220);
 }
 function choose(value){
  if(!challenge?.ready)return;
  const current=challenge;
  if(value!==current.sequence[current.index]){
   el('hud-rhythm-hint').textContent='Signal slipped. Retry or spend Lumen instead.';
   el('hud-rhythm-display').textContent='✕';challengeTimer=setTimeout(closer,1100);return;
  }
  current.index++;
  el('hud-rhythm-display').textContent='✦'.repeat(current.index)+'·'.repeat(current.sequence.length-current.index);
  if(current.index===current.sequence.length){
   const target=current.target;closer();
   if(target==='rift')stabilize('skill');
   else{
    const n=selected(),before=state.lumen;state.lumen=Math.min(C.MAX_LUMEN,state.lumen+C.ATTUNE_COST);
    const result=C.attune(state,n.id);state.lumen=before;
    if(result.ok){decodedByCycle[n.id]=state.cycle;try{localStorage.setItem(KEY+'-decoded',JSON.stringify(decodedByCycle));}catch{}save();render();nodeSummary();notify('Signal decoded. A free pulse joins the next world cycle.');}
    else notify(result.reason);
   }
  }
 }
 skillNode.addEventListener('click',()=>startDecode('node'));
 skillRift.addEventListener('click',()=>startDecode('rift'));
 [attune,walk,listen,el('quiet-collect')].forEach(x=>x?.addEventListener('click',()=>queueMicrotask(refresh)));
 el('reset')?.addEventListener('click',()=>{rift=R.blank();decodedByCycle={};persist();try{localStorage.removeItem(KEY+'-decoded');}catch{}hideEverywhere();mode='';positionRift();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){hideEverywhere();mode='';}});
 positionRift();
})();