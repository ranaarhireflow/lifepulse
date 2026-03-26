import { useState, useEffect, useCallback } from "react"
import { format, subDays, addDays, isToday } from "date-fns"
import { ChevronLeft, ChevronRight, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NavLink } from "react-router-dom"
import { TrackerCard } from "@/components/trackers/TrackerCard"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"
import {
  fetchDailyEntries,
  upsertEntry,
  type DailyTrackerEntry,
  type Entry,
} from "@/services/trackers"

export function DailyPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [dailyData, setDailyData] = useState<DailyTrackerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const today = new Date()
  const maxPastDate = subDays(today, 5)
  const canGoBack = selectedDate > maxPastDate
  const canGoForward = !isToday(selectedDate)
  const dateStr = format(selectedDate, "yyyy-MM-dd")

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchDailyEntries(dateStr)
      setDailyData(data)
    } catch (err) {
      setError("Failed to load trackers")
      setDailyData([])
    } finally {
      setLoading(false)
    }
  }, [dateStr])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleUpdate = async (trackerId: string, updates: Partial<Entry>) => {
    // Optimistic update
    setDailyData((prev) =>
      prev.map((item) => {
        if (item.tracker.id !== trackerId) return item
        return {
          ...item,
          entry: item.entry
            ? { ...item.entry, ...updates }
            : ({
                id: "temp",
                tracker_id: trackerId,
                date: dateStr,
                value_numeric: null,
                value_numeric2: null,
                value_boolean: null,
                value_duration: null,
                value_time: null,
                value_text: null,
                note: null,
                ...updates,
              } as Entry),
        }
      })
    )

    try {
      await upsertEntry(trackerId, dateStr, updates)
    } catch {
      // Revert on failure
      loadData()
    }
  }

  // Calculate completion
  const totalTrackers = dailyData.length
  const completedTrackers = dailyData.filter((d) => d.entry !== null).length
  const completionPct =
    totalTrackers > 0 ? Math.round((completedTrackers / totalTrackers) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header with date nav + progress ring */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Progress ring */}
          {totalTrackers > 0 && (
            <div className="h-14 w-14 shrink-0">
              <CircularProgressbar
                value={completionPct}
                text={`${completedTrackers}/${totalTrackers}`}
                styles={buildStyles({
                  textSize: "24px",
                  textColor: "var(--foreground)",
                  pathColor: "oklch(0.488 0.243 264.376)",
                  trailColor: "var(--border)",
                })}
              />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">
              {isToday(selectedDate) ? "Today" : format(selectedDate, "EEEE")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {format(selectedDate, "MMMM d, yyyy")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedDate((d) => subDays(d, 1))}
            disabled={!canGoBack}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedDate(today)}
            disabled={isToday(selectedDate)}
            className="text-xs"
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedDate((d) => addDays(d, 1))}
            disabled={!canGoForward}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-center text-sm text-destructive">
          {error}
          <Button
            variant="ghost"
            size="sm"
            className="ml-2"
            onClick={loadData}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Tracker cards */}
      {!loading && !error && dailyData.length > 0 && (
        <div className="space-y-3">
          {dailyData.map((item) => (
            <TrackerCard
              key={item.tracker.id}
              data={item}
              onUpdate={(updates) => handleUpdate(item.tracker.id, updates)}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && dailyData.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <Plus className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold">No trackers yet</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Create your first tracker to start logging daily.
          </p>
          <NavLink to="/trackers/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Tracker
            </Button>
          </NavLink>
        </div>
      )}
    </div>
  )
}
