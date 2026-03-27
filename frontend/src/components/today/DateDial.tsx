import { format, addDays, isToday, startOfWeek, isBefore, isAfter, subDays } from "date-fns"

interface DateDialProps {
  selectedDate: Date
  onSelectDate: (date: Date) => void
}

/**
 * Horizontal week strip (Sun-Sat) with selectable date buttons.
 * Dates more than 5 days ago or in the future are disabled.
 */
export function DateDial({ selectedDate, onSelectDate }: DateDialProps) {
  const dateStr = format(selectedDate, "yyyy-MM-dd")
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 }) // Sunday
  const today = new Date()
  const fiveDaysAgo = subDays(today, 5)

  return (
    <div className="flex gap-1.5 px-3 pb-2 shrink-0 overflow-x-auto scrollbar-hide">
      {Array.from({ length: 7 }, (_, i) => {
        const d = addDays(weekStart, i)
        const isSelected = format(d, "yyyy-MM-dd") === dateStr
        const dayIsToday = isToday(d)
        const isFuture = isAfter(d, today)
        const isTooOld = isBefore(d, fiveDaysAgo)
        const disabled = isFuture || isTooOld
        return (
          <button key={i} onClick={() => !disabled && onSelectDate(d)} disabled={disabled}
            className={`flex flex-col items-center flex-1 min-w-[42px] py-2 px-1 rounded-xl transition-all ${
              isSelected
                ? "bg-[#22C55E] text-black shadow-[0_0_12px_rgba(34,197,94,0.3)]"
                : disabled
                  ? "text-muted-foreground/30"
                  : "bg-card border border-border text-muted-foreground hover:border-primary/40"
            }`}>
            <span className="text-[9px] font-bold uppercase">
              {dayIsToday ? "Today" : format(d, "EEE")}
            </span>
            <span className={`text-[16px] font-black mt-0.5 ${dayIsToday && !isSelected ? "text-primary" : ""}`}>
              {format(d, "d")}
            </span>
          </button>
        )
      })}
    </div>
  )
}
