import type { DailyTrackerEntry, Tracker } from "@/services/trackers"

/**
 * Sync today's habit data to the native widget via Capacitor Preferences.
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
      value: JSON.stringify({ total, done, streak: streak || 0, level: level || 1, habits }),
    })
  } catch {}
}

/**
 * Sync full tracker list so the widget config picker can show all habits.
 */
export async function syncTrackerList(trackers: Tracker[]) {
  if (!(window as any).Capacitor?.isNativePlatform()) return

  try {
    const { Preferences } = await import("@capacitor/preferences")

    const list = trackers.map(t => ({
      id: t.id,
      icon: t.icon || "📊",
      name: t.name,
    }))

    await Preferences.set({
      key: "widget_trackers",
      value: JSON.stringify(list),
    })
  } catch {}
}
