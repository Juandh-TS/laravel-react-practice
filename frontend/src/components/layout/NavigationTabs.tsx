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
  return (
    <nav className="tabs" aria-label="Navegación principal">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={activeTab === tab.key ? 'active' : ''}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
