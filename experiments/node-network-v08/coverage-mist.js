// MAJAKKA v0.8 — one lightweight suspended fog canopy inside a CLOSED
// three-beacon triangle. Purely visual DEMO, not gameplay coverage / influence.
// 1 transparent shader mesh (~190 vertices) + at most 1 tiny Points cloud.
// The shader breathes softly; NO CPU particle system or per-frame mesh rebuild.
export function buildCoverageMist(THREE,nodes,spriteTexture){
  if(nodes.length!==3)throw Error('Coverage mist needs exactly three node positions');
  const subdivisions=18;
  const verts=[],bary=[],tints=[],indices=[];
  const colors=[new THREE.Color(0xd9a075),new THREE.Color(0x89e6ae),new THREE.Color(0xb5baff)];
  const positions=nodes.map(p=>new THREE.Vector3(p.x,12,p.z));
  const coords=[];
  const tint=new THREE.Color();
  for(let i=0;i<=subdivisions;i++){
    coords[i]=[];
    for(let j=0;j<=subdivisions-i;j++){
      const u=i/subdivisions,v=j/subdivisions,w=1-u-v;
      const p=positions[0].clone().multiplyScalar(w)
        .addScaledVector(positions[1],u).addScaledVector(positions[2],v);
      coords[i][j]=verts.length/3;
      verts.push(p.x,p.y,p.z);
      bary.push(w,u,v);
      tint.setRGB(0,0,0).add(colors[0].clone().multiplyScalar(w))
        .add(colors[1].clone().multiplyScalar(u))
        .add(colors[2].clone().multiplyScalar(v));
      tints.push(tint.r,tint.g,tint.b);
    }
  }
  for(let i=0;i<subdivisions;i++){
    for(let j=0;j<subdivisions-i;j++){
      const a=coords[i][j],b=coords[i+1][j],c=coords[i][j+1];
      indices.push(a,b,c);
      if(j<subdivisions-i-1)indices.push(b,coords[i+1][j+1],c);
    }
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
  geometry.setAttribute('barycentric',new THREE.Float32BufferAttribute(bary,3));
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(tints,3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const fogMaterial=new THREE.ShaderMaterial({
    transparent:true,depthWrite:false,depthTest:true,
    side:THREE.DoubleSide,
    uniforms:{
      uTime:{value:0},uOpacity:{value:0}
    },
    vertexShader:`
      attribute vec3 barycentric;
      attribute vec3 color;
      varying vec3 vBary;
      varying vec3 vTint;
      varying vec2 vField;
      uniform float uTime;
      void main(){
        vBary=barycentric;
        vTint=color;
        vField=position.xz;
        vec3 p=position;
        // Only ~1 metre of movement: calm floating haze, not an ocean wave.
        p.y += .85*sin(p.x*.049+uTime*.32)*sin(p.z*.053-uTime*.22);
        gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
      }
    `,
    fragmentShader:`
      precision mediump float;
      varying vec3 vBary;
      varying vec3 vTint;
      varying vec2 vField;
      uniform float uTime;
      uniform float uOpacity;
      void main(){
        // True soft edge in barycentric coordinates. No sharp triangle slab.
        float edge=min(vBary.x,min(vBary.y,vBary.z));
        float feather=smoothstep(.0,.16,edge);
        // Two rolling broad-scale wisps, static spatial character.
        float wisps=.5+.25*sin(vField.x*.075+vField.y*.023+uTime*.29)
                         +.25*sin(vField.y*.092-vField.x*.026-uTime*.20);
        wisps=smoothstep(.22,.82,wisps);
        float opacity=uOpacity*feather*(.09+.16*wisps);
        vec3 colour=mix(vec3(.54,.73,.72),vTint,.24);
        gl_FragColor=vec4(colour,opacity);
      }
    `
  });
  const mesh=new THREE.Mesh(geometry,fogMaterial);
  mesh.renderOrder=3;
  mesh.frustumCulled=false; // vertex animation changes world bounds slightly

  // 48 slow-rising dust motes / mist droplets, one GPU point-cloud draw call.
  // Their coordinates are precomputed, never regenerated during animation.
  const MAX_MOTES=48;
  const dustPositions=new Float32Array(MAX_MOTES*3);
  const dustColors=new Float32Array(MAX_MOTES*3);
  const rand=(n)=>{const x=Math.sin(n*127.1+23.4)*43758.5453;return x-Math.floor(x)};
  const white=new THREE.Color(0xd9fff3);
  for(let i=0;i<MAX_MOTES;i++){
    const r1=Math.sqrt(rand(i*3+1)),r2=rand(i*3+2);
    const a=1-r1,b=r1*(1-r2),c=r1*r2;
    const p=positions[0].clone().multiplyScalar(a)
      .addScaledVector(positions[1],b).addScaledVector(positions[2],c);
    dustPositions[3*i]=p.x;
    dustPositions[3*i+1]=14+3*rand(i*5+19);
    dustPositions[3*i+2]=p.z;
    tint.copy(colors[0]).multiplyScalar(a)
      .add(colors[1].clone().multiplyScalar(b))
      .add(colors[2].clone().multiplyScalar(c)).lerp(white,.62);
    dustColors[3*i]=tint.r;
    dustColors[3*i+1]=tint.g;
    dustColors[3*i+2]=tint.b;
  }
  const dustGeo=new THREE.BufferGeometry();
  dustGeo.setAttribute('position',new THREE.BufferAttribute(dustPositions,3));
  dustGeo.setAttribute('color',new THREE.BufferAttribute(dustColors,3));
  dustGeo.setDrawRange(0,28);
  const dustMat=new THREE.PointsMaterial({
    map:spriteTexture,vertexColors:true,size:2.8,sizeAttenuation:false,
    transparent:true,opacity:0,depthWrite:false,depthTest:true,
    blending:THREE.AdditiveBlending,alphaTest:.025
  });
  const dust=new THREE.Points(dustGeo,dustMat);
  dust.frustumCulled=false;
  dust.renderOrder=4;
  const group=new THREE.Group();
  group.add(mesh,dust);
  let enabled=true;
  function setEnabled(v){enabled=!!v;}
  function isEnabled(){return enabled;}
  function update(time,closed,quality,reduceMotion,dt){
    const strength=Math.min(1,Math.max(0,closed));
    const target=enabled&&strength>.01?strength:0;
    // No trail-smearing when the user disables animations.
    if(reduceMotion)fogMaterial.uniforms.uOpacity.value=target;
    else{
      const v=fogMaterial.uniforms.uOpacity.value;
      fogMaterial.uniforms.uOpacity.value=v+Math.sign(target-v)*Math.min(Math.abs(target-v),dt*.65);
    }
    const amount=fogMaterial.uniforms.uOpacity.value;
    group.visible=amount>.002;
    if(!group.visible)return;
    fogMaterial.uniforms.uTime.value=reduceMotion?0:time;
    const count=quality==='high'?48:quality==='medium'?28:0;
    dustGeo.setDrawRange(0,count);
    dust.visible=count>0;
    dustMat.opacity=amount*.31;
    dust.position.y=reduceMotion?0:.35*Math.sin(time*.23);
  }
  function dispose(){
    geometry.dispose();fogMaterial.dispose();
    dustGeo.dispose();dustMat.dispose();
    group.clear();
  }
  return {group,mesh,dust,setEnabled,isEnabled,update,dispose};
}
