import { Database, getDatabase } from 'firebase/database'

import { RecoilRoot } from 'recoil'

import { ChatWrapper as Chat, Header } from '@/components'

import './App.css'

import { Toaster } from 'react-hot-toast'
import { AuthWrapper } from './components/Auth/AuthWrapper'

const db: Database = getDatabase()

const App = () => {
  return (
    <AuthWrapper>
      <RecoilRoot>
        <div
          id="primary-container"
          className="h-screen relative container flex flex-col max-w-[1370px] p-[1.25rem]"
        >
          <Toaster position="top-right" reverseOrder={false} />
          <Header />
          <div className="container py-8 flex flex-1 overflow-y-auto justify-start h-full">
            <Chat rtdbRef={db} />
          </div>
        </div>
      </RecoilRoot>
    </AuthWrapper>
  )
}

App.displayName = 'App'

export default App
