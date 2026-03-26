import type { ReactNode } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ConfigDrawerProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
}

export function ConfigDrawer({ open, onClose, title, description, children }: ConfigDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-[400px] sm:w-[440px] p-0 flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-border shrink-0">
          <SheetTitle className="text-[16px] font-extrabold">{title}</SheetTitle>
          {description && <SheetDescription className="text-[12px]">{description}</SheetDescription>}
        </SheetHeader>
        <ScrollArea className="flex-1">
          <div className="px-5 py-5">
            {children}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
