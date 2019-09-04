import { GAME_RESULTS, getNewRating } from '../libs/elo';
import SITES from './sites';

interface IRankingObject {
  won: number,
  played: number,
  goalScored: number,
  goalSuffered: number,
  rating: number,
}

const defaultRankingObject: IRankingObject = {
  won: 0,
  played: 0,
  goalScored: 0,
  goalSuffered: 0,
  rating: 1000,
};

const updatePlayerRankingWithNewGame = (ranking, game) => {
  const redTeamRating = ranking[game.redTeam.defender.id].rating + ranking[game.redTeam.striker.id].rating;
  const blueTeamRating = ranking[game.blueTeam.defender.id].rating + ranking[game.blueTeam.striker.id].rating;

  // Get team results
  const redTeamResult = game.redTeam.score > game.blueTeam.score ? GAME_RESULTS.WIN : GAME_RESULTS.LOSE;
  const blueTeamResult = redTeamResult === GAME_RESULTS.LOSE ? GAME_RESULTS.WIN : GAME_RESULTS.LOSE;

  // Get new ratings
  const newRedRating = getNewRating(redTeamRating, blueTeamRating, redTeamResult);
  const newBlueRating = getNewRating(blueTeamRating, redTeamRating, blueTeamResult);

  const redDelta = newRedRating - redTeamRating;
  const blueDelta = newBlueRating - blueTeamRating;

  ranking[game.redTeam.defender.id].rating += redDelta;
  ranking[game.redTeam.striker.id].rating += redDelta;
  ranking[game.blueTeam.defender.id].rating += blueDelta;
  ranking[game.blueTeam.striker.id].rating += blueDelta;

  ranking[game.redTeam.defender.id].played += 1;
  ranking[game.redTeam.striker.id].played += 1;
  ranking[game.blueTeam.defender.id].played += 1;
  ranking[game.blueTeam.striker.id].played += 1;

  ranking[game.redTeam.defender.id].won += redTeamResult;
  ranking[game.redTeam.striker.id].won += redTeamResult;
  ranking[game.blueTeam.defender.id].won += blueTeamResult;
  ranking[game.blueTeam.striker.id].won += blueTeamResult;

  ranking[game.redTeam.defender.id].goalScored += game.redTeam.score;
  ranking[game.redTeam.striker.id].goalScored += game.redTeam.score;
  ranking[game.blueTeam.defender.id].goalScored += game.blueTeam.score;
  ranking[game.blueTeam.striker.id].goalScored += game.blueTeam.score;

  ranking[game.redTeam.defender.id].goalSuffered += game.blueTeam.score;
  ranking[game.redTeam.striker.id].goalSuffered += game.blueTeam.score;
  ranking[game.blueTeam.defender.id].goalSuffered += game.redTeam.score;
  ranking[game.blueTeam.striker.id].goalSuffered += game.redTeam.score;

  return ranking;
};

const updateTeamRankingWithNewGame = (ranking, game) => {
  const redTeam = `${game.redTeam.defender.id}-${game.redTeam.striker.id}`;
  const blueTeam = `${game.blueTeam.defender.id}-${game.blueTeam.striker.id}`;

  const redTeamRating = ranking[redTeam].rating;
  const blueTeamRating = ranking[blueTeam].rating;

  // Get team results
  const redTeamResult = game.redTeam.score > game.blueTeam.score ? 1 : 0;
  const blueTeamResult = redTeamResult === 0 ? 1 : 0;

  // Get new ratings
  const newRedRating = getNewRating(redTeamRating, blueTeamRating, redTeamResult);
  const newBlueRating = getNewRating(blueTeamRating, redTeamRating, blueTeamResult);

  const redDelta = newRedRating - redTeamRating;
  const blueDelta = newBlueRating - blueTeamRating;

  ranking[redTeam].rating += redDelta;
  ranking[blueTeam].rating += blueDelta;

  ranking[redTeam].played += 1;
  ranking[blueTeam].played += 1;

  ranking[redTeam].won += redTeamResult;
  ranking[blueTeam].won += blueTeamResult;

  ranking[redTeam].goalScored += game.redTeam.score;
  ranking[blueTeam].goalScored += game.blueTeam.score;

  ranking[redTeam].goalSuffered += game.blueTeam.score;
  ranking[blueTeam].goalSuffered += game.redTeam.score;

  return ranking;
};

export const getPlayersRanking = (gamesRef, site: SITES) => {
  let ranking: {[k: string]: IRankingObject} = {};

  gamesRef
    .filter((game: any) => game.data().site === site)
    .forEach((gameRef: any) => {
      const game = gameRef.data();

      const baseRanking = {
        [game.redTeam.defender.id]: {
          ...defaultRankingObject,
        },
        [game.redTeam.striker.id]: {
          ...defaultRankingObject,
        },
        [game.blueTeam.defender.id]: {
          ...defaultRankingObject,
        },
        [game.blueTeam.striker.id]: {
          ...defaultRankingObject,
        },
      };

      ranking = { ...baseRanking, ...ranking };

      updatePlayerRankingWithNewGame(ranking, game);
    });

  return ranking;
};

export const getTeamsRanking = (gamesRef, site: SITES) => {
  let ranking: {[k: string]: IRankingObject} = {};

  gamesRef
    .filter((game: any) => game.data().site === site)
    .forEach((gameRef: any) => {
      const game = gameRef.data();
      const redTeam = `${game.redTeam.defender.id}-${game.redTeam.striker.id}`;
      const blueTeam = `${game.blueTeam.defender.id}-${game.blueTeam.striker.id}`;

      const baseRanking = {
        [redTeam]: {
          ...defaultRankingObject,
        },
        [blueTeam]: {
          ...defaultRankingObject,
        },
      };

      ranking = { ...baseRanking, ...ranking };

      updateTeamRankingWithNewGame(ranking, game);
    });

  return ranking;
};

export const updatePlayersRanking = (ranking: {[k: string]: IRankingObject}, game) => {
  return updatePlayerRankingWithNewGame(ranking, game);
};

export const updateTeamsRanking = (ranking: {[k: string]: IRankingObject}, game) => {
  return updateTeamRankingWithNewGame(ranking, game);
};
