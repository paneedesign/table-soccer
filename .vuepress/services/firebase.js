const asyncGetFirebase = async () => {
  const firebase = await import('firebase/app');
  await import('firebase/auth');
  await import('firebase/firestore');

  const config = {
    apiKey: 'AIzaSyDakdubwr2GBDVIx2XdTMZCNGoEFxNc3PM',
    projectId: 'ped-table-soccer',
    authDomain: 'ped-table-soccer.firebaseapp.com',
  };

  let firebaseApp = null;

  if (!firebase.apps.length) {
    firebaseApp = firebase.initializeApp(config);
  } else {
    firebaseApp = firebase.app();
  }

  const firestore = firebaseApp.firestore();

  return {
    firebase,
    firestore,
  };
};

export default asyncGetFirebase;
