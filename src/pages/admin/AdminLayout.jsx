import { Link, useLocation } from 'react-router-dom'

const COLORS = {
  primary: '#3e5219',
  bg: '#fbfbe2',
  white: '#ffffff',
  border: '#e0e0c0',
  textMuted: '#6b6b50',
}

export default function AdminLayout({ children }) {
  const location = useLocation()

  const navItems = [
    { path: '/admin', label: 'Overview' },
    { path: '/admin/places', label: 'Places' },
  ]

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: COLORS.bg,
        fontFamily: "'Manrope', sans-serif",
        maxWidth: 'none',
      }}
    >
      <aside
        style={{
          width: '220px',
          background: COLORS.primary,
          color: COLORS.bg,
          padding: '24px 16px',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '14px',
            letterSpacing: '1px',
            marginBottom: '32px',
            opacity: 0.9,
          }}
        >
          TAYEH ADMIN
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  textDecoration: 'none',
                  color: isActive ? COLORS.primary : COLORS.bg,
                  background: isActive ? COLORS.bg : 'transparent',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: isActive ? 700 : 500,
                  transition: 'background 0.15s ease',
                }}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      <main
        style={{
          flex: 1,
          padding: '32px 40px',
          maxWidth: '1100px',
        }}
      >
        {children}
      </main>
    </div>
  )
}