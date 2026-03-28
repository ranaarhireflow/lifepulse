import { useState } from "react"
import { useAuth } from "@/store/auth-context"
import { useTheme } from "@/hooks/useTheme"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { NavLink } from "react-router-dom"
import { PulseLogo } from "@/components/common/PulseLogo"
import {
  LogOut, Bell, Trash2, Moon, Sun, ChevronRight,
  Trophy, Palette, Shield, Smartphone, HelpCircle,
} from "lucide-react"
import { BRAND } from "@/lib/brand"

export function SettingsPage() {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [showDelete, setShowDelete] = useState(false)

  const initials = user?.display_name
    ?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?"

  return (
    <div className="px-5 pt-6 pb-6 space-y-6">
      {/* Profile card */}
      <div className="flex items-center gap-4 rounded-2xl bg-card border border-border p-4">
        <Avatar className="h-14 w-14 rounded-2xl">
          <AvatarImage src={user?.photo_url || ""} />
          <AvatarFallback className="rounded-2xl bg-primary/15 text-primary font-bold text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-[16px] font-bold text-foreground truncate">{user?.display_name || "User"}</p>
          <p className="text-[12px] text-muted-foreground truncate">{user?.email}</p>
        </div>
        <NavLink to="/"><PulseLogo size={28} /></NavLink>
      </div>

      {/* Quick links */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <SettingsRow icon={<Bell className="h-5 w-5 text-primary" />} label="Alarms & Reminders" to="/alarms" />
        <SettingsRow icon={<Trophy className="h-5 w-5 text-amber-500" />} label="Achievements" to="/achievements" />
        <SettingsRow icon={<Palette className="h-5 w-5 text-purple-500" />} label="My Pulses" to="/trackers" last />
      </div>

      {/* Preferences */}
      <div>
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-1 mb-2">Preferences</p>
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
            <div className="flex items-center gap-3">
              {theme === "dark" ? <Moon className="h-5 w-5 text-indigo-400" /> : <Sun className="h-5 w-5 text-amber-500" />}
              <span className="text-[14px] font-semibold text-foreground">Dark Mode</span>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-cyan-500" />
              <div>
                <span className="text-[14px] font-semibold text-foreground">Install App</span>
                <p className="text-[11px] text-muted-foreground">Add to home screen for native feel</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* About */}
      <div>
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-1 mb-2">About</p>
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
            <div className="flex items-center gap-3">
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
              <span className="text-[14px] font-semibold text-foreground">How Scoring Works</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <span className="text-[14px] font-semibold text-foreground">Privacy & Data</span>
            </div>
            <span className="text-[12px] text-muted-foreground">Stored locally</span>
          </div>
        </div>
      </div>

      {/* Account actions */}
      <div>
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-1 mb-2">Account</p>
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          <button onClick={signOut} className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-border text-left hover:bg-accent transition-colors">
            <LogOut className="h-5 w-5 text-muted-foreground" />
            <span className="text-[14px] font-semibold text-foreground">Sign Out</span>
          </button>
          {!showDelete ? (
            <button onClick={() => setShowDelete(true)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-destructive/5 transition-colors">
              <Trash2 className="h-5 w-5 text-destructive/60" />
              <span className="text-[14px] font-semibold text-destructive/80">Delete Account</span>
            </button>
          ) : (
            <div className="px-4 py-3.5 space-y-2">
              <p className="text-[12px] text-destructive font-semibold">Are you sure? This deletes all your data.</p>
              <div className="flex gap-2">
                <button onClick={() => setShowDelete(false)} className="flex-1 py-2 rounded-lg bg-card border border-border text-[13px] font-bold text-foreground">Cancel</button>
                <button onClick={signOut} className="flex-1 py-2 rounded-lg bg-destructive text-[13px] font-bold text-white">Delete</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Version */}
      <p className="text-center text-[11px] text-muted-foreground/50 pt-2">
        {BRAND.name} v{BRAND.version} — {BRAND.philosophy}
      </p>
    </div>
  )
}

/** Simple settings row with icon, label, and chevron */
function SettingsRow({ icon, label, to, last }: { icon: React.ReactNode; label: string; to: string; last?: boolean }) {
  return (
    <NavLink to={to} className={`flex items-center justify-between px-4 py-3.5 hover:bg-accent transition-colors ${last ? "" : "border-b border-border"}`}>
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-[14px] font-semibold text-foreground">{label}</span>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </NavLink>
  )
}
