import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { ArrowLeft, Loader2, Sparkles } from "lucide-react"
import {
  fetchTemplates,
  createFromTemplate,
  createTracker,
  type TrackerTemplate,
} from "@/services/trackers"

const TRACKER_TYPES = [
  { value: "NUMERIC", label: "Number", desc: "Weight, pages, glasses" },
  { value: "DUAL_NUMERIC", label: "Dual Number", desc: "Blood pressure (120/80)" },
  { value: "BOOLEAN", label: "Yes / No", desc: "Gym, journaling" },
  { value: "DURATION", label: "Duration", desc: "Deep work hours" },
  { value: "TIME", label: "Time", desc: "Sleep time, wake time" },
  { value: "TEXT", label: "Notes", desc: "Workout routine, gratitude" },
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

  if (showCustomForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setShowCustomForm(false)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Custom Tracker</h1>
            <p className="text-sm text-muted-foreground">Configure your tracker</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Icon + Color picker */}
          <div className="flex gap-6">
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="grid grid-cols-8 gap-1.5">
                {PRESET_ICONS.map((i) => (
                  <button
                    key={i}
                    onClick={() => setIcon(i)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-all ${
                      icon === i
                        ? "ring-2 ring-primary bg-accent scale-110"
                        : "hover:bg-accent/50"
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="grid grid-cols-4 gap-1.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`h-8 w-8 rounded-lg transition-all ${
                      color === c ? "ring-2 ring-foreground scale-110" : ""
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Tracker Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Water Intake, Push-ups, Mood..."
              className="text-lg"
            />
          </div>

          {/* Type — grid selector */}
          <div className="space-y-2">
            <Label>Tracking Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {TRACKER_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    type === t.value
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  <p className="text-[12px] font-bold">{t.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Unit */}
          {(type === "NUMERIC" || type === "DUAL_NUMERIC") && (
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="unit">
                  {type === "DUAL_NUMERIC" ? "First Unit" : "Unit"}
                </Label>
                <Input
                  id="unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g., kg, pages, glasses"
                />
              </div>
              {type === "DUAL_NUMERIC" && (
                <div className="flex-1 space-y-2">
                  <Label htmlFor="unit2">Second Unit</Label>
                  <Input
                    id="unit2"
                    value={unitSecondary}
                    onChange={(e) => setUnitSecondary(e.target.value)}
                    placeholder="e.g., diastolic"
                  />
                </div>
              )}
            </div>
          )}

          {/* Default behavior */}
          <div className="space-y-2">
            <Label>Default When Not Logged</Label>
            <Select value={defaultBehavior} onValueChange={(v) => v && setDefaultBehavior(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEFAULT_BEHAVIORS.map((b) => (
                  <SelectItem key={b.value} value={b.value}>
                    {b.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target value */}
          {type !== "TEXT" && type !== "BOOLEAN" && (
            <div className="space-y-2">
              <Label htmlFor="target">Daily Target (optional)</Label>
              <Input
                id="target"
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="e.g., 8 glasses, 10000 steps"
              />
            </div>
          )}

          {/* Reminder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
              <div>
                <p className="text-[13px] font-bold">Enable Reminders</p>
                <p className="text-[11px] text-muted-foreground">Get notified to log this pulse</p>
              </div>
              <Switch checked={reminderEnabled} onCheckedChange={setReminderEnabled} />
            </div>
            {reminderEnabled && (
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <Label className="text-[12px]">Reminder Time</Label>
                <Input type="time" defaultValue="08:00" className="w-[140px]" />
                <Label className="text-[12px]">Repeat On</Label>
                <div className="flex gap-1.5">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                    <button key={d} type="button"
                      className="flex-1 rounded-lg border border-primary bg-primary/5 py-1.5 text-[10px] font-bold text-primary">
                      {d}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground">You can add more alerts after creating the pulse.</p>
              </div>
            )}
          </div>

          {/* Submit */}
          <Button
            onClick={handleCreateCustom}
            disabled={!name.trim() || creating}
            className="w-full h-11"
          >
            {creating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Create Tracker
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create Tracker</h1>
          <p className="text-sm text-muted-foreground">
            Pick a template or build your own
          </p>
        </div>
      </div>

      {/* Custom tracker */}
      <Card
        className="cursor-pointer border-dashed transition-all hover:shadow-md hover:border-primary/30"
        onClick={() => setShowCustomForm(true)}
      >
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold">Custom Tracker</p>
            <p className="text-sm text-muted-foreground">
              Create your own with any name, type, and configuration
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Templates */}
      {Object.entries(grouped).map(([category, temps]) => (
        <div key={category}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {category}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {temps.map((t) => (
              <Card
                key={t.id}
                className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => handleCreateFromTemplate(t.id)}
              >
                <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                    style={{ backgroundColor: `${t.color || "#16A34A"}12` }}
                  >
                    {t.icon || "📊"}
                  </div>
                  <p className="text-sm font-medium leading-tight">{t.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  )
}
