import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ArrowRight, Check, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PulseLogo } from "@/components/common/PulseLogo"
import { createFromTemplate, fetchTemplates, type TrackerTemplate } from "@/services/trackers"

const QUESTIONS = [
  {
    id: "life",
    question: "How would you describe your current life?",
    subtitle: "Be honest. This helps us understand where you're starting from.",
    options: [
      "I'm doing great and want to level up",
      "I'm alright but want to self-improve",
      "I'm doing okay, not good or bad",
      "I'm struggling and want to change",
      "I'm at my lowest and ready to reset",
    ],
  },
  {
    id: "motivation",
    question: "What drives you to improve?",
    subtitle: "Understanding your why helps us suggest the right pulses.",
    options: [
      "Achieve my goals and dreams",
      "Be healthier and more energetic",
      "Build discipline and self-control",
      "Be more productive and focused",
      "Feel confident and at peace",
    ],
  },
  {
    id: "relate",
    question: "Do you relate to this statement?",
    subtitle: "",
    quote: "I want to challenge myself and do difficult things. I know that consistency beats intensity, and small daily actions lead to transformation.",
    isYesNo: true,
  },
  {
    id: "areas",
    question: "What areas do you want to improve?",
    subtitle: "Select all that apply. We'll suggest pulses for each.",
    multiSelect: true,
    options: [
      { label: "🏋️ Fitness & Strength", value: "fitness" },
      { label: "🧠 Focus & Productivity", value: "focus" },
      { label: "📖 Learning & Wisdom", value: "learning" },
      { label: "😴 Sleep & Recovery", value: "sleep" },
      { label: "💧 Health & Hydration", value: "health" },
      { label: "🧘 Mindfulness & Calm", value: "mindfulness" },
      { label: "🚫 Break Bad Habits", value: "discipline" },
      { label: "✍️ Journaling & Reflection", value: "journal" },
    ],
  },
  {
    id: "timeline",
    question: "How quickly do you want to see results?",
    subtitle: "Committing to longer streaks gives you a higher chance of success.",
    options: [
      { label: "7-day streak", extra: "14% choose this" },
      { label: "14-day streak", extra: "54% choose this", recommended: true },
      { label: "30-day streak", extra: "23% choose this" },
      { label: "66-day streak", extra: "9% choose this — true monks" },
    ],
  },
  {
    id: "intensity",
    question: "What intensity level works for you?",
    subtitle: "You can always adjust later.",
    options: [
      { label: "🟢 Easy", desc: "Light challenge, sustainable pace" },
      { label: "🟡 Medium", desc: "Balanced growth, steady progress" },
      { label: "🔴 Hard", desc: "Push yourself, faster results" },
    ],
  },
]

export function QuizFlow() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [_answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [selectedMulti, setSelectedMulti] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)
  const [suggestedTemplates, setSuggestedTemplates] = useState<TrackerTemplate[]>([])
  const [creating, setCreating] = useState(false)

  const current = QUESTIONS[step]
  const progress = ((step + 1) / QUESTIONS.length) * 100
  const isLast = step === QUESTIONS.length - 1

  const handleSelect = async (value: string) => {
    setAnswers((prev) => ({ ...prev, [current.id]: value }))
    if (isLast) {
      // Load templates for suggestions
      try {
        const templates = await fetchTemplates()
        setSuggestedTemplates(templates.slice(0, 8))
      } catch {}
      setShowResults(true)
    } else {
      setTimeout(() => setStep((s) => s + 1), 300)
    }
  }

  const handleMultiContinue = () => {
    setAnswers((prev) => ({ ...prev, [current.id]: selectedMulti }))
    if (isLast) {
      setShowResults(true)
    } else {
      setStep((s) => s + 1)
    }
  }

  const handleCreateSelected = async (templateIds: string[]) => {
    setCreating(true)
    try {
      for (const id of templateIds) {
        await createFromTemplate(id)
      }
      navigate("/")
    } catch {}
    setCreating(false)
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center">
          <PulseLogo size={64} className="mx-auto mb-6" />
          <h1 className="text-[28px] font-extrabold text-white mb-2">Your Monk Plan is Ready</h1>
          <p className="text-muted-foreground text-sm mb-8">Based on your answers, here are suggested pulses to begin your journey.</p>

          <div className="space-y-2 mb-8">
            {suggestedTemplates.map((t) => (
              <div key={t.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-left">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg">{t.icon || "📊"}</div>
                <div className="flex-1">
                  <p className="text-[13px] font-bold text-white">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground">{t.category} · {t.unit || t.type}</p>
                </div>
                <Check className="h-4 w-4 text-primary" />
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <Button className="w-full h-12 text-base rounded-xl font-bold" disabled={creating}
              onClick={() => handleCreateSelected(suggestedTemplates.map((t) => t.id))}>
              {creating ? "Creating..." : `Start with ${suggestedTemplates.length} Pulses`}
            </Button>
            <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => navigate("/")}>
              Skip — I'll create my own
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="h-1 w-full bg-border">
        <motion.div className="h-full bg-primary" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <button onClick={() => step > 0 ? setStep(s => s - 1) : navigate(-1)} className="rounded-lg bg-card p-2 text-muted-foreground hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-[12px] text-muted-foreground font-semibold">{step + 1} of {QUESTIONS.length}</span>
        <button onClick={() => navigate("/")} className="text-[12px] text-muted-foreground hover:text-white">Skip</button>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}
            className="w-full">
            <h1 className="text-[24px] font-extrabold text-white leading-tight mb-2">{current.question}</h1>
            {current.subtitle && <p className="text-[13px] text-muted-foreground mb-8">{current.subtitle}</p>}

            {/* Quote style (yes/no) */}
            {"quote" in current && current.quote && (
              <div className="space-y-6">
                <div className="rounded-xl bg-card border border-border p-6">
                  <span className="text-[24px] text-muted-foreground/30 font-serif">"</span>
                  <p className="text-[14px] text-white/80 leading-relaxed mt-1">{current.quote}</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 h-12 rounded-xl text-base" onClick={() => handleSelect("no")}>✗ No</Button>
                  <Button className="flex-1 h-12 rounded-xl text-base" onClick={() => handleSelect("yes")}>✓ Yes</Button>
                </div>
              </div>
            )}

            {/* Multi-select */}
            {"multiSelect" in current && current.multiSelect && Array.isArray(current.options) && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {(current.options as { label: string; value: string }[]).map((opt) => {
                    const selected = selectedMulti.includes(opt.value)
                    return (
                      <button key={opt.value}
                        onClick={() => setSelectedMulti(prev => selected ? prev.filter(v => v !== opt.value) : [...prev, opt.value])}
                        className={`rounded-xl border p-3 text-left text-[13px] font-semibold transition-all ${selected ? "border-primary bg-primary/10 text-white" : "border-border bg-card text-muted-foreground hover:text-white"}`}>
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
                <Button className="w-full h-12 rounded-xl text-base" disabled={selectedMulti.length === 0} onClick={handleMultiContinue}>
                  Continue <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}

            {/* Single select with extra info */}
            {!("quote" in current) && !("multiSelect" in current) && Array.isArray(current.options) && (
              <div className="space-y-2">
                {(current.options as (string | { label: string; extra?: string; recommended?: boolean; desc?: string })[]).map((opt, i) => {
                  const label = typeof opt === "string" ? opt : opt.label
                  const extra = typeof opt === "string" ? null : opt.extra
                  const recommended = typeof opt === "string" ? false : opt.recommended
                  const desc = typeof opt === "string" ? null : opt.desc
                  return (
                    <motion.button key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      onClick={() => handleSelect(label)}
                      className={`w-full rounded-xl border p-4 text-left transition-all hover:border-primary/40 ${recommended ? "border-primary bg-primary/10" : "border-border bg-card"}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[14px] font-bold text-white">{label}</span>
                        {extra && <span className="text-[11px] text-muted-foreground">{extra}</span>}
                        {recommended && <Flame className="h-4 w-4 text-primary" />}
                      </div>
                      {desc && <p className="text-[11px] text-muted-foreground mt-1">{desc}</p>}
                    </motion.button>
                  )
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
