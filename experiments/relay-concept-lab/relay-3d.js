// MAJAKKA · Relay design lab v0.3 / lighthouse family
// Three interchangeable ACTUAL 3D designs for the established Relay Node type.
// All geometry, animations and positions are DEMO art direction only.
// Stable v0.4.2 rendering: last MapLibre layer + isolated depth buffer.
import * as THREE from 'https://unpkg.com/three@0.178.0/build/three.module.js';
import { buildRelayLighthouse } from './relay-lighthouse.js?v=031';

export const RELAY_CONCEPTS = Object.freeze(['haara', 'portti', 'kudos', 'chromatic', 'lighthouse']);

const dark = () => new THREE.MeshBasicMaterial({color:0x164d5a, side:THREE.DoubleSide});
const mid = () => new THREE.MeshBasicMaterial({color:0x218c9a, side:THREE.DoubleSide});
const light = () => new THREE.MeshBasicMaterial({color:0x80f7e4, side:THREE.DoubleSide});
const bright = () => new THREE.MeshBasicMaterial({color:0xc8fff6, side:THREE.DoubleSide});
const haze = () => new THREE.MeshBasicMaterial({
  color:0x55dccb, transparent:true, opacity:0.16, side:THREE.DoubleSide,
  depthWrite:false, blending:THREE.AdditiveBlending
});
function solid(parent,geometry,material,position=null){
  const mesh = new THREE.Mesh(geometry,material);
  if(position)mesh.position.set(...position);
  parent.add(mesh);
  return mesh;
}
function orb(parent,radius,position,material){
  return solid(parent,new THREE.IcosahedronGeometry(radius,1),material,position);
}
function tube(parent,points,radius,material,segments=36){
  const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
  solid(parent,new THREE.TubeGeometry(curve,segments,radius,7,false),material);
  return curve;
}
function socket(parent,position,radius=5){
  const g = new THREE.Group();g.position.set(...position);parent.add(g);
  orb(g,radius,[0,0,0],dark());
  orb(g,radius*.56,[0,0,0],bright());
  const ring=solid(g,new THREE.TorusGeometry(radius*1.12,0.85,7,24),light());
  ring.rotation.x=0.44;
  return g;
}
function base(parent){
  const ring=solid(parent,new THREE.RingGeometry(11,24,40),haze(),[0,1.2,0]);
  ring.rotation.x=-Math.PI/2;
  const inner=solid(parent,new THREE.TorusGeometry(12,0.7,5,40),mid(),[0,1.1,0]);
  inner.rotation.x=Math.PI/2;
}

// A: HAARA / organic root-split. A bold Y-trunk divides three clearly
// separate branches. Pulse beads travel from its center to each outlet.
function buildHaara(parent){
  const g=new THREE.Group();parent.add(g);
  const stem=tube(g,[[0,-23,0],[-1,-11,0],[1,-3,1],[0,1,0]],3.7,dark());
  tube(g,[[0,-20,0],[2,-9,0],[0,0,0]],1.25,mid());
  orb(g,8,[0,0,0],mid());
  orb(g,4.7,[0,1,0],light());
  const pulses=[];
  for(let i=0;i<3;i++){
    const theta=-Math.PI/2+i*(Math.PI*2/3);
    const dx=Math.cos(theta),dz=Math.sin(theta);
    const points=[[0,0,0],[dx*7,7,dz*8],[dx*17,10,dz*17],[dx*25,5,dz*25]];
    const path=tube(g,points,3.45,dark());
    tube(g,points.map(([x,y,z])=>[x,y+3.6,z]),1.35,light());
    socket(g,points.at(-1),4.7);
    const bead=orb(g,2.1,points[0],bright());
    pulses.push({path,bead,offset:i/3});
  }
  return {group:g,animate(t){for(const p of pulses){
    const position=p.path.getPoint((t*.14+p.offset)%1);
    p.bead.position.copy(position);
  }}};
}

// B: PORTTI / three broken, freestanding upright arcs around a dense
// central axis. More architectural than A: the ports are gap endpoints.
function buildPortti(parent){
  const g=new THREE.Group();parent.add(g);
  solid(g,new THREE.CylinderGeometry(5.7,7.4,29,8),dark());
  const core=orb(g,8,[0,0,0],mid());
  orb(g,4,[0,0,0],bright());
  const arches=[];
  for(let i=0;i<3;i++){
    const outer=new THREE.Group();outer.rotation.y=i*(Math.PI*2/3);g.add(outer);
    const arch=solid(outer,new THREE.TorusGeometry(21,3.6,8,62,Math.PI*1.48),dark());
    arch.rotation.z=i*.16+0.20;
    const edge=solid(outer,new THREE.TorusGeometry(24.2,1.1,7,62,Math.PI*1.48),light());
    edge.rotation.z=arch.rotation.z;
    arch.position.y=3;
    edge.position.y=3;
    socket(outer,[Math.cos(i*.7)*20,Math.sin(i*.7)*19+3,0],3.3);
    arches.push(outer);
  }
  const top=orb(g,4.6,[0,25,0],bright());
  return {group:g,animate(t){
    g.rotation.y=Math.sin(t*.25)*.16;
    core.rotation.y=t*.21;
    for(let i=0;i<arches.length;i++)arches[i].rotation.z=Math.sin(t*.32+i)*.06;
    top.position.y=25+Math.sin(t*.8)*1.1;
  }};
}

// C: KUDOS / 3 braided, suspended ribbon strips. Entirely solid, not
// transparent sci-fi spaghetti: visible woven surfaces from oblique angles.
function buildKudos(parent){
  const g=new THREE.Group();parent.add(g);
  const strandPaths=[];
  const petals=[];
  for(let i=0;i<3;i++){
    const theta=i*Math.PI*2/3;
    const group=new THREE.Group();group.rotation.y=theta;g.add(group);
    const pts=[];
    for(let j=0;j<=14;j++){
      const u=j/14;
      const angle=u*Math.PI*2.7+theta*.28;
      const radial=7+7*Math.sin(u*Math.PI)+5*u;
      pts.push([radial*Math.cos(angle),-22+u*47,radial*Math.sin(angle)]);
    }
    const path=tube(group,pts,2.8, i===1?mid():dark(),72);
    tube(group,pts.map(([x,y,z])=>[x+1.7,y,z]),0.95,light(),72);
    const guide=solid(group,new THREE.CylinderGeometry(2.1,2.1,28,7),mid(),[0,0,0]);
    guide.rotation.z=.35*(i-1);
    const tip=socket(group,pts.at(-1),4);
    strandPaths.push({path,group});
    petals.push(tip);
  }
  const heart=orb(g,8.8,[0,0,0],dark());
  orb(g,5.3,[0,0,0],light());
  return {group:g,animate(t){
    g.rotation.y=t*.10;
    heart.rotation.z=t*.14;
    for(let i=0;i<petals.length;i++)petals[i].rotation.y=t*.35*(i%2?1:-1);
  }};
}


// D: CHROMATIC CONDUIT — art-direction quality candidate. Purpose-built
// layered ceramic-and-brass relay with 3 readable living exits, not generic
// cyan wireframe. All color is inside the object; maps remain readable.
// Lightweight, fixed-seed procedural geometry; NO random network/POI data.
function buildChromatic(parent) {
  const g = new THREE.Group(); parent.add(g);
  const mat = (hex,metal=0.18,roughness=0.42,emissive=0,brightness=0) =>
    new THREE.MeshStandardMaterial({
      color:hex,metalness:metal,roughness,
      emissive:emissive || 0x000000,emissiveIntensity:brightness,
      side:THREE.DoubleSide
    });
  const marine=mat(0x163a49,0.48,0.29);
  const ceramic=mat(0x256b7c,0.38,0.24);
  const deep=mat(0x0a2234,0.44,0.34);
  const coral=mat(0xff8e74,0.22,0.36,0xaa352f,0.16);
  const gold=mat(0xffd99a,0.82,0.20,0xb07527,0.13);
  const violet=mat(0x8f74d9,0.26,0.27,0x62419a,0.22);
  const teal=mat(0x31dccf,0.28,0.21,0x31dccf,0.58);
  const white=mat(0xc7fff5,0.13,0.2,0x68ffff,0.48);
  const inner=new THREE.Group(); g.add(inner);
  const body=solid(inner,new THREE.IcosahedronGeometry(14,2),marine,[0,0,0]);
  body.scale.set(0.93,1.34,0.93);
  const shell=solid(inner,new THREE.IcosahedronGeometry(12.9,1),ceramic,[0,0.6,0]);
  shell.scale.set(0.94,1.34,0.94);
  const heart=solid(inner,new THREE.IcosahedronGeometry(7.8,1),teal,[0,2.0,0]);
  heart.scale.set(0.90,1.43,0.90);
  // Raised gold and violet framing makes the faceted body look crafted.
  for(let band=0;band<3;band++){
    const tor=solid(inner,new THREE.TorusGeometry(14.1+band*.5,0.70,8,72),band===1?coral:gold,[0,-9.5+band*10.2,0]);
    tor.rotation.x=Math.PI/2;
  }
  for(let i=0;i<9;i++){
    const a=i*Math.PI*2/9;
    const y=5.2*Math.sin(i*2.4);
    const bolt=solid(inner,new THREE.OctahedronGeometry(1.55,0),i%3===0?violet:gold,[13.4*Math.cos(a),y,13.4*Math.sin(a)]);
    bolt.scale.set(0.7,2.1,0.7);
  }
  const trails=[], beadPath=[], exits=[];
  const shrouds=new THREE.Group();g.add(shrouds);
  for(let arm=0;arm<3;arm++){
    const theta=Math.PI*2*arm/3+Math.PI/7;
    const dx=Math.cos(theta),dz=Math.sin(theta);
    const points=[
      [dx*6,4,dz*6],
      [dx*13,10,dz*13],
      [dx*21,16,dz*20],
      [dx*29,16+2*Math.sin(theta*3),dz*28]
    ];
    const group=new THREE.Group();shrouds.add(group);
    const path=tube(group,points,4.65,marine,56);
    tube(group,points.map(([x,y,z])=>[x,y+3.8,z]),1.5,arm===1?coral:teal,56);
    tube(group,points.map(([x,y,z])=>[x+dx*3.1,y+1.15,z+dz*3.1]),0.85,gold,56);
    const finMat=arm===0?coral:(arm===1?violet:gold);
    for(let i=1;i<=3;i++){
      const at=path.getPoint(i/4);
      const plate=solid(group,new THREE.OctahedronGeometry(4.3,0),finMat,[at.x,at.y+2,at.z]);
      plate.scale.set(0.62,0.46,1.15);
      plate.rotation.y=theta;
    }
    const end=points[3];
    const port=new THREE.Group();port.position.set(...end);
    group.add(port);exits.push(port);
    orb(port,7.5,[0,0,0],deep);
    orb(port,5.3,[0,0,0],arm===1?coral:ceramic);
    orb(port,3.3,[0,0,0],white);
    const collar=solid(port,new THREE.TorusGeometry(7.2,1.2,8,48),gold);
    collar.rotation.y=theta+Math.PI/2;
    collar.rotation.x=0.38;
    for(let n=0;n<6;n++){
      const a=n*Math.PI/3;
      const rivet=solid(port,new THREE.SphereGeometry(.8,8,6),n%2?teal:coral,
         [5*Math.cos(a),5*Math.sin(a),1.7]);
      rivet.scale.set(1,1,1.5);
    }
    const bead=solid(group,new THREE.IcosahedronGeometry(2.6,0),arm===1?gold:white,points[0]);
    trails.push({path,bead,offset:arm/3});
    beadPath.push(path);
  }
  const crown=solid(inner,new THREE.TorusGeometry(11.7,1.45,8,72),coral,[0,15.6,0]);
  crown.rotation.x=Math.PI/2;
  const top=solid(inner,new THREE.ConeGeometry(5.4,12,6),gold,[0,22,0]);
  const flame=solid(inner,new THREE.OctahedronGeometry(3.8,1),violet,[0,27.5,0]);

  // Constrained VFX: a narrow halo and a few colored sparks. These are
  // optional at Low/Medium quality, never the only visible object.
  const fx=new THREE.Group();g.add(fx);
  const aura=solid(fx,new THREE.SphereGeometry(20.1,24,12),
    new THREE.MeshBasicMaterial({
      color:0x55daca,transparent:true,opacity:.042,depthWrite:false,
      side:THREE.BackSide,blending:THREE.AdditiveBlending
    }),[0,0,0]);
  const sparks=[];
  const sparkMat=new THREE.MeshBasicMaterial({color:0xffd99a,transparent:true,opacity:.82,depthWrite:false});
  for(let i=0;i<30;i++){
    const a=i*2.399963229728653; // deterministic golden angle
    const radius=22+(i%4)*4;
    const x=radius*Math.cos(a),z=radius*Math.sin(a),y=-13+(i*11%46);
    const bead=solid(fx,new THREE.OctahedronGeometry(i%6===0?1.2:.65,0),sparkMat,[x,y,z]);
    sparks.push({bead,x,y,z,phase:i*1.17});
  }
  // Lighting required only for the premium PBR candidate;
  // prior A/B/C remain intentionally flat-shaded comparison references.
  const ambient=new THREE.HemisphereLight(0xb4fff0,0x102435,2.4);
  const key=new THREE.DirectionalLight(0xffe7c2,3.1); key.position.set(40,100,80);
  const fill=new THREE.DirectionalLight(0x8a7bea,2.1); fill.position.set(-55,35,-65);
  g.add(ambient,key,fill);

  return {
    group:g,
    setQuality(level){
      fx.visible=level!=='low';
      aura.visible=level==='high';
      for(let i=0;i<sparks.length;i++){
        sparks[i].bead.visible=(level==='high'||(level==='medium'&&i<11));
      }
    },
    animate(t){
      heart.scale.setScalar(1+.06*Math.sin(t*1.35));
      heart.scale.y=1.43*(1+.06*Math.sin(t*1.35));
      inner.rotation.y=Math.sin(t*.24)*.13;
      crown.rotation.z=Math.sin(t*.42)*.07;
      flame.position.y=27.5+Math.sin(t*.9)*1.4;
      for(const [i,p] of trails.entries()){
        p.bead.position.copy(p.path.getPoint((t*.12+p.offset)%1));
        const port=exits[i];
        port.rotation.z=Math.sin(t*.65+i*2.1)*.075;
      }
      for(const p of sparks){
        p.bead.position.y=p.y+Math.sin(t*.8+p.phase)*1.8;
      }
    }
  };
}

export function createRelay3DLayer(maplibregl,coords,initialConcept='lighthouse',onFault=()=>{}){
  const geo=maplibregl.MercatorCoordinate.fromLngLat(coords,0);
  const m=geo.meterInMercatorCoordinateUnits();
  const world=new THREE.Matrix4()
    .makeTranslation(geo.x,geo.y,geo.z)
    .scale(new THREE.Vector3(m,-m,m))
    .multiply(new THREE.Matrix4().makeRotationX(Math.PI/2));
  const proj=new THREE.Matrix4();
  const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let enabled=true;
  let active=RELAY_CONCEPTS.includes(initialConcept)?initialConcept:'lighthouse';
  let quality='medium';
  let grade=3;
  const layer={
    id:'majakka-relay-art-lab',
    type:'custom',
    renderingMode:'3d',
    onAdd(map,gl){
      this.map=map;
      this.camera=new THREE.Camera();
      this.scene=new THREE.Scene();
      this.anchor=new THREE.Group();this.anchor.position.y=35;this.scene.add(this.anchor);
      this.concepts={
        haara:buildHaara(this.anchor),
        portti:buildPortti(this.anchor),
        kudos:buildKudos(this.anchor),
        chromatic:buildChromatic(this.anchor),
        lighthouse:buildRelayLighthouse(THREE,this.anchor)
      };
      this.floor=new THREE.Group();base(this.floor);this.scene.add(this.floor);
      this.renderer=new THREE.WebGLRenderer({
        canvas:map.getCanvas(),context:gl,alpha:true,antialias:true
      });
      this.renderer.autoClear=false;
      this.started=performance.now();
      this.failed=false;
      this.setConcept(active);
      this.setQuality(quality);
      this.setGrade(grade);
    },
    setConcept(id){
      if(!RELAY_CONCEPTS.includes(id))return false;
      active=id;
      if(this.concepts)for(const [key,obj] of Object.entries(this.concepts)){
        obj.group.visible=(key===active);
      }
      this.map?.triggerRepaint();
      return true;
    },
    getConcept(){return active;},
    setQuality(level){
      if(!['low','medium','high'].includes(level))return false;
      quality=level;
      if(this.concepts?.chromatic)this.concepts.chromatic.setQuality(level);
      if(this.concepts?.lighthouse)this.concepts.lighthouse.setQuality(level);
      this.map?.triggerRepaint();
      return true;
    },
    getQuality(){return quality;},
    setGrade(level){
      if(![1,2,3].includes(level))return false;
      grade=level;
      this.concepts?.lighthouse?.setGrade(level);
      this.map?.triggerRepaint();
      return true;
    },
    getGrade(){return grade;},
    setEnabled(value){enabled=!!value;this.map?.triggerRepaint();},
    render(gl,args){
      if(!enabled||!this.renderer||!args?.defaultProjectionData?.mainMatrix)return;
      try{
        const t=(performance.now()-this.started)/1000;
        if(!reduceMotion&&!document.hidden){
          this.anchor.position.y=35+Math.sin(t*.85)*1.4;
          this.concepts[active]?.animate(t);
        }
        proj.fromArray(args.defaultProjectionData.mainMatrix);
        this.camera.projectionMatrix.copy(proj).multiply(world);
        // KEEP v0.4.2 fix: draw after all map layers, no stale shared depth
        // from roads/labels can slice through these solid 3D shapes.
        this.renderer.resetState();
        this.renderer.clearDepth();
        this.renderer.render(this.scene,this.camera);
        if(!reduceMotion&&!document.hidden)this.map.triggerRepaint();
      }catch(error){
        if(!this.failed){this.failed=true;console.error('Relay art lab 3D:',error);onFault(error);}
        enabled=false;
      }
    },
    onRemove(){
      enabled=false;
      const geometries=new Set(),materials=new Set();
      this.scene?.traverse(obj=>{
        if(obj.geometry)geometries.add(obj.geometry);
        if(obj.material)(Array.isArray(obj.material)?obj.material:[obj.material]).forEach(x=>materials.add(x));
      });
      geometries.forEach(x=>x.dispose());
      materials.forEach(x=>x.dispose());
      this.renderer?.dispose();this.renderer=null;
    }
  };
  return layer;
}
