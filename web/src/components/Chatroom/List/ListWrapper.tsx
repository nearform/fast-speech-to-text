import { ChangeEvent, FC, useState } from 'react'
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

  const [creating, setCreating] = useState<boolean>(false)
  const [roomName, setRoomName] = useState<string>('')

  const handleJoin = async (room: Chatroom) => {
    try {
      await axios.put(`api/room/${room.id}/join`, user)
      setActiveRoom(room)
    } catch (error) {
      console.error('Failed to join room', error)
    }
  }

  const handleCreateRoom = async () => {
    setCreating(true)

    try {
      const { data: room } = await axios.post<Chatroom>(`api/room`, {
        name: roomName,
        host: user
      })

      setActiveRoom(room)
    } catch (error) {
      console.error('Failed to create room', error)
    }
    setCreating(false)
  }

  return (
    <div className="mx-auto flex flex-col justify-start h-full flex-nowrap">
      {loading && <p>Fetching chatrooms, please wait...</p>}
      {!loading && (
        <>
          <CreateRoom />
          <div className="mt-4 bg-slate-100 border-1 border-gray-400 rounded-md flex flex-col gap-4 p-4">
            {Object.values(user).every(Boolean) &&
              chatrooms.map(room => (
                <ListItem
                  key={`room-${room.id}`}
                  room={room}
                  onClick={handleJoin}
                />
              ))}
            {!chatrooms.length && (
              <p>No chatrooms found. Why not create one?</p>
            )}
            <div className="flex-none h-14">
              <div className="w-full h-1 border-1 border-shadow"></div>
              <div className="flex flex-col">
                <label
                  htmlFor="createRoom"
                  className="block text-sm font-normal leading-6 text-gray-900"
                >
                  Conversation name
                </label>
                <input
                  name="createRoom"
                  type="text"
                  id="createRoom"
                  className="block w-full bg-gray-50 rounded-md border-0 py-1 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setRoomName(e.target.value)
                  }}
                  value={roomName}
                />
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded w-full mx-auto"
                  onClick={handleCreateRoom}
                  disabled={creating}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      {error && <p>{error}</p>}
    </div>
  )
}
