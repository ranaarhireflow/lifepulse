import { ChevronRight } from "lucide-react"
import { EntryInput } from "@/components/entries/EntryInput"
import { NavLink } from "react-router-dom"
import type { DailyTrackerEntry, Entry } from "@/services/trackers"

interface TrackerCardProps {
  data: DailyTrackerEntry
  onUpdate: (data: Partial<Entry>) => void
}

export function TrackerCard({ data, onUpdate }: TrackerCardProps) {
  const { tracker, entry, default_value } = data

  const targetPct =
    tracker.target_value && entry?.value_numeric
      ? Math.min(100, Math.round((entry.value_numeric / tracker.target_value) * 100))
      : null

  const metaText = tracker.target_value && tracker.unit
    ? `${tracker.unit} · target ${tracker.target_value}`
    : tracker.unit || (tracker.type === "BOOLEAN" ? "yes / no" : tracker.type === "TIME" ? "time" : tracker.type === "DURATION" ? "hours" : "")

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 transition-all hover:border-primary/20">
      {/* Icon */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-accent text-[17px]">
        {tracker.icon || "📊"}
      </div>

      {/* Name + meta */}
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-bold truncate leading-tight">{tracker.name}</p>
        {metaText && <p className="text-[10px] text-muted-foreground truncate">{metaText}</p>}
        {targetPct !== null && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="h-[3px] w-14 overflow-hidden rounded-full bg-border">
              <div className="h-full rounded-full bg-primary" style={{ width: `${targetPct}%` }} />
            </div>
            <span className="text-[9px] font-bold text-primary">{targetPct}%</span>
          </div>
        )}
      </div>

      {/* Input */}
      <EntryInput
        type={tracker.type}
        unit={tracker.unit}
        unitSecondary={tracker.unit_secondary}
        entry={entry}
        defaultValue={default_value}
        color={tracker.color}
        onUpdate={onUpdate}
      />

      {/* Chevron */}
      <NavLink
        to={`/trackers/${tracker.id}`}
        className="shrink-0 text-muted-foreground/25 hover:text-foreground transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <ChevronRight className="h-4 w-4" />
      </NavLink>
    </div>
  )
}
