import { useState, useEffect, useCallback, useMemo } from "react"
import { format, subDays, addDays, isToday, startOfWeek } from "date-fns"
import { ChevronLeft, ChevronRight, Loader2, Sparkles, Plus, Flame, Zap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { NavLink } from "react-router-dom"
import { useAuth } from "@/store/auth-context"
import { PulseLogo } from "@/components/common/PulseLogo"
import { TrackerCard } from "@/components/trackers/TrackerCard"
import { fetchDailyEntries, upsertEntry, type DailyTrackerEntry, type Entry } from "@/services/trackers"

const QUOTES = [
  "The only way to do great work is to love what you do.",
  "Discipline is choosing between what you want now and what you want most.",
  "Small daily improvements lead to stunning results.",
  "The mind is everything. What you think, you become.",
  "Be the master of your habits, not the slave.",
  "The path to monk mode begins with a single tracked day.",
  "Consistency beats intensity. Every single time.",
  "Your habits shape your identity.",
  "The strongest warriors are patient ones.",
  "What you do every day matters more than what you do once.",
]

export function DailyPage() {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [dailyData, setDailyData] = useState<DailyTrackerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const today = new Date()
  const maxPast = subDays(today, 5)
  const dateStr = format(selectedDate, "yyyy-MM-dd")
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const quote = useMemo(() => QUOTES[new Date().getDate() % QUOTES.length], [])

  const loadData = useCallback(async () => {
    setLoading(true)
    try { setDailyData(await fetchDailyEntries(dateStr)) }
    catch { setDailyData([]) }
    finally { setLoading(false) }
  }, [dateStr])

  useEffect(() => { loadData() }, [loadData])

  const handleUpdate = async (trackerId: string, updates: Partial<Entry>) => {
    setDailyData((prev) => prev.map((item) => {
      if (item.tracker.id !== trackerId) return item
      return { ...item, entry: item.entry ? { ...item.entry, ...updates } : ({ id: "temp", tracker_id: trackerId, date: dateStr, value_numeric: null, value_numeric2: null, value_boolean: null, value_duration: null, value_time: null, value_text: null, note: null, ...updates } as Entry) }
    }))
    try { await upsertEntry(trackerId, dateStr, updates) } catch { loadData() }
  }

  const total = dailyData.length
  const done = dailyData.filter((d) => d.entry !== null).length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const name = user?.display_name?.split(" ")[0] || ""
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  return (
    <div className="px-5 pt-6">
      {/* Header — Logo + Level */}
      <div className="flex items-center justify-between mb-8">
        <NavLink to="/"><PulseLogo size={36} /></NavLink>
        <NavLink to="/score" className="flex items-center gap-1.5 rounded-full bg-card border border-border px-3 py-1.5 hover:bg-secondary transition-colors">
          <Zap className="h-3.5 w-3.5 text-primary" />
          <span className="text-[12px] font-bold text-primary">Level 1</span>
          <span className="text-[10px] text-muted-foreground">• 0 XP</span>
        </NavLink>
      </div>

      {/* Quote */}
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[13px] text-center text-muted-foreground italic mb-8 px-4">
        "{quote}"
      </motion.p>

      {/* Greeting + Stats */}
      <div className="mb-6">
        <p className="text-[14px] text-muted-foreground">{greeting}{name ? `, ${name}` : ""}</p>
        <div className="flex items-end justify-between mt-1">
          <h1 className="text-[38px] font-extrabold tracking-tight leading-none">
            {isToday(selectedDate) ? "Today" : format(selectedDate, "EEE, MMM d")}
          </h1>
          {total > 0 && (
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center gap-1 text-amber-400">
                <Flame className="h-4 w-4" /><span className="text-[14px] font-extrabold">12</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <span className="text-[14px] font-extrabold text-primary">{pct}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Week strip — pill style */}
      <div className="flex items-center gap-1 mb-8">
        <button onClick={() => setSelectedDate(d => subDays(d, 7))} disabled={subDays(selectedDate, 7) < maxPast}
          className="p-1 text-muted-foreground disabled:opacity-20"><ChevronLeft className="h-4 w-4" /></button>
        {weekDays.map((day) => {
          const sel = format(day, "yyyy-MM-dd") === dateStr
          const past = day <= today
          return (
            <button key={day.toISOString()} onClick={() => past && setSelectedDate(day)} disabled={!past || day < maxPast}
              className={`flex-1 py-2 rounded-xl text-center transition-all ${
                sel ? "bg-primary text-white" + (sel ? " shadow-lg" : "") : past ? "hover:bg-card" : "opacity-20"
              }`} style={sel ? { boxShadow: "0 0 20px rgba(22,163,74,0.3)" } : undefined}>
              <div className="text-[9px] font-bold uppercase opacity-60">{format(day, "EEE")}</div>
              <div className="text-[14px] font-extrabold">{format(day, "d")}</div>
            </button>
          )
        })}
        <button onClick={() => setSelectedDate(d => addDays(d, 7))} disabled={isToday(selectedDate)}
          className="p-1 text-muted-foreground disabled:opacity-20"><ChevronRight className="h-4 w-4" /></button>
      </div>

      {/* Cards */}
      {loading && <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}

      {!loading && dailyData.length > 0 && (
        <div className="space-y-4">
          {dailyData.map((item, i) => (
            <motion.div key={item.tracker.id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}>
              <TrackerCard data={item} onUpdate={(updates) => handleUpdate(item.tracker.id, updates)} />
            </motion.div>
          ))}
        </div>
      )}

      {!loading && dailyData.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-20">
          <Sparkles className="h-14 w-14 text-primary mx-auto mb-6" />
          <h2 className="text-[26px] font-extrabold mb-2">Begin Your Journey</h2>
          <p className="text-muted-foreground mb-8 max-w-xs mx-auto">Create your first pulse to start tracking. Every journey starts with a single step.</p>
          <div className="flex gap-3 justify-center">
            <NavLink to="/quiz"><Button className="rounded-xl px-6 h-12 text-[14px] font-bold" style={{ boxShadow: "0 0 20px rgba(22,163,74,0.4)" }}><Sparkles className="h-4 w-4 mr-2" />Take the Quiz</Button></NavLink>
            <NavLink to="/trackers/new"><Button variant="outline" className="rounded-xl px-6 h-12 text-[14px]"><Plus className="h-4 w-4 mr-2" />Create</Button></NavLink>
          </div>
        </motion.div>
      )}
    </div>
  )
}
