import { useState, useEffect, useRef } from "react"
import { useNavigate, NavLink } from "react-router-dom"
import { Loader2, ChevronUp, ChevronRight, ChevronDown, X, Check, Sparkles, Trophy } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import api from "@/services/api"
import { PulseLogo } from "@/components/common/PulseLogo"
import { fetchTrackers, type Tracker } from "@/services/trackers"

interface MonkScore {
  level: number
  xp_total: number
  xp_to_next: number
  overall: number
  wisdom: number
  strength: number
  focus: number
  discipline: number
  confidence: number
}

const STATS = [
  { key: "wisdom", label: "Wisdom", emoji: "\u{1F9E0}", color: "#8B5CF6", bgColor: "rgba(139, 92, 246, 0.15)" },
  { key: "confidence", label: "Confidence", emoji: "\u{1F464}", color: "#EC4899", bgColor: "rgba(236, 72, 153, 0.15)" },
  { key: "strength", label: "Strength", emoji: "\u{1F4AA}", color: "#EF4444", bgColor: "rgba(239, 68, 68, 0.15)" },
  { key: "discipline", label: "Discipline", emoji: "\u{1F4DA}", color: "#F59E0B", bgColor: "rgba(245, 158, 11, 0.15)" },
  { key: "focus", label: "Focus", emoji: "\u{1F3AF}", color: "#3B82F6", bgColor: "rgba(59, 130, 246, 0.15)" },
]

interface SuggestedHabit {
  id: string
  name: string
  description: string
  fit: number
  circleColor: string
  gradient: string
  study: string
  boosts: { stat: string; pct: number; color: string }[]
}

const SUGGESTED_HABITS: SuggestedHabit[] = [
  {
    id: "meditate", name: "MEDITATE", description: "Daily meditation practice", fit: 93,
    circleColor: "#8B5CF6", gradient: "linear-gradient(135deg, #7C3AED, #6D28D9)",
    study: "A 2014 meta-analysis in JAMA Internal Medicine found that mindfulness meditation programs showed moderate evidence of improving anxiety, depression, and pain.",
    boosts: [
      { stat: "Calm", pct: 20, color: "#8B5CF6" },
      { stat: "Focus", pct: 20, color: "#3B82F6" },
      { stat: "Clarity", pct: 20, color: "#A78BFA" },
    ],
  },
  {
    id: "journal", name: "JOURNAL", description: "Reflective journaling", fit: 87,
    circleColor: "#F59E0B", gradient: "linear-gradient(135deg, #D97706, #B45309)",
    study: "Research from the University of Texas found that expressive writing about emotions and stress can strengthen immune cells and reduce symptoms of asthma and rheumatoid arthritis.",
    boosts: [
      { stat: "Clarity", pct: 20, color: "#F59E0B" },
      { stat: "Mood", pct: 15, color: "#FBBF24" },
      { stat: "Processing", pct: 15, color: "#D97706" },
    ],
  },
  {
    id: "cold-shower", name: "COLD SHOWER", description: "Cold water exposure", fit: 81,
    circleColor: "#06B6D4", gradient: "linear-gradient(135deg, #0891B2, #0E7490)",
    study: "A 2016 Dutch study published in PLOS ONE found participants who took cold showers had a 29% reduction in sickness absence from work.",
    boosts: [
      { stat: "Discipline", pct: 25, color: "#06B6D4" },
      { stat: "Confidence", pct: 20, color: "#22D3EE" },
      { stat: "Energy", pct: 15, color: "#14B8A6" },
    ],
  },
  {
    id: "read-30", name: "READ 30 MIN", description: "Daily reading habit", fit: 91,
    circleColor: "#22C55E", gradient: "linear-gradient(135deg, #16A34A, #15803D)",
    study: "Research from Yale University found that reading books for 30 minutes a day was linked to a 20% reduction in mortality over a 12-year period.",
    boosts: [
      { stat: "Wisdom", pct: 25, color: "#22C55E" },
      { stat: "Focus", pct: 15, color: "#3B82F6" },
      { stat: "Vocabulary", pct: 10, color: "#4ADE80" },
    ],
  },
  {
    id: "no-phone-morning", name: "NO PHONE 1HR MORNING", description: "Phone-free mornings", fit: 88,
    circleColor: "#3B82F6", gradient: "linear-gradient(135deg, #2563EB, #1D4ED8)",
    study: "Studies show that checking your phone within the first hour trains your brain to be reactive rather than proactive, reducing focus capacity for the rest of the day.",
    boosts: [
      { stat: "Focus", pct: 30, color: "#3B82F6" },
      { stat: "Clarity", pct: 20, color: "#60A5FA" },
    ],
  },
  {
    id: "walk-10k", name: "WALK 10K STEPS", description: "Daily walking goal", fit: 85,
    circleColor: "#14B8A6", gradient: "linear-gradient(135deg, #0D9488, #0F766E)",
    study: "A 2019 study in JAMA Internal Medicine found that women who averaged 4,400 steps per day had significantly lower mortality rates than those who averaged 2,700 steps.",
    boosts: [
      { stat: "Energy", pct: 20, color: "#14B8A6" },
      { stat: "Mood", pct: 15, color: "#2DD4BF" },
      { stat: "Health", pct: 15, color: "#5EEAD4" },
    ],
  },
  {
    id: "stretch-15", name: "STRETCH 15 MIN", description: "Daily stretching routine", fit: 79,
    circleColor: "#EC4899", gradient: "linear-gradient(135deg, #DB2777, #BE185D)",
    study: "The American College of Sports Medicine recommends stretching for improved joint range of motion, enhanced muscular function, and reduced risk of injury.",
    boosts: [
      { stat: "Flexibility", pct: 20, color: "#EC4899" },
      { stat: "Recovery", pct: 15, color: "#F472B6" },
      { stat: "Calm", pct: 10, color: "#FBCFE8" },
    ],
  },
  {
    id: "drink-3l", name: "DRINK 3L WATER", description: "Optimal hydration", fit: 90,
    circleColor: "#0EA5E9", gradient: "linear-gradient(135deg, #0284C7, #0369A1)",
    study: "A study in the Journal of Clinical Endocrinology & Metabolism found that drinking 500ml of water increased metabolic rate by 30% within 10 minutes.",
    boosts: [
      { stat: "Health", pct: 20, color: "#0EA5E9" },
      { stat: "Energy", pct: 15, color: "#38BDF8" },
      { stat: "Skin", pct: 10, color: "#7DD3FC" },
    ],
  },
  {
    id: "sleep-10pm", name: "SLEEP BY 10PM", description: "Early sleep schedule", fit: 95,
    circleColor: "#6366F1", gradient: "linear-gradient(135deg, #4F46E5, #4338CA)",
    study: "Research in the European Heart Journal found that falling asleep between 10-11pm was associated with the lowest risk of developing cardiovascular disease.",
    boosts: [
      { stat: "Recovery", pct: 25, color: "#6366F1" },
      { stat: "Focus", pct: 20, color: "#818CF8" },
      { stat: "Mood", pct: 15, color: "#A5B4FC" },
    ],
  },
  {
    id: "no-sugar", name: "NO SUGAR", description: "Eliminate added sugar", fit: 82,
    circleColor: "#EF4444", gradient: "linear-gradient(135deg, #DC2626, #B91C1C)",
    study: "A study published in JAMA Internal Medicine found that those who consumed 25%+ of daily calories from sugar were more than twice as likely to die from heart disease.",
    boosts: [
      { stat: "Discipline", pct: 25, color: "#EF4444" },
      { stat: "Health", pct: 20, color: "#F87171" },
      { stat: "Energy", pct: 15, color: "#FCA5A5" },
    ],
  },
  {
    id: "cook-meals", name: "COOK OWN MEALS", description: "Home cooking habit", fit: 78,
    circleColor: "#F97316", gradient: "linear-gradient(135deg, #EA580C, #C2410C)",
    study: "A study in the International Journal of Behavioral Nutrition found that cooking at home is associated with a higher quality diet and lower calorie consumption.",
    boosts: [
      { stat: "Health", pct: 20, color: "#F97316" },
      { stat: "Discipline", pct: 15, color: "#FB923C" },
      { stat: "Savings", pct: 10, color: "#FDBA74" },
    ],
  },
  {
    id: "gratitude", name: "GRATITUDE LIST", description: "Daily gratitude practice", fit: 89,
    circleColor: "#EAB308", gradient: "linear-gradient(135deg, #CA8A04, #A16207)",
    study: "Research by Dr. Robert Emmons at UC Davis found that people who kept a gratitude journal reported 25% higher well-being scores and exercised 33% more.",
    boosts: [
      { stat: "Mood", pct: 25, color: "#EAB308" },
      { stat: "Perspective", pct: 20, color: "#FACC15" },
      { stat: "Calm", pct: 10, color: "#FDE047" },
    ],
  },
  {
    id: "deep-work", name: "DEEP WORK 2HR", description: "Focused deep work block", fit: 94,
    circleColor: "#7C3AED", gradient: "linear-gradient(135deg, #6D28D9, #5B21B6)",
    study: "Cal Newport's research shows that the ability to perform deep work is becoming increasingly rare and valuable, with top performers averaging 4 hours of deep work daily.",
    boosts: [
      { stat: "Focus", pct: 30, color: "#7C3AED" },
      { stat: "Productivity", pct: 25, color: "#8B5CF6" },
      { stat: "Wisdom", pct: 10, color: "#A78BFA" },
    ],
  },
  {
    id: "no-social-media", name: "NO SOCIAL MEDIA", description: "Digital detox", fit: 86,
    circleColor: "#64748B", gradient: "linear-gradient(135deg, #475569, #334155)",
    study: "A University of Pennsylvania study found that limiting social media to 30 min/day led to significant reductions in loneliness and depression in just 3 weeks.",
    boosts: [
      { stat: "Focus", pct: 25, color: "#64748B" },
      { stat: "Time", pct: 20, color: "#94A3B8" },
      { stat: "Clarity", pct: 15, color: "#CBD5E1" },
    ],
  },
  {
    id: "learn-skill", name: "LEARN NEW SKILL", description: "Continuous learning", fit: 83,
    circleColor: "#10B981", gradient: "linear-gradient(135deg, #059669, #047857)",
    study: "Research published in Psychological Science found that learning a demanding new skill like photography or quilting enhanced memory function in older adults.",
    boosts: [
      { stat: "Wisdom", pct: 25, color: "#10B981" },
      { stat: "Confidence", pct: 15, color: "#34D399" },
      { stat: "Growth", pct: 15, color: "#6EE7B7" },
    ],
  },
  {
    id: "call-friend", name: "CALL A FRIEND", description: "Meaningful social connection", fit: 76,
    circleColor: "#F43F5E", gradient: "linear-gradient(135deg, #E11D48, #BE123C)",
    study: "A Harvard study spanning 75 years found that close relationships, more than money or fame, are what keep people happy and healthy throughout their lives.",
    boosts: [
      { stat: "Social", pct: 25, color: "#F43F5E" },
      { stat: "Mood", pct: 20, color: "#FB7185" },
      { stat: "Connection", pct: 15, color: "#FDA4AF" },
    ],
  },
  {
    id: "clean-space", name: "CLEAN SPACE", description: "Tidy environment daily", fit: 74,
    circleColor: "#78716C", gradient: "linear-gradient(135deg, #57534E, #44403C)",
    study: "A Princeton Neuroscience study found that physical clutter competes for attention, reducing performance and increasing stress cortisol levels.",
    boosts: [
      { stat: "Discipline", pct: 15, color: "#78716C" },
      { stat: "Clarity", pct: 15, color: "#A8A29E" },
      { stat: "Calm", pct: 10, color: "#D6D3D1" },
    ],
  },
  {
    id: "pushups", name: "PUSH-UPS DAILY", description: "Daily bodyweight training", fit: 80,
    circleColor: "#EF4444", gradient: "linear-gradient(135deg, #DC2626, #991B1B)",
    study: "A Harvard study found that men who could do 40+ push-ups had a 96% reduced risk of cardiovascular disease compared to those who could do fewer than 10.",
    boosts: [
      { stat: "Strength", pct: 25, color: "#EF4444" },
      { stat: "Discipline", pct: 20, color: "#F87171" },
      { stat: "Energy", pct: 10, color: "#FCA5A5" },
    ],
  },
  {
    id: "breathing", name: "PRACTICE BREATHING", description: "Breathwork exercises", fit: 84,
    circleColor: "#14B8A6", gradient: "linear-gradient(135deg, #0D9488, #115E59)",
    study: "Stanford research found that cyclic sighing (a specific breathing pattern) for 5 minutes daily was more effective at reducing stress than mindfulness meditation.",
    boosts: [
      { stat: "Calm", pct: 25, color: "#14B8A6" },
      { stat: "Focus", pct: 20, color: "#2DD4BF" },
      { stat: "Recovery", pct: 10, color: "#5EEAD4" },
    ],
  },
  {
    id: "limit-screen", name: "LIMIT SCREEN TIME", description: "Reduce daily screen hours", fit: 77,
    circleColor: "#6B7280", gradient: "linear-gradient(135deg, #4B5563, #374151)",
    study: "Research in BMC Public Health found that reducing screen time by 1 hour per day was associated with improved sleep quality and reduced eye strain symptoms.",
    boosts: [
      { stat: "Focus", pct: 20, color: "#6B7280" },
      { stat: "Sleep", pct: 20, color: "#9CA3AF" },
      { stat: "Eyes", pct: 15, color: "#D1D5DB" },
    ],
  },
  {
    id: "save-money", name: "SAVE MONEY DAILY", description: "Daily micro-saving habit", fit: 75,
    circleColor: "#10B981", gradient: "linear-gradient(135deg, #059669, #065F46)",
    study: "Behavioral economists have found that automating even small daily savings creates a wealth-building feedback loop, with compound interest amplifying the effect over time.",
    boosts: [
      { stat: "Discipline", pct: 20, color: "#10B981" },
      { stat: "Security", pct: 20, color: "#34D399" },
      { stat: "Planning", pct: 10, color: "#6EE7B7" },
    ],
  },
  {
    id: "write-500", name: "WRITE 500 WORDS", description: "Daily writing practice", fit: 86,
    circleColor: "#F59E0B", gradient: "linear-gradient(135deg, #D97706, #92400E)",
    study: "A study in the Journal of Experimental Psychology found that writing by hand engages the brain more actively than typing, improving learning and idea generation.",
    boosts: [
      { stat: "Clarity", pct: 25, color: "#F59E0B" },
      { stat: "Creativity", pct: 20, color: "#FBBF24" },
      { stat: "Processing", pct: 10, color: "#FCD34D" },
    ],
  },
  {
    id: "yoga-20", name: "YOGA 20 MIN", description: "Daily yoga session", fit: 82,
    circleColor: "#8B5CF6", gradient: "linear-gradient(135deg, #7C3AED, #581C87)",
    study: "A systematic review in the British Journal of Sports Medicine found that yoga significantly improved flexibility, balance, and muscular strength in healthy participants.",
    boosts: [
      { stat: "Flexibility", pct: 20, color: "#8B5CF6" },
      { stat: "Calm", pct: 20, color: "#A78BFA" },
      { stat: "Strength", pct: 10, color: "#C4B5FD" },
    ],
  },
  {
    id: "eat-vegs", name: "EAT VEGETABLES", description: "5+ servings of vegetables", fit: 88,
    circleColor: "#22C55E", gradient: "linear-gradient(135deg, #16A34A, #14532D)",
    study: "A meta-analysis in the International Journal of Epidemiology found that consuming 800g of fruits and vegetables daily was associated with a 31% reduction in premature death.",
    boosts: [
      { stat: "Health", pct: 25, color: "#22C55E" },
      { stat: "Energy", pct: 15, color: "#4ADE80" },
      { stat: "Gut", pct: 15, color: "#86EFAC" },
    ],
  },
  {
    id: "plan-tomorrow", name: "PLAN TOMORROW", description: "Nightly planning ritual", fit: 92,
    circleColor: "#3B82F6", gradient: "linear-gradient(135deg, #2563EB, #1E3A8A)",
    study: "Research published in the Journal of Experimental Psychology found that writing a to-do list before bed helped participants fall asleep 9 minutes faster than journaling about completed tasks.",
    boosts: [
      { stat: "Productivity", pct: 25, color: "#3B82F6" },
      { stat: "Clarity", pct: 20, color: "#60A5FA" },
      { stat: "Control", pct: 10, color: "#93C5FD" },
    ],
  },
]

const INITIAL_SHOW_COUNT = 5

// Animated XP bar with glow
function XPBar({ progress }: { progress: number }) {
  const barRef = useRef<HTMLDivElement>(null)
  const [animatedWidth, setAnimatedWidth] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedWidth(progress), 300)
    return () => clearTimeout(timer)
  }, [progress])

  return (
    <div className="relative w-full h-3 rounded-full bg-secondary overflow-hidden" ref={barRef}>
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{
          background: "linear-gradient(90deg, #16A34A, #22C55E, #4ADE80)",
          boxShadow: "0 0 12px rgba(34, 197, 94, 0.5)",
        }}
        initial={{ width: "0%" }}
        animate={{ width: `${animatedWidth}%` }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
      />
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-y-0 w-8 rounded-full"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
        }}
        initial={{ left: "-10%" }}
        animate={{ left: "110%" }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
      />
    </div>
  )
}

export function MonkScorePage() {
  const navigate = useNavigate()
  const [score, setScore] = useState<MonkScore | null>(null)
  const [loading, setLoading] = useState(true)
  const [trackers, setTrackers] = useState<Tracker[]>([])
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([])
  const [expandedHabit, setExpandedHabit] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  // Habit-to-dimension mapping
  const DIMENSION_MAP: Record<string, string> = {
    "\u{1F4D6}": "wisdom", "\u{1F9E0}": "wisdom",
    "\u{1F4AA}": "strength", "\u{1F3CB}\uFE0F": "strength", "\u{1F3C3}": "strength",
    "\u{1F3AF}": "focus", "\u2696\uFE0F": "focus",
    "\u{1F4A7}": "discipline", "\u{1FAA5}": "discipline", "\u{1F319}": "discipline", "\u{1F305}": "discipline",
    "\u2764\uFE0F": "confidence", "\u{1F493}": "confidence",
  }

  useEffect(() => {
    fetchTrackers().then(setTrackers).catch(() => {})
  }, [])

  useEffect(() => {
    const fallback: MonkScore = {
      level: 1, xp_total: 0, xp_to_next: 125, overall: 0,
      wisdom: 0, strength: 0, focus: 0, discipline: 0, confidence: 0,
    }
    api.get<MonkScore>("/gamification/score", { timeout: 5000 })
      .then((res) => setScore(res.data))
      .catch(() => setScore(fallback))
      .finally(() => setLoading(false))
    const timer = setTimeout(() => {
      setLoading(false)
      setScore(prev => prev || fallback)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = (id: string) => {
    setDismissedSuggestions(prev => [...prev, id])
    setExpandedHabit(null)
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-7 w-7 animate-spin text-[#22C55E]" /></div>
  if (!score) return <div className="text-center py-20 text-muted-foreground">Could not load your rating</div>

  const xpForLevel = (score.level + 1) ** 2 * 100
  const xpIntoLevel = score.xp_total - (score.level ** 2 * 100)
  const xpNeededForLevel = xpForLevel - (score.level ** 2 * 100)
  const xpProgress = xpNeededForLevel > 0 ? Math.min(Math.round((xpIntoLevel / xpNeededForLevel) * 100), 100) : 100

  const visibleSuggestions = SUGGESTED_HABITS.filter(h => !dismissedSuggestions.includes(h.id))
  const displayedSuggestions = showAll ? visibleSuggestions : visibleSuggestions.slice(0, INITIAL_SHOW_COUNT)
  const hasMore = visibleSuggestions.length > INITIAL_SHOW_COUNT

  return (
    <div className="px-5 pt-6 pb-6 relative">
      {/* Decorative side art — gradient silhouette on right */}
      <div className="absolute top-0 right-0 w-1/3 h-full pointer-events-none z-0 overflow-hidden opacity-20 dark:opacity-15">
        <div className="absolute inset-0" style={{
          background: "linear-gradient(180deg, rgba(34,197,94,0.3) 0%, rgba(139,92,246,0.2) 50%, rgba(236,72,153,0.15) 100%)",
          maskImage: "linear-gradient(to left, black 0%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to left, black 0%, transparent 100%)",
        }} />
      </div>

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <NavLink to="/"><PulseLogo size={28} /></NavLink>
            <p className="text-[11px] font-extrabold uppercase tracking-[3px] text-[#22C55E]">Monk Score</p>
          </div>
          <h1 className="text-[32px] font-black tracking-tight text-foreground leading-tight">
            Your Current Rating
          </h1>
        </motion.div>

        {/* Level Card — prominent */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-border bg-card p-6 relative overflow-hidden"
        >
          {/* Subtle glow behind level badge */}
          <div
            className="absolute -left-4 -top-4 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)" }}
          />

          <div className="flex items-center gap-5 relative">
            {/* Level badge — big and bold */}
            <div className="flex flex-col items-center gap-2">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="flex h-24 w-24 items-center justify-center rounded-2xl relative"
                style={{
                  background: "linear-gradient(135deg, #16A34A, #22C55E)",
                  boxShadow: "0 0 30px rgba(34, 197, 94, 0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
                }}
              >
                <span className="text-[44px] font-black text-black leading-none drop-shadow-sm">
                  {score.level}
                </span>
              </motion.div>
              <span className="text-[10px] font-extrabold uppercase tracking-[2px] text-[#22C55E]">
                Level
              </span>
            </div>

            {/* XP info */}
            <div className="flex-1 min-w-0">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-[38px] font-black text-foreground leading-none tabular-nums"
              >
                {score.xp_total.toLocaleString()}
              </motion.p>
              <p className="text-[13px] font-semibold text-muted-foreground mt-1">XP earned</p>

              <div className="mt-4">
                <XPBar progress={xpProgress} />
              </div>
              <p className="text-[11px] font-bold text-muted-foreground/70 mt-2">
                {score.xp_to_next.toLocaleString()} XP to Lvl {score.level + 1}
              </p>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground/70 italic mt-4 text-center tracking-wide">No level cap. Keep rising.</p>
        </motion.div>

        {/* Stats — clean rows like wisdom screenshot */}
        <div className="space-y-0 mt-2">
          {STATS.map((stat, i) => {
            const val = Math.round(score[stat.key as keyof MonkScore] as number)
            const contributing = trackers.filter(t =>
              ((t as Tracker & { dimension?: string }).dimension === stat.key) || DIMENSION_MAP[t.icon || ""] === stat.key
            )
            return (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className={`flex items-center py-5 ${
                  i < STATS.length - 1 ? "border-b border-border" : ""
                }`}
              >
                {/* Icon */}
                <div className="flex h-10 w-10 items-center justify-center rounded-full shrink-0"
                  style={{ backgroundColor: stat.bgColor }}>
                  <span className="text-[20px]">{stat.emoji}</span>
                </div>

                {/* Name + contributing */}
                <div className="ml-3 flex-1 min-w-0">
                  <span className="text-[16px] font-bold text-foreground">{stat.label}</span>
                  {contributing.length > 0 && (
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                      {contributing.map(t => `${t.icon} ${t.name}`).join(" · ")}
                    </p>
                  )}
                </div>

                {/* BIG number */}
                <motion.span
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.08, type: "spring" }}
                  className="text-[64px] font-black leading-none tabular-nums"
                  style={{ color: stat.color }}
                >
                  {val}
                </motion.span>
              </motion.div>
            )
          })}
        </div>

        {/* Achievements Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex gap-3"
        >
          <button
            onClick={() => navigate("/achievements")}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#22C55E] py-4 text-[15px] font-extrabold text-black shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:shadow-[0_0_40px_rgba(34,197,94,0.45)] transition-shadow"
          >
            <Trophy className="h-5 w-5" />
            Achievements
          </button>
        </motion.div>

        {/* Suggested Habits Section — Row List */}
        {visibleSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-[#22C55E]" />
              <h2 className="text-[11px] font-extrabold uppercase tracking-[2px] text-muted-foreground">
                Suggested Habits
              </h2>
              <span className="text-[10px] font-bold text-muted-foreground/70 ml-auto">
                {visibleSuggestions.length} suggestions
              </span>
            </div>

            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <AnimatePresence mode="popLayout">
                {displayedSuggestions.map((habit, i) => {
                  const isExpanded = expandedHabit === habit.id
                  return (
                    <motion.div
                      key={habit.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ delay: i < INITIAL_SHOW_COUNT ? 0.65 + i * 0.04 : 0 }}
                      className={i < displayedSuggestions.length - 1 ? "border-b border-border" : ""}
                    >
                      {/* Row — clickable */}
                      <button
                        onClick={() => setExpandedHabit(isExpanded ? null : habit.id)}
                        className="flex items-center w-full px-4 py-3.5 text-left hover:bg-secondary transition-colors"
                      >
                        {/* Colored circle with first letter */}
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-full shrink-0 text-[15px] font-black text-white"
                          style={{ background: habit.circleColor }}
                        >
                          {habit.name.charAt(0)}
                        </div>

                        {/* Name + description + fit badge */}
                        <div className="ml-3 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[14px] font-bold text-foreground truncate">
                              {habit.name}
                            </span>
                            <span
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                              style={{
                                backgroundColor: `${habit.circleColor}20`,
                                color: habit.circleColor,
                              }}
                            >
                              {habit.fit}% fit
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                            {habit.description}
                          </p>
                        </div>

                        {/* Chevron */}
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground/70 shrink-0 ml-2" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground/70 shrink-0 ml-2" />
                        )}
                      </button>

                      {/* Expanded detail view */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            {/* Gradient header */}
                            <div
                              className="mx-3 rounded-xl p-4 mb-3"
                              style={{ background: habit.gradient }}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <h3 className="text-[20px] font-black text-white tracking-wide leading-tight">
                                  {habit.name}
                                </h3>
                                <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm rounded-full px-2.5 py-1 shrink-0">
                                  <span className="text-[11px] font-bold text-[#22C55E]">{habit.fit}%</span>
                                  <span className="text-[10px] text-white/50">fit</span>
                                </div>
                              </div>

                              {/* Stat boost badges */}
                              <div className="flex flex-wrap gap-2 mb-3">
                                {habit.boosts.map(boost => (
                                  <div
                                    key={boost.stat}
                                    className="flex items-center gap-1.5 bg-black/25 backdrop-blur-sm rounded-lg px-2.5 py-1.5"
                                  >
                                    <ChevronUp className="h-3 w-3" style={{ color: boost.color }} />
                                    <span className="text-[11px] font-bold text-white">
                                      +{boost.pct}%
                                    </span>
                                    <span className="text-[10px] text-white/60">{boost.stat}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Scientific study */}
                              <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 mb-3">
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">
                                  Scientific Study
                                </p>
                                <p className="text-[11px] text-white/70 leading-relaxed">
                                  {habit.study}
                                </p>
                              </div>

                              {/* Action buttons */}
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDismiss(habit.id) }}
                                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-black/30 backdrop-blur-sm py-2.5 text-[13px] font-bold text-white/70 hover:bg-black/40 transition-colors"
                                >
                                  <X className="h-4 w-4" />
                                  Decline
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); navigate("/trackers/new") }}
                                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#22C55E] py-2.5 text-[13px] font-bold text-black hover:bg-[#22C55E]/90 transition-colors shadow-[0_0_16px_rgba(34,197,94,0.3)]"
                                >
                                  <Check className="h-4 w-4" />
                                  Add to my program
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            {/* Show more / Show less button */}
            {hasMore && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                onClick={() => setShowAll(prev => !prev)}
                className="w-full mt-3 flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-[13px] font-bold text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Show {visibleSuggestions.length - INITIAL_SHOW_COUNT} more suggestions
                  </>
                )}
              </motion.button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
