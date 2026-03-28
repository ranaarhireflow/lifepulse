import { useRef, useEffect, useCallback } from "react"

interface RulerInputProps {
  value: number
  min: number
  max: number
  step: number
  unit?: string
  onChange: (value: number) => void
}

/**
 * Horizontal scroll ruler — drag left/right to set value.
 * Like the Life Reset app's tactile ruler input.
 */
export function RulerInput({ value, min, max, step, unit, onChange }: RulerInputProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const startValue = useRef(0)

  // Pixels per step unit
  const pxPerStep = step < 1 ? 30 : step >= 10 ? 8 : 15

  // Snap value to step
  const snap = useCallback((v: number) => {
    const snapped = Math.round(v / step) * step
    return Math.max(min, Math.min(max, Number(snapped.toFixed(2))))
  }, [min, max, step])

  const handleStart = (clientX: number) => {
    isDragging.current = true
    startX.current = clientX
    startValue.current = value
  }

  const handleMove = (clientX: number) => {
    if (!isDragging.current) return
    const dx = startX.current - clientX // inverted: drag left = increase
    const dv = (dx / pxPerStep) * step
    onChange(snap(startValue.current + dv))
  }

  const handleEnd = () => { isDragging.current = false }

  // Touch events — stopPropagation prevents card swipe from firing
  const onTouchStart = (e: React.TouchEvent) => { e.stopPropagation(); handleStart(e.touches[0].clientX) }
  const onTouchMove = (e: React.TouchEvent) => { e.stopPropagation(); e.preventDefault(); handleMove(e.touches[0].clientX) }
  const onTouchEnd = (e: React.TouchEvent) => { e.stopPropagation(); handleEnd() }

  // Mouse events (for desktop)
  const onMouseDown = (e: React.MouseEvent) => handleStart(e.clientX)

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX)
    const onMouseUp = () => handleEnd()
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }
  }, [value]) // eslint-disable-line

  // Generate tick marks centered around current value
  const totalTicks = 21 // odd number for center symmetry
  const centerTick = Math.floor(totalTicks / 2)

  return (
    <div className="w-full select-none">
      {/* Value display */}
      <div className="text-center mb-3">
        <span className="text-[36px] font-black text-white tabular-nums" style={{ textShadow: "0 0 20px rgba(255,255,255,0.15)" }}>
          {step < 1 ? value.toFixed(1) : value}
        </span>
        {unit && <span className="text-[16px] text-white/40 ml-2">{unit}</span>}
      </div>

      {/* Ruler */}
      <div
        ref={containerRef}
        className="relative h-16 cursor-grab active:cursor-grabbing overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        style={{ touchAction: "none" }}
      >
        {/* Center indicator line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[3px] -ml-[1.5px] bg-white rounded-full z-10 shadow-[0_0_8px_rgba(255,255,255,0.4)]" />

        {/* Tick marks */}
        <div className="absolute inset-0 flex items-end justify-center gap-0">
          {Array.from({ length: totalTicks }, (_, i) => {
            const tickValue = snap(value + (i - centerTick) * step)
            const distFromCenter = Math.abs(i - centerTick)
            const isMajor = step < 1
              ? Math.round(tickValue * 10) % 5 === 0
              : tickValue % (step * 5) === 0 || tickValue % 5 === 0
            const isCenter = i === centerTick

            return (
              <div
                key={i}
                className="flex flex-col items-center"
                style={{
                  width: `${pxPerStep}px`,
                  opacity: Math.max(0.15, 1 - distFromCenter * 0.08),
                }}
              >
                <div
                  className={`rounded-full transition-all ${
                    isCenter ? "bg-white w-[3px]" : isMajor ? "bg-white/50 w-[2px]" : "bg-white/20 w-[1.5px]"
                  }`}
                  style={{ height: isCenter ? "48px" : isMajor ? "32px" : "20px" }}
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
