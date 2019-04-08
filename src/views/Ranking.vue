<template>
  <div class="ranking">

    <b-tabs content-class="mt-3">
      <b-tab title="Player Ranking" active>
        <b-row>
          <b-col lg="12">
            <b-table v-if="$store.state.gamesRef.length"
                     responsive
                     striped
                     hover
                     :fields="playerTableFields"
                     :items="$store.getters.parsedPlayerRanking"
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
              v-if="$store.state.gamesRef.length"
              responsive
              striped
              hover
              :fields="teamTableFields"
              :items="$store.getters.parsedTeamRanking"
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
export default {
  name: 'Ranking',
  data() {
    return {
      playerSortBy: 'score',
      playerSortDesc: true,
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
  async mounted() {
    this.$store.dispatch('getGames');
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
