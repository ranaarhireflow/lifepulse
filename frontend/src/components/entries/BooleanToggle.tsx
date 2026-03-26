interface BooleanToggleProps {
  value: boolean | null
  color: string | null
  onChange: (value: boolean) => void
}

export function BooleanToggle({ value, onChange }: BooleanToggleProps) {
  const isChecked = value === true

  return (
    <button
      onClick={() => onChange(!isChecked)}
      className={`relative h-[34px] w-[56px] rounded-full transition-colors duration-200 ${
        isChecked ? "bg-primary" : "bg-border"
      }`}
    >
      <div
        className={`absolute top-[3px] h-[28px] w-[28px] rounded-full bg-white shadow-sm transition-all duration-200 ${
          isChecked ? "left-[25px]" : "left-[3px]"
        }`}
      />
    </button>
  )
}
