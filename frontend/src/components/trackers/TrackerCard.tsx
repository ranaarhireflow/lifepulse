import { motion } from "framer-motion"
import { Flame, Star } from "lucide-react"
import { EntryInput } from "@/components/entries/EntryInput"
import { NavLink } from "react-router-dom"
import type { DailyTrackerEntry, Entry } from "@/services/trackers"

interface TrackerCardProps {
  data: DailyTrackerEntry
  onUpdate: (data: Partial<Entry>) => void
}

// Each pulse gets a strong color identity
const PULSE_COLORS: Record<string, { gradient: string; lightGradient: string; iconBg: string; lightIconBg: string; accentText: string }> = {
  "💧": { gradient: "from-blue-800/60 via-blue-900/40 to-cyan-900/50", lightGradient: "from-blue-50 via-sky-100 to-cyan-50", iconBg: "bg-black/25", lightIconBg: "bg-blue-200", accentText: "text-blue-700" },
  "🏋️": { gradient: "from-orange-800/60 via-amber-900/40 to-yellow-900/50", lightGradient: "from-orange-50 via-amber-100 to-yellow-50", iconBg: "bg-black/25", lightIconBg: "bg-orange-200", accentText: "text-orange-700" },
  "🧠": { gradient: "from-violet-800/60 via-purple-900/40 to-indigo-900/50", lightGradient: "from-violet-50 via-purple-100 to-indigo-50", iconBg: "bg-black/25", lightIconBg: "bg-violet-200", accentText: "text-violet-700" },
  "📖": { gradient: "from-emerald-800/60 via-green-900/40 to-teal-900/50", lightGradient: "from-emerald-50 via-green-100 to-teal-50", iconBg: "bg-black/25", lightIconBg: "bg-emerald-200", accentText: "text-emerald-700" },
  "⚖️": { gradient: "from-indigo-800/60 via-blue-900/40 to-violet-900/50", lightGradient: "from-indigo-50 via-blue-100 to-violet-50", iconBg: "bg-black/25", lightIconBg: "bg-indigo-200", accentText: "text-indigo-700" },
  "🌙": { gradient: "from-slate-800/60 via-indigo-900/40 to-blue-900/50", lightGradient: "from-slate-50 via-indigo-100 to-blue-50", iconBg: "bg-black/25", lightIconBg: "bg-slate-200", accentText: "text-slate-700" },
  "🪥": { gradient: "from-teal-800/60 via-cyan-900/40 to-sky-900/50", lightGradient: "from-teal-50 via-cyan-100 to-sky-50", iconBg: "bg-black/25", lightIconBg: "bg-teal-200", accentText: "text-teal-700" },
  "❤️": { gradient: "from-red-800/60 via-rose-900/40 to-pink-900/50", lightGradient: "from-red-50 via-rose-100 to-pink-50", iconBg: "bg-black/25", lightIconBg: "bg-rose-200", accentText: "text-rose-700" },
  "🌅": { gradient: "from-amber-800/60 via-orange-900/40 to-red-900/50", lightGradient: "from-amber-50 via-orange-100 to-yellow-50", iconBg: "bg-black/25", lightIconBg: "bg-amber-200", accentText: "text-amber-700" },
  "🔥": { gradient: "from-red-800/60 via-orange-900/40 to-amber-900/50", lightGradient: "from-red-50 via-orange-100 to-amber-50", iconBg: "bg-black/25", lightIconBg: "bg-red-200", accentText: "text-red-700" },
  "🏃": { gradient: "from-teal-800/60 via-emerald-900/40 to-green-900/50", lightGradient: "from-teal-50 via-emerald-100 to-green-50", iconBg: "bg-black/25", lightIconBg: "bg-teal-200", accentText: "text-teal-700" },
  "💓": { gradient: "from-pink-800/60 via-rose-900/40 to-red-900/50", lightGradient: "from-pink-50 via-rose-100 to-red-50", iconBg: "bg-black/25", lightIconBg: "bg-pink-200", accentText: "text-pink-700" },
}

const DEFAULT_COLORS = { gradient: "from-[#1A3520]/60 via-[#162B1E]/40 to-[#111A14]/50", lightGradient: "from-green-400 to-emerald-500", iconBg: "bg-black/25", lightIconBg: "bg-white/30", accentText: "text-green-600" }

export function TrackerCard({ data, onUpdate }: TrackerCardProps) {
  const { tracker, entry, default_value } = data
  const hasValue = entry !== null
  const colors = PULSE_COLORS[tracker.icon || ""] || DEFAULT_COLORS
  const metaText = tracker.unit || (tracker.type === "BOOLEAN" ? "yes / no" : tracker.type === "TIME" ? "time" : tracker.type === "DURATION" ? "hours" : "")

  return (
    <NavLink to={`/trackers/${tracker.id}`}>
      <motion.div
        layout
        whileTap={{ scale: 0.98 }}
        className={`overflow-hidden rounded-2xl transition-all cursor-pointer shadow-sm hover:shadow-lg ${
          hasValue ? "opacity-70 ring-1 ring-primary/30" : "hover:scale-[1.01]"
        }`}
      >
        {/* DARK MODE: full gradient card */}
        <div className="hidden dark:block relative">
          <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient}`} />
          <div className="relative px-4 py-3.5">
            <div className="flex items-start justify-between mb-2.5">
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-[22px] ${colors.iconBg} backdrop-blur-sm`}>{tracker.icon || "📊"}</div>
                <div>
                  <h3 className="text-[15px] font-bold text-white tracking-tight">{tracker.name}</h3>
                  <p className="text-[12px] text-white/50 mt-0.5">{tracker.target_value ? `${metaText} · target ${tracker.target_value}` : metaText}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 rounded-lg px-2 py-1 bg-black/20 backdrop-blur-sm">
                <Flame className="h-3.5 w-3.5 text-amber-400" /><span className="text-[12px] font-bold text-amber-400">3</span>
              </div>
            </div>
            <div className="flex gap-1 mb-2.5">
              {[1,2,3,4,5].map((s) => <Star key={s} className={`h-3 w-3 ${s <= 1 ? "text-amber-400 fill-amber-400" : "text-white/10"}`} />)}
              <span className="text-[10px] text-white/30 ml-1">Repeat: Everyday</span>
            </div>
            <div className="flex items-center justify-between" onClick={(e) => e.preventDefault()}>
              <div className="text-[11px] font-semibold text-white/40">{hasValue ? "✓ Logged" : "Tap to log"}</div>
              <EntryInput type={tracker.type} unit={tracker.unit} unitSecondary={tracker.unit_secondary} entry={entry} defaultValue={default_value} color={tracker.color} onUpdate={onUpdate} />
            </div>
          </div>
        </div>

        {/* LIGHT MODE: full pastel gradient card with dark text */}
        <div className="dark:hidden">
          <div className={`bg-gradient-to-br ${colors.lightGradient} px-4 py-3.5 rounded-2xl border border-black/[0.06]`}>
            <div className="flex items-start justify-between mb-2.5">
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-[22px] ${colors.lightIconBg} shadow-sm`}>{tracker.icon || "📊"}</div>
                <div>
                  <h3 className={`text-[15px] font-bold tracking-tight ${colors.accentText}`}>{tracker.name}</h3>
                  <p className="text-[12px] text-gray-600 mt-0.5">{tracker.target_value ? `${metaText} · target ${tracker.target_value}` : metaText}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 rounded-lg px-2 py-1 bg-amber-100 shadow-sm">
                <Flame className="h-3.5 w-3.5 text-amber-600" /><span className="text-[12px] font-bold text-amber-600">3</span>
              </div>
            </div>
            <div className="flex gap-1 mb-2.5">
              {[1,2,3,4,5].map((s) => <Star key={s} className={`h-3 w-3 ${s <= 1 ? "text-amber-500 fill-amber-500" : "text-black/10"}`} />)}
              <span className="text-[10px] text-gray-500 ml-1">Repeat: Everyday</span>
            </div>
            <div className="flex items-center justify-between" onClick={(e) => e.preventDefault()}>
              <div className={`text-[11px] font-semibold ${hasValue ? colors.accentText : "text-gray-400"}`}>
                {hasValue ? "✓ Logged" : "Tap to log"}
              </div>
              <EntryInput type={tracker.type} unit={tracker.unit} unitSecondary={tracker.unit_secondary} entry={entry} defaultValue={default_value} color={tracker.color} onUpdate={onUpdate} />
            </div>
          </div>
        </div>
      </motion.div>
    </NavLink>
  )
}
