var dataCacheName = 'weatherData-v3.9';
var cacheName = 'weatherPWA-v2.9';
var filesToCache = [
    '/',
    '/index.html',
    '/scripts/app.js',
    '/styles/inline.css',
    '/images/cloudy.png',
    '/images/cloudy-scattered-showers.png',
    '/images/cloudy_s_sunny.png',
    '/images/fog.png',
    '/images/ic_add_white_24px.svg',
    '/images/ic_refresh_white_24px.svg',
    '/images/partly-cloudy.png',
    '/images/rain.png',
    '/images/scattered-showers.png',
    '/images/sleet.png',
    '/images/snow.png',
    '/images/thunderstorm.png',
    '/images/wind.png',
    '/images/clear.png'
];
self.addEventListener('install', function (e) {
    console.log('[ServiceWorker] install', e);
    e.waitUntil(
        caches
            .open(cacheName)
            .then(function (cache) {
                console.log('[ServiceWorker] Caching app shell');
                return cache.addAll(filesToCache);
            })
            .then(function () {
                return self.skipWaiting();
            })
    );
});
self.addEventListener('activate', function (e) {
    console.log('[ServiceWorker] Activate', e);
    e.waitUntil(
        caches.keys()
            .then(function (keyList) {
                return Promise.all(keyList.map(function (key) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    if (key !== cacheName && key != dataCacheName) {
                        return caches.delete(key);
                    }
                }));
            })
            .then(function () {
                return self.clients.claim();
            })
    );
});
self.addEventListener('fetch', function (e) {
    console.log('[ServiceWorker] Fetch', e);
    var dataUrl = 'https://query.yahooapis.com/v1/public/yql';
    if (e.request.url.indexOf(dataUrl) > -1) {
        e.respondWith(
            caches.open(dataCacheName).then(function (cache) {
                return fetch(e.request).then(function (response) {
                    cache.put(e.request.url, response.clone());
                    return response;
                });
            })
        );
    } else {
        e.respondWith(
            caches.match(e.request).then(function (response) {
                return response || fetch(e.request);
            })
        );
    }
});
