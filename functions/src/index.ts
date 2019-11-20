// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {DocumentSnapshot} from 'firebase-functions/lib/providers/firestore';
import {fetchPlayerRankings, fetchTeamsRankings, setRankings} from './firestore/ranking';
import {updatePlayersRanking, updateTeamsRanking} from './utils/ranking';
import SITES from './utils/sites';
import {IGame, IRanking} from './utils/interfaces';

admin.initializeApp();

const db = admin.firestore();

/**
 * This function is called each time a new games will be added or deleted,
 * updating the player and the team ranking of game site
 */
exports.updateRanking = functions.firestore
  .document('games/{game}')
  .onWrite(async (change: functions.Change<DocumentSnapshot>) => {
    const newGame = change.after.exists ? (change.after.data() as IGame) : null;
    const oldGame = change.before.data() as IGame;

    const playerRankingsRef: DocumentSnapshot[] = await fetchPlayerRankings(db);
    const teamsRankingsRef: DocumentSnapshot[] = await fetchTeamsRankings(db);

    if (newGame) {
      const { site } = newGame;
      const playersRankingRef = playerRankingsRef.find(rankRef => rankRef.id === site);
      const teamsRankingRef = teamsRankingsRef.find(rankRef => rankRef.id === site);

      if (playerRankingsRef) {
        await db.collection('playersRanking')
          .doc(site)
          .set(updatePlayersRanking((playersRankingRef!.data() as IRanking), newGame));
      }

      if (teamsRankingRef) {
        await db.collection('teamsRanking')
          .doc(site)
          .set(updateTeamsRanking((teamsRankingRef!.data() as IRanking), newGame));
      }
    } else if (oldGame && newGame === null) {
      const { site } = oldGame;
      await setRankings(db, [site]);
    } else {
      console.log('UPDATE - NOT HANDLED');
    }
  });

/**
 * Call this function to generate the rankings maps for the first time
 * or update them with games data.
 */
exports.generateRanking = functions.https.onRequest(async (req, res) => {
  await setRankings(db, Object.keys(SITES).map(siteKey => (SITES as any)[siteKey]));
  res.send('Generated player and team rankings for each site');
});
