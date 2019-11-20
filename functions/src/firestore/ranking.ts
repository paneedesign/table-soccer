import SITES from '../utils/sites';
import fetchGames from './games';
import { getPlayersRanking, getTeamsRanking } from '../utils/ranking';
import * as admin from 'firebase-admin';
import {DocumentSnapshot} from 'firebase-functions/lib/providers/firestore';

export const fetchPlayerRankings = (firestore: admin.firestore.Firestore) => {
  return firestore
    .collection('playersRanking')
    .get()
    .then(querySnapshot => {
      const rankingsRef: DocumentSnapshot[] = [];
      querySnapshot.forEach((doc: DocumentSnapshot) => rankingsRef.push(doc));
      return rankingsRef;
    });
};

export const fetchTeamsRankings = (firestore: admin.firestore.Firestore) => {
  return firestore
    .collection('teamsRanking')
    .get()
    .then(querySnapshot => {
      const rankingsRef: DocumentSnapshot[] = [];
      querySnapshot.forEach((doc: DocumentSnapshot) => rankingsRef.push(doc));
      return rankingsRef;
    });
};

export const setRankings = async (firestore: admin.firestore.Firestore, sites: Array<SITES>) => {
  const gamesRef = await fetchGames(firestore);

  const playersRankingBatch = firestore.batch();
  const teamsRankingBatch = firestore.batch();

  sites.forEach((site) => {
    playersRankingBatch.set(
      firestore.collection('playersRanking').doc(site),
      getPlayersRanking(gamesRef, site)
    );

    teamsRankingBatch.set(
      firestore.collection('teamsRanking').doc(site),
      getTeamsRanking(gamesRef, site)
    );
  });

  await playersRankingBatch.commit();
  await teamsRankingBatch.commit();

  return Promise.resolve();
};
