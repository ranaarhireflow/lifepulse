import { Check, ArrowRight, Settings2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { DailyTrackerEntry, Entry } from "@/services/trackers"
import { RulerInput } from "./RulerInput"

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
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

      {/* Confirmed overlay animation */}
      <AnimatePresence>
        {showConfirmAnim && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/50"
          >
            <div className="flex flex-col items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
                className="h-20 w-20 rounded-full bg-primary flex items-center justify-center"
                style={{ boxShadow: "0 0 60px rgba(34,197,94,0.6)" }}
              >
                <Check className="h-10 w-10 text-white" strokeWidth={3} />
              </motion.div>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15, delay: 0.1 }}
                className="text-[22px] font-extrabold text-white"
              >
                Done
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative h-full flex flex-col justify-between p-6 z-10">
        {/* Top — logged status + times + edit */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Show logged value if entry exists */}
            {logged && (
              <div className="flex items-center gap-1.5 rounded-full bg-primary/20 border border-primary/30 px-2.5 py-1">
                <Check className="h-3 w-3 text-primary" />
                <span className="text-[11px] font-bold text-primary">
                  {entry?.value_numeric != null ? `${entry.value_numeric}${tracker.unit ? ' ' + tracker.unit : ''}`
                    : entry?.value_boolean ? "Done"
                    : entry?.value_duration != null ? `${Math.floor(entry.value_duration/60)}h ${entry.value_duration%60}m`
                    : entry?.value_time || "Logged"}
                </span>
              </div>
            )}
            {tracker.times_per_day > 1 && (
              <div className="flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1.5">
                <span className="text-[12px] font-bold text-sky-400">{tracker.times_per_day}x</span>
              </div>
            )}
          </div>
          <button onClick={onNavigateEdit} className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white/50 hover:text-white transition-colors">
            <Settings2 className="h-3.5 w-3.5" />
          </button>
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
          {/* Ruler input for NUMERIC — starts at last value, target, or default */}
          {tracker.type === "NUMERIC" && (() => {
            const range = getSmartRange(tracker)
            const startValue = entry?.value_numeric ?? data.default_value ?? tracker.target_value ?? 0
            return (
              <div>
                <RulerInput
                  value={startValue}
                  min={range.min}
                  max={range.max}
                  step={range.step}
                  unit={tracker.unit || undefined}
                  onChange={(v) => onUpdate(tracker.id, { value_numeric: v })}
                />
                {/* Ideal range hint */}
                {tracker.target_value && (
                  <p className="text-center text-[10px] text-white/30 mt-1">
                    Target: {tracker.target_value} {tracker.unit}
                  </p>
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

          {/* Duration — ruler in minutes */}
          {tracker.type === "DURATION" && (
            <div>
              <RulerInput
                value={entry?.value_duration ?? data.default_value ?? 0}
                min={0}
                max={tracker.max_value || 480}
                step={15}
                unit="min"
                onChange={(v) => onUpdate(tracker.id, { value_duration: v })}
              />
              {tracker.target_value && (
                <p className="text-center text-[10px] text-white/30 mt-1">
                  Target: {Math.floor(tracker.target_value / 60)}h {tracker.target_value % 60}m
                </p>
              )}
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
              <><Check className="h-5 w-5" /> Update</>
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
