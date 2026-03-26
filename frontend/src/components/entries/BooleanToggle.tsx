import { motion } from "framer-motion"
import { Check, X } from "lucide-react"

interface BooleanToggleProps {
  value: boolean | null
  color: string | null
  onChange: (value: boolean) => void
}

export function BooleanToggle({ value, color, onChange }: BooleanToggleProps) {
  const isChecked = value === true
  const accentColor = color || "#22c55e"

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={() => onChange(!isChecked)}
      className="relative flex h-10 w-10 items-center justify-center rounded-xl border-2 transition-colors"
      style={{
        borderColor: isChecked ? accentColor : "var(--border)",
        backgroundColor: isChecked ? `${accentColor}15` : "transparent",
      }}
    >
      {isChecked ? (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
        >
          <Check className="h-5 w-5" style={{ color: accentColor }} />
        </motion.div>
      ) : (
        <X className="h-4 w-4 text-muted-foreground/30" />
      )}
    </motion.button>
  )
}
