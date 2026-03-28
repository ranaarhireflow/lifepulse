import { NavLink } from "react-router-dom"
import { TrendingUp, Zap, LayoutGrid, Trophy, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const TABS = [
  { to: "/progress", icon: TrendingUp, label: "Progress" },
  { to: "/score", icon: Zap, label: "Score" },
  { to: "/", icon: LayoutGrid, label: "Today", center: true },
  { to: "/achievements", icon: Trophy, label: "Awards" },
  { to: "/settings", icon: Settings, label: "Settings" },
]

export function BottomNav() {
  return (
    <nav className="shrink-0 px-3 pt-1" style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom, 12px))" }}>
      <div className="flex items-center justify-around rounded-2xl bg-card border border-border py-2 px-1">
        {TABS.map((tab) => (
          <NavLink key={tab.to} to={tab.to} end={tab.to === "/"}
            className={({ isActive }) => cn(
              "flex flex-col items-center gap-0.5 rounded-xl transition-all",
              tab.center ? "py-1 px-4" : "py-2 px-3",
              isActive
                ? tab.center
                  ? "bg-primary text-primary-foreground shadow-[0_0_12px_rgba(34,197,94,0.3)]"
                  : "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}>
            <tab.icon className={tab.center ? "h-6 w-6" : "h-5 w-5"} />
            <span className={cn("font-semibold", tab.center ? "text-[9px]" : "text-[10px]")}>{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
