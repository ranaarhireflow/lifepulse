import { Card, CardContent } from "@/components/ui/card"

const TEMPLATE_CATEGORIES = [
  {
    name: "Health",
    templates: [
      { icon: "⚖️", name: "Weight", color: "#6366f1" },
      { icon: "❤️", name: "Blood Pressure", color: "#ef4444" },
      { icon: "💧", name: "Water Intake", color: "#3b82f6" },
      { icon: "😴", name: "Sleep Time", color: "#8b5cf6" },
      { icon: "🌅", name: "Wake Up Time", color: "#f59e0b" },
      { icon: "👣", name: "Steps", color: "#10b981" },
      { icon: "🔥", name: "Calories", color: "#f97316" },
      { icon: "💓", name: "Heart Rate", color: "#ec4899" },
    ],
  },
  {
    name: "Fitness",
    templates: [
      { icon: "🏋️", name: "Gym", color: "#22c55e" },
      { icon: "🏃", name: "Running", color: "#14b8a6" },
      { icon: "⏱️", name: "Workout Duration", color: "#06b6d4" },
      { icon: "📝", name: "Workout Notes", color: "#64748b" },
      { icon: "🧘", name: "Yoga", color: "#a855f7" },
    ],
  },
  {
    name: "Productivity",
    templates: [
      { icon: "🧠", name: "Deep Work", color: "#6366f1" },
      { icon: "📖", name: "Books Pages Read", color: "#84cc16" },
      { icon: "🧘‍♂️", name: "Meditation", color: "#d946ef" },
      { icon: "✍️", name: "Journaling", color: "#78716c" },
      { icon: "📱", name: "Screen Time", color: "#f43f5e" },
    ],
  },
  {
    name: "Lifestyle",
    templates: [
      { icon: "🥗", name: "No Junk Food", color: "#22c55e" },
      { icon: "🚫", name: "No Alcohol", color: "#ef4444" },
      { icon: "🙏", name: "Gratitude", color: "#eab308" },
      { icon: "😊", name: "Mood", color: "#f59e0b" },
      { icon: "💰", name: "Money Spent", color: "#16a34a" },
      { icon: "🪥", name: "Brush & Bathe", color: "#38bdf8" },
      { icon: "🌙", name: "Sleep by 11pm", color: "#c084fc" },
      { icon: "☕", name: "Coffee Cups", color: "#92400e" },
    ],
  },
]

export function TrackerCreatePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Create Tracker</h1>
        <p className="text-sm text-muted-foreground">
          Pick a template or create a custom tracker
        </p>
      </div>

      {/* Custom tracker button */}
      <Card className="cursor-pointer border-dashed transition-shadow hover:shadow-md">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl">
            ✨
          </div>
          <div>
            <p className="font-semibold">Custom Tracker</p>
            <p className="text-sm text-muted-foreground">
              Create your own with a custom name, type, and configuration
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Templates by category */}
      {TEMPLATE_CATEGORIES.map((category) => (
        <div key={category.name}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {category.name}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {category.templates.map((t) => (
              <Card
                key={t.name}
                className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]"
              >
                <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                    style={{ backgroundColor: `${t.color}15` }}
                  >
                    {t.icon}
                  </div>
                  <p className="text-sm font-medium leading-tight">{t.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
