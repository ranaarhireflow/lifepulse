import { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate, NavLink } from "react-router-dom"
import { format, subDays, startOfYear, subYears } from "date-fns"
import {
  ChevronLeft,
  Calendar,
  Loader2,
  Bell,
  Settings2,
  Trash2,
  Pencil,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConfigDrawer } from "@/components/common/ConfigDrawer"
import { Input } from "@/components/ui/input"
import api from "@/services/api"
import { ActivityCalendar } from "react-activity-calendar"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { PulseLogo } from "@/components/common/PulseLogo"
import {
  fetchTracker,
  fetchAnalytics,
  fetchHeatmap,
  updateTracker,
  deleteTracker,
  type Tracker,
  type TrackerAnalytics,
  type HeatmapData,
} from "@/services/trackers"
import { HeroCard } from "@/components/trackers/HeroCard"
import { StatsGrid } from "@/components/trackers/StatsGrid"

// Gradient scenes per tracker emoji
const SCENES: Record<string, { bg: string; narrative: string }> = {
  "\u{1F4A7}": { bg: "radial-gradient(ellipse at 30% 80%, #0c4a6e 0%, #0e7490 35%, #155e75 60%, #164e63 100%)", narrative: "Stay hydrated, stay sharp" },
  "\u{1F3CB}\u{FE0F}": { bg: "radial-gradient(ellipse at 70% 20%, #ea580c 0%, #c2410c 30%, #9a3412 55%, #7c2d12 100%)", narrative: "Build strength, build character" },
  "\u{1F9E0}": { bg: "radial-gradient(circle at 80% 10%, #7c3aed 0%, #4c1d95 35%, #2e1065 60%, #1e1b4b 100%)", narrative: "Focus is your superpower" },
  "\u{1F4D6}": { bg: "radial-gradient(ellipse at 20% 70%, #059669 0%, #047857 35%, #065f46 60%, #064e3b 100%)", narrative: "Feed your mind daily" },
  "\u{2696}\u{FE0F}": { bg: "radial-gradient(ellipse at 50% 30%, #4338ca 0%, #3730a3 35%, #312e81 60%, #1e1b4b 100%)", narrative: "Track your body's journey" },
  "\u{1F319}": { bg: "radial-gradient(circle at 70% 20%, #312e81 0%, #1e1b4b 40%, #0f0a2e 70%, #000 100%)", narrative: "Rest well, rise strong" },
  "\u{1FAA5}": { bg: "radial-gradient(ellipse at 30% 40%, #0891b2 0%, #0e7490 35%, #155e75 60%, #164e63 100%)", narrative: "Start every day right" },
  "\u{2764}\u{FE0F}": { bg: "radial-gradient(ellipse at 50% 50%, #e11d48 0%, #be123c 35%, #9f1239 60%, #881337 100%)", narrative: "Know your numbers" },
  "\u{1F305}": { bg: "radial-gradient(ellipse at 50% 80%, #f59e0b 0%, #d97706 25%, #b45309 50%, #92400e 100%)", narrative: "Rise before everyone" },
  "\u{1F525}": { bg: "radial-gradient(ellipse at 40% 60%, #dc2626 0%, #b91c1c 30%, #991b1b 55%, #7f1d1d 100%)", narrative: "Push beyond your limits" },
  "\u{1F3C3}": { bg: "radial-gradient(ellipse at 60% 30%, #0d9488 0%, #0f766e 35%, #115e59 60%, #134e4a 100%)", narrative: "Every step counts" },
  "\u{1F493}": { bg: "radial-gradient(circle at 50% 40%, #ec4899 0%, #db2777 35%, #be185d 60%, #9d174d 100%)", narrative: "Listen to your heart" },
}
const DEFAULT_SCENE = {
  bg: "radial-gradient(ellipse at 50% 50%, #16a34a 0%, #15803d 35%, #166534 60%, #14532d 100%)",
  narrative: "Track it. Master it.",
}

// Trend chart date range presets
const RANGES = [
  { key: "7d", label: "Week", days: 7 },
  { key: "30d", label: "Month", days: 30 },
  { key: "90d", label: "3 Mo", days: 90 },
  { key: "180d", label: "6 Mo", days: 180 },
  { key: "ytd", label: "YTD", days: 0 },
  { key: "1y", label: "Year", days: 365 },
  { key: "all", label: "All", days: 9999 },
]

/** Convert a range key like "30d" or "ytd" into from/to date strings */
function getDateRange(rangeKey: string) {
  const to = new Date()
  let from: Date
  if (rangeKey === "ytd") {
    from = startOfYear(to)
  } else if (rangeKey === "all") {
    from = subYears(to, 5)
  } else {
    const range = RANGES.find((r) => r.key === rangeKey)
    from = subDays(to, range?.days || 30)
  }
  return { from: format(from, "yyyy-MM-dd"), to: format(to, "yyyy-MM-dd") }
}

// Type label map for the config drawer
const TYPE_LABELS: Record<string, string> = {
  NUMERIC: "Number",
  DUAL_NUMERIC: "Dual",
  BOOLEAN: "Yes/No",
  DURATION: "Duration",
  TIME: "Time",
  TEXT: "Notes",
}

export function TrackerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [tracker, setTracker] = useState<Tracker | null>(null)
  const [analytics, setAnalytics] = useState<TrackerAnalytics | null>(null)
  const [heatmap, setHeatmap] = useState<HeatmapData | null>(null)
  const [range, setRange] = useState("30d")
  const [heatmapRange, setHeatmapRange] = useState<"3m" | "6m" | "1y">("1y")
  const [loading, setLoading] = useState(true)
  const [configOpen, setConfigOpen] = useState(false)
  const [showAddAlert, setShowAddAlert] = useState(false)
  const [newAlertTime, setNewAlertTime] = useState("08:00")
  const [newAlertLabel, setNewAlertLabel] = useState("")
  const [newAlertDays, setNewAlertDays] = useState([1, 2, 3, 4, 5, 6, 7])
  const [editingAlertId, setEditingAlertId] = useState<string | null>(null)
  const [editTime, setEditTime] = useState("")
  const [editLabel, setEditLabel] = useState("")
  const [editDays, setEditDays] = useState<number[]>([])
  // Tracker edit state
  const [trackerName, setTrackerName] = useState("")
  const [trackerTarget, setTrackerTarget] = useState("")
  const [trackerUnit, setTrackerUnit] = useState("")
  const [editTrackingDays, setEditTrackingDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 7])
  const [editTimesPerDay, setEditTimesPerDay] = useState(1)
  const [deleting, setDeleting] = useState(false)

  const openEditDrawer = () => {
    if (!tracker) return
    setTrackerName(tracker.name)
    setTrackerTarget(tracker.target_value?.toString() || "")
    setTrackerUnit(tracker.unit || "")
    setEditTrackingDays(tracker.tracking_days || [1, 2, 3, 4, 5, 6, 7])
    setEditTimesPerDay(tracker.times_per_day || 1)
    setConfigOpen(true)
  }

  const saveTrackerEdit = async () => {
    if (!tracker) return
    await updateTracker(tracker.id, {
      name: trackerName,
      target_value: trackerTarget ? parseFloat(trackerTarget) : null,
      unit: trackerUnit || null,
      tracking_days: editTrackingDays,
      times_per_day: editTimesPerDay,
    })
    const t = await fetchTracker(tracker.id)
    setTracker(t)
    setConfigOpen(false)
  }

  const handleDeleteTracker = async () => {
    if (!tracker) return
    setDeleting(true)
    try {
      await deleteTracker(tracker.id)
      navigate("/progress")
    } finally {
      setDeleting(false)
    }
  }

  const startEdit = (alert: { id: string; alert_time: string; label: string | null; alert_days: number[] }) => {
    setEditingAlertId(alert.id)
    setEditTime(alert.alert_time)
    setEditLabel(alert.label || "")
    setEditDays(alert.alert_days || [1, 2, 3, 4, 5, 6, 7])
  }

  const saveEdit = async () => {
    if (!editingAlertId || !tracker) return
    try {
      await api.delete(`/trackers/${tracker.id}/alerts/${editingAlertId}`)
      await api.post(`/trackers/${tracker.id}/alerts`, {
        alert_time: editTime,
        alert_days: editDays,
        label: editLabel || null,
        enabled: true,
      })
      setEditingAlertId(null)
      const t = await fetchTracker(tracker.id)
      setTracker(t)
    } catch { /* */ }
  }

  // Initial load
  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetchTracker(id)
      .then((t) => setTracker(t))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  // Heatmap data — refetch when range changes
  useEffect(() => {
    if (!id) return
    const now = new Date()
    const from = heatmapRange === "3m" ? subDays(now, 90) : heatmapRange === "6m" ? subDays(now, 180) : subYears(now, 1)
    fetchHeatmap(id, format(from, "yyyy-MM-dd"), format(now, "yyyy-MM-dd"))
      .then((h) => setHeatmap(h))
      .catch(() => {})
  }, [id, heatmapRange])

  // Trend chart data — refetch when range changes
  useEffect(() => {
    if (!id) return
    const { from, to } = getDateRange(range)
    fetchAnalytics(id, from, to)
      .then((a) => setAnalytics(a))
      .catch(() => {})
  }, [id, range])

  const color = tracker?.color || "#22C55E"
  const scene = SCENES[tracker?.icon || ""] || DEFAULT_SCENE

  // Transform heatmap API data into the format react-activity-calendar expects
  const heatmapActivities = useMemo(() => {
    if (!heatmap) return []
    return heatmap.days.map((d) => ({
      date: d.date,
      count: d.completed ? (d.value !== null ? Math.min(Math.ceil(d.value), 4) : 1) : 0,
      level: d.completed
        ? d.value !== null
          ? Math.min(Math.ceil(d.value / (analytics?.average || 1)), 4) as 0 | 1 | 2 | 3 | 4
          : (1 as const)
        : (0 as const),
    }))
  }, [heatmap, analytics])

  // Transform analytics data points into recharts format
  const chartData = useMemo(() => {
    if (!analytics) return []
    return analytics.data_points.map((dp) => ({
      date: format(new Date(dp.date), "MMM d"),
      value: dp.value,
      value2: dp.value2,
    }))
  }, [analytics])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#22C55E]" />
      </div>
    )
  }

  if (!tracker || !analytics) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Tracker not found</p>
        <Button variant="ghost" onClick={() => navigate("/trackers")} className="mt-4">
          Back to Trackers
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-6 px-5 pt-4 max-w-md mx-auto">
      {/* Back + Logo */}
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-accent transition-colors">
          <ChevronLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <NavLink to="/"><PulseLogo size={28} /></NavLink>
      </div>

      {/* Pokemon Card — Hero Section */}
      <HeroCard
        tracker={tracker}
        analytics={analytics}
        scene={scene}
        onEdit={openEditDrawer}
      />

      {/* Stats Grid — 2x2 */}
      <StatsGrid analytics={analytics} />

      {/* Config drawer (edit tracker + alerts) */}
      <ConfigDrawer open={configOpen} onClose={() => { setConfigOpen(false); setShowAddAlert(false) }} title={tracker.name} description="Edit tracker and manage alerts">
        <div className="space-y-5">
          {/* Tracker edit fields */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold uppercase tracking-[1.5px] text-muted-foreground flex items-center gap-1.5">
              <Pencil className="h-3.5 w-3.5 text-primary" /> Edit Tracker
            </h3>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Name</label>
              <Input value={trackerName} onChange={(e) => setTrackerName(e.target.value)} className="w-full" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Target Value</label>
              <Input type="number" value={trackerTarget} onChange={(e) => setTrackerTarget(e.target.value)} placeholder="e.g. 72" className="w-full" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Unit</label>
              <Input value={trackerUnit} onChange={(e) => setTrackerUnit(e.target.value)} placeholder="e.g. kg, glasses" className="w-full" />
            </div>
            <div>
              <label className="text-[13px] font-bold text-foreground">Track on these days</label>
              <p className="text-[11px] text-muted-foreground mb-2">Leave all selected for daily tracking</p>
              <div className="flex gap-1.5">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => {
                  const dayNum = i + 1
                  const active = editTrackingDays.includes(dayNum)
                  return (
                    <button key={d} type="button" onClick={() => setEditTrackingDays(prev =>
                      active ? prev.filter(x => x !== dayNum) : [...prev, dayNum]
                    )}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${
                      active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground border border-border"
                    }`}>{d}</button>
                  )
                })}
              </div>
            </div>
            <div>
              <label className="text-[13px] font-bold text-foreground">Times per day</label>
              <p className="text-[11px] text-muted-foreground mb-2">How many times to track daily</p>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setEditTimesPerDay(Math.max(1, editTimesPerDay - 1))} className="h-10 w-10 rounded-xl bg-card border border-border text-foreground font-bold">&minus;</button>
                <span className="text-[24px] font-black w-12 text-center">{editTimesPerDay}</span>
                <button type="button" onClick={() => setEditTimesPerDay(Math.min(10, editTimesPerDay + 1))} className="h-10 w-10 rounded-xl bg-card border border-border text-foreground font-bold">+</button>
              </div>
            </div>
            <Button onClick={saveTrackerEdit} className="w-full rounded-xl h-10 text-[13px] font-bold">
              Save Changes
            </Button>
          </div>

          <div className="border-t border-border" />

          {/* Alerts section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-bold uppercase tracking-[1.5px] text-muted-foreground flex items-center gap-1.5">
                <Bell className="h-3.5 w-3.5 text-primary" /> Reminders
              </h3>
              {!showAddAlert && (
                <button onClick={() => setShowAddAlert(true)} className="text-[11px] font-bold text-primary hover:underline">
                  + Add
                </button>
              )}
            </div>

            {/* Add alert form */}
            {showAddAlert && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 mb-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold">New Reminder</span>
                  <button onClick={() => setShowAddAlert(false)} className="text-[10px] text-muted-foreground hover:text-foreground">Cancel</button>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Time</label>
                  <Input type="time" value={newAlertTime} onChange={(e) => setNewAlertTime(e.target.value)} className="w-full" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Label (optional)</label>
                  <Input value={newAlertLabel} onChange={(e) => setNewAlertLabel(e.target.value)} placeholder="e.g. Morning reminder" className="w-full" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1.5">Repeat on</label>
                  <div className="flex gap-1.5">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => {
                      const dayNum = i + 1
                      const active = newAlertDays.includes(dayNum)
                      return (
                        <button key={d} type="button"
                          onClick={() => setNewAlertDays(prev => active ? prev.filter(x => x !== dayNum) : [...prev, dayNum])}
                          className={`flex-1 rounded-lg py-1.5 text-[10px] font-bold transition-all ${
                            active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground border border-border"
                          }`}>
                          {d}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <Button size="sm" className="w-full mt-1"
                  onClick={async () => {
                    try {
                      await api.post(`/trackers/${tracker.id}/alerts`, {
                        alert_time: newAlertTime,
                        alert_days: newAlertDays,
                        label: newAlertLabel || null,
                        enabled: true,
                      })
                      setShowAddAlert(false)
                      setNewAlertLabel("")
                      setNewAlertTime("08:00")
                      setNewAlertDays([1, 2, 3, 4, 5, 6, 7])
                      const t = await fetchTracker(tracker.id)
                      setTracker(t)
                    } catch { /* */ }
                  }}>
                  Save Reminder
                </Button>
              </div>
            )}

            {/* Existing alerts */}
            {tracker.alerts && tracker.alerts.length > 0 ? (
              <div className="space-y-2">
                {tracker.alerts.map((alert) => (
                  <div key={alert.id} className="rounded-xl border border-border bg-card p-3.5">
                    {editingAlertId === alert.id ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-bold">Edit Reminder</span>
                          <button onClick={() => setEditingAlertId(null)} className="text-[10px] text-muted-foreground hover:text-foreground">Cancel</button>
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Time</label>
                          <Input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} className="w-full" />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Label</label>
                          <Input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} placeholder="e.g. Morning reminder" className="w-full" />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground block mb-1.5">Repeat on</label>
                          <div className="flex gap-1.5">
                            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => {
                              const dayNum = i + 1
                              const active = editDays.includes(dayNum)
                              return (
                                <button key={d} type="button"
                                  onClick={() => setEditDays(prev => active ? prev.filter(x => x !== dayNum) : [...prev, dayNum])}
                                  className={`flex-1 rounded-lg py-1.5 text-[10px] font-bold transition-all ${
                                    active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground border border-border"
                                  }`}>
                                  {d}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                        <Button size="sm" className="w-full" onClick={saveEdit}>Save Changes</Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-[20px] font-extrabold tracking-tight">{alert.alert_time}</div>
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => startEdit(alert)} className="rounded-lg p-1 text-muted-foreground/40 hover:text-primary hover:bg-primary/10 transition-all" title="Edit reminder">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  await api.delete(`/trackers/${tracker.id}/alerts/${alert.id}`)
                                  const t = await fetchTracker(tracker.id)
                                  setTracker(t)
                                } catch { /* */ }
                              }}
                              className="rounded-lg p-1 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all"
                              title="Delete reminder"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="flex gap-1.5 mb-1.5">
                          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => {
                            const active = (alert.alert_days || [1, 2, 3, 4, 5, 6, 7]).includes(i + 1)
                            return (
                              <div key={i} className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold ${
                                active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground/50"
                              }`}>{d}</div>
                            )
                          })}
                        </div>
                        {alert.label && <p className="text-[11px] text-muted-foreground">{alert.label}</p>}
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : !showAddAlert ? (
              <div className="rounded-xl border border-dashed border-border p-6 text-center">
                <Bell className="h-6 w-6 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-[12px] text-muted-foreground">No reminders set</p>
                <button onClick={() => setShowAddAlert(true)} className="text-[11px] font-bold text-primary mt-1 hover:underline">
                  Add your first reminder
                </button>
              </div>
            ) : null}
          </div>

          <div className="border-t border-border" />

          {/* Details */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[1.5px] text-muted-foreground flex items-center gap-1.5 mb-3">
              <Settings2 className="h-3.5 w-3.5 text-primary" /> Details
            </h3>
            <div className="space-y-2.5">
              {[
                { label: "Type", value: TYPE_LABELS[tracker.type] || tracker.type },
                ...(tracker.unit ? [{ label: "Unit", value: tracker.unit }] : []),
                ...(tracker.target_value ? [{ label: "Daily Target", value: `${tracker.target_value} ${tracker.unit || ""}` }] : []),
                { label: "When Not Logged", value: { CARRY_FORWARD: "Use yesterday's value", ZERO: "Default to 0", NULL: "Leave empty" }[tracker.default_behavior] || tracker.default_behavior },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="text-[12px] text-muted-foreground">{row.label}</span>
                  <span className="text-[12px] font-bold">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-border" />

          {/* Delete tracker */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[1.5px] text-muted-foreground flex items-center gap-1.5 mb-3">
              <Trash2 className="h-3.5 w-3.5 text-destructive" /> Danger Zone
            </h3>
            <button
              onClick={handleDeleteTracker}
              disabled={deleting}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 py-3 text-[13px] font-bold text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? "Deleting..." : "Delete Tracker (7-day grace)"}
            </button>
          </div>
        </div>
      </ConfigDrawer>

      {/* Alerts section — on page */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[11px] font-extrabold uppercase tracking-[2px] text-muted-foreground flex items-center gap-1.5">
            <Bell className="h-3.5 w-3.5 text-[#22C55E]" /> Reminders
          </h3>
          <button onClick={() => setConfigOpen(true)} className="text-[11px] font-bold text-[#22C55E] hover:underline">
            {tracker.alerts && tracker.alerts.length > 0 ? "Edit" : "+ Add"}
          </button>
        </div>
        {tracker.alerts && tracker.alerts.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tracker.alerts.map((alert) => (
              <div key={alert.id} className="flex items-center gap-2.5 rounded-xl border border-border bg-foreground/5 px-3.5 py-2">
                <span className="text-[15px] font-black text-foreground tabular-nums">{alert.alert_time}</span>
                <div className="flex gap-0.5">
                  {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => {
                    const active = (alert.alert_days || [1, 2, 3, 4, 5, 6, 7]).includes(i + 1)
                    return (
                      <span key={i} className={`text-[8px] font-bold ${active ? "text-[#22C55E]" : "text-muted-foreground/40"}`}>{d}</span>
                    )
                  })}
                </div>
                {!alert.enabled && <span className="text-[9px] text-muted-foreground/70">off</span>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[12px] text-muted-foreground">
            No reminders set.{" "}
            <button onClick={() => { setConfigOpen(true); setShowAddAlert(true) }} className="text-[#22C55E] font-bold hover:underline">
              Add one
            </button>
          </p>
        )}
      </div>

      {/* Heatmap */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2 text-[14px] font-bold text-foreground">
            <Calendar className="h-4 w-4 text-[#22C55E]" />
            Activity
          </h3>
          <div className="flex gap-1 rounded-lg bg-foreground/5 p-0.5">
            {([["3m", "3 Mo"], ["6m", "6 Mo"], ["1y", "Year"]] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setHeatmapRange(key)}
                className={`rounded-md px-2.5 py-1 text-[10px] font-bold transition-all ${
                  heatmapRange === key ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          {heatmapActivities.length > 0 && (
            <ActivityCalendar
              data={heatmapActivities}
              blockSize={12}
              blockMargin={3}
              blockRadius={3}
              fontSize={11}
              theme={{
                light: [
                  "#2A2A2C",
                  `${color}30`,
                  `${color}60`,
                  `${color}90`,
                  color,
                ],
                dark: [
                  "#2A2A2C",
                  `${color}30`,
                  `${color}60`,
                  `${color}90`,
                  color,
                ],
              }}
              labels={{ totalCount: "{{count}} entries in the last year" }}
            />
          )}
        </div>
      </div>

      {/* Trend Chart */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-bold text-foreground">Trend</h3>
          <div className="flex gap-0.5 rounded-lg bg-foreground/5 p-0.5 overflow-x-auto">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={`rounded-md px-2 py-1 text-[10px] font-bold whitespace-nowrap transition-all ${
                  range === r.key ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            {tracker.type === "BOOLEAN" ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2C" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#666" }} stroke="#2A2A2C" />
                <YAxis tick={{ fontSize: 11, fill: "#666" }} stroke="#2A2A2C" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1C1C1E",
                    border: "1px solid #2A2A2C",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2C" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#666" }} stroke="#2A2A2C" />
                <YAxis tick={{ fontSize: 11, fill: "#666" }} stroke="#2A2A2C" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1C1C1E",
                    border: "1px solid #2A2A2C",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#fff",
                  }}
                />
                <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ fill: color, r: 3 }} activeDot={{ r: 5 }} />
                {tracker.type === "DUAL_NUMERIC" && (
                  <Line type="monotone" dataKey="value2" stroke={`${color}80`} strokeWidth={2} strokeDasharray="5 5" dot={{ fill: `${color}80`, r: 3 }} />
                )}
              </LineChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground/70 text-sm">
            No data for this period
          </div>
        )}
      </div>
    </div>
  )
}
