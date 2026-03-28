export const NOTIFICATION_MESSAGES: Record<string, string[]> = {
  // By habit icon
  "💧": [
    "Your cells are throwing a dry party 💧 Hydrate them!",
    "Water you waiting for? Time to drink up! 💧",
    "Even cacti need water sometimes 🌵💧",
    "Your body is 60% water. Let's not drop that number 💧",
  ],
  "🏋️": [
    "Those gains won't make themselves 💪",
    "Your muscles are writing a complaint letter 📝💪",
    "Iron therapy session incoming 🏋️",
    "Skip today, regret tomorrow. Your call 💪",
  ],
  "📖": [
    "A page a day keeps ignorance away 📖",
    "Your brain ordered more knowledge 🧠📖",
    "Plot twist: you actually enjoy reading 📖",
    "Feed your mind. It's hungry 📖",
  ],
  "🧠": [
    "Deep work mode: activate 🧠",
    "Your focus muscle needs exercise 🧠",
    "The world can wait. Your brain can't 🧠",
    "Monk mode loading... 🧘",
  ],
  "🌙": [
    "Your brain needs rest to level up 🌙",
    "Tomorrow's you will thank tonight's you 🌙",
    "Sleep is the ultimate cheat code 🌙💤",
    "Pillow is calling. Don't ghost it 🌙",
  ],
  "🌅": [
    "Rise before the world does 🌅",
    "Early bird gets the XP points 🌅⚡",
    "Your future self just set an alarm 🌅",
  ],
  "🪥": [
    "Fresh start, fresh mouth 🪥✨",
    "Your teeth filed a hygiene request 🪥",
    "Brush now, smile later 😁",
  ],
  "❤️": [
    "Know your numbers, own your health ❤️",
    "Quick BP check — your heart will thank you ❤️",
  ],
  "⚖️": [
    "Step on the scale of truth ⚖️",
    "Track the journey, not just the destination ⚖️",
  ],
  "🧘": [
    "Your mind deserves 15 minutes of peace 🧘",
    "Breathe in clarity, breathe out chaos 🧘",
    "Still mind, strong mind 🧘",
  ],
  // Generic fallbacks
  "_default": [
    "Time to log your pulse! 📊",
    "Don't break the streak 🔥",
    "Your future self will thank you ✨",
    "Consistency is the real superpower 💪",
    "One log closer to leveling up ⚡",
    "The monk never skips a day 🧘",
  ],
}

/** Get a random notification message for a habit */
export function getNotificationMessage(icon: string | null): string {
  const messages = NOTIFICATION_MESSAGES[icon || ""] || NOTIFICATION_MESSAGES["_default"]
  return messages[Math.floor(Math.random() * messages.length)]
}
