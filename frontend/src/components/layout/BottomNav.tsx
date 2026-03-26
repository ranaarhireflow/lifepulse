import { NavLink } from "react-router-dom"
import { LayoutGrid, TrendingUp, Zap, User } from "lucide-react"
import { cn } from "@/lib/utils"

const TABS = [
  { to: "/", icon: LayoutGrid, label: "Today" },
  { to: "/progress", icon: TrendingUp, label: "Progress" },
  { to: "/score", icon: Zap, label: "Score" },
  { to: "/profile", icon: User, label: "Profile" },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-32px)] max-w-lg">
      <div className="flex items-center justify-around rounded-2xl bg-card/80 backdrop-blur-xl border border-border py-2 px-2 shadow-2xl">
        {TABS.map((tab) => (
          <NavLink key={tab.to} to={tab.to} end={tab.to === "/"}
            className={({ isActive }) => cn(
              "flex flex-col items-center gap-0.5 py-2 px-5 rounded-xl transition-all",
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
