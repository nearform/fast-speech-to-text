import { FC } from 'react'

import { FiChevronRight as Join } from 'react-icons/fi'

import { Chatroom } from '@/lib/types/chatroom'

type ListItemProps = {
  room: Chatroom
  onClick: (room: Chatroom) => void
}

export const ListItem: FC<ListItemProps> = ({ room, onClick }) => {
  return (
    <div
      onClick={() => onClick(room)}
      className="bg-white rounded-md p-2 flex flex-wrap grow h-14 justify-between hover:bg-gray-100 cursor-pointer"
    >
      <div className="flex min-w-0 gap-x-4">
        <div className="min-w-0 flex-auto">
          <p className="text-md font-normal leading-6 text-gray-900">
            {room.name || room.id}
          </p>
          <p className="truncate text-xs leading-5 text-gray-500">
            Hosted by {room.host.name}
          </p>
        </div>
      </div>
      <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end self-center">
        {/* {room.host && !room.guest && ( */}
        <div className="chatroom-cta">
          <Join />
        </div>
        {/* )} */}
      </div>
    </div>
  )
}
