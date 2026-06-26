import { useState, useRef } from 'react'

function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const utteranceRef = useRef(null)

  const speak = (text) => {
    window.speechSynthesis.cancel()

    if (!text) return

    const utterance = new SpeechSynthesisUtterance(text)
    utteranceRef.current = utterance

    utterance.lang = 'ar-EG'   
    utterance.rate = 1         
    utterance.pitch = 1         
    utterance.volume = 1        
    utterance.onstart = () => {
      setIsSpeaking(true)
    }

    utterance.onend = () => {
      setIsSpeaking(false)
    }

    utterance.onerror = () => {
      setIsSpeaking(false)
    }

    window.speechSynthesis.speak(utterance)
  }

  const stop = () => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  return { isSpeaking, speak, stop }
}

export default useTextToSpeech