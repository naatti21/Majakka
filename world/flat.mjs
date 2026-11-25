// WebGL-free view of the same sourced street extract, nodes and private GPS fix.
export function flatMap(host,onMove,onPick,status){
 host.replaceChildren();
 const canvas=document.createElement('canvas');canvas.className='flat';host.append(canvas);
 const ctx=canvas.getContext('2d');
 let x=23.761,y=61.499,span=.015,features=[],nodes=[],fix,start,targets=[];
 function draw(){
  const w=canvas.width=host.clientWidth,h=canvas.height=host.clientHeight;
  const dy=span*Math.cos(y*Math.PI/180)*h/w;
  const project=([lng,lat])=>[(lng-x)/span*w+w/2,(y-lat)/dy*h+h/2];
  ctx.fillStyle='#111e26';ctx.fillRect(0,0,w,h);
  for(const f of features){
   const line=f.geometry.type==='LineString',pts=line?f.geometry.coordinates:f.geometry.coordinates[0];
   ctx.beginPath();pts.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](...project(p)));
   if(line){ctx.strokeStyle='#45565f';ctx.stroke();}else{ctx.fillStyle=({water:'#193846',park:'#203e37',building:'#29383e'})[f.properties.kind];ctx.fill();}
  }
  targets=[];
  for(const n of nodes.filter(n=>n.location)){
   const [px,py]=project([n.location.lng,n.location.lat]);targets.push({px,py,id:n.id});
   ctx.fillStyle='#efc479';ctx.beginPath();ctx.arc(px,py,7,0,Math.PI*2);ctx.fill();
  }
  if(fix){ctx.fillStyle='#8de6df';ctx.beginPath();ctx.arc(...project([fix.lng,fix.lat]),6,0,Math.PI*2);ctx.fill();}
 }
 function moved(){draw();const height=span*Math.cos(y*Math.PI/180)*canvas.height/canvas.width;
  onMove([x-span/2,y-height/2,x+span/2,y+height/2]);}
 canvas.onpointerdown=e=>{start=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId);};
 canvas.onpointerup=e=>{
  if(!start)return;const dx=e.clientX-start[0],dy=e.clientY-start[1];start=null;
  if(Math.hypot(dx,dy)>5){x-=dx*span/canvas.width;y=Math.max(-80,Math.min(80,y+dy*span*Math.cos(y*Math.PI/180)/canvas.width));moved();}
  else{const r=canvas.getBoundingClientRect();const pin=targets.find(p=>Math.hypot(p.px-e.clientX+r.left,p.py-e.clientY+r.top)<24);if(pin)onPick(pin.id);}
 };
 canvas.onwheel=e=>{e.preventDefault();span=Math.max(.003,Math.min(360,span*(e.deltaY>0?1.3:.77)));moved();};
 const observer=new ResizeObserver(moved);observer.observe(host);
 status('2D local map · central Tampere streets');
 fetch('./data/tampere-streets.geojson').then(r=>r.json()).then(f=>{features=f.features;draw();}).catch(()=>status('2D view · street data unavailable'));
 return {center(lng,lat){x=lng;y=lat;moved();},setNodes(v){nodes=v;draw();},gps(v){fix=v;draw();},dispose(){observer.disconnect();}};
}
