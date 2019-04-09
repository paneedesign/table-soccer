const parseFullName = (fullName) => {
  const [name, surname, ...other] = fullName.split(' ');
  return `${name} ${surname.charAt(0).toUpperCase()}. ${other.map(o => `${o.charAt(0).toUpperCase()}.`)}`;
};

const parseDate = date => `${`${date.getDate() < 10 ? '0' : ''}${date.getDate()}/${`${date.getMonth() < 10 ? '0' : ''}${date.getMonth()}`}`}/${date.getFullYear()} ${date.getHours()}:${`${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`}`;

const parseGames = (gamesRef, playersRef) => {
  const games = [];

  gamesRef.forEach((gameRef) => {
    const game = gameRef.data();
    const redDefender = playersRef
      .find(player => player.id === game.redTeam.defender.id).data();
    const redStriker = playersRef
      .find(player => player.id === game.redTeam.striker.id).data();
    const blueDefender = playersRef
      .find(player => player.id === game.blueTeam.defender.id).data();
    const blueStriker = playersRef
      .find(player => player.id === game.blueTeam.striker.id).data();

    games.push({
      id: gameRef.id,
      redDefender: parseFullName(redDefender.fullName),
      redStriker: parseFullName(redStriker.fullName),
      blueDefender: parseFullName(blueDefender.fullName),
      blueStriker: parseFullName(blueStriker.fullName),
      redScore: game.redTeam.score,
      blueScore: game.blueTeam.score,
      location: `🌇 ${game.site}`,
      timestamp: game.timestamp.toDate(),
      parsedDate: parseDate(game.timestamp.toDate()),
    });
  });

  return games;
};

const parsePlayerRanking = (rankingObject, playersRef) => Object.keys(rankingObject).map((key) => {
  const player = playersRef.find(playerRef => playerRef.id === key).data();
  return {
    player: parseFullName(player.fullName),
    played: rankingObject[key].played,
    score: rankingObject[key].rating,
    won: rankingObject[key].won,
    lost: rankingObject[key].played - rankingObject[key].won,
    GF: rankingObject[key].golScored,
    GS: rankingObject[key].goalSuffered,
  };
});

const parseTeamRanking = (rankingObject, playersRef) => Object.keys(rankingObject).map((key) => {
  let [defender, striker] = key.split('-');
  defender = playersRef.find(player => player.id === defender).data();
  striker = playersRef.find(player => player.id === striker).data();

  return {
    defender: parseFullName(defender.fullName),
    striker: parseFullName(striker.fullName),
    played: rankingObject[key].played,
    won: rankingObject[key].won,
    lost: rankingObject[key].played - rankingObject[key].won,
    GF: rankingObject[key].golScored,
    GS: rankingObject[key].goalSuffered,
    score: rankingObject[key].rating,
  };
});

export {
  parseDate,
  parseGames,
  parseFullName,
  parsePlayerRanking,
  parseTeamRanking,
};
