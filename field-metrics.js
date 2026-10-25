/* MAJAKKA: user-owned, location-free field-test diary for evaluating retention.
   Captures only aggregate daily counts; never raw GPS, node coordinates, paths or map cells. */
(function(root){
 'use strict';
 const KEY='majakka-field-test-notes-v1';
 const today=()=>new Date().toLocaleDateString('sv-SE');
 const events=['liveSessions','minutes','nodeSignals','threads','pulses','fields','veils','sparks','decodes','decodeMisses'];
 let diary={};
 try{const obj=JSON.parse(localStorage.getItem(KEY)||'{}');if(obj&&typeof obj==='object'&&!Array.isArray(obj))diary=obj;}catch{}
 let started=0;
 function flush(){try{localStorage.setItem(KEY,JSON.stringify(diary));}catch{}}
 function count(type,amount=1){
  if(!events.includes(type))return;
  const date=today(),d=diary[date]||(diary[date]={});
  d[type]=Math.min(100000,(Math.max(0,Number(d[type])||0)+Math.max(0,Number(amount)||0)));
  flush();
 }
 function start(){if(!started){started=Date.now();count('liveSessions');}}
 function stop(){
  if(!started)return;
  count('minutes',Math.round(Math.max(0,Date.now()-started)/60000));
  started=0;
 }
 function report(){
  const days=Object.keys(diary).sort().slice(-10);
  return JSON.stringify({product:'Majakka',test:'Local 3D Field Trial',note:'No GPS coordinates or routes included',days:days.map(day=>({day,...Object.fromEntries(events.map(x=>[x,Number(diary[day]?.[x])||0]))}))},null,2);
 }
 async function copy(){
  const text=report();
  try{await navigator.clipboard.writeText(text);return true;}
  catch{try{prompt('Copy your location-free test summary',text);}catch{}return false;}
 }
 function clear(){diary={};flush();}
 window.addEventListener('majakka:livestart',start);
 window.addEventListener('majakka:livestop',stop);
 window.addEventListener('pagehide',stop);
 root.MajakkaFieldMetrics={count,report,copy,clear};
})(typeof globalThis!=='undefined'?globalThis:this);
