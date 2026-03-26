import { NavLink } from "react-router-dom"
import {
  LayoutGrid,
  Activity,
  BarChart3,
  Settings,
  Plus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { BRAND } from "@/lib/brand"
import { PulseLogo } from "@/components/common/PulseLogo"

const NAV_ITEMS = [
  { to: "/", icon: LayoutGrid, label: "Today", end: true },
  { to: "/trackers", icon: Activity, label: "My Pulses", end: false },
  { to: "/analytics", icon: BarChart3, label: "Analytics", end: false },
  { to: "/settings", icon: Settings, label: "Settings", end: false },
]

export function Sidebar({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "w-[248px] flex-col bg-[#0F1F17] p-4 text-white",
        className
      )}
    >
      {/* Logo */}
      <div className="mb-10 flex items-center gap-3 px-2.5 pt-2">
        <PulseLogo size={40} />
        <div>
          <h1 className="text-[19px] font-extrabold tracking-tight">{BRAND.name}</h1>
          <p className="text-[8.5px] font-bold uppercase tracking-[2px] text-white/35">
            {BRAND.tagline}
          </p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex flex-1 flex-col gap-0.5">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-[10px] px-3.5 py-2.5 text-[13.5px] font-semibold transition-all duration-200",
                isActive
                  ? "bg-white/[0.12] text-[#22C55E]"
                  : "text-white/40 hover:bg-white/[0.06] hover:text-white/65"
              )
            }
          >
            <item.icon className="h-[18px] w-[18px]" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto space-y-3">
        <NavLink to="/trackers/new">
          <button className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-dashed border-white/20 bg-white/[0.08] px-4 py-2.5 text-[13px] font-bold text-white transition-all hover:bg-white/[0.14]">
            <Plus className="h-4 w-4" />
            New Pulse
          </button>
        </NavLink>

        {/* Streak card */}
        <div className="rounded-[14px] border border-[#16A34A]/20 bg-[#16A34A]/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[28px] font-extrabold leading-none text-[#22C55E]">
                12
              </div>
              <div className="mt-1 text-[9px] font-bold uppercase tracking-[1.5px] text-white/30">
                Day Streak
              </div>
            </div>
            <span className="text-[24px]">🔥</span>
          </div>
          <div className="mt-3 flex gap-[3px]">
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-[3px] flex-1 rounded-sm",
                  i < 12 ? "bg-[#16A34A]" : "bg-white/10"
                )}
              />
            ))}
          </div>
          <p className="mt-2 text-[10px] text-white/25">
            3 more to beat your best!
          </p>
        </div>
      </div>
    </aside>
  )
}
