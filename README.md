# Fast speech to text experiments

Repo containing experiments/explorations/proofs-of-concept for fast speech to text (and back again).

The basic idea being validated here is that streaming speech to text can allow us to create a speech-to-speech bot that responds more naturally, because it transcribes the input as it arrives.

## Running things

### Environment Variables

You will need the following environment variables set - use `.env` files in the `web/` and `server/` directories to set them:

```
# web/.env

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_RTDB_URL=
VITE_FIREBASE_PROJECT_ID=
```

```
# server/.env

FIREBASE_API_KEY=
FIREBASE_APP_ID=
FIREBASE_AUTH_DOMAIN=
FIREBASE_RTDB_URL=
FIREBASE_PROJECT_ID=
```

### Launching the application

```bash
# install all dependencies for the 'web' and 'server' packages
npm install

# run frontend and backend in dev
npm run dev
# or `npm run dev:web` & `npm run dev:server` in separate terminals if you so wish
```

Open [localhost:5173](http://localhost:5173) in your browser.
