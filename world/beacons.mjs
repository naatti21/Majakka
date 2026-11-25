import * as THREE from './node_modules/three/build/three.module.js';
import {buildBeacon} from '../experiments/node-family-v01/beacon-model.js?v=001';

export function beaconLayer(glMap){
 const models=new Map(),scene=new THREE.Scene(),camera=new THREE.Camera(),projection=new THREE.Matrix4();
 scene.add(new THREE.HemisphereLight(0xf8f3dc,0x28434a,2));
 const sun=new THREE.DirectionalLight(0xffe3b5,3);sun.position.set(-30,60,35);scene.add(sun);
 let renderer,map,origin;
 const layer={id:'atlas-models',type:'custom',renderingMode:'3d',
  onAdd(m,gl){
   map=m;renderer=new THREE.WebGLRenderer({canvas:m.getCanvas(),context:gl});renderer.autoClear=false;
  },
  update(nodes){
   const next=new Set(nodes.map(n=>n.id));
   for(const [id,m] of models)if(!next.has(id)){scene.remove(m.group);m.dispose();models.delete(id);}
   if(!nodes.length){origin=null;map?.triggerRepaint();return;}
   origin=glMap.MercatorCoordinate.fromLngLat([nodes[0].location.lng,nodes[0].location.lat]);
   const scale=origin.meterInMercatorCoordinateUnits();
   for(const n of nodes){
    if(!models.has(n.id)){const model=buildBeacon(THREE,n.type.toLowerCase(),'low',true);models.set(n.id,model);scene.add(model.group);}
    const p=glMap.MercatorCoordinate.fromLngLat([n.location.lng,n.location.lat]);
    models.get(n.id).group.position.set((p.x-origin.x)/scale,0,(p.y-origin.y)/scale);
   }
   map?.triggerRepaint();
  },
  render(gl,args){
   if(!origin||!renderer||document.hidden)return;
   const scale=origin.meterInMercatorCoordinateUnits();
   projection.makeTranslation(origin.x,origin.y,0).scale(new THREE.Vector3(scale,-scale,scale))
    .multiply(new THREE.Matrix4().makeRotationX(Math.PI/2));
   camera.projectionMatrix.fromArray(args.defaultProjectionData.mainMatrix).multiply(projection);
   renderer.resetState();renderer.clearDepth();renderer.render(scene,camera);
  },
  onRemove(){layer.update([]);renderer?.dispose();renderer=null;map=null;}
 };
 return layer;
}
