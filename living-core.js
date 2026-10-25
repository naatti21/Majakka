/* MAJAKKA v0.5 — ephemeral living-world playground. No POI database, no saved GPS. */
(function(root,factory){
 const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;
 root.MajakkaLivingCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const rad=Math.PI/180,earth=6371000;
 const COST_NEAR=2,COST_FAR=3,NODE_TARGET=2,RIFT_TARGET=2,MAX_CYCLES=10;
 const offsets=[[38,-45],[110,22],[-80,114]],riftOffset=[-12,32];
 function addMeters(c,n,e){return {lat:c.lat+n/111320,lng:c.lng+e/(111320*Math.max(.15,Math.cos(c.lat*rad)))};}
 function meters(a,b){
  if(!a||!b)return Infinity;
  const dLat=(b.lat-a.lat)*rad,dLon=(b.lng-a.lng)*rad;
  const q=Math.sin(dLat/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dLon/2)**2;
  return 2*earth*Math.asin(Math.sqrt(Math.min(1,Math.max(0,q))));
 }
 function positions(origin){
  if(!origin||![origin.lat,origin.lng].every(Number.isFinite)||Math.abs(origin.lat)>80||Math.abs(origin.lng)>180)throw Error('Invalid origin');
  const nodes=offsets.map(([n,e],i)=>({...addMeters(origin,n,e),id:'echo-'+i,name:['Stillwater','Wanderlight','Hollow Chord'][i],kind:'node',level:0}));
  const rift={...addMeters(origin,...riftOffset),id:'veil',name:'Interference Veil',kind:'rift'};
  const lumen=[0,1,2,3,4,5].map(i=>{
   const angle=i*2.399963,dist=27+(i%3)*19;
   return {...addMeters(origin,Math.cos(angle)*dist,Math.sin(angle)*dist),id:'spark-'+i,kind:'lumen'};
  });
  return {nodes,rift,lumen};
 }
 function blank(){return {cycle:0,nodes:[0,0,0],pending:[0,0,0],lastNodeCycle:[-1,-1,-1],rift:0,riftPending:false,riftLastCycle:-1,riftClear:false,field:false,interference:0,visited:[],claimed:[],feedback:[],pulseBonus:false};}
 function near(player,point,accuracy=0){return !!player&&accuracy<=90&&meters(player,point)<=85;}
 function contribute(s,{target,method,player,accuracy,lumen,world}){
  if(!world||!['lumen','decode'].includes(method))return {ok:false,reason:'Unknown signal'};
  const pos=target==='veil'?world.rift:world.nodes.find(n=>n.id===target);
  if(!pos)return {ok:false,reason:'Unknown light'};
  if(target==='veil'){
   if(s.riftClear)return {ok:false,reason:'This interference has already been restored'};
   if(s.riftPending||s.riftLastCycle===s.cycle)return {ok:false,reason:'One restoration pulse per cycle'};
   const cost=method==='lumen'?2:0;
   if(lumen<cost)return {ok:false,reason:'Gather Lumen or decode for free'};
   s.riftPending=true;s.riftLastCycle=s.cycle;return {ok:true,cost,reason:'Interference weakened. Advance the world pulse to settle it.'};
  }
  const i=world.nodes.indexOf(pos);
  if(s.nodes[i]>=NODE_TARGET)return {ok:false,reason:'This node is awake. Its light is yours to explore.'};
  if(s.pending[i]||s.lastNodeCycle[i]===s.cycle)return {ok:false,reason:'The signal needs the next world pulse'};
  const close=near(player,pos,accuracy),cost=method==='lumen'?(close?COST_NEAR:COST_FAR):0;
  if(lumen<cost)return {ok:false,reason:'Gather more Lumen, or decode the signal'};
  const gain=close?2:1;
  s.pending[i]=gain;s.lastNodeCycle[i]=s.cycle;
  if(!s.visited.includes(target))s.visited.push(target);
  return {ok:true,cost,gain,close,reason:close?'Strong resonance stored.':'Distant resonance stored. Move closer only when convenient.'};
 }
 function pulse(s){
  if(s.cycle>=MAX_CYCLES)return {ok:false,reason:'Preview has reached its final world pulse'};
  s.cycle++;
  let awakened=0;
  for(let i=0;i<3;i++){
   if(s.pending[i]){
    const before=s.nodes[i];s.nodes[i]=Math.min(NODE_TARGET,s.nodes[i]+s.pending[i]);
    if(before<NODE_TARGET&&s.nodes[i]===NODE_TARGET)awakened++;
    s.pending[i]=0;
   }
  }
  let cleared=false;
  if(s.riftPending){
   s.rift=Math.min(RIFT_TARGET,s.rift+1);s.riftPending=false;
   if(s.rift>=RIFT_TARGET){s.riftClear=true;cleared=true;}
  }
  if(!s.riftClear)s.interference=Math.min(3,s.interference+1);
  else s.interference=0;
  const opened=!s.field&&s.nodes.every(n=>n>=NODE_TARGET);
  if(opened)s.field=true;
  return {ok:true,opened,cleared,awakened,reward:(cleared?3:0)+(opened?3:0),reason:opened?'The first living field awakened.':cleared?'Interference restored. The light returns.':'The world breathes. New signals settle.'};
 }
 function collect(s,id,player,accuracy,world){
  const point=world?.lumen?.find(x=>x.id===id);if(!point)return {ok:false,reason:'Unknown light'};
  if(s.claimed.includes(id))return {ok:false,reason:'This spark has already been gathered'};
  if(!near(player,point,accuracy))return {ok:false,reason:'Signal too faint for collection. You can still play from here.'};
  s.claimed.push(id);return {ok:true,reward:1,reason:'Lumen gathered'};
 }
 function projection(s,w){
  return {nodes:w.nodes.map((n,i)=>({...n,kind:s.nodes[i]>=NODE_TARGET?'awake':(!s.riftClear&&s.interference>0&&meters(n,w.rift)<160?'corrupted':'trial'),strength:s.nodes[i]})),
   rift:{...w.rift,kind:s.riftClear?'restored':'rift'},lumen:w.lumen.filter(x=>!s.claimed.includes(x.id)),
   edges:s.nodes.every(n=>n>=NODE_TARGET)?[[w.nodes[0].id,w.nodes[1].id],[w.nodes[1].id,w.nodes[2].id],[w.nodes[2].id,w.nodes[0].id]]:[],
   field:s.field,interference:s.interference,cycle:s.cycle};
 }
 return {COST_NEAR,COST_FAR,NODE_TARGET,RIFT_TARGET,MAX_CYCLES,blank,positions,addMeters,meters,near,contribute,pulse,collect,projection};
});
