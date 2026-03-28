import { getNotificationMessage } from "@/data/notification-messages"
import type { Tracker } from "@/services/trackers"

/**
 * Sync tracker alerts to device local notifications.
 * Call this after trackers are loaded or alerts are updated.
 */
export async function syncAlarmsToDevice(trackers: Tracker[]) {
  // Only works in Capacitor native app
  if (!(window as any).Capacitor?.isNativePlatform()) return

  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications")

    // Request permission first
    const perm = await LocalNotifications.requestPermissions()
    if (perm.display !== "granted") {
      console.log("Notification permission denied")
      return
    }

    // Cancel all existing scheduled notifications
    const pending = await LocalNotifications.getPending()
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications })
    }

    // Schedule new notifications from tracker alerts
    const notifications: any[] = []
    let id = 1000 // Start IDs from 1000 to avoid conflicts

    for (const tracker of trackers) {
      if (!tracker.alerts || tracker.alerts.length === 0) continue

      for (const alert of tracker.alerts) {
        if (!alert.enabled) continue

        const [hour, minute] = alert.alert_time.split(":").map(Number)
        const message = getNotificationMessage(tracker.icon)

        notifications.push({
          id: id++,
          title: `${tracker.icon || "📊"} ${tracker.name}`,
          body: alert.label || message,
          schedule: {
            on: { hour, minute },
            repeats: true,
            every: "day",
          },
          sound: "default",
          smallIcon: "ic_stat_icon",
          largeIcon: "ic_launcher",
          channelId: "lifepulse-reminders",
        })
      }
    }

    if (notifications.length > 0) {
      // Create notification channel (Android 8+)
      try {
        await LocalNotifications.createChannel({
          id: "lifepulse-reminders",
          name: "Habit Reminders",
          description: "Reminders to log your daily habits",
          importance: 4, // HIGH
          visibility: 1, // PUBLIC
          vibration: true,
          sound: "default",
        })
      } catch { /* channel might already exist */ }

      await LocalNotifications.schedule({ notifications })
      console.log(`Scheduled ${notifications.length} notifications`)
    }
  } catch (err) {
    console.error("Failed to sync alarms:", err)
  }
}

/** Request notification permission (call on app start or from settings) */
export async function requestNotifPermission(): Promise<boolean> {
  if (!(window as any).Capacitor?.isNativePlatform()) {
    // Web: use browser Notification API
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
