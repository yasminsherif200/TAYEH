import { useNavigate } from 'react-router-dom'
import { Compass } from 'lucide-react'
import logo from '../../public/logo.png'

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
          display: 'inline-flex',
          alignItems: 'center',
          fontFamily: 'Manrope',
          fontWeight: '700',
          fontSize: '18px',
          color: 'var(--color-on-surface)',
          cursor: 'pointer',
          letterSpacing: '0.05em',
        }}>
        <img src={logo} alt="TAYEH" style={{ width: '75px', height: '75px', marginRight: '10px', objectFit: 'contain'}} />
      </span>

      <button onClick={() => navigate('/chat')} 
        style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-on-surface)',
            fontSize: '20px',
            padding: '4px',
        }}>
        <Compass size={22} />
      </button>
    </header>
  )
}

export default Header