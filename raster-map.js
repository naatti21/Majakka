/* MAJAKKA — first-party raster map engine. No CDN JavaScript or WebGL needed.
   Uses only currently visible OpenStreetMap Standard tiles; browser HTTP cache applies. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.MajakkaRaster=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const T=256,MAX_LAT=85.05112878;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const projectWorld=(lng,lat,z)=>{
  const size=T*2**z,phi=clamp(lat,-MAX_LAT,MAX_LAT)*Math.PI/180;
  return {x:(lng+180)/360*size,y:(1-Math.asinh(Math.tan(phi))/Math.PI)/2*size};
 };
 const unprojectWorld=(x,y,z)=>{
  const size=T*2**z;
  return {lng:((x/size*360)%360+360)%360-180,
          lat:Math.atan(Math.sinh(Math.PI*(1-2*clamp(y/size,0,1))))*180/Math.PI};
 };
 const span=(a,b,size)=>{let d=a-b;if(d>size/2)d-=size;if(d< -size/2)d+=size;return d;};
 class Map {
  constructor(options){
   this.el=typeof options.container==='string'?document.getElementById(options.container):options.container;
   if(!this.el)throw new Error('Missing map container');
   this._center={lng:options.center[0],lat:options.center[1]};
   this._zoom=clamp(Math.round(options.zoom||14),3,19);
   this.minZoom=options.minZoom??3;this.maxZoom=options.maxZoom??19;
   this.listeners=new globalThis.Map();this.tiles=new globalThis.Map();
   this._ready=false;this._destroyed=false;this._failed=0;this._pointers=new globalThis.Map();this._lastPinch=0;
   this.touchZoomRotate={disableRotation(){}};
   this.el.classList.add('raster-map');this.el.style.opacity='1';
   this.surface=document.createElement('div');this.surface.className='raster-surface';this.el.replaceChildren(this.surface);
   this._down=e=>this._pointerDown(e);this._move=e=>this._pointerMove(e);this._up=e=>this._pointerUp(e);
   this._wheel=e=>{e.preventDefault();this._zoomBy(e.deltaY<0?1:-1);};
   this.el.addEventListener('pointerdown',this._down);
   this.el.addEventListener('pointermove',this._move);
   this.el.addEventListener('pointerup',this._up);
   this.el.addEventListener('pointercancel',this._up);
   this.el.addEventListener('wheel',this._wheel,{passive:false});
   this._timeout=setTimeout(()=>{if(!this._ready&&!this._destroyed)this._emit('error',new Error('No geographical map tiles received. Check network or map provider.'));},12000);
   queueMicrotask(()=>this._draw());
  }
  on(event,handler){const arr=this.listeners.get(event)||[];arr.push(handler);this.listeners.set(event,arr);return this;}
  _emit(event,arg){for(const fn of this.listeners.get(event)||[])try{fn(arg);}catch(error){console.warn('Map listener failed',error);}}
  getCenter(){return {...this._center};}
  getZoom(){return this._zoom;}
  project(coord){
   const pos=projectWorld(coord[0],coord[1],this._zoom),ctr=projectWorld(this._center.lng,this._center.lat,this._zoom),size=T*2**this._zoom;
   return {x:this.el.clientWidth/2+span(pos.x,ctr.x,size),y:this.el.clientHeight/2+pos.y-ctr.y};
  }
  jumpTo(options){if(options.center){this._center={lng:options.center[0],lat:options.center[1]};}
   if(Number.isFinite(options.zoom))this._zoom=clamp(Math.round(options.zoom),this.minZoom,this.maxZoom);
   this._draw();return this;
  }
  flyTo(options){return this.jumpTo(options);}
  easeTo(options){return this.jumpTo(options);}
  _zoomBy(d){const z=clamp(this._zoom+d,this.minZoom,this.maxZoom);if(z!==this._zoom){this._zoom=z;this._draw();}}
  _pan(dx,dy){
   const c=projectWorld(this._center.lng,this._center.lat,this._zoom);
   this._center=unprojectWorld(c.x-dx,c.y-dy,this._zoom);this._draw();
  }
  _pointerDown(e){
   if(e.button!==0&&e.pointerType==='mouse')return;
   this._pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
   this.el.setPointerCapture?.(e.pointerId);
   this._lastPinch=0;
  }
  _pointerMove(e){
   const old=this._pointers.get(e.pointerId);if(!old)return;
   this._pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(this._pointers.size===1)this._pan(e.clientX-old.x,e.clientY-old.y);
   else if(this._pointers.size>=2){
    const p=[...this._pointers.values()],d=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);
    if(this._lastPinch&&Math.abs(d-this._lastPinch)>42){
     this._zoomBy(d>this._lastPinch?1:-1);this._lastPinch=d;
    }else if(!this._lastPinch)this._lastPinch=d;
   }
  }
  _pointerUp(e){this._pointers.delete(e.pointerId);this._lastPinch=0;}
  resize(){this._draw();}
  _draw(){
   if(this._destroyed)return;
   const w=this.el.clientWidth,h=this.el.clientHeight;
   if(w<2||h<2){this._emit('error',new Error('Map container has no size'));return;}
   const z=this._zoom,n=2**z,size=n*T,c=projectWorld(this._center.lng,this._center.lat,z);
   const left=c.x-w/2,top=c.y-h/2;
   // Request only tiles visible within this viewport, with no prefetch.
   const x0=Math.floor(left/T),x1=Math.floor((left+w-1)/T);
   const y0=Math.max(0,Math.floor(top/T)),y1=Math.min(n-1,Math.floor((top+h-1)/T));
   const keep=new Set();
   for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){
    const x=((tx%n)+n)%n,key=z+'/'+x+'/'+ty;keep.add(key);
    let tile=this.tiles.get(key);
    if(!tile){
     tile=document.createElement('img');tile.className='raster-tile';tile.alt='';
     tile.draggable=false;tile.decoding='async';tile.referrerPolicy='strict-origin-when-cross-origin';
     tile.onload=()=>{
      if(this._destroyed)return;
      if(!this._ready){this._ready=true;clearTimeout(this._timeout);this._emit('load');}
     };
     tile.onerror=()=>{if(!this._destroyed){this._failed++;if(this._failed>=6&&!this._ready)this._emit('error',new Error('Map tiles unavailable.'));}};
     this.tiles.set(key,tile);this.surface.appendChild(tile);
     tile.src='https://tile.openstreetmap.org/'+key+'.png';
    }
    tile.style.left=(tx*T-left)+'px';tile.style.top=(ty*T-top)+'px';
   }
   for(const [key,tile] of this.tiles)if(!keep.has(key)){tile.remove();this.tiles.delete(key);}
   this._emit('move');
  }
  remove(){
   if(this._destroyed)return;
   this._destroyed=true;clearTimeout(this._timeout);
   this.el.removeEventListener('pointerdown',this._down);this.el.removeEventListener('pointermove',this._move);
   this.el.removeEventListener('pointerup',this._up);this.el.removeEventListener('pointercancel',this._up);
   this.el.removeEventListener('wheel',this._wheel);
   this.el.replaceChildren();this.tiles.clear();this.listeners.clear();
  }
 }
 return {Map,projectWorld,unprojectWorld};
});
