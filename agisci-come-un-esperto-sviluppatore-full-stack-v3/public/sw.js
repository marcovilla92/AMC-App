// Service Worker per notifiche push AMC App
const CACHE_NAME = 'amc-app-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received', event);

  let data = {
    title: 'Nuovo Messaggio',
    body: 'Hai ricevuto un nuovo messaggio',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: 'message-notification',
    requireInteraction: false,
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/badge-72.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'notification',
    requireInteraction: data.requireInteraction || false,
    data: data.data || {},
    actions: [
      {
        action: 'open',
        title: 'Apri',
        icon: '/icon-open.png',
      },
      {
        action: 'close',
        title: 'Chiudi',
        icon: '/icon-close.png',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event);

  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Se c'è già una finestra aperta, focusla
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        // Altrimenti apri una nuova finestra
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// Message event (per comunicazione con l'app)
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);

  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, icon, tag, data } = event.data.payload;

    self.registration.showNotification(title, {
      body,
      icon: icon || '/icon-192.png',
      badge: '/badge-72.png',
      vibrate: [200, 100, 200],
      tag: tag || 'notification',
      data: data || {},
    });
  }
});
