import { useState } from "react"
import { NavLink } from "react-router-dom"
import {
  LayoutGrid,
  Activity,
  BarChart3,
  Settings,
  Plus,
  PanelLeftClose,
  PanelLeft,
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
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "flex-col bg-[#0F1F17] transition-all duration-300",
        collapsed ? "w-[68px] p-3" : "w-[248px] p-4",
        className
      )}
    >
      {/* Logo + Collapse */}
      <div className={cn("flex items-center mb-8", collapsed ? "justify-center pt-1" : "gap-3 px-2.5 pt-2 justify-between")}>
        <NavLink to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <PulseLogo size={collapsed ? 36 : 40} />
          {!collapsed && (
            <div>
              <h1 className="text-[19px] font-extrabold tracking-tight text-white">{BRAND.name}</h1>
              <p className="text-[8.5px] font-bold uppercase tracking-[2px] text-white/35">{BRAND.tagline}</p>
            </div>
          )}
        </NavLink>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="rounded-lg p-1.5 text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="flex w-full items-center justify-center rounded-lg p-2 mb-4 text-white/60 hover:text-white hover:bg-white/10 transition-all"
        >
          <PanelLeft className="h-4 w-4" />
        </button>
      )}

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center rounded-[10px] text-[13.5px] font-semibold transition-all duration-200",
                collapsed ? "justify-center p-2.5" : "gap-3 px-3.5 py-2.5",
                isActive
                  ? "bg-white/[0.12] text-[#22C55E]"
                  : "text-white/40 hover:bg-white/[0.06] hover:text-white/65"
              )
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="mt-auto pt-4 flex flex-col gap-5">
        <NavLink to="/trackers/new">
          <button className={cn(
            "flex w-full items-center justify-center rounded-[10px] bg-primary text-primary-foreground font-bold transition-all hover:bg-[#15903F]",
            collapsed ? "p-2.5" : "gap-2 px-4 py-2.5 text-[13px]"
          )}>
            <Plus className="h-4 w-4 shrink-0" />
            {!collapsed && "New Pulse"}
          </button>
        </NavLink>

        {/* Streak card */}
        <div className={cn(
          "rounded-[14px] border border-[#16A34A]/20 bg-[#16A34A]/10",
          collapsed ? "p-2.5 text-center" : "p-4"
        )}>
          {collapsed ? (
            <div>
              <span className="text-[18px]">🔥</span>
              <div className="text-[16px] font-extrabold text-[#22C55E] mt-0.5">12</div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[28px] font-extrabold leading-none text-[#22C55E]">12</div>
                  <div className="mt-1 text-[9px] font-bold uppercase tracking-[1.5px] text-white/30">Day Streak</div>
                </div>
                <span className="text-[24px]">🔥</span>
              </div>
              <div className="mt-3 flex gap-[3px]">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className={cn("h-[3px] flex-1 rounded-sm", i < 12 ? "bg-[#16A34A]" : "bg-white/10")} />
                ))}
              </div>
              <p className="mt-2 text-[10px] text-white/25">3 more to beat your best!</p>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}
