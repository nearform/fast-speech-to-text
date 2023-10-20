# Fast speech to text / Real time multi-lingual voice chat

Repository containing experiment/proof-of-concept for a "real time", multilingual voice chat.

The basic idea is to utilize Web Speech API and Google Cloud Translate API to enable a voice chat application that can translate speech to multiple languages.

> [!NOTE]
> The project currently properly runs only in the latest Chrome browser (v117+).

## Running things locally

### Pre-requisites

If you want to run the server on your own, you will need:
- set up a Google Cloud project & enable Cloud Translation API
- set up a Firebase project and enable a Realtime Database

The project is using Application Default Credentials for authentication with Google Cloud Translation API & Firebase.

Before running the server, you will need to authenticate using Coogle Cloud CLI. In order to have server successfully connect to the Firebase Realtime Database, you'll need to impersonate the Service Account that used in GCP.

- To set up user credentials using Google Cloud CLI, follow [these instructions](https://cloud.google.com/docs/authentication/provide-credentials-adc#local-dev). 
- To impersonate a service account using Google Cloud CLI, follow [these instructions](https://cloud.google.com/docs/authentication/provide-credentials-adc#sa-impersonation). ***Make sure that your account has the `Service Account Token Creator` permission in GCP.***

Once authenticated successfully, you can run the server with `npm run -w server`.

> [!NOTE]
> This process has to be done ONLY once as the credentials will be generated for you and kept on a "well known" location. For more information see [How Application Default Credentials Work](https://cloud.google.com/docs/authentication/application-default-credentials)

### Environment Variables

You will need the following environment variable - use `.env` files in the `server/` directory to set it:

```
# server/.env

FIREBASE_RTDB_URL=
```

### Launching the application

```bash
# install all dependencies for the 'web' and 'server' packages
npm install

# run frontend and backend in dev
npm run dev
# or `npm run -w web` & `npm run -w server` in separate terminals if you so wish
```

Open [localhost:5173](http://localhost:5173) in your browser.

## Demo application (NearForm accounts only)
There is a live demo application, however it is ONLY accessible to people with a NearForm Google account. You can access it [here](https://fast-speech-to-text-3e44ubrm7q-uc.a.run.app/).
