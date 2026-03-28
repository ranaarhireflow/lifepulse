import { ChevronUp, ChevronRight, ChevronDown, X, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { SuggestedHabit } from "@/data/suggested-habits"

interface SuggestedHabitRowProps {
  habit: SuggestedHabit
  index: number
  isExpanded: boolean
  onToggleExpand: () => void
  onDismiss: () => void
  onAccept: () => void
  /** Animation delay offset for staggered entrance */
  initialShowCount: number
}

/**
 * A single row in the suggested habits list.
 * Collapsed: shows name, fit badge, description.
 * Expanded: shows gradient card with stat boosts, study, and action buttons.
 */
export function SuggestedHabitRow({
  habit,
  index,
  isExpanded,
  onToggleExpand,
  onDismiss,
  onAccept,
  initialShowCount,
}: SuggestedHabitRowProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ delay: index < initialShowCount ? 0.65 + index * 0.04 : 0 }}
    >
      {/* Row — clickable */}
      <button
        onClick={onToggleExpand}
        className="flex items-center w-full px-4 py-3.5 text-left hover:bg-secondary transition-colors"
      >
        {/* Colored circle with first letter */}
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full shrink-0 text-[15px] font-black text-white"
          style={{ background: habit.circleColor }}
        >
          {habit.name.charAt(0)}
        </div>

        {/* Name + description + fit badge */}
        <div className="ml-3 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-bold text-foreground truncate">
              {habit.name}
            </span>
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
              style={{
                backgroundColor: `${habit.circleColor}20`,
                color: habit.circleColor,
              }}
            >
              {habit.fit}% fit
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
            {habit.description}
          </p>
        </div>

        {/* Chevron */}
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground/70 shrink-0 ml-2" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground/70 shrink-0 ml-2" />
        )}
      </button>

      {/* Expanded detail view */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {/* Gradient header */}
            <div
              className="mx-3 rounded-xl p-4 mb-3"
              style={{ background: habit.gradient }}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-[20px] font-black text-white tracking-wide leading-tight">
                  {habit.name}
                </h3>
                <div className="flex items-center gap-1 bg-black/30  rounded-full px-2.5 py-1 shrink-0">
                  <span className="text-[11px] font-bold text-[#22C55E]">{habit.fit}%</span>
                  <span className="text-[10px] text-white/50">fit</span>
                </div>
              </div>

              {/* Stat boost badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                {habit.boosts.map(boost => (
                  <div
                    key={boost.stat}
                    className="flex items-center gap-1.5 bg-black/25  rounded-lg px-2.5 py-1.5"
                  >
                    <ChevronUp className="h-3 w-3" style={{ color: boost.color }} />
                    <span className="text-[11px] font-bold text-white">
                      +{boost.pct}%
                    </span>
                    <span className="text-[10px] text-white/60">{boost.stat}</span>
                  </div>
                ))}
              </div>

              {/* Scientific study */}
              <div className="bg-black/20  rounded-lg p-3 mb-3">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">
                  Scientific Study
                </p>
                <p className="text-[11px] text-white/70 leading-relaxed">
                  {habit.study}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); onDismiss() }}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-black/30  py-2.5 text-[13px] font-bold text-white/70 hover:bg-black/40 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Decline
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onAccept() }}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#22C55E] py-2.5 text-[13px] font-bold text-black hover:bg-[#22C55E]/90 transition-colors shadow-[0_0_16px_rgba(34,197,94,0.3)]"
                >
                  <Check className="h-4 w-4" />
                  Add to my program
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
