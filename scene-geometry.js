/* MAJAKKA — physical-scale GeoJSON primitives for the optional 3D map.
   Visual-only geometries, no geolocation storage or public node creation. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.MajakkaSceneGeometry=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const DEG=111320;
 const colors={quiet:'#69dcca',awake:'#efc984',rift:'#aa6cc9',restored:'#eec784',trial:'#6accbd',corrupted:'#6c667f',distant:'#456f78',player:'#79e9e0',lumen:'#f2d18d','atlas-real':'#8de5d1','atlas-echo':'#486b7a'};
 const archetypes={art:'#ba9ce7',history:'#e4bc82',nature:'#89d8ae',culture:'#8fd9df'};
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
  const ground=[],shafts=[],cores=[],targets=[],lumens=[],facets=[];
  for(const p of points){
   const kind=p.kind||'quiet',color=p.sharedCharge>=2?colors.awake:(archetypes[p.type||p.archetype]||colors[kind]||colors.quiet);
   if(kind==='lumen'){
    lumens.push(dot(p.id,'lumen',p,color));
    continue;
   }
   const main=kind==='player',rift=kind==='rift',restored=kind==='restored',atlas=kind==='atlas-real'||kind==='atlas-echo';
   const radius=main?15:rift?38:atlas?kind==='atlas-echo'?12:25:kind==='trial'?21:kind==='distant'?13:27;
   const tall=main?9:rift?40:restored?46:p.sharedCharge>=2?60:atlas?kind==='atlas-echo'?16:30:kind==='awake'?65:kind==='distant'?21:51;
   ground.push(shape(p.id,'aura',p,radius,0,color));
   ground.push(shape(p.id,'footprint',p,radius*.43,0,color));
   shafts.push(shape(p.id,'light-shell',p,main?4.5:rift?8:9,tall,color));
   shafts.push(shape(p.id,'light-core',p,main?2.3:rift?3:3.4,tall*.76,color));
   if(!main&&!rift&&kind!=='distant'&&kind!=='atlas-echo'){
    const type=p.type||p.archetype||'culture',arms=type==='art'?3:type==='nature'?5:type==='history'?4:6;
    for(let i=0;i<arms;i++){
     const angle=i*2*Math.PI/arms,dist=type==='nature'?10:7;
     const point={lat:p.lat+Math.cos(angle)*dist/111320,lng:p.lng+Math.sin(angle)*dist/(111320*Math.max(.18,Math.cos(p.lat*Math.PI/180)))};
     facets.push(shape(p.id,'facet',point,type==='history'?2.7:2.2,tall*(.45+.25*(i%3)),color));
    }
   }
   cores.push(dot(p.id,'core',p,color));
   targets.push(dot(p.id,'target',p,color));
  }
  return {ground,shafts,cores,targets,lumens,facets};
 }
 return {circle,shape,dot,build,colors};
});
