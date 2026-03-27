import { Outlet } from "react-router-dom"
import { BottomNav } from "./BottomNav"

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[#F5F0EB] dark:bg-[#1a1a1a] flex items-center justify-center">
      {/*
        Phone frame container:
        - Mobile: full screen, uses env(safe-area-inset-*) for notch/Dynamic Island/home indicator
        - Desktop (lg+): fixed phone frame with iPhone 14 Pro aspect ratio (393x852)
      */}
      <div className="
        w-full min-h-[100dvh]
        lg:w-[393px] lg:min-h-0 lg:h-[852px] lg:max-h-[90vh]
        lg:rounded-[44px] lg:shadow-2xl lg:shadow-black/25
        lg:border lg:border-black/10 dark:lg:border-white/5
        overflow-hidden flex flex-col bg-background relative
      ">
        {/* Status bar spacer — respects Dynamic Island / notch on real devices */}
        <div className="shrink-0 h-[env(safe-area-inset-top,0px)] lg:h-0" />

        {/* Main scrollable content */}
        <main className="flex-1 overflow-y-auto overscroll-contain">
          <Outlet />
        </main>

        {/* Bottom nav with safe area for home indicator */}
        <BottomNav />
      </div>
    </div>
  )
}
