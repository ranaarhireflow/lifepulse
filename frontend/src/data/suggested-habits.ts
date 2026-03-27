export interface SuggestedHabit {
  id: string
  name: string
  description: string
  fit: number
  circleColor: string
  gradient: string
  study: string
  boosts: { stat: string; pct: number; color: string }[]
}

export const SUGGESTED_HABITS: SuggestedHabit[] = [
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
