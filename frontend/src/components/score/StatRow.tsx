import { motion } from "framer-motion"
import type { Tracker } from "@/services/trackers"

interface StatRowProps {
  stat: {
    key: string
    label: string
    emoji: string
    color: string
    bgColor: string
  }
  value: number
  /** Trackers that contribute to this stat dimension */
  contributing: Tracker[]
  /** Index in the list, used for staggered animation delay */
  index: number
  /** Whether to show a bottom border (all rows except the last) */
  showBorder: boolean
}

/**
 * A single stat dimension row: icon circle, label, contributing trackers, and big score number.
 */
export function StatRow({ stat, value, contributing, index, showBorder }: StatRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.06 }}
      className={`flex items-center py-5 ${showBorder ? "border-b border-border" : ""}`}
    >
      {/* Icon */}
      <div className="flex h-10 w-10 items-center justify-center rounded-full shrink-0"
        style={{ backgroundColor: stat.bgColor }}>
        <span className="text-[20px]">{stat.emoji}</span>
      </div>

      {/* Name + contributing trackers */}
      <div className="ml-3 flex-1 min-w-0">
        <span className="text-[16px] font-bold text-foreground">{stat.label}</span>
        {contributing.length > 0 && (
          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
            {contributing.map(t => `${t.icon} ${t.name}`).join(" · ")}
          </p>
        )}
      </div>

      {/* Big score number */}
      <motion.span
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 + index * 0.08, type: "spring" }}
        className="text-[64px] font-black leading-none tabular-nums"
        style={{ color: stat.color }}
      >
        {value}
      </motion.span>
    </motion.div>
  )
}
