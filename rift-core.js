/* Majakka interference experiment — isolated, deterministic local-domain core. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.MajakkaRift=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const TARGET=3,COST=2,REWARD=3,VERSION=1;
 const blank=()=>({version:VERSION,committed:0,pending:0,lastCycle:-1,cleared:false,rewarded:false});
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 function sanitize(input){
  const s=blank();if(!input||input.version!==VERSION)return s;
  s.committed=clamp(Number.isInteger(input.committed)?input.committed:0,0,TARGET);
  s.pending=clamp(Number.isInteger(input.pending)?input.pending:0,0,1);
  s.lastCycle=Number.isInteger(input.lastCycle)?clamp(input.lastCycle,-1,99999):-1;
  s.cleared=Boolean(input.cleared)||s.committed===TARGET;
  s.rewarded=Boolean(input.rewarded);
  if(s.cleared){s.committed=TARGET;s.pending=0;}
  return s;
 }
 function canContribute(s,cycle){return !s.cleared&&s.lastCycle!==cycle&&s.pending===0;}
 function contribute(s,{cycle,lumen,method}){
  if(!canContribute(s,cycle))return {ok:false,reason:s.cleared?'Already restored. This place remains a quiet refuge.':'One contribution per world pulse. Let the signal settle.'};
  if(method!=='skill'&&method!=='lumen')return {ok:false,reason:'Unknown method'};
  if(method==='lumen'&&lumen<COST)return {ok:false,reason:'Gather more Lumen or decode the signal.'};
  s.pending=1;s.lastCycle=cycle;
  return {ok:true,cost:method==='lumen'?COST:0,reason:'Resonance stored. The next world pulse will carry it.'};
 }
 function pulse(s){
  if(s.cleared)return {changed:false,cleared:false,reward:0};
  const had=s.pending>0;
  s.committed=clamp(s.committed+s.pending,0,TARGET);
  s.pending=0;
  if(s.committed===TARGET){s.cleared=true;const reward=s.rewarded?0:REWARD;s.rewarded=true;return {changed:true,cleared:true,reward};}
  return {changed:had,cleared:false,reward:0};
 }
 return {TARGET,COST,REWARD,blank,sanitize,canContribute,contribute,pulse};
});