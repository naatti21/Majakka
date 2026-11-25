// Package the existing S1 game for a static HTTPS host, not a new gameplay branch.
// Run after npm ci --prefix world --ignore-scripts, from repository root.
import {cp,mkdir,readFile,writeFile,rm} from 'node:fs/promises';
import {resolve,relative,dirname} from 'node:path';
const root=resolve(import.meta.dirname,'../..');
const out=resolve(root,'.preview-build');
if(relative(root,out)!=='.preview-build')throw Error('Unexpected build directory');
await rm(out,{recursive:true,force:true});
const files=['world/index.html','world/world.css','world/app.mjs','world/map.mjs','world/beacons.mjs','world/catalog.mjs','world/flat.mjs','world/player.mjs','world/data','walk-energy.js','game-rules/wallet.mjs','game-rules/geo.mjs','game-rules/balance-config.json','experiments/node-family-v01/beacon-model.js','experiments/node-family-v01/beacon-materials.js','assets/mark.svg'];
async function copy(from,to=from){
 await mkdir(dirname(resolve(out,to)),{recursive:true});
 await cp(resolve(root,from),resolve(out,to),{recursive:true});
}
for(const f of files)await copy(f);
for(const pkg of ['maplibre-gl','three','@fontsource/inter']){
 const dir='world/node_modules/'+pkg;
 const target='world/vendor/'+pkg;
 for(const f of pkg==='maplibre-gl'?['dist','LICENSE.txt']:pkg==='three'?['build','LICENSE']:['files','LICENSE']){
  try{await copy(dir+'/'+f,target+'/'+f);}catch(e){if(f==='LICENSE.txt'||f==='LICENSE'){if(e.code==='ENOENT')continue;}throw e;}
 }
}
for(const p of ['world/index.html','world/map.mjs','world/beacons.mjs']){
 const file=resolve(out,p);
 await writeFile(file,(await readFile(file,'utf8')).replaceAll('node_modules/','vendor/'));
}
await writeFile(resolve(out,'.nojekyll'),'');
await writeFile(resolve(out,'index.html'),'<!doctype html><meta name="viewport" content="width=device-width"><title>Majakka S1 preview</title><p><a href="world/">Open Majakka GPS World S1</a></p>');
console.log('Static preview built: .preview-build/world/ (requires HTTPS or localhost for GPS).');
