self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(self.registration.showNotification(data.title || 'Hotel Himalaya INN', {
    body: data.body || 'You have a new admin alert.',
    icon: '/favicon.ico',
    data: { link: data.link || '/hh-cp-9f3m2q' },
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.link));
});
