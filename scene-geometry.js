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
 // Compact polygonal shards, not enormous cylindrical light posts.
 function fragment(point,id,color,index,count,height,spread){
  const direction=2*Math.PI*index/count;
  const offset=index===0?0:spread*(.42+.18*(index%3));
  const cx=point.lng+Math.cos(direction)*offset/(DEG*Math.max(.15,Math.cos(point.lat*Math.PI/180)));
  const cy=point.lat+Math.sin(direction)*offset/DEG;
  const sides=[3,4,5,3,6][index%5],radius=(index===0?3.0:1.35+.32*(index%3));
  const vertices=[];
  for(let i=0;i<=sides;i++){
   const ang=direction+i*Math.PI*2/sides,dist=radius*(i%2===0?1:.79);
   vertices.push([cx+Math.cos(ang)*dist/(DEG*Math.max(.15,Math.cos(cy*Math.PI/180))),cy+Math.sin(ang)*dist/DEG]);
  }
  return {type:'Feature',properties:{id,part:'facet',color,height,base:index===0?0:height*.16},geometry:{type:'Polygon',coordinates:[vertices]}};
 }
 function build(points){
  const ground=[],shafts=[],cores=[],targets=[],lumens=[],facets=[];
  for(const p of points){
   const kind=p.kind||'quiet',awake=kind==='awake'||kind==='restored'||p.sharedCharge>=2;
   const color=awake?colors.awake:(archetypes[p.type||p.archetype]||colors[kind]||colors.quiet);
   if(kind==='lumen'){lumens.push({...dot(p.id,'lumen',p,color),properties:{id:p.id,part:'lumen',color,size:p.size||'dust'}});continue;}
   const player=kind==='player',rift=kind==='rift'||kind==='corrupted',distant=kind==='distant';
   const echo=kind==='atlas-echo',real=kind==='atlas-real';
   const height=player?3:rift?7:distant?4:awake?19:echo?8:real?12:11;
   const radius=player?7:rift?19:distant?9:awake?18:echo?10:14;
   ground.push(shape(p.id,'aura',p,radius,0,color));
   ground.push(shape(p.id,'footprint',p,Math.max(3,radius*.36),0,color));
   // A faint, low pedestal under the sculpture; vertical pillars removed.
   shafts.push(shape(p.id,'light-shell',p,player?1.3:2.0,height*.31,color));
   shafts.push(shape(p.id,'light-core',p,player?.6:.9,height*.44,color));
   if(!player&&!distant){
    const archetype=p.type||p.archetype||'culture';
    const count=rift?3:archetype==='nature'?5:archetype==='art'?3:archetype==='history'?4:4;
    for(let i=0;i<count;i++){
     const tall=height*(i===0?1:(.45+.09*((i+2)%3)));
     facets.push(fragment(p,p.id,color,i,count,tall,rift?5:6));
    }
   }
   cores.push(dot(p.id,'core',p,color));
   targets.push(dot(p.id,'target',p,color));
  }
  return {ground,shafts,cores,targets,lumens,facets};
 }
 return {circle,shape,dot,build,colors};
});
