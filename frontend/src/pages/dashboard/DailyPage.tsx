import { useState, useEffect, useCallback } from "react"
import { format, subDays, addDays, isToday, isYesterday, startOfWeek, addWeeks } from "date-fns"
import { ChevronLeft, ChevronRight, Plus, Loader2, Sparkles, Trophy } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { NavLink } from "react-router-dom"
import { useAuth } from "@/store/auth-context"
import { TrackerCard } from "@/components/trackers/TrackerCard"
import {
  fetchDailyEntries,
  upsertEntry,
  type DailyTrackerEntry,
  type Entry,
} from "@/services/trackers"

export function DailyPage() {
  const { user } = useAuth()
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

  // Week days for the strip
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchDailyEntries(dateStr)
      setDailyData(data)
    } catch {
      setError("Failed to load pulses")
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

  const getGreeting = () => {
    const hour = new Date().getHours()
    const name = user?.display_name?.split(" ")[0] || ""
    const prefix = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"
    return `${prefix}${name ? `, ${name}` : ""} 👋`
  }

  const getDateLabel = () => {
    if (isToday(selectedDate)) return "Today"
    if (isYesterday(selectedDate)) return "Yesterday"
    return format(selectedDate, "EEEE")
  }

  return (
    <div className="space-y-5">
      {/* Celebration */}
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
              className="flex flex-col items-center gap-3 rounded-2xl bg-card p-8 shadow-2xl border"
            >
              <motion.div animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] }} transition={{ duration: 0.6 }}>
                <Trophy className="h-14 w-14 text-amber-500" />
              </motion.div>
              <h2 className="text-xl font-extrabold">All Done!</h2>
              <p className="text-muted-foreground text-sm">Every pulse logged. Keep the streak alive!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <div className="flex items-center justify-between">
        <div>
          {isToday(selectedDate) && <p className="text-[13px] text-muted-foreground">{getGreeting()}</p>}
          <h1 className="text-[28px] font-extrabold tracking-tight">{getDateLabel()}</h1>
          <p className="text-xs text-muted-foreground">{format(selectedDate, "EEEE, MMMM d")}</p>
        </div>
        {/* Progress ring */}
        {!loading && totalTrackers > 0 && (
          <div className="relative h-[86px] w-[86px] shrink-0">
            <svg viewBox="0 0 86 86" className="h-full w-full -rotate-90">
              <circle cx="43" cy="43" r="33" fill="none" stroke="var(--border)" strokeWidth="7" />
              <motion.circle
                cx="43" cy="43" r="33" fill="none"
                stroke={completionPct === 100 ? "#22C55E" : "#16A34A"}
                strokeWidth="7" strokeLinecap="round"
                strokeDasharray="207"
                initial={{ strokeDashoffset: 207 }}
                animate={{ strokeDashoffset: 207 - (207 * completionPct) / 100 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[19px] font-extrabold">{completionPct}%</span>
              <span className="text-[8px] font-bold text-muted-foreground tracking-widest">DONE</span>
            </div>
          </div>
        )}
      </div>

      {/* Week strip */}
      <div className="flex gap-1.5">
        {weekDays.map((day) => {
          const isSelected = format(day, "yyyy-MM-dd") === dateStr
          const isTodayDay = isToday(day)
          const isPast = day <= today
          return (
            <button
              key={day.toISOString()}
              onClick={() => isPast && setSelectedDate(day)}
              disabled={!isPast || day < maxPastDate}
              className={`flex-1 rounded-xl border py-2 text-center transition-all ${
                isSelected
                  ? "border-[#1A3526] bg-[#1A3526] text-white"
                  : isPast
                    ? "border-border bg-card hover:border-primary/40 cursor-pointer"
                    : "border-border bg-card opacity-40"
              }`}
            >
              <div className="text-[9px] font-bold uppercase tracking-wide opacity-50">
                {format(day, "EEE")}
              </div>
              <div className="text-[15px] font-extrabold mt-0.5">{format(day, "d")}</div>
            </button>
          )
        })}
      </div>

      {/* Stats row */}
      {!loading && totalTrackers > 0 && (
        <div className="flex gap-2">
          <div className="flex-1 rounded-xl border border-border bg-card p-3">
            <div className="text-[18px] font-extrabold text-[#1A3526] dark:text-primary">
              {completedTrackers}/{totalTrackers}
            </div>
            <div className="text-[10px] text-muted-foreground font-semibold">Logged</div>
          </div>
          <div className="flex-1 rounded-xl border border-border bg-card p-3">
            <div className="text-[18px] font-extrabold text-amber-600">12 🔥</div>
            <div className="text-[10px] text-muted-foreground font-semibold">Streak</div>
          </div>
          <div className="flex-1 rounded-xl border border-border bg-card p-3">
            <div className="text-[18px] font-extrabold text-primary">89%</div>
            <div className="text-[10px] text-muted-foreground font-semibold">This Week</div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5 text-center">
          <p className="text-sm text-destructive font-medium">{error}</p>
          <Button variant="ghost" size="sm" className="mt-2" onClick={loadData}>Try Again</Button>
        </div>
      )}

      {/* Pulse cards */}
      {!loading && !error && dailyData.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-[1.5px]">Your Pulses</span>
            <NavLink to="/trackers" className="text-[11px] font-bold text-primary">View All →</NavLink>
          </div>
          <div className="space-y-[6px]">
            {dailyData.map((item, i) => (
              <motion.div
                key={item.tracker.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
              >
                <TrackerCard
                  data={item}
                  onUpdate={(updates) => handleUpdate(item.tracker.id, updates)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && dailyData.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-16 text-center"
        >
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-extrabold mb-1">Start Tracking</h3>
          <p className="mb-5 text-muted-foreground text-sm max-w-xs">
            Create your first pulse to begin your journey to monk mode.
          </p>
          <NavLink to="/trackers/new">
            <Button className="gap-2 rounded-xl px-6">
              <Plus className="h-4 w-4" />
              Create Your First Pulse
            </Button>
          </NavLink>
        </motion.div>
      )}
    </div>
  )
}
