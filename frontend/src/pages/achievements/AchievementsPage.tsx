import { useState, useEffect } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { Loader2, ChevronLeft } from "lucide-react"
import { PulseLogo } from "@/components/common/PulseLogo"
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
  const navigate = useNavigate()
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
    <div className="px-5 pt-4 pb-6 space-y-6">
      <div className="flex items-center">
        <button
          onClick={() => navigate("/score")}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <NavLink to="/"><PulseLogo size={28} /></NavLink>
        <h1 className="flex-1 text-center text-[20px] font-extrabold tracking-tight text-foreground">Achievements</h1>
        <div className="w-[60px]" />
      </div>
      <div>
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
            <div className="grid grid-cols-3 gap-3">
              {items.map((ach, i) => (
                <motion.div key={ach.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                  className={`rounded-xl border p-4 text-center transition-all ${ach.unlocked ? "border-green-500/40 bg-primary/5 shadow-[0_0_12px_rgba(34,197,94,0.15)]" : "border-border bg-card opacity-50"}`}>
                  <div className="text-[28px] mb-2">{ach.unlocked ? ach.icon : "❓"}</div>
                  <p className="text-[11px] font-bold text-foreground truncate">{ach.unlocked || !ach.is_secret ? ach.name : "???"}</p>
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
