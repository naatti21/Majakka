/* Majakka LIVE motion economy. Session memory only: no route or location persists. */
(function(root,factory){
 const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;
 root.MajakkaWalkEnergy=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const METERS_PER_LUMEN=70,MAX_ACCURACY=35,MIN_MOVE=12,MAX_STEP=145;
 const earth=6371000,rad=Math.PI/180;
 function distance(a,b){
  if(!a||!b)return Infinity;
  const phi=(b.lat-a.lat)*rad,lambda=(b.lng-a.lng)*rad;
  const h=Math.sin(phi/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(lambda/2)**2;
  return 2*earth*Math.asin(Math.sqrt(Math.min(1,Math.max(0,h))));
 }
 function create(){
  let anchor=null,total=0,valid=0;
  return {
   feed(fix){
    const none={meters:0,gain:0,total,remaining:Math.max(0,METERS_PER_LUMEN-total),accepted:false};
    if(!fix||![fix.lat,fix.lng,fix.accuracy,fix.time].every(Number.isFinite)||fix.accuracy>MAX_ACCURACY||fix.accuracy<0)return none;
    if(!anchor){anchor=fix;return none;}
    if(fix.time<=anchor.time)return none;
    const elapsed=(fix.time-anchor.time)/1000,step=distance(anchor,fix),minStep=Math.max(MIN_MOVE,1.4*Math.max(anchor.accuracy,fix.accuracy));
    if(elapsed>180||step>MAX_STEP||step/elapsed>4.5||fix.speed!==null&&fix.speed!==undefined&&fix.speed>4.5){
      anchor=fix;return none;
    }
    if(step<minStep)return none;
    // Ignore sub-walking movement when the OS provides a reliable near-zero speed.
    if(fix.speed!==null&&fix.speed!==undefined&&fix.speed<.32&&step/elapsed<.5)return none;
    anchor=fix;valid++;
    total+=step;
    const gain=Math.floor(total/METERS_PER_LUMEN);
    total-=gain*METERS_PER_LUMEN;
    return {meters:step,gain,total,remaining:METERS_PER_LUMEN-total,accepted:true,valid};
   },
   reset(){anchor=null;total=0;valid=0;},
   stats(){return {remaining:METERS_PER_LUMEN-total,valid};}
  };
 }
 return {create,distance,METERS_PER_LUMEN,MAX_ACCURACY};
});
