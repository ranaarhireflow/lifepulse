import { NumericInput } from "./NumericInput"
import { DualNumericInput } from "./DualNumericInput"
import { BooleanToggle } from "./BooleanToggle"
import { DurationInput } from "./DurationInput"
import { TimeInput } from "./TimeInput"
import { TextEntry } from "./TextEntry"
import type { Entry } from "@/services/trackers"

interface EntryInputProps {
  type: string
  unit: string | null
  unitSecondary: string | null
  entry: Entry | null
  defaultValue: number | null
  color: string | null
  onUpdate: (data: Partial<Entry>) => void
}

export function EntryInput({
  type,
  unit,
  unitSecondary,
  entry,
  defaultValue,
  color,
  onUpdate,
}: EntryInputProps) {
  switch (type) {
    case "NUMERIC":
      return (
        <NumericInput
          value={entry?.value_numeric ?? null}
          defaultValue={defaultValue}
          unit={unit}
          color={color}
          onChange={(v) => onUpdate({ value_numeric: v })}
        />
      )
    case "DUAL_NUMERIC":
      return (
        <DualNumericInput
          value1={entry?.value_numeric ?? null}
          value2={entry?.value_numeric2 ?? null}
          unit1={unit}
          unit2={unitSecondary}
          color={color}
          onChange={(v1, v2) =>
            onUpdate({ value_numeric: v1, value_numeric2: v2 })
          }
        />
      )
    case "BOOLEAN":
      return (
        <BooleanToggle
          value={entry?.value_boolean ?? null}
          color={color}
          onChange={(v) => onUpdate({ value_boolean: v })}
        />
      )
    case "DURATION":
      return (
        <DurationInput
          value={entry?.value_duration ?? null}
          color={color}
          onChange={(v) => onUpdate({ value_duration: v })}
        />
      )
    case "TIME":
      return (
        <TimeInput
          value={entry?.value_time ?? null}
          color={color}
          onChange={(v) => onUpdate({ value_time: v })}
        />
      )
    case "TEXT":
      return (
        <TextEntry
          value={entry?.value_text ?? null}
          color={color}
          onChange={(v) => onUpdate({ value_text: v })}
        />
      )
    default:
      return <span className="text-sm text-muted-foreground">Unknown type</span>
  }
}
