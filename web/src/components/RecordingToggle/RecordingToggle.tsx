import clsx from 'clsx'
import { FC, useEffect, useState } from 'react'

import {
  FiMic as StartRecording,
  FiMicOff as StopRecording
} from 'react-icons/fi'

import { LanguageCode } from '@/lib/types/language'
import { TranscriptionData } from '@/lib/types/transcription'

import './styles.css'

type RecordProps = {
  langFrom: LanguageCode
  onRecordingToggle: (
    transcription: TranscriptionData,
    isRecording: boolean
  ) => void
  onTranscriptionChange: (transcription: TranscriptionData) => void
}

const RECOGNITION_ERRORS = ['no-speech', 'audio-capture', 'not-allowed']
const recognition = new SpeechRecognition()

export const RecordingToggle: FC<RecordProps> = ({
  langFrom,
  onRecordingToggle,
  onTranscriptionChange
}) => {
  const [finalTranscript, setFinalTranscript] = useState<TranscriptionData>()
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [isIgnoreRecognitionOnEnd, setIsIgnoreRecognitionOnEnd] =
    useState<boolean>(false)

  useEffect(() => {
    if (isRecording || finalTranscript) {
      onRecordingToggle(finalTranscript, isRecording)
    }

    if (!isRecording) {
      onTranscriptionChange(null)
    }
  }, [finalTranscript, isRecording])

  const recognitionOnErrorHandler = (event: SpeechRecognitionErrorEvent) => {
    console.error(`Speech recognition error detected: ${event.error}`)
    console.error(`Additional information: ${event.message}`)
    if (RECOGNITION_ERRORS.findIndex(e => e == event.error) >= 0) {
      setIsIgnoreRecognitionOnEnd(true)
    }
  }

  const recognitionOnEndHandler = () => {
    if (isIgnoreRecognitionOnEnd) {
      return
    }
    console.log('Speech recognition service finished listening')
    setIsRecording(false)
  }

  const recognitionOnStartHandler = () => {
    setIsRecording(true)
  }

  const recognitionOnResultHandler = (event: SpeechRecognitionEvent) => {
    let interimTranscript = ''

    if (typeof event.results == 'undefined') {
      recognition.onend = null
      recognition.stop()
      return
    }

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        const finalTranscriptionResult: TranscriptionData = {
          type: 'transcription',
          transcription: {
            text: event.results[i][0].transcript,
            language: langFrom
          },
          isFinal: true
        }

        setFinalTranscript(finalTranscriptionResult)
        onTranscriptionChange(finalTranscriptionResult)
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

  const toggleRecognition = (recognition: SpeechRecognition) => {
    if (isRecording) {
      recognition.stop()
    } else {
      recognition.start()
      setIsIgnoreRecognitionOnEnd(false)
    }
  }

  return (
    <>
      <button
        className={clsx('recognizing-toggle', { active: isRecording })}
        onClick={() => toggleRecognition(recognition)}
      >
        {isRecording ? <StopRecording /> : <StartRecording />}
      </button>
    </>
  )
}
