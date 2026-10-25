/* Majakka v0.3.5: network-first app shell, cache only our own files, never third-party map tiles. */
const CACHE='majakka-first-light-v0.3.6';
const OWN=['./','./index.html','./styles.css','./map-shell.css','./map-hud-v0.3.css','./live-field.css','./nocturne.css','./raster-map.js','./core.js','./app.js','./map-shell.js','./rift-core.js','./map-hud-v0.3.js','./live-core.js','./live-field.js','./manifest.webmanifest','./assets/mark.svg','./assets/icon-192.png','./assets/icon-512.png'];
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('majakka-')&&k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()])));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 const isAppShell=request.mode==='navigate'||/\.(?:js|css|html|webmanifest)$/.test(url.pathname);
 if(!isAppShell)return;
 event.respondWith((async()=>{
  try{
   const network=await fetch(request);
   if(network.ok){const copy=network.clone();caches.open(CACHE).then(cache=>cache.put(request,copy)).catch(()=>{});}
   return network;
  }catch(error){
   const cached=await caches.match(request);
   if(cached)return cached;
   throw error;
  }
 })());
});
