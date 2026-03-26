import { useAuth } from "@/store/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Moon, Sun, Bell } from "lucide-react"
import { NavLink } from "react-router-dom"
import { useTheme } from "@/hooks/useTheme"
import { PulseLogo } from "@/components/common/PulseLogo"
import { BRAND } from "@/lib/brand"

export function Header() {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const initials = user?.display_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?"

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4 lg:px-6">
      {/* Mobile: logo — clickable */}
      <NavLink to="/" className="flex items-center gap-2 lg:hidden">
        <PulseLogo size={32} />
        <span className="font-extrabold text-sm">{BRAND.name}</span>
      </NavLink>

      {/* Desktop: empty left space */}
      <div className="hidden lg:block" />

      {/* Right: user menu */}
      <div className="flex items-center gap-2">
        <button className="relative rounded-[10px] border border-border bg-card p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="h-4 w-4" />
          <div className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
        </button>

        <button
          onClick={toggleTheme}
          className="rounded-[10px] border border-border bg-card p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none">
            <Avatar className="h-8 w-8 cursor-pointer rounded-[10px]">
              <AvatarImage src={user?.photo_url || ""} />
              <AvatarFallback className="rounded-[10px] bg-gradient-to-br from-[#1A3526] to-[#16A34A] text-white text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user?.display_name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
