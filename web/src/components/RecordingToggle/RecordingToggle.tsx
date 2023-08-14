import { FC, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

import { LanguageCode } from '@/lib/types/language';
import { OutgoingMessage } from '@/lib/types/message';
import { TranscriptionData } from '@/lib/types/transcription';

import { stringToBuffer } from '@/lib/utils';

import './styles.css';

type RecordProps = {
	chunkDuration: number;
	langFrom: LanguageCode;
	langTo: LanguageCode;
	onTranscriptionChange: (transcription: TranscriptionData) => void;
};

const WS_URL = new URL(import.meta.env['VITE_API_HOST']);
WS_URL.protocol = 'ws';
WS_URL.pathname = '/transcribe';
// let webSocket.current: WebSocket;

export const RecordingToggle: FC<RecordProps> = ({
	chunkDuration,
	langFrom,
	langTo,
	onTranscriptionChange
}) => {
	const [bufferedMessages, setBufferedMessages] = useState<OutgoingMessage[]>([]);
	const [outgoingMessage, setOutgoingMessage] = useState<OutgoingMessage>();
	const [isRecording, setIsRecording] = useState<boolean>(false);

	const recorder = useRef<MediaRecorder>();
	const webSocket = useRef<WebSocket>();

	useEffect(() => {
		webSocket.current = new WebSocket(WS_URL);
		webSocket.current.binaryType = 'arraybuffer';

		webSocket.current?.addEventListener('open', () => {
			console.log('WebSocket connection open');
			if (bufferedMessages.length) {
				console.log(`${bufferedMessages.length} messages buffered, sending now`);
				for (const message of bufferedMessages) {
					webSocket.current?.send(message);
				}
			}
		});
		webSocket.current.addEventListener('error', (event: Event) => {
			console.error('Error emitted from WebSocket', event);
		});
		webSocket.current.addEventListener('close', () => {
			console.info('WebSocket connection closed');
		});
		webSocket.current.addEventListener('message', (event: MessageEvent) => {
			const decoder = new TextDecoder();
			const message = JSON.parse(decoder.decode(event.data as ArrayBuffer));
			console.log(message);
			onTranscriptionChange(message);
		});

		return () => webSocket.current?.close();
	}, []);

	// send message(s) to webSocket
	useEffect(() => {
		if (!outgoingMessage) {
			// no message to send, just bail out
			return;
		}
		if (!webSocket.current?.readyState) {
			throw new Error("Can't send message - WebSocket instance not initialised");
		}

		// convert to ArrayBuffer prior to sending
		const binaryMsg: ArrayBuffer =
			typeof outgoingMessage === 'string' ? stringToBuffer(outgoingMessage) : outgoingMessage;

		switch (webSocket.current?.readyState) {
			case WebSocket.CONNECTING:
				// webSocket.current not connected yet, buffer the message
				if (!bufferedMessages.includes(binaryMsg)) {
					setBufferedMessages((prev) => [...prev, binaryMsg]);
				}
				break;
			case WebSocket.OPEN:
				// send the message
				webSocket.current.send(binaryMsg);
				break;
			default:
				console.warn(
					'Attempting to send message while WebSocket instance not in a ready state, message will not be sent.'
				);
				break;
		}
	}, [outgoingMessage]);

	const toggleRecording = async () => {
		const isRecording = recorder.current?.state === 'recording';

		if ((recorder.current && !isRecording) || !recorder.current) {
			const mediaStream = await navigator.mediaDevices.getUserMedia({
				audio: { sampleRate: 48000 },
				video: false
			});
			recorder.current = new MediaRecorder(mediaStream, {
				mimeType: 'audio/webm; codecs=opus'
			});
			recorder.current.ondataavailable = async (event: BlobEvent) => {
				const outgoingMessage = new Uint8Array(event.data.size + 22);

				const stateFlag = recorder.current?.state === 'recording' ? 1 : 2;
				outgoingMessage[0] = stateFlag;

				// add the languages used, padding to a fixed length so that
				// we can reliably receive & parse them on the back end
				// N.B - if this padding changes or is removed, the back end
				//       will need updating to match
				const langsBuffer = stringToBuffer(`${langFrom.padEnd(10, '*')}:${langTo.padEnd(10, '*')}`);

				outgoingMessage.set(langsBuffer, 1);

				const recordingBuffer = await event.data.arrayBuffer();
				outgoingMessage.set(new Uint8Array(recordingBuffer), 1 + langsBuffer.length);
				setOutgoingMessage(outgoingMessage.buffer);
			};

			recorder.current.onerror = (event: Event) => {
				console.error('Error occured with recording', event);
			};

			recorder.current.start(chunkDuration);
			setIsRecording(true);
		} else if (recorder.current && isRecording) {
			setIsRecording(false);
			recorder.current.stop();
			recorder.current.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());

			// clear the state to force re-instantiation if/when user attempts
			// to record again
			recorder.current = undefined;
		}
	};

	return (
		<button className={clsx('recording-toggle', { active: isRecording })} onClick={toggleRecording}>
			<div className="icon" />
		</button>
	);
};
