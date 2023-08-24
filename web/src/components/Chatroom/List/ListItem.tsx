import { FC } from 'react';

import { FiChevronRight as Join } from 'react-icons/fi';

import { Chatroom } from '@/lib/types/chatroom';

type ListItemProps = {
  room: Chatroom;
  onClick: (room: Chatroom) => void;
};

export const ListItem: FC<ListItemProps> = ({ room, onClick }) => {
  return (
    <div className="chatroom-list-item" onClick={() => onClick(room)}>
      <div className="chatroom-info">
        <h1>{room.name || room.id}</h1>
        <p>Hosted by {room.host.name}</p>
      </div>
      {room.host && !room.guest && (
        <div className="chatroom-cta">
          <Join />
        </div>
      )}
    </div>
  );
};
