import { motion } from "framer-motion"
import { Flame, Star } from "lucide-react"
import { EntryInput } from "@/components/entries/EntryInput"
import { NavLink } from "react-router-dom"
import type { DailyTrackerEntry, Entry } from "@/services/trackers"

interface TrackerCardProps {
  data: DailyTrackerEntry
  onUpdate: (data: Partial<Entry>) => void
}

// CSS artwork scenes — multi-layer gradients that create PAINTINGS
const SCENES: Record<string, { bg: string; narrative: string }> = {
  "💧": {
    bg: "radial-gradient(ellipse at 30% 80%, #0c4a6e 0%, #0e7490 35%, #155e75 60%, #164e63 100%), linear-gradient(180deg, rgba(14,116,144,0.3) 0%, rgba(8,51,68,0.8) 100%)",
    narrative: "Stay hydrated, stay sharp",
  },
  "🏋️": {
    bg: "radial-gradient(ellipse at 70% 20%, #ea580c 0%, #c2410c 30%, #9a3412 55%, #7c2d12 100%), linear-gradient(135deg, rgba(234,88,12,0.2) 0%, rgba(124,45,18,0.6) 100%)",
    narrative: "Build strength, build character",
  },
  "🧠": {
    bg: "radial-gradient(circle at 80% 10%, #7c3aed 0%, #4c1d95 35%, #2e1065 60%, #1e1b4b 100%), linear-gradient(225deg, rgba(124,58,237,0.15) 0%, rgba(15,10,46,0.7) 100%)",
    narrative: "Focus is your superpower",
  },
  "📖": {
    bg: "radial-gradient(ellipse at 20% 70%, #059669 0%, #047857 35%, #065f46 60%, #064e3b 100%), linear-gradient(135deg, rgba(5,150,105,0.2) 0%, rgba(6,78,59,0.7) 100%)",
    narrative: "Feed your mind daily",
  },
  "⚖️": {
    bg: "radial-gradient(ellipse at 50% 30%, #4338ca 0%, #3730a3 35%, #312e81 60%, #1e1b4b 100%), linear-gradient(180deg, rgba(67,56,202,0.2) 0%, rgba(30,27,75,0.7) 100%)",
    narrative: "Track your body's journey",
  },
  "🌙": {
    bg: "radial-gradient(circle at 70% 20%, #312e81 0%, #1e1b4b 40%, #0f0a2e 70%, #000 100%), linear-gradient(180deg, rgba(49,46,129,0.1) 0%, rgba(0,0,0,0.9) 100%)",
    narrative: "Rest well, rise strong",
  },
  "🪥": {
    bg: "radial-gradient(ellipse at 30% 40%, #0891b2 0%, #0e7490 35%, #155e75 60%, #164e63 100%), linear-gradient(135deg, rgba(8,145,178,0.2) 0%, rgba(22,78,99,0.7) 100%)",
    narrative: "Start every day right",
  },
  "❤️": {
    bg: "radial-gradient(ellipse at 50% 50%, #e11d48 0%, #be123c 35%, #9f1239 60%, #881337 100%), linear-gradient(180deg, rgba(225,29,72,0.2) 0%, rgba(136,19,55,0.7) 100%)",
    narrative: "Know your numbers, own your health",
  },
  "🌅": {
    bg: "radial-gradient(ellipse at 50% 80%, #f59e0b 0%, #d97706 25%, #b45309 50%, #92400e 100%), linear-gradient(0deg, rgba(245,158,11,0.3) 0%, rgba(146,64,14,0.8) 100%)",
    narrative: "Rise before everyone, seize the day",
  },
  "🔥": {
    bg: "radial-gradient(ellipse at 40% 60%, #dc2626 0%, #b91c1c 30%, #991b1b 55%, #7f1d1d 100%), linear-gradient(135deg, rgba(220,38,38,0.2) 0%, rgba(127,29,29,0.7) 100%)",
    narrative: "Push beyond your limits",
  },
  "🏃": {
    bg: "radial-gradient(ellipse at 60% 30%, #0d9488 0%, #0f766e 35%, #115e59 60%, #134e4a 100%), linear-gradient(180deg, rgba(13,148,136,0.2) 0%, rgba(19,78,74,0.7) 100%)",
    narrative: "Every step counts",
  },
  "💓": {
    bg: "radial-gradient(circle at 50% 40%, #ec4899 0%, #db2777 35%, #be185d 60%, #9d174d 100%), linear-gradient(180deg, rgba(236,72,153,0.2) 0%, rgba(157,23,77,0.7) 100%)",
    narrative: "Listen to your heart",
  },
}

const DEFAULT_SCENE = {
  bg: "radial-gradient(ellipse at 50% 50%, #16a34a 0%, #15803d 35%, #166534 60%, #14532d 100%)",
  narrative: "Track it. Master it.",
}

export function TrackerCard({ data, onUpdate }: TrackerCardProps) {
  const { tracker, entry, default_value } = data
  const hasValue = entry !== null
  const scene = SCENES[tracker.icon || ""] || DEFAULT_SCENE

  return (
    <NavLink to={`/trackers/${tracker.id}`}>
      <motion.div
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.01 }}
        className={`relative overflow-hidden rounded-[20px] transition-all cursor-pointer ${
          hasValue ? "opacity-60 ring-2 ring-primary/30" : "hover:shadow-2xl hover:shadow-primary/10"
        }`}
        style={{ minHeight: "180px" }}
      >
        {/* CSS Artwork Background */}
        <div
          className="absolute inset-0"
          style={{ background: scene.bg }}
        />

        {/* Noise texture overlay for depth */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")"
        }} />

        {/* Bottom gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Content */}
        <div className="relative h-full flex flex-col justify-between p-5">
          {/* Top row */}
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md text-[26px] shadow-lg">
              {tracker.icon || "📊"}
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-black/30 backdrop-blur-md px-3 py-1">
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-[13px] font-bold text-amber-400">3 days</span>
            </div>
          </div>

          {/* Middle — title + narrative */}
          <div className="mt-auto">
            <h3 className="text-[22px] font-extrabold text-white tracking-tight" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>
              {tracker.name}
            </h3>
            <p className="text-[13px] text-white/50 italic mt-0.5" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
              "{scene.narrative}"
            </p>

            {/* Stars + metadata */}
            <div className="flex items-center gap-3 mt-2">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className={`h-3 w-3 ${s <= 2 ? "text-amber-400 fill-amber-400" : "text-white/20"}`} />
                ))}
              </div>
              <span className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">Repeat: Everyday</span>
            </div>
          </div>

          {/* Bottom — input + status */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10" onClick={(e) => e.preventDefault()}>
            <span className={`text-[12px] font-semibold ${hasValue ? "text-emerald-400" : "text-white/30"}`}>
              {hasValue ? "✓ Logged" : "Tap to log"}
            </span>
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
