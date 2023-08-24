import { ChangeEvent, useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';

import axios from 'axios';

import languagesLookup from '@/lib/data/languages.json';

import { LanguageCode } from '@/lib/types/language';

import { user as userAtom, activeRoom as activeRoomAtom } from '@/state';
import { Chatroom } from '@/lib/types/chatroom';

const AVAILABLE_COUNTRIES: [string, { name: string; flag: string }][] = Object.entries<{
  name: string;
  flag: string;
}>(languagesLookup);

export const CreateRoom = () => {
  const [creating, setCreating] = useState<boolean>(false);
  const [roomName, setRoomName] = useState<string>('');

  const [user, setUser] = useRecoilState(userAtom);
  const setActiveRoom = useSetRecoilState(activeRoomAtom);

  const handleCreateRoom = async () => {
    setCreating(true);

    try {
      const { data: room } = await axios.post<Chatroom>(
        `${import.meta.env['VITE_API_HOST']}/room`,
        {
          name: roomName,
          host: user
        }
      );

      setActiveRoom(room);
    } catch (error) {
      console.error('Failed to create room', error);
    }
    setCreating(false);
  };

  return (
    <div className="chatroom-list-item create">
      <div className="user-form">
        <label htmlFor="userName">Your name</label>
        <input
          name="userName"
          type="text"
          id="userName"
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setUser({ ...user, name: e.target.value })
          }
          value={user.name}
        />
        <label htmlFor="userLang">Your language</label>
        <select
          name="userLang"
          id="userLang"
          value={user.language}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => {
            setUser({ ...user, language: e.target.value as LanguageCode });
          }}
        >
          {AVAILABLE_COUNTRIES.map(([code, { flag, name }]) => (
            <option key={`lang-${code}`} value={code}>
              {name} {flag}
            </option>
          ))}
        </select>
      </div>
      {user.name && user.language ? (
        <>
          <input
            type="text"
            className="chatroom-create-input"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setRoomName(e.target.value);
            }}
            value={roomName}
          />
          <button className="chatroom-create-submit" onClick={handleCreateRoom} disabled={creating}>
            Create
          </button>
        </>
      ) : (
        <p>Please provide your name & spoken language to create or join a chatroom</p>
      )}
    </div>
  );
};
