import { type ReactNode, useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X } from "lucide-react"

interface ConfigDrawerProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
}

export function ConfigDrawer({ open, onClose, title, description, children }: ConfigDrawerProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (open) setMounted(true)
  }, [open])

  const handleAnimComplete = () => {
    if (!open) setMounted(false)
  }

  if (!mounted && !open) return null

  return (
    <AnimatePresence onExitComplete={handleAnimComplete}>
      {open && (
        <>
          {/* Backdrop — scoped to the phone frame via fixed + max-w-md */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50"
            style={{ maxWidth: "28rem", margin: "0 auto" }}
            onClick={onClose}
          />

          {/* Drawer — slides up from bottom, constrained to phone width */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto"
          >
            <div className="bg-background rounded-t-[20px] max-h-[85vh] flex flex-col shadow-2xl border-t border-border">
              {/* Drag handle */}
              <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30 mx-auto mt-3 mb-1 shrink-0" />

              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-2 pb-4 border-b border-border shrink-0">
                <div>
                  <h2 className="text-[16px] font-extrabold text-foreground">{title}</h2>
                  {description && <p className="text-[12px] text-muted-foreground">{description}</p>}
                </div>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent text-muted-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Content */}
              <ScrollArea className="flex-1 overflow-auto">
                <div className="px-5 py-5">
                  {children}
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
