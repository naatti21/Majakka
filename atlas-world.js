/* MAJAKKA Auto Atlas v0.1 — global Echo net + voluntary nearby OSM previews.
   Neither OSM points nor fictional echoes are verified walking destinations. */
(()=>{
'use strict';
const A=globalThis.MajakkaAtlasCore,L=globalThis.MajakkaLivingCore,root=document.getElementById('world-overlay');
if(!A||!L||!root)return;
let running=true,fix=null,anchor=null,source=[],querying=false,queried=false,lastRendered=0,selected=null,fetchAbort=null,lastRequest=0;
/* Sourced world POIs live independently of network calls or camera movement. */
const catalogue=new Map();
for(const p of globalThis.MajakkaPilotSites?.normalized?.()||[])catalogue.set(p.id,p);

const layer=document.createElement('div');layer.id='atlas-markers';root.append(layer);
const links=document.createElementNS('http://www.w3.org/2000/svg','svg');
links.setAttribute('aria-hidden','true');links.setAttribute('class','landmark-threads');layer.append(links);
const glow=document.createElementNS('http://www.w3.org/2000/svg','path');
const thread=document.createElementNS('http://www.w3.org/2000/svg','path');
glow.setAttribute('class','landmark-thread-glow');
thread.setAttribute('class','landmark-thread-core');
links.append(glow,thread);
function paintConnections(sites){
 const active=sites.filter(p=>globalThis.MajakkaSites?.get?.(p.id));
 const sections=[];
 for(let i=0;i<active.length;i++)for(let j=i+1;j<active.length;j++){
  const aa=globalThis.MajakkaSites.get(active[i].id),bb=globalThis.MajakkaSites.get(active[j].id);
  if(aa.district!==bb.district)continue;
  const a=map.project([active[i].lng,active[i].lat]),b=map.project([active[j].lng,active[j].lat]);
  const mx=(a.x+b.x)/2,my=(a.y+b.y)/2-12;
  sections.push('M '+a.x+' '+a.y+' Q '+mx+' '+my+' '+b.x+' '+b.y);
 }
 const d=sections.join(' ');glow.setAttribute('d',d);thread.setAttribute('d',d);
}
const button=document.createElement('button');button.id='atlas-places';button.type='button';button.textContent='✦ Discover landmarks';button.setAttribute('aria-label','Discover named landmarks near the map center using OpenStreetMap. Sends the approximate map area to Overpass API.');button.title='Find a few named historic, natural and cultural landmarks. No procedural node spam.';document.body.append(button);
const info=document.createElement('div');info.id='atlas-inspect';info.hidden=true;info.innerHTML='<button type="button" id="atlas-close" aria-label="Close place details">×</button><strong id="atlas-title"></strong><small id="atlas-meta"></small><p id="atlas-note"></p>';document.body.append(info);
info.querySelector('#atlas-close').addEventListener('click',()=>{info.hidden=true;selected=null;document.body.classList.remove('landmark-selected');});
const sharedButton=document.createElement('button');sharedButton.type='button';sharedButton.id='atlas-shared-attune';sharedButton.hidden=true;
sharedButton.textContent='✧ Send shared resonance · 2';
sharedButton.addEventListener('click',()=>{
 if(!selected)return;
 const site=snapshot()?.real?.find(p=>p.id===selected);
 const result=globalThis.MajakkaSites?.attune?.(site);
 if(!result?.ok)notifyUser(result?.reason||'Site is unavailable');
 inspect(selected);
});
info.appendChild(sharedButton);
/* The camera may start kilometers away from the closest sourced node, e.g.
   when GPS recenters to Nokia. Offer a deliberate camera jump, NOT avatar teleport. */
const nearest=document.createElement('button');
nearest.type='button';nearest.id='atlas-nearest';nearest.hidden=true;
nearest.setAttribute('aria-label','Show nearest mapped landmark');
document.body.append(nearest);
nearest.addEventListener('click',()=>{
 const c=center(),local=snapshot(c)?.real||[];
 if(!c||!local.length)return;
 const p=local[0];
 if(globalThis.MajakkaPerspective?.isActive?.()&&globalThis.MajakkaPerspective?.focus)
  globalThis.MajakkaPerspective.focus({lat:p.lat,lng:p.lng});
 else if(typeof map!=='undefined'&&map?.jumpTo)
  map.jumpTo({center:[p.lng,p.lat],zoom:Math.max(14,map.getZoom?.()||14)});
 if(typeof notify==='function')notify('Showing '+p.name+' · your GPS position has not changed.');
});

const css=document.createElement('style');css.textContent=`
#atlas-markers{position:absolute;inset:0;z-index:24;pointer-events:none;overflow:hidden}
.landmark-threads{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.landmark-thread-glow{fill:none;stroke:#bdaa80;stroke-width:10;opacity:.15}
.landmark-thread-core{fill:none;stroke:#e5c48b;stroke-width:2;opacity:.80;stroke-dasharray:6 6}
.atlas-marker{position:absolute;width:44px;height:44px;transform:translate(-50%,-60%);padding:0;border:0;background:transparent;color:#d5e8df;pointer-events:auto;cursor:pointer;filter:drop-shadow(0 0 2px var(--aura))}
.atlas-marker .ring{position:absolute;left:50%;bottom:6px;width:22px;height:9px;transform:translateX(-50%);border:1px solid var(--low);border-radius:50%;background:radial-gradient(ellipse,var(--low),transparent 75%);box-shadow:0 0 5px var(--low)}
.atlas-marker .body{position:absolute;left:15px;top:12px;width:14px;height:18px;background:linear-gradient(115deg,#f6fff6, var(--aura) 35%,#092432 88%);border:1px solid #ecfff8a1;clip-path:polygon(50% 0,95% 30%,78% 88%,50% 100%,22% 88%,5% 30%);box-shadow:inset 0 0 3px #fff4;transform-origin:50% 90%}
.atlas-marker:before{content:"";position:absolute;left:13px;top:8px;width:18px;height:22px;border:1px solid var(--aura);border-radius:48% 48% 45% 45%;opacity:.48;transform:rotate(20deg)}
.atlas-marker.art{--aura:#c3a3f6;--low:#9067d06a}.atlas-marker.art .body{clip-path:polygon(50% 0,99% 50%,50% 100%,1% 50%);transform:rotate(18deg)}
.atlas-marker.history{--aura:#f0bf83;--low:#ecb66f55}.atlas-marker.history .body{clip-path:polygon(50% 0,85% 12%,85% 80%,50% 100%,15% 80%,15% 12%);border-bottom:2px solid #eac491}
.atlas-marker.nature{--aura:#8ce1b2;--low:#62c89a55}.atlas-marker.nature .body{clip-path:polygon(50% 0,72% 22%,100% 45%,74% 83%,50% 100%,26% 83%,0 45%,28% 22%);border-radius:40%}
.atlas-marker.culture{--aura:#8edbe7;--low:#57bed365}.atlas-marker.culture .body{clip-path:polygon(50% 0,88% 18%,94% 76%,50% 100%,6% 76%,12% 18%)}
.atlas-marker.atlas-echo{opacity:.72;filter:saturate(.62) drop-shadow(0 0 2px #538d93)}.atlas-marker.atlas-echo .body{height:15px;top:14px;background:linear-gradient(120deg,#86bbc5,#213c48);opacity:.85}
.atlas-marker.awake{opacity:1;filter:drop-shadow(0 0 5px #f6d99b)}
.atlas-marker.awake .body{background:linear-gradient(120deg,#fff0cc,#dbb36c,#594627);opacity:1}
.atlas-marker:focus-visible{outline:2px solid #fff;outline-offset:3px;border-radius:10px}
#atlas-places{display:none;position:fixed;right:12px;top:calc(276px + env(safe-area-inset-top,0px));z-index:31;min-height:38px;border:1px solid #84ded175;border-radius:18px;padding:7px 11px;background:#123041ef;color:#d2faf0;font:700 10px system-ui}
#atlas-places{display:block}
#atlas-places:disabled{opacity:.5}
#atlas-nearest{position:fixed;right:13px;top:calc(279px + env(safe-area-inset-top,0px));
 z-index:27;border:1px solid #c7b47c88;background:#252c2af2;color:#eacfa4;
 font:700 10px system-ui;min-height:37px;border-radius:19px;padding:6px 12px;max-width:180px;
 white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#atlas-nearest[hidden],body.landmark-selected #atlas-nearest,body.field-open #atlas-nearest,
body.journal-open #atlas-nearest{display:none!important}

#atlas-inspect{position:fixed;left:12px;right:12px;bottom:calc(141px + env(safe-area-inset-bottom,0px));z-index:34;max-width:360px;background:#071c2cf5;border:1px solid #a0ddc888;border-radius:15px;padding:12px 42px 11px 13px;box-shadow:0 12px 35px #0009;font:11px/1.4 system-ui;color:#cee5e0}
#atlas-inspect[hidden]{display:none!important}
#atlas-inspect strong{display:block;font-size:13px;color:#f5deb0;line-height:1.4}
#atlas-inspect small{display:block;color:#92dacf;margin-top:4px}
#atlas-inspect p{margin:5px 0 0;line-height:1.4}
#atlas-close{position:absolute;right:7px;top:6px;border:0;background:#244452;color:#e4f5ef;border-radius:50%;width:32px;height:32px}
#atlas-shared-attune{display:block;margin-top:9px;background:#dfbe82;border:1px solid #f6dcac;color:#172332;
 border-radius:10px;min-height:40px;padding:7px 10px;font:750 11px system-ui;width:100%}
#atlas-shared-attune[hidden]{display:none!important}
#atlas-shared-attune:disabled{opacity:.55}
body.perspective-on #atlas-markers{display:none!important}
body.journal-open #atlas-places,body.field-open #atlas-places,body.living-selected #atlas-places{display:none!important}
@media(max-width:355px){#atlas-places{right:82px;top:calc(278px + env(safe-area-inset-top,0px))}}
`;document.head.append(css);
const notifyUser=s=>{if(typeof notify==='function')notify(s);};
function active(){return running;}
function anchorOf(p){
 // Fixed global Mercator 2.4km cells: two users looking at the same area ask
 // for the same geographic search centre, regardless of GPS and camera motion.
 if(!p||!Number.isFinite(p.lat)||!Number.isFinite(p.lng))return null;
 const R=6378137,lat=p.lat*Math.PI/180,x=R*p.lng*Math.PI/180,y=R*Math.log(Math.tan(Math.PI/4+lat/2));
 const fx=(Math.floor(x/2400)+.5)*2400,fy=(Math.floor(y/2400)+.5)*2400;
 return {lat:(2*Math.atan(Math.exp(fy/R))-Math.PI/2)*180/Math.PI,lng:fx/R*180/Math.PI};
}
function center(){const viewed=globalThis.MajakkaPerspective?.getCenter?.();if(viewed)return viewed;const c=typeof map!=='undefined'&&map?.getCenter?.();return c&&A.meters(c,c)===0?{lat:c.lat,lng:c.lng}:anchor||fix;}
function snapshot(view=null){
 if(!active())return null;
 const c=view&&A.meters(view,view)===0?view:center();
 if(!c)return null;
 const real=[...catalogue.values()].filter(p=>A.meters(c,p)<30000)
  .sort((a,b)=>A.meters(c,a)-A.meters(c,b)||a.id.localeCompare(b.id)).slice(0,80);
 return {real,echoes:[],center:c,source:'sourced-landmark-catalogue',radius:30000};
}
function send(){window.dispatchEvent(new Event('majakka:atlasupdate'));}
function inspect(id){
 const data=snapshot(),p=[...(data?.real||[]),...(data?.echoes||[])].find(x=>x.id===id);
 if(!p)return;
 selected=p.id;info.hidden=false;document.body.classList.add('landmark-selected');
 info.querySelector('#atlas-title').textContent=p.name;

 info.querySelector('#atlas-meta').textContent=p.type.toUpperCase()+' · LANDMARK · OSM';
 const restored=Boolean(globalThis.MajakkaSites?.get?.(p.id));
 const progress=globalThis.MajakkaSites?.progress?.(p);
 info.querySelector('#atlas-note').textContent=(restored?'This landmark has been restored. ':'Restore this named landmark to build the district chord. ')+
  (progress?progress.restored+'/'+progress.goal+' sites restored in the district. ':'')+
  ' Map access has not been verified; this is a remote digital interaction.';
 globalThis.MajakkaSites?.select?.(p);
 sharedButton.hidden=restored;
 sharedButton.disabled=false;
 sharedButton.textContent='Restore landmark · 2 ✧';
}
/* Stable live DOM markers: never replace touch targets every map frame. */
const atlasElements=new Map();
function clearAtlasElements(){for(const el of atlasElements.values())el.remove();atlasElements.clear();}
function render(){
 if(!active()){clearAtlasElements();return;}
 if(typeof map==='undefined'||!map||!mapReady)return;
 const data=snapshot();if(!data)return;
 paintConnections(data.real||[]);
 const viewport=document.getElementById('map-viewport'),w=viewport.clientWidth,h=viewport.clientHeight;
 const seen=new Set();
 for(const p of (data.real||[])){
  const pt=map.project([p.lng,p.lat]);if(pt.x<-30||pt.y<-30||pt.x>w+30||pt.y>h+30)continue;
  let el=atlasElements.get(p.id);
  if(!el){
   el=document.createElement('button');el.type='button';
   el.innerHTML='<i class="ring"></i><i class="body"></i>';
   el.addEventListener('click',event=>{event.stopPropagation();inspect(p.id);});
   atlasElements.set(p.id,el);layer.appendChild(el);
  }
  const restored=Boolean(globalThis.MajakkaSites?.get?.(p.id));
  el.className='atlas-marker '+p.type+' '+p.kind+(restored?' awake':'');
  el.style.left=pt.x+'px';el.style.top=pt.y+'px';
  el.setAttribute('aria-label',(p.kind==='atlas-real'?'Restore landmark':'Landmark')+': '+p.name+(restored?' · restored':''));
  seen.add(p.id);
 }
 for(const [id,el] of atlasElements)if(!seen.has(id)){el.remove();atlasElements.delete(id);}
 const available=data.real||[];
 nearest.hidden=seen.size>0||!available.length;
 if(!nearest.hidden){
  const c=center(),p=available[0],km=Math.round(A.meters(c,p)/100)/10;
  nearest.textContent='↗ Nearest node · '+km+' km';
  nearest.title='Move the map camera to '+p.name+' (no GPS teleport)';
 }
}
const redraw=()=>{if(!active()||Date.now()-lastRendered<180)return;lastRendered=Date.now();render();};
function reset(){source=[];fix=null;anchor=null;queried=false;querying=false;selected=null;document.body.classList.remove('landmark-selected');fetchAbort?.abort();fetchAbort=null;info.hidden=true;clearAtlasElements();button.textContent='✦ Discover landmarks';button.disabled=false;lastRequest=0;send();render();}
function onFix(e){if(!active())return;const d=e.detail||{};if(!Number.isFinite(d.lat)||!Number.isFinite(d.lng)||d.accuracy>65)return;fix={lat:d.lat,lng:d.lng};render();send();}
/* A small, cached place-catalog pilot. No continuously polling API: one
   automatic lookup per new global cell, delayed until map movement settles.
   Provider only sees the coarse fixed cell centre, never raw phone GPS. */
const STORE_KEY='majakka-place-catalog-cache-v1',TTL=24*60*60*1000;
const tried=new Set();
let cache={},searchTimer=null,autoCount=0;
try{
 const saved=JSON.parse(localStorage.getItem(STORE_KEY)||'{}');
 if(saved&&typeof saved==='object'&&!Array.isArray(saved))cache=saved;
}catch{}
function cacheId(p){return p.lat.toFixed(4)+':'+p.lng.toFixed(4);}
function persistCache(){
 try{
  const latest=Object.entries(cache).sort((a,b)=>(b[1]?.at||0)-(a[1]?.at||0)).slice(0,28);
  cache=Object.fromEntries(latest);localStorage.setItem(STORE_KEY,JSON.stringify(cache));
 }catch{}
}
function rawItems(items){
 return (Array.isArray(items)?items:[]).slice(0,950).map(p=>({
  lat:p.lat??p.center?.lat,lng:p.lon??p.center?.lon,
  source:'osm',sourceId:String(p.type||'node')+'/'+String(p.id||''),
  tags:p.tags||{}
 }));
}
function query(c){
 const a=c.lat.toFixed(5),b=c.lng.toFixed(5),radius=2600;
 return '[out:json][timeout:14];('+
 'nwr(around:'+radius+','+a+','+b+')['+'"name"'+']['+'"historic"'+'];'+
 'nwr(around:'+radius+','+a+','+b+')['+'"name"'+']['+'"tourism"~"^(artwork|gallery|museum|viewpoint|attraction)$"'+'];'+
 'nwr(around:'+radius+','+a+','+b+')['+'"name"'+']['+'"leisure"~"^(park|garden|nature_reserve)$"'+'];'+
 'nwr(around:'+radius+','+a+','+b+')['+'"name"'+']['+'"amenity"~"^(library|arts_centre|theatre|community_centre)$"'+'];'+
 ');out center 950;';
}
function applySites(siteAnchor,sites,fromCache=false){
 if(!anchor||cacheId(anchor)!==cacheId(siteAnchor))return;
 source=sites.map(p=>({...p,atlasType:p.type,source:'osm'}));
 const eligible=A.landmarks(siteAnchor,source);
 for(const p of eligible)catalogue.set(p.id,p);
 // Keep a bounded recently discovered catalogue; pilot sources are always reseeded.
 if(catalogue.size>180){
  const persistent=new Set((globalThis.MajakkaPilotSites?.normalized?.()||[]).map(p=>p.id));
  for(const id of catalogue.keys())if(catalogue.size>150&&!persistent.has(id))catalogue.delete(id);
 }
 queried=true;
 const count=eligible.length;
 button.textContent=count?'✦ '+count+' landmarks':'✦ No landmarks here';
 button.title=count?'Tap to refresh this area. Sites are fixed in the world.':'No suitable named sites in this region. Move the map or try another area.';
 render();send();
 if(!fromCache&&typeof notify==='function')notify(count?count+' named landmark sites located on the map.':'No suitable public landmarks here. Move the map toward a town or park.');
}
async function requestSites(siteAnchor){
 const text=query(siteAnchor);
 for(const host of ['https://overpass.private.coffee/api/interpreter','https://overpass-api.de/api/interpreter']){
  const ctrl=new AbortController();
  fetchAbort=ctrl;const timeout=setTimeout(()=>ctrl.abort(),10500);
  try{
   const response=await fetch(host+'?data='+encodeURIComponent(text),{signal:ctrl.signal,cache:'no-store',mode:'cors'});
   if(!response.ok)throw Error('Overpass HTTP '+response.status);
   const json=await response.json();
   if(!Array.isArray(json.elements))throw Error('Invalid map site response');
   return rawItems(json.elements);
  }catch(error){
   if(!anchor||cacheId(anchor)!==cacheId(siteAnchor))throw error;
  }finally{clearTimeout(timeout);if(fetchAbort===ctrl)fetchAbort=null;}
 }
 throw Error('Both map data providers unavailable');
}
async function loadSites(force=false){
 if(!active()||navigator.onLine===false||querying)return;
 const current=center();
 if(!current)return;
 const requested=anchorOf(current);
 if(!requested)return;
 if(!anchor||cacheId(anchor)!==cacheId(requested)){
  anchor=requested;queried=false;source=[];selected=null;document.body.classList.remove('landmark-selected');info.hidden=true;
  clearAtlasElements();paintConnections([]);render();send();
 }
 const key=cacheId(requested),entry=cache[key];
 if(!force&&entry&&Date.now()-entry.at<TTL&&Array.isArray(entry.sites)){
  applySites(requested,entry.sites,true);return;
 }
 if(!force&&tried.has(key))return;
 if(!force&&autoCount>=8)return;
 if(Date.now()-lastRequest<(force?5000:17000)){scheduleSites(Math.max(1100,17000-(Date.now()-lastRequest)+350));return;}
 tried.add(key);if(!force)autoCount++;
 lastRequest=Date.now();querying=true;button.disabled=true;button.textContent='✦ Finding landmarks…';
 try{
  const candidates=await requestSites(requested);
  const selectedSites=A.landmarks(requested,candidates);
  cache[key]={at:Date.now(),sites:selectedSites};
  persistCache();
  applySites(requested,selectedSites);
 }catch(error){
  if(anchor&&cacheId(anchor)===key){
   button.textContent='✦ Retry landmarks';
   notifyUser('Landmark lookup failed. Map sites are temporarily unavailable; try again or pan to another area.');
  }
 }finally{querying=false;button.disabled=false;
  const viewed=center(),wanted=viewed&&anchorOf(viewed);
  if(wanted&&anchor&&cacheId(wanted)!==cacheId(anchor))scheduleSites(1200);
 }
}
function scheduleSites(delay=1100){
 if(document.hidden||navigator.onLine===false||!active())return;
 clearTimeout(searchTimer);
 searchTimer=setTimeout(()=>{void loadSites(false);},delay);
}
button.addEventListener('click',()=>{clearTimeout(searchTimer);void loadSites(true);});
window.addEventListener('online',()=>{running=true;render();send();scheduleSites(1500);});
window.addEventListener('majakka:livestop',()=>{fix=null;send();});
window.addEventListener('majakka:livefix',onFix);
window.addEventListener('majakka:mapready',()=>{render();send();scheduleSites(800);});
window.addEventListener('majakka:livingupdate',redraw);
window.addEventListener('resize',redraw);
window.addEventListener('majakka:atlasselect',e=>{if(active())inspect(e.detail?.id);});
window.addEventListener('majakka:shared-update',()=>{render();if(selected)inspect(selected);send();});
window.addEventListener('majakka:solo-update',()=>{render();if(selected)inspect(selected);send();});
window.addEventListener('majakka:site-update',()=>{render();if(selected)inspect(selected);send();});
window.addEventListener('majakka:camera-area',()=>scheduleSites(950));
let loops=0;const attach=()=>{if(typeof map!=='undefined'&&map?.on){map.on('move',()=>{redraw();if(!globalThis.MajakkaPerspective?.isActive?.())scheduleSites(1200);});scheduleSites(800);}else if(loops++<30)setTimeout(attach,500);};attach();
globalThis.MajakkaAtlas={snapshot,select:inspect};
// Map startup may have completed before this deferred module attached.
setTimeout(()=>{render();send();scheduleSites(600);},650);
})();