import { motion } from "framer-motion"
import { Flame, ChevronRight, Star } from "lucide-react"
import { EntryInput } from "@/components/entries/EntryInput"
import { NavLink } from "react-router-dom"
import type { DailyTrackerEntry, Entry } from "@/services/trackers"

interface TrackerCardProps {
  data: DailyTrackerEntry
  onUpdate: (data: Partial<Entry>) => void
}

const GRADIENTS: Record<string, string> = {
  "💧": "from-blue-900/40 to-cyan-900/30",
  "🏋️": "from-orange-900/40 to-amber-900/30",
  "🧠": "from-violet-900/40 to-purple-900/30",
  "📖": "from-emerald-900/40 to-green-900/30",
  "⚖️": "from-indigo-900/40 to-blue-900/30",
  "🌙": "from-indigo-900/40 to-slate-900/30",
  "🪥": "from-teal-900/40 to-cyan-900/30",
  "❤️": "from-red-900/40 to-pink-900/30",
  "🌅": "from-amber-900/40 to-orange-900/30",
  "🔥": "from-red-900/40 to-orange-900/30",
  "🏃": "from-teal-900/40 to-emerald-900/30",
  "💓": "from-pink-900/40 to-rose-900/30",
}

export function TrackerCard({ data, onUpdate }: TrackerCardProps) {
  const { tracker, entry, default_value } = data
  const hasValue = entry !== null
  const gradient = GRADIENTS[tracker.icon || ""] || "from-[#1A2E1F] to-[#162B1E]"
  const metaText = tracker.unit || (tracker.type === "BOOLEAN" ? "yes / no" : tracker.type === "TIME" ? "time" : tracker.type === "DURATION" ? "hours" : "")

  return (
    <motion.div layout className={`relative overflow-hidden rounded-2xl border transition-all ${hasValue ? "border-primary/20 opacity-75" : "border-border hover:border-primary/30"}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      <div className="relative flex items-center gap-3 px-4 py-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black/20 text-[22px] backdrop-blur-sm">
          {tracker.icon || "📊"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[15px] font-bold text-white truncate">{tracker.name}</p>
            <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-400">
              <Flame className="h-3 w-3" />3
            </span>
          </div>
          <p className="text-[11px] text-white/40 mt-0.5">
            {tracker.target_value ? `${metaText} · target ${tracker.target_value}` : metaText}
          </p>
          <div className="flex gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`h-2.5 w-2.5 ${s <= 1 ? "text-amber-400 fill-amber-400" : "text-white/15"}`} />
            ))}
          </div>
        </div>
        <EntryInput type={tracker.type} unit={tracker.unit} unitSecondary={tracker.unit_secondary} entry={entry} defaultValue={default_value} color={tracker.color} onUpdate={onUpdate} />
        <NavLink to={`/trackers/${tracker.id}`} className="shrink-0 text-white/20 hover:text-white/50 transition-colors" onClick={(e) => e.stopPropagation()}>
          <ChevronRight className="h-4 w-4" />
        </NavLink>
      </div>
      {hasValue && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-primary/5 pointer-events-none flex items-center justify-end pr-20">
          <span className="text-[28px] opacity-15">✓</span>
        </motion.div>
      )}
    </motion.div>
  )
}
