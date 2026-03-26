import { useState, useEffect, useRef } from "react"

interface DualNumericInputProps {
  value1: number | null
  value2: number | null
  unit1: string | null
  unit2: string | null
  color: string | null
  onChange: (v1: number | null, v2: number | null) => void
}

export function DualNumericInput({ value1, value2, onChange }: DualNumericInputProps) {
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
    <div className="flex items-center gap-[3px]">
      <input
        type="number"
        inputMode="decimal"
        value={local1}
        placeholder="—"
        onChange={(e) => { setLocal1(e.target.value); handleChange(e.target.value, local2) }}
        className="h-[34px] w-[48px] rounded-[9px] border-[1.5px] border-border bg-secondary dark:bg-muted text-center text-[13px] font-bold text-foreground transition-all focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10"
        style={{ fontFamily: "inherit" }}
      />
      <span className="text-muted-foreground font-bold text-xs">/</span>
      <input
        type="number"
        inputMode="decimal"
        value={local2}
        placeholder="—"
        onChange={(e) => { setLocal2(e.target.value); handleChange(local1, e.target.value) }}
        className="h-[34px] w-[48px] rounded-[9px] border-[1.5px] border-border bg-secondary dark:bg-muted text-center text-[13px] font-bold text-foreground transition-all focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10"
        style={{ fontFamily: "inherit" }}
      />
    </div>
  )
}
