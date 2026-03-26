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
  "💧": { gradient: "from-blue-800/60 via-blue-900/40 to-cyan-900/50", lightGradient: "from-sky-400 to-blue-500", iconBg: "bg-black/25", lightIconBg: "bg-white/30", accentText: "text-blue-600" },
  "🏋️": { gradient: "from-orange-800/60 via-amber-900/40 to-yellow-900/50", lightGradient: "from-orange-400 to-amber-500", iconBg: "bg-black/25", lightIconBg: "bg-white/30", accentText: "text-orange-600" },
  "🧠": { gradient: "from-violet-800/60 via-purple-900/40 to-indigo-900/50", lightGradient: "from-violet-400 to-purple-500", iconBg: "bg-black/25", lightIconBg: "bg-white/30", accentText: "text-violet-600" },
  "📖": { gradient: "from-emerald-800/60 via-green-900/40 to-teal-900/50", lightGradient: "from-emerald-400 to-green-500", iconBg: "bg-black/25", lightIconBg: "bg-white/30", accentText: "text-emerald-600" },
  "⚖️": { gradient: "from-indigo-800/60 via-blue-900/40 to-violet-900/50", lightGradient: "from-indigo-400 to-blue-500", iconBg: "bg-black/25", lightIconBg: "bg-white/30", accentText: "text-indigo-600" },
  "🌙": { gradient: "from-slate-800/60 via-indigo-900/40 to-blue-900/50", lightGradient: "from-indigo-400 to-slate-500", iconBg: "bg-black/25", lightIconBg: "bg-white/30", accentText: "text-indigo-600" },
  "🪥": { gradient: "from-teal-800/60 via-cyan-900/40 to-sky-900/50", lightGradient: "from-teal-400 to-cyan-500", iconBg: "bg-black/25", lightIconBg: "bg-white/30", accentText: "text-teal-600" },
  "❤️": { gradient: "from-red-800/60 via-rose-900/40 to-pink-900/50", lightGradient: "from-rose-400 to-red-500", iconBg: "bg-black/25", lightIconBg: "bg-white/30", accentText: "text-rose-600" },
  "🌅": { gradient: "from-amber-800/60 via-orange-900/40 to-red-900/50", lightGradient: "from-amber-400 to-orange-500", iconBg: "bg-black/25", lightIconBg: "bg-white/30", accentText: "text-amber-600" },
  "🔥": { gradient: "from-red-800/60 via-orange-900/40 to-amber-900/50", lightGradient: "from-red-400 to-orange-500", iconBg: "bg-black/25", lightIconBg: "bg-white/30", accentText: "text-red-600" },
  "🏃": { gradient: "from-teal-800/60 via-emerald-900/40 to-green-900/50", lightGradient: "from-teal-400 to-emerald-500", iconBg: "bg-black/25", lightIconBg: "bg-white/30", accentText: "text-teal-600" },
  "💓": { gradient: "from-pink-800/60 via-rose-900/40 to-red-900/50", lightGradient: "from-pink-400 to-rose-500", iconBg: "bg-black/25", lightIconBg: "bg-white/30", accentText: "text-pink-600" },
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

        {/* LIGHT MODE: colored header band + white body */}
        <div className="dark:hidden">
          {/* Colored header */}
          <div className={`bg-gradient-to-r ${colors.lightGradient} px-4 py-2.5`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-[18px] ${colors.lightIconBg}`}>{tracker.icon || "📊"}</div>
                <div>
                  <h3 className="text-[14px] font-bold text-white tracking-tight">{tracker.name}</h3>
                  <p className="text-[11px] text-white/70">{tracker.target_value ? `${metaText} · target ${tracker.target_value}` : metaText}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 rounded-lg px-2 py-0.5 bg-white/20">
                <Flame className="h-3 w-3 text-white" /><span className="text-[11px] font-bold text-white">3</span>
              </div>
            </div>
          </div>
          {/* White body */}
          <div className="bg-white px-4 py-2.5 border-x border-b border-border/50 rounded-b-2xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex gap-0.5 mb-1">
                  {[1,2,3,4,5].map((s) => <Star key={s} className={`h-2.5 w-2.5 ${s <= 1 ? "text-amber-500 fill-amber-500" : "text-gray-200"}`} />)}
                  <span className="text-[9px] text-gray-400 ml-1">Everyday</span>
                </div>
                <div className={`text-[11px] font-semibold ${hasValue ? "text-green-600" : "text-gray-400"}`}>
                  {hasValue ? "✓ Logged" : "Tap to log"}
                </div>
              </div>
              <div onClick={(e) => e.preventDefault()}>
                <EntryInput type={tracker.type} unit={tracker.unit} unitSecondary={tracker.unit_secondary} entry={entry} defaultValue={default_value} color={tracker.color} onUpdate={onUpdate} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </NavLink>
  )
}
