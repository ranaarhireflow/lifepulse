import api from "./api"

export interface TrackerAlert {
  id: string
  alert_time: string
  alert_days: number[]
  label: string | null
  enabled: boolean
}

export interface Tracker {
  id: string
  name: string
  icon: string | null
  color: string | null
  type: "NUMERIC" | "DUAL_NUMERIC" | "BOOLEAN" | "DURATION" | "TIME" | "TEXT"
  unit: string | null
  unit_secondary: string | null
  default_behavior: "CARRY_FORWARD" | "ZERO" | "NULL"
  sort_order: number
  archived: boolean
  reminder_enabled: boolean
  min_value: number | null
  max_value: number | null
  streak_goal: number | null
  target_value: number | null
  tracking_days: number[] | null  // 1=Mon..7=Sun
  times_per_day: number
  dimension: string | null
  difficulty: number
  alerts: TrackerAlert[]
}

export interface TrackerTemplate {
  id: string
  name: string
  icon: string | null
  color: string | null
  type: string
  unit: string | null
  unit_secondary: string | null
  default_behavior: string
  category: string | null
}

export interface Entry {
  id: string
  tracker_id: string
  date: string
  value_numeric: number | null
  value_numeric2: number | null
  value_boolean: boolean | null
  value_duration: number | null
  value_time: string | null
  value_text: string | null
  note: string | null
}

export interface DailyTrackerEntry {
  tracker: {
    id: string
    name: string
    icon: string | null
    color: string | null
    type: string
    unit: string | null
    unit_secondary: string | null
    default_behavior: string
    target_value: number | null
    min_value: number | null
    max_value: number | null
    reminder_enabled: boolean
    tracking_days: number[] | null
    times_per_day: number
    dimension: string | null
  }
  entry: Entry | null
  default_value: number | null
}

export async function fetchTrackers(includeArchived = false) {
  const res = await api.get<Tracker[]>("/trackers", {
    params: { include_archived: includeArchived },
  })
  return res.data
}

export async function fetchTracker(id: string) {
  const res = await api.get<Tracker>(`/trackers/${id}`)
  return res.data
}

export async function createTracker(data: Partial<Tracker> & { alerts?: { alert_time: string; alert_days: number[]; label?: string }[] }) {
  const res = await api.post<Tracker>("/trackers", data)
  return res.data
}

export async function updateTracker(id: string, data: Partial<Tracker>) {
  const res = await api.patch<Tracker>(`/trackers/${id}`, data)
  return res.data
}

export async function deleteTracker(id: string) {
  await api.delete(`/trackers/${id}`)
}

export async function archiveTracker(id: string) {
  await api.post(`/trackers/${id}/archive`)
}

export async function unarchiveTracker(id: string) {
  await api.post(`/trackers/${id}/unarchive`)
}

export async function fetchTemplates() {
  const res = await api.get<TrackerTemplate[]>("/templates")
  return res.data
}

export async function createFromTemplate(templateId: string) {
  const res = await api.post<Tracker>(`/templates/${templateId}/create`)
  return res.data
}

export async function fetchDailyEntries(date: string) {
  const res = await api.get<DailyTrackerEntry[]>("/entries/bulk", {
    params: { date },
  })
  return res.data
}

export async function upsertEntry(
  trackerId: string,
  date: string,
  data: Partial<Entry>
) {
  const res = await api.put<Entry>(`/entries/${trackerId}/${date}`, data)
  return res.data
}

export async function fetchEntries(params: {
  tracker_id?: string
  from?: string
  to?: string
  date?: string
}) {
  const res = await api.get<Entry[]>("/entries", { params })
  return res.data
}

export interface TrackerAnalytics {
  tracker_id: string
  tracker_name: string
  tracker_type: string
  unit: string | null
  data_points: { date: string; value: number | null; value2: number | null; is_default: boolean }[]
  average: number | null
  min_value: number | null
  max_value: number | null
  current_streak: number
  longest_streak: number
  completion_rate: number
  total_entries: number
}

export interface HeatmapData {
  tracker_id: string
  days: { date: string; value: number | null; completed: boolean }[]
}

export async function fetchAnalytics(trackerId: string, from: string, to: string) {
  const res = await api.get<TrackerAnalytics>(`/analytics/${trackerId}`, {
    params: { from, to },
  })
  return res.data
}

export async function fetchHeatmap(trackerId: string, from: string, to: string) {
  const res = await api.get<HeatmapData>(`/analytics/${trackerId}/heatmap`, {
    params: { from, to },
  })
  return res.data
}
