<template>
  <div>
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
        <div v-if="games.length">
          <b-table
            id="games-table"
            responsive
            striped
            hover
            :items="games"
            :fields="tableFields"
            :per-page="perPage"
            :current-page="currentPage">
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
            :total-rows="games.length"
            :per-page="perPage"
            aria-controls="games-table"
          ></b-pagination>
        </div>
        <h4 v-else class="text-center">
          <b-spinner></b-spinner>
        </h4>
      </b-col>
    </b-row>

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
import parseFullName from '../utils/parseFullName';

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
      playersRef: [],
      games: [],
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
        { key: 'date', sortable: true },
        'actions',
      ],
      newGame: { ...gameModel() },
    };
  },
  components: {
    'v-select': vSelect,
  },
  computed: {
    players() {
      return this.playersRef
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
  async firebaseReady() {
    await this.$firestore
      .collection('players')
      .orderBy('fullName', 'asc')
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach(doc => this.playersRef.push(doc));
      });

    this.$firestore
      .collection('games')
      .orderBy('timestamp', 'desc')
      .onSnapshot((querySnapshot) => {
        this.games = [];

        querySnapshot.forEach((doc) => {
          this.games.push(this.parseGame(doc));
        });
      });
  },
  methods: {
    parseGame(gameRef) {
      const game = gameRef.data();
      const redDefender = this.playersRef
        .find(player => player.id === game.redTeam.defender.id).data();
      const redStriker = this.playersRef
        .find(player => player.id === game.redTeam.striker.id).data();
      const blueDefender = this.playersRef
        .find(player => player.id === game.blueTeam.defender.id).data();
      const blueStriker = this.playersRef
        .find(player => player.id === game.blueTeam.striker.id).data();
      const date = this.formatDate(game.timestamp.toDate());

      return {
        id: gameRef.id,
        redDefender: parseFullName(redDefender.fullName),
        redStriker: parseFullName(redStriker.fullName),
        blueDefender: parseFullName(blueDefender.fullName),
        blueStriker: parseFullName(blueStriker.fullName),
        redScore: game.redTeam.score,
        blueScore: game.blueTeam.score,
        location: `🌇 ${game.site}`,
        date,
      };
    },
    formatDate(date) {
      return `${date.getDate()}\\${date.getMonth()}\\${date.getFullYear()}`;
    },
    canRemoveGame(game) {
      const { date } = game;
      return date === this.formatDate(new Date());
    },
    handleRemoveGame(game) {
      const { id } = game;
      this.gameIdToRemove = id;
      this.$refs['remove-game-modal'].show();
    },
    handleRemoveOk() {
      this.$firestore.collection('games').doc(this.gameIdToRemove).delete().then(() => {
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
          defender: this.$firestore.doc(`players/${this.newGame.redTeam.defender.value}`),
          striker: this.$firestore.doc(`players/${this.newGame.redTeam.striker.value}`),
          score: parseInt(this.newGame.redTeam.score, 10),
        },
        blueTeam: {
          defender: this.$firestore.doc(`players/${this.newGame.blueTeam.defender.value}`),
          striker: this.$firestore.doc(`players/${this.newGame.blueTeam.striker.value}`),
          score: parseInt(this.newGame.blueTeam.score, 10),
        },
        timestamp: new Date(),
        // Hardcoded site location
        site: this.newGame.site,
      };

      this.$firestore
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

  .is-danger {
    border-color: #ff6262;

    > .dropdown-toggle {
      border-color: #ff6262;
    }
  }
</style>
