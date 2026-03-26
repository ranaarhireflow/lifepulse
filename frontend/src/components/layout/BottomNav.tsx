import { NavLink } from "react-router-dom"
import { LayoutGrid, Activity, Zap, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { to: "/", icon: LayoutGrid, label: "Today" },
  { to: "/trackers", icon: Activity, label: "Pulses" },
  { to: "/score", icon: Zap, label: "Score" },
  { to: "/settings", icon: Settings, label: "Settings" },
]

export function BottomNav({ className }: { className?: string }) {
  return (
    <nav className={cn("fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.04] bg-[#060D08]/95 backdrop-blur-xl safe-area-bottom", className)}>
      <div className="flex items-center justify-around py-2 px-4">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === "/"}
            className={({ isActive }) =>
              cn("flex flex-col items-center gap-0.5 py-1 px-4 rounded-xl transition-all",
                isActive ? "text-primary" : "text-white/25")
            }>
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-semibold">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
