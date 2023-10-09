import { FC } from 'react'
import { useRecoilValue, useSetRecoilState } from 'recoil'

import axios from 'axios'

import { Database } from 'firebase/database'

import { useChatrooms } from '@/hooks/useChatrooms'

import { Chatroom } from '@/lib/types/chatroom'

import { activeRoom as activeRoomAtom, user as userAtom } from '@/state'

import { CreateRoom } from './CreateRoom'
import { ListItem } from './ListItem'

import './styles.css'

type ChatroomListProps = {
  rtdbRef: Database
}

export const ListWrapper: FC<ChatroomListProps> = ({ rtdbRef }) => {
  const { chatrooms, error, loading } = useChatrooms({ rtdbRef })

  const setActiveRoom = useSetRecoilState(activeRoomAtom)
  const user = useRecoilValue(userAtom)

  const handleJoin = async (room: Chatroom) => {
    try {
      await axios.put(`api/room/${room.id}/join`, user)
      setActiveRoom(room)
    } catch (error) {
      console.error('Failed to join room', error)
    }
  }

  return (
    <div className="chatroom-list-container mx-auto flex justify-start h-full flex-nowrap">
      {loading && <p>Fetching chatrooms, please wait...</p>}
      {!loading && (
        <>
          <CreateRoom />
          {Object.values(user).every(Boolean) &&
            chatrooms.map(room => (
              <ListItem
                key={`room-${room.id}`}
                room={room}
                onClick={handleJoin}
              />
            ))}
        </>
      )}
      {!loading && !chatrooms.length && (
        <p>No chatrooms found. Why not create one?</p>
      )}
      {error && <p>{error}</p>}
    </div>
  )
}
