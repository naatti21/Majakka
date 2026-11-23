// MAJAKKA World v0.8 — three PBR lighthouses, short particle wakes and floating coverage mist and a biological translucent link network.
// Art/gameplay demonstration only. Coordinates are fictional DEMO anchors;
// no GPS, published Atlas nodes, player reach, rewards or permanent network state.
import * as THREE from 'https://unpkg.com/three@0.178.0/build/three.module.js';
import {buildBeacon} from '../node-family-v01/beacon-model.js?v=002';
import {createMembraneMaps,buildOrganicStrand} from './organic-strand.js?v=080';
import {buildCoverageMist} from './coverage-mist.js?v=080';

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
const smooth=x=>x*x*(3-2*x);

// Shared, 32x32 radial alpha sprite. Soft round specks, no square debug points.
function createParticleSprite(THREE){
  const canvas=document.createElement('canvas');
  canvas.width=canvas.height=32;
  const ctx=canvas.getContext('2d');
  const glow=ctx.createRadialGradient(16,16,0,16,16,16);
  glow.addColorStop(0,'rgba(255,255,255,1)');
  glow.addColorStop(.36,'rgba(255,255,255,1)');
  glow.addColorStop(.7,'rgba(255,255,255,.50)');
  glow.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=glow;ctx.fillRect(0,0,32,32);
  const texture=new THREE.CanvasTexture(canvas);
  texture.colorSpace=THREE.SRGBColorSpace;
  return texture;
}

export function createNetworkLayer(maplibregl,initialStage=3,initialQuality='medium',onStatus=()=>{},onError=()=>{},initialCoverage=true){
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
  let coverageEnabled=!!initialCoverage;
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
      this.membraneMaps=createMembraneMaps(THREE);
      this.particleSprite=createParticleSprite(THREE);
      this.edges=[];
      for(let index=0;index<NETWORK_EDGES.length;index++){
        const spec=NETWORK_EDGES[index];
        const from=NETWORK_NODES[spec.from],to=NETWORK_NODES[spec.to];
        const a=local[spec.from],b=local[spec.to];
        const dir=new THREE.Vector3(b.x-a.x,0,b.z-a.z).normalize();
        // Connect at the physical lighthouse lantern, not a floating link marker.
        const start=a.clone().addScaledVector(dir,7.8);start.y+=19.1;
        const end=b.clone().addScaledVector(dir,-7.8);end.y+=19.1;
        const organic=buildOrganicStrand(
          THREE,start,end,index,from.color,to.color,this.membraneMaps,this.particleSprite,quality
        );
        this.scene.add(organic.group);
        this.edges.push({organic,alpha:stage>index?1:0,index});
      }
      // Coverage is cosmetic and closes only when all THREE links are active.
      this.coverage=buildCoverageMist(THREE,local,this.particleSprite);
      this.coverage.setEnabled(coverageEnabled);
      this.scene.add(this.coverage.group);
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
    setCoverageEnabled(value){
      coverageEnabled=!!value;
      this.coverage?.setEnabled(coverageEnabled);
      this.map?.triggerRepaint();
      return coverageEnabled;
    },
    isCoverageEnabled(){return coverageEnabled;},
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
          edge.organic.update(elapsed,level,quality,movementReduced);
        }
        // The veil fades up only after the closing third link is established.
        const enclosed=stage===3?smooth(this.edges[2]?.alpha??0):0;
        this.coverage?.update(elapsed,enclosed,quality,movementReduced,dt);
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
      for(const e of this.edges||[])e.organic.dispose();
      this.coverage?.dispose();
      this.membraneMaps?.dispose();
      this.particleSprite?.dispose();
      this.renderer?.dispose();
      this.renderer=null;
    }
  };
  return layer;
}
