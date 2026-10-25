/* MAJAKKA: opt-in foreground-only 12-minute GPS trial. No stored routes. */
(() => {
 'use strict';
 const L=globalThis.MajakkaLiveCore;
 if(!L||!document.getElementById('world-overlay'))return;
 const byId=id=>document.getElementById(id);
 const btn=document.createElement('button');btn.id='live-toggle';btn.type='button';btn.textContent='◎ LIVE';btn.setAttribute('aria-label','Start optional 12 minute location trial');btn.setAttribute('aria-pressed','false');
 document.body.append(btn);
 const panel=document.createElement('div');panel.id='live-readout';panel.hidden=true;panel.setAttribute('role','status');panel.setAttribute('aria-live','polite');document.body.append(panel);
 const scan=document.createElement('button');scan.id='live-scan';scan.textContent='✧ Scan';scan.type='button';scan.hidden=true;document.body.append(scan);
 const dot=document.createElement('div');dot.id='live-person';dot.hidden=true;byId('world-overlay').append(dot);
 let id=null,active=false,gotFix=false,fix=null,anchor=null,rewardAt=-Infinity,moveRewards=0,scanAt=null,scans=0,started=0,expiry=null,centeredOnce=false,watchedMap=null;
 let originalLegend='',originalTitle='';
 const tell=msg=>{if(typeof notify==='function')notify(msg);};
 function label(txt,detail){panel.replaceChildren();const title=document.createElement('strong');title.textContent=txt;const body=document.createElement('span');body.textContent=detail;panel.append(title,body);if(active){const small=document.createElement('small');small.textContent='Only while open · No route saved';small.title='Map tiles are requested from a third-party map provider for the area you view.';panel.append(small);}}
 function mapPoint(p){if(typeof map!=='undefined'&&map&&typeof map.project==='function'&&mapReady){const q=map.project([p.lng,p.lat]);return {x:q.x,y:q.y};}return null;}
 function redraw(){if(!active||!fix){dot.hidden=true;return;}const p=mapPoint(fix);if(!p){dot.hidden=true;return;}dot.style.left=p.x+'px';dot.style.top=p.y+'px';dot.hidden=false;}
 // Initial centering is part of pressing LIVE. All later GPS fixes update only the position marker.
 // Touching the map before the first fix cancels even that initial auto-center.
 function centerAtFirstFix(){
  if(!active||centeredOnce||!fix||typeof map==='undefined'||!map||!mapReady)return;
  centeredOnce=true;
  map.easeTo({center:[fix.lng,fix.lat],zoom:Math.max(map.getZoom(),15),duration:650});
 }
 function bindMapRedraw(){
  if(typeof map==='undefined'||!map||!mapReady||watchedMap===map)return;
  watchedMap=map;
  map.on('move',redraw);
  map.on('dragstart',()=>{if(active)centeredOnce=true;});
 }
 function onFix(position){if(!active)return;const next=L.validFix(position.coords,position.timestamp);if(!next){label('LOW SIGNAL','Waiting for a valid position.');return;}
  const now=Date.now();if(now-next.time>45000){label('STALE POSITION','Waiting for a fresh GPS fix.');return;}
  gotFix=true;fix=next;
  if(!anchor&&next.accuracy<=65)anchor=next;
  if(L.canRewardMove(anchor,next,now,rewardAt,moveRewards)){
    const gain=Math.min(1,C.MAX_LUMEN-state.lumen);if(gain){state.lumen+=gain;save();render();moveRewards+=1;rewardAt=now;tell('Movement resonance · ✧ +1 Lumen');}
    anchor=next;
  }
  centerAtFirstFix();
  label('LIVE · '+Math.max(1,Math.ceil((L.DURATION_MS-(now-started))/60000))+' MIN',
    'GPS ±'+Math.round(next.accuracy)+' m · '+(next.accuracy<=65?'Ready':'Uncertain')+' · Echoes '+moveRewards+'/'+L.MAX_MOVE_REWARDS);
  redraw();
 }
 function recenterLive(){
  if(!active||!fix){tell('Waiting for a live position.');return;}
  centeredOnce=true;
  if(typeof map!=='undefined'&&map&&mapReady){map.flyTo({center:[fix.lng,fix.lat],zoom:Math.max(15,map.getZoom()),essential:true});redraw();}
  else tell('Location acquired; waiting for the street map.');
 }
 globalThis.MajakkaLive={isActive:()=>active,recenter:recenterLive};
 window.addEventListener('majakka:mapready',()=>{bindMapRedraw();centerAtFirstFix();redraw();});
 // The map canvas captures gestures; unlike a click handler, pointer/touch input catches drag gestures.
 ['pointerdown','touchstart','wheel'].forEach(type=>byId('real-map')?.addEventListener(type,()=>{if(active)centeredOnce=true;},{passive:true}));
 function stop(reason='Location trial ended. No route saved.'){
  if(id!==null&&navigator.geolocation)navigator.geolocation.clearWatch(id);
  id=null;clearTimeout(expiry);expiry=null;active=false;gotFix=false;fix=null;anchor=null;dot.hidden=true;scan.hidden=true;panel.hidden=true;
  document.body.classList.remove('live-gps');btn.textContent='◎ LIVE';btn.setAttribute('aria-pressed','false');btn.setAttribute('aria-label','Start optional 12 minute location trial');
  const legend=byId('map-legend-text');if(legend)legend.textContent=originalLegend||'SAMPLE NODES · DEMO';
  const title=document.querySelector('.map-bar h2');if(title&&originalTitle)title.innerHTML=originalTitle;
  // Preserve the area being explored. The existing target button explicitly returns to Tampere demo.
  if(typeof map!=='undefined'&&map&&mapReady&&typeof drawWorld==='function')drawWorld();
  if(legend)legend.textContent='DEMO NODES · TAMPERE · ⌖ TO RETURN';
  tell(reason);
 }
 function start(){
  if(!window.isSecureContext||!navigator.geolocation){tell('Live GPS needs HTTPS and location support.');return;}
  if(active){stop('Live location stopped. No route saved.');return;}
  started=Date.now();gotFix=false;rewardAt=-Infinity;scanAt=null;scans=0;moveRewards=0;fix=null;anchor=null;centeredOnce=false;
  originalLegend=byId('map-legend-text')?.textContent||'';originalTitle=document.querySelector('.map-bar h2')?.innerHTML||'';
  active=true;btn.textContent='■ STOP';btn.setAttribute('aria-pressed','true');btn.setAttribute('aria-label','Stop live location');panel.hidden=false;scan.hidden=false;
  // Reset the bottom navigation's internal selection as well as its classes.
  document.querySelector('.map-bottom-nav [data-panel="world"]')?.click();
  document.body.classList.remove('node-open','interference-open','field-open','journal-open');
  document.body.classList.add('live-gps');
  byId('hud-node-info')?.setAttribute('hidden','');byId('hud-node-actions')?.setAttribute('hidden','');byId('hud-rift-info')?.setAttribute('hidden','');byId('hud-rift-actions')?.setAttribute('hidden','');
  const legend=byId('map-legend-text');if(legend)legend.textContent='LIVE MAP · PERSONAL TRIAL · NO SHARED NODES';
  const title=document.querySelector('.map-bar h2');if(title)title.textContent='Your local field';
  label('REQUESTING LOCATION','Allow precise location for this short trial. No GPS trail is saved.');
  expiry=setTimeout(()=>stop('12-minute trial finished. No route saved.'),L.DURATION_MS);
  try{id=navigator.geolocation.watchPosition(onFix,error=>{
   if(!active)return;
   if(error.code===1){stop('Location permission denied. Demo remains available.');return;}
   label('WAITING FOR GPS',error.code===3?'Position timed out; retrying while the trial is open.':'Location unavailable; retrying.');
  },{enableHighAccuracy:true,maximumAge:0,timeout:17000});}catch{stop('Could not start location. Demo remains available.');}
 }
 btn.addEventListener('click',start);
 scan.addEventListener('click',()=>{
  if(!active||!gotFix||!fix){tell('Waiting for your location.');return;}
  const now=Date.now();if(!L.canScan(now,scanAt,scans)){tell('The local signal is settling. Try again later.');return;}
  scanAt=now;scans++;
  const gain=Math.min(1,C.MAX_LUMEN-state.lumen);if(gain){state.lumen+=gain;save();render();}
  dot.classList.remove('sweeping');void dot.offsetWidth;dot.classList.add('sweeping');
  if(navigator.vibrate)navigator.vibrate(25);
  tell(gain?'Local resonance gathered · ✧ +1 Lumen':'Scan complete. Your sonde is full.');
 });
 document.addEventListener('visibilitychange',()=>{if(active&&document.hidden)stop('Location paused when Majakka went into the background.');});
 window.addEventListener('pagehide',()=>{if(active)stop('Location ended.');});
 window.addEventListener('resize',redraw);
 bindMapRedraw();
})();