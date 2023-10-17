import { useAuth } from '@/contexts/auth-context'
import React from 'react'
import { Header } from '../Header/Header'
import { Login } from './Login'

export const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const { currentUser } = useAuth()

  return currentUser ? (
    children
  ) : (
    <div
      id="primary-container"
      className="h-screen relative container flex flex-col max-w-[1370px] p-[1.25rem]"
    >
      <Header />
      <div className="container py-8 flex flex-1 overflow-y-auto justify-start h-full">
        <div className="flex flex-col items-center self-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">
            Please sign in to continue
          </h1>
          <Login />
        </div>
      </div>
    </div>
  )
}
