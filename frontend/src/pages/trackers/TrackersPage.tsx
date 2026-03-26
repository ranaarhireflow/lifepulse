import { NavLink } from "react-router-dom"
import { Plus, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TrackersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Trackers</h1>
          <p className="text-sm text-muted-foreground">
            Manage your habits and metrics
          </p>
        </div>
        <NavLink to="/trackers/new">
          <Button className="gap-2" size="sm">
            <Plus className="h-4 w-4" />
            New Tracker
          </Button>
        </NavLink>
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          <LayoutGrid className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold">No trackers created</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Start by creating trackers from templates or from scratch.
        </p>
        <NavLink to="/trackers/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Your First Tracker
          </Button>
        </NavLink>
      </div>
    </div>
  )
}
