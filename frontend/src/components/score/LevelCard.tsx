import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface LevelCardProps {
  level: number
  xpTotal: number
  xpToNext: number
  xpProgress: number
}

/** Animated XP bar with glow and shimmer effect */
function XPBar({ progress }: { progress: number }) {
  const barRef = useRef<HTMLDivElement>(null)
  const [animatedWidth, setAnimatedWidth] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedWidth(progress), 300)
    return () => clearTimeout(timer)
  }, [progress])

  return (
    <div className="relative w-full h-3 rounded-full bg-secondary overflow-hidden" ref={barRef}>
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{
          background: "linear-gradient(90deg, #16A34A, #22C55E, #4ADE80)",
          boxShadow: "0 0 12px rgba(34, 197, 94, 0.5)",
        }}
        initial={{ width: "0%" }}
        animate={{ width: `${animatedWidth}%` }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
      />
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-y-0 w-8 rounded-full"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
        }}
        initial={{ left: "-10%" }}
        animate={{ left: "110%" }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
      />
    </div>
  )
}

/**
 * Prominent level badge + XP progress card shown at top of the Monk Score page.
 */
export function LevelCard({ level, xpTotal, xpToNext, xpProgress }: LevelCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="rounded-2xl border border-border bg-card p-6 relative overflow-hidden"
    >
      {/* Subtle glow behind level badge */}
      <div
        className="absolute -left-4 -top-4 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)" }}
      />

      <div className="flex items-center gap-5 relative">
        {/* Level badge */}
        <div className="flex flex-col items-center gap-2">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex h-24 w-24 items-center justify-center rounded-2xl relative"
            style={{
              background: "linear-gradient(135deg, #16A34A, #22C55E)",
              boxShadow: "0 0 30px rgba(34, 197, 94, 0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            <span className="text-[44px] font-black text-black leading-none drop-shadow-sm">
              {level}
            </span>
          </motion.div>
          <span className="text-[10px] font-extrabold uppercase tracking-[2px] text-[#22C55E]">
            Level
          </span>
        </div>

        {/* XP info */}
        <div className="flex-1 min-w-0">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-[38px] font-black text-foreground leading-none tabular-nums"
          >
            {xpTotal.toLocaleString()}
          </motion.p>
          <p className="text-[13px] font-semibold text-muted-foreground mt-1">XP earned</p>

          <div className="mt-4">
            <XPBar progress={xpProgress} />
          </div>
          <p className="text-[11px] font-bold text-muted-foreground/70 mt-2">
            {xpToNext.toLocaleString()} XP to Lvl {level + 1}
          </p>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground/70 italic mt-4 text-center tracking-wide">No level cap. Keep rising.</p>
    </motion.div>
  )
}
