import { useState, useEffect, useMemo } from "react"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
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

  const color = tracker?.color || "#6366f1"

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
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Flame className="h-4 w-4" style={{ color }} />
              <span className="text-xs">Current Streak</span>
            </div>
            <p className="text-2xl font-bold">{analytics.current_streak}</p>
            <p className="text-xs text-muted-foreground">
              Best: {analytics.longest_streak}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Target className="h-4 w-4" style={{ color }} />
              <span className="text-xs">Completion</span>
            </div>
            <p className="text-2xl font-bold">{analytics.completion_rate}%</p>
            <p className="text-xs text-muted-foreground">
              {analytics.total_entries} entries
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" style={{ color }} />
              <span className="text-xs">Average</span>
            </div>
            <p className="text-2xl font-bold">
              {analytics.average !== null ? analytics.average : "—"}
            </p>
            <p className="text-xs text-muted-foreground">
              {analytics.min_value !== null
                ? `${analytics.min_value} – ${analytics.max_value}`
                : "No data"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Hash className="h-4 w-4" style={{ color }} />
              <span className="text-xs">Total Entries</span>
            </div>
            <p className="text-2xl font-bold">{analytics.total_entries}</p>
          </CardContent>
        </Card>
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
