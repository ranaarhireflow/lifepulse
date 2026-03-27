import { Flame, Zap, Star, Pencil } from "lucide-react"
import { motion } from "framer-motion"
import { updateTracker, type Tracker, type TrackerAnalytics } from "@/services/trackers"

/** Type label map for display */
const TYPE_LABELS: Record<string, string> = {
  NUMERIC: "Number",
  DUAL_NUMERIC: "Dual",
  BOOLEAN: "Yes/No",
  DURATION: "Duration",
  TIME: "Time",
  TEXT: "Notes",
}

interface HeroCardProps {
  tracker: Tracker
  analytics: TrackerAnalytics
  scene: { bg: string; narrative: string }
  onEdit: () => void
  onTrackerUpdate?: (t: Tracker) => void
}

/**
 * Pokemon-card-style hero section with gradient background, emoji, name,
 * streak/level badges, type badge, and star rating.
 */
export function HeroCard({ tracker, analytics, scene, onEdit, onTrackerUpdate }: HeroCardProps) {
  const handleStarClick = async (rating: number) => {
    // Toggle: if clicking same star, reset to 0
    const newDifficulty = tracker.difficulty === rating ? 0 : rating
    try {
      const updated = await updateTracker(tracker.id, { difficulty: newDifficulty })
      onTrackerUpdate?.(updated)
    } catch { /* ignore */ }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl"
      style={{ minHeight: 220 }}
    >
      {/* Gradient background */}
      <div className="absolute inset-0" style={{ background: scene.bg }} />

      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-15" style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")"
      }} />

      {/* Bottom gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Holographic border effect */}
      <div className="absolute inset-0 rounded-3xl border border-white/10" />

      {/* Content */}
      <div className="relative flex flex-col items-center justify-center py-8 px-6">
        {/* Edit button — top right */}
        <button
          onClick={onEdit}
          className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 backdrop-blur text-white/60 hover:text-white hover:bg-black/50 transition-colors"
        >
          <Pencil className="h-4 w-4" />
        </button>

        {/* Big emoji */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-[64px] mb-3 drop-shadow-2xl"
        >
          {tracker.icon || "\u{1F4CA}"}
        </motion.div>

        {/* Name */}
        <h1
          className="text-[26px] font-black text-white text-center tracking-tight"
          style={{ textShadow: "0 2px 16px rgba(0,0,0,0.5)" }}
        >
          {tracker.name}
        </h1>

        {/* Streak + level badges */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur-md px-3.5 py-1.5">
            <Flame className="h-4 w-4 text-amber-400" />
            <span className="text-[13px] font-bold text-amber-400">
              {analytics.current_streak} day streak
            </span>
          </div>

          {/* Level = streak / 7, capped at 10 */}
          <div className="flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur-md px-3.5 py-1.5">
            <Zap className="h-3.5 w-3.5 text-[#22C55E]" />
            <span className="text-[13px] font-bold text-[#22C55E]">
              Level {Math.min(Math.floor(analytics.current_streak / 7) + 1, 10)}
            </span>
          </div>
        </div>

        {/* Type badge */}
        <div className="flex items-center gap-2 mt-2">
          <span className="rounded-full bg-white/15 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-white/70 uppercase tracking-wider">
            {TYPE_LABELS[tracker.type] || tracker.type}
          </span>
          {tracker.unit && (
            <span className="rounded-full bg-white/15 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-white/70 uppercase tracking-wider">
              {tracker.unit}
            </span>
          )}
        </div>

        {/* Interactive star rating — tap to set difficulty */}
        <div className="flex gap-1.5 mt-3">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onClick={() => handleStarClick(s)}
              className="p-0.5 transition-transform active:scale-125"
            >
              <Star
                className={`h-5 w-5 transition-colors ${
                  s <= (tracker.difficulty || 0)
                    ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]"
                    : "text-white/20"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
