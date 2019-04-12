import { getPlayerData } from './players';
import { shuffleArray } from './array';
import { parsePlayerListToGames } from './parse';

const playerListByRanking = (lastPlayer, players, playersArray, playersRef) => {
  if (playersArray.length === 0) {
    return players;
  }

  let [player] = playersArray;

  if (players.length === 0) {
    return playerListByRanking(
      player,
      [player, ...players],
      playersArray.filter(p => p.playerId !== player.playerId).reverse(),
      playersRef,
    );
  }

  if (getPlayerData(player.playerId, playersRef).role === 'Defender'
    && getPlayerData(lastPlayer.playerId, playersRef).role === 'Defender') {
    const strikers = playersArray.filter(p => getPlayerData(p.playerId, playersRef).role === 'Striker' || getPlayerData(p.playerId, playersRef).role === 'Any');

    if (strikers.length) {
      [player] = strikers;
    } else {
      console.log(player.rating, 'Unhandled Case');
    }
  } else if ((getPlayerData(player.playerId, playersRef).role === 'Striker'
    && getPlayerData(lastPlayer.playerId, playersRef).role === 'Striker')) {
    const defenders = playersArray.filter(p => getPlayerData(p.playerId, playersRef).role === 'Defender' || getPlayerData(p.playerId, playersRef).role === 'Any');
    if (defenders.length) {
      [player] = defenders;
    } else {
      console.log(player.rating, 'Unhandled Case');
    }
  }

  return playerListByRanking(
    player,
    [player, ...players],
    playersArray.filter(p => p.playerId !== player.playerId).reverse(),
    playersRef,
  );
};

const playerListRandom = (lastPlayer, players, playersArray, playersRef) => {
  if (playersArray.length === 0) {
    return players;
  }

  let [player] = playersArray;

  if (players.length === 0) {
    return playerListRandom(
      player,
      [player, ...players],
      shuffleArray(playersArray.filter(p => p.playerId !== player.playerId)),
      playersRef,
    );
  }

  if (getPlayerData(player.playerId, playersRef).role === 'Defender'
    && getPlayerData(lastPlayer.playerId, playersRef).role === 'Defender') {
    const strikers = playersArray.filter(p => getPlayerData(p.playerId, playersRef).role === 'Striker' || getPlayerData(p.playerId, playersRef).role === 'Any');

    if (strikers.length) {
      [player] = strikers;
    } else {
      console.log(player.rating, 'Unhandled Case');
    }
  } else if ((getPlayerData(player.playerId, playersRef).role === 'Striker'
    && getPlayerData(lastPlayer.playerId, playersRef).role === 'Striker')) {
    const defenders = playersArray.filter(p => getPlayerData(p.playerId, playersRef).role === 'Defender' || getPlayerData(p.playerId, playersRef).role === 'Any');
    if (defenders.length) {
      [player] = defenders;
    } else {
      console.log(player.rating, 'Unhandled Case');
    }
  }

  return playerListRandom(
    player,
    [player, ...players],
    shuffleArray(playersArray.filter(p => p.playerId !== player.playerId)),
    playersRef,
  );
};

const fillPlayerListGaps = (playerList) => {
  console.log('Fill gaps');
  return playerList;
};

const getUpcomingGames = (playerRankingArray, playersRef, unavailablePlayersIds = []) => {
  let sortedPlayerRankingArray = playerRankingArray.sort((a, b) => {
    if (a.rating < b.rating) return 1;
    if (a.rating > b.rating) return -1;
    return 0;
  });

  if (unavailablePlayersIds.length) {
    sortedPlayerRankingArray = sortedPlayerRankingArray
      .filter(rankingPlayer => !unavailablePlayersIds.includes(rankingPlayer.playerId));
  }

  const playerListResult = fillPlayerListGaps(playerListByRanking(
    null,
    [],
    sortedPlayerRankingArray,
    playersRef,
  ));

  // TODO: Fill players when they aren't multiple of 4 teams
  const playerList = playerListResult
    .map(rankingPlayer => getPlayerData(rankingPlayer.playerId, playersRef));

  return parsePlayerListToGames(playerList.reverse());
};

const getRandomUpcomingGames = (playerRankingArray, playersRef, unavailablePlayersIds = []) => {
  let sortedPlayerRankingArray = playerRankingArray;

  if (unavailablePlayersIds.length) {
    sortedPlayerRankingArray = sortedPlayerRankingArray
      .filter(rankingPlayer => !unavailablePlayersIds.includes(rankingPlayer.playerId));
  }

  const playerListResult = fillPlayerListGaps(
    playerListRandom(
      null,
      [],
      sortedPlayerRankingArray,
      playersRef,
    ),
  );

  // TODO: Fill players when they aren't multiple of 4 teams
  const playerList = playerListResult
    .map(rankingPlayer => getPlayerData(rankingPlayer.playerId, playersRef));

  return parsePlayerListToGames(playerList);
};

export {
  getUpcomingGames,
  getRandomUpcomingGames,
};
