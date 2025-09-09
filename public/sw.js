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
  
  // Play sound for push notifications too
  try {
    playNotificationSound();
  } catch (error) {
    console.warn('Could not play push notification sound:', error);
  }
  
  let notificationData = {
    title: 'إشعار نظام V POWER TUNING',
    body: 'لديك إشعار جديد',
    icon: '/vite.svg',
    badge: '/vite.svg',
    tag: 'vpower-notification',
    requireInteraction: true,
    silent: false,
    vibrate: [300, 100, 300, 100, 300],
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

// Play notification sound function
const playNotificationSound = () => {
  // Create audio context for sound generation  
  const audioContext = new (AudioContext || webkitAudioContext)();
  
  // Generate attention-grabbing beep sound
  const createBeep = (frequency, duration, volume = 0.8) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  };
  
  // Play sequence of beeps for urgent notification
  const now = audioContext.currentTime;
  createBeep(1000, 0.2); // High beep
  setTimeout(() => createBeep(800, 0.2), 250); // Medium beep  
  setTimeout(() => createBeep(1200, 0.3), 500); // Higher beep
  setTimeout(() => createBeep(900, 0.2), 800); // Medium beep
  setTimeout(() => createBeep(1400, 0.4), 1100); // Final urgent beep
};

// Handle message from main app
self.addEventListener('message', (event) => {
  console.log('💬 Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const notificationData = event.data.payload;
    
    // Play sound when notification is shown
    try {
      playNotificationSound();
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
    
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon || '/vite.svg',
      badge: notificationData.badge || '/vite.svg',
      tag: notificationData.tag || 'vpower-notification',
      requireInteraction: true,
      silent: false,
      vibrate: [300, 100, 300, 100, 300],
      data: notificationData.data || {},
      actions: [
        {
          action: 'open',
          title: 'فتح النظام'
        },
        {
          action: 'dismiss',
          title: 'إغلاق'
        }
      ]
    });
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('🔄 Service Worker: Skipping waiting...');
    self.skipWaiting();
  }
});