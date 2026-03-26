import { motion } from "framer-motion"
import { BarChart3, Flame } from "lucide-react"
import { Card } from "@/components/ui/card"
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="relative overflow-hidden transition-shadow hover:shadow-md"
        style={{
          borderLeft: `3px solid ${color}`,
        }}
      >
        <div className="flex items-center gap-4 p-4">
          {/* Icon + Name */}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
              style={{ backgroundColor: `${color}12` }}
            >
              {tracker.icon || "📊"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{tracker.name}</p>
              <div className="flex items-center gap-2">
                {tracker.target_value && (
                  <span className="text-xs text-muted-foreground">
                    Goal: {tracker.target_value}
                    {tracker.unit ? ` ${tracker.unit}` : ""}
                  </span>
                )}
                {streak !== undefined && streak > 0 && (
                  <span
                    className="flex items-center gap-0.5 text-xs font-medium"
                    style={{ color }}
                  >
                    <Flame className="h-3 w-3" />
                    {streak}
                  </span>
                )}
              </div>
            </div>
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
            className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
          </NavLink>
        </div>

        {/* Subtle completion indicator */}
        {hasValue && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            className="absolute bottom-0 left-0 h-0.5 w-full origin-left"
            style={{ backgroundColor: color }}
          />
        )}
      </Card>
    </motion.div>
  )
}
