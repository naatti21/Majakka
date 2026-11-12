// MAJAKKA · Relay design lab v0.1
// Three interchangeable ACTUAL 3D designs for the established Relay Node type.
// All geometry, animations and positions are DEMO art direction only.
// Stable v0.4.2 rendering: last MapLibre layer + isolated depth buffer.
import * as THREE from 'https://unpkg.com/three@0.178.0/build/three.module.js';

export const RELAY_CONCEPTS = Object.freeze(['haara', 'portti', 'kudos']);

const dark = () => new THREE.MeshBasicMaterial({color:0x0c3442, side:THREE.DoubleSide});
const mid = () => new THREE.MeshBasicMaterial({color:0x167f8b, side:THREE.DoubleSide});
const light = () => new THREE.MeshBasicMaterial({color:0x66ecdc, side:THREE.DoubleSide});
const bright = () => new THREE.MeshBasicMaterial({color:0xb8fff1, side:THREE.DoubleSide});
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
    tube(g,points.map(([x,y,z])=>[x,y+1.5,z]),1.35,light());
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
    const edge=solid(outer,new THREE.TorusGeometry(21,1.05,7,62,Math.PI*1.48),light());
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

export function createRelay3DLayer(maplibregl,coords,initialConcept='haara',onFault=()=>{}){
  const geo=maplibregl.MercatorCoordinate.fromLngLat(coords,0);
  const m=geo.meterInMercatorCoordinateUnits();
  const world=new THREE.Matrix4()
    .makeTranslation(geo.x,geo.y,geo.z)
    .scale(new THREE.Vector3(m,-m,m))
    .multiply(new THREE.Matrix4().makeRotationX(Math.PI/2));
  const proj=new THREE.Matrix4();
  const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let enabled=true;
  let active=RELAY_CONCEPTS.includes(initialConcept)?initialConcept:'haara';
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
        kudos:buildKudos(this.anchor)
      };
      this.floor=new THREE.Group();base(this.floor);this.scene.add(this.floor);
      this.renderer=new THREE.WebGLRenderer({
        canvas:map.getCanvas(),context:gl,alpha:true,antialias:true
      });
      this.renderer.autoClear=false;
      this.started=performance.now();
      this.failed=false;
      this.setConcept(active);
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
