import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const config = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
};

const firebaseApp = firebase.initializeApp(config);
const firestore = firebase.firestore();

export {
  firebase,
  firebaseApp,
  firestore,
};
