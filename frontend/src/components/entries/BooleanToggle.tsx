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
      whileTap={{ scale: 0.9 }}
      onClick={() => onChange(!isChecked)}
      className={`flex h-[34px] w-[64px] items-center justify-center rounded-lg border text-[13px] font-bold transition-all ${
        isChecked
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-secondary text-muted-foreground"
      }`}
    >
      <AnimatePresence mode="wait">
        {isChecked ? (
          <motion.div key="y" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            className="flex items-center gap-1">
            <Check className="h-4 w-4" strokeWidth={3} />
            <span>Yes</span>
          </motion.div>
        ) : (
          <motion.span key="n" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            No
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
