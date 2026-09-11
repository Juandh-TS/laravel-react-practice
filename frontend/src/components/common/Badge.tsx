interface BadgeProps {
  count?: number | string
  className?: string
}

export function Badge({ count, className = '' }: BadgeProps) {
  if (count === undefined || count === null) return null
  return <span className={`count-badge ${className}`}>{count}</span>
}
