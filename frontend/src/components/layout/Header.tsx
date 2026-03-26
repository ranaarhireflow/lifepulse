import { useState } from "react"
import { useAuth } from "@/store/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Moon, Sun, Bell, BellOff, Check } from "lucide-react"
import { NavLink } from "react-router-dom"
import { useTheme } from "@/hooks/useTheme"
import { PulseLogo } from "@/components/common/PulseLogo"
import { BRAND } from "@/lib/brand"
import { ConfigDrawer } from "@/components/common/ConfigDrawer"
import { Button } from "@/components/ui/button"

export function Header() {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  )

  const initials = user?.display_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?"

  const requestPermission = async () => {
    if (typeof Notification === "undefined") return
    const perm = await Notification.requestPermission()
    setNotifPermission(perm)
    if (perm === "granted") {
      new Notification("LifePulse", {
        body: "Notifications enabled! You'll receive reminders for your pulses.",
        icon: "/favicon.svg",
      })
    }
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4 lg:px-6">
      {/* Mobile: logo */}
      <NavLink to="/" className="flex items-center gap-2 lg:hidden">
        <PulseLogo size={32} />
        <span className="font-extrabold text-sm">{BRAND.name}</span>
      </NavLink>

      <div className="hidden lg:block" />

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button
          onClick={() => setNotifOpen(true)}
          className="relative rounded-[10px] border border-border bg-card p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Bell className="h-4 w-4" />
          {notifPermission !== "granted" && (
            <div className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
          )}
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-[10px] border border-border bg-card p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none">
            <Avatar className="h-8 w-8 cursor-pointer rounded-[10px]">
              <AvatarImage src={user?.photo_url || ""} />
              <AvatarFallback className="rounded-[10px] bg-gradient-to-br from-[#1A3526] to-[#16A34A] text-white text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[240px]">
            <div className="px-3 py-2">
              <p className="text-sm font-bold">{user?.display_name}</p>
              <p className="text-xs text-muted-foreground break-all">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Notifications drawer */}
      <ConfigDrawer open={notifOpen} onClose={() => setNotifOpen(false)} title="Notifications" description="Manage how you get reminded">
        <div className="space-y-6">
          {/* Permission status */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-secondary/50">
              <h3 className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">
                Browser Notifications
              </h3>
            </div>
            <div className="p-4">
              {notifPermission === "granted" ? (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-primary">Enabled</p>
                    <p className="text-[11px] text-muted-foreground">You'll receive push reminders</p>
                  </div>
                </div>
              ) : notifPermission === "denied" ? (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                    <BellOff className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-destructive">Blocked</p>
                    <p className="text-[11px] text-muted-foreground">Enable in browser settings to receive alerts</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                      <Bell className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold">Not Enabled</p>
                      <p className="text-[11px] text-muted-foreground">Enable to get daily pulse reminders</p>
                    </div>
                  </div>
                  <Button onClick={requestPermission} size="sm" className="w-full gap-2">
                    <Bell className="h-4 w-4" />
                    Enable Notifications
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* How it works */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-secondary/50">
              <h3 className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">
                How Reminders Work
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {[
                { step: "1", text: "Configure alerts on each pulse (time + days)" },
                { step: "2", text: "Enable browser notifications above" },
                { step: "3", text: "Get reminded at the times you set" },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                    {s.step}
                  </div>
                  <p className="text-[12px] text-muted-foreground pt-0.5">{s.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Manage per pulse */}
          <div className="text-center">
            <p className="text-[11px] text-muted-foreground mb-2">
              To configure specific alert times, go to any pulse and click "Configure"
            </p>
            <NavLink to="/trackers" onClick={() => setNotifOpen(false)}>
              <Button variant="outline" size="sm" className="text-xs">
                Go to My Pulses
              </Button>
            </NavLink>
          </div>
        </div>
      </ConfigDrawer>
    </header>
  )
}
