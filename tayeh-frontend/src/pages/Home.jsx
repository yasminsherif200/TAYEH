import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import PlaceCard from '../components/PlaceCard'
import clockTower from '../assets/clock-tower.jpg'
import { GraduationCap, School } from 'lucide-react'
import cafeteria from '../assets/cafeteria.jpg'
import library from '../assets/library.jpg'
import atm from '../assets/atm.jpg'
import { useState } from 'react'

const places = [
  { id: 1, name: 'Breakout Cafeteria', description: 'Student hub for meals', tag: 'cheap', image: cafeteria },
  { id: 2, name: 'Central Library', description: 'Central study space', tag: 'quiet', image: library },
  { id: 3, name: 'Banque Misr ATM', description: 'Near Faculty of Commerce', tag: 'convenient', image: atm },
]

function Home() {
  const navigate = useNavigate()
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return
    navigate('/chat', { state: { prefill: input, autoSend: true } })
  }

  return (
    <div>
      <Header />

      <main style={{ padding: '0 20px 100px 20px' }}>

        {/* Hero Section */}
        <section style={{ textAlign: 'center', padding: '32px 0 24px 0' }}>
          <div style={{
            display: 'inline-block',
            backgroundColor: 'var(--color-surface-container)',
            borderRadius: 'var(--radius-full)',
            padding: '6px 14px',
            fontSize: '12px',
            fontFamily: 'JetBrains Mono',
            color: 'var(--color-on-surface-variant)',
            marginBottom: '16px',
            letterSpacing: '0.05em',
          }}>
            ✦ Cairo University Intelligent Navigator
          </div>

          <h1 style={{
            fontSize: '26px',
            fontWeight: '700',
            lineHeight: '34px',
            color: 'var(--color-on-surface)',
            marginBottom: '12px',
          }}>
            TAYEH: Your Personal Guide to Cairo University
          </h1>

          <p style={{
            fontSize: '15px',
            color: 'var(--color-on-surface-variant)',
            lineHeight: '24px',
            marginBottom: '24px',
          }}>
            An AI-powered conversational assistant that knows every corner of the campus. Just ask, and we'll lead the way.
          </p>

          <button
            onClick={() => navigate('/chat')}
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              padding: '14px 28px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
            }}>
            Start Navigating →
          </button>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            fontSize: '12px',
            color: 'var(--color-on-surface-variant)',
            fontFamily: 'JetBrains Mono',
          }}>
            <span><School size={12} /> Since 1908</span>
            <span>•</span>
            <span><GraduationCap size={12} /> Smart Campus</span>
          </div>
        </section>

        {/* Middle Section */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '24px',
        }}>
          <div style={{
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            position: 'relative',
            minHeight: '180px',
            backgroundColor: 'var(--color-surface-container)',
          }}>
            <img
              src={clockTower}
              alt="Historic Clock Tower"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            <div style={{
              position: 'absolute',
              bottom: 0, left: 0, right: 0,
              padding: '8px 12px',
              background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
              color: '#fff',
            }}>
              <p style={{ fontSize: '13px', fontWeight: '600' }}>Historic Clock Tower</p>
              <p style={{ fontSize: '10px', fontFamily: 'JetBrains Mono', opacity: 0.8 }}>Main Campus Landmark</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {places.map(place => (
              <PlaceCard
                key={place.id}
                name={place.name}
                description={place.description}
                tag={place.tag}
                image={place.image}
                onClick={() => navigate('/chat', { state: { prefill: `Take me to "${place.name}"`, autoSend: true } })}
              />
            ))}
          </div>
        </section>

        {/* Mini Chat */}
        <section style={{
          backgroundColor: 'var(--color-surface-container-low)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          boxShadow: 'var(--shadow-md)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '16px',
          }}>
            <div style={{
              width: '36px', height: '36px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px',
            }}>
              🤖
            </div>
            <div>
              <p style={{ fontWeight: '600', fontSize: '14px' }}>Ask TAYEH</p>
              <p style={{ fontSize: '11px', fontFamily: 'JetBrains Mono', color: 'var(--color-on-surface-variant)' }}>Online | Always available</p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px', gap: '8px' }}>
            <div style={{
              width: '32px', height: '32px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', flexShrink: 0,
            }}>
              🤖
            </div>
            <div style={{
              backgroundColor: 'var(--color-surface-container)',
              color: 'var(--color-on-surface)',
              borderRadius: 'var(--radius-lg)',
              padding: '10px 14px',
              fontSize: '13px',
              maxWidth: '80%',
              lineHeight: '20px',
            }}>
              Lost on campus? Same. But unlike you, I actually know where everything is. 🗺️ Ask me anything — gates, faculties, shortcuts, food — I got you.
            </div>
          </div>

          {/* Input */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--color-surface-container-high)',
            borderRadius: 'var(--radius-full)',
            padding: '10px 16px',
            gap: '8px',
          }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Type your destination..."
              style={{
                flex: 1,
                border: 'none',
                background: 'none',
                outline: 'none',
                fontSize: '14px',
                color: 'var(--color-on-surface)',
                fontFamily: 'Manrope',
              }}
            />
            <button
              onClick={handleSend}
              style={{
                width: '32px', height: '32px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-primary)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white',
                fontSize: '14px',
              }}>
              →
            </button>
          </div>
        </section>

      </main>

      <BottomNav />
    </div>
  )
}

export default Home