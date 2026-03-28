import { useEffect } from "react"
import { Outlet } from "react-router-dom"
import { BottomNav } from "./BottomNav"
import { fetchTrackers } from "@/services/trackers"
import { initNotifications, syncAlarms } from "@/services/alarm-sync"

export function AppLayout() {
  // On app mount: request notification permission + sync alarms
  useEffect(() => {
    async function init() {
      try {
        await initNotifications()
        const trackers = await fetchTrackers()
        await syncAlarms(trackers)
      } catch { /* auth might not be ready yet */ }
    }
    // Small delay to let auth settle
    const timer = setTimeout(init, 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="h-[100dvh] bg-[#F5F0EB] dark:bg-[#1a1a1a] flex items-center justify-center">
      <div className="
        w-full h-[100dvh]
        lg:w-[393px] lg:h-[852px] lg:max-h-[90vh]
        lg:rounded-[44px] lg:shadow-2xl lg:shadow-black/25
        lg:border lg:border-black/10 dark:lg:border-white/5
        overflow-hidden flex flex-col bg-background relative
      ">
        <div className="shrink-0 h-[env(safe-area-inset-top,0px)] lg:h-0" />
        <main className="flex-1 overflow-y-auto overscroll-contain">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
