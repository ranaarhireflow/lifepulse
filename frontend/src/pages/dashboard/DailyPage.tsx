import { useState, useEffect, useCallback, useRef } from "react"
import { format } from "date-fns"
import { Loader2, Sparkles, Plus, Flame, Zap, Check, ChevronDown } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { NavLink } from "react-router-dom"
import { useAuth } from "@/store/auth-context"
import { PulseLogo } from "@/components/common/PulseLogo"
import { EntryInput } from "@/components/entries/EntryInput"
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
  const [dateStr] = useState(format(new Date(), "yyyy-MM-dd"))
  const scrollRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try { setData(await fetchDailyEntries(dateStr)) } catch { setData([]) } finally { setLoading(false) }
  }, [dateStr])
  useEffect(() => { load() }, [load])

  const handleUpdate = async (tid: string, u: Partial<Entry>) => {
    setData((p) => p.map((i) => i.tracker.id !== tid ? i : { ...i, entry: i.entry ? { ...i.entry, ...u } : ({ id: "t", tracker_id: tid, date: dateStr, value_numeric: null, value_numeric2: null, value_boolean: null, value_duration: null, value_time: null, value_text: null, note: null, ...u } as Entry) }))
    try { await upsertEntry(tid, dateStr, u) } catch { load() }
  }

  const total = data.length
  const done = data.filter(d => d.entry !== null).length
  const name = user?.display_name?.split(" ")[0] || ""

  if (loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  if (total === 0) return (
    <div className="flex flex-col items-center justify-center h-screen px-6 text-center">
      <Sparkles className="h-16 w-16 text-primary mb-6" />
      <h1 className="text-[32px] font-extrabold mb-3">Begin Your Journey</h1>
      <p className="text-muted-foreground mb-8 max-w-xs">Every monk starts with a single step. Create your first ritual.</p>
      <div className="flex gap-3">
        <NavLink to="/quiz"><Button className="rounded-2xl px-8 h-14 text-[16px] font-bold" style={{ boxShadow: "0 0 30px rgba(22,163,74,0.4)" }}><Sparkles className="h-5 w-5 mr-2" />Take Quiz</Button></NavLink>
        <NavLink to="/trackers/new"><Button variant="outline" className="rounded-2xl px-8 h-14 text-[16px]"><Plus className="h-5 w-5 mr-2" />Create</Button></NavLink>
      </div>
    </div>
  )

  return (
    <div ref={scrollRef} className="h-screen overflow-y-auto snap-y snap-mandatory" style={{ scrollBehavior: "smooth" }}>
      {/* SCREEN 1: Hero */}
      <section className="h-screen snap-start flex flex-col items-center justify-center px-6 relative">
        <div className="absolute top-6 left-5"><PulseLogo size={36} /></div>
        <div className="absolute top-6 right-5 flex gap-2">
          <NavLink to="/score" className="flex items-center gap-1 rounded-full bg-card border border-border px-3 py-1.5 text-[11px] font-bold text-primary"><Zap className="h-3.5 w-3.5" /> Lvl 1</NavLink>
          <div className="flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1.5 text-[11px] font-bold text-amber-400"><Flame className="h-3.5 w-3.5" /> 12</div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="text-[15px] text-muted-foreground mb-2">Hey{name ? ` ${name}` : ""}, ready for today?</p>
          <h1 className="text-[52px] font-extrabold tracking-tight leading-none">{format(new Date(), "EEEE")}</h1>
          <p className="text-[15px] text-muted-foreground mt-2">{format(new Date(), "MMMM d, yyyy")}</p>

          {/* Progress ring */}
          <div className="relative h-[120px] w-[120px] mx-auto mt-8">
            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
              <motion.circle cx="60" cy="60" r="52" fill="none" stroke="#16A34A" strokeWidth="6" strokeLinecap="round"
                strokeDasharray="326.7" initial={{ strokeDashoffset: 326.7 }}
                animate={{ strokeDashoffset: 326.7 - (326.7 * done / total) }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                style={{ filter: "drop-shadow(0 0 8px rgba(22,163,74,0.5))" }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[36px] font-extrabold">{done}</span>
              <span className="text-[11px] text-muted-foreground">of {total}</span>
            </div>
          </div>

          <p className="text-[13px] text-muted-foreground mt-6 italic">"The path to mastery begins now."</p>
        </motion.div>

        {/* Scroll hint */}
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute bottom-10 text-muted-foreground flex flex-col items-center gap-1">
          <span className="text-[11px] font-semibold">Scroll to begin</span>
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </section>

      {/* SCREENS 2-N: One habit per screen */}
      {data.map((item, i) => {
        const scene = SCENES[item.tracker.icon || ""] || DEF
        const logged = item.entry !== null
        return (
          <section key={item.tracker.id} className="h-screen snap-start relative overflow-hidden flex flex-col" style={{ background: scene.bg }}>
            {/* Noise */}
            <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40" />

            {/* Top bar */}
            <div className="relative flex items-center justify-between px-6 pt-6">
              <span className="text-[12px] font-bold text-white/40 uppercase tracking-widest">{i + 1} / {total}</span>
              <div className="flex items-center gap-1.5 rounded-full bg-black/30 backdrop-blur px-3 py-1.5">
                <Flame className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-[13px] font-bold text-amber-400">3 days</span>
              </div>
            </div>

            {/* Center content */}
            <div className="relative flex-1 flex flex-col items-center justify-center px-8 text-center">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }}
                className="text-[72px] mb-4">{item.tracker.icon || "📊"}</motion.div>
              <h2 className="text-[34px] font-extrabold text-white leading-tight" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>
                {item.tracker.name}
              </h2>
              <p className="text-[16px] text-white/40 italic mt-2 max-w-xs" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>
                "{scene.sub}"
              </p>

              {logged && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-6 flex items-center gap-2 rounded-full bg-primary/20 border border-primary/30 px-5 py-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="text-[14px] font-bold text-primary">Logged</span>
                </motion.div>
              )}
            </div>

            {/* Bottom — input */}
            <div className="relative px-6 pb-8">
              <div className="rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 p-5" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[12px] text-white/30 font-semibold uppercase tracking-wider mb-1">
                      {item.tracker.unit || item.tracker.type.toLowerCase()}
                    </p>
                    <p className="text-[11px] text-white/20">
                      {item.tracker.target_value ? `Target: ${item.tracker.target_value}` : "Log your progress"}
                    </p>
                  </div>
                  <EntryInput type={item.tracker.type} unit={item.tracker.unit} unitSecondary={item.tracker.unit_secondary}
                    entry={item.entry} defaultValue={item.default_value} color={item.tracker.color} onUpdate={(u) => handleUpdate(item.tracker.id, u)} />
                </div>
              </div>
            </div>
          </section>
        )
      })}

      {/* LAST SCREEN: Summary */}
      <section className="h-screen snap-start flex flex-col items-center justify-center px-6 text-center">
        <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
          className="text-[64px] mb-4">{done === total ? "🏆" : "💪"}</motion.div>
        <h2 className="text-[32px] font-extrabold mb-2">
          {done === total ? "All Done!" : `${done} of ${total} Logged`}
        </h2>
        <p className="text-muted-foreground mb-8 max-w-xs">
          {done === total ? "You've completed today's ritual. +50 XP earned." : "Keep going. Every pulse counts."}
        </p>
        <div className="flex gap-4">
          <NavLink to="/score"><Button variant="outline" className="rounded-2xl px-6 h-12"><Zap className="h-4 w-4 mr-2" />View Score</Button></NavLink>
          <button onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })} className="rounded-2xl bg-card border border-border px-6 h-12 text-[14px] font-semibold hover:bg-secondary transition-all">Back to Top</button>
        </div>
      </section>
    </div>
  )
}
