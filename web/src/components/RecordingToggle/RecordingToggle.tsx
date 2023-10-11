import clsx from 'clsx'
import { FC, useEffect, useState } from 'react'
import { FiMic } from 'react-icons/fi'
import toast from 'react-hot-toast'

import { LanguageCode } from '@/lib/types/language'
import { TranscriptionData } from '@/lib/types/transcription'

import './styles.css'

type RecordProps = {
  langFrom: LanguageCode
  onRecognitionEnd: (transcription: TranscriptionData) => void
  onTranscriptionChange: (transcription: TranscriptionData) => void
}

const RECOGNITION_ERRORS = ['no-speech', 'not-allowed']
const recognition = window.SpeechRecognition
  ? new window.SpeechRecognition()
  : new window.webkitSpeechRecognition()

export const RecordingToggle: FC<RecordProps> = ({
  langFrom,
  onRecognitionEnd,
  onTranscriptionChange
}) => {
  const [finalTranscript, setFinalTranscript] =
    useState<TranscriptionData | null>(null)
  const [isRecording, setIsRecording] = useState<boolean>(false)

  useEffect(() => {
    if (isRecording && finalTranscript) {
      onRecognitionEnd(finalTranscript)
    }

    onTranscriptionChange(null)
  }, [finalTranscript, isRecording])

  const recognitionOnErrorHandler = (event: SpeechRecognitionErrorEvent) => {
    console.error(`Speech recognition error detected: ${event.error}`)
    console.error(`Additional information: ${event.message}`)
    if (RECOGNITION_ERRORS.findIndex(e => e == event.error) >= 0) {
      recognition.stop()
    }
  }

  const recognitionOnEndHandler = (event: Event) => {
    if (isRecording) {
      console.log('on end handler triggered', event)
      console.log('Restarting speech recognition service')
      setFinalTranscript(null)
      // recognition.start()
      return
    }
    console.log('Speech recognition service finished listening')
    setFinalTranscript(null)
  }

  const recognitionOnStartHandler = () => {
    setFinalTranscript(null)
    setIsRecording(true)
  }

  const recognitionOnResultHandler = (event: SpeechRecognitionEvent) => {
    let interimTranscript = ''

    if (typeof event.results == 'undefined') {
      console.log('UNDEFINED result recieved. Stopping recognition!')
      recognition.onend = null
      recognition.stop()
      return
    }

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        const finalTranscript = event.results[i][0].transcript
        if (finalTranscript.trim() !== '') {
          const finalTranscriptionResult: TranscriptionData = {
            type: 'transcription',
            transcription: {
              text: finalTranscript,
              language: langFrom
            },
            isFinal: true
          }
          toast.success('Message recorded & sent', {
            className:
              'text-lg px-5 border-1 border-[#31C48D] bg-[#F3FAF7] rounded border-[1px] border-success',
            duration: 4000
          })
          setFinalTranscript(finalTranscriptionResult)
        }
      } else {
        interimTranscript += event.results[i][0].transcript
        onTranscriptionChange({
          type: 'transcription',
          transcription: { text: interimTranscript, language: langFrom },
          isFinal: false
        })
      }
    }
  }

  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = langFrom
  recognition.onstart = recognitionOnStartHandler
  recognition.onerror = recognitionOnErrorHandler
  recognition.onend = recognitionOnEndHandler
  recognition.onresult = recognitionOnResultHandler

  const toggleRecording = (recognition: SpeechRecognition) => {
    if (isRecording) {
      recognition.stop()
      setFinalTranscript(null)
      setIsRecording(false)
    } else {
      recognition.start()
    }
  }

  return (
    <>
      <button
        className={clsx(
          'recognizing-toggle inline-flex items-center justify-center text-sm font-medium text-base ring-offset-background transition-colors bg-primary text-white rounded-lg px-3 py-2 max-w-[185px] w-full [&.active]:bg-red-600',
          { active: isRecording }
        )}
        onClick={() => toggleRecording(recognition)}
      >
        {isRecording ? (
          <>
            <FiMic />
            <span className="pl-2">Stop recording</span>
          </>
        ) : (
          <>
            <FiMic />
            <span className="pl-2">Add a voice message</span>
          </>
        )}
      </button>
    </>
  )
}
