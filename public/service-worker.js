const FILES_TO_CACHE = [
    "/",
    "./index.html",
    "./manifest.json",
    "./css/styles.css",
    "./js/idb.js",
    "./js/index.js"
];

const APP_PREFIX = 'BudgetTracker-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

// Install cache for site
self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('installing cache : ' + CACHE_NAME);
            return cache.addAll(FILES_TO_CACHE);
        })
    );

    self.skipWaiting();
});

// Clear out old data during activation
self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(keyList => Promise.all(keyList.map(key => {
                if (key !== CACHE_NAME) {
                    console.log('deleting cache : ' + key);
                    return caches.delete(key);
                } 
            }
        )))
    );
});

// Retrieve data from the cache when page loads, if necessary
self.addEventListener('fetch', function(e) {
    console.log('fetch request : ' + e.request.url);
    e.respondWith(
        caches.match(e.request).then(function(request) {
            // If there's something in the cache that matches, use that. Else, do the fetch as usual
            if (request) {
                console.log('responding with cache : ' + e.request.url);
                return request;
            } else {
                console.log('file is not cached, fetching : ' + e.request.url);
                return fetch(e.request);
            }
            // return request || fetch(e.request);
        })
    );
});