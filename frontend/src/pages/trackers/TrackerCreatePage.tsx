import { useState, useMemo, useRef } from "react"
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
import { createTracker } from "@/services/trackers"

/* ──────────────────── TYPES ──────────────────── */

type Dimension = "wisdom" | "strength" | "focus" | "discipline" | "confidence"
type HabitType = "BOOLEAN" | "NUMERIC" | "DURATION" | "TIME" | "DUAL_NUMERIC"
type TimeRange = "anytime" | "morning" | "afternoon" | "evening"

interface DimensionWeights {
  wisdom: number
  strength: number
  focus: number
  discipline: number
  confidence: number
}

interface HabitTemplate {
  name: string
  icon: string
  type: HabitType
  unit?: string
  target_value?: number
  min_value?: number
  max_value?: number
  weights: DimensionWeights
  categories: string[]
}

/* ──────────────────── DIMENSIONS ──────────────────── */

const DIMENSIONS: { key: Dimension; emoji: string; color: string; label: string }[] = [
  { key: "wisdom", emoji: "\uD83E\uDDE0", color: "#8B5CF6", label: "Wisdom" },
  { key: "strength", emoji: "\uD83D\uDCAA", color: "#EF4444", label: "Strength" },
  { key: "focus", emoji: "\uD83C\uDFAF", color: "#F59E0B", label: "Focus" },
  { key: "discipline", emoji: "\uD83D\uDCDA", color: "#3B82F6", label: "Discipline" },
  { key: "confidence", emoji: "\uD83D\uDC64", color: "#EC4899", label: "Confidence" },
]

/* ──────────────────── HABITS ──────────────────── */

const HABITS: HabitTemplate[] = [
  { name: "Meditate", icon: "\uD83E\uDDD8", type: "DURATION", unit: "min", target_value: 15, weights: { wisdom: 60, strength: 0, focus: 90, discipline: 70, confidence: 40 }, categories: ["popular", "mind", "focus"] },
  { name: "Read", icon: "\uD83D\uDCD6", type: "NUMERIC", unit: "pages", target_value: 20, min_value: 0, max_value: 200, weights: { wisdom: 95, strength: 0, focus: 60, discipline: 40, confidence: 30 }, categories: ["popular", "mind"] },
  { name: "Workout", icon: "\uD83D\uDCAA", type: "DURATION", unit: "min", target_value: 45, weights: { wisdom: 0, strength: 95, focus: 30, discipline: 70, confidence: 60 }, categories: ["popular", "body"] },
  { name: "Run", icon: "\uD83C\uDFC3", type: "NUMERIC", unit: "km", target_value: 5, min_value: 0, max_value: 50, weights: { wisdom: 10, strength: 80, focus: 40, discipline: 70, confidence: 50 }, categories: ["popular", "body"] },
  { name: "Drink Water", icon: "\uD83D\uDCA7", type: "NUMERIC", unit: "glasses", target_value: 8, min_value: 0, max_value: 15, weights: { wisdom: 0, strength: 20, focus: 10, discipline: 80, confidence: 10 }, categories: ["popular", "life"] },
  { name: "Cold Shower", icon: "\uD83D\uDEBF", type: "BOOLEAN", weights: { wisdom: 10, strength: 40, focus: 70, discipline: 95, confidence: 80 }, categories: ["popular", "focus"] },
  { name: "Journal", icon: "\uD83D\uDCDD", type: "BOOLEAN", weights: { wisdom: 80, strength: 0, focus: 50, discipline: 60, confidence: 70 }, categories: ["popular", "mind"] },
  { name: "Deep Work", icon: "\uD83E\uDDE0", type: "DURATION", unit: "min", target_value: 120, weights: { wisdom: 90, strength: 0, focus: 100, discipline: 80, confidence: 30 }, categories: ["popular", "mind", "focus"] },
  { name: "Walk 10K Steps", icon: "\uD83D\uDEB6", type: "NUMERIC", unit: "steps", target_value: 10000, min_value: 0, max_value: 30000, weights: { wisdom: 10, strength: 50, focus: 20, discipline: 60, confidence: 30 }, categories: ["popular", "body"] },
  { name: "No Sugar", icon: "\uD83C\uDF6C", type: "BOOLEAN", weights: { wisdom: 10, strength: 30, focus: 20, discipline: 90, confidence: 40 }, categories: ["quit"] },
  { name: "Sleep by 10PM", icon: "\uD83C\uDF19", type: "TIME", weights: { wisdom: 20, strength: 30, focus: 60, discipline: 80, confidence: 20 }, categories: ["life"] },
  { name: "Wake Early", icon: "\uD83C\uDF05", type: "TIME", weights: { wisdom: 30, strength: 10, focus: 50, discipline: 90, confidence: 40 }, categories: ["life"] },
  { name: "Push-ups", icon: "\uD83E\uDEF8", type: "NUMERIC", unit: "reps", target_value: 50, min_value: 0, max_value: 200, weights: { wisdom: 0, strength: 100, focus: 20, discipline: 70, confidence: 60 }, categories: ["body"] },
  { name: "Yoga", icon: "\uD83E\uDDD8\u200D\u2640\uFE0F", type: "DURATION", unit: "min", target_value: 30, weights: { wisdom: 40, strength: 50, focus: 60, discipline: 50, confidence: 70 }, categories: ["popular", "body"] },
  { name: "Gratitude", icon: "\uD83D\uDE4F", type: "BOOLEAN", weights: { wisdom: 60, strength: 0, focus: 30, discipline: 40, confidence: 90 }, categories: ["life"] },
  { name: "No Phone Morning", icon: "\uD83D\uDCF5", type: "BOOLEAN", weights: { wisdom: 30, strength: 0, focus: 95, discipline: 80, confidence: 20 }, categories: ["focus", "quit"] },
  { name: "Cook Meals", icon: "\uD83C\uDF73", type: "BOOLEAN", weights: { wisdom: 20, strength: 10, focus: 10, discipline: 70, confidence: 50 }, categories: ["life"] },
  { name: "Stretch", icon: "\uD83E\uDD38", type: "DURATION", unit: "min", target_value: 15, weights: { wisdom: 10, strength: 60, focus: 30, discipline: 40, confidence: 30 }, categories: ["body"] },
  { name: "Learn Language", icon: "\uD83D\uDDE3\uFE0F", type: "DURATION", unit: "min", target_value: 20, weights: { wisdom: 90, strength: 0, focus: 70, discipline: 60, confidence: 50 }, categories: ["mind"] },
  { name: "Budget", icon: "\uD83D\uDCB0", type: "BOOLEAN", weights: { wisdom: 50, strength: 0, focus: 30, discipline: 80, confidence: 40 }, categories: ["life"] },
  { name: "Call a Friend", icon: "\uD83D\uDCDE", type: "BOOLEAN", weights: { wisdom: 20, strength: 0, focus: 10, discipline: 30, confidence: 90 }, categories: ["life"] },
  { name: "Clean Space", icon: "\uD83E\uDDF9", type: "BOOLEAN", weights: { wisdom: 10, strength: 10, focus: 40, discipline: 70, confidence: 50 }, categories: ["life"] },
  { name: "Blood Pressure", icon: "\u2764\uFE0F", type: "DUAL_NUMERIC", unit: "systolic", weights: { wisdom: 20, strength: 10, focus: 10, discipline: 60, confidence: 40 }, categories: ["body"] },
  { name: "Weight", icon: "\u2696\uFE0F", type: "NUMERIC", unit: "kg", target_value: 72, min_value: 30, max_value: 200, weights: { wisdom: 10, strength: 30, focus: 20, discipline: 60, confidence: 50 }, categories: ["body"] },
  { name: "Limit Screen", icon: "\uD83D\uDCF1", type: "NUMERIC", unit: "hrs", target_value: 2, min_value: 0, max_value: 12, weights: { wisdom: 20, strength: 0, focus: 80, discipline: 70, confidence: 30 }, categories: ["focus", "quit"] },
  { name: "Eat Vegetables", icon: "\uD83E\uDD57", type: "BOOLEAN", weights: { wisdom: 10, strength: 30, focus: 10, discipline: 60, confidence: 40 }, categories: ["life"] },
  { name: "Breathe", icon: "\uD83C\uDF2C\uFE0F", type: "DURATION", unit: "min", target_value: 10, weights: { wisdom: 40, strength: 0, focus: 80, discipline: 50, confidence: 30 }, categories: ["mind", "focus"] },
  { name: "Write 500 Words", icon: "\u270D\uFE0F", type: "NUMERIC", unit: "words", target_value: 500, min_value: 0, max_value: 5000, weights: { wisdom: 80, strength: 0, focus: 70, discipline: 60, confidence: 40 }, categories: ["mind"] },
  { name: "No Alcohol", icon: "\uD83D\uDEAB", type: "BOOLEAN", weights: { wisdom: 20, strength: 20, focus: 40, discipline: 90, confidence: 50 }, categories: ["quit"] },
  { name: "Cycling", icon: "\uD83D\uDEB4", type: "NUMERIC", unit: "km", target_value: 10, min_value: 0, max_value: 100, weights: { wisdom: 10, strength: 80, focus: 30, discipline: 60, confidence: 40 }, categories: ["body"] },
]

/** Sort habits by total impact (sum of all weights) descending */
const SORTED_HABITS = [...HABITS].sort((a, b) => {
  const sumA = Object.values(a.weights).reduce((s, v) => s + v, 0)
  const sumB = Object.values(b.weights).reduce((s, v) => s + v, 0)
  return sumB - sumA
})

/* ──────────────────── CATEGORIES ──────────────────── */

const CATEGORIES = [
  { id: "popular", label: "Popular", emoji: "\u2B50", subtitle: "Most tracked habits" },
  { id: "body", label: "Body", emoji: "\uD83D\uDCAA", subtitle: "Physical health & fitness" },
  { id: "mind", label: "Mind", emoji: "\uD83E\uDDE0", subtitle: "Mental growth & learning" },
  { id: "life", label: "Life", emoji: "\uD83C\uDFE0", subtitle: "Daily routines & lifestyle" },
  { id: "focus", label: "Focus", emoji: "\uD83C\uDFAF", subtitle: "Attention & productivity" },
  { id: "quit", label: "Quit", emoji: "\uD83D\uDEAB", subtitle: "Break bad habits" },
]

/* ──────────────────── HELPERS ──────────────────── */

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

function getPrimaryDimension(weights: DimensionWeights): Dimension {
  let max = 0
  let primary: Dimension = "discipline"
  for (const dim of DIMENSIONS) {
    if (weights[dim.key] > max) {
      max = weights[dim.key]
      primary = dim.key
    }
  }
  return primary
}

/* ──────────────────── STAT BARS COMPONENT ──────────────────── */

function StatBars({ weights }: { weights: DimensionWeights }) {
  return (
    <div className="space-y-1 mt-2 w-full">
      {DIMENSIONS.map((dim) => {
        if (weights[dim.key] === 0) return null
        return (
          <div key={dim.key} className="flex items-center gap-1.5">
            <span className="text-[8px] w-3 flex-shrink-0">{dim.emoji}</span>
            <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${weights[dim.key]}%`, backgroundColor: dim.color }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ──────────────────── COMPONENT ──────────────────── */

export function TrackerCreatePage() {
  const navigate = useNavigate()

  // Mode
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [creating, setCreating] = useState(false)

  // Search & category
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("popular")
  const pillsRef = useRef<HTMLDivElement>(null)

  // Custom form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [icon, setIcon] = useState("\uD83C\uDFAF")
  const [color, setColor] = useState("#22C55E")
  const [habitMode, setHabitMode] = useState<"build" | "quit">("build")
  const [type, setType] = useState<"BOOLEAN" | "NUMERIC" | "DURATION" | "TIME">("BOOLEAN")
  const [unit, setUnit] = useState("")
  const [targetValue, setTargetValue] = useState("")
  const [trackingDays, setTrackingDays] = useState([1, 2, 3, 4, 5, 6, 7])
  const [timesPerDay, setTimesPerDay] = useState(1)
  const [timeRange, setTimeRange] = useState<TimeRange>("anytime")
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [reminderTime, setReminderTime] = useState("08:00")
  const [weights, setWeights] = useState<DimensionWeights>({
    wisdom: 50, strength: 50, focus: 50, discipline: 50, confidence: 50,
  })

  const setWeight = (key: Dimension, value: number) => {
    setWeights((prev) => ({ ...prev, [key]: value }))
  }

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
    setWeights({ wisdom: 50, strength: 50, focus: 50, discipline: 50, confidence: 50 })
  }

  const prefillFromTemplate = (h: HabitTemplate) => {
    setName(h.name)
    setIcon(h.icon)
    const formType = h.type === "DUAL_NUMERIC" ? "NUMERIC" : h.type
    setType(formType as "BOOLEAN" | "NUMERIC" | "DURATION" | "TIME")
    setUnit(h.unit || "")
    setTargetValue(h.target_value != null ? String(h.target_value) : "")
    setWeights({ ...h.weights })
    setHabitMode("build")
    setShowCustomForm(true)
  }

  const handleCreateCustom = async () => {
    if (!name.trim()) return
    setCreating(true)
    try {
      const dimension = getPrimaryDimension(weights)
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
        dimension,
      })
      navigate("/")
    } catch {
      alert("Failed to create habit")
    } finally {
      setCreating(false)
    }
  }

  /** Filtered and sorted habits based on search + category */
  const filteredHabits = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (q) {
      // Search overrides category filter
      return SORTED_HABITS.filter((h) => h.name.toLowerCase().includes(q))
    }
    return SORTED_HABITS.filter((h) => h.categories.includes(selectedCategory))
  }, [searchQuery, selectedCategory])

  const activeCategory = CATEGORIES.find((c) => c.id === selectedCategory)

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
                      onClick={() => setTrackingDays((prev) =>
                        active ? prev.filter((x) => x !== dayNum) : [...prev, dayNum]
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

          {/* Section 4 -- Dimension Weights (sliders) */}
          <div className="rounded-2xl bg-white dark:bg-card border border-border/40 p-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Dimension Weights</h2>
            <p className="text-sm text-muted-foreground">How does this habit affect your personality?</p>

            <div className="space-y-4">
              {DIMENSIONS.map((dim) => (
                <div key={dim.key} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{dim.emoji}</span>
                      <span className="text-sm font-semibold text-foreground">{dim.label}</span>
                    </div>
                    <span
                      className="text-sm font-bold tabular-nums min-w-[2ch] text-right"
                      style={{ color: dim.color }}
                    >
                      {weights[dim.key]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={weights[dim.key]}
                    onChange={(e) => setWeight(dim.key, parseInt(e.target.value, 10))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${dim.color} 0%, ${dim.color} ${weights[dim.key]}%, var(--border) ${weights[dim.key]}%, var(--border) 100%)`,
                      accentColor: dim.color,
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Live stat preview */}
            <div className="mt-4 pt-4 border-t border-border/40">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Preview</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">{name || "Your Habit"}</p>
                  <StatBars weights={weights} />
                </div>
              </div>
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

        {/* Build Your Own -- compact row */}
        <div className="px-4 mb-4 space-y-2">
          <button
            onClick={() => { resetForm(); setShowCustomForm(true) }}
            className="w-full rounded-xl bg-card border border-border px-4 py-3 text-left transition-all hover:bg-secondary/50 active:scale-[0.99]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-foreground">Build Your Own Pulse</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </button>

          <button
            onClick={() => navigate("/quiz")}
            className="w-full flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left hover:bg-accent transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
              <Sparkles className="h-5 w-5 text-amber-500" />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-bold text-foreground">Take the Quiz</p>
              <p className="text-[11px] text-muted-foreground">Answer questions to get personalized suggestions</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Search bar */}
        <div className="px-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search habits..."
              className="h-11 pl-10 rounded-xl bg-white dark:bg-card border-border/50 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:ring-2"
            />
          </div>
        </div>

        {/* Category pills -- horizontal scrollable */}
        <div className="px-4 mb-2">
          <div ref={pillsRef} className="flex gap-2 overflow-x-auto pb-2 scrollbar-none" style={{ WebkitOverflowScrolling: "touch" }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.id); setSearchQuery("") }}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all ${
                  selectedCategory === cat.id && !searchQuery
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:bg-secondary/50"
                }`}
              >
                <span className="text-sm">{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category subtitle */}
        {!searchQuery && activeCategory && (
          <div className="px-4 mb-4">
            <p className="text-xs text-muted-foreground font-medium">{activeCategory.subtitle}</p>
          </div>
        )}
        {searchQuery && (
          <div className="px-4 mb-4">
            <p className="text-xs text-muted-foreground font-medium">Search results for &ldquo;{searchQuery}&rdquo;</p>
          </div>
        )}

        {/* Habit list -- clean rows */}
        <div className="px-4 space-y-2">
          {filteredHabits.map((habit) => {
            const primaryDim = getPrimaryDimension(habit.weights)
            const dimInfo = DIMENSIONS.find((d) => d.key === primaryDim)
            return (
              <div
                key={habit.name}
                className="flex items-center gap-3 rounded-xl bg-card border border-border px-4 py-3 transition-all hover:bg-secondary/30"
              >
                {/* Icon */}
                <span className="text-2xl flex-shrink-0">{habit.icon}</span>

                {/* Name */}
                <span className="flex-1 text-sm font-bold text-foreground leading-tight">{habit.name}</span>

                {/* Dimension pill */}
                {dimInfo && (
                  <span
                    className="flex-shrink-0 text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                    style={{
                      color: dimInfo.color,
                      backgroundColor: `${dimInfo.color}1A`,
                    }}
                  >
                    {dimInfo.emoji} {dimInfo.label}
                  </span>
                )}

                {/* Add button */}
                <button
                  onClick={() => prefillFromTemplate(habit)}
                  className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-all hover:bg-primary/20 hover:scale-110 active:scale-95"
                >
                  <Plus className="h-4 w-4" strokeWidth={3} />
                </button>
              </div>
            )
          })}

          {/* Empty state */}
          {filteredHabits.length === 0 && (
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
