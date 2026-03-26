import { useState, useEffect, useRef } from "react"

interface DurationInputProps {
  value: number | null
  color: string | null
  onChange: (value: number | null) => void
}

export function DurationInput({ value, onChange }: DurationInputProps) {
  const hours = value !== null ? Math.floor(value / 60) : 0
  const minutes = value !== null ? value % 60 : 0

  const [localH, setLocalH] = useState(value !== null ? String(hours) : "")
  const [localM, setLocalM] = useState(value !== null ? String(minutes) : "")
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

  return (
    <div className="flex items-center gap-1">
      <input
        type="number" inputMode="numeric" min={0}
        value={localH} placeholder="0"
        onChange={(e) => { setLocalH(e.target.value); handleChange(e.target.value, localM) }}
        className="h-[34px] w-[44px] rounded-[9px] border-[1.5px] border-border bg-[#F4F7F4] dark:bg-muted text-center text-[14px] font-bold text-foreground transition-all focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10"
        style={{ fontFamily: "inherit" }}
      />
      <span className="text-muted-foreground font-bold text-xs">:</span>
      <input
        type="number" inputMode="numeric" min={0} max={59}
        value={localM} placeholder="0"
        onChange={(e) => { setLocalM(e.target.value); handleChange(localH, e.target.value) }}
        className="h-[34px] w-[44px] rounded-[9px] border-[1.5px] border-border bg-[#F4F7F4] dark:bg-muted text-center text-[14px] font-bold text-foreground transition-all focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10"
        style={{ fontFamily: "inherit" }}
      />
      <span className="text-[10px] text-muted-foreground font-semibold">hrs</span>
    </div>
  )
}
