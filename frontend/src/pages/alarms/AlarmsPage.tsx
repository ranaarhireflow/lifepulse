import { useState, useEffect, useCallback } from "react"
import { Loader2, Bell, BellOff, Plus, Settings, ChevronLeft } from "lucide-react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { fetchTrackers, type Tracker, type TrackerAlert } from "@/services/trackers"
import api from "@/services/api"

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"]

export function AlarmsPage() {
  const [trackers, setTrackers] = useState<Tracker[]>([])
  const [loading, setLoading] = useState(true)
  // Local toggle state: map of alertId -> enabled
  const [toggleState, setToggleState] = useState<Record<string, boolean>>({})
  const navigate = useNavigate()

  useEffect(() => {
    fetchTrackers()
      .then((t) => {
        setTrackers(t)
        // Initialize toggle state from fetched data
        const initial: Record<string, boolean> = {}
        for (const tracker of t) {
          if (tracker.alerts) {
            for (const alert of tracker.alerts) {
              initial[alert.id] = alert.enabled
            }
          }
        }
        setToggleState(initial)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleToggle = useCallback(
    (trackerId: string, alert: TrackerAlert) => {
      const current = toggleState[alert.id] ?? alert.enabled
      const next = !current

      // Optimistic update
      setToggleState((prev) => ({ ...prev, [alert.id]: next }))

      // Try to patch the alert via the tracker alerts endpoint
      api
        .patch(`/trackers/${trackerId}/alerts/${alert.id}`, { enabled: next })
        .catch(() => {
          // Revert on failure
          setToggleState((prev) => ({ ...prev, [alert.id]: current }))
        })
    },
    [toggleState]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-7 w-7 animate-spin text-[#22C55E]" />
      </div>
    )
  }

  // Split trackers into those with alerts and those without
  const trackersWithAlerts = trackers.filter(
    (t) => t.alerts && t.alerts.length > 0
  )
  const trackersWithoutAlerts = trackers.filter(
    (t) => !t.alerts || t.alerts.length === 0
  )

  const totalAlerts = trackersWithAlerts.reduce(
    (sum, t) => sum + (t.alerts?.length || 0),
    0
  )

  const activeAlerts = trackersWithAlerts.reduce(
    (sum, t) =>
      sum +
      (t.alerts?.filter((a) => toggleState[a.id] ?? a.enabled).length || 0),
    0
  )

  return (
    <div className="px-5 pt-6 pb-6">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <button onClick={() => navigate(-1)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors">
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            </button>
            <h1 className="text-[24px] font-black tracking-tight text-foreground">Alarms</h1>
          </div>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Manage all your reminders
          </p>
        </motion.div>

        {/* Summary pill */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#22C55E]/15">
            <Bell className="h-4 w-4 text-[#22C55E]" />
          </div>
          <div className="flex-1">
            <span className="text-[14px] font-bold text-foreground">
              {activeAlerts} active
            </span>
            <span className="text-[12px] text-muted-foreground ml-1.5">
              of {totalAlerts} reminder{totalAlerts !== 1 ? "s" : ""}
            </span>
            <span className="text-[12px] text-muted-foreground ml-1.5">
              across {trackersWithAlerts.length} habit
              {trackersWithAlerts.length !== 1 ? "s" : ""}
            </span>
          </div>
        </motion.div>

        {/* Trackers with alerts */}
        {trackersWithAlerts.length > 0 && (
          <div className="space-y-3">
            {trackersWithAlerts.map((tracker, tIdx) => (
              <motion.div
                key={tracker.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + tIdx * 0.04 }}
                className="rounded-2xl border border-border bg-card overflow-hidden"
              >
                {/* Tracker header */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-[22px]"
                    style={{
                      backgroundColor: `${tracker.color || "#22C55E"}15`,
                    }}
                  >
                    {tracker.icon || "\u{1F4CA}"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-bold text-foreground truncate">
                      {tracker.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {tracker.alerts.length} reminder
                      {tracker.alerts.length !== 1 ? "s" : ""}
                      {tracker.tracking_days && tracker.tracking_days.length > 0 && tracker.tracking_days.length < 7
                        ? ` · ${[...tracker.tracking_days].sort((a, b) => a - b).map(d => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][d - 1]).join(", ")}`
                        : ""}
                      {tracker.times_per_day > 1 ? ` · ${tracker.times_per_day}x daily` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/trackers/${tracker.id}`)}
                    className="flex items-center gap-1.5 rounded-lg bg-foreground/5 px-3 py-1.5 text-[11px] font-semibold text-muted-foreground hover:bg-foreground/10 transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    Configure
                  </button>
                </div>

                {/* Alert rows */}
                {tracker.alerts.map((alert, aIdx) => {
                  const isEnabled = toggleState[alert.id] ?? alert.enabled
                  return (
                    <div
                      key={alert.id}
                      className={`flex items-center px-4 py-3.5 ${
                        aIdx < tracker.alerts.length - 1
                          ? "border-b border-border"
                          : ""
                      } ${aIdx === 0 ? "border-t border-border" : ""}`}
                    >
                      <div className="flex-1 min-w-0">
                        {/* Time */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[24px] font-black tabular-nums transition-colors ${
                              isEnabled ? "text-foreground" : "text-muted-foreground/70"
                            }`}
                          >
                            {alert.alert_time}
                          </span>
                          {alert.label && (
                            <span className="text-[11px] font-semibold text-muted-foreground truncate">
                              {alert.label}
                            </span>
                          )}
                        </div>

                        {/* Day dots */}
                        <div className="flex gap-2 mt-2">
                          {DAY_LABELS.map((d, i) => {
                            const active = (
                              alert.alert_days || [1, 2, 3, 4, 5, 6, 7]
                            ).includes(i + 1)
                            return (
                              <div
                                key={i}
                                className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold transition-colors ${
                                  active && isEnabled
                                    ? "bg-[#22C55E] text-black"
                                    : active && !isEnabled
                                      ? "bg-secondary text-muted-foreground"
                                      : "bg-secondary text-muted-foreground/70"
                                }`}
                              >
                                {d}
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Toggle switch */}
                      <button
                        onClick={() => handleToggle(tracker.id, alert)}
                        className="ml-4 shrink-0"
                        aria-label={isEnabled ? "Disable alarm" : "Enable alarm"}
                      >
                        <div
                          className={`flex h-7 w-12 items-center rounded-full px-0.5 transition-colors ${
                            isEnabled ? "bg-[#22C55E]" : "bg-secondary"
                          }`}
                        >
                          <div
                            className={`h-6 w-6 rounded-full bg-white shadow transition-transform ${
                              isEnabled ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </div>
                      </button>
                    </div>
                  )
                })}
              </motion.div>
            ))}
          </div>
        )}

        {/* Trackers without alerts */}
        {trackersWithoutAlerts.length > 0 && (
          <div>
            <h2 className="text-[11px] font-extrabold uppercase tracking-[2px] text-muted-foreground/70 mb-3">
              No reminders set
            </h2>
            <div className="space-y-1.5">
              {trackersWithoutAlerts.map((tracker, i) => (
                <motion.div
                  key={tracker.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.03 }}
                  className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/50 px-4 py-3 cursor-pointer hover:bg-card transition-colors"
                  onClick={() => navigate(`/trackers/${tracker.id}`)}
                >
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[18px] opacity-50"
                    style={{
                      backgroundColor: `${tracker.color || "#22C55E"}10`,
                    }}
                  >
                    {tracker.icon || "\u{1F4CA}"}
                  </div>
                  <span className="text-[13px] font-semibold text-muted-foreground flex-1 truncate">
                    {tracker.name}
                  </span>
                  <Plus className="h-4 w-4 text-muted-foreground/50" />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {trackers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-card mb-4">
              <BellOff className="h-7 w-7 text-muted-foreground/70" />
            </div>
            <p className="text-[16px] font-bold text-muted-foreground">No alarms yet</p>
            <p className="text-[13px] text-muted-foreground/70 mt-1">
              Create a habit to set reminders
            </p>
            <button
              onClick={() => navigate("/trackers/new")}
              className="mt-4 rounded-xl bg-[#22C55E] px-5 py-2.5 text-[13px] font-bold text-black hover:bg-[#22C55E]/90 transition-colors"
            >
              Create a habit
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
