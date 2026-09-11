interface ErrorAlertProps {
  message: string | null
  className?: string
}

export function ErrorAlert({ message, className = '' }: ErrorAlertProps) {
  if (!message) return null
  return (
    <div className={`error ${className}`} role="alert">
      <span>⚠️</span>
      <span>{message}</span>
    </div>
  )
}
