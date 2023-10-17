import { useAuth } from '@/contexts/auth-context'

export const Login = () => {
  const { signInWithGoogle, authLoading } = useAuth()
  return (
    <button
      disabled={authLoading}
      onClick={signInWithGoogle}
      className="bg-primary text-white text-sm font-medium py-2 px-4 rounded-lg w-full mx-auto"
    >
      Sign in with Google
    </button>
  )
}
