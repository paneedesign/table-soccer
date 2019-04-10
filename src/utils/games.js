import { getPlayerData } from './players';

const getUpcomingGames = (playerRankingArray, playersRef, unavailablePlayers) => {
  console.debug('unavailablePlayers', unavailablePlayers);

  const sortedPlayerRankingArray = playerRankingArray.sort((a, b) => {
    if (a.rating < b.rating) return 1;
    if (a.rating > b.rating) return -1;
    return 0;
  });

  function recursivePlayers(lastPlayer, players, playersArray) {
    // console.log(lastPlayer, players, playersArray);

    if (playersArray.length === 0) {
      return players;
    }

    let [player] = playersArray;

    if (players.length === 0) {
      return recursivePlayers(
        player,
        [player, ...players],
        playersArray.filter(p => p.playerId !== player.playerId).reverse(),
      );
    }

    if (getPlayerData(player.playerId, playersRef).role === 'Defender'
      && getPlayerData(lastPlayer.playerId, playersRef).role === 'Defender') {
      const strikers = playersArray.find(p => getPlayerData(p.playerId, playersRef).role === 'Striker');
      if (strikers.length) {
        [player] = strikers;
      } else {
        console.log('unhandled case');
      }
    } else if ((getPlayerData(player.playerId, playersRef).role === 'Striker'
      && getPlayerData(lastPlayer.playerId, playersRef).role === 'Striker')) {
      const defenders = playersArray.find(p => getPlayerData(p.playerId, playersRef).role === 'Defender');
      if (defenders.length) {
        [player] = defenders;
      } else {
        console.log('unhandled case');
      }
    }

    return recursivePlayers(
      player,
      [player, ...players],
      playersArray.filter(p => p.playerId !== player.playerId).reverse(),
    );
  }

  const teams = recursivePlayers(null, [], sortedPlayerRankingArray);
  teams.reverse().forEach(t => console.log(getPlayerData(t.playerId, playersRef).fullName));
};

export { getUpcomingGames };
