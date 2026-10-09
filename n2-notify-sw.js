/* Japan Study: foreground reminder notifications on mobile Chrome.
 * This worker does NOT run scheduled jobs or remote push while app is closed.
 */
self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(self.clients.claim()); });
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({type:'window', includeUncontrolled:true});
    for(const tab of windows){
      if(tab.url.startsWith(self.registration.scope) && 'focus' in tab){
        return tab.focus();
      }
    }
    if(self.clients.openWindow) return self.clients.openWindow(self.registration.scope);
  })());
});
