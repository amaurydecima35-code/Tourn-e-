/* Mes tournées – service worker : marche sans réseau + mises à jour automatiques */
var V="tournees-2026.11.22-13h07";
var CORE=["./","index.html","pdf-lib.min.js","pdfjs-lib.js","pdfjs-worker.js","manifest.webmanifest","icon.png","icon-192.png","icon-512.png","icon-maskable.png"];
var EXT=/^https:\/\/(cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com|tessdata\.projectnaptha\.com)\//;
self.addEventListener("install",function(e){e.waitUntil(caches.open(V).then(function(c){return Promise.all(CORE.map(function(u){return fetch(u,{cache:"reload"}).then(function(r){if(r.ok)return c.put(u,r);}).catch(function(){});}));}).then(function(){return self.skipWaiting();}));});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==V&&k!=="tournees-ext";}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));});
function timeout(p,ms){return new Promise(function(res,rej){var t=setTimeout(function(){rej(new Error("lent"));},ms);p.then(function(r){clearTimeout(t);res(r);},function(e){clearTimeout(t);rej(e);});});}
self.addEventListener("fetch",function(e){var q=e.request;if(q.method!=="GET")return;var u=new URL(q.url);
  if(u.origin===location.origin){
    var page=q.mode==="navigate"||/\/(index\.html)?$/.test(u.pathname);
    if(page){/* la page : toujours la dernière version si le réseau répond, sinon celle en mémoire */
      e.respondWith(timeout(fetch(q,{cache:"no-store"}),4000).then(function(r){if(r&&r.ok){var cp=r.clone();caches.open(V).then(function(c){c.put("index.html",cp);});}return r;}).catch(function(){return caches.match("index.html",{ignoreSearch:true}).then(function(r){return r||caches.match("./");});}));return;}
    e.respondWith(caches.match(q,{ignoreSearch:true}).then(function(r){return r||fetch(q).then(function(n){if(n&&n.ok){var cp=n.clone();caches.open(V).then(function(c){c.put(q,cp);});}return n;});}));return;}
  if(EXT.test(q.url)){/* polices, lecture des photos (OCR) : gardées pour marcher sans réseau */
    e.respondWith(caches.open("tournees-ext").then(function(c){return c.match(q).then(function(r){var f=fetch(q).then(function(n){if(n&&(n.ok||n.type==="opaque"))c.put(q,n.clone());return n;}).catch(function(){return r;});return r||f;});}));}
});
