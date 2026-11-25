import {catalogClient} from './catalog.mjs';
import {openPlayer,initial,motionSession,validFix,reach} from './player.mjs';
import {flatMap} from './flat.mjs';

const $=id=>document.getElementById(id),load=catalogClient(),motion=motionSession();
let map,records=[],selected=null,fix=null,watch=null,session=0,release,canEarn=false;
let profile=initial(),transaction,revision=0;
const centers={tampere:[23.761,61.499],nokia:[23.51,61.48],ruovesi:[23.89,62.02]};
const info=t=>{$('response').textContent=t;};
function sync(){
 $('balance').textContent=profile.wallet.balance;
 $('journal').textContent=profile.studies.length+' field notes · '+profile.visits.length+' nearby surveys';
 $('channel').disabled=!transaction;
 $('detail').hidden=!selected;
 if(!selected)return;
 $('family').textContent=selected.type+' · Dormant';
 $('name').textContent=selected.name;
 const nearby=reach(fix,selected,Date.now());
 $('reach').textContent=selected.mode==='remote'?'Regional research only. No verified pedestrian entrance.':
 nearby?'Within survey reach. Check signs and surroundings.':'Nearby survey requires a fresh position within 150 m, including accuracy.';
 const a=document.createElement('a');a.href=selected.source.url;a.textContent=selected.source.attribution+' · '+selected.source.license;
 $('source').replaceChildren(a,' · '+selected.source.date);
 const report=document.createElement('a');report.href='https://github.com/naatti21/Majakka/issues/new?title='+encodeURIComponent('Atlas access review · '+selected.id);report.textContent='Report a catalog issue';$('note-report').replaceChildren(report);
 if(selected.review){const source=document.createElement('a');source.href=selected.review;source.textContent='Pedestrian access source';$('source').append(' · ',source);}
 $('classify').hidden=profile.studies.includes(selected.id);
 $('study').disabled=!transaction||profile.studies.includes(selected.id);
 $('visit').hidden=selected.mode==='remote';$('visit').disabled=!transaction||!nearby||profile.visits.includes(selected.id);
 $('note').textContent=profile.studies.includes(selected.id)?'Field note saved · '+selected.type+' identified.':'';
}
function pick(id){$('evidence').value='';selected=records.find(n=>n.id===id)??null;sync();if(selected)$('detail').scrollIntoView({block:'nearest'});}
function clearRecords(){
 records=[];selected=null;$('places').replaceChildren();map?.setNodes([]);sync();
}
async function viewport(bounds){
 const turn=++revision;
 $('catalog').textContent='Reading regional atlas…';
 try{
  const data=await load(bounds);
  if(turn!==revision)return;
  records=data.records;
  selected=records.find(n=>n.id===selected?.id)??null;
  const walk=records.filter(n=>n.mode==='walkup');
  $('catalog').textContent=data.areas.length?data.areas.map(r=>r.name).join(' · ')+' · '+walk.length+' mapped · '+(records.length-walk.length)+' remote':
    'No catalog coverage in this view. Choose a pilot region or channel Lumen.';
  map?.setNodes(walk);
  const button=n=>{const b=document.createElement('button');b.textContent=n.name;b.onclick=()=>pick(n.id);return b;};
  $('places').replaceChildren(...walk.map(button));
  const remote=records.filter(n=>n.mode==='remote');
  if(remote.length){
   const group=document.createElement('details'),summary=document.createElement('summary'),list=document.createElement('div');
   group.className='remote';group.open=!walk.length;summary.textContent='Regional research ('+remote.length+')';
   list.className='record-list';list.append(...remote.map(button));group.append(summary,list);$('places').append(group);
  }
  sync();
 }catch(e){if(turn===revision){clearRecords();$('catalog').textContent='Regional records unavailable. Move the map or choose a region to retry.';}}
}
$('region').onchange=e=>map?.center(...centers[e.target.value]);
$('close').onclick=()=>{selected=null;sync();};
async function commit(action){
 if(!transaction)return;
 try{profile=await transaction(action);sync();info(action.kind==='Channel'?'Lumen channel collected.':action.kind==='Movement'?'Walking Lumen credited.':'Observation saved to your journal.');}
 catch(e){info(e.message||'Could not save locally.');}
}
$('study').onclick=()=>selected&&commit({kind:'NodeAction',node:selected,mode:'study',evidence:$('evidence').value});
$('visit').onclick=()=>selected&&commit({kind:'NodeAction',node:selected,mode:'visit',fix});
$('channel').onclick=()=>commit({kind:'Channel'});

function clearFix(){fix=null;map?.gps(null);$('locate').hidden=true;sync();}
function stop(message){
 session++;if(watch!==null)navigator.geolocation.clearWatch(watch);
 watch=null;release?.();release=null;canEarn=false;motion.clear();clearFix();
 $('gps').textContent='Use GPS';$('fix').textContent=message;
}
function start(){
 if(watch!==null){stop('Location is off.');return;}
 if(!navigator.geolocation||!isSecureContext){stop('GPS requires HTTPS or localhost and a supported browser.');return;}
 const token=++session;
 $('gps').textContent='Stop GPS';$('fix').textContent='Waiting for a location fix…';
 // Only one foreground tab may convert movement into wallet grants.
 navigator.locks?.request('majakka-s1-movement',{ifAvailable:true},lock=>{
  if(!lock||token!==session)return;
  canEarn=true;return new Promise(resolve=>{release=resolve;});
 }).catch(()=>{});
 watch=navigator.geolocation.watchPosition(position=>{
  if(token!==session||document.hidden)return;
  const c=position.coords,p={lat:c.latitude,lng:c.longitude,accuracy:c.accuracy,speed:c.speed,time:Math.floor(position.timestamp)};
  const sample=motion.sample(p,Date.now());
  if(!sample.accepted){clearFix();$('fix').textContent='Waiting for a fresh, accurate walking-speed fix.';return;}
  fix=p;map?.gps(fix);$('locate').hidden=false;
  $('fix').textContent='GPS active · ±'+Math.ceil(fix.accuracy)+' m'+(canEarn?' · walking Lumen enabled.':' · movement credit paused.');
  if(sample.gain&&canEarn)commit({kind:'Movement',time:p.time,gain:sample.gain});
  sync();
 },e=>{if(token!==session)return;if(e.code===1)stop('Location permission denied. Remote research is available.');
  else{motion.clear();clearFix();$('fix').textContent='GPS unavailable. Waiting for a new fix.';}},
 {enableHighAccuracy:true,maximumAge:0,timeout:18000});
}
$('gps').onclick=start;$('locate').onclick=()=>{if(validFix(fix,Date.now()))map?.center(fix.lng,fix.lat);};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&watch!==null)stop('GPS stopped in the background.');});
window.addEventListener('pagehide',()=>stop('Location stopped.'));
navigator.permissions?.query({name:'geolocation'}).then(p=>{p.onchange=()=>{if(p.state==='denied')stop('Location permission revoked.');};}).catch(()=>{});
setInterval(()=>{if(fix&&!validFix(fix,Date.now())){clearFix();$('fix').textContent='Last fix expired. Waiting for GPS.';}},1000);
try{const db=await openPlayer();profile=await db();transaction=db;}catch(e){info('Journal unavailable · '+e.message);}
window.addEventListener('focus',async()=>{if(transaction){try{profile=await transaction();sync();}catch(e){info(e.message);}}});
sync();
const args=[$('map'),viewport,pick,text=>{$('map-status').textContent=text;}];
try{map=(await import('./map.mjs')).createMap(...args);}
catch{map=flatMap(...args);}
