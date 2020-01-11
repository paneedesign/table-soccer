// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {DocumentSnapshot} from 'firebase-functions/lib/providers/firestore';
import {fetchPlayerRanking, fetchTeamRanking, setRankings} from './firestore/ranking';
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

    if (newGame) {
      const { site, timestamp } = newGame;
      const year = timestamp.toDate().getFullYear().toString();

      const playerRankingRef: DocumentSnapshot|undefined = await fetchPlayerRanking(db, site, year);
      const teamRankingRef: DocumentSnapshot|undefined = await fetchTeamRanking(db, site, year);

      if (playerRankingRef) {
        await db.collection('playersRanking')
          .doc(site)
          .collection('years')
          .doc(year)
          .set(updatePlayersRanking((playerRankingRef!.data() as IRanking), newGame));
      }

      if (teamRankingRef) {
        await db.collection('teamsRanking')
          .doc(site)
          .collection('years')
          .doc(year)
          .set(updateTeamsRanking((teamRankingRef!.data() as IRanking), newGame));
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
