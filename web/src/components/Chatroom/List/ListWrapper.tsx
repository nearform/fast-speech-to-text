import { FC } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import axios from 'axios';

import { Database } from 'firebase/database';

import { useChatrooms } from '@/hooks/useChatrooms';

import { Chatroom } from '@/lib/types/chatroom';

import { user as userAtom, activeRoom as activeRoomAtom } from '@/state';

import { CreateRoom } from './CreateRoom';
import { ListItem } from './ListItem';

import './styles.css';

type ChatroomListProps = {
  rtdbRef: Database;
};

export const ListWrapper: FC<ChatroomListProps> = ({ rtdbRef }) => {
  const { chatrooms, loading } = useChatrooms({ rtdbRef });

  const setActiveRoom = useSetRecoilState(activeRoomAtom);
  const user = useRecoilValue(userAtom);

  const handleJoin = async (room: Chatroom) => {
    try {
      await axios.put(`${import.meta.env['VITE_API_HOST']}/room/${room.id}/join`, user);
      setActiveRoom(room);
    } catch (error) {
      console.error('Failed to join room', error);
    }
  };

  return (
    <div className="chatroom-list-container">
      {loading && <p>Fetching chatrooms, please wait...</p>}
      {!loading && !chatrooms.length && <p>No chatrooms found. Why not create one?</p>}
      {!loading && (
        <>
          <CreateRoom />
          {chatrooms.map((room) => (
            <ListItem key={`room-${room.id}`} room={room} onClick={handleJoin} />
          ))}
        </>
      )}
    </div>
  );
};
