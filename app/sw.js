// Controller on the iPhone: shows the reminders the PC pushes (hub/push.py) and opens the app on that video when
// one is tapped. Nothing is cached here: the app always loads fresh from GitHub Pages.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Controller', {
    body: d.body || '', tag: d.tag || undefined, data: { video: d.video || null }, icon: 'icon-192.png',
  }));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const video = e.notification.data && e.notification.data.video;
  const url = new URL(video ? `./?video=${encodeURIComponent(video)}` : './', self.registration.scope).href;
  e.waitUntil((async () => {
    const open = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const w of open) {
      if ('focus' in w) {
        await w.focus();
        if (video) w.postMessage({ video });
        return;
      }
    }
    await self.clients.openWindow(url);
  })());
});
