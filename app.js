/* MAJAKKA v0.1 — synthetic local world only. No GPS, networking, accounts or telemetry. */
'use strict';

const AREAS = {
  harbor: {
    name: 'Harbor District', caption: 'A city learning to breathe again',
    nodes: [
      ['h1','The Old Pier',16,24,.35,2], ['h2','Glasshouse',35,16,.66,1],
      ['h3','North Signal',62,16,.49,3], ['h4','Lantern Steps',85,28,.74,2],
      ['h5','Rain Garden',19,59,.38,0], ['h6','Silent Arcade',35,78,.54,4],
      ['h7','Drift Station',70,62,.58,5], ['h8','Tide Observatory',84,79,.3,1]
    ],
    links: [[0,1],[1,2],[2,3],[0,4],[4,5],[5,6],[6,7],[3,6],[1,6]]
  },
  village: {
    name:'Stillwater', caption:'A few lights can hold an entire song',
    nodes:[
      ['v1','Market Square',20,23,.65,1],['v2','Stone Bridge',47,18,.31,0],
      ['v3','Willow Bend',78,29,.52,2],['v4','Old Mill',14,69,.45,4],
      ['v5','Bell Garden',36,80,.7,3],['v6','Lower Fields',73,67,.35,5],
      ['v7','North Crossing',90,79,.53,1]
    ],
    links:[[0,1],[1,2],[0,3],[3,4],[4,5],[5,6],[2,5]]
  },
  wild: {
    name:'North Pines', caption:'Even the quietest place has a voice',
    nodes:[
      ['w1','Moss Ridge',20,22,.41,0],['w2','Rainpool',48,14,.57,2],
      ['w3','Hidden Shore',80,25,.3,1],['w4','Fallen Fir',15,70,.64,4],
      ['w5','Wind Gap',35,78,.35,3],['w6','Moonstone',71,72,.5,5],
      ['w7','Far Beacon',88,84,.32,1]
    ],
    links:[[0,1],[1,2],[0,3],[3,4],[4,5],[5,6],[2,5]]
  }
};
const GLYPHS=['◇','◉','✦'];
const ECHO_NOTES=[262,330,392];
const NODE_DESCRIPTIONS=[
  'A small rhythm lingers beneath the interference.',
  'An unfinished signal rises from the stillness.',
  'Something here is almost in harmony.',
  'An echo waits to be understood.',
  'A quiet pattern travels through the noise.',
  'The place remembers more than it reveals.'
];

let state={area:'harbor',selected:'h1',cycle:0,solved:{},anchors:{},journal:[],sound:false};
let db=null;
let soundContext=null;
let puzzle=null;
let playbackToken=0;
let toastTimer=null;
let memoryInput=[];
let phaseOffset=0;

const $=id=>document.getElementById(id);
const nodeById=id=>Object.values(AREAS).flatMap(a=>a.nodes).find(n=>n[0]===id);
const inAreaNode=id=>AREAS[state.area].nodes.find(n=>n[0]===id);
const maxSolves=()=>Object.keys(state.solved).filter(id=>state.solved[id]).length;
const cap=(v,min,max)=>Math.max(min,Math.min(max,v));
const pad=n=>String(n).padStart(2,'0');
const stateDefault=()=>({area:'harbor',selected:'h1',cycle:0,solved:{},anchors:{},journal:[],sound:false});

function openStore(){
  return new Promise((resolve,reject)=>{
    if(!('indexedDB' in window)){reject(new Error('IndexedDB unavailable'));return;}
    const req=indexedDB.open('majakka-local',1);
    req.onupgradeneeded=()=>{const database=req.result;if(!database.objectStoreNames.contains('records'))database.createObjectStore('records');};
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}
function loadSaved(){
  return new Promise((resolve,reject)=>{
    if(!db){resolve(null);return;}
    const req=db.transaction('records','readonly').objectStore('records').get('game');
    req.onsuccess=()=>resolve(req.result||null);
    req.onerror=()=>reject(req.error);
  });
}
function save(){
  if(!db)return;
  try{
    const t=db.transaction('records','readwrite');
    t.objectStore('records').put(structuredClone(state),'game');
    t.onerror=()=>toast('Local storage error — progress may not persist.');
  }catch{toast('Could not save your local progress.');}
}
function sanitize(input){
  const fresh=stateDefault();
  if(!input||typeof input!=='object')return fresh;
  if(AREAS[input.area])fresh.area=input.area;
  if(inKnownNode(input.selected))fresh.selected=input.selected;
  fresh.cycle=cap(Number.isFinite(input.cycle)?Math.floor(input.cycle):0,0,1000);
  fresh.solved={};
  if(input.solved&&typeof input.solved==='object'){
    Object.keys(input.solved).forEach(id=>{if(inKnownNode(id)&&input.solved[id]===true)fresh.solved[id]=true;});
  }
  fresh.anchors={};
  if(input.anchors&&typeof input.anchors==='object'){
    Object.keys(input.anchors).forEach(id=>{if(inKnownNode(id)&&input.anchors[id]===true)fresh.anchors[id]=true;});
  }
  fresh.journal=Array.isArray(input.journal)?input.journal.filter(x=>x&&typeof x.text==='string'&&typeof x.type==='string').slice(0,60).map(x=>({text:x.text.slice(0,120),type:x.type.slice(0,20)})):[];
  fresh.sound=input.sound===true;
  if(!AREAS[fresh.area].nodes.some(n=>n[0]===fresh.selected))fresh.selected=AREAS[fresh.area].nodes[0][0];
  return fresh;
}
function inKnownNode(id){return Object.values(AREAS).some(a=>a.nodes.some(n=>n[0]===id));}
function getStrength(node){
  const base=node[4];const idx=node[5];
  // Offline animation of delayed world changes; never derived from another player's real activity.
  const drift=Math.sin(state.cycle*.73+idx*1.55)*.21+Math.cos(state.cycle*.37+idx*.67)*.09;
  const personal=state.solved[node[0]]?.32:0;
  return cap(base+drift+personal,.16,1.22);
}
function getNodeLevel(node){const s=getStrength(node);return state.anchors[node[0]]||s>=1.05?'ANCHOR':s>=.73?'RADIANT':s>=.44?'AWAKENING':'DORMANT';}
function nodeColor(node){
  if(state.anchors[node[0]]||state.solved[node[0]])return ['#f1c782','rgba(241,199,130,.5)'];
  if(getStrength(node)>=.73)return ['#e7bf80','rgba(231,191,128,.38)'];
  if(getStrength(node)>=.44)return ['#71e5df','rgba(113,229,223,.42)'];
  return ['#85a1b4','rgba(133,161,180,.3)'];
}
function linePath(a,b){
  const x1=a[2]*10,y1=a[3]*7.6,x2=b[2]*10,y2=b[3]*7.6;
  const cx=(x1+x2)/2,cy=(y1+y2)/2-18;
  return `M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`;
}
function renderMap(){
  const area=AREAS[state.area];$('map-region').textContent=area.name;
  $('map-node-count').textContent=pad(area.nodes.length);
  $('network-lines').replaceChildren();
  const svg=$('network-lines');
  const defs=document.createElementNS('http://www.w3.org/2000/svg','defs');
  const gradient=document.createElementNS('http://www.w3.org/2000/svg','linearGradient');
  gradient.setAttribute('id','threadGlow');gradient.setAttribute('x1','0%');gradient.setAttribute('x2','100%');
  [['0%','#54d5d1'],['100%','#efbf74']].forEach(([offset,color])=>{
    const s=document.createElementNS('http://www.w3.org/2000/svg','stop');s.setAttribute('offset',offset);s.setAttribute('stop-color',color);gradient.appendChild(s);
  });defs.appendChild(gradient);svg.appendChild(defs);
  for(const [i,j] of area.links){
    const a=area.nodes[i],b=area.nodes[j];const strength=Math.min(getStrength(a),getStrength(b));
    const active=strength>.58;
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d',linePath(a,b));path.setAttribute('class',active?'thread-lit':'thread-faint');
    if(active)path.style.opacity=String(cap((strength-.46)*2,.23,.85));
    svg.appendChild(path);
  }
  $('nodes-layer').replaceChildren();
  for(const node of area.nodes){
    const [color,haze]=nodeColor(node);
    const button=document.createElement('button');
    button.type='button';button.className='public-node';
    button.classList.toggle('selected',state.selected===node[0]);
    button.classList.toggle('restored',Boolean(state.solved[node[0]]));
    button.style.left=node[2]+'%';button.style.top=node[3]+'%';
    button.style.setProperty('--node-color',color);button.style.setProperty('--node-haze',haze);
    button.setAttribute('aria-label',node[1]+'. '+getNodeLevel(node)+(state.solved[node[0]]?', echo restored':''));
    button.setAttribute('aria-pressed',state.selected===node[0]?'true':'false');
    button.innerHTML='<span class="outer" aria-hidden="true"></span><span class="ring" aria-hidden="true"></span><span class="inner" aria-hidden="true"></span>';
    button.addEventListener('click',()=>selectNode(node[0]));
    $('nodes-layer').appendChild(button);
  }
  document.querySelectorAll('[data-region]').forEach(b=>{
    const selected=b.dataset.region===state.area;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));
  });
}
function renderSelected(){
  const node=inAreaNode(state.selected)||AREAS[state.area].nodes[0];
  $('node-title').textContent=node[1];$('node-state').textContent=getNodeLevel(node);
  const done=Boolean(state.solved[node[0]]);
  $('node-description').textContent=done?'This echo has become part of your private constellation. You can revisit it at any time.':NODE_DESCRIPTIONS[node[5]%NODE_DESCRIPTIONS.length];
  $('node-orb').classList.toggle('gold',done||getStrength(node)>.73);
  $('listen-button').innerHTML=(done?'Revisit this echo':'Interpret this echo')+' <span aria-hidden="true">↗</span>';
  $('node-footnote').textContent=done?'Saved to your journal':'Take as long as you need';
}
function renderJournal(){
  const list=$('journal-list');list.replaceChildren();
  if(!state.journal.length){const li=document.createElement('li');li.textContent='Your first echo is waiting.';list.appendChild(li);return;}
  for(const entry of state.journal.slice(0,4)){
    const li=document.createElement('li');li.textContent=entry.text;list.appendChild(li);
  }
}
function render(){
  $('echo-count').textContent=pad(maxSolves());
  $('pulse-count').innerHTML=pad(state.cycle+1)+' <small>/ simulated</small>';
  $('sound-toggle').setAttribute('aria-label',state.sound?'Disable sound':'Enable sound');
  $('sound-toggle').setAttribute('aria-pressed',String(state.sound));
  $('sound-toggle').title=state.sound?'Sound on':'Sound off';
  document.body.classList.toggle('sound-enabled',state.sound);
  renderMap();renderSelected();renderJournal();
  $('prompt-card').querySelector('h2').textContent=maxSolves()?'The world remembers your echoes.':'The nearest signal is waiting.';
}
function selectNode(id){if(!inAreaNode(id))return;state.selected=id;save();renderMap();renderSelected();}
function selectRegion(region){if(!AREAS[region])return;state.area=region;state.selected=AREAS[region].nodes[0][0];save();render();}
function journalEntry(text,type){state.journal.unshift({text,type});state.journal=state.journal.slice(0,60);}
function toast(message){const t=$('toast');t.textContent=message;t.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('visible'),3300);}
function anchorQualifiedNodes(){for(const node of Object.values(AREAS).flatMap(a=>a.nodes)){if(getStrength(node)>=1.05)state.anchors[node[0]]=true;}}
function advancePulse(){state.cycle=cap(state.cycle+1,0,1000);anchorQualifiedNodes();journalEntry('Pulse '+pad(state.cycle+1)+' passed quietly through the world.','pulse');save();render();toast('A delayed wave of resonance has passed. Some signals have changed.');}
function resetProgress(){
  if(!confirm('Erase this device’s Majakka prototype progress? This cannot be undone.'))return;
  playbackToken++;state=stateDefault();save();render();toast('The local prototype has been reset.');
}
function playTone(index=0,short=false){
  if(!state.sound)return;
  try{
    const AudioCtx=window.AudioContext||window.webkitAudioContext;
    if(!AudioCtx)return;
    if(!soundContext)soundContext=new AudioCtx();
    if(soundContext.state==='suspended')soundContext.resume();
    const osc=soundContext.createOscillator(),gain=soundContext.createGain();
    osc.type='sine';osc.frequency.value=ECHO_NOTES[index%ECHO_NOTES.length];
    const now=soundContext.currentTime;gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.07,now+.03);
    gain.gain.exponentialRampToValueAtTime(.0001,now+(short?.15:.38));
    osc.connect(gain);gain.connect(soundContext.destination);osc.start(now);osc.stop(now+(short?.17:.4));
  }catch{/* Sound is optional. Visual mode remains fully playable. */}
}
function openChallenge(){
  const node=inAreaNode(state.selected);if(!node)return;
  playbackToken++;puzzle={node,type:node[5]%3,done:Boolean(state.solved[node[0]])};
  memoryInput=[];phaseOffset=0;
  $('challenge-feedback').textContent='';
  $('dialog-title').textContent=node[1];
  $('signal-dialog').showModal();renderChallenge();
}
function closeChallenge(){playbackToken++;if($('signal-dialog').open)$('signal-dialog').close();puzzle=null;}
function makeButton(text,cls,handler,aria){
  const b=document.createElement('button');b.type='button';b.className=cls;b.textContent=text;if(aria)b.setAttribute('aria-label',aria);b.addEventListener('click',handler);return b;
}
function appendCenter(container,cls,...children){
  const el=document.createElement('div');el.className=cls;children.forEach(child=>el.appendChild(child));container.appendChild(el);return el;
}
function renderChallenge(){
  if(!puzzle)return;
  const host=$('challenge-content');host.replaceChildren();
  if(puzzle.done){
    $('dialog-instruction').textContent='This light has already joined your private constellation.';
    const mark=document.createElement('div');mark.className='success-mark';mark.textContent='✧';host.appendChild(mark);
    const p=document.createElement('p');p.className='success-copy';p.textContent='You can return to this echo whenever you like. Your progress never expires.';host.appendChild(p);
    host.appendChild(makeButton('Return to the world','primary-button dialog-action',closeChallenge));return;
  }
  switch(puzzle.type){case 0:renderMemory(host);break;case 1:renderLogic(host);break;case 2:renderPhase(host);break;}
}
function memorySequence(){const id=puzzle.node[0];let seed=Array.from(id).reduce((n,c)=>n*17+c.charCodeAt(0),7);let out=[];for(let i=0;i<4;i++){seed=(seed*1664525+1013904223)>>>0;out.push(seed%3);}return out;}
function renderMemory(host){
  $('dialog-instruction').textContent='Watch the four pulses. Repeat them in the same order.';
  const lights=appendCenter(host,'sequence-lights');for(let i=0;i<4;i++){const g=document.createElement('div');g.className='glyph';g.dataset.index=String(i);g.textContent='·';lights.appendChild(g);}
  appendCenter(host,'challenge-controls',makeButton('Reveal the echo','tiny-button',replayMemory));
  const hint=document.createElement('p');hint.className='challenge-help';hint.textContent='Then tap the glyphs you remember. No timer.';host.appendChild(hint);
  const controls=document.createElement('div');controls.className='challenge-controls';
  GLYPHS.forEach((g,i)=>controls.appendChild(makeButton(g,'choice',()=>memoryTap(i),'Glyph '+(i+1))));host.appendChild(controls);
  const progress=document.createElement('p');progress.className='phase-counter';progress.id='memory-count';progress.textContent='0 / 4 pulses recalled';host.appendChild(progress);
}
function replayMemory(){
  if(!puzzle||puzzle.type!==0||puzzle.done)return;
  const token=++playbackToken;memoryInput=[];$('memory-count').textContent='Listen to the echo…';
  const controls=document.querySelectorAll('#challenge-content .choice');controls.forEach(c=>c.disabled=true);
  const pattern=memorySequence();const lightNodes=Array.from(document.querySelectorAll('.sequence-lights .glyph'));
  lightNodes.forEach(n=>{n.textContent='·';n.classList.remove('playing');});
  pattern.forEach((glyph,i)=>setTimeout(()=>{
    if(token!==playbackToken||!puzzle)return;
    lightNodes.forEach(n=>n.classList.remove('playing'));
    lightNodes[i].textContent=GLYPHS[glyph];lightNodes[i].classList.add('playing');playTone(glyph);
  },i*660+300));
  setTimeout(()=>{
    if(token!==playbackToken||!puzzle)return;
    lightNodes.forEach(n=>{n.classList.remove('playing');n.textContent='·';});
    controls.forEach(c=>c.disabled=false);$('memory-count').textContent='0 / 4 pulses recalled';
  },pattern.length*660+330);
}
function memoryTap(glyph){
  if(!puzzle||puzzle.done)return;
  const controls=document.querySelectorAll('#challenge-content .choice');if(controls[0]?.disabled)return;
  playTone(glyph,true);const pattern=memorySequence();memoryInput.push(glyph);
  $('memory-count').textContent=memoryInput.length+' / 4 pulses recalled';
  if(memoryInput[memoryInput.length-1]!==pattern[memoryInput.length-1]){
    $('challenge-feedback').textContent='The signal slipped away. Listen again — nothing is lost.';
    memoryInput=[];$('memory-count').textContent='0 / 4 pulses recalled';return;
  }
  $('challenge-feedback').textContent='';
  if(memoryInput.length===pattern.length)completeChallenge();
}
function renderLogic(host){
  $('dialog-instruction').textContent='There is order beneath the interference. Which glyph comes next?';
  const variants=[{given:[0,1,0,1,0],answer:1},{given:[0,1,2,0,1],answer:2},{given:[1,1,2,1,1],answer:2}];
  const variant=variants[puzzle.node[0].charCodeAt(1)%variants.length];puzzle.answer=variant.answer;
  const track=appendCenter(host,'pattern-track');variant.given.forEach(g=>{const span=document.createElement('div');span.className='glyph';span.textContent=GLYPHS[g];track.appendChild(span);});
  const missing=document.createElement('div');missing.className='glyph missing';missing.textContent='?';track.appendChild(missing);
  const help=document.createElement('p');help.className='challenge-help';help.textContent='Choose the symbol that completes the repeating sequence.';host.appendChild(help);
  const controls=document.createElement('div');controls.className='challenge-controls';
  GLYPHS.forEach((g,i)=>controls.appendChild(makeButton(g,'choice',()=>{
    playTone(i,true);if(i===puzzle.answer)completeChallenge();else $('challenge-feedback').textContent='Not quite. Look for the repeating shape of the sequence.';
  },'Choose '+g)));host.appendChild(controls);
}
function renderPhase(host){
  $('dialog-instruction').textContent='Turn the outer signal until its light aligns with the fixed star.';
  puzzle.target=2+(puzzle.node[0].charCodeAt(1)%5);
  const orbit=document.createElement('div');orbit.className='phase-visual';orbit.innerHTML='<span class="phase-target-orbit" id="phase-target-orbit" aria-hidden="true"><span class="phase-target">✦</span></span><span class="phase-pointer" id="phase-pointer" aria-hidden="true"></span><span class="phase-center" aria-hidden="true">◎</span>';
  orbit.querySelector('#phase-target-orbit').style.transform=`rotate(${puzzle.target*45}deg)`;host.appendChild(orbit);
  const controls=document.createElement('div');controls.className='challenge-controls';
  controls.appendChild(makeButton('↶','choice',()=>rotatePhase(-1),'Rotate counterclockwise'));
  controls.appendChild(makeButton('↷','choice',()=>rotatePhase(1),'Rotate clockwise'));
  host.appendChild(controls);
  const p=document.createElement('p');p.className='phase-counter';p.id='phase-count';host.appendChild(p);updatePhase();
}
function updatePhase(){
  if(!$('phase-pointer'))return;
  $('phase-pointer').style.setProperty('--phase-deg',`${phaseOffset*45}deg`);
  $('phase-count').textContent='PHASE '+pad(phaseOffset+1)+' / 08';
}
function rotatePhase(direction){
  if(!puzzle||puzzle.done)return;
  phaseOffset=(phaseOffset+direction+8)%8;updatePhase();playTone(phaseOffset%3,true);
  if(phaseOffset===puzzle.target){completeChallenge();}
}
function completeChallenge(){
  if(!puzzle||puzzle.done)return;
  const node=puzzle.node;
  if(!state.solved[node[0]]){
    state.solved[node[0]]=true;
    journalEntry('Restored '+node[1]+' — '+AREAS[state.area].name+'.','echo');
  }
  puzzle.done=true;playbackToken++;anchorQualifiedNodes();save();render();
  $('challenge-feedback').textContent='The interference clears. A new echo stays with you.';
  renderChallenge();
  // Retain the successful feedback and never convert completion into an obligatory daily task.
  $('challenge-feedback').textContent='Echo restored. Your contribution is saved locally.';
  toast(node[1]+' has found its voice.');
}

function bind(){
  document.querySelectorAll('[data-region]').forEach(btn=>btn.addEventListener('click',()=>selectRegion(btn.dataset.region)));
  $('listen-button').addEventListener('click',openChallenge);
  $('close-dialog').addEventListener('click',closeChallenge);
  $('signal-dialog').addEventListener('cancel',()=>{playbackToken++;puzzle=null;});
  $('advance-pulse').addEventListener('click',advancePulse);
  $('reset-progress').addEventListener('click',resetProgress);
  $('sound-toggle').addEventListener('click',()=>{state.sound=!state.sound;save();render();if(state.sound)playTone(1,true);});
  $('jump-to-node').addEventListener('click',()=>{
    const node=inAreaNode(state.selected);if(node){const target=AREAS[state.area].nodes.find(n=>!state.solved[n[0]])||node;selectNode(target[0]);}
    $('node-panel').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});
  });
  document.querySelectorAll('.mobile-nav a').forEach(anchor=>anchor.addEventListener('click',()=>{
    document.querySelectorAll('.mobile-nav a').forEach(x=>x.classList.toggle('nav-active',x===anchor));
  }));
}
async function init(){
  try{db=await openStore();state=sanitize(await loadSaved());}
  catch{state=stateDefault();setTimeout(()=>toast('Private browsing or storage unavailable. Progress may not persist.'),900);}
  bind();render();
  if('serviceWorker' in navigator&&location.protocol!=='file:'){
    window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{/* Offline is a progressive enhancement. */}));
  }
}
init();
