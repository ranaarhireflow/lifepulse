import type { DailyTrackerEntry } from "@/services/trackers"

/**
 * Sync today's habit data to the native widget via Capacitor Preferences.
 * The Android widget reads from SharedPreferences to display habit status.
 */
export async function syncWidgetData(entries: DailyTrackerEntry[], streak?: number, level?: number) {
  if (!(window as any).Capacitor?.isNativePlatform()) return

  try {
    const { Preferences } = await import("@capacitor/preferences")

    const total = entries.length
    const done = entries.filter(e => e.entry !== null).length
    const habits = entries.slice(0, 4).map(e => ({
      icon: e.tracker.icon || "📊",
      name: e.tracker.name,
      logged: e.entry !== null,
    }))

    await Preferences.set({
      key: "widget_habits",
      value: JSON.stringify({
        total,
        done,
        streak: streak || 0,
        level: level || 1,
        habits,
      }),
    })

    // Widget updates on its own schedule (every 30 min via updatePeriodMillis)
  } catch {
    // Capacitor not available
  }
}
