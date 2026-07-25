self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'You have a new admin alert.',
    icon: data.icon || '/favicon.ico',
    badge: data.badge || '/favicon.ico',
    image: data.image || undefined,
    data: { link: data.link || '/' },
    actions: [
      { action: 'open', title: 'Open', icon: data.icon || '/favicon.ico' }
    ]
  };
  event.waitUntil(self.registration.showNotification(data.title || 'Hotel Himalayan', options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = (event.notification && event.notification.data && event.notification.data.link) ? event.notification.data.link : '/';
  // support action clicks in notifications
  event.waitUntil(self.clients.openWindow(link));
});
