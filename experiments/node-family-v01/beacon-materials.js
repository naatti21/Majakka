// MAJAKKA / Beacon Family v0.1 — procedural physical surfaces.
// These are standalone, local generated textures; not borrowed third-party assets.
// Texture channels: color (sRGB), roughness (linear), bump (linear).
// "Species" here means the six Node gameplay roles, not Kaiku species.
export const BEACONS=Object.freeze([
  {id:'prism',name:'Prism',material:'Porcelain',role:'Valon taitto · väritehtävät',
   colors:['#e9e2d7','#6b91bc','#9e86cb']},
  {id:'archive',name:'Archive',material:'Stone',role:'Muistofragmentit · historia',
   colors:['#77706a','#ac9680','#ffd39a']},
  {id:'grove',name:'Grove',material:'Moss',role:'Häiriön rauhoitus · luonto',
   colors:['#345b3b','#82ae67','#c7ebac']},
  {id:'relay',name:'Relay',material:'Copper',role:'Valon haaroitus · yhteydet',
   colors:['#b37854','#4ca8a2','#ffd79f']},
  {id:'observer',name:'Observer',material:'Pearl / Mineral',role:'Kaukaisten Kaikujen havaitseminen',
   colors:['#bcc8d4','#9ea3cd','#a8ece9']},
  {id:'commons',name:'Commons',material:'Timber',role:'Yhteiset muistot · kulttuuri',
   colors:['#86674b','#bda27a','#ffd399']}
]);

// Stable procedural value noise: deterministic between sessions.
const hash=(ix,iy,seed)=>{
  let x=(Math.imul(ix,374761393)+Math.imul(iy,668265263)+Math.imul(seed,1442695041))|0;
  x=Math.imul(x^(x>>>13),1274126177);
  return ((x^(x>>>16))>>>0)/4294967295;
};
const smooth=x=>x*x*(3-2*x);
function noise(x,y,seed){
  const ix=Math.floor(x),iy=Math.floor(y),fx=smooth(x-ix),fy=smooth(y-iy);
  const a=hash(ix,iy,seed),b=hash(ix+1,iy,seed);
  const c=hash(ix,iy+1,seed),d=hash(ix+1,iy+1,seed);
  return (a+(b-a)*fx)*(1-fy)+(c+(d-c)*fx)*fy;
}
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*clamp(t);
function rgb(a,b,t){return [0,1,2].map(i=>lerp(a[i],b[i],t));}
const hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const seedOf=id=>[...'prism archive grove relay observer commons'.split(' ')].indexOf(id)+11;

function pixelFor(id,u,v,seed){
  const broad=noise(u*6,v*8,seed);
  const mid=noise(u*25,v*26,seed+9);
  const detail=noise(u*95,v*115,seed+16);
  const mix=.49*broad+.34*mid+.17*detail;
  let color=[128,128,128],rough=.58,bump=.5,metal=.0;
  if(id==='archive'){
    const row=Math.floor(v*10.5);
    const pu=(u*7.5+(row%2)*.47)%1,pv=(v*10.5)%1;
    const mortar=Math.min(pu,1-pu,pv,1-pv)<.045;
    const block=noise(Math.floor(u*7.5+(row%2)*.47)*.9,row*.9,seed+35);
    color=mortar?[65,61,64]:rgb([83,79,83],[162,151,136],.33*block+.70*mix);
    rough=.76+.18*detail;bump=mortar?.18:mix*.92;
  }else if(id==='grove'){
    const blotch=noise(u*14+1.5*mid,v*12,seed+8);
    const moss=clamp((blotch+.18*broad-.43)*5.5);
    const base=rgb([75,92,84],[117,126,104],mix);
    const green=rgb([25,57,34],[116,155,82],.27+mix*.66);
    color=rgb(base,green,moss);
    rough=lerp(.5,.91,moss)+detail*.06;
    bump=.3+.6*moss*(.3+.7*detail);
  }else if(id==='commons'){
    const warp=Math.sin(v*14+u*7)*.13;
    const grain=Math.sin(u*155+warp*20+Math.sin(v*4.5+u*12)*5)*.5+.5;
    const knots=Math.hypot((u-.29)*4.3,(v-.61)*1.3);
    const knotRing=Math.cos(knots*42)*Math.exp(-knots*4)*.2;
    const tone=clamp(.42*mix+.44*grain+.14*knotRing);
    color=rgb([63,42,31],[182,137,92],tone);
    rough=.53+.23*detail;bump=.20+.5*grain+.2*detail;
  }else if(id==='prism'){
    const hair=Math.abs(Math.sin((u*36+Math.sin(v*13)*.4)*Math.PI)*
      Math.sin((v*43+Math.sin(u*19)*.28)*Math.PI));
    const crack=(hair<.035&&mid>.27)?1:0;
    const glaze=noise(u*7.5,v*12.5,seed+44);
    color=rgb([229,224,212],[161,181,210],clamp(.24+glaze*.27+mid*.18));
    if(crack)color=rgb(color,[88,112,144],.55);
    rough=.17+detail*.11+(crack?.18:0);
    bump=.47+.23*mid-(crack?.21:0);
  }else if(id==='relay'){
    const stream=noise(u*15+3*mid,v*7,seed+27);
    const oxide=clamp((stream+.35*broad+.22*detail-.60)*3.8);
    const copper=rgb([112,63,50],[204,143,91],.25+mix*.71);
    const patina=rgb([31,106,99],[87,174,162],.36+mix*.5);
    color=rgb(copper,patina,oxide);
    rough=lerp(.32,.74,oxide)+detail*.06;
    bump=.28+.27*detail+.35*oxide;
  }else if(id==='observer'){
    const bands=Math.sin(v*32+Math.sin(u*14)*1.4)*.5+.5;
    const shifting=Math.sin(u*9+v*6+mid*4)*.5+.5;
    const shell=rgb([176,198,208],[192,167,210],shifting*.52);
    color=rgb(shell,[139,201,204],.1+.42*bands);
    rough=.22+.19*detail;bump=.39+.17*bands+.22*mix;
  }
  return {color,rough:clamp(rough),bump:clamp(bump),metal};
}
function makeCanvas(w,h){
 const canvas=document.createElement('canvas');
 canvas.width=w;canvas.height=h;return canvas;
}
export function createMaterialMaps(THREE,id,quality='medium'){
 if(!BEACONS.some(b=>b.id===id))throw Error('Unknown beacon material '+id);
 const width=quality==='low'?192:384,height=quality==='low'?384:768;
 const color=makeCanvas(width,height),rough=makeCanvas(width,height),bump=makeCanvas(width,height);
 const cc=color.getContext('2d'),rc=rough.getContext('2d'),bc=bump.getContext('2d');
 const ci=cc.createImageData(width,height),ri=rc.createImageData(width,height),bi=bc.createImageData(width,height);
 const seed=seedOf(id);
 for(let y=0;y<height;y++){
   const v=y/height;
   for(let x=0;x<width;x++){
     const u=x/width,p=pixelFor(id,u,v,seed),index=(y*width+x)*4;
     for(let c=0;c<3;c++){
       ci.data[index+c]=p.color[c];
       ri.data[index+c]=Math.round(p.rough*255);
       bi.data[index+c]=Math.round(p.bump*255);
     }
     ci.data[index+3]=ri.data[index+3]=bi.data[index+3]=255;
   }
 }
 cc.putImageData(ci,0,0);rc.putImageData(ri,0,0);bc.putImageData(bi,0,0);
 const map=new THREE.CanvasTexture(color);
 map.colorSpace=THREE.SRGBColorSpace;
 const roughnessMap=new THREE.CanvasTexture(rough);
 const bumpMap=new THREE.CanvasTexture(bump);
 for(const texture of [map,roughnessMap,bumpMap]){
   texture.wrapS=THREE.RepeatWrapping;
   texture.wrapT=THREE.ClampToEdgeWrapping;
   texture.anisotropy=2;
 }
 const isCopper=id==='relay',isPearl=id==='observer';
 const properties={
   map,roughnessMap,bumpMap,bumpScale:id==='archive'?.82:id==='grove'?.60:id==='commons'?.37:id==='relay'?.31:.18,
   metalness:isCopper?.68:id==='prism'?.06:id==='observer'?.16:.10,
   roughness:id==='archive'?.93:id==='grove'?.83:id==='commons'?.72:id==='relay'?.6:id==='observer'?.45:.36
 };
 const material=isPearl?new THREE.MeshPhysicalMaterial({
   ...properties,clearcoat:.46,clearcoatRoughness:.14,
   iridescence:.73,iridescenceIOR:1.37,
   iridescenceThicknessRange:[120,450]
 }):new THREE.MeshStandardMaterial(properties);
 return {material,textures:[map,roughnessMap,bumpMap],size:[width,height]};
}
