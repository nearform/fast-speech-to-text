import { FC, useEffect, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'

import axios from 'axios'

import { Database } from 'firebase/database'

import { BiArrowBack } from 'react-icons/bi'
import useWebSocket, { ReadyState } from 'react-use-websocket'

import _set from 'lodash.set'

import { RecordingToggle } from '@/components/RecordingToggle'

import { useChatroom } from '@/hooks/useChatroom'

import { OutgoingMessage } from '@/lib/types/message'
import { TranscriptionData } from '@/lib/types/transcription'
import {
  convertTranscriptionMessageToBinaryMessage,
  isProtocolSecure
} from '@/lib/utils'

import { activeRoom, user, userIsHost } from '@/state'

import { ChatEvents } from './ConversationEvents'
import { ListWrapper } from './List'

import './styles.css'

type ChatWrapperProps = {
  rtdbRef: Database
}

const WS_URL = `${
  isProtocolSecure(window.location.protocol) ? 'wss' : 'ws'
}://${
  import.meta.env.MODE === 'production'
    ? window.location.hostname
    : '0.0.0.0:8080'
}/translate`

export const ChatWrapper: FC<ChatWrapperProps> = ({ rtdbRef }) => {
  const [bufferedMessages, setBufferedMessages] = useState<OutgoingMessage[]>(
    []
  )
  const [transcribedText, setTranscribedText] = useState<string>('')

  const { name: userName } = useRecoilValue(user)
  const [room, setRoom] = useRecoilState(activeRoom)
  const isHost = useRecoilValue(userIsHost)

  const [{ chatroom, error, loading }] = useChatroom({
    rtdbRef,
    roomId: room?.id
  })

  const { readyState, sendMessage, getWebSocket } = useWebSocket(WS_URL, {
    onOpen: () => {
      console.log('WebSocket connection open')
      if (bufferedMessages.length) {
        console.log(`${bufferedMessages.length} messages buffered, sending now`)
        for (const message of bufferedMessages) {
          sendMessage(message)
        }
      }
    },
    onError: (event: Event) => {
      console.error('Error emitted from WebSocket', event)
    },
    onClose: () => {
      console.log('WebSocket connection closed')
    },
    onMessage: (event: MessageEvent) => {
      const decoder = new TextDecoder()
      const message = JSON.parse(decoder.decode(event.data as ArrayBuffer))
      handleTranscriptionOutput(message)
    },
    shouldReconnect: () => true,
    reconnectAttempts: 5,
    reconnectInterval: (attemptNo: number) => 1000 * attemptNo,
    onReconnectStop: attempts =>
      console.warn(
        `Giving up re-establishing connection after ${attempts} attempts`
      )
  })

  useEffect(() => {
    if (error || !chatroom) {
      setRoom(null)
    }
  }, [chatroom, error])

  useEffect(() => {
    return () => {
      getWebSocket()?.close()
    }
  }, [])

  useEffect(() => {
    if (getWebSocket()) {
      _set(getWebSocket(), 'binaryType', 'arraybuffer')
    }
  }, [getWebSocket()])

  const handleLeave = async () => {
    try {
      await axios.put(`api/room/${room?.id}/leave`, {
        role: isHost ? 'host' : 'guest',
        name: userName
      })
      setRoom(null)
    } catch (error) {
      console.error('Failed to leave room', error)
    }
  }

  const handleTranscriptionOutput = (
    transcription: TranscriptionData
  ): void => {
    if (!transcription) {
      setTranscribedText('')
    } else {
      const {
        transcription: { text }
      } = transcription

      setTranscribedText(text)
    }
  }

  const handleRecordingToggle = (
    transcription: TranscriptionData,
    isRecording: boolean
  ): void => {
    if (!isRecording && transcription) {
      const {
        transcription: { text }
      } = transcription

      const langFrom = isHost
        ? chatroom?.host.language
        : chatroom?.guest?.language

      const langTo =
        (isHost ? chatroom?.guest?.language : chatroom?.host?.language) ||
        chatroom?.host.language

      const binaryMsg = convertTranscriptionMessageToBinaryMessage(
        langFrom,
        langTo,
        room?.id,
        userName,
        text
      )

      if (readyState === ReadyState.CONNECTING) {
        if (!bufferedMessages.includes(binaryMsg)) {
          console.debug(
            'WebSocket not yet connected, adding message to buffer to send later'
          )
          setBufferedMessages(prev => [...prev, binaryMsg])
        }
      } else if (readyState === ReadyState.OPEN) {
        console.debug('WebSocket connection active, sending message')
        sendMessage(binaryMsg)
      } else {
        console.warn(
          'WebSocket not in a ready state, message will not be sent.'
        )
      }
    }
  }

  if (loading) {
    return <p>Loading, please wait...</p>
  }

  return room ? (
    <div className="chat-container w-full h-full flex flex-col">
      <div className="chat-header gap-6 flex flex-auto grow-0 shrink-1 pb-2">
        <button
          className="leave-chat text-medium border-none bg-transparent font-bold"
          onClick={handleLeave}
        >
          <BiArrowBack className="inline-block align-middle mt-[-3px]" />
          Back
        </button>
        <h2 className="chat-name text-medium font-normal">{chatroom?.name}</h2>
      </div>
      <div className="border h-full rounded-lg flex-1 flex flex-col">
        <ChatEvents rtdbRef={rtdbRef} />
        <div className="chat-footer flex gap-3">
          <textarea
            rows={3}
            className="transcribed-text w-full bg-transparent border rounded-lg p-2 "
            disabled
            placeholder="Hit record & start talking to see a live transcription here.  Stop recording to send your message"
            value={transcribedText}
          />

          <RecordingToggle
            langFrom={
              isHost ? chatroom?.host.language : chatroom?.guest?.language
            }
            onTranscriptionChange={handleTranscriptionOutput}
            onRecordingToggle={handleRecordingToggle}
          />
        </div>
      </div>
    </div>
  ) : (
    <ListWrapper rtdbRef={rtdbRef} />
  )
}

ChatWrapper.displayName = 'ChatWrapper'
