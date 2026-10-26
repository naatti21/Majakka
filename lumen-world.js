/* MAJAKKA v0.8 — local personal Lumen field, 2D and 3D snapshot. */
(()=>{
'use strict';
const Core=globalThis.MajakkaLumenCore,viewport=document.getElementById('map-viewport'),overlay=document.getElementById('world-overlay');
if(!Core||!viewport||!overlay)return;
const CLAIMS_KEY='majakka-lumen-claims-v2',DAY=()=>new Date().toLocaleDateString('sv-SE');
// World coordinate source is shared by everybody; collected grains remain private.
const seed='majakka-global-world-lumen-v1';
let last3DIds=new Map();
function loadClaims(){try{const v=JSON.parse(localStorage.getItem(CLAIMS_KEY)||'null');if(v?.day===DAY()&&Array.isArray(v.ids))return new Set(v.ids.filter(x=>typeof x==='string').slice(-1800));}catch{}return new Set();}
let claims=loadClaims(),claimsDay=DAY(),points=[],lastCenter=null,fix=null,firstFix=true,heading=null,stopped=true,lastEmit=0,lastDraw=0;
const canvas=document.createElement('div');canvas.id='personal-lumen';canvas.setAttribute('aria-label','Collectible Lumen grains');overlay.append(canvas);
const rendered=new Map();
function clearRendered(){for(const el of rendered.values())el.remove();rendered.clear();}
const avatar=document.createElement('div');avatar.id='lumen-avatar';avatar.setAttribute('aria-label','Player movement direction');avatar.hidden=true;
avatar.innerHTML='<div class="lumen-radius"></div><div class="lumen-arrow">▲</div>';overlay.append(avatar);
const style=document.createElement('style');style.textContent=`
#personal-lumen{position:absolute;inset:0;pointer-events:none;z-index:12;overflow:hidden}
.personal-spark{position:absolute;transform:translate(-50%,-50%);width:27px;height:27px;display:grid;place-items:center;
 background:transparent;border:0;padding:0;pointer-events:auto;cursor:pointer;touch-action:manipulation;outline-offset:1px}
.personal-spark::after{content:"";display:block;background:#d7c79f;opacity:.72;box-shadow:0 0 3px #ebd6a668}
.personal-spark.dust::after{width:1.5px;height:1.5px;border-radius:50%}
.personal-spark.glow::after{width:3px;height:3px;transform:rotate(45deg);border-radius:1px;background:#e0cfa8}
.personal-spark.heart::after{width:4.5px;height:5px;background:#f0dcac;clip-path:polygon(50% 0,100% 67%,52% 100%,0 67%);box-shadow:0 0 4px #e8cb9b88}
.personal-spark:focus-visible{outline:1px solid #e8c98d;border-radius:50%}
#lumen-avatar{position:absolute;left:0;top:0;z-index:26;pointer-events:none;transform:translate(-50%,-50%)}
#lumen-avatar[hidden],body:not(.live-gps) #lumen-avatar{display:none!important}
.lumen-radius{position:absolute;left:50%;top:50%;width:var(--lumen-diameter,100px);height:var(--lumen-diameter,100px);transform:translate(-50%,-50%);border:1px solid #a3eee077;border-radius:50%;box-shadow:inset 0 0 16px #4fddc21e,0 0 19px #4fddc211;background:radial-gradient(circle,#81eed512,transparent 66%)}
.lumen-arrow{position:relative;display:grid;place-items:center;width:27px;height:29px;transform:rotate(var(--lumen-heading,0deg));background:linear-gradient(135deg,#123743,#23666a);clip-path:polygon(50% 0,100% 90%,50% 72%,0 90%);color:#cbfff1;font-size:22px;text-shadow:0 0 8px #83ffdc;filter:drop-shadow(0 0 7px #67e4ce)}
body.live-gps #live-person{display:none!important}
body.perspective-on #personal-lumen,body.perspective-on #lumen-avatar,body:not(.live-gps) #personal-lumen{display:none!important}
@media(prefers-reduced-motion:reduce){.personal-spark{animation:none!important}}`;document.head.append(style);
function save(){try{localStorage.setItem(CLAIMS_KEY,JSON.stringify({day:claimsDay,ids:[...claims].slice(-1800)}));}catch{}}
function freshDay(){if(claimsDay!==DAY()){claimsDay=DAY();claims=new Set();save();}}
function mapReady2D(){return typeof map!=='undefined'&&map&&typeof map.project==='function'&&typeof map.getCenter==='function'&&typeof mapReady!=='undefined'&&mapReady;}
function regenerate(center){
 if(!Core.valid(center))return;
 const w=viewport.clientWidth,h=viewport.clientHeight;
 points=Core.visibleField(center,seed,{zoom:map.getZoom?.()||15,width:w,height:h,max:180});
}
function claim(id){
 if(stopped||navigator.onLine===false)return false;
 freshDay();
 if(typeof id!=='string'||claims.has(id))return false;
 const using3D=Boolean(globalThis.MajakkaPerspective?.isActive?.());
 const grain=using3D?last3DIds.get(id):points.find(p=>p.id===id&&rendered.has(id));
 if(!grain)return false;
 const earned=globalThis.MajakkaLiving?.award?.(grain.value,'spark')??0;
 if(earned<=0){if(typeof notify==='function')notify('Lumen reserve is full or your daily allowance is used.');return false;}
 claims.add(id);save();globalThis.MajakkaFeedback?.play?.('collect');
 globalThis.MajakkaFieldMetrics?.count?.('sparks',earned);
 if(typeof notify==='function')notify('Lumen collected · +'+earned+' ✧');
 draw();emit(true);return true;
}
function draw(){
 if(stopped||!mapReady2D())return;
 const center=map.getCenter();regenerate({lat:center.lat,lng:center.lng});
 const w=viewport.clientWidth,h=viewport.clientHeight,seen=new Set();let shown=0;
 for(const p of points){
  if(claims.has(p.id))continue;
  const q=map.project([p.lng,p.lat]);if(q.x<-27||q.y<-27||q.x>w+27||q.y>h+27)continue;
  let el=rendered.get(p.id);
  if(!el){
   el=document.createElement('button');el.type='button';el.className='personal-spark '+p.size;
   el.setAttribute('aria-label','Collect '+p.value+' Lumen');
   el.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();claim(p.id);});
   canvas.appendChild(el);rendered.set(p.id,el);
  }
  el.style.left=q.x+'px';el.style.top=q.y+'px';seen.add(p.id);
  if(++shown>=180)break;
 }
 for(const [id,el] of rendered)if(!seen.has(id)){el.remove();rendered.delete(id);}
 if(fix){
  const p=map.project([fix.lng,fix.lat]);avatar.hidden=p.x<-45||p.y<-45||p.x>w+45||p.y>h+45;
  avatar.style.left=p.x+'px';avatar.style.top=p.y+'px';
  const target={lng:fix.lng+Core.PICKUP/(111320*Math.max(.15,Math.cos(fix.lat*Math.PI/180))),lat:fix.lat};
  const proj=map.project([target.lng,target.lat]),diameter=Math.max(14,Math.min(300,Math.abs(proj.x-p.x)*2));
  avatar.style.setProperty('--lumen-diameter',diameter+'px');
  avatar.style.setProperty('--lumen-heading',(heading??0)+'deg');
  avatar.title=heading===null?'Movement heading not yet determined':'Arrow indicates movement direction';
 }
}
function emit(force=false){const now=Date.now();if(!force&&now-lastEmit<1700)return;lastEmit=now;window.dispatchEvent(new Event('majakka:lumenupdate'));}
function begin(){stopped=false;fix=null;firstFix=true;heading=null;lastCenter=null;points=[];last3DIds.clear();freshDay();clearRendered();avatar.hidden=true;emit(true);}
function clearLocation(){fix=null;heading=null;firstFix=true;avatar.hidden=true;draw();emit(true);}
function finish(){stopped=true;fix=null;points=[];clearRendered();avatar.hidden=true;emit(true);}
function onFix(event){
if(stopped)return;
const data=event.detail||{};if(!Core.valid(data)||!Number.isFinite(data.accuracy))return;
freshDay();const previous=fix;fix={lat:data.lat,lng:data.lng};
const movement=Boolean(data.movementAccepted);
if(movement&&previous)heading=Core.bearing(previous,fix)??heading;
// A GPS fix must never regenerate Lumen positions around the user's location.
const canFirst=firstFix&&data.accuracy<=25;
if(data.accuracy<=35&&(movement||canFirst)){
 const from=movement&&previous?previous:null,nearby=Core.cells(fix,seed,190);
 const picked=Core.pickups(nearby,from,fix,{accuracy:data.accuracy,accepted:movement,firstFix:canFirst,claimed:claims});
 let gained=0;
 for(const p of picked){
  const amount=globalThis.MajakkaLiving?.award?.(p.value,'spark')??0;
  if(amount>0){claims.add(p.id);gained+=amount;}
 }
 if(gained){save();globalThis.MajakkaFeedback?.play('collect');globalThis.MajakkaFieldMetrics?.count('sparks',gained);if(typeof notify==='function')notify('Lumen drawn into your field · +'+gained+' ✧');emit(true);}
}
if(data.accuracy<=25)firstFix=false;
draw();emit();
}
const clear=()=>{claims=new Set();claimsDay=DAY();save();draw();emit(true);};
const snapshot=(viewCenter=null,view={})=>{
 if(stopped)return null;
 const center=Core.valid(viewCenter)?viewCenter:mapReady2D()?map.getCenter():Core.valid(fix)?fix:null;
 if(!Core.valid(center))return null;
 const zoom=Number.isFinite(view.zoom)?view.zoom:(mapReady2D()?map.getZoom?.()||15:15);
 const w=view.width||viewport.clientWidth,h=view.height||viewport.clientHeight;
 const all=Core.visibleField(center,seed,{zoom,width:w,height:h,pitch:view.pitch||0,max:190}).filter(p=>!claims.has(p.id));
 last3DIds=new Map(all.map(p=>[p.id,p]));
 return {points:all.map(({id,lat,lng,size})=>({id,lat,lng,size})),
   fix:fix?{...fix}:null,heading,range:Core.PICKUP};
};
globalThis.MajakkaLumen={snapshot,clear,claim};
window.addEventListener('majakka:worldonline',()=>{if(stopped)begin();});
window.addEventListener('online',()=>{if(stopped)begin();});
window.addEventListener('offline',finish);
window.addEventListener('majakka:livestart',()=>{if(stopped)begin();});
window.addEventListener('majakka:livestop',clearLocation);
window.addEventListener('majakka:livefix',onFix);
window.addEventListener('majakka:mapready',()=>{if(!stopped)draw();});
window.addEventListener('resize',()=>{if(!stopped)draw();});
if(navigator.onLine!==false)begin();
let attempts=0;
const attach=()=>{if(mapReady2D())map.on('move',()=>{if(stopped||Date.now()-lastDraw<160)return;lastDraw=Date.now();draw();});else if(attempts++<30)setTimeout(attach,450);};attach();
})();