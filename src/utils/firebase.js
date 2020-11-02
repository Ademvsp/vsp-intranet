import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';
import 'firebase/storage';

const region = process.env.REACT_APP_FIREBASE_FUNCTIONS_REGION;

const config = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET
};

app.initializeApp(config);
app.firestore();
app.auth();
app.storage();
app.functions();
app.app().functions('australia-southeast1');

export default app;

export const getServerTimeInMilliseconds = async () => {
  let functionRef = app
    .app()
    .functions(region)
    .httpsCallable('getServerTimeInMilliseconds');
  let result = await functionRef();
  return result.data;
};
