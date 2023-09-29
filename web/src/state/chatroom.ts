import { atom } from 'recoil';

import { Chatroom } from '@/lib/types/chatroom';

export const activeRoom = atom<Chatroom>({
  key: 'activeRoomAtom',
  default: null
});
