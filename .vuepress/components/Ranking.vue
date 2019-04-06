<template>
  <div class="ranking">

    <b-tabs content-class="mt-3">
      <b-tab title="Player Ranking" active>
        <b-row>
          <b-col lg="12">
            <b-table v-if="playerRanking.length"
                     responsive
                     striped
                     hover
                     :fields="playerTableFields"
                     :items="playerRanking"
                     :sort-by.sync="playerSortBy"
                     :sort-desc.sync="playerSortDesc">
              <template slot="position" slot-scope="data">
                {{ data.index + 1 }}
              </template>
            </b-table>
            <h4 v-else class="text-center">
              <b-spinner></b-spinner>
            </h4>
          </b-col>
        </b-row>
      </b-tab>
      <b-tab title="Team Ranking">
        <b-row>
          <b-col lg="12">
            <b-table
              v-if="teamRanking.length"
              responsive
              striped
              hover
              :fields="teamTableFields"
              :items="teamRanking"
              :sort-by.sync="teamSortBy"
              :sort-desc.sync="teamSortDesc">
              <template slot="position" slot-scope="data">
                {{ data.index + 1 }}
              </template>
            </b-table>
            <h4 v-else class="text-center">
              <b-spinner></b-spinner>
            </h4>
          </b-col>
        </b-row>
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>
  import * as Elo from '../services/elo';

  export default {
    name: 'Ranking',
    data() {
      return {
        playersRef: [],
        playerSortBy: 'score',
        playerSortDesc: true,
        playerRanking: [],
        teamRanking: [],
        playerTableFields: [
          { key: 'position', sortable: false },
          { key: 'player', sortable: false },
          { key: 'score', sortable: true },
          { key: 'played', sortable: true },
          { key: 'won', sortable: true },
          { key: 'lost', sortable: true },
          { key: 'GF', sortable: true },
          { key: 'GS', sortable: true },
        ],
        teamSortBy: 'score',
        teamSortDesc: true,
        teamTableFields: [
          { key: 'position', sortable: false },
          { key: 'defender', sortable: false },
          { key: 'striker', sortable: false },
          { key: 'score', sortable: true },
          { key: 'played', sortable: true },
          { key: 'won', sortable: true },
          { key: 'lost', sortable: true },
          { key: 'GF', sortable: true },
          { key: 'GS', sortable: true },
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
        const redTeam = `${redDefender.id}-${redStriker.id}`;
        const blueTeam = `${blueDefender.id}-${blueStriker.id}`;

        const baseRanking = {
          [redTeam]: { won: 0, played: 0, golScored: 0, goalSuffered: 0, rating: 1000 },
          [blueTeam]: { won: 0, played: 0, golScored: 0, goalSuffered: 0, rating: 1000 },
        };

        ranking = { ...baseRanking, ...ranking };

        const redTeamRating = ranking[redTeam].rating;
        const blueTeamRating = ranking[blueTeam].rating;

        // Get team results
        const redTeamResult = game.redTeam.score > game.blueTeam.score ? 1 : 0;
        const blueTeamResult = redTeamResult === 0 ? 1 : 0;

        // Get new ratings
        const newRedRating = Elo.getNewRating(redTeamRating, blueTeamRating, redTeamResult);
        const newBlueRating = Elo.getNewRating(blueTeamRating, redTeamRating, blueTeamResult);

        const redDelta = newRedRating - redTeamRating;
        const blueDelta = newBlueRating - blueTeamRating;

        ranking[redTeam].rating += redDelta;
        ranking[blueTeam].rating += blueDelta;

        ranking[redTeam].played += 1;
        ranking[blueTeam].played += 1;

        ranking[redTeam].won += redTeamResult;
        ranking[blueTeam].won += blueTeamResult;

        ranking[redTeam].golScored += game.redTeam.score;
        ranking[blueTeam].golScored += game.blueTeam.score;

        ranking[redTeam].goalSuffered += game.blueTeam.score;
        ranking[blueTeam].goalSuffered += game.redTeam.score;

        return ranking;
      },
      updatePlayersRanking(ranking, gameRef) {
        const game = gameRef.data();
        const redDefender = this.playersRef.find(player => player.id === game.redTeam.defender.id);
        const redStriker = this.playersRef.find(player => player.id === game.redTeam.striker.id);
        const blueDefender = this.playersRef.find(player => player.id === game.blueTeam.defender.id);
        const blueStriker = this.playersRef.find(player => player.id === game.blueTeam.striker.id);

        const baseRanking = {
          [redDefender.id]: { won: 0, played: 0, golScored: 0, goalSuffered: 0, rating: 1000 },
          [redStriker.id]: { won: 0, played: 0, golScored: 0, goalSuffered: 0, rating: 1000 },
          [blueDefender.id]: { won: 0, played: 0, golScored: 0, goalSuffered: 0, rating: 1000 },
          [blueStriker.id]: { won: 0, played: 0, golScored: 0, goalSuffered: 0, rating: 1000 },
        };

        ranking = { ...baseRanking, ...ranking };

        const redTeamRating = ranking[redDefender.id].rating + ranking[redStriker.id].rating;
        const blueTeamRating = ranking[blueDefender.id].rating + ranking[blueStriker.id].rating;

        // Get team results
        const redTeamResult = game.redTeam.score > game.blueTeam.score ? 1 : 0;
        const blueTeamResult = redTeamResult === 0 ? 1 : 0;

        // Get new ratings
        const newRedRating = Elo.getNewRating(redTeamRating, blueTeamRating, redTeamResult);
        const newBlueRating = Elo.getNewRating(blueTeamRating, redTeamRating, blueTeamResult);

        const redDelta = newRedRating - redTeamRating;
        const blueDelta = newBlueRating - blueTeamRating;

        ranking[redDefender.id].rating += redDelta;
        ranking[redStriker.id].rating += redDelta;
        ranking[blueDefender.id].rating += blueDelta;
        ranking[blueStriker.id].rating += blueDelta;

        ranking[redDefender.id].played += 1;
        ranking[redStriker.id].played += 1;
        ranking[blueDefender.id].played += 1;
        ranking[blueStriker.id].played += 1;

        ranking[redDefender.id].won += redTeamResult;
        ranking[redStriker.id].won += redTeamResult;
        ranking[blueDefender.id].won += blueTeamResult;
        ranking[blueStriker.id].won += blueTeamResult;

        ranking[redDefender.id].golScored += game.redTeam.score;
        ranking[redStriker.id].golScored += game.redTeam.score;
        ranking[blueDefender.id].golScored += game.blueTeam.score;
        ranking[blueStriker.id].golScored += game.blueTeam.score;

        ranking[redDefender.id].goalSuffered += game.blueTeam.score;
        ranking[redStriker.id].goalSuffered += game.blueTeam.score;
        ranking[blueDefender.id].goalSuffered += game.redTeam.score;
        ranking[blueStriker.id].goalSuffered += game.redTeam.score;

        return ranking;
      },
      parsePlayerRanking(rankingObject) {
        return Object.keys(rankingObject).map((key) => {
          const player = this.playersRef.find(player => player.id === key).data();
          return {
            player: `${player.name} ${player.surname.charAt(0).toUpperCase()}.`,
            played: rankingObject[key].played,
            score: rankingObject[key].rating,
            won: rankingObject[key].won,
            lost: rankingObject[key].played - rankingObject[key].won,
            GF: rankingObject[key].golScored,
            GS: rankingObject[key].goalSuffered,
          }
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
            played: rankingObject[key].played,
            won: rankingObject[key].won,
            lost: rankingObject[key].played - rankingObject[key].won,
            GF: rankingObject[key].golScored,
            GS: rankingObject[key].goalSuffered,
            score: rankingObject[key].rating,
          }
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
