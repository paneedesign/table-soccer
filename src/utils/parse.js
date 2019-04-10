import { getPlayerData } from './players';

const parseFullName = (fullName) => {
  const [name, surname, ...other] = fullName.split(' ');
  return `${name} ${surname.charAt(0).toUpperCase()}. ${other.map(o => `${o.charAt(0).toUpperCase()}.`)}`;
};

const parseDate = date => `${`${date.getDate() < 10 ? '0' : ''}${date.getDate()}/${`${date.getMonth() < 10 ? '0' : ''}${date.getMonth()}`}`}/${date.getFullYear()} ${date.getHours()}:${`${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`}`;

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
      location: `🌇 ${game.site}`,
      timestamp: game.timestamp.toDate(),
      parsedDate: parseDate(game.timestamp.toDate()),
    });
  });

  return games;
};

const parsePlayerRanking = (rankingArray, playersRef) => rankingArray.map((ranking) => {
  const { playerId, ...otherProps } = ranking;
  const player = getPlayerData(playerId, playersRef);

  return {
    player,
    lost: ranking.played - ranking.won,
    ...otherProps,
  };
});

const parseTeamRanking = (rankingArray, playersRef) => rankingArray.map((ranking) => {
  const { defenderId, strikerId, ...otherProps } = ranking;
  const defender = getPlayerData(defenderId, playersRef);
  const striker = getPlayerData(strikerId, playersRef);

  return {
    defender,
    striker,
    lost: ranking.played - ranking.won,
    ...otherProps,
  };
});

const parseUpcomingGames = () => {};

export {
  parseDate,
  parseGames,
  parseFullName,
  parsePlayerRanking,
  parseTeamRanking,
  parseUpcomingGames,
};
