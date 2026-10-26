/* MAJAKKA v0.8 — deterministic personal Lumen field. Pure, testable rules. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.MajakkaLumenCore=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const EARTH=6378137,PI=Math.PI,CELL=140,RANGE=990,PICKUP=30,MAX_LAT=80;
function valid(p){return p&&Number.isFinite(p.lat)&&Number.isFinite(p.lng)&&Math.abs(p.lat)<=MAX_LAT&&Math.abs(p.lng)<=180;}
function merc(p){if(!valid(p))throw Error('Invalid position');const a=p.lat*PI/180;return{x:EARTH*p.lng*PI/180,y:EARTH*Math.log(Math.tan(PI/4+a/2))};}
function unmerc(x,y){return{lng:x/EARTH*180/PI,lat:(2*Math.atan(Math.exp(y/EARTH))-PI/2)*180/PI};}
function hash(s){let h=2166136261>>>0;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619)>>>0;return h>>>0;}
function random(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=Math.imul(a^(a>>>15),1|a);t^=t+Math.imul(t^(t>>>7),61|t);return((t^(t>>>14))>>>0)/4294967296;};}
function grainId(seed,gx,gy,index){
 // The fixed worldwide field must not collide at two distant geographic cells.
 return seed==='majakka-global-world-lumen-v1'?'lumen:'+gx+':'+gy+':'+index:
  hash(seed+'|claim|'+gx+'|'+gy+'|'+index).toString(36);
}
function cells(center,personalSeed,radius=RANGE){
const{x,y}=merc(center);if(typeof personalSeed!=='string'||personalSeed.length<16)throw Error('Missing personal seed');
const scale=Math.max(.18,Math.cos(center.lat*PI/180));
const extent=Math.min(5000,Math.max(150,radius/scale)),out=[];
for(let gx=Math.floor((x-extent)/CELL);gx<=Math.floor((x+extent)/CELL);gx++)for(let gy=Math.floor((y-extent)/CELL);gy<=Math.floor((y+extent)/CELL);gy++){
const r=random(hash(personalSeed+'|'+gx+'|'+gy)),count=r()<.25?1:2;
for(let i=0;i<count;i++){
const px=(gx+.1+r()*.8)*CELL,py=(gy+.1+r()*.8)*CELL;
if(Math.hypot(px-x,py-y)>extent)continue;
const roll=r(),size=roll<.72?'dust':roll<.95?'glow':'heart';
out.push({...unmerc(px,py),id:grainId(personalSeed,gx,gy,i),size,value:size==='heart'?3:size==='glow'?2:1,x:px,y:py});
}}
return out;
}
/* Stable WORLD-WIDE screen coverage: points are anchored to global Mercator
   lattice coordinates, never to the camera. Level of detail selects an existing
   global grain inside each fixed coarse cell, not a new camera-centred cloud. */
function visibleField(center,seed,{zoom=15,width=390,height=700,pitch=0,max=240}={}){
 if(!valid(center)||typeof seed!=='string'||seed.length<16)throw Error('Invalid field');
 const z=Math.max(4,Math.min(19,Number(zoom)||15));
 const w=Math.max(120,Math.min(1800,Number(width)||390));
 const h=Math.max(120,Math.min(2500,Number(height)||700));
 const metersPerPixel=2*PI*EARTH/(256*2**z);
 const pitchFactor=1+Math.max(0,Math.min(1.35,Number(pitch)||0));
 const size= Math.max(40,Math.min(240,Number(max)||240));
 const centerMeters=merc(center);
 const halfX=Math.min(400000,w*metersPerPixel*(.56+.2*(pitchFactor-1)));
 const halfY=Math.min(400000,h*metersPerPixel*(.58+.55*(pitchFactor-1)));
 let step=1;
 while(step*CELL<metersPerPixel*65&&step<4096)step*=2;
 function range(){
  const grain=step*CELL;
  return {x0:Math.floor((centerMeters.x-halfX)/grain),x1:Math.floor((centerMeters.x+halfX)/grain),
    y0:Math.floor((centerMeters.y-halfY)/grain),y1:Math.floor((centerMeters.y+halfY)/grain)};
 }
 let r=range();
 while((r.x1-r.x0+1)*(r.y1-r.y0+1)>size&&step<8192){step*=2;r=range();}
 const points=[];
 for(let gx=r.x0;gx<=r.x1;gx++)for(let gy=r.y0;gy<=r.y1;gy++){
  // Hierarchical global subsampling: every distant grain survives when zooming in.
  // Each power-of-two parent selects exactly one child, recursively.
  let fineX=gx,fineY=gy,level=step;
  while(level>1){
   const pick=hash(seed+'|lod|'+level+'|'+fineX+'|'+fineY);
   fineX=fineX*2+(pick&1);
   fineY=fineY*2+((pick>>>1)&1);
   level/=2;
  }
  const rnd=random(hash(seed+'|'+fineX+'|'+fineY));
  rnd(); // The first draw is the 1-vs-2 grain count in cells().
  const x=(fineX+.1+rnd()*.8)*CELL,y=(fineY+.1+rnd()*.8)*CELL;
  const roll=rnd(),sizeName=roll<.72?'dust':roll<.95?'glow':'heart';
  const coords=unmerc(x,y);
  if(!valid(coords))continue;
  points.push({...coords,id:grainId(seed,fineX,fineY,0),
   x,y,size:sizeName,value:sizeName==='heart'?3:sizeName==='glow'?2:1});
 }
 return points;
}
function segmentDistance(p,a,b){const px=p.x-a.x,py=p.y-a.y,dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,(px*dx+py*dy)/(dx*dx+dy*dy||1)));return Math.hypot(px-t*dx,py-t*dy);}
function pickups(points,from,to,{accuracy=Infinity,accepted=false,firstFix=false,claimed=new Set(),radius=PICKUP}={}){
if(!valid(to)||accuracy>35||accuracy<0||(!accepted&&!firstFix))return[];
if(from&&!valid(from))return[];
const a=merc(from||to),b=merc(to),scale=Math.max(.18,Math.cos(to.lat*PI/180));
if(Math.hypot(a.x-b.x,a.y-b.y)*scale>145)return[];
const r=Math.min(40,Math.max(5,radius));
return points.filter(p=>!claimed.has(p.id)&&segmentDistance(p,a,b)*scale<=r).sort((p,q)=>segmentDistance(p,a,b)-segmentDistance(q,a,b));
}
function bearing(a,b){if(!valid(a)||!valid(b))return null;const A=a.lat*PI/180,B=b.lat*PI/180,d=(b.lng-a.lng)*PI/180,y=Math.sin(d)*Math.cos(B),x=Math.cos(A)*Math.sin(B)-Math.sin(A)*Math.cos(B)*Math.cos(d);if(Math.abs(x)+Math.abs(y)<1e-10)return null;return(Math.atan2(y,x)*180/PI+360)%360;}
return{CELL,RANGE,PICKUP,cells,visibleField,pickups,bearing,merc,valid};
});