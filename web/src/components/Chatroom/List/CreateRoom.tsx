import { ChangeEvent } from 'react'
import { useRecoilState } from 'recoil'

import languagesLookup from '@/lib/data/languages.json'

import { LanguageCode } from '@/lib/types/language'

import { user as userAtom } from '@/state'

const AVAILABLE_COUNTRIES: [string, { name: string; flag: string }][] =
  Object.entries<{
    name: string
    flag: string
  }>(languagesLookup)

export const CreateRoom = () => {
  const [user, setUser] = useRecoilState(userAtom)

  return (
    <div className="chatroom-list-item create">
      <label
        htmlFor="userName"
        className="block text-sm font-normal leading-6 text-gray-900"
      >
        Your name
      </label>
      <div className="relative rounded-md shadow-sm">
        <input
          name="userName"
          type="text"
          id="userName"
          className="block w-full bg-gray-50 rounded-md border-0 py-1 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setUser({ ...user, name: e.target.value })
          }
          value={user.name}
        />
      </div>

      <label
        htmlFor="userLang"
        className="pt-2 block text-sm font-normal leading-6 text-gray-900"
      >
        Your language
      </label>
      <div className="relative rounded-md shadow-sm">
        <select
          name="userLang"
          id="userLang"
          value={user.language}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => {
            setUser({ ...user, language: e.target.value as LanguageCode })
          }}
          className="align-middle bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md block w-full py-1 px-2 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        >
          {AVAILABLE_COUNTRIES.map(([code, { flag, name }]) => (
            <option key={`lang-${code}`} value={code} className="align-middle">
              {flag} {name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
