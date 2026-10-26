/* MAJAKKA v0.9 — one connected world. GPS is an optional player locator,
   never a gameplay mode, timer, or requirement for node actions. */
(()=>{
'use strict';
const Geo=globalThis.MajakkaLiveCore,Walk=globalThis.MajakkaWalkEnergy;
if(!Geo||!Walk||!document.getElementById('world-overlay'))return;
const $=id=>document.getElementById(id);
const btn=document.createElement('button');btn.id='live-toggle';btn.type='button';btn.textContent='⌖ Locate me';
btn.setAttribute('aria-label','Locate my player on the shared-map prototype. Position is not stored.');
document.body.append(btn);
const readout=document.createElement('div');readout.id='live-readout';readout.hidden=true;readout.setAttribute('role','status');document.body.append(readout);
const channel=document.createElement('button');channel.id='world-channel';channel.type='button';channel.textContent='✧ Channel Lumen';channel.title='Gather Lumen without travelling. Same reward limit for everyone.';document.body.append(channel);
const offline=document.createElement('div');offline.id='world-offline';offline.hidden=true;offline.setAttribute('role','alert');
offline.innerHTML='<strong>CONNECTION REQUIRED</strong><span>Majakka is an online world. Reconnect to interact with it.</span>';
document.body.append(offline);
const dot=document.createElement('div');dot.id='live-person';dot.hidden=true;$('world-overlay').append(dot);
const steps=Walk.create();
let watch=null,fix=null,everLocated=false,followFirst=true,wantLocation=false,mapWasMoved=false;
let channelAt=0;try{channelAt=Math.max(0,Number(localStorage.getItem('majakka-channel-at')||0));}catch{}
const notifyUser=s=>{if(typeof notify==='function')notify(s);};
function connected(){return navigator.onLine!==false;}
function mapPoint(pos){if(typeof map==='undefined'||!map||!mapReady)return null;return map.project([pos.lng,pos.lat]);}
function draw(){if(!connected()||!fix){dot.hidden=true;return;}const p=mapPoint(fix);if(!p){dot.hidden=true;return;}dot.style.left=p.x+'px';dot.style.top=p.y+'px';dot.hidden=false;}
function status(title,detail=''){readout.hidden=false;readout.replaceChildren();const a=document.createElement('strong');a.textContent=title;const b=document.createElement('span');b.textContent=detail;readout.append(a,b);}
function onFix(loc){
 if(watch===null)return;
 const p=Geo.validFix(loc.coords,loc.timestamp);if(!p||Date.now()-p.time>45000)return;
 const previous=fix,step=steps.feed(p);fix=p;everLocated=true;
 window.dispatchEvent(new CustomEvent('majakka:livefix',{detail:{lat:p.lat,lng:p.lng,accuracy:p.accuracy,movementAccepted:step.accepted}}));
 if(followFirst&&!mapWasMoved&&typeof map!=='undefined'&&map&&mapReady){
  followFirst=false;map.flyTo({center:[p.lng,p.lat],zoom:Math.max(14,map.getZoom()),essential:true});
 }
 btn.textContent='◉ Position on';btn.setAttribute('aria-label','Pause my location updates');btn.setAttribute('aria-pressed','true');
 status('YOUR POSITION · '+Math.round(p.accuracy)+' m','Interact with any mapped node from here. Walking is optional.');
 draw();
}
function pause(silent=false){
 if(watch!==null&&navigator.geolocation)navigator.geolocation.clearWatch(watch);
 watch=null;fix=null;steps.reset();dot.hidden=true;
 window.dispatchEvent(new Event('majakka:livestop'));
 btn.textContent='⌖ Locate me';btn.setAttribute('aria-pressed','false');readout.hidden=true;
 if(!silent)notifyUser('Position paused. The online world remains playable.');
}
function startLocation(){
 if(!connected()){notifyUser('Internet connection required for Majakka.');return;}
 if(!navigator.geolocation||!window.isSecureContext){notifyUser('Location needs browser HTTPS and GPS permission. Map play still works.');return;}
 if(watch!==null)return;
 wantLocation=true;followFirst=!everLocated;mapWasMoved=false;
 status('FINDING YOUR POSITION','Allow location to anchor your player. Node actions never require walking.');
 try{
  // Track only while page is visible. Never store or transmit a GPS trail to Majakka.
  watch=navigator.geolocation.watchPosition(onFix,err=>{
   if(err.code===1){wantLocation=false;pause(true);notifyUser('Location was denied. You can still interact with the map.');}
   else status('LOCATION UNAVAILABLE','Try again or interact with the map remotely.');
  },{enableHighAccuracy:true,maximumAge:0,timeout:17000});
  window.dispatchEvent(new Event('majakka:livestart'));
 }catch{wantLocation=false;pause(true);notifyUser('Could not locate you. Remote play remains available.');}
}
function recenter(){
 if(!fix){startLocation();return;}
 if(typeof map!=='undefined'&&map&&mapReady){map.flyTo({center:[fix.lng,fix.lat],zoom:Math.max(15,map.getZoom()),essential:true});draw();}
}
globalThis.MajakkaLive={isActive:()=>connected(),hasLocation:()=>watch!==null&&fix!==null,recenter,getFix:()=>fix?{lat:fix.lat,lng:fix.lng}:null};
btn.addEventListener('click',()=>watch!==null?(wantLocation=false,pause()):startLocation());
channel.addEventListener('click',()=>{
 if(!connected())return;
 const now=Date.now(),cooldown=120000;
 if(now-channelAt<cooldown){notifyUser('The Lumen field is recharging · '+Math.ceil((cooldown-now+channelAt)/1000)+' s.');return;}
 const gained=globalThis.MajakkaLiving?.award?.(2,'channel')??0;
 if(!gained){notifyUser('Lumen reserve is full or today’s personal allowance is exhausted.');return;}
 channelAt=now;try{localStorage.setItem('majakka-channel-at',String(channelAt));}catch{}
 globalThis.MajakkaFeedback?.play('collect');notifyUser('Channelled '+gained+' Lumen ✧ · travel is not required.');
});
function netStatus(){
 const online=connected();offline.hidden=online;document.body.classList.toggle('live-gps',online);
 btn.disabled=!online;channel.disabled=!online;
 if(!online){if(watch!==null)pause(true);dot.hidden=true;}
 else{window.dispatchEvent(new Event('majakka:worldonline'));}
}
window.addEventListener('online',netStatus);window.addEventListener('offline',netStatus);
window.addEventListener('majakka:mapready',()=>{if(fix&&followFirst&&!mapWasMoved)recenter();draw();});
window.addEventListener('resize',draw);
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(watch!==null)pause(true);}else if(wantLocation&&connected())startLocation();});
window.addEventListener('pagehide',()=>{if(watch!==null)pause(true);});
document.addEventListener('pointerdown',e=>{if(e.target.closest?.('#real-map'))mapWasMoved=true;},{passive:true});
let mapAttached=null,tries=0;
function attach(){if(typeof map!=='undefined'&&map&&map.on){if(map!==mapAttached){mapAttached=map;map.on('move',draw);}}else if(tries++<30)setTimeout(attach,500);}
attach();
netStatus();
// Respect a previously granted permission without re-prompting a new visitor.
if(navigator.permissions?.query)navigator.permissions.query({name:'geolocation'}).then(r=>{
 if(r.state==='granted'&&!document.hidden&&connected()&&watch===null)startLocation();
}).catch(()=>{});
})();