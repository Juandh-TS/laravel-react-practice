import { useEffect, useRef, useState } from 'react'

const TRAIL_INTERVAL_MS = 40
const TRAIL_LIFETIME_MS = 500
const MAX_TRAIL_DOTS = 14
const EASING = 0.2
const LASER_POINT_LIFETIME_MS = 400
const STREAK_RESET_MS = 600
const STREAK_BADGE_LIFETIME_MS = 700
const STREAK_HOT_THRESHOLD = 5

interface LaserPoint {
  x: number
  y: number
  t: number
}

export function CursorEffect() {
  const layerRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [drawMode, setDrawMode] = useState(false)
  const drawModeRef = useRef(drawMode)
  const [streakCount, setStreakCount] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)

  useEffect(() => {
    drawModeRef.current = drawMode
    dotRef.current?.classList.toggle('cursor-dot--draw', drawMode)
  }, [drawMode])

  useEffect(() => {
    const isFinePointer = window.matchMedia('(any-hover: hover) and (any-pointer: fine)').matches
    const layer = layerRef.current
    const dot = dotRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')

    if (!isFinePointer || !layer || !dot || !canvas || !ctx) return

    const laserColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-success')
      .trim()

    let targetX = window.innerWidth / 2
    let targetY = window.innerHeight / 2
    let currentX = targetX
    let currentY = targetY
    let lastTrailTime = 0
    let rafId = 0
    let laserPoints: LaserPoint[] = []
    let clickStreak = 0
    let lastClickTime = 0
    let bestClickStreak = 0

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resizeCanvas()

    const spawnTrailDot = (x: number, y: number) => {
      const trailDot = document.createElement('span')
      trailDot.className = 'cursor-trail-dot'
      trailDot.style.left = `${x}px`
      trailDot.style.top = `${y}px`
      layer.appendChild(trailDot)

      while (layer.childElementCount > MAX_TRAIL_DOTS) {
        layer.firstElementChild?.remove()
      }

      requestAnimationFrame(() => trailDot.classList.add('cursor-trail-dot--fade'))
      window.setTimeout(() => trailDot.remove(), TRAIL_LIFETIME_MS)
    }

    const spawnRipple = (x: number, y: number) => {
      const ripple = document.createElement('span')
      ripple.className = 'cursor-ripple'
      ripple.style.left = `${x}px`
      ripple.style.top = `${y}px`
      layer.appendChild(ripple)
      window.setTimeout(() => ripple.remove(), 600)
    }

    const spawnStreakBadge = (x: number, y: number, count: number) => {
      const badge = document.createElement('span')
      badge.className = 'cursor-streak'
      if (count >= STREAK_HOT_THRESHOLD) badge.classList.add('cursor-streak--hot')
      badge.textContent = `x${count}`
      badge.style.left = `${x}px`
      badge.style.top = `${y}px`
      layer.appendChild(badge)
      window.setTimeout(() => badge.remove(), STREAK_BADGE_LIFETIME_MS)
    }

    const handleMouseMove = (event: MouseEvent) => {
      targetX = event.clientX
      targetY = event.clientY
      dot.style.opacity = '1'

      if (drawModeRef.current) {
        laserPoints.push({ x: targetX, y: targetY, t: performance.now() })
        return
      }

      const now = performance.now()
      if (now - lastTrailTime > TRAIL_INTERVAL_MS) {
        lastTrailTime = now
        spawnTrailDot(targetX, targetY)
      }
    }

    const handleMouseLeave = () => {
      dot.style.opacity = '0'
    }

    const handleMouseDown = (event: MouseEvent) => {
      const now = performance.now()
      clickStreak = now - lastClickTime <= STREAK_RESET_MS ? clickStreak + 1 : 1
      lastClickTime = now
      setStreakCount(clickStreak)

      if (clickStreak > bestClickStreak) {
        bestClickStreak = clickStreak
        setBestStreak(bestClickStreak)
      }

      spawnRipple(event.clientX, event.clientY)
      if (clickStreak > 1) {
        spawnStreakBadge(event.clientX, event.clientY, clickStreak)
      }
      dot.classList.add('cursor-dot--click')
      window.setTimeout(() => dot.classList.remove('cursor-dot--click'), 200)
    }

    const drawLaser = () => {
      const now = performance.now()
      laserPoints = laserPoints.filter((point) => now - point.t < LASER_POINT_LIFETIME_MS)
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      ctx.lineCap = 'round'
      ctx.strokeStyle = laserColor

      for (let i = 1; i < laserPoints.length; i++) {
        const prev = laserPoints[i - 1]
        const point = laserPoints[i]
        const alpha = Math.max(0, 1 - (now - point.t) / LASER_POINT_LIFETIME_MS)

        ctx.beginPath()
        ctx.moveTo(prev.x, prev.y)
        ctx.lineTo(point.x, point.y)
        ctx.globalAlpha = alpha * 0.85
        ctx.lineWidth = 1 + 3 * alpha
        ctx.stroke()
      }

      ctx.globalAlpha = 1
    }

    const tick = () => {
      currentX += (targetX - currentX) * EASING
      currentY += (targetY - currentY) * EASING
      dot.style.left = `${currentX}px`
      dot.style.top = `${currentY}px`
      drawLaser()
      rafId = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('resize', resizeCanvas)
    rafId = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(rafId)
      layer.innerHTML = ''
    }
  }, [])

  return (
    <>
      <div className="cursor-fx" aria-hidden="true">
        <canvas ref={canvasRef} className="cursor-draw-canvas" />
        <div ref={layerRef} className="cursor-fx-layer" />
        <div ref={dotRef} className="cursor-dot" />
      </div>
      {streakCount > 0 && (
        <div className="cursor-streak-hud" aria-hidden="true">
          Racha: <strong>x{streakCount}</strong>
          {bestStreak > 1 && <span> · Mejor: x{bestStreak}</span>}
        </div>
      )}
      <button
        type="button"
        className={`cursor-draw-toggle${drawMode ? ' cursor-draw-toggle--active' : ''}`}
        aria-pressed={drawMode}
        title={drawMode ? 'Desactivar modo láser' : 'Activar modo láser'}
        onClick={() => setDrawMode((current) => !current)}
      >
        {drawMode ? 'Láser activado' : 'Modo láser'}
      </button>
    </>
  )
}
