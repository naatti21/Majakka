/* Cache only owned app shell; never prefetch third-party map tiles. */
const CACHE='majakka-first-light-v0.3.3';
const FILES=['./','./index.html','./styles.css','./map-shell.css','./map-hud-v0.3.css','./core.js','./app.js','./map-shell.js','./rift-core.js','./map-hud-v0.3.js','./live-core.js','./live-field.js','./live-field.css','./manifest.webmanifest','./assets/mark.svg','./assets/icon-192.png','./assets/icon-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('majakka-')&&k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()])));
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(url.origin!==self.location.origin||event.request.method!=='GET')return;event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(event.request,copy)).catch(()=>{});}return response;})));});
