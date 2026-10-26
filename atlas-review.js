/* Node Atlas 0B — manually triggered, nonpublishing OSM reviewer. */
(() => {
 "use strict";
 const $=id=>document.getElementById(id);
 const Core=globalThis.MajakkaAtlasImport,Policy=globalThis.MajakkaNodePolicy;
 if(!Core||!Policy||!globalThis.MajakkaRaster){$("atlas-status").textContent="Atlas modules missing. Reload the page.";return;}
 const PROVIDER="https://overpass-api.de/api/interpreter";
 const MAX_UI_ITEMS=Core.MAX_RESULTS;
 const statuses={needs_evidence:"Needs evidence",rejected:"Excluded by rule",review_ready:"Ready for human review"};
 const reviewChoices={unreviewed:"Unreviewed",inspect:"Check on site",skip:"Skip",research:"Research"};
 const state={map:null,items:[],selected:null,reviews:new Map(),filter:"all",pending:null,lastRequest:0,
   cache:new Map(),center:{lat:61.4978,lng:23.7610},name:"Tampere demo"};
 function setStatus(txt,error=false){
  const box=$("atlas-status");box.textContent=txt;box.classList.toggle("error",error);
 }
 function fmtPoint(p){return p.lat.toFixed(5)+", "+p.lng.toFixed(5);}
 function displayCenter(){
  const c=state.map?.getCenter()||{lng:state.center.lng,lat:state.center.lat};
  $("readout").textContent="Center: "+fmtPoint({lat:c.lat,lng:c.lng})+" · radius 1.2 km";
 }
 function candidateName(c){return c.name||"Unnamed object";}
 function selectCandidate(id){
  const c=state.items.find(x=>x.sourceId===id);
  if(!c)return;
  state.selected=id;
  const d=$("details");d.hidden=false;
  $("detail-title").textContent=candidateName(c);
  $("detail-category").textContent=(Policy.TYPES[c.classification.type]?.label||"Unclassified")+
   " · "+c.geometryKind+(c.geometryKind==="approximate_center"?" (NOT an entrance)":"");
  $("detail-score").textContent="Pre-screen "+c.classification.score+"/100 · "+
   statuses[c.classification.status]+" · never approved automatically";
  $("detail-location").textContent=fmtPoint(c.point);
  const reasons=$("detail-reasons");reasons.replaceChildren();
  for(const reason of c.classification.reasons){
   const li=document.createElement("li");li.textContent=reason.replaceAll("_"," ");
   reasons.appendChild(li);
  }
  if(!c.classification.reasons.length){const li=document.createElement("li");li.textContent="Automated review found no missing fields; independent human verification is still mandatory.";reasons.appendChild(li);}
  $("osm-original").href="https://www.openstreetmap.org/"+c.sourceId.split(":")[1]+"/"+c.sourceId.split(":")[2];
  $("review-summary").textContent="Your session note: "+reviewChoices[state.reviews.get(id)||"unreviewed"];
  updateReviewButtons();
  renderPins();
  renderList();
 }
 function updateReviewButtons(){
  const value=state.reviews.get(state.selected)||"unreviewed";
  for(const b of $("review-controls").querySelectorAll("button[data-choice]"))
   b.classList.toggle("active",b.dataset.choice===value);
 }
 function renderPins(){
  if(!state.map)return;
  const root=$("atlas-pins");root.replaceChildren();
  const w=root.clientWidth,h=root.clientHeight;
  const visible=filtered().slice(0,MAX_UI_ITEMS);
  for(const c of visible){
   const pos=state.map.project([c.point.lng,c.point.lat]);
   if(pos.x< -15||pos.y< -15||pos.x>w+15||pos.y>h+15)continue;
   const button=document.createElement("button");button.type="button";
   button.className="pin"+(state.selected===c.sourceId?" selected":"");
   button.dataset.status=c.classification.status;
   button.style.left=pos.x+"px";button.style.top=pos.y+"px";
   button.title=candidateName(c);
   button.setAttribute("aria-label",candidateName(c)+" · "+statuses[c.classification.status]);
   button.textContent=c.classification.type==="park"?"♣":
    c.classification.type==="artwork"?"✦":c.classification.type==="lookout"?"⌁":"·";
   button.addEventListener("pointerdown",e=>e.stopPropagation());
   button.addEventListener("click",()=>selectCandidate(c.sourceId));
   root.appendChild(button);
  }
 }
 function filtered(){
  if(state.filter==="all")return state.items;
  if(state.filter==="excluded")return state.items.filter(x=>x.classification.status==="rejected");
  if(state.filter==="pending")return state.items.filter(x=>x.classification.status!=="rejected");
  return state.items.filter(x=>state.reviews.get(x.sourceId)===state.filter);
 }
 function renderList(){
  const list=$("result-list");list.replaceChildren();
  const show=filtered();
  $("result-count").textContent=show.length+"/"+state.items.length;
  for(const c of show){
   const li=document.createElement("li"),button=document.createElement("button");
   button.type="button";button.className="item";
   button.setAttribute("aria-pressed",String(state.selected===c.sourceId));
   const name=document.createElement("strong");name.textContent=candidateName(c);
   const meta=document.createElement("small");
   meta.textContent=(Policy.TYPES[c.classification.type]?.label||"Other")+" · "+
    statuses[c.classification.status]+
    (state.reviews.has(c.sourceId)?" · "+reviewChoices[state.reviews.get(c.sourceId)]:"");
   button.append(name,meta);
   button.addEventListener("click",()=>{
    selectCandidate(c.sourceId);
    state.map.flyTo({center:[c.point.lng,c.point.lat],zoom:15});
   });
   li.appendChild(button);list.appendChild(li);
  }
 }
 function install(items){
  state.items=items;state.selected=null;state.filter="all";$("filter").value="all";
  $("details").hidden=true;
  const counts=Core.stats(items);
  $("counts").textContent=counts.total+" candidates · "+counts.needs_evidence+
   " need evidence · "+counts.rejected+" excluded by rules · "+counts.review_ready+" review-ready (not approved)";
  renderList();renderPins();
  if(items.length===Core.MAX_RESULTS)setStatus("Showing the first "+Core.MAX_RESULTS+" records; the source may have more. Narrow the area for complete auditing.");
  else setStatus("Loaded "+items.length+" real OSM records. NONE is an approved or playable node.");
 }
 const abort=()=>{
  if(state.pending){state.pending.abort();state.pending=null;}
 };
 async function fetchCandidates(){
  if(!state.map)return;
  if(state.pending){setStatus("One query is already running.");return;}
  const now=Date.now(),center=state.map.getCenter(),here={lat:center.lat,lng:center.lng},radius=1200;
  const cacheKey=here.lat.toFixed(3)+":"+here.lng.toFixed(3)+":"+radius;
  const cached=state.cache.get(cacheKey);
  if(cached&&now-cached.at<Core.MIN_FETCH_INTERVAL){
   install(cached.items);setStatus("Reused this session's cached result. No new Overpass request.");return;
  }
  if(state.lastRequest&&now-state.lastRequest<90000){
   setStatus("Please avoid repeated public-server requests. Try again after 90 seconds or reuse the same area.",true);return;
  }
  state.lastRequest=now;
  const query=Core.query(here,radius),controller=new AbortController();
  state.pending=controller;$("fetch").disabled=true;
  setStatus("Querying public OpenStreetMap data for a 1.2 km review area…");
  const timeout=setTimeout(()=>controller.abort(),29000);
  try{
   // POST by explicit user action only. Browser origin/referer identifies this demo.
   const response=await fetch(PROVIDER,{method:"POST",mode:"cors",headers:{"Accept":"application/json","Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"},
    body:new URLSearchParams({data:query}),signal:controller.signal,cache:"no-store"});
   if(!response.ok)throw Error("Overpass returned HTTP "+response.status);
   const raw=await response.json();
   const candidates=Core.parseResponse(raw,Policy);
   state.cache.set(cacheKey,{at:Date.now(),items:candidates});
   install(candidates);
  }catch(error){
   const msg=error?.name==="AbortError"?"Timed out or cancelled":
    "Request failed: "+String(error?.message||error);
   setStatus(msg+". Data was not fabricated. The public Overpass service may be busy or restrict browser access.",true);
  }finally{
   clearTimeout(timeout);state.pending=null;$("fetch").disabled=false;
  }
 }
 async function copyReport(){
  const summary={
   createdAt:new Date().toISOString(),type:"MAJAKKA-ATLAS-REVIEW-ONLY",
   license:"© OpenStreetMap contributors, ODbL",
   warning:"UNVERIFIED candidates. No publication authorization.",
   items:state.items.map(c=>({
    sourceId:c.sourceId,name:candidateName(c),type:c.classification.type,
    point:c.point,geometryKind:c.geometryKind,status:c.classification.status,
    reasons:c.classification.reasons,score:c.classification.score,
    localReview:state.reviews.get(c.sourceId)||"unreviewed"
   }))
  };
  const text=JSON.stringify(summary,null,2);
  try{await navigator.clipboard.writeText(text);setStatus("Copied "+summary.items.length+" review candidates. Coordinates are included: share only deliberately.");}
  catch{setStatus("Clipboard unavailable. Use a browser with clipboard permission or copy from developer tools.",true);}
 }
 function boot(){
  state.map=new MajakkaRaster.Map({container:"atlas-map",center:[state.center.lng,state.center.lat],zoom:14,minZoom:11,maxZoom:19});
  state.map.on("load",()=>{$("map-state").textContent="Street map loaded. Drag to select another test area.";});
  state.map.on("move",()=>{displayCenter();renderPins();});
  state.map.on("error",error=>{$("map-state").textContent="Map tiles unavailable. List review can still work.";console.warn(error);});
  displayCenter();
  $("fetch").addEventListener("click",fetchCandidates);
  $("reset-center").addEventListener("click",()=>{state.map.jumpTo({center:[23.761,61.4978],zoom:14});displayCenter();});
  $("filter").addEventListener("change",e=>{state.filter=e.target.value;renderList();renderPins();});
  $("copy").addEventListener("click",copyReport);
  $("clear").addEventListener("click",()=>{abort();state.items=[];state.cache.clear();state.reviews.clear();state.selected=null;
   $("details").hidden=true;$("counts").textContent="No reviewed places";renderList();renderPins();setStatus("Session cleared; no data was submitted to Majakka.");});
  $("review-controls").addEventListener("click",e=>{
   const choice=e.target.closest("button[data-choice]")?.dataset.choice;
   if(!choice||!state.selected||!reviewChoices[choice])return;
   if(choice==="unreviewed")state.reviews.delete(state.selected);else state.reviews.set(state.selected,choice);
   $("review-summary").textContent="Your session note: "+reviewChoices[choice]+". This is NOT approval.";
   updateReviewButtons();renderList();
  });
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);
 else boot();
})();
