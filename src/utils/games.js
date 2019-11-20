import { getPlayerData } from './players';
import { shuffleArray } from './array';
import { parsePlayerListToGames } from './parse';
import ROLES from './roles';

function fillPlayerListGaps(playerArrayResult, playerArrayDefault, playersRef) {
  const playerIds = [...playerArrayResult]
    .splice(playerArrayResult.length - (playerArrayResult.length % 4), playerArrayResult.length)
    .map(p => p.playerId);
  while (playerArrayResult.length % 4 !== 0) {
    // To find a player with a role different from the last one player role
    const selectedPlayerIndex = playerArrayDefault
      .findIndex(player => !playerIds.includes(player.playerId)
        && (getPlayerData(player.playerId, playersRef).role
          !== playerArrayResult[playerArrayResult.length - 1].role));
    playerArrayResult.push(playerArrayDefault[selectedPlayerIndex]);
    playerArrayDefault.splice(selectedPlayerIndex, 1);
  }

  return playerArrayResult;
}

function playerListByRanking(lastPlayer, players, playerArrayDefault, playersRef) {
  if (playerArrayDefault.length === 0) {
    return players.reverse();
  }

  let [player] = playerArrayDefault;

  if (players.length === 0) {
    return playerListByRanking(
      player,
      [player, ...players],
      playerArrayDefault.filter(p => p.playerId !== player.playerId).reverse(),
      playersRef,
    );
  }

  if (getPlayerData(player.playerId, playersRef).role === ROLES.DEFENDER
    && getPlayerData(lastPlayer.playerId, playersRef).role === ROLES.DEFENDER) {
    const strikers = playerArrayDefault
      .filter(p => getPlayerData(p.playerId, playersRef).role === ROLES.STRIKER
        || getPlayerData(p.playerId, playersRef).role === ROLES.ANY);
    // Unhandled else case, fill player array later
    if (strikers.length) {
      [player] = strikers;
    }
  } else if ((getPlayerData(player.playerId, playersRef).role === ROLES.STRIKER
    && getPlayerData(lastPlayer.playerId, playersRef).role === ROLES.STRIKER)) {
    const defenders = playerArrayDefault
      .filter(p => getPlayerData(p.playerId, playersRef).role === ROLES.DEFENDER
        || getPlayerData(p.playerId, playersRef).role === ROLES.ANY);
    // Unhandled else case, fill player array later
    if (defenders.length) {
      [player] = defenders;
    }
  }

  return playerListByRanking(
    player,
    [player, ...players],
    playerArrayDefault.filter(p => p.playerId !== player.playerId).reverse(),
    playersRef,
  );
}

function playerListRandomByRole(lastPlayer, players, playerArrayDefault, playersRef) {
  if (playerArrayDefault.length === 0) {
    return players;
  }

  let [player] = playerArrayDefault;

  if (players.length === 0) {
    return playerListRandomByRole(
      player,
      [player, ...players],
      shuffleArray(playerArrayDefault.filter(p => p.playerId !== player.playerId)),
      playersRef,
    );
  }

  if (getPlayerData(player.playerId, playersRef).role === ROLES.DEFENDER
    && getPlayerData(lastPlayer.playerId, playersRef).role === ROLES.DEFENDER) {
    const strikers = playerArrayDefault
      .filter(p => getPlayerData(p.playerId, playersRef).role === ROLES.STRIKER
        || getPlayerData(p.playerId, playersRef).role === ROLES.ANY);
    // Unhandled else case, fill player array later
    if (strikers.length) {
      [player] = strikers;
    }
  } else if ((getPlayerData(player.playerId, playersRef).role === ROLES.STRIKER
    && getPlayerData(lastPlayer.playerId, playersRef).role === ROLES.STRIKER)) {
    const defenders = playerArrayDefault
      .filter(p => getPlayerData(p.playerId, playersRef).role === ROLES.DEFENDER
        || getPlayerData(p.playerId, playersRef).role === ROLES.ANY);
    // Unhandled else case, fill player array later
    if (defenders.length) {
      [player] = defenders;
    }
  }

  return playerListRandomByRole(
    player,
    [player, ...players],
    shuffleArray(playerArrayDefault.filter(p => p.playerId !== player.playerId)),
    playersRef,
  );
}

const getUpcomingGames = (playerRankingArray, unavailablePlayersIds = [], playersRef) => {
  let playerArrayDefault = playerRankingArray.sort((a, b) => {
    if (a.rating < b.rating) return 1;
    if (a.rating > b.rating) return -1;
    return 0;
  });

  if (unavailablePlayersIds.length) {
    playerArrayDefault = playerArrayDefault
      .filter(rankingPlayer => !unavailablePlayersIds.includes(rankingPlayer.playerId));
  }

  const playerListResult = fillPlayerListGaps(
    playerListByRanking(null, [], [...playerArrayDefault], playersRef),
    shuffleArray([...playerArrayDefault]),
    playersRef,
  );

  const playerList = playerListResult
    .map(rankingPlayer => getPlayerData(rankingPlayer.playerId, playersRef));

  return parsePlayerListToGames(playerList);
};

const getRandomUpcomingGames = (playerRankingArray, unavailablePlayersIds = [], playersRef) => {
  let playerArrayDefault = playerRankingArray;

  if (unavailablePlayersIds.length) {
    playerArrayDefault = playerArrayDefault
      .filter(rankingPlayer => !unavailablePlayersIds.includes(rankingPlayer.playerId));
  }

  const playerListResult = fillPlayerListGaps(
    playerListRandomByRole(null, [], shuffleArray([...playerArrayDefault]), playersRef),
    shuffleArray([...playerArrayDefault]),
    playersRef,
  );

  const playerList = playerListResult
    .map(rankingPlayer => getPlayerData(rankingPlayer.playerId, playersRef));

  return parsePlayerListToGames(playerList);
};

export {
  getUpcomingGames,
  getRandomUpcomingGames,
};
