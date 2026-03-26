import { Outlet } from "react-router-dom"
import { BottomNav } from "./BottomNav"

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[#F5F0EB] flex items-center justify-center">
      {/* Phone frame on desktop */}
      <div className="w-full max-w-md mx-auto min-h-screen lg:min-h-0 lg:h-[90vh] lg:max-h-[900px] lg:rounded-[40px] lg:shadow-2xl lg:shadow-black/20 lg:border lg:border-black/10 overflow-hidden flex flex-col bg-background relative">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
