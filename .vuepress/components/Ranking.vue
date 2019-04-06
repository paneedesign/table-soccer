<template>
  <div class="ranking">
    <b-row>
      <b-col lg="6">
        <h5 class="mb-3">Player Ranking</h5>
        <b-table v-if="playerRanking.length" responsive striped hover :items="playerRanking" :fields="playerTableFields">
          <template slot="position" slot-scope="data">
            {{ data.index + 1 }}
          </template>
        </b-table>
        <h4 v-else class="text-center">
          <b-spinner></b-spinner>
        </h4>
      </b-col>
      <b-col lg="6">
        <h5 class="mb-3">Team Ranking</h5>
        <b-table v-if="teamRanking.length" responsive striped hover :items="teamRanking" :fields="teamTableFields">
          <template slot="position" slot-scope="data">
            {{ data.index + 1 }}
          </template>
        </b-table>
        <h4 v-else class="text-center">
          <b-spinner></b-spinner>
        </h4>
      </b-col>
    </b-row>
  </div>
</template>

<script>
  import * as Elo from '../services/elo';

  export default {
    name: 'Ranking',
    data() {
      return {
        playersRef: [],
        playerRanking: [],
        teamRanking: [],
        playerTableFields: [
          'position',
          'player',
          'score',
        ],
        teamTableFields: [
          'position',
          'defender',
          'striker',
          'score',
        ],
      };
    },
    async firebaseReady() {
      await this.$firestore
        .collection('players')
        .orderBy('name', 'asc')
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach(doc => this.playersRef.push(doc));
        });

      this.$firestore
        .collection('games')
        .orderBy('timestamp', 'desc')
        .onSnapshot((querySnapshot) => {
          let playerRankingObject = {};
          let teamRankingObject = {};

          querySnapshot.forEach((doc) => {
            playerRankingObject = this.updatePlayersRanking(playerRankingObject, doc);
            teamRankingObject = this.updateTeamsRanking(teamRankingObject, doc);
          });

          this.playerRanking = this.parsePlayerRanking(playerRankingObject);
          this.teamRanking = this.parseTeamRanking(teamRankingObject);
        });
    },
    methods: {
      updateTeamsRanking(ranking, gameRef) {
        const game = gameRef.data();
        const redDefender = this.playersRef.find(player => player.id === game.redTeam.defender.id);
        const redStriker = this.playersRef.find(player => player.id === game.redTeam.striker.id);
        const blueDefender = this.playersRef.find(player => player.id === game.blueTeam.defender.id);
        const blueStriker = this.playersRef.find(player => player.id === game.blueTeam.striker.id);

        const baseRanking = {
          [`${redDefender.id}-${redStriker.id}`]: 1000,
          [`${blueDefender.id}-${blueStriker.id}`]: 1000,
        };

        ranking = { ...baseRanking, ...ranking };

        const redTeamRating = ranking[`${redDefender.id}-${redStriker.id}`];
        const blueTeamRating = ranking[`${blueDefender.id}-${blueStriker.id}`];

        // Get team results
        const redTeamResult = game.redTeam.score > game.blueTeam.score ? 1 : 0;
        const blueTeamResult = redTeamResult === 0 ? 1 : 0;

        // Get new ratings
        const newRedRating = Elo.getNewRating(redTeamRating, blueTeamRating, redTeamResult);
        const newBlueRating = Elo.getNewRating(blueTeamRating, redTeamRating, blueTeamResult);

        const redDelta = newRedRating - redTeamRating;
        const blueDelta = newBlueRating - blueTeamRating;

        ranking[`${redDefender.id}-${redStriker.id}`] += redDelta;
        ranking[`${blueDefender.id}-${blueStriker.id}`] += blueDelta;

        return ranking;
      },
      updatePlayersRanking(ranking, gameRef) {
        const game = gameRef.data();
        const redDefender = this.playersRef.find(player => player.id === game.redTeam.defender.id);
        const redStriker = this.playersRef.find(player => player.id === game.redTeam.striker.id);
        const blueDefender = this.playersRef.find(player => player.id === game.blueTeam.defender.id);
        const blueStriker = this.playersRef.find(player => player.id === game.blueTeam.striker.id);

        const baseRanking = {
          [redDefender.id]: 1000,
          [redStriker.id]: 1000,
          [blueDefender.id]: 1000,
          [blueStriker.id]: 1000,
        };

        ranking = { ...baseRanking, ...ranking };

        const redTeamRating = ranking[redDefender.id] + ranking[redStriker.id];
        const blueTeamRating = ranking[blueDefender.id] + ranking[blueStriker.id];

        // Get team results
        const redTeamResult = game.redTeam.score > game.blueTeam.score ? 1 : 0;
        const blueTeamResult = redTeamResult === 0 ? 1 : 0;

        // Get new ratings
        const newRedRating = Elo.getNewRating(redTeamRating, blueTeamRating, redTeamResult);
        const newBlueRating = Elo.getNewRating(blueTeamRating, redTeamRating, blueTeamResult);

        const redDelta = newRedRating - redTeamRating;
        const blueDelta = newBlueRating - blueTeamRating;

        ranking[redDefender.id] += redDelta;
        ranking[redStriker.id] += redDelta;
        ranking[blueDefender.id] += blueDelta;
        ranking[blueStriker.id] += blueDelta;

        return ranking;
      },
      parsePlayerRanking(rankingObject) {
        return Object.keys(rankingObject).map((key) => {
          const player = this.playersRef.find(player => player.id === key).data();
          return {
            player: `${player.name} ${player.surname.charAt(0).toUpperCase()}.`,
            score: rankingObject[key],
          }
        }).sort((rankA, rankB) => {
          if (rankA.score > rankB.score) return -1;
          if (rankA.score < rankB.score) return 1;
          return 0;
        });
      },
      parseTeamRanking(rankingObject) {
        console.log(rankingObject);
        return Object.keys(rankingObject).map((key) => {
          let [ defender, striker ] = key.split('-');
          defender = this.playersRef.find(player => player.id === defender).data();
          striker = this.playersRef.find(player => player.id === striker).data();

          return {
            defender: `${defender.name} ${defender.surname.charAt(0).toUpperCase()}.`,
            striker: `${striker.name} ${striker.surname.charAt(0).toUpperCase()}.`,
            score: rankingObject[key],
          }
        }).sort((rankA, rankB) => {
          if (rankA.score > rankB.score) return -1;
          if (rankA.score < rankB.score) return 1;
          return 0;
        });
      },
    },
  };
</script>

<style lang="scss">
  .ranking tbody {
    > [role="row"]:nth-child(1),
    > [role="row"]:nth-child(2),
    > [role="row"]:nth-child(3) {
      color: #fff;
    }

    > [role="row"]:nth-child(1) {
      background-color: #dc3545;
    }

    > [role="row"]:nth-child(2) {
      background-color: #17a2b8d9;
    }

    > [role="row"]:nth-child(3) {
      background-color: #80bdff;
    }
  }
</style>
