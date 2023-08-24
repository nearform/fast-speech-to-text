import { initializeApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';

import { RecoilRoot } from 'recoil';

import { ChatWrapper as Chat, Header } from '@/components';

import './App.css';

const firebaseConfig = {
  apiKey: import.meta.env['VITE_FIREBASE_API_KEY'],
  appId: import.meta.env['VITE_FIREBASE_APP_ID'],
  databaseURL: import.meta.env['VITE_FIREBASE_RTDB_URL'],
  projectId: import.meta.env['VITE_FIREBASE_PROJECT_ID']
};

initializeApp(firebaseConfig);

const db: Database = getDatabase();

const App = () => {
  return (
    <RecoilRoot>
      <Header onToggleMenu={() => {}} />
      <div className="container">
        <Chat rtdbRef={db} />
      </div>
    </RecoilRoot>
  );
};

App.displayName = 'App';

export default App;
