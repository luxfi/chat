import { Link, useLocation } from 'wouter'

export function Header() {
  const [location] = useLocation()
  if (location === '/iframe') return null

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="flex items-center gap-2 font-medium">
          <span className="inline-block h-3.5 w-3.5 bg-[var(--fg)] [clip-path:polygon(50%_100%,0_0,100%_0)]" />
          <span>Lux</span>
        </Link>
        <nav className="flex flex-1 gap-6 text-sm text-[var(--muted)]">
          <a href="https://lux.network" target="_blank" rel="noreferrer" className="hover:text-[var(--fg)]">Network</a>
          <a href="https://lux.cloud" target="_blank" rel="noreferrer" className="hover:text-[var(--fg)]">Cloud</a>
          <a href="https://lux.exchange" target="_blank" rel="noreferrer" className="hover:text-[var(--fg)]">Exchange</a>
        </nav>
      </div>
    </header>
  )
}
