/* MAJAKKA v0.9 — online-only PWA. Never serve an offline application shell.
   Old Majakka caches are removed during activation. */
const CACHE='majakka-online-only-v0.9';
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const keys=await caches.keys();
 await Promise.all(keys.filter(key=>key.startsWith('majakka-')).map(key=>caches.delete(key)));
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 // Network-only. Offline sessions are neither emulated nor permitted.
 event.respondWith(fetch(request,{cache:'no-store'}));
});
