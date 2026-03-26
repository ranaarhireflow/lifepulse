import { NavLink } from "react-router-dom"
import { LayoutGrid, TrendingUp, Zap, Bell, Settings, LogOut, Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"
import { PulseLogo } from "@/components/common/PulseLogo"
import { useAuth } from "@/store/auth-context"
import { useTheme } from "@/hooks/useTheme"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const NAV_ITEMS = [
  { to: "/", icon: LayoutGrid, label: "Today", end: true },
  { to: "/progress", icon: TrendingUp, label: "Progress", end: false },
  { to: "/score", icon: Zap, label: "Score", end: false },
  { to: "/alarms", icon: Bell, label: "Alarms", end: false },
  { to: "/settings", icon: Settings, label: "Settings", end: false },
]

export function Sidebar({ className }: { className?: string }) {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const initials = user?.display_name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?"

  return (
    <aside className={cn("w-[72px] flex-col items-center bg-black py-6 border-r border-[#1C1C1E]", className)}>
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
                  : "text-sidebar-foreground/30 hover:text-sidebar-foreground/60 hover:bg-black-accent"
              )
            }
          >
            <item.icon className="h-[20px] w-[20px]" />
          </NavLink>
        ))}
      </nav>

      {/* Bottom — theme toggle, sign out, avatar */}
      <div className="flex flex-col items-center gap-3 mt-auto">
        <button onClick={toggleTheme} title={theme === "dark" ? "Switch to light" : "Switch to dark"}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-sidebar-foreground/30 hover:text-sidebar-foreground/60 hover:bg-black-accent transition-all">
          {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </button>

        <button onClick={signOut} title="Sign out"
          className="flex h-11 w-11 items-center justify-center rounded-xl text-sidebar-foreground/20 hover:text-red-400 hover:bg-red-400/10 transition-all">
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
