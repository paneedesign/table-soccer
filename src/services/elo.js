const getRatingDelta = (myRating, opponentRating, myGameResult) => {
  if ([0, 0.5, 1].indexOf(myGameResult) === -1) {
    return null;
  }
  const kFactor = 16;
  const myChanceToWin = 1 / (1 + (10 ** ((opponentRating - myRating) / 400)));
  return Math.round(kFactor * (myGameResult - myChanceToWin));
};

const getNewRating = (myRating, opponentRating, myGameResult) => myRating
  + getRatingDelta(myRating, opponentRating, myGameResult);

export { getRatingDelta, getNewRating };
