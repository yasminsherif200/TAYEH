import { useNavigate } from 'react-router-dom'

function Header() {
  const navigate = useNavigate()

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 20px',
      backgroundColor: 'var(--color-background)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <span
        onClick={() => navigate('/')}
        style={{
          fontFamily: 'Manrope',
          fontWeight: '700',
          fontSize: '18px',
          color: 'var(--color-on-surface)',
          cursor: 'pointer',
          letterSpacing: '0.05em',
        }}>
        TAYEH
      </span>

      <button style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--color-on-surface)',
        fontSize: '20px',
        padding: '4px',
      }}>
        ⊕
      </button>
    </header>
  )
}

export default Header