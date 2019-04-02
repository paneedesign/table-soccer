import firebase from 'firebase';
import 'firebase/firestore';

const config = {
    apiKey: 'AIzaSyDakdubwr2GBDVIx2XdTMZCNGoEFxNc3PM',
    projectId: 'ped-table-soccer',
    // authDomain: '<PROJECT_ID>.firebaseapp.com',
    // databaseURL: 'https://<DATABASE_NAME>.firebaseio.com',
    // storageBucket: '<BUCKET>.appspot.com',
    // messagingSenderId: '<SENDER_ID>',
}

const firebaseApp = firebase.initializeApp(config);
const firestore = firebaseApp.firestore();

export {
  firebaseApp,
  firestore,
};

