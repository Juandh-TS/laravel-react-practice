import './Spinner.css'

interface SpinnerProps {
  message?: string
  subtitle?: string
}

export function Spinner({ message = 'Cargando...', subtitle = 'Sincronizando datos' }: SpinnerProps) {
  return (
    <div className="futuristic-spinner-container" role="status" aria-live="polite">
      {/* Ambient background glow */}
      <div className="futuristic-spinner-glow" />

      {/* 3D Gyroscopic Quantum Reactor */}
      <div className="futuristic-gyro-stage">
        <div className="gyro-ring gyro-ring-1" />
        <div className="gyro-ring gyro-ring-2" />
        <div className="gyro-ring gyro-ring-3" />
        <div className="gyro-particle gyro-particle-1" />
        <div className="gyro-particle gyro-particle-2" />
        <div className="gyro-core" />
      </div>

      {/* Futuristic Telemetry HUD */}
      <div className="futuristic-spinner-text-wrap">
        <span className="futuristic-spinner-title">{message}</span>
        {subtitle && (
          <span className="futuristic-spinner-sub">
            <span>{subtitle}</span>
            <span className="cyber-dots">
              <span className="cyber-dot" />
              <span className="cyber-dot" />
              <span className="cyber-dot" />
            </span>
          </span>
        )}
      </div>
    </div>
  )
}
