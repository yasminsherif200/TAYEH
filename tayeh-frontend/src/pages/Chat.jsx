import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'

function Chat() {
  const location = useLocation()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Welcome to Cairo University! I'm TAYEH. How can I help you find your way today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ])

  // Read prefill from PlaceCard click
  useEffect(() => {
    if (location.state?.prefill) {
      setInput(location.state.prefill)
    }
  }, [location.state])

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header />

      {/* Messages Area */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 20px',
        paddingBottom: '160px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              gap: '4px',
            }}
          >
            <div style={{
              backgroundColor: msg.sender === 'user'
                ? 'var(--color-primary)'
                : 'var(--color-surface-container)',
              color: msg.sender === 'user'
                ? 'var(--color-on-primary)'
                : 'var(--color-on-surface)',
              borderRadius: 'var(--radius-lg)',
              padding: '12px 16px',
              maxWidth: '75%',
              fontSize: '14px',
              lineHeight: '22px',
            }}>
              {msg.text}
            </div>
            <span style={{
              fontSize: '11px',
              fontFamily: 'JetBrains Mono',
              color: 'var(--color-on-surface-variant)',
            }}>
              {msg.time}
            </span>
          </div>
        ))}
      </main>

      {/* Input Area */}
      <div style={{
        position: 'fixed',
        bottom: '60px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '900px',
        padding: '12px 20px',
        backgroundColor: 'var(--color-background)',
        borderTop: '1px solid var(--color-outline-variant)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--color-surface-container)',
          borderRadius: 'var(--radius-full)',
          padding: '10px 16px',
          gap: '10px',
        }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
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
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-primary)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '16px',
            }}>
            →
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

export default Chat