const CACHE="nes-logbook-v2";
const ASSETS=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png","icon-180.png","favicon-32.png"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>Promise.all(ASSETS.map(u=>c.add(u).catch(()=>null)))));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  const req=e.request; if(req.method!=="GET")return;
  const url=new URL(req.url); if(url.origin!==location.origin)return; // let fonts/CDN go straight to network
  if(req.mode==="navigate"){ // network-first for the page, so updates arrive
    e.respondWith(fetch(req).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put("index.html",cp));return r;}).catch(()=>caches.match("index.html").then(r=>r||caches.match("./"))));
    return;
  }
  e.respondWith(caches.match(req).then(r=>r||fetch(req).then(res=>{try{const cp=res.clone();caches.open(CACHE).then(c=>c.put(req,cp));}catch(_){}return res;}).catch(()=>r)));
});
