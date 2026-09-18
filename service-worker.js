const CACHE="kamizuki-v1.1.1-20260918";
const CORE=["./","./index.html","./manifest.webmanifest","./css/style.css","./images/ayano.png","./images/ayano.svg","./images/icon-192.png","./images/icon-512.png","./data/cards.json","./data/vocabulary.json","./data/grammar.json","./data/patterns.json","./data/reading.json","./js/shared.js","./js/dashboard.js","./js/kana.js","./js/vocabulary.js","./js/grammar.js","./js/patterns.js","./js/listening.js","./js/reading.js","./js/collection.js","./js/card-detail.js","./js/stats.js","./js/settings.js","./pages/kana.html","./pages/vocabulary.html","./pages/grammar.html","./pages/patterns.html","./pages/listening.html","./pages/reading.html","./pages/collection.html","./pages/card-detail.html","./pages/stats.html","./pages/settings.html","./pages/culture.html"];
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).catch(()=>{}));self.skipWaiting();});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET") return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin) return;
  event.respondWith((async()=>{
    try{
      const response=await fetch(event.request);
      if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}
      return response;
    }catch{
      const cached=await caches.match(event.request);
      if(cached) return cached;
      if(event.request.mode==="navigate") return (await caches.match("./index.html")) || Response.error();
      return Response.error();
    }
  })());
});
