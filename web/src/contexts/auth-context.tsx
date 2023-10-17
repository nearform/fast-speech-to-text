import { User, signInWithPopup, signOut } from 'firebase/auth'
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import { auth, googleProvider } from '../firebase'

interface AuthContextType {
  currentUser: User | undefined
  authLoading: boolean
  signInWithGoogle: () => void
  logOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [currentUser, setCurrentUser] = useState<User | undefined>()
  const [authLoading, setAuthLoading] = useState<boolean>(true)

  const signInWithGoogle = async () => {
    try {
      setAuthLoading(true)
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      console.error(err)
    } finally {
      setAuthLoading(false)
    }
  }
  const logOut = async () => {
    try {
      await signOut(auth)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    auth.onAuthStateChanged(user => {
      setAuthLoading(false)
      if (user) {
        setCurrentUser(user)
      } else {
        setCurrentUser(undefined)
      }
    })
  }, [])

  const value = useMemo(
    () => ({
      currentUser,
      authLoading,
      signInWithGoogle,
      logOut
    }),
    [currentUser, authLoading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
