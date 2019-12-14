const getPlayerData = (playerId, playersRef) => playersRef
  .find(player => player.id === playerId).data();

export default getPlayerData;
