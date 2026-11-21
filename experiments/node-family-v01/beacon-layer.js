// MAJAKKA — real MapLibre custom 3D layer for 6 lighthouse material studies.
// Retains the user-validated draw-last + clearDepth trick from World v0.4.2.
import * as THREE from 'https://unpkg.com/three@0.178.0/build/three.module.js';
import {buildBeacon} from './beacon-model.js?v=001';
import {BEACONS} from './beacon-materials.js?v=001';

export function createBeaconLayer(maplibregl,coords=[23.7603,61.4991],initial='prism',initialQuality='medium',onStatus=()=>{},onError=()=>{}){
 const loc=maplibregl.MercatorCoordinate.fromLngLat(coords,0);
 const m=loc.meterInMercatorCoordinateUnits();
 const world=new THREE.Matrix4().makeTranslation(loc.x,loc.y,loc.z)
   .scale(new THREE.Vector3(m,-m,m))
   .multiply(new THREE.Matrix4().makeRotationX(Math.PI/2));
 const matrix=new THREE.Matrix4();
 const known=new Set(BEACONS.map(t=>t.id));
 let type=known.has(initial)?initial:'prism';
 let quality=['low','medium','high'].includes(initialQuality)?initialQuality:'medium';
 const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let active=true;
 return {
   id:'majakka-beacon-material-study',
   type:'custom',renderingMode:'3d',
   onAdd(map,gl){
     this.map=map;
     this.camera=new THREE.Camera();
     this.scene=new THREE.Scene();
     this.anchor=new THREE.Group();
     this.anchor.position.y=35;
     this.scene.add(this.anchor);
     this.renderer=new THREE.WebGLRenderer({
       canvas:map.getCanvas(),context:gl,alpha:true,antialias:true
     });
     this.renderer.autoClear=false;
     this.started=performance.now();
     this.failed=false;
     this.switchType(type);
   },
   switchType(id){
     if(!known.has(id))return false;
     type=id;
     if(!this.anchor)return true;
     if(this.current){
       this.anchor.remove(this.current.group);
       this.current.dispose();
       this.current=null;
     }
     this.current=buildBeacon(THREE,id,quality);
     this.anchor.add(this.current.group);
     this.map?.triggerRepaint();
     const item=BEACONS.find(t=>t.id===id);
     onStatus({id,name:item.name,material:item.material,role:item.role,
       maps:this.current.materialMaps});
     return true;
   },
   getType(){return type;},
   setQuality(next){
     if(!['low','medium','high'].includes(next))return false;
     if(quality===next)return true;
     quality=next;
     if(this.anchor)this.switchType(type); // frees previous GPU textures + geometry
     return true;
   },
   getQuality(){return quality;},
   setEnabled(value){active=!!value;this.map?.triggerRepaint();},
   render(gl,args){
     if(!active||!this.renderer||!args?.defaultProjectionData?.mainMatrix)return;
     try{
       const t=(performance.now()-this.started)/1000;
       if(!reduceMotion&&!document.hidden)this.current?.animate(t);
       matrix.fromArray(args.defaultProjectionData.mainMatrix);
       this.camera.projectionMatrix.copy(matrix).multiply(world);
       this.renderer.resetState();
       this.renderer.clearDepth();
       this.renderer.render(this.scene,this.camera);
       if(!reduceMotion&&!document.hidden)this.map.triggerRepaint();
     }catch(error){
       if(!this.failed){this.failed=true;console.error('Beacon family 3D',error);onError(error);}
       active=false;
     }
   },
   onRemove(){
     active=false;
     if(this.current){this.anchor?.remove(this.current.group);this.current.dispose();this.current=null;}
     this.renderer?.dispose();this.renderer=null;
   }
 };
}
