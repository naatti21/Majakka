// Start a static server at repository root. All GPS readings below are simulated.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const base=process.env.WORLD_URL??'http://127.0.0.1:4187/world/';
const output=process.env.EVIDENCE??'docs/evidence/gps-s1';
await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 for(const [width,height] of [[390,844],[412,915]]){
  const ctx=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:true});
  const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  // Reproducible provider outage. The local basemap must still use real MapLibre/WebGL.
  await p.route('https://tiles.openfreemap.org/**',r=>r.abort());
  const started=performance.now();
  await p.goto(base);
  const pin=p.locator('.pin').filter({hasText:'Vanhankirkonpuisto'});
  await pin.waitFor({timeout:15000}).catch(async e=>{throw Error(e.message+' '+JSON.stringify(errors)+' '+await p.locator('body').innerText());});
  console.log(width+' px: first selectable mapped node in '+Math.round(performance.now()-started)+' ms (desktop Chromium).');
  assert(await p.locator('.maplibregl-canvas').evaluate(c=>!!c.getContext('webgl2')));
  await p.waitForTimeout(500);
  assert.equal(await p.locator('#balance').textContent(),'8');
  await pin.click();await p.locator('#evidence').selectOption('walkup');await p.locator('#study').click();await p.waitForFunction(()=>document.querySelector('#study').disabled);
  if(width===390){
   const session=await ctx.newCDPSession(p);
   await session.send('Browser.setPermission',{permission:{name:'geolocation'},setting:'denied',origin:new URL(base).origin,browserContextId:(await session.send('Target.getTargetInfo')).targetInfo.browserContextId});
   await p.locator('#gps').click();await p.waitForFunction(()=>document.querySelector('#fix').textContent.includes('denied'));
   assert(await p.locator('#visit').isDisabled());
   await ctx.grantPermissions(['geolocation'],{origin:new URL(base).origin});
   await p.waitForFunction(async()=>(await navigator.permissions.query({name:'geolocation'})).state==='granted');
   await ctx.setGeolocation({latitude:61.498723,longitude:23.760697,accuracy:80});
   await p.locator('#gps').click();
   await p.waitForFunction(()=>document.querySelector('#fix').textContent.includes('accurate')).catch(async e=>{throw Error(e.message+' '+await p.locator('#fix').innerText());});
   await ctx.setGeolocation({latitude:61.498723,longitude:23.760697,accuracy:4});
   await p.waitForSelector('.avatar');await p.locator('#visit').click();
   await p.locator('#close').click();
   await p.locator('#region').selectOption('nokia');await p.waitForSelector('#places button');
   await p.getByRole('button',{name:'Ossi Somman veistospuisto'}).click();
   assert(await p.locator('#visit').isHidden());assert.equal(await p.locator('#balance').textContent(),'8');
   await p.locator('#locate').click();await pin.waitFor();
   await p.locator('#gps').click();assert.equal(await p.locator('.avatar').count(),0);
   await p.locator('#channel').click();await p.waitForFunction(()=>document.querySelector('#balance').textContent==='12');
   await p.reload();await pin.waitFor();assert.equal(await p.locator('#balance').textContent(),'12');
   assert.match(await p.locator('#journal').textContent(),/1 field notes · 1 nearby surveys/);
  }
  await pin.click();await p.evaluate(()=>window.scrollTo(0,0));
  await p.waitForSelector('#map[data-ready="true"]');
  await p.screenshot({path:output+'/atlas-'+width+'.png',fullPage:true});
  if(width===412){
   await p.route('**/data/ruovesi-*.json',r=>r.fulfill({status:503,body:''}));
   await p.locator('#region').selectOption('ruovesi');
   await p.waitForFunction(()=>document.querySelector('#catalog').textContent.includes('unavailable'));
   assert.equal(await p.locator('.pin').count(),0);
   await p.locator('#channel').click();await p.waitForFunction(()=>document.querySelector('#balance').textContent==='12');
  }
  assert.deepEqual(errors,[]);await ctx.close();
  console.log(width+'×'+height+' WebGL, real catalog, field notes and viewport checks passed.');
 }
 // Time-controlled OS adapter in this test context only. Live game has no GPS override.
 const movement=await browser.newPage();
 await movement.clock.install({time:new Date('2026-11-24T12:00:00Z')});
 await movement.addInitScript(()=>{
  Object.defineProperty(navigator,'geolocation',{value:{
   watchPosition(fn){window.deliverFix=fn;return 1;},clearWatch(){window.deliverFix=null;}
  }});
 });
 await movement.route('https://tiles.openfreemap.org/**',r=>r.abort());
 await movement.goto(base);await movement.locator('.pin').waitFor();await movement.locator('#gps').click();
 for(let i=0;i<=5;i++){
  await movement.clock.fastForward(15000);
  await movement.evaluate(i=>window.deliverFix({timestamp:Date.now(),coords:{
   latitude:61.498723+i*18/111200,longitude:23.760697,accuracy:4,speed:1.2}}),i);
 }
 await movement.waitForFunction(()=>document.getElementById('balance').textContent==='9');
 await movement.reload();await movement.waitForFunction(()=>document.getElementById('balance').textContent==='9');
 assert.equal(await movement.locator('.avatar').count(),0);
 await movement.close();
 console.log('Simulated 90 m walk: one Lumen persisted, no restored position.');
 const page=await browser.newPage();await page.addInitScript(()=>{
  const get=HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext=function(t,...args){return t.startsWith('webgl')?null:get.call(this,t,...args);};
 });
 await page.goto(base);await page.waitForSelector('canvas.flat');
 await page.locator('#places button').first().click();assert(await page.locator('#detail').isVisible());
 console.log('WebGL unavailable: selectable 2D atlas passed.');
 const denied=await browser.newPage();
 await denied.addInitScript(()=>{Object.defineProperty(window,'indexedDB',{get(){throw Error('Storage denied');}});});
 await denied.goto(base);await denied.locator('.pin').waitFor();await denied.locator('.pin').click();
 assert(await denied.locator('#study').isDisabled());
 assert.match(await denied.locator('#response').textContent(),/Journal unavailable/);
 console.log('Denied storage: atlas usable, writes disabled.');
}finally{await browser.close();}
