import { motion } from "framer-motion"
import { Flame, Star } from "lucide-react"
import { EntryInput } from "@/components/entries/EntryInput"
import { NavLink } from "react-router-dom"
import type { DailyTrackerEntry, Entry } from "@/services/trackers"

interface TrackerCardProps {
  data: DailyTrackerEntry
  onUpdate: (data: Partial<Entry>) => void
}

// Dark mode: rich gradients. Light mode: vivid pastels
const COLORS: Record<string, { dark: string; light: string; iconBg: string }> = {
  "💧": { dark: "from-blue-800/60 via-blue-900/40 to-cyan-900/50", light: "from-blue-100 to-cyan-100", iconBg: "bg-blue-200 dark:bg-black/25" },
  "🏋️": { dark: "from-orange-800/60 via-amber-900/40 to-yellow-900/50", light: "from-orange-100 to-amber-100", iconBg: "bg-orange-200 dark:bg-black/25" },
  "🧠": { dark: "from-violet-800/60 via-purple-900/40 to-indigo-900/50", light: "from-violet-100 to-purple-100", iconBg: "bg-violet-200 dark:bg-black/25" },
  "📖": { dark: "from-emerald-800/60 via-green-900/40 to-teal-900/50", light: "from-emerald-100 to-green-100", iconBg: "bg-emerald-200 dark:bg-black/25" },
  "⚖️": { dark: "from-indigo-800/60 via-blue-900/40 to-violet-900/50", light: "from-indigo-100 to-blue-100", iconBg: "bg-indigo-200 dark:bg-black/25" },
  "🌙": { dark: "from-slate-800/60 via-indigo-900/40 to-blue-900/50", light: "from-slate-100 to-indigo-100", iconBg: "bg-slate-200 dark:bg-black/25" },
  "🪥": { dark: "from-teal-800/60 via-cyan-900/40 to-sky-900/50", light: "from-teal-100 to-cyan-100", iconBg: "bg-teal-200 dark:bg-black/25" },
  "❤️": { dark: "from-red-800/60 via-rose-900/40 to-pink-900/50", light: "from-red-100 to-pink-100", iconBg: "bg-red-200 dark:bg-black/25" },
  "🌅": { dark: "from-amber-800/60 via-orange-900/40 to-red-900/50", light: "from-amber-100 to-orange-100", iconBg: "bg-amber-200 dark:bg-black/25" },
  "🔥": { dark: "from-red-800/60 via-orange-900/40 to-amber-900/50", light: "from-red-100 to-orange-100", iconBg: "bg-red-200 dark:bg-black/25" },
  "🏃": { dark: "from-teal-800/60 via-emerald-900/40 to-green-900/50", light: "from-teal-100 to-emerald-100", iconBg: "bg-teal-200 dark:bg-black/25" },
  "💓": { dark: "from-pink-800/60 via-rose-900/40 to-red-900/50", light: "from-pink-100 to-rose-100", iconBg: "bg-pink-200 dark:bg-black/25" },
}

const DEFAULT_COLORS = { dark: "from-[#1A3520]/60 via-[#162B1E]/40 to-[#111A14]/50", light: "from-green-50 to-emerald-50", iconBg: "bg-green-100 dark:bg-black/25" }

export function TrackerCard({ data, onUpdate }: TrackerCardProps) {
  const { tracker, entry, default_value } = data
  const hasValue = entry !== null
  const colors = COLORS[tracker.icon || ""] || DEFAULT_COLORS
  const metaText = tracker.unit || (tracker.type === "BOOLEAN" ? "yes / no" : tracker.type === "TIME" ? "time" : tracker.type === "DURATION" ? "hours" : "")

  return (
    <NavLink to={`/trackers/${tracker.id}`}>
      <motion.div
        layout
        whileTap={{ scale: 0.98 }}
        className={`relative overflow-hidden rounded-2xl border transition-all cursor-pointer ${
          hasValue ? "border-primary/30 opacity-75" : "border-border hover:border-primary/20"
        }`}
      >
        {/* Dual gradient: dark mode gets rich, light mode gets pastel */}
        <div className={`absolute inset-0 bg-gradient-to-br hidden dark:block ${colors.dark}`} />
        <div className={`absolute inset-0 bg-gradient-to-br dark:hidden ${colors.light}`} />

        {/* Content */}
        <div className="relative px-4 py-3.5">
          <div className="flex items-start justify-between mb-2.5">
            <div className="flex items-center gap-3">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-[22px] ${colors.iconBg}`}>
                {tracker.icon || "📊"}
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-foreground tracking-tight">{tracker.name}</h3>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  {tracker.target_value ? `${metaText} · target ${tracker.target_value}` : metaText}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 rounded-lg px-2 py-1 bg-amber-500/10 dark:bg-black/20 dark:backdrop-blur-sm">
              <Flame className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-[12px] font-bold text-amber-500">3</span>
            </div>
          </div>

          <div className="flex gap-1 mb-2.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`h-3 w-3 ${s <= 1 ? "text-amber-500 fill-amber-500" : "text-muted-foreground/20"}`} />
            ))}
            <span className="text-[10px] text-muted-foreground ml-1">Repeat: Everyday</span>
          </div>

          <div className="flex items-center justify-between" onClick={(e) => e.preventDefault()}>
            <div className="text-[11px] text-muted-foreground">
              {hasValue ? "✓ Logged" : "Tap to log"}
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
      </motion.div>
    </NavLink>
  )
}
