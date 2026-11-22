// MAJAKKA v0.7 — organic translucent resonance channels.
// Unique, original procedural art: subtly varying tube wall, roughness/bump,
// subsurface-looking glow, internal winding fibres and small flowing light orbs.
// The wall is one coherent hollow-looking membrane, not a straight laser.
// All meshes are constructed ONCE; animation updates only uniforms, material
// opacity and orb transforms. All art is a visual DEMO, not game power flow.

const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
const mix=(a,b,t)=>a+(b-a)*t;

export function createMembraneMaps(THREE){
  // Low cost surface variation for biological film. The green channel encodes
  // roughness for MeshStandardMaterial; all channels carry bump height.
  const w=192,h=96;
  const rough=document.createElement('canvas'),bump=document.createElement('canvas');
  rough.width=bump.width=w;rough.height=bump.height=h;
  const rc=rough.getContext('2d'),bc=bump.getContext('2d');
  const ri=rc.createImageData(w,h),bi=bc.createImageData(w,h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const u=x/w,v=y/h;
    const fine=Math.sin(u*89+3*Math.sin(v*11)+Math.cos(u*17+v*7)*1.5);
    const warp=Math.cos(v*Math.PI*10+u*23+Math.sin(u*4)*1.3);
    const grain=Math.sin(u*242+v*32)*Math.cos(v*55-u*35);
    const roughness=clamp(.36+.19*fine+.12*warp+.05*grain,.12,.79);
    const height=clamp(.50+.18*fine+.13*warp+.09*grain,.02,.98);
    const i=(y*w+x)*4;
    for(let k=0;k<3;k++){
      ri.data[i+k]=Math.round(roughness*255);
      bi.data[i+k]=Math.round(height*255);
    }
    ri.data[i+3]=bi.data[i+3]=255;
  }
  rc.putImageData(ri,0,0);bc.putImageData(bi,0,0);
  const roughnessMap=new THREE.CanvasTexture(rough);
  const bumpMap=new THREE.CanvasTexture(bump);
  for(const tex of [roughnessMap,bumpMap]){
    tex.wrapS=THREE.RepeatWrapping;tex.wrapT=THREE.RepeatWrapping;
    tex.anisotropy=2;
  }
  return {
    roughnessMap,bumpMap,
    dispose(){roughnessMap.dispose();bumpMap.dispose();}
  };
}

function makeMembraneGeometry(THREE,curve,index,startColor,endColor,quality){
  const segments=quality==='low'?56:quality==='high'?112:84;
  const sides=quality==='low'?8:12;
  const frames=curve.computeFrenetFrames(segments,false);
  const len=(segments+1)*(sides+1);
  const positions=new Float32Array(len*3);
  const colors=new Float32Array(len*3);
  const uv=new Float32Array(len*2);
  const indices=[];
  const from=new THREE.Color(startColor),to=new THREE.Color(endColor);
  const tint=new THREE.Color();
  const position=new THREE.Vector3();
  const radial=new THREE.Vector3();
  for(let i=0;i<=segments;i++){
    const t=i/segments,center=curve.getPointAt(t);
    const taper=.51+.49*Math.pow(Math.sin(t*Math.PI),.34);
    const irregular=1+.065*Math.sin(t*Math.PI*15+index*1.7)
      +.038*Math.sin(t*Math.PI*39+index*.9);
    const radius=2.75*taper*irregular;
    tint.copy(from).lerp(to,t);
    // Smooth biological color zones — the colour belongs to the material,
    // not a neon line that cuts across map labels.
    tint.multiplyScalar(.88+.10*Math.sin(t*11+index*.8));
    for(let j=0;j<=sides;j++){
      const angle=(j/sides)*Math.PI*2;
      radial.copy(frames.normals[i]).multiplyScalar(Math.cos(angle))
        .addScaledVector(frames.binormals[i],Math.sin(angle));
      const ridges=1+.042*Math.sin(angle*5+t*26+index)
        +.019*Math.cos(angle*9-t*53+index*.4);
      position.copy(center).addScaledVector(radial,radius*ridges);
      const k=i*(sides+1)+j;
      positions[3*k]=position.x;positions[3*k+1]=position.y;positions[3*k+2]=position.z;
      colors[3*k]=tint.r;colors[3*k+1]=tint.g;colors[3*k+2]=tint.b;
      uv[2*k]=t*4.2;uv[2*k+1]=j/sides;
    }
  }
  for(let i=0;i<segments;i++)for(let j=0;j<sides;j++){
    const a=i*(sides+1)+j,b=a+sides+1;
    // Outward-facing winding: tangent cross circumferential gives inward
    // for this frame convention; reversing exposes the membrane exterior.
    indices.push(a,a+1,b,b,a+1,b+1);
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
  geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function makePath(THREE,start,end,index){
  const forward=end.clone().sub(start);
  forward.y=0;forward.normalize();
  const lateral=new THREE.Vector3(-forward.z,0,forward.x);
  const points=[];
  for(let i=0;i<=32;i++){
    const t=i/32,arc=Math.sin(Math.PI*t);
    const p=start.clone().lerp(end,t);
    // Maintain the approved airborne end-to-end connection while letting
    // the middle lift and wander as a calm organic strand.
    p.y+=arc*(12.5+2.0*Math.sin(2*Math.PI*t+index*.5));
    p.addScaledVector(lateral,arc*(3.1*Math.sin(Math.PI*2*t+index*.72)+1.2*Math.sin(t*5*Math.PI)));
    points.push(p);
  }
  return new THREE.CatmullRomCurve3(points,false,'centripetal',.35);
}

export function buildOrganicStrand(THREE,start,end,index,fromColor,toColor,materialMaps,buildQuality='medium'){
  const group=new THREE.Group();
  const curve=makePath(THREE,start,end,index);
  const membrane=new THREE.Mesh(
    makeMembraneGeometry(THREE,curve,index,fromColor,toColor,buildQuality),
    new THREE.MeshStandardMaterial({
      vertexColors:true,transparent:true,opacity:.48,
      depthWrite:false,side:THREE.FrontSide,roughness:.58,
      metalness:.04,roughnessMap:materialMaps.roughnessMap,
      bumpMap:materialMaps.bumpMap,bumpScale:.18,
      emissive:new THREE.Color(fromColor).lerp(new THREE.Color(toColor),.45),
      emissiveIntensity:.12
    })
  );
  membrane.renderOrder=8;
  group.add(membrane);

  // A faint inner flowing medium, deliberately much softer than a laser.
  const inner=new THREE.Mesh(
    new THREE.TubeGeometry(curve,buildQuality==='low'?55:84,.68,7,false),
    new THREE.MeshBasicMaterial({
      color:new THREE.Color(fromColor).lerp(new THREE.Color(toColor),.55),
      transparent:true,opacity:.17,depthWrite:false,blending:THREE.AdditiveBlending
    })
  );
  inner.renderOrder=9;group.add(inner);

  // Thin spiral micro-fibres live WITHIN the membrane, not wrapping its
  // exterior like big mechanical rings. Zero radial offset at either socket.
  const filaments=[];
  for(let side=0;side<2;side++){
    const path=[];
    const count=buildQuality==='low'?48:100;
    const frames=curve.computeFrenetFrames(count,false);
    for(let i=0;i<=count;i++){
      const t=i/count,theta=t*Math.PI*13+side*Math.PI+index*.9;
      const r=.94*Math.sin(Math.PI*t);
      const p=curve.getPointAt(t);
      p.addScaledVector(frames.normals[i],Math.cos(theta)*r);
      p.addScaledVector(frames.binormals[i],Math.sin(theta)*r);
      path.push(p);
    }
    const line=new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(path),count,.13,5,false),
      new THREE.MeshBasicMaterial({
        color:side===0?fromColor:toColor,
        transparent:true,opacity:side===0?.34:.28,depthWrite:false
      })
    );
    line.renderOrder=10;
    group.add(line);filaments.push(line);
  }

  // Glowing *spherical* droplets travel safely inside the lumen rather
  // than being tiny debug diamonds sliding along an exposed wire.
  const droplets=[];
  for(let n=0;n<3;n++){
    const capsule=new THREE.Group();
    const core=new THREE.Mesh(
      new THREE.SphereGeometry(1.08,12,8),
      new THREE.MeshBasicMaterial({
        color:0xfff0d5,transparent:true,opacity:.96,depthWrite:false
      })
    );
    const aura=new THREE.Mesh(
      new THREE.SphereGeometry(1.74,12,8),
      new THREE.MeshBasicMaterial({
        color:n%2?toColor:fromColor,transparent:true,opacity:.18,
        depthWrite:false,blending:THREE.AdditiveBlending
      })
    );
    core.renderOrder=12;aura.renderOrder=11;
    capsule.add(core,aura);
    group.add(capsule);
    droplets.push({capsule,core,aura,offset:n/3});
  }

  const fadeMeshes=[membrane,inner,...filaments];
  const baseOpacity=[.48,.17,.34,.28];
  function update(time,fade,quality,motionReduced=false){
    const strength=clamp(fade);
    group.visible=strength>.005;
    if(!group.visible)return;
    // Slight breathing through the wall's luminous response, not geometry
    // recalculation or uncontrolled spinning.
    const breath=motionReduced?1:(.94+.06*Math.sin(time*.74+index*1.3));
    fadeMeshes.forEach((mesh,i)=>{
      mesh.material.opacity=baseOpacity[i]*strength*breath;
    });
    membrane.material.emissiveIntensity=.09+.035*strength*breath;
    filaments[0].visible=quality!=='low';
    filaments[1].visible=quality==='high';
    inner.visible=true;
    droplets.forEach((d,i)=>{
      d.capsule.visible=i<(quality==='low'?1:quality==='medium'?2:3);
      const t=motionReduced?(d.offset+.13)%1:(time*.078+d.offset+index*.14)%1;
      d.capsule.position.copy(curve.getPointAt(t));
      d.capsule.scale.setScalar(Math.max(.001,strength*(.94+.07*Math.sin(time*1.8+i))));
      d.core.material.opacity=.9*strength;
      d.aura.material.opacity=.16*strength;
    });
  }

  function dispose(){
    const geometries=new Set(),materials=new Set();
    group.traverse(object=>{
      if(object.geometry)geometries.add(object.geometry);
      if(object.material){
        for(const mat of (Array.isArray(object.material)?object.material:[object.material]))
          materials.add(mat);
      }
    });
    geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());
    group.clear();
    // Shared materialMaps are owned and disposed by the parent network layer.
  }
  return {group,curve,membrane,inner,droplets,filaments,update,dispose};
}
