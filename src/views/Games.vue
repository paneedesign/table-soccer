<template>
  <div class="games">
    <b-row class="align-items-center mb-4">
      <b-col lg="9" md="6">
        <h3 class="mb-0">Games</h3>
      </b-col>
      <b-col lg="3" md="6" class="text-right">
        <b-button v-b-modal.modal-prevent.add-game>Add game</b-button>
      </b-col>
    </b-row>
    <b-table
        id="games-table"
        responsive
        striped
        hover
        borderless
        :items="$store.getters.formatGames"
        :fields="tableFields"
        :sort-by.sync="gamesSortBy"
        :sort-desc.sync="gamesSortDesc"
        :busy="isLoading"
        @sort-changed="sortingChanged">
        <template slot="redDefender" slot-scope="data">
          <div class="d-flex align-items-center"
               :class="{'team-won': redTeamWon(data.item)}">
            <b-img
              v-if="data.item.redDefender.pictureUrl"
              class="mr-2"
              :src="data.item.redDefender.pictureUrl"
              rounded="circle"
              width="20"
              height="20" />
            <div>
              <span>{{ data.item.redDefender.fullName | formatFullName }}</span>
            </div>
          </div>
        </template>
        <template slot="redStriker" slot-scope="data">
          <div class="d-flex align-items-center"
               :class="{'team-won': redTeamWon(data.item)}">
            <b-img
              v-if="data.item.redStriker.pictureUrl"
              class="mr-2"
              :src="data.item.redStriker.pictureUrl"
              rounded="circle"
              width="20"
              height="20" />
            <div>
              <span>{{ data.item.redStriker.fullName | formatFullName }}</span>
            </div>
          </div>
        </template>
        <template slot="blueDefender" slot-scope="data">
          <div class="d-flex align-items-center"
               :class="{'team-won': !redTeamWon(data.item)}">
            <b-img
              v-if="data.item.blueDefender.pictureUrl"
              class="mr-2"
              :src="data.item.blueDefender.pictureUrl"
              rounded="circle"
              width="20"
              height="20" />
            <div>
              <span>{{ data.item.blueDefender.fullName | formatFullName }}</span>
            </div>
          </div>
        </template>
        <template slot="blueStriker" slot-scope="data">
          <div class="d-flex align-items-center"
               :class="{'team-won': !redTeamWon(data.item)}">
            <b-img
              v-if="data.item.blueStriker.pictureUrl"
              class="mr-2"
              :src="data.item.blueStriker.pictureUrl"
              rounded="circle"
              width="20"
              height="20" />
            <div>
              <span>{{ data.item.blueStriker.fullName | formatFullName }}</span>
            </div>
          </div>
        </template>
        <template slot="site" slot-scope="data">
          <span v-if="data.item.site === SITES.CATANIA">🌇</span>
          <span v-else-if="data.item.site === SITES.MILAN">🌉</span>
          <span v-else-if="data.item.site === SITES.RAGUSA">🌃</span>
          <span>{{ data.item.site}}</span>
        </template>
        <template slot="timestamp" slot-scope="data">
          {{ data.item.timestamp.toLocaleDateString() }}
        </template>
        <template slot="actions" slot-scope="data">
          <div class="text-center cursor-pointer">
              <span @click="handleRemoveGame(data.item)"
                    v-if="canRemoveGame(data.item)">❌️</span>
          </div>
        </template>
      </b-table>
    <div v-if="isLoading"
         class="text-center">
      <b-spinner></b-spinner>
    </div>

    <div v-infinite-scroll="loadMore"
         infinite-scroll-disabled="isInfiniteScrollDisabled"
         infinite-scroll-immediate-check="false"></div>

    <!-- Modals -->
    <b-modal
      id="add-game"
      title="Add new game"
      @ok="handleAddOk"
      size="lg"
      ref="add-game-modal">
      <form @submit.stop.prevent="handleSubmit">
        <b-row>
          <b-col lg="6" xs="12">
            <h3>Red Team</h3>
            <label for="red-team-defender">Defender</label>
            <v-select
              id="red-team-defender"
              v-validate="'required'"
              name="red-team-defender"
              :class="{'is-danger': errors.has('red-team-defender')}"
              v-model="newGame.redTeam.defender"
              :options="players"
              placeholder="Select a defender"
              class="mb-3"></v-select>
            <label for="red-team-striker">Striker</label>
            <v-select
              id="red-team-striker"
              v-validate="'required'"
              name="red-team-striker"
              :class="{'is-danger': errors.has('red-team-striker')}"
              v-model="newGame.redTeam.striker"
              :options="players"
              placeholder="Select a striker"
              class="mb-3"></v-select>
            <label for="red-team-score">Score</label>
            <b-form-input
              id="red-team-score"
              v-validate="'required|min_value:0'"
              name="red-team-score"
              :class="{'is-danger': errors.has('red-team-score')}"
              v-model="newGame.redTeam.score"
              placeholder="Enter score" type="number"
              class="mb-3"></b-form-input>
          </b-col>
          <b-col lg="6" xs="12">
            <h3>Blue Team</h3>
            <label for="red-team-defender">Defender</label>
            <v-select
              id="blue-team-defender"
              v-validate="'required'"
              name="blue-team-defender"
              :class="{'is-danger': errors.has('blue-team-defender')}"
              v-model="newGame.blueTeam.defender"
              :options="players"
              placeholder="Select a defender"
              class="mb-3"></v-select>
            <label for="red-team-striker">Striker</label>
            <v-select
              id="blue-team-striker"
              v-validate="'required'"
              name="blue-team-striker"
              :class="{'is-danger': errors.has('blue-team-striker')}"
              v-model="newGame.blueTeam.striker"
              :options="players"
              placeholder="Select a striker"
              class="mb-3"></v-select>
            <label for="blue-team-score">Score</label>
            <b-form-input
              id="blue-team-score"
              v-validate="'required|min_value:0'"
              name="blue-team-score"
              :class="{'is-danger': errors.has('blue-team-score')}"
              v-model="newGame.blueTeam.score"
              placeholder="Enter score" type="number"
              class="mb-3"></b-form-input>
          </b-col>
          <b-col lg="12">
            <label for="site">Site</label>
            <v-select
              id="site"
              name="site"
              v-validate="'required'"
              v-model="newGame.site"
              :options="siteOptions"
              :class="{'is-danger': errors.has('site')}"
              class="mb-3"
              readonly></v-select>
          </b-col>
        </b-row>
      </form>
    </b-modal>

    <b-modal
      id="remove-game"
      title="Are you sure to remove this game?"
      @ok="handleRemoveOk"
      ref="remove-game-modal">
      😱 This action is irreversible. Watch out! 😱
    </b-modal>
  </div>
</template>

<script>
import vSelect from 'vue-select';
import infiniteScroll from 'vue-infinite-scroll';
import SITES from '../utils/sites';
import { firestore } from '../firebase';

const gameModel = () => ({
  redTeam: {
    defender: null,
    striker: null,
    score: null,
  },
  blueTeam: {
    defender: null,
    striker: null,
    score: null,
  },
  site: 'Catania',
});

export default {
  name: 'Games',
  directives: {
    infiniteScroll,
  },
  data() {
    return {
      pending: false,
      gameIdToRemove: null,
      tableFields: [
        'redDefender',
        'redStriker',
        'blueDefender',
        'blueStriker',
        'redScore',
        'blueScore',
        'site',
        { key: 'timestamp', label: 'Date', sortable: true },
        'actions',
      ],
      gamesSortBy: 'timestamp',
      gamesSortDesc: true,
      newGame: { ...gameModel() },
      SITES,
    };
  },
  components: {
    vSelect,
  },
  computed: {
    isLoading() {
      return this.$store.state.playersRef.pending
      || this.$store.state.games.pending;
    },
    isInfiniteScrollDisabled() {
      return !this.$store.getters.hasMoreGames;
    },
    players() {
      return this.$store.state.playersRef.data
        .filter(({ id }) => !((this.newGame.redTeam.defender && this.newGame.redTeam.defender.value === id) // eslint-disable-line
          || (this.newGame.redTeam.striker && this.newGame.redTeam.striker.value === id)
          || (this.newGame.blueTeam.defender && this.newGame.blueTeam.defender.value === id)
          || (this.newGame.blueTeam.striker && this.newGame.blueTeam.striker.value === id)))
        .map(playerRef => ({
          value: playerRef.id,
          label: playerRef.data().fullName,
        }));
    },
    siteOptions() {
      return Object.keys(SITES).map(site => SITES[site]);
    },
  },
  mounted() {
    this.$store.dispatch('fetchGames');
  },
  methods: {
    loadMore() {
      if (!this.isLoading) {
        this.$store.dispatch('fetchMoreGames');
      }
    },
    sortingChanged(context) {
      this.$store.dispatch('changeGamesOrder', {
        prop: context.sortBy,
        value: context.sortDesc ? 'desc' : 'asc',
      });
    },
    redTeamWon(game) {
      return Number(game.redScore) > Number(game.blueScore);
    },
    canRemoveGame(game) {
      const { timestamp } = game;
      return timestamp.toLocaleDateString() === new Date().toLocaleDateString();
    },
    handleRemoveGame(game) {
      const { id } = game;
      this.gameIdToRemove = id;
      this.$refs['remove-game-modal'].show();
    },
    handleRemoveOk() {
      firestore.collection('games').doc(this.gameIdToRemove).delete().then(() => {
        this.$toasted.show('Success: Game Removed', { type: 'success' });
        this.gameIdToRemove = null;
      })
        .catch((error) => {
          console.error('Error removing document: ', error);
          this.$toasted.show(`Error: ${error.message}`, { type: 'error' });
          this.gameIdToRemove = null;
        });
    },
    async handleAddOk(event) {
      event.preventDefault();
      const valid = await this.$validator.validateAll();

      if (!valid) {
        this.$toasted.show('Error: Check your data and retry', { type: 'error' });
        return;
      }

      this.handleSubmit();
    },
    async handleSubmit() {
      if (this.pending) return;
      this.pending = true;

      const valid = await this.$validator.validateAll();
      if (!valid) {
        this.$toasted.show('Error: Check your data and retry', { type: 'error' });
        this.pending = false;
        return;
      }

      const data = {
        redTeam: {
          defender: firestore.doc(`players/${this.newGame.redTeam.defender.value}`),
          striker: firestore.doc(`players/${this.newGame.redTeam.striker.value}`),
          score: parseInt(this.newGame.redTeam.score, 10),
        },
        blueTeam: {
          defender: firestore.doc(`players/${this.newGame.blueTeam.defender.value}`),
          striker: firestore.doc(`players/${this.newGame.blueTeam.striker.value}`),
          score: parseInt(this.newGame.blueTeam.score, 10),
        },
        timestamp: new Date(),
        site: this.newGame.site,
      };

      firestore
        .collection('games')
        .add(data)
        .then(() => {
          this.$nextTick(() => {
            this.$refs['add-game-modal'].hide();
            this.newGame = { ...gameModel() };
            this.errors.clear();
            this.$toasted.show('Success: Game inserted', { type: 'success' });
          });
        })
        .catch((error) => {
          console.error('Error adding document: ', error);
          this.$toasted.show(`Error: ${error.message}`, { type: 'error' });
        })
        .finally(() => {
          this.pending = false;
        });
    },
  },
};
</script>

<style lang="scss">
  .cursor-pointer {
    cursor: pointer;
  }

  .team-won {
    color: #568a62;
  }

  .is-danger {
    border-color: #ff6262;

    > .dropdown-toggle {
      border-color: #ff6262;
    }
  }
</style>
