const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;
const BASE = import.meta.env.VITE_API_URL || "/api";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function isPushSupported() {
  return "serviceWorker" in navigator && "PushManager" in window;
}

export async function subscribeToPush() {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Permission denied");

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  const pin = localStorage.getItem("app_pin");
  await fetch(`${BASE}/push/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(pin ? { "x-app-pin": pin } : {}) },
    body: JSON.stringify(subscription),
  });
}