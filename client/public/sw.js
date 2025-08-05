// Service Worker بسيط
const CACHE_NAME = 'v-power-tuning-v1';

self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // لا نقوم بتخزين أي شيء مؤقتاً، نترك الطلبات تمر
  event.respondWith(fetch(event.request));
});