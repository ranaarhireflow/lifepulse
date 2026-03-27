import { useState, useEffect } from "react"
import { useNavigate, NavLink } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  ArrowLeft,
  Loader2,
  Plus,
  Hash,
  ToggleLeft,
  Clock,
  Timer,
  FileText,
  GitCommitHorizontal,
} from "lucide-react"
import { PulseLogo } from "@/components/common/PulseLogo"
import {
  fetchTemplates,
  createFromTemplate,
  createTracker,
  type TrackerTemplate,
} from "@/services/trackers"

const TRACKER_TYPES = [
  { value: "NUMERIC", label: "Number", desc: "Weight, pages, glasses", icon: Hash },
  { value: "DUAL_NUMERIC", label: "Dual Number", desc: "Blood pressure (120/80)", icon: GitCommitHorizontal },
  { value: "BOOLEAN", label: "Yes / No", desc: "Gym, journaling", icon: ToggleLeft },
  { value: "DURATION", label: "Duration", desc: "Deep work hours", icon: Timer },
  { value: "TIME", label: "Time", desc: "Sleep time, wake time", icon: Clock },
  { value: "TEXT", label: "Notes", desc: "Workout routine, gratitude", icon: FileText },
]

const DEFAULT_BEHAVIORS = [
  { value: "NULL", label: "No default (empty)" },
  { value: "ZERO", label: "Default to 0 / No" },
  { value: "CARRY_FORWARD", label: "Carry forward (use yesterday's value)" },
]

const PRESET_COLORS = [
  "#16A34A", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#ef4444", "#f97316", "#f59e0b",
  "#eab308", "#84cc16", "#22c55e", "#10b981",
  "#14b8a6", "#06b6d4", "#3b82f6", "#64748b",
]

const PRESET_ICONS = [
  "⚖️", "❤️", "💧", "😴", "🌅", "👣", "🔥", "💓",
  "🏋️", "🏃", "⏱️", "📝", "🧘", "🧠", "📖", "🧘‍♂️",
  "✍️", "📱", "🥗", "🚫", "🙏", "😊", "💰", "🪥",
  "🌙", "☕", "🎯", "💪", "🎵", "🌿", "🍎", "✨",
]

const inputClasses =
  "h-12 rounded-xl bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-[#22C55E] focus-visible:ring-2"

export function TrackerCreatePage() {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<TrackerTemplate[]>([])
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [creating, setCreating] = useState(false)

  // Custom form state
  const [name, setName] = useState("")
  const [icon, setIcon] = useState("🎯")
  const [color, setColor] = useState("#16A34A")
  const [type, setType] = useState("NUMERIC")
  const [unit, setUnit] = useState("")
  const [unitSecondary, setUnitSecondary] = useState("")
  const [defaultBehavior, setDefaultBehavior] = useState("NULL")
  const [targetValue, setTargetValue] = useState("")
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [trackingDays, setTrackingDays] = useState([1, 2, 3, 4, 5, 6, 7])
  const [timesPerDay, setTimesPerDay] = useState(1)

  useEffect(() => {
    fetchTemplates().then(setTemplates).catch(() => {})
  }, [])

  const handleCreateFromTemplate = async (templateId: string) => {
    setCreating(true)
    try {
      await createFromTemplate(templateId)
      navigate("/")
    } catch {
      alert("Failed to create tracker")
    } finally {
      setCreating(false)
    }
  }

  const handleCreateCustom = async () => {
    if (!name.trim()) return
    setCreating(true)
    try {
      await createTracker({
        name: name.trim(),
        icon,
        color,
        type: type as "NUMERIC" | "DUAL_NUMERIC" | "BOOLEAN" | "DURATION" | "TIME" | "TEXT",
        unit: unit || null,
        unit_secondary: unitSecondary || null,
        default_behavior: defaultBehavior as "CARRY_FORWARD" | "ZERO" | "NULL",
        target_value: targetValue ? parseFloat(targetValue) : null,
        reminder_enabled: reminderEnabled,
        tracking_days: trackingDays,
        times_per_day: timesPerDay,
      })
      navigate("/")
    } catch {
      alert("Failed to create tracker")
    } finally {
      setCreating(false)
    }
  }

  // Group templates by category
  const grouped = templates.reduce(
    (acc, t) => {
      const cat = t.category || "Other"
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(t)
      return acc
    },
    {} as Record<string, TrackerTemplate[]>
  )

  /* ───────── CUSTOM FORM ───────── */
  if (showCustomForm) {
    return (
      <div className="px-5 pt-6 pb-10 space-y-6">
        {/* Back + header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCustomForm(false)}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-card border border-border transition-colors hover:bg-secondary"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Custom Tracker</h1>
            <p className="text-sm text-muted-foreground">Configure your tracker</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Icon picker */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground">Icon</Label>
            <div className="grid grid-cols-8 gap-2">
              {PRESET_ICONS.map((i) => (
                <button
                  key={i}
                  onClick={() => setIcon(i)}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl transition-all ${
                    icon === i
                      ? "bg-[#22C55E]/15 ring-2 ring-[#22C55E] shadow-[0_0_12px_rgba(34,197,94,0.3)] scale-110"
                      : "bg-card hover:bg-secondary"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground">Color</Label>
            <div className="grid grid-cols-8 gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-10 w-10 rounded-full transition-all ${
                    color === c
                      ? "ring-2 ring-[#22C55E] ring-offset-2 ring-offset-background scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-foreground">
              Tracker Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Water Intake, Push-ups, Mood..."
              className={`${inputClasses} text-lg`}
            />
          </div>

          {/* Type — 2-column grid with icons */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground">Tracking Type</Label>
            <div className="grid grid-cols-2 gap-3">
              {TRACKER_TYPES.map((t) => {
                const Icon = t.icon
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${
                      type === t.value
                        ? "border-[#22C55E] bg-[#22C55E]/10 shadow-[0_0_16px_rgba(34,197,94,0.15)]"
                        : "border-border bg-card hover:border-foreground/20"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        type === t.value
                          ? "bg-[#22C55E]/20 text-[#22C55E]"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-foreground">{t.label}</p>
                      <p className="text-[11px] text-muted-foreground leading-tight">{t.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Unit */}
          {(type === "NUMERIC" || type === "DUAL_NUMERIC") && (
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="unit" className="text-sm font-semibold text-foreground">
                  {type === "DUAL_NUMERIC" ? "First Unit" : "Unit"}
                </Label>
                <Input
                  id="unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g., kg, pages, glasses"
                  className={inputClasses}
                />
              </div>
              {type === "DUAL_NUMERIC" && (
                <div className="flex-1 space-y-2">
                  <Label htmlFor="unit2" className="text-sm font-semibold text-foreground">
                    Second Unit
                  </Label>
                  <Input
                    id="unit2"
                    value={unitSecondary}
                    onChange={(e) => setUnitSecondary(e.target.value)}
                    placeholder="e.g., diastolic"
                    className={inputClasses}
                  />
                </div>
              )}
            </div>
          )}

          {/* Default behavior */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Default When Not Logged</Label>
            <Select value={defaultBehavior} onValueChange={(v) => v && setDefaultBehavior(v)}>
              <SelectTrigger className="h-12 w-full rounded-xl bg-card border-border text-foreground overflow-hidden focus:ring-[#22C55E]">
                <span className="truncate"><SelectValue /></span>
              </SelectTrigger>
              <SelectContent className="rounded-xl bg-card border-border">
                {DEFAULT_BEHAVIORS.map((b) => (
                  <SelectItem key={b.value} value={b.value} className="text-sm">
                    {b.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target value */}
          {type !== "TEXT" && type !== "BOOLEAN" && (
            <div className="space-y-2">
              <Label htmlFor="target" className="text-sm font-semibold text-foreground">
                Daily Target (optional)
              </Label>
              <Input
                id="target"
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="e.g., 8 glasses, 10000 steps"
                className={inputClasses}
              />
            </div>
          )}

          {/* Track on these days */}
          <div>
            <label className="text-[13px] font-bold text-foreground">Track on these days</label>
            <p className="text-[11px] text-muted-foreground mb-2">Leave all selected for daily tracking</p>
            <div className="flex gap-1.5">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => {
                const dayNum = i + 1
                const active = trackingDays.includes(dayNum)
                return (
                  <button key={d} type="button" onClick={() => setTrackingDays(prev =>
                    active ? prev.filter(x => x !== dayNum) : [...prev, dayNum]
                  )}
                  className={`flex-1 py-2 rounded-lg text-[11px] font-bold transition-all ${
                    active ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground"
                  }`}>{d}</button>
                )
              })}
            </div>
          </div>

          {/* Times per day */}
          <div>
            <label className="text-[13px] font-bold text-foreground">Times per day</label>
            <p className="text-[11px] text-muted-foreground mb-2">How many times to track daily (e.g. water 4x, BP 2x)</p>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setTimesPerDay(Math.max(1, timesPerDay - 1))} className="h-10 w-10 rounded-xl bg-card border border-border text-foreground font-bold">&minus;</button>
              <span className="text-[24px] font-black w-12 text-center">{timesPerDay}</span>
              <button type="button" onClick={() => setTimesPerDay(Math.min(10, timesPerDay + 1))} className="h-10 w-10 rounded-xl bg-card border border-border text-foreground font-bold">+</button>
            </div>
          </div>

          {/* Reminder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
              <div>
                <p className="text-[14px] font-bold text-foreground">Enable Reminders</p>
                <p className="text-[12px] text-muted-foreground">Get notified to log this pulse</p>
              </div>
              <Switch checked={reminderEnabled} onCheckedChange={setReminderEnabled} />
            </div>
            {reminderEnabled && (
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                <div className="space-y-2">
                  <Label className="text-[13px] font-semibold text-foreground">Reminder Time</Label>
                  <Input
                    type="time"
                    defaultValue="08:00"
                    className="w-[160px] h-11 rounded-xl bg-secondary border-border text-foreground focus-visible:ring-[#22C55E] focus-visible:ring-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[13px] font-semibold text-foreground">Repeat On</Label>
                  <div className="flex gap-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                      <button
                        key={d}
                        type="button"
                        className="flex-1 rounded-xl border border-[#22C55E]/40 bg-[#22C55E]/10 py-2 text-[11px] font-bold text-[#22C55E] transition-colors hover:bg-[#22C55E]/20"
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  You can add more alerts after creating the pulse.
                </p>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={handleCreateCustom}
            disabled={!name.trim() || creating}
            className="w-full h-13 rounded-2xl bg-[#22C55E] hover:bg-[#16A34A] text-white text-base font-bold shadow-[0_0_24px_rgba(34,197,94,0.35)] transition-all hover:shadow-[0_0_32px_rgba(34,197,94,0.5)] disabled:opacity-40 disabled:shadow-none flex items-center justify-center gap-2"
          >
            {creating && <Loader2 className="h-5 w-5 animate-spin" />}
            Create Tracker
          </button>
        </div>
      </div>
    )
  }

  /* ───────── TEMPLATE SELECTION ───────── */
  return (
    <div className="px-5 pt-6 pb-10 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-card border border-border transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <NavLink to="/">
          <PulseLogo size={28} />
        </NavLink>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create Tracker</h1>
          <p className="text-sm text-muted-foreground">Pick a template or build your own</p>
        </div>
      </div>

      {/* Custom tracker — gradient hero card */}
      <button
        className="w-full rounded-2xl bg-gradient-to-br from-[#22C55E]/20 via-[#16A34A]/10 to-transparent border border-[#22C55E]/30 p-5 transition-all hover:shadow-[0_0_24px_rgba(34,197,94,0.2)] hover:border-[#22C55E]/50 active:scale-[0.98] text-left"
        onClick={() => setShowCustomForm(true)}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#22C55E]/20 border border-[#22C55E]/30">
            <Plus className="h-7 w-7 text-[#22C55E]" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">Custom Tracker</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Create your own with any name, type & config
            </p>
          </div>
        </div>
      </button>

      {/* Templates by category */}
      {Object.entries(grouped).map(([category, temps]) => (
        <div key={category} className="space-y-3">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground pl-1">
            {category}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {temps.map((t) => {
              const tColor = t.color || "#16A34A"
              return (
                <button
                  key={t.id}
                  className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 text-left transition-all hover:border-foreground/20 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => handleCreateFromTemplate(t.id)}
                >
                  {/* Colored left accent bar */}
                  <div
                    className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
                    style={{ backgroundColor: tColor }}
                  />
                  <div className="pl-2">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-2xl mb-2.5"
                      style={{ backgroundColor: `${tColor}18` }}
                    >
                      {t.icon || "📊"}
                    </div>
                    <p className="text-[14px] font-bold text-foreground leading-tight">{t.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{category}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
        </div>
      )}
    </div>
  )
}
