import { useState } from "react"
import { useAuth } from "@/store/auth-context"
import { useTheme } from "@/hooks/useTheme"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { NavLink } from "react-router-dom"
import { PulseLogo } from "@/components/common/PulseLogo"
import {
  LogOut,
  Bell,
  BellOff,
  Shield,
  Trash2,
  Moon,
  Sun,
  Smartphone,
  Globe,
  Check,
} from "lucide-react"

export function SettingsPage() {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  )
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const initials =
    user?.display_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"

  const requestNotificationPermission = async () => {
    if (typeof Notification === "undefined") {
      alert("Notifications are not supported in this browser")
      return
    }
    const permission = await Notification.requestPermission()
    setNotifPermission(permission)
    if (permission === "granted") {
      new Notification("LifePulse", {
        body: "Notifications enabled! You'll receive reminders for your trackers.",
        icon: "/favicon.svg",
      })
    }
  }

  return (
    <div className="space-y-6 px-5 pt-6 pb-6 max-w-md mx-auto">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <NavLink to="/"><PulseLogo size={28} /></NavLink>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.photo_url || ""} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-lg font-semibold">{user?.display_name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Timezone: {user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Dark Mode</p>
              <p className="text-xs text-muted-foreground">
                Switch between light and dark theme
              </p>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-4 w-4" />
            Notifications
          </CardTitle>
          <CardDescription>
            Get browser push notifications for your tracker reminders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {notifPermission === "granted" ? (
            <div className="flex items-center gap-3 rounded-lg bg-green-500/10 p-3">
              <Check className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  Notifications Enabled
                </p>
                <p className="text-xs text-muted-foreground">
                  You'll receive reminders for your trackers
                </p>
              </div>
            </div>
          ) : notifPermission === "denied" ? (
            <div className="flex items-center gap-3 rounded-lg bg-destructive/10 p-3">
              <BellOff className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm font-medium text-destructive">
                  Notifications Blocked
                </p>
                <p className="text-xs text-muted-foreground">
                  Enable in your browser settings to receive reminders
                </p>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={requestNotificationPermission}
              className="gap-2"
            >
              <Bell className="h-4 w-4" />
              Enable Notifications
            </Button>
          )}

          <Separator />

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Supported Platforms</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5" />
                Chrome / Edge / Firefox
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="h-3.5 w-3.5" />
                Android (Chrome)
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="h-3.5 w-3.5" />
                iOS (add to Home Screen)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Install PWA */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Smartphone className="h-4 w-4" />
            Install App
          </CardTitle>
          <CardDescription>
            Install LifePulse on your device for a native app experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="rounded-lg bg-accent/50 p-3">
              <p className="font-medium text-foreground mb-1">On iPhone / iPad</p>
              <p>Tap the Share button → "Add to Home Screen"</p>
            </div>
            <div className="rounded-lg bg-accent/50 p-3">
              <p className="font-medium text-foreground mb-1">On Android</p>
              <p>Tap the menu (⋮) → "Install app" or "Add to Home Screen"</p>
            </div>
            <div className="rounded-lg bg-accent/50 p-3">
              <p className="font-medium text-foreground mb-1">On Desktop</p>
              <p>Click the install icon in the address bar</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-4 w-4" />
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" onClick={signOut} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
          <Separator />
          <div>
            <p className="text-sm font-medium text-destructive">Danger Zone</p>
            <p className="mb-2 text-xs text-muted-foreground">
              Permanently delete your account and all tracking data.
            </p>
            <Button
              variant="destructive"
              size="sm"
              className="gap-2"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Version */}
      <p className="text-center text-xs text-muted-foreground pb-4">
        LifePulse v1.0.0 — Track anything, anywhere
      </p>

      {/* Delete confirmation */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This will permanently delete your account and all tracking data
              including trackers, entries, and analytics. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={signOut}>
              Delete Everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
