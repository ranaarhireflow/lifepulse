import { Outlet } from "react-router-dom"
import { BottomNav } from "./BottomNav"

export function AppLayout() {
  return (
    <div className="bg-background">
      <Outlet />
      <BottomNav />
    </div>
  )
}
