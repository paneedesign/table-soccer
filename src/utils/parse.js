import { getPlayerData } from './players';

const minPlayedMatch = 15;

const parseFullName = (fullName) => {
  const [name, surname, ...other] = fullName.split(' ');
  return `${name} ${surname.charAt(0).toUpperCase()}. ${other.map(o => `${o.charAt(0).toUpperCase()}.`)}`;
};

// TODO: Move all this functions directly into getters
const parseGames = (games, playersRef) => games.map(game => ({
  id: game.docId,
  redDefender: getPlayerData(game.redTeam.defender.id, playersRef),
  redStriker: getPlayerData(game.redTeam.striker.id, playersRef),
  blueDefender: getPlayerData(game.blueTeam.defender.id, playersRef),
  blueStriker: getPlayerData(game.blueTeam.striker.id, playersRef),
  redScore: game.redTeam.score,
  blueScore: game.blueTeam.score,
  site: game.site,
  timestamp: game.timestamp.toDate(),
}));

const parsePlayerRanking = (rankingArray, playersRef) => Object.keys(rankingArray)
  .map((rankingKey) => {
    const ranking = rankingArray[rankingKey];
    const player = getPlayerData(rankingKey, playersRef);

    return {
      player,
      lost: ranking.played - ranking.won,
      ...ranking,
    };
  }).filter(rankingPlayer => rankingPlayer.player.enabled && rankingPlayer.played > minPlayedMatch);

const parseTeamRanking = (rankingArray, playersRef) => Object.keys(rankingArray)
  .map((rankingKey) => {
    const ranking = rankingArray[rankingKey];
    const [defenderId, strikerId] = rankingKey.split('-');
    const defender = getPlayerData(defenderId, playersRef);
    const striker = getPlayerData(strikerId, playersRef);

    return {
      defender,
      striker,
      lost: ranking.played - ranking.won,
      ...ranking,
    };
  }).filter(rankingPlayer => rankingPlayer.defender.enabled && rankingPlayer.striker.enabled);

export {
  parseGames,
  parseFullName,
  parsePlayerRanking,
  parseTeamRanking,
};
