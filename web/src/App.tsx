import { initializeApp } from 'firebase/app'
import { Database, getDatabase } from 'firebase/database'

import { RecoilRoot } from 'recoil'

import { ChatWrapper as Chat, Header } from '@/components'

import './App.css'
import { firebaseConfig } from './firebase'

initializeApp(firebaseConfig)

const db: Database = getDatabase()

const App = () => {
  return (
    <RecoilRoot>
      <div id="primary-container" className="h-screen relative container">
        <Header />
        <div className="container py-8">
          <Chat rtdbRef={db} />
        </div>
      </div>
    </RecoilRoot>
  )
}

App.displayName = 'App'

export default App
