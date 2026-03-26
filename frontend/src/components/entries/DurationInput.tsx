import { useState, useEffect, useRef } from "react"

interface DurationInputProps {
  value: number | null
  color: string | null
  onChange: (value: number | null) => void
}

export function DurationInput({ value, onChange }: DurationInputProps) {
  const [localH, setLocalH] = useState(value !== null ? String(Math.floor(value / 60)) : "")
  const [localM, setLocalM] = useState(value !== null ? String(value % 60) : "")
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    if (value !== null) {
      setLocalH(String(Math.floor(value / 60)))
      setLocalM(String(value % 60))
    } else {
      setLocalH("")
      setLocalM("")
    }
  }, [value])

  const handleChange = (h: string, m: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const hrs = parseInt(h) || 0
      const mins = parseInt(m) || 0
      onChange(h === "" && m === "" ? null : hrs * 60 + mins)
    }, 600)
  }

  const inputClass = "h-[34px] w-[36px] rounded-lg border border-border bg-secondary text-center text-[14px] font-bold text-foreground transition-all focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"

  return (
    <div className="flex items-center gap-1">
      <input type="number" inputMode="numeric" min={0} value={localH} placeholder="0"
        onChange={(e) => { setLocalH(e.target.value); handleChange(e.target.value, localM) }}
        className={inputClass} style={{ fontFamily: "inherit" }} />
      <span className="text-muted-foreground font-bold text-xs">:</span>
      <input type="number" inputMode="numeric" min={0} max={59} value={localM} placeholder="00"
        onChange={(e) => { setLocalM(e.target.value); handleChange(localH, e.target.value) }}
        className={inputClass} style={{ fontFamily: "inherit" }} />
    </div>
  )
}
