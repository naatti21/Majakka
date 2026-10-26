/* MAJAKKA Perspective Trial v0.4 — optional 3D viewport. Existing 2D stays untouched. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 const viewport=$('map-viewport');
 if(!viewport)return;
 let enabled=false,frame=null,ready=false,loadingTimer=0,lastFix=null,enteredAt=0,cameraCenter=null;
 const btn=document.createElement('button');
 btn.type='button';btn.id='perspective-toggle';btn.textContent='3D';
 btn.setAttribute('aria-label','Try 3D perspective map; switch back to 2D anytime');
 btn.setAttribute('aria-pressed','false');
 document.body.append(btn);
 const notice=document.createElement('div');
 notice.id='perspective-notice';notice.hidden=true;document.body.append(notice);
 function status(message){notice.hidden=false;notice.textContent=message;}
 function clearStatus(){notice.hidden=true;}
 function send(type,other={}){
  if(!enabled||!frame?.contentWindow)return;
  frame.contentWindow.postMessage({source:'majakka-parent',type,...other},location.origin);
 }
 function currentMode(){return 'live';} // 2D/3D are views of one world, not game modes.
 function safeFix(){
  const data=globalThis.MajakkaLive?.getFix?.()||lastFix;
  if(!data)return null;
  if(!Number.isFinite(data.lat)||!Number.isFinite(data.lng))return null;
  return {lat:data.lat,lng:data.lng};
 }
 function world(){
  const awake=Array.isArray(C?.NODES)?C.NODES.filter(n=>(state.world[n.id]||0)>=C.CHARGE_TARGET).map(n=>n.id):[];
  let riftClear=false;
  try{riftClear=JSON.parse(localStorage.getItem('majakka-rift-local-v1')||'null')?.cleared===true;}catch{}
  return {awake,edges:C.edges(state),field:state.field===true,riftClear,live:globalThis.MajakkaLiving?.snapshot?.()||null};
 }
 function atlasSnapshot(){
  const atlas=globalThis.MajakkaAtlas?.snapshot?.(cameraCenter);
  if(!atlas)return null;
  return {...atlas,echoes:(atlas.echoes||[]).map(e=>({...e,sharedCharge:(globalThis.MajakkaSharedWorld?.enabled?.()?globalThis.MajakkaSharedWorld?.get?.(e.id):globalThis.MajakkaSoloWorld?.get?.(e.id))?.charge??null}))};
 }
 function initial(){
  const center=(typeof map!=='undefined'&&map?.getCenter)?map.getCenter():{lng:23.7623,lat:61.4984};
  const zoom=(typeof map!=='undefined'&&map?.getZoom)?map.getZoom():15;
  send('init',{center:[center.lng,center.lat],zoom,mode:currentMode(),fix:safeFix(),world:world()});
  send('lumen',{personal:globalThis.MajakkaLumen?.snapshot?.(cameraCenter)||null});
  send('atlas',{atlas:atlasSnapshot()});
 }
 function disable(message){
  const lastCamera=cameraCenter;
  enabled=false;ready=false;cameraCenter=null;clearTimeout(loadingTimer);loadingTimer=0;
  document.body.classList.remove('perspective-on','perspective-ready');
  frame?.remove();frame=null;
  btn.textContent='3D';btn.setAttribute('aria-pressed','false');
  btn.setAttribute('aria-label','Try 3D perspective map; switch back to 2D anytime');
  if(message){status(message);setTimeout(()=>{if(!enabled)clearStatus();},5300);}else clearStatus();
  if(typeof map!=='undefined'&&map?.jumpTo&&lastCamera)map.jumpTo({center:[lastCamera.lng,lastCamera.lat]});
  if(typeof map!=='undefined'&&map?.resize)map.resize();
 }
 function enable(){
  if(enabled)return;
  enabled=true;ready=false;enteredAt=Date.now();
  btn.textContent='2D';btn.setAttribute('aria-pressed','true');
  btn.setAttribute('aria-label','Return to reliable 2D street map');
  status('Starting 3D perspective…');
  frame=document.createElement('iframe');frame.id='perspective-frame';frame.title='Majakka 3D perspective trial';
  frame.setAttribute('allow','fullscreen');
  // Same-origin iframe, no extra location permission. GPS supplied ephemerally by parent.
  frame.src='./world-3d.html?v=103';
  viewport.appendChild(frame);
  document.body.classList.remove('perspective-ready');document.body.classList.add('perspective-on');
  loadingTimer=setTimeout(()=>{if(enabled&&!ready)disable('3D could not load; returned safely to 2D.');},24000);
 }
 globalThis.MajakkaPerspective={isActive:()=>enabled&&ready,getCenter:()=>enabled&&ready&&cameraCenter?{...cameraCenter}:null,recenter:()=>send('recenter')};
 btn.addEventListener('click',()=>enabled?disable():enable());
 window.addEventListener('message',event=>{
  if(event.origin!==location.origin||!frame||event.source!==frame.contentWindow)return;
  const data=event.data;
  if(data?.source!=='majakka-3d')return;
  if(data.type==='ready'){
   clearTimeout(loadingTimer);ready=true;document.body.classList.add('perspective-ready');clearStatus();initial();
   return;
  }
  if(data.type==='error'){disable('3D unavailable on this device or connection. 2D remains available.');return;}
  if(!ready)return;
  if(data.type==='camera-center'){
   const c=data.center;
   if(Array.isArray(c)&&c.length===2&&Number.isFinite(c[0])&&Number.isFinite(c[1])){
    cameraCenter={lat:c[1],lng:c[0]};globalThis.MajakkaLiving?.navigate?.(cameraCenter);send('lumen',{personal:globalThis.MajakkaLumen?.snapshot?.(cameraCenter)||null});send('atlas',{atlas:atlasSnapshot()});
   }
  }else if(data.type==='node-select'){
   const id=data.id;
   if(currentMode()!=='demo'||!C.NODES.some(n=>n.id===id))return;
   const node=C.NODES.find(n=>n.id===id);
   const marker=Array.from(document.querySelectorAll('#world-markers .node-marker')).find(el=>el.getAttribute('aria-label')?.includes(node.name));
   marker?.click();
  }else if(data.type==='rift-select'){
   if(currentMode()==='demo')document.querySelector('.rift-node')?.click();
  }else if(data.type==='scan'){
   if(currentMode()==='live')$('live-scan')?.click();
  }else if(data.type==='live-node-select'||data.type==='live-rift-select'){
   window.dispatchEvent(new CustomEvent('majakka:livingselect',{detail:{id:data.type==='live-rift-select'?'veil':data.id}}));
  }else if(data.type==='live-lumen'){
   window.dispatchEvent(new CustomEvent('majakka:livingcollect',{detail:{id:data.id}}));
  }else if(data.type==='atlas-select'){
   window.dispatchEvent(new CustomEvent('majakka:atlasselect',{detail:{id:data.id}}));
  }else if(data.type==='trial-node'){
   if(typeof notify==='function')notify('This is a temporary visual test light, not a real public node.');
  }
 });
 window.addEventListener('majakka:livefix',event=>{
  const fix=event.detail;if(!fix||!Number.isFinite(fix.lat)||!Number.isFinite(fix.lng))return;
  lastFix={lat:fix.lat,lng:fix.lng};
  if(ready)send('gps',{fix:lastFix});
 });
 // GPS permission never changes world mode.
 window.addEventListener('majakka:livestop',()=>{lastFix=null;if(ready)send('gps',{fix:null});});
 window.addEventListener('majakka:atlasupdate',()=>{if(ready)send('atlas',{atlas:atlasSnapshot()});});
 window.addEventListener('majakka:shared-update',()=>{if(ready)send('atlas',{atlas:atlasSnapshot()});});
 window.addEventListener('majakka:solo-update',()=>{if(ready)send('atlas',{atlas:atlasSnapshot()});});
 window.addEventListener('majakka:lumenupdate',()=>{if(ready)send('lumen',{personal:globalThis.MajakkaLumen?.snapshot?.(cameraCenter)||null});});
 window.addEventListener('majakka:livingupdate',()=>{if(ready)send('living',{live:globalThis.MajakkaLiving?.snapshot?.()||null,selected:document.body.classList.contains('living-selected')});});
 const sync=()=>{if(ready)send('world',{world:world()});};
 // Sync after game actions without modifying the core game's pure rules.
 for(const id of ['attune','demo-walk','advance-pulse','rift-spend','rift-decode','hud-world-pulse','reset']){
  document.addEventListener('click',event=>{if(event.target.closest?.('#'+id))setTimeout(sync,0);});
 }
 window.addEventListener('resize',()=>{if(ready)send('world',{world:world()});});
})();