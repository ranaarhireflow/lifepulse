import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"

interface DurationInputProps {
  value: number | null // minutes
  color: string | null
  onChange: (value: number | null) => void
}

export function DurationInput({ value, color, onChange }: DurationInputProps) {
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
      if (h === "" && m === "") {
        onChange(null)
      } else {
        onChange(hrs * 60 + mins)
      }
    }, 600)
  }

  return (
    <div className="flex items-center gap-1.5">
      <div className="relative max-w-[60px]">
        <Input
          type="number"
          inputMode="numeric"
          min={0}
          value={localH}
          placeholder="0"
          onChange={(e) => {
            setLocalH(e.target.value)
            handleChange(e.target.value, localM)
          }}
          className="h-9 text-center pr-5"
          style={color ? { borderColor: `${color}40` } : undefined}
        />
        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          h
        </span>
      </div>
      <span className="text-muted-foreground">:</span>
      <div className="relative max-w-[60px]">
        <Input
          type="number"
          inputMode="numeric"
          min={0}
          max={59}
          value={localM}
          placeholder="0"
          onChange={(e) => {
            setLocalM(e.target.value)
            handleChange(localH, e.target.value)
          }}
          className="h-9 text-center pr-6"
          style={color ? { borderColor: `${color}40` } : undefined}
        />
        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          m
        </span>
      </div>
    </div>
  )
}
