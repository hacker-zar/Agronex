self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
  if (event.data?.type !== "NEXUDRIVE_NOTIFICATION") return;
  const notification = event.data.notification || {};
  const title = notification.title || "NexuDrive";
  const options = {
    body: notification.body || "Tenes una nueva notificacion.",
    tag: notification.related_id || notification.id || "nexudrive-notification",
    data: notification,
    icon: "/assets/agronex-logo.png",
    badge: "/assets/agronex-logo.png",
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (_) {
    payload = { title: "NexuDrive", body: event.data?.text() || "Tenes una nueva notificacion." };
  }
  const title = payload.title || "NexuDrive";
  const options = {
    body: payload.body || "Tenes una nueva notificacion.",
    tag: payload.related_id || payload.id || "nexudrive-push",
    data: payload,
    icon: "/assets/agronex-logo.png",
    badge: "/assets/agronex-logo.png",
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    const clientsList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const target = clientsList.find((client) => "focus" in client);
    if (target) {
      await target.focus();
      target.postMessage({ type: "NEXUDRIVE_NOTIFICATION_CLICK", notification: event.notification.data });
      return;
    }
    await self.clients.openWindow("/");
  })());
});
