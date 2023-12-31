import { useAuth } from '@/contexts/auth-context'
import { GitHubIcon } from '../../icons/github-icon'
import { UserActions } from '../Auth/UserActions'
import { Branding } from './branding'

export function Header() {
  const { currentUser } = useAuth()
  return (
    <div className="flex flex-auto flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16 w-full mb-3">
      <Branding />
      <div className="ml-auto flex flex-1 space-x-2 sm:justify-end items-center">
        <div className="mr-2 flex items-center">
          <a
            href="https://github.com/nearform/fast-speech-to-text"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GitHubIcon />
          </a>
          {currentUser && <UserActions />}
        </div>
      </div>
    </div>
  )
}
