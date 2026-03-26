import { useState, useEffect, useMemo, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { format, subDays, startOfYear, subYears } from "date-fns"
import {
  ArrowLeft,
  Flame,
  Target,
  TrendingUp,
  Calendar,
  Hash,
  Loader2,
  Bell,
  Settings2,
  Trash2,
  Pencil,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConfigDrawer } from "@/components/common/ConfigDrawer"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import api from "@/services/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import {
  fetchTracker,
  fetchAnalytics,
  fetchHeatmap,
  type Tracker,
  type TrackerAnalytics,
  type HeatmapData,
} from "@/services/trackers"

const RANGES = [
  { key: "7d", label: "Week", days: 7 },
  { key: "30d", label: "Month", days: 30 },
  { key: "90d", label: "3 Months", days: 90 },
  { key: "180d", label: "6 Months", days: 180 },
  { key: "ytd", label: "YTD", days: 0 },
  { key: "1y", label: "Year", days: 365 },
  { key: "all", label: "All", days: 9999 },
]

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

export function TrackerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [tracker, setTracker] = useState<Tracker | null>(null)
  const [analytics, setAnalytics] = useState<TrackerAnalytics | null>(null)
  const [heatmap, setHeatmap] = useState<HeatmapData | null>(null)
  const [range, setRange] = useState("30d")
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

  const startEdit = (alert: { id: string; alert_time: string; label: string | null; alert_days: number[] }) => {
    setEditingAlertId(alert.id)
    setEditTime(alert.alert_time)
    setEditLabel(alert.label || "")
    setEditDays(alert.alert_days || [1,2,3,4,5,6,7])
  }

  const saveEdit = async () => {
    if (!editingAlertId || !tracker) return
    try {
      // Delete old + create new (no PATCH endpoint)
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

  useEffect(() => {
    if (!id) return
    setLoading(true)
    const { from, to } = getDateRange(range)

    Promise.all([
      fetchTracker(id),
      fetchAnalytics(id, from, to),
      fetchHeatmap(id, format(subYears(new Date(), 1), "yyyy-MM-dd"), format(new Date(), "yyyy-MM-dd")),
    ])
      .then(([t, a, h]) => {
        setTracker(t)
        setAnalytics(a)
        setHeatmap(h)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id, range])

  const color = tracker?.color || "#16A34A"

  // Transform heatmap data for react-activity-calendar
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

  // Chart data
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
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
            style={{ backgroundColor: `${color}15` }}
          >
            {tracker.icon || "📊"}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{tracker.name}</h1>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">
                {tracker.type}
              </Badge>
              {tracker.unit && (
                <span className="text-sm text-muted-foreground">{tracker.unit}</span>
              )}
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setConfigOpen(true)} className="gap-1.5 text-xs">
          <Settings2 className="h-3.5 w-3.5" /> Configure
        </Button>
      </div>

      {/* Config drawer */}
      <ConfigDrawer open={configOpen} onClose={() => { setConfigOpen(false); setShowAddAlert(false) }} title={tracker.name} description="Manage alerts and pulse settings">
        <div className="space-y-5">
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
                      setNewAlertDays([1,2,3,4,5,6,7])
                      // Refresh tracker data
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
                      /* Edit mode */
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
                      /* View mode */
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-[20px] font-extrabold tracking-tight">{alert.alert_time}</div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => startEdit(alert)}
                              className="rounded-lg p-1 text-muted-foreground/40 hover:text-primary hover:bg-primary/10 transition-all"
                              title="Edit reminder"
                            >
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
                            const active = (alert.alert_days || [1,2,3,4,5,6,7]).includes(i + 1)
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

          {/* Separator */}
          <div className="border-t border-border" />

          {/* Details */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[1.5px] text-muted-foreground flex items-center gap-1.5 mb-3">
              <Settings2 className="h-3.5 w-3.5 text-primary" /> Details
            </h3>
            <div className="space-y-2.5">
              {[
                { label: "Type", value: { NUMERIC: "Number", DUAL_NUMERIC: "Dual Number", BOOLEAN: "Yes / No", DURATION: "Duration", TIME: "Time", TEXT: "Notes" }[tracker.type] || tracker.type },
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
        </div>
      </ConfigDrawer>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { icon: Flame, label: "Current Streak", value: String(analytics.current_streak), sub: `Best: ${analytics.longest_streak}` },
          { icon: Target, label: "Completion", value: `${analytics.completion_rate}%`, sub: `${analytics.total_entries} entries` },
          { icon: TrendingUp, label: "Average", value: analytics.average !== null ? String(analytics.average) : "—", sub: analytics.min_value !== null ? `${analytics.min_value} – ${analytics.max_value}` : "" },
          { icon: Hash, label: "Total Entries", value: String(analytics.total_entries), sub: "" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-3.5">
            <div className="flex items-center gap-1.5 mb-2">
              <s.icon className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-semibold text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-[22px] font-extrabold text-[#1A3526] dark:text-foreground leading-none">{s.value}</p>
            {s.sub && <p className="text-[10px] text-muted-foreground mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* GitHub-style heatmap */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4" />
            Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {heatmapActivities.length > 0 && (
            <ActivityCalendar
              data={heatmapActivities}
              blockSize={12}
              blockMargin={3}
              blockRadius={3}
              fontSize={11}
              theme={{
                light: [
                  "var(--border)",
                  `${color}30`,
                  `${color}60`,
                  `${color}90`,
                  color,
                ],
                dark: [
                  "var(--border)",
                  `${color}30`,
                  `${color}60`,
                  `${color}90`,
                  color,
                ],
              }}
              labels={{
                totalCount: "{{count}} entries in the last year",
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Date range selector + Chart */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Trend</CardTitle>
            <Tabs value={range} onValueChange={setRange}>
              <TabsList className="h-8">
                {RANGES.map((r) => (
                  <TabsTrigger
                    key={r.key}
                    value={r.key}
                    className="text-xs px-2 py-1"
                  >
                    {r.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              {tracker.type === "BOOLEAN" ? (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    stroke="var(--muted-foreground)"
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    stroke="var(--muted-foreground)"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    stroke="var(--muted-foreground)"
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    stroke="var(--muted-foreground)"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    strokeWidth={2}
                    dot={{ fill: color, r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  {tracker.type === "DUAL_NUMERIC" && (
                    <Line
                      type="monotone"
                      dataKey="value2"
                      stroke={`${color}80`}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: `${color}80`, r: 3 }}
                    />
                  )}
                </LineChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
              No data for this period
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
