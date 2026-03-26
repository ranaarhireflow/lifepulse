import { useState, useEffect, useCallback } from "react"
import { format, subDays, addDays, isToday } from "date-fns"
import { Loader2, Sparkles, Plus, Flame, Zap, Check, ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion"
import { Button } from "@/components/ui/button"
import { NavLink } from "react-router-dom"
import { useAuth } from "@/store/auth-context"
import { PulseLogo } from "@/components/common/PulseLogo"
import { fetchDailyEntries, upsertEntry, type DailyTrackerEntry, type Entry } from "@/services/trackers"

const SCENES: Record<string, { bg: string; sub: string }> = {
  "💧": { bg: "radial-gradient(ellipse at 30% 80%, #0c4a6e, #0e7490, #155e75)", sub: "Stay hydrated, stay sharp" },
  "🏋️": { bg: "radial-gradient(ellipse at 70% 20%, #ea580c, #c2410c, #7c2d12)", sub: "Build strength, build character" },
  "🧠": { bg: "radial-gradient(circle at 80% 10%, #7c3aed, #4c1d95, #1e1b4b)", sub: "Focus is your superpower" },
  "📖": { bg: "radial-gradient(ellipse at 20% 70%, #059669, #047857, #064e3b)", sub: "Feed your mind daily" },
  "⚖️": { bg: "radial-gradient(ellipse at 50% 30%, #4338ca, #3730a3, #1e1b4b)", sub: "Track your body's journey" },
  "🌙": { bg: "radial-gradient(circle at 70% 20%, #312e81, #1e1b4b, #000)", sub: "Rest well, rise strong" },
  "🪥": { bg: "radial-gradient(ellipse at 30% 40%, #0891b2, #0e7490, #164e63)", sub: "Start every day right" },
  "❤️": { bg: "radial-gradient(ellipse at 50% 50%, #e11d48, #be123c, #881337)", sub: "Know your numbers" },
}
const DEF = { bg: "radial-gradient(ellipse at 50% 50%, #16a34a, #15803d, #14532d)", sub: "Track it. Master it." }

export function DailyPage() {
  const { user } = useAuth()
  const [data, setData] = useState<DailyTrackerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const dateStr = format(selectedDate, "yyyy-MM-dd")

  const load = useCallback(async () => {
    setLoading(true)
    try { setData(await fetchDailyEntries(dateStr)) } catch { setData([]) } finally { setLoading(false) }
  }, [dateStr])
  useEffect(() => { load(); setCurrentIndex(0) }, [load])

  const update = async (tid: string, u: Partial<Entry>) => {
    setData((p) => p.map((i) => i.tracker.id !== tid ? i : { ...i, entry: i.entry ? { ...i.entry, ...u } : ({ id: "t", tracker_id: tid, date: dateStr, value_numeric: null, value_numeric2: null, value_boolean: null, value_duration: null, value_time: null, value_text: null, note: null, ...u } as Entry) }))
    try { await upsertEntry(tid, dateStr, u) } catch { load() }
  }

  const total = data.length
  const done = data.filter(d => d.entry !== null).length
  const item = data[currentIndex]
  const scene = item ? (SCENES[item.tracker.icon || ""] || DEF) : DEF
  const logged = item?.entry !== null

  const goNext = () => setCurrentIndex(i => Math.min(i + 1, total - 1))
  const goPrev = () => setCurrentIndex(i => Math.max(i - 1, 0))

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -80) goNext()
    else if (info.offset.x > 80) goPrev()
  }

  if (loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  if (total === 0) return (
    <div className="flex flex-col items-center justify-center h-screen px-6 text-center">
      <Sparkles className="h-16 w-16 text-primary mb-6" />
      <h1 className="text-[32px] font-extrabold mb-3">Begin Your Journey</h1>
      <p className="text-muted-foreground mb-8">Create your first ritual card.</p>
      <div className="flex gap-3">
        <NavLink to="/quiz"><Button className="rounded-2xl px-8 h-14 text-[16px] font-bold" style={{ boxShadow: "0 0 30px rgba(22,163,74,0.4)" }}><Sparkles className="h-5 w-5 mr-2" />Take Quiz</Button></NavLink>
        <NavLink to="/trackers/new"><Button variant="outline" className="rounded-2xl px-8 h-14"><Plus className="h-5 w-5 mr-2" />Create</Button></NavLink>
      </div>
    </div>
  )

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* TOP BAR — date, logo, level */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
        <PulseLogo size={32} />
        <div className="flex items-center gap-2">
          <button onClick={() => setSelectedDate(d => subDays(d, 1))} disabled={selectedDate <= subDays(new Date(), 5)} className="p-1 text-muted-foreground disabled:opacity-20"><ChevronLeft className="h-4 w-4" /></button>
          <div className="flex items-center gap-1.5 rounded-full bg-card border border-border px-3 py-1.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[12px] font-bold">{isToday(selectedDate) ? "Today" : format(selectedDate, "MMM d")}</span>
          </div>
          <button onClick={() => setSelectedDate(d => addDays(d, 1))} disabled={isToday(selectedDate)} className="p-1 text-muted-foreground disabled:opacity-20"><ChevronRight className="h-4 w-4" /></button>
        </div>
        <div className="flex items-center gap-2">
          <NavLink to="/score" className="flex items-center gap-1 rounded-full bg-card border border-border px-2.5 py-1 text-[10px] font-bold text-primary"><Zap className="h-3 w-3" />Lvl 1</NavLink>
          <div className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold text-amber-400"><Flame className="h-3 w-3" />12</div>
        </div>
      </div>

      {/* PROGRESS DOTS */}
      <div className="flex items-center justify-center gap-1.5 py-2 shrink-0">
        {data.map((d, i) => (
          <button key={d.tracker.id} onClick={() => setCurrentIndex(i)}
            className={`h-2 rounded-full transition-all ${i === currentIndex ? "w-6 bg-primary" : d.entry ? "w-2 bg-primary/40" : "w-2 bg-white/15"}`} />
        ))}
      </div>

      {/* CARD — horizontal swipe */}
      <div className="flex-1 px-5 pb-3 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            className="h-full rounded-[28px] overflow-hidden relative cursor-grab active:cursor-grabbing"
            style={{ background: scene.bg, touchAction: "pan-y" }}
          >
            {/* Noise */}
            <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

            <div className="relative h-full flex flex-col justify-between p-6">
              {/* Top — streak + status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 rounded-full bg-black/30 backdrop-blur px-3 py-1.5">
                  <Flame className="h-4 w-4 text-amber-400" />
                  <span className="text-[13px] font-bold text-amber-400">3 days</span>
                </div>
                {logged && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="flex items-center gap-1.5 rounded-full bg-primary/20 border border-primary/30 px-3 py-1.5">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-[13px] font-bold text-primary">Done</span>
                  </motion.div>
                )}
              </div>

              {/* Center — emoji + name + narrative */}
              <div className="text-center">
                <div className="text-[64px] mb-3">{item?.tracker.icon || "📊"}</div>
                <h2 className="text-[30px] font-extrabold text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>
                  {item?.tracker.name}
                </h2>
                <p className="text-[14px] text-white/40 italic mt-1" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>
                  "{scene.sub}"
                </p>
                {item?.tracker.target_value && (
                  <p className="text-[12px] text-white/30 mt-2">Target: {item.tracker.target_value} {item.tracker.unit}</p>
                )}
              </div>

              {/* Bottom — intuitive input */}
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
                      className="w-full h-2 rounded-full appearance-none bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(22,163,74,0.5)] [&::-webkit-slider-thumb]:cursor-grab"
                    />
                  </div>
                )}

                {/* Toggle for BOOLEAN */}
                {item?.tracker.type === "BOOLEAN" && (
                  <button onClick={() => update(item.tracker.id, { value_boolean: !(item.entry?.value_boolean) })}
                    className={`w-full h-16 rounded-2xl text-[18px] font-bold transition-all ${
                      item.entry?.value_boolean ? "bg-primary text-white" : "bg-white/10 text-white/50 border border-white/10"
                    }`} style={item.entry?.value_boolean ? { boxShadow: "0 0 30px rgba(22,163,74,0.4)" } : undefined}>
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
                      className="w-full h-2 rounded-full appearance-none bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(22,163,74,0.5)] [&::-webkit-slider-thumb]:cursor-grab"
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

                {/* Swipe hint */}
                <p className="text-center text-[11px] text-white/20 font-semibold">← Swipe to navigate →</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      <div className="flex items-center justify-between px-8 pb-20 shrink-0">
        <button onClick={goPrev} disabled={currentIndex === 0}
          className="flex items-center gap-1 text-[13px] text-muted-foreground disabled:opacity-20 hover:text-foreground transition-all">
          <ChevronLeft className="h-4 w-4" /> Previous
        </button>
        <span className="text-[12px] font-bold text-muted-foreground">{currentIndex + 1} of {total}</span>
        <button onClick={goNext} disabled={currentIndex === total - 1}
          className="flex items-center gap-1 text-[13px] text-muted-foreground disabled:opacity-20 hover:text-foreground transition-all">
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
