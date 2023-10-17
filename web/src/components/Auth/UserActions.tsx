import { useAuth } from '@/contexts/auth-context'

export const UserActions = () => {
  const { logOut } = useAuth()
  return (
    <button
      onClick={logOut}
      className="text-sm font-medium py-2 px-4 rounded-lg w-full mx-auto"
    >
      Log out
    </button>
  )
}
