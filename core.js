/* MAJAKKA First Light domain core — pure and independent of browser/UI. */
(function(root,factory){
  const core=factory();
  if(typeof module==='object'&&module.exports)module.exports=core;
  root.MajakkaCore=core;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const VERSION=2,MAX_LUMEN=12,ATTUNE_COST=2,CHARGE_TARGET=2;
  // Public-space *demo* markers placed approximately in Tampere. Not a POI database.
  const NODES=Object.freeze([
    {id:'koski',name:'River Current',place:'Koskipuisto · demo',lat:61.50010,lng:23.76470,note:0,kind:'flow'},
    {id:'square',name:'Quiet Square',place:'Keskustori · demo',lat:61.49772,lng:23.76018,note:2,kind:'pulse'},
    {id:'harbor',name:'Southern Lantern',place:'Laukontori · demo',lat:61.49422,lng:23.76218,note:4,kind:'glow'}
  ]);
  const FIELD_IDS=NODES.map(n=>n.id);
  const START={lat:61.4990,lng:23.76820};
  function clamp(n,a,b){return Math.min(b,Math.max(a,n));}
  function distanceMeters(a,b){
    if(!a||!b||![a.lat,a.lng,b.lat,b.lng].every(Number.isFinite))return Infinity;
    const rad=Math.PI/180,dLat=(b.lat-a.lat)*rad,dLon=(b.lng-a.lng)*rad;
    const u=Math.sin(dLat/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dLon/2)**2;
    return 6371000*2*Math.asin(Math.sqrt(clamp(u,0,1)));
  }
  function proximity(distance){return distance<=95?'near':distance<=420?'faint':'distant';}
  function blank(){return {schema:VERSION,cycle:0,lumen:3,player:{...START},selected:'koski',discovered:[],collected:{},charge:{},pending:{},world:{},field:false,journal:[],sound:false,quietCycle:-1};}
  function sanitize(src){
    const s=blank();if(!src||typeof src!=='object'||src.schema!==VERSION)return s;
    s.cycle=clamp(Number.isInteger(src.cycle)?src.cycle:0,0,9999);
    s.lumen=clamp(Number.isInteger(src.lumen)?src.lumen:3,0,MAX_LUMEN);
    if(src.player&&Number.isFinite(src.player.lat)&&Number.isFinite(src.player.lng)&&src.player.lat>61.48&&src.player.lat<61.52&&src.player.lng>23.72&&src.player.lng<23.81)s.player={lat:src.player.lat,lng:src.player.lng};
    if(FIELD_IDS.includes(src.selected))s.selected=src.selected;
    s.discovered=Array.isArray(src.discovered)?[...new Set(src.discovered.filter(id=>FIELD_IDS.includes(id)))]:[];
    for(const field of ['collected','charge','pending','world'])if(src[field]&&typeof src[field]==='object')for(const id of FIELD_IDS){
      const v=src[field][id];if(Number.isInteger(v)&&v>=0&&v<=9999)s[field][id]=v;
    }
    s.field=src.field===true&&FIELD_IDS.every(id=>(s.world[id]||0)>=CHARGE_TARGET);
    s.journal=Array.isArray(src.journal)?src.journal.filter(v=>typeof v==='string').slice(0,28).map(v=>v.slice(0,130)):[];
    s.sound=src.sound===true;
    s.quietCycle=Number.isInteger(src.quietCycle)?clamp(src.quietCycle,-1,s.cycle):-1;
    return s;
  }
  function journal(s,message){s.journal.unshift(message);s.journal=s.journal.slice(0,28);}
  function visit(s,id){
    const n=NODES.find(n=>n.id===id);if(!n)return {ok:false,reason:'Unknown signal'};
    s.player={lat:n.lat+.00008,lng:n.lng+.00007};s.selected=id;
    let gain=0,first=false;
    if(!s.discovered.includes(id)){s.discovered.push(id);first=true;journal(s,`Discovered ${n.name}. Its echo is yours to keep.`);}
    if(s.collected[id]!==s.cycle){gain=Math.min(MAX_LUMEN-s.lumen,first?4:2);s.lumen+=gain;s.collected[id]=s.cycle;}
    return {ok:true,first,gain,distance:distanceMeters(s.player,n)};
  }
  function quietCollect(s){if(s.quietCycle===s.cycle)return {ok:false,reason:'The beacon has rested for this pulse.'};s.quietCycle=s.cycle;const gain=Math.min(MAX_LUMEN-s.lumen,2);s.lumen+=gain;return {ok:true,gain};}
  function attune(s,id){
    const n=NODES.find(n=>n.id===id);if(!n)return {ok:false,reason:'Unknown node'};
    if(s.lumen<ATTUNE_COST)return {ok:false,reason:'Gather more Lumen first.'};
    const d=distanceMeters(s.player,n),close=proximity(d)==='near';
    if(!close&&!s.discovered.includes(id))return {ok:false,reason:'First discover this signal by visiting it.'};
    s.lumen-=ATTUNE_COST;
    const gain=close?2:1;
    s.pending[id]=(s.pending[id]||0)+gain;
    s.charge[id]=(s.charge[id]||0)+gain;
    if(!s.discovered.includes(id))s.discovered.push(id);
    journal(s,`Sent ${close?'a clear':'a distant'} pulse to ${n.name}.`);
    return {ok:true,gain,close};
  }
  function edges(s){const result=[];for(let i=0;i<NODES.length;i++)for(let j=i+1;j<NODES.length;j++)if((s.world[NODES[i].id]||0)>=CHARGE_TARGET&&(s.world[NODES[j].id]||0)>=CHARGE_TARGET)result.push([NODES[i].id,NODES[j].id]);return result;}
  function pulse(s){
    const before=edges(s).length;let changed=false;
    for(const n of NODES){const id=n.id;if(s.pending[id]){s.world[id]=clamp((s.world[id]||0)+s.pending[id],0,9999);s.pending[id]=0;changed=true;}}
    s.cycle+=1;const after=edges(s).length;const fieldOpen=!s.field&&FIELD_IDS.every(id=>(s.world[id]||0)>=CHARGE_TARGET);
    if(fieldOpen){s.field=true;journal(s,'The first resonance field awakened. The city has found a chord.');}
    return {changed,newEdges:after-before,fieldOpen,cycle:s.cycle};
  }
  function bars(s,id){const n=NODES.find(n=>n.id===id);if(!n)return 0;return proximity(distanceMeters(s.player,n))==='near'?3:proximity(distanceMeters(s.player,n))==='faint'?2:1;}
  return {VERSION,NODES,FIELD_IDS,MAX_LUMEN,ATTUNE_COST,CHARGE_TARGET,START,blank,sanitize,visit,quietCollect,attune,edges,pulse,distanceMeters,proximity,bars};
});
