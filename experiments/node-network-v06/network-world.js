// MAJAKKA World v0.6 — three DIFFERENT material lighthouses and a living 3D triangle.
// Art/gameplay demonstration only. Coordinates are fictional DEMO anchors;
// no GPS, published Atlas nodes, player reach, rewards or permanent network state.
import * as THREE from 'https://unpkg.com/three@0.178.0/build/three.module.js';
import {buildBeacon} from '../node-family-v01/beacon-model.js?v=001';

// All coordinates are intentional DEMO points, not vetted accessible POIs.
export const NETWORK_NODES=Object.freeze([
  {id:'relay',name:'Relay',coords:[23.7603,61.4991],color:0xd9a075},
  {id:'grove',name:'Grove',coords:[23.7622,61.4992],color:0x89e6ae},
  {id:'prism',name:'Prism',coords:[23.7612,61.5006],color:0xb5baff}
]);
export const NETWORK_EDGES=Object.freeze([
  {from:0,to:1,color:0xffcf99,name:'Relay → Grove'},
  {from:0,to:2,color:0x8de7d4,name:'Relay → Prism'},
  {from:1,to:2,color:0xc6a8f9,name:'Grove → Prism'}
]);

const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=x=>x*x*(3-2*x);

export function createNetworkLayer(maplibregl,initialStage=3,initialQuality='medium',onStatus=()=>{},onError=()=>{}){
  const merc=NETWORK_NODES.map(x=>maplibregl.MercatorCoordinate.fromLngLat(x.coords,0));
  const scale=merc[0].meterInMercatorCoordinateUnits();
  const base=new THREE.Matrix4().makeTranslation(merc[0].x,merc[0].y,merc[0].z)
    .scale(new THREE.Vector3(scale,-scale,scale))
    .multiply(new THREE.Matrix4().makeRotationX(Math.PI/2));
  const projection=new THREE.Matrix4();
  const local=merc.map(m=>new THREE.Vector3((m.x-merc[0].x)/scale,35,(m.y-merc[0].y)/scale));
  const movementReduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let stage=clamp(Math.round(initialStage),0,3);
  let quality=['low','medium','high'].includes(initialQuality)?initialQuality:'medium';
  let active=true;
  const layer={
    id:'majakka-three-node-3d-network',
    type:'custom',renderingMode:'3d',
    onAdd(map,gl){
      this.map=map;this.camera=new THREE.Camera();this.scene=new THREE.Scene();
      this.beacons=[];
      // One shared lighting rig, instead of three sets of costly directional lights.
      const hemi=new THREE.HemisphereLight(0xd8fff3,0x132330,2.2);
      const warm=new THREE.DirectionalLight(0xffd4a3,3.1);warm.position.set(40,80,60);
      const cool=new THREE.DirectionalLight(0xa0b8f8,1.55);cool.position.set(-50,30,-38);
      this.scene.add(hemi,warm,cool);
      for(let i=0;i<NETWORK_NODES.length;i++){
        const data=NETWORK_NODES[i];
        const obj=buildBeacon(THREE,data.id,quality,true);
        obj.group.position.copy(local[i]);
        this.scene.add(obj.group);
        this.beacons.push(obj);
      }
      this.edges=[];
      for(let index=0;index<NETWORK_EDGES.length;index++){
        const spec=NETWORK_EDGES[index];
        const a=local[spec.from],b=local[spec.to];
        const dir=new THREE.Vector3(b.x-a.x,0,b.z-a.z).normalize();
        const lateral=new THREE.Vector3(-dir.z,0,dir.x);
        const start=a.clone().addScaledVector(dir,7.8);start.y+=19.1;
        const end=b.clone().addScaledVector(dir,-7.8);end.y+=19.1;
        const p=[];
        for(let j=0;j<=32;j++){
          const t=j/32,arc=Math.sin(Math.PI*t);
          const q=start.clone().lerp(end,t);
          // A continuous, lifted arc: high enough not to flatten onto map.
          q.y+=arc*(11.5+2.2*Math.sin(t*Math.PI*2));
          q.addScaledVector(lateral,arc*3.4*Math.sin(t*2*Math.PI+index*.7));
          p.push(q);
        }
        const curve=new THREE.CatmullRomCurve3(p,false,'centripetal',.28);
        const group=new THREE.Group();this.scene.add(group);
        // Soft but legible spine; the two smaller filaments are delicate, not thick tubes.
        const spineMaterial=new THREE.MeshBasicMaterial({
          color:spec.color,transparent:true,opacity:.84,depthWrite:false
        });
        const spine=new THREE.Mesh(new THREE.TubeGeometry(curve,120,1.00,7,false),spineMaterial);
        group.add(spine);
        const coreMaterial=new THREE.MeshBasicMaterial({
          color:0xe5fff3,transparent:true,opacity:.68,depthWrite:false
        });
        const core=new THREE.Mesh(new THREE.TubeGeometry(curve,120,.29,6,false),coreMaterial);
        group.add(core);
        const sideMaterials=[
          new THREE.MeshBasicMaterial({color:0x5bbfb0,transparent:true,opacity:.36,depthWrite:false}),
          new THREE.MeshBasicMaterial({color:0xd1b1f5,transparent:true,opacity:.32,depthWrite:false})
        ];
        for(let side=0;side<2;side++){
          const filament=[];
          for(let j=0;j<=92;j++){
            const t=j/92,q=curve.getPoint(t),amp=1.25*Math.sin(Math.PI*t);
            const angle=t*11*Math.PI+side*Math.PI;
            q.addScaledVector(lateral,amp*Math.cos(angle));
            q.y+=amp*.7*Math.sin(angle);
            filament.push(q);
          }
          group.add(new THREE.Mesh(new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3(filament),130,.16,5,false),sideMaterials[side]));
        }
        const pulseMaterial=new THREE.MeshBasicMaterial({color:spec.color,depthWrite:false});
        const pulses=[];
        for(let k=0;k<2;k++){
          const dot=new THREE.Mesh(new THREE.IcosahedronGeometry(k===0?1.55:1.05,1),pulseMaterial);
          group.add(dot);pulses.push(dot);
        }
        this.edges.push({group,curve,spineMaterial,coreMaterial,sideMaterials,pulses,
          pulseMaterial,alpha:stage>index?1:0,index});
      }
      this.renderer=new THREE.WebGLRenderer({canvas:map.getCanvas(),context:gl,alpha:true,antialias:true});
      this.renderer.autoClear=false;
      this.started=performance.now();this.lastFrame=this.started;
      this.lastRepaint=this.started;this.failed=false;
      onStatus({stage,activeLinks:stage,nodeCount:this.beacons.length});
    },
    setStage(value){
      const n=Number(value);
      if(!Number.isInteger(n)||n<0||n>3)return false;
      stage=n;
      onStatus({stage,activeLinks:stage,nodeCount:NETWORK_NODES.length});
      this.map?.triggerRepaint();
      return true;
    },
    getStage(){return stage;},
    setQuality(level){
      if(!['low','medium','high'].includes(level))return false;
      // Surface PBR resolution is fixed at construction to avoid
      // 3x costly texture generation on every button press; VFX/pulses vary.
      quality=level;this.map?.triggerRepaint();return true;
    },
    getQuality(){return quality;},
    setEnabled(value){active=!!value;this.map?.triggerRepaint();},
    render(gl,args){
      if(!active||!this.renderer||!args?.defaultProjectionData?.mainMatrix)return;
      try{
        const now=performance.now(),elapsed=(now-this.started)/1000;
        const dt=Math.min(.09,(now-this.lastFrame)/1000);
        this.lastFrame=now;
        let changing=false;
        for(let i=0;i<this.edges.length;i++){
          const edge=this.edges[i];
          const target=i<stage?1:0;
          if(movementReduced||document.hidden)edge.alpha=target;
          else edge.alpha=clamp(edge.alpha+(target>edge.alpha?1:-1)*dt*1.25,0,1);
          if(Math.abs(edge.alpha-target)>.015)changing=true;
          const level=smooth(edge.alpha);
          edge.group.visible=level>.002;
          edge.spineMaterial.opacity=.82*level;
          edge.coreMaterial.opacity=.68*level;
          edge.sideMaterials.forEach((material,k)=>{material.opacity=(k===0?.35:.29)*level;});
          if(edge.group.visible){
            for(let k=0;k<edge.pulses.length;k++){
              const pulse=edge.pulses[k];
              pulse.visible=quality==='high'||(quality==='medium'&&k===0);
              const t=movementReduced?(k+.5)/3:(elapsed*(quality==='low'?.13:.19)+k*.46+i*.13)%1;
              pulse.position.copy(edge.curve.getPoint(t));
              pulse.scale.setScalar(Math.max(.002,level));
            }
            // The filaments are only shown at high/medium quality.
            edge.group.children[2].visible=quality!=='low';
            edge.group.children[3].visible=quality==='high';
          }
        }
        if(!movementReduced&&!document.hidden)
          this.beacons.forEach((b,i)=>b.animate(elapsed+i*.47));
        projection.fromArray(args.defaultProjectionData.mainMatrix);
        this.camera.projectionMatrix.copy(projection).multiply(base);
        this.renderer.resetState();
        this.renderer.clearDepth(); // Important: preserve approved world v0.4.2 fix.
        this.renderer.render(this.scene,this.camera);
        const redrawRate=quality==='high'?18:quality==='medium'?33:55;
        // Schedule a real later repaint rather than only testing elapsed time
        // inside render: otherwise an idle MapLibre map may never draw again.
        if(!document.hidden&&(changing||!movementReduced)&&!this.repaintTimer){
          this.repaintTimer=setTimeout(()=>{
            this.repaintTimer=null;
            this.map?.triggerRepaint();
          },redrawRate);
        }
      }catch(error){
        if(!this.failed){this.failed=true;console.error('Majakka three-node network:',error);onError(error);}
        active=false;
      }
    },
    onRemove(){
      active=false;
      if(this.repaintTimer){clearTimeout(this.repaintTimer);this.repaintTimer=null;}
      for(const b of this.beacons||[])b.dispose();
      for(const e of this.edges||[]){
        e.group.traverse(obj=>{
          obj.geometry?.dispose();
          if(obj.material){
            (Array.isArray(obj.material)?obj.material:[obj.material]).forEach(mat=>mat.dispose());
          }
        });
      }
      this.renderer?.dispose();
      this.renderer=null;
    }
  };
  return layer;
}
