import { useState, useEffect, useCallback, useMemo } from "react"
import { format, subDays, addDays, isToday, isYesterday, startOfWeek } from "date-fns"
import { ChevronLeft, ChevronRight, Plus, Loader2, Sparkles, Trophy, Flame } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { NavLink } from "react-router-dom"
import { useAuth } from "@/store/auth-context"
import { TrackerCard } from "@/components/trackers/TrackerCard"
import { LevelBar } from "@/components/gamification/LevelBar"
import { fetchDailyEntries, upsertEntry, type DailyTrackerEntry, type Entry } from "@/services/trackers"

const QUOTES = [
  "The only way to do great work is to love what you do.",
  "Discipline is choosing between what you want now and what you want most.",
  "Small daily improvements over time lead to stunning results.",
  "The mind is everything. What you think, you become.",
  "Be the master of your habits, not the slave.",
  "The path to monk mode begins with a single tracked day.",
  "Consistency is more important than perfection.",
  "Your habits shape your identity. Choose wisely.",
  "The strongest warriors are patient ones.",
  "What you do every day matters more than what you do once in a while.",
]

export function DailyPage() {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [dailyData, setDailyData] = useState<DailyTrackerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)

  const today = new Date()
  const maxPastDate = subDays(today, 5)
  const dateStr = format(selectedDate, "yyyy-MM-dd")
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const dailyQuote = useMemo(() => QUOTES[new Date().getDate() % QUOTES.length], [])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try { setDailyData(await fetchDailyEntries(dateStr)) }
    catch { setError("Failed to load"); setDailyData([]) }
    finally { setLoading(false) }
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

  const getGreeting = () => {
    const hour = new Date().getHours()
    const name = user?.display_name?.split(" ")[0] || ""
    return `${hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"}${name ? `, ${name}` : ""}`
  }

  return (
    <div className="space-y-6">
      {/* Celebration */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.5, y: 30 }} animate={{ scale: 1, y: 0 }}
              className="flex flex-col items-center gap-4 p-10">
              <motion.div animate={{ rotate: [0, -15, 15, 0], scale: [1, 1.3, 1] }} transition={{ duration: 0.8 }}>
                <Trophy className="h-20 w-20 text-amber-400" />
              </motion.div>
              <h2 className="text-[28px] font-extrabold text-white">All Pulses Logged!</h2>
              <p className="text-muted-foreground">Monk mode activated. +50 XP</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Motivational quote */}
      <p className="text-[13px] text-primary/60 italic text-center">"{dailyQuote}"</p>

      {/* Level bar — always visible */}
      <LevelBar />

      {/* Hero */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[14px] text-muted-foreground">{getGreeting()}</p>
          <h1 className="text-[36px] font-extrabold text-foreground tracking-tight leading-none mt-1">
            {isToday(selectedDate) ? "Today" : isYesterday(selectedDate) ? "Yesterday" : format(selectedDate, "EEEE")}
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1">{format(selectedDate, "MMMM d, yyyy")}</p>
        </div>
        {!loading && totalTrackers > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1.5">
              <Flame className="h-4 w-4 text-amber-400" />
              <span className="text-[15px] font-extrabold text-amber-400">12</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5">
              <span className="text-[15px] font-extrabold text-primary">{completionPct}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Week strip */}
      <div className="flex items-center gap-2">
        <button onClick={() => setSelectedDate(d => subDays(d, 7))} disabled={subDays(selectedDate, 7) < maxPastDate}
          className="shrink-0 rounded-full p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-20"><ChevronLeft className="h-4 w-4" /></button>
        <div className="flex flex-1 gap-1.5">
          {weekDays.map((day) => {
            const isSelected = format(day, "yyyy-MM-dd") === dateStr
            const isPast = day <= today
            return (
              <button key={day.toISOString()} onClick={() => isPast && setSelectedDate(day)} disabled={!isPast || day < maxPastDate}
                className={`flex-1 rounded-2xl py-2.5 text-center transition-all ${
                  isSelected ? "bg-primary text-white shadow-lg glow-green" : isPast ? "bg-card hover:bg-secondary cursor-pointer" : "opacity-20"
                }`}>
                <div className="text-[9px] font-bold uppercase tracking-wider opacity-60">{format(day, "EEE")}</div>
                <div className="text-[16px] font-extrabold mt-0.5">{format(day, "d")}</div>
              </button>
            )
          })}
        </div>
        <button onClick={() => setSelectedDate(d => addDays(d, 7))} disabled={isToday(selectedDate)}
          className="shrink-0 rounded-full p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-20"><ChevronRight className="h-4 w-4" /></button>
      </div>

      {/* Loading */}
      {loading && <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}

      {/* Error */}
      {error && (
        <div className="rounded-2xl bg-card p-6 text-center">
          <p className="text-destructive font-semibold">{error}</p>
          <Button variant="ghost" size="sm" className="mt-2" onClick={loadData}>Try Again</Button>
        </div>
      )}

      {/* Pulse cards */}
      {!loading && !error && dailyData.length > 0 && (
        <div className="space-y-4">
          {dailyData.map((item, i) => (
            <motion.div key={item.tracker.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.4 }}>
              <TrackerCard data={item} onUpdate={(updates) => handleUpdate(item.tracker.id, updates)} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && dailyData.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center">
          <Sparkles className="h-12 w-12 text-primary mb-6" />
          <h3 className="text-[24px] font-extrabold text-foreground mb-2">Begin Your Journey</h3>
          <p className="text-muted-foreground mb-8 max-w-xs">Create your first pulse to start tracking. Take the monk quiz for personalized recommendations.</p>
          <div className="flex gap-3">
            <NavLink to="/quiz"><Button className="glow-green gap-2 rounded-xl px-6 h-12 text-[15px] font-bold"><Sparkles className="h-4 w-4" />Take the Quiz</Button></NavLink>
            <NavLink to="/trackers/new"><Button variant="outline" className="gap-2 rounded-xl px-6 h-12 text-[15px]"><Plus className="h-4 w-4" />Create Manually</Button></NavLink>
          </div>
        </motion.div>
      )}
    </div>
  )
}
