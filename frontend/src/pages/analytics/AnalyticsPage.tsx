import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { format, subDays } from "date-fns"
import { BarChart3, Flame, Target, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"
import {
  fetchTrackers,
  fetchAnalytics,
  type Tracker,
  type TrackerAnalytics,
} from "@/services/trackers"

const RANGES: Record<string, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
}

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

        const results = await Promise.all(
          tracks.map((t) => fetchAnalytics(t.id, from, to).catch(() => null))
        )

        const map: Record<string, TrackerAnalytics> = {}
        results.forEach((r) => {
          if (r) map[r.tracker_id] = r
        })
        setAnalyticsMap(map)
      } catch {
        // Silently fail
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [range])

  // Overall stats
  const allAnalytics = Object.values(analyticsMap)
  const avgCompletion =
    allAnalytics.length > 0
      ? Math.round(
          allAnalytics.reduce((sum, a) => sum + a.completion_rate, 0) /
            allAnalytics.length
        )
      : 0
  const bestStreak = allAnalytics.reduce(
    (max, a) => Math.max(max, a.current_streak),
    0
  )
  const totalEntries = allAnalytics.reduce(
    (sum, a) => sum + a.total_entries,
    0
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Your tracking insights
          </p>
        </div>
        <Tabs value={range} onValueChange={setRange}>
          <TabsList className="h-8">
            <TabsTrigger value="7d" className="text-xs px-2.5 py-1">
              Week
            </TabsTrigger>
            <TabsTrigger value="30d" className="text-xs px-2.5 py-1">
              Month
            </TabsTrigger>
            <TabsTrigger value="90d" className="text-xs px-2.5 py-1">
              3 Months
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && trackers.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <BarChart3 className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold">No data yet</h3>
          <p className="text-sm text-muted-foreground">
            Start tracking to see analytics here.
          </p>
        </div>
      )}

      {!loading && trackers.length > 0 && (
        <>
          {/* Overall summary */}
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="flex flex-col items-center p-4">
                <div className="mb-2 h-16 w-16">
                  <CircularProgressbar
                    value={avgCompletion}
                    text={`${avgCompletion}%`}
                    styles={buildStyles({
                      textSize: "24px",
                      textColor: "var(--foreground)",
                      pathColor: "oklch(0.488 0.243 264.376)",
                      trailColor: "var(--border)",
                    })}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Avg Completion</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center p-4">
                <div className="mb-2 flex h-16 w-16 items-center justify-center">
                  <Flame className="h-8 w-8 text-orange-500" />
                </div>
                <p className="text-2xl font-bold">{bestStreak}</p>
                <p className="text-xs text-muted-foreground">Best Streak</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center p-4">
                <div className="mb-2 flex h-16 w-16 items-center justify-center">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <p className="text-2xl font-bold">{totalEntries}</p>
                <p className="text-xs text-muted-foreground">Total Entries</p>
              </CardContent>
            </Card>
          </div>

          {/* Per-tracker summary */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Per Tracker
            </h2>
            {trackers.map((tracker) => {
              const a = analyticsMap[tracker.id]
              if (!a) return null
              const color = tracker.color || "#6366f1"

              return (
                <Card
                  key={tracker.id}
                  className="cursor-pointer transition-shadow hover:shadow-md"
                  onClick={() => navigate(`/trackers/${tracker.id}`)}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
                      style={{ backgroundColor: `${color}12` }}
                    >
                      {tracker.icon || "📊"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{tracker.name}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Flame className="h-3 w-3" style={{ color }} />
                          {a.current_streak} streak
                        </span>
                        <span>{a.total_entries} entries</span>
                        {a.average !== null && (
                          <span>
                            avg {a.average}
                            {tracker.unit ? ` ${tracker.unit}` : ""}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="h-10 w-10 shrink-0">
                      <CircularProgressbar
                        value={a.completion_rate}
                        text={`${Math.round(a.completion_rate)}%`}
                        styles={buildStyles({
                          textSize: "28px",
                          textColor: "var(--foreground)",
                          pathColor: color,
                          trailColor: "var(--border)",
                        })}
                      />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
