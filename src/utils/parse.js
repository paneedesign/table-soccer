import { getPlayerData } from './players';

const minPlayedMatch = 15;

const parseFullName = (fullName) => {
  const [name, surname, ...other] = fullName.split(' ');
  return `${name} ${surname.charAt(0).toUpperCase()}. ${other.map(o => `${o.charAt(0).toUpperCase()}.`)}`;
};

const parseDate = (date, time = true) => `${date.toLocaleString()} ${time ? `${date.getHours()}:${`${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`}:${date.getSeconds() < 10 ? '0' : ''}${date.getSeconds()}` : ''}`;

const parseGames = (gamesRef, playersRef) => {
  const games = [];

  gamesRef.forEach((gameRef) => {
    const { id } = gameRef;
    const game = gameRef.data();
    const redDefender = getPlayerData(game.redTeam.defender.id, playersRef);
    const redStriker = getPlayerData(game.redTeam.striker.id, playersRef);
    const blueDefender = getPlayerData(game.blueTeam.defender.id, playersRef);
    const blueStriker = getPlayerData(game.blueTeam.striker.id, playersRef);

    games.push({
      id,
      redDefender,
      redStriker,
      blueDefender,
      blueStriker,
      redScore: game.redTeam.score,
      blueScore: game.blueTeam.score,
      site: game.site,
      timestamp: game.timestamp.toDate(),
      parsedDate: parseDate(game.timestamp.toDate()),
    });
  });

  return games;
};

const parsePlayerRanking = (rankingArray, playersRef) => Object.keys(rankingArray)
  .map((rankingKey) => {
    const ranking = rankingArray[rankingKey];
    const player = getPlayerData(rankingKey, playersRef);

    return {
      player,
      lost: ranking.played - ranking.won,
      ...ranking,
    };
  }).filter(rankingPlayer => rankingPlayer.player.enabled && rankingPlayer.played > minPlayedMatch);

const parseTeamRanking = (rankingArray, playersRef) => Object.keys(rankingArray)
  .map((rankingKey) => {
    const ranking = rankingArray[rankingKey];
    const [defenderId, strikerId] = rankingKey.split('-');
    const defender = getPlayerData(defenderId, playersRef);
    const striker = getPlayerData(strikerId, playersRef);

    return {
      defender,
      striker,
      lost: ranking.played - ranking.won,
      ...ranking,
    };
  }).filter(rankingPlayer => rankingPlayer.defender.enabled && rankingPlayer.striker.enabled);

export {
  parseDate,
  parseGames,
  parseFullName,
  parsePlayerRanking,
  parseTeamRanking,
};
