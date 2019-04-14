<template>
  <div class="ranking">
    <b-tabs content-class="mt-3" pills card>
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
              <template slot="player" slot-scope="data">
                <div class="d-flex align-items-center">
                  <b-img
                    v-if="data.item.player.pictureUrl"
                    class="mr-2"
                    :src="data.item.player.pictureUrl"
                    rounded="circle"
                    width="45"
                    height="45" />
                  <div class="d-flex flex-column">
                    <span>{{ parseFullName(data.item.player) }}</span>
                    <small>{{ data.item.player.role }}</small>
                  </div>
                </div>
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
              <template slot="defender" slot-scope="data">
                <div class="d-flex align-items-center">
                  <b-img
                    v-if="data.item.defender.pictureUrl"
                    class="mr-2"
                    :src="data.item.defender.pictureUrl"
                    rounded="circle"
                    width="20"
                    height="20" />
                  <div>
                    <span>{{ parseFullName(data.item.defender) }}</span>
                  </div>
                </div>
              </template>
              <template slot="striker" slot-scope="data">
                <div class="d-flex align-items-center">
                  <b-img
                    v-if="data.item.striker.pictureUrl"
                    class="mr-2"
                    :src="data.item.striker.pictureUrl"
                    rounded="circle"
                    width="20"
                    height="20" />
                  <div>
                    <span>{{ parseFullName(data.item.striker) }}</span>
                  </div>
                </div>
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
import { parseFullName } from '../utils/parse';

export default {
  name: 'Ranking',
  data() {
    return {
      playerSortBy: 'rating',
      playerSortDesc: true,
      playerTableFields: [
        { key: 'position', sortable: false },
        { key: 'player', sortable: false },
        { key: 'role', sortable: false },
        { key: 'rating', label: 'Score', sortable: true },
        { key: 'played', sortable: true },
        { key: 'won', sortable: true },
        { key: 'lost', sortable: true },
        { key: 'goalScored', label: 'GF', sortable: true },
        { key: 'goalSuffered', label: 'GS', sortable: true },
      ],
      teamSortBy: 'rating',
      teamSortDesc: true,
      teamTableFields: [
        { key: 'position', sortable: false },
        { key: 'defender', sortable: false },
        { key: 'striker', sortable: false },
        { key: 'rating', label: 'Score', sortable: true },
        { key: 'played', sortable: true },
        { key: 'won', sortable: true },
        { key: 'lost', sortable: true },
        { key: 'goalScored', label: 'GF', sortable: true },
        { key: 'goalSuffered', label: 'GS', sortable: true },
      ],
    };
  },
  async mounted() {
    this.$store.dispatch('getGames');
  },
  methods: {
    parseFullName(item) {
      return parseFullName(item.fullName);
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
