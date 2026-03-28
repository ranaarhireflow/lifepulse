import { useState, useEffect } from "react"
import { Loader2, Zap } from "lucide-react"
import { motion } from "framer-motion"
import api from "@/services/api"

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: string
  is_secret: boolean
  xp_reward: number
  unlocked: boolean
  unlocked_at: string | null
}

const CAT_LABELS: Record<string, string> = {
  streak: "🔥 Streaks",
  entries: "📊 Entries",
  consistency: "⭐ Consistency",
  milestone: "🏆 Milestones",
  secret: "❓ Secret",
}

export function AchievementsPage() {
  const [achievements, setAwards] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Achievement[]>("/gamification/achievements")
      .then((res) => setAwards(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const unlocked = achievements.filter((a) => a.unlocked)
  const totalXpEarned = unlocked.reduce((sum, a) => sum + a.xp_reward, 0)
  const totalXpPossible = achievements.reduce((sum, a) => sum + a.xp_reward, 0)

  return (
    <div className="px-5 pt-6 pb-6 space-y-5">
      {/* Header */}
      <h1 className="text-[24px] font-black tracking-tight text-foreground">Awards</h1>

      {/* Summary card — shows how achievements affect rating */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] text-muted-foreground">
              <span className="text-primary font-bold text-[16px]">{unlocked.length}</span>
              <span className="text-muted-foreground"> / {achievements.length} unlocked</span>
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span className="text-[12px] font-bold text-primary">{totalXpEarned} XP earned</span>
              <span className="text-[10px] text-muted-foreground">of {totalXpPossible} possible</span>
            </div>
          </div>
          {/* XP progress ring */}
          <div className="relative w-14 h-14">
            <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
              <circle cx="28" cy="28" r="22" fill="none" stroke="currentColor" strokeWidth="4" className="text-border" />
              <circle cx="28" cy="28" r="22" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 22}
                strokeDashoffset={totalXpPossible > 0 ? 2 * Math.PI * 22 * (1 - totalXpEarned / totalXpPossible) : 2 * Math.PI * 22}
                className="text-primary transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[11px] font-black text-foreground">
                {totalXpPossible > 0 ? Math.round((totalXpEarned / totalXpPossible) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 italic">
          Achievement XP directly boosts your level and dimension scores
        </p>
      </div>

      {loading && <div className="flex items-center justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>}

      {!loading && Object.keys(CAT_LABELS).map((cat) => {
        const items = achievements.filter((a) => a.category === cat)
        if (items.length === 0) return null
        return (
          <div key={cat}>
            <h2 className="text-[11px] font-bold uppercase tracking-[1.5px] text-muted-foreground mb-3">{CAT_LABELS[cat]}</h2>
            <div className="grid grid-cols-3 gap-2.5">
              {items.map((ach, i) => (
                <motion.div key={ach.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                  className={`rounded-xl border p-3 text-center transition-all ${
                    ach.unlocked
                      ? "border-primary/30 bg-primary/5 shadow-[0_0_12px_rgba(34,197,94,0.12)]"
                      : "border-border bg-card opacity-40"
                  }`}>
                  <div className="text-[26px] mb-1.5">{ach.unlocked ? ach.icon : "🔒"}</div>
                  <p className="text-[10px] font-bold text-foreground truncate">{ach.unlocked || !ach.is_secret ? ach.name : "???"}</p>
                  <p className="text-[8px] text-muted-foreground mt-0.5 line-clamp-2">{ach.unlocked || !ach.is_secret ? ach.description : "Hidden"}</p>
                  <div className={`mt-1.5 text-[9px] font-bold ${ach.unlocked ? "text-primary" : "text-muted-foreground"}`}>
                    +{ach.xp_reward} XP
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
