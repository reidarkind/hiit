import { registerSW } from "virtual:pwa-register";

export function registerPwa(onNeedRefresh: (update: (reload?: boolean) => Promise<void>) => void): void {
  if (navigator.storage?.persist) void navigator.storage.persist();
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
  const update = registerSW({
    immediate: true,
    onNeedRefresh() {
      onNeedRefresh(update);
    },
  });
}
