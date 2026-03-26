import { NavLink } from "react-router-dom"
import {
  CalendarCheck,
  LayoutGrid,
  BarChart3,
  Settings,
  Plus,
  Flame,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { BRAND } from "@/lib/brand"
import { Button } from "@/components/ui/button"

const NAV_ITEMS = [
  { to: "/", icon: CalendarCheck, label: "Today", end: true },
  { to: "/trackers", icon: LayoutGrid, label: "Trackers", end: false },
  { to: "/analytics", icon: BarChart3, label: "Analytics", end: false },
  { to: "/settings", icon: Settings, label: "Settings", end: false },
]

export function Sidebar({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "w-64 flex-col border-r border-border/50 bg-sidebar p-4",
        className
      )}
    >
      {/* Logo */}
      <div className="mb-8 flex items-center gap-3 px-2 pt-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 text-white font-bold text-sm shadow-md shadow-primary/25">
          {BRAND.logo}
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight">{BRAND.name}</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{BRAND.tagline}</p>
        </div>
      </div>

      {/* Quick add */}
      <NavLink to="/trackers/new">
        <Button className="mb-6 w-full gap-2 rounded-xl shadow-sm" size="sm">
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
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              )
            }
          >
            <item.icon className="h-[18px] w-[18px]" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Motivation footer */}
      <div className="mt-auto rounded-xl bg-gradient-to-br from-primary/5 to-purple-500/5 border border-primary/10 p-4">
        <div className="flex items-center gap-2 mb-1">
          <Flame className="h-4 w-4 text-orange-500" />
          <span className="text-xs font-semibold">Stay Consistent</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Small daily actions lead to big results. Keep tracking!
        </p>
      </div>
    </aside>
  )
}
