import { NavLink } from "react-router-dom"
import { LayoutGrid, TrendingUp, Zap, Bell, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const TABS = [
  { to: "/", icon: LayoutGrid, label: "Today" },
  { to: "/progress", icon: TrendingUp, label: "Progress" },
  { to: "/score", icon: Zap, label: "Score" },
  { to: "/alarms", icon: Bell, label: "Alarms" },
  { to: "/settings", icon: Settings, label: "Settings" },
]

export function BottomNav() {
  return (
    <nav className="shrink-0 px-3 pt-1" style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom, 12px))" }}>
      <div className="flex items-center justify-around rounded-2xl bg-card border border-border py-2 px-1">
        {TABS.map((tab) => (
          <NavLink key={tab.to} to={tab.to} end={tab.to === "/"}
            className={({ isActive }) => cn(
              "flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all",
              isActive ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
            )}>
            <tab.icon className="h-5 w-5" />
            <span className="text-[10px] font-semibold">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
