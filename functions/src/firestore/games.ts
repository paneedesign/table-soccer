import * as admin from 'firebase-admin';
import {DocumentSnapshot} from 'firebase-functions/lib/providers/firestore';

const fetchGames = (firestore: admin.firestore.Firestore) => {
  return firestore
    .collection('games')
    .orderBy('timestamp', 'asc')
    .get()
    .then(querySnapshot => {
      const gamesRef: DocumentSnapshot[] = [];
      querySnapshot.forEach(doc => gamesRef.push(doc));
      return gamesRef;
    });
};

export default fetchGames;
