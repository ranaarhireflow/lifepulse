import { getNotificationMessage } from "@/data/notification-messages"

/** Request notification permission */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false
  if (Notification.permission === "granted") return true
  if (Notification.permission === "denied") return false

  const result = await Notification.requestPermission()
  return result === "granted"
}

/** Send a local notification (for testing/immediate use) */
export function sendLocalNotification(title: string, body: string, icon?: string) {
  if (Notification.permission !== "granted") return

  new Notification(title, {
    body,
    icon: icon || "/icons/icon-192.png",
    badge: "/icons/icon-72.png",
    tag: "lifepulse-" + Date.now(),
  })
}

/** Send a notification for a specific habit */
export function notifyHabit(habitName: string, habitIcon: string | null) {
  const message = getNotificationMessage(habitIcon)
  sendLocalNotification(`${habitIcon || "\u{1F4CA}"} ${habitName}`, message)
}

/** Schedule notifications using the Capacitor Local Notifications plugin */
export async function scheduleCapacitorNotification(
  id: number,
  title: string,
  body: string,
  hour: number,
  minute: number,
  _weekdays?: number[] // 1=Sun..7=Sat (Capacitor format) — reserved for future per-day scheduling
) {
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications")

    // Request permission first
    const perm = await LocalNotifications.requestPermissions()
    if (perm.display !== "granted") return false

    await LocalNotifications.schedule({
      notifications: [{
        id,
        title,
        body,
        schedule: {
          on: { hour, minute },
          repeats: true,
          every: "day",
        },
        sound: "default",
        smallIcon: "ic_stat_icon",
        largeIcon: "ic_launcher",
      }],
    })
    return true
  } catch {
    // Capacitor not available (web)
    return false
  }
}

/** Check if we're running in a Capacitor native app */
export function isNativeApp(): boolean {
  try {
    return !!(window as unknown as Record<string, unknown>).Capacitor &&
      typeof ((window as unknown as Record<string, unknown>).Capacitor as Record<string, unknown>).isNativePlatform === "function" &&
      ((window as unknown as Record<string, unknown>).Capacitor as { isNativePlatform: () => boolean }).isNativePlatform()
  } catch {
    return false
  }
}
