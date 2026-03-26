import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
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
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Achievement[]>("/gamification/achievements")
      .then((res) => setAchievements(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const unlocked = achievements.filter((a) => a.unlocked).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-extrabold tracking-tight text-white">Achievements</h1>
        <p className="text-[13px] text-muted-foreground">
          <span className="text-primary font-bold">{unlocked}</span> of {achievements.length} unlocked
        </p>
      </div>

      {loading && <div className="flex items-center justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>}

      {!loading && Object.keys(CAT_LABELS).map((cat) => {
        const items = achievements.filter((a) => a.category === cat)
        if (items.length === 0) return null
        return (
          <div key={cat}>
            <h2 className="text-[11px] font-bold uppercase tracking-[1.5px] text-muted-foreground mb-3">{CAT_LABELS[cat]}</h2>
            <div className="grid grid-cols-3 gap-2">
              {items.map((ach, i) => (
                <motion.div key={ach.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                  className={`rounded-xl border p-4 text-center transition-all ${ach.unlocked ? "border-primary/30 bg-primary/5" : "border-border bg-card opacity-50"}`}>
                  <div className="text-[28px] mb-2">{ach.unlocked ? ach.icon : "❓"}</div>
                  <p className="text-[11px] font-bold text-white truncate">{ach.unlocked || !ach.is_secret ? ach.name : "???"}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5 line-clamp-2">{ach.unlocked || !ach.is_secret ? ach.description : "Hidden"}</p>
                  <div className="mt-2 text-[9px] font-bold text-primary">+{ach.xp_reward} XP</div>
                </motion.div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
