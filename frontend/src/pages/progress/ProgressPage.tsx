import { useState, useEffect } from "react"
import { NavLink } from "react-router-dom"
import { Loader2, Flame, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { fetchTrackers, type Tracker } from "@/services/trackers"

const TYPE_LABELS: Record<string, string> = {
  NUMERIC: "Numeric",
  DUAL_NUMERIC: "Dual Numeric",
  BOOLEAN: "Yes / No",
  DURATION: "Duration",
  TIME: "Time",
  TEXT: "Text",
}

export function ProgressPage() {
  const [trackers, setTrackers] = useState<Tracker[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrackers()
      .then(setTrackers)
      .catch(() => setTrackers([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-6 max-w-md mx-auto">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <h1 className="text-[24px] font-black tracking-tight text-foreground">Progress</h1>
        <p className="text-[14px] text-muted-foreground mt-1">
          {trackers.length} pulse{trackers.length !== 1 ? "s" : ""} tracked
        </p>
      </div>

      {/* Tracker rows */}
      <div className="px-4 space-y-2">
        {trackers.map((tracker, i) => (
          <motion.div
            key={tracker.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <NavLink
              to={`/trackers/${tracker.id}`}
              className="flex items-center gap-4 rounded-2xl bg-card border border-border/50 px-4 py-4 hover:bg-card/80 transition-all group"
            >
              {/* Icon in colored circle */}
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[22px]"
                style={{
                  backgroundColor: tracker.color
                    ? `${tracker.color}20`
                    : "rgba(34,197,94,0.12)",
                }}
              >
                {tracker.icon || "📊"}
              </div>

              {/* Name + meta */}
              <div className="flex-1 min-w-0">
                <h3 className="text-[16px] font-bold truncate">
                  {tracker.name}
                </h3>
                <div className="flex items-center gap-1.5">
                  <p className="text-[12px] text-muted-foreground truncate">
                    {tracker.target_value
                      ? `Target: ${tracker.target_value} ${tracker.unit || ""}`
                      : TYPE_LABELS[tracker.type] || tracker.type}
                    {tracker.unit && !tracker.target_value ? ` · ${tracker.unit}` : ""}
                    {tracker.tracking_days && tracker.tracking_days.length > 0 && tracker.tracking_days.length < 7
                      ? ` · ${tracker.tracking_days.sort((a, b) => a - b).map(d => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][d - 1]).join(", ")}`
                      : ""}
                    {tracker.times_per_day > 1 ? ` · ${tracker.times_per_day}x daily` : ""}
                  </p>
                  {tracker.dimension && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold capitalize">
                      {tracker.dimension}
                    </span>
                  )}
                </div>
              </div>

              {/* Streak badge */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1">
                  <Flame className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-[12px] font-bold text-amber-400">
                    {tracker.streak_goal || 0}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
              </div>
            </NavLink>
          </motion.div>
        ))}

        {trackers.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[18px] font-bold text-muted-foreground mb-2">No pulses yet</p>
            <p className="text-[14px] text-muted-foreground/60">
              Create your first pulse to start tracking.
            </p>
            <NavLink
              to="/trackers/new"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-2xl bg-primary text-white font-bold text-[15px] hover:bg-primary/90 transition-colors"
              style={{ boxShadow: "0 0 24px rgba(34,197,94,0.4)" }}
            >
              Get Started
            </NavLink>
          </div>
        )}
      </div>
    </div>
  )
}
