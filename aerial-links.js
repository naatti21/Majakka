/* MAJAKKA aerial mycelium: meter-scaled gently wandering arcs above node cores.
   MapLibre fill-extrusion geometry; no ground paths or screen-space billboards. */
(function(root,factory){
 const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;
 root.MajakkaAerialLinks=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const rad=Math.PI/180;
 const DEG=111320;
 function build(pairs,segments=16){
  const halo=[],core=[];
  for(let k=0;k<pairs.length;k++){
   const [a,b]=pairs[k];if(!a||!b)continue;
   const lat0=(a.lat+b.lat)/2,c=Math.max(.15,Math.cos(lat0*rad));
   const north=(b.lat-a.lat)*DEG,east=(b.lng-a.lng)*DEG*c;
   const length=Math.hypot(north,east);if(length<8||length>4000)continue;
   const curve=Math.min(17,length*.11)*(k%2?-1:1);
   const xNormal=-north/length,yNormal=east/length;
   const coordinates=t=>{
    const side=curve*Math.sin(Math.PI*t)+Math.sin(2*Math.PI*t+k*.6)*curve*.24;
    return {n:north*t+xNormal*side,e:east*t+yNormal*side};
   };
   const at=(n,e)=>[a.lng+e/(DEG*c),a.lat+n/DEG];
   for(let i=0;i<segments;i++){
    const t0=i/segments,t1=(i+1)/segments,t=(i+.5)/segments;
    const A=coordinates(t0),B=coordinates(t1),delta={n:B.n-A.n,e:B.e-A.e};
    const mag=Math.hypot(delta.n,delta.e)||1;
    const side={n:-delta.e/mag,e:delta.n/mag};
    const height=48+25*Math.sin(Math.PI*t)+3*Math.sin(4*Math.PI*t+k);
    function shape(width,base,top,name,color){
     const w=width/2,pts=[at(A.n+side.n*w,A.e+side.e*w),at(B.n+side.n*w,B.e+side.e*w),
      at(B.n-side.n*w,B.e-side.e*w),at(A.n-side.n*w,A.e-side.e*w)];
     pts.push(pts[0]);
     return {type:'Feature',properties:{pair:k,segment:i,height:top,base:base,color},
      geometry:{type:'Polygon',coordinates:[pts]}};
    }
    halo.push(shape(10,height-8,height+7,'halo','#7bd5c3'));
    core.push(shape(3.2,height-2,height+2,'core','#f2d7a2'));
   }
  }
  return {halo,core};
 }
 return {build};
});
