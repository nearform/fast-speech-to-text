import { FC, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

import { FiMic as StartRecording, FiMicOff as StopRecording } from 'react-icons/fi';

import useWebSocket, { ReadyState } from 'react-use-websocket';

import _set from 'lodash.set';

import { LanguageCode } from '@/lib/types/language';
import { OutgoingMessage } from '@/lib/types/message';
import { TranscriptionData } from '@/lib/types/transcription';

import { stringToBuffer } from '@/lib/utils';

import './styles.css';

type RecordProps = {
  chunkDuration?: number;
  langFrom: LanguageCode;
  langTo: LanguageCode;
  onRecordingToggle: () => void;
  onTranscriptionChange: (transcription: TranscriptionData) => void;
  roomId: string;
  user: string;
};

const WS_URL = new URL(import.meta.env['VITE_API_HOST']);
WS_URL.protocol = 'ws';
WS_URL.pathname = '/transcribe';

export const RecordingToggle: FC<RecordProps> = ({
  chunkDuration = 1000,
  langFrom,
  langTo,
  onRecordingToggle,
  onTranscriptionChange,
  roomId,
  user
}) => {
  const [bufferedMessages, setBufferedMessages] = useState<OutgoingMessage[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const recorder = useRef<MediaRecorder>();

  const { readyState, sendMessage, getWebSocket } = useWebSocket(WS_URL.toString(), {
    onOpen: () => {
      console.log('WebSocket connection open');
      if (bufferedMessages.length) {
        console.log(`${bufferedMessages.length} messages buffered, sending now`);
        for (const message of bufferedMessages) {
          sendMessage(message);
        }
      }
    },
    onError: (event: Event) => {
      console.error('Error emitted from WebSocket', event);
    },
    onClose: () => {
      console.log('WebSocket connection closed');
    },
    onMessage: (event: MessageEvent) => {
      const decoder = new TextDecoder();
      const message = JSON.parse(decoder.decode(event.data as ArrayBuffer));
      onTranscriptionChange(message);
    },
    shouldReconnect: () => true,
    reconnectAttempts: 5,
    reconnectInterval: (attemptNo: number) => 1000 * attemptNo,
    onReconnectStop: (attempts) =>
      console.warn(`Giving up re-establishing connection after ${attempts} attempts`)
  });

  useEffect(() => {
    return () => {
      getWebSocket()?.close();
    };
  }, []);
  useEffect(() => {
    if (getWebSocket()) {
      _set(getWebSocket(), 'binaryType', 'arraybuffer');
    }
  }, [getWebSocket()]);

  const toggleRecording = async () => {
    onRecordingToggle();
    const recording = recorder.current?.state === 'recording';

    if ((recorder.current && !recording) || !recorder.current) {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: 48000 },
        video: false
      });
      recorder.current = new MediaRecorder(mediaStream, {
        mimeType: 'audio/webm; codecs=opus'
      });
      recorder.current.ondataavailable = async (event: BlobEvent) => {
        const stateFlag = recorder.current?.state === 'recording' ? 1 : 2;

        // add the languages used, padding to a fixed length so that
        // we can reliably receive & parse them on the back end
        // N.B - if this padding changes or is removed, the back end
        //       will need updating to match
        const langsBuffer = stringToBuffer(`${langFrom.padEnd(10, '*')}:${langTo.padEnd(10, '*')}`);

        // add the room ID & user name so that we can store the
        // message after transcribing & translating
        const roomIdBuffer = stringToBuffer(roomId);
        const roomIdOffset = 1 + langsBuffer.byteLength;

        const userBuffer = stringToBuffer(user.padEnd(25, '*'));
        const userOffset = roomIdOffset + roomIdBuffer.length;

        const recordingBuffer = new Uint8Array(await event.data.arrayBuffer());
        const recordingOffset = userOffset + userBuffer.length;

        const totalMessageSize = recordingOffset + recordingBuffer.length;

        const outgoingMessage = new Uint8Array(totalMessageSize);

        outgoingMessage[0] = stateFlag;
        outgoingMessage.set(langsBuffer, 1);
        outgoingMessage.set(roomIdBuffer, roomIdOffset);
        outgoingMessage.set(userBuffer, userOffset);
        outgoingMessage.set(recordingBuffer, recordingOffset);

        // convert to ArrayBuffer prior to sending
        const binaryMsg: ArrayBuffer =
          typeof outgoingMessage === 'string' ? stringToBuffer(outgoingMessage) : outgoingMessage;

        if (readyState === ReadyState.CONNECTING) {
          if (!bufferedMessages.includes(binaryMsg)) {
            console.debug('WebSocket not yet connected, adding message to buffer to send later');
            setBufferedMessages((prev) => [...prev, binaryMsg]);
          }
        } else if (readyState === ReadyState.OPEN) {
          console.debug('WebSocket connection active, sending message');
          sendMessage(binaryMsg);
        } else {
          console.warn('WebSocket not in a ready state, message will not be sent.');
        }
      };

      recorder.current.onerror = (event: Event) => {
        console.error('Error occured with recording', event);
      };

      recorder.current.start(chunkDuration);
      setIsRecording(true);
    } else if (recorder.current && recording) {
      setIsRecording(false);
      recorder.current.stop();
      recorder.current.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());

      // clear the ref to force re-instantiation if/when user attempts
      // to record again
      recorder.current = undefined;
    }
  };

  return (
    <button className={clsx('recording-toggle', { active: isRecording })} onClick={toggleRecording}>
      {isRecording ? <StopRecording /> : <StartRecording />}
    </button>
  );
};
