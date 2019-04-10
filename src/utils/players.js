const getPlayerData = (playerId, playersRef) => {
  return playersRef.find(player => player.id === playerId).data();
};

export { getPlayerData };
