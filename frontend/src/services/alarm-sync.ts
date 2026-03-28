/**
 * LifePulse Notification System
 *
 * Uses @capacitor/local-notifications with STATIC imports.
 * Dynamic imports were failing silently on Android.
 */
import { LocalNotifications } from "@capacitor/local-notifications"
import { Capacitor } from "@capacitor/core"
import { getNotificationMessage } from "@/data/notification-messages"
import type { Tracker } from "@/services/trackers"

const IS_NATIVE = Capacitor.isNativePlatform()
const CHANNEL_ID = "lifepulse-habits"

/** Initialize notifications: create channel + request permission */
export async function initNotifications(): Promise<boolean> {
  if (!IS_NATIVE) {
    // Web fallback
    if (!("Notification" in window)) return false
    const result = await Notification.requestPermission()
    return result === "granted"
  }

  try {
    // 1. Create notification channel FIRST (required on Android 8+)
    await LocalNotifications.createChannel({
      id: CHANNEL_ID,
      name: "Habit Reminders",
      description: "Daily reminders for your habits",
      importance: 4, // HIGH
      visibility: 1, // PUBLIC
      vibration: true,
      sound: "default",
    })

    // 2. Request permission
    const perm = await LocalNotifications.requestPermissions()
    return perm.display === "granted"
  } catch (e) {
    console.error("initNotifications failed:", e)
    return false
  }
}

/** Send a test notification immediately */
export async function sendTestNotification(): Promise<string> {
  if (!IS_NATIVE) {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("LifePulse", { body: "Test notification works! 🎉" })
      return "sent"
    }
    return "no permission"
  }

  try {
    // Check permission
    const perm = await LocalNotifications.checkPermissions()
    if (perm.display !== "granted") {
      return "permission: " + perm.display
    }

    // List channels to verify
    const channels = await LocalNotifications.listChannels()
    const channelNames = channels.channels.map(c => c.id).join(", ")

    // Schedule for 3 seconds from now
    await LocalNotifications.schedule({
      notifications: [{
        id: 99999,
        title: "🧘 LifePulse Test",
        body: "Notifications are working! Your habit reminders will fire on time.",
        schedule: {
          at: new Date(Date.now() + 3000),
          allowWhileIdle: true,
        },
        channelId: CHANNEL_ID,
        autoCancel: true,
      }],
    })

    // Verify it was scheduled
    const pending = await LocalNotifications.getPending()
    return `scheduled (${pending.notifications.length} pending, channels: ${channelNames})`
  } catch (e: any) {
    return "error: " + (e?.message || String(e))
  }
}

/** Sync all tracker alerts as local notifications */
export async function syncAlarms(trackers: Tracker[]): Promise<string> {
  if (!IS_NATIVE) return "web"

  try {
    const perm = await LocalNotifications.checkPermissions()
    if (perm.display !== "granted") return "no permission"

    // Cancel existing habit reminders (IDs 1000-1999)
    const pending = await LocalNotifications.getPending()
    const toCancel = pending.notifications.filter(n => n.id >= 1000 && n.id < 2000)
    if (toCancel.length > 0) {
      await LocalNotifications.cancel({ notifications: toCancel })
    }

    // Build notifications using schedule.at + repeats (more reliable than schedule.on)
    const notifs: any[] = []
    let id = 1000
    const now = new Date()

    for (const tracker of trackers) {
      if (!tracker.alerts?.length) continue
      for (const alert of tracker.alerts) {
        if (!alert.enabled) continue
        const [hour, minute] = alert.alert_time.split(":").map(Number)

        // Calculate next occurrence of this time
        const nextFire = new Date()
        nextFire.setHours(hour, minute, 0, 0)
        if (nextFire <= now) {
          nextFire.setDate(nextFire.getDate() + 1) // Tomorrow
        }

        notifs.push({
          id: id++,
          title: `${tracker.icon || "📊"} ${tracker.name}`,
          body: alert.label || getNotificationMessage(tracker.icon),
          schedule: {
            at: nextFire,
            repeats: true,
            allowWhileIdle: true,
          },
          channelId: CHANNEL_ID,
          autoCancel: true,
        })
      }
    }

    if (notifs.length > 0) {
      await LocalNotifications.schedule({ notifications: notifs })
    }

    return `synced ${notifs.length} alarms`
  } catch (e: any) {
    return "error: " + (e?.message || String(e))
  }
}

/** Get notification status for display */
export async function getNotifStatus(): Promise<{ granted: boolean; pending: number; channels: number }> {
  if (!IS_NATIVE) {
    return {
      granted: "Notification" in window && Notification.permission === "granted",
      pending: 0,
      channels: 0,
    }
  }

  try {
    const perm = await LocalNotifications.checkPermissions()
    const pending = await LocalNotifications.getPending()
    const channels = await LocalNotifications.listChannels()
    return {
      granted: perm.display === "granted",
      pending: pending.notifications.length,
      channels: channels.channels.length,
    }
  } catch {
    return { granted: false, pending: 0, channels: 0 }
  }
}
