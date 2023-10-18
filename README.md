# Fast speech to text experiments

Repository containing experiments/explorations/proof-of-concept for fast speech to text (and back again) and "real time" chat.

The basic idea being validated here is that streaming speech to text can allow us to create a speech-to-speech bot that responds more naturally, because it transcribes the input as it arrives.

> [!NOTE]
> The project currently properly runs in Chrome and other Webkit based browsers.

## Running things locally (local development)

### Pre-requisites

The project is using Application Default Credentials for Google Cloud Translation API.
Before running the server, you will need to authenticate using Coogle Cloud CLI. In order to have server successfully connect to the Firebase RealTime DB, you'll need to impersonate the Service Account that used in GCP.

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
