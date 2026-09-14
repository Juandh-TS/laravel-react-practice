import { useEffect, useRef, useState } from 'react'

export type TabType = 'tasks' | 'users' | 'companies'

interface NavigationTabsProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

const TABS: { key: TabType; label: string }[] = [
  { key: 'tasks', label: 'Tareas' },
  { key: 'users', label: 'Usuarios' },
  { key: 'companies', label: 'Empresas' },
]

export function NavigationTabs({ activeTab, onTabChange }: NavigationTabsProps) {
  const navRef = useRef<HTMLElement>(null)
  const buttonRefs = useRef<Partial<Record<TabType, HTMLButtonElement | null>>>({})
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number } | null>(null)

  useEffect(() => {
    const updateIndicator = () => {
      const nav = navRef.current
      const button = buttonRefs.current[activeTab]
      if (!nav || !button) return
      const navRect = nav.getBoundingClientRect()
      const buttonRect = button.getBoundingClientRect()
      setIndicatorStyle({ left: buttonRect.left - navRect.left, width: buttonRect.width })
    }

    updateIndicator()
    window.addEventListener('resize', updateIndicator)
    return () => window.removeEventListener('resize', updateIndicator)
  }, [activeTab])

  return (
    <nav className="tabs" aria-label="Navegación principal" ref={navRef}>
      {indicatorStyle && (
        <span
          className="tab-indicator"
          style={{ transform: `translateX(${indicatorStyle.left}px)`, width: indicatorStyle.width }}
        />
      )}
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={activeTab === tab.key ? 'active' : ''}
          onClick={() => onTabChange(tab.key)}
          ref={(el) => {
            buttonRefs.current[tab.key] = el
          }}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
