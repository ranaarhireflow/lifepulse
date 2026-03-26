import { useState, useEffect } from "react"
import { Zap } from "lucide-react"
import { motion } from "framer-motion"
import api from "@/services/api"

interface MonkScore {
  level: number
  xp_total: number
  xp_to_next: number
  overall: number
}

export function LevelBar() {
  const [score, setScore] = useState<MonkScore | null>(null)

  useEffect(() => {
    api.get<MonkScore>("/gamification/score")
      .then((res) => setScore(res.data))
      .catch(() => {})
  }, [])

  if (!score) return null

  const nextLevelXp = ((score.level + 1) ** 2) * 100
  const currentLevelXp = (score.level ** 2) * 100
  const progress = Math.min(100, Math.max(0, ((score.xp_total - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100))

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 rounded-lg bg-primary/15 px-2.5 py-1">
        <Zap className="h-3.5 w-3.5 text-primary" />
        <span className="text-[13px] font-extrabold text-primary">Lvl {score.level}</span>
      </div>
      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full bg-primary"
          style={{ boxShadow: "0 0 8px rgba(22,163,74,0.5)" }}
        />
      </div>
      <span className="text-[11px] text-muted-foreground font-semibold">{score.xp_total} XP</span>
    </div>
  )
}
