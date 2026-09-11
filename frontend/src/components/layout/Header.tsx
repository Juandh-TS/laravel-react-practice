interface HeaderProps {
  brand?: string
}

export function Header({ brand = 'Laravel + React Practice' }: HeaderProps) {
  return <p className="brand">{brand}</p>
}
