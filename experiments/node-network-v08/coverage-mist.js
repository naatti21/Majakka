// MAJAKKA v0.8 — light translucent coverage veil on a closed 3-Node loop.
// This is a VISUAL demo: not physical map coverage or a gameplay calculation.
// One faint texture-mapped mesh (120 vertices), and optionally one Points cloud.
// CPU animation only adjusts 120 y-coordinates; no full-screen shader pass.
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const smooth=x=>x*x*(3-2*x);

function makeFogTexture(THREE){
  const size=192,canvas=document.createElement('canvas');
  canvas.width=canvas.height=size;
  const ctx=canvas.getContext('2d');
  const image=ctx.createImageData(size,size);
  // Color and opacity are baked into one small reusable texture.
  // UV values outside the three-corner region have alpha=0.
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const u=x/(size-1),v=y/(size-1),w=1-u-v;
    const edge=Math.min(u,v,w);
    const feather=smooth(clamp(edge/.125));
    const wisp=.55+.22*Math.sin(u*28+v*12)
                     +.16*Math.sin(v*45-u*11)
                     +.07*Math.cos(u*75+v*34);
    const i=(y*size+x)*4;
    image.data[i]=Math.round(126+70*v+22*u);
    image.data[i+1]=Math.round(165+40*u+15*v);
    image.data[i+2]=Math.round(178+35*v+22*u);
    image.data[i+3]=Math.round(200*feather*clamp(wisp,.14,.95));
  }
  ctx.putImageData(image,0,0);
  const map=new THREE.CanvasTexture(canvas);
  map.colorSpace=THREE.SRGBColorSpace;
  // Canvas rows are authored in the same orientation as our barycentric UVs.
  map.flipY=false;
  map.wrapS=map.wrapT=THREE.ClampToEdgeWrapping;
  map.anisotropy=2;
  return map;
}

// Barycentric blend of the three actual link elevations. Exactly matches
// each link along its edge; interior blends the three airborne profiles.
// Edge order: AB, AC, BC. Sample lookup uses normalized curve parameter.
export function coverageHeight(a,b,c,heights){
  const ab=a+b,ac=a+c,bc=b+c;
  const weights=[a*b,a*c,b*c];
  const total=weights[0]+weights[1]+weights[2];
  if(total<1e-10)return a>=b&&a>=c?heights[0](0):b>=c?heights[0](1):heights[1](1);
  return (weights[0]*heights[0](ab?b/ab:0)+weights[1]*heights[1](ac?c/ac:0)+weights[2]*heights[2](bc?c/bc:0))/total;
}
export function coverageWave(a,b,c,time){
  // Zero at boundary; broad travelling crests, stronger than the old 0.9 m ripple.
  const interior=Math.min(1,Math.max(0,27*a*b*c));
  return interior*(3.2*Math.sin(8*b+4*c-time*.75)+1.5*Math.sin(6*c-3*a+time*.48));
}
function heightSampler(curve){
  const n=64,values=Array.from({length:n+1},(_,i)=>curve.getPoint(i/n).y);
  return t=>{const x=clamp(t)*n,i=Math.min(n-1,Math.floor(x)),f=x-i;return values[i]*(1-f)+values[i+1]*f;};
}

export function buildCoverageMist(THREE,nodes,spriteTexture,curves){
  if(nodes.length!==3)throw Error('Coverage mist needs exactly three Node positions');
  if(!Array.isArray(curves)||curves.length!==3)throw Error('Coverage needs three actual link curves');
  const heights=curves.map(heightSampler);
  const steps=14;
  const verts=[],uv=[],indices=[],grid=[];
  const anchors=nodes;
  const bary=[];
  for(let i=0;i<=steps;i++){
    grid[i]=[];
    for(let j=0;j<=steps-i;j++){
      const u=i/steps,v=j/steps,w=1-u-v;
      const p=anchors[0].clone().multiplyScalar(w)
        .addScaledVector(anchors[1],u).addScaledVector(anchors[2],v);
      grid[i][j]=verts.length/3;
      verts.push(p.x,coverageHeight(w,u,v,heights),p.z);
      bary.push([w,u,v]);
      uv.push(u,v);
    }
  }
  for(let i=0;i<steps;i++)for(let j=0;j<steps-i;j++){
    const a=grid[i][j],b=grid[i+1][j],c=grid[i][j+1];
    indices.push(a,b,c);
    if(j<steps-i-1)indices.push(b,grid[i+1][j+1],c);
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  geometry.setIndex(indices);
  const fogTexture=makeFogTexture(THREE);
  const fogMaterial=new THREE.MeshBasicMaterial({
    map:fogTexture,transparent:true,opacity:0,
    depthWrite:false,depthTest:false,side:THREE.DoubleSide,
    blending:THREE.NormalBlending
  });
  const mesh=new THREE.Mesh(geometry,fogMaterial);
  mesh.frustumCulled=false;
  mesh.renderOrder=3;

  // Sparse motes share the canopy's airborne height and wave.
  const MAX_MOTES=48;
  const positions=new Float32Array(MAX_MOTES*3);
  const colors=new Float32Array(MAX_MOTES*3);
  const rand=n=>{const x=Math.sin(n*127.1+23.4)*43758.5453;return x-Math.floor(x)};
  const tint=new THREE.Color(),white=new THREE.Color(0xd9fff3);
  const nodeColors=[new THREE.Color(0xd9a075),new THREE.Color(0x89e6ae),new THREE.Color(0xb5baff)];
  for(let k=0;k<MAX_MOTES;k++){
    const r1=Math.sqrt(rand(k*3+1)),r2=rand(k*3+2);
    const a=1-r1,b=r1*(1-r2),c=r1*r2;
    const p=anchors[0].clone().multiplyScalar(a)
      .addScaledVector(anchors[1],b).addScaledVector(anchors[2],c);
    positions[k*3]=p.x;
    positions[k*3+1]=coverageHeight(a,b,c,heights)+1.2+3*rand(k*5+19);
    positions[k*3+2]=p.z;
    tint.copy(nodeColors[0]).multiplyScalar(a)
      .add(nodeColors[1].clone().multiplyScalar(b))
      .add(nodeColors[2].clone().multiplyScalar(c)).lerp(white,.68);
    colors[k*3]=tint.r;colors[k*3+1]=tint.g;colors[k*3+2]=tint.b;
  }
  const moteGeometry=new THREE.BufferGeometry();
  moteGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  moteGeometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
  moteGeometry.setDrawRange(0,28);
  const moteMaterial=new THREE.PointsMaterial({
    map:spriteTexture,vertexColors:true,size:3.0,sizeAttenuation:false,
    transparent:true,opacity:0,depthWrite:false,depthTest:false,
    blending:THREE.AdditiveBlending,alphaTest:.025
  });
  const motes=new THREE.Points(moteGeometry,moteMaterial);
  motes.frustumCulled=false;
  motes.renderOrder=4;
  const group=new THREE.Group();
  group.add(mesh,motes);

  const positionAttr=geometry.getAttribute('position');
  const original=positionAttr.array.slice();
  const moteBase=positions.slice();
  const moteBary=Array.from({length:MAX_MOTES},(_,k)=>{const r1=Math.sqrt(rand(k*3+1)),r2=rand(k*3+2);return [1-r1,r1*(1-r2),r1*r2];});
  const moteAttr=moteGeometry.getAttribute('position');
  let enabled=true;
  let opacity=0;
  function setEnabled(v){enabled=!!v;}
  function isEnabled(){return enabled;}
  function update(time,closed,quality,reduced,dt){
    const target=enabled?clamp(closed):0;
    if(reduced)opacity=target;
    else opacity+=Math.sign(target-opacity)*Math.min(Math.abs(target-opacity),dt*.7);
    group.visible=opacity>.002;
    if(!group.visible)return;
    // Gentle 3D rippling. ~120 vertices, no geometry allocations per frame.
    {
      for(let i=0;i<positionAttr.count;i++){
        positionAttr.setY(i,original[i*3+1]+(reduced?0:coverageWave(...bary[i],time)));
      }
      positionAttr.needsUpdate=true;
    }
    fogMaterial.opacity=opacity*(reduced?.48:(.47+.035*Math.sin(time*.30)));
    const count=quality==='high'?48:quality==='medium'?28:0;
    moteGeometry.setDrawRange(0,count);
    motes.visible=count>0;
    moteMaterial.opacity=opacity*.39;
    if(!reduced){for(let k=0;k<count;k++)moteAttr.setY(k,moteBase[k*3+1]+coverageWave(...moteBary[k],time));moteAttr.needsUpdate=true;}
    else {for(let k=0;k<count;k++)moteAttr.setY(k,moteBase[k*3+1]);moteAttr.needsUpdate=true;}
  }
  function dispose(){
    geometry.dispose();fogMaterial.dispose();fogTexture.dispose();
    moteGeometry.dispose();moteMaterial.dispose();group.clear();
  }
  return {group,mesh,motes,setEnabled,isEnabled,update,dispose};
}
