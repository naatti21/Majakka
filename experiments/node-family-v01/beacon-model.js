// MAJAKKA — six genuinely distinct lighthouse buildings and crowns.
// Material identity lives in albedo/roughness/bump textures, NOT repeated torus decorations.
// Gameplay Node roles (Atlas) remain separate from visual concept candidates.
import {BEACONS,createMaterialMaps} from './beacon-materials.js?v=001';

export function buildBeacon(THREE,id,quality='medium'){
  const def=BEACONS.find(t=>t.id===id);
  if(!def)throw Error('Unknown beacon '+id);
  const group=new THREE.Group();
  const maps=createMaterialMaps(THREE,id,quality);
  const skin=maps.material;
  const mk=(color,metalness=.22,roughness=.4,emissive=0x000000,strength=0)=>
    new THREE.MeshStandardMaterial({color,metalness,roughness,emissive,emissiveIntensity:strength});
  const dark=mk(0x1a2732,.45,.55);
  const shadow=mk(0x101923,.32,.7);
  const pale=mk(0xb0bac2,.2,.28);
  const wood=mk(0x5b4432,.05,.72);
  const bronze=mk(0x9d7751,.69,.39);
  const copper=mk(0xb66f4a,.72,.32);
  const patina=mk(0x5d9991,.37,.45);
  const moss=mk(0x5c7a4d,.03,.87);
  const pearl=mk(0xc6c9d9,.14,.3);
  const lamp= new THREE.MeshBasicMaterial({
    color:id==='grove'?0xc4f7b6:id==='observer'?0xc5f4ff:
          id==='prism'?0xddefff:id==='relay'?0xffdab2:0xffdbab
  });
  const lamps=[lamp];
  const mesh=(geometry,material,pos=[0,0,0],parent=group)=>{
    const o=new THREE.Mesh(geometry,material);o.position.set(...pos);
    parent.add(o);return o;
  };
  const cylinder=(top,bottom,h,segments,material,pos,parent=group)=>{
    return mesh(new THREE.CylinderGeometry(top,bottom,h,segments),material,pos,parent);
  };
  const box=(w,h,d,material,pos,parent=group)=>{
    return mesh(new THREE.BoxGeometry(w,h,d),material,pos,parent);
  };
  const sphere=(r,material,pos,parent=group,segments=12)=>{
    return mesh(new THREE.IcosahedronGeometry(r,1),material,pos,parent);
  };
  const torus=(r,tub,material,y,parent=group)=>{
    const o=mesh(new THREE.TorusGeometry(r,tub,7,48),material,[0,y,0],parent);
    o.rotation.x=Math.PI/2;return o;
  };

  // Architectural profiles in metres: each type has its own stem proportions,
  // not a common cylinder dressed with alternate paint.
  const profiles={
    prism:   [[-28,8.9],[-25,9.05],[-21,8.1],[-8,6.3],[8,5.5],[12,5.6]],
    archive: [[-28,12.5],[-24,12.0],[-19,11.4],[-10,10.8],[-1,10.0],[8,9.0],[12,9.6]],
    grove:   [[-28,13],[-23,11.8],[-18,10.2],[-8,8.1],[2,7.4],[8,8.7],[12,8.2]],
    relay:   [[-28,9.6],[-26,9.4],[-15,8.3],[-3,7.35],[8,6.3],[12,6.6]],
    observer:[[-28,7.3],[-22,7.1],[-7,5.9],[2,5.2],[8,5.9],[12,6.0]],
    commons: [[-28,10],[-25,10.2],[-16,9.4],[-6,8.85],[5,8.45],[12,8.8]]
  };
  const sides={prism:8,archive:12,grove:10,relay:12,observer:9,commons:4};
  const profile=profiles[id];
  const stem=mesh(new THREE.LatheGeometry(
    profile.map(([y,r])=>new THREE.Vector2(r,y)),sides[id],0,Math.PI*2),
    skin,[0,0,0]);
  // Commons has a square cross section, the rest can stay round/polygonal.
  if(id==='commons')stem.rotation.y=Math.PI/4;

  // Natural Grove irregularity is in the body, without free-floating branches.
  if(id==='grove'){
    const positions=stem.geometry.attributes.position;
    const count=positions.count;
    for(let i=0;i<count;i++){
      const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i);
      const a=Math.atan2(z,x);
      const factor=1+.037*Math.sin(a*5+y*.24)+.017*Math.sin(y*.45+a*2);
      positions.setXYZ(i,x*factor,y,z*factor);
    }
    positions.needsUpdate=true;stem.geometry.computeVertexNormals();
  }

  const footRadius={prism:10,archive:13.8,grove:14,relay:10.5,observer:8.6,commons:12}[id];
  const plinthMaterial=id==='archive'?skin:id==='grove'?moss:id==='commons'?wood:dark;
  cylinder(footRadius*.9,footRadius,3.2,id==='commons'?4:12,plinthMaterial,[0,-29,0]);
  const feet=mesh(new THREE.CylinderGeometry(footRadius*1.02,footRadius*1.05,.75,12),shadow,[0,-31,0]);
  if(id==='commons')feet.rotation.y=Math.PI/4;

  // Extra architecture only when it helps reveal the actual building method.
  if(id==='commons'){
    // Four clearly structural wooden corner supports, not a pile of ornaments.
    for(const x of [-6.8,6.8])for(const z of [-6.8,6.8]){
      const p=box(1.25,37,1.25,wood,[x,-7.5,z]);
      p.rotation.z=x>0?-.045:.045;
    }
    for(const y of [-22,-5,10]){
      box(16.3,.7,.65,bronze,[0,y,8.3]);
      box(16.3,.7,.65,bronze,[0,y,-8.3]);
      box(.65,.7,16.3,bronze,[8.3,y,0]);
      box(.65,.7,16.3,bronze,[-8.3,y,0]);
    }
  }
  if(id==='archive'){
    // Masonry course breaks are an albedo texture; only two large ledges are geometry.
    cylinder(10.4,11.2,1.9,12,skin,[0,-12,0]);
    cylinder(9.3,9.6,1.6,12,skin,[0,8.5,0]);
  }
  if(id==='grove'){
    // More plant-like silhouette at the top; the damp moss remains a surface shader.
    cylinder(8.2,9.3,4.0,9,skin,[0,11.2,0]);
  }
  if(id==='relay'){
    // Thin longitudinal joints suggest formed copper panels; almost all patina in map.
    for(let n=0;n<3;n++){
      const a=n*2*Math.PI/3+.2;
      const x=Math.sin(a)*7.4,z=Math.cos(a)*7.4;
      const line=box(.32,35,.26,copper,[x,-7,z]);line.rotation.y=a;
    }
  }
  if(id==='prism'){
    const rim=cylinder(7.2,6.0,2.3,8,pale,[0,12.3,0]);
    rim.rotation.y=Math.PI/8;
  }

  const crown=new THREE.Group();
  crown.position.y=13.5;group.add(crown);
  let animated=null;
  function lanternWalls(radius,h,posts=8,frame=bronze,coreColor=lamp){
    cylinder(radius+1,radius+1.3,1.7,posts,frame,[0,-.9,0],crown);
    cylinder(radius,radius,7.9,posts,dark,[0,4.25,0],crown);
    for(let n=0;n<posts;n++){
      const a=n*Math.PI*2/posts;
      cylinder(.36,.44,h,6,frame,
        [Math.sin(a)*radius,4.1,Math.cos(a)*radius],crown);
    }
    return sphere(radius*.54,coreColor,[0,4.5,0],crown);
  }

  if(id==='prism'){
    // Faceted optical crown: three framed glass-like apertures, not a crystal tower.
    const core=lanternWalls(6.5,10,8,pale);
    const glass=[mk(0x75d9e6,.03,.17,0x468fce,.48),
      mk(0xb69cdd,.05,.17,0x9c6dc8,.42),mk(0xffcd95,.06,.2,0xd7a363,.42)];
    for(let i=0;i<3;i++){
      const a=i*2*Math.PI/3;
      const panel=new THREE.Group();
      panel.position.set(Math.sin(a)*6.0,4.4,Math.cos(a)*6.0);
      panel.rotation.y=a;crown.add(panel);
      const pane=box(3.7,7.0,.48,glass[i],[0,0,0],panel);
      pane.rotation.z=i===1?.14:-.08;
      box(4.2,.45,.75,pale,[0,-3.5,0],panel);
    }
    const top=mesh(new THREE.ConeGeometry(8.1,5.1,8),pale,[0,12.5,0],crown);
    top.rotation.y=Math.PI/8;
    animated=core;
  }else if(id==='archive'){
    // Lower, heavy historical stone lantern with bronze grille and pyramidal roof.
    cylinder(10.1,10.3,2.5,12,skin,[0,0,0],crown);
    cylinder(8.3,8.3,10,12,dark,[0,5,0],crown);
    for(let n=0;n<6;n++){
      const a=n*Math.PI/3;
      cylinder(.98,1.15,11,7,skin,[Math.sin(a)*8.2,5,Math.cos(a)*8.2],crown);
    }
    animated=sphere(4.25,lamp,[0,5.1,0],crown);
    mesh(new THREE.ConeGeometry(10.3,5.3,12),skin,[0,13,0],crown);
  }else if(id==='grove'){
    // Calyx-like roof with broad curved seed-pod shelter above the lantern.
    cylinder(8,8.6,1.8,9,moss,[0,-.8,0],crown);
    cylinder(6.8,6.8,9.5,9,dark,[0,4.7,0],crown);
    for(let n=0;n<6;n++){
      const a=n*Math.PI/3;
      cylinder(.55,.72,10,7,moss,[Math.sin(a)*7,4.5,Math.cos(a)*7],crown);
    }
    animated=sphere(4.7,lamp,[0,4.7,0],crown);
    const shelter=mesh(new THREE.SphereGeometry(9.8,14,8,0,Math.PI*2,0,Math.PI*.45),
      skin,[0,10.4,0],crown);
    shelter.scale.set(1.12,.62,1.1);
    cylinder(1.35,2.5,4.4,9,moss,[0,17.6,0],crown);
  }else if(id==='relay'){
    // Exactly three strong directional apertures as socket anchors.
    cylinder(8.5,9.2,2.5,12,copper,[0,-.8,0],crown);
    cylinder(7.3,7.4,11.1,12,dark,[0,5.5,0],crown);
    for(let n=0;n<3;n++){
      const a=n*2*Math.PI/3;
      const panel=new THREE.Group();
      panel.position.set(Math.sin(a)*7.6,5.3,Math.cos(a)*7.6);
      panel.rotation.y=a;crown.add(panel);
      box(4.3,7.5,.85,lamp,[0,0,0],panel);
      box(5.0,.6,1.2,copper,[0,3.9,0],panel);
      box(5.0,.6,1.2,copper,[0,-3.9,0],panel);
      for(const x of [-2.35,2.35])box(.63,8.2,1.05,bronze,[x,0,.55],panel);
    }
    animated=sphere(4.1,lamp,[0,5,0],crown);
    mesh(new THREE.ConeGeometry(9.2,5.8,12),copper,[0,14.4,0],crown);
  }else if(id==='observer'){
    // Single forward-facing mineral optical lens; distinct from Prism's 3 windows.
    cylinder(8.7,7.2,2,9,pearl,[0,-1.1,0],crown);
    cylinder(7.0,7.0,10.5,9,dark,[0,4.9,0],crown);
    const lensFrame=cylinder(5.5,5.5,1.8,20,pearl,[0,6,7.4],crown);
    lensFrame.rotation.x=Math.PI/2;
    const lens=sphere(4.4,lamp,[0,6,8.55],crown);
    lens.scale.set(1,1,.35);
    animated=lens;
    for(let n=0;n<6;n++){
      const a=n*Math.PI/3;
      cylinder(.55,.55,10,7,pearl,[Math.sin(a)*7.05,5.4,Math.cos(a)*7.05],crown);
    }
    const cap=mesh(new THREE.ConeGeometry(9.8,5.9,9),skin,[0,14,0],crown);
    cap.rotation.y=Math.PI/9;
  }else if(id==='commons'){
    // Open four-sided wooden lighthouse pavilion, a SHARED cluster of warm lights.
    const base=cylinder(10,10.4,2.2,4,wood,[0,-.8,0],crown);
    base.rotation.y=Math.PI/4;
    for(const x of [-6.35,6.35])for(const z of [-6.35,6.35]){
      box(1.5,12,1.5,wood,[x,5.6,z],crown);
    }
    const bulbs=[];
    for(const [x,z] of [[0,0],[-3,2.6],[3,2.4]]){
      bulbs.push(sphere(2.5,lamp,[x,4.5,z],crown));
    }
    animated=bulbs[0];
    const cap=mesh(new THREE.ConeGeometry(11,5.7,4),wood,[0,14.2,0],crown);
    cap.rotation.y=Math.PI/4;
    box(2.3,3,2.3,bronze,[0,19,0],crown);
  }

  // Real lighting surfaces show gloss, patina, wet moss, stone porosity.
  const hemi=new THREE.HemisphereLight(0xe6faff,0x14212b,2.2);
  const warm=new THREE.DirectionalLight(0xffd7a0,3.2);
  warm.position.set(25,55,75);
  const cool=new THREE.DirectionalLight(0x8dbcf7,1.6);
  cool.position.set(-44,34,-38);
  group.add(hemi,warm,cool);
  const light=new THREE.PointLight(lamp.color,10,35,2);
  light.position.set(0,18,0);group.add(light);
  const firstTimeColor=lamp.color.clone();

  let disposed=false;
  function dispose(){
    if(disposed)return;
    disposed=true;
    const geometries=new Set(),materials=new Set(),textures=new Set(maps.textures);
    group.traverse(obj=>{
      if(obj.geometry)geometries.add(obj.geometry);
      for(const mat of (Array.isArray(obj.material)?obj.material:obj.material?[obj.material]:[])){
        materials.add(mat);
        for(const field of ['map','roughnessMap','bumpMap','normalMap'])if(mat[field])textures.add(mat[field]);
      }
    });
    geometries.forEach(g=>g.dispose());
    materials.forEach(m=>m.dispose());
    textures.forEach(t=>t.dispose());
  }
  return {id,group,dispose,materialMaps:maps.size,
    animate(t){
      if(!animated)return;
      const pulse=1+.045*Math.sin(t*.85);
      animated.scale.setScalar(id==='observer'?.95:pulse);
      if(id==='observer')animated.scale.set(1,1,.35+.025*Math.sin(t*.85));
      light.intensity=8.5+1.5*Math.sin(t*.8);
      if(id==='prism'){
        const hue=(Math.sin(t*.65)+1)*.5;
        light.color.setRGB(.64+.28*hue,.88,.97-.16*hue);
      }else light.color.copy(firstTimeColor);
    }
  };
}
