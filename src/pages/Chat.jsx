import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import useWindowSize from '../hooks/useWindowSize'
import useUserLocation from '../hooks/useLocation'
import useSpeechRecognition from '../hooks/useSpeechRecognition'
import useTextToSpeech from '../hooks/useTextToSpeech'
import { sendMessage } from '../services/api'
import logo from '../../public/logo2.png'

// helpers
const isArabic = text => /[\u0600-\u06FF]/.test(text)

function cleanText(text) {
  if (!text) return ''
  return text
    .split(' ')
    .filter(word => {
      return /^[\u0600-\u06FF\u0020-\u007Ea-zA-Z0-9\s.,،؟?!:؛;()\-–—"']+$/.test(word)
    })
    .join(' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function formatDistance(meters) {
  if (!meters) return null
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} كم`
  return `${Math.round(meters)} متر`
}

function formatTime(seconds) {
  if (!seconds) return null
  const minutes = Math.round(seconds / 60)
  if (minutes < 1) return 'أقل من دقيقة'
  if (minutes === 1) return 'دقيقة واحدة'
  if (minutes === 2) return 'دقيقتين'
  if (minutes <= 10) return `${minutes} دقائق`
  return `${minutes} دقيقة`
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
      blocks.push({
        type: 'summary',
        content: cleanText(trimmed),
      })
    } else {
      blocks.push({ type: 'text', content: trimmed })
    }
  })

  return blocks
}

function InfoChips({ distance, time, rtl }) {
  if (!distance && !time) return null

  const Chip = ({ label }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-outline-variant)',
      borderRadius: 'var(--radius-full)',
      padding: '5px 12px',
    }}>
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
      marginTop: '10px',
    }}>
      {distance && <Chip label={`${distance}`} />}
      {time && <Chip label={`${time}`} />}
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

function BotMessage({ text, time, isMobile, suggestion, onSuggestionClick, distance, routeTime, msgId, speakingId, onSpeak, onStop, places, hoveredPlace, setHoveredPlace, onNavigate }) {
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
          <img src={logo} alt="TAYEH" style={{ width: '75%', height: '75%', objectFit: 'contain' }} />
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
            return (
              <div key={i}>
                {block.content && (
                  <p
                    dir={summaryRtl ? 'rtl' : 'ltr'}
                    style={{
                      margin: '0 0 8px',
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
                  distance={distance}
                  time={routeTime}
                  rtl={summaryRtl}
                />
                {(distance || routeTime) && hasSteps && <div style={{ height: '8px' }} />}
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

      {/* Suggestion button */}
      {suggestion && (
        <button
          onClick={() => onSuggestionClick(suggestion)}
          style={{
            marginTop: '8px',
            backgroundColor: 'transparent',
            border: '2px solid var(--color-primary)',
            borderRadius: 'var(--radius-full)',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: '600',
            color: 'var(--color-primary)',
            cursor: 'pointer',
            fontFamily: 'Manrope',
            transition: 'all 0.2s ease',
            alignSelf: rtl ? 'flex-end' : 'flex-start',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary)'
            e.currentTarget.style.color = 'var(--color-on-primary)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = 'var(--color-primary)'
          }}
        >
          {suggestion} ←
        </button>
      )}
      
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '2px',
            alignSelf: rtl ? 'flex-end' : 'flex-start',
            flexDirection: rtl ? 'row-reverse' : 'row',
          }}>
            <span style={{
              fontSize: '11px',
              fontFamily: 'JetBrains Mono',
              color: 'var(--color-on-surface-variant)',
            }}>
              {time}
            </span>
              <button
                onClick={() => speakingId === msgId ? onStop() : onSpeak(text, msgId)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '13px', padding: '0 2px',
                  color: speakingId === msgId ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                }}
              >
                {speakingId === msgId ? '⏹' : '🔊'}
              </button>
          </div>
          {/* If the bot message contains places(recommendations), display them as buttons */}
           {places && places.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
          {places.map((place) => (
            <div
              key={place.id}
              onMouseEnter={() => setHoveredPlace(place.id)}
              onMouseLeave={() => setHoveredPlace(null)}
              style={{
                position: 'relative',
                backgroundColor: hoveredPlace === place.id
                  ? 'var(--color-surface-container-high)'
                  : 'var(--color-surface)',
                border: '1px solid var(--color-outline-variant)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: hoveredPlace === place.id ? 'scale(1.01)' : 'scale(1)',
                boxShadow: hoveredPlace === place.id ? 'var(--shadow-md)' : 'var(--shadow-sm)',
              }}
              onClick={() => onNavigate(place.name)}
            >
              {/* place name and rating */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'var(--color-on-surface)',
                  direction: 'rtl',
                }}>
                  {place.name}
                </span>
                {place.rating && (
                  <span style={{
                    fontSize: '11px',
                    fontFamily: 'JetBrains Mono',
                    color: 'var(--color-on-surface-variant)',
                  }}>
                    ⭐ {place.rating}
                  </span>
                )}
              </div>

              {/* on hover */}
              {hoveredPlace === place.id && (
                <div style={{
                  marginTop: '8px',
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'var(--color-primary)',
                    fontFamily: 'JetBrains Mono',
                    borderBottom: '1px solid var(--color-primary)',
                    paddingBottom: '1px',
                  }}>
                    وديني ←
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
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
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.6; }
        }
      `}</style>
    </div>
  )
}
const WELCOME_MESSAGES = [
  `تايه؟ ولا يهمك\nسواء عايز توصل لمكان، تعرف أقرب خدمة، تلاقي المكان الأنسب ليك، أو حتى تسأل بصوتك...\nاسأل بالطريقة اللي تناسبك، وسيب الباقي علينا 📍\n\n💡 جرّب تسأل:\n• وديني كلية التجارة\n• أقرب بوابة أركب منها جيزة\n• أقرب مطعم\n• أهدى مكان للمذاكرة\n• أقرب مسجد\n• أقرب حمام`,

  `تايه؟ ولا يهمك\nكل اللي محتاجه جوه الجامعة في مكان واحد\n\n💡 جرّب تسأل:\n• وديني المدرج الكبير\n• أركب منين علشان اروح أكتوبر؟\n• أقرب مسجد\n• أقرب ATM\n• أقرب مكان أذاكر فيه\n• أقرب حمام بنات`,

  `تايه؟ ولا يهمك\nاسأل زي ما بتحب... كتابة أو بصوتك، وأنا هساعدك\n\n💡 جرّب تسأل:\n• وديني شؤون الطلاب\n• أقرب بوابة للمترو\n• أقرب مسجد\n• أحسن مكان أقعد فيه\n• أقرب مطعم\n• أقرب مكتبة`,

  `تايه؟ ولا يهمك\nمن أول الاتجاهات لحد الخدمات والمواصلات... سيبها علينا\n\n💡 جرّب تسأل:\n• وديني كلية علوم\n• أركب منين للهرم؟\n• أقرب مكان للمذاكرة\n• أقرب مسجد\n• أقرب حمام\n• أقرب عيادة`,

  `تايه؟ ولا يهمك\nقول اللي محتاجه بالطريقة اللي تعجبك، وسيب الباقي علينا 📍\n\n💡 جرّب تسأل:\n• وديني المكتبة المركزية\n• أقرب بوابة أركب منها فيصل\n• أقرب مطعم\n• أهدى مكان للمذاكرة\n• أقرب مسجد`,
]

function Chat() {
  const location = useLocation()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)],
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
  const { isListening, startListening, stopListening } = useSpeechRecognition({
    onResult: (transcript) => {
      setInput(prev => prev ? `${prev} ${transcript}` : transcript)
    }
  })
  const { speakingId, speak, stop } = useTextToSpeech()
  const [hoveredPlace, setHoveredPlace] = useState(null)

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
    if (location.state?.prefill && location.state?.autoSend && !locationLoading) {
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
    } else if (location.state?.prefill && !location.state?.autoSend) {
      setInput(location.state.prefill)
    }
  }, [locationLoading])

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
      console.log('Full response:', JSON.stringify(data, null, 2)) 

      const requiresConfirmation = data.data?.requires_confirmation
      const gateName = data.data?.transport?.place?.name

          if (requiresConfirmation && gateName) {
        const botMessage = {
          id: Date.now(),
          sender: 'bot',
          text: `أقرب بوابة للمكان اللي عايزه هي "${gateName}" 🚪\nتحبي أوصلك هناك؟`,  
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestion: `وديني ${gateName}`,
        }
        setMessages(prev => [...prev, botMessage])

      }  else if (data.data?.type === 'recommendation') {
        const { assistant_message, places } = data.data
        const botMessage = {
          id: Date.now(),
          sender: 'bot',
          text: assistant_message,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          places: places,   // Store the places in the bot message
        }
        setMessages(prev => [...prev, botMessage])

        } else if (data.data?.type === 'search_place') {
      const place = data.data.place
      const isToilet = place.type === 'toilet'

      if (isToilet) {
        const botMessage = {
          id: Date.now(),
          sender: 'bot',
          text: 'عايز/ة حمام بنات ولا ولاد؟ 🚻',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          places: [
            { id: 'girls', name: 'حمام بنات', rating: null },
            { id: 'boys', name: 'حمام ولاد', rating: null },
          ],
        }
        setMessages(prev => [...prev, botMessage])
      } else {
        const botMessage = {
          id: Date.now(),
          sender: 'bot',
          text: `لقيت "${place.name}" 📍`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestion: `وديني ${place.name}`,
        }
        setMessages(prev => [...prev, botMessage])
      }} else {
        const navigation = data.data?.navigation
        const route = data.data?.route
        const summary = navigation?.summary || ''
        const directions = navigation?.directions || []
        const isNoTransport = data.status === 400 && data.message?.includes('وسيلة مواصلات')

        const botText = directions.length > 0
          ? `${summary}\n\n${directions.map(d => `• ${d}`).join('\n')}`
          : isNoTransport
          ? 'مفيش مواصلات متاحة للمكان ده مباشرةً 🚇\nبس أنسب حل هو الباب الصغير بتاع المترو ومنها تشوف اقرب محطة مترو ليك '
          : data.message?.toLowerCase().includes('not found')
          ? 'معرفتش ألاقي المكان ده 🤔\nجرب تكتبه بطريقة تانية، أو اسألني عن أقرب مكان ليه'
          : data.message || 'مش فاهمك، ممكن تعيد صياغته ب اسم تاني؟'

        const botMessage = {
          id: Date.now(),
          sender: 'bot',
          text: botText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          distance: formatDistance(route?.total_distance),
          routeTime: formatTime(route?.total_time),
          suggestion: isNoTransport ? 'وديني الباب الصغير' : null,
        }
        setMessages(prev => [...prev, botMessage])
      }
    } catch (err) {
      
      console.log('Catch error:', err)
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

  const handleSuggestionClick = (suggestionText) => {
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: suggestionText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages(prev => [...prev, userMessage])

    handleBotReply(suggestionText)
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
              suggestion={msg.suggestion}
              onSuggestionClick={handleSuggestionClick}
              distance={msg.distance}
              routeTime={msg.routeTime}
              msgId={msg.id}
              speakingId={speakingId}
              onSpeak={speak}
              onStop={stop}
              places={msg.places}                          
              hoveredPlace={hoveredPlace}                
              setHoveredPlace={setHoveredPlace}            
              onNavigate={(name) => {                      
                const userMessage = {
                  id: Date.now(),
                  sender: 'user',
                  text: `وديني ${name}`,
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }
                setMessages(prev => [...prev, userMessage])
                handleBotReply(`وديني ${name}`)
              }}
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

        {/* Recording indicator */}
        {isListening && (
          <div style={{
            textAlign: 'center',
            fontSize: '11px',
            fontFamily: 'JetBrains Mono',
            color: '#dc2626',
            marginBottom: '6px',
            animation: 'pulse 1s ease-in-out infinite',
          }}>
             Recording ..
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
            placeholder={isListening ? 'Recording ..' : 'Type your message...'}
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

          {/* Mic Button */}
          <button
            onClick={isListening ? stopListening : startListening}
            aria-label={isListening ? 'Stop listening' : 'Start voice input'}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: isListening
                ? '#dc2626'
                : 'var(--color-surface-container-high)',
              border: isListening
                ? 'none'
                : '1px solid var(--color-outline-variant)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.2s ease',
            }}
          >
            {isListening ? (
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: 'white',
                animation: 'pulse 1s ease-in-out infinite',
              }} />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-on-surface-variant)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            )}
          </button>

          {/* Send Button */}
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

        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.4); opacity: 0.6; }
          }
        `}</style>
      </div>

      <BottomNav />
    </div>
  )
}

export default Chat