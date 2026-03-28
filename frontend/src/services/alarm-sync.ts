import { getNotificationMessage } from "@/data/notification-messages"
import type { Tracker } from "@/services/trackers"

function isNative(): boolean {
  return !!(window as any).Capacitor?.isNativePlatform()
}

/**
 * Send a test notification in 3 seconds to verify notifications work.
 */
export async function sendTestNotification(): Promise<boolean> {
  if (!isNative()) {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("LifePulse 🧘", { body: "Notifications are working! 🎉" })
      return true
    }
    return false
  }

  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications")

    const perm = await LocalNotifications.requestPermissions()
    if (perm.display !== "granted") return false

    // Create channel first
    try {
      await LocalNotifications.createChannel({
        id: "lifepulse-test",
        name: "Test",
        importance: 4,
        vibration: true,
      })
    } catch {}

    // Schedule 3 seconds from now
    const fireAt = new Date(Date.now() + 3000)

    await LocalNotifications.schedule({
      notifications: [{
        id: 9999,
        title: "LifePulse 🧘",
        body: "Notifications are working! You'll get habit reminders 🎉",
        schedule: { at: fireAt, allowWhileIdle: true },
        channelId: "lifepulse-test",
      }],
    })
    return true
  } catch (e) {
    console.error("Test notification failed:", e)
    return false
  }
}

/**
 * Sync tracker alerts to device local notifications.
 * Uses `schedule.on` for cron-like daily recurring.
 */
export async function syncAlarmsToDevice(trackers: Tracker[]) {
  if (!isNative()) return

  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications")

    const perm = await LocalNotifications.requestPermissions()
    if (perm.display !== "granted") return

    // Create notification channel (Android 8+)
    try {
      await LocalNotifications.createChannel({
        id: "lifepulse-reminders",
        name: "Habit Reminders",
        description: "Daily reminders to log your habits",
        importance: 4,
        visibility: 1,
        vibration: true,
      })
    } catch {}

    // Cancel existing scheduled reminders (IDs 1000-1999)
    const pending = await LocalNotifications.getPending()
    const toCancel = pending.notifications.filter(n => n.id >= 1000 && n.id < 2000)
    if (toCancel.length > 0) {
      await LocalNotifications.cancel({ notifications: toCancel })
    }

    // Schedule from tracker alerts
    const notifications: any[] = []
    let id = 1000

    for (const tracker of trackers) {
      if (!tracker.alerts || tracker.alerts.length === 0) continue

      for (const alert of tracker.alerts) {
        if (!alert.enabled) continue

        const [hour, minute] = alert.alert_time.split(":").map(Number)
        const message = getNotificationMessage(tracker.icon)

        // Use `on` for cron-like recurring (fires every day at this time)
        notifications.push({
          id: id++,
          title: `${tracker.icon || "📊"} ${tracker.name}`,
          body: alert.label || message,
          schedule: {
            on: { hour, minute },
            allowWhileIdle: true,
          },
          channelId: "lifepulse-reminders",
        })
      }
    }

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications })
    }
  } catch (err) {
    console.error("Alarm sync failed:", err)
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
