const getPlayerData = (playerId, playersRef) => playersRef
  .find(player => player.id === playerId).data();

const getPlayerIdByUid = (playerUid, playerRef) => playerRef
  .find(player => player.data().uid === playerUid).id;

export {
  getPlayerData,
  getPlayerIdByUid,
};
