import { Check, ArrowRight, Settings2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { DailyTrackerEntry, Entry } from "@/services/trackers"

const DIMENSION_EMOJI: Record<string, string> = {
  wisdom: "🧠", strength: "💪", focus: "🎯", discipline: "📚", confidence: "👤"
}

/**
 * Smart range defaults based on unit/habit type.
 * Used when tracker doesn't have explicit min/max set.
 */
function getSmartRange(tracker: DailyTrackerEntry["tracker"]): { min: number; max: number; step: number } {
  const unit = (tracker.unit || "").toLowerCase()
  const target = tracker.target_value

  // Use explicit min/max if set
  if (tracker.min_value != null && tracker.max_value != null) {
    const step = unit === "kg" || unit === "lbs" ? 0.1 : 1
    return { min: tracker.min_value, max: tracker.max_value, step }
  }

  // Smart defaults by unit
  switch (unit) {
    case "kg": return { min: 30, max: 200, step: 0.1 }
    case "lbs": return { min: 60, max: 440, step: 0.1 }
    case "glasses": return { min: 0, max: 15, step: 1 }
    case "l": case "liters": case "litres": return { min: 0, max: 6, step: 0.1 }
    case "ml": return { min: 0, max: 5000, step: 100 }
    case "pages": return { min: 0, max: 200, step: 1 }
    case "steps": return { min: 0, max: 30000, step: 500 }
    case "km": return { min: 0, max: 50, step: 0.5 }
    case "miles": return { min: 0, max: 30, step: 0.5 }
    case "cal": case "kcal": case "calories": return { min: 0, max: 5000, step: 50 }
    case "mg": return { min: 0, max: 1000, step: 10 }
    case "hrs": case "hours": return { min: 0, max: 24, step: 0.5 }
    case "reps": return { min: 0, max: 200, step: 1 }
    case "sets": return { min: 0, max: 20, step: 1 }
    default:
      // Fallback: use target * 2 or 100
      const max = target ? Math.ceil(target * 2) : 100
      return { min: 0, max, step: max > 50 ? 1 : 0.5 }
  }
}

interface HabitCardProps {
  data: DailyTrackerEntry
  scene: { bg: string; sub: string }
  onConfirm: () => void
  onNavigateEdit: () => void
  onUpdate: (trackerId: string, updates: Partial<Entry>) => void
  isConfirmed: boolean
  showConfirmAnim: boolean
}

/**
 * Full-bleed gradient card for a single habit.
 * Shows emoji, name, motivational quote, input control, and confirm button.
 */
export function HabitCard({
  data,
  scene,
  onConfirm,
  onNavigateEdit,
  onUpdate,
  isConfirmed,
  showConfirmAnim,
}: HabitCardProps) {
  const { tracker, entry } = data
  // Only show as "logged" when the entry was actually persisted (not a temp local entry)
  const logged = entry !== null && entry.id !== "t"

  return (
    <div
      className="h-full rounded-[28px] overflow-hidden relative"
      style={{ background: scene.bg }}
    >
      {/* Noise texture */}
      <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")" }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

      {/* Confirmed overlay animation */}
      <AnimatePresence>
        {showConfirmAnim && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
                className="h-20 w-20 rounded-full bg-primary flex items-center justify-center"
                style={{ boxShadow: "0 0 60px rgba(34,197,94,0.6)" }}
              >
                <Check className="h-10 w-10 text-white" strokeWidth={3} />
              </motion.div>
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-[22px] font-extrabold text-white"
              >
                Done ✓
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative h-full flex flex-col justify-between p-6 z-10">
        {/* Top — streak + edit + status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {tracker.times_per_day > 1 && (
              <div className="flex items-center gap-1 rounded-full bg-black/30 backdrop-blur px-2.5 py-1.5">
                <span className="text-[12px] font-bold text-sky-400">{tracker.times_per_day}x daily</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onNavigateEdit} className="flex h-8 w-8 items-center justify-center rounded-full bg-black/30 backdrop-blur text-white/50 hover:text-white transition-colors">
              <Settings2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Center — emoji + name + narrative */}
        <div className="text-center">
          <div className="text-[80px] mb-2 leading-none">{tracker.icon || "📊"}</div>
          <h2 className="text-[32px] font-black text-white tracking-tight" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>
            {tracker.name}
          </h2>
          <p className="text-[14px] text-white/40 italic mt-1" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>
            "{scene.sub}"
          </p>
          {tracker.target_value && (
            <p className="text-[12px] text-white/30 mt-2">Target: {tracker.target_value} {tracker.unit}</p>
          )}
          {/* Dimension badge */}
          {tracker.dimension && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px]">{DIMENSION_EMOJI[tracker.dimension]}</span>
              <span className="text-[10px] text-white/40 font-semibold capitalize">+{tracker.dimension}</span>
            </div>
          )}
        </div>

        {/* Bottom — input control + confirm button */}
        <div className="space-y-4">
          {/* Slider for NUMERIC — with smart range + tick marks */}
          {tracker.type === "NUMERIC" && (() => {
            const range = getSmartRange(tracker)
            const val = entry?.value_numeric ?? 0
            // Generate ~5 tick labels
            const ticks = Array.from({ length: 6 }, (_, i) => {
              const v = range.min + (range.max - range.min) * (i / 5)
              return range.step < 1 ? Math.round(v * 10) / 10 : Math.round(v)
            })
            return (
            <div className="space-y-2">
              <div className="text-center text-[36px] font-extrabold text-white" style={{ textShadow: "0 0 20px rgba(255,255,255,0.2)" }}>
                {range.step < 1 ? val.toFixed(1) : val}
                <span className="text-[16px] text-white/40 ml-1">{tracker.unit}</span>
              </div>
              {/* Slider */}
              <input type="range" min={range.min} max={range.max} step={range.step}
                value={val}
                onChange={(e) => onUpdate(tracker.id, { value_numeric: parseFloat(e.target.value) })}
                className="w-full h-2 rounded-full appearance-none bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(34,197,94,0.5)] [&::-webkit-slider-thumb]:cursor-grab"
              />
              {/* Tick marks */}
              <div className="flex justify-between px-1">
                {ticks.map((t, i) => (
                  <span key={i} className="text-[9px] text-white/25 font-bold">{t}</span>
                ))}
              </div>
              {/* Target indicator */}
              {tracker.target_value && (
                <div className="relative h-0">
                  <div className="absolute text-[9px] text-primary font-bold -top-1"
                    style={{ left: `${((tracker.target_value - range.min) / (range.max - range.min)) * 100}%`, transform: "translateX(-50%)" }}>
                    ▲ {tracker.target_value}
                  </div>
                </div>
              )}
            </div>
            )
          })()}

          {/* Toggle for BOOLEAN */}
          {tracker.type === "BOOLEAN" && (
            <button onClick={() => onUpdate(tracker.id, { value_boolean: !(entry?.value_boolean) })}
              className={`w-full h-16 rounded-2xl text-[18px] font-bold transition-all ${
                entry?.value_boolean ? "bg-primary text-white" : "bg-white/10 text-white/50 border border-white/10"
              }`} style={entry?.value_boolean ? { boxShadow: "0 0 30px rgba(34,197,94,0.4)" } : undefined}>
              {entry?.value_boolean ? "✓ Done" : "Tap to Complete"}
            </button>
          )}

          {/* Duration */}
          {tracker.type === "DURATION" && (
            <div className="space-y-2">
              <div className="text-center text-[36px] font-extrabold text-white">
                {Math.floor((entry?.value_duration || 0) / 60)}h {(entry?.value_duration || 0) % 60}m
              </div>
              <input type="range" min={0} max={480} step={15}
                value={entry?.value_duration ?? 0}
                onChange={(e) => onUpdate(tracker.id, { value_duration: parseInt(e.target.value) })}
                className="w-full h-2 rounded-full appearance-none bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(34,197,94,0.5)] [&::-webkit-slider-thumb]:cursor-grab"
              />
            </div>
          )}

          {/* Time */}
          {tracker.type === "TIME" && (
            <div className="flex justify-center">
              <input type="time" value={entry?.value_time || ""}
                onChange={(e) => onUpdate(tracker.id, { value_time: e.target.value || null })}
                className="text-[32px] font-extrabold bg-transparent text-white text-center border-none outline-none [color-scheme:dark]"
                style={{ textShadow: "0 0 20px rgba(255,255,255,0.2)" }}
              />
            </div>
          )}

          {/* Dual numeric (BP) */}
          {tracker.type === "DUAL_NUMERIC" && (
            <div className="flex items-center justify-center gap-3">
              <input type="number" value={entry?.value_numeric ?? ""} placeholder="120"
                onChange={(e) => onUpdate(tracker.id, { value_numeric: parseFloat(e.target.value) || null })}
                className="w-20 text-[32px] font-extrabold bg-transparent text-white text-center border-b-2 border-white/20 outline-none" />
              <span className="text-[24px] text-white/30">/</span>
              <input type="number" value={entry?.value_numeric2 ?? ""} placeholder="80"
                onChange={(e) => onUpdate(tracker.id, { value_numeric2: parseFloat(e.target.value) || null })}
                className="w-20 text-[32px] font-extrabold bg-transparent text-white text-center border-b-2 border-white/20 outline-none" />
            </div>
          )}

          {/* Text */}
          {tracker.type === "TEXT" && (
            <textarea value={entry?.value_text || ""} placeholder="Write your thoughts..."
              onChange={(e) => onUpdate(tracker.id, { value_text: e.target.value || null })}
              className="w-full h-24 rounded-2xl bg-white/10 border border-white/10 p-4 text-white placeholder:text-white/20 resize-none outline-none text-[15px]" />
          )}

          {/* Confirm button */}
          <motion.button
            onClick={onConfirm}
            whileTap={{ scale: 0.96 }}
            className={`w-full h-14 rounded-2xl text-[17px] font-extrabold tracking-wide flex items-center justify-center gap-2 transition-all ${
              (logged || isConfirmed)
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-primary text-white"
            }`}
            style={(logged || isConfirmed) ? undefined : { boxShadow: "0 0 30px rgba(34,197,94,0.5), 0 4px 20px rgba(34,197,94,0.3)" }}
          >
            {(logged || isConfirmed) ? (
              <><Check className="h-5 w-5" /> Confirmed</>
            ) : (
              <><ArrowRight className="h-5 w-5" /> Confirm</>
            )}
          </motion.button>

          {/* Swipe hint */}
          <p className="text-center text-[11px] text-white/20 font-semibold">&larr; Swipe to navigate &rarr;</p>
        </div>
      </div>
    </div>
  )
}
