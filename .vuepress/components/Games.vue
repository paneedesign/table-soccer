<template>
  <div>
    <ClientOnly>
      <b-row>
        <b-col xs="12" class="mb-3">
          <b-button v-b-modal.add-game>Add new game</b-button>
        </b-col>
      </b-row>

      <b-row>
        <b-col lg="12">
          <b-table v-if="games.length" responsive striped hover :items="games" :fields="tableFields">
            <template slot="actions" slot-scope="data">
              <div class="text-center cursor-pointer">
                <span @click="handleRemoveGame(data.item)" v-if="canRemoveGame(data.item)">🙅🏿‍♂️</span>
              </div>
            </template>
          </b-table>
          <h4 v-else class="text-center">
            <b-spinner></b-spinner>
          </h4>
        </b-col>
      </b-row>

      <!-- Modals -->
      <b-modal id="add-game" title="Add new game" @ok="handleAddOk" size="lg">
        <b-row>
          <b-col lg="6" xs="12">
            <h3>Red Team</h3>
            <label for="red-team-defender">Defender</label>
            <b-form-select id="red-team-defender" v-validate="'required'" name="red-team-defender" v-model="newGame.redTeam.defender" :options="players" class="mb-3">
              <option :value="null">Select a defender</option>
            </b-form-select>

            <label for="red-team-striker">Striker</label>
            <b-form-select id="red-team-striker" v-validate="'required'" name="red-team-striker" v-model="newGame.redTeam.striker" :options="players" class="mb-3">
              <option :value="null">Select a striker</option>
            </b-form-select>

            <label for="red-team-score">Score</label>
            <b-form-input id="red-team-score" v-validate="'required'" name="red-team-score" v-model="newGame.redTeam.score" placeholder="Enter score" type="number" class="mb-3"></b-form-input>
          </b-col>
          <b-col lg="6" xs="12">
            <h3>Blue Team</h3>
            <label for="red-team-defender">Defender</label>
            <b-form-select id="blue-team-defender" v-validate="'required'" name="blue-team-defender" v-model="newGame.blueTeam.defender" :options="players" class="mb-3">
              <option :value="null">Select a defender</option>
            </b-form-select>

            <label for="red-team-striker">Striker</label>
            <b-form-select id="blue-team-striker" v-validate="'required'" name="blue-team-striker" v-model="newGame.blueTeam.striker" :options="players" class="mb-3">
              <option :value="null">Select a striker</option>
            </b-form-select>

            <label for="blue-team-score">Score</label>
            <b-form-input id="blue-team-score" v-validate="'required'" name="blue-team-score" v-model="newGame.blueTeam.score" placeholder="Enter score" type="number" class="mb-3"></b-form-input>
          </b-col>
          <b-col lg="12">
            <label for="site">Site</label>
            <b-form-input id="site"  name="site" v-model="newGame.site" type="text" class="mb-3" readonly></b-form-input>
          </b-col>
        </b-row>
      </b-modal>

      <b-modal id="remove-game" title="Are you sure to remove this game?" @ok="handleRemoveOk" ref="remove-game-modal">
        😱 This action is irreversible. Watch out! 😱
      </b-modal>
    </ClientOnly>
  </div>
</template>

<script>

  const gameModel = () => {
    return {
      redTeam: {
        defender: null,
        striker: null,
        score: 0,
      },
      blueTeam: {
        defender: null,
        striker: null,
        score: 0,
      },
      site: 'Catania',
    };
  };

  export default {
    name: 'Games',
    data() {
      return {
        playersRef: [],
        games: [],
        gameIdToRemove: null,
        tableFields: [
          'redDefender',
          'redStriker',
          'blueDefender',
          'blueStriker',
          'redScore',
          'blueScore',
          'location',
          'date',
          'actions'
        ],
        newGame: { ...gameModel() },
      };
    },
    computed: {
      players() {
        return this.playersRef
          .map(playerRef => ({
            value: playerRef.id,
            text: `${playerRef.data().name} ${playerRef.data().surname}`
          }));
      }
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
        .limit(25)
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
        const redDefender = this.playersRef.find((player) => player.id === game.redTeam.defender.id).data();
        const redStriker = this.playersRef.find((player) => player.id === game.redTeam.striker.id).data();
        const blueDefender = this.playersRef.find((player) => player.id === game.blueTeam.defender.id).data();
        const blueStriker = this.playersRef.find((player) => player.id === game.blueTeam.striker.id).data();
        const date = this.formatDate(game.timestamp.toDate());

        return {
          id: gameRef.id,
          redDefender: `${redDefender.name} ${redDefender.surname.charAt(0).toUpperCase()}.`,
          redStriker: `${redStriker.name} ${redStriker.surname.charAt(0).toUpperCase()}.`,
          blueDefender: `${blueDefender.name} ${blueDefender.surname.charAt(0).toUpperCase()}.`,
          blueStriker: `${blueStriker.name} ${blueStriker.surname.charAt(0).toUpperCase()}.`,
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
          console.log('Document successfully deleted!');
          this.$vueOnToast.pop('success', 'Success', 'Game Removed');
          this.gameIdToRemove = null;
        }).catch((error) => {
          console.error('Error removing document: ', error);
          this.$vueOnToast.pop('error', 'Error', error.message);
          this.gameIdToRemove = null;
        });
      },
      async handleAddOk() {
        const valid = await this.$validator.validateAll();

        if (!valid) {
          this.$vueOnToast.pop('error', 'Error', 'Check your data and retry');
          return;
        }

        const data = {
          redTeam: {
            defender: this.$firestore.doc(`players/${this.newGame.redTeam.defender}`),
            striker: this.$firestore.doc(`players/${this.newGame.redTeam.striker}`),
            score: parseInt(this.newGame.redTeam.score, 10),
          },
          blueTeam: {
            defender: this.$firestore.doc(`players/${this.newGame.blueTeam.defender}`),
            striker: this.$firestore.doc(`players/${this.newGame.blueTeam.striker}`),
            score: parseInt(this.newGame.blueTeam.score, 10),
          },
          timestamp: new Date(),
          // Hardcoded site location
          site: 'Catania',
        };

        this.$firestore
          .collection('games')
          .add(data)
          .then((docRef) => {
            console.debug('Document written with ID: ', docRef.id);

            this.$vueOnToast.pop('success', 'Success', 'Game inserted');
            this.newGame = { ...gameModel() };
          })
          .catch((error) => {
            console.error('Error adding document: ', error);
            this.$vueOnToast.pop('error', 'Error', error.message);
          });
      },
    }
  };
</script>

<style scoped>
  .cursor-pointer {
    cursor: pointer;
  }
</style>
