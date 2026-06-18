import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import useWindowSize from '../hooks/useWindowSize'
import useUserLocation from '../hooks/useLocation'
import { sendMessage } from '../services/api'

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
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef(null)
  const { width } = useWindowSize()
  const isMobile = width < 600
  const { location: userLocation, locationError } = useUserLocation()

  useEffect(() => {
    if (location.state?.prefill) {
      if (location.state?.autoSend) {
        const userMessage = {
          id: 2,
          sender: 'user',
          text: location.state.prefill,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        setMessages(prev => {
          const alreadyAdded = prev.some(m => m.text === location.state.prefill)
          if (alreadyAdded) return prev
          return [...prev, userMessage]
        })
        handleBotReply(location.state.prefill)
      } else {
        setInput(location.state.prefill)
      }
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleBotReply = async (messageText) => {
    setIsTyping(true)
    try {
      const data = await sendMessage(
        messageText,
        userLocation.lat,
        userLocation.lng
      )
      const botMessage = {
        id: Date.now(),
        sender: 'bot',
        text: data.reply || data.message || 'Sorry, I could not process that.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      const errorMessage = {
        id: Date.now(),
        sender: 'bot',
        text: 'Sorry, something went wrong. Please try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages(prev => [...prev, userMessage])
    handleBotReply(input)
    setInput('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header />

      {/* Location warning if denied */}
      {locationError && (
        <div style={{
          backgroundColor: '#fff3cd',
          color: '#856404',
          padding: '8px 20px',
          fontSize: '12px',
          fontFamily: 'JetBrains Mono',
          textAlign: 'center',
        }}>
          ⚠️ Location access denied — directions may be less accurate
        </div>
      )}

      {/* Messages Area */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        padding: isMobile ? '12px 16px' : '16px 20px',
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
              padding: isMobile ? '10px 14px' : '12px 16px',
              maxWidth: isMobile ? '85%' : '75%',
              fontSize: isMobile ? '13px' : '14px',
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

        {/* Typing indicator */}
        {isTyping && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <div style={{
              backgroundColor: 'var(--color-surface-container)',
              borderRadius: 'var(--radius-lg)',
              padding: '12px 16px',
              fontSize: '18px',
              letterSpacing: '2px',
            }}>
              •••
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      {/* Input Area */}
      <div style={{
        position: 'fixed',
        bottom: '60px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '900px',
        padding: isMobile ? '10px 16px' : '12px 20px',
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