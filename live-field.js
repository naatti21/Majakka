/* MAJAKKA: opt-in foreground-only 12-minute GPS trial. No stored routes. */
(() => {
 'use strict';
 const L=globalThis.MajakkaLiveCore,W=globalThis.MajakkaWalkEnergy;
 if(!L||!W||!document.getElementById('world-overlay'))return;
 const byId=id=>document.getElementById(id);
 const btn=document.createElement('button');btn.id='live-toggle';btn.type='button';btn.textContent='◎ LIVE';btn.setAttribute('aria-label','Start optional 12 minute location trial');btn.setAttribute('aria-pressed','false');
 document.body.append(btn);
 const panel=document.createElement('div');panel.id='live-readout';panel.hidden=true;panel.setAttribute('role','status');panel.setAttribute('aria-live','polite');document.body.append(panel);
 const scan=document.createElement('button');scan.id='live-scan';scan.textContent='✧ Scan';scan.type='button';scan.hidden=true;document.body.append(scan);
 const dot=document.createElement('div');dot.id='live-person';dot.hidden=true;byId('world-overlay').append(dot);
 let id=null,active=false,gotFix=false,fix=null,moveRewards=0,scanAt=null,scans=0,started=0,expiry=null,follow=true;
 const walking=W.create();let nextMeters=W.METERS_PER_LUMEN;
 let originalLegend='',originalTitle='';
 const tell=msg=>{if(typeof notify==='function')notify(msg);};
 function label(txt,detail){panel.replaceChildren();const title=document.createElement('strong');title.textContent=txt;const body=document.createElement('span');body.textContent=detail;panel.append(title,body);if(active){const small=document.createElement('small');small.textContent='Foreground only · No route saved · Map tile provider sees the viewed area';panel.append(small);}}
 function mapPoint(p){if(typeof map!=='undefined'&&map&&typeof map.project==='function'&&mapReady){const q=map.project([p.lng,p.lat]);return {x:q.x,y:q.y};}return null;}
 function redraw(){if(!active||!fix){dot.hidden=true;return;}const p=mapPoint(fix);if(!p){dot.hidden=true;return;}dot.style.left=p.x+'px';dot.style.top=p.y+'px';dot.hidden=false;}
 function onFix(position){if(!active)return;const next=L.validFix(position.coords,position.timestamp);if(!next){label('LOW SIGNAL','Waiting for a valid position.');return;}
  const now=Date.now();if(now-next.time>45000){label('STALE POSITION','Waiting for a fresh GPS fix.');return;}
  gotFix=true;const prev=fix;fix=next;window.dispatchEvent(new CustomEvent('majakka:livefix',{detail:{lat:next.lat,lng:next.lng,accuracy:next.accuracy}}));
  const step=walking.feed(next);
  nextMeters=step.remaining;
  if(step.gain>0){
    const gained=globalThis.MajakkaLiving?.award?.(step.gain,'movement')??0;
    if(gained){moveRewards+=gained;globalThis.MajakkaFeedback?.play('collect');
      globalThis.MajakkaFieldMetrics?.count('walkLumen',gained);
      tell('Movement ✧ +'+gained+' Lumen · all directions count');}
  }
  if(typeof map!=='undefined'&&map&&typeof map.easeTo==='function'&&mapReady){
    const center=map.getCenter(),meters=L.distance({lat:center.lat,lng:center.lng},next);
    if(follow&&!prev)map.easeTo({center:[next.lng,next.lat],zoom:14,duration:850});
  }
  label('LIVE FIELD · '+Math.max(1,Math.ceil((L.DURATION_MS-(now-started))/60000))+' MIN',
    'Accuracy ~'+Math.round(next.accuracy)+' m · '+(next.accuracy<=W.MAX_ACCURACY?'Movement tracking':'Low GPS precision; movement paused')+'. '+Math.ceil(nextMeters)+' m to next ✧ · '+moveRewards+' earned.');
  redraw();
 }
 function recenterLive(){if(!active||!fix){tell('Waiting for a live position.');return;}follow=true;if(typeof map!=='undefined'&&map&&mapReady){map.flyTo({center:[fix.lng,fix.lat],zoom:Math.max(15,map.getZoom()),essential:true});redraw();}else tell('Location acquired; waiting for the street map.');}
 globalThis.MajakkaLive={isActive:()=>active,recenter:recenterLive,getFix:()=>fix?{lat:fix.lat,lng:fix.lng}:null};
 window.addEventListener('majakka:mapready',()=>{if(active&&fix)recenterLive();});
 function stop(reason='Location trial ended. No route saved.'){
  if(id!==null&&navigator.geolocation)navigator.geolocation.clearWatch(id);
  id=null;clearTimeout(expiry);expiry=null;active=false;gotFix=false;fix=null;walking.reset();nextMeters=W.METERS_PER_LUMEN;dot.hidden=true;scan.hidden=true;panel.hidden=true;
  document.body.classList.remove('live-gps');window.dispatchEvent(new Event('majakka:livestop'));btn.textContent='◎ LIVE';btn.setAttribute('aria-pressed','false');btn.setAttribute('aria-label','Start optional 12 minute location trial');
  const legend=byId('map-legend-text');if(legend)legend.textContent=originalLegend||'SAMPLE NODES · DEMO';
  const title=document.querySelector('.map-bar h2');if(title&&originalTitle)title.innerHTML=originalTitle;
  if(typeof map!=='undefined'&&map&&mapReady&&typeof drawWorld==='function')drawWorld();
  tell(reason);
 }
 function start(){
  if(!window.isSecureContext||!navigator.geolocation){tell('Live GPS needs HTTPS and location support.');return;}
  if(active){stop('Live location stopped. No route saved.');return;}
  started=Date.now();gotFix=false;scanAt=null;scans=0;moveRewards=0;fix=null;walking.reset();nextMeters=W.METERS_PER_LUMEN;follow=true;
  originalLegend=byId('map-legend-text')?.textContent||'';originalTitle=document.querySelector('.map-bar h2')?.innerHTML||'';
  active=true;btn.textContent='■ STOP';btn.setAttribute('aria-pressed','true');btn.setAttribute('aria-label','Stop live location');panel.hidden=false;scan.hidden=false;
  document.body.classList.remove('node-open','interference-open','field-open','journal-open');document.body.classList.add('live-gps');window.dispatchEvent(new Event('majakka:livestart'));
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
  // Scan reveals nearby signals, but does not mint energy. Only actual movement does.
  dot.classList.remove('sweeping');void dot.offsetWidth;dot.classList.add('sweeping');
  globalThis.MajakkaFeedback?.play('pulse');
  tell('Scan complete · surrounding signals illuminated. Lumen gathers only while moving.');
 });
 document.addEventListener('visibilitychange',()=>{if(active&&document.hidden)stop('Location paused when Majakka went into the background.');});
 window.addEventListener('pagehide',()=>{if(active)stop('Location ended.');});
 window.addEventListener('resize',redraw);
 document.addEventListener('click',e=>{if(active&&e.target.closest('#real-map'))follow=false;});
 let attachAttempts=0;
 const attach=()=>{
  if(typeof map!=='undefined'&&map&&typeof map.on==='function'){
   map.on('move',redraw);
   map.on('load',()=>{if(active&&fix){map.jumpTo({center:[fix.lng,fix.lat],zoom:15});redraw();}});
  }else if(attachAttempts++<24)setTimeout(attach,500);
 };
 attach();
})();