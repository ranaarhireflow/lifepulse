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
      className="h-[34px] w-[68px] rounded-[9px] border-[1.5px] border-border bg-secondary dark:bg-muted text-center text-[13px] font-bold text-foreground transition-all focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10"
      style={{ fontFamily: "inherit" }}
    />
  )
}
