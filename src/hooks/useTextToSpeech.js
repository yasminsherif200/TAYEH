import { useState, useRef } from 'react'

function useTextToSpeech() {
  const [speakingId, setSpeakingId] = useState(null)
  const utteranceRef = useRef(null)

  const speak = (text, id) => {
    window.speechSynthesis.cancel()

    if (!text) return

    const utterance = new SpeechSynthesisUtterance(text)
    utteranceRef.current = utterance

    utterance.lang = 'ar-EG'   
    utterance.rate = 1         
    utterance.pitch = 1         
    utterance.volume = 1        
    utterance.onstart = () => {
      setSpeakingId(id)
    }

    utterance.onend = () => {
      setSpeakingId(null)
    }

    utterance.onerror = () => {
      setSpeakingId(null)
    }

    window.speechSynthesis.speak(utterance)
  }

  const stop = () => {
    window.speechSynthesis.cancel()
    setSpeakingId(null)
  }

  return { speakingId, speak, stop }
}

export default useTextToSpeech