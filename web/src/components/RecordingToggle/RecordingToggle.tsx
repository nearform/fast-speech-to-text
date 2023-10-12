import { FC, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { LanguageCode } from '@/lib/types/language'
import { TranscriptionData } from '@/lib/types/transcription'

import { IconMicOutline } from '@/icons/icon-mic-outline'
import clsx from 'clsx'
import { Switch } from '../Switch/switch'
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
  const [shouldRecord, setShouldRecord] = useState<boolean>(true)
  const [isRecognitionRunning, setIsRecognitionRunning] =
    useState<boolean>(false)

  useEffect(() => {
    if (finalTranscript) {
      onRecognitionEnd(finalTranscript)
    }

    onTranscriptionChange(null)
  }, [finalTranscript])

  useEffect(() => {
    if (!shouldRecord && isRecognitionRunning) {
      recognition.stop()
    } else if (shouldRecord && !isRecognitionRunning) {
      try {
        recognition.start()
      } catch (error) {
        console.warn(error)
      }
    }
  }, [shouldRecord, isRecognitionRunning])

  const recognitionOnErrorHandler = (event: SpeechRecognitionErrorEvent) => {
    console.error(`Speech recognition error detected: ${event.error}`)
    console.error(`Additional information: ${event.message}`)
    if (RECOGNITION_ERRORS.findIndex(e => e == event.error) >= 0) {
      recognition.stop()
    }
  }

  const recognitionOnEndHandler = (event: Event) => {
    if (shouldRecord) {
      console.log('on end handler triggered', event)
      console.log('Restarting speech recognition service')
      try {
        recognition.start()
      } catch (error) {
        console.warn(error)
      }
      setFinalTranscript(null)
      return
    }
    console.log('Speech recognition service finished listening')
    setFinalTranscript(null)
    setIsRecognitionRunning(false)
  }

  const recognitionOnStartHandler = () => {
    setIsRecognitionRunning(true)
    setFinalTranscript(null)
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
        const interimTranscriptData: TranscriptionData = {
          type: 'transcription',
          transcription: { text: interimTranscript, language: langFrom },
          isFinal: false
        }
        onTranscriptionChange(interimTranscriptData)
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

  return (
    <>
      <div className="flex flex-wrap justify-end items-center">
        <Switch
          defaultChecked={shouldRecord}
          checked={shouldRecord}
          onCheckedChange={setShouldRecord}
          name="toggle-recording"
          id="toggle-recording"
        />
        <label
          className="block text-sm font-normal leading-6 text-gray-900 mx-1"
          htmlFor="toggle-recording"
        >
          Voice recording
        </label>
        <IconMicOutline />
        <div
          className={clsx('recognition-on rounded-full mx-1 invisible', {
            active: isRecognitionRunning
          })}
        ></div>
      </div>
    </>
  )
}
