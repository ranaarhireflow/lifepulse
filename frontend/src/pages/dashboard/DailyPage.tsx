import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { Loader2, Sparkles, Plus, Flame, Zap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
type PanInfo = { offset: { x: number; y: number }; velocity: { x: number; y: number } }
import { Button } from "@/components/ui/button"
import { NavLink, useNavigate } from "react-router-dom"
import { PulseLogo } from "@/components/common/PulseLogo"
import { fetchDailyEntries, fetchTrackers, upsertEntry, type DailyTrackerEntry, type Entry } from "@/services/trackers"
import { syncWidgetData } from "@/services/widget-sync"
import { syncAlarmsToDevice } from "@/services/alarm-sync"
import { DateDial } from "@/components/today/DateDial"
import { HabitCard } from "@/components/today/HabitCard"

// Gradient + motivational text per tracker emoji
const SCENES: Record<string, { bg: string; sub: string }> = {
  "💧": { bg: "radial-gradient(ellipse at 30% 80%, #0369a1, #0ea5e9, #0284c7)", sub: "Stay hydrated, stay sharp" },
  "🏋️": { bg: "radial-gradient(ellipse at 70% 20%, #f97316, #ea580c, #9a3412)", sub: "Build strength, build character" },
  "🧠": { bg: "radial-gradient(circle at 80% 10%, #8b5cf6, #7c3aed, #4c1d95)", sub: "Focus is your superpower" },
  "📖": { bg: "radial-gradient(ellipse at 20% 70%, #10b981, #059669, #047857)", sub: "Feed your mind daily" },
  "⚖️": { bg: "radial-gradient(ellipse at 50% 30%, #6366f1, #4f46e5, #3730a3)", sub: "Track your body's journey" },
  "🌙": { bg: "radial-gradient(circle at 70% 20%, #6366f1, #312e81, #1e1b4b)", sub: "Rest well, rise strong" },
  "🪥": { bg: "radial-gradient(ellipse at 30% 40%, #06b6d4, #0891b2, #0e7490)", sub: "Start every day right" },
  "❤️": { bg: "radial-gradient(ellipse at 50% 50%, #f43f5e, #e11d48, #be123c)", sub: "Know your numbers" },
}
const DEF = { bg: "radial-gradient(ellipse at 50% 50%, #22c55e, #16a34a, #15803d)", sub: "Track it. Master it." }

const DAILY_CACHE_KEY = "lifepulse_daily_cache"

export function DailyPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<DailyTrackerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [confirmedCards, setConfirmedCards] = useState<Set<string>>(new Set())
  const [showConfirmAnim, setShowConfirmAnim] = useState<string | null>(null)
  const dateStr = format(selectedDate, "yyyy-MM-dd")

  // Load from cache on mount for instant display
  useEffect(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(DAILY_CACHE_KEY) || "{}")
      if (cached.date === dateStr && cached.entries?.length) {
        setData(cached.entries)
        setLoading(false)
      }
    } catch {}
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch entries whenever the selected date changes
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const entries = await fetchDailyEntries(dateStr)
      setData(entries)
      try { localStorage.setItem(DAILY_CACHE_KEY, JSON.stringify({ date: dateStr, entries })) } catch {}
      // Sync to native widget + alarms
      syncWidgetData(entries).catch(() => {})
      fetchTrackers().then(t => syncAlarmsToDevice(t)).catch(() => {})
    } catch { setData([]) } finally { setLoading(false) }
  }, [dateStr])
  useEffect(() => { load(); setCurrentIndex(0); setConfirmedCards(new Set()) }, [load])

  // Optimistic update: patch local state then persist to server
  const update = async (tid: string, u: Partial<Entry>) => {
    setData((p) => p.map((i) => i.tracker.id !== tid ? i : { ...i, entry: i.entry ? { ...i.entry, ...u } : ({ id: "t", tracker_id: tid, date: dateStr, value_numeric: null, value_numeric2: null, value_boolean: null, value_duration: null, value_time: null, value_text: null, note: null, ...u } as Entry) }))
    try { await upsertEntry(tid, dateStr, u) } catch { load() }
  }

  const confirmCard = async () => {
    if (!item) return
    const tid = item.tracker.id
    // For BOOLEAN, auto-set to true on confirm if not already set
    if (item.tracker.type === "BOOLEAN" && !item.entry?.value_boolean) {
      await update(tid, { value_boolean: true })
    }
    setConfirmedCards(prev => new Set(prev).add(tid))
    setShowConfirmAnim(tid)
    setTimeout(() => setShowConfirmAnim(null), 1200)
    // Auto-advance to next card after a brief delay
    setTimeout(() => {
      if (currentIndex < total - 1) goNext()
    }, 800)
  }

  // Filter by tracking_days — only show cards scheduled for the selected day
  const todayDow = selectedDate.getDay() // 0=Sun, 1=Mon..6=Sat
  const todayIso = todayDow === 0 ? 7 : todayDow // Convert to ISO: 1=Mon..7=Sun
  const filteredData = data.filter(d => {
    const days = d.tracker.tracking_days
    if (!days || days.length === 0) return true // no schedule = show every day
    return days.includes(todayIso)
  })

  const total = filteredData.length
  const done = filteredData.filter(d => d.entry !== null).length
  const item = filteredData[currentIndex]
  const scene = item ? (SCENES[item.tracker.icon || ""] || DEF) : DEF
  const isConfirmed = item ? confirmedCards.has(item.tracker.id) : false

  const goNext = () => setCurrentIndex(i => Math.min(i + 1, total - 1))
  const goPrev = () => setCurrentIndex(i => Math.max(i - 1, 0))

  // Swipe left/right to navigate cards
  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -80) goNext()
    else if (info.offset.x > 80) goPrev()
  }

  if (loading && data.length === 0) return (
    <div className="h-full flex flex-col overflow-hidden relative w-full">
      {/* Show top bar + date dial immediately */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
        <div className="flex items-center gap-2">
          <PulseLogo size={28} />
          <span className="text-[17px] font-black tracking-tight text-foreground">LifePulse</span>
        </div>
      </div>
      <DateDial selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </div>
  )

  if (total === 0 && !loading) return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <Sparkles className="h-16 w-16 text-primary mb-6" />
      <h1 className="text-[32px] font-extrabold mb-3">Begin Your Journey</h1>
      <p className="text-muted-foreground mb-8">Create your first ritual card.</p>
      <div className="flex gap-3">
        <NavLink to="/quiz"><Button className="rounded-2xl px-8 h-14 text-[16px] font-bold" style={{ boxShadow: "0 0 30px rgba(34,197,94,0.4)" }}><Sparkles className="h-5 w-5 mr-2" />Take Quiz</Button></NavLink>
        <NavLink to="/trackers/new"><Button variant="outline" className="rounded-2xl px-8 h-14"><Plus className="h-5 w-5 mr-2" />Create</Button></NavLink>
      </div>
    </div>
  )

  return (
    <div className="h-full flex flex-col overflow-hidden relative w-full">
      {/* TOP BAR — brand left, badges right */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
        <div className="flex items-center gap-2">
          <PulseLogo size={28} />
          <span className="text-[17px] font-black tracking-tight text-foreground">LifePulse</span>
        </div>
        <div className="flex items-center gap-1.5">
          <NavLink to="/score" className="flex items-center gap-1 rounded-full bg-card border border-border px-2 py-1 text-[9px] font-bold text-primary"><Zap className="h-3 w-3" />Lvl 1</NavLink>
          <div className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-[9px] font-bold text-amber-400"><Flame className="h-3 w-3" />{done}/{total}</div>
        </div>
      </div>

      {/* Date dial — current week Sun-Sat */}
      <DateDial selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      {/* PROGRESS DOTS — one per card, highlighted if logged */}
      <div className="flex items-center justify-center gap-1.5 py-2 shrink-0">
        {filteredData.map((d, i) => (
          <button key={d.tracker.id} onClick={() => setCurrentIndex(i)}
            className={`h-2 rounded-full transition-all ${i === currentIndex ? "w-6 bg-primary" : (d.entry || confirmedCards.has(d.tracker.id)) ? "w-2 bg-primary/40" : "w-2 bg-foreground/15"}`} />
        ))}
      </div>

      {/* CARD CAROUSEL — adjacent cards peek from sides */}
      <div className="flex-1 pb-3 relative w-full overflow-hidden">
        <div className="relative h-full flex items-stretch">
          {/* Previous card peek */}
          {currentIndex > 0 && (() => {
            const prev = filteredData[currentIndex - 1]
            const ps = SCENES[prev.tracker.icon || ""] || DEF
            return (
              <div
                onClick={goPrev}
                className="absolute left-0 top-3 bottom-3 w-[72%] rounded-[24px] -translate-x-[88%] scale-[0.92] opacity-50 cursor-pointer z-0 transition-all"
                style={{ background: ps.bg }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/40 rounded-[24px]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[40px]">{prev.tracker.icon || "📊"}</span>
                </div>
              </div>
            )
          })()}

          {/* Next card peek */}
          {currentIndex < total - 1 && (() => {
            const next = filteredData[currentIndex + 1]
            const ns = SCENES[next.tracker.icon || ""] || DEF
            return (
              <div
                onClick={goNext}
                className="absolute right-0 top-3 bottom-3 w-[72%] rounded-[24px] translate-x-[88%] scale-[0.92] opacity-50 cursor-pointer z-0 transition-all"
                style={{ background: ns.bg }}
              >
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/40 rounded-[24px]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[40px]">{next.tracker.icon || "📊"}</span>
                </div>
              </div>
            )
          })()}

          {/* Front card — draggable with swipe gestures */}
          <div className="relative w-full px-5 z-10">
            <AnimatePresence initial={false}>
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={handleDragEnd}
                className="h-full cursor-grab active:cursor-grabbing"
                style={{ touchAction: "pan-y" }}
              >
                {item && (
                  <HabitCard
                    data={item}
                    scene={scene}
                    onConfirm={confirmCard}
                    onNavigateEdit={() => navigate(`/trackers/${item.tracker.id}`)}
                    onUpdate={update}
                    isConfirmed={isConfirmed}
                    showConfirmAnim={showConfirmAnim === item.tracker.id}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Card counter */}
      <div className="flex items-center justify-center pb-2 shrink-0 pt-2">
        <span className="text-[12px] font-bold text-muted-foreground">{currentIndex + 1} of {total}</span>
      </div>

      {/* Floating + button */}
      <NavLink
        to="/trackers/new"
        className="absolute bottom-20 right-4 z-50 h-12 w-12 rounded-full bg-primary flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        style={{ boxShadow: "0 0 24px rgba(34,197,94,0.5), 0 4px 12px rgba(0,0,0,0.3)" }}
      >
        <Plus className="h-5 w-5 text-white" strokeWidth={2.5} />
      </NavLink>

    </div>
  )
}
