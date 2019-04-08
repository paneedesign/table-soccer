import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const config = {
  apiKey: 'AIzaSyDakdubwr2GBDVIx2XdTMZCNGoEFxNc3PM',
  projectId: 'ped-table-soccer',
  authDomain: 'ped-table-soccer.firebaseapp.com',
};

const firebaseApp = firebase.initializeApp(config);
const firestore = firebase.firestore();

export {
  firebase,
  firebaseApp,
  firestore,
};
