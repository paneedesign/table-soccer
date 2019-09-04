import SITES from "../utils/sites";
import fetchGames from "./games";
import { getPlayersRanking, getTeamsRanking } from "../utils/ranking";

export const fetchPlayerRankings = (firestore: any) => {
  return firestore
    .collection('playersRanking')
    .get()
    .then((querySnapshot: any) => {
      const rankingsRef: any[] = [];
      querySnapshot.forEach((doc: any) => rankingsRef.push(doc));
      return rankingsRef;
    });
};

export const fetchTeamsRankings = (firestore: any) => {
  return firestore
    .collection('teamsRanking')
    .get()
    .then((querySnapshot: any) => {
      const rankingsRef: any[] = [];
      querySnapshot.forEach((doc: any) => rankingsRef.push(doc));
      return rankingsRef;
    });
};

export const setRankings = async (firestore, sites: Array<SITES>) => {
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
