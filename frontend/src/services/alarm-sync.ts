import { getNotificationMessage } from "@/data/notification-messages"
import type { Tracker } from "@/services/trackers"

function isNative(): boolean {
  return !!(window as any).Capacitor?.isNativePlatform()
}

/**
 * Send a test notification immediately — use to verify notifications work.
 */
export async function sendTestNotification(): Promise<boolean> {
  if (!isNative()) {
    // Web fallback
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("LifePulse 🧘", { body: "Notifications are working! 🎉", icon: "/icons/icon-192.png" })
      return true
    }
    return false
  }

  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications")
    const perm = await LocalNotifications.requestPermissions()
    if (perm.display !== "granted") return false

    await LocalNotifications.schedule({
      notifications: [{
        id: 9999,
        title: "LifePulse 🧘",
        body: "Notifications are working! You'll get habit reminders at your scheduled times 🎉",
        schedule: { at: new Date(Date.now() + 2000) }, // 2 seconds from now
        sound: "default",
      }],
    })
    return true
  } catch {
    return false
  }
}

/**
 * Sync tracker alerts to device local notifications.
 */
export async function syncAlarmsToDevice(trackers: Tracker[]) {
  if (!isNative()) return

  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications")

    const perm = await LocalNotifications.requestPermissions()
    if (perm.display !== "granted") return

    // Create notification channel first (Android 8+)
    try {
      await LocalNotifications.createChannel({
        id: "lifepulse-reminders",
        name: "Habit Reminders",
        description: "Reminders to log your daily habits",
        importance: 4,
        visibility: 1,
        vibration: true,
        sound: "default",
      })
    } catch { /* already exists */ }

    // Cancel all existing scheduled notifications (IDs 1000+)
    const pending = await LocalNotifications.getPending()
    const toCancel = pending.notifications.filter(n => n.id >= 1000)
    if (toCancel.length > 0) {
      await LocalNotifications.cancel({ notifications: toCancel })
    }

    // Schedule notifications for each tracker alert
    const notifications: any[] = []
    let id = 1000

    for (const tracker of trackers) {
      if (!tracker.alerts || tracker.alerts.length === 0) continue

      for (const alert of tracker.alerts) {
        if (!alert.enabled) continue

        const [hour, minute] = alert.alert_time.split(":").map(Number)
        const message = getNotificationMessage(tracker.icon)

        // Schedule for the next occurrence of this time
        const now = new Date()
        const scheduledTime = new Date()
        scheduledTime.setHours(hour, minute, 0, 0)
        if (scheduledTime <= now) {
          scheduledTime.setDate(scheduledTime.getDate() + 1) // Tomorrow
        }

        notifications.push({
          id: id++,
          title: `${tracker.icon || "📊"} ${tracker.name}`,
          body: alert.label || message,
          schedule: {
            at: scheduledTime,
            repeats: true,
            every: "day" as const,
          },
          channelId: "lifepulse-reminders",
          sound: "default",
        })
      }
    }

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications })
    }
  } catch (err) {
    console.error("Failed to sync alarms:", err)
  }
}

/** Request notification permission */
export async function requestNotifPermission(): Promise<boolean> {
  if (!isNative()) {
    if (!("Notification" in window)) return false
    const result = await Notification.requestPermission()
    return result === "granted"
  }

  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications")
    const perm = await LocalNotifications.requestPermissions()
    return perm.display === "granted"
  } catch {
    return false
  }
}
