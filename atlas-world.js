/* MAJAKKA Auto Atlas v0.1 — global Echo net + voluntary nearby OSM previews.
   Neither OSM points nor fictional echoes are verified walking destinations. */
(()=>{
'use strict';
const A=globalThis.MajakkaAtlasCore,L=globalThis.MajakkaLivingCore,root=document.getElementById('world-overlay');
if(!A||!L||!root)return;
let running=true,fix=null,anchor=null,source=[],querying=false,queried=false,lastRendered=0,selected=null,fetchAbort=null,lastRequest=0;
const layer=document.createElement('div');layer.id='atlas-markers';root.append(layer);
const button=document.createElement('button');button.id='atlas-places';button.type='button';button.textContent='✦ Find places';button.setAttribute('aria-label','Load public place candidates from OpenStreetMap. Sends the approximate active map area to Overpass API.');button.title='Optional: request public places near this area from the OpenStreetMap Overpass API';document.body.append(button);
const info=document.createElement('div');info.id='atlas-inspect';info.hidden=true;info.innerHTML='<button type="button" id="atlas-close" aria-label="Close place details">×</button><strong id="atlas-title"></strong><small id="atlas-meta"></small><p id="atlas-note"></p>';document.body.append(info);
info.querySelector('#atlas-close').addEventListener('click',()=>{info.hidden=true;selected=null;});
const css=document.createElement('style');css.textContent=`
#atlas-markers{position:absolute;inset:0;z-index:24;pointer-events:none;overflow:hidden}
.atlas-marker{position:absolute;width:40px;height:48px;transform:translate(-50%,-63%);padding:0;border:0;background:transparent;color:#e9fff6;pointer-events:auto;cursor:pointer;filter:drop-shadow(0 0 5px var(--aura))}
.atlas-marker .ring{position:absolute;left:50%;bottom:2px;width:30px;height:13px;transform:translateX(-50%);border:1px solid var(--aura);border-radius:50%;background:radial-gradient(ellipse,var(--low),transparent 75%);box-shadow:0 0 16px var(--low)}
.atlas-marker .body{position:absolute;left:11px;top:6px;width:18px;height:27px;background:linear-gradient(115deg,#f6fff6, var(--aura) 35%,#092432 88%);border:1px solid #ecfff8a1;clip-path:polygon(50% 0,95% 30%,78% 88%,50% 100%,22% 88%,5% 30%);box-shadow:inset 0 0 8px #fff9;transform-origin:50% 90%}
.atlas-marker:before{content:"";position:absolute;left:8px;top:0;width:24px;height:30px;border:1px solid var(--aura);border-radius:48% 48% 45% 45%;opacity:.48;transform:rotate(20deg)}
.atlas-marker.art{--aura:#c3a3f6;--low:#9067d06a}.atlas-marker.art .body{clip-path:polygon(50% 0,99% 50%,50% 100%,1% 50%);transform:rotate(18deg)}
.atlas-marker.history{--aura:#f0bf83;--low:#ecb66f55}.atlas-marker.history .body{clip-path:polygon(50% 0,85% 12%,85% 80%,50% 100%,15% 80%,15% 12%);border-bottom:2px solid #eac491}
.atlas-marker.nature{--aura:#8ce1b2;--low:#62c89a55}.atlas-marker.nature .body{clip-path:polygon(50% 0,72% 22%,100% 45%,74% 83%,50% 100%,26% 83%,0 45%,28% 22%);border-radius:40%}
.atlas-marker.culture{--aura:#8edbe7;--low:#57bed365}.atlas-marker.culture .body{clip-path:polygon(50% 0,88% 18%,94% 76%,50% 100%,6% 76%,12% 18%)}
.atlas-marker.atlas-echo{opacity:.58;filter:saturate(.7) drop-shadow(0 0 4px #538d93)}.atlas-marker.atlas-echo .body{height:20px;top:9px;background:linear-gradient(120deg,#86bbc5,#213c48);opacity:.85}
.atlas-marker:focus-visible{outline:2px solid #fff;outline-offset:3px;border-radius:10px}
#atlas-places{display:none;position:fixed;right:12px;top:calc(276px + env(safe-area-inset-top,0px));z-index:31;min-height:38px;border:1px solid #84ded175;border-radius:18px;padding:7px 11px;background:#123041ef;color:#d2faf0;font:700 10px system-ui}
#atlas-places{display:block}
#atlas-places:disabled{opacity:.5}
#atlas-inspect{position:fixed;left:12px;right:12px;bottom:calc(141px + env(safe-area-inset-bottom,0px));z-index:34;max-width:360px;background:#071c2cf5;border:1px solid #a0ddc888;border-radius:15px;padding:12px 42px 11px 13px;box-shadow:0 12px 35px #0009;font:11px/1.4 system-ui;color:#cee5e0}
#atlas-inspect[hidden]{display:none!important}
#atlas-inspect strong{display:block;font-size:13px;color:#f5deb0;line-height:1.4}
#atlas-inspect small{display:block;color:#92dacf;margin-top:4px}
#atlas-inspect p{margin:5px 0 0;line-height:1.4}
#atlas-close{position:absolute;right:7px;top:6px;border:0;background:#244452;color:#e4f5ef;border-radius:50%;width:32px;height:32px}
body.perspective-on #atlas-markers{display:none!important}
body.journal-open #atlas-places,body.field-open #atlas-places,body.living-selected #atlas-places{display:none!important}
@media(max-width:355px){#atlas-places{right:82px;top:calc(278px + env(safe-area-inset-top,0px))}}
`;document.head.append(css);
const notifyUser=s=>{if(typeof notify==='function')notify(s);};
function active(){return running;}
function anchorOf(p){return L.region(p).center;}
function center(){const viewed=globalThis.MajakkaPerspective?.getCenter?.();if(viewed)return viewed;const c=typeof map!=='undefined'&&map?.getCenter?.();return c&&A.meters(c,c)===0?{lat:c.lat,lng:c.lng}:anchor||fix;}
function snapshot(view=null){if(!active())return null;const c=view&&A.meters(view,view)===0?view:center();return c?A.place(c,source):null;}
function send(){window.dispatchEvent(new Event('majakka:atlasupdate'));}
function inspect(id){
 const data=snapshot(),p=[...(data?.real||[]),...(data?.echoes||[])].find(x=>x.id===id);
 if(!p)return;
 selected=p.id;info.hidden=false;
 info.querySelector('#atlas-title').textContent=p.name;
 info.querySelector('#atlas-meta').textContent=(p.type.toUpperCase()+' · '+(p.kind==='atlas-real'?'OSM place candidate':'FICTIONAL ECHO'));
 info.querySelector('#atlas-note').textContent=p.kind==='atlas-real'?'Unverified access. Remote discovery preview only; do not use as walking directions. Full node mechanics are not yet connected.':'A stable fictional signal that makes sparse regions worth exploring. Not a real-world destination.';
}
function render(){
 if(!active()){layer.replaceChildren();return;}
 if(typeof map==='undefined'||!map||!mapReady)return;
 const data=snapshot();if(!data)return;
 const liveNodes=globalThis.MajakkaLiving?.snapshot?.()?.projection?.nodes||[];
 const w=document.getElementById('map-viewport').clientWidth,h=document.getElementById('map-viewport').clientHeight;
 const frag=document.createDocumentFragment();
 for(const p of [...data.real,...data.echoes]){
  if(p.kind==='atlas-echo'&&liveNodes.some(n=>A.meters(n,p)<125))continue;
  const pt=map.project([p.lng,p.lat]);if(pt.x<-30||pt.y<-30||pt.x>w+30||pt.y>h+30)continue;
  const el=document.createElement('button');el.type='button';el.className='atlas-marker '+p.type+' '+p.kind;
  el.style.left=pt.x+'px';el.style.top=pt.y+'px';el.innerHTML='<i class="ring"></i><i class="body"></i>';
  el.setAttribute('aria-label',(p.kind==='atlas-real'?'Public place candidate':'Fictional Echo')+': '+p.name+'. View details.');
  el.addEventListener('click',()=>inspect(p.id));frag.appendChild(el);
 }
 layer.replaceChildren(frag);
}
const redraw=()=>{if(!active()||Date.now()-lastRendered<180)return;lastRendered=Date.now();render();};
function reset(){source=[];fix=null;anchor=null;queried=false;querying=false;selected=null;fetchAbort?.abort();fetchAbort=null;info.hidden=true;layer.replaceChildren();button.textContent='✦ Find places';button.disabled=false;lastRequest=0;send();render();}
function onFix(e){if(!active())return;const d=e.detail||{};if(!Number.isFinite(d.lat)||!Number.isFinite(d.lng)||d.accuracy>65)return;fix={lat:d.lat,lng:d.lng};render();send();}
function query(c){return '[out:json][timeout:12];('+
 'nwr(around:1000,'+c.lat.toFixed(5)+','+c.lng.toFixed(5)+')[tourism~"^(artwork|gallery|museum|viewpoint|attraction)$"];'+
 'nwr(around:1000,'+c.lat.toFixed(5)+','+c.lng.toFixed(5)+')[historic];'+
 'nwr(around:1000,'+c.lat.toFixed(5)+','+c.lng.toFixed(5)+')[leisure~"^(park|garden|nature_reserve)$"];'+
 'nwr(around:1000,'+c.lat.toFixed(5)+','+c.lng.toFixed(5)+')[amenity~"^(library|arts_centre|theatre|community_centre)$"];'+
 ');out center 400;';}
button.addEventListener('click',async()=>{
 if(!active()||querying)return;
 const c=center();if(!c)return;
 const requestedAnchor=anchorOf(c);
 if(!anchor||A.meters(anchor,requestedAnchor)>450){anchor=requestedAnchor;source=[];queried=false;button.textContent='✦ Find places';}
 if(queried)return;
 if(Date.now()-lastRequest<120000){notifyUser('Place lookup cooldown. Try again after two minutes.');return;}
 lastRequest=Date.now();
 // Separate user click knowingly sends approximate current map region to a third party.
 querying=true;button.disabled=true;button.textContent='✦ Loading places';
 const thisAnchor={...anchor},controller=new AbortController();fetchAbort=controller;
 const timeout=setTimeout(()=>controller.abort(),12000);
 try{
  const url='https://overpass-api.de/api/interpreter?data='+encodeURIComponent(query(thisAnchor));
  const response=await fetch(url,{signal:controller.signal,mode:'cors'});
  if(!response.ok)throw Error('Overpass '+response.status);
  const raw=await response.json();
  if(!active()||!anchor||L.meters(thisAnchor,anchor)>150)return;
  source=(raw.elements||[]).slice(0,800).map(p=>({...p,lat:p.lat??p.center?.lat,lng:p.lon??p.center?.lon,center:p.center&&{lat:p.center.lat,lng:p.center.lon},source:'osm',sourceId:String(p.type||'node')+'/'+String(p.id)}));
  queried=true;button.textContent='✦ Places loaded';render();send();
  notifyUser('Auto Atlas · '+(snapshot()?.real.length||0)+' public place candidates. Access unverified; remote preview.');
 }catch(e){
  if(active()){button.textContent='✦ Retry places';notifyUser('Place data unavailable. Global fictional Echo network remains visible.');}
 }finally{clearTimeout(timeout);querying=false;button.disabled=false;fetchAbort=null;}
});
window.addEventListener('online',()=>{running=true;render();send();});
window.addEventListener('majakka:livestop',()=>{fix=null;send();});
window.addEventListener('majakka:livefix',onFix);
window.addEventListener('majakka:mapready',()=>{render();send();});
window.addEventListener('majakka:livingupdate',redraw);
window.addEventListener('resize',redraw);
window.addEventListener('majakka:atlasselect',e=>{if(active())inspect(e.detail?.id);});
let loops=0;const attach=()=>{if(typeof map!=='undefined'&&map?.on)map.on('move',redraw);else if(loops++<30)setTimeout(attach,500);};attach();
globalThis.MajakkaAtlas={snapshot,select:inspect};
// Map startup may have completed before this deferred module attached.
setTimeout(()=>{render();send();},650);
})();