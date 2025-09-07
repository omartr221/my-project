// Service Worker for background notifications
// V POWER TUNING Notification Service Worker

const CACHE_NAME = 'vpower-notifications-v1';

// Install Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(() => {
      console.log('✅ Service Worker: Cache opened');
      // Skip waiting to activate immediately
      return self.skipWaiting();
    })
  );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Activated');
  event.waitUntil(self.clients.claim());
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('🔔 Service Worker: Push notification received');
  
  let notificationData = {
    title: 'إشعار نظام V POWER TUNING',
    body: 'لديك إشعار جديد',
    icon: '/vite.svg',
    badge: '/vite.svg',
    tag: 'vpower-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'فتح النظام'
      },
      {
        action: 'dismiss',
        title: 'إغلاق'
      }
    ],
    data: {
      url: '/'
    }
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        ...data
      };
    } catch (error) {
      console.error('Error parsing push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Service Worker: Notification clicked');
  
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    const urlToOpen = event.notification.data?.url || '/';
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Check if any client is already open
          for (let client of clientList) {
            if (client.url.includes(self.location.origin)) {
              client.focus();
              return client.navigate(urlToOpen);
            }
          }
          
          // Open new window if no client is open
          return clients.openWindow(urlToOpen);
        })
    );
  }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('❌ Service Worker: Notification closed');
});

// Handle message from main app
self.addEventListener('message', (event) => {
  console.log('💬 Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const notificationData = event.data.payload;
    
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon || '/vite.svg',
      badge: notificationData.badge || '/vite.svg',
      tag: notificationData.tag || 'vpower-notification',
      requireInteraction: true,
      data: notificationData.data || {}
    });
  }
});