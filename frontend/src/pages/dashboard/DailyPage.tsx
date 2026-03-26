import { useState, useEffect, useCallback, useMemo } from "react"
import { format, subDays, addDays, isToday, isYesterday, startOfWeek } from "date-fns"
import { ChevronLeft, ChevronRight, Plus, Loader2, Sparkles, Trophy, Flame, Target, TrendingUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { NavLink } from "react-router-dom"
import { useAuth } from "@/store/auth-context"
import { TrackerCard } from "@/components/trackers/TrackerCard"
import { fetchDailyEntries, upsertEntry, type DailyTrackerEntry, type Entry } from "@/services/trackers"

const MONK_QUOTES = [
  "The only way to do great work is to love what you do.",
  "Discipline is choosing between what you want now and what you want most.",
  "Small daily improvements over time lead to stunning results.",
  "The mind is everything. What you think, you become.",
  "Be the master of your habits, not the slave.",
  "Every morning you have two choices: continue to sleep with your dreams, or wake up and chase them.",
  "The path to monk mode begins with a single tracked day.",
  "Consistency is more important than perfection.",
  "Your habits shape your identity. Choose wisely.",
  "The strongest warriors are patient ones.",
]

export function DailyPage() {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [dailyData, setDailyData] = useState<DailyTrackerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"todo" | "done" | "skipped">("todo")
  const [showCelebration, setShowCelebration] = useState(false)

  const today = new Date()
  const maxPastDate = subDays(today, 5)
  const dateStr = format(selectedDate, "yyyy-MM-dd")
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const dailyQuote = useMemo(() => MONK_QUOTES[new Date().getDate() % MONK_QUOTES.length], [])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try { setDailyData(await fetchDailyEntries(dateStr)) } catch { setError("Failed to load pulses"); setDailyData([]) } finally { setLoading(false) }
  }, [dateStr])

  useEffect(() => { loadData() }, [loadData])

  const handleUpdate = async (trackerId: string, updates: Partial<Entry>) => {
    setDailyData((prev) => {
      const updated = prev.map((item) => {
        if (item.tracker.id !== trackerId) return item
        return { ...item, entry: item.entry ? { ...item.entry, ...updates } : ({ id: "temp", tracker_id: trackerId, date: dateStr, value_numeric: null, value_numeric2: null, value_boolean: null, value_duration: null, value_time: null, value_text: null, note: null, ...updates } as Entry) }
      })
      if (updated.every((d) => d.entry !== null) && updated.length > 0 && !showCelebration) {
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

  const todoItems = dailyData.filter((d) => d.entry === null)
  const doneItems = dailyData.filter((d) => d.entry !== null)

  const getGreeting = () => {
    const hour = new Date().getHours()
    const name = user?.display_name?.split(" ")[0] || ""
    const prefix = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"
    return `${prefix}${name ? `, ${name}` : ""}`
  }

  return (
    <div className="space-y-5">
      {/* Celebration */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} className="flex flex-col items-center gap-3 rounded-2xl bg-card p-8 shadow-2xl border border-primary/20">
              <Trophy className="h-14 w-14 text-amber-400" />
              <h2 className="text-xl font-extrabold text-white">All Pulses Logged!</h2>
              <p className="text-muted-foreground text-sm">Monk mode activated. XP gained.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily Quote */}
      <div className="rounded-xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/10 px-4 py-3">
        <p className="text-[12px] text-primary/70 italic">"{dailyQuote}"</p>
      </div>

      {/* Hero */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] text-muted-foreground">{getGreeting()}</p>
          <h1 className="text-[28px] font-extrabold tracking-tight text-white leading-tight">
            {isToday(selectedDate) ? "Today" : isYesterday(selectedDate) ? "Yesterday" : format(selectedDate, "EEEE")}
          </h1>
          <p className="text-[12px] text-muted-foreground">{format(selectedDate, "MMMM d, yyyy")}</p>
        </div>
        {!loading && totalTrackers > 0 && (
          <div className="flex items-center gap-3 rounded-xl bg-primary/10 border border-primary/20 px-4 py-2.5">
            <div className="relative h-[40px] w-[40px]">
              <svg viewBox="0 0 40 40" className="h-full w-full -rotate-90">
                <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
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

      {/* Week strip */}
      <div className="flex items-center gap-2">
        <button onClick={() => setSelectedDate(d => subDays(d, 7))} disabled={subDays(selectedDate, 7) < maxPastDate}
          className="shrink-0 rounded-lg p-1 text-muted-foreground hover:text-white disabled:opacity-20 transition-all"><ChevronLeft className="h-4 w-4" /></button>
        <div className="flex flex-1 gap-1.5">
          {weekDays.map((day) => {
            const isSelected = format(day, "yyyy-MM-dd") === dateStr
            const isPast = day <= today
            return (
              <button key={day.toISOString()} onClick={() => isPast && setSelectedDate(day)} disabled={!isPast || day < maxPastDate}
                className={`flex-1 rounded-xl border py-2 text-center transition-all ${isSelected ? "border-primary bg-primary/20 text-white" : isPast ? "border-border bg-card hover:border-primary/30 cursor-pointer" : "border-transparent opacity-20"}`}>
                <div className="text-[9px] font-bold uppercase tracking-wide opacity-50">{format(day, "EEE")}</div>
                <div className="text-[15px] font-extrabold mt-0.5">{format(day, "d")}</div>
              </button>
            )
          })}
        </div>
        <button onClick={() => setSelectedDate(d => addDays(d, 7))} disabled={!isToday(selectedDate) ? false : true}
          className="shrink-0 rounded-lg p-1 text-muted-foreground hover:text-white disabled:opacity-20 transition-all"><ChevronRight className="h-4 w-4" /></button>
      </div>

      {/* To-do / Done tabs */}
      {!loading && totalTrackers > 0 && (
        <div className="flex gap-2">
          {([
            { key: "todo" as const, label: "To-do", count: todoItems.length },
            { key: "done" as const, label: "Done", count: doneItems.length },
          ]).map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-bold transition-all ${
                activeTab === tab.key ? "bg-card border border-primary/20 text-white" : "text-muted-foreground hover:text-white"
              }`}>
              {tab.label}
              <span className={`text-[11px] rounded-full px-1.5 py-0.5 ${activeTab === tab.key ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && <div className="flex items-center justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5 text-center">
          <p className="text-sm text-destructive font-medium">{error}</p>
          <Button variant="ghost" size="sm" className="mt-2" onClick={loadData}>Try Again</Button>
        </div>
      )}

      {/* Pulse cards */}
      {!loading && !error && dailyData.length > 0 && (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {(activeTab === "todo" ? todoItems : doneItems).map((item, i) => (
              <motion.div key={item.tracker.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ delay: i * 0.04 }}>
                <TrackerCard data={item} onUpdate={(updates) => handleUpdate(item.tracker.id, updates)} />
              </motion.div>
            ))}
          </AnimatePresence>
          {(activeTab === "todo" ? todoItems : doneItems).length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {activeTab === "todo" ? "All pulses logged! 🎉" : "Nothing logged yet today."}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && dailyData.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-14 text-center">
          <Sparkles className="h-10 w-10 text-primary mb-4" />
          <h3 className="text-lg font-extrabold text-white mb-1">Begin Your Journey</h3>
          <p className="mb-5 text-muted-foreground text-sm max-w-xs">Take the monk quiz to discover your personalized plan, or create pulses manually.</p>
          <div className="flex gap-3">
            <NavLink to="/quiz"><Button className="gap-2 rounded-xl px-6"><Sparkles className="h-4 w-4" />Take the Quiz</Button></NavLink>
            <NavLink to="/trackers/new"><Button variant="outline" className="gap-2 rounded-xl px-6"><Plus className="h-4 w-4" />Create Manually</Button></NavLink>
          </div>
        </motion.div>
      )}
    </div>
  )
}
