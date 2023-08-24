import { FC, useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import axios from 'axios';

import { Database } from 'firebase/database';

import { FiLogOut as Leave } from 'react-icons/fi';

import { RecordingToggle } from '@/components/RecordingToggle';

import { useChatroom } from '@/hooks/useChatroom';

import { TranscriptionData } from '@/lib/types/transcription';

import { activeRoom, user, userIsHost } from '@/state';

import { ChatEvents } from './ConversationEvents';
import { ListWrapper } from './List';

import './styles.css';

type ChatWrapperProps = {
  rtdbRef: Database;
};

export const ChatWrapper: FC<ChatWrapperProps> = ({ rtdbRef }) => {
  const [recording, setRecording] = useState<boolean>(false);
  const [transcribedText, setTranscribedText] = useState<string>('');

  const { name: userName } = useRecoilValue(user);
  const [room, setRoom] = useRecoilState(activeRoom);
  const isHost = useRecoilValue(userIsHost);

  const [{ chatroom, loading }] = useChatroom({ rtdbRef, roomId: room?.id });

  useEffect(() => {
    if (!chatroom) {
      setRoom(null);
    }
  }, [chatroom]);

  const handleLeave = async () => {
    try {
      await axios.put(`${import.meta.env['VITE_API_HOST']}/room/${room.id}/leave`, {
        role: isHost ? 'host' : 'guest',
        name: userName
      });
      setRoom(null);
    } catch (error) {
      console.error('Failed to leave room', error);
    }
  };

  const handleTranscriptionOutput = (transcription: TranscriptionData): void => {
    const {
      transcription: { original }
    } = transcription;

    setTranscribedText(original.text);
  };

  if (loading) {
    return <p>Loading, please wait...</p>;
  }

  return room ? (
    <div className="chat-container">
      <div className="chat-header">
        <h2 className="chat-name">{chatroom?.name}</h2>
        <button className="leave-chat" onClick={handleLeave}>
          <Leave />
        </button>
      </div>
      <ChatEvents rtdbRef={rtdbRef} />
      <div className="chat-footer">
        <input
          type="text"
          className="transcribed-text"
          disabled
          placeholder="Hit record & start talking to see a live transcription here.  Stop recording to send your message"
          value={transcribedText}
        />

        <RecordingToggle
          langFrom={isHost ? chatroom?.host.language : chatroom?.guest?.language}
          langTo={
            (isHost ? chatroom?.guest?.language : chatroom?.host.language) ||
            chatroom?.host.language
          } // chatroom.guest gets set when guest joins, so fallback to host if no guest
          onTranscriptionChange={handleTranscriptionOutput}
          onRecordingToggle={() => {
            if (recording) {
              setTranscribedText('');
            }
            setRecording(!recording);
          }}
          roomId={room?.id}
          user={userName}
        />
      </div>
    </div>
  ) : (
    <ListWrapper rtdbRef={rtdbRef} />
  );
};

ChatWrapper.displayName = 'ChatWrapper';
