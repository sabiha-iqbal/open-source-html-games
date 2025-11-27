// sw.js

// Define the name of your cache. Update this version number when you make changes to the assets to force a refresh.
const CACHE_NAME = 'hyper-hunt-v1';

// List all the assets you want to cache. This is a complete list based on your file structure and levels.
const urlsToCache = [
  './',
  './index.html',
  './play.html',
  './manifest.json',
  './favicon.ico',
  './config/gameConfig.js',
  './config/levelConfig.js',
  // assets folder
  './assets/main.css',
  './assets/play.css',
  './assets/main.js',
  './assets/play.js',

  './assets/all.min.css',
  './assets/bootstrap.min.css',
  './assets/bootstrap.min.js',
  './assets/fonts',
  './assets/popper.min.js',

  './assets/icons/icon-192x192.png',
  './assets/icons/icon-512x512.png',
  './assets/icons/maskable-icon-192x192.png',
  './assets/icons/icon.png',
  './assets/icons/clock.png',
  './assets/icons/heart.png',
  './assets/icons/lock.png',
  './assets/icons/star-filled.png',
  './assets/icons/star-empty.png',
  './assets/icons/play.png',
  './assets/icons/pause.png',
  // sounds 
  './sounds/background.mp3',
  './sounds/click.mp3',
  './sounds/taunt.mp3',
  './sounds/pop.mp3',

];
const levelImagesToCache = [
  // Images for Level 1
  './images/loading-screen.png',
  './images/loading-screen-mobile.png',
  './images/home-mobile.png',
  './images/home.png',
  './images/leaf.png',
  './images/level-node-bg.png',
  // Images for Level 1
  './images/bg_1.png',
  './images/mobile_1.png',
  './images/body_1.png',
  './images/rabbit_head.png',
  './images/full_1.png',
  './images/head_1.png',
  // Images for Level 2
  './images/bg_2.png',
  './images/mobile_2.png',
  './images/body_2.png',
  './images/full_2.png',
  './images/head_2.png',
  // Images for Level 3
  './images/bg_3.png',
  './images/mobile_3.png',
  './images/body_3.png',
  './images/full_3.png',
  './images/head_3.png',
  // Images for Level 4
  './images/bg_4.png',
  './images/mobile_4.png',
  './images/body_4.png',
  './images/full_4.png',
  './images/head_4.png',
  // Images for Level 5
  './images/bg_5.png',
  './images/mobile_5.png',
  './images/body_5.png',
  './images/full_5.png',
  './images/head_5.png',
  // Images for Level 6
  './images/bg_6.png',
  './images/mobile_6.png',
  './images/body_6.png',
  './images/full_6.png',
  './images/head_6.png',
  // Images for Level 7
  './images/bg_7.png',
  './images/mobile_7.png',
  './images/body_7.png',
  './images/full_7.png',
  './images/head_7.png',
  // Images for Level 8
  './images/bg_8.png',
  './images/mobile_8.png',
  './images/body_8.png',
  './images/full_8.png',
  './images/head_8.png',
  // Images for Level 9
  './images/bg_9.png',
  './images/mobile_9.png',
  './images/body_9.png',
  './images/full_9.png',
  './images/head_9.png',
  // Images for Level 10
  './images/bg_10.png',
  './images/mobile_10.png',
  './images/body_10.png',
  './images/full_10.png',
  './images/head_10.png',
  // Images for Level 11
  './images/bg_11.png',
  './images/mobile_11.png',
  './images/body_11.png',
  './images/full_11.png',
  './images/head_11.png',
  // Images for Level 12
  './images/bg_12.png',
  './images/mobile_12.png',
  './images/body_12.png',
  './images/full_12.png',
  './images/head_12.png'
];

const allUrlsToCache = urlsToCache.concat(levelImagesToCache);

// Install event: Caches all static assets. This version logs which URL fails but proceeds.
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching all assets');
      // Use Promise.all with individual cache.add to debug which URL fails and not stop the whole process
      const cachePromises = allUrlsToCache.map(url => {
        return cache.add(url).catch(err => {
          console.error(`[Service Worker] Failed to cache: ${url}`, err);
          // Return a resolved promise so the other files can still be cached
          return Promise.resolve();
        });
      });
      return Promise.all(cachePromises);
    }).catch(err => {
      console.error('[Service Worker] Pre-caching operation failed completely:', err);
    })
  );
});

// Activate event: Cleans up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating and cleaning up old caches...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // This line takes control of all clients immediately
  event.waitUntil(clients.claim());
});

// Fetch event: Intercepts network requests and serves from cache
self.addEventListener('fetch', (event) => {
  // We only want to handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Handle requests for play.html with or without query parameters
  const url = new URL(event.request.url);
  const isPlayHtmlRequest = url.pathname.endsWith('/play.html');
  const normalizedRequest = isPlayHtmlRequest
    ? new Request(new URL(url.pathname, url.origin))
    : event.request;

  event.respondWith(
    caches.match(normalizedRequest, { ignoreSearch: true }).then((cachedResponse) => {
      // Return cached response if found
      if (cachedResponse) {
        console.log('[Service Worker] Serving from cache:', normalizedRequest.url);
        return cachedResponse;
      }

      // No match in cache, try the network
      console.log('[Service Worker] No match in cache, fetching from network:', event.request.url);
      return fetch(event.request);
    }).catch((error) => {
      // If both cache and network fail (i.e. offline), return a fallback
      console.error('[Service Worker] Fetching failed:', error);
      // You could add an offline page fallback here if you wanted
      return new Response('You are offline and this resource is not cached.', {
        status: 503,
        statusText: 'Service Unavailable',
      });
    })
  );
});