import { motion, AnimatePresence } from "framer-motion"
import { Check } from "lucide-react"

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
      whileTap={{ scale: 0.85 }}
      whileHover={{ scale: 1.05 }}
      onClick={() => onChange(!isChecked)}
      className="relative flex h-11 w-11 items-center justify-center rounded-xl border-2 transition-all duration-200"
      style={{
        borderColor: isChecked ? accentColor : "var(--border)",
        backgroundColor: isChecked ? `${accentColor}15` : "transparent",
        boxShadow: isChecked ? `0 0 12px ${accentColor}25` : "none",
      }}
    >
      <AnimatePresence mode="wait">
        {isChecked ? (
          <motion.div
            key="check"
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
          >
            <Check
              className="h-5 w-5"
              style={{ color: accentColor }}
              strokeWidth={3}
            />
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-2 w-2 rounded-full bg-muted-foreground/20"
          />
        )}
      </AnimatePresence>

      {/* Ripple effect on check */}
      <AnimatePresence>
        {isChecked && (
          <motion.div
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 2.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 rounded-xl"
            style={{ backgroundColor: accentColor }}
          />
        )}
      </AnimatePresence>
    </motion.button>
  )
}
