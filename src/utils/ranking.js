import * as Elo from '../lib/elo';

const getTeamsRanking = (gamesRef, playersRef) => {
  let ranking = [];

  gamesRef.forEach((gameRef) => {
    const game = gameRef.data();
    const redDefender = playersRef.find(player => player.id === game.redTeam.defender.id);
    const redStriker = playersRef.find(player => player.id === game.redTeam.striker.id);
    const blueDefender = playersRef.find(player => player.id === game.blueTeam.defender.id);
    const blueStriker = playersRef.find(player => player.id === game.blueTeam.striker.id);
    const redTeam = `${redDefender.id}-${redStriker.id}`;
    const blueTeam = `${blueDefender.id}-${blueStriker.id}`;

    const baseRanking = {
      [redTeam]: {
        won: 0, played: 0, golScored: 0, goalSuffered: 0, rating: 1000,
      },
      [blueTeam]: {
        won: 0, played: 0, golScored: 0, goalSuffered: 0, rating: 1000,
      },
    };

    ranking = { ...baseRanking, ...ranking };

    const redTeamRating = ranking[redTeam].rating;
    const blueTeamRating = ranking[blueTeam].rating;

    // Get team results
    const redTeamResult = game.redTeam.score > game.blueTeam.score ? 1 : 0;
    const blueTeamResult = redTeamResult === 0 ? 1 : 0;

    // Get new ratings
    const newRedRating = Elo.getNewRating(redTeamRating, blueTeamRating, redTeamResult);
    const newBlueRating = Elo.getNewRating(blueTeamRating, redTeamRating, blueTeamResult);

    const redDelta = newRedRating - redTeamRating;
    const blueDelta = newBlueRating - blueTeamRating;

    ranking[redTeam].rating += redDelta;
    ranking[blueTeam].rating += blueDelta;

    ranking[redTeam].played += 1;
    ranking[blueTeam].played += 1;

    ranking[redTeam].won += redTeamResult;
    ranking[blueTeam].won += blueTeamResult;

    ranking[redTeam].golScored += game.redTeam.score;
    ranking[blueTeam].golScored += game.blueTeam.score;

    ranking[redTeam].goalSuffered += game.blueTeam.score;
    ranking[blueTeam].goalSuffered += game.redTeam.score;
  });

  return ranking;
};

const getPlayersRanking = (gamesRef, playersRef) => {
  let ranking = [];

  gamesRef.forEach((gameRef) => {
    const game = gameRef.data();
    const redDefender = playersRef.find(player => player.id === game.redTeam.defender.id);
    const redStriker = playersRef.find(player => player.id === game.redTeam.striker.id);
    const blueDefender = playersRef.find(player => player.id === game.blueTeam.defender.id);
    const blueStriker = playersRef.find(player => player.id === game.blueTeam.striker.id);

    const baseRanking = {
      [redDefender.id]: {
        won: 0, played: 0, golScored: 0, goalSuffered: 0, rating: 1000,
      },
      [redStriker.id]: {
        won: 0, played: 0, golScored: 0, goalSuffered: 0, rating: 1000,
      },
      [blueDefender.id]: {
        won: 0, played: 0, golScored: 0, goalSuffered: 0, rating: 1000,
      },
      [blueStriker.id]: {
        won: 0, played: 0, golScored: 0, goalSuffered: 0, rating: 1000,
      },
    };

    ranking = { ...baseRanking, ...ranking };

    const redTeamRating = ranking[redDefender.id].rating + ranking[redStriker.id].rating;
    const blueTeamRating = ranking[blueDefender.id].rating + ranking[blueStriker.id].rating;

    // Get team results
    const redTeamResult = game.redTeam.score > game.blueTeam.score ? 1 : 0;
    const blueTeamResult = redTeamResult === 0 ? 1 : 0;

    // Get new ratings
    const newRedRating = Elo.getNewRating(redTeamRating, blueTeamRating, redTeamResult);
    const newBlueRating = Elo.getNewRating(blueTeamRating, redTeamRating, blueTeamResult);

    const redDelta = newRedRating - redTeamRating;
    const blueDelta = newBlueRating - blueTeamRating;

    ranking[redDefender.id].rating += redDelta;
    ranking[redStriker.id].rating += redDelta;
    ranking[blueDefender.id].rating += blueDelta;
    ranking[blueStriker.id].rating += blueDelta;

    ranking[redDefender.id].played += 1;
    ranking[redStriker.id].played += 1;
    ranking[blueDefender.id].played += 1;
    ranking[blueStriker.id].played += 1;

    ranking[redDefender.id].won += redTeamResult;
    ranking[redStriker.id].won += redTeamResult;
    ranking[blueDefender.id].won += blueTeamResult;
    ranking[blueStriker.id].won += blueTeamResult;

    ranking[redDefender.id].golScored += game.redTeam.score;
    ranking[redStriker.id].golScored += game.redTeam.score;
    ranking[blueDefender.id].golScored += game.blueTeam.score;
    ranking[blueStriker.id].golScored += game.blueTeam.score;

    ranking[redDefender.id].goalSuffered += game.blueTeam.score;
    ranking[redStriker.id].goalSuffered += game.blueTeam.score;
    ranking[blueDefender.id].goalSuffered += game.redTeam.score;
    ranking[blueStriker.id].goalSuffered += game.redTeam.score;
  });

  return ranking;
};

export {
  getPlayersRanking,
  getTeamsRanking,
};
