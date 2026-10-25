/* MAJAKKA v0.2 — Tampere-based First Light demonstration, local only. */
'use strict';
const C=globalThis.MajakkaCore;
const $=id=>document.getElementById(id);
const nodes=C.NODES;
let state=C.blank(),db=null,map=null,mapReady=false,audioContext=null,toastTimer=0;
let mapEngineLoading=false,mapEngineFallbackUsed=false,mapStyleTimer=null;
const mapStyleCandidates=['https://tiles.openfreemap.org/styles/fiord','https://tiles.openfreemap.org/styles/liberty'];
function showMapStatus(message,retry=false){const status=$('map-load-status');if(!status)return;status.replaceChildren(document.createTextNode(message));status.hidden=false;if(retry){const btn=document.createElement('button');btn.type='button';btn.textContent='Retry map';btn.addEventListener('click',()=>{mapEngineFallbackUsed=false;startMap();});status.appendChild(btn);}}
function clearMapStatus(){const status=$('map-load-status');if(status)status.hidden=true;}
const fmt=n=>String(n).padStart(2,'0');
const lookup=id=>nodes.find(n=>n.id===id);
const selected=()=>lookup(state.selected)||nodes[0];

function openStore(){return new Promise((resolve,reject)=>{if(!indexedDB){reject(new Error('IndexedDB unavailable'));return;}const r=indexedDB.open('majakka-local',1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('records'))r.result.createObjectStore('records');};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
function readStore(){return new Promise((resolve,reject)=>{if(!db)return resolve(null);const r=db.transaction('records','readonly').objectStore('records').get('firstLight');r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error);});}
function save(){try{if(db)db.transaction('records','readwrite').objectStore('records').put(state,'firstLight');else localStorage.setItem('majakka-first-light',JSON.stringify(state));}catch(e){console.warn('Save failed',e);feedback('Local storage unavailable — this session may not be saved.');}}
async function restore(){try{db=await openStore();state=C.sanitize(await readStore());}catch(e){console.warn('IndexedDB fallback',e);try{state=C.sanitize(JSON.parse(localStorage.getItem('majakka-first-light')));}catch{state=C.blank();}}}
function notify(message){const el=$('toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),3600);}
function feedback(message){$('signal-feedback').textContent=message;}
function fallbackProject(coord){
 const el=$('map-viewport'),w=el.clientWidth,h=el.clientHeight;
 const z=14.5,size=256*2**z,ctr={lng:23.7623,lat:61.4984};
 const merc=({lng,lat})=>({x:(lng+180)/360*size,y:(1-Math.asinh(Math.tan(lat*Math.PI/180))/Math.PI)/2*size});
 const p=merc(coord),c=merc(ctr);return {x:w/2+(p.x-c.x),y:h/2+(p.y-c.y)};
}
function point(coord){if(map&&mapReady){const p=map.project([coord.lng,coord.lat]);return {x:p.x,y:p.y};}return fallbackProject(coord);}
function svgEl(name,attrs){const el=document.createElementNS('http://www.w3.org/2000/svg',name);for(const [key,v] of Object.entries(attrs))el.setAttribute(key,String(v));return el;}
function drawWorld(){
 const viewport=$('map-viewport'),w=viewport.clientWidth,h=viewport.clientHeight,layer=$('field-layer');
 layer.setAttribute('viewBox',`0 0 ${w} ${h}`);layer.replaceChildren();
 const loc=Object.fromEntries(nodes.map(n=>[n.id,point(n)]));
 if(state.field){const poly=svgEl('polygon',{points:nodes.map(n=>`${loc[n.id].x},${loc[n.id].y}`).join(' '),fill:'rgba(220,163,80,.20)',stroke:'rgba(244,205,135,.75)','stroke-width':2.2});layer.appendChild(poly);
  const a=nodes.map(n=>loc[n.id]);const cx=a.reduce((sum,p)=>sum+p.x,0)/3,cy=a.reduce((sum,p)=>sum+p.y,0)/3;
  const label=svgEl('text',{x:cx,y:cy,fill:'#f4d29a','text-anchor':'middle','font-size':'10','font-weight':'700','letter-spacing':'2'});label.textContent='HARMONY';layer.appendChild(label);
 }
 for(const [a,b] of C.edges(state)){
  const p=loc[a],q=loc[b];layer.appendChild(svgEl('line',{x1:p.x,y1:p.y,x2:q.x,y2:q.y,stroke:'#f0c783','stroke-width':3,opacity:.9}));
 }
 const markers=$('world-markers');markers.replaceChildren();
 for(const n of nodes){
  const p=loc[n.id],lit=(state.world[n.id]||0)>=C.CHARGE_TARGET;
  const btn=document.createElement('button');btn.type='button';btn.className='node-marker'+(lit?' awake':'')+(state.selected===n.id?' selected':'');btn.style.left=p.x+'px';btn.style.top=p.y+'px';
  btn.setAttribute('aria-label',`Select ${n.name}, ${n.place}`);btn.setAttribute('aria-pressed',String(state.selected===n.id));
  btn.innerHTML='<span class="halo"></span><span class="wisp w1"></span><span class="wisp w2"></span><span class="wisp w3"></span><span class="center"></span>';
  const lbl=document.createElement('span');lbl.className='label';lbl.textContent=n.name;btn.appendChild(lbl);
  btn.addEventListener('click',()=>{state.selected=n.id;save();render();});markers.appendChild(btn);
 }
 const player=point(state.player),dot=document.createElement('div');dot.className='demo-player';dot.style.left=player.x+'px';dot.style.top=player.y+'px';dot.setAttribute('role','img');dot.setAttribute('aria-label','Simulated sonde location');markers.appendChild(dot);
}
function render(){
 const n=selected(),d=C.distanceMeters(state.player,n),dist=C.proximity(d),charge=(state.world[n.id]||0)+(state.pending[n.id]||0),world=(state.world[n.id]||0);
 $('cycle').textContent=fmt(state.cycle+1);$('signal-name').textContent=n.name;$('signal-place').textContent=n.place;
 $('reception-label').textContent=dist==='near'?'CLEAR / NEARBY':dist==='faint'?'WEAK / WITHIN REACH':'DISTANT / FAINT';
 $('sonde-status').textContent=dist==='near'?'Within the signal':dist==='faint'?'Signal at the edge':'Distant echo';
 $('signal-state').textContent=world>=C.CHARGE_TARGET?'AWAKENED':charge>=C.CHARGE_TARGET?'PENDING PULSE':'DORMANT';
 $('reception-bars').querySelectorAll('i').forEach((el,i)=>el.classList.toggle('lit',i<C.bars(state,n.id)));
 $('node-progress-fill').style.width=`${Math.min(100,(world+Math.min(2,state.pending[n.id]||0))/C.CHARGE_TARGET*100)}%`;
 $('node-progress-text').textContent=world>=C.CHARGE_TARGET?'Awake':state.pending[n.id]?'Awaiting pulse':'Quiet';
 $('node-explain').textContent=world>=C.CHARGE_TARGET?'This place has joined the waking network.':state.pending[n.id]?'Your light is waiting for the next delayed world pulse.':dist==='near'?'Your sonde can strengthen this place.':state.discovered.includes(n.id)?'You can send a weaker pulse from afar.':'Visit once to learn this signal; distant listening is free.';
 const near=dist==='near',canAttune=near||state.discovered.includes(n.id);
 $('attune').disabled=!canAttune||state.lumen<C.ATTUNE_COST;
 $('attune').innerHTML=(near?'Send a clear pulse':'Send a distant pulse')+' <span>✧✧</span>';
 $('demo-walk').textContent=near?'Here · visit another light':'Simulate walk to node ↗';$('demo-walk').disabled=near;
 $('lumen-pips').replaceChildren();for(let i=0;i<C.MAX_LUMEN;i++){const pip=document.createElement('i');pip.classList.toggle('lit',i<state.lumen);$('lumen-pips').appendChild(pip);}
 $('lumen-pips').setAttribute('aria-label',`Lumen ${state.lumen} of ${C.MAX_LUMEN}`);
 $('lumen-caption').textContent=state.lumen>=C.MAX_LUMEN?'Your sonde is full.':state.lumen>=C.ATTUNE_COST?'Ready to send a pulse.':'Rest or visit to gather light.';
 $('quiet-collect').disabled=state.quietCycle===state.cycle||state.lumen>=C.MAX_LUMEN;
 const ready=nodes.map(n=>(state.world[n.id]||0)+(state.pending[n.id]||0)>=C.CHARGE_TARGET);
 $('field-steps').querySelectorAll('span').forEach((el,i)=>el.classList.toggle('ready',ready[i]));
 $('field-label').textContent=state.field?'AWAKENED':ready.every(Boolean)?'PULSE READY':'GATHERING';
 $('field-card').classList.toggle('harmonic',state.field);
 $('field-description').textContent=state.field?'A new chord has taken shape. The region remembers your light.':ready.every(Boolean)?'All three signals are aligned. The next delayed pulse may reveal a field.':'Attune three places and advance the delayed pulse. No live multiplayer is involved.';
 const journal=$('journal-list');journal.replaceChildren();const entries=state.journal.slice(0,4);if(!entries.length){const li=document.createElement('li');li.textContent='Your first light is waiting.';journal.appendChild(li);}else for(const entry of entries){const li=document.createElement('li');li.textContent=entry;journal.appendChild(li);}
 $('sound').setAttribute('aria-pressed',String(state.sound));$('sound').setAttribute('aria-label',state.sound?'Mute sounds':'Enable sounds');$('sound').textContent=state.sound?'♫':'♩';
 drawWorld();
}
function tone(sequence){if(!state.sound)return;try{audioContext??=new(window.AudioContext||window.webkitAudioContext)();void audioContext.resume();const now=audioContext.currentTime;const frequencies=[220,261.63,293.66,329.63,392,440,523.25];sequence.slice(0,3).forEach((note,i)=>{const osc=audioContext.createOscillator(),gain=audioContext.createGain(),t=now+i*.22;osc.type='sine';osc.frequency.value=frequencies[note%frequencies.length];gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(.055,t+.06);gain.gain.exponentialRampToValueAtTime(.0001,t+.7);osc.connect(gain);gain.connect(audioContext.destination);osc.start(t);osc.stop(t+.72);});}catch(e){console.warn('Audio unavailable',e);}}
function bind(){
 $('demo-walk').addEventListener('click',()=>{const n=selected(),r=C.visit(state,n.id);if(!r.ok)return;save();render();tone([n.note,n.note+2]);document.querySelector('.node-marker.selected')?.classList.add('harvested');const message=r.first?`New echo collected: ${n.name}. ✧ ${r.gain} Lumen gathered.`:r.gain?`A familiar place. ✧ ${r.gain} Lumen gathered.`:'You are here. The light is already with you.';feedback(message);notify(message);});
 $('quiet-collect').addEventListener('click',()=>{const r=C.quietCollect(state);if(!r.ok){notify(r.reason);return;}save();render();notify(r.gain?`Your beacon offered ✧ ${r.gain} Lumen. No journey needed.`:'Your sonde is full.');tone([0,2]);});
 $('attune').addEventListener('click',()=>{const r=C.attune(state,state.selected);if(!r.ok){feedback(r.reason);return;}save();render();tone([1,3,4]);const txt=r.close?'Clear pulse sent. Its full effect arrives with the next world pulse.':'Distant pulse sent. A quieter resonance has been stored.';feedback(txt);notify(txt);});
 $('advance-pulse').addEventListener('click',()=>{const r=C.pulse(state);save();render();if(r.fieldOpen){tone([0,2,4]);notify('THE FIRST CHORD — a resonance field has awakened.');}else notify(r.newEdges?`✧ ${r.newEdges} threads joined in the delayed pulse.`:r.changed?'A quiet world pulse has passed. Light is settling.':'A quiet world pulse. Nothing was lost.');});
 $('listen').addEventListener('click',()=>{const n=selected();tone([n.note,n.note+2,n.note+4]);notify(state.sound?`Listening to ${n.name}.`: 'Sound is muted. Tap ♩ at the top to hear this echo.');});
 $('sound').addEventListener('click',()=>{state.sound=!state.sound;save();render();if(state.sound)tone([0,2,4]);});
 $('recenter').addEventListener('click',()=>{if(globalThis.MajakkaLive?.isActive()){globalThis.MajakkaLive.recenter();return;}if(map&&mapReady)map.flyTo({center:[23.7623,61.4984],zoom:14.5,essential:true});notify('Centered on the Tampere demo area.');});
 $('reset').addEventListener('click',()=>{if(!confirm('Reset only First Light v0.2 progress on this device?'))return;state=C.blank();save();feedback('');render();notify('First Light demo reset.');});
 window.addEventListener('resize',()=>drawWorld());
 window.addEventListener('load',()=>{if(!map&&globalThis.maplibregl)startMap();});
}
function startMap(){
 if(map||mapEngineLoading)return;
 if(!globalThis.maplibregl){
  showMapStatus('Loading map engine…');
  if(mapEngineFallbackUsed){showMapStatus('Map engine unavailable. Check your connection and retry.',true);return;}
  mapEngineFallbackUsed=true;mapEngineLoading=true;
  const script=document.createElement('script');
  script.src='https://unpkg.com/maplibre-gl@5.10.0/dist/maplibre-gl.js';
  script.onload=()=>{mapEngineLoading=false;startMap();};
  script.onerror=()=>{mapEngineLoading=false;showMapStatus('Map engine could not load. Check your connection.',true);};
  document.head.appendChild(script);return;
 }
 if(typeof maplibregl.supported==='function'&&!maplibregl.supported()){
  showMapStatus('This device cannot run the interactive map (WebGL unavailable).',true);return;
 }
 function launchStyle(index){
  clearTimeout(mapStyleTimer);
  if(map){map.remove();map=null;mapReady=false;}
  if(index>=mapStyleCandidates.length){
   showMapStatus('The street map could not load. Check your connection and tap Retry map.',true);return;
  }
  showMapStatus(index?'Retrying with alternative map style…':'Loading streets, paths and water…');
  try{
   map=new maplibregl.Map({
    container:'real-map',style:mapStyleCandidates[index],center:[23.7623,61.4984],
    zoom:14.5,minZoom:3,maxZoom:19,attributionControl:true,
    dragRotate:false,pitchWithRotate:false,renderWorldCopies:false
   });
   map.touchZoomRotate.disableRotation();
   const candidate=map;
   mapStyleTimer=setTimeout(()=>{if(!mapReady&&map===candidate)launchStyle(index+1);},14000);
   map.on('load',()=>{
    if(map!==candidate)return;
    clearTimeout(mapStyleTimer);mapReady=true;
    $('map-credit').style.display='block';$('real-map').style.opacity='1';
    $('map-legend-text').textContent='REAL MAP · DEMO NODES · NO GPS';
    clearMapStatus();map.resize();drawWorld();
    window.dispatchEvent(new Event('majakka:mapready'));
   });
   map.on('move',()=>{if(mapReady)drawWorld();});
   map.on('error',error=>console.warn('Map tile/style error:',error?.error||error));
  }catch(e){console.warn('Map start failed:',e);launchStyle(index+1);}
 }
 launchStyle(0);
}
async function init(){await restore();bind();render();startMap();if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./sw.js').catch(e=>console.warn('SW unavailable',e));}
init();
