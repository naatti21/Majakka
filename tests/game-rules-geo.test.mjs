import test from 'node:test';
import assert from 'node:assert/strict';
import { distanceKm, e, EARTH_RADIUS_KM } from '../game-rules/geo.mjs';
const near = (a,b,t=1e-10) => assert.ok(Math.abs(a-b)<=t, `${a} != ${b}`);
const p = (latitude,longitude) => ({latitude,longitude});
test('candidate E keypoints and independent far formula',()=>{
 for(const [d,v] of [[0,1],[5,1],[25,.65],[100,.3],[1000,.08]]) near(e(d),v);
 for(const d of [2307,6491]) near(e(d),.02+.06*Math.exp(-(d-1000)/1400));
});
test('E continuity and monotonicity through every boundary',()=>{
 for(const d of [5,25,100,1000]) {near(e(d-1e-7),e(d),1e-8);near(e(d+1e-7),e(d),1e-8);}
 let prev=1;
 for(let d=0;d<=40000;d+=.5){const v=e(d);assert.ok(v<=prev && v>=.02);prev=v;}
});
test('reject malformed coordinates and distances',()=>{
 for(const x of [NaN,Infinity,-Infinity,'2',null,undefined]) assert.throws(()=>e(x));
 assert.throws(()=>e(-1));
 for(const x of [null,[],{},p(91,0),p(-91,0),p(0,181),p(0,-181),p(NaN,0),p(0,Infinity),p('0',0)]) assert.throws(()=>distanceKm(x,p(0,0)));
});
test('geodesic references, dateline, poles and antipodes',()=>{
 near(distanceKm(p(0,0),p(0,90)),Math.PI*EARTH_RADIUS_KM/2,1e-8);
 near(distanceKm(p(0,179),p(0,-179)),2*Math.PI*EARTH_RADIUS_KM/180,1e-8);
 near(distanceKm(p(0,180),p(0,-180)),0,1e-8);
 near(distanceKm(p(90,0),p(90,150)),0,1e-8);
 near(distanceKm(p(-90,0),p(90,0)),Math.PI*EARTH_RADIUS_KM,1e-8);
 near(distanceKm(p(10,20),p(10,20)),0);
});
test('10,000 seeded geographic pairs: independent vector reference and symmetry',()=>{
 let seed=0x15012026;
 const rand=()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/2**32;};
 const vector=q=>{const a=q.latitude*Math.PI/180,b=q.longitude*Math.PI/180;return [Math.cos(a)*Math.cos(b),Math.cos(a)*Math.sin(b),Math.sin(a)];};
 for(let i=0;i<10000;i++){
  const a=p(rand()*180-90,rand()*360-180),b=p(rand()*180-90,rand()*360-180);
  const u=vector(a),v=vector(b),cross=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
  const reference=EARTH_RADIUS_KM*Math.atan2(Math.hypot(...cross),u.reduce((s,x,k)=>s+x*v[k],0));
  const d=distanceKm(a,b);near(d,reference,1e-6);near(d,distanceKm(b,a),1e-9);
  assert.ok(d>=0 && d<=Math.PI*EARTH_RADIUS_KM);assert.ok(e(d)>=.02 && e(d)<=1);
 }
});
