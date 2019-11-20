<template>
  <div class="ranking">
    <b-row class="align-items-center mb-4">
      <b-col lg="9" md="6">
        <h3>Ranking</h3>
      </b-col>
      <b-col lg="3" md="6">
        <v-select
          id="site"
          name="site"
          v-model="rankingSite"
          :options="siteOptions"
          class="mb-3"
          readonly></v-select>
      </b-col>
    </b-row>

    <b-tabs content-class="mt-2" v-if="$store.state.gamesRef.length">
      <b-tab :title="`Player Ranking (${rankingSite})`" active>
        <b-row>
          <b-col lg="12">
            <b-table responsive
                     striped
                     hover
                     borderless
                     :fields="playerTableFields"
                     :items="$store.getters.parsedPlayerRanking(rankingSite)"
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
            <div v-if="$store.getters.parsedPlayerRanking(rankingSite).length === 0">
              <p class="text-center">No games, no ranking</p>
            </div>
          </b-col>
        </b-row>
      </b-tab>
      <b-tab :title="`Team Ranking (${rankingSite})`">
        <b-row>
          <b-col lg="12">
            <b-table
              v-if="$store.state.gamesRef.length"
              responsive
              striped
              hover
              borderless
              :fields="teamTableFields"
              :items="$store.getters.parsedTeamRanking(rankingSite)"
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
    <div class="text-center" v-else>
      <b-spinner></b-spinner>
    </div>
  </div>
</template>

<script>
import vSelect from 'vue-select';
import { parseFullName } from '../utils/parse';
import SITES from '../utils/sites';

export default {
  name: 'Ranking',
  components: {
    'v-select': vSelect,
  },
  data() {
    return {
      rankingSite: SITES.CATANIA,
      playerSortBy: 'rating',
      playerSortDesc: true,
      playerTableFields: [
        { key: 'position', sortable: false },
        { key: 'player', sortable: false },
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
  computed: {
    siteOptions() {
      return Object.keys(SITES).map(site => SITES[site]);
    },
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
