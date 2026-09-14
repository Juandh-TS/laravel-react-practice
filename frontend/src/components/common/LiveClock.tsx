import { useEffect, useState } from 'react'

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('es-ES', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

export function LiveClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="live-clock" aria-live="off">
      <span className="live-clock-date">{dateFormatter.format(now)}</span>
      <strong className="live-clock-time">{timeFormatter.format(now)}</strong>
    </div>
  )
}
