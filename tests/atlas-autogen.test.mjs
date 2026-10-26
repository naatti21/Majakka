import {test} from "node:test";
import assert from "node:assert/strict";
import "../atlas-autogen.js";

const G=globalThis.MajakkaAtlasAutoGen;
const center={lat:61.5,lng:23.75};
const shift=(n,e=0)=>({lat:center.lat+n/111320,lng:center.lng+e/(111320*Math.cos(center.lat*Math.PI/180))});
function place(id,category,point,{walking=true,confidence=.98,access=true,overlays={},name="Atlas location"}={}){
 return {id:"overture:"+id,source:"overture",name,category,point,confidence,overlays,
  access:{publicPedestrian:access},
  walking:walking?{connectedToPublicNetwork:true,footAllowed:true,metersToEntrance:16}:undefined,
  entrance:walking?{point,publiclyApproachable:true}:undefined
 };
}
test("valid public-interest POIs become walk-up candidates only with pedestrian proof",()=>{
 const c=G.candidate(place("a","public_art",shift(210,0)));
 assert.equal(c.mode,"walkup_candidate");
 assert.equal(c.nodeType,"Prism");
 assert.equal(G.candidate(place("b","library",shift(250),{walking:false})).mode,"remote_only");
});
test("never infer walking rights from high POI confidence alone",()=>{
 const p=place("x","viewpoint",shift(300,0),{walking:true,access:false});
 assert.equal(G.candidate(p).mode,"remote_only");
 assert.equal(G.candidate({...p,access:{publicPedestrian:true,restrictionUnknown:true}}).mode,"remote_only");
});
test("closed sites, private property, schools, railway and motorway intersections are excluded",()=>{
 const original=place("danger","artwork",shift(80,0));
 for(const x of [
  {...original,permanentlyClosed:true},
  {...original,overlays:{schoolGrounds:true}},
  {...original,overlays:{privateResidential:true}},
  {...original,overlays:{railTrack:true}},
  {...original,overlays:{motorway:true}},
  {...original,overlays:{sensitive:true}},
  {...original,access:{private:true}},
  {...original,access:{foot:"private"}},
  {...original,category:"school"}
 ])assert.equal(G.candidate(x),null);
});
test("missing, low or invalid existence confidence cannot become confident walk-up by accident",()=>{
 const original=place("1","museum",shift(100,0));
 assert.equal(G.candidate({...original,confidence:0.35}),null);
 assert.equal(G.candidate({...original,confidence:NaN}),null);
 assert.equal(G.candidate({...original,confidence:null}).mode,"remote_only");
});
test("source category determines a distinct game system, not identical neon pillars",()=>{
 const types=["public_art","monument","park","trailhead","viewpoint","library","museum","nature_reserve"];
 assert.equal(new Set(types.map((t,i)=>G.candidate(place("n"+i,t,shift(i*120,0))).nodeType)).size,6);
});
test("no fixed coordinates are returned for remote nodes or virtual Echoes",()=>{
 const out=G.choose({zoneId:"z14:22:33",center,pois:[place("r","museum",shift(150),{walking:false})]});
 assert.equal(out.remote.length,1);
 assert.equal(out.remote[0].location,null);
 assert.equal(out.remote[0].rawPoint,undefined);
 assert.equal(out.remote[0].walkupPoint,undefined);
 assert.ok(out.echoes.length>=10);
 assert.ok(out.echoes.every(e=>e.coordinate===null&&e.mode==="remote_only"));
});
test("stable global IDs: input record order does not change generated network",()=>{
 const types=["public_art","monument","park","trailhead","viewpoint","library","museum","nature_reserve"];
 const arr=Array.from({length:34},(_,i)=>place("site"+i,types[i%types.length],shift(i*24-400,i%3*70),{walking:i%4!==0}));
 const one=G.choose({zoneId:"z14:55:88",center,pois:arr});
 const two=G.choose({zoneId:"z14:55:88",center,pois:[...arr].reverse()});
 assert.deepEqual(one,two);
 assert.ok(one.stats.walkupCandidates>2);
 assert.ok(one.stats.virtualEchoes>=6);
});
test("a dense cluster does not stack markers over one another",()=>{
 const arr=[0,10,20,30,55,170,380].map((m,i)=>place(i,"public_art",shift(m,0)));
 const result=G.choose({zoneId:"A",center,pois:arr,options:{maximumCategoryFraction:1}});
 const all=result.physical;
 for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++)
  assert.ok(G.meters(all[i].location,all[j].location)>=G.POLICY.minimumSpacingMeters);
});
test("duplicate source IDs and nearby same-name features do not flood coverage",()=>{
 const orig=place("same","public_art",shift(100,50));
 const dup={...orig,id:"overture:diff",point:shift(108,53)};
 const r=G.choose({zoneId:"A",center,pois:[dup,orig,orig],options:{maximumCategoryFraction:1}});
 assert.equal(r.stats.eligible,1);
});
test("low density generates remote-only Echoes, no fake physical targets",()=>{
 const result=G.choose({zoneId:"z14:11:32",center,pois:[]});
 assert.equal(result.physical.length,0);
 assert.equal(result.echoes.length,G.POLICY.targetTotal);
 assert.ok(result.echoes.every(e=>!e.coordinate));
 assert.deepEqual(result,G.choose({zoneId:"z14:11:32",center,pois:[]}));
});
test("places outside 1km radius, and invalid points, are not loaded",()=>{
 const list=[
  place("close","monument",shift(220,20)),
  place("far","park",shift(1600,0)),
  place("bad","museum",{lat:300,lng:200})
 ];
 const out=G.choose({zoneId:"A",center,pois:list});
 assert.equal(out.stats.eligible,1);
 assert.equal(out.physical.length,1);
});
test("input area and result count have bounded validation",()=>{
 assert.throws(()=>G.choose({zoneId:"",center,pois:[]}));
 assert.throws(()=>G.choose({zoneId:"A",center:{lat:NaN,lng:1},pois:[]}));
 assert.throws(()=>G.choose({zoneId:"A",center,pois:[],options:{radiusMeters:999999}}));
 assert.throws(()=>G.choose({zoneId:"A",center,pois:[],options:{maximumPhysical:2000}}));
});
