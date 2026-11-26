var V='lrchk-app-v29',RT='lrchk-libs-v2';
var SHELL=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
var LIBS=['https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js','https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'];
self.addEventListener('install',function(e){
  e.waitUntil(Promise.all([
    caches.open(V).then(function(c){return Promise.all(SHELL.map(function(u){return fetch(new Request(u,{cache:'reload'})).then(function(res){if(res.ok)return c.put(u,res)})}))}),
    caches.open(RT).then(function(c){return Promise.all(LIBS.map(function(u){return c.add(new Request(u,{mode:'no-cors'})).catch(function(){})}))})
  ]).then(function(){return self.skipWaiting()}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==V&&k!==RT}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}));
});
self.addEventListener('fetch',function(e){
  var r=e.request;if(r.method!=='GET')return;
  var u=new URL(r.url),same=u.origin===self.location.origin;
  if(same){
    e.respondWith(fetch(r,{cache:'no-cache'}).then(function(res){if(res&&res.ok){var cp=res.clone();caches.open(V).then(function(c){c.put(r,cp)})}return res}).catch(function(){return caches.match(r,{ignoreSearch:true}).then(function(hit){return hit||(r.mode==='navigate'?caches.match('index.html'):undefined)})}));
    return;
  }
  if(/cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com/.test(u.hostname)){
    e.respondWith(caches.open(RT).then(function(c){return c.match(r).then(function(hit){
      var net=fetch(r).then(function(res){if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res}).catch(function(){return hit});
      return hit||net;
    })}));
  }
});
