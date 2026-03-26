import { motion } from "framer-motion"
import { Flame, Star } from "lucide-react"
import { EntryInput } from "@/components/entries/EntryInput"
import { NavLink } from "react-router-dom"
import type { DailyTrackerEntry, Entry } from "@/services/trackers"

interface TrackerCardProps {
  data: DailyTrackerEntry
  onUpdate: (data: Partial<Entry>) => void
}

const GRADIENTS: Record<string, string> = {
  "💧": "from-blue-800/60 via-blue-900/40 to-cyan-900/50",
  "🏋️": "from-orange-800/60 via-amber-900/40 to-yellow-900/50",
  "🧠": "from-violet-800/60 via-purple-900/40 to-indigo-900/50",
  "📖": "from-emerald-800/60 via-green-900/40 to-teal-900/50",
  "⚖️": "from-indigo-800/60 via-blue-900/40 to-violet-900/50",
  "🌙": "from-slate-800/60 via-indigo-900/40 to-blue-900/50",
  "🪥": "from-teal-800/60 via-cyan-900/40 to-sky-900/50",
  "❤️": "from-red-800/60 via-rose-900/40 to-pink-900/50",
  "🌅": "from-amber-800/60 via-orange-900/40 to-red-900/50",
  "🔥": "from-red-800/60 via-orange-900/40 to-amber-900/50",
  "🏃": "from-teal-800/60 via-emerald-900/40 to-green-900/50",
  "💓": "from-pink-800/60 via-rose-900/40 to-red-900/50",
}

export function TrackerCard({ data, onUpdate }: TrackerCardProps) {
  const { tracker, entry, default_value } = data
  const hasValue = entry !== null
  const gradient = GRADIENTS[tracker.icon || ""] || "from-[#1A3520]/60 via-[#162B1E]/40 to-[#111A14]/50"
  const metaText = tracker.unit || (tracker.type === "BOOLEAN" ? "yes / no" : tracker.type === "TIME" ? "time" : tracker.type === "DURATION" ? "hours" : "")

  return (
    <NavLink to={`/trackers/${tracker.id}`}>
      <motion.div
        layout
        whileTap={{ scale: 0.98 }}
        className={`relative overflow-hidden rounded-2xl border transition-all cursor-pointer ${
          hasValue ? "border-primary/30" : "border-white/5 hover:border-white/10"
        }`}
      >
        {/* Gradient bg */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />

        {/* Content */}
        <div className="relative px-4 py-3.5">
          {/* Top row: icon + name + streak */}
          <div className="flex items-start justify-between mb-2.5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black/25 text-[22px] backdrop-blur-sm shadow-lg">
                {tracker.icon || "📊"}
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-white tracking-tight">{tracker.name}</h3>
                <p className="text-[12px] text-white/40 mt-0.5">
                  {tracker.target_value ? `${metaText} · target ${tracker.target_value}` : metaText}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-black/20 rounded-lg px-2 py-1 backdrop-blur-sm">
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-[12px] font-bold text-amber-400">3</span>
            </div>
          </div>

          {/* Difficulty stars */}
          <div className="flex gap-1 mb-2.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`h-3 w-3 ${s <= 1 ? "text-amber-400 fill-amber-400" : "text-white/10"}`} />
            ))}
            <span className="text-[10px] text-white/30 ml-1">Repeat: Everyday</span>
          </div>

          {/* Input area */}
          <div className="flex items-center justify-between" onClick={(e) => e.preventDefault()}>
            <div className="text-[11px] text-white/30">
              {hasValue ? "✓ Logged" : "Swipe or tap to log"}
            </div>
            <EntryInput
              type={tracker.type}
              unit={tracker.unit}
              unitSecondary={tracker.unit_secondary}
              entry={entry}
              defaultValue={default_value}
              color={tracker.color}
              onUpdate={onUpdate}
            />
          </div>
        </div>

        {/* Completed overlay — subtle only */}
        {false && hasValue && (
          <div className="hidden">
            <span>✓</span>
          </div>
        )}
      </motion.div>
    </NavLink>
  )
}
