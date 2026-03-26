import { useState, useEffect, useRef } from "react"

interface TextEntryProps {
  value: string | null
  color: string | null
  onChange: (value: string | null) => void
}

export function TextEntry({ value, onChange }: TextEntryProps) {
  const [localValue, setLocalValue] = useState(value || "")
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    setLocalValue(value || "")
  }, [value])

  const handleChange = (newVal: string) => {
    setLocalValue(newVal)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onChange(newVal.trim() || null)
    }, 800)
  }

  return (
    <textarea
      value={localValue}
      placeholder="Add notes..."
      onChange={(e) => handleChange(e.target.value)}
      className="min-h-[50px] max-h-[100px] w-[140px] resize-none rounded-[9px] border-[1.5px] border-border bg-[#F4F7F4] dark:bg-muted p-2 text-[12px] font-medium text-foreground transition-all focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10"
      style={{ fontFamily: "inherit" }}
    />
  )
}
