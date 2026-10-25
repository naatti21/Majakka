/* MAJAKKA live field — pure calculations. GPS positions stay in memory only. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.MajakkaLiveCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const DURATION_MS=12*60*1000;
 const MOVE_METERS=180;
 const MOVE_COOLDOWN_MS=90*1000;
 const MAX_MOVE_REWARDS=3;
 const SCAN_COOLDOWN_MS=90*1000;
 const EARTH=6371000;
 function validFix(coords,time){
  if(!coords||!Number.isFinite(coords.latitude)||!Number.isFinite(coords.longitude)||!Number.isFinite(coords.accuracy))return null;
  const {latitude:lat,longitude:lng,accuracy}=coords;
  if(lat< -90||lat>90||lng< -180||lng>180||accuracy<0||accuracy>5000)return null;
  const speed=Number.isFinite(coords.speed)&&coords.speed>=0?coords.speed:null;
  return {lat,lng,accuracy,speed,time:Number.isFinite(time)?time:Date.now()};
 }
 function distance(a,b){
  if(!a||!b)return Infinity;
  const x=Math.PI/180,delta=(b.lat-a.lat)*x,lon=(b.lng-a.lng)*x;
  const q=Math.sin(delta/2)**2+Math.cos(a.lat*x)*Math.cos(b.lat*x)*Math.sin(lon/2)**2;
  return 2*EARTH*Math.asin(Math.sqrt(Math.min(1,Math.max(0,q))));
 }
 function canRewardMove(anchor,fix,now,lastRewardAt,rewardCount){
  if(!anchor||!fix||fix.accuracy>65||anchor.accuracy>65||fix.time<anchor.time)return false;
  if(rewardCount>=MAX_MOVE_REWARDS||now-lastRewardAt<MOVE_COOLDOWN_MS)return false;
  if(fix.speed!==null&&fix.speed>8)return false;
  const meters=distance(anchor,fix),elapsed=(fix.time-anchor.time)/1000;
  if(elapsed<=0||meters/elapsed>8)return false;
  return meters>=MOVE_METERS;
 }
 function canScan(now,lastScanAt,scanCount){return scanCount<2&&(lastScanAt===null||now-lastScanAt>=SCAN_COOLDOWN_MS);}
 return {DURATION_MS,MOVE_METERS,MOVE_COOLDOWN_MS,MAX_MOVE_REWARDS,SCAN_COOLDOWN_MS,validFix,distance,canRewardMove,canScan};
});