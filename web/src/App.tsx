import { useEffect, useState } from "react";

import { ErrorBoundary } from "react-error-boundary";

import {
  ChunkSize,
  LanguageSelectors,
  RecordingToggle,
  Summary,
  TranscriptionOutput,
} from "@/components";

import { LanguageCode } from "@/lib/types/language";

import { readBack, sentenceDiff } from "@/lib/utils";

import "./App.css";
import { TranscriptionData } from "./lib/types/transcription";

const App = () => {
  const [chunkDuration, setChunkDuration] = useState<number>(500);
  const [recording, setRecording] = useState<boolean>(false);

  const [inputLang, setInputLang] = useState<LanguageCode>("en");
  const [outputLang, setOutputLang] = useState<LanguageCode>(inputLang);

  const [lastSpokenWords, setLastSpokenWords] = useState<string>("");

  const [transcribed, setTranscribed] = useState<string>("");
  const [translated, setTranslated] = useState<string>("");

  const handleTranscriptionOutput = (
    transcription: TranscriptionData
  ): void => {
    console.log("transcription result obtained", transcription);

    const {
      transcription: { original, translated },
    } = transcription;

    setTranscribed(original.text);
    setTranslated(translated?.text || "");
  };

  useEffect(() => {
    setTranscribed("");
    setTranslated("");
  }, [inputLang, outputLang]);

  useEffect(() => {
    const sentence = translated || transcribed;
    const wordsToSay = sentenceDiff(lastSpokenWords, sentence);
    readBack(wordsToSay, outputLang);
    setLastSpokenWords(sentence);
  }, [transcribed, translated, outputLang]);

  return (
    <div className="container">
      <Summary />
      <ChunkSize chunkSize={chunkDuration} onChange={setChunkDuration} />
      <LanguageSelectors
        inputLang={inputLang}
        outputLang={outputLang}
        onInputChange={setInputLang}
        onOutputChange={setOutputLang}
      />

      <ErrorBoundary fallback={<p>error in RecordingToggle</p>}>
        <RecordingToggle
          chunkDuration={chunkDuration}
          isRecording={recording}
          langFrom={inputLang}
          langTo={outputLang}
          onRecordingStateChange={(state) =>
            setRecording(state === "recording")
          }
          onTranscriptionChange={handleTranscriptionOutput}
        />
      </ErrorBoundary>

      <TranscriptionOutput
        langFrom={inputLang}
        langTo={outputLang}
        transcribed={transcribed}
        translated={translated}
      />
    </div>
  );
};

App.displayName = "App";

export default App;
