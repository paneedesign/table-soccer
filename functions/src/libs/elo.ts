export enum GAME_RESULTS {
  LOSE = 0,
  WIN = 1,
  DRAW = 0.5,
}

export const getRatingDelta = (myRating: number, opponentRating: number, myGameResult: GAME_RESULTS): number => {
  const kFactor = 16;
  const myChanceToWin = 1 / (1 + (10 ** ((opponentRating - myRating) / 400)));
  return Math.round(kFactor * (myGameResult - myChanceToWin));
};

export const getNewRating = (myRating: number, opponentRating: number, myGameResult: number): number => myRating
    + getRatingDelta(myRating, opponentRating, myGameResult);
