import { NavLink } from "react-router-dom"
import { LayoutGrid, Activity, Zap, Trophy, Settings, Plus, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { BRAND } from "@/lib/brand"
import { PulseLogo } from "@/components/common/PulseLogo"
import { useAuth } from "@/store/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const NAV_ITEMS = [
  { to: "/", icon: LayoutGrid, label: "Today", end: true },
  { to: "/trackers", icon: Activity, label: "My Pulses", end: false },
  { to: "/score", icon: Zap, label: "Monk Score", end: false },
  { to: "/achievements", icon: Trophy, label: "Achievements", end: false },
]

export function Sidebar({ className }: { className?: string }) {
  const { user, signOut } = useAuth()
  const initials = user?.display_name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?"

  return (
    <aside className={cn("w-[72px] flex-col items-center bg-[#060D08] py-6 border-r border-white/[0.04]", className)}>
      {/* Logo */}
      <NavLink to="/" className="mb-8">
        <PulseLogo size={38} />
      </NavLink>

      {/* Nav — icon only, vertical, centered */}
      <nav className="flex flex-1 flex-col items-center gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={item.label}
            className={({ isActive }) =>
              cn(
                "flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200",
                isActive
                  ? "bg-primary/15 text-primary shadow-sm shadow-primary/10"
                  : "text-white/30 hover:text-white/60 hover:bg-white/[0.04]"
              )
            }
          >
            <item.icon className="h-[20px] w-[20px]" />
          </NavLink>
        ))}

        {/* New Pulse */}
        <NavLink to="/trackers/new" title="New Pulse"
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all mt-2">
          <Plus className="h-[20px] w-[20px]" />
        </NavLink>
      </nav>

      {/* Bottom — Settings + Avatar */}
      <div className="flex flex-col items-center gap-3 mt-auto">
        <NavLink to="/settings" title="Settings"
          className={({ isActive }) =>
            cn("flex h-11 w-11 items-center justify-center rounded-xl transition-all",
              isActive ? "bg-primary/15 text-primary" : "text-white/30 hover:text-white/60 hover:bg-white/[0.04]")
          }>
          <Settings className="h-[20px] w-[20px]" />
        </NavLink>

        <button onClick={signOut} title="Sign out"
          className="flex h-11 w-11 items-center justify-center rounded-xl text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all">
          <LogOut className="h-[18px] w-[18px]" />
        </button>

        <Avatar className="h-9 w-9 rounded-xl">
          <AvatarImage src={user?.photo_url || ""} />
          <AvatarFallback className="rounded-xl bg-primary/20 text-primary text-[10px] font-bold">{initials}</AvatarFallback>
        </Avatar>
      </div>
    </aside>
  )
}
