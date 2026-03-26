import { useState, useEffect, useCallback } from "react"
import { format, subDays, addDays, isToday, startOfWeek, isBefore, isAfter } from "date-fns"
import { Loader2, Sparkles, Plus, Flame, Zap, Check, ArrowRight, Settings2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
type PanInfo = { offset: { x: number; y: number }; velocity: { x: number; y: number } }
import { Button } from "@/components/ui/button"
import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "@/store/auth-context"
import { PulseLogo } from "@/components/common/PulseLogo"
import { fetchDailyEntries, upsertEntry, type DailyTrackerEntry, type Entry } from "@/services/trackers"

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

export function DailyPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState<DailyTrackerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [confirmedCards, setConfirmedCards] = useState<Set<string>>(new Set())
  const [showConfirmAnim, setShowConfirmAnim] = useState<string | null>(null)
  const dateStr = format(selectedDate, "yyyy-MM-dd")

  const load = useCallback(async () => {
    setLoading(true)
    try { setData(await fetchDailyEntries(dateStr)) } catch { setData([]) } finally { setLoading(false) }
  }, [dateStr])
  useEffect(() => { load(); setCurrentIndex(0); setConfirmedCards(new Set()) }, [load])

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

  const total = data.length
  const done = data.filter(d => d.entry !== null).length
  const item = data[currentIndex]
  const scene = item ? (SCENES[item.tracker.icon || ""] || DEF) : DEF
  const logged = item?.entry !== null
  const isConfirmed = item ? confirmedCards.has(item.tracker.id) : false

  const goNext = () => setCurrentIndex(i => Math.min(i + 1, total - 1))
  const goPrev = () => setCurrentIndex(i => Math.max(i - 1, 0))

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -80) goNext()
    else if (info.offset.x > 80) goPrev()
  }

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  if (total === 0) return (
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
    <div className="h-full flex flex-col overflow-hidden relative max-w-md mx-auto w-full">
      {/* TOP BAR — logo left, badges right */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
        {/* Left — Logo */}
        <PulseLogo size={40} />
        {/* Right — Level + streak */}
        <div className="flex items-center gap-2">
          <NavLink to="/score" className="flex items-center gap-1 rounded-full bg-card border border-border px-2.5 py-1 text-[10px] font-bold text-primary"><Zap className="h-3 w-3" />Lvl 1</NavLink>
          <div className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold text-amber-400"><Flame className="h-3 w-3" />{done}/{total}</div>
        </div>
      </div>

      {/* Date dial — current week Sun-Sat */}
      <div className="flex gap-1.5 px-3 pb-2 shrink-0 overflow-x-auto scrollbar-hide">
        {(() => {
          const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 }) // Sunday
          const today = new Date()
          const fiveDaysAgo = subDays(today, 5)
          return Array.from({ length: 7 }, (_, i) => {
            const d = addDays(weekStart, i)
            const isSelected = format(d, "yyyy-MM-dd") === dateStr
            const dayIsToday = isToday(d)
            const isFuture = isAfter(d, today)
            const isTooOld = isBefore(d, fiveDaysAgo)
            const disabled = isFuture || isTooOld
            return (
              <button key={i} onClick={() => !disabled && setSelectedDate(d)} disabled={disabled}
                className={`flex flex-col items-center flex-1 min-w-[42px] py-2 px-1 rounded-xl transition-all ${
                  isSelected
                    ? "bg-[#22C55E] text-black shadow-[0_0_12px_rgba(34,197,94,0.3)]"
                    : disabled
                      ? "text-muted-foreground/30"
                      : "bg-card border border-border text-muted-foreground hover:border-primary/40"
                }`}>
                <span className="text-[9px] font-bold uppercase">
                  {dayIsToday ? "Today" : format(d, "EEE")}
                </span>
                <span className={`text-[16px] font-black mt-0.5 ${dayIsToday && !isSelected ? "text-primary" : ""}`}>
                  {format(d, "d")}
                </span>
              </button>
            )
          })
        })()}
      </div>

      {/* PROGRESS DOTS */}
      <div className="flex items-center justify-center gap-1.5 py-2 shrink-0">
        {data.map((d, i) => (
          <button key={d.tracker.id} onClick={() => setCurrentIndex(i)}
            className={`h-2 rounded-full transition-all ${i === currentIndex ? "w-6 bg-primary" : (d.entry || confirmedCards.has(d.tracker.id)) ? "w-2 bg-primary/40" : "w-2 bg-foreground/15"}`} />
        ))}
      </div>

      {/* CARD CAROUSEL — adjacent cards peek from sides */}
      <div className="flex-1 pb-3 relative w-full overflow-hidden">
        {/* Card track — shows prev, current, next */}
        <div className="relative h-full flex items-stretch">
          {/* Previous card — peeks from left */}
          {currentIndex > 0 && (() => {
            const prev = data[currentIndex - 1]
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

          {/* Next card — peeks from right */}
          {currentIndex < total - 1 && (() => {
            const next = data[currentIndex + 1]
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

          {/* Front card */}
          <div className="relative w-full px-5 z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, x: -200, rotate: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={handleDragEnd}
                className="h-full rounded-[28px] overflow-hidden relative cursor-grab active:cursor-grabbing"
                style={{ background: scene.bg, touchAction: "pan-y" }}
              >
            {/* Noise texture */}
            <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

            {/* Confirmed overlay animation */}
            <AnimatePresence>
              {showConfirmAnim === item?.tracker.id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.5 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                >
                  <div className="flex flex-col items-center gap-3">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
                      className="h-20 w-20 rounded-full bg-primary flex items-center justify-center"
                      style={{ boxShadow: "0 0 60px rgba(34,197,94,0.6)" }}
                    >
                      <Check className="h-10 w-10 text-white" strokeWidth={3} />
                    </motion.div>
                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-[22px] font-extrabold text-white"
                    >
                      Done ✓
                    </motion.span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative h-full flex flex-col justify-between p-6 z-10">
              {/* Top — streak + edit + status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 rounded-full bg-black/30 backdrop-blur px-3 py-1.5">
                  <span className="text-[14px]">🔥</span>
                  <span className="text-[12px] font-bold text-amber-400">12 day streak</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => item && navigate(`/trackers/${item.tracker.id}`)} className="flex h-8 w-8 items-center justify-center rounded-full bg-black/30 backdrop-blur text-white/50 hover:text-white transition-colors">
                    <Settings2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Center — emoji + name + narrative */}
              <div className="text-center">
                <div className="text-[80px] mb-2 leading-none">{item?.tracker.icon || "📊"}</div>
                <h2 className="text-[32px] font-black text-white tracking-tight" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>
                  {item?.tracker.name}
                </h2>
                <p className="text-[14px] text-white/40 italic mt-1" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>
                  "{scene.sub}"
                </p>
                {item?.tracker.target_value && (
                  <p className="text-[12px] text-white/30 mt-2">Target: {item.tracker.target_value} {item.tracker.unit}</p>
                )}
              </div>

              {/* Bottom — intuitive input + confirm button */}
              <div className="space-y-4">
                {/* Slider for NUMERIC */}
                {item?.tracker.type === "NUMERIC" && (
                  <div className="space-y-2">
                    <div className="text-center text-[36px] font-extrabold text-white" style={{ textShadow: "0 0 20px rgba(255,255,255,0.2)" }}>
                      {item.entry?.value_numeric ?? 0}
                      <span className="text-[16px] text-white/40 ml-1">{item.tracker.unit}</span>
                    </div>
                    <input type="range" min={item.tracker.min_value || 0} max={item.tracker.max_value || (item.tracker.target_value ? item.tracker.target_value * 2 : 100)}
                      step={item.tracker.unit === "kg" ? 0.1 : 1}
                      value={item.entry?.value_numeric ?? 0}
                      onChange={(e) => update(item.tracker.id, { value_numeric: parseFloat(e.target.value) })}
                      className="w-full h-2 rounded-full appearance-none bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(34,197,94,0.5)] [&::-webkit-slider-thumb]:cursor-grab"
                    />
                  </div>
                )}

                {/* Toggle for BOOLEAN */}
                {item?.tracker.type === "BOOLEAN" && (
                  <button onClick={() => update(item.tracker.id, { value_boolean: !(item.entry?.value_boolean) })}
                    className={`w-full h-16 rounded-2xl text-[18px] font-bold transition-all ${
                      item.entry?.value_boolean ? "bg-primary text-white" : "bg-white/10 text-white/50 border border-white/10"
                    }`} style={item.entry?.value_boolean ? { boxShadow: "0 0 30px rgba(34,197,94,0.4)" } : undefined}>
                    {item.entry?.value_boolean ? "✓ Done" : "Tap to Complete"}
                  </button>
                )}

                {/* Duration */}
                {item?.tracker.type === "DURATION" && (
                  <div className="space-y-2">
                    <div className="text-center text-[36px] font-extrabold text-white">
                      {Math.floor((item.entry?.value_duration || 0) / 60)}h {(item.entry?.value_duration || 0) % 60}m
                    </div>
                    <input type="range" min={0} max={480} step={15}
                      value={item.entry?.value_duration ?? 0}
                      onChange={(e) => update(item.tracker.id, { value_duration: parseInt(e.target.value) })}
                      className="w-full h-2 rounded-full appearance-none bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(34,197,94,0.5)] [&::-webkit-slider-thumb]:cursor-grab"
                    />
                  </div>
                )}

                {/* Time */}
                {item?.tracker.type === "TIME" && (
                  <div className="flex justify-center">
                    <input type="time" value={item.entry?.value_time || ""}
                      onChange={(e) => update(item.tracker.id, { value_time: e.target.value || null })}
                      className="text-[32px] font-extrabold bg-transparent text-white text-center border-none outline-none [color-scheme:dark]"
                      style={{ textShadow: "0 0 20px rgba(255,255,255,0.2)" }}
                    />
                  </div>
                )}

                {/* Dual numeric (BP) */}
                {item?.tracker.type === "DUAL_NUMERIC" && (
                  <div className="flex items-center justify-center gap-3">
                    <input type="number" value={item.entry?.value_numeric ?? ""} placeholder="120"
                      onChange={(e) => update(item.tracker.id, { value_numeric: parseFloat(e.target.value) || null })}
                      className="w-20 text-[32px] font-extrabold bg-transparent text-white text-center border-b-2 border-white/20 outline-none" />
                    <span className="text-[24px] text-white/30">/</span>
                    <input type="number" value={item.entry?.value_numeric2 ?? ""} placeholder="80"
                      onChange={(e) => update(item.tracker.id, { value_numeric2: parseFloat(e.target.value) || null })}
                      className="w-20 text-[32px] font-extrabold bg-transparent text-white text-center border-b-2 border-white/20 outline-none" />
                  </div>
                )}

                {/* Text */}
                {item?.tracker.type === "TEXT" && (
                  <textarea value={item.entry?.value_text || ""} placeholder="Write your thoughts..."
                    onChange={(e) => update(item.tracker.id, { value_text: e.target.value || null })}
                    className="w-full h-24 rounded-2xl bg-white/10 border border-white/10 p-4 text-white placeholder:text-white/20 resize-none outline-none text-[15px]" />
                )}

                {/* Confirm button */}
                <motion.button
                  onClick={confirmCard}
                  whileTap={{ scale: 0.96 }}
                  className={`w-full h-14 rounded-2xl text-[17px] font-extrabold tracking-wide flex items-center justify-center gap-2 transition-all ${
                    (logged || isConfirmed)
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-primary text-white"
                  }`}
                  style={(logged || isConfirmed) ? undefined : { boxShadow: "0 0 30px rgba(34,197,94,0.5), 0 4px 20px rgba(34,197,94,0.3)" }}
                >
                  {(logged || isConfirmed) ? (
                    <><Check className="h-5 w-5" /> Confirmed</>
                  ) : (
                    <><ArrowRight className="h-5 w-5" /> Confirm</>
                  )}
                </motion.button>

                {/* Swipe hint */}
                <p className="text-center text-[11px] text-white/20 font-semibold">&larr; Swipe to navigate &rarr;</p>
              </div>
            </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Card counter */}
      <div className="flex items-center justify-center pb-2 shrink-0 pt-2">
        <span className="text-[12px] font-bold text-muted-foreground">{currentIndex + 1} of {total}</span>
      </div>

      {/* Floating + button — positioned within the max-w-md container */}
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
