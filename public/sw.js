// Service Worker for Hotel Himalaya INN - Web Push Notifications
// Version: 1.0.0

const ADMIN_DASHBOARD_URL = '/hh-cp-9f3m2q';
const CACHE_NAME = 'hotel-himalaya-sw-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker installed');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Push event — fires when a push notification is received
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received');

  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = {
      title: 'Hotel Himalaya INN',
      body: event.data ? event.data.text() : 'New notification',
    };
  }

  const title = data.title || '🔔 Hotel Himalaya INN';
  const options = {
    body: data.body || data.message || 'You have a new notification',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: data.bookingId || 'hotel-notification',
    data: {
      url: data.link || ADMIN_DASHBOARD_URL,
      bookingId: data.bookingId,
    },
    requireInteraction: true,
    actions: [
      { action: 'view', title: 'View Dashboard' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || ADMIN_DASHBOARD_URL;

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If dashboard already open, focus it
        for (const client of clientList) {
          if (client.url.includes('hh-cp-9f3m2q') && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open the admin dashboard
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed by user');
});
