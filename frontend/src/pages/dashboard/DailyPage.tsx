import { useState, useEffect, useCallback } from "react"
import { format, subDays } from "date-fns"
import { Loader2, Sparkles, Plus, ChevronDown, Flame, Zap, Check, ArrowRight, Calendar } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { NavLink } from "react-router-dom"
import { useAuth } from "@/store/auth-context"
import { PulseLogo } from "@/components/common/PulseLogo"
import { EntryInput } from "@/components/entries/EntryInput"
import { fetchDailyEntries, upsertEntry, type DailyTrackerEntry, type Entry } from "@/services/trackers"

// Scene artwork per icon
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
const DEFAULT_SCENE = { bg: "radial-gradient(ellipse at 50% 50%, #16a34a, #15803d, #14532d)", sub: "Track it. Master it." }

export function DailyPage() {
  const { user } = useAuth()
  const [data, setData] = useState<DailyTrackerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [focusIndex, setFocusIndex] = useState<number | null>(null)
  const [dateStr] = useState(format(new Date(), "yyyy-MM-dd"))

  const load = useCallback(async () => {
    setLoading(true)
    try { setData(await fetchDailyEntries(dateStr)) }
    catch { setData([]) }
    finally { setLoading(false) }
  }, [dateStr])

  useEffect(() => { load() }, [load])

  const handleUpdate = async (trackerId: string, updates: Partial<Entry>) => {
    setData((prev) => prev.map((item) => {
      if (item.tracker.id !== trackerId) return item
      return { ...item, entry: item.entry ? { ...item.entry, ...updates } : ({ id: "temp", tracker_id: trackerId, date: dateStr, value_numeric: null, value_numeric2: null, value_boolean: null, value_duration: null, value_time: null, value_text: null, note: null, ...updates } as Entry) }
    }))
    try { await upsertEntry(trackerId, dateStr, updates) } catch { load() }
  }

  const total = data.length
  const done = data.filter((d) => d.entry !== null).length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const name = user?.display_name?.split(" ")[0] || "there"
  const focusItem = focusIndex !== null ? data[focusIndex] : null

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )

  // FOCUS MODE — one habit at a time, full screen
  if (focusItem) {
    const scene = SCENES[focusItem.tracker.icon || ""] || DEFAULT_SCENE
    const hasValue = focusItem.entry !== null

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex flex-col">
        {/* Progress */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setFocusIndex(null)} className="text-[13px] text-muted-foreground hover:text-foreground">← Back</button>
            <span className="text-[13px] font-bold text-muted-foreground">{(focusIndex || 0) + 1} of {total}</span>
          </div>
          <div className="h-1 rounded-full bg-card overflow-hidden">
            <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${((focusIndex || 0) + 1) / total * 100}%` }} />
          </div>
        </div>

        {/* Card — full screen artwork */}
        <div className="flex-1 px-5 flex flex-col">
          <motion.div key={focusIndex} initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }}
            className="flex-1 rounded-3xl overflow-hidden relative" style={{ background: scene.bg, minHeight: "420px" }}>
            {/* Noise */}
            <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            <div className="relative h-full flex flex-col justify-between p-6">
              {/* Top */}
              <div className="flex items-start justify-between">
                <div className="text-[48px]">{focusItem.tracker.icon || "📊"}</div>
                <div className="flex items-center gap-1.5 rounded-full bg-black/30 backdrop-blur px-3 py-1.5">
                  <Flame className="h-4 w-4 text-amber-400" />
                  <span className="text-[14px] font-bold text-amber-400">3 days</span>
                </div>
              </div>

              {/* Center — name + subtitle */}
              <div>
                <h2 className="text-[32px] font-extrabold text-white leading-tight" style={{ textShadow: "0 2px 16px rgba(0,0,0,0.5)" }}>
                  {focusItem.tracker.name}
                </h2>
                <p className="text-[15px] text-white/50 italic mt-1" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>
                  "{scene.sub}"
                </p>
              </div>

              {/* Bottom — input */}
              <div className="space-y-4">
                <div onClick={(e) => e.stopPropagation()}>
                  <EntryInput type={focusItem.tracker.type} unit={focusItem.tracker.unit} unitSecondary={focusItem.tracker.unit_secondary}
                    entry={focusItem.entry} defaultValue={focusItem.default_value} color={focusItem.tracker.color} onUpdate={(u) => handleUpdate(focusItem.tracker.id, u)} />
                </div>
                <div className="flex gap-3">
                  {(focusIndex || 0) < total - 1 ? (
                    <Button className="flex-1 h-14 rounded-2xl text-[16px] font-bold" style={{ boxShadow: "0 0 24px rgba(22,163,74,0.4)" }}
                      onClick={() => setFocusIndex((i) => Math.min((i || 0) + 1, total - 1))}>
                      Next <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  ) : (
                    <Button className="flex-1 h-14 rounded-2xl text-[16px] font-bold" style={{ boxShadow: "0 0 24px rgba(22,163,74,0.4)" }}
                      onClick={() => setFocusIndex(null)}>
                      <Check className="h-5 w-5 mr-2" /> Done
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="h-6" />
      </motion.div>
    )
  }

  // OVERVIEW MODE — grid of habit tiles
  return (
    <div className="px-5 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <PulseLogo size={36} />
        <div className="flex items-center gap-2">
          <NavLink to="/score" className="flex items-center gap-1 rounded-full bg-card border border-border px-3 py-1.5 text-[11px] font-bold text-primary hover:bg-secondary transition-all">
            <Zap className="h-3.5 w-3.5" /> Lvl 1
          </NavLink>
          <div className="flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1.5 text-[11px] font-bold text-amber-400">
            <Flame className="h-3.5 w-3.5" /> 12
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="text-center mb-8">
        <p className="text-[14px] text-muted-foreground mb-1">Hey {name}</p>
        <h1 className="text-[42px] font-extrabold tracking-tight leading-none">{format(new Date(), "EEEE")}</h1>
        <p className="text-[14px] text-muted-foreground mt-1">{format(new Date(), "MMMM d, yyyy")}</p>
      </div>

      {/* Progress ring — centered, large */}
      {total > 0 && (
        <div className="flex flex-col items-center mb-8">
          <div className="relative h-[100px] w-[100px]">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
              <motion.circle cx="50" cy="50" r="42" fill="none" stroke="#16A34A" strokeWidth="6" strokeLinecap="round"
                strokeDasharray="263.9" initial={{ strokeDashoffset: 263.9 }}
                animate={{ strokeDashoffset: 263.9 - (263.9 * pct / 100) }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{ filter: "drop-shadow(0 0 6px rgba(22,163,74,0.5))" }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[28px] font-extrabold">{done}</span>
              <span className="text-[10px] text-muted-foreground font-semibold">of {total}</span>
            </div>
          </div>
          <button onClick={() => { const next = data.findIndex(d => d.entry === null); setFocusIndex(next >= 0 ? next : 0) }}
            className="mt-4 flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-[14px] font-bold text-white transition-all hover:scale-105"
            style={{ boxShadow: "0 0 24px rgba(22,163,74,0.4)" }}>
            <Sparkles className="h-4 w-4" />
            {done === 0 ? "Start Ritual" : done < total ? "Continue Ritual" : "Review"}
          </button>
        </div>
      )}

      {/* Habit Grid — 2 columns */}
      {total > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {data.map((item, i) => {
            const scene = SCENES[item.tracker.icon || ""] || DEFAULT_SCENE
            const logged = item.entry !== null
            return (
              <motion.button key={item.tracker.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setFocusIndex(i)}
                className={`relative overflow-hidden rounded-2xl text-left transition-all hover:scale-[1.03] active:scale-95 ${logged ? "opacity-60 ring-1 ring-primary/30" : ""}`}
                style={{ aspectRatio: "1", background: scene.bg }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="relative h-full flex flex-col justify-between p-3.5">
                  <div className="text-[28px]">{item.tracker.icon || "📊"}</div>
                  <div>
                    <p className="text-[14px] font-bold text-white" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>{item.tracker.name}</p>
                    <p className="text-[10px] text-white/40 mt-0.5">{logged ? "✓ Done" : "Tap to log"}</p>
                  </div>
                </div>
                {logged && (
                  <div className="absolute top-2.5 right-2.5 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>
      )}

      {/* Empty */}
      {total === 0 && (
        <div className="text-center py-16">
          <Sparkles className="h-14 w-14 text-primary mx-auto mb-6" />
          <h2 className="text-[26px] font-extrabold mb-2">Begin Your Journey</h2>
          <p className="text-muted-foreground mb-8 max-w-xs mx-auto">Create your first pulse. Every journey starts with a single step.</p>
          <div className="flex gap-3 justify-center">
            <NavLink to="/quiz"><Button className="rounded-2xl px-6 h-12 text-[14px] font-bold" style={{ boxShadow: "0 0 20px rgba(22,163,74,0.4)" }}><Sparkles className="h-4 w-4 mr-2" />Take Quiz</Button></NavLink>
            <NavLink to="/trackers/new"><Button variant="outline" className="rounded-2xl px-6 h-12"><Plus className="h-4 w-4 mr-2" />Create</Button></NavLink>
          </div>
        </div>
      )}
    </div>
  )
}
