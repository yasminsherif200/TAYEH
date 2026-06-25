import { useState, useRef } from 'react'

function useSpeechRecognition({ onResult }) {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef(null)

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert('Sorry your browser does not support Speech Recognition. Use Chrome instead')
      return
    }

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition

    recognition.lang = 'ar-EG'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      onResult(transcript)
    }

    recognition.onerror = (event) => {
      console.log('Speech error:', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  return { isListening, startListening, stopListening }
}

export default useSpeechRecognition