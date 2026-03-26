import { motion } from "framer-motion"
import { BarChart3, Flame, ChevronRight } from "lucide-react"
import { EntryInput } from "@/components/entries/EntryInput"
import { NavLink } from "react-router-dom"
import type { DailyTrackerEntry, Entry } from "@/services/trackers"

interface TrackerCardProps {
  data: DailyTrackerEntry
  onUpdate: (data: Partial<Entry>) => void
  streak?: number
}

export function TrackerCard({ data, onUpdate, streak }: TrackerCardProps) {
  const { tracker, entry, default_value } = data
  const color = tracker.color || "#6366f1"
  const hasValue = entry !== null

  // Progress towards target
  const targetPct =
    tracker.target_value && entry?.value_numeric
      ? Math.min(100, Math.round((entry.value_numeric / tracker.target_value) * 100))
      : null

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border bg-card transition-all duration-200 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20"
    >
      {/* Left accent stripe */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl transition-all duration-300"
        style={{
          backgroundColor: hasValue ? color : `${color}30`,
        }}
      />

      <div className="flex items-center gap-3 p-4 pl-5">
        {/* Icon */}
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl transition-transform duration-200 group-hover:scale-105"
          style={{ backgroundColor: `${color}12` }}
        >
          {tracker.icon || "📊"}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold">{tracker.name}</p>
            {streak !== undefined && streak > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                style={{
                  backgroundColor: `${color}15`,
                  color,
                }}
              >
                <Flame className="h-3 w-3" />
                {streak}
              </motion.span>
            )}
          </div>

          {/* Target progress */}
          {targetPct !== null && (
            <div className="mt-1 flex items-center gap-2">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted max-w-[80px]">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: targetPct >= 100 ? "#22c55e" : color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${targetPct}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {targetPct}%
              </span>
            </div>
          )}

          {!targetPct && tracker.unit && (
            <p className="text-[11px] text-muted-foreground">{tracker.unit}</p>
          )}
        </div>

        {/* Input */}
        <div className="shrink-0">
          <EntryInput
            type={tracker.type}
            unit={tracker.unit}
            unitSecondary={tracker.unit_secondary}
            entry={entry}
            defaultValue={default_value}
            color={color}
            onUpdate={onUpdate}
          />
        </div>

        {/* Analytics link */}
        <NavLink
          to={`/trackers/${tracker.id}`}
          className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/40 hover:text-foreground hover:bg-accent transition-all"
        >
          <ChevronRight className="h-4 w-4" />
        </NavLink>
      </div>

      {/* Completion glow */}
      {hasValue && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            boxShadow: `inset 0 0 0 1px ${color}20`,
          }}
        />
      )}
    </div>
  )
}
