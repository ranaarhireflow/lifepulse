import { useState, useEffect, useCallback } from "react"
import { format, subDays, addDays, isToday, isYesterday } from "date-fns"
import { ChevronLeft, ChevronRight, Plus, Loader2, Sparkles, Flame, Trophy } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { NavLink } from "react-router-dom"
import { TrackerCard } from "@/components/trackers/TrackerCard"
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
  const [showCelebration, setShowCelebration] = useState(false)

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
    } catch {
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
    setDailyData((prev) => {
      const updated = prev.map((item) => {
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

      // Check if all trackers now have entries → celebration
      const allDone = updated.every((d) => d.entry !== null)
      if (allDone && updated.length > 0 && !showCelebration) {
        setShowCelebration(true)
        setTimeout(() => setShowCelebration(false), 3000)
      }

      return updated
    })

    try {
      await upsertEntry(trackerId, dateStr, updates)
    } catch {
      loadData()
    }
  }

  const totalTrackers = dailyData.length
  const completedTrackers = dailyData.filter((d) => d.entry !== null).length
  const completionPct = totalTrackers > 0 ? Math.round((completedTrackers / totalTrackers) * 100) : 0

  const getDateLabel = () => {
    if (isToday(selectedDate)) return "Today"
    if (isYesterday(selectedDate)) return "Yesterday"
    return format(selectedDate, "EEEE")
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  return (
    <div className="space-y-6">
      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="flex flex-col items-center gap-3 rounded-3xl bg-card p-8 shadow-2xl border"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6 }}
              >
                <Trophy className="h-16 w-16 text-yellow-500" />
              </motion.div>
              <h2 className="text-2xl font-bold">All Done!</h2>
              <p className="text-muted-foreground">You've logged everything today. Keep it up!</p>
              <div className="flex gap-1 text-2xl">
                {"🎉🔥💪✨🎯".split("").map((e, i) => (
                  <motion.span
                    key={i}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {e}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {isToday(selectedDate) && (
            <p className="text-sm text-muted-foreground mb-0.5">{getGreeting()} 👋</p>
          )}
          <h1 className="text-2xl font-bold tracking-tight">{getDateLabel()}</h1>
          <p className="text-sm text-muted-foreground">
            {format(selectedDate, "MMMM d, yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedDate((d) => subDays(d, 1))}
            disabled={!canGoBack}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedDate(today)}
            disabled={isToday(selectedDate)}
            className="text-xs h-8"
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedDate((d) => addDays(d, 1))}
            disabled={!canGoForward}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      {!loading && totalTrackers > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {completionPct === 100 ? (
                <span className="flex items-center gap-1.5 font-semibold text-green-600 dark:text-green-400">
                  <Sparkles className="h-4 w-4" />
                  All done!
                </span>
              ) : (
                <span className="text-muted-foreground">
                  {completedTrackers} of {totalTrackers} logged
                </span>
              )}
            </div>
            <span className="font-bold text-lg tabular-nums" style={{ color: completionPct === 100 ? "#22c55e" : "var(--primary)" }}>
              {completionPct}%
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: completionPct === 100
                  ? "linear-gradient(90deg, #22c55e, #16a34a)"
                  : "linear-gradient(90deg, oklch(0.488 0.243 264.376), oklch(0.6 0.22 280))",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${completionPct}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading your trackers...</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-destructive/20 bg-destructive/5 p-5 text-center"
        >
          <p className="text-sm text-destructive font-medium">{error}</p>
          <Button variant="ghost" size="sm" className="mt-2" onClick={loadData}>
            Try Again
          </Button>
        </motion.div>
      )}

      {/* Tracker cards */}
      {!loading && !error && dailyData.length > 0 && (
        <div className="space-y-3">
          {dailyData.map((item, i) => (
            <motion.div
              key={item.tracker.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <TrackerCard
                data={item}
                onUpdate={(updates) => handleUpdate(item.tracker.id, updates)}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && dailyData.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-gradient-to-b from-accent/30 to-accent/10 p-16 text-center"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary"
          >
            <Plus className="h-10 w-10" />
          </motion.div>
          <h3 className="text-xl font-bold mb-2">Start Tracking</h3>
          <p className="mb-6 text-muted-foreground max-w-sm">
            Create your first tracker to start building habits and seeing your progress over time.
          </p>
          <NavLink to="/trackers/new">
            <Button size="lg" className="gap-2 rounded-xl px-8 shadow-lg shadow-primary/20">
              <Plus className="h-5 w-5" />
              Create Your First Tracker
            </Button>
          </NavLink>
        </motion.div>
      )}
    </div>
  )
}
