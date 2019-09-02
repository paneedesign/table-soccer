// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
import {Change, EventContext} from "firebase-functions";
import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import fetchPlayers from "./utils/players";
import fetchGames from "./utils/games";
import {getPlayersRanking, getTeamsRanking} from "./utils/ranking";
import SITES from "./utils/sites";

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

exports.updateRanking = functions.firestore
  // .document('games/{game}')
  .document('testWrite/{game}')
  .onWrite(async (change: Change<DocumentSnapshot>, context: EventContext) => {
    console.log(change.after.data());

    const gamesRef = await fetchGames(db);
    const playersRef = await fetchPlayers(db);

    const playersRankingBySite: {[key in SITES]: any} = {
      [SITES.CATANIA]: {},
      [SITES.MILAN]: {},
      [SITES.RAGUSA]: {},
    };

    const teamsRankingBySite: {[key in SITES]: any} = {
      [SITES.CATANIA]: {},
      [SITES.MILAN]: {},
      [SITES.RAGUSA]: {},
    };

    Object.keys(SITES).forEach((siteKey) => {
      const site: SITES = (SITES as any)[siteKey];
      playersRankingBySite[site] = getPlayersRanking(gamesRef, playersRef, site);
      teamsRankingBySite[site] = getTeamsRanking(gamesRef, playersRef, site);
    });

    // Set Player Ranking
    db.collection('playersRanking').set(playersRankingBySite);
    db.collection('teamsRanking').set(teamsRankingBySite);
  });
