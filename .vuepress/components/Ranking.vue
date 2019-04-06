<template>
  <div>
    <b-row>
      <b-col lg="10" offset-lg="1">
        <b-table v-if="ranking.length" responsive striped hover :items="ranking" :fields="tableFields">
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
        ranking: [],
        tableFields: [
          'position',
          'player',
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
          let rankingObject = {};

          querySnapshot.forEach((doc) => {
            rankingObject = this.updatePlayersRanking(rankingObject, doc);
          });

          this.ranking = this.parseRanking(rankingObject);
        });
    },
    methods: {
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
      parseRanking(rankingObject) {
        return Object.keys(rankingObject).map((key) => {
          const player = this.playersRef.find(player => player.id === key).data();
          return {
            player: player.name,
            score: rankingObject[key]
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
