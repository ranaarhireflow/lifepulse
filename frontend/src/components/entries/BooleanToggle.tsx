import { motion, AnimatePresence } from "framer-motion"
import { Check } from "lucide-react"

interface BooleanToggleProps {
  value: boolean | null
  color: string | null
  onChange: (value: boolean) => void
}

export function BooleanToggle({ value, onChange }: BooleanToggleProps) {
  const isChecked = value === true

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={() => onChange(!isChecked)}
      className={`relative flex h-[42px] w-[42px] items-center justify-center rounded-[12px] border-2 transition-all duration-200 ${
        isChecked
          ? "border-primary bg-accent text-primary"
          : "border-border bg-card text-muted-foreground/30"
      }`}
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
            <Check className="h-5 w-5" strokeWidth={3} />
          </motion.div>
        ) : (
          <motion.span
            key="x"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-[14px]"
          >
            ✗
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
