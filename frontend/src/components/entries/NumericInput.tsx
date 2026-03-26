import { useState, useEffect, useRef } from "react"

interface NumericInputProps {
  value: number | null
  defaultValue: number | null
  unit: string | null
  color: string | null
  onChange: (value: number | null) => void
}

export function NumericInput({ value, defaultValue, unit, color, onChange }: NumericInputProps) {
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

  const increment = (delta: number) => {
    const current = parseFloat(localValue) || defaultValue || 0
    const newVal = Math.max(0, +(current + delta).toFixed(1))
    setLocalValue(String(newVal))
    onChange(newVal)
  }

  const isDefault = value === null && defaultValue !== null

  return (
    <div className="flex items-center gap-[5px]">
      <button
        onClick={() => increment(-1)}
        className="flex h-[26px] w-[26px] items-center justify-center rounded-[7px] border-[1.5px] border-border bg-card text-[14px] font-bold text-muted-foreground transition-all hover:border-primary hover:text-primary hover:bg-accent"
      >
        −
      </button>
      <input
        type="number"
        inputMode="decimal"
        value={localValue}
        placeholder={isDefault ? String(defaultValue) : "0"}
        onChange={(e) => handleChange(e.target.value)}
        className={`h-[34px] w-[58px] rounded-[9px] border-[1.5px] border-border bg-[#F4F7F4] dark:bg-muted text-center text-[14px] font-bold text-foreground transition-all focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 ${
          isDefault ? "text-muted-foreground italic" : ""
        }`}
        style={{ fontFamily: "inherit" }}
      />
      <button
        onClick={() => increment(1)}
        className="flex h-[26px] w-[26px] items-center justify-center rounded-[7px] border-[1.5px] border-border bg-card text-[14px] font-bold text-muted-foreground transition-all hover:border-primary hover:text-primary hover:bg-accent"
      >
        +
      </button>
      {unit && <span className="text-[10px] text-muted-foreground font-semibold ml-0.5">{unit}</span>}
    </div>
  )
}
