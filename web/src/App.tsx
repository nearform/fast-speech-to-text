import { initializeApp } from 'firebase/app'
import { Database, getDatabase } from 'firebase/database'

import { RecoilRoot } from 'recoil'

import { ChatWrapper as Chat, Header } from '@/components'

import './App.css'

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  appId: process.env.VITE_FIREBASE_APP_ID,
  databaseURL: process.env.VITE_FIREBASE_RTDB_URL,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID
}

initializeApp(firebaseConfig)

const db: Database = getDatabase()

const App = () => {
  return (
    <RecoilRoot>
      <Header onToggleMenu={() => {}} />
      <div className="container">
        <Chat rtdbRef={db} />
      </div>
    </RecoilRoot>
  )
}

App.displayName = 'App'

export default App
