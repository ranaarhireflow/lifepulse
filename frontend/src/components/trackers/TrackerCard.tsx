import { ChevronRight } from "lucide-react"
import { EntryInput } from "@/components/entries/EntryInput"
import { NavLink } from "react-router-dom"
import type { DailyTrackerEntry, Entry } from "@/services/trackers"

interface TrackerCardProps {
  data: DailyTrackerEntry
  onUpdate: (data: Partial<Entry>) => void
}

// Pastel icon backgrounds per type
const ICON_BG: Record<string, string> = {
  "⚖️": "#E5EEE8", "💧": "#E0F2FE", "🏋️": "#DCFCE7", "🧠": "#E8EDE8",
  "📖": "#DBEAFE", "🌙": "#E0E7FF", "🪥": "#CCFBF1", "❤️": "#FCE7F3",
  "🌅": "#FEF3C7", "👣": "#DCFCE7", "🔥": "#FEF3C7", "💓": "#FCE7F3",
  "🏃": "#CCFBF1", "⏱️": "#E0F2FE", "📝": "#E5EEE8", "🧘": "#E8EDE8",
  "✍️": "#E5EEE8", "📱": "#FCE7F3", "🥗": "#DCFCE7", "🚫": "#FCE7F3",
  "🙏": "#FEF3C7", "😊": "#FEF3C7", "💰": "#DCFCE7", "☕": "#FEF3C7",
  "🎯": "#E5EEE8", "💪": "#DCFCE7", "✨": "#FEF3C7",
}

export function TrackerCard({ data, onUpdate }: TrackerCardProps) {
  const { tracker, entry, default_value } = data
  const hasValue = entry !== null

  const targetPct =
    tracker.target_value && entry?.value_numeric
      ? Math.min(100, Math.round((entry.value_numeric / tracker.target_value) * 100))
      : null

  const iconBg = ICON_BG[tracker.icon || ""] || "#E5EEE8"

  return (
    <div className="group flex items-center gap-3 rounded-[14px] border border-border bg-card p-3 transition-all hover:border-[#B8C8B8] hover:shadow-sm hover:-translate-y-px cursor-pointer">
      {/* Icon */}
      <div
        className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[12px] text-xl"
        style={{ backgroundColor: iconBg }}
      >
        {tracker.icon || "📊"}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[13.5px] font-bold truncate">{tracker.name}</span>
          {/* Streak badge - placeholder, will be dynamic */}
        </div>
        {tracker.unit && (
          <p className="text-[10.5px] text-muted-foreground mt-0.5">
            {tracker.target_value ? `Target: ${tracker.target_value} ${tracker.unit}` : tracker.unit}
          </p>
        )}
        {!tracker.unit && tracker.type === "BOOLEAN" && (
          <p className="text-[10.5px] text-muted-foreground mt-0.5">Yes / No</p>
        )}
        {!tracker.unit && tracker.type === "TIME" && (
          <p className="text-[10.5px] text-muted-foreground mt-0.5">Time</p>
        )}
        {/* Mini progress bar */}
        {targetPct !== null && (
          <div className="flex items-center gap-1.5 mt-1">
            <div className="h-[3.5px] flex-1 max-w-[80px] overflow-hidden rounded-full bg-[#E5EBE5] dark:bg-muted">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${targetPct}%`,
                  backgroundColor: targetPct >= 100 ? "#22C55E" : "#16A34A",
                }}
              />
            </div>
            <span className="text-[10px] font-bold" style={{ color: targetPct >= 100 ? "#22C55E" : "#16A34A" }}>
              {targetPct}%
            </span>
          </div>
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
          color={tracker.color}
          onUpdate={onUpdate}
        />
      </div>

      {/* Detail link */}
      <NavLink
        to={`/trackers/${tracker.id}`}
        className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground/30 hover:text-foreground hover:bg-accent transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <ChevronRight className="h-4 w-4" />
      </NavLink>
    </div>
  )
}
