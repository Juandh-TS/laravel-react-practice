import { ThemeToggle } from '@/components/common/ThemeToggle'

interface HeaderProps {
  brand?: string
}

export function Header({ brand = 'Laravel + React Practice' }: HeaderProps) {
  return (
    <div className="header-bar">
      <p className="brand">{brand}</p>
      <ThemeToggle />
    </div>
  )
}
