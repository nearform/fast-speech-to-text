import { FC } from 'react';

export const Summary: FC = () => (
  <>
    <h1>Google Real-Time Speech-to-Text-to-Speech converter</h1>
    <p>
      Proof of Concept demonstrating using websockets to send chunks of audio for transcription to
      provide a real-time speech-to-text(-to-speech) experience.
    </p>
    <p>
      Click the button below and start speaking - a live transcription will be rendered as it comes
      in below, and click again to stop recording.
    </p>
  </>
);

Summary.displayName = 'Summary';
