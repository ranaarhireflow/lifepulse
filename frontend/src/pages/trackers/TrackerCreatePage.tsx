import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  ArrowLeft,
  Loader2,
  Plus,
  Search,
  Sparkles,
  ChevronRight,
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

const DIMENSION_META: Record<Dimension, { icon: string; label: string; color: string; bgColor: string; borderColor: string; description: string }> = {
  wisdom:     { icon: "\uD83E\uDDE0", label: "Wisdom",     color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-100 dark:bg-purple-900/30",   borderColor: "border-l-purple-500", description: "Habits that make you smarter" },
  strength:   { icon: "\uD83D\uDCAA", label: "Strength",   color: "text-red-600 dark:text-red-400",       bgColor: "bg-red-100 dark:bg-red-900/30",         borderColor: "border-l-red-500",    description: "Habits that make you physically stronger" },
  focus:      { icon: "\uD83C\uDFAF", label: "Focus",      color: "text-amber-600 dark:text-amber-400",   bgColor: "bg-amber-100 dark:bg-amber-900/30",     borderColor: "border-l-amber-500",  description: "Habits that sharpen your mind" },
  discipline: { icon: "\uD83D\uDCDA", label: "Discipline", color: "text-blue-600 dark:text-blue-400",     bgColor: "bg-blue-100 dark:bg-blue-900/30",       borderColor: "border-l-blue-500",   description: "Habits that build consistency" },
  confidence: { icon: "\uD83D\uDC64", label: "Confidence", color: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-100 dark:bg-emerald-900/30", borderColor: "border-l-emerald-500", description: "Habits that boost self-image" },
}

const DIMENSION_ORDER: Dimension[] = ["wisdom", "strength", "focus", "discipline", "confidence"]

/** All habits grouped by dimension */
const HABITS_BY_DIMENSION: Record<Dimension, HabitTemplate[]> = {
  wisdom: [
    { name: "Read 30 Min", icon: "\uD83D\uDCD6", dimension: "wisdom", type: "DURATION", unit: "minutes", target_value: 30, min_value: 0, max_value: 300 },
    { name: "Deep Work", icon: "\uD83C\uDFAF", dimension: "wisdom", type: "DURATION", unit: "hours", target_value: 4, min_value: 0, max_value: 16 },
    { name: "Learn Skill", icon: "\uD83C\uDF93", dimension: "wisdom", type: "DURATION", unit: "minutes", target_value: 60, min_value: 0, max_value: 300 },
    { name: "Write", icon: "\u270D\uFE0F", dimension: "wisdom", type: "BOOLEAN", unit: "", target_value: 1, min_value: null, max_value: null },
    { name: "Study", icon: "\uD83D\uDCD6", dimension: "wisdom", type: "DURATION", unit: "minutes", target_value: 60, min_value: 0, max_value: 480 },
    { name: "No Phone Morning", icon: "\uD83D\uDCF5", dimension: "wisdom", type: "BOOLEAN", unit: "", target_value: 1, min_value: null, max_value: null },
    { name: "Meditate", icon: "\uD83E\uDDD8", dimension: "wisdom", type: "DURATION", unit: "minutes", target_value: 15, min_value: 0, max_value: 120 },
    { name: "Read Books", icon: "\uD83D\uDCDA", dimension: "wisdom", type: "DURATION", unit: "minutes", target_value: 30, min_value: 0, max_value: 300 },
    { name: "Journal", icon: "\uD83D\uDCDD", dimension: "wisdom", type: "BOOLEAN", unit: "", target_value: 1, min_value: null, max_value: null },
    { name: "Sleep Quality", icon: "\uD83C\uDF19", dimension: "wisdom", type: "NUMERIC", unit: "rating", target_value: 8, min_value: 1, max_value: 10 },
    { name: "Budget", icon: "\uD83D\uDCB0", dimension: "wisdom", type: "BOOLEAN", unit: "", target_value: 1, min_value: null, max_value: null },
    { name: "Gratitude", icon: "\uD83D\uDE4F", dimension: "wisdom", type: "BOOLEAN", unit: "", target_value: 1, min_value: null, max_value: null },
  ],
  strength: [
    { name: "Push-ups", icon: "\uD83D\uDCAA", dimension: "strength", type: "NUMERIC", unit: "reps", target_value: 50, min_value: 0, max_value: 500 },
    { name: "Workout", icon: "\uD83C\uDFCB\uFE0F", dimension: "strength", type: "BOOLEAN", unit: "", target_value: 1, min_value: null, max_value: null },
    { name: "Run", icon: "\uD83C\uDFC3", dimension: "strength", type: "DURATION", unit: "minutes", target_value: 30, min_value: 0, max_value: 180 },
    { name: "Walk 10K Steps", icon: "\uD83D\uDEB6", dimension: "strength", type: "NUMERIC", unit: "steps", target_value: 10000, min_value: 0, max_value: 50000 },
    { name: "Stretching", icon: "\uD83E\uDD38", dimension: "strength", type: "DURATION", unit: "minutes", target_value: 15, min_value: 0, max_value: 60 },
    { name: "Cycling", icon: "\uD83D\uDEB4", dimension: "strength", type: "DURATION", unit: "minutes", target_value: 30, min_value: 0, max_value: 300 },
    { name: "Squats", icon: "\uD83E\uDDB5", dimension: "strength", type: "NUMERIC", unit: "reps", target_value: 50, min_value: 0, max_value: 500 },
    { name: "Plank", icon: "\uD83E\uDDF1", dimension: "strength", type: "DURATION", unit: "seconds", target_value: 60, min_value: 0, max_value: 600 },
    { name: "Swimming", icon: "\uD83C\uDFCA", dimension: "strength", type: "DURATION", unit: "minutes", target_value: 30, min_value: 0, max_value: 180 },
    { name: "Gym", icon: "\uD83C\uDFCB\uFE0F", dimension: "strength", type: "BOOLEAN", unit: "", target_value: 1, min_value: null, max_value: null },
    { name: "Heart Rate", icon: "\uD83D\uDC93", dimension: "strength", type: "NUMERIC", unit: "bpm", target_value: null, min_value: 40, max_value: 200 },
    { name: "Steps", icon: "\uD83D\uDC63", dimension: "strength", type: "NUMERIC", unit: "steps", target_value: 10000, min_value: 0, max_value: 50000 },
    { name: "Less Sitting", icon: "\uD83E\uDE91", dimension: "strength", type: "DURATION", unit: "hours", target_value: 1, min_value: 0, max_value: 16 },
  ],
  focus: [
    { name: "Cold Shower", icon: "\uD83E\uDD76", dimension: "focus", type: "BOOLEAN", unit: "", target_value: 1, min_value: null, max_value: null },
    { name: "Breathe", icon: "\uD83C\uDF2C\uFE0F", dimension: "focus", type: "DURATION", unit: "minutes", target_value: 5, min_value: 0, max_value: 30 },
    { name: "No Social Media", icon: "\uD83D\uDCF5", dimension: "focus", type: "BOOLEAN", unit: "", target_value: 1, min_value: null, max_value: null },
    { name: "Limit Screen Time", icon: "\uD83D\uDCF1", dimension: "focus", type: "DURATION", unit: "hours", target_value: 2, min_value: 0, max_value: 16 },
    { name: "No Phone", icon: "\uD83D\uDCF5", dimension: "focus", type: "BOOLEAN", unit: "", target_value: 1, min_value: null, max_value: null },
  ],
  discipline: [
    { name: "Drink Water", icon: "\uD83D\uDCA7", dimension: "discipline", type: "NUMERIC", unit: "glasses", target_value: 8, min_value: 0, max_value: 20 },
    { name: "Sleep by 10PM", icon: "\uD83D\uDE34", dimension: "discipline", type: "BOOLEAN", unit: "", target_value: 1, min_value: null, max_value: null },
    { name: "Wake Early", icon: "\uD83C\uDF05", dimension: "discipline", type: "TIME", unit: "", target_value: null, min_value: null, max_value: null },
    { name: "Cook Meals", icon: "\uD83C\uDF73", dimension: "discipline", type: "BOOLEAN", unit: "", target_value: 1, min_value: null, max_value: null },
    { name: "Clean Space", icon: "\uD83E\uDDF9", dimension: "discipline", type: "BOOLEAN", unit: "", target_value: 1, min_value: null, max_value: null },
    { name: "Calories", icon: "\uD83D\uDD25", dimension: "discipline", type: "NUMERIC", unit: "kcal", target_value: 2000, min_value: 0, max_value: 5000 },
    { name: "Vitamins", icon: "\uD83D\uDC8A", dimension: "discipline", type: "BOOLEAN", unit: "", target_value: 1, min_value: null, max_value: null },
    { name: "Hydration", icon: "\uD83D\uDCA7", dimension: "discipline", type: "NUMERIC", unit: "liters", target_value: 3, min_value: 0, max_value: 10 },
    { name: "Blood Pressure", icon: "\uD83E\uDE7A", dimension: "discipline", type: "NUMERIC", unit: "mmHg", target_value: 120, min_value: 60, max_value: 200 },
    { name: "Weight", icon: "\u2696\uFE0F", dimension: "discipline", type: "NUMERIC", unit: "kg", target_value: null, min_value: 30, max_value: 300 },
    { name: "Sleep", icon: "\uD83D\uDE34", dimension: "discipline", type: "DURATION", unit: "hours", target_value: 8, min_value: 0, max_value: 24 },
    { name: "Eat Fruits", icon: "\uD83C\uDF4E", dimension: "discipline", type: "BOOLEAN", unit: "", target_value: 1, min_value: null, max_value: null },
    { name: "No Sugar", icon: "\uD83D\uDEAB", dimension: "discipline", type: "BOOLEAN", unit: "", target_value: 1, min_value: null, max_value: null },
    { name: "Less Alcohol", icon: "\uD83C\uDF77", dimension: "discipline", type: "NUMERIC", unit: "drinks", target_value: 0, min_value: 0, max_value: 20 },
    { name: "Less Caffeine", icon: "\u2615", dimension: "discipline", type: "NUMERIC", unit: "cups", target_value: 1, min_value: 0, max_value: 10 },
    { name: "No Smoking", icon: "\uD83D\uDEAD", dimension: "discipline", type: "BOOLEAN", unit: "", target_value: 1, min_value: null, max_value: null },
    { name: "Less Junk Food", icon: "\uD83C\uDF54", dimension: "discipline", type: "BOOLEAN", unit: "", target_value: 1, min_value: null, max_value: null },
  ],
  confidence: [
    { name: "Yoga", icon: "\uD83E\uDDD8\u200D\u2640\uFE0F", dimension: "confidence", type: "DURATION", unit: "minutes", target_value: 30, min_value: 0, max_value: 120 },
    { name: "Call a Friend", icon: "\uD83D\uDCDE", dimension: "confidence", type: "BOOLEAN", unit: "", target_value: 1, min_value: null, max_value: null },
    { name: "Eat Healthy", icon: "\uD83E\uDD57", dimension: "confidence", type: "BOOLEAN", unit: "", target_value: 1, min_value: null, max_value: null },
    { name: "Grooming", icon: "\uD83E\uDDF4", dimension: "confidence", type: "BOOLEAN", unit: "", target_value: 1, min_value: null, max_value: null },
    { name: "Less Complaining", icon: "\uD83E\uDD10", dimension: "confidence", type: "BOOLEAN", unit: "", target_value: 1, min_value: null, max_value: null },
  ],
}

const PRESET_ICONS = [
  "\u2696\uFE0F", "\u2764\uFE0F", "\uD83D\uDCA7", "\uD83D\uDE34", "\uD83C\uDF05", "\uD83D\uDC63", "\uD83D\uDD25", "\uD83D\uDC93",
  "\uD83C\uDFCB\uFE0F", "\uD83C\uDFC3", "\u23F1\uFE0F", "\uD83D\uDCDD", "\uD83E\uDDD8", "\uD83E\uDDE0", "\uD83D\uDCD6", "\uD83E\uDDD8\u200D\u2642\uFE0F",
  "\u270D\uFE0F", "\uD83D\uDCF1", "\uD83E\uDD57", "\uD83D\uDEAB", "\uD83D\uDE4F", "\uD83D\uDE0A", "\uD83D\uDCB0", "\uD83E\uDEB9",
  "\uD83C\uDF19", "\u2615", "\uD83C\uDFAF", "\uD83D\uDCAA", "\uD83C\uDFB5", "\uD83C\uDF3F", "\uD83C\uDF4E", "\u2728",
  "\uD83E\uDE7A", "\uD83D\uDC8A", "\uD83E\uDDB5", "\uD83E\uDDF1", "\uD83E\uDD38", "\uD83D\uDEB4", "\uD83C\uDFCA", "\uD83D\uDCDA",
  "\uD83C\uDF93", "\uD83D\uDCF5", "\uD83C\uDF2C\uFE0F", "\uD83C\uDF77", "\uD83C\uDF6C", "\uD83D\uDEAD", "\uD83C\uDF54", "\uD83E\uDD10",
]

const PRESET_COLORS = [
  "#22C55E", "#16A34A", "#10B981", "#14B8A6",
  "#3B82F6", "#8B5CF6", "#EC4899", "#EF4444",
]

/* ──────────────────── COMPONENT ──────────────────── */

export function TrackerCreatePage() {
  const navigate = useNavigate()

  // Mode
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [creating, setCreating] = useState(false)

  // Search
  const [searchQuery, setSearchQuery] = useState("")

  // Custom form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [icon, setIcon] = useState("\uD83C\uDFAF")
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
    setIcon("\uD83C\uDFAF")
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
    setHabitMode("build")
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

  /** Filtered habits per dimension based on search */
  const filteredDimensions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return DIMENSION_ORDER.map((dim) => {
      const habits = HABITS_BY_DIMENSION[dim].filter((h) =>
        !q || h.name.toLowerCase().includes(q)
      )
      return { dim, habits }
    }).filter((d) => d.habits.length > 0)
  }, [searchQuery])

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

          {/* Section 1 -- Identity */}
          <div className="rounded-2xl bg-white dark:bg-card border border-border/40 p-5 space-y-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Identity</h2>

            {/* Icon picker */}
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

            {/* Color picker */}
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

          {/* Section 2 -- Goal */}
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
                  { value: "BOOLEAN" as const, label: "Yes/No", icon: "\u2713" },
                  { value: "NUMERIC" as const, label: "Number", icon: "#" },
                  { value: "DURATION" as const, label: "Duration", icon: "\u23F1" },
                  { value: "TIME" as const, label: "Time", icon: "\uD83D\uDD50" },
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

          {/* Section 3 -- Schedule */}
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

          {/* Section 4 -- Personality */}
          <div className="rounded-2xl bg-white dark:bg-card border border-border/40 p-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Personality</h2>
            <p className="text-sm text-muted-foreground">This habit boosts:</p>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(DIMENSION_META) as [Dimension, typeof DIMENSION_META[Dimension]][]).map(([key, meta]) => (
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
      <div className="max-w-lg mx-auto pb-10">
        {/* Header */}
        <div className="flex items-center px-5 pt-6 pb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-card border border-border/50 transition-colors hover:bg-gray-50 dark:hover:bg-secondary"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="flex-1 text-center text-lg font-bold text-foreground pr-10">Add a Pulse</h1>
        </div>

        {/* Build Your Own -- prominent top card */}
        <div className="px-4 mb-5">
          <button
            onClick={() => { resetForm(); setShowCustomForm(true) }}
            className="w-full rounded-2xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] p-5 text-left transition-all hover:shadow-lg hover:shadow-green-500/20 active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-white/90" />
                  <span className="text-lg font-bold text-white">Build Your Own Pulse</span>
                </div>
                <p className="text-sm text-white/80">Create a custom habit with your own goals</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <ChevronRight className="h-5 w-5 text-white" />
              </div>
            </div>
          </button>
        </div>

        {/* Search bar */}
        <div className="px-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search habits..."
              className="h-11 pl-10 rounded-xl bg-white dark:bg-card border-border/50 text-foreground placeholder:text-muted-foreground focus-visible:ring-[#22C55E] focus-visible:ring-2"
            />
          </div>
        </div>

        {/* Dimensions + habit cards */}
        <div className="px-4 space-y-8">
          {filteredDimensions.map(({ dim, habits }) => {
            const meta = DIMENSION_META[dim]
            return (
              <section key={dim}>
                {/* Dimension header */}
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xl">{meta.icon}</span>
                    <h2 className={`text-base font-bold ${meta.color}`}>{meta.label}</h2>
                  </div>
                  <p className="text-xs text-muted-foreground pl-8">{meta.description}</p>
                </div>

                {/* 2-column card grid */}
                <div className="grid grid-cols-2 gap-3">
                  {habits.map((habit) => (
                    <div
                      key={`${dim}-${habit.name}`}
                      className={`relative rounded-xl bg-white dark:bg-card border border-border/30 border-l-[3px] ${meta.borderColor} p-4 flex flex-col items-center text-center transition-all hover:shadow-md`}
                    >
                      {/* Icon */}
                      <span className="text-3xl mb-2">{habit.icon}</span>

                      {/* Name */}
                      <span className="text-sm font-bold text-foreground leading-tight mb-2">{habit.name}</span>

                      {/* Dimension pill */}
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${meta.bgColor} ${meta.color} mb-3`}>
                        <span className="text-xs">{meta.icon}</span>
                        {meta.label}
                      </span>

                      {/* Add button */}
                      <button
                        onClick={() => prefillFromTemplate(habit)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#22C55E] text-white transition-all hover:bg-[#16A34A] hover:scale-110 active:scale-95"
                        style={{ boxShadow: "0 0 8px rgba(34,197,94,0.25)" }}
                      >
                        <Plus className="h-4 w-4" strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )
          })}

          {/* Empty search state */}
          {filteredDimensions.length === 0 && (
            <div className="text-center py-12">
              <span className="text-4xl mb-3 block">{"\uD83D\uDD0D"}</span>
              <p className="text-sm font-semibold text-foreground">No habits found</p>
              <p className="text-xs text-muted-foreground mt-1">Try a different search or build your own</p>
            </div>
          )}
        </div>
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
