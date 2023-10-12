import { ChangeEvent } from 'react'
import { useRecoilState } from 'recoil'

import languagesLookup from '@/lib/data/languages.json'

import { user as userAtom } from '@/state'
import Select from 'react-select'
import { LanguageCode } from '@/lib/types/language'

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
      <div className="relative rounded-lg shadow-sm">
        <input
          name="userName"
          type="text"
          id="userName"
          className="block w-full bg-gray-50 rounded-lg border-0 py-1.5 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
      <div className="relative rounded-lg shadow-sm">
        <Select
          classNames={{
            control: () => '!bg-gray-50 !rounded-lg'
          }}
          options={AVAILABLE_COUNTRIES.map(([code, { flag, name }]) => ({
            value: code as LanguageCode,
            label: ` ${flag} ${name}`
          }))}
          onChange={option => setUser({ ...user, language: option.value })}
        />
      </div>
    </div>
  )
}
