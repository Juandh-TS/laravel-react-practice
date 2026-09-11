import { useEffect, useRef } from 'react'

const TRAIL_INTERVAL_MS = 40
const TRAIL_LIFETIME_MS = 500
const MAX_TRAIL_DOTS = 14
const EASING = 0.2

export function CursorEffect() {
  const layerRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const isFinePointer = window.matchMedia('(any-hover: hover) and (any-pointer: fine)').matches
    const layer = layerRef.current
    const dot = dotRef.current

    if (!isFinePointer || !layer || !dot) return

    let targetX = window.innerWidth / 2
    let targetY = window.innerHeight / 2
    let currentX = targetX
    let currentY = targetY
    let lastTrailTime = 0
    let rafId = 0

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

    const handleMouseMove = (event: MouseEvent) => {
      targetX = event.clientX
      targetY = event.clientY
      dot.style.opacity = '1'

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
      spawnRipple(event.clientX, event.clientY)
      dot.classList.add('cursor-dot--click')
      window.setTimeout(() => dot.classList.remove('cursor-dot--click'), 200)
    }

    const tick = () => {
      currentX += (targetX - currentX) * EASING
      currentY += (targetY - currentY) * EASING
      dot.style.left = `${currentX}px`
      dot.style.top = `${currentY}px`
      rafId = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('mousedown', handleMouseDown)
    rafId = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('mousedown', handleMouseDown)
      cancelAnimationFrame(rafId)
      layer.innerHTML = ''
    }
  }, [])

  return (
    <div className="cursor-fx" aria-hidden="true">
      <div ref={layerRef} className="cursor-fx-layer" />
      <div ref={dotRef} className="cursor-dot" />
    </div>
  )
}
