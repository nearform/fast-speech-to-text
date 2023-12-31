import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyC69YjSRp7jiGc0oKOZfWLFJvymfFEVbgs',
  authDomain: 'hub-playground.firebaseapp.com',
  databaseURL:
    'https://hub-playground-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'hub-playground',
  storageBucket: 'hub-playground.appspot.com',
  messagingSenderId: '925446392171',
  appId: '1:925446392171:web:427e9e56cd23a72ce0e42e'
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider().setCustomParameters({
  hd: 'nearform.com'
})
