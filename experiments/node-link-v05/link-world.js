// MAJAKKA v0.5 - two geographically anchored DEMO lighthouses linked by
// one real 3D floating organic strand. Does NOT implement the network economy,
// live geodata atlas, GPS tracking or player range. Keep v0.4.2 depth fix.
import * as THREE from 'https://unpkg.com/three@0.178.0/build/three.module.js';
import {buildRelayLighthouse} from '../relay-concept-lab/relay-lighthouse.js?v=031';

const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
export const DEMO_NODE_COORDS=[
  [23.7603,61.4991],
  [23.7627,61.4996]
];
export function createNodeLinkLayer(maplibregl,coords=DEMO_NODE_COORDS,onChange=()=>{},onFault=()=>{}){
  if(!Array.isArray(coords)||coords.length!==2)throw Error('Node link demo requires two coordinates');
  const geo0=maplibregl.MercatorCoordinate.fromLngLat(coords[0],0);
  const geo1=maplibregl.MercatorCoordinate.fromLngLat(coords[1],0);
  const meter=geo0.meterInMercatorCoordinateUnits();
  const dx=(geo1.x-geo0.x)/meter, dz=(geo1.y-geo0.y)/meter;
  const distance=Math.hypot(dx,dz);
  if(!Number.isFinite(distance)||distance<40||distance>600)throw Error('Demo nodes need 40–600m separation');
  const heading=Math.atan2(dx,dz);
  const world=new THREE.Matrix4().makeTranslation(geo0.x,geo0.y,geo0.z)
    .scale(new THREE.Vector3(meter,-meter,meter))
    .multiply(new THREE.Matrix4().makeRotationX(Math.PI/2));
  const projection=new THREE.Matrix4();
  const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;

  let enabled=true, connected=true, quality='medium';
  const layer={
    id:'majakka-link-demo-3d',
    type:'custom',
    renderingMode:'3d',
    onAdd(map,gl){
      this.map=map;this.camera=new THREE.Camera();this.scene=new THREE.Scene();
      this.groupA=new THREE.Group();this.groupA.position.set(0,35,0);
      this.groupB=new THREE.Group();this.groupB.position.set(dx,35,dz);
      this.groupA.rotation.y=heading;
      this.groupB.rotation.y=heading+Math.PI;
      this.scene.add(this.groupA,this.groupB);
      this.beaconA=buildRelayLighthouse(THREE,this.groupA);
      this.beaconB=buildRelayLighthouse(THREE,this.groupB);
      this.beaconA.setGrade(3);this.beaconB.setGrade(2);
      this.beaconA.setQuality(quality);this.beaconB.setQuality(quality);

      this.strand=new THREE.Group();this.scene.add(this.strand);
      const start=new THREE.Vector3(Math.sin(heading)*8.08,35+21.3,Math.cos(heading)*8.08);
      const end=new THREE.Vector3(dx-Math.sin(heading)*8.08,35+21.3,dz-Math.cos(heading)*8.08);
      const lateral=new THREE.Vector3(-Math.cos(heading),0,Math.sin(heading));
      // One coherent, floating organic arc, NOT a painted flat line.
      // The subtle secondary wave is deterministic and converges at both ports.
      const points=[];
      for(let i=0;i<=24;i++){
        const t=i/24,arc=Math.sin(Math.PI*t);
        const pos=start.clone().lerp(end,t);
        pos.y+=arc*(16+3*Math.sin(Math.PI*2*t));
        pos.addScaledVector(lateral,arc*(4.5*Math.sin(t*Math.PI*2)-1.5));
        points.push(pos);
      }
      this.curve=new THREE.CatmullRomCurve3(points,false,'centripetal',0.35);
      const spine=new THREE.Mesh(
        new THREE.TubeGeometry(this.curve,116,1.55,9,false),
        new THREE.MeshBasicMaterial({color:0x176e82,transparent:true,opacity:.98,depthWrite:true})
      );
      this.strand.add(spine);
      const core=new THREE.Mesh(
        new THREE.TubeGeometry(this.curve,116,.66,8,false),
        new THREE.MeshBasicMaterial({color:0xa8fff0,transparent:true,opacity:.96,depthWrite:false})
      );
      this.strand.add(core);
      // Side threads curl gently around main path, with exact zero offset at sockets.
      const sideMaterials=[
        new THREE.MeshBasicMaterial({color:0xffc17e,transparent:true,opacity:.89,depthWrite:false}),
        new THREE.MeshBasicMaterial({color:0x9775d3,transparent:true,opacity:.83,depthWrite:false})
      ];
      for(let side=0;side<2;side++){
        const sideCurvePoints=[];
        for(let i=0;i<=90;i++){
          const t=i/90,point=this.curve.getPoint(t);
          const amplitude=2*Math.sin(Math.PI*t);
          const phase=t*Math.PI*9+side*Math.PI;
          point.addScaledVector(lateral,amplitude*Math.cos(phase));
          point.y+=amplitude*.65*Math.sin(phase);
          sideCurvePoints.push(point);
        }
        this.strand.add(new THREE.Mesh(
          new THREE.TubeGeometry(new THREE.CatmullRomCurve3(sideCurvePoints),116,.34,6,false),
          sideMaterials[side]
        ));
      }
      this.strandMaterials=[spine.material,core.material,...sideMaterials];
      this.strandBaseOpacity=[.98,.96,.89,.83];
      this.pulses=[];
      const beadMat=new THREE.MeshBasicMaterial({color:0xffdf9e,depthWrite:false});
      for(let i=0;i<3;i++){
        const bead=new THREE.Mesh(new THREE.IcosahedronGeometry(i===0?2.5:1.5,1),beadMat);
        this.strand.add(bead);
        this.pulses.push(bead);
      }
      this.started=performance.now();
      this.lastFrame=this.started;
      this.strength=connected?1:0;
      this.lastNotified=null;
      this.renderer=new THREE.WebGLRenderer({
        canvas:map.getCanvas(),context:gl,alpha:true,antialias:true
      });
      this.renderer.autoClear=false;
      this.failed=false;
      onChange({connected,distanceM:Math.round(distance)});
    },
    setConnected(value){
      connected=!!value;
      if(this.lastNotified!==connected){this.lastNotified=connected;onChange({connected,distanceM:Math.round(distance)});}
      this.map?.triggerRepaint();
      return connected;
    },
    isConnected(){return connected;},
    setEnabled(value){enabled=!!value;this.map?.triggerRepaint();},
    setQuality(level){
      if(!['low','medium','high'].includes(level))return false;
      quality=level;
      this.beaconA?.setQuality(level);
      this.beaconB?.setQuality(level);
      this.map?.triggerRepaint();
      return true;
    },
    render(gl,args){
      if(!enabled||!this.renderer||!args?.defaultProjectionData?.mainMatrix)return;
      try{
        const time=performance.now(),dt=Math.min(.1,(time-this.lastFrame)/1000);
        this.lastFrame=time;
        const t=(time-this.started)/1000;
        const target=connected?1:0;
        this.strength+=clamp(target-this.strength,-dt*1.8,dt*1.8);
        this.strength=clamp(this.strength,0,1);
        this.strand.visible=this.strength>.005;
        this.strandMaterials.forEach((material,i)=>{
          material.opacity=this.strandBaseOpacity[i]*this.strength;
        });
        if(!reduceMotion&&!document.hidden){
          this.beaconA.animate(t);
          this.beaconB.animate(t+.85);
        }
        if(this.strand.visible){
          for(let i=0;i<this.pulses.length;i++){
            const progress=reduceMotion?(i+1)/4:((t*(quality==='low'?.11:.17)+i/3)%1);
            const bead=this.pulses[i];
            bead.position.copy(this.curve.getPoint(progress));
            const pulseScale=(i===0?1:.7)*Math.max(.001,this.strength);
            bead.scale.setScalar(pulseScale);
            bead.visible=quality!=='low'||i===0;
          }
        }
        projection.fromArray(args.defaultProjectionData.mainMatrix);
        this.camera.projectionMatrix.copy(projection).multiply(world);
        this.renderer.resetState();
        // Approved World v0.4.2 repair: map colors remain, roads and labels
        // cannot punch black holes through either solid beacon or 3D strand.
        this.renderer.clearDepth();
        this.renderer.render(this.scene,this.camera);
        if(!reduceMotion&&!document.hidden)this.map.triggerRepaint();
      }catch(error){
        if(!this.failed){this.failed=true;console.error('Majakka link 3D error',error);onFault(error);}
        enabled=false;
      }
    },
    onRemove(){
      enabled=false;
      const geometries=new Set(),materials=new Set();
      this.scene?.traverse(object=>{
        if(object.geometry)geometries.add(object.geometry);
        const mats=Array.isArray(object.material)?object.material:[object.material];
        for(const m of mats)if(m)materials.add(m);
      });
      geometries.forEach(g=>g.dispose());
      materials.forEach(m=>m.dispose());
      this.renderer?.dispose();
      this.renderer=null;
    }
  };
  return layer;
}
