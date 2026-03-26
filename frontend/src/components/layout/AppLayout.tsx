import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { BottomNav } from "./BottomNav"
import { Header } from "./Header"

export function AppLayout() {
  return (
    <div className="flex h-screen bg-background">
      {/* Desktop sidebar */}
      <Sidebar className="hidden lg:flex" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-4">
          <div className="mx-auto max-w-2xl px-4 py-5 lg:px-6">
            <Outlet />
          </div>
        </main>

        {/* Mobile bottom nav */}
        <BottomNav className="lg:hidden" />
      </div>
    </div>
  )
}
