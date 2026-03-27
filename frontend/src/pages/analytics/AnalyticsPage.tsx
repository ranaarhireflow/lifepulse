import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { format, subDays, getDay } from "date-fns"
import { BarChart3, Flame, Target, Loader2, ChevronRight, TrendingUp, Calendar, Award } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  fetchTrackers,
  fetchAnalytics,
  type Tracker,
  type TrackerAnalytics,
} from "@/services/trackers"

const RANGES: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 }
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function AnalyticsPage() {
  const navigate = useNavigate()
  const [trackers, setTrackers] = useState<Tracker[]>([])
  const [analyticsMap, setAnalyticsMap] = useState<Record<string, TrackerAnalytics>>({})
  const [range, setRange] = useState("30d")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const tracks = await fetchTrackers()
        setTrackers(tracks)
        const days = RANGES[range] || 30
        const to = format(new Date(), "yyyy-MM-dd")
        const from = format(subDays(new Date(), days), "yyyy-MM-dd")
        const results = await Promise.all(tracks.map((t) => fetchAnalytics(t.id, from, to).catch(() => null)))
        const map: Record<string, TrackerAnalytics> = {}
        results.forEach((r) => { if (r) map[r.tracker_id] = r })
        setAnalyticsMap(map)
      } catch { /* silent */ } finally { setLoading(false) }
    }
    load()
  }, [range])

  const allAnalytics = Object.values(analyticsMap)
  const avgCompletion = allAnalytics.length > 0
    ? Math.round(allAnalytics.reduce((s, a) => s + a.completion_rate, 0) / allAnalytics.length)
    : 0
  const bestStreak = allAnalytics.reduce((m, a) => Math.max(m, a.current_streak), 0)
  const totalEntries = allAnalytics.reduce((s, a) => s + a.total_entries, 0)

  // Cross-pulse insights
  const sortedByCompletion = [...allAnalytics].sort((a, b) => b.completion_rate - a.completion_rate)
  const mostConsistent = sortedByCompletion[0]
  const needsWork = sortedByCompletion[sortedByCompletion.length - 1]

  // Best day of week (from all data points)
  const dayCount: Record<number, number> = {}
  allAnalytics.forEach((a) => {
    a.data_points.forEach((dp) => {
      if (dp.value !== null) {
        const d = getDay(new Date(dp.date))
        dayCount[d] = (dayCount[d] || 0) + 1
      }
    })
  })
  const bestDayNum = Object.entries(dayCount).sort(([, a], [, b]) => b - a)[0]
  const bestDay = bestDayNum ? DAY_NAMES[parseInt(bestDayNum[0])] : null

  const findTracker = (id: string) => trackers.find((t) => t.id === id)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-extrabold tracking-tight">Analytics</h1>
          <p className="text-[12px] text-muted-foreground">Cross-pulse insights</p>
        </div>
        <Tabs value={range} onValueChange={(v) => v && setRange(v)}>
          <TabsList className="h-8 bg-secondary">
            <TabsTrigger value="7d" className="text-xs px-2.5 py-1">Week</TabsTrigger>
            <TabsTrigger value="30d" className="text-xs px-2.5 py-1">Month</TabsTrigger>
            <TabsTrigger value="90d" className="text-xs px-2.5 py-1">3 Months</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading && <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}

      {!loading && trackers.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <BarChart3 className="h-8 w-8 text-primary mb-3" />
          <h3 className="text-lg font-bold">No data yet</h3>
          <p className="text-sm text-muted-foreground">Start tracking to see insights.</p>
        </div>
      )}

      {!loading && trackers.length > 0 && (
        <>
          {/* Summary stats */}
          <div className="flex gap-2">
            {[
              { icon: Target, value: `${avgCompletion}%`, label: "Avg Completion", color: "#16A34A" },
              { icon: Flame, value: String(bestStreak), label: "Best Streak", color: "#D97706" },
              { icon: TrendingUp, value: String(totalEntries), label: "Total Entries", color: "#1A3526" },
            ].map((s) => (
              <div key={s.label} className="flex flex-1 items-center gap-3 rounded-xl border border-border bg-card p-3.5">
                <s.icon className="h-5 w-5 shrink-0" style={{ color: s.color }} />
                <div>
                  <p className="text-[18px] font-extrabold leading-none" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Cross-pulse insights */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-[11px] font-bold uppercase tracking-[1.5px] text-muted-foreground flex items-center gap-1.5 mb-3">
              <Award className="h-3.5 w-3.5 text-primary" /> Insights
            </h3>
            <div className="space-y-2.5">
              {mostConsistent && (
                <div className="flex items-center gap-3 rounded-lg bg-primary/5 border border-primary/10 px-3 py-2.5">
                  <span className="text-[16px]">{findTracker(mostConsistent.tracker_id)?.icon || "🏆"}</span>
                  <div className="flex-1">
                    <p className="text-[12px] font-bold">Most Consistent</p>
                    <p className="text-[10px] text-muted-foreground">{mostConsistent.tracker_name} — {mostConsistent.completion_rate}% completion</p>
                  </div>
                </div>
              )}
              {needsWork && needsWork !== mostConsistent && (
                <div className="flex items-center gap-3 rounded-lg bg-amber-500/5 border border-amber-500/10 px-3 py-2.5">
                  <span className="text-[16px]">{findTracker(needsWork.tracker_id)?.icon || "💪"}</span>
                  <div className="flex-1">
                    <p className="text-[12px] font-bold">Needs Attention</p>
                    <p className="text-[10px] text-muted-foreground">{needsWork.tracker_name} — {needsWork.completion_rate}% completion</p>
                  </div>
                </div>
              )}
              {bestDay && (
                <div className="flex items-center gap-3 rounded-lg bg-secondary px-3 py-2.5">
                  <Calendar className="h-4 w-4 text-primary" />
                  <div className="flex-1">
                    <p className="text-[12px] font-bold">Best Day</p>
                    <p className="text-[10px] text-muted-foreground">You log the most on <span className="font-bold text-foreground">{bestDay}s</span> ({bestDayNum?.[1]} entries)</p>
                  </div>
                </div>
              )}
              {bestStreak > 0 && (
                <div className="flex items-center gap-3 rounded-lg bg-secondary px-3 py-2.5">
                  <Flame className="h-4 w-4 text-amber-600" />
                  <div className="flex-1">
                    <p className="text-[12px] font-bold">Streak Leader</p>
                    <p className="text-[10px] text-muted-foreground">
                      {allAnalytics.reduce((best, a) => a.current_streak > best.current_streak ? a : best, allAnalytics[0]).tracker_name} has your longest active streak at {bestStreak} days
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Per Pulse breakdown */}
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[1.5px] text-muted-foreground mb-2.5">Per Pulse</h2>
            <div className="space-y-[6px]">
              {trackers.map((tracker) => {
                const a = analyticsMap[tracker.id]
                if (!a) return null

                return (
                  <div
                    key={tracker.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 cursor-pointer hover:border-primary/20 hover:shadow-sm transition-all"
                    onClick={() => navigate(`/trackers/${tracker.id}`)}
                  >
                    <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-accent text-lg">
                      {tracker.icon || "📊"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold truncate">{tracker.name}</p>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1">
                          <Flame className="h-3 w-3 text-amber-600" />
                          {a.current_streak}d
                        </span>
                        <span>{a.total_entries} entries</span>
                        {a.average !== null && <span>avg {a.average}{tracker.unit ? ` ${tracker.unit}` : ""}</span>}
                      </div>
                    </div>
                    {/* Completion bar */}
                    <div className="w-[60px] shrink-0">
                      <div className="flex items-center justify-between text-[9px] font-bold mb-0.5">
                        <span style={{ color: a.completion_rate >= 80 ? "#16A34A" : a.completion_rate >= 50 ? "#D97706" : "#EF4444" }}>
                          {Math.round(a.completion_rate)}%
                        </span>
                      </div>
                      <div className="h-[4px] w-full overflow-hidden rounded-full bg-border">
                        <div className="h-full rounded-full transition-all" style={{
                          width: `${a.completion_rate}%`,
                          backgroundColor: a.completion_rate >= 80 ? "#16A34A" : a.completion_rate >= 50 ? "#D97706" : "#EF4444",
                        }} />
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/25 shrink-0" />
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
