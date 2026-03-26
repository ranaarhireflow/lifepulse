import { Input } from "@/components/ui/input"

interface TimeInputProps {
  value: string | null // "HH:MM"
  color: string | null
  onChange: (value: string | null) => void
}

export function TimeInput({ value, color, onChange }: TimeInputProps) {
  return (
    <Input
      type="time"
      value={value || ""}
      onChange={(e) => onChange(e.target.value || null)}
      className="h-9 w-[130px]"
      style={color ? { borderColor: `${color}40` } : undefined}
    />
  )
}
