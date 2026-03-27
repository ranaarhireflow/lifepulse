import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  ArrowLeft,
  Loader2,
  Plus,
} from "lucide-react"
import {
  createTracker,
} from "@/services/trackers"

/* ──────────────────── CONSTANTS ──────────────────── */

type Dimension = "wisdom" | "confidence" | "strength" | "discipline" | "focus"
type HabitType = "BOOLEAN" | "NUMERIC" | "DURATION" | "TIME"
type TimeRange = "anytime" | "morning" | "afternoon" | "evening"

interface HabitTemplate {
  name: string
  icon: string
  dimension: Dimension
  type: HabitType
  unit: string
  target_value: number | null
  min_value: number | null
  max_value: number | null
}

interface CategoryDef {
  key: string
  icon: string
  label: string
  subtitle: string
  habits: HabitTemplate[]
}

const DIMENSION_META: Record<Dimension, { icon: string; label: string }> = {
  wisdom:     { icon: "📖", label: "Wisdom" },
  confidence: { icon: "😎", label: "Confidence" },
  strength:   { icon: "💪", label: "Strength" },
  discipline: { icon: "🔥", label: "Discipline" },
  focus:      { icon: "🎯", label: "Focus" },
}

const CATEGORIES: CategoryDef[] = [
  {
    key: "popular", icon: "🔥", label: "Popular", subtitle: "Most popular habits",
    habits: [
      { name: "Walk", icon: "🚶", dimension: "strength", type: "NUMERIC", unit: "steps", target_value: 10000, min_value: 0, max_value: 50000 },
      { name: "Sleep", icon: "😴", dimension: "discipline", type: "DURATION", unit: "hours", target_value: 8, min_value: 0, max_value: 24 },
      { name: "Drink Water", icon: "💧", dimension: "discipline", type: "NUMERIC", unit: "glasses", target_value: 8, min_value: 0, max_value: 20 },
      { name: "Meditation", icon: "🧘", dimension: "wisdom", type: "DURATION", unit: "minutes", target_value: 15, min_value: 0, max_value: 120 },
      { name: "Run", icon: "🏃", dimension: "strength", type: "DURATION", unit: "minutes", target_value: 30, min_value: 0, max_value: 180 },
      { name: "Workout", icon: "🏋️", dimension: "strength", type: "BOOLEAN", unit: "", target_value: 1, min_value: null, max_value: null },
      { name: "Read", icon: "📖", dimension: "wisdom", type: "DURATION", unit: "minutes", target_value: 30, min_value: 0, max_value: 300 },
      { name: "Journal", icon: "✍️", dimension: "wisdom", type: "BOOLEAN", unit: "", target_value: 1, min_value: null, max_value: null },
      { name: "Deep Work", icon: "🎯", dimension: "focus", type: "DURATION", unit: "hours", target_value: 4, min_value: 0, max_value: 16 },
      { name: "Cold Shower", icon: "🥶", dimension: "discipline", type: "BOOLEAN", unit: "", target_value: 1, min_value: null, max_value: null },
    ],
  },
  {
    key: "health", icon: "❤️", label: "Health", subtitle: "Track your body vitals",
    habits: [
      { name: "Blood Pressure", icon: "🩺", dimension: "discipline", type: "NUMERIC", unit: "mmHg", target_value: 120, min_value: 60, max_value: 200 },
      { name: "Weight", icon: "⚖️", dimension: "discipline", type: "NUMERIC", unit: "kg", target_value: null, min_value: 30, max_value: 300 },
      { name: "Calories", icon: "🔥", dimension: "discipline", type: "NUMERIC", unit: "kcal", target_value: 2000, min_value: 0, max_value: 5000 },
      { name: "Vitamins", icon: "💊", dimension: "discipline", type: "BOOLEAN", unit: "", target_value: 1, min_value: null, max_value: null },
      { name: "Hydration", icon: "💧", dimension: "discipline", type: "NUMERIC", unit: "liters", target_value: 3, min_value: 0, max_value: 10 },
      { name: "Heart Rate", icon: "💓", dimension: "strength", type: "NUMERIC", unit: "bpm", target_value: null, min_value: 40, max_value: 200 },
      { name: "Steps", icon: "👣", dimension: "strength", type: "NUMERIC", unit: "steps", target_value: 10000, min_value: 0, max_value: 50000 },
      { name: "Sleep Quality", icon: "🌙", dimension: "wisdom", type: "NUMERIC", unit: "rating", target_value: 8, min_value: 1, max_value: 10 },
    ],
  },
  {
    key: "fitness", icon: "🏃", label: "Fitness", subtitle: "Build your body",
    habits: [
      { name: "Push-ups", icon: "💪", dimension: "strength", type: "NUMERIC", unit: "reps", target_value: 50, min_value: 0, max_value: 500 },
      { name: "Squats", icon: "🦵", dimension: "strength", type: "NUMERIC", unit: "reps", target_value: 50, min_value: 0, max_value: 500 },
      { name: "Plank", icon: "🧱", dimension: "strength", type: "DURATION", unit: "seconds", target_value: 60, min_value: 0, max_value: 600 },
      { name: "Yoga", icon: "🧘‍♀️", dimension: "confidence", type: "DURATION", unit: "minutes", target_value: 30, min_value: 0, max_value: 120 },
      { name: "Stretching", icon: "🤸", dimension: "confidence", type: "DURATION", unit: "minutes", target_value: 15, min_value: 0, max_value: 60 },
      { name: "Cycling", icon: "🚴", dimension: "strength", type: "DURATION", unit: "minutes", target_value: 30, min_value: 0, max_value: 300 },
      { name: "Swimming", icon: "🏊", dimension: "strength", type: "DURATION", unit: "minutes", target_value: 30, min_value: 0, max_value: 180 },
      { name: "Gym", icon: "🏋️", dimension: "strength", type: "BOOLEAN", unit: "", target_value: 1, min_value: null, max_value: null },
      { name: "Running", icon: "🏃‍♂️", dimension: "strength", type: "DURATION", unit: "minutes", target_value: 30, min_value: 0, max_value: 180 },
    ],
  },
  {
    key: "lifestyle", icon: "🏠", label: "Lifestyle", subtitle: "Daily routines that matter",
    habits: [
      { name: "Eat Fruits", icon: "🍎", dimension: "discipline", type: "BOOLEAN", unit: "", target_value: 1, min_value: null, max_value: null },
      { name: "No Sugar", icon: "🚫", dimension: "discipline", type: "BOOLEAN", unit: "", target_value: 1, min_value: null, max_value: null },
      { name: "Cook Meals", icon: "🍳", dimension: "discipline", type: "BOOLEAN", unit: "", target_value: 1, min_value: null, max_value: null },
      { name: "Clean Space", icon: "🧹", dimension: "discipline", type: "BOOLEAN", unit: "", target_value: 1, min_value: null, max_value: null },
      { name: "Budget", icon: "💰", dimension: "wisdom", type: "BOOLEAN", unit: "", target_value: 1, min_value: null, max_value: null },
      { name: "Wake Early", icon: "🌅", dimension: "discipline", type: "TIME", unit: "", target_value: null, min_value: null, max_value: null },
      { name: "No Phone", icon: "📵", dimension: "focus", type: "BOOLEAN", unit: "", target_value: 1, min_value: null, max_value: null },
      { name: "Gratitude", icon: "🙏", dimension: "wisdom", type: "BOOLEAN", unit: "", target_value: 1, min_value: null, max_value: null },
    ],
  },
  {
    key: "mind", icon: "🧠", label: "Mind", subtitle: "Sharpen your mental edge",
    habits: [
      { name: "Meditate", icon: "🧘", dimension: "wisdom", type: "DURATION", unit: "minutes", target_value: 15, min_value: 0, max_value: 120 },
      { name: "Read Books", icon: "📚", dimension: "wisdom", type: "DURATION", unit: "minutes", target_value: 30, min_value: 0, max_value: 300 },
      { name: "Learn Skill", icon: "🎓", dimension: "wisdom", type: "DURATION", unit: "minutes", target_value: 60, min_value: 0, max_value: 300 },
      { name: "Deep Work", icon: "🎯", dimension: "focus", type: "DURATION", unit: "hours", target_value: 4, min_value: 0, max_value: 16 },
      { name: "Journal", icon: "📝", dimension: "wisdom", type: "BOOLEAN", unit: "", target_value: 1, min_value: null, max_value: null },
      { name: "No Social Media", icon: "📵", dimension: "focus", type: "BOOLEAN", unit: "", target_value: 1, min_value: null, max_value: null },
      { name: "Breathe", icon: "🌬️", dimension: "confidence", type: "DURATION", unit: "minutes", target_value: 5, min_value: 0, max_value: 30 },
      { name: "Study", icon: "📖", dimension: "wisdom", type: "DURATION", unit: "minutes", target_value: 60, min_value: 0, max_value: 480 },
    ],
  },
  {
    key: "quit", icon: "🚫", label: "Quit", subtitle: "Break bad habits",
    habits: [
      { name: "Less Alcohol", icon: "🍷", dimension: "discipline", type: "NUMERIC", unit: "drinks", target_value: 0, min_value: 0, max_value: 20 },
      { name: "Less Sugar", icon: "🍬", dimension: "discipline", type: "BOOLEAN", unit: "", target_value: 1, min_value: null, max_value: null },
      { name: "Less Screen", icon: "📱", dimension: "focus", type: "DURATION", unit: "hours", target_value: 2, min_value: 0, max_value: 16 },
      { name: "Less Caffeine", icon: "☕", dimension: "discipline", type: "NUMERIC", unit: "cups", target_value: 1, min_value: 0, max_value: 10 },
      { name: "No Smoking", icon: "🚭", dimension: "discipline", type: "BOOLEAN", unit: "", target_value: 1, min_value: null, max_value: null },
      { name: "Less Junk Food", icon: "🍔", dimension: "discipline", type: "BOOLEAN", unit: "", target_value: 1, min_value: null, max_value: null },
      { name: "Less Complaining", icon: "🤐", dimension: "confidence", type: "BOOLEAN", unit: "", target_value: 1, min_value: null, max_value: null },
      { name: "Less Sitting", icon: "🪑", dimension: "strength", type: "DURATION", unit: "hours", target_value: 1, min_value: 0, max_value: 16 },
    ],
  },
]

const PRESET_ICONS = [
  "⚖️", "❤️", "💧", "😴", "🌅", "👣", "🔥", "💓",
  "🏋️", "🏃", "⏱️", "📝", "🧘", "🧠", "📖", "🧘‍♂️",
  "✍️", "📱", "🥗", "🚫", "🙏", "😊", "💰", "🪥",
  "🌙", "☕", "🎯", "💪", "🎵", "🌿", "🍎", "✨",
  "🩺", "💊", "🦵", "🧱", "🤸", "🚴", "🏊", "📚",
  "🎓", "📵", "🌬️", "🍷", "🍬", "🚭", "🍔", "🤐",
]

const PRESET_COLORS = [
  "#22C55E", "#16A34A", "#10B981", "#14B8A6",
  "#3B82F6", "#8B5CF6", "#EC4899", "#EF4444",
]

const GREEN = "#22C55E"

/* ──────────────────── COMPONENT ──────────────────── */

export function TrackerCreatePage() {
  const navigate = useNavigate()

  // Mode
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [creating, setCreating] = useState(false)

  // Template selection state
  const [selectedCategory, setSelectedCategory] = useState(0)

  // Custom form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [icon, setIcon] = useState("🎯")
  const [color, setColor] = useState("#22C55E")
  const [habitMode, setHabitMode] = useState<"build" | "quit">("build")
  const [type, setType] = useState<HabitType>("BOOLEAN")
  const [unit, setUnit] = useState("")
  const [targetValue, setTargetValue] = useState("")
  const [trackingDays, setTrackingDays] = useState([1, 2, 3, 4, 5, 6, 7])
  const [timesPerDay, setTimesPerDay] = useState(1)
  const [timeRange, setTimeRange] = useState<TimeRange>("anytime")
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [reminderTime, setReminderTime] = useState("08:00")
  const [selectedDimension, setSelectedDimension] = useState<Dimension>("discipline")

  const resetForm = () => {
    setName("")
    setDescription("")
    setIcon("🎯")
    setColor("#22C55E")
    setHabitMode("build")
    setType("BOOLEAN")
    setUnit("")
    setTargetValue("")
    setTrackingDays([1, 2, 3, 4, 5, 6, 7])
    setTimesPerDay(1)
    setTimeRange("anytime")
    setReminderEnabled(false)
    setReminderTime("08:00")
    setSelectedDimension("discipline")
  }

  const prefillFromTemplate = (h: HabitTemplate) => {
    setName(h.name)
    setIcon(h.icon)
    setType(h.type)
    setUnit(h.unit)
    setTargetValue(h.target_value != null ? String(h.target_value) : "")
    setSelectedDimension(h.dimension)
    setHabitMode(CATEGORIES[selectedCategory].key === "quit" ? "quit" : "build")
    setShowCustomForm(true)
  }

  const handleCreateCustom = async () => {
    if (!name.trim()) return
    setCreating(true)
    try {
      await createTracker({
        name: name.trim(),
        icon,
        color,
        type: type as "NUMERIC" | "BOOLEAN" | "DURATION" | "TIME",
        unit: unit || null,
        unit_secondary: null,
        default_behavior: "NULL",
        target_value: targetValue ? parseFloat(targetValue) : null,
        reminder_enabled: reminderEnabled,
        tracking_days: trackingDays,
        times_per_day: timesPerDay,
      })
      navigate("/")
    } catch {
      alert("Failed to create habit")
    } finally {
      setCreating(false)
    }
  }

  const activeCat = CATEGORIES[selectedCategory]

  /* ───────────── CUSTOM FORM ───────────── */
  if (showCustomForm) {
    return (
      <div className="min-h-screen bg-[#f0fdf4] dark:bg-background">
        <div className="px-5 pt-6 pb-10 space-y-5 max-w-lg mx-auto">
          {/* Header */}
          <div className="flex items-center">
            <button
              onClick={() => { setShowCustomForm(false); resetForm() }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-card border border-border/50 transition-colors hover:bg-gray-50 dark:hover:bg-secondary"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <h1 className="flex-1 text-center text-lg font-bold text-foreground pr-10">Custom Habit</h1>
          </div>

          {/* Section 1 — Identity */}
          <div className="rounded-2xl bg-white dark:bg-card border border-border/40 p-5 space-y-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Identity</h2>

            {/* Icon picker — 6 columns */}
            <div>
              <Label className="text-sm font-semibold text-foreground mb-2 block">Icon</Label>
              <div className="grid grid-cols-8 gap-1.5">
                {PRESET_ICONS.map((i) => (
                  <button
                    key={i}
                    onClick={() => setIcon(i)}
                    className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg transition-all ${
                      icon === i
                        ? "bg-[#22C55E]/15 ring-2 ring-[#22C55E] scale-110"
                        : "hover:bg-gray-100 dark:hover:bg-secondary"
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <Label className="text-sm font-semibold text-foreground mb-1.5 block">Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Morning Run, Read Books..."
                className="h-12 rounded-xl bg-gray-50 dark:bg-secondary border-border/50 text-foreground placeholder:text-muted-foreground focus-visible:ring-[#22C55E] focus-visible:ring-2"
              />
            </div>

            {/* Description */}
            <div>
              <Label className="text-sm font-semibold text-foreground mb-1.5 block">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Why this habit matters to you..."
                className="h-12 rounded-xl bg-gray-50 dark:bg-secondary border-border/50 text-foreground placeholder:text-muted-foreground focus-visible:ring-[#22C55E] focus-visible:ring-2"
              />
            </div>

            {/* Color picker — row of circles */}
            <div>
              <Label className="text-sm font-semibold text-foreground mb-2 block">Color</Label>
              <div className="flex gap-3">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`h-8 w-8 rounded-full transition-all ${
                      color === c
                        ? "ring-2 ring-[#22C55E] ring-offset-2 ring-offset-[#f0fdf4] dark:ring-offset-background scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Section 2 — Goal */}
          <div className="rounded-2xl bg-white dark:bg-card border border-border/40 p-5 space-y-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Goal</h2>

            {/* Build / Quit toggle */}
            <div>
              <Label className="text-sm font-semibold text-foreground mb-2 block">Habit Type</Label>
              <div className="flex gap-2">
                <button
                  onClick={() => setHabitMode("build")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    habitMode === "build"
                      ? "bg-[#22C55E] text-white shadow-md"
                      : "bg-gray-100 dark:bg-secondary text-muted-foreground"
                  }`}
                >
                  Build
                </button>
                <button
                  onClick={() => setHabitMode("quit")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    habitMode === "quit"
                      ? "bg-red-500 text-white shadow-md"
                      : "bg-gray-100 dark:bg-secondary text-muted-foreground"
                  }`}
                >
                  Quit
                </button>
              </div>
            </div>

            {/* Tracking Type */}
            <div>
              <Label className="text-sm font-semibold text-foreground mb-2 block">Tracking Type</Label>
              <div className="grid grid-cols-4 gap-2">
                {([
                  { value: "BOOLEAN" as const, label: "Yes/No", icon: "✓" },
                  { value: "NUMERIC" as const, label: "Number", icon: "#" },
                  { value: "DURATION" as const, label: "Duration", icon: "⏱" },
                  { value: "TIME" as const, label: "Time", icon: "🕐" },
                ]).map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setType(t.value)}
                    className={`py-2.5 rounded-xl text-center transition-all ${
                      type === t.value
                        ? "bg-[#22C55E]/15 border-2 border-[#22C55E] text-foreground"
                        : "bg-gray-50 dark:bg-secondary border border-border/50 text-muted-foreground"
                    }`}
                  >
                    <span className="block text-lg">{t.icon}</span>
                    <span className="text-[11px] font-bold">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Goal value + unit */}
            {type !== "BOOLEAN" && type !== "TIME" && (
              <div>
                <Label className="text-sm font-semibold text-foreground mb-1.5 block">Goal Value</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    placeholder="e.g., 8"
                    className="h-12 w-24 rounded-xl bg-gray-50 dark:bg-secondary border-border/50 text-foreground text-center text-lg font-bold focus-visible:ring-[#22C55E] focus-visible:ring-2"
                  />
                  <Input
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="unit (glasses, km...)"
                    className="h-12 flex-1 rounded-xl bg-gray-50 dark:bg-secondary border-border/50 text-foreground focus-visible:ring-[#22C55E] focus-visible:ring-2"
                  />
                  <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">/ Day</span>
                </div>
              </div>
            )}

            {/* Task Days */}
            <div>
              <Label className="text-sm font-semibold text-foreground mb-1 block">Task Days</Label>
              <p className="text-[11px] text-muted-foreground mb-2">Leave all selected for daily tracking</p>
              <div className="flex gap-1.5">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => {
                  const dayNum = i + 1
                  const active = trackingDays.includes(dayNum)
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setTrackingDays(prev =>
                        active ? prev.filter(x => x !== dayNum) : [...prev, dayNum]
                      )}
                      className={`flex-1 py-2 rounded-lg text-[11px] font-bold transition-all ${
                        active ? "bg-[#22C55E] text-white" : "bg-gray-100 dark:bg-secondary text-muted-foreground"
                      }`}
                    >
                      {d}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Times per day */}
            <div>
              <Label className="text-sm font-semibold text-foreground mb-1 block">Times per Day</Label>
              <p className="text-[11px] text-muted-foreground mb-2">How many times to track daily</p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTimesPerDay(Math.max(1, timesPerDay - 1))}
                  className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-secondary border border-border/50 text-foreground font-bold text-lg"
                >
                  &minus;
                </button>
                <span className="text-2xl font-black w-10 text-center text-foreground">{timesPerDay}</span>
                <button
                  type="button"
                  onClick={() => setTimesPerDay(Math.min(10, timesPerDay + 1))}
                  className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-secondary border border-border/50 text-foreground font-bold text-lg"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Section 3 — Schedule */}
          <div className="rounded-2xl bg-white dark:bg-card border border-border/40 p-5 space-y-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Schedule</h2>

            {/* Time Range */}
            <div>
              <Label className="text-sm font-semibold text-foreground mb-2 block">Time Range</Label>
              <div className="flex gap-2">
                {([
                  { value: "anytime" as const, label: "Anytime" },
                  { value: "morning" as const, label: "Morning" },
                  { value: "afternoon" as const, label: "Afternoon" },
                  { value: "evening" as const, label: "Evening" },
                ]).map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTimeRange(t.value)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      timeRange === t.value
                        ? "bg-[#22C55E] text-white"
                        : "bg-gray-100 dark:bg-secondary text-muted-foreground"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reminders */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Reminders</p>
                <p className="text-[11px] text-muted-foreground">Get notified to log</p>
              </div>
              <Switch checked={reminderEnabled} onCheckedChange={setReminderEnabled} />
            </div>

            {reminderEnabled && (
              <Input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-40 h-11 rounded-xl bg-gray-50 dark:bg-secondary border-border/50 text-foreground focus-visible:ring-[#22C55E] focus-visible:ring-2"
              />
            )}
          </div>

          {/* Section 4 — Personality */}
          <div className="rounded-2xl bg-white dark:bg-card border border-border/40 p-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Personality</h2>
            <p className="text-sm text-muted-foreground">This habit boosts:</p>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(DIMENSION_META) as [Dimension, { icon: string; label: string }][]).map(([key, meta]) => (
                <button
                  key={key}
                  onClick={() => setSelectedDimension(key)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-1.5 ${
                    selectedDimension === key
                      ? "bg-[#22C55E] text-white shadow-md"
                      : "bg-gray-100 dark:bg-secondary text-muted-foreground"
                  }`}
                >
                  <span>{meta.icon}</span>
                  {meta.label}
                </button>
              ))}
            </div>
          </div>

          {/* Create button */}
          <button
            onClick={handleCreateCustom}
            disabled={!name.trim() || creating}
            className="w-full h-14 rounded-2xl bg-[#22C55E] hover:bg-[#16A34A] text-white text-base font-bold shadow-[0_0_24px_rgba(34,197,94,0.4)] transition-all hover:shadow-[0_0_32px_rgba(34,197,94,0.6)] disabled:opacity-40 disabled:shadow-none flex items-center justify-center gap-2"
          >
            {creating && <Loader2 className="h-5 w-5 animate-spin" />}
            Create Habit
          </button>
        </div>

        {/* Creating overlay */}
        {creating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
          </div>
        )}
      </div>
    )
  }

  /* ───────────── TEMPLATE SELECTION ───────────── */
  return (
    <div className="min-h-screen bg-[#f0fdf4] dark:bg-background">
      <div className="max-w-lg mx-auto pb-28">
        {/* Header */}
        <div className="flex items-center px-5 pt-6 pb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-card border border-border/50 transition-colors hover:bg-gray-50 dark:hover:bg-secondary"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="flex-1 text-center text-lg font-bold text-foreground pr-10">New Habit</h1>
        </div>

        {/* Category tabs — horizontal scrollable */}
        <div className="px-4 pb-2">
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {CATEGORIES.map((cat, idx) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(idx)}
                className="flex flex-col items-center gap-1.5 flex-shrink-0"
              >
                <div
                  className={`flex h-[44px] w-[44px] items-center justify-center rounded-full text-xl transition-all ${
                    selectedCategory === idx
                      ? "bg-[#22C55E] shadow-[0_0_12px_rgba(34,197,94,0.4)]"
                      : "bg-white dark:bg-card border border-border/50"
                  }`}
                >
                  {cat.icon}
                </div>
                <span
                  className={`text-[11px] font-semibold transition-colors ${
                    selectedCategory === idx ? "text-[#22C55E]" : "text-muted-foreground"
                  }`}
                >
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Category description */}
        <div className="px-5 pt-3 pb-4">
          <h2 className="text-xl font-bold text-foreground">{activeCat.label}</h2>
          <p className="text-sm text-muted-foreground">{activeCat.subtitle}</p>
        </div>

        {/* Habit list */}
        <div className="px-4 space-y-2">
          {activeCat.habits.map((habit) => {
            const dimMeta = DIMENSION_META[habit.dimension]
            return (
              <div
                key={habit.name}
                className="flex items-center gap-3 rounded-2xl bg-white dark:bg-card border border-border/30 px-4 py-3.5 transition-all hover:shadow-sm"
              >
                {/* Emoji */}
                <span className="text-2xl flex-shrink-0 w-9 text-center">{habit.icon}</span>

                {/* Name */}
                <span className="flex-1 text-[15px] font-semibold text-foreground">{habit.name}</span>

                {/* Dimension badge */}
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-secondary text-[11px] font-semibold text-muted-foreground flex-shrink-0">
                  <span>{dimMeta.icon}</span>
                  {dimMeta.label}
                </span>

                {/* Add button */}
                <button
                  onClick={() => prefillFromTemplate(habit)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#22C55E] text-white flex-shrink-0 transition-all hover:bg-[#16A34A] hover:scale-110 active:scale-95"
                  style={{ boxShadow: `0 0 8px ${GREEN}40` }}
                >
                  <Plus className="h-4 w-4" strokeWidth={3} />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Floating Custom Habit button */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-40 pointer-events-none">
        <button
          onClick={() => { resetForm(); setShowCustomForm(true) }}
          className="pointer-events-auto flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#22C55E] text-white font-bold text-sm shadow-[0_4px_24px_rgba(34,197,94,0.5)] transition-all hover:bg-[#16A34A] hover:shadow-[0_4px_32px_rgba(34,197,94,0.65)] active:scale-95"
        >
          <span className="text-base">✨</span>
          Custom Habit
        </button>
      </div>

      {/* Creating overlay */}
      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
        </div>
      )}
    </div>
  )
}
