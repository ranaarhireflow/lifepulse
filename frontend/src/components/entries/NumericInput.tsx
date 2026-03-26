import { useState, useEffect, useRef } from "react"

interface NumericInputProps {
  value: number | null
  defaultValue: number | null
  unit: string | null
  color: string | null
  onChange: (value: number | null) => void
}

export function NumericInput({ value, defaultValue, unit, onChange }: NumericInputProps) {
  const [localValue, setLocalValue] = useState(value !== null ? String(value) : "")
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    setLocalValue(value !== null ? String(value) : "")
  }, [value])

  const handleChange = (newVal: string) => {
    setLocalValue(newVal)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const num = parseFloat(newVal)
      onChange(isNaN(num) ? null : num)
    }, 600)
  }

  const isDefault = value === null && defaultValue !== null

  return (
    <input
      type="number"
      inputMode="decimal"
      value={localValue}
      placeholder={isDefault ? String(defaultValue) : "—"}
      onChange={(e) => handleChange(e.target.value)}
      className={`h-[34px] w-[64px] rounded-lg border border-border bg-secondary text-center text-[14px] font-bold transition-all focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 ${
        isDefault ? "text-muted-foreground italic" : "text-foreground"
      }`}
      style={{ fontFamily: "inherit" }}
    />
  )
}
