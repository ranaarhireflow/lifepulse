import { BarChart3 } from "lucide-react"

export function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          View trends and insights across all your trackers
        </p>
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          <BarChart3 className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold">No data yet</h3>
        <p className="text-sm text-muted-foreground">
          Start tracking to see your trends and analytics here.
        </p>
      </div>
    </div>
  )
}
