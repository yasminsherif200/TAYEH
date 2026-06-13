import { useNavigate, useLocation } from 'react-router-dom'

function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const tabs = [
    { label: 'Home', path: '/', icon: '⌂' },
    { label: 'Assistant', path: '/chat', icon: '💬' },
  ]

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '640px',
      backgroundColor: 'var(--color-background)',
      borderTop: '1px solid var(--color-outline-variant)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '8px 0 16px 0',
      zIndex: 100,
    }}>
      {tabs.map(tab => {
        const isActive = location.pathname === tab.path

        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 24px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
              color: isActive ? 'var(--color-on-primary)' : 'var(--color-on-surface-variant)',
              transition: 'all 0.2s ease',
            }}>
            <span style={{ fontSize: '18px' }}>{tab.icon}</span>
            <span style={{ fontSize: '12px', fontWeight: '500' }}>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export default BottomNav