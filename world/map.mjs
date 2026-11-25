const cdn=location.hostname.endsWith(".github.io")||new URLSearchParams(location.search).get("deps")==="cdn";
const lib=await import(cdn?'https://unpkg.com/maplibre-gl@6.15.0/dist/maplibre-gl.mjs':'./node_modules/maplibre-gl/dist/maplibre-gl.mjs');
import {beaconLayer} from './beacons.mjs';
const url='https://tiles.openfreemap.org/styles/dark';
const fc=features=>({type:'FeatureCollection',features});
const offline=()=>({version:8,'font-faces':{Inter:[{url:new URL(cdn?'https://unpkg.com/@fontsource/inter@5.2.8/files/inter-latin-400-normal.woff2':'./node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2',location.href).href}]},sources:{streets:{type:'geojson',data:new URL('data/tampere-streets.geojson',location.href).href,
 attribution:'© OpenStreetMap contributors · Tampere extract'}},layers:[
 {id:'land',type:'background',paint:{'background-color':'#111e26'}},
 ...[['park','#203e37'],['water','#193846'],['building','#29383e']].map(([id,color])=>({id,type:'fill',source:'streets',filter:['==','kind',id],paint:{'fill-color':color}})),
 {id:'streets',type:'line',source:'streets',filter:['==','kind','street'],paint:{'line-color':'#506269','line-width':['interpolate',['linear'],['zoom'],12,.45,17,2.2]}},
 {id:'street-labels',type:'symbol',source:'streets',filter:['has','name'],minzoom:14,layout:{'symbol-placement':'line','text-field':['get','name'],'text-font':['Inter'],'text-size':11,'symbol-spacing':180},paint:{'text-color':'#bac8c8','text-halo-color':'#17292f','text-halo-width':1.5}}
]});
export function createMap(host,onMove,onPick,status){
 const map=new lib.Map({container:host,style:offline(),center:[23.761,61.499],zoom:15.7,pitch:42,maxPitch:65,canvasContextAttributes:{antialias:true}});
 let nodes=[],layer,marker,fix=null,online=false,usingLocal=true,disposed=false;
 const pins=new Map();
 function sync(){
  if(!map.getSource('nodes')||disposed)return;
  const visible=nodes.filter(n=>n.location&&map.getBounds().contains([n.location.lng,n.location.lat]));
  const near=map.getZoom()>=15?visible.slice(0,8):[];
  map.getSource('nodes').setData(fc(visible.map(n=>({type:'Feature',properties:{id:n.id},geometry:{type:'Point',coordinates:[n.location.lng,n.location.lat]}}))));
  layer?.update(near);
  for(const [id,m] of pins)if(!near.some(n=>n.id===id)){m.remove();pins.delete(id);}
  for(const n of near)if(!pins.has(n.id)){
   const b=document.createElement('button');b.className='pin';b.textContent=n.name;b.onclick=()=>onPick(n.id);
   pins.set(n.id,new lib.Marker({element:b,anchor:'top',offset:[0,5]}).setLngLat([n.location.lng,n.location.lat]).addTo(map));
  }
 }
 function setup(){
  if(map.getSource('nodes'))return;
  map.addSource('nodes',{type:'geojson',data:fc([]),cluster:true,clusterRadius:36,clusterMaxZoom:14});
  map.addLayer({id:'signals',type:'circle',source:'nodes',paint:{'circle-radius':['case',['has','point_count'],13,8],'circle-color':'#efc479','circle-stroke-color':'#153333','circle-stroke-width':3}});
  try{layer=beaconLayer(lib);map.addLayer(layer);}catch{layer=null;status('2D map · model rendering unavailable');}
  sync();moved();
 }
 function moved(){const b=map.getBounds();onMove([b.getWest(),b.getSouth(),b.getEast(),b.getNorth()]);sync();}
 map.on('style.load',setup);
 map.on('idle',()=>{host.dataset.ready='true';});
 map.on('moveend',moved);
 map.on('click','signals',e=>{
  const f=e.features[0];if(f.properties.cluster)map.easeTo({center:f.geometry.coordinates,zoom:map.getZoom()+2});
  else onPick(f.properties.id);
 });
 function local(){
  if(disposed)return;
  status('Local street map · central Tampere only');
  if(!usingLocal){usingLocal=true;online=false;map.setStyle(offline(),{diff:false});}
 }
 map.on('error',e=>{if(online&&(!e.sourceId||!['nodes','streets'].includes(e.sourceId)))local();});
 map.once('load',async()=>{
  try{
   const r=await fetch(url,{signal:AbortSignal.timeout(6500)});if(!r.ok)throw Error();
   const style=await r.json();if(disposed)return;
   // Resolve style links against the original provider, including tile templates.
   const absolute=s=>new URL(s,url).href.replaceAll('%7B','{').replaceAll('%7D','}');
   for(const s of Object.values(style.sources)){if(s.url)s.url=absolute(s.url);if(s.tiles)s.tiles=s.tiles.map(absolute);}
   if(typeof style.sprite==='string')style.sprite=absolute(style.sprite);
   if(style.glyphs)style.glyphs=absolute(style.glyphs);
   online=true;usingLocal=false;map.setStyle(style,{diff:false});status('OpenFreeMap · vector map');
  }catch{local();}
 });
 const api={setNodes(list){nodes=list;sync();},center(x,y){map.jumpTo({center:[x,y],zoom:15.7});},
  gps(p){
   fix=p;
   if(!fix){marker?.remove();marker=null;return;}
   if(!marker){const el=document.createElement('div');el.className='avatar';el.setAttribute('aria-label','Your GPS position');marker=new lib.Marker({element:el});}
   marker.setLngLat([fix.lng,fix.lat]).addTo(map);
  },dispose(){disposed=true;for(const m of pins.values())m.remove();marker?.remove();map.remove();}};
 return api;
}
