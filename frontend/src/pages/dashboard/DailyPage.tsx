import { useState, useEffect, useCallback } from "react"
import { format, subDays, addDays, isToday, isYesterday, startOfWeek } from "date-fns"
import { ChevronLeft, ChevronRight, Plus, Loader2, Sparkles, Trophy, Flame, Target, TrendingUp } from "lucide-react"
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

  useEffect(() => { loadData() }, [loadData])

  const handleUpdate = async (trackerId: string, updates: Partial<Entry>) => {
    setDailyData((prev) => {
      const updated = prev.map((item) => {
        if (item.tracker.id !== trackerId) return item
        return {
          ...item,
          entry: item.entry
            ? { ...item.entry, ...updates }
            : ({ id: "temp", tracker_id: trackerId, date: dateStr, value_numeric: null, value_numeric2: null, value_boolean: null, value_duration: null, value_time: null, value_text: null, note: null, ...updates } as Entry),
        }
      })
      const allDone = updated.every((d) => d.entry !== null)
      if (allDone && updated.length > 0 && !showCelebration) {
        setShowCelebration(true)
        setTimeout(() => setShowCelebration(false), 3000)
      }
      return updated
    })
    try { await upsertEntry(trackerId, dateStr, updates) } catch { loadData() }
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

  return (
    <div className="space-y-4">
      {/* Celebration */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} className="flex flex-col items-center gap-3 rounded-2xl bg-card p-8 shadow-2xl border">
              <Trophy className="h-14 w-14 text-amber-500" />
              <h2 className="text-xl font-extrabold">All Done!</h2>
              <p className="text-muted-foreground text-sm">Every pulse logged. Monk mode activated.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero row */}
      <div className="flex items-start justify-between">
        <div>
          {isToday(selectedDate) && <p className="text-[13px] text-muted-foreground">{getGreeting()}</p>}
          <h1 className="text-[26px] font-extrabold tracking-tight leading-tight">
            {isToday(selectedDate) ? "Today" : isYesterday(selectedDate) ? "Yesterday" : format(selectedDate, "EEEE")}
          </h1>
          <p className="text-[12px] text-muted-foreground">{format(selectedDate, "EEEE, MMMM d")}</p>
        </div>

        {/* Compact progress */}
        {!loading && totalTrackers > 0 && (
          <div className="flex items-center gap-3 rounded-xl bg-[#1A3526] px-4 py-2.5">
            <div className="relative h-[40px] w-[40px]">
              <svg viewBox="0 0 40 40" className="h-full w-full -rotate-90">
                <circle cx="20" cy="20" r="16" fill="none" stroke="#ffffff15" strokeWidth="4" />
                <circle cx="20" cy="20" r="16" fill="none" stroke="#22C55E" strokeWidth="4" strokeLinecap="round"
                  strokeDasharray="100.5" strokeDashoffset={100.5 - (100.5 * completionPct) / 100} />
              </svg>
            </div>
            <div>
              <div className="text-[18px] font-extrabold text-white leading-none">{completionPct}%</div>
              <div className="text-[9px] text-white/40 font-semibold">{completedTrackers}/{totalTrackers} logged</div>
            </div>
          </div>
        )}
      </div>

      {/* Week strip with arrows */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSelectedDate(d => subDays(d, 7))}
          disabled={subDays(selectedDate, 7) < maxPastDate}
          className="shrink-0 rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-20 transition-all"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex flex-1 gap-1.5">
          {weekDays.map((day) => {
            const isSelected = format(day, "yyyy-MM-dd") === dateStr
            const isPast = day <= today
            return (
              <button
                key={day.toISOString()}
                onClick={() => isPast && setSelectedDate(day)}
                disabled={!isPast || day < maxPastDate}
                className={`flex-1 rounded-xl border py-2 text-center transition-all ${
                  isSelected
                    ? "border-[#1A3526] bg-[#1A3526] text-white shadow-sm"
                    : isPast
                      ? "border-border bg-card hover:border-primary/30 cursor-pointer"
                      : "border-transparent bg-transparent opacity-30"
                }`}
              >
                <div className="text-[9px] font-bold uppercase tracking-wide opacity-50">{format(day, "EEE")}</div>
                <div className="text-[15px] font-extrabold mt-0.5">{format(day, "d")}</div>
              </button>
            )
          })}
        </div>
        <button
          onClick={() => setSelectedDate(d => addDays(d, 7))}
          disabled={!canGoForward}
          className="shrink-0 rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-20 transition-all"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Stats row — compact, branded */}
      {!loading && totalTrackers > 0 && (
        <div className="flex gap-2">
          {[
            { icon: Target, value: `${completedTrackers}/${totalTrackers}`, label: "Logged", color: "#1A3526" },
            { icon: Flame, value: "12", label: "Streak", color: "#D97706" },
            { icon: TrendingUp, value: "89%", label: "This Week", color: "#16A34A" },
          ].map((s) => (
            <div key={s.label} className="flex flex-1 items-center gap-2.5 rounded-xl border border-border bg-card p-3">
              <s.icon className="h-4 w-4 shrink-0" style={{ color: s.color }} />
              <div>
                <div className="text-[16px] font-extrabold leading-none" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[9px] text-muted-foreground font-semibold mt-0.5">{s.label}</div>
              </div>
            </div>
          ))}
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
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-[1.5px]">Your Pulses</span>
            <NavLink to="/trackers" className="text-[11px] font-bold text-primary">View All →</NavLink>
          </div>
          <div className="space-y-[6px]">
            {dailyData.map((item, i) => (
              <motion.div key={item.tracker.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <TrackerCard data={item} onUpdate={(updates) => handleUpdate(item.tracker.id, updates)} />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && dailyData.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-14 text-center">
          <Sparkles className="h-10 w-10 text-primary mb-4" />
          <h3 className="text-lg font-extrabold mb-1">Start Tracking</h3>
          <p className="mb-5 text-muted-foreground text-sm">Create your first pulse to begin monk mode.</p>
          <NavLink to="/trackers/new">
            <Button className="gap-2 rounded-xl px-6"><Plus className="h-4 w-4" />Create First Pulse</Button>
          </NavLink>
        </motion.div>
      )}
    </div>
  )
}
