import { FC, useEffect, useState } from "react";
import clsx from "clsx";

import { useAsync, useMount } from "react-use";
import { AsyncState } from "react-use/lib/useAsyncFn";

import { LanguageCode } from "@/lib/types/language";
import { OutgoingMessage } from "@/lib/types/message";
import { RecorderState, TranscriptionData } from "@/lib/types/transcription";

import { stringToBuffer } from "@/lib/utils";

import "./styles.css";

type RecordProps = {
  chunkDuration: number;
  isRecording: boolean;
  langFrom: LanguageCode;
  langTo: LanguageCode;
  onRecordingStateChange: (state: RecorderState) => void;
  onTranscriptionChange: (transcription: TranscriptionData) => void;
};

const WS_URL = new URL(import.meta.env["VITE_API_HOST"]);
WS_URL.protocol = "ws";
WS_URL.pathname = "/transcribe";
let wsInstance: WebSocket;

export const RecordingToggle: FC<RecordProps> = ({
  chunkDuration,
  isRecording,
  langFrom,
  langTo,
  onRecordingStateChange,
  onTranscriptionChange,
}) => {
  const [bufferedMessages, setBufferedMessages] = useState<OutgoingMessage[]>(
    []
  );
  const [outgoingMessage, setOutgoingMessage] = useState<OutgoingMessage>();

  const recorder: AsyncState<MediaRecorder> = useAsync(async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: { sampleRate: 48000 },
      video: false,
    });

    const rec = new MediaRecorder(mediaStream);

    rec.ondataavailable = async (event: BlobEvent) => {
      const outgoingMessage = new Uint8Array(event.data.size + 22);

      const stateFlag = rec.state === "recording" ? 1 : 2;
      outgoingMessage[0] = stateFlag;

      // add the languages used, padding to a fixed length so that
      // we can reliably receive & parse them on the back end
      // N.B - if this padding changes or is removed, the back end
      //       will need updating to match
      const langsBuffer = stringToBuffer(
        `${langFrom.padEnd(10, "*")}:${langTo.padEnd(10, "*")}`
      );

      outgoingMessage.set(langsBuffer, 1);

      const recordingBuffer = await event.data.arrayBuffer();
      outgoingMessage.set(
        new Uint8Array(recordingBuffer),
        1 + langsBuffer.length
      );
      setOutgoingMessage(outgoingMessage);
    };

    rec.onerror = (event: Event) => {
      console.error("Error occured with recording", event);
    };

    return rec;
  }, [langFrom, langTo]);

  useMount(() => {
    console.log("Recorder >> onMount");
    wsInstance = new WebSocket(WS_URL);
    wsInstance.binaryType = "arraybuffer";

    wsInstance.addEventListener("open", () => {
      console.log("WebSocket connection open");
      if (bufferedMessages.length) {
        console.log(
          `${bufferedMessages.length} messages buffered, sending now`
        );
        for (const message of bufferedMessages) {
          wsInstance.send(message);
        }
      }
    });
    wsInstance.addEventListener("error", (event: Event) => {
      console.error("Error emitted from WebSocket", event);
    });
    wsInstance.addEventListener("close", () => {
      console.info("WebSocket connection closed");
    });
    wsInstance.addEventListener("message", (event: MessageEvent) => {
      const decoder = new TextDecoder();
      const message = JSON.parse(decoder.decode(event.data as ArrayBuffer));
      console.log(message);
      onTranscriptionChange(message);
    });
  });

  useEffect(() => {
    console.log("Recorder state changed", recorder.value?.state || "loading");

    onRecordingStateChange(recorder.value?.state || "loading");
  }, [recorder.value?.state]);

  // send message(s) to webSocket
  useEffect(() => {
    if (!outgoingMessage) {
      // no message to send, just bail out
      return;
    }
    if (!wsInstance?.readyState) {
      throw new Error(
        "Can't send message - WebSocket instance not initialised"
      );
    }

    // convert to ArrayBuffer prior to sending
    const binaryMsg: ArrayBuffer =
      typeof outgoingMessage === "string"
        ? stringToBuffer(outgoingMessage)
        : outgoingMessage;

    switch (wsInstance?.readyState) {
      case WebSocket.CONNECTING:
        // wsInstance not connected yet, buffer the message
        if (!bufferedMessages.includes(binaryMsg)) {
          setBufferedMessages((prev) => [...prev, binaryMsg]);
        }
        break;
      case WebSocket.OPEN:
        // send the message
        wsInstance.send(binaryMsg);
        break;
      default:
        console.warn(
          "Attempting to send message while WebSocket instance not in a ready state, message will not be sent."
        );
        break;
    }
  }, [outgoingMessage]);

  const toggleRecording = () => {
    if (recorder.loading || !recorder.value) {
      throw new Error(
        "Can't toggle recording, MediaRecorder instance not initialised"
      );
    }
    if (isRecording) {
      recorder.value.stop();
      recorder.value.stream
        .getTracks()
        .forEach((track: MediaStreamTrack) => track.stop());
    } else {
      recorder.value?.start(chunkDuration);
    }
  };

  return (
    <button
      className={clsx("recording-toggle", { active: isRecording })}
      disabled={recorder.loading}
      onClick={toggleRecording}
    >
      <div className="icon" />
    </button>
  );
};
