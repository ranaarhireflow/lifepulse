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

  return (
    <div className="flex items-center rounded-[14px] border border-border bg-card p-3 transition-all hover:border-primary/20 hover:shadow-sm">
      {/* Icon */}
      <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[11px] bg-accent text-[18px]">
        {tracker.icon || "📊"}
      </div>

      {/* Name + meta — fixed width */}
      <div className="ml-3 w-[140px] shrink-0">
        <p className="text-[13px] font-bold truncate">{tracker.name}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
          {tracker.target_value && tracker.unit
            ? `Target: ${tracker.target_value} ${tracker.unit}`
            : tracker.unit || (tracker.type === "BOOLEAN" ? "Yes / No" : tracker.type === "TIME" ? "Time" : "")}
        </p>
        {targetPct !== null && (
          <div className="flex items-center gap-1.5 mt-1">
            <div className="h-[3px] w-[60px] overflow-hidden rounded-full bg-border">
              <div className="h-full rounded-full" style={{ width: `${targetPct}%`, backgroundColor: "#16A34A" }} />
            </div>
            <span className="text-[9px] font-bold text-primary">{targetPct}%</span>
          </div>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Input */}
      <div className="shrink-0">
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

      {/* Detail chevron */}
      <NavLink
        to={`/trackers/${tracker.id}`}
        className="ml-2 shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground/30 hover:text-foreground hover:bg-accent transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <ChevronRight className="h-4 w-4" />
      </NavLink>
    </div>
  )
}
