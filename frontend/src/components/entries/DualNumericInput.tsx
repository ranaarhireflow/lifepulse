import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"

interface DualNumericInputProps {
  value1: number | null
  value2: number | null
  unit1: string | null
  unit2: string | null
  color: string | null
  onChange: (v1: number | null, v2: number | null) => void
}

export function DualNumericInput({
  value1,
  value2,
  unit1,
  unit2,
  color,
  onChange,
}: DualNumericInputProps) {
  const [local1, setLocal1] = useState(value1 !== null ? String(value1) : "")
  const [local2, setLocal2] = useState(value2 !== null ? String(value2) : "")
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    setLocal1(value1 !== null ? String(value1) : "")
    setLocal2(value2 !== null ? String(value2) : "")
  }, [value1, value2])

  const handleChange = (v1: string, v2: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const n1 = parseFloat(v1)
      const n2 = parseFloat(v2)
      onChange(isNaN(n1) ? null : n1, isNaN(n2) ? null : n2)
    }, 600)
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1 max-w-[90px]">
        <Input
          type="number"
          inputMode="decimal"
          value={local1}
          placeholder={unit1 || "—"}
          onChange={(e) => {
            setLocal1(e.target.value)
            handleChange(e.target.value, local2)
          }}
          className="h-9 text-center"
          style={color ? { borderColor: `${color}40` } : undefined}
        />
      </div>
      <span className="text-muted-foreground font-medium">/</span>
      <div className="relative flex-1 max-w-[90px]">
        <Input
          type="number"
          inputMode="decimal"
          value={local2}
          placeholder={unit2 || "—"}
          onChange={(e) => {
            setLocal2(e.target.value)
            handleChange(local1, e.target.value)
          }}
          className="h-9 text-center"
          style={color ? { borderColor: `${color}40` } : undefined}
        />
      </div>
    </div>
  )
}
