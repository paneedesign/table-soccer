import { getPlayerData } from './players';
import ROLES from './roles';

const minPlayedMatch = 15;

const parseFullName = (fullName) => {
  const [name, surname, ...other] = fullName.split(' ');
  return `${name} ${surname.charAt(0).toUpperCase()}. ${other.map(o => `${o.charAt(0).toUpperCase()}.`)}`;
};

const parseDate = (date, time = true) => `${`${date.getDate() < 10 ? '0' : ''}${date.getDate()}/${`${date.getMonth() < 10 ? '0' : ''}${date.getMonth() + 1}`}`}/${date.getFullYear()} ${time ? `${date.getHours()}:${`${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`}:${date.getSeconds() < 10 ? '0' : ''}${date.getSeconds()}` : ''}`;

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

const parsePlayerRanking = (rankingArray, playersRef) => rankingArray.map((ranking) => {
  const { playerId, ...otherProps } = ranking;
  const player = getPlayerData(playerId, playersRef);

  return {
    player,
    lost: ranking.played - ranking.won,
    ...otherProps,
  };
}).filter(rankingPlayer => rankingPlayer.player.enabled && rankingPlayer.played > minPlayedMatch);

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
}).filter(rankingPlayer => rankingPlayer.defender.enabled && rankingPlayer.striker.enabled);

const parsePlayerListToGames = (players) => {
  const teams = [];
  let j = 0;

  for (let i = 0; i < Math.ceil(players.length * 0.5); i += 1) {
    const playerOne = players[i + j];
    const playerTwo = players[i + j + 1];
    let tmpDefender = playerOne;
    let tmpStriker = playerTwo;

    if ((playerOne.role !== ROLES.DEFENDER && playerOne.role !== ROLES.ANY)
      || (playerOne.role === ROLES.ANY && playerTwo.role !== ROLES.STRIKER)) {
      tmpDefender = playerTwo;
      tmpStriker = playerOne;
    }

    teams.push({
      defender: tmpDefender,
      striker: tmpStriker,
    });

    j += 1;
  }

  const games = [];
  j = 0;

  for (let i = 0; i < Math.ceil(teams.length * 0.5); i += 1) {
    games.push({
      id: i,
      redTeam: teams[i + j],
      blueTeam: teams[i + j + 1],
    });

    j += 1;
  }

  return games;
};

export {
  parseDate,
  parseGames,
  parseFullName,
  parsePlayerRanking,
  parseTeamRanking,
  parsePlayerListToGames,
};
