/* MAJAKKA — physical-scale GeoJSON primitives for the optional 3D map.
   Visual-only geometries, no geolocation storage or public node creation. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.MajakkaSceneGeometry=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const DEG=111320;
 const colors={quiet:'#69dcca',awake:'#efc984',rift:'#aa6cc9',restored:'#eec784',trial:'#6accbd',corrupted:'#6c667f',player:'#79e9e0',lumen:'#f2d18d'};
 function circle(point,meters,segments=24){
  if(!point||!Number.isFinite(point.lat)||!Number.isFinite(point.lng)||!Number.isFinite(meters)||meters<=0)throw new Error('Invalid geometry');
  const latRadius=meters/DEG,lngRadius=meters/(DEG*Math.max(.08,Math.cos(point.lat*Math.PI/180))),coords=[];
  for(let i=0;i<=segments;i++){
   const angle=2*Math.PI*i/segments;
   coords.push([point.lng+Math.cos(angle)*lngRadius,point.lat+Math.sin(angle)*latRadius]);
  }
  return {type:'Polygon',coordinates:[coords]};
 }
 const shape=(id,part,point,radius,height,color)=>({type:'Feature',properties:{id,part,color,height},geometry:circle(point,radius)});
 const dot=(id,part,point,color)=>({type:'Feature',properties:{id,part,color},geometry:{type:'Point',coordinates:[point.lng,point.lat]}});
 function build(points){
  const ground=[],shafts=[],cores=[],targets=[],lumens=[];
  for(const p of points){
   const kind=p.kind||'quiet',color=colors[kind]||colors.quiet;
   if(kind==='lumen'){
    lumens.push(dot(p.id,'lumen',p,color));
    continue;
   }
   const main=kind==='player',rift=kind==='rift',restored=kind==='restored';
   const radius=main?15:rift?38:kind==='trial'?21:27;
   const tall=main?9:rift?40:restored?46:kind==='awake'?65:51;
   ground.push(shape(p.id,'aura',p,radius,0,color));
   ground.push(shape(p.id,'footprint',p,radius*.43,0,color));
   shafts.push(shape(p.id,'light-shell',p,main?4.5:rift?8:9,tall,color));
   shafts.push(shape(p.id,'light-core',p,main?2.3:rift?3:3.4,tall*.76,color));
   cores.push(dot(p.id,'core',p,color));
   targets.push(dot(p.id,'target',p,color));
  }
  return {ground,shafts,cores,targets,lumens};
 }
 return {circle,shape,dot,build,colors};
});
