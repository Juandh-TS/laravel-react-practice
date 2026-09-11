interface SpinnerProps {
  message?: string
}

export function Spinner({ message = 'Cargando...' }: SpinnerProps) {
  return <p className="state-message">{message}</p>
}
