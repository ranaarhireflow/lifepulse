import { useState, useEffect, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"

interface TextEntryProps {
  value: string | null
  color: string | null
  onChange: (value: string | null) => void
}

export function TextEntry({ value, color, onChange }: TextEntryProps) {
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
    <Textarea
      value={localValue}
      placeholder="Add notes..."
      onChange={(e) => handleChange(e.target.value)}
      className="min-h-[60px] max-h-[120px] resize-none text-sm"
      style={color ? { borderColor: `${color}40` } : undefined}
    />
  )
}
