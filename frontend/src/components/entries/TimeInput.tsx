interface TimeInputProps {
  value: string | null
  color: string | null
  onChange: (value: string | null) => void
}

export function TimeInput({ value, onChange }: TimeInputProps) {
  return (
    <input
      type="time"
      value={value || ""}
      onChange={(e) => onChange(e.target.value || null)}
      className="h-[34px] w-[90px] rounded-lg border border-border bg-secondary text-center text-[13px] font-bold text-foreground transition-all focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
      style={{ fontFamily: "inherit" }}
    />
  )
}
