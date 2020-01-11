import SITES from '../utils/sites';
import fetchGames from './games';
import { getPlayersRankingPerYear, getTeamsRankingPerYear } from '../utils/ranking';
import * as admin from 'firebase-admin';
import {DocumentSnapshot} from 'firebase-functions/lib/providers/firestore';

export const fetchPlayerRanking = (firestore: admin.firestore.Firestore, site: SITES, year: string) => {
  return firestore
    .collection('playersRanking')
    .doc(site)
    .collection('years')
    .get()
    .then(querySnapshot => {
      const rankingsRef: DocumentSnapshot[] = [];
      querySnapshot.forEach((doc: DocumentSnapshot) => rankingsRef.push(doc));
      return rankingsRef.find(rankRef => rankRef.id === year);
    });
};

export const fetchTeamRanking = (firestore: admin.firestore.Firestore, site: SITES, year: string) => {
  return firestore
    .collection('teamsRanking')
    .doc(site)
    .collection('years')
    .get()
    .then(querySnapshot => {
      const rankingsRef: DocumentSnapshot[] = [];
      querySnapshot.forEach((doc: DocumentSnapshot) => rankingsRef.push(doc));
      return rankingsRef.find(rankRef => rankRef.id === year);
    });
};

export const setRankings = async (firestore: admin.firestore.Firestore, sites: Array<SITES>) => {
  const gamesRef = await fetchGames(firestore);

  const playersRankingBatch = firestore.batch();
  const teamsRankingBatch = firestore.batch();

  sites.forEach((site) => {
    const playerRanking = getPlayersRankingPerYear(gamesRef, site);
    const teamRanking = getTeamsRankingPerYear(gamesRef, site);

    Object.keys(playerRanking).forEach((year) => {
      playersRankingBatch.set(
        firestore.collection('playersRanking')
          .doc(site)
          .collection('years')
          .doc(year),
        playerRanking[year],
      );
      teamsRankingBatch.set(
        firestore.collection('teamsRanking')
          .doc(site)
          .collection('years')
          .doc(year),
        teamRanking[year],
      );
    });
  });

  await playersRankingBatch.commit();
  await teamsRankingBatch.commit();

  return Promise.resolve();
};
