import { useState, useEffect } from "react"
import { useNavigate, NavLink } from "react-router-dom"
import { Loader2, Compass, Info } from "lucide-react"
import { motion } from "framer-motion"
import api from "@/services/api"
import { PulseLogo } from "@/components/common/PulseLogo"
import { fetchTrackers, type Tracker } from "@/services/trackers"
import { LevelCard } from "@/components/score/LevelCard"
import { StatRow } from "@/components/score/StatRow"

interface MonkScore {
  level: number
  xp_total: number
  xp_to_next: number
  overall: number
  wisdom: number
  strength: number
  focus: number
  discipline: number
  confidence: number
}

// The five RPG stat dimensions displayed on this page
const STATS = [
  { key: "wisdom", label: "Wisdom", emoji: "\u{1F9E0}", color: "#8B5CF6", bgColor: "rgba(139, 92, 246, 0.15)" },
  { key: "confidence", label: "Confidence", emoji: "\u{1F464}", color: "#EC4899", bgColor: "rgba(236, 72, 153, 0.15)" },
  { key: "strength", label: "Strength", emoji: "\u{1F4AA}", color: "#EF4444", bgColor: "rgba(239, 68, 68, 0.15)" },
  { key: "discipline", label: "Discipline", emoji: "\u{1F4DA}", color: "#F59E0B", bgColor: "rgba(245, 158, 11, 0.15)" },
  { key: "focus", label: "Focus", emoji: "\u{1F3AF}", color: "#3B82F6", bgColor: "rgba(59, 130, 246, 0.15)" },
]


export function MonkScorePage() {
  const navigate = useNavigate()
  const [score, setScore] = useState<MonkScore | null>(null)
  const [loading, setLoading] = useState(true)
  const [trackers, setTrackers] = useState<Tracker[]>([])

  // Maps tracker emoji -> stat dimension for "contributing trackers" display
  const DIMENSION_MAP: Record<string, string> = {
    "\u{1F4D6}": "wisdom", "\u{1F9E0}": "wisdom",
    "\u{1F4AA}": "strength", "\u{1F3CB}\uFE0F": "strength", "\u{1F3C3}": "strength",
    "\u{1F3AF}": "focus", "\u2696\uFE0F": "focus",
    "\u{1F4A7}": "discipline", "\u{1FAA5}": "discipline", "\u{1F319}": "discipline", "\u{1F305}": "discipline",
    "\u2764\uFE0F": "confidence", "\u{1F493}": "confidence",
  }

  useEffect(() => {
    fetchTrackers().then(setTrackers).catch(() => {})
  }, [])

  useEffect(() => {
    const fallback: MonkScore = {
      level: 1, xp_total: 0, xp_to_next: 125, overall: 0,
      wisdom: 0, strength: 0, focus: 0, discipline: 0, confidence: 0,
    }
    api.get<MonkScore>("/gamification/score", { timeout: 5000 })
      .then((res) => setScore(res.data))
      .catch(() => setScore(fallback))
      .finally(() => setLoading(false))
    // Safety timeout so we never hang on a slow API
    const timer = setTimeout(() => {
      setLoading(false)
      setScore(prev => prev || fallback)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-7 w-7 animate-spin text-[#22C55E]" /></div>
  if (!score) return <div className="text-center py-20 text-muted-foreground">Could not load your rating</div>

  // XP calculation: quadratic leveling formula (level^2 * 100)
  const xpForLevel = (score.level + 1) ** 2 * 100
  const xpIntoLevel = score.xp_total - (score.level ** 2 * 100)
  const xpNeededForLevel = xpForLevel - (score.level ** 2 * 100)
  const xpProgress = xpNeededForLevel > 0 ? Math.min(Math.round((xpIntoLevel / xpNeededForLevel) * 100), 100) : 100

  return (
    <div className="px-5 pt-6 pb-6 relative">
      {/* Decorative side art — gradient silhouette on right */}
      <div className="absolute top-0 right-0 w-1/3 h-full pointer-events-none z-0 overflow-hidden opacity-20 dark:opacity-15">
        <div className="absolute inset-0" style={{
          background: "linear-gradient(180deg, rgba(34,197,94,0.3) 0%, rgba(139,92,246,0.2) 50%, rgba(236,72,153,0.15) 100%)",
          maskImage: "linear-gradient(to left, black 0%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to left, black 0%, transparent 100%)",
        }} />
      </div>

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <NavLink to="/"><PulseLogo size={28} /></NavLink>
            <p className="text-[11px] font-extrabold uppercase tracking-[3px] text-[#22C55E]">Monk Score</p>
          </div>
          <h1 className="text-[32px] font-black tracking-tight text-foreground leading-tight">
            Your Current Rating
          </h1>
        </motion.div>

        {/* Level Card */}
        <LevelCard
          level={score.level}
          xpTotal={score.xp_total}
          xpToNext={score.xp_to_next}
          xpProgress={xpProgress}
        />

        {/* Stats — one row per dimension */}
        <div className="space-y-0 mt-2">
          {STATS.map((stat, i) => {
            const val = Math.round(score[stat.key as keyof MonkScore] as number)
            const contributing = trackers.filter(t =>
              ((t as Tracker & { dimension?: string }).dimension === stat.key) || DIMENSION_MAP[t.icon || ""] === stat.key
            )
            return (
              <StatRow
                key={stat.key}
                stat={stat}
                value={val}
                contributing={contributing}
                index={i}
                showBorder={i < STATS.length - 1}
              />
            )
          })}
        </div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <button
            onClick={() => navigate("/trackers/new")}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#22C55E] py-4 text-[15px] font-extrabold text-black shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:shadow-[0_0_40px_rgba(34,197,94,0.45)] transition-shadow"
          >
            <Compass className="h-5 w-5" />
            Add New Habits
          </button>
        </motion.div>

        {/* How scoring works */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider">How scoring works</h3>
          </div>
          <div className="space-y-2 text-[12px] text-muted-foreground">
            <p>Each habit you track contributes to one of 5 personality dimensions.</p>
            <p>Logging daily earns <span className="text-primary font-bold">XP</span> and boosts your dimension scores.</p>
            <p>Hitting targets gives <span className="text-primary font-bold">bonus XP</span>. Streaks multiply your gains.</p>
            <p className="text-[11px] text-muted-foreground/60 italic">No level cap. Keep rising.</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
