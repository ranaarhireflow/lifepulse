import { useState } from "react"
import { format, subDays, addDays, isToday } from "date-fns"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NavLink } from "react-router-dom"

export function DailyPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const today = new Date()
  const maxPastDate = subDays(today, 5)

  const canGoBack = selectedDate > maxPastDate
  const canGoForward = !isToday(selectedDate)

  return (
    <div className="space-y-6">
      {/* Date navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {isToday(selectedDate) ? "Today" : format(selectedDate, "EEEE")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {format(selectedDate, "MMMM d, yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedDate((d) => subDays(d, 1))}
            disabled={!canGoBack}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedDate(today)}
            disabled={isToday(selectedDate)}
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedDate((d) => addDays(d, 1))}
            disabled={!canGoForward}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          <Plus className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold">No trackers yet</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Create your first tracker to start logging your daily habits and metrics.
        </p>
        <NavLink to="/trackers/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Tracker
          </Button>
        </NavLink>
      </div>
    </div>
  )
}
