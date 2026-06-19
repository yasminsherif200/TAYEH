import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import useWindowSize from '../hooks/useWindowSize'
import useUserLocation from '../hooks/useLocation'
import { sendMessage } from '../services/api'

// helpers
const isArabic = text => /[\u0600-\u06FF]/.test(text)

// matches things like "2.3 كم" / "500 م" / "2.3km" / "10 دقيقة" / "10 mins"
const DISTANCE_RE = /([\d.,]+)\s*(كيلومتر|كم|متر|م\b|km|kilometers?|meters?|m\b)/i
const TIME_RE = /([\d.,]+)\s*(دقيقة|دقايق|دقائق|ساعة|ساعات|د\b|min(?:ute)?s?|hours?|hrs?)/i

function extractDistanceTime(text) {
  const distanceMatch = text.match(DISTANCE_RE)
  const timeMatch = text.match(TIME_RE)

  let cleaned = text
  if (distanceMatch) cleaned = cleaned.replace(distanceMatch[0], '')
  if (timeMatch) cleaned = cleaned.replace(timeMatch[0], '')

  cleaned = cleaned
    .replace(/[•،,\-–—]\s*[•،,\-–—]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s،,\-–—:]+|[\s،,\-–—:]+$/g, '')
    .trim()

  return {
    distance: distanceMatch ? distanceMatch[0].trim() : null,
    time: timeMatch ? timeMatch[0].trim() : null,
    cleanedText: cleaned,
  }
}

function parseBotMessage(raw) {
  if (!raw) return []
  const lines = raw.split('\n').filter(l => l.trim() !== '')
  const blocks = []
  let stepIndex = 0

  lines.forEach(line => {
    const trimmed = line.trim()

    if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
      stepIndex++
      blocks.push({
        type: 'step',
        content: trimmed.replace(/^[•\-]\s*/, ''),
        index: stepIndex,
      })
    } else if (blocks.length === 0 || (stepIndex === 0 && blocks.every(b => b.type === 'text'))) {
      const { distance, time, cleanedText } = extractDistanceTime(trimmed)
      blocks.push({
        type: 'summary',
        content: cleanedText || trimmed,
        distance,
        time,
      })
    } else {
      blocks.push({ type: 'text', content: trimmed })
    }
  })

  return blocks
}

function InfoChips({ distance, time, rtl }) {
  if (!distance && !time) return null

  const Chip = ({ icon, label }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-outline-variant)',
      borderRadius: 'var(--radius-full)',
      padding: '5px 12px',
    }}>
      <span style={{ fontSize: '13px', lineHeight: 1 }}>{icon}</span>
      <span style={{
        fontSize: '12px',
        fontFamily: 'JetBrains Mono',
        fontWeight: 600,
        color: 'var(--color-on-surface)',
        whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
    </div>
  )

  return (
    <div style={{
      display: 'flex',
      flexDirection: rtl ? 'row-reverse' : 'row',
      gap: '8px',
      flexWrap: 'wrap',
    }}>
      {distance && <Chip label={distance} />}
      {time && <Chip label={time} />}
    </div>
  )
}

function StepBlock({ index, content }) {
  const rtl = isArabic(content)
  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        flexDirection: rtl ? 'row-reverse' : 'row',
        padding: '8px 0',
        borderBottom: '1px solid var(--color-outline-variant)',
      }}
    >
      <div style={{
        minWidth: '24px',
        height: '24px',
        borderRadius: '50%',
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-on-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '11px',
        fontWeight: 700,
        fontFamily: 'JetBrains Mono',
        flexShrink: 0,
        marginTop: '1px',
      }}>
        {index}
      </div>
      <span style={{
        fontSize: '13px',
        lineHeight: '1.6',
        color: 'var(--color-on-surface)',
      }}>
        {content}
      </span>
    </div>
  )
}

function BotMessage({ text, time, isMobile }) {
  const blocks = parseBotMessage(text)
  const hasSteps = blocks.some(b => b.type === 'step')
  const rtl = isArabic(text)

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '4px',
        maxWidth: isMobile ? '88%' : '76%',
      }}
    >
      {/* Avatar + label */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        flexDirection: rtl ? 'row-reverse' : 'row',
        marginBottom: '4px',
      }}>
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-on-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          fontWeight: 700,
          fontFamily: 'JetBrains Mono',
          flexShrink: 0,
        }}>
          T
        </div>
        <span style={{
          fontSize: '11px',
          fontFamily: 'JetBrains Mono',
          color: 'var(--color-on-surface-variant)',
          letterSpacing: '0.04em',
        }}>
          TAYEH
        </span>
      </div>

      {/* Message card */}
      <div style={{
        backgroundColor: 'var(--color-surface-container)',
        color: 'var(--color-on-surface)',
        borderRadius: 'var(--radius-lg)',
        borderTopLeftRadius: rtl ? 'var(--radius-lg)' : '4px',
        borderTopRightRadius: rtl ? '4px' : 'var(--radius-lg)',
        padding: isMobile ? '10px 14px' : '12px 16px',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        {blocks.map((block, i) => {
          if (block.type === 'summary') {
            const summaryRtl = isArabic(block.content)
            const hasInfo = block.distance || block.time
            return (
              <div key={i}>
                {block.content && (
                  <p
                    dir={summaryRtl ? 'rtl' : 'ltr'}
                    style={{
                      margin: hasInfo ? '0 0 8px' : (hasSteps ? '0 0 12px' : '0'),
                      fontSize: isMobile ? '13px' : '14px',
                      lineHeight: '1.6',
                      fontWeight: hasSteps ? 500 : 400,
                      textAlign: summaryRtl ? 'right' : 'left',
                    }}
                  >
                    {block.content}
                  </p>
                )}
                <InfoChips
                  distance={block.distance}
                  time={block.time}
                  rtl={summaryRtl}
                />
                {hasInfo && hasSteps && <div style={{ height: '4px' }} />}
              </div>
            )
          }

          if (block.type === 'step') {
            return (
              <StepBlock
                key={i}
                index={block.index}
                content={block.content}
              />
            )
          }

          return (
            <p
              key={i}
              dir={isArabic(block.content) ? 'rtl' : 'ltr'}
              style={{
                margin: '8px 0 0',
                fontSize: isMobile ? '13px' : '14px',
                lineHeight: '1.6',
                textAlign: isArabic(block.content) ? 'right' : 'left',
              }}
            >
              {block.content}
            </p>
          )
        })}
      </div>

      <span style={{
        fontSize: '11px',
        fontFamily: 'JetBrains Mono',
        color: 'var(--color-on-surface-variant)',
        marginTop: '2px',
        alignSelf: rtl ? 'flex-end' : 'flex-start',
      }}>
        {time}
      </span>
    </div>
  )
}

function UserMessage({ text, time, isMobile }) {
  const rtl = isArabic(text)
  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '4px',
        alignSelf: 'flex-end',
        maxWidth: isMobile ? '85%' : '70%',
      }}
    >
      <div style={{
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-on-primary)',
        borderRadius: 'var(--radius-lg)',
        borderTopRightRadius: rtl ? 'var(--radius-lg)' : '4px',
        borderTopLeftRadius: rtl ? '4px' : 'var(--radius-lg)',
        padding: isMobile ? '10px 14px' : '12px 16px',
        fontSize: isMobile ? '13px' : '14px',
        lineHeight: '1.6',
        textAlign: rtl ? 'right' : 'left',
      }}>
        {text}
      </div>
      <span style={{
        fontSize: '11px',
        fontFamily: 'JetBrains Mono',
        color: 'var(--color-on-surface-variant)',
      }}>
        {time}
      </span>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      maxWidth: '120px',
    }}>
      {/* Avatar */}
      <div style={{
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-on-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
        fontWeight: 700,
        fontFamily: 'JetBrains Mono',
        flexShrink: 0,
      }}>
        T
      </div>
      <div style={{
        backgroundColor: 'var(--color-surface-container)',
        borderRadius: 'var(--radius-lg)',
        borderTopLeftRadius: '4px',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
      }}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-on-surface-variant)',
              animation: 'typingBounce 1.2s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// chat page
function Chat() {
  const location = useLocation()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "أهلاً! أنا تايه 👋. بقولك إزاي توصل لأي مكان في الجامعة.\n\nجرب تقولي:\n«وديني + المكان اللي عايزه»\nمثلاً: وديني كلية تجارة. و شوف هتوصل ولا لأ😉",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const [inputBarHeight, setInputBarHeight] = useState(80)
  const bottomRef = useRef(null)
  const inputBarRef = useRef(null)
  const { width } = useWindowSize()
  const isMobile = width < 600
  const { location: userLocation, locationError, locationLoading } = useUserLocation()

  useEffect(() => {
    if (!inputBarRef.current) return
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setInputBarHeight(entry.contentRect.height + 85) 
      }
    })
    observer.observe(inputBarRef.current)
    return () => observer.disconnect()
  }, [])

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

  useLayoutEffect(() => {
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

      const navigation = data.data?.navigation
      const summary = navigation?.summary || ''
      const directions = navigation?.directions || []

      const botText = directions.length > 0
        ? `${summary}\n\n${directions.map(d => `• ${d}`).join('\n')}`
        : data.message || 'Sorry, I could not process that.'

      const botMessage = {
        id: Date.now(),
        sender: 'bot',
        text: botText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages(prev => [...prev, botMessage])
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'bot',
        text: 'Sorry, something went wrong. Please try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSend = () => {
    if (!input.trim() || locationLoading) return

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages(prev => [...prev, userMessage])
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 0)
    handleBotReply(input)
    setInput('')
  }

  const inputIsArabic = isArabic(input)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header />

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
        padding: isMobile ? '16px 16px' : '20px 20px',
        paddingBottom: `${inputBarHeight + 24}px`,
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}>
        {messages.map(msg =>
          msg.sender === 'bot' ? (
            <BotMessage
              key={msg.id}
              text={msg.text}
              time={msg.time}
              isMobile={isMobile}
            />
          ) : (
            <UserMessage
              key={msg.id}
              text={msg.text}
              time={msg.time}
              isMobile={isMobile}
            />
          )
        )}

        {isTyping && <TypingIndicator />}

        <div ref={bottomRef} />
      </main>

      {/* Input Area */}
      <div
        ref={inputBarRef}
        style={{
        position: 'fixed',
        bottom: '85px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '900px',
        padding: isMobile ? '10px 16px' : '12px 20px',
        backgroundColor: 'var(--color-background)',
        borderTop: '1px solid var(--color-outline-variant)',
        boxSizing: 'border-box',
      }}>
        {locationLoading && (
          <div style={{
            textAlign: 'center',
            fontSize: '11px',
            fontFamily: 'JetBrains Mono',
            color: 'var(--color-on-surface-variant)',
            marginBottom: '6px',
          }}>
            📍 Getting your location...
          </div>
        )}

        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--color-surface-container)',
          borderRadius: 'var(--radius-full)',
          padding: '8px 8px 8px 16px',
          gap: '8px',
          flexDirection: inputIsArabic ? 'row-reverse' : 'row',
        }}>
          <input
            type="text"
            value={input}
            dir={inputIsArabic ? 'rtl' : 'ltr'}
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
              textAlign: inputIsArabic ? 'right' : 'left',
            }}
          />
          <button
            onClick={handleSend}
            disabled={locationLoading}
            aria-label="Send message"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: locationLoading
                ? 'var(--color-outline)'
                : 'var(--color-primary)',
              border: 'none',
              cursor: locationLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '16px',
              flexShrink: 0,
              transition: 'background-color 0.2s ease',
              transform: inputIsArabic ? 'scaleX(-1)' : 'none',
            }}
          >
            {locationLoading ? '…' : '→'}
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

export default Chat