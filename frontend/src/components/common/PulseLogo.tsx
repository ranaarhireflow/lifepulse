interface PulseLogoProps {
  size?: number
  className?: string
}

export function PulseLogo({ size = 40, className }: PulseLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 42 42"
      fill="none"
      className={className}
    >
      <rect x="1" y="1" width="40" height="40" rx="12" fill="#16A34A" />
      <path
        d="M8 22H14L17 14L21 30L25 18L28 22H34"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
