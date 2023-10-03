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
      <Header onToggleMenu={() => {}} />
      <div className="container">
        <Chat rtdbRef={db} />
      </div>
    </RecoilRoot>
  )
}

App.displayName = 'App'

export default App
