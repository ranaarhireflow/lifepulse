import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Minus, Plus } from "lucide-react"

interface NumericInputProps {
  value: number | null
  defaultValue: number | null
  unit: string | null
  color: string | null
  onChange: (value: number | null) => void
}

export function NumericInput({
  value,
  defaultValue,
  unit,
  color,
  onChange,
}: NumericInputProps) {
  const [localValue, setLocalValue] = useState(
    value !== null ? String(value) : ""
  )
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
    const newVal = Math.max(0, current + delta)
    setLocalValue(String(newVal))
    onChange(newVal)
  }

  const isDefault = value === null && defaultValue !== null

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => increment(-1)}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-accent transition-colors shrink-0"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <div className="relative flex-1 max-w-[120px]">
        <Input
          type="number"
          inputMode="decimal"
          value={localValue}
          placeholder={isDefault ? String(defaultValue) : "—"}
          onChange={(e) => handleChange(e.target.value)}
          className={`h-9 text-center pr-8 ${
            isDefault ? "text-muted-foreground italic" : ""
          }`}
          style={
            value !== null && color
              ? { borderColor: `${color}40` }
              : undefined
          }
        />
        {unit && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
      <button
        onClick={() => increment(1)}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-accent transition-colors shrink-0"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
