# Fast speech to text experiments

Repo containing experiments/explorations/proofs-of-concept for fast speech to text (and back again).

The basic idea being validated here is that streaming speech to text can allow us to create a speech-to-speech bot that responds more naturally, because it transcribes the input as it arrives.

## Running things

### Pre-requisites

The project is using Application Default Credentials for Google Cloud Translation API.
Before running the server, you will need to authenticate using Coogle Cloud CLI. To set up user credentials using Google Cloud CLI, follow [these instructions](https://cloud.google.com/docs/authentication/provide-credentials-adc#local-dev). Once authenticated you can run the server with `npm run --workspace=server`.

> [!NOTE]
> This process has to be done ONLY once as the credentials will be generated for you and kept on a "well known" location. For more information see [How Application Default Credentials Work](https://cloud.google.com/docs/authentication/application-default-credentials)

### Environment Variables

You will need the following environment variables set - use `.env` files in the `server/` directory to set them:

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
