import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { format, subDays } from "date-fns"
import { BarChart3, Flame, Target, Loader2, ChevronRight } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  fetchTrackers,
  fetchAnalytics,
  type Tracker,
  type TrackerAnalytics,
} from "@/services/trackers"

const RANGES: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 }

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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-extrabold tracking-tight">Analytics</h1>
          <p className="text-[12px] text-muted-foreground">Your tracking insights</p>
        </div>
        <Tabs value={range} onValueChange={(v) => v && setRange(v)}>
          <TabsList className="h-8 bg-secondary">
            <TabsTrigger value="7d" className="text-xs px-2.5 py-1">Week</TabsTrigger>
            <TabsTrigger value="30d" className="text-xs px-2.5 py-1">Month</TabsTrigger>
            <TabsTrigger value="90d" className="text-xs px-2.5 py-1">3 Mo</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading && <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}

      {!loading && trackers.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <BarChart3 className="h-8 w-8 text-primary mb-3" />
          <h3 className="text-lg font-bold">No data yet</h3>
          <p className="text-sm text-muted-foreground">Start tracking to see analytics.</p>
        </div>
      )}

      {!loading && trackers.length > 0 && (
        <>
          {/* Summary — 3 stat cards */}
          <div className="flex gap-2">
            <div className="flex-1 rounded-xl border border-border bg-card p-4 text-center">
              <div className="mx-auto mb-2 relative h-[52px] w-[52px]">
                <svg viewBox="0 0 52 52" className="h-full w-full -rotate-90">
                  <circle cx="26" cy="26" r="22" fill="none" stroke="var(--border)" strokeWidth="5" />
                  <circle cx="26" cy="26" r="22" fill="none" stroke="#16A34A" strokeWidth="5" strokeLinecap="round"
                    strokeDasharray="138.2" strokeDashoffset={138.2 - (138.2 * avgCompletion) / 100} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[13px] font-extrabold">{avgCompletion}%</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground font-semibold">Avg Completion</p>
            </div>
            <div className="flex-1 rounded-xl border border-border bg-card p-4 text-center">
              <div className="flex items-center justify-center h-[52px] mb-2">
                <Flame className="h-7 w-7 text-amber-600" />
              </div>
              <p className="text-[20px] font-extrabold text-[#1A3526]">{bestStreak}</p>
              <p className="text-[10px] text-muted-foreground font-semibold">Best Streak</p>
            </div>
            <div className="flex-1 rounded-xl border border-border bg-card p-4 text-center">
              <div className="flex items-center justify-center h-[52px] mb-2">
                <Target className="h-7 w-7 text-primary" />
              </div>
              <p className="text-[20px] font-extrabold text-[#1A3526]">{totalEntries}</p>
              <p className="text-[10px] text-muted-foreground font-semibold">Total Entries</p>
            </div>
          </div>

          {/* Per Pulse */}
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
                          {a.current_streak} streak
                        </span>
                        <span>{a.total_entries} entries</span>
                        {a.average !== null && <span>avg {a.average}{tracker.unit ? ` ${tracker.unit}` : ""}</span>}
                      </div>
                    </div>
                    {/* Mini progress ring */}
                    <div className="relative h-[36px] w-[36px] shrink-0">
                      <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="var(--border)" strokeWidth="3.5" />
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#16A34A" strokeWidth="3.5" strokeLinecap="round"
                          strokeDasharray="88" strokeDashoffset={88 - (88 * a.completion_rate) / 100} />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[9px] font-extrabold">{Math.round(a.completion_rate)}%</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/30 shrink-0" />
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
