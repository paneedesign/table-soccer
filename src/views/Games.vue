<template>
  <div class="games">
    <b-tabs content-class="mt-3">
      <b-tab title="Games" active>
        <b-row class="align-items-center mb-4 pt-3">
          <b-col xs="6">
            <h4 class="mb-0">Game list</h4>
          </b-col>
          <b-col xs="6" class="text-right">
            <b-button v-b-modal.modal-prevent.add-game>Add game</b-button>
          </b-col>
        </b-row>
        <b-row>
          <b-col lg="12">
            <div v-if="$store.state.gamesRef.length">
              <b-table
                id="games-table"
                responsive
                striped
                hover
                :items="$store.getters.parsedGames"
                :fields="tableFields"
                :per-page="perPage"
                :current-page="currentPage"
                :sort-by.sync="gamesSortBy"
                :sort-desc.sync="gamesSortDesc">
                <template slot="redDefender" slot-scope="data">
                  <div class="d-flex align-items-center"
                       :class="{'team-won' : data.item.redScore > data.item.blueScore}">
                    <b-img
                      v-if="data.item.redDefender.pictureUrl"
                      class="mr-2"
                      :src="data.item.redDefender.pictureUrl"
                      rounded="circle"
                      width="20"
                      height="20" />
                    <div>
                      <span>{{ parseFullName(data.item.redDefender) }}</span>
                    </div>
                  </div>
                </template>
                <template slot="redStriker" slot-scope="data">
                  <div class="d-flex align-items-center"
                       :class="{'team-won' : data.item.redScore > data.item.blueScore}">
                    <b-img
                      v-if="data.item.redStriker.pictureUrl"
                      class="mr-2"
                      :src="data.item.redStriker.pictureUrl"
                      rounded="circle"
                      width="20"
                      height="20" />
                    <div>
                      <span>{{ parseFullName(data.item.redStriker) }}</span>
                    </div>
                  </div>
                </template>
                <template slot="blueDefender" slot-scope="data">
                  <div class="d-flex align-items-center"
                       :class="{'team-won' : data.item.redScore < data.item.blueScore}">
                    <b-img
                      v-if="data.item.blueDefender.pictureUrl"
                      class="mr-2"
                      :src="data.item.blueDefender.pictureUrl"
                      rounded="circle"
                      width="20"
                      height="20" />
                    <div>
                      <span>{{ parseFullName(data.item.blueDefender) }}</span>
                    </div>
                  </div>
                </template>
                <template slot="blueStriker" slot-scope="data">
                  <div class="d-flex align-items-center"
                       :class="{'team-won' : data.item.redScore < data.item.blueScore}">
                    <b-img
                      v-if="data.item.blueStriker.pictureUrl"
                      class="mr-2"
                      :src="data.item.blueStriker.pictureUrl"
                      rounded="circle"
                      width="20"
                      height="20" />
                    <div>
                      <span>{{ parseFullName(data.item.blueStriker) }}</span>
                    </div>
                  </div>
                </template>
                <template slot="parsedDate" slot-scope="data">
                  {{ data.item.parsedDate.substr(0, 10) }}
                </template>
                <template slot="actions" slot-scope="data">
                  <div class="text-center cursor-pointer">
                <span @click="handleRemoveGame(data.item)"
                      v-if="canRemoveGame(data.item)">🙅🏿‍♂️</span>
                  </div>
                </template>
              </b-table>
              <b-pagination
                align="center"
                v-model="currentPage"
                :total-rows="$store.getters.parsedGames.length"
                :per-page="perPage"
                aria-controls="games-table"
              ></b-pagination>
            </div>
            <h4 v-else class="text-center">
              <b-spinner></b-spinner>
            </h4>
          </b-col>
        </b-row>
      </b-tab>
      <b-tab title="Upcoming games">
        Ciao
      </b-tab>
    </b-tabs>

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
              :options="['Catania','Milan', 'Ragusa']"
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
import { firestore } from '../firebase';
import { parseFullName } from '../utils/parse';

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
  data() {
    return {
      pending: false,
      gameIdToRemove: null,
      perPage: 10,
      currentPage: 1,
      tableFields: [
        'redDefender',
        'redStriker',
        'blueDefender',
        'blueStriker',
        'redScore',
        'blueScore',
        'location',
        { key: 'parsedDate', label: 'Date', sortable: true },
        'actions',
      ],
      gamesSortBy: 'parsedDate',
      gamesSortDesc: true,
      newGame: { ...gameModel() },
    };
  },
  components: {
    'v-select': vSelect,
  },
  computed: {
    players() {
      return this.$store.state.playersRef
        .filter((playersRef) => {
          const { id } = playersRef;

          if (
            (this.newGame.redTeam.defender && this.newGame.redTeam.defender.value === id)
              || (this.newGame.redTeam.striker && this.newGame.redTeam.striker.value === id)
              || (this.newGame.blueTeam.defender && this.newGame.blueTeam.defender.value === id)
              || (this.newGame.blueTeam.striker && this.newGame.blueTeam.striker.value === id)
          ) {
            return false;
          }

          return true;
        })
        .map(playerRef => ({
          value: playerRef.id,
          label: playerRef.data().fullName,
        }));
    },
  },
  async mounted() {
    this.$store.dispatch('getGames');
  },
  methods: {
    parseFullName(item) {
      return parseFullName(item.fullName);
    },
    canRemoveGame(game) {
      const { timestamp } = game;
      const today = new Date();
      return timestamp.getDate() === today.getDate()
        && timestamp.getMonth() === today.getMonth()
        && timestamp.getFullYear() === today.getFullYear();
    },
    handleRemoveGame(game) {
      const { id } = game;
      this.gameIdToRemove = id;
      this.$refs['remove-game-modal'].show();
    },
    handleRemoveOk() {
      firestore.collection('games').doc(this.gameIdToRemove).delete().then(() => {
        console.debug('Document successfully deleted!');
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
        .then((docRef) => {
          console.debug('Document written with ID: ', docRef.id);

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
