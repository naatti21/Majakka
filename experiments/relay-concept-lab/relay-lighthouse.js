// MAJAKKA / RELAY v0.3 — a compact lighthouse-shaped beacon, not a sprawling artifact.
// Independent art-module for the approved MapLibre + Three shared WebGL renderer.
// The three connections are an art-direction hint, NOT real player network links.
// Grade 1/2/3 is a VISUAL STUDY only; no canonical rarity/economy is defined here.
export function buildRelayLighthouse(THREE, parent) {
  const group=new THREE.Group();parent.add(group);
  const solid=(geometry,material,position=[0,0,0],target=group)=>{
    const mesh=new THREE.Mesh(geometry,material);
    mesh.position.set(...position);target.add(mesh);return mesh;
  };
  const material=(color,metalness=.3,roughness=.39,emissive=0x000000,intensity=0)=>
    new THREE.MeshStandardMaterial({color,metalness,roughness,emissive,emissiveIntensity:intensity});
  const stone=material(0x235267,.38,.52);
  const shaded=material(0x123242,.25,.58);
  const midnight=material(0x091b30,.46,.35);
  const patina=material(0x367c83,.36,.33);
  const copper=material(0xd38665,.72,.29);
  const brass=material(0xe7ba73,.79,.28);
  const porcelain=material(0xb0cad0,.22,.25);
  const cyan=material(0x52e0d0,.22,.18,0x16baab,.52);
  const champagne=material(0xffd69a,.19,.22,0xf4a64f,.52);
  const amberGrade=material(0xffa665,.38,.22,0xee642a,.61);
  const amethyst=material(0x9674d9,.25,.25,0x7250b6,.45);
  const glassDark=material(0x163d55,.65,.21);
  const lens=material(0xffe9bf,.2,.12,0xffbb60,1.0);

  // 0. Foundation: small real-footprint octagonal lighthouse plinth.
  const pedestal=solid(new THREE.CylinderGeometry(10.5,12,3.7,12),shaded,[0,-30.9,0]);
  pedestal.rotation.y=Math.PI/12;
  const foot=solid(new THREE.CylinderGeometry(9.6,10.7,1.6,12),stone,[0,-28.4,0]);foot.rotation.y=Math.PI/12;
  for(const [y,r,mat] of [[-32.7,12.0,brass],[-27.4,9.4,copper],[-26.2,9.15,brass]]){
    const band=solid(new THREE.TorusGeometry(r,.48,7,60),mat,[0,y,0]);
    band.rotation.x=Math.PI/2;
  }

  // 1. Solid tower. Strong compact silhouette; the detail belongs ON the skin.
  const tower=solid(new THREE.CylinderGeometry(6.7,8.8,38,12,3),stone,[0,-8.0,0]);
  tower.rotation.y=Math.PI/12;
  // Slightly tapered raised wall facets, shaded grout between flutes.
  for(let n=0;n<12;n++){
    const angle=n*Math.PI/6;
    const x=Math.sin(angle),z=Math.cos(angle);
    const rib=solid(new THREE.CylinderGeometry(.32,.44,35,6),n%3===0?brass:patina,
      [x*7.48,-8,z*7.48]);
    rib.rotation.z= Math.sin(angle)*-.047;
    rib.rotation.x= Math.cos(angle)*.047;
  }
  // Inlaid illuminated seam tracks: 3 lanes are the visible routing motif.
  const laneRings=[],laneDots=[];
  for(let lane=0;lane<3;lane++){
    const ang=lane*Math.PI*2/3+Math.PI/6;
    const dx=Math.sin(ang),dz=Math.cos(ang);
    const samples=[];
    for(let i=0;i<=18;i++){
      const t=i/18,y=-25+t*34;
      const rad=8.35-(8.35-6.9)*t;
      const ripple=.13*Math.sin(i*.65+lane*2);
      samples.push(new THREE.Vector3(dx*(rad+ripple),y,dz*(rad+ripple)));
    }
    const track=solid(new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(samples),54,.65,7,false),midnight);
    const trace=solid(new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(samples.map(p=>new THREE.Vector3(p.x*1.027,p.y,p.z*1.027))),54,.29,7,false),
      cyan);
    const pulse=solid(new THREE.IcosahedronGeometry(1.22,1),champagne,[0,-25,0]);
    laneRings.push(trace);laneDots.push({pulse,curve:new THREE.CatmullRomCurve3(samples),offset:lane/3});
  }
  // Artisanal surface detail instead of huge floating hoops.
  for(let row=0;row<6;row++){
    const y=-21+row*5.3;
    const rad=8.12-(8.12-7.10)*(row/6);
    for(let n=0;n<12;n++){
      const a=n*Math.PI/6+Math.PI/12;
      const accent=(row+n)%5===0?copper:brass;
      const glyph=solid(new THREE.OctahedronGeometry((n%3===0)?1.48:.8,0),
        accent,[rad*Math.sin(a),y,rad*Math.cos(a)]);
      glyph.scale.set(.48,1.65,.19);glyph.rotation.y=a;
    }
  }
  for(const [y,r] of [[-25.4,8.9],[-12.1,8.2],[4.6,7.35],[10.2,7.05]]){
    const band=solid(new THREE.TorusGeometry(r,.50,7,64),copper,[0,y,0]);
    band.rotation.x=Math.PI/2;
    const fine=solid(new THREE.TorusGeometry(r+.25,.18,6,64),brass,[0,y+.75,0]);
    fine.rotation.x=Math.PI/2;
  }
  // Deliberate arc-shaped front door, small enough to remain secondary.
  const doorway=new THREE.Group();
  doorway.rotation.y=.06;doorway.position.set(0,-21.8,8.32);
  group.add(doorway);
  solid(new THREE.BoxGeometry(4.0,8.3,.48),midnight,[0,0,0],doorway);
  solid(new THREE.SphereGeometry(2.05,12,8,0,Math.PI),midnight,[0,4.12,0],doorway);
  for(const offset of [-2.45,2.45])
    solid(new THREE.BoxGeometry(.32,8.9,.65),brass,[offset,.2,.35],doorway);
  const doorTop=solid(new THREE.TorusGeometry(2.25,.35,7,30,Math.PI),brass,[0,4.1,.35],doorway);
  doorTop.rotation.z=Math.PI;

  // 2. Lantern house / capital: three radial luminous sockets.
  const crown=new THREE.Group();crown.position.y=16;group.add(crown);
  solid(new THREE.CylinderGeometry(9.1,7.2,3.0,12),shaded,[0,-2.9,0],crown);
  const lip=solid(new THREE.TorusGeometry(9.4,.82,8,60),brass,[0,-1.1,0],crown);lip.rotation.x=Math.PI/2;
  const lantern=solid(new THREE.CylinderGeometry(7.35,7.35,11.4,12),glassDark,[0,5.5,0],crown);
  const capBand=solid(new THREE.TorusGeometry(8.2,.78,8,60),copper,[0,11.7,0],crown);capBand.rotation.x=Math.PI/2;
  for(let n=0;n<12;n++){
    const a=n*Math.PI/6;
    const rib=solid(new THREE.CylinderGeometry(.42,.42,11.2,7),brass,
      [Math.sin(a)*7.58,5.4,Math.cos(a)*7.58],crown);
  }
  // The shared lighthouse lantern is visibly filled, not transparent/hologram.
  const brightCore=solid(new THREE.IcosahedronGeometry(5.25,2),lens,[0,5.5,0],crown);
  const framePorts=[],portGlow=[];
  for(let i=0;i<3;i++){
    const theta=i*Math.PI*2/3;
    const port=new THREE.Group();port.rotation.y=theta;
    port.position.set(Math.sin(theta)*8.08,5.3,Math.cos(theta)*8.08);
    crown.add(port);framePorts.push(port);
    const back=solid(new THREE.BoxGeometry(4.6,8.4,1.0),midnight,[0,0,-.6],port);
    const pane=solid(new THREE.BoxGeometry(3.65,7.15,.82),i===1?champagne:cyan,[0,0,.06],port);
    for(const [x,y,w,h] of [
      [-2.25,0,.66,9.4],[2.25,0,.66,9.4],[0,4.4,4.9,.65],[0,-4.4,4.9,.65]
    ])solid(new THREE.BoxGeometry(w,h,1.15),brass,[x,y,.62],port);
    const sigil=solid(new THREE.OctahedronGeometry(1.32,0),amethyst,[0,0,1.05],port);
    sigil.scale.set(.66,1.65,.3);
    portGlow.push(pane);
  }
  // 3. Beacon roof. Distinctive lighthouse top, but no giant propellers.
  const roof=solid(new THREE.ConeGeometry(10.1,6.7,12),stone,[0,16.9,0],crown);roof.rotation.y=Math.PI/12;
  const roofEdge=solid(new THREE.TorusGeometry(9.95,.52,8,60),brass,[0,13.65,0],crown);
  roofEdge.rotation.x=Math.PI/2;
  solid(new THREE.CylinderGeometry(1.4,2.1,5,12),copper,[0,22.3,0],crown);
  const tip=solid(new THREE.IcosahedronGeometry(2.4,1),amethyst,[0,25.2,0],crown);
  // Quality grade is conveyed as EXTRA surface work and modest color accents.
  const secondTier=new THREE.Group();group.add(secondTier);
  for(let i=0;i<12;i++){
    const a=i*Math.PI/6;
    const medallion=solid(new THREE.OctahedronGeometry(1.9,0),amberGrade,
      [8.1*Math.sin(a),-13.1,8.1*Math.cos(a)],secondTier);
    medallion.scale.set(.7,1.5,.4);medallion.rotation.y=a;
  }
  const thirdTier=new THREE.Group();group.add(thirdTier);
  for(let i=0;i<12;i++){
    const a=i*Math.PI/6;
    const gem=solid(new THREE.OctahedronGeometry(1.8,0),amethyst,
      [7.6*Math.sin(a),3.2,7.6*Math.cos(a)],thirdTier);
    gem.scale.set(.74,1.7,.49);gem.rotation.y=a;
  }
  const facetTop=solid(new THREE.TorusGeometry(5.2,.58,8,48),amethyst,[0,14.4,0],crown);
  facetTop.rotation.x=Math.PI/2;

  // Few soft sparkles; not a cloud of objects or misleading sky lighting.
  const sparks=new THREE.Group();group.add(sparks);
  const sparkItems=[];
  const sparkMat=new THREE.MeshBasicMaterial({color:0xffd99a,transparent:true,opacity:.77,depthWrite:false});
  for(let i=0;i<12;i++){
    const a=i*2.399963229728653,rad=11+(i%3)*2.7;
    const mesh=solid(new THREE.OctahedronGeometry(.68,0),sparkMat,
      [rad*Math.sin(a),-18+(i*9)%50,rad*Math.cos(a)],sparks);
    sparkItems.push({mesh,y:mesh.position.y,seed:i*1.17});
  }
  // Put key/fill lights on object scene, no environment-geometry additions.
  const ambient=new THREE.HemisphereLight(0xc2f7ef,0x111a35,2.15);
  const key=new THREE.DirectionalLight(0xffe8bf,2.8);key.position.set(40,90,60);
  const fill=new THREE.DirectionalLight(0x9b8ae3,1.25);fill.position.set(-60,40,-45);
  group.add(ambient,key,fill);
  let grade=3;
  function setGrade(level){
    if(![1,2,3].includes(level))return false;
    grade=level;
    secondTier.visible=grade>=2;
    thirdTier.visible=grade>=3;
    facetTop.visible=grade>=3;
    tip.material=grade>=3?amethyst:(grade===2?champagne:patina);
    for(let i=0;i<portGlow.length;i++)
      portGlow[i].material=grade>=3?(i===1?amethyst:cyan):(grade===2?champagne:cyan);
    return true;
  }
  let quality='medium';
  function setQuality(level){
    if(!['low','medium','high'].includes(level))return false;
    quality=level;
    sparks.visible=quality!=='low';
    for(let i=0;i<sparkItems.length;i++)sparkItems[i].mesh.visible=quality==='high'||i<4;
    return true;
  }
  setGrade(grade);setQuality(quality);
  return {
    group,setGrade,getGrade:()=>grade,setQuality,
    animate(t){
      const pulse=.94+0.045*Math.sin(t*1.2);
      brightCore.scale.setScalar(pulse);
      tip.position.y=25.2+Math.sin(t*.62)*.36;
      for(let i=0;i<laneDots.length;i++){
        const l=laneDots[i];
        l.pulse.position.copy(l.curve.getPoint((t*.105+l.offset)%1));
      }
      for(let i=0;i<portGlow.length;i++){
        portGlow[i].material.emissiveIntensity=.35+.36*(.5+.5*Math.sin(t*1.30-i*2.05));
      }
      for(const p of sparkItems)p.mesh.position.y=p.y+.6*Math.sin(t*.9+p.seed);
    }
  };
}
