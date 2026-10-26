/* MAJAKKA v0.8 — local personal Lumen field, 2D and 3D snapshot. */
(()=>{
'use strict';
const Core=globalThis.MajakkaLumenCore,viewport=document.getElementById('map-viewport'),overlay=document.getElementById('world-overlay');
if(!Core||!viewport||!overlay)return;
const SEED_KEY='majakka-lumen-personal-seed-v1',CLAIMS_KEY='majakka-lumen-claims-v1',DAY=()=>new Date().toLocaleDateString('sv-SE');
const randomSeed=()=>{const b=new Uint8Array(16);crypto.getRandomValues(b);return Array.from(b,x=>x.toString(16).padStart(2,'0')).join('');};
let seed;try{seed=localStorage.getItem(SEED_KEY);if(!seed||seed.length<16){seed=randomSeed();localStorage.setItem(SEED_KEY,seed);}}catch{seed=randomSeed();}
function loadClaims(){try{const v=JSON.parse(localStorage.getItem(CLAIMS_KEY)||'null');if(v?.day===DAY()&&Array.isArray(v.ids))return new Set(v.ids.filter(x=>typeof x==='string').slice(-1800));}catch{}return new Set();}
let claims=loadClaims(),claimsDay=DAY(),points=[],lastCenter=null,fix=null,firstFix=true,heading=null,stopped=true,lastEmit=0,lastDraw=0;
const canvas=document.createElement('div');canvas.id='personal-lumen';canvas.setAttribute('aria-hidden','true');overlay.append(canvas);
const avatar=document.createElement('div');avatar.id='lumen-avatar';avatar.setAttribute('aria-label','Player movement direction');avatar.hidden=true;
avatar.innerHTML='<div class="lumen-radius"></div><div class="lumen-arrow">▲</div>';overlay.append(avatar);
const style=document.createElement('style');style.textContent=`
#personal-lumen{position:absolute;inset:0;pointer-events:none;z-index:12;overflow:hidden}
.personal-spark{position:absolute;transform:translate(-50%,-50%);pointer-events:none;background:#d5c69d;box-shadow:0 0 3px #e0cf9c80;opacity:.55}
.personal-spark.dust{width:1.5px;height:1.5px;border-radius:50%;opacity:.43}
.personal-spark.glow{width:2.8px;height:2.8px;transform:translate(-50%,-50%) rotate(45deg);border-radius:1px;opacity:.7;box-shadow:0 0 5px #dec38a7d}
.personal-spark.heart{width:4px;height:4.5px;background:#eed9a5;clip-path:polygon(50% 0,100% 65%,55% 100%,0 65%);opacity:.79;box-shadow:0 0 5px #e8c99099}
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
function regenerate(center){if(!Core.valid(center))return;if(lastCenter){const a=Core.merc(lastCenter),b=Core.merc(center);if(Math.hypot(a.x-b.x,a.y-b.y)<230)return;}lastCenter={lat:center.lat,lng:center.lng};points=Core.cells(center,seed);}
function draw(){
if(stopped||!mapReady2D())return;
const center=map.getCenter();regenerate({lat:center.lat,lng:center.lng});
const w=viewport.clientWidth,h=viewport.clientHeight,fragment=document.createDocumentFragment();let shown=0;
for(const p of points){
 if(claims.has(p.id))continue;
 const q=map.project([p.lng,p.lat]);if(q.x<-25||q.y<-25||q.x>w+25||q.y>h+25)continue;
 const e=document.createElement('i');e.className='personal-spark '+p.size;e.style.left=q.x+'px';e.style.top=q.y+'px';fragment.appendChild(e);
 if(++shown>=310)break;
}
canvas.replaceChildren(fragment);
if(fix){
 const p=map.project([fix.lng,fix.lat]);avatar.hidden=p.x<-45||p.y<-45||p.x>w+45||p.y>h+45;
 avatar.style.left=p.x+'px';avatar.style.top=p.y+'px';
 const target={lng:fix.lng+Core.PICKUP/(111320*Math.max(.15,Math.cos(fix.lat*Math.PI/180))),lat:fix.lat};
 const proj=map.project([target.lng,target.lat]),diameter=Math.max(14,Math.min(300,Math.abs(proj.x-p.x)*2));
 avatar.style.setProperty('--lumen-diameter',diameter+'px');
 avatar.style.setProperty('--lumen-heading',(heading??0)+'deg');
 avatar.title=heading===null?'Movement heading not yet determined':'Arrow indicates movement direction';
}}
function emit(force=false){const now=Date.now();if(!force&&now-lastEmit<1700)return;lastEmit=now;window.dispatchEvent(new Event('majakka:lumenupdate'));}
function begin(){stopped=false;fix=null;firstFix=true;heading=null;lastCenter=null;points=[];freshDay();canvas.replaceChildren();avatar.hidden=true;emit(true);}
function clearLocation(){fix=null;heading=null;firstFix=true;avatar.hidden=true;draw();emit(true);}
function finish(){stopped=true;fix=null;points=[];canvas.replaceChildren();avatar.hidden=true;emit(true);}
function onFix(event){
if(stopped)return;
const data=event.detail||{};if(!Core.valid(data)||!Number.isFinite(data.accuracy))return;
freshDay();const previous=fix;fix={lat:data.lat,lng:data.lng};
const movement=Boolean(data.movementAccepted);
if(movement&&previous)heading=Core.bearing(previous,fix)??heading;
if(!lastCenter)regenerate(fix);
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
const snapshot=(viewCenter=null)=>{if(stopped)return null;const center=Core.valid(viewCenter)?viewCenter:Core.valid(fix)?fix:(mapReady2D()?map.getCenter():null);if(!Core.valid(center))return null;const all=Core.cells(center,seed,990).filter(p=>!claims.has(p.id));const stride=Math.max(1,Math.ceil(all.length/450));return {points:all.filter((_,i)=>i%stride===0).slice(0,450).map(({lat,lng,size})=>({lat,lng,size})),fix:fix?{...fix}:null,heading,range:Core.PICKUP};};
globalThis.MajakkaLumen={snapshot,clear};
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