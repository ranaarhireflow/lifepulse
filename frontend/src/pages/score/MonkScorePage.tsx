import { useState, useEffect } from "react"
import { Loader2, Flame, Zap, Brain, Dumbbell, Eye, Shield, Crown } from "lucide-react"
import { motion } from "framer-motion"
import api from "@/services/api"

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

const DIMENSIONS = [
  { key: "wisdom", label: "Wisdom", icon: Brain, color: "#8B5CF6" },
  { key: "strength", label: "Strength", icon: Dumbbell, color: "#EF4444" },
  { key: "focus", label: "Focus", icon: Eye, color: "#3B82F6" },
  { key: "discipline", label: "Discipline", icon: Shield, color: "#F59E0B" },
  { key: "confidence", label: "Confidence", icon: Crown, color: "#EC4899" },
]

export function MonkScorePage() {
  const [score, setScore] = useState<MonkScore | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<MonkScore>("/gamification/score")
      .then((res) => setScore(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
  if (!score) return <div className="text-center py-20 text-muted-foreground">Could not load Monk Score</div>

  const xpProgress = score.xp_to_next > 0 ? Math.round((1 - score.xp_to_next / ((score.level + 1) ** 2 * 100 - score.xp_total + score.xp_to_next)) * 100) : 100

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-extrabold tracking-tight text-white">Monk Score</h1>
        <p className="text-[13px] text-muted-foreground">Your journey to monk mode</p>
      </div>

      {/* Level + XP card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 to-primary/5 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white">
            <span className="text-[24px] font-extrabold">{score.level}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-primary/70">Level {score.level}</p>
              <Zap className="h-3.5 w-3.5 text-primary" />
            </div>
            <p className="text-[28px] font-extrabold text-white leading-none mt-1">{score.xp_total.toLocaleString()} <span className="text-[14px] text-muted-foreground">XP</span></p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-black/30">
              <motion.div initial={{ width: 0 }} animate={{ width: `${xpProgress}%` }} transition={{ duration: 0.8 }}
                className="h-full rounded-full bg-primary" />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">{score.xp_to_next} XP to Level {score.level + 1}</p>
          </div>
        </div>
      </motion.div>

      {/* Overall */}
      <div className="text-center">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Overall Score</p>
        <p className="text-[48px] font-extrabold text-white leading-none">{Math.round(score.overall)}</p>
      </div>

      {/* Dimensions */}
      <div className="space-y-2">
        <h2 className="text-[11px] font-bold uppercase tracking-[1.5px] text-muted-foreground mb-3">Dimensions</h2>
        {DIMENSIONS.map((dim, i) => {
          const val = Math.round(score[dim.key as keyof MonkScore] as number)
          return (
            <motion.div key={dim.key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5">
              <dim.icon className="h-5 w-5 shrink-0" style={{ color: dim.color }} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] font-bold text-white">{dim.label}</span>
                  <span className="text-[15px] font-extrabold" style={{ color: dim.color }}>{val}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/30">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ duration: 0.6, delay: i * 0.1 }}
                    className="h-full rounded-full" style={{ backgroundColor: dim.color }} />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
