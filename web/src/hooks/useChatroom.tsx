import { useEffect, useState } from 'react';

import { Database, onValue, ref } from 'firebase/database';

import { Chatroom } from '@/lib/types/chatroom';

type UseChatroomArgs = {
  rtdbRef: Database;
  roomId: string;
};
type UseChatroomData = {
  chatroom?: Chatroom;
  error?: string;
  loading: boolean;
};

export const useChatroom = ({
  rtdbRef,
  roomId
}: UseChatroomArgs): [UseChatroomData, (updates: Chatroom) => void] => {
  const [chatroom, setChatroom] = useState<Chatroom>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onValue(
      ref(rtdbRef, `rooms/${roomId}`),
      (data) => {
        setLoading(false);
        setChatroom(data.val() as Chatroom);
      },
      (error) => {
        setLoading(false);
        setError(error.message)
      }
    );

    return unsubscribe;
  }, [rtdbRef, roomId]);

  return [
    {
      chatroom,
      error,
      loading
    },
    () => {}
  ];
};
