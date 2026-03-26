import { useState, useEffect, useRef } from "react"

interface DurationInputProps {
  value: number | null
  color: string | null
  onChange: (value: number | null) => void
}

export function DurationInput({ value, onChange }: DurationInputProps) {
  // Store as HH:MM string for consistent display with TimeInput
  const toTimeStr = (mins: number | null) => {
    if (mins === null) return ""
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
  }

  const [localValue, setLocalValue] = useState(toTimeStr(value))
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    setLocalValue(toTimeStr(value))
  }, [value])

  const handleChange = (val: string) => {
    setLocalValue(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (!val) { onChange(null); return }
      const [h, m] = val.split(":").map(Number)
      onChange((h || 0) * 60 + (m || 0))
    }, 600)
  }

  return (
    <input
      type="time"
      value={localValue}
      onChange={(e) => handleChange(e.target.value)}
      placeholder="00:00"
      className="h-[34px] w-[90px] rounded-lg border border-border bg-secondary text-center text-[13px] font-bold text-foreground transition-all focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
      style={{ fontFamily: "inherit" }}
    />
  )
}
