import { Flame, Target, TrendingUp, Hash } from "lucide-react"
import { motion } from "framer-motion"
import type { TrackerAnalytics } from "@/services/trackers"

interface StatsGridProps {
  analytics: TrackerAnalytics
}

/**
 * 2x2 grid of stat cards: Current Streak, Completion %, Average, Total Entries.
 */
export function StatsGrid({ analytics }: StatsGridProps) {
  const cards = [
    { icon: Flame, label: "Current Streak", value: String(analytics.current_streak), sub: `Best: ${analytics.longest_streak}`, iconColor: "#F59E0B" },
    { icon: Target, label: "Completion", value: `${analytics.completion_rate}%`, sub: `${analytics.total_entries} entries`, iconColor: "#22C55E" },
    { icon: TrendingUp, label: "Average", value: analytics.average !== null ? String(analytics.average) : "\u{2014}", sub: analytics.min_value !== null ? `${analytics.min_value} \u{2013} ${analytics.max_value}` : "", iconColor: "#3B82F6" },
    { icon: Hash, label: "Total Entries", value: String(analytics.total_entries), sub: "", iconColor: "#8B5CF6" },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.05 }}
          className="rounded-2xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-2 mb-2.5">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${s.iconColor}20` }}
            >
              <s.icon className="h-3.5 w-3.5" style={{ color: s.iconColor }} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{s.label}</span>
          </div>
          <p className="text-[28px] font-black text-foreground leading-none">{s.value}</p>
          {s.sub && <p className="text-[11px] text-muted-foreground/70 mt-1 font-semibold">{s.sub}</p>}
        </motion.div>
      ))}
    </div>
  )
}
