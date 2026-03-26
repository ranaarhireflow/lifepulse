import { NavLink } from "react-router-dom"
import {
  CalendarCheck,
  LayoutGrid,
  BarChart3,
  Settings,
  Plus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const NAV_ITEMS = [
  { to: "/", icon: CalendarCheck, label: "Today" },
  { to: "/trackers", icon: LayoutGrid, label: "Trackers" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/settings", icon: Settings, label: "Settings" },
]

export function Sidebar({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "w-64 flex-col border-r border-border bg-sidebar p-4",
        className
      )}
    >
      {/* Logo */}
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg">
          T
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight">myTracker</h1>
          <p className="text-xs text-muted-foreground">Personal Tracker</p>
        </div>
      </div>

      {/* Quick add */}
      <NavLink to="/trackers/new">
        <Button className="mb-6 w-full gap-2" size="sm">
          <Plus className="h-4 w-4" />
          New Tracker
        </Button>
      </NavLink>

      {/* Nav links */}
      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
