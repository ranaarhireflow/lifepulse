import { Outlet } from "react-router-dom"
import { BottomNav } from "./BottomNav"

export function AppLayout() {
  return (
    <div className="h-[100dvh] bg-[#F5F0EB] dark:bg-[#1a1a1a] flex items-center justify-center">
      {/* Phone frame: fixed height = viewport, nav always visible */}
      <div className="
        w-full h-[100dvh]
        lg:w-[393px] lg:h-[852px] lg:max-h-[90vh]
        lg:rounded-[44px] lg:shadow-2xl lg:shadow-black/25
        lg:border lg:border-black/10 dark:lg:border-white/5
        overflow-hidden flex flex-col bg-background relative
      ">
        {/* Safe area top spacer for notch/Dynamic Island */}
        <div className="shrink-0 h-[env(safe-area-inset-top,0px)] lg:h-0" />

        {/* Main content — scrolls independently, nav stays fixed */}
        <main className="flex-1 overflow-y-auto overscroll-contain">
          <Outlet />
        </main>

        {/* Bottom nav — always visible at bottom */}
        <BottomNav />
      </div>
    </div>
  )
}
