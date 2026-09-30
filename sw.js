/* Кэш для работы без сети. Страницы берутся из сети, если она есть
   (так обновления приходят сразу), иначе из кэша. */
const VERSION = "hub-20260930165635";
const SHELL = [
  "./", "index.html", "blog.html", "budget.html", "sport.html", "work.html", "personal.html",
  "randomizer.html", "osen.html", "data.html", "portal.js", "firebase-config.js", "manifest.webmanifest",
  "fonts/Vasek.ttf", "img/rem-face.jpg", "img/rem-sun.jpg", "icons/icon-192.png", "icons/icon-512.png"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const own = url.origin === location.origin;
  const lib = url.hostname === "www.gstatic.com" || url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (!own && !lib) return; // база и вход Firebase идут напрямую
  if (own && (req.mode === "navigate" || url.pathname.endsWith(".html") || url.pathname.endsWith("/"))) {
    // страницы: сначала сеть, без сети — кэш
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return r; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match("index.html"))));
    return;
  }
  // шрифты, картинки, библиотеки: сначала кэш, в фоне обновляем
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(r => { if (r.ok || r.type === "opaque") { const copy = r.clone(); caches.open(VERSION).then(c => c.put(req, copy)); } return r; }).catch(() => hit);
    return hit || net;
  }));
});
